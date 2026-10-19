import clsx from "clsx";

import EmptyState from "./EmptyState";

/**
 * Shared data table. Columns:
 *   { key, header, render?(row), className?, headerClassName?, sortable? }
 *
 * Every module from M3 on renders through this, so loading and empty states
 * look the same everywhere rather than being reinvented per page.
 */
export default function Table({
  columns,
  rows,
  rowKey = (row, i) => row.id ?? i,
  loading = false,
  skeletonRows = 6,
  empty,
  onRowClick,
  sort,
  onSortChange,
  className,
}) {
  const showEmpty = !loading && (!rows || rows.length === 0);

  const handleSort = (col) => {
    if (!col.sortable || !onSortChange) return;
    const isCurrent = sort?.key === col.key;
    onSortChange({ key: col.key, dir: isCurrent && sort.dir === "asc" ? "desc" : "asc" });
  };

  return (
    <div className={clsx("overflow-x-auto rounded-sm border border-white/10", className)}>
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[#191920]/95 backdrop-blur">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                onClick={() => handleSort(col)}
                className={clsx(
                  "whitespace-nowrap px-4 py-3 text-left font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-slate-500",
                  col.sortable && onSortChange && "cursor-pointer select-none hover:text-slate-200",
                  col.headerClassName,
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sort?.key === col.key && (
                    <span aria-hidden="true">{sort.dir === "asc" ? "▲" : "▼"}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/[0.07] bg-[#101016]">
          {loading &&
            Array.from({ length: skeletonRows }).map((_, r) => (
              <tr key={`skeleton-${r}`} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-3">
                    <div className="h-3 w-full max-w-[10rem] rounded-sm bg-white/[0.07]" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows?.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx(
                  "even:bg-white/[0.015]",
                  onRowClick && "cursor-pointer hover:bg-violet-400/[0.06]",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx("px-4 py-3 align-middle text-slate-300", col.className)}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}

          {showEmpty && (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {empty ?? <EmptyState />}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
