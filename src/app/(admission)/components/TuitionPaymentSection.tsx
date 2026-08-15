"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FeeInfoCard } from "./FeeInfoCard";
import { StatusBadgeWidget } from "./StatusBadgeWidget";
import { useInitiateTuitionPayment, useDevSimulate } from "../hooks/useAdmissionQueries";
import { GraduationCap, ExternalLink, Loader2, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { StepSectionProps, TuitionPaymentPayload } from "../types/admission";
import Link from "next/link";
import { useAdmissionStore } from "../store/admissionStore";
import { getSelectedProgramPaymentInfo, setPendingAdmissionPaymentType } from "@/lib/program-payment-context";

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function parseAmount(value?: string | number | null): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const sanitized = value.replace(/[^\d.]/g, "").trim();
        if (!sanitized) return null;
        const numeric = Number(sanitized);
        if (Number.isFinite(numeric)) return numeric;
    }
    return null;
}

export function TuitionPaymentSection({ student, fees }: StepSectionProps) {
    const tuiFee = fees.fees.find((f) => f.slug === "tuition_fee");
    const initPayment = useInitiateTuitionPayment();
    const { simulateTuitionPaid } = useDevSimulate();
    const currentStep = useAdmissionStore((s) => s.currentStep);
    const selectedProgram = getSelectedProgramPaymentInfo();
    const effectiveProgramId = selectedProgram?.programId ?? student.lms_category?.id;
    const effectiveProgramName = selectedProgram?.programName ?? student.lms_category?.name;
    const derivedProgramTuition =
        selectedProgram?.tuitionAmount
        ?? parseAmount(student.lms_category?.tuition)
        ?? parseAmount(student.lms_category?.meta?.[0] as string | number | undefined)
        ?? tuiFee?.amount
        ?? 195_000;

    const totalAmount = derivedProgramTuition;
    const amountPaid = student.tuition_amount_paid ?? 0;
    const remaining = Math.max(totalAmount - amountPaid, 0);
    const isPartiallyPaid = amountPaid > 0 && remaining > 0;
    const paymentAmount = remaining;
    const effectiveTuitionFee = tuiFee
        ? {
            ...tuiFee,
            amount: totalAmount,
            description: effectiveProgramName
                ? `Tuition fee for ${effectiveProgramName}`
                : tuiFee.description,
        }
        : null;

    const handlePay = async () => {
        if (paymentAmount <= 0) {
            toast.error("No outstanding tuition amount to pay.");
            return;
        }

        try {
            const courseTitle = effectiveProgramName || student.department || "Certificate Programme";
            const payload: TuitionPaymentPayload = {
                amount: paymentAmount,
                course_title: courseTitle,
                course_slug: slugify(courseTitle),
                course_id: effectiveProgramId ? String(effectiveProgramId) : student.id,
                fee_type: "tuition_fee",
                program_id: effectiveProgramId,
                program_name: effectiveProgramName,
            };
            const result = await initPayment.mutateAsync(payload);
            if (result.success && result.gateway_url) {
                setPendingAdmissionPaymentType("tuition");
                toast.success("Redirecting to payment gateway…");
                setTimeout(() => {
                    window.location.href = result.gateway_url;
                }, 800);
            }
        } catch (error) {
            const message =
                error && typeof error === "object" && "message" in error
                    ? String((error as { message?: string }).message)
                    : "Failed to initiate payment. Please try again.";

            toast.error(message);
        }
    };

    const progressPercent = totalAmount > 0 ? Math.round((amountPaid / totalAmount) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card className="relative overflow-hidden border-border/50 shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/40 via-primary to-primary/40" />

                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2.5 dark:bg-primary/20">
                            <GraduationCap className="size-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Tuition Fee Payment</CardTitle>
                            <CardDescription>
                                Step 5 — Pay your tuition to unlock courses and LMS access
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadgeWidget label="Admission Confirmed" status="success" />
                        <StatusBadgeWidget
                            label={
                                student.tuition_payment_status === "paid"
                                    ? "Tuition Paid"
                                    : isPartiallyPaid
                                        ? `Outstanding — ₦${remaining.toLocaleString()} left`
                                        : "Tuition Unpaid"
                            }
                            status={
                                student.tuition_payment_status === "paid"
                                    ? "success"
                                    : isPartiallyPaid
                                        ? "warning"
                                        : "info"
                            }
                        />
                    </div>

                    <Separator />

                    {effectiveTuitionFee && <FeeInfoCard fee={effectiveTuitionFee} />}

                    {/* Payment progress (visible when partially paid) */}
                    {isPartiallyPaid && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:bg-emerald-500/10"
                        >
                            <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="font-medium text-foreground">Payment Progress</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {progressPercent}%
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full rounded-full bg-emerald-500"
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                                <span>Paid: ₦{amountPaid.toLocaleString()}</span>
                                <span>Remaining: ₦{remaining.toLocaleString()}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Balance callout for second payment */}
                    {isPartiallyPaid && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/10"
                        >
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Balance Payment Required</p>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    You have a remaining balance of{" "}
                                    <span className="font-semibold text-foreground">
                                        ₦{remaining.toLocaleString()}
                                    </span>
                                    . Please complete this payment to unlock your courses and LMS access.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Info callout for first payment */}
                    {!isPartiallyPaid && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 dark:bg-primary/10"
                        >
                            <CreditCard className="mt-0.5 size-4 shrink-0 text-primary" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Full Tuition Payment Only</p>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Program tuition: {" "}
                                    <span className="font-semibold text-foreground">
                                        ₦{totalAmount.toLocaleString()}
                                    </span>
                                    .
                                </p>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Current payable amount for this transaction: {" "}
                                    <span className="font-semibold text-foreground">
                                        ₦{paymentAmount.toLocaleString()}
                                    </span>{" "}
                                    to unlock your courses and LMS access.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* CTA */}
                    <Button
                        onClick={handlePay}
                        disabled={initPayment.isPending || paymentAmount <= 0}
                        className="btn-glow w-full gap-2"
                        size="lg"
                    >
                        {initPayment.isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Processing…
                            </>
                        ) : (
                            <>
                                Pay ₦{paymentAmount.toLocaleString()} Now
                                <ExternalLink className="size-4" />
                            </>
                        )}
                    </Button>
                    {currentStep === 5 && <Button
                        className="btn-glow w-full gap-2"
                        size="default"
                        variant="outline"
                        asChild
                    >
                        <Link href="/enrollment">
                            View your Enrolled courses
                        </Link>
                    </Button>}

                    {/* Dev toolbar */}
                    {process.env.NODE_ENV === "development" && (
                        <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                🛠 Dev Controls
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => simulateTuitionPaid.mutate()}
                                disabled={simulateTuitionPaid.isPending}
                                className="gap-1.5 text-xs"
                            >
                                {simulateTuitionPaid.isPending ? (
                                    <Loader2 className="size-3 animate-spin" />
                                ) : (
                                    <CheckCircle className="size-3" />
                                )}
                                Simulate: Tuition Fully Paid
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}