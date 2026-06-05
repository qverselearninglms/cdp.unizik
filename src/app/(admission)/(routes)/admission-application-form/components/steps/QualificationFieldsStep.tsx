'use client';

import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { FormSelect, FormSwitch } from '../FormFields';
import { Info } from 'lucide-react';
import type { FormDefaultValues } from '../../types/form-types';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
};

export default function QualificationFieldsStep() {
    const { watch } = useFormContext<FormDefaultValues>();
    const awaitingResult = watch('awaiting_result');

    const resultTypeOptions = [
        { value: 'single_result', label: 'Single Sitting Result' },
        { value: 'combined_result', label: 'Combined Sitting Result' },
    ];

    return (
        <motion.div className="space-y-6" {...fadeInUp}>
            <div>
                <h3 className="text-lg font-semibold">Qualification Information</h3>
                <p className="text-sm text-muted-foreground">
                    Provide information about your academic qualifications and exam results.
                </p>
            </div>

            <FormSwitch
                name="awaiting_result"
                label="Are you awaiting your result?"
                description="Toggle this if you haven't received your exam results yet"
            />

            {awaitingResult && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"
                >
                    <Info className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        You can proceed with your application. You will be required to submit your
                        results once they are available. Your admission may be provisional until results
                        are verified.
                    </p>
                </motion.div>
            )}

            {!awaitingResult && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FormSelect
                        name="combined_result"
                        label="Result Type"
                        required
                        options={resultTypeOptions}
                        placeholder="Select result type..."
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
