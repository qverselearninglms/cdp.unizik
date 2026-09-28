"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpenCheck, CircleChevronRight, FilePenLine, GraduationCap } from 'lucide-react';

const AUTOPLAY_DELAY = 5000;

const heroSlides = [
    {
        image: '/slides/sl1.jpg',
        tag: "Skills for Today's Workplace",
        titleTop: 'Learn Skills That',
        titleAccent: 'Employers',
        titleBottom: 'Value',
        subtitle: 'Practical Training for Career Growth and Enterprise',
        description:
            'Our programmes combine academic quality with practical, industry-facing training to prepare participants for employment, promotion, entrepreneurship and lifelong learning.',
        primaryCta: { label: 'Browse Career Programmes', href: '/programs', icon: GraduationCap },
        secondaryCta: { label: 'Learn More', href: '/programs', icon: BookOpenCheck },
    },
    {
        image: '/slides/sl4.jpg',
        tag: 'Applications Now Open',
        titleTop: 'Start Your',
        titleAccent: 'Learning',
        titleBottom: 'Journey',
        subtitle: 'Apply for a Certificate or Diploma Programme',
        description:
            'Choose from flexible programmes developed for students, professionals, entrepreneurs and individuals seeking new skills and qualifications.',
        primaryCta: { label: 'View Admission Requirements', href: '/admission', icon: FilePenLine },
        secondaryCta: { label: 'Begin Application', href: '/auth/create-account', icon: CircleChevronRight },
    },
    {
        image: '/slides/sl2.jpg',
        tag: 'Flexible Learning',
        titleTop: 'Flexible Learning',
        titleAccent: 'for Busy People',
        titleBottom: '',
        subtitle: 'Study On Campus, Online or Through Blended Learning',
        description:
            'Access quality university education through flexible delivery options designed to accommodate workers, business owners, school leavers and other adult learners.',
        primaryCta: { label: 'View Learning Options', href: '/programs', icon: GraduationCap },
        secondaryCta: { label: 'Contact the Directorate', href: '/administration/contact-administration', icon: BookOpenCheck },
    },
];

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
    const total = heroSlides.length;
    const slideContent = heroSlides[current % heroSlides.length];

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
            className="relative isolate w-full min-h-screen bg-black overflow-hidden select-none"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="absolute right-3 top-16 z-50 sm:right-4 md:right-6 md:top-20">
                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/25 bg-[#060f2a]/85 px-2.5 text-xs font-semibold text-white shadow-[0_14px_34px_rgba(2,8,23,0.55)] backdrop-blur-md transition-colors hover:bg-[#081537]/90 sm:h-10 sm:px-3 sm:text-sm">
                        <span className="bg-gradient-to-r from-[#ff4b66] to-[#4f76ff] bg-clip-text text-transparent">
                            Administration
                        </span>
                        <span className="text-white/70">▾</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-64 border-slate-700/80 bg-slate-950/95 text-slate-100 backdrop-blur-md"
                    >
                        <DropdownMenuLabel>Administration</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/administration/administrative-structure">Administrative Structure</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/administration/units-and-functions">Units and Functions</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/administration/policies-and-procedures">Policies and Procedures</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/administration/staff-directory">Staff Directory</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/administration/contact-administration">Contact Administration</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

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
                        src={slideContent.image}
                        alt={`Slide ${current + 1}`}
                        fill
                        priority={current === 0}
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_90%,rgba(232,43,76,0.18),transparent_34%)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#030b1e96] via-[#06163666] to-[#0b1a3724]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0307129c] via-[#0206171f] to-[#02061740]" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute left-10 top-8 h-20 w-28 bg-[radial-gradient(circle,rgba(255,255,255,0.28)_1.2px,transparent_1.2px)] [background-size:10px_10px] opacity-35" />
                <div className="absolute left-0 top-0 h-[32rem] w-[24rem] bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_66%)]" />
                <div ref={el => { floatRefs.current[0] = el; }} className="absolute -bottom-[22rem] -left-[20rem] h-[50rem] w-[50rem] rounded-full bg-[conic-gradient(from_248deg_at_62%_60%,rgba(255,95,125,0.72),rgba(181,54,182,0.35),rgba(24,15,57,0)_58%)] blur-3xl" />
                <div ref={el => { floatRefs.current[1] = el; }} className="absolute -bottom-[15rem] -left-[15rem] h-[28rem] w-[54rem] rotate-[-13deg] rounded-[100%] border border-[#ff5c78]/40" />
                <div ref={el => { floatRefs.current[2] = el; }} className="absolute -bottom-[9rem] -left-[9rem] h-[17rem] w-[44rem] rotate-[-13deg] rounded-[100%] border border-[#7a46c8]/35" />
                <div className="absolute -bottom-12 -left-12 h-56 w-[34rem] rotate-[-10deg] bg-gradient-to-r from-[#f13b5e]/58 via-[#7f42cf]/28 to-transparent blur-xl" />
            </div>

            <div className="relative z-30 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-2 pb-14 pt-5 sm:px-4 sm:pb-14 sm:pt-7 lg:px-5 xl:px-6">
                <div className="flex flex-1 items-center">
                    <div className="max-w-[760px] py-8 sm:py-14 lg:py-16">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`content-${current}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -16, opacity: 0 }}
                                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="mb-5 flex items-start gap-2.5 text-white/95 sm:mb-7 sm:gap-3">
                                    <div className="relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-md border border-[#f44b64]/60 bg-[#130f25]/85 shadow-[0_0_22px_rgba(244,75,100,0.35)] sm:h-9 sm:w-9">
                                        <Image
                                            src="/logo/logo-removebg-preview.png"
                                            alt="UNIZIK logo"
                                            fill
                                            className="object-contain p-[2px]"
                                        />
                                    </div>
                                    <div>
                                        <div className="inline-flex items-center gap-2 text-xs font-medium sm:text-[0.98rem]">
                                            <span>{slideContent.tag}</span>
                                        </div>
                                        <div className="mt-2 h-[2px] w-24 bg-gradient-to-r from-[#f44b64] to-transparent sm:w-36" />
                                    </div>
                                </div>
                                <h1 className="text-balance text-[clamp(2.1rem,6vw,5.75rem)] font-extrabold leading-[0.99] text-white">
                                    {slideContent.titleTop}
                                    <br />
                                    <span className="bg-gradient-to-r from-[#ff4658] via-[#ff2f64] to-[#ff596a] bg-clip-text text-transparent">
                                        {slideContent.titleAccent}
                                    </span>
                                    {slideContent.titleBottom ? (
                                        <>
                                            {' '}
                                            {slideContent.titleBottom}
                                        </>
                                    ) : null}
                                </h1>

                                <p className="mt-6 text-[clamp(1.08rem,1.45vw,1.4rem)] font-semibold leading-[1.62] text-[#4f76ff] sm:mt-7">
                                    {slideContent.subtitle}
                                </p>

                                <p className="mt-4 max-w-[60ch] text-[clamp(1.08rem,1.45vw,1.4rem)] leading-[1.72] text-slate-100 sm:mt-5">
                                    {slideContent.description}
                                </p>

                                <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                    <Link
                                        href={slideContent.primaryCta.href}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/18 bg-gradient-to-r from-[#eb3f57] via-[#963bcb] to-[#0d58cb] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(218,72,100,0.43)] transition-all hover:scale-[1.02] hover:shadow-[0_18px_44px_rgba(33,95,214,0.5)] sm:w-auto sm:px-8 sm:py-4 sm:text-[1.05rem]"
                                    >
                                        <slideContent.primaryCta.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {slideContent.primaryCta.label}
                                    </Link>
                                    <Link
                                        href={slideContent.secondaryCta.href}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#1a4ca8] bg-[#040d25]/78 px-5 py-3 text-sm font-semibold text-slate-100 shadow-[inset_0_0_0_1px_rgba(234,57,88,0.55)] transition-colors hover:bg-[#07163d] sm:w-auto sm:px-8 sm:py-4 sm:text-[1.05rem]"
                                    >
                                        <slideContent.secondaryCta.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {slideContent.secondaryCta.label}
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Prev arrow */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 lg:flex"
                aria-label="Previous slide"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Next arrow */}
            <button
                onClick={next}
                className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 lg:flex"
                aria-label="Next slide"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dot navigation */}
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-7">
                {heroSlides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-300 ${i === current
                                ? 'h-2 w-8 bg-white'
                                : 'h-2 w-2 bg-white/55 hover:bg-white/80'
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