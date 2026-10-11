/** Types for the mock API (see ASSIGNMENT.md). Verified against the running API. */

export type EventStatus = "ok" | "blocked" | "error";

/** One row of GET /events. */
export interface EventSummary {
  id: string;
  /** ISO 8601, UTC. */
  timestamp: string;
  agent: string;
  tool: string;
  status: EventStatus;
  latencyMs: number;
  argsPreview: string;
}

/** GET /events. `nextCursor` is null on the last page. */
export interface EventsPage {
  items: EventSummary[];
  nextCursor: string | null;
  total: number;
}

/** GET /events/:id. Note: no `argsPreview`; `args` and `result` can be any JSON value. */
export interface EventDetail extends Omit<EventSummary, "argsPreview"> {
  args: unknown;
  result: unknown;
  /** Names of the policy rules that fired. */
  policyMatches: string[];
}

/** GET /events/histogram. Empty buckets are omitted. */
export interface HistogramResponse {
  bucket: "1m" | "5m" | "1h";
  buckets: { t: string; count: number }[];
}

/** Query params accepted by GET /events (and, minus cursor/limit, the histogram). */
export interface EventsQuery {
  q?: string;
  agent?: string[];
  status?: EventStatus;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}
