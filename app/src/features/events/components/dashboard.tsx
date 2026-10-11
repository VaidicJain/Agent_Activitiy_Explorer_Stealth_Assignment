"use client";

import { useSearchParams } from "next/navigation";
import { closeEvent, openEvent, parseEventsUrl, parseView } from "../url-state";
import { EventDetailPanel } from "./event-detail-panel";
import { Explorer } from "./explorer";
import { LiveStream } from "./live-stream";
import { ViewSwitch } from "./view-switch";

/**
 * Chooses between the explorer and the live stream from the URL (`?view=live`).
 * The explorer stays mounted (just hidden) so its cursor history, search text and cached pages
 * survive a visit to the stream; the stream mounts only while visible, so its connection is
 * open exactly then. The detail panel is shared, so rows from either view open it.
 */
export function Dashboard() {
  const searchParams = useSearchParams();
  const view = parseView(searchParams);
  const { eventId } = parseEventsUrl(searchParams);

  return (
    <>
      <ViewSwitch view={view} />
      <div className={view === "explorer" ? "flex flex-col gap-4" : "hidden"}>
        <Explorer />
      </div>
      {view === "live" && <LiveStream onSelect={openEvent} />}
      <EventDetailPanel eventId={eventId} onClose={closeEvent} />
    </>
  );
}
