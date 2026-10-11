import { queryOptions } from "@tanstack/react-query";
import { fetchAgents, fetchEventDetail, fetchEvents } from "./api";
import type { EventsQuery } from "./types";

/** Two requests are the same list when only the cursor differs (undefined keys are ignored). */
function isSameList(a: EventsQuery, b: EventsQuery): boolean {
  return JSON.stringify({ ...a, cursor: undefined }) === JSON.stringify({ ...b, cursor: undefined });
}


export function eventsQueryOptions(params: EventsQuery) {
  return queryOptions({
    queryKey: ["events", params] as const,
    queryFn: ({ signal }) => fetchEvents(params, signal),
    placeholderData: (previousData, previousQuery) =>
      previousQuery && isSameList(previousQuery.queryKey[1], params) ? previousData : undefined,
  });
}

/** Agent names change rarely, so cache them for the session's typical lifetime. */
export function agentsQueryOptions() {
  return queryOptions({
    queryKey: ["agents"] as const,
    queryFn: ({ signal }) => fetchAgents(signal),
    staleTime: 5 * 60_000,
  });
}

/** Fetched only for the selected event; events don't change, so cached details stay fresh. */
export function eventDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["event", id] as const,
    queryFn: ({ signal }) => fetchEventDetail(id, signal),
    staleTime: 5 * 60_000,
  });
}
