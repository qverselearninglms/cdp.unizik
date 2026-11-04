"use client";

import { motion } from "framer-motion";
import { Check, CreditCard, GraduationCap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrollmentPhase, EnrollmentProgram } from "../_types/enrollment";

const STEPS = [
    { label: "Pay access fee", icon: CreditCard },
    { label: "Payment confirmed", icon: ShieldCheck },
    { label: "Start learning", icon: GraduationCap },
] as const;

/** Index of the step the student is currently on. */
function currentStep(phase: EnrollmentPhase): number {
    if (phase === "unlocked") return 3; // all done
    if (["checking", "processing", "received", "check_failed"].includes(phase)) return 1;
    return 0;
}

interface Props {
    program: EnrollmentProgram | null;
    phase: EnrollmentPhase;
    firstName?: string;
}

export function EnrollmentHeader({ program, phase, firstName }: Props) {
    const step = currentStep(phase);
    const showTracker = phase !== "loading" && phase !== "signed_out" && phase !== "no_program" && phase !== "error";

    return (
        <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-5"
        >
            <div className="space-y-1.5">
                <p className="text-sm font-medium text-primary">
                    {firstName ? `Welcome, ${firstName}` : "Course enrollment"}
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {program ? program.name : "Your courses"}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                    These are the courses in the programme you chose at registration.
                </p>
            </div>

            {showTracker && (
                <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Enrollment progress">
                    {STEPS.map(({ label, icon: Icon }, i) => {
                        const done = i < step;
                        const active = i === step;
                        return (
                            <li key={label} className="relative">
                                <div
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors sm:flex-row sm:gap-3 sm:px-4 sm:text-left",
                                        done && "border-emerald-500/30 bg-emerald-500/5",
                                        active && "border-primary/40 bg-primary/5",
                                        !done && !active && "border-border/60 bg-card/50"
                                    )}
                                    aria-current={active ? "step" : undefined}
                                >
                                    <motion.span
                                        initial={false}
                                        animate={{ scale: active ? [1, 1.12, 1] : 1 }}
                                        transition={{ duration: 1.6, repeat: active ? Infinity : 0 }}
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-full",
                                            done && "bg-emerald-500 text-white",
                                            active && "bg-primary text-primary-foreground",
                                            !done && !active && "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {done ? <Check className="size-4" /> : <Icon className="size-4" />}
                                    </motion.span>
                                    <span
                                        className={cn(
                                            "text-[11px] font-medium leading-tight sm:text-sm",
                                            done || active ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {label}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </motion.header>
    );
}
