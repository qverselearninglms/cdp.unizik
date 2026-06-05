/* ------------------------------------------------------------------ */
/*  Admission Module — Zustand Store                                   */
/* ------------------------------------------------------------------ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdmissionStudent, FeeSchedule, AdmissionStep } from "../types/admission";

interface AdmissionState {
    student: AdmissionStudent | null;
    fees: FeeSchedule | null;
    currentStep: AdmissionStep;

    /* Actions */
    setStudent: (student: AdmissionStudent) => void;
    setFees: (fees: FeeSchedule) => void;
    computeStep: () => void;
    reset: () => void;
}

/**
 * Derives the current step from the student's data.
 * This is the single source of truth for which section to display.
 */
function deriveStep(student: AdmissionStudent | null): AdmissionStep {
    if (!student) return 0; // APPLICATION_PAYMENT

    // Step 0 → Application payment not done
    if (student.application_payment_status !== "paid") return 0;

    // Step 1 → Paid but has not applied yet
    if (!student.has_applied) return 1;

    // Step 2 → Applied but admission not yet offered/accepted
    if (student.admission_status === "pending" || student.admission_status === "rejected"
        || student.admission_status === "declined" || student.admission_status === "expired") return 2;

    // Step 3 → Admission offered or accepted, needs acceptance fee payment
    if (student.acceptance_payment_status !== "paid") return 3;

    // Step 4 → Acceptance fee paid, tuition not paid
    if (student.acceptance_payment_status === "paid" && student.tuition_payment_status !== "paid") return 4;

    // Step 5 → Everything done
    return 5;
}

export const useAdmissionStore = create<AdmissionState>()(
    persist(
        (set, get) => ({
            student: null,
            fees: null,
            currentStep: 0,

            setStudent: (student) => {
                set({ student });
                // Recompute step whenever student data changes
                set({ currentStep: deriveStep(student) });
            },

            setFees: (fees) => set({ fees }),

            computeStep: () => {
                const { student } = get();
                set({ currentStep: deriveStep(student) });
            },

            reset: () =>
                set({
                    student: null,
                    fees: null,
                    currentStep: 0,
                }),
        }),
        {
            name: "qhub-admission",
            partialize: (state) => ({
                student: state.student,
                fees: state.fees,
                currentStep: state.currentStep,
            }),
        }
    )
);
