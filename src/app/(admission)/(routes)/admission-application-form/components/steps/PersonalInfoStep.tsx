'use client';

import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { FormInput, FormSelect, FormSwitch, FormTextarea } from '../FormFields';
import { RELIGIONS } from '../../schema/admission-schema';
import type { FormDefaultValues } from '../../types/form-types';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
};

export default function PersonalInfoStep() {
    const { watch } = useFormContext<FormDefaultValues>();
    const hasDisability = watch('has_disability');

    const religionOptions = RELIGIONS.map(r => ({ value: r, label: r }));
    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
    ];

    return (
        <motion.div className="space-y-6" {...fadeInUp}>
            <div>
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <p className="text-sm text-muted-foreground">
                    Provide your basic personal details. All fields marked with * are required.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormInput name="lga" label="Local Government Area" required placeholder="e.g., Ikeja" />
                <FormSelect name="religion" label="Religion" required options={religionOptions} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormInput name="dob" label="Date of Birth" type="date" required />
                <FormSelect name="gender" label="Gender" required options={genderOptions} />
            </div>

            <FormInput name="hometown" label="Hometown" required placeholder="e.g., Lagos" />

            <div className="grid gap-4 sm:grid-cols-2">
                <FormTextarea name="hometown_address" label="Hometown Address" required placeholder="Full hometown address" />
                <FormTextarea name="contact_address" label="Contact Address" required placeholder="Current contact address" />
            </div>

            <FormSwitch
                name="has_disability"
                label="Do you have a disability?"
                description="Let us know if you require any special accommodation"
            />

            {hasDisability && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FormTextarea
                        name="disability"
                        label="Please describe your disability"
                        required
                        placeholder="Describe your disability and any accommodations needed"
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
