"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    Clock,
    Copy,
    HelpCircle,
    Loader2,
    RefreshCw,
    ShieldAlert,
    WifiOff,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SUPPORT_EMAIL, type VerifyOutcome, type VerifyResult } from "@/lib/payment-verification";

/**
 * One screen per verify outcome (docs/from-backend/VERIFY_RESPONSES.md).
 * The rules that matter most: never offer "pay again" when money may already
 * have been taken (needs_attention, amount_mismatch, error, pending).
 */
const SCREENS: Record<
    VerifyOutcome,
    { icon: typeof CheckCircle; tone: "ok" | "wait" | "bad" | "warn"; title: string; fallback: string }
> = {
    paid: { icon: CheckCircle, tone: "ok", title: "Payment confirmed", fallback: "Your payment has been applied to your account." },
    pending: { icon: Clock, tone: "wait", title: "Still being confirmed", fallback: "Your payment is still being confirmed. We'll check again automatically — please don't pay again." },
    failed: { icon: XCircle, tone: "bad", title: "Payment didn't go through", fallback: "No money was taken. You can try the payment again." },
    needs_attention: { icon: ShieldAlert, tone: "warn", title: "Payment received — being applied", fallback: "Your payment was received but isn't on your account yet. Support has been alerted. Please don't pay again." },
    amount_mismatch: { icon: ShieldAlert, tone: "warn", title: "Payment amount didn't match", fallback: "We received less than the fee, so it wasn't applied. Support will contact you. Please don't pay again." },
    error: { icon: WifiOff, tone: "warn", title: "We couldn't confirm your payment yet", fallback: "We couldn't reach the payment provider. Try again in a moment — please don't pay again." },
    missing_reference: { icon: HelpCircle, tone: "warn", title: "Payment reference missing", fallback: "This link has no payment reference. Open the link from your payment receipt, or contact support." },
    unknown_reference: { icon: HelpCircle, tone: "warn", title: "We don't recognise this payment", fallback: "This reference isn't one of ours. Contact support with the reference below." },
    ignored: { icon: HelpCircle, tone: "warn", title: "Not a portal payment", fallback: "This payment isn't linked to the portal. Contact support if you think this is wrong." },
};

const TONE = {
    ok: "bg-emerald-500/10 text-emerald-500",
    wait: "bg-amber-500/10 text-amber-500",
    bad: "bg-destructive/10 text-destructive",
    warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

interface Props {
    title: string;
    isLoading: boolean;
    result?: VerifyResult;
    /** Reference from the URL, shown when the reply has none. */
    reference: string | null;
    /** Where to go next: success → continue; failed → pay again. */
    continueTo: string;
    continueLabel?: string;
    onRetry: () => void;
    isRetrying?: boolean;
    countdownSeconds?: number;
}

export function PaymentOutcomeView({
    title,
    isLoading,
    result,
    reference,
    continueTo,
    continueLabel = "Continue",
    onRetry,
    isRetrying,
    countdownSeconds = 5,
}: Props) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(countdownSeconds);
    const paid = result?.outcome === "paid";

    useEffect(() => {
        if (!paid) return;
        if (countdown <= 0) {
            router.push(continueTo);
            return;
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [paid, countdown, continueTo, router]);

    const ref = result?.reference ?? reference;
    const screen = result ? SCREENS[result.outcome] : null;
    const showRef = !!ref && result && result.outcome !== "paid";
    const needsSupport = result && ["needs_attention", "amount_mismatch", "missing_reference", "unknown_reference", "ignored"].includes(result.outcome);

    const copyRef = async () => {
        try {
            await navigator.clipboard.writeText(ref ?? "");
            toast.success("Reference copied");
        } catch {
            toast.error("Couldn't copy — please note the reference down");
        }
    };

    return (
        <div className="flex min-h-[70vh] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="relative overflow-hidden border-border/50 shadow-xl">
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/60 via-primary to-primary/60" />
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <AnimatePresence mode="wait">
                            {isLoading || !screen ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-4 py-8"
                                    role="status"
                                >
                                    <Loader2 className="size-12 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Confirming your payment with TransactPay…</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={result!.outcome}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-5 py-4 text-center"
                                    role={paid ? "status" : "alert"}
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.1 }}
                                        className={cn("rounded-full p-5", TONE[screen.tone])}
                                    >
                                        <screen.icon className="size-10" />
                                    </motion.div>

                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold text-foreground">{screen.title}</p>
                                        <p className="text-sm text-muted-foreground">{result!.message ?? screen.fallback}</p>
                                        {paid && result!.amount && (
                                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                ₦{result!.amount.toLocaleString()} confirmed
                                            </p>
                                        )}
                                    </div>

                                    {showRef && (
                                        <button
                                            type="button"
                                            onClick={copyRef}
                                            className="flex max-w-full items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground hover:bg-muted"
                                            aria-label="Copy payment reference"
                                        >
                                            <span className="truncate">{ref}</span>
                                            <Copy className="size-3.5 shrink-0" />
                                        </button>
                                    )}

                                    <div className="flex w-full flex-col gap-2">
                                        {paid && (
                                            <>
                                                <Button onClick={() => router.push(continueTo)} className="w-full gap-2">
                                                    {continueLabel} <ArrowRight className="size-4" />
                                                </Button>
                                                <p className="text-xs text-muted-foreground">
                                                    Continuing in <span className="font-bold tabular-nums text-primary">{countdown}s</span>
                                                </p>
                                            </>
                                        )}

                                        {(result!.outcome === "pending" || result!.outcome === "error") && (
                                            <Button onClick={onRetry} disabled={isRetrying} className="w-full gap-2">
                                                <RefreshCw className={cn("size-4", isRetrying && "animate-spin")} />
                                                {isRetrying ? "Checking…" : "Check again"}
                                            </Button>
                                        )}

                                        {result!.outcome === "failed" && (
                                            <Button asChild className="w-full gap-2">
                                                <Link href={continueTo}>
                                                    Try the payment again <ArrowRight className="size-4" />
                                                </Link>
                                            </Button>
                                        )}

                                        {needsSupport && (
                                            <Button asChild variant="outline" className="w-full gap-2">
                                                <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Payment ${ref ?? ""}`)}`}>
                                                    <AlertTriangle className="size-4" /> Contact support
                                                </a>
                                            </Button>
                                        )}

                                        {!paid && result!.outcome !== "failed" && (
                                            <Button asChild variant="ghost" className="w-full">
                                                <Link href={continueTo}>Back</Link>
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
