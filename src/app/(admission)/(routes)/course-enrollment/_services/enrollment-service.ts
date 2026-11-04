/* ------------------------------------------------------------------ */
/*  Course enrollment (access fee) — API service                       */
/*  Backend implementation: docs/from-backend/ACCESS_FEE_API.md        */
/*  Verification lives in src/lib/payment-verification.ts (shared).   */
/* ------------------------------------------------------------------ */

import { apiClient } from "@/core/client";
import type { ApiError } from "@/types/auth";
import { baseUrl } from "@/config";
import type {
    AccessPaymentInitiation,
    AccessPaymentStatus,
    CourseAccessStatus,
    ProgramCourse,
} from "../_types/enrollment";

export const COURSE_ENROLLMENT_PATH = "/course-enrollment";

type AnyRecord = Record<string, any>;

/** Bodies are inconsistently wrapped across this API; peel `data` layers off. */
function unwrap(body: unknown): AnyRecord {
    let current: any = body;
    for (let i = 0; i < 3 && current && typeof current === "object" && !Array.isArray(current); i++) {
        if (current.data && typeof current.data === "object") current = current.data;
        else break;
    }
    return (current ?? {}) as AnyRecord;
}

function unwrapArray(body: unknown, ...keys: string[]): any[] {
    let current: any = body;
    for (let i = 0; i < 4 && current; i++) {
        if (Array.isArray(current)) return current;
        const next = keys.map((k) => current?.[k]).find((v) => v !== undefined) ?? current?.data;
        if (next === undefined) break;
        current = next;
    }
    return [];
}

function toNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const n = Number(value.replace(/[^\d.]/g, ""));
        return Number.isFinite(n) ? n : null;
    }
    return null;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function normaliseCourse(raw: AnyRecord): ProgramCourse | null {
    const id = toNumber(raw.course_id ?? raw.id);
    if (id == null) return null;
    return {
        id,
        name: String(raw.course_name ?? raw.fullname ?? raw.name ?? "Untitled course"),
        shortName: String(raw.short_name ?? raw.shortname ?? ""),
        summary: stripHtml(String(raw.summary ?? "")),
    };
}

function normaliseStatus(value: unknown, unlocked: boolean): AccessPaymentStatus {
    if (unlocked) return "paid";
    const s = String(value ?? "").toLowerCase() as AccessPaymentStatus;
    const known: AccessPaymentStatus[] = [
        "payment_initiated", "paid", "failed", "checkout_open", "processing", "received_not_applied",
    ];
    return known.includes(s) ? s : "not_started";
}

/** Where TransactPay should send the student back. */
export function buildAccessCallbackUrl(): string | undefined {
    const origin = (typeof window !== "undefined" ? window.location.origin : "") || baseUrl;
    if (!origin) return undefined;
    return `${origin}/verify-payments?fee_type=access&redirect=${encodeURIComponent(COURSE_ENROLLMENT_PATH)}`;
}

/** Why initiation was refused (409 / 422), so the UI can react instead of only toasting. */
export class AccessPaymentRefused extends Error {
    constructor(message: string, readonly reason: "already_granted" | "not_payable") {
        super(message);
        this.name = "AccessPaymentRefused";
    }
}

export const enrollmentService = {
    /** The programme's visible courses, paid or not. */
    async getProgramCourses(programId: number): Promise<ProgramCourse[]> {
        const body = await apiClient.get("/student/program-courses", {
            params: { course_group_id: programId },
        });
        return unwrapArray(body, "courses")
            .map(normaliseCourse)
            .filter((c): c is ProgramCourse => !!c);
    },

    /** Locked/unlocked, the server price, and whether it can be paid yet. */
    async getAccessStatus(programId: number): Promise<CourseAccessStatus> {
        const body = await apiClient.get("/student/course-access-status", {
            params: { course_group_id: programId },
        });
        const d = unwrap(body);
        const requiresAccessFee = d.requires_access_fee !== false;
        const unlocked = Boolean(d.access_granted) || !requiresAccessFee;
        return {
            courseGroupId: toNumber(d.course_group_id) ?? programId,
            requiresAccessFee,
            paymentStatus: normaliseStatus(d.payment_status, unlocked),
            accessGranted: unlocked,
            // Absent `payable` means payable — only an explicit false blocks.
            payable: d.payable !== false,
            message: typeof d.message === "string" && d.message.trim() ? d.message : null,
            amount: toNumber(d.access_fee_amount),
            currency: String(d.currency ?? "NGN"),
            reference: d.reference ? String(d.reference) : null,
            checkoutUrl: typeof d.checkout_url === "string" && d.checkout_url ? d.checkout_url : null,
            statusMessage: typeof d.status_message === "string" && d.status_message.trim() ? d.status_message : null,
        };
    },

    /** Create the checkout. The server charges its own price; `amount` is only compared. */
    async initiateAccessPayment(input: {
        programId: number;
        programName: string;
        amount: number | null;
    }): Promise<AccessPaymentInitiation> {
        let body: unknown;
        try {
            body = await apiClient.post("/student/initiate-access-fee-payment", {
                course_group_id: input.programId,
                course_group_name: input.programName,
                ...(input.amount != null ? { amount: input.amount } : {}),
                currency: "NGN",
                fee_type: "access_fee",
                callback_url: buildAccessCallbackUrl(),
            });
        } catch (error) {
            const e = error as ApiError;
            if (e?.statusCode === 409) throw new AccessPaymentRefused(e.message || "Your courses are already unlocked.", "already_granted");
            if (e?.statusCode === 422) throw new AccessPaymentRefused(e.message || "The access fee can't be paid yet.", "not_payable");
            throw error;
        }

        const d = unwrap(body);
        const authorizationUrl = d.authorizationUrl ?? d.authorization_url ?? d.gateway_url;
        if (!authorizationUrl) {
            throw new Error((body as AnyRecord)?.message || "The payment gateway did not return a checkout link.");
        }
        return {
            authorizationUrl: String(authorizationUrl),
            reference: d.reference ? String(d.reference) : null,
            amount: toNumber(d.amount) ?? input.amount,
        };
    },
};
