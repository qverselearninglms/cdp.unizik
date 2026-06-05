"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    CreditCard,
    FileText,
    Search,
    BadgeCheck,
    GraduationCap,
    PartyPopper,
} from "lucide-react";
import { AdmissionStep } from "../types/admission";

const STEPS = [
    { label: "Application Fee", icon: CreditCard },
    { label: "Application Form", icon: FileText },
    { label: "Admission Status", icon: Search },
    { label: "Acceptance Fee", icon: BadgeCheck },
    { label: "Tuition Fee", icon: GraduationCap },
    { label: "Completed", icon: PartyPopper },
] as const;

interface AdmissionStepIndicatorProps {
    currentStep: AdmissionStep;
}

export function AdmissionStepIndicator({ currentStep }: AdmissionStepIndicatorProps) {
    return (
        <div className="w-full overflow-x-auto py-2">
            <div className="flex min-w-[600px] items-center justify-between gap-1 px-2">
                {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStep;
                    const isActive = idx === currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={idx} className="flex flex-1 items-center">
                            {/* Step circle */}
                            <div className="flex flex-col items-center gap-1.5">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.15 : 1,
                                        backgroundColor: isCompleted
                                            ? "var(--color-primary)"
                                            : isActive
                                                ? "var(--color-primary)"
                                                : "var(--color-muted)",
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={cn(
                                        "relative flex size-10 items-center justify-center rounded-full transition-shadow",
                                        isActive && "shadow-lg shadow-primary/30",
                                        isCompleted && "shadow-md shadow-primary/20"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "size-4 transition-colors",
                                            isCompleted || isActive
                                                ? "text-primary-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    />

                                    {/* Pulse ring for active */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-primary"
                                            initial={{ scale: 1, opacity: 0.6 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeOut",
                                            }}
                                        />
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "max-w-[80px] text-center text-[10px] font-medium leading-tight",
                                        isCompleted
                                            ? "text-primary"
                                            : isActive
                                                ? "text-foreground font-semibold"
                                                : "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {idx < STEPS.length - 1 && (
                                <div className="relative mx-1 h-[2px] flex-1">
                                    <div className="absolute inset-0 rounded-full bg-muted" />
                                    <motion.div
                                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                        initial={{ width: "0%" }}
                                        animate={{
                                            width: isCompleted ? "100%" : isActive ? "50%" : "0%",
                                        }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}