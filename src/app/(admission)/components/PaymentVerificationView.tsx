"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadgeWidget } from "./StatusBadgeWidget";
import { CheckCircle, Loader2, XCircle, ArrowRight } from "lucide-react";
import type { PaymentVerificationResponse } from "../types/admission";

interface PaymentVerificationViewProps {
    /** Page title shown at the top */
    title: string;
    /** Whether the verification query is still loading */
    isLoading: boolean;
    /** Error from the query */
    error: Error | null;
    /** The verification result */
    data?: PaymentVerificationResponse;
    /** Where to redirect after success */
    redirectTo: string;
    /** Auto-redirect countdown in seconds */
    countdownSeconds?: number;
}

export function PaymentVerificationView({
    title,
    isLoading,
    error,
    data,
    redirectTo,
    countdownSeconds = 10,
}: PaymentVerificationViewProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(countdownSeconds);

    const handleRedirect = useCallback(() => {
        router.push(redirectTo);
    }, [router, redirectTo]);

    /* Auto-redirect countdown */
    useEffect(() => {
        if (!data?.success) return;

        if (countdown <= 0) {
            handleRedirect();
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [data?.success, countdown, handleRedirect]);

    return (
        <div className="flex min-h-[70vh] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="relative overflow-hidden border-border/50 shadow-xl">
                    {/* Top gradient */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/60 via-primary to-primary/60" />

                    <CardHeader className="text-center">
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <AnimatePresence mode="wait">
                            {/* LOADING STATE */}
                            {isLoading && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-4 py-8"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Loader2 className="size-12 text-primary" />
                                    </motion.div>
                                    <p className="text-sm text-muted-foreground">
                                        Verifying your payment with the gateway…
                                    </p>
                                    <div className="w-full space-y-2">
                                        <Skeleton className="mx-auto h-4 w-3/4" />
                                        <Skeleton className="mx-auto h-4 w-1/2" />
                                    </div>
                                </motion.div>
                            )}

                            {/* ERROR STATE */}
                            {!isLoading && error && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-4 py-8"
                                >
                                    <div className="rounded-full bg-destructive/10 p-4">
                                        <XCircle className="size-10 text-destructive" />
                                    </div>
                                    <p className="text-center text-sm font-medium text-destructive">
                                        {error.message || "Verification failed. Please try again."}
                                    </p>
                                    <Button variant="outline" onClick={handleRedirect}>
                                        Go Back & Retry
                                    </Button>
                                </motion.div>
                            )}

                            {/* SUCCESS STATE */}
                            {!isLoading && data?.success && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-5 py-6"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 12,
                                            delay: 0.2,
                                        }}
                                        className="rounded-full bg-emerald-500/10 p-5 dark:bg-emerald-500/20"
                                    >
                                        <CheckCircle className="size-12 text-emerald-500" />
                                    </motion.div>

                                    <div className="space-y-2 text-center">
                                        <p className="text-lg font-semibold text-foreground">
                                            Payment Verified!
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Reference: <span className="font-mono">{data.reference}</span>
                                        </p>
                                        <StatusBadgeWidget
                                            label={`₦${data.amount.toLocaleString()} — Confirmed`}
                                            status="success"
                                        />
                                    </div>

                                    {/* Countdown */}
                                    <div className="flex flex-col items-center gap-3">
                                        <p className="text-xs text-muted-foreground">
                                            Redirecting in{" "}
                                            <span className="font-bold tabular-nums text-primary">
                                                {countdown}s
                                            </span>
                                        </p>

                                        {/* Progress ring */}
                                        <svg className="size-10" viewBox="0 0 40 40">
                                            <circle
                                                cx="20"
                                                cy="20"
                                                r="16"
                                                fill="none"
                                                strokeWidth="3"
                                                className="stroke-muted"
                                            />
                                            <motion.circle
                                                cx="20"
                                                cy="20"
                                                r="16"
                                                fill="none"
                                                strokeWidth="3"
                                                className="stroke-primary"
                                                strokeLinecap="round"
                                                strokeDasharray={100}
                                                initial={{ strokeDashoffset: 0 }}
                                                animate={{
                                                    strokeDashoffset:
                                                        100 - (countdown / countdownSeconds) * 100,
                                                }}
                                                transition={{ duration: 1, ease: "linear" }}
                                                transform="rotate(-90 20 20)"
                                            />
                                        </svg>

                                        <Button
                                            onClick={handleRedirect}
                                            className="btn-glow gap-2"
                                            size="lg"
                                        >
                                            Continue Now
                                            <ArrowRight className="size-4" />
                                        </Button>
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