import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { parseEvent } from "./api";
import type { EventSummary } from "./types";

/** Newest events kept in memory; older ones are dropped. */
export const MAX_LIVE_EVENTS = 100;

export type StreamStatus = "connecting" | "live" | "reconnecting" | "disconnected";

const STREAM_URL = new URL("/stream", API_BASE_URL).href;

function parseStreamEvent(data: unknown): EventSummary | undefined {
  if (typeof data !== "string") return undefined;
  try {
    return parseEvent(JSON.parse(data));
  } catch (error) {
    console.warn("Ignoring malformed stream event", error);
    return undefined;
  }
}

/** Newest first, no duplicate ids, capped at MAX_LIVE_EVENTS. */
function prependEvent(events: EventSummary[], event: EventSummary): EventSummary[] {
  if (events.some(({ id }) => id === event.id)) return events;
  return [event, ...events].slice(0, MAX_LIVE_EVENTS);
}

/**
 * Subscribes to GET /stream while the component using it is mounted.
 * Interruptions are handled by the browser's own EventSource reconnection (the server advertises
 * `retry: 2000`); `reconnect` is only for a connection the browser has given up on.
 */
export function useEventStream() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  // Changing this re-runs the effect, which opens a fresh connection.
  const [connectionId, setConnectionId] = useState(0);

  useEffect(() => {
    const source = new EventSource(STREAM_URL);

    source.onopen = () => setStatus("live");
    source.onmessage = (message) => {
      const event = parseStreamEvent(message.data);
      if (event) setEvents((current) => prependEvent(current, event));
    };
    // CLOSED: the browser will not retry (e.g. HTTP error). CONNECTING: it is retrying by itself.
    source.onerror = () =>
      setStatus(source.readyState === EventSource.CLOSED ? "disconnected" : "reconnecting");

    return () => source.close();
  }, [connectionId]);

  function reconnect() {
    setStatus("connecting");
    setConnectionId((id) => id + 1);
  }

  return { events, status, reconnect };
}
