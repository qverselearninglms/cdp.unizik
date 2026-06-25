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
      className="relative py-28 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden"
    >
      {/* soft background glow */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-500/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 mb-20">

          {/* TEXT */}
          <div className="text-left">
            <p className="text-sm uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
              Why choose us
            </p>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Build your future with{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {SITE_TITLE}
              </span>
            </h2>

            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              We combine academic excellence with real-world skills, digital tools,
              and industry-aligned learning experiences that prepare students for global impact.
            </p>

            
          </div>

          {/* ANIMATION */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-[320px] md:w-[420px]">
              <Lottie animationData={animationData} />
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <Card
              key={index}
              className={`
                group relative overflow-hidden rounded-2xl
                bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl
                border border-gray-200 dark:border-gray-700
                hover:shadow-2xl hover:-translate-y-2
                transition-all duration-500
              `}
            >
              {/* glow hover effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />

              <div className="relative p-8 text-center">

                {/* ICON WRAPPER */}
                <div
                  className={`
                    w-16 h-16 mx-auto mb-6
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
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
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