"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
};

export default function Modal({
    open,
    onClose,
    title,
    subtitle,
    children,
    footer,
    size = "md",
    className,
}: ModalProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        if (open) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 12 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className={cn(
                            "relative w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden",
                            sizes[size],
                            className
                        )}
                    >
                        {(title || subtitle) && (
                            <div className="flex items-start justify-between p-5 border-b border-border">
                                <div>
                                    {title && (
                                        <h2 className="font-semibold text-foreground">{title}</h2>
                                    )}
                                    {subtitle && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <div className="p-5">{children}</div>
                        {footer && (
                            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/30">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}