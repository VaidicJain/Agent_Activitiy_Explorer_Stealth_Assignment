import { isEventStatus, type EventFilters } from "./types";

/**
 * The URL is the single source of truth for the committed view:
 *   ?q=<text>&agent=<n>&agent=<n>&status=<ok|blocked|error>&event=<id>
 * Cursors are opaque and only valid for one query, so they are never put in the URL;
 * a reloaded or shared link opens on the first page of the same filtered view.
 */

type ParamsReader = Pick<URLSearchParams, "get" | "getAll">;

export interface EventsUrlState {
  filters: EventFilters;
  eventId: string | undefined;
}

/** Marks the history entry created by clicking a row, so closing can step back instead of piling up entries. */
const OPENED_FROM_LIST = "eventOpenedFromList";

export function parseEventsUrl(params: ParamsReader): EventsUrlState {
  const filters: EventFilters = {};

  const q = params.get("q")?.trim();
  if (q) filters.q = q;

  const agents = Array.from(new Set(params.getAll("agent").filter(Boolean))).sort();
  if (agents.length > 0) filters.agent = agents;

  const status = params.get("status");
  if (isEventStatus(status)) filters.status = status;

  return { filters, eventId: params.get("event") || undefined };
}


function updateUrl(
  mutate: (params: URLSearchParams) => void,
  mode: "push" | "replace",
  state: unknown = null,
) {
  const params = new URLSearchParams(window.location.search);
  mutate(params);

  const search = params.toString();
  const { pathname, hash } = window.location;
  const url = `${pathname}${search ? `?${search}` : ""}${hash}`;
  if (url === `${pathname}${window.location.search}${hash}`) return;

  if (mode === "push") window.history.pushState(state, "", url);
  else window.history.replaceState(window.history.state, "", url);
}


export function updateFilters(patch: Partial<EventFilters>) {
  updateUrl((params) => {
    if ("q" in patch) {
      if (patch.q) params.set("q", patch.q);
      else params.delete("q");
    }
    if ("status" in patch) {
      if (patch.status) params.set("status", patch.status);
      else params.delete("status");
    }
    if ("agent" in patch) {
      params.delete("agent");
      patch.agent?.forEach((name) => params.append("agent", name));
    }
  }, "push");
}

export function openEvent(id: string) {
  updateUrl((params) => params.set("event", id), "push", { [OPENED_FROM_LIST]: true });
}


export function closeEvent() {
  if (!new URLSearchParams(window.location.search).has("event")) return;

  if (window.history.state?.[OPENED_FROM_LIST]) window.history.back();
  else updateUrl((params) => params.delete("event"), "replace");
}

/** Current `q` straight from the location (used to resync the input after Back/Forward). */
export function readQueryFromLocation(): string {
  return parseEventsUrl(new URLSearchParams(window.location.search)).filters.q ?? "";
}
