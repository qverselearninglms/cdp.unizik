/* ------------------------------------------------------------------ */
/*  Admission Module — Zustand Store                                   */
/* ------------------------------------------------------------------ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdmissionStudent, FeeSchedule, AdmissionStep } from "../types/admission";
import { apiClient } from "@/core/client";

// Type for program choice
interface ProgramChoice {
    id: number;
    name: string;
    parent: number;
    sortorder: number;
}

// Type for the feature JSON
// interface FeatureData {
//     choice_programs: ProgramChoice[];
//     // add other fields as needed
// }
interface FeatureData {
  choice_programs: Array<{
    id: number;
    name: string;
    parent: number;
    sortorder: number;
  }>;
  // ... other fields
}

interface AdmissionState {
    student: AdmissionStudent | null;
    fees: FeeSchedule | null;
    currentStep: AdmissionStep;

    // NEW: feature flags
    featureData: FeatureData | null;
    featureLoading: boolean;
    featureError: string | null;

    /* Actions */
    setStudent: (student: AdmissionStudent) => void;
    setFees: (fees: FeeSchedule) => void;
    computeStep: () => void;
    reset: () => void;

    // NEW: action to fetch feature data
    fetchFeatureData: () => Promise<void>;

    // NEW: computed getter (optional)
    shouldSkipApplicationPayment: () => boolean;
}

/**
 * Derives the current step from the student's data.
 * This is the single source of truth for which section to display.
 */
// function deriveStep(student: AdmissionStudent | null): AdmissionStep {
//     if (!student) return 0; // APPLICATION_PAYMENT

//     // Step 0 → Application payment not done
//     if (student.application_payment_status !== "paid") return 0;

//     // Step 1 → Paid but has not applied yet
//     if (!student.has_applied) return 1;

//     // Step 2 → Applied but admission not yet offered/accepted
//     if (student.admission_status === "pending" || student.admission_status === "rejected"
//         || student.admission_status === "declined" || student.admission_status === "expired") return 2;

//     // Step 3 → Admission offered or accepted, needs acceptance fee payment
//     if (student.acceptance_payment_status !== "paid") return 3;

//     // Step 4 → Acceptance fee paid, tuition not paid
//     if (student.acceptance_payment_status === "paid" && student.tuition_payment_status !== "paid") return 4;

//     // Step 5 → Everything done
//     return 5;
// }
function deriveStep(
    student: AdmissionStudent | null,
    shouldSkipApplicationPayment: boolean = false
): AdmissionStep {
    if (!student) return 0;

    // // Step 0 → Application payment not done
    // if (student.application_payment_status !== "paid") return 0;
    // Override: treat application as paid if skip flag is true
    const appPaid = shouldSkipApplicationPayment || student.application_payment_status === "paid";

    // Step 0 → Application payment not done (only if not skipped)
    if (!appPaid) return 0;

    // Step 1 → Paid but has not applied yet
    if (!student.has_applied) return 1;

    // Step 2 → Applied but admission not yet decided, or offered but not yet accepted
    if (
        student.admission_status === "pending" ||
        student.admission_status === "offered" ||  // ← was missing; student must accept/decline first
        student.admission_status === "rejected" ||
        student.admission_status === "declined" ||
        student.admission_status === "expired"
    ) return 2;

    // Step 3 → Admission accepted, acceptance fee not yet paid
    // Only reachable when admission_status === "accepted"
    if (student.acceptance_payment_status !== "paid") return 3;

    // Step 4 → Acceptance fee paid, tuition not yet paid
    if (student.tuition_payment_status !== "paid") return 4;

    // Step 5 → Everything done
    return 5;
}

export const useAdmissionStore = create<AdmissionState>()(
    persist(
        (set, get) => ({
            student: null,
            fees: null,
            currentStep: 0,
            featureData: null,
            featureLoading: false,
            featureError: null,

            // setStudent: (student) => {
            //     set({ student });
            //     // Recompute step whenever student data changes
            //     set({ currentStep: deriveStep(student) });
            // },

            // Inside useAdmissionStore definition
            // setStudent: (newStudentData) => {
            //     set((state) => {
            //         // 💡 Merge new data with current state to preserve existing fields
            //         const updatedStudent = state.student
            //             ? { ...state.student, ...newStudentData }
            //             : newStudentData;

            //         return {
            //             student: updatedStudent,
            //             currentStep: deriveStep(updatedStudent)
            //         };
            //     });
            // },
            setStudent: (newStudentData) => {
                set((state) => {
                    const updatedStudent = state.student
                        ? { ...state.student, ...newStudentData }
                        : newStudentData;
                    const skip = !!state.featureData?.choice_programs.some(
                        (p) => p.name === 'CERTIFICATE PROGRAMS'
                    );
                    return {
                        student: updatedStudent,
                        currentStep: deriveStep(updatedStudent, skip),
                    };
                });
            },

            setFees: (fees) => set({ fees }),

            // computeStep: () => {
            //     const { student } = get();
            //     set({ currentStep: deriveStep(student) });
            // },
            computeStep: () => {
                const { student, featureData } = get();
                const skip = !!featureData?.choice_programs.some(
                    (p) => p.name === 'CERTIFICATE PROGRAMS'
                );
                set({ currentStep: deriveStep(student, skip) });
            },

            // reset: () =>
            //     set({
            //         student: null,
            //         fees: null,
            //         currentStep: 0,
            //     }),
            reset: () => set({
                student: null,
                fees: null,
                currentStep: 0,
                featureData: null,
                featureLoading: false,
                featureError: null,
            }),

            // NEW: fetch feature data
            fetchFeatureData: async () => {
                const { featureData } = get();
                if (featureData) return; // prevent re-fetch

                set({ featureLoading: true, featureError: null });
                try {
                    // const response = await apiClient.get<FeatureData>(
                    //     '/api/map-course-data/example/student-academic-data'
                    // );
                    const res = await fetch('/api/map-course-data/example/student-academic-data');
                    if (!res.ok) throw new Error('Failed to fetch');
                    const data = await res.json();
                    set({ featureData: data, featureLoading: false });

                    const newFeatureData = data;
                    set((state) => {
                        // Recompute step if student already exists
                        const newState: Partial<AdmissionState> = {
                            featureData: newFeatureData,
                            featureLoading: false,
                        };
                        if (state.student) {
                            // const skip = !!newFeatureData?.choice_programs.some(
                            //     (p) => p.name === 'CERTIFICATE PROGRAMS'
                            // );
                            const skip = !!newFeatureData?.choice_programs.some(
                                (p: FeatureData['choice_programs'][0]) => p.name === 'CERTIFICATE PROGRAMS'
                            );
                            newState.currentStep = deriveStep(state.student, skip);
                        }
                        return newState;
                    });
                } catch (error) {
                    set({ featureError: (error as Error).message, featureLoading: false });
                }
            },

            // NEW: helper to compute skip flag from featureData
            shouldSkipApplicationPayment: () => {
                const { featureData } = get();
                return !!featureData?.choice_programs.some(
                    (p) => p.name === 'CERTIFICATE PROGRAMS'
                );
            },
        }),
        {
            name: "qhub-admission",
            // partialize: (state) => ({
            //     student: state.student,
            //     fees: state.fees,
            //     currentStep: state.currentStep,
            // }),
            partialize: (state) => ({
                student: state.student,
                fees: state.fees,
                currentStep: state.currentStep,
                featureData: state.featureData, // persist to avoid re-fetch
            }),
        }
    )
);
