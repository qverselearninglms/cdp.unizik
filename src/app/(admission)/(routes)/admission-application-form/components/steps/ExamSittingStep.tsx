'use client';

import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { FormInput, FormSelect } from '../FormFields';
import { EXAM_TYPES } from '../../schema/admission-schema';
import type { FormDefaultValues } from '../../types/form-types';
import { Info } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
};

function generateYearOptions(startYear: number, endYear: number) {
    const years: Array<{ value: string; label: string }> = [];
    for (let y = endYear; y >= startYear; y--) {
        years.push({ value: String(y), label: String(y) });
    }
    return years;
}

export default function ExamSittingStep() {
    const { watch } = useFormContext<FormDefaultValues>();
    const awaitingResult = watch('awaiting_result');
    const combinedResult = watch('combined_result');
    const isCombined = combinedResult === 'combined_result';

    const examTypeOptions = EXAM_TYPES.map(t => ({ value: t, label: t }));
    const currentYear = new Date().getFullYear();
    const yearOptions = generateYearOptions(1990, currentYear);

    if (awaitingResult) {
        return (
            <motion.div className="space-y-6" {...fadeInUp}>
                <div>
                    <h3 className="text-lg font-semibold">Exam Sitting Details</h3>
                    <p className="text-sm text-muted-foreground">
                        O-Level examination sitting information.
                    </p>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                    <Info className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        Since you are awaiting your results, you can skip this step and provide the
                        details once your results are available.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div className="space-y-6" {...fadeInUp}>
            <div>
                <h3 className="text-lg font-semibold">Exam Sitting Details</h3>
                <p className="text-sm text-muted-foreground">
                    Provide your O-Level examination sitting information.
                    {isCombined && ' Both first and second sitting details are required for combined results.'}
                </p>
            </div>

            {/* First Sitting */}
            <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">First Sitting</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                    <FormSelect
                        name="first_sitting_type"
                        label="Exam Type"
                        required
                        options={examTypeOptions}
                        placeholder="Select exam..."
                    />
                    <FormSelect
                        name="first_sitting_year"
                        label="Year"
                        required
                        options={yearOptions}
                        placeholder="Select year..."
                    />
                    <FormInput
                        name="first_sitting_exam_number"
                        label="Exam Number"
                        required
                        placeholder="e.g., 1234567890"
                    />
                </div>
            </div>

            {/* Second Sitting (for combined results) */}
            {isCombined && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4"
                >
                    <h4 className="font-medium">Second Sitting</h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <FormSelect
                            name="second_sitting_type"
                            label="Exam Type"
                            required
                            options={examTypeOptions}
                            placeholder="Select exam..."
                        />
                        <FormSelect
                            name="second_sitting_year"
                            label="Year"
                            required
                            options={yearOptions}
                            placeholder="Select year..."
                        />
                        <FormInput
                            name="second_sitting_exam_number"
                            label="Exam Number"
                            required
                            placeholder="e.g., 1234567890"
                        />
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
