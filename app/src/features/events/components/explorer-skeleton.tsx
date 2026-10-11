import { EventsTable } from "./events-table";
import { EventsToolbarSkeleton } from "./events-toolbar";

/** Suspense fallback: same frame as <Explorer />, so nothing shifts when it resolves. */
export function ExplorerSkeleton() {
  return (
    <>
      <EventsToolbarSkeleton />
      <EventsTable />
    </>
  );
}
