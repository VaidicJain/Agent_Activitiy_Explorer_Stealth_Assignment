import { EventsTable } from "./events-table";
import { EventsToolbarSkeleton } from "./events-toolbar";
import { ViewSwitch } from "./view-switch";

/** Suspense fallback: same frame as <Dashboard /> on the explorer view, so nothing shifts when it resolves. */
export function ExplorerSkeleton() {
  return (
    <>
      <ViewSwitch view="explorer" />
      <div className="flex flex-col gap-4">
        <EventsToolbarSkeleton />
        <EventsTable />
      </div>
    </>
  );
}
