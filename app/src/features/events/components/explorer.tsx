import { EventsTable } from "./events-table";
import { EventsToolbar } from "./events-toolbar";

export function Explorer() {
  return (
    <>
      <EventsToolbar />
      <EventsTable />
    </>
  );
}
