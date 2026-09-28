"use client";

import { SITE_TITLE } from "@/config";
import React, { RefObject, useRef } from "react";
import { Card } from "./HomeCard";
import { FEATURES } from "@/lib/constants";
import { useIntersectionObserver } from "@/hooks/animations/useScrollAnimation";

import Lottie from "lottie-react";
import animationData from "@/assets/Programming Computer.json";

export const Features: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef as RefObject<HTMLElement>);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-16 dark:from-[#040916] dark:via-[#070f23] dark:to-[#040814] sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="absolute -left-24 -top-24 h-[24rem] w-[24rem] rounded-full bg-blue-500/12 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-[24rem] w-[24rem] rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="mb-12 grid grid-cols-1 items-center gap-8 sm:mb-16 sm:gap-10 lg:grid-cols-2 lg:gap-14">

          {/* TEXT */}
          <div className="text-left">
            <p className="mb-3 text-sm uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
              Why choose us
            </p>

            <h2 className="text-[1.9rem] font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
              Build your future with{" "}
              <span className="bg-gradient-to-r from-[#ff4b66] to-[#4f76ff] bg-clip-text text-transparent">
                {SITE_TITLE}
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-[0.97rem] leading-relaxed text-slate-600 dark:text-slate-300 sm:mt-5 sm:text-lg">
              We combine academic excellence with real-world skills, digital tools,
              and industry-aligned learning experiences that prepare students for global impact.
            </p>

            
          </div>

          {/* ANIMATION */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-[240px] sm:w-[320px] md:w-[420px]">
              <Lottie animationData={animationData} />
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Card
              key={index}
              className={`
                group relative overflow-hidden rounded-2xl
                border border-slate-200/70 bg-white/85 backdrop-blur-xl
                dark:border-white/10 dark:bg-slate-900/55
                hover:shadow-2xl hover:-translate-y-2
                transition-all duration-500
              `}
            >
              {/* glow hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-rose-500/10 opacity-0 transition duration-500 group-hover:opacity-100" />

              <div className="relative p-6 text-center sm:p-8">

                {/* ICON WRAPPER */}
                <div
                  className={`
                    h-14 w-14 mx-auto mb-5 sm:h-16 sm:w-16 sm:mb-6
                    flex items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br from-blue-600 to-indigo-600
                    text-white text-2xl
                    shadow-md
                    group-hover:scale-110 transition
                  `}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {feature.icon}
                </div>

                {/* TITLE */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white sm:mb-3 sm:text-xl">
                  {feature.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};