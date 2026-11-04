"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseEnrollmentView } from "./_components/CourseEnrollmentView";

/**
 * Course enrollment — lists the courses in the student's programme and gates
 * them behind a one-time access fee.
 *
 * Flow: Pay access fee → TransactPay → /verify-payments?fee_type=access
 *       → back here with ?access=granted → Continue Learning on every course.
 *
 * Backend contract: docs/enrollment-access-fee-api-contract.md
 */
export default function CourseEnrollmentPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            }
        >
            <CourseEnrollmentView />
        </Suspense>
    );
}
