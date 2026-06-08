"use client";

import { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Tab {
    key: string;
    label: string;
    badge?: string | number;
    icon?: ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    onChange?: (key: string) => void;
    children: (activeTab: string) => ReactNode;
    className?: string;
}

export default function Tabs({
    tabs,
    defaultTab,
    onChange,
    children,
    className,
}: TabsProps) {
    const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);

    const handleChange = (key: string) => {
        setActive(key);
        onChange?.(key);
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1 w-fit mb-6 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleChange(tab.key)}
                        className={cn(
                            "relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap",
                            active === tab.key
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {active === tab.key && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {tab.icon && <span className="opacity-70">{tab.icon}</span>}
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center leading-none">
                                    {tab.badge}
                                </span>
                            )}
                        </span>
                    </button>
                ))}
            </div>
            {children(active)}
        </div>
    );
}