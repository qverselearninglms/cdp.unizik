import { cn } from "@/lib/utils";

interface AvatarProps {
    name: string;
    src?: string;
    size?: "xs" | "sm" | "md" | "lg";
    status?: "online" | "offline" | "away";
    className?: string;
}

const sizes = {
    xs: "w-6 h-6 text-[9px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
};

const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-[--muted-foreground]",
    away: "bg-amber-400",
};

const statusSizes = {
    xs: "w-1.5 h-1.5 -bottom-px -right-px",
    sm: "w-2 h-2 bottom-0 right-0",
    md: "w-2.5 h-2.5 bottom-0 right-0",
    lg: "w-3 h-3 bottom-0.5 right-0.5",
};

export function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .filter(Boolean)
        .slice(0, 2)
        .join("");
}

export function getAvatarColor(name: string) {
    const colors = [
        "from-blue-500 to-cyan-400",
        "from-violet-500 to-purple-400",
        "from-emerald-500 to-teal-400",
        "from-amber-500 to-orange-400",
        "from-pink-500 to-rose-400",
        "from-indigo-500 to-blue-400",
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
}

export default function Avatar({
    name,
    src,
    size = "md",
    status,
    className,
}: AvatarProps) {
    const initials = getInitials(name);
    const gradient = getAvatarColor(name);

    return (
        <div className={cn("relative inline-flex shrink-0", className)}>
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={cn(sizes[size], "rounded-full object-cover")}
                />
            ) : (
                <div
                    className={cn(
                        sizes[size],
                        "rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold",
                        gradient
                    )}
                >
                    {initials}
                </div>
            )}
            {status && (
                <span
                    className={cn(
                        "absolute border-2 border-[--card] rounded-full",
                        statusColors[status],
                        statusSizes[size]
                    )}
                />
            )}
        </div>
    );
}