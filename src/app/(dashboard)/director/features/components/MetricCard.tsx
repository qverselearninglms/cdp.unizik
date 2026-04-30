"use client";

import React from "react";
import {
  Users, BookOpen, Banknote, AlertCircle,
  GraduationCap, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { DashboardMetric } from "../types/director.types";

const ICON_MAP: Record<string, React.FC<any>> = {
  users: Users,
  "book-open": BookOpen,
  banknote: Banknote,
  "alert-circle": AlertCircle,
  "graduation-cap": GraduationCap,
  "trending-up": TrendingUp,
};

interface MetricCardProps {
  metric: DashboardMetric;
  isLoading?: boolean;
  accentColor?: "primary" | "accent" | "success" | "warning" | "danger";
}

export function MetricCard({ metric, isLoading, accentColor = "primary" }: MetricCardProps) {
  const Icon = ICON_MAP[metric.icon] || TrendingUp;
  const TrendIcon =
    metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    metric.trend === "up" ? "var(--success, #22c55e)" :
    metric.trend === "down" ? "var(--destructive)" : "var(--muted-foreground)";

  return (
    <div className={`metric-card metric-card--${accentColor}`}>
      {isLoading ? (
        <div className="metric-skeleton">
          <div className="sk sk-icon" />
          <div className="sk sk-value" />
          <div className="sk sk-label" />
        </div>
      ) : (
        <>
          <div className="metric-icon-wrap">
            <Icon size={20} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{metric.value}</span>
            <span className="metric-label">{metric.label}</span>
          </div>
          <div className="metric-trend">
            <TrendIcon size={13} style={{ color: trendColor }} />
            <span className="trend-value" style={{ color: trendColor }}>
              {metric.change > 0 ? "+" : ""}
              {metric.change}%
            </span>
            <span className="trend-label">{metric.changeLabel}</span>
          </div>
        </>
      )}

      <style jsx>{`
        .metric-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .metric-card:hover {
          box-shadow: 0 4px 20px color-mix(in oklch, var(--primary) 12%, transparent);
          transform: translateY(-1px);
        }
        .metric-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 14px 14px 0 0;
        }
        .metric-card--primary::before { background: var(--primary); }
        .metric-card--accent::before  { background: var(--accent); }
        .metric-card--success::before { background: oklch(0.55 0.18 145); }
        .metric-card--warning::before { background: oklch(0.72 0.18 70); }
        .metric-card--danger::before  { background: var(--destructive); }

        .metric-icon-wrap {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: color-mix(in oklch, var(--primary) 12%, transparent);
          display: flex; align-items: center; justify-content: center;
        }
        .metric-icon { color: var(--primary); }
        .metric-card--accent .metric-icon-wrap {
          background: color-mix(in oklch, var(--accent) 12%, transparent);
        }
        .metric-card--accent .metric-icon { color: var(--accent); }

        .metric-body { display: flex; flex-direction: column; gap: 2px; }
        .metric-value {
          font-size: 1.65rem;
          font-weight: 700;
          color: var(--foreground);
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .metric-label {
          font-size: 0.78rem;
          color: var(--muted-foreground);
          font-weight: 500;
        }
        .metric-trend {
          display: flex; align-items: center; gap: 4px;
          margin-top: 4px;
        }
        .trend-value {
          font-size: 0.78rem;
          font-weight: 600;
        }
        .trend-label {
          font-size: 0.72rem;
          color: var(--muted-foreground);
        }

        /* Skeleton */
        .metric-skeleton { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; }
        .sk {
          border-radius: 6px;
          background: color-mix(in oklch, var(--muted-foreground) 18%, transparent);
          animation: pulse 1.4s ease-in-out infinite;
        }
        .sk-icon  { width: 40px; height: 40px; border-radius: 10px; }
        .sk-value { width: 80px; height: 28px; }
        .sk-label { width: 120px; height: 14px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ─── Metrics Grid ─────────────────────────────────────────────────────────────

interface MetricsGridProps {
  metrics: DashboardMetric[];
  isLoading?: boolean;
}

const ACCENT_CYCLE: MetricCardProps["accentColor"][] = [
  "primary", "accent", "success", "warning", "danger", "primary",
];

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  const items = isLoading
    ? Array.from({ length: 6 }, (_, i) => ({
        label: "", value: 0, change: 0, changeLabel: "", icon: "users", trend: "neutral" as const,
      }))
    : metrics;

  return (
    <div className="metrics-grid">
      {items.map((m, i) => (
        <MetricCard
          key={m.label || i}
          metric={m}
          isLoading={isLoading}
          accentColor={ACCENT_CYCLE[i % ACCENT_CYCLE.length]}
        />
      ))}
      <style jsx>{`
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}
