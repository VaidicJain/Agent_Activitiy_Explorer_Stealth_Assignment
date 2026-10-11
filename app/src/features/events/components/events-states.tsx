import { ApiError } from "@/lib/api/http";

const panel =
  "flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center";

const primaryButton =
  "h-9 rounded-lg bg-accent px-4 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-60";

interface EventsEmptyProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  /** Set only when the empty page is not the first one (e.g. the API ended with a trailing cursor). */
  onFirstPage?: () => void;
}

export function EventsEmpty({ hasFilters, onClearFilters, onFirstPage }: EventsEmptyProps) {
  if (onFirstPage) {
    return (
      <div className={panel}>
        <p className="font-medium">No more events</p>
        <p className="max-w-md text-sm text-muted">This page has no events.</p>
        <button type="button" onClick={onFirstPage} className={primaryButton}>
          Back to first page
        </button>
      </div>
    );
  }

  return (
    <div className={panel}>
      <p className="font-medium">No events found</p>
      <p className="max-w-md text-sm text-muted">
        {hasFilters
          ? "No events match your search or filters. Try changing or clearing them."
          : "There are no agent events to show yet."}
      </p>
      {hasFilters && (
        <button type="button" onClick={onClearFilters} className={primaryButton}>
          Clear filters
        </button>
      )}
    </div>
  );
}

/** Appears only after a few seconds of waiting (pure CSS, see `.slow-notice`), so fast loads stay quiet. */
export function SlowNotice() {
  return (
    <p role="status" className="slow-notice text-center text-sm text-muted">
      Still loading — the API is responding slowly…
    </p>
  );
}

interface EventsErrorProps {
  error: Error;
  onRetry: () => void;
  isRetrying: boolean;
}

export function EventsError({ error, onRetry, isRetrying }: EventsErrorProps) {
  const message =
    error instanceof ApiError ? error.message : "Something went wrong while loading events.";

  return (
    <div role="alert" className={panel}>
      <p className="font-medium">Couldn’t load events</p>
      <p className="max-w-md text-sm text-muted">{message}</p>
      <button type="button" onClick={onRetry} disabled={isRetrying} className={primaryButton}>
        {isRetrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

/** A background refresh failed but earlier results are still on screen, so keep them and say so. */
export function RefreshFailed({ onRetry, isRetrying }: Omit<EventsErrorProps, "error">) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2 text-sm"
    >
      <p>Couldn’t refresh events. Showing the last results that loaded.</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="rounded px-2 py-1 font-medium text-accent hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}
