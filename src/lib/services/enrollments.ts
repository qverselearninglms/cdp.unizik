/**
 * Enrollment normalisation.
 *
 * A student may pay for more than one programme. `/admission/student` currently
 * returns a single record, so this module normalises every shape the backend
 * might send — a bare record, an array, or a record carrying a
 * `programs` / `enrollments` / `admissions` array — into one list. When the
 * backend grows multi-programme support, no UI change is needed.
 *
 * Deliberately free of imports so the rules stay pure and testable.
 */

export type EnrollmentFeeStatus = 'paid' | 'partial' | 'pending' | 'overdue' | 'unpaid';

export interface EnrollmentFee {
  key: 'access' | 'acceptance' | 'tuition';
  label: string;
  /** null when the backend does not publish an amount for this fee */
  amount: number | null;
  paid: number;
  status: EnrollmentFeeStatus;
}

export interface Enrollment {
  id: string;
  programId: number | null;
  programName: string;
  duration: string | null;
  session: string;
  applicationPaymentStatus: string;
  applicationStatus: string;
  admissionStatus: string;
  acceptancePaymentStatus: string;
  tuitionPaymentStatus: string;
  progressStatus: string | null;
  hasApplied: boolean;
  isAdmitted: boolean;
  offerExpiryDate: string | null;
  fees: EnrollmentFee[];
  /** Sum of fees whose amount the backend publishes */
  totalDue: number;
  totalPaid: number;
  outstanding: number;
}

/** "500,000" | "₦500,000" | 500000 -> 500000 ; anything unparseable -> 0 */
export function parseAmount(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapFeeStatus(status: string | undefined): EnrollmentFeeStatus {
  switch ((status || '').toLowerCase()) {
    case 'paid':
    case 'success':
    case 'completed':
      return 'paid';
    case 'partial':
      return 'partial';
    case 'failed':
    case 'overdue':
      return 'overdue';
    case 'unpaid':
    case 'not_started':
      return 'unpaid';
    default:
      return 'pending';
  }
}

/** Amount settled for a fee: the explicit figure when we have one, else infer from status. */
function feePaid(status: EnrollmentFeeStatus, amount: number | null, explicit?: number): number {
  if (typeof explicit === 'number' && Number.isFinite(explicit) && explicit > 0) {
    return amount ? Math.min(explicit, amount) : explicit;
  }
  return status === 'paid' && amount ? amount : 0;
}

function buildEnrollment(record: any): Enrollment {
  const category = record?.lms_category ?? record?.category ?? record?.program ?? null;

  const accessAmount = category?.access_fee != null ? parseAmount(category.access_fee) : null;
  const tuitionAmount = category?.tuition != null ? parseAmount(category.tuition) : null;
  const acceptanceAmount =
    category?.acceptance_fee != null ? parseAmount(category.acceptance_fee) : null;

  const accessStatus = mapFeeStatus(record?.application_payment_status);
  const acceptanceStatus = mapFeeStatus(record?.acceptance_payment_status);
  const tuitionStatus = mapFeeStatus(record?.tuition_payment_status);

  const fees: EnrollmentFee[] = [
    {
      key: 'access',
      label: 'Access fee',
      amount: accessAmount,
      paid: feePaid(accessStatus, accessAmount),
      status: accessStatus,
    },
    {
      key: 'acceptance',
      label: 'Acceptance fee',
      amount: acceptanceAmount,
      paid: feePaid(acceptanceStatus, acceptanceAmount),
      status: acceptanceStatus,
    },
    {
      key: 'tuition',
      label: 'Tuition',
      amount: tuitionAmount,
      paid: feePaid(tuitionStatus, tuitionAmount, parseAmount(record?.tuition_amount_paid)),
      status: tuitionStatus,
    },
  ];

  const priced = fees.filter((f) => f.amount != null && f.amount > 0);
  const totalDue = priced.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  const totalPaid = priced.reduce((sum, f) => sum + f.paid, 0);

  return {
    id: String(record?.id ?? category?.id ?? 'enrollment'),
    programId: category?.id ?? null,
    programName: category?.name ?? record?.department ?? 'Programme not assigned',
    duration: category?.duration ?? null,
    session: record?.session ?? '',
    applicationPaymentStatus: record?.application_payment_status ?? 'pending',
    applicationStatus: record?.application_status ?? 'not_started',
    admissionStatus: record?.admission_status ?? 'pending',
    acceptancePaymentStatus: record?.acceptance_payment_status ?? 'pending',
    tuitionPaymentStatus: record?.tuition_payment_status ?? 'pending',
    progressStatus: record?.progress_status ?? null,
    hasApplied: !!record?.has_applied,
    isAdmitted: !!record?.is_admitted,
    offerExpiryDate: record?.offer_expiry_date ?? null,
    fees,
    totalDue,
    totalPaid,
    outstanding: Math.max(0, totalDue - totalPaid),
  };
}

/** Accepts every shape the admission endpoint might return; always yields a list. */
export function toEnrollments(payload: any): Enrollment[] {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload.map(buildEnrollment);

  const nested =
    payload.programs ?? payload.enrollments ?? payload.admissions ?? payload.records;

  if (Array.isArray(nested) && nested.length > 0) {
    // Each entry may be a full admission record, or just a programme carried on
    // the parent record's statuses.
    return nested.map((entry: any) =>
      buildEnrollment(
        entry?.lms_category || entry?.application_payment_status
          ? entry
          : { ...payload, lms_category: entry }
      )
    );
  }

  return [buildEnrollment(payload)];
}
