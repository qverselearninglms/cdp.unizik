"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw, Users, BookOpen } from "lucide-react";
import { DataTable, StatusBadge, Column } from "../features/components/DataTable";
import {
  StudentRecord,
  LecturerRecord,
} from "../features/types/director.types";
import { DirectorFilterBar, GenderPieChart, useDirectorStatistical } from "../features";

// ─── Table Columns ────────────────────────────────────────────────────────────

const STUDENT_COLUMNS: Column<StudentRecord>[] = [
  { key: "matricNumber", header: "Matric No.",   width: "130px" },
  { key: "fullName",     header: "Name",         width: "170px" },
  { key: "gender",       header: "Gender",       width: "80px", align: "center" },
  { key: "faculty",      header: "Faculty",      width: "140px" },
  { key: "department",   header: "Department",   width: "170px" },
  { key: "level",        header: "Level",        width: "70px",  align: "center",
    render: (r) => `${r.level}L` },
  { key: "academicYear", header: "Session",      width: "110px" },
  { key: "cgpa",         header: "CGPA",         width: "80px",  align: "center",
    render: (r) => (
      <span style={{ fontWeight: 600, color: r.cgpa >= 4.5 ? "oklch(0.45 0.18 145)" : r.cgpa < 2 ? "var(--destructive)" : "var(--foreground)" }}>
        {r.cgpa.toFixed(2)}
      </span>
    ) },
  { key: "status", header: "Status", width: "100px", align: "center",
    render: (r) => <StatusBadge status={r.status} /> },
];

const LECTURER_COLUMNS: Column<LecturerRecord>[] = [
  { key: "staffId",      header: "Staff ID",     width: "110px" },
  { key: "fullName",     header: "Name",         width: "170px" },
  { key: "gender",       header: "Gender",       width: "80px",  align: "center" },
  { key: "faculty",      header: "Faculty",      width: "140px" },
  { key: "department",   header: "Department",   width: "170px" },
  { key: "designation",  header: "Designation",  width: "160px" },
  { key: "studentsCount",header: "Students",     width: "90px",  align: "center",
    render: (r) => r.studentsCount.toLocaleString() },
  { key: "yearsOfService",header: "Years",       width: "70px",  align: "center" },
  { key: "status", header: "Status", width: "100px", align: "center",
    render: (r) => <StatusBadge status={r.status} /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "students" | "lecturers";

export default function StatisticalReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("students");

  const {
    statisticalReport: report,
    filter,
    isLoading,
    error,
    setFilter,
    resetFilter,
    refetch,
  } = useDirectorStatistical();

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Statistical Reports</h2>
          <p>Population analytics, gender ratios, and profiles for students & lecturers</p>
        </div>
        <button className="btn-refresh" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw size={15} className={isLoading ? "spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <AlertTriangle size={16} /><span>{error}</span>
        </div>
      )}

      {/* KPI Summary */}
      <div className="stat-kpi-row">
        {[
          { label: "Total Students",  value: report?.totalStudents.toLocaleString()  ?? "—", icon: <Users size={18} />,    color: "primary" },
          { label: "Total Lecturers", value: report?.totalLecturers.toLocaleString() ?? "—", icon: <BookOpen size={18} />, color: "accent"  },
          { label: "Male Students",   value: report?.studentsByGender.male.toLocaleString() ?? "—", icon: <Users size={18} />, color: "success" },
          { label: "Female Students", value: report?.studentsByGender.female.toLocaleString() ?? "—", icon: <Users size={18} />, color: "warning" },
        ].map((k) => (
          <div key={k.label} className={`stat-kpi-card stat-kpi-card--${k.color}`}>
            {isLoading ? (
              <div className="kpi-skeleton" />
            ) : (
              <>
                <div className="stat-icon">{k.icon}</div>
                <span className="stat-value">{k.value}</span>
                <span className="stat-label">{k.label}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Level Distribution */}
      {report && (
        <>
          <div className="section-divider"><h2>Level Distribution</h2></div>
          <div className="level-grid">
            {Object.entries(report.studentsByLevel).map(([level, count]) => {
              const total = Object.values(report.studentsByLevel).reduce((a, v) => a + v, 0);
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
              return (
                <div key={level} className="level-card">
                  <span className="level-label">{level}L</span>
                  <div className="level-bar-wrap">
                    <div className="level-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="level-count">{count.toLocaleString()}</span>
                  <span className="level-pct">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Charts */}
      <div className="section-divider"><h2>Demographics</h2></div>
      <div className="charts-grid-2">
        <GenderPieChart
          male={report?.studentsByGender.male ?? 0}
          female={report?.studentsByGender.female ?? 0}
          title="Student Gender Distribution"
          isLoading={isLoading}
        />

        {/* Designation breakdown */}
        <div className="chart-wrap">
          <div className="chart-header">
            <h3 className="chart-title">Lecturer Designations</h3>
            <span className="chart-subtitle">{report?.totalLecturers ?? "—"} total staff</span>
          </div>
          {isLoading ? (
            <div className="chart-skeleton" />
          ) : (
            <div className="designation-list">
              {Object.entries(report?.lecturersByDesignation ?? {})
                .sort((a, b) => b[1] - a[1])
                .map(([desig, count]) => {
                  const total = Object.values(report?.lecturersByDesignation ?? {}).reduce((a, v) => a + v, 0);
                  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                  return (
                    <div key={desig} className="desig-row">
                      <span className="desig-name">{desig}</span>
                      <div className="desig-bar-wrap">
                        <div className="desig-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="desig-count">{count}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="section-divider"><h2>Detailed Records</h2></div>

      <div className="tab-bar">
        <button
          className={`tab-btn${activeTab === "students" ? " active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <Users size={15} /> Students ({report?.totalStudents.toLocaleString() ?? 0})
        </button>
        <button
          className={`tab-btn${activeTab === "lecturers" ? " active" : ""}`}
          onClick={() => setActiveTab("lecturers")}
        >
          <BookOpen size={15} /> Lecturers ({report?.totalLecturers.toLocaleString() ?? 0})
        </button>
      </div>

      <DirectorFilterBar
        filter={filter}
        onFilter={(f) => { setFilter(f); refetch({ ...filter, ...f }); }}
        onReset={() => { resetFilter(); refetch(); }}
        onExport={() => alert("Export coming soon!")}
        showSemester={false}
        showLevel={activeTab === "students"}
        showStatus
        statusOptions={
          activeTab === "students"
            ? [{ label: "Active", value: "active" }, { label: "Deferred", value: "deferred" }, { label: "Graduated", value: "graduated" }, { label: "Withdrawn", value: "withdrawn" }]
            : [{ label: "Active", value: "active" }, { label: "On Leave", value: "on-leave" }, { label: "Sabbatical", value: "sabbatical" }]
        }
        isLoading={isLoading}
        title={`Filter ${activeTab === "students" ? "Students" : "Lecturers"}`}
      />

      {activeTab === "students" ? (
        <DataTable<StudentRecord>
          columns={STUDENT_COLUMNS}
          data={report?.students ?? []}
          isLoading={isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No students match the selected filters."
        />
      ) : (
        <DataTable<LecturerRecord>
          columns={LECTURER_COLUMNS}
          data={report?.lecturers ?? []}
          isLoading={isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No lecturers match the selected filters."
        />
      )}

      <style jsx>{`
        .btn-refresh {
          display: flex; align-items: center; gap: 6px;
          padding: 0.5rem 1rem; border-radius: 8px;
          border: 1px solid var(--border); background: var(--card);
          color: var(--foreground); font-size: 0.8125rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
        }
        .btn-refresh:hover:not(:disabled) { background: var(--muted); }
        .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { to { transform: rotate(360deg); } }

        /* KPI */
        .stat-kpi-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .stat-kpi-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-height: 90px;
        }
        .stat-icon { margin-bottom: 4px; }
        .stat-kpi-card--primary .stat-icon { color: var(--primary); }
        .stat-kpi-card--accent  .stat-icon { color: var(--accent); }
        .stat-kpi-card--success .stat-icon { color: oklch(0.45 0.18 145); }
        .stat-kpi-card--warning .stat-icon { color: oklch(0.50 0.18 70); }
        .stat-value { font-size: 1.45rem; font-weight: 700; color: var(--foreground); line-height: 1; }
        .stat-label { font-size: 0.75rem; color: var(--muted-foreground); font-weight: 500; }
        .kpi-skeleton {
          height: 14px; border-radius: 4px;
          background: color-mix(in oklch, var(--muted-foreground) 16%, transparent);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Level grid */
        .level-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .level-card {
          display: grid;
          grid-template-columns: 36px 1fr 60px 50px;
          align-items: center;
          gap: 12px;
        }
        .level-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
        }
        .level-bar-wrap {
          height: 8px;
          background: color-mix(in oklch, var(--muted-foreground) 15%, transparent);
          border-radius: 99px;
          overflow: hidden;
        }
        .level-bar {
          height: 100%;
          background: var(--primary);
          border-radius: 99px;
          transition: width 0.4s ease;
          min-width: 4px;
        }
        .level-count { font-size: 0.8rem; font-weight: 600; text-align: right; }
        .level-pct { font-size: 0.72rem; color: var(--muted-foreground); }

        /* Designation list */
        .chart-wrap {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.25rem;
          height: 100%;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1rem;
          gap: 4px;
        }
        .chart-title { font-size: 0.9375rem; font-weight: 600; color: var(--foreground); margin: 0; }
        .chart-subtitle { font-size: 0.75rem; color: var(--muted-foreground); }
        .chart-skeleton {
          height: 260px;
          border-radius: 8px;
          background: color-mix(in oklch, var(--muted-foreground) 12%, transparent);
          animation: pulse 1.4s ease-in-out infinite;
        }
        .designation-list { display: flex; flex-direction: column; gap: 10px; padding-top: 8px; }
        .desig-row { display: grid; grid-template-columns: 1fr 140px 40px; align-items: center; gap: 12px; }
        .desig-name { font-size: 0.8rem; color: var(--foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .desig-bar-wrap { height: 6px; background: color-mix(in oklch, var(--muted-foreground) 15%, transparent); border-radius: 99px; overflow: hidden; }
        .desig-bar { height: 100%; background: var(--accent); border-radius: 99px; min-width: 4px; }
        .desig-count { font-size: 0.8rem; font-weight: 600; text-align: right; color: var(--muted-foreground); }

        /* Tabs */
        .tab-bar {
          display: flex;
          gap: 4px;
          background: var(--muted);
          border-radius: 10px;
          padding: 4px;
          width: fit-content;
          margin-bottom: 1rem;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.45rem 1rem;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: var(--muted-foreground);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .tab-btn.active {
          background: var(--card);
          color: var(--primary);
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .tab-btn:not(.active):hover { color: var(--foreground); }
      `}</style>
    </>
  );
}
