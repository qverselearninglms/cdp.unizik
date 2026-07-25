"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadgeWidget } from "./StatusBadgeWidget";
import { useInitiateTuitionPayment, useDevSimulate } from "../hooks/useAdmissionQueries";
import {
    GraduationCap, ExternalLink, Loader2, CheckCircle, AlertCircle,
    Search, Clock, BookOpen, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { StepSectionProps, TuitionPaymentPayload } from "../types/admission";
import Link from "next/link";
import coursesData from "../../../../map-course-data/CDP_Courses.json";
import { useAdmissionStore } from "../store/admissionStore";

/* ── Local types ────────────────────────────────────────────────────── */
interface CourseItem {
    s_n: number;
    course_code: string | null;
    course_title: string;
    id: string;
    credit_unit: number | null;
    duration: string;
    tuition_fee: number | null;
}

/* ── Helpers ────────────────────────────────────────────────────────── */
const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ── Animation variants ─────────────────────────────────────────────── */
const fadeSlide = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: Math.min(i * 0.03, 0.25), duration: 0.22 },
    }),
    exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

/* ── Component ──────────────────────────────────────────────────────── */
export function TuitionPaymentSection({ student }: StepSectionProps) {
    const initPayment = useInitiateTuitionPayment();
    const { simulateTuitionPaid } = useDevSimulate();
    const shouldSkipPayment = useAdmissionStore((s) => s.shouldSkipAcceptancePayment());
    const currentStep = useAdmissionStore((s) => s.currentStep);

    const [activeCategory, setActiveCategory] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

    const categories = coursesData.programme_categories;

    const filteredCourses = useMemo<CourseItem[]>(() => {
        const all = (categories[activeCategory]?.courses ?? []) as CourseItem[];
        if (!searchQuery.trim()) return all;
        const q = searchQuery.toLowerCase();
        return all.filter((c) => c.course_title.toLowerCase().includes(q));
    }, [activeCategory, searchQuery, categories]);

    /* Derived payment values */
    const totalAmount = selectedCourse?.tuition_fee ?? 0;
    const paymentAmount = totalAmount;

    const canPay =
        !initPayment.isPending && !!selectedCourse?.tuition_fee;

    const handlePay = async () => {
        if (!selectedCourse) {
            toast.error("Please select a programme first.");
            return;
        }
        try {
            console.log("selectedCourse", selectedCourse)
            const payload: TuitionPaymentPayload = {
                amount: paymentAmount,
                course_title: selectedCourse?.course_title ?? "",
                course_slug: selectedCourse ? slugify(selectedCourse.course_title) : "",
                course_id: selectedCourse?.id ?? "",
            };
            const result = await initPayment.mutateAsync(payload);
            if (result.success && result.gateway_url) {
                toast.success("Redirecting to payment gateway…");
                setTimeout(() => { window.location.href = result.gateway_url; }, 800);
            }
        } catch {
            toast.error("Failed to initiate payment. Please try again.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            <Card className="relative overflow-hidden border-border/50 shadow-lg">
                {/* Top accent bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/40 via-primary to-primary/40" />

                {/* ── Header ────────────────────────────────────────────── */}
                <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2.5 dark:bg-primary/20">
                            <GraduationCap className="size-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Tuition Fee Payment</CardTitle>
                            <CardDescription>
                                Step 5 — Select your programme and pay to unlock LMS access
                            </CardDescription>
                        </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadgeWidget label="Admission Confirmed" status="success" />
                        {!shouldSkipPayment && <StatusBadgeWidget label="Acceptance Fee Paid" status="success" />}
                        <StatusBadgeWidget
                            label={
                                student.tuition_payment_status === "paid"
                                    ? "Tuition Paid"
                                    : "Tuition Unpaid"
                            }
                            status={
                                student.tuition_payment_status === "paid" ? "success" : "info"
                            }
                        />
                    </div>
                </CardHeader>

                {/* ── Content ───────────────────────────────────────────── */}
                <CardContent className="space-y-5">
                    <Separator />

                    {/* ── Programme selection ───────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Select Your Programme</h3>
                            <p className="text-xs text-muted-foreground">
                                Choose the programme you wish to enrol in
                            </p>
                        </div>

                        {/* Category tabs */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setActiveCategory(idx);
                                        setSearchQuery("");
                                        setSelectedCourse(null);
                                    }}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                                        activeCategory === idx
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                                    )}
                                >
                                    {cat.category}
                                    <span className={cn(
                                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                        activeCategory === idx
                                            ? "bg-white/20 text-primary-foreground"
                                            : "bg-muted-foreground/15 text-muted-foreground"
                                    )}>
                                        {cat.total_courses}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search programmes…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.7 }}
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Course list */}
                        <div className="relative max-h-72 overflow-y-auto rounded-xl border border-border/50 bg-muted/20 p-1.5 dark:bg-muted/10">
                            <AnimatePresence mode="popLayout">
                                {filteredCourses.length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center gap-2 py-10 text-center"
                                    >
                                        <BookOpen className="size-7 text-muted-foreground/40" />
                                        <p className="text-xs text-muted-foreground">No programmes found for "{searchQuery}"</p>
                                    </motion.div>
                                ) : (
                                    filteredCourses.map((course, i) => {
                                        const isSelected = selectedCourse?.s_n === course.s_n;
                                        return (
                                            <motion.button
                                                key={course.s_n}
                                                custom={i}
                                                variants={fadeSlide}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                                type="button"
                                                onClick={() => setSelectedCourse(isSelected ? null : course)}
                                                className={cn(
                                                    "group mb-1 flex w-full items-start gap-3 rounded-lg border p-2.5 text-left transition-all duration-200 last:mb-0",
                                                    isSelected
                                                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 dark:bg-primary/10"
                                                        : "border-transparent hover:border-border hover:bg-background dark:hover:bg-background/50"
                                                )}
                                            >
                                                {/* Radio dot */}
                                                <div className={cn(
                                                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                                                    isSelected
                                                        ? "border-primary bg-primary"
                                                        : "border-muted-foreground/30 group-hover:border-primary/50"
                                                )}>
                                                    <AnimatePresence>
                                                        {isSelected && (
                                                            <motion.span
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                                                            >
                                                                <Check className="size-2.5 text-primary-foreground" />
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Course info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className={cn(
                                                        "text-xs font-medium leading-snug transition-colors",
                                                        isSelected
                                                            ? "text-foreground"
                                                            : "text-foreground/75 group-hover:text-foreground"
                                                    )}>
                                                        {course.course_title}
                                                    </p>
                                                    <div className="mt-0.5 flex items-center gap-1.5">
                                                        <Clock className="size-2.5 shrink-0 text-muted-foreground" />
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {course.duration}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Fee badge */}
                                                <div className="shrink-0 text-right">
                                                    {course.tuition_fee ? (
                                                        <span className={cn(
                                                            "text-xs font-bold tabular-nums transition-colors",
                                                            isSelected
                                                                ? "text-primary"
                                                                : "text-foreground/60 group-hover:text-foreground"
                                                        )}>
                                                            ₦{course.tuition_fee.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                                            TBD
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Search result count */}
                        <AnimatePresence>
                            {searchQuery && filteredCourses.length > 0 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[10px] text-muted-foreground"
                                >
                                    {filteredCourses.length} result{filteredCourses.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* ── Selected course summary ───────────────────────── */}
                    <AnimatePresence>
                        {selectedCourse && (
                            <motion.div
                                key="course-summary"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.28 }}
                                className="overflow-hidden"
                            >
                                <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 dark:bg-primary/10">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-primary/15 p-2 dark:bg-primary/25">
                                            <BookOpen className="size-4 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                                                Selected Programme
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
                                                {selectedCourse.course_title}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <Clock className="size-2.5" />
                                                <span>{selectedCourse.duration}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-[10px] text-muted-foreground">Tuition Fee</p>
                                            <p className="text-xl font-bold tabular-nums text-foreground">
                                                {selectedCourse.tuition_fee
                                                    ? `₦${selectedCourse.tuition_fee.toLocaleString()}`
                                                    : "Contact Us"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Empty-selection nudge ─────────────────────────── */}
                    <AnimatePresence>
                        {!selectedCourse && (
                            <motion.div
                                key="nudge"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/30 p-3.5 dark:bg-muted/10"
                            >
                                <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Select a programme above to see its tuition fee and proceed to payment.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── CTA buttons ───────────────────────────────────── */}
                    <div className="space-y-3 pt-1">
                        <Button
                            onClick={handlePay}
                            disabled={!canPay}
                            className="btn-glow w-full gap-2"
                            size="lg"
                        >
                            {initPayment.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Processing…
                                </>
                            ) : !selectedCourse ? (
                                <>
                                    <GraduationCap className="size-4" />
                                    Select a Programme to Continue
                                </>
                            ) : (
                                <>
                                    Pay ₦{paymentAmount.toLocaleString()} Now
                                    <ExternalLink className="size-4" />
                                </>
                            )}
                        </Button>

                        {currentStep === 5 && <Button className="w-full gap-2" size="default" variant="outline" asChild>
                            <Link href="/enrollment">View your Enrolled Courses</Link>
                        </Button>}
                    </div>

                    {/* ── Dev toolbar ───────────────────────────────────── */}
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
