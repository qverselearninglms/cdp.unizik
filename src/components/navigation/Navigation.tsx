'use client';

import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    LogOut,
    Menu,
    X,
    GraduationCap,
    BookOpen,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ModeToggle } from '../ui/mood-toggle';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const Navigation = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout, isLoggingOut } = useAuthContext();
    const pathname = usePathname();
    const isHomepage = pathname === '/';
    const isOnAdmissionPage = pathname.startsWith('/process-admission') || pathname.startsWith('/verify-payments');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

    const handleNavClick = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    const initials = user
        ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
        : '';

    return (
        <>
            {/* ── Navbar ── */}
            <header
                className={cn(
                    'sticky top-0 z-50 w-full transition-all duration-300',
                    isScrolled
                        ? 'bg-background/80 backdrop-blur-md shadow-sm border-b border-border/60'
                        : 'bg-background/60 backdrop-blur-sm'
                )}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">

                        {/* ── Logo ── */}
                        {/* <Link href="/" className="flex items-center gap-2.5 shrink-0">
                            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
                                <Image
                                    src="/logo/logo-removebg-preview.png"
                                    alt="CDP UNIZIK"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>
                            <div className="hidden sm:flex flex-col leading-none">
                                <span className="text-sm font-bold text-foreground tracking-tight">CDP · UNIZIK</span>
                                <span className="text-[10px] text-muted-foreground">University Portal</span>
                            </div>
                        </Link> */}

                        {/* ── Desktop Nav Links (homepage only) ── */}
                        {isHomepage && (
                            <nav className="hidden md:flex items-center gap-1">
                                {NAV_ITEMS.map((item) => (
                                    <button
                                        key={item.href}
                                        onClick={() => handleNavClick(item.href)}
                                        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        )}

                        {/* ── Admission breadcrumb (non-homepage) ── */}
                        {!isHomepage && (
                            <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                <span className="font-medium text-foreground">Admission Portal</span>
                            </div>
                        )}

                        {/* ── Right Side ── */}
                        <div className="flex items-center gap-2">
                            <ModeToggle />

                            {user ? (
                                <>
                                    {/* Enroll link — hidden on admission pages */}
                                    {!isOnAdmissionPage && (
                                        <Button variant="outline" size="sm" asChild className="hidden md:flex gap-1.5">
                                            <Link href="/process-admission">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                Admission
                                            </Link>
                                        </Button>
                                    )}

                                    {/* User pill */}
                                    <div className="hidden md:flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={(user as { avatar?: string }).avatar} />
                                            <AvatarFallback className="text-[10px] font-semibold bg-primary/15 text-primary">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-foreground leading-none">
                                            {user.first_name}
                                        </span>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => logout()}
                                        loading={isLoggingOut}
                                        className="hidden md:flex text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <Button size="sm" asChild className="hidden md:flex">
                                    <Link href="/auth/signin">Sign In</Link>
                                </Button>
                            )}

                            {/* Mobile hamburger */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setIsMobileMenuOpen((v) => !v)}
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Mobile Drawer ── */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-0 h-full w-72 bg-background shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-primary" />
                                <span className="font-semibold text-sm">CDP · UNIZIK</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* User info */}
                        {user && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-muted/30">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={(user as { avatar?: string }).avatar} />
                                    <AvatarFallback className="font-semibold bg-primary/15 text-primary">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold truncate">
                                        {user.first_name} {user.last_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Nav links */}
                        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                            {isHomepage && NAV_ITEMS.map((item) => (
                                <button
                                    key={item.href}
                                    onClick={() => handleNavClick(item.href)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-accent text-foreground transition-colors"
                                >
                                    {item.label}
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                            ))}

                            {user && !isOnAdmissionPage && (
                                <Link
                                    href="/process-admission"
                                    className="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-accent text-foreground transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        Admission Portal
                                    </span>
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </Link>
                            )}
                        </nav>

                        <Separator />

                        {/* Footer actions */}
                        <div className="px-3 py-4">
                            {user ? (
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                    loading={isLoggingOut}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </Button>
                            ) : (
                                <Button asChild className="w-full">
                                    <Link href="/auth/signin">Sign In</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};