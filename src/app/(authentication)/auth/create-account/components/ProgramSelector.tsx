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
import { saveSelectedProgramPaymentInfo, toAmount } from '@/lib/program-payment-context';

interface ProgramSelectorProps {
    setValue: UseFormSetValue<SignUpFormData>;
    trigger: UseFormTrigger<SignUpFormData>;
    error?: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' as Easing, staggerChildren: 0.06 },
    },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: 'easeIn' as Easing } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.35, ease: 'easeOut' as Easing },
    },
};

function getDepthIcon(depth: number, hasChildren: boolean): React.ReactNode {
    if (!hasChildren) return <GraduationCap className="h-5 w-5" />;
    if (depth === 0) return <BookOpen className="h-5 w-5" />;
    return <Folder className="h-5 w-5" />;
}

function formatFeeLabel(value: string | undefined, fallback: string): string {
    if (!value) return fallback;
    if (value.includes('₦')) return value;

    const numeric = toAmount(value);
    if (numeric === null) return value;

    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
    }).format(numeric);
}

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
            className="mb-4 flex flex-wrap items-center gap-1 px-1 text-xs text-slate-500 dark:text-slate-400"
        >
            <button
                type="button"
                onClick={() => onJumpTo(-1)}
                className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-300"
            >
                Programs
            </button>
            {stack.map((node, i) => (
                <React.Fragment key={node.id}>
                    <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                    <button
                        type="button"
                        onClick={() => onJumpTo(i)}
                        className={cn(
                            'max-w-[140px] truncate font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-300',
                            i === stack.length - 1 && 'font-semibold text-blue-600 dark:text-blue-300'
                        )}
                    >
                        {node.name}
                    </button>
                </React.Fragment>
            ))}
        </motion.div>
    );
}

interface CategoryCardProps {
    node: CategoryNode;
    depth: number;
    selectedProgramId: number | null;
    onSelect: (node: CategoryNode) => void;
    onEnroll: (node: CategoryNode) => void;
}

function CategoryCard({ node, depth, selectedProgramId, onSelect, onEnroll }: CategoryCardProps) {
    const hasChildren = node.children.length > 0;
    const isSelected = !hasChildren && node.id === selectedProgramId;
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
                    'cursor-pointer overflow-hidden border bg-white transition-all duration-200 dark:bg-slate-900/60',
                    hasChildren
                        ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-slate-700 dark:hover:border-emerald-400 dark:hover:bg-emerald-900/20',
                    isSelected && 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900'
                )}
                onMouseEnter={handleHoverEnter}
                onMouseLeave={handleHoverLeave}
                onClick={() => hasChildren && onSelect(node)}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                                    hasChildren
                                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                                        : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                                )}
                            >
                                {getDepthIcon(depth, hasChildren)}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">
                                    {node.name}
                                </p>
                                {hasChildren ? (
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {node.children.length} sub-categor{node.children.length === 1 ? 'y' : 'ies'}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                        Program ID: #{node.id}
                                    </p>
                                )}
                            </div>
                        </div>

                        {hasChildren ? (
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                        ) : (
                            <Button
                                type="button"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEnroll(node);
                                }}
                                className={cn(
                                    'h-auto flex-shrink-0 rounded-lg px-3 py-1.5 text-xs text-white',
                                    isSelected ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700'
                                )}
                            >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                {isSelected ? 'Selected' : 'Select Program'}
                            </Button>
                        )}
                    </div>

                    {!hasChildren && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Access Fee</p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-100">
                                    {formatFeeLabel(node.access_fee, 'TBA')}
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Tuition</p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-100">
                                    {formatFeeLabel(node.tuition, 'TBA')}
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Duration</p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-100">
                                    {node.duration ?? 'TBA'}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

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

    const currentNodes: CategoryNode[] =
        navigationStack.length === 0
            ? categoryTree
            : navigationStack[navigationStack.length - 1].children;

    const currentDepth = navigationStack.length;

    useEffect(() => {
        if (selectedProgram) {
            setValue('program_id', selectedProgram.id, { shouldValidate: true });
            trigger('program_id');
            setValue('program', selectedProgram.name, { shouldValidate: true });
            trigger('program');
        } else {
            setValue('program_id', undefined as unknown as number, { shouldValidate: true });
            setValue('program', undefined as unknown as string, { shouldValidate: true });
        }
    }, [selectedProgram, setValue, trigger]);

    const handleJumpTo = (index: number) => {
        if (index === -1) {
            resetNavigation();
        } else {
            const newStack = navigationStack.slice(0, index + 1);
            useProgramStore.setState({ navigationStack: newStack, selectedProgram: null });
            setValue('program_id', undefined as unknown as number, { shouldValidate: true });
            setValue('program', undefined as unknown as string, { shouldValidate: true });
        }
    };

    const handleEnroll = (node: CategoryNode) => {
        saveSelectedProgramPaymentInfo({
            programId: node.id,
            programName: node.name,
            accessFeeAmount: toAmount(node.access_fee),
            tuitionAmount: toAmount(node.tuition),
            accessFeeLabel: node.access_fee ?? null,
            tuitionLabel: node.tuition ?? null,
            duration: node.duration ?? null,
            updatedAt: new Date().toISOString(),
        });
        selectProgram(node);
    };

    const handleChangeProgram = () => {
        clearSelection();
        resetNavigation();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-slate-500 dark:text-slate-300">Loading programs...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Failed to load programs</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Check your connection and try again.</p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2"
                >
                    <RefreshCcw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="border border-slate-200 bg-gradient-to-br from-blue-50/60 to-white dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
                <CardHeader className="px-4 pb-3 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {currentDepth > 0 && (
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                >
                                    <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            )}
                            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                                {currentDepth === 0
                                    ? 'Select a Program Category'
                                    : navigationStack[currentDepth - 1].name}
                            </CardTitle>
                        </div>

                        <Badge variant="secondary" className="text-xs">
                            {currentNodes.length} option{currentNodes.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    <Breadcrumb stack={navigationStack} onJumpTo={handleJumpTo} />
                </CardHeader>
            </Card>

            <AnimatePresence>
                {selectedProgram ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                    Selected Program
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                                    {selectedProgram.name}
                                </p>
                                <p className="mt-1 text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
                                    Program ID: #{selectedProgram.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleChangeProgram}
                                className="text-xs text-emerald-700 underline underline-offset-2 transition-colors hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
                            >
                                Change selection
                            </button>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            <span className="rounded-lg bg-emerald-100 px-2.5 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100">
                                Access: {formatFeeLabel(selectedProgram.access_fee, 'TBA')}
                            </span>
                            <span className="rounded-lg bg-emerald-100 px-2.5 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100">
                                Tuition: {formatFeeLabel(selectedProgram.tuition, 'TBA')}
                            </span>
                            <span className="rounded-lg bg-emerald-100 px-2.5 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-100">
                                Duration: {selectedProgram.duration ?? 'TBA'}
                            </span>
                        </div>

                        <p className="mt-2 text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
                            Payment order: access fee first, then tuition.
                        </p>
                    </motion.div>
                ) : (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-slate-600 dark:text-slate-300"
                    >
                        Tip: each course card shows access fee, tuition, and duration. Click Select Program to confirm your choice.
                    </motion.p>
                )}
            </AnimatePresence>

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
                            selectedProgramId={selectedProgram?.id ?? null}
                            onSelect={drillInto}
                            onEnroll={handleEnroll}
                        />
                    ))}

                    {currentNodes.length === 0 && (
                        <motion.div variants={cardVariants} className="py-10 text-center">
                            <FolderOpen className="mx-auto mb-2 h-10 w-10 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">No items in this category.</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {error && !selectedProgram && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-sm text-red-600"
                >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                </motion.p>
            )}
        </div>
    );
}
