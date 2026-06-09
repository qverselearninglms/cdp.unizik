'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants, Easing } from 'framer-motion';
import { gsap } from 'gsap';
import {
    ChevronRight,
    ChevronLeft,
    GraduationCap,
    BookOpen,
    Folder,
    FolderOpen,
    CheckCircle2,
    Loader2,
    AlertCircle,
    RefreshCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProgramStore, CategoryNode } from '@/store/useProgramStore';
import { useProgramCategories } from '@/hooks/useProgramCategories';
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { SignUpFormData } from '@/schema/sign-up-schema';
import { cn } from '@/lib/utils';

interface ProgramSelectorProps {
    setValue: UseFormSetValue<SignUpFormData>;
    trigger: UseFormTrigger<SignUpFormData>;
    error?: string;
}

// ─── Animation Variants (Fixed) ───────────────────────────────────────────────

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" as Easing, staggerChildren: 0.06 },
    },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeIn" as Easing } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.35, ease: "easeOut" as Easing },
    },
};

// ─── Depth-aware icon picker ───────────────────────────────────────────────────

function getDepthIcon(depth: number, hasChildren: boolean): React.ReactNode {
    if (!hasChildren) return <GraduationCap className="w-5 h-5" />;
    if (depth === 0) return <BookOpen className="w-5 h-5" />;
    return <Folder className="w-5 h-5" />;
}

// ─── Breadcrumb Component ──────────────────────────────────────────────────────

interface BreadcrumbProps {
    stack: CategoryNode[];
    onJumpTo: (index: number) => void;
}

function Breadcrumb({ stack, onJumpTo }: BreadcrumbProps) {
    if (stack.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 flex-wrap text-xs text-gray-500 mb-4 px-1"
        >
            <button
                type="button"
                onClick={() => onJumpTo(-1)}
                className="hover:text-blue-600 transition-colors font-medium"
            >
                Programs
            </button>
            {stack.map((node, i) => (
                <React.Fragment key={node.id}>
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <button
                        type="button"
                        onClick={() => onJumpTo(i)}
                        className={cn(
                            'hover:text-blue-600 transition-colors truncate max-w-[140px]',
                            i === stack.length - 1 ? 'text-blue-600 font-semibold' : 'font-medium'
                        )}
                    >
                        {node.name}
                    </button>
                </React.Fragment>
            ))}
        </motion.div>
    );
}

// ─── Single Category Card ──────────────────────────────────────────────────────

interface CategoryCardProps {
    node: CategoryNode;
    depth: number;
    onSelect: (node: CategoryNode) => void;
    onEnroll: (node: CategoryNode) => void;
}

function CategoryCard({ node, depth, onSelect, onEnroll }: CategoryCardProps) {
    const hasChildren = node.children.length > 0;
    const cardRef = useRef<HTMLDivElement>(null);

    const handleHoverEnter = () => {
        if (!cardRef.current) return;
        gsap.to(cardRef.current, {
            y: -3,
            boxShadow: '0 8px 24px rgba(59,130,246,0.15)',
            duration: 0.2,
            ease: 'power2.out',
        });
    };

    const handleHoverLeave = () => {
        if (!cardRef.current) return;
        gsap.to(cardRef.current, {
            y: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            duration: 0.2,
            ease: 'power2.out',
        });
    };

    return (
        <motion.div variants={cardVariants} ref={cardRef}>
            <Card
                className={cn(
                    'border border-gray-100 cursor-pointer transition-colors duration-200 overflow-hidden',
                    hasChildren
                        ? 'hover:border-blue-300 hover:bg-blue-50/40'
                        : 'hover:border-emerald-300 hover:bg-emerald-50/40'
                )}
                onMouseEnter={handleHoverEnter}
                onMouseLeave={handleHoverLeave}
                onClick={() => hasChildren && onSelect(node)}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: icon + name */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                                    hasChildren
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-emerald-100 text-emerald-600'
                                )}
                            >
                                {getDepthIcon(depth, hasChildren)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
                                    {node.name}
                                </p>
                                {hasChildren && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {node.children.length} sub-categor{node.children.length === 1 ? 'y' : 'ies'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right: action */}
                        {hasChildren ? (
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                            <Button
                                type="button"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEnroll(node);
                                }}
                                className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 h-auto rounded-lg"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                Enroll In This Program
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ─── Main ProgramSelector ──────────────────────────────────────────────────────

export function ProgramSelector({ setValue, trigger, error }: ProgramSelectorProps) {
    const { isLoading, isError, refetch, isFetching } = useProgramCategories();

    const categoryTree = useProgramStore((s) => s.categoryTree);
    const navigationStack = useProgramStore((s) => s.navigationStack);
    const selectedProgram = useProgramStore((s) => s.selectedProgram);
    const drillInto = useProgramStore((s) => s.drillInto);
    const goBack = useProgramStore((s) => s.goBack);
    const selectProgram = useProgramStore((s) => s.selectProgram);
    const clearSelection = useProgramStore((s) => s.clearSelection);
    const resetNavigation = useProgramStore((s) => s.resetNavigation);

    // Current level nodes to display
    const currentNodes: CategoryNode[] =
        navigationStack.length === 0
            ? categoryTree
            : navigationStack[navigationStack.length - 1].children;

    const currentDepth = navigationStack.length;

    // Sync selection into RHF
    useEffect(() => {
        if (selectedProgram) {
            setValue('program_id', selectedProgram.id, { shouldValidate: true });
            trigger('program_id');
            setValue('program_name', selectedProgram.name, { shouldValidate: true });
            trigger('program_name');
        } else {
            // Reset to empty; cast needed because zod schema accepts number
            setValue('program_id', undefined as unknown as number, { shouldValidate: true });
            setValue('program_name', undefined as unknown as string, { shouldValidate: true });
        }
    }, [selectedProgram, setValue, trigger]);

    const handleJumpTo = (index: number) => {
        // -1 = jump to root
        if (index === -1) {
            resetNavigation();
        } else {
            // Trim stack to index (keep items 0..index inclusive)
            const newStack = navigationStack.slice(0, index + 1);
            useProgramStore.setState({ navigationStack: newStack, selectedProgram: null });
            setValue('program_id', undefined as unknown as number, { shouldValidate: true });
            setValue('program_name', undefined as unknown as string, { shouldValidate: true });
        }
    };

    const handleEnroll = (node: CategoryNode) => {
        selectProgram(node);
    };

    const handleChangeProgram = () => {
        clearSelection();
        resetNavigation();
    };

    // ── Loading state ──
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-500">Loading programs&hellip;</p>
            </div>
        );
    }

    // ── Error state ──
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-800">Failed to load programs</p>
                    <p className="text-xs text-gray-500 mt-1">Check your connection and try again.</p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2"
                >
                    <RefreshCcw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ── Header ── */}
            <Card className="border border-gray-200 bg-gradient-to-br from-blue-50/60 to-white">
                <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {currentDepth > 0 && (
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                            <CardTitle className="text-sm font-semibold text-gray-700">
                                {currentDepth === 0
                                    ? 'Select a Program Category'
                                    : navigationStack[currentDepth - 1].name}
                            </CardTitle>
                        </div>

                        <Badge variant="secondary" className="text-xs">
                            {currentNodes.length} option{currentNodes.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    {/* Breadcrumb */}
                    <Breadcrumb stack={navigationStack} onJumpTo={handleJumpTo} />
                </CardHeader>
            </Card>

            {/* ── Category Grid ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={navigationStack.map((n) => n.id).join('-') || 'root'}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="grid grid-cols-1 gap-2.5"
                >
                    {currentNodes.map((node) => (
                        <CategoryCard
                            key={node.id}
                            node={node}
                            depth={currentDepth}
                            onSelect={drillInto}
                            onEnroll={handleEnroll}
                        />
                    ))}

                    {currentNodes.length === 0 && (
                        <motion.div variants={cardVariants} className="text-center py-10">
                            <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No items in this category.</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── RHF validation error ── */}
            {error && !selectedProgram && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1.5"
                >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                </motion.p>
            )}

            {/* ── Selected Program Banner ── */}
            <AnimatePresence>
                {selectedProgram && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -8 }}
                        transition={{ duration: 0.35, ease: "easeOut" as Easing }}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-0.5">
                                Selected Program
                            </p>
                            <p className="text-sm font-bold text-emerald-800 leading-snug">
                                {selectedProgram.name}
                            </p>
                            <p className="text-xs text-emerald-500 mt-0.5">
                                Program ID: #{selectedProgram.id}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleChangeProgram}
                            className="text-xs text-emerald-600 hover:text-emerald-800 underline underline-offset-2 flex-shrink-0 transition-colors"
                        >
                            Change
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
