/**
 * Where a row lives on chargealong.io.
 *
 * Sites, places and trip stops carry their page's `path`, so linking to the
 * site needs no second request. The builders below cover the rows that carry
 * only slugs, building the path the site itself serves.
 */

export const SITE_URL = "https://chargealong.io";

/** The site serves one language today and its paths carry the prefix. */
const LANG = "en";

/**
 * A row's page as an absolute URL, or "" for a row without one.
 *
 * Only a path on this site becomes a link: a row claiming `//elsewhere` or a
 * scheme gives nothing rather than a link off the site.
 */
export function pageUrl(row: { path?: string | null } | string): string {
  const path = typeof row === "string" ? row : (row.path ?? "");
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.includes("://")) return "";
  return SITE_URL + path;
}

/** `/en/australia/` */
export function countryPath(country: string): string {
  return country ? `/${LANG}/${country}/` : "";
}

/** `/en/australia/victoria/` */
export function regionPath(country: string, region: string): string {
  return country && region ? `/${LANG}/${country}/${region}/` : "";
}

/** `/en/australia/victoria/coburg/` */
export function localityPath(country: string, region: string, locality: string): string {
  return country && region && locality ? `/${LANG}/${country}/${region}/${locality}/` : "";
}

/** `/en/australia/networks/` */
export function networksPath(country: string): string {
  return country ? `/${LANG}/${country}/networks/` : "";
}

/** `/en/australia/networks/chargefox/` */
export function networkPath(country: string, network: string): string {
  return country && network ? `/${LANG}/${country}/networks/${network}/` : "";
}

/** `/en/vehicles/tesla-model-3/` */
export function vehiclePath(slug: string): string {
  return slug ? `/${LANG}/vehicles/${slug}/` : "";
}

/** Metres, rounded. What a page prints: "560 m", not "0.56 km". */
export function metres(distanceKm: number): number {
  return Math.round(distanceKm * 1000);
}
