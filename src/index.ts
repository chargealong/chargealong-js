/**
 * ChargeAlong: public EV charging sites, road trips through charging stops,
 * and how fast electric cars charge, as an API.
 *
 * Free, keyless and cached at the edge. The directory behind chargealong.io.
 *
 * ```ts
 * import { ChargeAlong } from "@chargealong/client";
 *
 * const ca = new ChargeAlong();
 * const { sites } = await ca.nearby({ lat: -37.8136, lng: 144.9631, minKw: 50 });
 * ```
 *
 * Charging site data from Open Charge Map contributors, Transport for NSW and
 * the Queensland Government, places from GeoNames, all CC BY 4.0; vehicle
 * figures from Open EV Data (MIT). Publishing what you get back means carrying
 * those credits: chargealong.io/en/guides/where-the-data-comes-from/.
 */

export {
  ChargeAlong,
  DEFAULT_BASE_URL,
  MIN_QUERY,
  VERSION,
  createClient,
  type ClientOptions,
  type NearbyOptions,
  type Point,
  type RequestOptions,
  type SearchOptions,
  type TripOptions,
  type VehiclesOptions,
} from "./client";

export { BadRequest, ChargeAlongError, NotFound, RateLimited } from "./errors";

export {
  SITE_URL,
  countryPath,
  localityPath,
  metres,
  networkPath,
  networksPath,
  pageUrl,
  regionPath,
  vehiclePath,
} from "./paths";

export {
  CONNECTORS,
  type Connection,
  type Connector,
  type CostKind,
  type CountryDetail,
  type CountrySummary,
  type DataSource,
  type Envelope,
  type Facet,
  type LocalityDetail,
  type LocalityInfo,
  type LocalitySummary,
  type NearPlace,
  type NearbyResult,
  type Neighbour,
  type NetworkDetail,
  type NetworkSummary,
  type NetworksDetail,
  type Overview,
  type PlaceCount,
  type PlaceMatch,
  type PostcodeMatch,
  type Redirect,
  type RegionDetail,
  type RegionSummary,
  type SearchResult,
  type Site,
  type SiteDetail,
  type SiteInfo,
  type SiteStatus,
  type Source,
  type Speed,
  type TripPlan,
  type TripStop,
  type Vehicle,
  type VehicleDetail,
} from "./types";
