'use client';

import { motion } from 'framer-motion';
import { FormInput, FormSelect, FormSwitch } from '../FormFields';
import { RELATIONSHIPS } from '../../schema/admission-schema';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' as const },
};

export default function NextOfKinStep() {
    const relationshipOptions = RELATIONSHIPS.map(r => ({ value: r, label: r }));

    return (
        <motion.div className="space-y-6" {...fadeInUp}>
            <div>
                <h3 className="text-lg font-semibold">Next of Kin</h3>
                <p className="text-sm text-muted-foreground">
                    Provide emergency contact details. This person will be contacted in case of emergencies.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormInput name="next_of_kin_name" label="Full Name" required placeholder="e.g., Jane Doe" />
                <FormSelect name="next_of_kin_relationship" label="Relationship" required options={relationshipOptions} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormInput name="next_of_kin_phone_number" label="Phone Number" required placeholder="+234..." />
                <FormInput name="next_of_kin_email" label="Email Address" type="email" placeholder="email@example.com" />
            </div>

            <FormInput name="next_of_kin_address" label="Address" required placeholder="Full contact address" />

            <FormSwitch
                name="is_next_of_kin_primary_contact"
                label="Primary contact?"
                description="Mark this person as your primary emergency contact"
            />

            <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">Additional Details (Optional)</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput name="next_of_kin_alternate_phone_number" label="Alternate Phone" placeholder="+234..." />
                    <FormInput name="next_of_kin_occupation" label="Occupation" placeholder="e.g., Teacher" />
                </div>
                <div className="mt-4">
                    <FormInput name="next_of_kin_workplace" label="Workplace" placeholder="e.g., ABC Company Ltd" />
                </div>
            </div>
        </motion.div>
    );
}
