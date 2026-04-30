"use client";

import React, { ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationState } from "../types/director.types";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pagination,
  onPageChange,
  isLoading,
  emptyMessage = "No records found",
  rowKey,
}: DataTableProps<T>) {
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;
  const currentPage = pagination?.page ?? 1;

  return (
    <div className="dt-wrapper">
      <div className="dt-scroll">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, textAlign: col.align || "left" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <tr key={i} className="sk-row">
                    {columns.map((col) => (
                      <td key={col.key}>
                        <div className="sk-cell" style={{ width: col.width || "80%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                  <tr>
                    <td colSpan={columns.length} className="dt-empty">
                      {emptyMessage}
                    </td>
                  </tr>
                )
              : data.map((row, i) => (
                  <tr key={rowKey ? rowKey(row) : i}>
                    {columns.map((col) => (
                      <td key={col.key} style={{ textAlign: col.align || "left" }}>
                        {col.render ? col.render(row) : row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && totalPages > 1 && (
        <div className="dt-pagination">
          <span className="dt-info">
            Showing {Math.min((currentPage - 1) * pagination.pageSize + 1, pagination.total)}–
            {Math.min(currentPage * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total.toLocaleString()} records
          </span>
          <div className="dt-nav">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="dt-btn" title="First">
              <ChevronsLeft size={14} />
            </button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="dt-btn" title="Prev">
              <ChevronLeft size={14} />
            </button>
            <span className="dt-page">{currentPage} / {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="dt-btn" title="Next">
              <ChevronRight size={14} />
            </button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="dt-btn" title="Last">
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .dt-wrapper {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .dt-scroll { overflow-x: auto; }
        .dt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .dt-table thead tr {
          background: var(--muted);
          border-bottom: 1px solid var(--border);
        }
        .dt-table th {
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 0.75rem;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .dt-table tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.12s;
        }
        .dt-table tbody tr:hover { background: color-mix(in oklch, var(--primary) 4%, transparent); }
        .dt-table tbody tr:last-child { border-bottom: none; }
        .dt-table td {
          padding: 0.7rem 1rem;
          color: var(--foreground);
          vertical-align: middle;
        }
        .dt-empty {
          text-align: center;
          padding: 3rem 1rem !important;
          color: var(--muted-foreground);
          font-style: italic;
        }
        /* Skeleton */
        .sk-row td { padding: 0.9rem 1rem; }
        .sk-cell {
          height: 14px;
          border-radius: 4px;
          background: color-mix(in oklch, var(--muted-foreground) 18%, transparent);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Pagination */
        .dt-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .dt-info { font-size: 0.78rem; color: var(--muted-foreground); }
        .dt-nav { display: flex; align-items: center; gap: 4px; }
        .dt-btn {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--background);
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.12s;
        }
        .dt-btn:hover:not(:disabled) {
          background: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
        }
        .dt-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .dt-page {
          padding: 0 10px;
          font-size: 0.8rem;
          color: var(--muted-foreground);
          min-width: 60px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  paid:        { bg: "oklch(0.55 0.18 145 / 15%)", color: "oklch(0.45 0.18 145)" },
  partial:     { bg: "oklch(0.72 0.18 70 / 15%)",  color: "oklch(0.55 0.18 70)"  },
  unpaid:      { bg: "oklch(0.55 0.22 28 / 15%)",  color: "oklch(0.50 0.22 28)"  },
  overdue:     { bg: "oklch(0.55 0.22 28 / 25%)",  color: "oklch(0.45 0.22 28)"  },
  active:      { bg: "oklch(0.55 0.18 145 / 15%)", color: "oklch(0.45 0.18 145)" },
  deferred:    { bg: "oklch(0.72 0.18 70 / 15%)",  color: "oklch(0.55 0.18 70)"  },
  graduated:   { bg: "oklch(0.35 0.12 250 / 15%)", color: "oklch(0.35 0.12 250)" },
  withdrawn:   { bg: "oklch(0.55 0.22 28 / 15%)",  color: "oklch(0.50 0.22 28)"  },
  pass:        { bg: "oklch(0.55 0.18 145 / 15%)", color: "oklch(0.45 0.18 145)" },
  distinction: { bg: "oklch(0.35 0.12 250 / 15%)", color: "oklch(0.35 0.12 250)" },
  probation:   { bg: "oklch(0.72 0.18 70 / 15%)",  color: "oklch(0.55 0.18 70)"  },
  fail:        { bg: "oklch(0.55 0.22 28 / 20%)",  color: "oklch(0.50 0.22 28)"  },
  "on-leave":  { bg: "oklch(0.72 0.18 70 / 15%)",  color: "oklch(0.55 0.18 70)"  },
  sabbatical:  { bg: "oklch(0.60 0.20 45 / 15%)",  color: "oklch(0.50 0.20 45)"  },
  retired:     { bg: "oklch(0.50 0.05 250 / 15%)", color: "oklch(0.50 0.05 250)" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: "var(--muted)", color: "var(--muted-foreground)" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        textTransform: "capitalize",
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
}
