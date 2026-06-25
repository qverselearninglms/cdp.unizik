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
import { PROGRAMS } from "@/lib/constants";
import React, { RefObject, useRef } from "react";

export const Programs: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef as RefObject<HTMLElement>);

  return (
    <section
      ref={sectionRef}
      id="programs"
      className="relative py-28 px-6 bg-gray-50 dark:bg-gray-900 overflow-hidden"
    >
      {/* subtle background accents */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-500/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Academic offerings
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Featured Academic Programs
          </h2>

          <p className="mt-5 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Structured learning paths designed to match real-world industry needs,
            career growth, and academic excellence.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROGRAMS.map((program, index) => {
            const Icon = program.icon;

            return (
              <Card
                key={index}
                className={`
                  group relative overflow-hidden rounded-2xl
                  bg-white dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  hover:-translate-y-2 hover:shadow-2xl
                  transition-all duration-500
                  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                `}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {/* hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition duration-500" />

                <div className="relative p-8">

                  {/* ICON + TITLE */}
                  <CardHeader className="p-0 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Icon className="h-6 w-6" />
                      </div>

                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {program.title}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  {/* DESCRIPTION */}
                  <CardContent className="p-0">
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {program.description}
                    </CardDescription>
                  </CardContent>

                  {/* FOOTER */}
                  <CardFooter className="p-0 mt-8 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      {program.duration}
                    </span>

                    <Button
                      variant="ghost"
                      className="text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                    >
                      Explore →
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};