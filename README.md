# @chargealong/client

**EV chargers, road trips and charging speeds, as an API.** Find the public
charging sites nearest a point, plan a trip through charging stops, and look up
how fast an electric car charges.

- Free and keyless. No account, nothing to configure
- Australia, New Zealand, the United States, the United Kingdom and Canada
- Runs anywhere there is `fetch`: a browser, a worker, a Node or Bun server, an
  SSR loader
- Typed against the wire, with field names as the API sends them
- No dependencies

```sh
npm install @chargealong/client
```

## Quick start

```ts
import { ChargeAlong, metres, pageUrl } from "@chargealong/client";

const ca = new ChargeAlong();

const { near, sites } = await ca.nearby({
  lat: -37.8136,
  lng: 144.9631,
  minKw: 50,
  connector: "ccs2",
  limit: 5,
});

console.log(`Near ${near?.name}`);
for (const site of sites) {
  console.log(site.name, site.network_name, `${site.max_kw} kW`, `${metres(site.distance_km!)} m`, pageUrl(site));
}
```

Nearest first, within 50 km unless you say otherwise. Only `active` sites are
worth sending a driver to; `status` also says `unavailable`, `planned` or
`removed`.

## Plan a road trip

```ts
const plan = await ca.planTrip({
  from: { lat: -37.8136, lng: 144.9631 },   // Melbourne
  to: { lat: -33.8688, lng: 151.2093 },     // Sydney
  rangeKm: 400,                             // the real range, not the rated one
  connectors: ["ccs2"],
});

if (plan.feasible) {
  for (const stop of plan.stops) {
    console.log(stop.site.name, `${stop.arrive_pct}% to ${stop.depart_pct}%`, `${stop.charge_min} min`);
  }
  console.log(`${plan.total_min} min in all, arriving with ${plan.arrival_pct}%`);
} else {
  console.log(`No charger between km ${plan.gap?.from_km} and ${plan.gap?.to_km}`);
}
```

`route.line` is the road as `[lng, lat]` pairs, ready for a map. Reserve, start
charge, charge limit, battery size and the car's AC and DC limits are all
options, with the service's defaults when left out.

Two different failures: no road at all between the points rejects with a
`BadRequest` of status 422; a road without enough chargers for this car
resolves with `feasible: false` and the `gap` it cannot cross.

## Electric cars

```ts
const { vehicles, source } = await ca.vehicles({ q: "ioniq 5" });
const { vehicle } = await ca.vehicle(vehicles[0]!.slug);

const fast = vehicle.charging.find((c) => c.charger_kw === 150);
console.log(`${vehicle.brand} ${vehicle.model}: 10 to 80% in ${fast?.minutes_10_80} min on a 150 kW charger`);
console.log(`Figures from ${source.name} (${source.licence})`);
```

## One site, and stored ids

```ts
const detail = await ca.site("hwqb4abf");
detail.connectors;    // standard, power, AC or DC, how many
detail.sources;       // where the record came from, and when it was last seen
detail.alternatives;  // other sites close by
```

A site's `public_id` is permanent: minted once, never derived from a source
record. Store it. `site` rejects with `NotFound` for an id that never existed.
A site that was removed still answers, with `site.status` of `removed`, so code
walking stored ids can drop the retired ones and flag the wrong ones.

## The rest of the directory

| Call | Answers |
|---|---|
| `search(q, { prefer: "AU" })` | places, postcodes and sites matching a name, for a search box |
| `countries()`, `overview()` | what the directory holds |
| `country`, `region`, `locality` | a place and its charging sites |
| `networks(country)`, `network(country, slug)` | charging networks and where they reach |
| `redirect(path)` | where a page on chargealong.io went, or null |

`search` answers empty without a request below three letters or digits.
Debounce typing and pass a `signal`, so a superseded keystroke is cancelled
rather than raced:

```ts
const controller = new AbortController();
const found = await ca.search("coburg", { signal: controller.signal });
```

## Links to the site

Rows carry their page's `path`; `pageUrl(row)` makes it absolute. For rows that
only carry slugs, `countryPath`, `regionPath`, `localityPath`, `networkPath` and
`vehiclePath` build the same paths the site serves.

## Errors

Every error is a `ChargeAlongError` with the service's own `title` and `detail`,
which name the problem: `lat: must be between -90 and 90`. The others are
`NotFound`, `BadRequest` and `RateLimited` (with `retryAfter` in
seconds). Options outside the service's bounds throw before a request goes out.

## Other languages

| | |
|---|---|
| Python | [`chargealong`](https://pypi.org/project/chargealong/), source at [chargealong/chargealong-python](https://github.com/chargealong/chargealong-python) |

API reference: [api.chargealong.io/v1/openapi.json](https://api.chargealong.io/v1/openapi.json).

Every charger the API returns also has a page of its own on the website,
[chargealong.io](https://chargealong.io/). Building something that needs more
than the free API gives? Say what at
[chargealong.io/en/contact/](https://chargealong.io/en/contact/).

## Attribution

Charging site data from Open Charge Map contributors, Transport for NSW and the
Queensland Government, and places from GeoNames, all under CC BY 4.0. Vehicle
figures from Open EV Data, MIT. Publishing what you get back means carrying
those credits; [where the data comes from](https://chargealong.io/en/guides/where-the-data-comes-from/)
lists them in full, and the [terms](https://chargealong.io/en/terms/) cover use
of the API.

## Licence

MIT.
