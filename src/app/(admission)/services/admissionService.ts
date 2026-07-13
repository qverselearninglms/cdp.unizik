/* ------------------------------------------------------------------ */
/*  Admission Module — API Service                                     */
/*                                                                     */
/*  Replace the mock implementations with real apiClient calls when    */
/*  connecting to the live backend. The interface stays the same.      */
/* ------------------------------------------------------------------ */

import {
    createApiMutationOptions,
    createApiQueryOptions,
} from "@/lib/clients/apiClient";
import type {
    AdmissionOfferStatus,
    AdmissionStudent,
    ApplicationStatus,
    FeeSchedule,
    PaymentInitiationResponse,
    PaymentStatus,
    PaymentVerificationResponse,
    TuitionPaymentPayload,
} from "../types/admission";
import type { UserInterface } from "@/types/global";
import { ACCEPTANCE_FEE_AMOUNT, APPLICATION_FEE_AMOUNT, FULL_TUITION_FEE_AMOUNT } from "@/config/global.config";
import { apiClient } from "@/core/client";

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


/* ------------------------------------------------------------------ */
/*  Helper Functions                                                   */
/* ------------------------------------------------------------------ */

function mapPaymentStatus(apiStatus: string): PaymentStatus {
    switch (apiStatus) {
        case 'fully_paid': return 'paid';
        case 'paid': return 'paid';
        case 'partially_paid': return 'partial';
        case 'pending': return 'pending';
        case 'failed': return 'failed';
        default: return 'unpaid';
    }
}

function mapAdmissionStatus(apiStatus: string): AdmissionOfferStatus {
    switch (apiStatus) {
        case 'offered': return 'offered';
        case 'accepted': return 'accepted';
        case 'rejected': return 'rejected';
        case 'declined': return 'declined';
        case 'expired': return 'expired';
        default: return 'pending';
    }
}

function mapApplicationStatus(apiStatus: string): ApplicationStatus {
    switch (apiStatus) {
        case 'submitted': return 'submitted';
        case 'under_review': return 'under_review';
        default: return 'not_started';
    }
}


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

function transformStudentData(apiData: AdmissionStudent): AdmissionStudent {
    return {
        id: String(apiData.id),
        name: apiData.name,
        email: apiData.email,
        department: apiData.department,
        faculty: apiData.faculty,
        application_payment_status: mapPaymentStatus(apiData.application_payment_status),
        application_status: mapApplicationStatus(apiData.application_status),
        admission_status: mapAdmissionStatus(apiData.admission_status),
        acceptance_payment_status: mapPaymentStatus(apiData.acceptance_payment_status),
        tuition_payment_status: mapPaymentStatus(apiData.tuition_payment_status),
        tuition_amount_paid: (apiData.tuition_amount_paid),
        has_applied: apiData.has_applied,
        is_admitted: apiData.is_admitted,
        session: apiData.session,
        offer_expiry_date: apiData.offer_expiry_date,
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
        const response = await apiClient.get<AdmissionStudent>(
            "/admission/student",
            { access_token: true }
        );

        const studentData = response.data;
        // 2. Seed mock states on the first fetch so simulations have base data
        const transformed = transformStudentData(studentData);
        if (!initialMockStudent) {
            initialMockStudent = { ...transformed };
        }
        if (!mockStudent) {
            mockStudent = { ...transformed };
        }
        return transformed;
    },

    /* ---------- Initiate Application Payment ---------- */
    async initiateApplicationPayment(): Promise<PaymentInitiationResponse> {
        const response = await apiClient.post<PaymentInitiationResponse>(
            "/application/initialize-payment",
            { amount: APPLICATION_FEE_AMOUNT },
            { access_token: true }
        );
        return response.data;
    },

    /* ---------- Verify Application Payment ---------- */
    async verifyApplicationPayment(reference: string): Promise<PaymentVerificationResponse> {
        const response = await apiClient.get<PaymentVerificationResponse>(
            "/application/verify-payment",
            {
                params: { reference },
                access_token: true
            }
        );

        const result = response as unknown as PaymentVerificationResponse;

        if (!result.success || !result.reference) {
            throw new Error('Invalid payment verification response');
        }

        return result;
    },

    /* ---------- Initiate Acceptance Fee Payment ---------- */
    async initiateAcceptanceFeePayment(): Promise<PaymentInitiationResponse> {
        const response = await apiClient.post<PaymentInitiationResponse>(
            "/application/initialize-acceptance-payment",
            { amount: ACCEPTANCE_FEE_AMOUNT },
            { access_token: true }
        );
        return response.data;
    },

    /* ---------- Verify Acceptance Fee Payment ---------- */
    async verifyAcceptanceFeePayment(reference: string): Promise<PaymentVerificationResponse> {
        const response = await apiClient.get<PaymentVerificationResponse>(
            "/application/verify-acceptance-payment",
            {
                params: { reference },
                access_token: true
            }
        );

        const result = response as unknown as PaymentVerificationResponse;

        if (!result.success || !result.reference) {
            throw new Error('Invalid payment verification response');
        }

        return result;
    },

    /* ---------- Initiate Tuition Payment ---------- */
    async initiateTuitionPayment(payload: TuitionPaymentPayload): Promise<PaymentInitiationResponse> {
        const response = await apiClient.post<PaymentInitiationResponse>(
            "/application/initialize-tuition-payment",
            payload,
            { access_token: true }
        );
        return response.data;
    },

    /* ---------- Verify Tuition Payment ---------- */
    async verifyTuitionPayment(reference: string): Promise<PaymentVerificationResponse> {
        const response = await apiClient.get<PaymentVerificationResponse>(
            "/application/verify-tuition-payment",
            {
                params: { reference },
                access_token: true
            }
        );

        const result = response as unknown as PaymentVerificationResponse;

        if (!result.success || !result.reference) {
            throw new Error('Invalid payment verification response');
        }

        return result;
    },

    /* ---------- Accept Admission ---------- */
    async acceptAdmission(): Promise<AdmissionStudent> {
        const response = await apiClient.post<AdmissionStudent>(
            // "/admission/accept",
            `/admission/respond`,
            { status: "accepted" },
            { access_token: true }
        );

        return transformStudentData(response.data);
    },

    /* ---------- Decline Admission ---------- */
    async declineAdmission(): Promise<AdmissionStudent> {
        const response = await apiClient.post<AdmissionStudent>(
            `/admission/respond`,
            { status: "declined" },
            { access_token: true }
        );

        return transformStudentData(response.data);
    },


    //     /* ---------- Dev-only: Simulate status changes ---------- */
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
            tuition_amount_paid: FULL_TUITION_FEE_AMOUNT,
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
            enabled: !!reference,
            retry: 2,
            staleTime: Infinity,
        }),

    verifyAcceptanceFeePayment: (reference: string) =>
        createApiQueryOptions({
            queryKey: admissionKeys.verifyAccPayment(reference),
            queryFn: () => admissionService.verifyAcceptanceFeePayment(reference),
            enabled: !!reference,
            retry: 2,
            staleTime: Infinity,
        }),

    verifyTuitionPayment: (reference: string) =>
        createApiQueryOptions({
            queryKey: admissionKeys.verifyTuiPayment(reference),
            queryFn: () => admissionService.verifyTuitionPayment(reference),
            enabled: !!reference,
            retry: 2,
            staleTime: Infinity,
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
        createApiMutationOptions<PaymentInitiationResponse, TuitionPaymentPayload>({
            mutationKey: [...admissionKeys.all, "payments", "tuition", "initiate"],
            mutationFn: admissionService.initiateTuitionPayment,
        }),

    acceptAdmission: () =>
        createApiMutationOptions<AdmissionStudent, void>({
            mutationKey: [...admissionKeys.all, "accept"],
            mutationFn: () => admissionService.acceptAdmission(),
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
