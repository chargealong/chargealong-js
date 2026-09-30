/**
 * The API's responses, field for field as they arrive: snake case, as the
 * service writes them, so the reference and your editor agree.
 */

/** The connector standards the service knows, by slug. */
export const CONNECTORS = ["ccs2", "chademo", "type-2", "nacs", "ccs1", "type-1", "gbt"] as const;
export type Connector = (typeof CONNECTORS)[number];

/** ac up to 22 kW, fast up to 99, ultra-fast from 100. */
export type Speed = "ac" | "fast" | "ultra-fast";
/** Only active sites are worth sending a driver to. */
export type SiteStatus = "active" | "unavailable" | "planned" | "removed";
export type CostKind = "free" | "paid" | "unknown";

/** Every answer arrives in one envelope. */
export interface Envelope<T> {
  data: T;
  /** When the service built this answer. */
  generated_at?: string;
}

export interface CountrySummary {
  iso2: string;
  slug: string;
  name: string;
  site_count: number;
}

/** A busy suburb or town, by how many sites it has. */
export interface PlaceCount {
  slug: string;
  name: string;
  postcode?: string;
  site_count: number;
  /** The region's slug. */
  region: string;
}

export interface Overview {
  sites: number;
  ultra_fast: number;
  countries: (CountrySummary & { busiest: PlaceCount[] })[];
}

export interface RegionSummary {
  slug: string;
  code: string;
  name: string;
  site_count: number;
}

export interface CountryDetail {
  country: CountrySummary;
  regions: RegionSummary[];
  busiest: PlaceCount[];
}

export interface LocalitySummary {
  slug: string;
  name: string;
  postcode?: string;
  site_count: number;
}

export interface RegionDetail {
  country: CountrySummary;
  region: RegionSummary;
  localities: LocalitySummary[];
}

export interface NetworkSummary {
  /** The network's slug. */
  key: string;
  /** Empty for unbranded sites. */
  name: string;
  site_count: number;
  region_count: number;
}

export interface NetworksDetail {
  country: CountrySummary;
  networks: NetworkSummary[];
}

/** One charging site, as every list carries it. */
export interface Site {
  /** Permanent: minted once, never derived from a source record. Store this. */
  public_id: string;
  name: string;
  network: string;
  network_name: string;
  address: string;
  status: SiteStatus;
  speed: Speed;
  /** The fastest connector, in kW. */
  max_kw: number;
  plugs: number;
  standards: Connector[];
  cost_kind: CostKind;
  lat: number;
  lng: number;
  /** The site's page on chargealong.io. */
  path: string;
  /** Present where the answer is about a point. */
  distance_km?: number;
}

export interface NetworkDetail {
  country: CountrySummary;
  network: NetworkSummary;
  regions: RegionSummary[];
  busiest: PlaceCount[];
  /** A sample of the network's sites, not every one. */
  sites: Site[];
}

export interface LocalityInfo extends LocalitySummary {
  time_zone: string;
}

export interface Facet {
  /** What the count is of: a speed, a connector, a network. */
  kind: string;
  key: string;
  count: number;
}

export interface Neighbour {
  region: string;
  slug: string;
  name: string;
  site_count: number;
  distance_km: number;
}

export interface LocalityDetail {
  country: CountrySummary;
  region: RegionSummary;
  locality: LocalityInfo;
  sites: Site[];
  facets: Facet[];
  neighbours: Neighbour[];
}

export interface Connection {
  standard: Connector;
  label: string;
  current: "ac" | "dc";
  power_kw: number;
  quantity: number;
}

export interface Source {
  /** ocm for Open Charge Map, and one key per government register. */
  key: string;
  external_id: string;
  provider: string;
  licence: string;
  last_seen_at: string;
}

export interface SiteInfo extends Site {
  operator?: string;
  usage?: string;
  cost?: { kind: CostKind; has_conditions: boolean; text: string };
  /** When a person last confirmed the site worked, per its source. */
  last_verified_at?: string;
  updated_at?: string;
}

export interface Review {
  [field: string]: unknown;
}

export interface SiteDetail {
  country: CountrySummary;
  region: RegionSummary;
  locality: LocalityInfo;
  site: SiteInfo;
  connectors: Connection[];
  sources: Source[];
  /** Other sites close by. */
  alternatives: Site[];
  /** The nearest faster site, when there is one. */
  faster?: Site | null;
  reviews: {
    summary: {
      count: number;
      average: number | null;
      last_worked_at: string | null;
      last_checked_at: string | null;
    };
    recent: Review[];
  };
  photos: unknown[];
}

export interface PlaceMatch {
  country_iso2: string;
  country_name: string;
  region_code?: string;
  region_name: string;
  slug: string;
  name: string;
  postcode?: string;
  site_count: number;
  path: string;
  /** A name that matches in full: a search box can go straight to it. */
  exact: boolean;
  lat: number;
  lng: number;
}

/** A postcode's centre, for chargers near it. */
export interface PostcodeMatch {
  country_iso2: string;
  country_name: string;
  code: string;
  lat: number;
  lng: number;
}

export interface SearchResult {
  localities: PlaceMatch[];
  postcodes: PostcodeMatch[];
  sites: Site[];
}

/** The closest named place to a point, for a heading. */
export interface NearPlace {
  country_iso2: string;
  name: string;
  region_code: string;
  region_name: string;
  path: string;
  distance_km: number;
}

export interface NearbyResult {
  /** Null in the middle of nowhere. */
  near: NearPlace | null;
  /** Nearest first. */
  sites: Site[];
}

export interface TripStop {
  site: Pick<Site, "public_id" | "name" | "network" | "network_name" | "address" | "status" | "lat" | "lng" | "path"> & {
    operator?: string;
  };
  along_km: number;
  detour_km: number;
  power_kw: number;
  dc: boolean;
  arrive_pct: number;
  depart_pct: number;
  energy_kwh: number;
  charge_min: number;
}

export interface TripPlan {
  route: {
    distance_km: number;
    duration_min: number;
    /** The road, as [lng, lat] pairs: GeoJSON order, ready for a map. */
    line: [number, number][];
  };
  /** Whether the car makes it with the chargers there are. */
  feasible: boolean;
  /** Battery on arrival, in percent. Absent when the trip is not feasible. */
  arrival_pct?: number;
  /**
   * The stretch of the route no charger lets the car cross, in km from the
   * start, when the trip is not feasible. A longer range, a lower minKw or
   * more connector types may close it.
   */
  gap?: { from_km: number; to_km: number };
  drive_min: number;
  charge_min: number;
  total_min: number;
  stops: TripStop[];
}

export interface Vehicle {
  slug: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  source_id: string;
  battery_kwh: number;
  consumption_kwh_100km: number;
  range_km: number;
  ac_kw: number;
  ac_ports: Connector[];
  dc_kw: number;
  dc_ports: Connector[];
  /** DC charging power by state of charge. */
  curve: { pct: number; power_kw: number }[];
  voltage_v: number;
}

export interface VehicleDetail extends Vehicle {
  /** Minutes from 10 to 80 percent on chargers of each size. */
  charging: { charger_kw: number; minutes_10_80: number }[];
}

/** Where vehicle figures come from, and their licence: credit it when you show them. */
export interface DataSource {
  name: string;
  url: string;
  licence: string;
}

export interface Redirect {
  from: string;
  to: string;
  status: 301 | 302 | 308;
}
