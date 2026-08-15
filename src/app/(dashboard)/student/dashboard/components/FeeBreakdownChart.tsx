'use client';

import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TableIcon } from 'lucide-react';
import type { Enrollment } from '@/lib/services/studentService';

/**
 * Fee breakdown — a meter, not a categorical palette: each row is one fee,
 * the filled segment is what has been paid and the track behind it is what is
 * still owed. The track sits deliberately close to the surface, so every row
 * carries a visible amount label and the whole figure has a table view.
 */

const PAID_FILL = 'var(--chart-1)';
const TRACK_FILL = 'var(--muted)';

const naira = (value: number) =>
  `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const compactNaira = (value: number) => {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value}`;
};

export interface FeeRow {
  /** Fee name, prefixed with the programme when the student has several */
  name: string;
  programName: string;
  feeLabel: string;
  paid: number;
  outstanding: number;
  total: number;
}

export const buildFeeRows = (enrollments: Enrollment[]): FeeRow[] => {
  const multiple = enrollments.length > 1;

  return enrollments.flatMap((enrollment, index) =>
    enrollment.fees
      .filter((fee) => fee.amount != null && fee.amount > 0)
      .map((fee) => {
        const total = fee.amount as number;
        const paid = Math.min(fee.paid, total);
        return {
          // `name` is the axis key and must stay unique per row, but the tick
          // renderer below draws feeLabel/programName instead of this string.
          name: multiple ? `${fee.label} #${index + 1}` : fee.label,
          programName: enrollment.programName,
          feeLabel: fee.label,
          paid,
          outstanding: Math.max(0, total - paid),
          total,
        };
      })
  );
};

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

/**
 * Two-line category tick: the fee on top, the programme beneath it. Drawn
 * explicitly (and truncated) so a long programme name can never overflow or be
 * clipped by the axis band — the full name stays in the tooltip and table.
 */
const FeeTick = ({ x, y, payload, rows, showProgramme }: any) => {
  const row: FeeRow | undefined = rows.find((r: FeeRow) => r.name === payload.value);
  if (!row) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={showProgramme ? -2 : 4}
        textAnchor="end"
        fill="var(--foreground)"
        fontSize={12}
      >
        {row.feeLabel}
      </text>
      {showProgramme && (
        <text x={-8} y={12} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>
          {truncate(row.programName, 22)}
        </text>
      )}
    </g>
  );
};

const FeeTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const row: FeeRow = payload[0].payload;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-foreground">{row.feeLabel}</div>
      <div className="text-muted-foreground mb-1.5">{row.programName}</div>
      <div className="flex justify-between gap-4 tabular-nums">
        <span className="text-muted-foreground">Paid</span>
        <span className="font-medium text-foreground">{naira(row.paid)}</span>
      </div>
      <div className="flex justify-between gap-4 tabular-nums">
        <span className="text-muted-foreground">Outstanding</span>
        <span className="font-medium text-foreground">{naira(row.outstanding)}</span>
      </div>
      <div className="flex justify-between gap-4 tabular-nums border-t mt-1.5 pt-1.5">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold text-foreground">{naira(row.total)}</span>
      </div>
    </div>
  );
};

export const FeeBreakdownChart: React.FC<{ rows: FeeRow[] }> = ({ rows }) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Fee breakdown</CardTitle>
          <CardDescription>No published fees for your programme yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalPaid = rows.reduce((sum, r) => sum + r.paid, 0);
  const totalOutstanding = rows.reduce((sum, r) => sum + r.outstanding, 0);

  // Only worth naming the programme on the axis when there is more than one.
  const showProgramme = new Set(rows.map((r) => r.programName)).size > 1;

  // Height grows with the row count so the x-axis band is never cropped.
  const chartHeight = rows.length * 56 + 48;

  return (
    <Card>
      <CardHeader className="p-4 md:p-6 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl">Fee breakdown</CardTitle>
            <CardDescription className="text-sm">
              What each fee costs, and how much of it you have paid
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
          >
            {view === 'chart' ? (
              <><TableIcon className="h-4 w-4 mr-2" />Table</>
            ) : (
              <><BarChart3 className="h-4 w-4 mr-2" />Chart</>
            )}
          </Button>
        </div>

        {/* Legend — always present, identity never carried by color alone */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs sm:text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PAID_FILL }} />
            <span className="text-muted-foreground">Paid</span>
            <span className="font-medium text-foreground tabular-nums">{naira(totalPaid)}</span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm border"
              style={{ background: TRACK_FILL }}
            />
            <span className="text-muted-foreground">Outstanding</span>
            <span className="font-medium text-foreground tabular-nums">
              {naira(totalOutstanding)}
            </span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 pt-2">
        {view === 'chart' ? (
          <div className="w-full overflow-x-auto">
            <div style={{ height: chartHeight, minWidth: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rows}
                  layout="vertical"
                  margin={{ top: 4, right: 64, bottom: 4, left: 8 }}
                  barSize={14}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--border)"
                    strokeWidth={1}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={compactNaira}
                    stroke="var(--border)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={showProgramme ? 150 : 96}
                    stroke="var(--border)"
                    tick={<FeeTick rows={rows} showProgramme={showProgramme} />}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={<FeeTooltip />}
                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  />
                  <Bar dataKey="paid" stackId="fee" fill={PAID_FILL}>
                    {rows.map((row) => (
                      <Cell
                        key={row.name}
                        // Fully round a fee that is settled; otherwise only the
                        // baseline end, so the stack reads as one bar.
                        radius={(row.outstanding === 0 ? [4, 4, 4, 4] : [4, 0, 0, 4]) as any}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="outstanding" stackId="fee" fill={TRACK_FILL}>
                    {rows.map((row) => (
                      <Cell
                        key={row.name}
                        radius={(row.paid === 0 ? [4, 4, 4, 4] : [0, 4, 4, 0]) as any}
                        // 2px surface gap between the two fills
                        stroke="var(--card)"
                        strokeWidth={row.paid > 0 ? 2 : 0}
                      />
                    ))}
                    {/* Direct label — the relief the recessive track requires */}
                    <LabelList
                      dataKey="total"
                      position="right"
                      offset={10}
                      formatter={(value: any) => compactNaira(Number(value))}
                      style={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">
                      {row.feeLabel}
                      <div className="text-xs text-muted-foreground">{row.programName}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{naira(row.paid)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {naira(row.outstanding)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {naira(row.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeBreakdownChart;
