"use client";

import { homeSliderData } from '@/lib/slides';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import Image from 'next/image';

const AUTOPLAY_DELAY = 5000;

const slideVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? '100%' : '-100%',
        scale: 1.05,
        opacity: 0,
    }),
    center: {
        x: '0%',
        scale: 1,
        opacity: 1,
        transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
    exit: (dir: number) => ({
        x: dir > 0 ? '-100%' : '100%',
        scale: 0.98,
        opacity: 0,
        transition: { duration: 0.7, ease: [0.55, 0, 1, 0.45] as const },
    }),
};

const HomeSlider = () => {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [paused, setPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const floatRefs = useRef<(HTMLDivElement | null)[]>([]);
    const total = homeSliderData.length;

    // GSAP: drift the ambient blobs continuously
    useEffect(() => {
        const ctx = gsap.context(() => {
            floatRefs.current.forEach((el, i) => {
                if (!el) return;
                gsap.to(el, {
                    x: (i % 2 === 0 ? 1 : -1) * 35,
                    y: (i % 3 === 0 ? 1 : -1) * 25,
                    duration: 5 + i * 1.8,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => {
            setDirection(1);
            setCurrent(c => (c + 1) % total);
        }, AUTOPLAY_DELAY);
        return () => clearInterval(id);
    }, [paused, total]);

    const goTo = useCallback((index: number) => {
        setDirection(index > current ? 1 : -1);
        setCurrent(index);
    }, [current]);

    const next = useCallback(() => {
        setDirection(1);
        setCurrent(c => (c + 1) % total);
    }, [total]);

    const prev = useCallback(() => {
        setDirection(-1);
        setCurrent(c => (c - 1 + total) % total);
    }, [total]);

    return (
        <section
            id="home"
            ref={containerRef}
            className="relative w-full h-screen bg-black overflow-hidden select-none pt-7"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Slides */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={current}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                >
                    <Image
                        src={homeSliderData[current]}
                        alt={`Slide ${current + 1}`}
                        fill
                        priority={current === 0}
                        className="object-cover"
                    />
                    {/* Subtle vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Floating Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div ref={el => { floatRefs.current[0] = el; }} className="absolute top-[10%] left-[10%] w-48 h-48 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
                <div ref={el => { floatRefs.current[1] = el; }} className="absolute top-[60%] right-[15%] w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
                <div ref={el => { floatRefs.current[2] = el; }} className="absolute bottom-[20%] left-[70%] w-56 h-56 bg-gradient-to-r from-pink-500/10 to-blue-500/10 rounded-full blur-3xl" />
            </div>

            {/* Prev arrow */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-sm transition-colors text-white"
                aria-label="Previous slide"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Next arrow */}
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-sm transition-colors text-white"
                aria-label="Next slide"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dot navigation */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {homeSliderData.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`transition-all duration-300 rounded-full ${i === current
                                ? 'w-7 h-2 bg-white'
                                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Autoplay progress bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
                {!paused && (
                    <motion.div
                        key={`${current}-bar`}
                        className="h-full bg-white/60"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
                    />
                )}
            </div>
        </section>
    );
};

export default HomeSlider;