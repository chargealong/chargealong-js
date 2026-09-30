# Changelog

## 0.1.1

- The package carries its README and changelog. 0.1.0 was published without
  them, so its npm page said there was no README.
- The README links the website beside the contact page.

## 0.1.0

First release.

- `nearby`, `planTrip`, `search`, `site`, `vehicles` and `vehicle`, plus the
  directory: `countries`, `overview`, `country`, `region`, `networks`,
  `network`, `locality` and `redirect`. The whole read surface of
  api.chargealong.io.
- Errors keep the service's own words: `NotFound`, `BadRequest` and
  `RateLimited`. A removed site answers with `status: "removed"`.
- `pageUrl` turns any row's path into its page on chargealong.io; builders for
  the pages rows only carry slugs for.
- Options are checked against the service's bounds before a request goes out,
  so NaN and out of range figures never reach a URL.
- No dependencies.
