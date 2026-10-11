import { formatCount } from "../format";
import { PAGE_SIZE_OPTIONS } from "../pagination";
import { controlClass as control } from "./control-class";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  /** Rows on the page being shown; omit while it is loading or failed. */
  itemCount?: number;
  total?: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationControls({
  page,
  pageSize,
  itemCount,
  total,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onPageSizeChange,
}: PaginationControlsProps) {
  const first = (page - 1) * pageSize + 1;
  const range =
    itemCount && total !== undefined
      ? `${formatCount(first)}–${formatCount(first + itemCount - 1)} of ${formatCount(total)}`
      : null;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2 text-muted">
        Rows per page
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className={`${control} text-foreground`}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <p className="ml-auto tabular-nums text-muted" aria-live="polite">
        Page {formatCount(page)}
        {range && <span> · {range}</span>}
      </p>

      <div className="flex gap-2">
        <button type="button" onClick={onPrevious} disabled={!canGoPrevious} className={control}>
          Previous
        </button>
        <button type="button" onClick={onNext} disabled={!canGoNext} className={control}>
          Next
        </button>
      </div>
    </nav>
  );
}
