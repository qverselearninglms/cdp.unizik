'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FORM_STEPS, type FormStep } from '../types/form-types';

interface FormStepIndicatorProps {
    currentStep: FormStep;
    completedSteps: Set<FormStep>;
    onStepClick: (step: FormStep) => void;
}

export default function FormStepIndicator({
    currentStep,
    completedSteps,
    onStepClick,
}: FormStepIndicatorProps) {
    return (
        <div className="w-full overflow-x-auto py-4">
            <div className="flex min-w-max items-center justify-center gap-1 px-4">
                {FORM_STEPS.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isCurrent = currentStep === step.id;
                    const isAccessible = isCompleted || isCurrent || completedSteps.has((step.id - 1) as FormStep);
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex items-center">
                            {/* Step Circle */}
                            <motion.button
                                type="button"
                                onClick={() => isAccessible && onStepClick(step.id)}
                                disabled={!isAccessible}
                                className={cn(
                                    'group relative flex flex-col items-center gap-1.5',
                                    isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                                )}
                                whileHover={isAccessible ? { scale: 1.05 } : undefined}
                                whileTap={isAccessible ? { scale: 0.95 } : undefined}
                            >
                                {/* Circle */}
                                <motion.div
                                    className={cn(
                                        'relative flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                                        isCompleted && 'border-primary bg-primary text-primary-foreground',
                                        isCurrent && !isCompleted && 'border-primary bg-primary/10 text-primary',
                                        !isCurrent && !isCompleted && 'border-muted-foreground/30 text-muted-foreground/50'
                                    )}
                                    animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                                    transition={isCurrent ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
                                >
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            <Check className="size-5" />
                                        </motion.div>
                                    ) : (
                                        <Icon className="size-4" />
                                    )}

                                    {/* Active ring pulse */}
                                    {isCurrent && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-primary"
                                            animate={{ scale: [1, 1.3, 1.3], opacity: [0.6, 0, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                                        />
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span className={cn(
                                    'max-w-20 text-center text-[10px] leading-tight',
                                    isCurrent && 'font-semibold text-primary',
                                    isCompleted && 'font-medium text-primary',
                                    !isCurrent && !isCompleted && 'text-muted-foreground/60'
                                )}>
                                    {step.title}
                                </span>
                            </motion.button>

                            {/* Connector Line */}
                            {index < FORM_STEPS.length - 1 && (
                                <div className="relative mx-1 h-0.5 w-8 bg-muted-foreground/20 sm:w-12">
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-primary"
                                        initial={{ width: '0%' }}
                                        animate={{ width: isCompleted ? '100%' : '0%' }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
