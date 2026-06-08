"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Home, ArrowRight, ExternalLink } from "lucide-react";

type LinkVariant =
    | "gradient-underline"
    | "glow-scale"
    | "sleek-border"
    | "background-pill"
    | "slide-fade"
    | "neon-glow"
    | "gradient-text"
    | "with-icon";

interface AnimatedLinkProps {
    href: string;
    children: ReactNode;
    variant?: LinkVariant;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
    external?: boolean;
    className?: string;
    onClick?: () => void;
}

const variantStyles: Record<LinkVariant, string> = {
    "gradient-underline": "relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-primary/60 after:transition-all after:duration-300 hover:after:w-full",
    "glow-scale": "transition-all duration-300 hover:scale-105 hover:text-primary/80 hover:drop-shadow-[0_0_8px_var(--color-primary)]",
    "sleek-border": "group relative transition-colors duration-300 hover:text-primary [&>span]:absolute [&>span]:-bottom-1 [&>span]:left-0 [&>span]:h-0.5 [&>span]:w-0 [&>span]:bg-primary [&>span]:transition-all [&>span]:duration-300 group-hover:[&>span]:w-full",
    "background-pill": "rounded-full px-4 py-1.5 transition-all duration-300 hover:bg-primary/10 hover:px-5",
    "slide-fade": "relative text-muted-foreground transition-all duration-300 hover:text-primary hover:tracking-wide [&>span]:relative [&>span]:inline-block [&>span>span]:absolute [&>span>span]:-bottom-1 [&>span>span]:left-0 [&>span>span]:h-0.5 [&>span>span]:w-0 [&>span>span]:bg-primary [&>span>span]:transition-all [&>span>span]:duration-300 hover:[&>span>span]:w-full",
    "neon-glow": "transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_6px_var(--color-primary)]",
    "gradient-text": "group relative [&>span:first-child]:absolute [&>span:first-child]:inset-0 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-primary [&>span:first-child]:via-primary/80 [&>span:first-child]:to-primary [&>span:first-child]:bg-[length:200%_auto] [&>span:first-child]:bg-clip-text [&>span:first-child]:opacity-0 [&>span:first-child]:transition-opacity [&>span:first-child]:duration-300 [&>span:first-child]:[-webkit-text-fill-color:transparent] group-hover:[&>span:first-child]:opacity-100 [&>span:last-child]:text-primary [&>span:last-child]:transition-opacity [&>span:last-child]:duration-300 group-hover:[&>span:last-child]:opacity-0",
    "with-icon": "group flex items-center gap-2 transition-all duration-300 hover:gap-3 [&>svg]:transition-transform [&>svg]:duration-300 group-hover:[&>svg]:scale-110",
};

export default function AnimatedLink({
    href,
    children,
    variant = "sleek-border",
    icon,
    iconPosition = "left",
    external = false,
    className,
    onClick,
}: AnimatedLinkProps) {
    const linkProps = external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {};

    const renderContent = () => {
        if (variant === "gradient-text") {
            return (
                <>
                    <span aria-hidden="true">{children}</span>
                    <span>{children}</span>
                </>
            );
        }

        if (variant === "sleek-border") {
            return (
                <>
                    {children}
                    <span />
                </>
            );
        }

        if (variant === "slide-fade") {
            return (
                <span>
                    {children}
                    <span />
                </span>
            );
        }

        if (variant === "with-icon") {
            const defaultIcon = icon || <ArrowRight size={16} />;
            return (
                <>
                    {iconPosition === "left" && defaultIcon}
                    {children}
                    {iconPosition === "right" && defaultIcon}
                </>
            );
        }

        return children;
    };

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "text-sm font-medium",
                variantStyles[variant],
                className
            )}
            {...linkProps}
        >
            {renderContent()}
        </Link>
    );
}