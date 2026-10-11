# NOTES

## What I built
Part A, the Agent Activity Explorer, in `app/` (Next.js App Router, React, TypeScript, Tailwind v4, TanStack Query). I did **Core only**; I did not pick any Stretch item, because I wanted the Core flows to be solid first.

- **Event list:** table of timestamp, agent, tool, status and latency, with cursor pagination (First / Previous / Next, 25-200 rows per page). Cursors are treated as opaque: only the `nextCursor` the API returned is ever used, and a history of those is kept for Previous.
- **Search and filters:** debounced free-text search (`q`), status, and multi-select agent filter (repeated `agent` params, options from `/agents`). The search text, filters and the open event live in the URL, so refresh, copied links and Back/Forward all restore the same view. Each committed filter change is a history entry.
- **Detail panel:** native modal `<dialog>` (focus trap, Escape to close, focus returns to the row), linked by `?event=<id>`, full event fetched on demand.
- **States:** skeleton loading, a "still loading" notice after 3 s, distinct empty and error states with Retry, and per-view error handling (an agents failure does not break the list).
- **Polish that came along:** dark mode via `prefers-color-scheme`, `prefers-reduced-motion`, semantic table markup and visible focus.

## Why Next.js
It is the framework I use day to day, and the App Router gives a ready Suspense boundary for UI that depends on the URL. The API is called from the browser, so there is no server-side data fetching.

## Tradeoffs
- **Pagination instead of virtualization:** simpler and predictable with opaque cursors; "Last page" is impossible by design.
- **Page number and page size are not in the URL.** A refreshed or shared link opens page 1 of the same filtered view, because cursors are only valid for the query that produced them.
- **Strict response parsing** (hand-written, no schema library) so malformed data becomes a clear error instead of a crash. Only `argsPreview` is optional.
- **With more time:** tests for the pure logic (`pagination.ts`, `url-state.ts`, response parsing), keyboard navigation through rows, and a time-range filter.

## Known broken or incomplete
- No automated tests.
- Live mode, virtualization and the histogram chart are not built.
- TODO: confirm results of the manual checks (API, browser, lint, build) and list anything that failed.
- TODO: Part B status (`PERF.md`).

## How I used AI tools
I used Claude (chat) throughout: to plan the structure, to draft and revise components, to audit the code against the Core requirements in `ASSIGNMENT.md`, and to fix the gaps that audit found. I reviewed the changes and ran the app myself against the mock API.
