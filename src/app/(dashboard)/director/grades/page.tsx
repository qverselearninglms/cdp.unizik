"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useDirectorGrades } from "../features/hooks/useDirectorData";
import { DirectorFilterBar } from "../features/components/DirectorFilterBar";
import {
  GradeRadarChart,
  GpaLineChart,
} from "../features/components/charts/DirectorCharts";
import { DataTable, StatusBadge, Column } from "../features/components/DataTable";
import { StudentGradeRecord, CourseGrade } from "../features/types/director.types";

// ─── Grade colours ────────────────────────────────────────────────────────────
const GRADE_COLORS: Record<string, string> = {
  A: "oklch(0.45 0.18 145)",
  B: "oklch(0.35 0.12 250)",
  C: "oklch(0.55 0.18 70)",
  D: "oklch(0.55 0.18 50)",
  E: "oklch(0.50 0.22 28)",
  F: "var(--destructive)",
};

// ─── Columns ──────────────────────────────────────────────────────────────────

const GRADE_COLUMNS: Column<StudentGradeRecord>[] = [
  { key: "expand",       header: "",             width: "36px",  align: "center" }, // handled below via expandable
  { key: "matricNumber", header: "Matric No.",   width: "130px" },
  { key: "studentName",  header: "Name",         width: "170px" },
  { key: "faculty",      header: "Faculty",      width: "140px" },
  { key: "department",   header: "Department",   width: "170px" },
  { key: "level",        header: "Level",        width: "70px",  align: "center",
    render: (r) => `${r.level}L` },
  { key: "semester",     header: "Semester",     width: "90px" },
  { key: "academicYear", header: "Session",      width: "110px" },
  { key: "totalUnits",   header: "Units",        width: "70px",  align: "center" },
  { key: "semesterGPA",  header: "GPA",          width: "80px",  align: "center",
    render: (r) => (
      <span style={{ fontWeight: 700, color: r.semesterGPA >= 4.5 ? GRADE_COLORS.A : r.semesterGPA < 1.5 ? GRADE_COLORS.F : "var(--foreground)" }}>
        {r.semesterGPA.toFixed(2)}
      </span>
    ) },
  { key: "cgpa",         header: "CGPA",         width: "80px",  align: "center",
    render: (r) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.cgpa.toFixed(2)}</span> },
  { key: "status",       header: "Status",       width: "110px", align: "center",
    render: (r) => <StatusBadge status={r.status} /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GradeReportsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    gradeReport: report,
    filter,
    isLoading,
    error,
    setFilter,
    resetFilter,
    refetch,
  } = useDirectorGrades();

  const toggleExpand = (id: string) =>
    setExpandedId((cur) => (cur === id ? null : id));

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Grade Reports</h2>
          <p>Academic performance analytics by semester, faculty, department, and level</p>
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

      {/* KPI */}
      <div className="grade-kpi-row">
        {[
          { label: "Average GPA",     value: report ? report.averageGPA.toFixed(2)     : "—", sub: "out of 5.0",      color: "primary" },
          { label: "Pass Rate",       value: report ? `${report.passRate}%`             : "—", sub: "passed semester", color: "success" },
          { label: "Distinction Rate",value: report ? `${report.distinctionRate}%`      : "—", sub: "GPA ≥ 4.5",       color: "accent"  },
          { label: "Assessed Records",value: report ? report.records.length.toLocaleString(): "—", sub: "student records", color: "warning" },
        ].map((k) => (
          <div key={k.label} className={`grade-kpi-card grade-kpi--${k.color}`}>
            {isLoading ? (
              <div className="kpi-sk" />
            ) : (
              <>
                <span className="gkpi-value">{k.value}</span>
                <span className="gkpi-label">{k.label}</span>
                <span className="gkpi-sub">{k.sub}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Grade Distribution — colour pills */}
      {!isLoading && report && (
        <div className="grade-dist-row">
          {report.gradeDistribution.map((gd) => (
            <div key={gd.grade} className="grade-dist-pill">
              <span className="grade-letter" style={{ color: GRADE_COLORS[gd.grade] }}>
                {gd.grade}
              </span>
              <span className="grade-count">{gd.count.toLocaleString()}</span>
              <span className="grade-pct">{gd.percentage}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="section-divider"><h2>Performance Analytics</h2></div>
      <div className="charts-grid-2">
        <GradeRadarChart data={report?.gradeDistribution ?? []} isLoading={isLoading} />
        <GpaLineChart data={report?.byFaculty ?? []} isLoading={isLoading} />
      </div>

      {/* Faculty GPA table */}
      <div className="section-divider"><h2>GPA by Faculty</h2></div>
      <div className="faculty-gpa-wrap">
        <table className="faculty-gpa-table">
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Students</th>
              <th>Avg GPA</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4].map((j) => (
                      <td key={j}><div className="kpi-sk" /></td>
                    ))}
                  </tr>
                ))
              : (report?.byFaculty ?? []).map((f) => (
                  <tr key={f.faculty}>
                    <td className="fac-name">{f.faculty}</td>
                    <td>{f.studentCount.toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: f.averageGPA >= 3.5 ? GRADE_COLORS.A : f.averageGPA < 2 ? GRADE_COLORS.F : "var(--foreground)" }}>
                        {f.averageGPA.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div className="gpa-bar-wrap">
                        <div
                          className="gpa-bar"
                          style={{ width: `${(f.averageGPA / 5) * 100}%` }}
                        />
                        <span className="gpa-bar-label">{((f.averageGPA / 5) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Filters + Expandable Table */}
      <div className="section-divider"><h2>Student Grade Records</h2></div>
      <DirectorFilterBar
        filter={filter}
        onFilter={(f) => { setFilter(f); refetch({ ...filter, ...f }); }}
        onReset={() => { resetFilter(); refetch(); }}
        onExport={() => alert("Export coming soon!")}
        showSemester
        showLevel
        showStatus
        statusOptions={[
          { label: "Distinction", value: "distinction" },
          { label: "Pass",        value: "pass"        },
          { label: "Probation",   value: "probation"   },
          { label: "Fail",        value: "fail"        },
        ]}
        isLoading={isLoading}
        title="Filter Grade Records"
      />

      {/* Custom expandable table */}
      <div className="expandable-table-wrap">
        <div className="et-scroll">
          <table className="et-table">
            <thead>
              <tr>
                <th style={{ width: 36 }} />
                <th>Matric No.</th>
                <th>Name</th>
                <th>Faculty</th>
                <th>Dept.</th>
                <th style={{ textAlign: "center" }}>Level</th>
                <th>Semester</th>
                <th>Session</th>
                <th style={{ textAlign: "center" }}>Units</th>
                <th style={{ textAlign: "center" }}>GPA</th>
                <th style={{ textAlign: "center" }}>CGPA</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }, (_, i) => (
                    <tr key={i} className="sk-row">
                      {Array.from({ length: 12 }, (__, j) => (
                        <td key={j}><div className="sk-cell" /></td>
                      ))}
                    </tr>
                  ))
                : (report?.records ?? []).length === 0
                ? (
                    <tr>
                      <td colSpan={12} className="et-empty">No records match the selected filters.</td>
                    </tr>
                  )
                : (report?.records ?? []).map((r) => {
                    const isOpen = expandedId === r.studentId;
                    return (
                      <React.Fragment key={r.studentId}>
                        <tr
                          className={`et-row${isOpen ? " expanded" : ""}`}
                          onClick={() => toggleExpand(r.studentId)}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ textAlign: "center" }}>
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </td>
                          <td className="mono">{r.matricNumber}</td>
                          <td>{r.studentName}</td>
                          <td>{r.faculty}</td>
                          <td>{r.department}</td>
                          <td style={{ textAlign: "center" }}>{r.level}L</td>
                          <td>{r.semester}</td>
                          <td>{r.academicYear}</td>
                          <td style={{ textAlign: "center" }}>{r.totalUnits}</td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ fontWeight: 700, color: r.semesterGPA >= 4.5 ? GRADE_COLORS.A : r.semesterGPA < 1.5 ? GRADE_COLORS.F : "var(--foreground)" }}>
                              {r.semesterGPA.toFixed(2)}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>{r.cgpa.toFixed(2)}</td>
                          <td style={{ textAlign: "center" }}>
                            <StatusBadge status={r.status} />
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="course-detail-row">
                            <td colSpan={12}>
                              <div className="course-detail">
                                <p className="course-detail-title">Course Breakdown — {r.studentName}</p>
                                <table className="course-table">
                                  <thead>
                                    <tr>
                                      <th>Code</th>
                                      <th>Title</th>
                                      <th>Units</th>
                                      <th>Score</th>
                                      <th>Grade</th>
                                      <th>Points</th>
                                      <th>Lecturer</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {r.courses.map((c: CourseGrade, ci: number) => (
                                      <tr key={ci}>
                                        <td className="mono">{c.courseCode}</td>
                                        <td>{c.courseTitle}</td>
                                        <td>{c.creditUnits}</td>
                                        <td>{c.score}</td>
                                        <td>
                                          <span style={{ fontWeight: 700, color: GRADE_COLORS[c.grade] }}>
                                            {c.grade}
                                          </span>
                                        </td>
                                        <td>{c.gradePoints}</td>
                                        <td>{c.lecturerName}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

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
        .grade-kpi-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .grade-kpi-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 3px;
          position: relative;
          overflow: hidden;
        }
        .grade-kpi-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 14px 14px 0 0;
        }
        .grade-kpi--primary::before { background: var(--primary); }
        .grade-kpi--success::before { background: oklch(0.55 0.18 145); }
        .grade-kpi--accent::before  { background: var(--accent); }
        .grade-kpi--warning::before { background: oklch(0.72 0.18 70); }

        .gkpi-value { font-size: 1.5rem; font-weight: 700; color: var(--foreground); line-height: 1.1; }
        .gkpi-label { font-size: 0.78rem; font-weight: 600; color: var(--foreground); }
        .gkpi-sub   { font-size: 0.7rem;  color: var(--muted-foreground); }

        /* Grade distribution pills */
        .grade-dist-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .grade-dist-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.6rem 1rem;
          min-width: 64px;
        }
        .grade-letter { font-size: 1.2rem; font-weight: 800; }
        .grade-count  { font-size: 0.85rem; font-weight: 600; color: var(--foreground); }
        .grade-pct    { font-size: 0.7rem;  color: var(--muted-foreground); }

        /* Faculty GPA table */
        .faculty-gpa-wrap {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .faculty-gpa-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .faculty-gpa-table thead tr {
          background: var(--muted);
          border-bottom: 1px solid var(--border);
        }
        .faculty-gpa-table th {
          padding: 0.7rem 1rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
        }
        .faculty-gpa-table td {
          padding: 0.65rem 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--foreground);
        }
        .faculty-gpa-table tr:last-child td { border-bottom: none; }
        .fac-name { font-weight: 500; }
        .gpa-bar-wrap {
          display: flex; align-items: center; gap: 8px;
        }
        .gpa-bar {
          height: 7px;
          border-radius: 99px;
          background: var(--primary);
          min-width: 4px;
          max-width: 200px;
        }
        .gpa-bar-label { font-size: 0.72rem; color: var(--muted-foreground); }

        /* Expandable table */
        .expandable-table-wrap {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .et-scroll { overflow-x: auto; }
        .et-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }
        .et-table thead tr {
          background: var(--muted);
          border-bottom: 1px solid var(--border);
        }
        .et-table th {
          padding: 0.65rem 0.875rem;
          font-weight: 600;
          font-size: 0.7rem;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .et-row td {
          padding: 0.6rem 0.875rem;
          border-bottom: 1px solid var(--border);
          color: var(--foreground);
          vertical-align: middle;
        }
        .et-row:hover td { background: color-mix(in oklch, var(--primary) 4%, transparent); }
        .et-row.expanded td { background: color-mix(in oklch, var(--primary) 6%, transparent); }

        .course-detail-row td { padding: 0 !important; border-bottom: 1px solid var(--border); }
        .course-detail {
          background: color-mix(in oklch, var(--muted) 60%, transparent);
          padding: 1rem 1.25rem;
        }
        .course-detail-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 0.75rem;
        }
        .course-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
        }
        .course-table th {
          padding: 0.45rem 0.75rem;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .course-table td {
          padding: 0.45rem 0.75rem;
          color: var(--foreground);
          border-bottom: 1px solid color-mix(in oklch, var(--border) 50%, transparent);
        }
        .course-table tr:last-child td { border-bottom: none; }
        .mono { font-family: "IBM Plex Mono", monospace; font-size: 0.78rem; }

        .et-empty {
          text-align: center;
          padding: 3rem 1rem !important;
          color: var(--muted-foreground);
          font-style: italic;
        }
        .sk-row td { padding: 0.9rem 0.875rem; }
        .sk-cell {
          height: 13px; border-radius: 4px;
          background: color-mix(in oklch, var(--muted-foreground) 16%, transparent);
          animation: pulse 1.4s ease-in-out infinite;
          width: 80%;
        }
        .kpi-sk {
          height: 14px; border-radius: 4px;
          background: color-mix(in oklch, var(--muted-foreground) 16%, transparent);
          animation: pulse 1.4s ease-in-out infinite;
          width: 65%;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </>
  );
}
