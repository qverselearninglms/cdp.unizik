"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FeeItem } from "../types/admission";

interface FeeInfoCardProps {
    fee: FeeItem;
    isPaid?: boolean;
    className?: string;
}

export function FeeInfoCard({ fee, isPaid = false, className }: FeeInfoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Card
                className={cn(
                    "relative overflow-hidden border transition-all duration-300",
                    isPaid
                        ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                        : "border-border hover:border-primary/30 hover:shadow-md",
                    className
                )}
            >
                {/* Decorative gradient strip */}
                <div
                    className={cn(
                        "absolute left-0 top-0 h-full w-1 rounded-l-xl",
                        isPaid
                            ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
                            : "bg-gradient-to-b from-primary/60 to-primary"
                    )}
                />

                <CardContent className="flex items-center justify-between gap-4 py-4 pl-5">
                    <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">{fee.name}</p>
                        {fee.description && (
                            <p className="text-xs text-muted-foreground">{fee.description}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold tabular-nums text-foreground">
                            ₦{fee.amount.toLocaleString()}
                        </p>
                        {isPaid && (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                ✓ Paid
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}