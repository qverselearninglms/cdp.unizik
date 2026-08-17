'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Clock, Wallet } from 'lucide-react';
import type { Enrollment } from '@/lib/services/studentService';

/**
 * Payments, in three passes: the headline ratio, then per-fee progress, then
 * the numbers themselves. Each fee is a meter — a filled bar against a
 * same-ramp track — so the fills carry magnitude and never stand in for
 * identity. Every bar is labelled and every figure repeats in the table, which
 * is what lets the recessive track stay recessive.
 */

const PAID_FILL = 'var(--chart-1)';
const TRACK_FILL = 'var(--muted)';

const naira = (value: number) =>
  `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const compact = (value: number) => {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value}`;
};

export interface FeeRow {
  key: string;
  feeLabel: string;
  programName: string;
  paid: number;
  outstanding: number;
  total: number;
  status: string;
  pctPaid: number;
}

export const buildFeeRows = (enrollments: Enrollment[]): FeeRow[] =>
  enrollments.flatMap((enrollment, index) =>
    enrollment.fees
      .filter((fee) => fee.amount != null && fee.amount > 0)
      .map((fee) => {
        const total = fee.amount as number;
        const paid = Math.min(fee.paid, total);
        return {
          key: `${enrollment.id}-${fee.key}-${index}`,
          feeLabel: fee.label,
          programName: enrollment.programName,
          paid,
          outstanding: Math.max(0, total - paid),
          total,
          status: fee.status,
          pctPaid: total > 0 ? Math.round((paid / total) * 100) : 0,
        };
      })
  );

const STATUS_TONE: Record<string, string> = {
  paid: 'text-green-600 bg-green-500/10',
  partial: 'text-orange-600 bg-orange-500/10',
  pending: 'text-yellow-700 bg-yellow-500/10',
  unpaid: 'text-muted-foreground bg-muted',
  overdue: 'text-red-600 bg-red-500/10',
};

const FeeTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const row: FeeRow = payload[0].payload;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-foreground">{row.feeLabel}</div>
      <div className="mb-1.5 text-muted-foreground">{row.programName}</div>
      {[
        ['Paid', naira(row.paid)],
        ['Outstanding', naira(row.outstanding)],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 tabular-nums">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{value}</span>
        </div>
      ))}
      <div className="mt-1.5 flex justify-between gap-4 border-t pt-1.5 tabular-nums">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold text-foreground">{naira(row.total)}</span>
      </div>
    </div>
  );
};

/** Two-line tick: fee on top, programme beneath, truncated so it can't overflow. */
const FeeTick = ({ x, y, payload, rows, showProgramme }: any) => {
  const row: FeeRow | undefined = rows.find((r: FeeRow) => r.key === payload.value);
  if (!row) return null;

  const programme =
    row.programName.length > 22 ? `${row.programName.slice(0, 21)}…` : row.programName;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-8} y={showProgramme ? -2 : 4} textAnchor="end" fill="var(--foreground)" fontSize={12}>
        {row.feeLabel}
      </text>
      {showProgramme && (
        <text x={-8} y={12} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>
          {programme}
        </text>
      )}
    </g>
  );
};

export const PaymentsPanel: React.FC<{ rows: FeeRow[] }> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Fees</CardTitle>
          <CardDescription>No published fees for your programme yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalPaid = rows.reduce((sum, r) => sum + r.paid, 0);
  const totalDue = rows.reduce((sum, r) => sum + r.total, 0);
  const totalOutstanding = Math.max(0, totalDue - totalPaid);
  const pctPaid = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  const showProgramme = new Set(rows.map((r) => r.programName)).size > 1;
  const chartHeight = rows.length * 56 + 40;

  return (
    <Card>
      <CardHeader className="p-4 pb-3 md:p-6 md:pb-3">
        <CardTitle className="text-lg md:text-xl">Fees &amp; payments</CardTitle>
        <CardDescription className="text-sm">
          What each fee costs, how much of it is settled, and what is left
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-4 pt-0 md:p-6 md:pt-0">
        {/* 1 — the headline ratio, as a single meter */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">Settled so far</p>
              <p className="text-2xl font-bold text-foreground md:text-3xl">
                {naira(totalPaid)}{' '}
                <span className="text-base font-medium text-muted-foreground">
                  of {naira(totalDue)}
                </span>
              </p>
            </div>
            <span className="text-2xl font-bold tabular-nums text-foreground md:text-3xl">
              {pctPaid}%
            </span>
          </div>

          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: TRACK_FILL }}
            role="img"
            aria-label={`${pctPaid}% of total fees paid`}
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pctPaid}%`, background: PAID_FILL }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs sm:text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PAID_FILL }} />
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium tabular-nums text-foreground">{naira(totalPaid)}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm border" style={{ background: TRACK_FILL }} />
              <span className="text-muted-foreground">Outstanding</span>
              <span className="font-medium tabular-nums text-foreground">
                {naira(totalOutstanding)}
              </span>
            </span>
          </div>
        </div>

        {/* 2 — per-fee progress */}
        <div className="w-full overflow-x-auto">
          <div style={{ height: chartHeight, minWidth: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 4, right: 72, bottom: 4, left: 8 }}
                barSize={14}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="key"
                  width={showProgramme ? 150 : 96}
                  tick={<FeeTick rows={rows} showProgramme={showProgramme} />}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<FeeTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                <Bar dataKey="paid" stackId="fee" fill={PAID_FILL}>
                  {rows.map((row) => (
                    <Cell
                      key={row.key}
                      radius={(row.outstanding === 0 ? [4, 4, 4, 4] : [4, 0, 0, 4]) as any}
                    />
                  ))}
                </Bar>
                <Bar dataKey="outstanding" stackId="fee" fill={TRACK_FILL}>
                  {rows.map((row) => (
                    <Cell
                      key={row.key}
                      radius={(row.paid === 0 ? [4, 4, 4, 4] : [0, 4, 4, 0]) as any}
                      stroke="var(--card)"
                      strokeWidth={row.paid > 0 ? 2 : 0}
                    />
                  ))}
                  {/* Direct labels — the relief the recessive track requires */}
                  <LabelList
                    dataKey="total"
                    position="right"
                    offset={10}
                    formatter={(value: any) => compact(Number(value))}
                    style={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3 — the numbers, always visible rather than behind a toggle */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">
                    {row.feeLabel}
                    {showProgramme && (
                      <div className="text-xs text-muted-foreground">{row.programName}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{naira(row.total)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {naira(row.paid)}
                    <span className="ml-1 text-xs text-muted-foreground">({row.pctPaid}%)</span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {naira(row.outstanding)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[row.status] ?? 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {row.outstanding === 0 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {row.status.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40">
                <TableCell className="font-semibold">
                  <span className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Total
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {naira(totalDue)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {naira(totalPaid)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {naira(totalOutstanding)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentsPanel;
