import { errorFor, NotFound } from "./errors";
import {
  CONNECTORS,
  type Connector,
  type CountryDetail,
  type CountrySummary,
  type DataSource,
  type Envelope,
  type LocalityDetail,
  type NearbyResult,
  type NetworkDetail,
  type NetworksDetail,
  type Overview,
  type Redirect,
  type RegionDetail,
  type SearchResult,
  type SiteDetail,
  type TripPlan,
  type Vehicle,
  type VehicleDetail,
} from "./types";

export const VERSION = "0.1.1";
export const DEFAULT_BASE_URL = "https://api.chargealong.io";

/** The service reads a search once it holds this many letters or digits. */
export const MIN_QUERY = 3;
const MAX_QUERY = 100;

export interface ClientOptions {
  /** Point somewhere else: a proxy of your own, or a test server. */
  baseUrl?: string;
  /** Your own fetch, for a custom transport or for testing. */
  fetch?: typeof globalThis.fetch;
}

export interface RequestOptions {
  /** Cancel a request whose answer is no longer wanted. */
  signal?: AbortSignal;
}

export interface Point {
  lat: number;
  lng: number;
}

export interface SearchOptions extends RequestOptions {
  /** A two letter country code whose places rank first. */
  prefer?: string;
}

export interface NearbyOptions extends RequestOptions, Point {
  /** Only sites with a connector of at least this many kW, 0 to 400. */
  minKw?: number;
  /** How far to look, 1 to 150 km. The service's default is 50. */
  radiusKm?: number;
  /** How many sites, 1 to 50. The service's default is 30. */
  limit?: number;
  /** Only sites with one of these connectors. */
  connector?: Connector | Connector[];
  /** Only sites on this network, by slug: evie-networks. */
  network?: string;
}

export interface TripOptions extends RequestOptions {
  from: Point;
  /** Somewhere other than from. */
  to: Point;
  /** How far the car goes on a full battery, 50 to 1500 km: the real figure, not the rated one. */
  rangeKm: number;
  /** Never arrive anywhere below this percentage, 5 to 50. Default 20. */
  reserve?: number;
  /** Battery percentage at the start, above the reserve. Default 100. */
  start?: number;
  /** Never charge above this percentage, 50 to 100 and at least reserve + 10. Default 80. */
  chargeTo?: number;
  /** Usable battery, 10 to 250 kWh. Only charging times need it. */
  batteryKwh?: number;
  /** The most DC power the car accepts, 20 to 400 kW. Default 150. */
  maxDcKw?: number;
  /** The most AC power the car accepts, 3 to 22 kW. Default 11. */
  maxAcKw?: number;
  /** Ignore chargers slower than this, 0 to 350 kW. Default 50. */
  minKw?: number;
  /** The connectors the car takes. Default CCS2 and Type 2. */
  connectors?: Connector[];
}

export interface VehiclesOptions extends RequestOptions {
  /** Any part of the brand, model or variant. */
  q?: string;
  /** 1 to 100. The service's default is 20. */
  limit?: number;
  /** Every car rather than the first page. Ignored when q is given. */
  all?: boolean;
}

type Param = string | number | boolean | undefined | string[];

/**
 * A client for the ChargeAlong API: public EV charging sites, trip planning
 * through charging stops, and how fast electric cars charge.
 *
 * ```ts
 * const ca = new ChargeAlong();
 * const { sites } = await ca.nearby({ lat: -37.8136, lng: 144.9631, minKw: 50 });
 * ```
 *
 * Free, keyless and cached at the edge. Runs anywhere there is `fetch`: a
 * browser, a worker, a server. Nothing is kept on the instance between calls,
 * so one can be shared.
 *
 * Attribution travels with the data: see chargealong.io/en/guides/where-the-data-comes-from/.
 */
export class ChargeAlong {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = checkBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    const impl = options.fetch ?? globalThis.fetch;
    if (typeof impl !== "function") {
      throw new Error("chargealong: no fetch in this runtime. Pass one: new ChargeAlong({ fetch })");
    }
    // Bound, so a fetch read off globalThis is not called with the wrong this.
    this.fetchImpl = options.fetch ? impl : impl.bind(globalThis);
  }

  /** Every country with charging sites, and how many each has. */
  async countries(options: RequestOptions = {}): Promise<CountrySummary[]> {
    const body = await this.get<CountrySummary[]>("/v1/countries", {}, options);
    return Array.isArray(body.data) ? body.data : [];
  }

  /** What the whole directory holds: countries with their busiest places. */
  async overview(options: RequestOptions = {}): Promise<Overview> {
    return (await this.get<Overview>("/v1/overview", {}, options)).data;
  }

  /** One country: its regions and their counts. */
  async country(country: string, options: RequestOptions = {}): Promise<CountryDetail> {
    return (await this.get<CountryDetail>(`/v1/countries/${slug(country, "country")}`, {}, options)).data;
  }

  /** One region: the places in it that have charging sites. */
  async region(country: string, region: string, options: RequestOptions = {}): Promise<RegionDetail> {
    const path = `/v1/countries/${slug(country, "country")}/regions/${slug(region, "region")}`;
    return (await this.get<RegionDetail>(path, {}, options)).data;
  }

  /** Every charging network in a country, with its site and region counts. */
  async networks(country: string, options: RequestOptions = {}): Promise<NetworksDetail> {
    return (await this.get<NetworksDetail>(`/v1/countries/${slug(country, "country")}/networks`, {}, options)).data;
  }

  /** One network in a country: where it reaches, and a sample of its sites. */
  async network(country: string, network: string, options: RequestOptions = {}): Promise<NetworkDetail> {
    const path = `/v1/countries/${slug(country, "country")}/networks/${slug(network, "network")}`;
    return (await this.get<NetworkDetail>(path, {}, options)).data;
  }

  /** One suburb or town: every charging site in it, with facet counts. */
  async locality(country: string, region: string, locality: string, options: RequestOptions = {}): Promise<LocalityDetail> {
    const path = `/v1/localities/${slug(country, "country")}/${slug(region, "region")}/${slug(locality, "locality")}`;
    return (await this.get<LocalityDetail>(path, {}, options)).data;
  }

  /**
   * One charging site: connectors, power, price, access, network, sources,
   * and what is close by.
   *
   * The id is permanent. Rejects with {@link NotFound} for an id that never
   * existed. A site that was removed still answers, with `site.status` set to
   * `removed`, so code holding stored ids can drop the retired ones.
   */
  async site(publicId: string, options: RequestOptions = {}): Promise<SiteDetail> {
    return (await this.get<SiteDetail>(`/v1/sites/${slug(publicId, "site id")}`, {}, options)).data;
  }

  /**
   * Places, postcodes and sites matching a name, for a search box.
   *
   * Fewer than three letters or digits answers empty without a request, which
   * is what the service would answer anyway. Debounce and pass a `signal`.
   */
  async search(term: string, options: SearchOptions = {}): Promise<SearchResult> {
    const q = String(term ?? "").trim();
    if (q.length > MAX_QUERY) {
      throw new Error(`chargealong: a search is at most ${MAX_QUERY} characters`);
    }
    const significant = q.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
    if (significant < MIN_QUERY) return { localities: [], postcodes: [], sites: [] };

    let prefer: string | undefined;
    if (options.prefer !== undefined) {
      prefer = options.prefer.trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(prefer)) {
        throw new Error(`chargealong: prefer ${options.prefer} is not a two letter country code`);
      }
    }
    const body = await this.get<SearchResult>("/v1/search", { q, prefer }, options);
    const data = (body.data ?? {}) as Partial<SearchResult>;
    return { localities: data.localities ?? [], postcodes: data.postcodes ?? [], sites: data.sites ?? [] };
  }

  /** The charging sites nearest a coordinate, nearest first. */
  async nearby(options: NearbyOptions): Promise<NearbyResult> {
    const { lat, lng } = point(options);
    const connector =
      options.connector === undefined
        ? undefined
        : connectors(Array.isArray(options.connector) ? options.connector : [options.connector], "connector");
    const body = await this.get<NearbyResult>(
      "/v1/nearby",
      {
        lat,
        lng,
        min_kw: bounded(options.minKw, "minKw", 0, 400),
        radius_km: bounded(options.radiusKm, "radiusKm", 1, 150),
        limit: whole(options.limit, "limit", 1, 50),
        connector,
        network: options.network?.trim() || undefined,
      },
      options,
    );
    const data = (body.data ?? {}) as Partial<NearbyResult>;
    return { near: data.near ?? null, sites: data.sites ?? [] };
  }

  /**
   * A road trip from A to B through charging stops: the route, where to stop,
   * how long to charge at each, and the battery on arrival.
   *
   * Two different ways a trip can fail. When there is no road route at all
   * between the points, it rejects with a {@link BadRequest} of status 422.
   * When there is a road but not enough chargers along it for this car, it
   * resolves with `feasible: false` and a `gap` saying which stretch the car
   * cannot cross. A 503 means trip planning is briefly unavailable.
   */
  async planTrip(options: TripOptions): Promise<TripPlan> {
    const from = point(options.from ?? ({} as Point));
    const to = point(options.to ?? ({} as Point));
    if (from.lat === to.lat && from.lng === to.lng) {
      throw new Error("chargealong: a trip must end somewhere other than where it starts");
    }
    const rangeKm = bounded(options.rangeKm, "rangeKm", 50, 1500);
    if (rangeKm === undefined) throw new Error("chargealong: rangeKm is required");

    const body = await this.get<TripPlan>(
      "/v1/trips/plan",
      {
        from: `${from.lat},${from.lng}`,
        to: `${to.lat},${to.lng}`,
        range_km: rangeKm,
        reserve: bounded(options.reserve, "reserve", 5, 50),
        start: bounded(options.start, "start", 5, 100),
        charge_to: bounded(options.chargeTo, "chargeTo", 50, 100),
        battery_kwh: bounded(options.batteryKwh, "batteryKwh", 10, 250),
        max_dc_kw: bounded(options.maxDcKw, "maxDcKw", 20, 400),
        max_ac_kw: bounded(options.maxAcKw, "maxAcKw", 3, 22),
        min_kw: bounded(options.minKw, "minKw", 0, 350),
        // One parameter, comma separated: the planner reads it that way.
        connectors: options.connectors === undefined ? undefined : connectors(options.connectors, "connectors").join(","),
      },
      options,
    );
    return body.data;
  }

  /** Electric cars: battery, range and how they charge. */
  async vehicles(options: VehiclesOptions = {}): Promise<{ vehicles: Vehicle[]; source: DataSource }> {
    const body = await this.get<Vehicle[]>(
      "/v1/vehicles",
      {
        q: options.q?.trim() || undefined,
        limit: whole(options.limit, "limit", 1, 100),
        all: options.all ? "true" : undefined,
      },
      options,
    );
    return { vehicles: Array.isArray(body.data) ? body.data : [], source: sourceOf(body) };
  }

  /** One electric car, with how long it takes to charge on chargers of each size. */
  async vehicle(slugName: string, options: RequestOptions = {}): Promise<{ vehicle: VehicleDetail; source: DataSource }> {
    const body = await this.get<VehicleDetail>(`/v1/vehicles/${slug(slugName, "vehicle")}`, {}, options);
    return { vehicle: body.data, source: sourceOf(body) };
  }

  /**
   * Where a page on chargealong.io went, if it moved. Null for a page that
   * never did, which is most of them.
   */
  async redirect(path: string, options: RequestOptions = {}): Promise<Redirect | null> {
    const p = String(path ?? "").trim();
    if (!p.startsWith("/") || p.startsWith("//") || p.includes("://") || p.includes("\\")) {
      throw new Error(`chargealong: ${JSON.stringify(path)} is not a path on chargealong.io`);
    }
    try {
      return (await this.get<Redirect>("/v1/redirect", { path: p }, options)).data ?? null;
    } catch (err) {
      if (err instanceof NotFound) return null;
      throw err;
    }
  }

  private async get<T>(path: string, params: Record<string, Param>, options: RequestOptions): Promise<Envelope<T> & { source?: DataSource }> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") continue;
      if (Array.isArray(value)) {
        for (const v of value) query.append(key, v);
      } else {
        query.set(key, String(value));
      }
    }
    const url = this.baseUrl + path + (query.size ? `?${query}` : "");

    const response = await this.fetchImpl(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: options.signal,
      // Nothing here is authenticated, and a cookie on a cacheable GET is how a
      // shared cache comes to hold something that belongs to one visitor.
      credentials: "omit",
      // The API does not redirect; one on the way is a proxy, not an answer.
      redirect: "error",
    });

    // A problem document is JSON; a proxy having a bad day is not. Either way
    // the status is the part a caller can act on, so parsing never decides
    // whether an error is raised.
    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch {
      parsed = undefined;
    }
    const body = (parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}) as Envelope<T> &
      Record<string, unknown>;

    if (!response.ok) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      throw errorFor(
        response.status,
        typeof body.title === "string" ? body.title : "",
        typeof body.detail === "string" ? body.detail : "",
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
      );
    }
    return body;
  }
}

/** Shorthand for `new ChargeAlong(options)`, for code that prefers a factory. */
export function createClient(options: ClientOptions = {}): ChargeAlong {
  return new ChargeAlong(options);
}

function sourceOf(body: { source?: unknown }): DataSource {
  const s = (body.source ?? {}) as Partial<DataSource>;
  return { name: s.name ?? "", url: s.url ?? "", licence: s.licence ?? "" };
}

/**
 * A path segment. Encoded, so "/" and "?" cannot leave it, and "." or ".."
 * refused, since encoding leaves dots alone and those name the collection or
 * its parent.
 */
function slug(value: string, what: string): string {
  const text = String(value ?? "").trim();
  if (!text || text === "." || text === "..") throw new Error(`chargealong: no ${what}`);
  return encodeURIComponent(text);
}

function point(p: Partial<Point>): Point {
  const lat = p.lat as number;
  const lng = p.lng as number;
  // Written as a range check NaN cannot pass, rather than as a NaN test.
  if (!(lat >= -90 && lat <= 90) || !(lng >= -180 && lng <= 180)) {
    throw new Error(`chargealong: (${lat}, ${lng}) is not a point on the globe; lat -90..90, lng -180..180`);
  }
  return { lat, lng };
}

function bounded(value: number | undefined, name: string, lo: number, hi: number): number | undefined {
  if (value === undefined) return undefined;
  if (!(typeof value === "number" && value >= lo && value <= hi)) {
    throw new Error(`chargealong: ${name} must be a number from ${lo} to ${hi}, not ${value}`);
  }
  return value;
}

function whole(value: number | undefined, name: string, lo: number, hi: number): number | undefined {
  const v = bounded(value, name, lo, hi);
  if (v !== undefined && !Number.isInteger(v)) {
    throw new Error(`chargealong: ${name} must be a whole number, not ${value}`);
  }
  return v;
}

function connectors(list: readonly string[], name: string): Connector[] {
  if (list.length === 0) throw new Error(`chargealong: ${name} is empty; leave it out for any`);
  for (const c of list) {
    if (!(CONNECTORS as readonly string[]).includes(c)) {
      throw new Error(`chargealong: ${c} is not a connector the service knows: ${CONNECTORS.join(", ")}`);
    }
  }
  return [...list] as Connector[];
}

/**
 * Refuse a base URL that would send what people ask about somewhere else:
 * https always, and plaintext http only to loopback, for a test server.
 */
function checkBaseUrl(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`chargealong: base URL ${raw} is not absolute`);
  }
  if (parsed.username || parsed.password) {
    throw new Error(`chargealong: base URL ${raw} carries credentials, and the host it would reach is not the one it reads as`);
  }
  if (/[?#]/.test(raw)) {
    throw new Error(`chargealong: base URL ${raw} has a query or a fragment, which would swallow the path`);
  }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (parsed.protocol === "https:" || (parsed.protocol === "http:" && loopback)) {
    return raw.replace(/\/+$/, "");
  }
  if (parsed.protocol === "http:") {
    throw new Error(`chargealong: base URL ${raw} is plaintext http to a public host, which would send where people are in the clear`);
  }
  throw new Error(`chargealong: base URL ${raw} has scheme ${parsed.protocol}, want https`);
}
