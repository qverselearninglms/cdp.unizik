"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookX, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "./CourseCard";
import type { ProgramCourse } from "../_types/enrollment";

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className={GRID} aria-busy="true" aria-label="Loading courses">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                    <Skeleton className="h-24 w-full rounded-none" />
                    <div className="space-y-3 p-4">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

interface Props {
    courses: ProgramCourse[];
    isLoading: boolean;
    error: Error | null;
    unlocked: boolean;
    onContinue: (course: ProgramCourse) => void;
    onRetry: () => void;
}

export function CourseGrid({ courses, isLoading, error, unlocked, onContinue, onRetry }: Props) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return courses;
        return courses.filter((c) => `${c.name} ${c.shortName} ${c.summary}`.toLowerCase().includes(q));
    }, [courses, query]);

    return (
        <section className="space-y-4" aria-labelledby="courses-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 id="courses-heading" className="text-lg font-semibold text-foreground">
                        Courses in your programme
                    </h2>
                    {!isLoading && !error && (
                        <p className="text-sm text-muted-foreground">
                            {courses.length} {courses.length === 1 ? "course" : "courses"}
                            {unlocked ? " · all unlocked" : " · locked until access fee is paid"}
                        </p>
                    )}
                </div>

                {courses.length > 3 && (
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search courses"
                            className="pl-9 pr-9"
                            aria-label="Search courses"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {isLoading ? (
                <CourseGridSkeleton />
            ) : error ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-8 text-center">
                    <BookX className="size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">We couldn&apos;t load your courses. Check your connection and try again.</p>
                    <Button variant="outline" onClick={onRetry}>Try again</Button>
                </div>
            ) : courses.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed p-8 text-center">
                    <BookX className="size-8 text-muted-foreground" />
                    <p className="font-medium text-foreground">No courses published yet</p>
                    <p className="max-w-md text-sm text-muted-foreground">
                        Your programme&apos;s courses haven&apos;t been published yet. Check back soon. You can still pay your access fee now.
                    </p>
                </div>
            ) : (
                <motion.div
                    layout
                    className={GRID}
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                >
                    <AnimatePresence mode="popLayout">
                        {filtered.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                unlocked={unlocked}
                                onContinue={() => onContinue(course)}
                            />
                        ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                            No course matches &ldquo;{query}&rdquo;.
                        </p>
                    )}
                </motion.div>
            )}
        </section>
    );
}
