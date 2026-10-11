"use client";

import { useEffect, useState } from "react";
import { formatCount } from "../format";
import { isEventStatus, type EventFilters, EVENT_STATUSES } from "../types";
import { readQueryFromLocation } from "../url-state";
import { AgentFilter } from "./agent-filter";
import { controlClass as control } from "./control-class";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_CLASS = `${control} min-w-64 flex-1 sm:max-w-md`;

function createDebouncer(delayMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    run(callback: () => void) {
      clearTimeout(timer);
      timer = setTimeout(callback, delayMs);
    },
    cancel() {
      clearTimeout(timer);
    },
  };
}

interface SearchBoxProps {
  /** Text from the URL at mount (deep link or refresh). */
  initialValue: string;
  onCommit: (query: string | undefined) => void;
}

/**
 * The input keeps its own draft so typing is never delayed; only the debounced commit reaches
 * the URL (and therefore the query). The draft is resynced on Back/Forward, the only time the URL
 * changes the search text from outside this input.
 */
function SearchBox({ initialValue, onCommit }: SearchBoxProps) {
  const [draft, setDraft] = useState(initialValue);
  const [debouncer] = useState(() => createDebouncer(SEARCH_DEBOUNCE_MS));

  useEffect(() => {
    function resync() {
      debouncer.cancel();
      setDraft(readQueryFromLocation());
    }
    window.addEventListener("popstate", resync);
    return () => {
      window.removeEventListener("popstate", resync);
      debouncer.cancel();
    };
  }, [debouncer]);

  return (
    <input
      type="search"
      aria-label="Search events"
      placeholder="Search agent, tool or arguments…"
      value={draft}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        debouncer.run(() => onCommit(next.trim() || undefined));
      }}
      className={SEARCH_CLASS}
    />
  );
}

interface EventsToolbarProps {
  filters: EventFilters;
  total?: number;
  onFiltersChange: (patch: Partial<EventFilters>) => void;
}

function EventCount({ total }: { total?: number }) {
  return (
    <p className="ml-auto text-sm tabular-nums text-muted" aria-live="polite">
      {total === undefined ? "—" : formatCount(total)} events
    </p>
  );
}

export function EventsToolbar({ filters, total, onFiltersChange }: EventsToolbarProps) {
  return (
    <div role="search" className="flex flex-wrap items-center gap-2">
      <SearchBox initialValue={filters.q ?? ""} onCommit={(q) => onFiltersChange({ q })} />
      <select
        aria-label="Filter by status"
        value={filters.status ?? ""}
        onChange={(event) =>
          onFiltersChange({ status: isEventStatus(event.target.value) ? event.target.value : undefined })
        }
        className={control}
      >
        <option value="">All statuses</option>
        {EVENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status[0].toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
      <AgentFilter
        selected={filters.agent ?? []}
        onChange={(agent) => onFiltersChange({ agent })}
      />
      <EventCount total={total} />
    </div>
  );
}

/** Disabled stand-in with the same layout, shown while the explorer streams in. */
export function EventsToolbarSkeleton() {
  return (
    <div role="search" className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        aria-label="Search events"
        placeholder="Search agent, tool or arguments…"
        disabled
        className={SEARCH_CLASS}
      />
      <select aria-label="Filter by status" disabled className={control}>
        <option>All statuses</option>
      </select>
      <select aria-label="Filter by agent" disabled className={control}>
        <option>All agents</option>
      </select>
      <EventCount />
    </div>
  );
}
