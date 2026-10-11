
export const EVENT_STATUSES = ["ok", "blocked", "error"] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export function isEventStatus(value: unknown): value is EventStatus {
  return typeof value === "string" && (EVENT_STATUSES as readonly string[]).includes(value);
}

export interface EventSummary {
  id: string;
  /** ISO 8601, UTC. */
  timestamp: string;
  agent: string;
  tool: string;
  status: EventStatus;
  latencyMs: number;
  argsPreview?: string;
}

export interface EventsPage {
  items: EventSummary[];
  nextCursor: string | null;
  total: number;
}

export interface EventDetail extends Omit<EventSummary, "argsPreview"> {
  args: unknown;
  result: unknown;
  policyMatches: string[];
}

export interface EventsQuery {
  q?: string;
  agent?: string[];
  status?: EventStatus;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export type EventFilters = Pick<EventsQuery, "q" | "agent" | "status">;
