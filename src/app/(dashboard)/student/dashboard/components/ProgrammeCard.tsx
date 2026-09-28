'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  GraduationCap,
  XCircle,
} from 'lucide-react';
import type { Enrollment, EnrollmentFeeStatus } from '@/lib/services/studentService';

const naira = (value: number) =>
  `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const formatStatus = (status: string | null | undefined) =>
  (status || 'pending').replace(/_/g, ' ');

/** Status colors are reserved for state and always ship with an icon + label. */
const STATUS_TONE: Record<string, string> = {
  paid: 'text-green-600 bg-green-500/10',
  accepted: 'text-green-600 bg-green-500/10',
  submitted: 'text-blue-600 bg-blue-500/10',
  offered: 'text-blue-600 bg-blue-500/10',
  under_review: 'text-blue-600 bg-blue-500/10',
  partial: 'text-orange-600 bg-orange-500/10',
  pending: 'text-yellow-700 bg-yellow-500/10',
  unpaid: 'text-muted-foreground bg-muted',
  not_started: 'text-muted-foreground bg-muted',
  failed: 'text-red-600 bg-red-500/10',
  overdue: 'text-red-600 bg-red-500/10',
  rejected: 'text-red-600 bg-red-500/10',
  declined: 'text-red-600 bg-red-500/10',
  expired: 'text-red-600 bg-red-500/10',
};

const StepIcon: React.FC<{ status: string }> = ({ status }) => {
  if (['paid', 'accepted', 'submitted'].includes(status)) {
    return <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />;
  }
  if (['rejected', 'declined', 'expired', 'failed', 'overdue'].includes(status)) {
    return <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />;
  }
  if (['offered', 'under_review', 'partial'].includes(status)) {
    return <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
};

/** The next fee the student actually owes — drives the CTA, and its absence hides it. */
export const nextPayableFee = (enrollment: Enrollment) =>
  enrollment.fees.find(
    (fee) =>
      fee.amount != null &&
      fee.amount > 0 &&
      fee.paid < fee.amount &&
      (['pending', 'partial', 'overdue', 'unpaid'] as EnrollmentFeeStatus[]).includes(fee.status)
  ) ?? null;

export const ProgrammeCard: React.FC<{ enrollment: Enrollment }> = ({ enrollment }) => {
  const steps = [
    { label: 'Access fee', status: enrollment.applicationPaymentStatus },
    { label: 'Application form', status: enrollment.applicationStatus },
    { label: 'Admission decision', status: enrollment.admissionStatus },
    // { label: 'Acceptance fee', status: enrollment.acceptancePaymentStatus },
    { label: 'Tuition', status: enrollment.tuitionPaymentStatus },
  ];

  const done = steps.filter((s) =>
    ['paid', 'accepted', 'submitted'].includes(s.status)
  ).length;

  const owing = nextPayableFee(enrollment);
  const owedAmount = owing ? (owing.amount as number) - owing.paid : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-4 md:p-6 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base md:text-lg leading-snug">
              {enrollment.programName}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm mt-1">
              {[enrollment.session && `${enrollment.session} session`, enrollment.duration]
                .filter(Boolean)
                .join(' • ')}
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={`capitalize text-xs flex-shrink-0 ${
              STATUS_TONE[enrollment.admissionStatus] ?? ''
            }`}
          >
            {formatStatus(enrollment.admissionStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 pt-0 space-y-5 flex-1 flex flex-col">
        {/* Fees — each one named, so there is no ambiguity about which is which */}
        <div className="space-y-2">
          {/* Only fees the backend actually prices — a row reading "Not published"
              tells the student nothing and looks like a fault. */}
          {enrollment.fees
            .filter((fee) => fee.amount != null && fee.amount > 0)
            .map((fee) => (
              <div key={fee.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{fee.label}</span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span className="tabular-nums font-medium">{naira(fee.amount as number)}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      STATUS_TONE[fee.status] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {fee.status === 'partial'
                      ? `${naira(fee.paid)} paid`
                      : formatStatus(fee.status)}
                  </span>
                </span>
              </div>
            ))}
        </div>

        {/* Admission progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-muted-foreground">Admission progress</span>
            <span className="font-medium tabular-nums">
              {done} of {steps.length}
            </span>
          </div>
          <Progress value={(done / steps.length) * 100} className="h-1.5" />
          <div className="space-y-1.5">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-2 text-sm">
                <StepIcon status={step.status} />
                <span className="text-muted-foreground flex-1 min-w-0 truncate">{step.label}</span>
                <span className="text-xs capitalize text-muted-foreground flex-shrink-0">
                  {formatStatus(step.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {enrollment.offerExpiryDate && !enrollment.isAdmitted && (
          <div className="flex items-center gap-2 text-xs md:text-sm text-orange-600">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              Offer expires {new Date(enrollment.offerExpiryDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* CTA only exists when money is actually owed, and it names the fee */}
        <div className="mt-auto pt-1">
          {owing ? (
            <Button asChild className="w-full">
              <Link href="/process-admission">
                Pay {owing.label.toLowerCase()} · {naira(owedAmount)}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 py-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>All published fees settled</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgrammeCard;
