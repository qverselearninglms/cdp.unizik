"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex flex-col items-center justify-center py-16 text-center",
                className
            )}
        >
            {Icon && (
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Icon size={24} className="text-muted-foreground" />
                </div>
            )}
            <p className="font-semibold text-foreground text-base">{title}</p>
            {description && (
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </motion.div>
    );
}