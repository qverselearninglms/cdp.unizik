'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  GraduationCap,
  Receipt,
  Wallet,
} from 'lucide-react';
import { useStudentQueries } from '@/hooks/useStudentQueries';
import { PaymentsPanel, buildFeeRows } from './PaymentsPanel';
import { CoursesPanel } from './CoursesPanel';
import { ProgrammeCard, nextPayableFee } from './ProgrammeCard';

const naira = (value: number) =>
  `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const QUICK_LINKS = [
  { href: '/student/my-application', label: 'My application', icon: FileText },
  { href: '/student/classes', label: 'My courses', icon: BookOpen },
  { href: '/student/history/student-payments', label: 'Payment history', icon: Receipt },
  { href: '/student/history/student-results', label: 'Results', icon: GraduationCap },
];

export const Dashboard: React.FC = () => {
  const { useDashboardSummary } = useStudentQueries();
  const { data: dashboardResponse, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-center text-red-600 max-w-sm mx-auto">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <div className="text-lg font-semibold">Error loading dashboard data</div>
          <div className="text-sm text-muted-foreground mt-2">Please try again later</div>
          <Button onClick={() => window.location.reload()} className="mt-4 w-full md:w-auto">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const dashboardData = dashboardResponse?.data;

  if (!dashboardData) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-lg">No dashboard data available</div>
          <Button onClick={() => window.location.reload()} className="mt-4 w-full md:w-auto">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const { profile, enrollments, courses, unavailable } = dashboardData;

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Student';
  const studentId = profile?.admission_no || profile?.user_id?.toString() || 'Not assigned';
  const session = enrollments.find((e) => e.session)?.session ?? '';

  const totalPaid = enrollments.reduce((sum, e) => sum + e.totalPaid, 0);
  const outstanding = enrollments.reduce((sum, e) => sum + e.outstanding, 0);
  const feeRows = buildFeeRows(enrollments);
  const pricedFeeCount = feeRows.length;

  // A single next action across every programme — drives the one page-level CTA.
  const owingEnrollment = enrollments.find((e) => nextPayableFee(e));
  const owingFee = owingEnrollment ? nextPayableFee(owingEnrollment) : null;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
              Welcome back, {fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs font-mono">
                ID {studentId}
              </Badge>
              {session && (
                <Badge variant="outline" className="text-xs">
                  {session} session
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {enrollments.length} {enrollments.length === 1 ? 'programme' : 'programmes'}
              </Badge>
            </div>
          </div>

          {/* The one page-level CTA — present only when something is genuinely owed */}
          {owingFee && owingEnrollment && (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/process-admission">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay {owingFee.label.toLowerCase()} ·{' '}
                {naira((owingFee.amount as number) - owingFee.paid)}
              </Link>
            </Button>
          )}
        </div>

        {/* Partial-data notice — name what is missing rather than render silent zeroes */}
        {/* {unavailable && unavailable.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">
              Some sections could not be loaded ({unavailable.join(', ')}). Everything shown below
              is up to date.
            </span>
          </div>
        )} */}

        {/* Headline figures — each says exactly what it counts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className={outstanding > 0 ? 'border-orange-500/40' : undefined}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Outstanding balance
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-foreground mt-1">
                    {naira(outstanding)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {outstanding > 0
                      ? `Across ${pricedFeeCount} ${pricedFeeCount === 1 ? 'fee' : 'fees'}`
                      : 'Nothing owed right now'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Wallet className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total paid
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-foreground mt-1">
                    {naira(totalPaid)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    See the breakdown below
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Programmes
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-foreground mt-1">
                    {enrollments.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                    {enrollments.map((e) => e.programName).join(', ') || 'None yet'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Courses enrolled
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-foreground mt-1">
                    {courses.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {courses.length > 0 ? 'Available in the LMS' : 'None yet'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fees — headline ratio, per-fee progress, then the full numbers */}
        <PaymentsPanel rows={feeRows} />

        {/* Courses the student is actually enrolled in */}
        <CoursesPanel courses={courses} />

        {/* One card per programme */}
        {enrollments.length > 0 ? (
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
              {enrollments.length === 1 ? 'Your programme' : 'Your programmes'}
            </h2>
            <div
              className={`grid gap-4 md:gap-6 ${
                enrollments.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {enrollments.map((enrollment) => (
                <ProgrammeCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">No programme yet</CardTitle>
              <CardDescription>
                Choose a programme to begin your admission.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <Button asChild>
                <Link href="/programs">
                  Browse programmes
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Where the old tabs went — these are full pages in the sidebar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              asChild
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-accent"
            >
              <Link href={href}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
