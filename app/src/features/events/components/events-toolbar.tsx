"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { formatCount } from "../format";
import { EVENT_STATUSES, isEventStatus, type EventFilters } from "../types";
import { readQueryFromLocation } from "../url-state";
import { AgentFilter } from "./agent-filter";
import { controlClass as control } from "./control-class";

const SEARCH_DEBOUNCE_MS = 400;
const SEARCH_CLASS = `${control} min-w-64 flex-1 sm:max-w-md`;

interface SearchBoxProps {
  initialValue: string;
  onCommit: (query: string | undefined) => void;
}


function SearchBox({ initialValue, onCommit }: SearchBoxProps) {
  const [draft, setDraft] = useState(initialValue);
  const { run: commit, cancel: cancelCommit } = useDebounce(
    (query: string) => onCommit(query.trim() || undefined),
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    function resync() {
      cancelCommit();
      setDraft(readQueryFromLocation());
    }
    window.addEventListener("popstate", resync);
    return () => window.removeEventListener("popstate", resync);
  }, [cancelCommit]);

  return (
    <input
      type="search"
      aria-label="Search events"
      placeholder="Search agent, tool or arguments…"
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
      className={SEARCH_CLASS}
    />
  );
}

interface EventsToolbarProps {
  filters: EventFilters;
  total?: number;
  searchBoxKey: number;
  searchBoxInitial: string;
  onFiltersChange: (patch: Partial<EventFilters>) => void;
  onClearFilters: () => void;
}

function EventCount({ total }: { total?: number }) {
  return (
    <p className="ml-auto text-sm tabular-nums text-muted" aria-live="polite">
      {total === undefined ? "—" : formatCount(total)} events
    </p>
  );
}

export function EventsToolbar({
  filters,
  total,
  searchBoxKey,
  searchBoxInitial,
  onFiltersChange,
  onClearFilters,
}: EventsToolbarProps) {
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div role="search" className="flex flex-wrap items-center gap-2">
      <SearchBox
        key={searchBoxKey}
        initialValue={searchBoxInitial}
        onCommit={(q) => onFiltersChange({ q })}
      />
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
      {hasFilters && (
        <button type="button" onClick={onClearFilters} className={control}>
          Clear filters
        </button>
      )}
      <EventCount total={total} />
    </div>
  );
}

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
