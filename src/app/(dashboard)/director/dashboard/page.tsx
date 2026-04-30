"use client";

import React from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useDirectorOverview } from "../features/hooks/useDirectorData";
import { MetricsGrid } from "../features/components/MetricCard";
import {
  EnrollmentAreaChart,
  FacultyPieChart,
} from "../features/components/charts/DirectorCharts";

export default function DirectorDashboardPage() {
  const {
    overview,
    enrollmentData,
    facultyDistribution,
    isLoading,
    error,
    refetch,
  } = useDirectorOverview();

  
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Overview</h2>
          <p>University-wide summary for the 2024/2025 academic session</p>
        </div>
        <button
          className="btn-refresh"
          onClick={refetch}
          disabled={isLoading}
          aria-label="Refresh dashboard"
        >
          <RefreshCw size={15} className={isLoading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button className="retry-link" onClick={refetch}>Retry</button>
        </div>
      )}

      {/* Metric Cards */}
      <MetricsGrid
        metrics={overview?.metrics ?? []}
        isLoading={isLoading}
      />

      {/* Summary Stats Row */}
      {!isLoading && overview && (
        <div className="summary-row">
          <SummaryBadge
            label="Active Programs"
            value={overview.activePrograms}
            color="primary"
          />
          <SummaryBadge
            label="Graduation Rate"
            value={`${overview.graduationRate}%`}
            color="success"
          />
          <SummaryBadge
            label="Collection Rate"
            value={
              overview.totalRevenue && overview.pendingPayments
                ? `${((overview.totalRevenue / (overview.totalRevenue + overview.pendingPayments)) * 100).toFixed(1)}%`
                : "—"
            }
            color="accent"
          />
          <SummaryBadge
            label="Total Faculties"
            value={8}
            color="warning"
          />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="section-divider"><h2>Trends & Distribution</h2></div>
      <div className="charts-grid-2">
        <EnrollmentAreaChart data={enrollmentData} isLoading={isLoading} />
        <FacultyPieChart data={facultyDistribution} isLoading={isLoading} />
      </div>

      {/* Faculty Breakdown Table */}
      <div className="section-divider"><h2>Faculty Breakdown</h2></div>
      <div className="faculty-breakdown">
        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Students</th>
              <th>Lecturers</th>
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4].map((j) => (
                      <td key={j}><div className="sk-cell" /></td>
                    ))}
                  </tr>
                ))
              : facultyDistribution.map((f) => (
                  <tr key={f.faculty}>
                    <td className="faculty-name">{f.faculty}</td>
                    <td className="num">{f.students.toLocaleString()}</td>
                    <td className="num">{f.lecturers}</td>
                    <td>
                      <div className="progress-wrap">
                        <div
                          className="progress-bar"
                          style={{ width: `${f.percentage}%` }}
                        />
                        <span className="progress-label">{f.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--foreground);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-refresh:hover:not(:disabled) { background: var(--muted); }
        .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { to { transform: rotate(360deg); } }

        .retry-link {
          background: none;
          border: none;
          color: var(--destructive);
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
          margin-left: 8px;
          font-size: 0.85rem;
        }

        /* Summary badges */
        .summary-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        /* Faculty table */
        .faculty-breakdown {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .breakdown-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .breakdown-table thead tr {
          background: var(--muted);
          border-bottom: 1px solid var(--border);
        }
        .breakdown-table th {
          padding: 0.7rem 1rem;
          font-weight: 600;
          font-size: 0.72rem;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
        }
        .breakdown-table td {
          padding: 0.65rem 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--foreground);
          vertical-align: middle;
        }
        .breakdown-table tr:last-child td { border-bottom: none; }
        .breakdown-table tr:hover td { background: color-mix(in oklch, var(--primary) 4%, transparent); }

        .faculty-name { font-weight: 500; }
        .num { font-variant-numeric: tabular-nums; }

        .progress-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .progress-bar {
          height: 6px;
          border-radius: 99px;
          background: var(--primary);
          min-width: 4px;
          max-width: 140px;
          transition: width 0.3s ease;
        }
        .progress-label {
          font-size: 0.72rem;
          color: var(--muted-foreground);
          white-space: nowrap;
        }

        .sk-cell {
          height: 14px;
          border-radius: 4px;
          background: color-mix(in oklch, var(--muted-foreground) 16%, transparent);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </>
  );
}

// ─── Summary Badge ────────────────────────────────────────────────────────────

function SummaryBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "primary" | "accent" | "success" | "warning";
}) {
  const bg = {
    primary: "color-mix(in oklch, var(--primary) 10%, transparent)",
    accent:  "color-mix(in oklch, var(--accent) 10%, transparent)",
    success: "oklch(0.55 0.18 145 / 12%)",
    warning: "oklch(0.72 0.18 70 / 12%)",
  }[color];
  const fg = {
    primary: "var(--primary)",
    accent:  "var(--accent)",
    success: "oklch(0.40 0.18 145)",
    warning: "oklch(0.50 0.18 70)",
  }[color];

  return (
    <div
      style={{
        background: bg,
        borderRadius: "10px",
        padding: "0.75rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <span style={{ fontSize: "1.25rem", fontWeight: 700, color: fg }}>
        {value}
      </span>
      <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}
