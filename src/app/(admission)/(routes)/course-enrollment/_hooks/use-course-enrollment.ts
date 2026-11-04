"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthContext } from "@/providers/AuthProvider";
import { useStudentAdmission } from "@/app/(admission)/hooks/useAdmissionQueries";
import {
    getSelectedProgramPaymentInfo,
    rememberPaymentIntent,
    setPendingAdmissionPaymentType,
} from "@/lib/program-payment-context";
import { lmsCourseService } from "@/lib/services/lmsCourseService";
import { verifyPayment, type VerifyResult } from "@/lib/payment-verification";
import { AccessPaymentRefused, enrollmentService } from "../_services/enrollment-service";
import type { EnrollmentPhase, EnrollmentProgram } from "../_types/enrollment";

export const enrollmentKeys = {
    courses: (programId: number) => ["course-enrollment", "courses", programId] as const,
    access: (programId: number) => ["course-enrollment", "access", programId] as const,
};

/** While a payment is in flight, re-check on this cadence (background only — never a wait). */
const LIVE_POLL_MS = 15_000;

/** Server states that mean "a payment is in flight" — keep the page fresh. */
const IN_FLIGHT = new Set(["payment_initiated", "checkout_open", "processing", "received_not_applied"]);

/**
 * The programme the student chose at registration.
 * Server record first (works on any device); the locally saved selection from
 * the sign-up flow is the fallback.
 */
function useEnrollmentProgram() {
    const { data: student, isLoading } = useStudentAdmission();
    const [local, setLocal] = useState<ReturnType<typeof getSelectedProgramPaymentInfo>>(null);

    // localStorage only exists after mount.
    useEffect(() => setLocal(getSelectedProgramPaymentInfo()), []);

    const program = useMemo<EnrollmentProgram | null>(() => {
        const category = student?.lms_category;
        if (category?.id) return { id: Number(category.id), name: category.name, source: "admission" };
        if (local?.programId) return { id: local.programId, name: local.programName, source: "registration" };
        return null;
    }, [student, local]);

    // Only wait on the admission record if there is no local fallback to show.
    return { program, isLoading: isLoading && !program };
}

export function useCourseEnrollment() {
    const queryClient = useQueryClient();
    const { user, isLoading: authLoading } = useAuthContext();
    const { program, isLoading: programLoading } = useEnrollmentProgram();
    const programId = program?.id ?? 0;

    const accessQuery = useQuery({
        queryKey: enrollmentKeys.access(programId),
        queryFn: () => enrollmentService.getAccessStatus(programId),
        enabled: !!user && !!programId,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        refetchInterval: (query) =>
            query.state.data && !query.state.data.accessGranted && IN_FLIGHT.has(query.state.data.paymentStatus)
                ? LIVE_POLL_MS
                : false,
    });

    /*
     * `payment_initiated` is ambiguous on the server today (checkout open OR
     * money received). Don't make the student wait it out: ask TransactPay
     * right now through verify, which returns a definite answer.
     */
    const access0 = accessQuery.data;
    const liveRef = access0 && !access0.accessGranted && access0.paymentStatus === "payment_initiated" ? access0.reference : null;
    const liveQuery = useQuery<VerifyResult>({
        queryKey: ["course-enrollment", "live-check", liveRef],
        queryFn: () => verifyPayment("access", { transRef: liveRef!, reference: liveRef! }),
        enabled: !!liveRef,
        staleTime: 0,
        retry: 1,
        refetchInterval: (q) => (q.state.data?.outcome === "pending" ? LIVE_POLL_MS : false),
    });

    // Verify credits the payment when it finds it paid — re-read the server state.
    const liveOutcome = liveQuery.data?.outcome;
    useEffect(() => {
        if (liveOutcome === "paid" && programId) {
            queryClient.invalidateQueries({ queryKey: enrollmentKeys.access(programId) });
        }
    }, [liveOutcome, programId, queryClient]);

    const coursesQuery = useQuery({
        queryKey: enrollmentKeys.courses(programId),
        queryFn: () => enrollmentService.getProgramCourses(programId),
        enabled: !!user && !!programId,
        staleTime: 5 * 60_000,
    });

    const refresh = () => {
        if (!programId) return;
        queryClient.invalidateQueries({ queryKey: enrollmentKeys.access(programId) });
        queryClient.invalidateQueries({ queryKey: enrollmentKeys.courses(programId) });
        if (liveRef) liveQuery.refetch();
    };

    const payMutation = useMutation({
        mutationFn: () =>
            enrollmentService.initiateAccessPayment({
                programId,
                programName: program?.name ?? "",
                amount: accessQuery.data?.amount ?? null,
            }),
        onSuccess: (result) => {
            // Belt and braces for /verify-payments; the TP-AXS- reference prefix
            // and the server-added fee_type already identify the fee.
            setPendingAdmissionPaymentType("access");
            if (result.reference) {
                rememberPaymentIntent({
                    reference: result.reference,
                    type: "access",
                    amount: result.amount,
                    programId,
                    programName: program?.name ?? null,
                });
            }
            toast.success("Redirecting you to the secure payment page…");
            window.location.href = result.authorizationUrl;
        },
        onError: (error: Error) => {
            if (error instanceof AccessPaymentRefused) {
                // 409 already unlocked / 422 not payable yet — the server state moved; re-read it.
                if (error.reason === "already_granted") toast.success(error.message);
                else toast.error(error.message);
                refresh();
                return;
            }
            toast.error(error.message || "We couldn't start the payment. Please try again.");
        },
    });

    const access = accessQuery.data;

    const phase: EnrollmentPhase = (() => {
        if (authLoading) return "loading";
        if (!user) return "signed_out";
        if (programLoading) return "loading";
        if (!program) return "no_program";
        if (accessQuery.isLoading) return "loading";
        if (accessQuery.isError || !access) return "error";
        if (access.accessGranted) return "unlocked";

        switch (access.paymentStatus) {
            // Proposed precise states: the server already knows, no check needed.
            case "received_not_applied":
                return "received";
            case "processing":
                return "processing";
            case "checkout_open":
                return "not_completed";
            // Today's ambiguous state: resolved live via TransactPay.
            case "payment_initiated": {
                if (!access.reference) return "not_completed";
                if (liveQuery.isLoading) return "checking";
                if (liveQuery.isError) return "check_failed";
                switch (liveQuery.data?.outcome) {
                    case "paid":
                        return "unlocked";
                    case "needs_attention":
                    case "amount_mismatch":
                        return "received";
                    case "error":
                        return "check_failed";
                    case "failed":
                        return "failed";
                    case "pending":
                        return "not_completed";
                    default:
                        // missing/unknown/ignored: that checkout isn't a live payment.
                        return access.payable ? "locked" : "not_payable";
                }
            }
        }

        if (!access.payable) return "not_payable";
        if (access.paymentStatus === "failed") return "failed";
        return "locked";
    })();

    const continueLearning = () => {
        const username = (user?.school_reg_number as string | undefined) || user?.username;
        if (!username) {
            toast.error("Your student username isn't available yet. Please sign out and back in.");
            return;
        }
        lmsCourseService.redirectToCourseWarePlatform(String(username));
    };

    return {
        user,
        program,
        phase,
        access,
        accessError: accessQuery.error as Error | null,
        isCheckingAccess: accessQuery.isFetching || liveQuery.isFetching,
        /** What we know about the in-flight payment, for the status card. */
        payment: {
            reference: liveQuery.data?.reference ?? access?.reference ?? null,
            outcome: liveQuery.data?.outcome ?? null,
            message: liveQuery.data?.message ?? access?.statusMessage ?? null,
            checkedAt: Math.max(liveQuery.dataUpdatedAt, accessQuery.dataUpdatedAt) || null,
            resumeUrl: access?.checkoutUrl ?? null,
        },
        courses: coursesQuery.data ?? [],
        coursesLoading: coursesQuery.isLoading,
        coursesError: coursesQuery.error as Error | null,
        pay: () => payMutation.mutate(),
        // Stays true after success: the browser is navigating to the gateway.
        isStartingPayment: payMutation.isPending || payMutation.isSuccess,
        refresh,
        continueLearning,
    };
}

export type CourseEnrollmentState = ReturnType<typeof useCourseEnrollment>;
