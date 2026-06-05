"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadgeWidget } from "./StatusBadgeWidget";
import { FileText, ArrowRight, CheckCircle } from "lucide-react";
import type { StepSectionProps } from "../types/admission";

export function ApplicationFormSection({ student }: StepSectionProps) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card className="relative overflow-hidden border-border/50 shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/40 via-primary to-primary/40" />

                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2.5 dark:bg-primary/20">
                            <FileText className="size-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Admission Application Form</CardTitle>
                            <CardDescription>
                                Step 2 — Complete and submit your admission application
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadgeWidget label="Application Fee Paid" status="success" />
                        <StatusBadgeWidget
                            label={student.has_applied ? "Form Submitted" : "Form Not Submitted"}
                            status={student.has_applied ? "success" : "warning"}
                        />
                    </div>

                    {/* Success callout */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:bg-emerald-500/10"
                    >
                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                Payment Confirmed!
                            </p>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Your application fee has been successfully processed. You now have
                                access to the admission application form. Please fill it out
                                carefully — all information will be verified by the admissions office.
                            </p>
                        </div>
                    </motion.div>

                    {/* CTA */}
                    <Button
                        onClick={() => router.push("/admission-application-form")}
                        className="btn-glow w-full gap-2"
                        size="lg"
                    >
                        Open Application Form
                        <ArrowRight className="size-4" />
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}