/* ------------------------------------------------------------------ */
/*  Course enrollment (access fee) — types                             */
/*  Mirrors docs/from-backend/ACCESS_FEE_API.md                        */
/* ------------------------------------------------------------------ */

/** The student's programme — an LMS category, gated as one unit. */
export interface EnrollmentProgram {
    id: number;
    name: string;
    /** Where we learned the programme from, for diagnostics. */
    source: "admission" | "registration";
}

/** A course under the programme. The LMS stores no level/semester/units. */
export interface ProgramCourse {
    id: number;
    name: string;
    shortName: string;
    summary: string;
}

/**
 * Server-side payment state.
 * Today the backend sends not_started | payment_initiated | paid | failed, where
 * `payment_initiated` is ambiguous (checkout open OR money received) — the page
 * resolves it immediately by asking TransactPay via verify.
 * The last three are proposed (docs/proposal-instant-payment-status.md) and
 * are handled already, so they work the day the backend sends them.
 */
export type AccessPaymentStatus =
    | "not_started"
    | "payment_initiated"
    | "paid"
    | "failed"
    | "checkout_open"
    | "processing"
    | "received_not_applied";

export interface CourseAccessStatus {
    courseGroupId: number;
    requiresAccessFee: boolean;
    paymentStatus: AccessPaymentStatus;
    /** True when paid or waived. */
    accessGranted: boolean;
    /** False until the earlier fees (application, full tuition) are paid. */
    payable: boolean;
    /** Backend's student-facing reason when not payable. */
    message: string | null;
    amount: number | null;
    currency: string;
    reference: string | null;
    /** Proposed: resume the same open checkout instead of starting a new one. */
    checkoutUrl: string | null;
    /** Proposed: the backend's student-facing description of the current state. */
    statusMessage: string | null;
}

export interface AccessPaymentInitiation {
    authorizationUrl: string;
    reference: string | null;
    amount: number | null;
}

/**
 * What the page is showing. Every phase maps to one "what's happening / what
 * to do next" message, so the student is never left guessing.
 */
export type EnrollmentPhase =
    | "loading"
    | "signed_out"
    | "no_program"
    | "error"
    | "not_payable"
    | "locked"
    /** Asking TransactPay right now what happened to the last payment. */
    | "checking"
    /** Checkout started but TransactPay has no payment — free to pay or resume. */
    | "not_completed"
    /** The bank is still processing — seconds, not minutes. */
    | "processing"
    /** Money taken, not yet on the account — never offer to pay again. */
    | "received"
    /** Couldn't reach TransactPay — retry the check; don't pay again yet. */
    | "check_failed"
    | "failed"
    | "unlocked";
