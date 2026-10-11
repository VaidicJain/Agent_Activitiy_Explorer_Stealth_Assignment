"use client";

import { useSearchParams } from "next/navigation";

const control =
  "h-9 rounded-lg border border-border bg-surface px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60";

function ToolbarControls({ query }: { query: string }) {
  // Controls are disabled placeholders until search/filters are wired to the URL.
  return (
    <div role="search" className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        aria-label="Search events"
        placeholder="Search agent, tool or arguments…"
        defaultValue={query}
        disabled
        className={`${control} min-w-64 flex-1 sm:max-w-md`}
      />
      <select aria-label="Filter by status" disabled className={control}>
        <option>All statuses</option>
      </select>
      <select aria-label="Filter by agent" disabled className={control}>
        <option>All agents</option>
      </select>
      <p className="ml-auto text-sm tabular-nums text-muted" aria-live="polite">
        — events
      </p>
    </div>
  );
}

/** Reads `q` from the URL, so it needs a Suspense boundary above it. */
export function EventsToolbar() {
  const params = useSearchParams();
  return <ToolbarControls query={params.get("q") ?? ""} />;
}

export function EventsToolbarSkeleton() {
  return <ToolbarControls query="" />;
}
