import { ApiError } from "@/lib/api/http";

const panel =
  "flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center";

export function EventsEmpty({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className={panel}>
      <p className="font-medium">No events found</p>
      <p className="max-w-md text-sm text-muted">
        {hasFilters
          ? "No events match your search or filters. Try changing or clearing them."
          : "There are no agent events to show yet."}
      </p>
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
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="h-9 rounded-lg bg-accent px-4 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}
