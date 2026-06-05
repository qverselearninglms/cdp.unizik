"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadgeWidget } from "./StatusBadgeWidget";
import { Separator } from "@/components/ui/separator";
import { PartyPopper, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import type { StepSectionProps } from "../types/admission";

export function AdmissionCompleteSection({ student }: StepSectionProps) {
    const router = useRouter();
    const confettiRef = useRef<HTMLDivElement>(null);

    /* GSAP confetti burst on mount */
    useEffect(() => {
        if (!confettiRef.current) return;

        const particles: HTMLDivElement[] = [];
        const colors = [
            "oklch(0.508 0.118 165.612)", // primary
            "oklch(0.837 0.128 66.29)",   // chart-1
            "oklch(0.705 0.213 47.604)",  // chart-2
            "oklch(0.646 0.222 41.116)",  // chart-3
            "oklch(0.553 0.195 38.402)",  // chart-4
        ];

        for (let i = 0; i < 40; i++) {
            const particle = document.createElement("div");
            particle.style.position = "absolute";
            particle.style.width = `${gsap.utils.random(6, 12)}px`;
            particle.style.height = `${gsap.utils.random(6, 12)}px`;
            particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = "50%";
            particle.style.top = "50%";
            particle.style.pointerEvents = "none";
            confettiRef.current.appendChild(particle);
            particles.push(particle);
        }

        gsap.fromTo(
            particles,
            {
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
            },
            {
                x: () => gsap.utils.random(-200, 200),
                y: () => gsap.utils.random(-200, 100),
                scale: () => gsap.utils.random(0.5, 1.5),
                opacity: 0,
                rotation: () => gsap.utils.random(-360, 360),
                duration: 1.8,
                ease: "power3.out",
                stagger: { amount: 0.3, from: "center" },
                onComplete: () => {
                    particles.forEach((p) => p.remove());
                },
            }
        );
    }, []);

    const checklist = [
        { label: "Application Fee Paid", done: true },
        { label: "Application Form Submitted", done: true },
        { label: "Admission Offered & Accepted", done: true },
        { label: "Acceptance Fee Paid", done: true },
        { label: "Tuition Fee Paid", done: true },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card className="relative overflow-hidden border-emerald-500/30 shadow-xl">
                {/* Gradient top bar */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-primary to-emerald-400" />

                <CardHeader className="relative text-center">
                    {/* Confetti container */}
                    <div
                        ref={confettiRef}
                        className="pointer-events-none absolute inset-0 overflow-hidden"
                    />

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.3 }}
                        className="mx-auto mb-3 rounded-full bg-emerald-500/10 p-5 dark:bg-emerald-500/20"
                    >
                        <PartyPopper className="size-10 text-emerald-500" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold">
                        🎉 Admission Process Complete!
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Welcome to QHUB University, {student.name.split(" ")[0]}!
                    </p>
                </CardHeader>

                <CardContent className="space-y-5">
                    <StatusBadgeWidget
                        label="All Steps Completed"
                        status="success"
                        className="mx-auto"
                    />

                    <Separator />

                    {/* Completion checklist */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Completion Summary
                        </p>
                        {checklist.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                className="flex items-center gap-2.5 rounded-lg bg-emerald-500/5 px-3 py-2 dark:bg-emerald-500/10"
                            >
                                <CheckCircle className="size-4 text-emerald-500" />
                                <span className="text-sm text-foreground">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    <Separator />

                    {/* Final CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="size-4" />
                            <span>Ready to start your academic journey?</span>
                        </div>
                        <Button
                            onClick={() => router.push("/student/courses")}
                            className="btn-glow w-full gap-2"
                            size="lg"
                        >
                            View My Courses
                            <ArrowRight className="size-4" />
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}