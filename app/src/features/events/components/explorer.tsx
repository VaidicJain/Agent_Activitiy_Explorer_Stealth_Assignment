"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  changePageSize,
  currentCursor,
  goToNextPage,
  goToPreviousPage,
  initialPagination,
  pageNumber,
  paginationForScope,
} from "../pagination";
import { eventsQueryOptions } from "../queries";
import { closeEvent, openEvent, parseEventsUrl, updateFilters } from "../url-state";
import { EventDetailPanel } from "./event-detail-panel";
import { EventsEmpty, EventsError, SlowNotice } from "./events-states";
import { EventsTable } from "./events-table";
import { EventsToolbar } from "./events-toolbar";
import { PaginationControls } from "./pagination-controls";

export function Explorer() {
  // The URL holds the committed filters and the selected event; nothing here copies them.
  const { filters, eventId } = parseEventsUrl(useSearchParams());
  const scope = JSON.stringify(filters);

  // Cursor history is local, but only valid for the filters it was built under. Comparing scopes
  // during render discards it on any filter change, including Back/Forward, without an effect.
  const [storedPagination, setPagination] = useState(() => initialPagination(scope));
  const pagination = paginationForScope(storedPagination, scope);
  if (pagination !== storedPagination) setPagination(pagination);

  const { data, error, isFetching, isPlaceholderData, refetch } = useQuery(
    eventsQueryOptions({
      ...filters,
      limit: pagination.pageSize,
      cursor: currentCursor(pagination),
    }),
  );

  // While paging, `data` is the previous page: it must not drive Next or the row range,
  // otherwise a rapid second click would reuse a stale cursor.
  const page = isPlaceholderData ? undefined : data;
  const nextCursor = page?.nextCursor ?? null;
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <>
      <EventsToolbar filters={filters} total={data?.total} onFiltersChange={updateFilters} />

      {error && !data ? (
        <EventsError error={error} onRetry={() => refetch()} isRetrying={isFetching} />
      ) : data?.items.length === 0 ? (
        <EventsEmpty hasFilters={hasFilters} />
      ) : (
        <EventsTable events={data?.items} isStale={isPlaceholderData} onSelect={openEvent} />
      )}

      {isFetching && (!data || isPlaceholderData) && <SlowNotice />}

      <PaginationControls
        page={pageNumber(pagination)}
        pageSize={pagination.pageSize}
        itemCount={page?.items.length}
        total={page?.total}
        canGoPrevious={pageNumber(pagination) > 1 && !isPlaceholderData}
        canGoNext={nextCursor !== null}
        onPrevious={() => setPagination(goToPreviousPage(pagination))}
        onNext={() => nextCursor && setPagination(goToNextPage(pagination, nextCursor))}
        onPageSizeChange={(pageSize) => setPagination(changePageSize(pagination, pageSize))}
      />

      <EventDetailPanel eventId={eventId} onClose={closeEvent} />
    </>
  );
}
