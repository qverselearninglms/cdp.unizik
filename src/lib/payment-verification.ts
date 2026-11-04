/* ------------------------------------------------------------------ */
/*  Payment verification — one client for all four fees                */
/*                                                                     */
/*  Source of truth: docs/from-backend/VERIFY_RESPONSES.md and         */
/*  docs/from-backend/ACCESS_FEE_API.md.                               */
/*                                                                     */
/*  - Any verify endpoint verifies any fee; the reply says which.      */
/*  - The reply's `status` (not the URL) decides what to show.         */
/*  - HTTP codes are answers here (401 = declined), so requests go     */
/*    through getWithStatus and never trip the 401 auto-logout.        */
/* ------------------------------------------------------------------ */

import { apiClient } from "@/core/client";
import type { PendingAdmissionPaymentType } from "@/lib/program-payment-context";

export type FeeType = PendingAdmissionPaymentType;

export type VerifyOutcome =
    | "paid"
    | "pending"
    | "failed"
    | "needs_attention"
    | "amount_mismatch"
    | "error"
    | "missing_reference"
    | "unknown_reference"
    | "ignored";

export interface VerifyResult {
    outcome: VerifyOutcome;
    success: boolean;
    reference: string | null;
    /** Which fee the backend says this was. Prefer this over anything inferred. */
    feeType: FeeType | null;
    amount: number | null;
    /** Written for the student by the backend; safe to show as-is. */
    message: string | null;
    httpStatus: number;
}

/** The callback params the backend wants forwarded, verbatim. */
export interface VerifyParams {
    transRef?: string;
    reference?: string;
    trans_ref?: string;
    merchant_reference?: string;
}

export const SUPPORT_EMAIL = "cdp@unizik.edu.ng";

const VERIFY_ENDPOINTS: Record<FeeType, string> = {
    application: "/application/verify-payment",
    acceptance: "/application/verify-acceptance-payment",
    tuition: "/application/verify-tuition-payment",
    // Confirmed by backend as the canonical access-fee verify (same reply
    // shape as the other three). /student/verify-access-fee-payment is not used.
    access: "/application/verify-access-payment",
};

/**
 * Accept every spelling the URL or backend may use: `access`, `access_fee`,
 * `course_access_fee`, `ACCESS-FEE`, … Matched on the distinctive stem so an
 * unexpected variant still resolves instead of silently falling through.
 */
export function normaliseFeeType(value: unknown): FeeType | null {
    const v = String(value ?? "").trim().toLowerCase();
    if (!v) return null;
    if (v.includes("access")) return "access";
    if (v.includes("tuition")) return "tuition";
    if (v.includes("accept")) return "acceptance";
    if (v.includes("applic")) return "application";
    return null;
}

/** Our references encode the fee: TP-APP-… / TP-ACC-… / TP-TUI-… / TP-AXS-…. */
export function feeTypeFromReference(...refs: Array<string | null | undefined>): FeeType | null {
    for (const ref of refs) {
        const m = /^TP-(APP|ACC|TUI|AXS)-/i.exec(ref ?? "");
        if (!m) continue;
        return ({ APP: "application", ACC: "acceptance", TUI: "tuition", AXS: "access" } as const)[
            m[1].toUpperCase() as "APP" | "ACC" | "TUI" | "AXS"
        ];
    }
    return null;
}

export function verifyParamsFrom(search: URLSearchParams): VerifyParams {
    const pick = (k: string) => search.get(k) || undefined;
    return {
        transRef: pick("transRef"),
        reference: pick("reference"),
        trans_ref: pick("trans_ref"),
        merchant_reference: pick("merchant_reference"),
    };
}

/** The reference to show the student / support. Ours (TP-…) wins. */
export function displayReference(p: VerifyParams): string | null {
    const all = [p.transRef, p.reference, p.trans_ref, p.merchant_reference].filter(Boolean) as string[];
    return all.find((r) => /^TP-/i.test(r)) ?? all[0] ?? null;
}

const KNOWN: readonly VerifyOutcome[] = [
    "paid", "pending", "failed", "needs_attention", "amount_mismatch",
    "error", "missing_reference", "unknown_reference", "ignored",
];

/**
 * Map a reply to one outcome. Handles both shapes the backend uses:
 *  - /application/verify-*: `status` is already the outcome word.
 *  - /student/verify-access-fee-payment: `status` is success|failed|pending,
 *    and the HTTP code disambiguates (409 / 403 / 422 / 503).
 */
export function normaliseVerifyReply(httpStatus: number, body: unknown): VerifyResult {
    const b = (body ?? {}) as Record<string, any>;
    const d = (b.data && typeof b.data === "object" ? b.data : {}) as Record<string, any>;
    const status = String(b.status ?? "").toLowerCase();

    let outcome: VerifyOutcome;
    if (httpStatus === 409 && status === "pending") outcome = "needs_attention";
    else if (httpStatus === 409 && status === "failed") outcome = "amount_mismatch";
    else if (httpStatus === 403) outcome = "unknown_reference";
    else if (httpStatus === 422 && status === "failed") outcome = "unknown_reference";
    else if (httpStatus === 503) outcome = "error";
    else if (status === "success" || status === "paid") outcome = "paid";
    else if ((KNOWN as readonly string[]).includes(status)) outcome = status as VerifyOutcome;
    else outcome = "error";

    const amount = Number(b.amount ?? d.amount);
    // A 401 *without* status "failed" is an expired session, not a declined payment.
    const sessionExpired = httpStatus === 401 && status !== "failed";

    return {
        outcome,
        success: outcome === "paid",
        reference: (b.reference ?? d.reference ?? null) as string | null,
        feeType: normaliseFeeType(b.payment_type ?? b.fee_type ?? d.payment_type ?? d.fee_type),
        amount: Number.isFinite(amount) && amount > 0 ? amount : null,
        message: sessionExpired
            ? "Your session has expired. Sign in again, then reopen this payment link — your payment is safe."
            : typeof b.message === "string" && b.message.trim()
                ? b.message
                : null,
        httpStatus,
    };
}

/** Verify one payment. Never throws for an HTTP status; only for a dead network. */
export async function verifyPayment(feeType: FeeType, params: VerifyParams): Promise<VerifyResult> {
    const { httpStatus, body } = await apiClient.getWithStatus(VERIFY_ENDPOINTS[feeType], { params });
    return normaliseVerifyReply(httpStatus, body);
}
