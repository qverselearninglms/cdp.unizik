/* ------------------------------------------------------------------ */
/*  Admission Module — API Service (Mock-Ready)                        */
/*                                                                     */
/*  Replace the mock implementations with real apiClient calls when    */
/*  connecting to the live backend. The interface stays the same.      */
/* ------------------------------------------------------------------ */

import {
    createApiMutationOptions,
    createApiQueryOptions,
} from "@/lib/clients/apiClient";
import type {
    AdmissionStudent,
    FeeSchedule,
    PaymentInitiationResponse,
    PaymentVerificationResponse,
} from "../types/admission";
import type { UserInterface } from "@/types/global";
import { ACCEPTANCE_FEE_AMOUNT, APPLICATION_FEE_AMOUNT } from "@/config/global.config";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                           */
/* ------------------------------------------------------------------ */

const MOCK_FEES: FeeSchedule = {
    session: "2025/2026",
    fees: [
        {
            id: "fee-app-001",
            name: "Application Fee",
            slug: "application_fee",
            amount: 10_000,
            currency: "NGN",
            description: "Non-refundable admission application processing fee",
        },
        {
            id: "fee-acc-001",
            name: "Acceptance Fee",
            slug: "acceptance_fee",
            amount: 30_000,
            currency: "NGN",
            description: "Fee to accept your admission offer",
        },
        {
            id: "fee-tui-001",
            name: "Tuition Fee",
            slug: "tuition_fee",
            amount: 195_000,
            currency: "NGN",
            description: "Full session tuition — unlocks courses and LMS access",
        },
    ],
};

// Module-level mock state — populated from the authenticated user on first fetch
let mockStudent: AdmissionStudent;
let initialMockStudent: AdmissionStudent;

function mapUserToAdmissionStudent(user: UserInterface): AdmissionStudent {
    return {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.school_email ?? user.email,
        department: user.course_name ?? '',
        faculty: '',
        application_payment_status: 'unpaid',
        application_status: 'not_started',
        admission_status: 'pending',
        acceptance_payment_status: 'unpaid',
        tuition_payment_status: 'unpaid',
        tuition_amount_paid: 0,
        has_applied: false,
        is_admitted: false,
        session: '2025/2026',
        offer_expiry_date: null,
    };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

export const admissionService = {
    /* ---------- Fees ---------- */
    async fetchFees(): Promise<FeeSchedule> {
        // TODO: replace with → apiClient.get<FeeSchedule>("/admission/fees", { access_token: true })
        await delay(800);
        return MOCK_FEES;
    },

    /* ---------- Student Data ---------- */
    async fetchStudentAdmission(user?: UserInterface): Promise<AdmissionStudent> {
        // TODO: replace with → apiClient.get<AdmissionStudent>("/admission/student", { access_token: true })
        await delay(600);
        if (!mockStudent && user) {
            mockStudent = mapUserToAdmissionStudent(user);
            initialMockStudent = { ...mockStudent };
        }
        return { ...mockStudent! };
    },

    /* ---------- Initiate Application Payment ---------- */
    async initiateApplicationPayment(): Promise<PaymentInitiationResponse> {
        // TODO: replace with → apiClient.post<PaymentInitiationResponse>("/payments/application/initiate", {}, { access_token: true })
        await delay(1200);
        const ref = `QHUB-APP-${Date.now()}`;
        return {
            success: true,
            reference: ref,
            gateway_url: `https://app.credodemo.com/pay?ref=${ref}&amount=${APPLICATION_FEE_AMOUNT}`,
            message: "Payment initiated successfully",
        };
    },

    /* ---------- Verify Application Payment ---------- */
    async verifyApplicationPayment(reference: string): Promise<PaymentVerificationResponse> {
        // TODO: replace with → apiClient.post<PaymentVerificationResponse>("/payments/application/verify", { reference }, { access_token: true })
        await delay(1500);
        // Simulate success — update mock state
        mockStudent = {
            ...mockStudent,
            application_payment_status: "paid",
        };
        return {
            success: true,
            status: "paid",
            reference,
            amount: APPLICATION_FEE_AMOUNT,
            message: "Application payment verified successfully",
        };
    },

    /* ---------- Initiate Acceptance Fee Payment ---------- */
    async initiateAcceptanceFeePayment(): Promise<PaymentInitiationResponse> {
        // TODO: replace with → apiClient.post<PaymentInitiationResponse>("/payments/acceptance/initiate", {}, { access_token: true })
        await delay(1200);
        const ref = `QHUB-ACC-${Date.now()}`;
        return {
            success: true,
            reference: ref,
            gateway_url: `https://app.credodemo.com/pay?ref=${ref}&amount=${ACCEPTANCE_FEE_AMOUNT}`,
            message: "Payment initiated successfully",
        };
    },

    /* ---------- Verify Acceptance Fee Payment ---------- */
    async verifyAcceptanceFeePayment(reference: string): Promise<PaymentVerificationResponse> {
        // TODO: replace with → apiClient.post<PaymentVerificationResponse>("/payments/acceptance/verify", { reference }, { access_token: true })
        await delay(1500);
        mockStudent = {
            ...mockStudent,
            acceptance_payment_status: "paid",
            admission_status: "accepted",
        };
        return {
            success: true,
            status: "paid",
            reference,
            amount: 30_000,
            message: "Acceptance fee payment verified successfully",
        };
    },

    /* ---------- Initiate Tuition Payment ---------- */
    async initiateTuitionPayment(amount: number): Promise<PaymentInitiationResponse> {
        // TODO: replace with → apiClient.post<PaymentInitiationResponse>("/payments/tuition/initiate", { amount }, { access_token: true })
        await delay(1200);
        const ref = `QHUB-TUI-${Date.now()}`;
        return {
            success: true,
            reference: ref,
            gateway_url: `https://app.credodemo.com/pay?ref=${ref}&amount=${amount}`,
            message: "Payment initiated successfully",
        };
    },

    /* ---------- Verify Tuition Payment ---------- */
    async verifyTuitionPayment(reference: string): Promise<PaymentVerificationResponse> {
        // TODO: replace with → apiClient.post<PaymentVerificationResponse>("/payments/tuition/verify", { reference }, { access_token: true })
        await delay(1500);
        // Simulate: extract amount from reference URL or use a fixed mock amount
        const TUITION_TOTAL = 195_000;
        // For mock, assume each verify adds half if partial, or full
        const paymentAmount = mockStudent.tuition_amount_paid === 0
            ? (mockStudent.tuition_amount_paid + TUITION_TOTAL) // Will be overridden by actual gateway amount
            : TUITION_TOTAL - mockStudent.tuition_amount_paid;
        const newTotal = Math.min(mockStudent.tuition_amount_paid + paymentAmount, TUITION_TOTAL);
        mockStudent = {
            ...mockStudent,
            tuition_amount_paid: newTotal,
            tuition_payment_status: newTotal >= TUITION_TOTAL ? "paid" : "partial",
        };
        return {
            success: true,
            status: newTotal >= TUITION_TOTAL ? "paid" : "partial",
            reference,
            amount: paymentAmount,
            message: newTotal >= TUITION_TOTAL
                ? "Tuition payment completed"
                : `Partial payment received. ₦${(TUITION_TOTAL - newTotal).toLocaleString()} remaining.`,
        };
    },

    /* ---------- Dev-only: Simulate status changes ---------- */
    async devSimulateAppPaymentPaid(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            application_payment_status: "paid",
        };
        return { ...mockStudent };
    },

    async devSimulateApplied(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            has_applied: true,
            application_status: "submitted",
        };
        return { ...mockStudent };
    },

    async devSimulateAdmissionOffered(): Promise<AdmissionStudent> {
        await delay(500);
        // Set expiry to 14 days from now
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 14);
        mockStudent = {
            ...mockStudent,
            admission_status: "offered",
            is_admitted: true,
            offer_expiry_date: expiry.toISOString(),
        };
        return { ...mockStudent };
    },

    async devSimulateAdmissionAccepted(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            admission_status: "accepted",
            acceptance_payment_status: "paid",
        };
        return { ...mockStudent };
    },

    async devSimulateTuitionPaid(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            tuition_payment_status: "paid",
            tuition_amount_paid: 195_000,
        };
        return { ...mockStudent };
    },

    /* ---------- Decline Admission ---------- */
    async declineAdmission(): Promise<AdmissionStudent> {
        // TODO: replace with → apiClient.post<AdmissionStudent>("/admission/decline", {}, { access_token: true })
        await delay(800);
        mockStudent = {
            ...mockStudent,
            admission_status: "declined",
            is_admitted: false,
            offer_expiry_date: null,
        };
        return { ...mockStudent };
    },

    /* ---------- Dev-only: Simulate Declined ---------- */
    async devSimulateDeclined(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            admission_status: "declined",
            is_admitted: false,
            offer_expiry_date: null,
        };
        return { ...mockStudent };
    },

    /* ---------- Dev-only: Simulate Expired ---------- */
    async devSimulateExpired(): Promise<AdmissionStudent> {
        await delay(500);
        mockStudent = {
            ...mockStudent,
            admission_status: "expired",
            is_admitted: false,
            offer_expiry_date: new Date(Date.now() - 86400000).toISOString(), // yesterday
        };
        return { ...mockStudent };
    },

    async devResetAll(): Promise<AdmissionStudent> {
        await delay(300);
        mockStudent = { ...initialMockStudent };
        return { ...mockStudent };
    },
};

export const admissionKeys = {
    all: ["admission"] as const,
    fees: () => [...admissionKeys.all, "fees"] as const,
    student: () => [...admissionKeys.all, "student"] as const,
    verifyAppPayment: (reference: string) =>
        [...admissionKeys.all, "verify-app", reference] as const,
    verifyAccPayment: (reference: string) =>
        [...admissionKeys.all, "verify-acc", reference] as const,
    verifyTuiPayment: (reference: string) =>
        [...admissionKeys.all, "verify-tui", reference] as const,
};

export const admissionQueryOptions = {
    fees: () =>
        createApiQueryOptions({
            queryKey: admissionKeys.fees(),
            queryFn: admissionService.fetchFees,
        }),

    student: (user?: UserInterface) =>
        createApiQueryOptions({
            queryKey: admissionKeys.student(),
            queryFn: () => admissionService.fetchStudentAdmission(user),
        }),

    verifyApplicationPayment: (reference: string) =>
        createApiQueryOptions({
            queryKey: admissionKeys.verifyAppPayment(reference),
            queryFn: () => admissionService.verifyApplicationPayment(reference),
        }),

    verifyAcceptanceFeePayment: (reference: string) =>
        createApiQueryOptions({
            queryKey: admissionKeys.verifyAccPayment(reference),
            queryFn: () => admissionService.verifyAcceptanceFeePayment(reference),
        }),

    verifyTuitionPayment: (reference: string) =>
        createApiQueryOptions({
            queryKey: admissionKeys.verifyTuiPayment(reference),
            queryFn: () => admissionService.verifyTuitionPayment(reference),
        }),
};

export const admissionMutationOptions = {
    initiateApplicationPayment: () =>
        createApiMutationOptions<PaymentInitiationResponse, void>({
            mutationKey: [...admissionKeys.all, "payments", "application", "initiate"],
            mutationFn: () => admissionService.initiateApplicationPayment(),
        }),

    initiateAcceptanceFeePayment: () =>
        createApiMutationOptions<PaymentInitiationResponse, void>({
            mutationKey: [...admissionKeys.all, "payments", "acceptance", "initiate"],
            mutationFn: () => admissionService.initiateAcceptanceFeePayment(),
        }),

    initiateTuitionPayment: () =>
        createApiMutationOptions<PaymentInitiationResponse, number>({
            mutationKey: [...admissionKeys.all, "payments", "tuition", "initiate"],
            mutationFn: admissionService.initiateTuitionPayment,
        }),

    simulateAppPaymentPaid: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "app-paid"],
            mutationFn: () => admissionService.devSimulateAppPaymentPaid(),
        }),

    simulateApplied: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "applied"],
            mutationFn: () => admissionService.devSimulateApplied(),
        }),

    simulateOffered: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "offered"],
            mutationFn: () => admissionService.devSimulateAdmissionOffered(),
        }),

    simulateAccepted: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "accepted"],
            mutationFn: () => admissionService.devSimulateAdmissionAccepted(),
        }),

    simulateDeclined: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "declined"],
            mutationFn: () => admissionService.devSimulateDeclined(),
        }),

    simulateExpired: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "expired"],
            mutationFn: () => admissionService.devSimulateExpired(),
        }),

    declineAdmission: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "decline"],
            mutationFn: () => admissionService.declineAdmission(),
        }),

    simulateTuitionPaid: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "tuition-paid"],
            mutationFn: () => admissionService.devSimulateTuitionPaid(),
        }),

    resetAll: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "dev", "reset"],
            mutationFn: () => admissionService.devResetAll(),
        }),
};
