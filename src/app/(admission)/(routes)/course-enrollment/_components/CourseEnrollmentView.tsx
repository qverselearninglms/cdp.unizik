"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseEnrollment } from "../_hooks/use-course-enrollment";
import { AccessFeePanel, PAY_PANEL_PHASES, type PayPanelPhase } from "./AccessFeePanel";
import { AccessGrantedBanner } from "./AccessGrantedBanner";
import { CourseGrid, CourseGridSkeleton } from "./CourseGrid";
import { EnrollmentHeader } from "./EnrollmentHeader";
import { NextStepBanner } from "./NextStepBanner";
import { StatePanel } from "./StatePanel";
import type { EnrollmentPhase } from "../_types/enrollment";

export function CourseEnrollmentView() {
    const state = useCourseEnrollment();
    const { phase, program, access, user } = state;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [celebrate, setCelebrate] = useState(false);

    // /verify-payments sends the student back with ?access=granted. Refresh the
    // server state immediately, celebrate once, then clean the URL.
    useEffect(() => {
        if (searchParams.get("access") !== "granted") return;
        setCelebrate(true);
        state.refresh();
        router.replace(pathname, { scroll: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const firstName = (user?.first_name as string | undefined) || undefined;
    const showPayPanel = (PAY_PANEL_PHASES as readonly EnrollmentPhase[]).includes(phase) && !!access;

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <EnrollmentHeader program={program} phase={phase} firstName={firstName} />

            {phase === "loading" && (
                <div className="space-y-6">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <CourseGridSkeleton count={3} />
                </div>
            )}

            {(phase === "signed_out" || phase === "no_program") && <StatePanel kind={phase} />}

            {phase === "error" && (
                <StatePanel kind="error" detail={state.accessError?.message} onRetry={state.refresh} />
            )}

            {(showPayPanel || phase === "unlocked") && (
                <>
                    <AccessGrantedBanner show={celebrate && phase === "unlocked"} onDismiss={() => setCelebrate(false)} />
                    {!(celebrate && phase === "unlocked") && (
                        <NextStepBanner phase={phase} detail={phase === "not_payable" ? access?.message : null} />
                    )}

                    <AnimatePresence initial={false}>
                        {showPayPanel && (
                            <AccessFeePanel
                                key="pay"
                                phase={phase as PayPanelPhase}
                                access={access!}
                                payment={state.payment}
                                courseCount={state.courses.length}
                                isStartingPayment={state.isStartingPayment}
                                isChecking={state.isCheckingAccess}
                                onPay={state.pay}
                                onCheckAgain={state.refresh}
                            />
                        )}
                    </AnimatePresence>

                    <CourseGrid
                        courses={state.courses}
                        isLoading={state.coursesLoading}
                        error={state.coursesError}
                        unlocked={phase === "unlocked"}
                        onContinue={state.continueLearning}
                        onRetry={state.refresh}
                    />
                </>
            )}
        </main>
    );
}
