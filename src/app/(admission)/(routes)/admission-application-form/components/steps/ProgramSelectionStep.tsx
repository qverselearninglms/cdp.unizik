'use client';

import { motion } from 'framer-motion';
import { BookOpen, Monitor, Building2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FormDefaultValues } from '../../types/form-types';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
};

const CURRENT_START_TERM = '2026/2027 - 100 level - 1st Semester';

const studyModeCards = [
    {
        value: 'online' as const,
        label: 'Online Learning',
        description: 'Study remotely from anywhere. Access lectures, materials, and assessments online.',
        icon: Monitor,
    },
    {
        value: 'offline' as const,
        label: 'On-Campus',
        description: 'Attend classes in person at the university campus with face-to-face interactions.',
        icon: Building2,
    },
];

export default function ProgramSelectionStep() {
    const { watch, setValue } = useFormContext<FormDefaultValues>();
    const studyMode = watch('studyMode');

    return (
        <motion.div className="space-y-6" {...fadeInUp}>
            <div>
                <h3 className="text-lg font-semibold">Program Selection</h3>
                <p className="text-sm text-muted-foreground">
                    Choose when you want to start and your preferred study mode.
                </p>
            </div>

            <div className="space-y-2">
                <Label>Start Term <span className="text-destructive">*</span></Label>
                <Input
                    value={CURRENT_START_TERM}
                    disabled
                    className="disabled:opacity-70"
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium">
                    Study Mode <span className="text-destructive">*</span>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                    {studyModeCards.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = studyMode === mode.value;
                        const isDisabled = mode.value === 'offline';

                        return (
                            <motion.button
                                key={mode.value}
                                type="button"
                                whileHover={isDisabled ? undefined : { scale: 1.02 }}
                                whileTap={isDisabled ? undefined : { scale: 0.98 }}
                                onClick={() => !isDisabled && setValue('studyMode', mode.value, { shouldDirty: true })}
                                disabled={isDisabled}
                                className={cn(
                                    'relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all',
                                    isDisabled
                                        ? 'cursor-not-allowed border-border opacity-50'
                                        : isSelected
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-border hover:border-primary/30 hover:bg-muted/30'
                                )}
                            >
                                {isDisabled && (
                                    <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
                                        Coming Soon
                                    </Badge>
                                )}
                                <div className={cn(
                                    'rounded-lg p-2.5',
                                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                )}>
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">{mode.label}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{mode.description}</p>
                                </div>
                                {isSelected && (
                                    <motion.div
                                        layoutId="study-mode-check"
                                        className="ml-auto rounded-full bg-primary p-0.5"
                                    >
                                        <BookOpen className="size-3.5 text-primary-foreground" />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
