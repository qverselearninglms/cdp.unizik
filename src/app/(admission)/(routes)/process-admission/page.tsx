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
    AcceptanceFeeSection,
    TuitionPaymentSection,
    AdmissionCompleteSection,
} from "../../components";
import { AdmissionStep } from "../../types/admission";
import { GraduationCap, RotateCcw, Loader2 } from "lucide-react";
import { useAdmissionStore } from "../../store/admissionStore";

export default function ProcessAdmissionPage() {
    const queryClient = useQueryClient();
    const { data: fees, isLoading: feesLoading } = useFees();
    const { data: student, isLoading: studentLoading, refetch } = useStudentAdmission();
    const currentStep = useAdmissionStore((s) => s.currentStep);
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

            {/* Step indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8 rounded-2xl border border-border/50 bg-card/50 p-4 shadow-sm backdrop-blur-sm"
            >
                <AdmissionStepIndicator currentStep={currentStep} />
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

                    {currentStep === AdmissionStep.ACCEPTANCE_FEE && (
                        <AcceptanceFeeSection
                            key="acceptance-fee"
                            student={student}
                            fees={fees}
                            onRefresh={handleRefresh}
                        />
                    )}

                    {currentStep === AdmissionStep.TUITION_PAYMENT && (
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
                            Step 0→1: App Payment Paid
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
                            Step 3→4: Acceptance Fee Paid
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
                            Step 4→5: Tuition Paid
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
