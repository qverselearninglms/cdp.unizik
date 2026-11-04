"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProgramCourse } from "../_types/enrollment";

/** Stable accent per course so the grid isn't a wall of identical cards. */
const ACCENTS = [
    "from-emerald-500/20 to-teal-500/5",
    "from-sky-500/20 to-indigo-500/5",
    "from-amber-500/20 to-orange-500/5",
    "from-fuchsia-500/20 to-purple-500/5",
    "from-rose-500/20 to-red-500/5",
];

export const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

interface Props {
    course: ProgramCourse;
    unlocked: boolean;
    onContinue: () => void;
}

export function CourseCard({ course, unlocked, onContinue }: Props) {
    const accent = ACCENTS[course.id % ACCENTS.length];

    return (
        <motion.article
            layout
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-lg"
        >
            <div className={cn("relative flex h-24 items-end bg-gradient-to-br p-4", accent)}>
                <span className="rounded-md bg-background/80 px-2 py-0.5 font-mono text-xs font-semibold text-foreground backdrop-blur">
                    {course.shortName || `#${course.id}`}
                </span>
                <motion.span
                    key={unlocked ? "open" : "locked"}
                    initial={{ scale: 0.6, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={cn(
                        "absolute right-3 top-3 flex size-8 items-center justify-center rounded-full backdrop-blur",
                        unlocked ? "bg-emerald-500/90 text-white" : "bg-background/80 text-muted-foreground"
                    )}
                    aria-label={unlocked ? "Unlocked" : "Locked"}
                >
                    {unlocked ? <BookOpen className="size-4" /> : <Lock className="size-4" />}
                </motion.span>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="line-clamp-2 font-semibold leading-snug text-foreground">{course.name}</h3>
                {course.summary && <p className="line-clamp-3 text-sm text-muted-foreground">{course.summary}</p>}

                <div className="mt-auto pt-2">
                    {unlocked ? (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }}>
                            <Button onClick={onContinue} className="w-full gap-2">
                                Continue Learning <ArrowUpRight className="size-4" />
                            </Button>
                        </motion.div>
                    ) : (
                        <p className="flex items-center justify-center gap-1.5 rounded-lg bg-muted/60 py-2 text-xs font-medium text-muted-foreground">
                            <Lock className="size-3.5" /> Unlocks after access fee
                        </p>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
