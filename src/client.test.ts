import { describe, expect, it, vi } from "vitest";

import {
  BadRequest,
  CONNECTORS,
  ChargeAlong,
  ChargeAlongError,
  NotFound,
  RateLimited,
  countryPath,
  createClient,
  localityPath,
  metres,
  networkPath,
  networksPath,
  pageUrl,
  regionPath,
  vehiclePath,
} from "./index";
import {
  BADNEARBY,
  COUNTRIES,
  COUNTRY,
  LOCALITY,
  NEARBY,
  NETWORK,
  NETWORKS,
  NOTFOUND,
  OVERVIEW,
  REGION,
  SEARCH,
  SITE,
  TRIP,
  VEHICLE,
  VEHICLES,
} from "./testdata";

function recorder(body: unknown = { data: [] }, status = 200, headers: Record<string, string> = {}) {
  const calls: { url: URL; init: RequestInit }[] = [];
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: new URL(String(url)), init: init ?? {} });
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers });
  });
  return {
    calls,
    fetchImpl: fetchImpl as unknown as typeof globalThis.fetch,
    get url() {
      return calls[calls.length - 1]!.url;
    },
  };
}

function client(r: ReturnType<typeof recorder>) {
  return new ChargeAlong({ fetch: r.fetchImpl });
}

describe("the directory", () => {
  it("lists every country with charging sites", async () => {
    const r = recorder(COUNTRIES);
    const countries = await client(r).countries();
    expect(r.url.pathname).toBe("/v1/countries");
    expect(countries[0]).toMatchObject({ iso2: "AU", slug: "australia", name: "Australia" });
    expect(typeof countries[0]!.site_count).toBe("number");
  });

  it("reads the overview", async () => {
    const r = recorder(OVERVIEW);
    const overview = await client(r).overview();
    expect(r.url.pathname).toBe("/v1/overview");
    expect(overview.sites).toBeGreaterThan(0);
    expect(overview.countries[0]!.busiest.length).toBeGreaterThan(0);
  });

  it("reads a country, a region and a locality by their slugs", async () => {
    let r = recorder(COUNTRY);
    expect((await client(r).country("australia")).regions.length).toBeGreaterThan(0);
    expect(r.url.pathname).toBe("/v1/countries/australia");

    r = recorder(REGION);
    expect((await client(r).region("australia", "victoria")).region.code).toBe("VIC");
    expect(r.url.pathname).toBe("/v1/countries/australia/regions/victoria");

    r = recorder(LOCALITY);
    const locality = await client(r).locality("australia", "victoria", "coburg");
    expect(r.url.pathname).toBe("/v1/localities/australia/victoria/coburg");
    expect(locality.locality.time_zone).toBe("Australia/Melbourne");
    expect(locality.neighbours[0]!.distance_km).toBeGreaterThan(0);
  });

  it("reads a country's networks and one network", async () => {
    let r = recorder(NETWORKS);
    expect((await client(r).networks("australia")).networks.length).toBeGreaterThan(0);
    expect(r.url.pathname).toBe("/v1/countries/australia/networks");

    r = recorder(NETWORK);
    const network = await client(r).network("australia", "chargefox");
    expect(r.url.pathname).toBe("/v1/countries/australia/networks/chargefox");
    expect(network.network.key).toBe("chargefox");
    expect(network.sites[0]!.public_id).toBeTruthy();
  });
});

describe("site", () => {
  it("reads one site with its connectors and sources", async () => {
    const r = recorder(SITE);
    const detail = await client(r).site("hwqb4abf");
    expect(r.url.pathname).toBe("/v1/sites/hwqb4abf");
    expect(detail.site.public_id).toBe("hwqb4abf");
    expect(detail.connectors[0]!.standard).toBe("type-2");
    expect(detail.sources[0]!.key).toBe("ocm");
    expect(detail.reviews.summary.count).toBe(0);
  });

  it("throws NotFound for an id with nothing filed under it", async () => {
    const err = await client(recorder(NOTFOUND, 404)).site("zzzzzzzz").catch((e) => e);
    expect(err).toBeInstanceOf(NotFound);
    expect(err.title).toBe("not found");
  });

  it("answers a removed site like any other, marked removed, since only its web page says 410", async () => {
    const removed = { ...SITE, data: { ...SITE.data, site: { ...SITE.data.site, status: "removed" } } };
    const detail = await client(recorder(removed)).site("hwqb4abf");
    expect(detail.site.status).toBe("removed");
  });

  it("has no error for a status the API never sends", async () => {
    const index = await import("./index");
    expect("Gone" in index).toBe(false);
  });
});

describe("search", () => {
  it("asks for places, postcodes and sites", async () => {
    const r = recorder(SEARCH);
    const found = await client(r).search("coburg");
    expect(r.url.pathname).toBe("/v1/search");
    expect(r.url.searchParams.get("q")).toBe("coburg");
    expect(found.localities[0]!.path).toMatch(/^\/en\//);
    expect(found.sites.length).toBeGreaterThan(0);
    expect(found.postcodes).toEqual([]);
  });

  it("sends the preferred country upper cased", async () => {
    const r = recorder(SEARCH);
    await client(r).search("coburg", { prefer: "au" });
    expect(r.url.searchParams.get("prefer")).toBe("AU");
  });

  it("refuses a preferred country that is not a two letter code", async () => {
    await expect(client(recorder()).search("coburg", { prefer: "AUS" })).rejects.toThrow(/two letter/);
  });

  it("answers empty without a request below three letters or digits", async () => {
    const r = recorder(SEARCH);
    for (const q of ["", "  ", "ab", "a-b", "'!'"]) {
      expect(await client(r).search(q)).toEqual({ localities: [], postcodes: [], sites: [] });
    }
    expect(r.calls).toHaveLength(0);
  });

  it("refuses a term longer than the service reads", async () => {
    await expect(client(recorder()).search("x".repeat(101))).rejects.toThrow(/100/);
  });
});

describe("nearby", () => {
  it("sends the point and the filters, names as the service reads them", async () => {
    const r = recorder(NEARBY);
    const res = await client(r).nearby({
      lat: -37.7404,
      lng: 144.9633,
      minKw: 50,
      radiusKm: 20,
      limit: 5,
      network: "chargefox",
    });
    const q = r.url.searchParams;
    expect(r.url.pathname).toBe("/v1/nearby");
    expect(q.get("lat")).toBe("-37.7404");
    expect(q.get("lng")).toBe("144.9633");
    expect(q.get("min_kw")).toBe("50");
    expect(q.get("radius_km")).toBe("20");
    expect(q.get("limit")).toBe("5");
    expect(q.get("network")).toBe("chargefox");
    expect(res.near?.name).toBe("Merlynston");
    expect(res.sites[0]!.distance_km).toBeGreaterThan(0);
  });

  it("repeats connector for more than one, which is how the service reads it", async () => {
    const r = recorder(NEARBY);
    await client(r).nearby({ lat: -37.7, lng: 144.9, connector: ["ccs2", "chademo"] });
    expect(r.url.searchParams.getAll("connector")).toEqual(["ccs2", "chademo"]);
    await client(r).nearby({ lat: -37.7, lng: 144.9, connector: "type-2" });
    expect(r.url.searchParams.getAll("connector")).toEqual(["type-2"]);
  });

  it("leaves off every filter not asked for", async () => {
    const r = recorder(NEARBY);
    await client(r).nearby({ lat: -37.7, lng: 144.9 });
    expect([...r.url.searchParams.keys()].sort()).toEqual(["lat", "lng"]);
  });

  it("refuses a connector the service does not know", async () => {
    await expect(
      client(recorder()).nearby({ lat: 0, lng: 0, connector: "tesla" as never }),
    ).rejects.toThrow(/connector/);
  });

  it("refuses filters outside the service's bounds before asking", async () => {
    const c = client(recorder());
    await expect(c.nearby({ lat: 0, lng: 0, radiusKm: 151 })).rejects.toThrow(/radiusKm/);
    await expect(c.nearby({ lat: 0, lng: 0, radiusKm: 0.5 })).rejects.toThrow(/radiusKm/);
    await expect(c.nearby({ lat: 0, lng: 0, limit: 51 })).rejects.toThrow(/limit/);
    await expect(c.nearby({ lat: 0, lng: 0, limit: 2.5 })).rejects.toThrow(/limit/);
    await expect(c.nearby({ lat: 0, lng: 0, minKw: 401 })).rejects.toThrow(/minKw/);
  });
});

describe("planTrip", () => {
  it("sends each end as latitude,longitude and the car's figures by their wire names", async () => {
    const r = recorder(TRIP);
    const plan = await client(r).planTrip({
      from: { lat: -37.8136, lng: 144.9631 },
      to: { lat: -33.8688, lng: 151.2093 },
      rangeKm: 400,
      reserve: 15,
      start: 90,
      chargeTo: 85,
      batteryKwh: 75,
      maxDcKw: 250,
      maxAcKw: 11,
      minKw: 100,
      connectors: ["ccs2", "type-2"],
    });
    const q = r.url.searchParams;
    expect(r.url.pathname).toBe("/v1/trips/plan");
    expect(q.get("from")).toBe("-37.8136,144.9631");
    expect(q.get("to")).toBe("-33.8688,151.2093");
    expect(q.get("range_km")).toBe("400");
    expect(q.get("reserve")).toBe("15");
    expect(q.get("start")).toBe("90");
    expect(q.get("charge_to")).toBe("85");
    expect(q.get("battery_kwh")).toBe("75");
    expect(q.get("max_dc_kw")).toBe("250");
    expect(q.get("max_ac_kw")).toBe("11");
    expect(q.get("min_kw")).toBe("100");
    expect(q.get("connectors")).toBe("ccs2,type-2");
    expect(plan.feasible).toBe(true);
    expect(plan.route.line[0]).toHaveLength(2);
    expect(plan.stops[0]!.site.public_id).toBeTruthy();
  });

  it("says where an infeasible trip runs out, with no arrival figure", async () => {
    const infeasible = {
      data: {
        route: { distance_km: 801.1, duration_min: 770, line: [[144.96, -37.81], [147.33, -42.88]] },
        feasible: false,
        drive_min: 0,
        charge_min: 0,
        total_min: 0,
        gap: { from_km: 171.4, to_km: 512.3 },
        stops: [],
      },
    };
    const plan = await client(recorder(infeasible)).planTrip({
      from: { lat: -37.8136, lng: 144.9631 },
      to: { lat: -42.8821, lng: 147.3272 },
      rangeKm: 400,
    });
    expect(plan.feasible).toBe(false);
    expect(plan.arrival_pct).toBeUndefined();
    expect(plan.gap).toEqual({ from_km: 171.4, to_km: 512.3 });
  });

  it("sends only what was given, so the service's defaults apply", async () => {
    const r = recorder(TRIP);
    await client(r).planTrip({ from: { lat: -37.8, lng: 144.9 }, to: { lat: -33.8, lng: 151.2 }, rangeKm: 400 });
    expect([...r.url.searchParams.keys()].sort()).toEqual(["from", "range_km", "to"]);
  });

  it("refuses a trip that starts where it ends", async () => {
    const here = { lat: -37.8, lng: 144.9 };
    await expect(client(recorder()).planTrip({ from: here, to: here, rangeKm: 400 })).rejects.toThrow(/somewhere other/);
  });

  it("refuses figures outside the service's bounds before asking", async () => {
    const c = client(recorder());
    const base = { from: { lat: -37.8, lng: 144.9 }, to: { lat: -33.8, lng: 151.2 }, rangeKm: 400 };
    await expect(c.planTrip({ ...base, rangeKm: 20 })).rejects.toThrow(/rangeKm/);
    await expect(c.planTrip({ ...base, reserve: 60 })).rejects.toThrow(/reserve/);
    await expect(c.planTrip({ ...base, maxAcKw: 50 })).rejects.toThrow(/maxAcKw/);
    await expect(c.planTrip({ ...base, connectors: [] })).rejects.toThrow(/connectors/);
  });

  it("names a route that does not exist as a bad request with the service's words", async () => {
    const r = recorder({ status: 422, title: "no road route between these points" }, 422);
    const err = await client(r)
      .planTrip({ from: { lat: -37.8, lng: 144.9 }, to: { lat: -42.8, lng: 147.3 }, rangeKm: 400 })
      .catch((e) => e);
    expect(err).toBeInstanceOf(BadRequest);
    expect(err.status).toBe(422);
    expect(err.message).toBe("no road route between these points");
  });
});

describe("vehicles", () => {
  it("finds cars and carries where the figures came from", async () => {
    const r = recorder(VEHICLES);
    const { vehicles, source } = await client(r).vehicles({ q: "model 3", limit: 2 });
    expect(r.url.pathname).toBe("/v1/vehicles");
    expect(r.url.searchParams.get("q")).toBe("model 3");
    expect(r.url.searchParams.get("limit")).toBe("2");
    expect(vehicles[0]!.slug).toBe("tesla-model-3");
    expect(vehicles[0]!.curve.length).toBeGreaterThan(0);
    expect(source.name).toBe("Open EV Data");
  });

  it("asks for every car only when told to", async () => {
    const r = recorder(VEHICLES);
    await client(r).vehicles({ all: true });
    expect(r.url.searchParams.get("all")).toBe("true");
    await client(r).vehicles();
    expect(r.url.searchParams.has("all")).toBe(false);
  });

  it("reads one car with how long it takes to charge", async () => {
    const r = recorder(VEHICLE);
    const { vehicle, source } = await client(r).vehicle("tesla-model-3");
    expect(r.url.pathname).toBe("/v1/vehicles/tesla-model-3");
    expect(vehicle.charging[0]!.minutes_10_80).toBeGreaterThan(0);
    expect(source.licence).toBe("MIT");
  });

  it("refuses a limit outside 1 to 100", async () => {
    await expect(client(recorder()).vehicles({ limit: 101 })).rejects.toThrow(/limit/);
  });
});

describe("redirect", () => {
  it("says where a page went", async () => {
    const r = recorder({ data: { from: "/en/a/", to: "/en/b/", status: 301 } });
    expect(await client(r).redirect("/en/a/")).toEqual({ from: "/en/a/", to: "/en/b/", status: 301 });
    expect(r.url.pathname).toBe("/v1/redirect");
    expect(r.url.searchParams.get("path")).toBe("/en/a/");
  });

  it("answers null for a page that never moved", async () => {
    expect(await client(recorder(NOTFOUND, 404)).redirect("/en/nowhere/")).toBeNull();
  });

  it("refuses anything that is not a path on the site", async () => {
    for (const path of ["en/a/", "//evil.example/", "https://evil.example/", ""]) {
      await expect(client(recorder()).redirect(path)).rejects.toThrow(/path/);
    }
  });
});

describe("errors", () => {
  it("keeps the service's own words", async () => {
    const err = await client(recorder(BADNEARBY, 400)).nearby({ lat: 1, lng: 1 }).catch((e) => e);
    expect(err).toBeInstanceOf(BadRequest);
    expect(err).toBeInstanceOf(ChargeAlongError);
    expect(err.title).toBe("invalid nearby request");
    expect(err.detail).toBe("lat: must be between -90 and 90");
    expect(err.message).toBe("invalid nearby request: lat: must be between -90 and 90");
  });

  it("says how long to wait when rate limited", async () => {
    const err = await client(recorder({ title: "slow down" }, 429, { "Retry-After": "30" })).countries().catch((e) => e);
    expect(err).toBeInstanceOf(RateLimited);
    expect(err.retryAfter).toBe(30);
  });

  it("uses the status when the body is not a problem document", async () => {
    const err = await client(recorder("<html>bad gateway</html>", 502)).countries().catch((e) => e);
    expect(err).toBeInstanceOf(ChargeAlongError);
    expect(err.status).toBe(502);
    expect(err.message).toBe("HTTP 502");
  });
});

describe("paths", () => {
  it("turns a row's path into the page's address", () => {
    expect(pageUrl(NEARBY.data.sites[0]!)).toBe(`https://chargealong.io${NEARBY.data.sites[0]!.path}`);
    expect(pageUrl("/en/australia/")).toBe("https://chargealong.io/en/australia/");
  });

  it("gives nothing for a row without a path, or one that leaves the site", () => {
    expect(pageUrl({})).toBe("");
    expect(pageUrl({ path: "" })).toBe("");
    expect(pageUrl({ path: "//evil.example/x" })).toBe("");
    expect(pageUrl({ path: "https://evil.example/x" })).toBe("");
  });

  it("builds the pages rows without a path of their own link to", () => {
    expect(countryPath("australia")).toBe("/en/australia/");
    expect(regionPath("australia", "victoria")).toBe("/en/australia/victoria/");
    expect(localityPath("australia", "victoria", "coburg")).toBe("/en/australia/victoria/coburg/");
    expect(networksPath("australia")).toBe("/en/australia/networks/");
    expect(networkPath("australia", "chargefox")).toBe("/en/australia/networks/chargefox/");
    expect(vehiclePath("tesla-model-3")).toBe("/en/vehicles/tesla-model-3/");
    expect(localityPath("australia", "", "coburg")).toBe("");
  });

  it("rounds a distance to metres", () => {
    expect(metres(0.56250295)).toBe(563);
  });

  it("lists the connector standards the service knows", () => {
    expect(CONNECTORS).toEqual(["ccs2", "chademo", "type-2", "nacs", "ccs1", "type-1", "gbt"]);
  });

  it("has a factory for code that prefers one", () => {
    expect(createClient()).toBeInstanceOf(ChargeAlong);
  });
});
