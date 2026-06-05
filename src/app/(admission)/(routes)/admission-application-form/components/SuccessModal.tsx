'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
}

const COUNTDOWN_SECONDS = 10;
const REDIRECT_URL = '/process-admission';

export default function SuccessModal({ isOpen }: SuccessModalProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

    const handleRedirect = useCallback(() => {
        router.push(REDIRECT_URL);
    }, [router]);

    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Redirect when countdown finishes
    useEffect(() => {
        if (isOpen && countdown <= 0) {
            handleRedirect();
        }
    }, [isOpen, countdown, handleRedirect]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-foreground/10"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Success icon area */}
                        <div className="flex flex-col items-center gap-4 px-8 pt-10">
                            <motion.div
                                className="flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
                                >
                                    <CheckCircle className="size-10 text-emerald-600 dark:text-emerald-400" />
                                </motion.div>
                            </motion.div>

                            <motion.div
                                className="text-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h2 className="text-xl font-bold">Application Submitted!</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Your admission application has been submitted successfully.
                                    You will be notified once your application has been reviewed.
                                </p>
                            </motion.div>
                        </div>

                        {/* Countdown + Button */}
                        <div className="flex flex-col items-center gap-4 px-8 pb-8 pt-6">
                            {/* Countdown ring */}
                            <div className="relative flex size-16 items-center justify-center">
                                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="text-muted/30"
                                    />
                                    <motion.circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        className="text-primary"
                                        strokeDasharray={2 * Math.PI * 28}
                                        initial={{ strokeDashoffset: 0 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 28 }}
                                        transition={{
                                            duration: COUNTDOWN_SECONDS,
                                            ease: 'linear',
                                        }}
                                    />
                                </svg>
                                <span className="text-lg font-bold tabular-nums">{countdown}</span>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                            </p>

                            <Button
                                onClick={handleRedirect}
                                className="w-full"
                                size="default"
                            >
                                Continue to Admission Process
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
