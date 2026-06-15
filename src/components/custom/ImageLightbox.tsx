"use client";

import { useState, useRef } from "react";
import { FileText, Trash2, Upload, X, ZoomIn, ExternalLink, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatImageUrl } from "@/lib/imageUrl";
import Link from "next/link";

// ── Helpers ───────────────────────────────────────────────────────────────────

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"];
const DOC_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"];

function getExtension(url: string): string {
    try {
        const clean = url.split("?")[0]; // strip query params
        return clean.split(".").pop()?.toLowerCase() ?? "";
    } catch {
        return "";
    }
}

function isImageUrl(url: string): boolean {
    if (url.startsWith("blob:")) return true; // local preview
    return IMAGE_EXTENSIONS.includes(getExtension(url));
}

function getDocIcon(ext: string): string {
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["ppt", "pptx"].includes(ext)) return "📋";
    return "📁";
}

// ── Image Lightbox Modal ──────────────────────────────────────────────────────

function ImageLightbox({
    src,
    alt,
    onClose,
}: {
    src: string;
    alt: string;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute -right-3 -top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background shadow-lg border border-border hover:bg-accent transition-colors"
                >
                    <X className="size-4" />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                />
            </div>
        </div>
    );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface CertificateViewerProps {
    /** Raw URL from the API — will be passed through formatImageUrl */
    url: string;
    /** Used as alt text and aria labels */
    label?: string;
    /** Show delete / upload controls */
    editable?: boolean;
    onDelete?: () => void;
    onReplace?: (file: File) => void;
    className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CertificateViewer({
    url,
    label = "Certificate",
    editable = false,
    onDelete,
    onReplace,
    className,
}: CertificateViewerProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formattedUrl = formatImageUrl(url);
    const ext = getExtension(url);
    const isImage = isImageUrl(url);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onReplace) {
            onReplace(file);
        }
        // Reset so the same file can be re-selected if needed
        e.target.value = "";
    };

    return (
        <div className={cn("mt-2 space-y-2", className)}>
            {/* Section label */}
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
            </p>

            {isImage ? (
                /* ── Image display ──────────────────────────────────── */
                <div className="group relative w-full max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={formattedUrl}
                        alt={`${label}`}
                        onClick={() => setLightboxOpen(true)}
                        className="h-auto w-full cursor-zoom-in rounded-xl border border-border object-cover transition-opacity group-hover:opacity-90"
                    />

                    {/* Zoom hint overlay */}
                    <div
                        onClick={() => setLightboxOpen(true)}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
                    >
                        <div className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                            <ZoomIn className="size-3.5" />
                            Click to enlarge
                        </div>
                    </div>

                    {lightboxOpen && (
                        <ImageLightbox
                            src={formattedUrl}
                            alt={label}
                            onClose={() => setLightboxOpen(false)}
                        />
                    )}
                </div>
            ) : (
                /* ── Document display ───────────────────────────────── */
                <Link
                    href={formattedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted"
                >
                    <span className="text-2xl leading-none" aria-hidden>
                        {getDocIcon(ext)}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                            {label}
                        </p>
                        <p className="text-[11px] uppercase text-muted-foreground">
                            {ext || "document"}
                        </p>
                    </div>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </Link>
            )
            }

            {/* ── Editable controls ──────────────────────────────────── */}
            {
                editable && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                            <Upload className="size-3.5" />
                            Replace
                        </button>

                        {onDelete && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-background px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                            >
                                <Trash2 className="size-3.5" />
                                Remove
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )
            }
        </div >
    );
}