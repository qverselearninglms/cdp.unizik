'use client';

import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { FormFileUpload } from '../FormFields';
import type { FormDefaultValues } from '../../types/form-types';
import { Info } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
};

export default function QualificationDocumentsStep() {
    const { watch } = useFormContext<FormDefaultValues>();
    const awaitingResult = watch('awaiting_result');
    const combinedResult = watch('combined_result');
    const isCombined = combinedResult === 'combined_result';

    if (awaitingResult) {
        return (
            <motion.div className="space-y-6" {...fadeInUp}>
                <div>
                    <h3 className="text-lg font-semibold">Exam Result Documents</h3>
                    <p className="text-sm text-muted-foreground">
                        Upload your exam sitting result documents.
                    </p>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                    <Info className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        Since you are awaiting your results, you can skip document uploads for now.
                        You will be required to upload them once your results are available.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div className="space-y-6" {...fadeInUp}>
            <div>
                <h3 className="text-lg font-semibold">Exam Result Documents</h3>
                <p className="text-sm text-muted-foreground">
                    Upload your O-Level exam result documents. Ensure documents are clear and legible.
                </p>
            </div>

            <FormFileUpload
                name="first_sitting_result"
                label="First Sitting Result"
                required
            />

            {isCombined && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FormFileUpload
                        name="second_sitting_result"
                        label="Second Sitting Result"
                        required
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
