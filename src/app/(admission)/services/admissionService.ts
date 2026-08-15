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
    AdmissionStudentResponse,
    ApplicationStatus,
    FeeSchedule,
    LmsCategory,
    PaymentInitiationResponse,
    PaymentStatus,
    PaymentVerificationResponse,
    TuitionPaymentPayload,
} from "../types/admission";
import type { UserInterface } from "@/types/global";
import { ACCEPTANCE_FEE_AMOUNT, APPLICATION_FEE_AMOUNT, FULL_TUITION_FEE_AMOUNT } from "@/config/global.config";
import { apiClient } from "@/core/client";
import { getSelectedProgramPaymentInfo } from "@/lib/program-payment-context";

interface AccessFeePaymentPayload {
    amount: number;
    fee_type: "access_fee";
    program_id?: number;
    category_id?: number;
    program_name?: string;
    access_fee_amount?: number | null;
    tuition_amount?: number | null;
    duration?: string | null;
    source?: "create-account";
    selected_at?: string;
}

interface ProgramPaymentMeta {
    programId?: number;
    programName?: string;
    accessFeeAmount?: number | null;
    tuitionAmount?: number | null;
    duration?: string | null;
    selectedAt?: string;
}

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
            name: "Access Fee",
            slug: "access_fee",
            amount: 10_000,
            currency: "NGN",
            description: "Non-refundable access fee required before completing admission",
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
let latestAdmissionStudent: AdmissionStudent | null = null;

function parseAmount(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(0, Math.round(value));
    }

    if (typeof value === "string") {
        const stripped = value.replace(/[^\d.]/g, "").trim();
        if (!stripped) return null;

        const numeric = Number(stripped);
        if (!Number.isFinite(numeric)) return null;

        return Math.max(0, Math.round(numeric));
    }

    return null;
}

function getProgramMetaFromCategory(category?: LmsCategory | null): ProgramPaymentMeta | null {
    if (!category) return null;

    const accessFee = parseAmount(category.access_fee) ?? parseAmount(category.meta?.[1]);
    const tuition = parseAmount(category.tuition) ?? parseAmount(category.meta?.[0]);
    const duration = category.duration ?? (typeof category.meta?.[2] === "string" ? category.meta[2] : null);

    return {
        programId: category.id,
        programName: category.name,
        accessFeeAmount: accessFee,
        tuitionAmount: tuition,
        duration,
    };
}

function getProgramPaymentMeta(): ProgramPaymentMeta | null {
    const fromLocal = getSelectedProgramPaymentInfo();
    const fromStudent = getProgramMetaFromCategory(latestAdmissionStudent?.lms_category);

    if (fromLocal && fromStudent) {
        // If selected program in current browser session differs from server profile,
        // prioritize the latest explicit user selection for payment context.
        if (fromLocal.programId !== fromStudent.programId) {
            return {
                programId: fromLocal.programId,
                programName: fromLocal.programName,
                accessFeeAmount: fromLocal.accessFeeAmount,
                tuitionAmount: fromLocal.tuitionAmount,
                duration: fromLocal.duration,
                selectedAt: fromLocal.updatedAt,
            };
        }

        return {
            ...fromStudent,
            accessFeeAmount: fromLocal.accessFeeAmount ?? fromStudent.accessFeeAmount,
            tuitionAmount: fromLocal.tuitionAmount ?? fromStudent.tuitionAmount,
            duration: fromLocal.duration ?? fromStudent.duration,
            selectedAt: fromLocal.updatedAt,
        };
    }

    if (fromStudent) {
        return {
            ...fromStudent,
            selectedAt: new Date().toISOString(),
        };
    }

    if (!fromLocal) return null;

    return {
        programId: fromLocal.programId,
        programName: fromLocal.programName,
        accessFeeAmount: fromLocal.accessFeeAmount,
        tuitionAmount: fromLocal.tuitionAmount,
        duration: fromLocal.duration,
        selectedAt: fromLocal.updatedAt,
    };
}

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
        lms_category: apiData.lms_category ?? null,
    };
}

function extractStudentPayload(
    response: AdmissionStudent | AdmissionStudentResponse | { data?: AdmissionStudent }
): AdmissionStudent {
    const candidate = response as AdmissionStudentResponse;

    if (candidate?.data && typeof candidate.data === "object" && "id" in candidate.data) {
        return candidate.data;
    }

    const direct = response as AdmissionStudent;
    return direct;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

export const admissionService = {
    /* ---------- Fees ---------- */
    async fetchFees(): Promise<FeeSchedule> {
        // TODO: replace with → apiClient.get<FeeSchedule>("/admission/fees", { access_token: true })
        await delay(800);
        const selectedProgramFee = getProgramPaymentMeta();

        return {
            ...MOCK_FEES,
            fees: MOCK_FEES.fees.map((fee) => {
                if (fee.slug === "access_fee") {
                    return {
                        ...fee,
                        amount: selectedProgramFee?.accessFeeAmount ?? fee.amount,
                        description: selectedProgramFee?.programName
                            ? `Access fee for ${selectedProgramFee.programName}`
                            : fee.description,
                    };
                }

                if (fee.slug === "tuition_fee") {
                    return {
                        ...fee,
                        amount: selectedProgramFee?.tuitionAmount ?? fee.amount,
                        description: selectedProgramFee?.programName
                            ? `Tuition fee for ${selectedProgramFee.programName}`
                            : fee.description,
                    };
                }

                return fee;
            }),
        };
    },

    /* ---------- Student Data ---------- */
    async fetchStudentAdmission(user?: UserInterface): Promise<AdmissionStudent> {
        const response = await apiClient.get<AdmissionStudent | AdmissionStudentResponse>(
            "/admission/student",
            { access_token: true }
        );

        const studentData = extractStudentPayload(response.data as AdmissionStudent | AdmissionStudentResponse);
        // 2. Seed mock states on the first fetch so simulations have base data
        const transformed = transformStudentData(studentData);
        latestAdmissionStudent = transformed;
        if (!initialMockStudent) {
            initialMockStudent = { ...transformed };
        }
        if (!mockStudent) {
            mockStudent = { ...transformed };
        }
        return transformed;
    },

    /* ---------- Initiate Application Payment ---------- */
    async initiateApplicationPayment(amount?: number): Promise<PaymentInitiationResponse> {
        const selectedProgramFee = getProgramPaymentMeta();
        const payloadAmount = amount ?? selectedProgramFee?.accessFeeAmount ?? APPLICATION_FEE_AMOUNT;

        const payload: AccessFeePaymentPayload = {
            amount: payloadAmount,
            fee_type: "access_fee",
            source: "create-account",
        };

        if (selectedProgramFee) {
            payload.program_id = selectedProgramFee.programId;
            payload.category_id = selectedProgramFee.programId;
            payload.program_name = selectedProgramFee.programName;
            payload.access_fee_amount = selectedProgramFee.accessFeeAmount;
            payload.tuition_amount = selectedProgramFee.tuitionAmount;
            payload.duration = selectedProgramFee.duration;
            payload.selected_at = selectedProgramFee.selectedAt;
        }

        const response = await apiClient.post<PaymentInitiationResponse>(
            "/application/initialize-payment",
            payload,
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
        createApiMutationOptions<PaymentInitiationResponse, number | undefined>({
            mutationKey: [...admissionKeys.all, "payments", "application", "initiate"],
            mutationFn: (amount) => admissionService.initiateApplicationPayment(amount),
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
