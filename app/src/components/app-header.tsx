export function AppHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-lg bg-accent text-white"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13h4l2.5-7 4 12 2.5-5h5" />
          </svg>
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-tight">
            Agent Activity Explorer
          </h1>
          <p className="truncate text-xs text-muted">
            Tool calls made by your AI agents
          </p>
        </div>
      </div>
    </header>
  );
}
