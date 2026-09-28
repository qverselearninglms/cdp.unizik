"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    useFees,
    useStudentAdmission,
    useDevSimulate,
} from "../../hooks/useAdmissionQueries";
import { admissionKeys } from "../../services/admissionService";
import {
    AdmissionStepIndicator,
    ApplicationPaymentSection,
    ApplicationFormSection,
    AdmissionStatusSection,
    TuitionPaymentSection,
    AdmissionCompleteSection,
} from "../../components";
import { AdmissionStep } from "../../types/admission";
import { GraduationCap, RotateCcw, Loader2 } from "lucide-react";
import { useAdmissionStore } from "../../store/admissionStore";
import { getSelectedProgramPaymentInfo } from "@/lib/program-payment-context";

function parseAmount(value?: string | number): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const sanitized = value.replace(/[^\d.]/g, "").trim();
        if (!sanitized) return null;
        const numeric = Number(sanitized);
        if (Number.isFinite(numeric)) return numeric;
    }
    return null;
}

function formatCurrency(value?: string | number): string {
    const parsed = parseAmount(value);
    if (parsed === null) return "TBA";
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(parsed);
}

function statusChipClasses(status?: string): string {
    switch (status) {
        case "paid":
            return "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200";
        case "pending":
            return "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
        case "failed":
            return "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/50 dark:text-red-200";
        case "partial":
            return "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200";
        default:
            return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
    }
}

function statusLabel(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ProcessAdmissionPage() {
    const queryClient = useQueryClient();
    const { data: fees, isLoading: feesLoading } = useFees();
    const { data: student, isLoading: studentLoading, refetch } = useStudentAdmission();
    const currentStep = useAdmissionStore((s) => s.currentStep);
    const displayStep = currentStep >= AdmissionStep.TUITION_PAYMENT
        ? currentStep - 1
        : currentStep;
    const { resetAll, simulateAppPaymentPaid, simulateApplied, simulateOffered, simulateAccepted, simulateDeclined, simulateExpired, simulateTuitionPaid } = useDevSimulate();

    /* Re-compute step whenever student data updates */
    const computeStep = useAdmissionStore((s) => s.computeStep);
    useEffect(() => {
        if (student) computeStep();
    }, [student, computeStep]);

    const handleRefresh = async () => {
        await queryClient.invalidateQueries({ queryKey: admissionKeys.student() });
        refetch();
    };

    const isLoading = feesLoading || studentLoading;
    const selectedProgram = getSelectedProgramPaymentInfo();
    const course = student?.lms_category;
    const effectiveCourse = {
        id: selectedProgram?.programId ?? course?.id,
        name: selectedProgram?.programName ?? course?.name,
        tuition: selectedProgram?.tuitionAmount ?? course?.tuition ?? (course?.meta?.[0] as string | number | undefined),
        accessFee: selectedProgram?.accessFeeAmount ?? course?.access_fee ?? (course?.meta?.[1] as string | number | undefined),
        duration: selectedProgram?.duration ?? course?.duration ?? (course?.meta?.[2] as string | undefined),
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 space-y-1"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5 dark:bg-primary/20">
                        <GraduationCap className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Admission Process
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {student
                                ? `Welcome, ${student.name} — Session: ${student.session}`
                                : "Complete all steps to finalize your admission"}
                        </p>
                    </div>
                </div>
            </motion.div>

            {!isLoading && student && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Applicant Details
                    </p>
                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <p className="text-slate-700 dark:text-slate-200">
                            Name: <span className="font-semibold">{student.name}</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-200">
                            Email: <span className="font-semibold">{student.email}</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-200">
                            Session: <span className="font-semibold">{student.session}</span>
                        </p>
                    </div>

                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                            Applied Course Information
                        </p>

                        {effectiveCourse.name ? (
                            <>
                                <p className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                    {effectiveCourse.name}
                                </p>
                                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                    <p className="text-emerald-800 dark:text-emerald-200">
                                        Program ID: <span className="font-semibold">#{effectiveCourse.id ?? "TBA"}</span>
                                    </p>
                                    <p className="text-emerald-800 dark:text-emerald-200">
                                        Access Fee: <span className="font-semibold">{formatCurrency(effectiveCourse.accessFee)}</span>
                                    </p>
                                    <p className="text-emerald-800 dark:text-emerald-200">
                                        Tuition: <span className="font-semibold">{formatCurrency(effectiveCourse.tuition)}</span>
                                    </p>
                                    <p className="text-emerald-800 dark:text-emerald-200">
                                        Duration: <span className="font-semibold">{effectiveCourse.duration ?? "TBA"}</span>
                                    </p>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusChipClasses(student.application_payment_status)}`}>
                                        Access Payment: {statusLabel(student.application_payment_status)}
                                    </span>
                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusChipClasses(student.tuition_payment_status)}`}>
                                        Tuition Payment: {statusLabel(student.tuition_payment_status)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
                                No course has been attached to this admission profile yet.
                            </p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Step indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8 rounded-2xl border border-border/50 bg-card/50 p-4 shadow-sm backdrop-blur-sm"
            >
                <AdmissionStepIndicator currentStep={displayStep} />
            </motion.div>

            {/* Loading skeleton */}
            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>
            )}

            {/* Step sections — AnimatePresence for smooth transitions */}
            {!isLoading && student && fees && (
                <AnimatePresence mode="wait">
                    {currentStep === AdmissionStep.APPLICATION_PAYMENT && (
                        <ApplicationPaymentSection
                            key="app-payment"
                            student={student}
                            fees={fees}
                            onRefresh={handleRefresh}
                        />
                    )}

                    {currentStep === AdmissionStep.APPLICATION_FORM && (
                        <ApplicationFormSection
                            key="app-form"
                            student={student}
                            fees={fees}
                            onRefresh={handleRefresh}
                        />
                    )}

                    {currentStep === AdmissionStep.ADMISSION_STATUS && (
                        <AdmissionStatusSection
                            key="admission-status"
                            student={student}
                            fees={fees}
                            onRefresh={handleRefresh}
                        />
                    )}

                    {(currentStep === AdmissionStep.ACCEPTANCE_FEE || currentStep === AdmissionStep.TUITION_PAYMENT) && (
                        <TuitionPaymentSection
                            key="tuition-payment"
                            student={student}
                            fees={fees}
                            onRefresh={handleRefresh}
                        />
                    )}

                    {currentStep === AdmissionStep.COMPLETED && (
                        <AdmissionCompleteSection
                            key="completed"
                            student={student}
                            fees={fees}
                            onRefresh={handleRefresh}
                        />
                    )}
                </AnimatePresence>
            )}

            {/* Dev toolbar — only in development */}
            {process.env.NODE_ENV === "development" && !isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4 dark:bg-amber-500/10"
                >
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        🛠 Development Controls — Simulate Workflow Steps
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => simulateAppPaymentPaid.mutate()}
                            disabled={simulateAppPaymentPaid.isPending}
                            className="gap-1.5 text-xs"
                        >
                            {simulateAppPaymentPaid.isPending && (
                                <Loader2 className="size-3 animate-spin" />
                            )}
                            Step 0→1: Access Fee Paid
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => simulateApplied.mutate()}
                            disabled={simulateApplied.isPending}
                            className="gap-1.5 text-xs"
                        >
                            {simulateApplied.isPending && (
                                <Loader2 className="size-3 animate-spin" />
                            )}
                            Step 1→2: Form Submitted
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => simulateOffered.mutate()}
                            disabled={simulateOffered.isPending}
                            className="gap-1.5 text-xs"
                        >
                            {simulateOffered.isPending && (
                                <Loader2 className="size-3 animate-spin" />
                            )}
                            Step 2→3: Admission Offered
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => simulateAccepted.mutate()}
                            disabled={simulateAccepted.isPending}
                            className="gap-1.5 text-xs"
                        >
                            {simulateAccepted.isPending && (
                                <Loader2 className="size-3 animate-spin" />
                            )}
                            Mark Admission Accepted
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => simulateDeclined.mutate()}
                            disabled={simulateDeclined.isPending}
                            className="gap-1.5 text-xs text-destructive"
                        >
                            {simulateDeclined.isPending && (
                                <Loader2 className="size-3 animate-spin" />
                            )}
                            Simulate: Declined
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => simulateExpired.mutate()}
                            disabled={simulateExpired.isPending}
                            className="gap-1.5 text-xs text-amber-600"
                        >
                            {simulateExpired.isPending && (
                                <Loader2 className="size-3 animate-spin" />
                            )}
                            Simulate: Expired
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => simulateTuitionPaid.mutate()}
                            disabled={simulateTuitionPaid.isPending}
                            className="gap-1.5 text-xs"
                        >
                            {simulateTuitionPaid.isPending && (
                                <Loader2 className="size-3 animate-spin" />
                            )}
                            Mark Tuition Paid
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetAll.mutate()}
                            disabled={resetAll.isPending}
                            className="gap-1.5 text-xs text-destructive"
                        >
                            {resetAll.isPending ? (
                                <Loader2 className="size-3 animate-spin" />
                            ) : (
                                <RotateCcw className="size-3" />
                            )}
                            Reset Everything
                        </Button>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                        Current step: <span className="font-mono font-bold">{currentStep}</span> |
                        Student: {student?.name ?? "—"} | Status:{" "}
                        {student?.admission_status ?? "—"}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
