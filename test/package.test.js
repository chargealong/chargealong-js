import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { VERSION } from "../src/client";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// 0.1.0 went to npm as dist and a licence, with no README: the package page
// said "No README data found". This packs the tarball the way publish does and
// reads what is in it.
describe("the published package", () => {
  // npm 11 answers a list, npm 12 an object keyed by package name; the
  // release job runs the newest npm, so both are read.
  const out = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8" }));
  const entry = Array.isArray(out) ? out[0] : out[pkg.name];
  const packed = entry.files.map((f) => f.path);

  it("carries its README and changelog", () => {
    expect(packed).toContain("README.md");
    expect(packed).toContain("CHANGELOG.md");
    expect(packed).toContain("LICENSE");
  });

  // The User-Agent carries VERSION; npm publishes package.json's.
  it("says one version everywhere", () => {
    expect(VERSION).toBe(pkg.version);
    expect(pkg.version).toBe("0.1.2");
    expect(readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8")).toContain(`## ${pkg.version}`);
  });

  it("links the website beside contact", () => {
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
    expect(readme).toContain("[chargealong.io](https://chargealong.io/)");
    expect(readme).toContain("(https://chargealong.io/en/contact/)");
  });
});
