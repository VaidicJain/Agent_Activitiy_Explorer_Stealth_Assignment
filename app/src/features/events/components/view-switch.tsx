"use client";

import { setView, type DashboardView } from "../url-state";

const VIEWS: { id: DashboardView; label: string }[] = [
  { id: "explorer", label: "Event Explorer" },
  { id: "live", label: "Live Stream" },
];

export function ViewSwitch({ view }: { view: DashboardView }) {
  return (
    <nav aria-label="Views" className="flex self-start rounded-lg border border-border bg-surface p-1">
      {VIEWS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-current={view === id ? "page" : undefined}
          onClick={() => setView(id)}
          className={`h-8 rounded-md px-3 text-sm font-medium ${
            view === id ? "bg-accent text-background" : "text-muted hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
