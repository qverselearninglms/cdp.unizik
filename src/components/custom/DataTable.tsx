"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: "left" | "center" | "right";
    render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
    data: T[];
    columns: Column<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    searchExtractor?: (row: T) => string;
    pageSize?: number;
    emptyMessage?: string;
    loading?: boolean;
    rowKey?: keyof T | ((row: T) => string);
    onRowClick?: (row: T) => void;
    className?: string;
}

type SortDir = "asc" | "desc" | null;

export default function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    searchable = true,
    searchPlaceholder = "Search…", searchExtractor, pageSize = 10,
    emptyMessage = "No records found",
    loading = false,
    rowKey,
    onRowClick,
    className,
}: DataTableProps<T>) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter((row) => {
            if (searchExtractor) {
                return searchExtractor(row).toLowerCase().includes(q);
            }
            return Object.values(row).some((v) =>
                String(v ?? "").toLowerCase().includes(q)
            );
        });
    }, [data, search, searchExtractor]);

    const sorted = useMemo(() => {
        if (!sortKey || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const va = a[sortKey as keyof T] ?? "";
            const vb = b[sortKey as keyof T] ?? "";
            const cmp =
                typeof va === "number" && typeof vb === "number"
                    ? va - vb
                    : String(va).localeCompare(String(vb));
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

    const handleSort = (key: string) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDir("asc");
        } else if (sortDir === "asc") {
            setSortDir("desc");
        } else if (sortDir === "desc") {
            setSortKey(null);
            setSortDir(null);
        }
        setPage(1);
    };

    const SortIcon = ({ col }: { col: Column<T> }) => {
        const key = String(col.key);
        if (!col.sortable) return null;
        if (sortKey !== key)
            return <ChevronsUpDown size={12} className="opacity-40" />;
        return sortDir === "asc" ? (
            <ChevronUp size={12} className="text-primary" />
        ) : (
            <ChevronDown size={12} className="text-primary" />
        );
    };

    const getKey = (row: T, i: number) => {
        if (!rowKey) return i;
        if (typeof rowKey === "function") return rowKey(row);
        return String(row[rowKey as keyof T]);
    };

    return (
        <div className={cn("bg-card border border-border rounded-2xl overflow-hidden", className)}>
            {searchable && (
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-xs">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder={searchPlaceholder}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-muted border border-transparent rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground text-foreground"
                        />
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    style={{ width: col.width }}
                                    className={cn(
                                        "px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap",
                                        col.align === "center" && "text-center",
                                        col.align === "right" && "text-right",
                                        !col.align && "text-left"
                                    )}
                                >
                                    {col.sortable ? (
                                        <button
                                            onClick={() => handleSort(String(col.key))}
                                            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                                        >
                                            {col.header}
                                            <SortIcon col={col} />
                                        </button>
                                    ) : (
                                        col.header
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border">
                                    {columns.map((c) => (
                                        <td key={String(c.key)} className="px-4 py-3">
                                            <div className="h-4 bg-muted rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : pageData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-12 text-center text-muted-foreground text-sm"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            <AnimatePresence initial={false}>
                                {pageData.map((row, i) => (
                                    <motion.tr
                                        key={getKey(row, i)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => onRowClick?.(row)}
                                        className={cn(
                                            "border-b border-border last:border-0 transition-colors",
                                            onRowClick && "cursor-pointer hover:bg-accent"
                                        )}
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={String(col.key)}
                                                className={cn(
                                                    "px-4 py-3 text-foreground whitespace-nowrap",
                                                    col.align === "center" && "text-center",
                                                    col.align === "right" && "text-right"
                                                )}
                                            >
                                                {col.render
                                                    ? col.render(row, i)
                                                    : String(row[col.key as keyof T] ?? "—")}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        Showing {(page - 1) * pageSize + 1}–
                        {Math.min(page * pageSize, sorted.length)} of {sorted.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent disabled:opacity-40 transition-colors text-foreground"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            let p = i + 1;
                            if (totalPages > 5) {
                                if (page <= 3) p = i + 1;
                                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                else p = page - 2 + i;
                            }
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        "w-7 h-7 text-xs rounded-lg font-medium transition-colors",
                                        page === p
                                            ? "bg-primary text-[--primary-foreground]"
                                            : "hover:bg-accent text-muted-foreground"
                                    )}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent disabled:opacity-40 transition-colors text-foreground"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}