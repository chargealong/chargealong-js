import { describe, expect, it, vi } from "vitest";

import { ChargeAlong, DEFAULT_BASE_URL } from "./index";

/**
 * The controls that stop this client being turned against its caller.
 *
 * There is no key to leak: the API is keyless. What passes through instead is
 * where somebody is (a coordinate, a trip's two ends) and the URLs this client
 * builds out of whatever a caller hands it. So: the destination cannot be moved
 * off https, an id or slug cannot walk out of its path, nothing reaches a query
 * unencoded or as a word like NaN, and a page's cookies never ride along.
 */

function recorder(body: unknown = { data: [] }, status = 200) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify(body), { status });
  });
  return {
    calls,
    fetchImpl: fetchImpl as unknown as typeof globalThis.fetch,
    get url() {
      return calls[calls.length - 1]!.url;
    },
    get init() {
      return calls[calls.length - 1]!.init;
    },
  };
}

describe("where requests may go", () => {
  it("defaults to https", () => {
    expect(DEFAULT_BASE_URL).toBe("https://api.chargealong.io");
  });

  it("refuses plaintext http to a public host", () => {
    expect(() => new ChargeAlong({ baseUrl: "http://api.chargealong.io" })).toThrow(/clear/);
  });

  it("allows loopback over http, for a test server", () => {
    for (const baseUrl of ["http://localhost:8080", "http://127.0.0.1:8080", "http://[::1]:8080"]) {
      expect(() => new ChargeAlong({ baseUrl })).not.toThrow();
    }
  });

  it("does not take a host that only starts like loopback", () => {
    for (const baseUrl of ["http://localhost.evil.example", "http://127.0.0.1.evil.example"]) {
      expect(() => new ChargeAlong({ baseUrl })).toThrow();
    }
  });

  it("refuses another scheme", () => {
    for (const baseUrl of ["ftp://api.chargealong.io", "file:///etc/passwd", "javascript:alert(1)"]) {
      expect(() => new ChargeAlong({ baseUrl })).toThrow();
    }
  });

  it("refuses a base URL that is not absolute", () => {
    for (const baseUrl of ["", "api.chargealong.io", "/v1"]) {
      expect(() => new ChargeAlong({ baseUrl })).toThrow();
    }
  });

  it("refuses a base URL carrying credentials", () => {
    expect(() => new ChargeAlong({ baseUrl: "https://api.chargealong.io@evil.example" })).toThrow(/credentials/);
  });

  it("refuses a base URL with a query or a fragment, which would swallow the path", () => {
    for (const baseUrl of ["https://api.chargealong.io?x=1", "https://api.chargealong.io#x"]) {
      expect(() => new ChargeAlong({ baseUrl })).toThrow();
    }
  });

  it("keeps every request on the host and prefix it was given", async () => {
    const r = recorder({ data: {} });
    const ca = new ChargeAlong({ baseUrl: "https://proxy.example.com/ev/", fetch: r.fetchImpl });
    await ca.countries();
    await ca.site("hwqb4abf");
    await ca.nearby({ lat: 1, lng: 1 });
    await ca.vehicle("tesla-model-3");
    for (const call of r.calls) {
      const url = new URL(call.url);
      expect(url.host).toBe("proxy.example.com");
      expect(url.pathname.startsWith("/ev/v1/")).toBe(true);
    }
  });
});

describe("what reaches the wire", () => {
  it("does not let an id or a slug walk out of its path", async () => {
    const r = recorder({ data: {} });
    const ca = new ChargeAlong({ fetch: r.fetchImpl });
    for (const id of ["../admin/queue", "..%2Fadmin", "a/b", "x?all=true", "x#frag"]) {
      await ca.site(id);
      const url = new URL(r.url);
      expect(url.pathname.split("/")).toHaveLength(4);
      expect(url.pathname.startsWith("/v1/sites/")).toBe(true);
      expect(url.search).toBe("");
      await ca.locality("australia", id, "coburg");
      expect(new URL(r.url).pathname.split("/")).toHaveLength(6);
    }
  });

  it("refuses an empty slug, and one naming the collection or its parent", async () => {
    const ca = new ChargeAlong({ fetch: recorder().fetchImpl });
    for (const bad of ["", "  ", ".", ".."]) {
      await expect(ca.site(bad)).rejects.toThrow();
      await expect(ca.country(bad)).rejects.toThrow();
      await expect(ca.vehicle(bad)).rejects.toThrow();
    }
  });

  it("does not let a search term inject another parameter", async () => {
    const r = recorder({ data: { localities: [], postcodes: [], sites: [] } });
    await new ChargeAlong({ fetch: r.fetchImpl }).search("coburg&prefer=US");
    const url = new URL(r.url);
    expect(url.searchParams.get("q")).toBe("coburg&prefer=US");
    expect(url.searchParams.has("prefer")).toBe(false);
  });

  it("does not let a network name inject another parameter", async () => {
    const r = recorder({ data: { sites: [] } });
    await new ChargeAlong({ fetch: r.fetchImpl }).nearby({ lat: 1, lng: 1, network: "evie&limit=50" });
    const url = new URL(r.url);
    expect(url.searchParams.get("network")).toBe("evie&limit=50");
    expect(url.searchParams.has("limit")).toBe(false);
  });

  it("never sends NaN, Infinity or a point off the globe", async () => {
    const r = recorder();
    const ca = new ChargeAlong({ fetch: r.fetchImpl });
    for (const [lat, lng] of [
      [Number.NaN, 0],
      [0, Number.POSITIVE_INFINITY],
      [91, 0],
      [0, -181],
    ] as const) {
      await expect(ca.nearby({ lat, lng })).rejects.toThrow(/globe/);
      await expect(ca.planTrip({ from: { lat, lng }, to: { lat: 1, lng: 1 }, rangeKm: 400 })).rejects.toThrow(/globe/);
    }
    await expect(ca.nearby({ lat: 1, lng: 1, minKw: Number.NaN })).rejects.toThrow(/minKw/);
    await expect(ca.planTrip({ from: { lat: 1, lng: 1 }, to: { lat: 2, lng: 2 }, rangeKm: Number.NaN })).rejects.toThrow(/rangeKm/);
    expect(r.calls).toHaveLength(0);
  });

  it("refuses a redirect path that would point off the site", async () => {
    const ca = new ChargeAlong({ fetch: recorder().fetchImpl });
    for (const path of ["//evil.example/", "/x?y=https://evil.example", "http://evil.example/"]) {
      await expect(ca.redirect(path)).rejects.toThrow(/path/);
    }
  });

  it("sends no cookies and follows no redirects", async () => {
    const r = recorder();
    await new ChargeAlong({ fetch: r.fetchImpl }).countries();
    expect(r.init.credentials).toBe("omit");
    expect(r.init.redirect).toBe("error");
    expect(new Headers(r.init.headers).has("Authorization")).toBe(false);
    expect(new Headers(r.init.headers).has("Cookie")).toBe(false);
  });
});

describe("what comes back", () => {
  it("survives a body that is not an object", async () => {
    for (const body of [null, 42, "text", [1, 2]]) {
      const r = recorder(body);
      await expect(new ChargeAlong({ fetch: r.fetchImpl }).countries()).resolves.toEqual([]);
    }
  });

  it("does not let a problem document decide whether it failed", async () => {
    const r = recorder({ data: [], title: "error", status: 500 }, 200);
    await expect(new ChargeAlong({ fetch: r.fetchImpl }).countries()).resolves.toEqual([]);
  });

  it("does not let an API row send a link off the site", async () => {
    const { pageUrl } = await import("./index");
    expect(pageUrl({ path: "/\\evil.example" })).toBe("");
    expect(pageUrl({ path: "javascript:alert(1)" })).toBe("");
  });
});
