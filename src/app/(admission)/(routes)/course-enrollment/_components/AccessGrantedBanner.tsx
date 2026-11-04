"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, X } from "lucide-react";

/** Shown once after returning from a successful verification. */
export function AccessGrantedBanner({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 p-4 sm:p-5"
                    role="status"
                >
                    <motion.span
                        initial={{ rotate: -30, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 220, damping: 10, delay: 0.15 }}
                        className="rounded-full bg-emerald-500 p-3 text-white"
                    >
                        <PartyPopper className="size-6" />
                    </motion.span>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">Payment confirmed — your courses are unlocked!</p>
                        <p className="text-sm text-muted-foreground">Tap Continue Learning on any course to begin.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-background/60 hover:text-foreground"
                        aria-label="Dismiss"
                    >
                        <X className="size-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
