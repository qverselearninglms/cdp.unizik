"use client";

import Link from "next/link";
import { LogIn, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/providers/AuthProvider";

export default function HomeFloatingControls() {
    const { setTheme, resolvedTheme } = useTheme();
    const { user, logout, isLoggingOut } = useAuthContext();

    const initials = user
        ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
        : "";

    return (
        <div className="fixed right-4 top-3 z-[120] md:right-6 md:top-4">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.25)] backdrop-blur-md">
                <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        resolvedTheme === "light"
                            ? "border-amber-300 bg-amber-100 text-amber-700"
                            : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-label="Switch to light theme"
                    title="Light"
                >
                    <Sun className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        resolvedTheme === "dark"
                            ? "border-indigo-300 bg-indigo-100 text-indigo-700"
                            : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-label="Switch to dark theme"
                    title="Dark"
                >
                    <Moon className="h-4 w-4" />
                </button>

                <span aria-hidden className="mx-0.5 h-6 w-px bg-slate-200" />

                {user ? (
                    <>
                        {/* Who you are signed in as. The name is hidden on the
                            narrowest screens so the pill never crowds the hero. */}
                        <Link
                            href="/student/dashboard"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 py-1 pl-1 pr-1.5 text-slate-700 transition-colors hover:bg-slate-100 sm:pr-2.5"
                            title={`Signed in as ${user.first_name ?? "your account"} — go to dashboard`}
                        >
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={(user as { avatar?: string }).avatar} />
                                <AvatarFallback className="text-[10px]">{initials || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="hidden text-xs font-semibold sm:inline">
                                {user.first_name}
                            </span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => logout()}
                            disabled={isLoggingOut}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
                            aria-label="Sign out"
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </>
                ) : (
                    <Link
                        href="/auth/signin"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
                    >
                        <LogIn className="h-3.5 w-3.5" />
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    );
}
