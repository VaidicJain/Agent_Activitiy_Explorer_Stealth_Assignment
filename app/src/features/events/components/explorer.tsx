"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  changePageSize,
  currentCursor,
  goToFirstPage,
  goToNextPage,
  goToPreviousPage,
  initialPagination,
  pageNumber,
  paginationForScope,
} from "../pagination";
import { eventsQueryOptions } from "../queries";
import { closeEvent, openEvent, parseEventsUrl, updateFilters } from "../url-state";
import { EventDetailPanel } from "./event-detail-panel";
import { EventsEmpty, EventsError, RefreshFailed, SlowNotice } from "./events-states";
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

  // The search box owns its text while typing. Clearing the filters remounts it (new key, empty
  // text); until then its text comes from the URL it was mounted with.
  const [searchBox, setSearchBox] = useState<{ key: number; initial?: string }>({ key: 0 });

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
  const isLoadingPage = isFetching && (!data || isPlaceholderData);
  const isFirstPage = pageNumber(pagination) === 1;
  const canGoPrevious = !isFirstPage && !isPlaceholderData;

  function clearFilters() {
    updateFilters({ q: undefined, status: undefined, agent: [] });
    setSearchBox((current) => ({ key: current.key + 1, initial: "" }));
  }

  return (
    <>
      <EventsToolbar
        filters={filters}
        total={data?.total}
        searchBoxKey={searchBox.key}
        searchBoxInitial={searchBox.initial ?? filters.q ?? ""}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      {error && !data ? (
        <EventsError error={error} onRetry={() => refetch()} isRetrying={isFetching} />
      ) : data?.items.length === 0 ? (
        <EventsEmpty
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onFirstPage={isFirstPage ? undefined : () => setPagination(goToFirstPage(pagination))}
        />
      ) : (
        <EventsTable events={data?.items} isStale={isPlaceholderData} onSelect={openEvent} />
      )}

      {/* A failed background refresh keeps the cached rows; say so instead of failing silently. */}
      {error && data && <RefreshFailed onRetry={() => refetch()} isRetrying={isFetching} />}

      {isLoadingPage && <SlowNotice />}
      {/* Always mounted so screen readers pick up the change when loading starts. */}
      <p role="status" className="sr-only">
        {isLoadingPage ? "Loading events…" : ""}
      </p>

      <PaginationControls
        page={pageNumber(pagination)}
        pageSize={pagination.pageSize}
        itemCount={page?.items.length}
        total={page?.total}
        canGoPrevious={canGoPrevious}
        canGoNext={nextCursor !== null}
        onFirst={() => setPagination(goToFirstPage(pagination))}
        onPrevious={() => setPagination(goToPreviousPage(pagination))}
        onNext={() => nextCursor && setPagination(goToNextPage(pagination, nextCursor))}
        onPageSizeChange={(pageSize) => setPagination(changePageSize(pagination, pageSize))}
      />

      <EventDetailPanel eventId={eventId} onClose={closeEvent} />
    </>
  );
}
