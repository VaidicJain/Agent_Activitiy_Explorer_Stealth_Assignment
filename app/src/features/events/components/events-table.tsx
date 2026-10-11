import { formatTimestamp } from "../format";
import type { EventStatus, EventSummary } from "../types";

const COLUMNS = [
  { key: "timestamp", label: "Time", className: "w-44" },
  { key: "agent", label: "Agent", className: "" },
  { key: "tool", label: "Tool", className: "" },
  { key: "status", label: "Status", className: "w-28" },
  { key: "latency", label: "Latency", className: "w-28 text-right" },
] as const;

// Deterministic widths so server and client render identical skeletons.
const SKELETON_WIDTHS = ["w-32", "w-24", "w-28", "w-16", "w-12", "w-36", "w-20"];

const STATUS_STYLES: Record<EventStatus, string> = {
  ok: "text-ok",
  blocked: "text-blocked",
  error: "text-error",
};

function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium capitalize ${STATUS_STYLES[status]}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function EventRow({ event, onSelect }: { event: EventSummary; onSelect?: (id: string) => void }) {
  return (
    <tr
      onClick={(clickEvent) => {
        clickEvent.currentTarget.querySelector("button")?.focus();
        onSelect?.(event.id);
      }}
      className="cursor-pointer border-t border-border hover:bg-surface-muted"
    >
      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
        <button
          type="button"
          aria-haspopup="dialog"
          className="rounded text-left tabular-nums hover:underline"
        >
          <time dateTime={event.timestamp} title={event.timestamp}>
            {formatTimestamp(event.timestamp)}
          </time>
          <span className="sr-only">
            , open details for {event.tool} call by {event.agent}
          </span>
        </button>
      </td>
      <td className="truncate px-4 py-3" title={event.agent}>
        {event.agent}
      </td>
      <td className="truncate px-4 py-3 font-mono text-xs" title={event.tool}>
        {event.tool}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={event.status} />
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{event.latencyMs} ms</td>
    </tr>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return Array.from({ length: count }, (_, row) => (
    <tr key={row} className="border-t border-border">
      {COLUMNS.map((column, col) => (
        <td key={column.key} className="px-4 py-3">
          <div
            className={`h-3.5 animate-pulse rounded bg-border ${
              SKELETON_WIDTHS[(row + col * 3) % SKELETON_WIDTHS.length]
            } ${col === COLUMNS.length - 1 ? "ml-auto" : ""}`}
          />
        </td>
      ))}
    </tr>
  ));
}

interface EventsTableProps {
  events?: EventSummary[];
  isStale?: boolean;
  skeletonRows?: number;
  onSelect?: (id: string) => void;
}

export function EventsTable({ events, isStale = false, skeletonRows = 12, onSelect }: EventsTableProps) {
  return (
    <div
      role="region"
      aria-label="Events"
      tabIndex={0}
      className={`overflow-x-auto rounded-xl border border-border bg-surface transition-opacity ${
        isStale ? "opacity-60" : ""
      }`}
    >
      <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
        <caption className="sr-only">Agent tool-call events</caption>
        <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-2.5 font-medium ${column.className}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody aria-busy={!events || isStale}>
          {events ? (
            events.map((event) => <EventRow key={event.id} event={event} onSelect={onSelect} />)
          ) : (
            <SkeletonRows count={skeletonRows} />
          )}
        </tbody>
      </table>
    </div>
  );
}
