import { DEFAULT_PAGE_SIZE } from "./api";

export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;


export interface PaginationState {
  scope: string;
  pageSize: number;
  cursors: (string | null)[];
}

export function initialPagination(
  scope: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginationState {
  return { scope, pageSize, cursors: [null] };
}

export function paginationForScope(state: PaginationState, scope: string): PaginationState {
  return state.scope === scope ? state : initialPagination(scope, state.pageSize);
}

export function pageNumber({ cursors }: PaginationState): number {
  return cursors.length;
}

export function currentCursor({ cursors }: PaginationState): string | undefined {
  return cursors[cursors.length - 1] ?? undefined;
}

export function goToNextPage(state: PaginationState, nextCursor: string): PaginationState {
  return { ...state, cursors: [...state.cursors, nextCursor] };
}

export function goToPreviousPage(state: PaginationState): PaginationState {
  return state.cursors.length > 1 ? { ...state, cursors: state.cursors.slice(0, -1) } : state;
}

export function goToFirstPage(state: PaginationState): PaginationState {
  return initialPagination(state.scope, state.pageSize);
}

export function changePageSize(state: PaginationState, pageSize: number): PaginationState {
  return initialPagination(state.scope, pageSize);
}
