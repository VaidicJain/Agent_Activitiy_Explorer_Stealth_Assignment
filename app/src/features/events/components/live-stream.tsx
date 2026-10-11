"use client";

import { useEventStream, MAX_LIVE_EVENTS, type StreamStatus } from "../use-event-stream";
import { controlClass } from "./control-class";
import { EventsTable } from "./events-table";

const STATUS_DISPLAY: Record<StreamStatus, { label: string; style: string }> = {
  connecting: { label: "Connecting…", style: "text-blocked" },
  live: { label: "Live", style: "text-ok" },
  reconnecting: { label: "Connection lost, reconnecting…", style: "text-blocked" },
  disconnected: { label: "Disconnected", style: "text-error" },
};

interface LiveStreamProps {
  onSelect: (id: string) => void;
}

/** Streamed events live in this component only; the explorer's cursor-paginated cache is untouched. */
export function LiveStream({ onSelect }: LiveStreamProps) {
  const { events, status, reconnect } = useEventStream();
  const { label, style } = STATUS_DISPLAY[status];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p role="status" className={`inline-flex items-center gap-1.5 font-medium ${style}`}>
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          {label}
        </p>
        {status === "disconnected" && (
          <button type="button" onClick={reconnect} className={controlClass}>
            Reconnect
          </button>
        )}
        <p className="ml-auto tabular-nums text-muted">
          Latest {events.length} of up to {MAX_LIVE_EVENTS} events, newest first
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-6 py-16 text-center">
          <p className="font-medium">
            {status === "disconnected" ? "Couldn’t connect to the live stream" : "Waiting for events…"}
          </p>
          <p className="max-w-md text-sm text-muted">
            {status === "disconnected"
              ? "Check that the API is running, then reconnect."
              : "New agent activity will appear here as it happens."}
          </p>
        </div>
      ) : (
        <EventsTable events={events} onSelect={onSelect} />
      )}
    </>
  );
}
