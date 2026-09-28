'use client';

import React, { RefObject, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/animations/useScrollAnimation';
import { STATS } from '@/lib/constants';

export const Stats: React.FC = () => {
    const statsRef = useRef<HTMLDivElement>(null);
    const isVisible = useIntersectionObserver(statsRef as RefObject<HTMLElement>);

    return (
        <section
            ref={statsRef}
            className="relative overflow-hidden bg-gradient-to-r from-[#091737] via-[#0d2c63] to-[#163f82] px-4 py-16 text-center text-white dark:from-[#040814] dark:via-[#09162f] dark:to-[#0f2450] sm:px-6"
        >
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-rose-500/18 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-300/16 blur-3xl" />
            <div className="max-w-8xl mx-auto">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
                    {STATS.map((stat, index) => (
                        <div key={index} className="text-center">
                            <span
                                className={`text-4xl md:text-5xl font-extrabold block mb-2 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                    }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                            >
                                {stat.number}
                            </span>
                            <span
                                className={`text-base opacity-90 transition-all duration-1000 ${isVisible ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4'
                                    }`}
                                style={{ transitionDelay: `${index * 200 + 100}ms` }}
                            >
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};