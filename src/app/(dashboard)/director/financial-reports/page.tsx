"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useDirectorFinancial } from "../features/hooks/useDirectorData";
import { DirectorFilterBar } from "../features/components/DirectorFilterBar";
import {
  RevenueBarChart,
  FacultyRevenueChart,
} from "../features/components/charts/DirectorCharts";
import { DataTable, StatusBadge, Column } from "../features/components/DataTable";
import { PaymentRecord } from "../features/types/director.types";

const PAYMENT_STATUS_OPTIONS = [
  { label: "Paid",    value: "paid"    },
  { label: "Partial", value: "partial" },
  { label: "Unpaid",  value: "unpaid"  },
  { label: "Overdue", value: "overdue" },
];

const formatNgn = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const COLUMNS: Column<PaymentRecord>[] = [
  { key: "matricNumber",  header: "Matric No.",   width: "130px" },
  { key: "studentName",   header: "Student Name", width: "180px" },
  { key: "faculty",       header: "Faculty",      width: "140px" },
  { key: "department",    header: "Department",   width: "170px" },
  { key: "level",         header: "Level",        width: "70px",  align: "center",
    render: (r) => `${r.level}L` },
  { key: "semester",      header: "Semester",     width: "90px" },
  { key: "amount",        header: "Expected",     width: "120px", align: "right",
    render: (r) => formatNgn(r.amount) },
  { key: "amountPaid",    header: "Paid",         width: "120px", align: "right",
    render: (r) => <span style={{ color: "oklch(0.45 0.18 145)" }}>{formatNgn(r.amountPaid)}</span> },
  { key: "balance",       header: "Balance",      width: "120px", align: "right",
    render: (r) => <span style={{ color: r.balance > 0 ? "var(--destructive)" : "inherit" }}>{formatNgn(r.balance)}</span> },
  { key: "status",        header: "Status",       width: "100px", align: "center",
    render: (r) => <StatusBadge status={r.status} /> },
  { key: "paymentChannel",header: "Channel",      width: "120px" },
];

export default function FinancialReportsPage() {
  const {
    financialSummary,
    paymentRecords,
    pagination,
    filter,
    isLoading,
    error,
    setFilter,
    resetFilter,
    setPagination,
    refetch,
  } = useDirectorFinancial();

  const summary = financialSummary;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Financial Reports</h2>
          <p>School fees collection status, revenue breakdown, and payment analytics</p>
        </div>
        <button
          className="btn-refresh"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw size={15} className={isLoading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Row */}
      <div className="fin-kpi-row">
        {[
          { label: "Total Expected",    value: summary ? formatNgn(summary.totalExpected)   : "—", color: "var(--foreground)" },
          { label: "Total Collected",   value: summary ? formatNgn(summary.totalCollected)  : "—", color: "oklch(0.45 0.18 145)" },
          { label: "Outstanding",       value: summary ? formatNgn(summary.totalOutstanding): "—", color: "var(--destructive)" },
          { label: "Collection Rate",   value: summary ? `${summary.collectionRate}%`        : "—", color: "var(--primary)" },
        ].map((k) => (
          <div key={k.label} className="fin-kpi-card">
            {isLoading ? (
              <div className="kpi-skeleton" />
            ) : (
              <>
                <span className="kpi-value" style={{ color: k.color }}>{k.value}</span>
                <span className="kpi-label">{k.label}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="section-divider"><h2>Revenue Analytics</h2></div>
      <div className="charts-grid-2">
        <RevenueBarChart
          data={summary?.monthlyTrend ?? []}
          isLoading={isLoading}
        />
        <FacultyRevenueChart
          data={summary?.byFaculty ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* Filter + Table */}
      <div className="section-divider"><h2>Payment Records</h2></div>
      <DirectorFilterBar
        filter={filter}
        onFilter={(f) => { setFilter(f); refetch({ ...filter, ...f }); }}
        onReset={() => { resetFilter(); refetch(); }}
        onExport={() => alert("Export coming soon!")}
        showSemester
        showLevel
        showStatus
        statusOptions={PAYMENT_STATUS_OPTIONS}
        isLoading={isLoading}
        title="Filter Payment Records"
      />

      <DataTable<PaymentRecord>
        columns={COLUMNS}
        data={paymentRecords}
        pagination={pagination}
        onPageChange={(page) => { setPagination({ page }); refetch(); }}
        isLoading={isLoading}
        rowKey={(r) => r.id}
        emptyMessage="No payment records match the selected filters."
      />

      <style jsx>{`
        .btn-refresh {
          display: flex; align-items: center; gap: 6px;
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

        /* KPI Row */
        .fin-kpi-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .fin-kpi-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.1rem 1.25rem;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          overflow: hidden;
        }
        .fin-kpi-card::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--primary);
          opacity: 0.6;
          border-radius: 0 0 14px 14px;
        }
        .kpi-value {
          font-size: 1.35rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .kpi-label {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          font-weight: 500;
        }
        .kpi-skeleton {
          height: 14px;
          border-radius: 4px;
          background: color-mix(in oklch, var(--muted-foreground) 16%, transparent);
          animation: pulse 1.4s ease-in-out infinite;
          width: 70%;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </>
  );
}
