"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Compass, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

type Kind = "signed_out" | "no_program" | "error";

const CONTENT: Record<Kind, { icon: typeof LogIn; title: string; body: string; cta: string; href?: string }> = {
    signed_out: {
        icon: LogIn,
        title: "Sign in to see your courses",
        body: "Your course list and access fee are tied to your student account.",
        cta: "Sign in",
        href: "/auth/signin",
    },
    no_program: {
        icon: Compass,
        title: "We couldn't find your programme",
        body: "Finish your admission steps first. If you have, contact support so we can link your programme to your account.",
        cta: "Go to admission",
        href: "/process-admission",
    },
    error: {
        icon: AlertTriangle,
        title: "We couldn't check your access",
        body: "Something went wrong while checking whether your courses are unlocked. Your payment, if any, is safe.",
        cta: "Try again",
    },
};

export function StatePanel({ kind, detail, onRetry }: { kind: Kind; detail?: string; onRetry?: () => void }) {
    const { icon: Icon, title, body, cta, href } = CONTENT[kind];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-sm"
            role={kind === "error" ? "alert" : undefined}
        >
            <span className="rounded-full bg-primary/10 p-4">
                <Icon className="size-8 text-primary" />
            </span>
            <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{body}</p>
                {detail && <p className="text-xs text-muted-foreground/80">{detail}</p>}
            </div>
            {href ? (
                <Button asChild>
                    <Link href={href}>{cta}</Link>
                </Button>
            ) : (
                <Button onClick={onRetry}>{cta}</Button>
            )}
        </motion.div>
    );
}
