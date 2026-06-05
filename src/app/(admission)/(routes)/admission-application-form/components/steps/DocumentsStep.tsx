'use client';

import { motion } from 'framer-motion';
import { FormFileUpload } from '../FormFields';
import { Shield } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
};

export default function DocumentsStep() {
    return (
        <motion.div className="space-y-6" {...fadeInUp}>
            <div>
                <h3 className="text-lg font-semibold">Upload Documents</h3>
                <p className="text-sm text-muted-foreground">
                    Upload the required documents for your application. Accepted formats: Images, PDF, DOC/DOCX (Max 5MB each).
                </p>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <Shield className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                    Ensure all documents are clear and legible. Blurry or unclear
                    documents may cause delays in processing your application.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <FormFileUpload
                    name="passport"
                    label="Passport Photograph"
                    accept="image/jpeg,image/png,image/webp"
                />
                <FormFileUpload
                    name="first_school_leaving"
                    label="First School Leaving Certificate"
                />
            </div>

            <FormFileUpload
                name="o_level"
                label="O-Level Certificate"
            />

            <FormFileUpload
                name="other_documents"
                label="Other Supporting Documents"
                multiple
            />
        </motion.div>
    );
}
