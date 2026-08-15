"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function HomeFloatingControls() {
    const { setTheme, resolvedTheme } = useTheme();

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
            </div>
        </div>
    );
}
