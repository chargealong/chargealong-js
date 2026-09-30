/** What the API said when it refused. */

/**
 * The service answers RFC 7807 problem documents: a title and a detail written
 * for a person to read and act on, such as which parameter is out of range.
 * Collapsing that into "HTTP 400" throws away the only part of the answer that
 * says what to do about it.
 */
export class ChargeAlongError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string;

  constructor(status: number, title = "", detail = "") {
    super([title || `HTTP ${status}`, detail].filter(Boolean).join(": "));
    this.name = "ChargeAlongError";
    this.status = status;
    this.title = title;
    this.detail = detail;
  }
}

/** Nothing is filed under that id or slug, and never was. */
export class NotFound extends ChargeAlongError {
  constructor(status: number, title = "", detail = "") {
    super(status, title, detail);
    this.name = "NotFound";
  }
}

/**
 * The request could not be served as written. The detail names the parameter.
 *
 * Also a 422 from planTrip: there is no road route between the two points.
 */
export class BadRequest extends ChargeAlongError {
  constructor(status: number, title = "", detail = "") {
    super(status, title, detail);
    this.name = "BadRequest";
  }
}

/**
 * Too many requests from here.
 *
 * The API is free and keyless and asks callers to be gentle: answers kept
 * rather than fetched again, typing debounced.
 */
export class RateLimited extends ChargeAlongError {
  /** Seconds the service asked for, when it said. */
  readonly retryAfter?: number;

  constructor(status: number, title = "", detail = "", retryAfter?: number) {
    super(status, title, detail);
    this.name = "RateLimited";
    this.retryAfter = retryAfter;
  }
}

export function errorFor(status: number, title = "", detail = "", retryAfter?: number): ChargeAlongError {
  if (status === 404) return new NotFound(status, title, detail);
  if (status === 429) return new RateLimited(status, title, detail, retryAfter);
  if (status >= 400 && status < 500) return new BadRequest(status, title, detail);
  return new ChargeAlongError(status, title, detail);
}
