/* ------------------------------------------------------------------ */
/*  Admission Module — React Query Hooks                               */
/* ------------------------------------------------------------------ */

"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query";
import {
    admissionKeys,
    admissionMutationOptions,
    admissionQueryOptions,
    admissionService,
} from "../services/admissionService";
import { useAdmissionStore } from "../store/admissionStore";
import type { AdmissionStudent } from "../types/admission";
import { useAuthContext } from "@/providers/AuthProvider";
import type { UserInterface } from "@/types/global";

// async function syncAdmissionStudent(
//     queryClient: QueryClient,
//     setStudent: (student: AdmissionStudent) => void,
//     nextStudent?: AdmissionStudent,
// ) {
//     const student = nextStudent ?? await admissionService.fetchStudentAdmission();
//     setStudent(student);
//     queryClient.setQueryData(admissionKeys.student(), student);
//     return student;
// }
async function syncAdmissionStudent(
    queryClient: QueryClient,
    setStudent: (student: any) => void,
    nextStudent?: any, // Can be partial data or a mutation response
) {
    let updatedData: Partial<AdmissionStudent> = {};

    if (nextStudent) {
        // If the backend returned a response envelope containing an application wrapper
        if (nextStudent.application) {
            updatedData = nextStudent.application;
        } else {
            updatedData = nextStudent;
        }

        // Get what's currently in React Query's cache and merge the delta
        const currentCache = queryClient.getQueryData<AdmissionStudent>(admissionKeys.student()) || {};
        const mergedStudent = { ...currentCache, ...updatedData } as AdmissionStudent;

        setStudent(mergedStudent);
        queryClient.setQueryData(admissionKeys.student(), mergedStudent);
        return mergedStudent;
    }

    // Fallback: If no mutation data is passed, force a fresh, clean fetch of the full profile
    const freshStudent = await admissionService.fetchStudentAdmission();
    setStudent(freshStudent);
    queryClient.setQueryData(admissionKeys.student(), freshStudent);
    return freshStudent;
}

/* ------------------------------------------------------------------ */
/*  Accept Admission                                                     */
/* ------------------------------------------------------------------ */

export function useAcceptAdmission() {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    return useMutation({
        ...admissionMutationOptions.acceptAdmission(),
        onSuccess: async (data) => {
            await syncAdmissionStudent(queryClient, setStudent, data);
        },
    });
}

/* ------------------------------------------------------------------ */
/*  Fetch Fees                                                          */
/* ------------------------------------------------------------------ */

export function useFees() {
    const setFees = useAdmissionStore((s) => s.setFees);

    return useQuery({
        ...admissionQueryOptions.fees(),
        staleTime: 1000 * 60 * 10,
        queryFn: async () => {
            const data = await admissionService.fetchFees();
            setFees(data);
            return data;
        },
    });
}

/* ------------------------------------------------------------------ */
/*  Fetch Student Admission Data                                        */
/* ------------------------------------------------------------------ */

export function useStudentAdmission() {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const { user } = useAuthContext();

    return useQuery({
        ...admissionQueryOptions.student(user as UserInterface),
        enabled: !!user,
        staleTime: 1000 * 60,
        queryFn: async () => {
            const data = await admissionService.fetchStudentAdmission(user as UserInterface);
            console.log("Fetched student admission data:", data);
            setStudent(data);
            return data;
        },
    });
}

/* ------------------------------------------------------------------ */
/*  Initiate Application Payment                                        */
/* ------------------------------------------------------------------ */

export function useInitiateApplicationPayment() {
    return useMutation({
        ...admissionMutationOptions.initiateApplicationPayment(),
    });
}

/* ------------------------------------------------------------------ */
/*  Verify Application Payment                                          */
/* ------------------------------------------------------------------ */

export function useVerifyApplicationPayment(reference: string) {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    return useQuery({
        ...admissionQueryOptions.verifyApplicationPayment(reference),
        queryFn: async () => {
            const result = await admissionService.verifyApplicationPayment(reference);
            await syncAdmissionStudent(queryClient, setStudent);
            return result;
        },
        enabled: !!reference,
        retry: 2,
        staleTime: Infinity,
    });
}

/* ------------------------------------------------------------------ */
/*  Initiate Acceptance Fee Payment                                      */
/* ------------------------------------------------------------------ */

export function useInitiateAcceptanceFeePayment() {
    return useMutation({
        ...admissionMutationOptions.initiateAcceptanceFeePayment(),
    });
}

/* ------------------------------------------------------------------ */
/*  Verify Acceptance Fee Payment                                        */
/* ------------------------------------------------------------------ */

export function useVerifyAcceptanceFeePayment(reference: string) {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    return useQuery({
        ...admissionQueryOptions.verifyAcceptanceFeePayment(reference),
        queryFn: async () => {
            const result = await admissionService.verifyAcceptanceFeePayment(reference);
            await syncAdmissionStudent(queryClient, setStudent);
            return result;
        },
        enabled: !!reference,
        retry: 2,
        staleTime: Infinity,
    });
}

/* ------------------------------------------------------------------ */
/*  Initiate Tuition Payment                                             */
/* ------------------------------------------------------------------ */

export function useInitiateTuitionPayment() {
    return useMutation({
        ...admissionMutationOptions.initiateTuitionPayment(),
    });
}

/* ------------------------------------------------------------------ */
/*  Verify Tuition Payment                                               */
/* ------------------------------------------------------------------ */

export function useVerifyTuitionPayment(reference: string) {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    return useQuery({
        ...admissionQueryOptions.verifyTuitionPayment(reference),
        queryFn: async () => {
            const result = await admissionService.verifyTuitionPayment(reference);
            await syncAdmissionStudent(queryClient, setStudent);
            return result;
        },
        enabled: !!reference,
        retry: 2,
        staleTime: Infinity,
    });
}

/* ------------------------------------------------------------------ */
/*  Dev-only mutations                                                   */
/* ------------------------------------------------------------------ */

export function useDevSimulate() {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    const simulateAppPaymentPaid = useMutation({
        ...admissionMutationOptions.simulateAppPaymentPaid(),
        onSuccess: async (data) => { await syncAdmissionStudent(queryClient, setStudent, data); },
    });

    const simulateApplied = useMutation({
        ...admissionMutationOptions.simulateApplied(),
        onSuccess: async (data) => { await syncAdmissionStudent(queryClient, setStudent, data); },
    });

    const simulateOffered = useMutation({
        ...admissionMutationOptions.simulateOffered(),
        onSuccess: async (data) => { await syncAdmissionStudent(queryClient, setStudent, data); },
    });

    const simulateAccepted = useMutation({
        ...admissionMutationOptions.simulateAccepted(),
        onSuccess: async (data) => { await syncAdmissionStudent(queryClient, setStudent, data); },
    });

    const simulateDeclined = useMutation({
        ...admissionMutationOptions.simulateDeclined(),
        onSuccess: async (data) => { await syncAdmissionStudent(queryClient, setStudent, data); },
    });

    const simulateExpired = useMutation({
        ...admissionMutationOptions.simulateExpired(),
        onSuccess: async (data) => { await syncAdmissionStudent(queryClient, setStudent, data); },
    });

    const simulateTuitionPaid = useMutation({
        ...admissionMutationOptions.simulateTuitionPaid(),
        onSuccess: async (data) => { await syncAdmissionStudent(queryClient, setStudent, data); },
    });

    const resetAll = useMutation({
        ...admissionMutationOptions.resetAll(),
        onSuccess: async (data) => { await syncAdmissionStudent(queryClient, setStudent, data); },
    });

    return { simulateAppPaymentPaid, simulateApplied, simulateOffered, simulateAccepted, simulateDeclined, simulateExpired, simulateTuitionPaid, resetAll };
}

/* ------------------------------------------------------------------ */
/*  Decline Admission                                                    */
/* ------------------------------------------------------------------ */

export function useDeclineAdmission() {
    const setStudent = useAdmissionStore((s) => s.setStudent);
    const queryClient = useQueryClient();

    return useMutation({
        ...admissionMutationOptions.declineAdmission(),
        onSuccess: async (data) => {
            await syncAdmissionStudent(queryClient, setStudent, data);
        },
    });
}
