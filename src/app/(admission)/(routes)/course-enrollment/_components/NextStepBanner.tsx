"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrollmentPhase } from "../_types/enrollment";

const COPY: Partial<Record<EnrollmentPhase, { tone: "info" | "warn" | "busy" | "ok"; title: string; body: string }>> = {
    locked: {
        tone: "info",
        title: "Next step: pay your access fee",
        body: "Your courses are ready but locked. Pay the one-time access fee below to unlock all of them on the learning platform.",
    },
    checking: {
        tone: "busy",
        title: "Checking your last payment",
        body: "We're asking TransactPay what happened to your last checkout. This takes a few seconds.",
    },
    not_completed: {
        tone: "info",
        title: "Your last checkout wasn't completed",
        body: "TransactPay has no payment from that checkout, so no money was taken. You can pay now.",
    },
    processing: {
        tone: "busy",
        title: "Your bank is processing the payment",
        body: "This usually finishes within a minute. The page updates by itself; please don't pay again.",
    },
    received: {
        tone: "ok",
        title: "Payment received",
        body: "TransactPay has your money; it's being applied to your account and support has been alerted. Please don't pay again.",
    },
    check_failed: {
        tone: "warn",
        title: "We couldn't reach TransactPay",
        body: "We can't confirm your last payment right now. Tap “Try the check again”. Please don't pay again until we know.",
    },
    not_payable: {
        tone: "warn",
        title: "Finish your admission payments first",
        body: "The access fee opens once your application fee and full tuition are paid.",
    },
    failed: {
        tone: "warn",
        title: "Your last payment didn't go through",
        body: "No access was granted. You can try the payment again below. If you were debited, contact support with your reference.",
    },
    unlocked: {
        tone: "ok",
        title: "You're all set",
        body: "Your access is active. Pick any course and tap Continue Learning to open it on the learning platform.",
    },
};

const TONE = {
    info: { icon: Lock, cls: "border-primary/30 bg-primary/5 text-primary" },
    busy: { icon: Loader2, cls: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400" },
    warn: { icon: AlertTriangle, cls: "border-destructive/30 bg-destructive/5 text-destructive" },
    ok: { icon: CheckCircle2, cls: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" },
} as const;

export function NextStepBanner({ phase, detail }: { phase: EnrollmentPhase; detail?: string | null }) {
    const base = COPY[phase];
    // The backend's own reason (e.g. outstanding tuition) is more useful than ours.
    const copy = base && detail ? { ...base, body: detail } : base;

    return (
        <div aria-live="polite">
            <AnimatePresence mode="wait">
                {copy && (
                    <motion.div
                        key={phase}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className={cn("flex items-start gap-3 rounded-xl border p-4", TONE[copy.tone].cls)}
                        role="status"
                    >
                        {(() => {
                            const Icon = TONE[copy.tone].icon ?? Info;
                            return <Icon className={cn("mt-0.5 size-5 shrink-0", copy.tone === "busy" && "animate-spin")} />;
                        })()}
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold">{copy.title}</p>
                            <p className="text-sm text-muted-foreground">{copy.body}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
