"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIntersectionObserver } from "@/hooks/animations/useScrollAnimation";
import { useProgramCategories } from "@/hooks/useProgramCategories";
import { mapCategoriesToProgramCards } from "@/lib/program-categories";
import React, { RefObject, useMemo, useRef } from "react";
import Link from "next/link";

export const Programs: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef as RefObject<HTMLElement>);
  const { data: categories = [], isLoading } = useProgramCategories();

  const previewPrograms = useMemo(
    () => mapCategoriesToProgramCards(categories).slice(0, 6),
    [categories]
  );

  return (
    <section
      ref={sectionRef}
      id="programs"
      className="relative overflow-hidden bg-gradient-to-b from-slate-100 to-white px-4 py-16 dark:from-[#050c1d] dark:to-[#060f22] sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="absolute -right-24 -top-24 h-[24rem] w-[24rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-12 text-center sm:mb-16">
          <p className="mb-3 text-sm uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
            Academic offerings
          </p>

          <h2 className="text-[1.9rem] font-bold text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
            Certificate Programmes
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-[0.97rem] leading-relaxed text-slate-600 dark:text-slate-300 sm:mt-5 sm:text-lg">
            A curated preview from the CDP certificate listing with practical,
            career-focused tracks, clear duration windows, and transparent tuition.
          </p>
        </div>

        {/* GRID */}
        {isLoading ? (
          <p className="text-center text-slate-600 dark:text-slate-300">Loading programmes...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {previewPrograms.map((program, index) => {
              const Icon = program.icon;

              return (
                <Card
                  key={program.id}
                  className={`
                    group relative overflow-hidden rounded-2xl
                    border border-slate-200/70 bg-white/90 backdrop-blur-xl
                    dark:border-white/10 dark:bg-slate-900/60
                    hover:-translate-y-2 hover:shadow-2xl
                    transition-all duration-500
                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                  `}
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  {/* hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-rose-500/10 opacity-0 transition duration-500 group-hover:opacity-100" />
                  <div className="absolute right-0 top-0 h-20 w-28 rounded-bl-[2.2rem] bg-gradient-to-bl from-[#ff4b66]/20 to-[#4f76ff]/20" />

                  <div className="relative p-6 sm:p-8">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-slate-600 dark:border-white/15 dark:bg-slate-800/80 dark:text-slate-200">
                        {program.courseCode}
                      </span>
                      <span className="rounded-full bg-gradient-to-r from-[#ff4b66] to-[#4f76ff] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        {program.tuition}
                      </span>
                    </div>

                    {/* ICON + TITLE */}
                    <CardHeader className="p-0 mb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4b66]/15 to-[#4f76ff]/15 text-[#3a63de] dark:text-blue-300 sm:h-12 sm:w-12">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>

                        <CardTitle className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                          {program.title}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    {/* DESCRIPTION */}
                    <CardContent className="p-0">
                      <CardDescription className="line-clamp-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                        {program.description}
                      </CardDescription>
                    </CardContent>

                    {/* FOOTER */}
                    <CardFooter className="mt-6 flex flex-col items-start gap-3 p-0 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200">
                          {program.duration}
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Access: {program.accessFee}
                        </span>
                      </div>

                      <Button
                        asChild
                        className="rounded-full bg-[#3a63de] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2c4fb4]"
                      >
                        <Link href={`/auth/create-account?program_id=${program.id}`}>
                          Enroll to Program
                        </Link>
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button
            asChild
            className="rounded-full border border-white/15 bg-gradient-to-r from-[#eb3f57] via-[#963bcb] to-[#0d58cb] px-7 py-6 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(218,72,100,0.43)] transition-all hover:scale-[1.02] hover:shadow-[0_18px_44px_rgba(33,95,214,0.5)]"
          >
            <Link href="/programs">Read More Programmes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};