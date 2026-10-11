"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { agentsQueryOptions } from "../queries";
import { controlClass } from "./control-class";

interface AgentFilterProps {
  selected: string[];
  onChange: (agents: string[]) => void;
}

function summaryLabel(selected: string[]): string {
  if (selected.length === 0) return "All agents";
  return selected.length === 1 ? selected[0] : `${selected.length} agents`;
}

/** Multi-select over GET /agents, built on <details> so keyboard and screen readers work natively. */
export function AgentFilter({ selected, onChange }: AgentFilterProps) {
  const { data: agents, isError, isFetching, refetch } = useQuery(agentsQueryOptions());
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // A native <details> stays open until toggled: close it on Escape (focus goes back to the
  // summary) or when the user clicks elsewhere.
  useEffect(() => {
    function closeIfDismissed(event: KeyboardEvent | PointerEvent) {
      const details = detailsRef.current;
      if (!details?.open) return;

      if (event instanceof KeyboardEvent) {
        if (event.key !== "Escape") return;
        details.open = false;
        details.querySelector("summary")?.focus();
      } else if (!details.contains(event.target as Node)) {
        details.open = false;
      }
    }

    document.addEventListener("keydown", closeIfDismissed);
    document.addEventListener("pointerdown", closeIfDismissed);
    return () => {
      document.removeEventListener("keydown", closeIfDismissed);
      document.removeEventListener("pointerdown", closeIfDismissed);
    };
  }, []);

  if (!agents) {
    // Keep an active selection (e.g. from a shared link) visible even while the list is unavailable.
    const active = selected.length > 0 ? `${summaryLabel(selected)} · ` : "";

    return isError ? (
      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        className={controlClass}
      >
        {isFetching ? "Retrying…" : `${active}Agents unavailable · Retry`}
      </button>
    ) : (
      <button type="button" disabled className={controlClass}>
        {active}Loading agents…
      </button>
    );
  }

  function toggle(name: string, checked: boolean) {
    onChange(checked ? [...selected, name] : selected.filter((agent) => agent !== name));
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary className={`${controlClass} flex cursor-pointer list-none items-center`}>
        {summaryLabel(selected)}
      </summary>
      <div className="absolute z-10 mt-1 w-64 rounded-lg border border-border bg-surface p-2 shadow-lg">
        <fieldset>
          <legend className="sr-only">Filter by agent</legend>
          {agents.map((name) => (
            <label key={name} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-muted">
              <input
                type="checkbox"
                checked={selected.includes(name)}
                onChange={(event) => toggle(name, event.target.checked)}
              />
              {name}
            </label>
          ))}
        </fieldset>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-1 w-full rounded px-2 py-1.5 text-left text-sm text-accent hover:bg-surface-muted"
          >
            Clear selection
          </button>
        )}
      </div>
    </details>
  );
}
