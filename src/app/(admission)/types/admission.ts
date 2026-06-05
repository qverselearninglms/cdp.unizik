/* ------------------------------------------------------------------ */
/*  Admission Module — Type Definitions                                */
/* ------------------------------------------------------------------ */

export type PaymentStatus = "unpaid" | "pending" | "partial" | "paid" | "failed";
export type AdmissionOfferStatus = "pending" | "offered" | "rejected" | "accepted" | "declined" | "expired";
export type ApplicationStatus = "not_started" | "submitted" | "under_review";

/** Represents a single fee item from the API */
export interface FeeItem {
    id: string;
    name: string;
    slug: string;
    amount: number;
    currency: string;
    description?: string;
}

/** Complete fee schedule returned by the backend */
export interface FeeSchedule {
    session: string;
    fees: FeeItem[];
}

/** Student's admission progress from the backend */
export interface AdmissionStudent {
    id: string;
    name: string;
    email: string;
    department: string;
    faculty: string;
    application_payment_status: PaymentStatus;
    application_status: ApplicationStatus;
    admission_status: AdmissionOfferStatus;
    acceptance_payment_status: PaymentStatus;
    tuition_payment_status: PaymentStatus;
    tuition_amount_paid: number;
    has_applied: boolean;
    is_admitted: boolean;
    session: string;
    offer_expiry_date: string | null;
}

/** Payment initiation response from the backend */
export interface PaymentInitiationResponse {
    success: boolean;
    reference: string;
    gateway_url: string;
    message?: string;
}

/** Payment verification response from the backend */
export interface PaymentVerificationResponse {
    success: boolean;
    status: PaymentStatus;
    reference: string;
    amount: number;
    message?: string;
}

/** Admission workflow steps (ordered) */
export enum AdmissionStep {
    APPLICATION_PAYMENT = 0,
    APPLICATION_FORM = 1,
    ADMISSION_STATUS = 2,
    ACCEPTANCE_FEE = 3,
    TUITION_PAYMENT = 4,
    COMPLETED = 5,
}

/** Props shared by all step section components */
export interface StepSectionProps {
    student: AdmissionStudent;
    fees: FeeSchedule;
    onRefresh: () => void;
}
