import { API_BASE_URL } from "@/lib/config";
import { ApiError, getJson } from "@/lib/api/http";
import type { EventDetail, EventSummary, EventsPage, EventsQuery } from "./types";
import { isEventStatus } from "./types";

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;


export function buildEventsUrl(params: EventsQuery = {}): URL {
  const { q, agent, status, from, to, cursor, limit } = params;

  if (limit !== undefined && !(Number.isInteger(limit) && limit >= 1 && limit <= MAX_PAGE_SIZE)) {
    throw new RangeError(`limit must be an integer between 1 and ${MAX_PAGE_SIZE}, got ${limit}`);
  }

  const url = new URL("/events", API_BASE_URL);
  if (q) url.searchParams.set("q", q);
  agent?.forEach((name) => url.searchParams.append("agent", name));
  if (status) url.searchParams.set("status", status);
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);
  if (cursor) url.searchParams.set("cursor", cursor);
  if (limit !== undefined) url.searchParams.set("limit", String(limit));
  return url;
}

export async function fetchEvents(params: EventsQuery, signal?: AbortSignal): Promise<EventsPage> {
  return parseEventsPage(await getJson(buildEventsUrl(params), signal));
}

export async function fetchAgents(signal?: AbortSignal): Promise<string[]> {
  return parseAgents(await getJson(new URL("/agents", API_BASE_URL), signal));
}

export async function fetchEventDetail(id: string, signal?: AbortSignal): Promise<EventDetail> {
  const url = new URL(`/events/${encodeURIComponent(id)}`, API_BASE_URL);
  return parseEventDetail(await getJson(url, signal));
}


function invalidResponse(): ApiError {
  return new ApiError("The API returned data in an unexpected format.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEventBase(value: Record<string, unknown>): Omit<EventSummary, "argsPreview"> {
  const { id, timestamp, agent, tool, status, latencyMs } = value;

  if (
    typeof id !== "string" ||
    typeof timestamp !== "string" ||
    typeof agent !== "string" ||
    typeof tool !== "string" ||
    !isEventStatus(status) ||
    typeof latencyMs !== "number" ||
    !Number.isFinite(latencyMs)
  ) {
    throw invalidResponse();
  }
  return { id, timestamp, agent, tool, status, latencyMs };
}

/** Also used for events arriving over the live stream, which have the list-item shape. */
export function parseEvent(value: unknown): EventSummary {
  if (!isRecord(value)) throw invalidResponse();
  const { argsPreview } = value;
  return {
    ...parseEventBase(value),
    argsPreview: typeof argsPreview === "string" ? argsPreview : undefined,
  };
}

function parseEventDetail(value: unknown): EventDetail {
  if (!isRecord(value)) throw invalidResponse();
  const { args, result, policyMatches } = value;
  return {
    ...parseEventBase(value),
    args,
    result,
    policyMatches: Array.isArray(policyMatches)
      ? policyMatches.filter((rule): rule is string => typeof rule === "string")
      : [],
  };
}

function parseNextCursor(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") return value;
  throw invalidResponse();
}

function parseEventsPage(value: unknown): EventsPage {
  if (!isRecord(value)) throw invalidResponse();
  const { items, nextCursor, total } = value;

  if (!Array.isArray(items) || typeof total !== "number" || !Number.isInteger(total) || total < 0) {
    throw invalidResponse();
  }
  return { items: items.map(parseEvent), nextCursor: parseNextCursor(nextCursor), total };
}

function parseAgents(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((name) => typeof name === "string")) {
    throw invalidResponse();
  }
  return value;
}
