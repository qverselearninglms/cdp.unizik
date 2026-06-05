"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

type StatusType = "success" | "pending" | "failed" | "warning" | "info";

interface StatusBadgeWidgetProps {
    label: string;
    status: StatusType;
    className?: string;
}

const config: Record<StatusType, { icon: React.ElementType; classes: string }> = {
    success: {
        icon: CheckCircle,
        classes: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400",
    },
    pending: {
        icon: Clock,
        classes: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
    },
    failed: {
        icon: XCircle,
        classes: "bg-destructive/10 text-destructive border-destructive/20",
    },
    warning: {
        icon: AlertTriangle,
        classes: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400",
    },
    info: {
        icon: Clock,
        classes: "bg-primary/10 text-primary border-primary/20",
    },
};

export function StatusBadgeWidget({ label, status, className }: StatusBadgeWidgetProps) {
    const { icon: Icon, classes } = config[status];

    return (
        <Badge
            variant="outline"
            className={cn(
                "h-auto gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium",
                classes,
                className
            )}
        >
            <Icon className="size-3.5" />
            {label}
        </Badge>
    );
}