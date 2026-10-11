const COLUMNS = [
  { key: "timestamp", label: "Time", className: "w-44" },
  { key: "agent", label: "Agent", className: "" },
  { key: "tool", label: "Tool", className: "" },
  { key: "status", label: "Status", className: "w-28" },
  { key: "latency", label: "Latency", className: "w-28 text-right" },
] as const;

// Deterministic widths so server and client render identical skeletons.
const SKELETON_WIDTHS = ["w-32", "w-24", "w-28", "w-16", "w-12", "w-36", "w-20"];

/**
 * Static table frame. For now it only renders placeholder rows;
 * the next step swaps them for real events.
 */
export function EventsTable({ skeletonRows = 12 }: { skeletonRows?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
        <caption className="sr-only">Agent tool-call events</caption>
        <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-2.5 font-medium ${column.className}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody aria-busy="true">
          {Array.from({ length: skeletonRows }, (_, row) => (
            <tr key={row} className="border-t border-border">
              {COLUMNS.map((column, col) => (
                <td key={column.key} className="px-4 py-3">
                  <div
                    className={`h-3.5 animate-pulse rounded bg-border ${
                      SKELETON_WIDTHS[(row + col * 3) % SKELETON_WIDTHS.length]
                    } ${col === COLUMNS.length - 1 ? "ml-auto" : ""}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
