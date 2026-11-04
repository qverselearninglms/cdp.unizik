"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Copy,
    Loader2,
    Lock,
    Mail,
    RefreshCw,
    ShieldCheck,
    WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SUPPORT_EMAIL } from "@/lib/payment-verification";
import type { CourseAccessStatus, EnrollmentPhase } from "../_types/enrollment";

export const PAY_PANEL_PHASES = [
    "locked",
    "not_payable",
    "checking",
    "not_completed",
    "processing",
    "received",
    "check_failed",
    "failed",
] as const satisfies readonly EnrollmentPhase[];

export type PayPanelPhase = (typeof PAY_PANEL_PHASES)[number];

export interface PaymentSnapshot {
    reference: string | null;
    message: string | null;
    checkedAt: number | null;
    resumeUrl: string | null;
}

function formatMoney(amount: number | null, currency = "NGN") {
    if (amount == null) return null;
    try {
        return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
    } catch {
        return `₦${amount.toLocaleString()}`;
    }
}

/** Plain-language status line for the card, per phase. */
const STATUS_LABEL: Record<PayPanelPhase, string> = {
    locked: "Not paid",
    not_payable: "Not available yet",
    checking: "Checking with TransactPay…",
    not_completed: "Checkout not completed — no money taken",
    processing: "Bank is processing your payment",
    received: "Payment received — being applied to your account",
    check_failed: "Couldn't reach TransactPay",
    failed: "Last payment failed — no money taken",
};

interface Props {
    phase: PayPanelPhase;
    access: CourseAccessStatus;
    payment: PaymentSnapshot;
    courseCount: number;
    isStartingPayment: boolean;
    isChecking: boolean;
    onPay: () => void;
    onCheckAgain: () => void;
}

export function AccessFeePanel({
    phase,
    access,
    payment,
    courseCount,
    isStartingPayment,
    isChecking,
    onPay,
    onCheckAgain,
}: Props) {
    const price = formatMoney(access.amount, access.currency);
    const canPay = phase === "locked" || phase === "failed" || phase === "not_completed";

    const checkButton = (label = "Check status now") => (
        <Button variant="outline" onClick={onCheckAgain} disabled={isChecking} className="w-full gap-2">
            <RefreshCw className={isChecking ? "size-4 animate-spin" : "size-4"} />
            {isChecking ? "Checking…" : label}
        </Button>
    );

    return (
        <motion.section
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-lg sm:p-8"
            aria-labelledby="access-fee-heading"
        >
            <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl"
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <Lock className="size-3.5" /> One-time access fee
                    </span>
                    <h2 id="access-fee-heading" className="text-xl font-bold text-foreground sm:text-2xl">
                        Unlock {courseCount > 0 ? `all ${courseCount} courses` : "your courses"}
                    </h2>
                    {price && <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{price}</p>}
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <BookOpen className="size-4 shrink-0 text-primary" /> Full access to every course in your programme
                        </li>
                        <li className="flex items-center gap-2">
                            <ShieldCheck className="size-4 shrink-0 text-primary" /> Secure checkout via TransactPay; the gateway may add a small processing fee
                        </li>
                    </ul>
                </div>

                <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-72">
                    {canPay && (
                        <>
                            <motion.div whileHover={{ scale: isStartingPayment ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}>
                                {phase === "not_completed" && payment.resumeUrl ? (
                                    <Button asChild size="lg" className="btn-glow h-16 w-full gap-2 rounded-xl text-lg font-bold shadow-xl shadow-primary/25">
                                        <a href={payment.resumeUrl}>
                                            Resume payment <ArrowRight className="size-5" />
                                        </a>
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        onClick={onPay}
                                        disabled={isStartingPayment}
                                        className="btn-glow h-16 w-full gap-2 rounded-xl text-lg font-bold shadow-xl shadow-primary/25"
                                    >
                                        {isStartingPayment ? (
                                            <>
                                                <Loader2 className="size-5 animate-spin" /> Opening secure checkout…
                                            </>
                                        ) : (
                                            <>
                                                {phase === "failed" ? "Try payment again" : phase === "not_completed" ? "Pay now" : "Pay access fee"}
                                                {price ? ` · ${price}` : ""}
                                                <ArrowRight className="size-5" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </motion.div>
                            {phase === "not_completed" ? checkButton("I've just paid — check now") : (
                                <p className="text-center text-xs text-muted-foreground">You&apos;ll return here automatically after paying.</p>
                            )}
                        </>
                    )}

                    {phase === "not_payable" && (
                        <>
                            <Button size="lg" disabled className="h-16 w-full gap-2 rounded-xl text-lg font-bold">
                                <Lock className="size-5" /> Not available yet
                            </Button>
                            <Button asChild variant="outline" className="w-full gap-2">
                                <Link href="/process-admission">
                                    Complete admission steps <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </>
                    )}

                    {phase === "checking" && (
                        <div className="flex h-16 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 text-sm font-semibold text-primary" role="status">
                            <Loader2 className="size-5 animate-spin" /> Checking with TransactPay…
                        </div>
                    )}

                    {phase === "processing" && (
                        <>
                            <div className="flex h-16 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm font-semibold text-amber-700 dark:text-amber-300">
                                <Loader2 className="size-5 animate-spin" /> Bank is processing
                            </div>
                            {checkButton()}
                        </>
                    )}

                    {phase === "received" && (
                        <>
                            <div className="flex h-16 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="size-5" /> Payment received
                            </div>
                            {checkButton()}
                            <Button asChild variant="ghost" className="w-full gap-2">
                                <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Access fee ${payment.reference ?? ""}`)}`}>
                                    <Mail className="size-4" /> Contact support
                                </a>
                            </Button>
                        </>
                    )}

                    {phase === "check_failed" && (
                        <>
                            <div className="flex h-16 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 text-sm font-semibold text-destructive">
                                <WifiOff className="size-5" /> Couldn&apos;t reach TransactPay
                            </div>
                            {checkButton("Try the check again")}
                        </>
                    )}
                </div>
            </div>

            <PaymentStatusCard phase={phase} payment={payment} />
        </motion.section>
    );
}

/** Everything the student (or support) needs to know about the payment, at a glance. */
function PaymentStatusCard({ phase, payment }: { phase: PayPanelPhase; payment: PaymentSnapshot }) {
    if (phase === "locked" || phase === "not_payable") return null;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(payment.reference ?? "");
            toast.success("Reference copied");
        } catch {
            toast.error("Couldn't copy — please note the reference down");
        }
    };

    return (
        <motion.dl
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 grid gap-3 rounded-xl border bg-background/60 p-4 text-sm backdrop-blur sm:grid-cols-3"
            aria-live="polite"
        >
            <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="font-medium text-foreground">{STATUS_LABEL[phase]}</dd>
            </div>
            {payment.reference && (
                <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Reference</dt>
                    <dd>
                        <button
                            type="button"
                            onClick={copy}
                            className="flex max-w-full items-center gap-1.5 font-mono text-xs text-foreground hover:text-primary"
                            aria-label="Copy payment reference"
                        >
                            <span className="truncate">{payment.reference}</span>
                            <Copy className="size-3.5 shrink-0" />
                        </button>
                    </dd>
                </div>
            )}
            {payment.checkedAt && (
                <div>
                    <dt className="text-xs text-muted-foreground">Last checked</dt>
                    <dd className="text-foreground">{new Date(payment.checkedAt).toLocaleTimeString()}</dd>
                </div>
            )}
            {payment.message && <p className="text-xs text-muted-foreground sm:col-span-3">{payment.message}</p>}
        </motion.dl>
    );
}
