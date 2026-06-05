'use client';

import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { FormInput, FormSelect, FormSwitch } from '../FormFields';
import { RELATIONSHIPS } from '../../schema/admission-schema';
import type { FormDefaultValues } from '../../types/form-types';
import { Info } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
};

export default function SponsorInfoStep() {
    const { watch } = useFormContext<FormDefaultValues>();
    const hasSponsor = watch('has_sponsor');

    const relationshipOptions = RELATIONSHIPS.map(r => ({ value: r, label: r }));

    return (
        <motion.div className="space-y-6" {...fadeInUp}>
            <div>
                <h3 className="text-lg font-semibold">Sponsor Information</h3>
                <p className="text-sm text-muted-foreground">
                    If you have a sponsor, provide their details below.
                </p>
            </div>

            <FormSwitch
                name="has_sponsor"
                label="Do you have a sponsor?"
                description="A sponsor is someone who will be responsible for your fees"
            />

            {!hasSponsor && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"
                >
                    <Info className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        You can skip this section if you don&apos;t have a sponsor. You can always update
                        this information later.
                    </p>
                </motion.div>
            )}

            {hasSponsor && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput name="sponsor_name" label="Sponsor's Full Name" required placeholder="e.g., John Doe" />
                        <FormSelect name="sponsor_relationship" label="Relationship" required options={relationshipOptions} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput name="sponsor_email" label="Sponsor's Email" type="email" required placeholder="sponsor@example.com" />
                        <FormInput name="sponsor_phone_number" label="Sponsor's Phone" required placeholder="+234..." />
                    </div>

                    <FormInput name="sponsor_contact_address" label="Sponsor's Contact Address" required placeholder="Full address" />
                </motion.div>
            )}
        </motion.div>
    );
}
