"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { EnrollmentDataPoint, FacultyDistribution, GradeDistribution } from "../../types/director.types";

// ─── Token Colors ─────────────────────────────────────────────────────────────
// Matches the CSS variables in the theme; safe to hardcode as OKLCH values.
const C = {
  primary: "oklch(0.35 0.12 250)",
  accent: "oklch(0.60 0.20 45)",
  success: "oklch(0.55 0.18 145)",
  warning: "oklch(0.72 0.18 70)",
  danger: "oklch(0.55 0.22 28)",
  muted: "oklch(0.50 0.05 250)",
  chart1: "oklch(0.378 0.072 258.5)",
  chart2: "oklch(0.625 0.072 78.0)",
  chart3: "oklch(0.685 0.165 45.0)",
  chart4: "oklch(0.577 0.215 27.325)",
  chart5: "oklch(0.545 0.062 258.5)",
};

const PALETTE = [C.primary, C.accent, C.success, C.warning, C.danger, C.chart2];

const toNgn = (v: number) =>
  `₦${(v / 1_000_000).toFixed(1)}M`;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="tooltip-item" style={{ color: p.color }}>
          <span>{p.name}: </span>
          <strong>{formatter ? formatter(p.value) : p.value.toLocaleString()}</strong>
        </p>
      ))}
      <style jsx>{`
        .chart-tooltip {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.8rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .tooltip-label {
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--foreground);
        }
        .tooltip-item {
          margin: 2px 0;
        }
      `}</style>
    </div>
  );
};

// ─── Enrollment Area Chart ────────────────────────────────────────────────────

interface EnrollmentChartProps {
  data: EnrollmentDataPoint[];
  isLoading?: boolean;
}

export function EnrollmentAreaChart({ data, isLoading }: EnrollmentChartProps) {
  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3 className="chart-title">Enrollment Trend</h3>
        <span className="chart-subtitle">12-month rolling · 2024/2025</span>
      </div>
      {isLoading ? (
        <div className="chart-skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEnroll" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "0.78rem" }} />
            <Area type="monotone" dataKey="students" name="Total Students" stroke={C.primary} strokeWidth={2} fill="url(#gradStudents)" />
            <Area type="monotone" dataKey="newEnrollments" name="New Enrollments" stroke={C.accent} strokeWidth={2} fill="url(#gradEnroll)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <ChartStyles />
    </div>
  );
}

// ─── Faculty Distribution Pie Chart ──────────────────────────────────────────

interface FacultyPieChartProps {
  data: FacultyDistribution[];
  isLoading?: boolean;
}

export function FacultyPieChart({ data, isLoading }: FacultyPieChartProps) {
  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3 className="chart-title">Faculty Distribution</h3>
        <span className="chart-subtitle">Students per faculty</span>
      </div>
      {isLoading ? (
        <div className="chart-skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="students"
              nameKey="faculty"
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: any, n: any) => [`${v.toLocaleString()} students`, n]}
            />
            <Legend
              wrapperStyle={{ fontSize: "0.72rem" }}
              formatter={(val) => val.length > 18 ? val.slice(0, 16) + "…" : val}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
      <ChartStyles />
    </div>
  );
}

// ─── Monthly Revenue Bar Chart ────────────────────────────────────────────────

interface RevenueBarChartProps {
  data: { month: string; collected: number; expected: number }[];
  isLoading?: boolean;
}

export function RevenueBarChart({ data, isLoading }: RevenueBarChartProps) {
  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3 className="chart-title">Monthly Revenue vs Target</h3>
        <span className="chart-subtitle">₦ Millions collected per month</span>
      </div>
      {isLoading ? (
        <div className="chart-skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `₦${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip formatter={toNgn} />} />
            <Legend wrapperStyle={{ fontSize: "0.78rem" }} />
            <Bar dataKey="expected" name="Expected" fill={C.muted} radius={[4, 4, 0, 0]} opacity={0.4} />
            <Bar dataKey="collected" name="Collected" fill={C.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <ChartStyles />
    </div>
  );
}

// ─── Faculty Revenue Bar Chart ────────────────────────────────────────────────

interface FacultyRevenueChartProps {
  data: { faculty: string; expected: number; collected: number; outstanding: number }[];
  isLoading?: boolean;
}

export function FacultyRevenueChart({ data, isLoading }: FacultyRevenueChartProps) {
  const slim = data.map((d) => ({ ...d, faculty: d.faculty.split(" ")[0] }));
  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3 className="chart-title">Revenue by Faculty</h3>
        <span className="chart-subtitle">Collection breakdown per faculty</span>
      </div>
      {isLoading ? (
        <div className="chart-skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={slim} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `₦${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="faculty" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip formatter={toNgn} />} />
            <Legend wrapperStyle={{ fontSize: "0.78rem" }} />
            <Bar dataKey="collected" name="Collected" fill={C.primary} radius={[0, 4, 4, 0]} stackId="a" />
            <Bar dataKey="outstanding" name="Outstanding" fill={C.accent} radius={[0, 4, 4, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      )}
      <ChartStyles />
    </div>
  );
}

// ─── Grade Distribution Radar ─────────────────────────────────────────────────

interface GradeRadarChartProps {
  data: GradeDistribution[];
  isLoading?: boolean;
}

export function GradeRadarChart({ data, isLoading }: GradeRadarChartProps) {
  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3 className="chart-title">Grade Distribution</h3>
        <span className="chart-subtitle">Spread of grades across all courses</span>
      </div>
      {isLoading ? (
        <div className="chart-skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="grade" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <PolarRadiusAxis angle={30} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Radar name="Students" dataKey="count" stroke={C.primary} fill={C.primary} fillOpacity={0.35} strokeWidth={2} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      )}
      <ChartStyles />
    </div>
  );
}

// ─── GPA by Faculty Line Chart ────────────────────────────────────────────────

interface GpaLineChartProps {
  data: { faculty: string; averageGPA: number; studentCount: number }[];
  isLoading?: boolean;
}

export function GpaLineChart({ data, isLoading }: GpaLineChartProps) {
  const slim = data.map((d) => ({ ...d, faculty: d.faculty.split(" ")[0] }));
  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3 className="chart-title">Average GPA by Faculty</h3>
        <span className="chart-subtitle">5.0 scale · current session</span>
      </div>
      {isLoading ? (
        <div className="chart-skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={slim} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="faculty" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="averageGPA"
              name="Avg GPA"
              stroke={C.primary}
              strokeWidth={2.5}
              dot={{ fill: C.primary, r: 4 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <ChartStyles />
    </div>
  );
}

// ─── Gender Pie Chart ─────────────────────────────────────────────────────────

interface GenderPieChartProps {
  male: number;
  female: number;
  title?: string;
  isLoading?: boolean;
}

export function GenderPieChart({ male, female, title = "Gender Distribution", isLoading }: GenderPieChartProps) {
  const data = [
    { name: "Male", value: male },
    { name: "Female", value: female },
  ];
  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <span className="chart-subtitle">{(male + female).toLocaleString()} total</span>
      </div>
      {isLoading ? (
        <div className="chart-skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              <Cell fill={C.primary} />
              <Cell fill={C.accent} />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
      <ChartStyles />
    </div>
  );
}

// ─── Shared Chart Styles ──────────────────────────────────────────────────────

function ChartStyles() {
  return (
    <style jsx global>{`
      .chart-wrap {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1.25rem;
        // height: 100%;
        margin-bottom: 3.5rem;  
      }
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 4px;
      }
      .chart-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--foreground);
        margin: 0;
      }
      .chart-subtitle {
        font-size: 0.75rem;
        color: var(--muted-foreground);
      }
      .chart-skeleton {
        height: 280px;
        border-radius: 8px;
        background: color-mix(in oklch, var(--muted-foreground) 12%, transparent);
        animation: pulse 1.4s ease-in-out infinite;
      }
    `}</style>
  );
}
