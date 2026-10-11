"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/http";
import { formatJson, formatTimestamp } from "../format";
import { eventDetailQueryOptions } from "../queries";
import { SlowNotice } from "./events-states";
import type { EventDetail } from "../types";

const buttonClass =
  "h-9 rounded-lg border border-border bg-surface px-3 text-sm hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60";

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  const json = value === undefined ? undefined : formatJson(value);
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted">{title}</h3>
      {json ? (
        <>
          {/* Focusable so keyboard users can scroll long payloads. */}
          <pre
            tabIndex={0}
            className="max-h-80 overflow-auto rounded-lg border border-border bg-surface-muted p-3 font-mono text-xs"
          >
            {json.text}
          </pre>
          {json.truncated && (
            <p className="text-xs text-muted">Showing the first part only: the payload is very large.</p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">Not provided.</p>
      )}
    </section>
  );
}

function DetailBody({ event }: { event: EventDetail }) {
  const fields: [string, string][] = [
    ["ID", event.id],
    ["Time", formatTimestamp(event.timestamp)],
    ["Agent", event.agent],
    ["Tool", event.tool],
    ["Status", event.status],
    ["Latency", `${event.latencyMs} ms`],
  ];

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 text-sm">
        {fields.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="break-all font-mono text-xs leading-5">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Policy matches</h3>
        {event.policyMatches.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {event.policyMatches.map((rule) => (
              <li key={rule} className="rounded-md border border-border px-2 py-1 font-mono text-xs">
                {rule}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No policies matched.</p>
        )}
      </section>

      <JsonBlock title="Arguments" value={event.args} />
      <JsonBlock title="Result" value={event.result} />
    </div>
  );
}

function DetailContent({ eventId }: { eventId: string }) {
  const { data, error, isPending, isFetching, refetch } = useQuery(eventDetailQueryOptions(eventId));

  if (data) return <DetailBody event={data} />;

  if (isPending) {
    return (
      <>
        <p role="status" className="text-sm text-muted">
          Loading event…
        </p>
        <SlowNotice />
      </>
    );
  }

  const message =
    error instanceof ApiError && error.status === 404
      ? "This event no longer exists, or the link is invalid."
      : error instanceof ApiError
        ? error.message
        : "Something went wrong while loading this event.";

  return (
    <div role="alert" className="space-y-3">
      <p className="font-medium">Couldn’t load this event</p>
      <p className="text-sm text-muted">{message}</p>
      <button type="button" onClick={() => refetch()} disabled={isFetching} className={buttonClass}>
        {isFetching ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

interface EventDetailPanelProps {
  /** The selected event, or undefined when the panel is closed. */
  eventId: string | undefined;
  onClose: () => void;
}

/**
 * Side panel on a native modal <dialog>: the browser provides the focus trap, inert background,
 * Escape-to-close and focus return to the row that opened it. React only mirrors `eventId`
 * (which comes from the URL) onto the dialog's open state.
 */
export function EventDetailPanel({ eventId, onClose }: EventDetailPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (eventId && !dialog.open) dialog.showModal();
    else if (!eventId && dialog.open) dialog.close();
  }, [eventId]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="event-detail-title"
      // Fires for Escape, the close button and Back/Forward alike; closing the URL twice is a no-op.
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-0 ml-auto h-full max-h-none w-full max-w-xl border-l border-border bg-surface p-0 text-foreground backdrop:bg-black/40"
    >
      {eventId && (
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
            <h2 id="event-detail-title" className="text-base font-semibold">
              Event details
            </h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className={buttonClass}>
              Close
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <DetailContent eventId={eventId} />
          </div>
        </div>
      )}
    </dialog>
  );
}
