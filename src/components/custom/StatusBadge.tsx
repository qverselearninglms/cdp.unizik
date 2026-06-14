import { cn } from "@/lib/utils";

type StatusVariant =
    | "success"
    | "warning"
    | "destructive"
    | "info"
    | "default"
    | "purple"
    | "orange";

const variants: Record<StatusVariant, string> = {
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-400/15 text-amber-700 dark:text-amber-400",
    destructive: "bg-red-500/10 text-red-700 dark:text-red-400",
    info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    default: "bg-[--muted] text-[--muted-foreground]",
    purple: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

interface StatusBadgeProps {
    label: string;
    variant?: StatusVariant;
    dot?: boolean;
    className?: string;
}

export default function StatusBadge({
    label,
    variant = "default",
    dot = false,
    className,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                variants[variant],
                className
            )}
        >
            {dot && (
                <span
                    className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        {
                            success: "bg-emerald-500",
                            warning: "bg-amber-400",
                            destructive: "bg-red-500",
                            info: "bg-blue-500",
                            default: "bg-[--muted-foreground]",
                            purple: "bg-violet-500",
                            orange: "bg-orange-500",
                        }[variant]
                    )}
                />
            )}
            {label}
        </span>
    );
}