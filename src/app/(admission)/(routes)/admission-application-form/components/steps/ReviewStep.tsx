'use client';

import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    User, Heart, Users, FileText, GraduationCap, BookOpen, FolderOpen, Settings,
    CheckCircle, AlertCircle, Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormStep, FORM_STEPS } from '../../types/form-types';
import type { FormDefaultValues } from '../../types/form-types';

interface ReviewStepProps {
    completedSteps: Set<FormStep>;
    onEditStep: (step: FormStep) => void;
}

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.08 } },
};

const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' as const },
};

function ReviewField({ label, value }: { label: string; value: string | boolean | undefined }) {
    if (value === undefined || value === '') return null;

    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

    return (
        <div className="flex justify-between border-b border-dashed py-2 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium">{displayValue}</span>
        </div>
    );
}

function FileReviewField({ label, file }: { label: string; file: File | undefined }) {
    if (!file) return null;

    return (
        <div className="flex items-center justify-between border-b border-dashed py-2 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <FileText className="size-3.5 text-primary" />
                <span className="max-w-50 truncate text-sm font-medium">{file.name}</span>
            </div>
        </div>
    );
}

interface ReviewSectionProps {
    step: FormStep;
    title: string;
    icon: React.ElementType;
    isCompleted: boolean;
    onEdit: () => void;
    children: React.ReactNode;
}

function ReviewSection({ title, icon: Icon, isCompleted, onEdit, children }: ReviewSectionProps) {
    return (
        <motion.div {...fadeInUp}>
            <Card className="overflow-hidden">
                <CardHeader className="flex-row items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                        <Icon className="size-4 text-primary" />
                        <CardTitle className="text-base">{title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={isCompleted ? 'default' : 'secondary'} className="text-xs">
                            {isCompleted ? (
                                <><CheckCircle className="mr-1 size-3" /> Complete</>
                            ) : (
                                <><AlertCircle className="mr-1 size-3" /> Incomplete</>
                            )}
                        </Badge>
                        <button
                            type="button"
                            onClick={onEdit}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Edit className="size-4" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="pt-3">{children}</CardContent>
            </Card>
        </motion.div>
    );
}

export default function ReviewStep({ completedSteps, onEditStep }: ReviewStepProps) {
    const { watch, setValue, formState: { errors } } = useFormContext<FormDefaultValues>();
    const values = watch();
    const agreeToTerms = watch('agreeToTerms');

    return (
        <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
            <div>
                <h3 className="text-lg font-semibold">Review & Submit</h3>
                <p className="text-sm text-muted-foreground">
                    Please review all information carefully before submitting your application.
                    Click the edit icon to make changes to any section.
                </p>
            </div>

            {/* Personal Information */}
            <ReviewSection
                step={FormStep.PERSONAL_INFO}
                title="Personal Information"
                icon={User}
                isCompleted={completedSteps.has(FormStep.PERSONAL_INFO)}
                onEdit={() => onEditStep(FormStep.PERSONAL_INFO)}
            >
                <ReviewField label="Local Gov. Area" value={values.lga} />
                <ReviewField label="Religion" value={values.religion} />
                <ReviewField label="Date of Birth" value={values.dob} />
                <ReviewField label="Gender" value={values.gender} />
                <ReviewField label="Hometown" value={values.hometown} />
                <ReviewField label="Hometown Address" value={values.hometown_address} />
                <ReviewField label="Contact Address" value={values.contact_address} />
                <ReviewField label="Has Disability" value={values.has_disability} />
                {values.has_disability && <ReviewField label="Disability" value={values.disability} />}
            </ReviewSection>

            {/* Sponsor Information */}
            <ReviewSection
                step={FormStep.SPONSOR_INFO}
                title="Sponsor Information"
                icon={Heart}
                isCompleted={completedSteps.has(FormStep.SPONSOR_INFO)}
                onEdit={() => onEditStep(FormStep.SPONSOR_INFO)}
            >
                <ReviewField label="Has Sponsor" value={values.has_sponsor} />
                {values.has_sponsor && (
                    <>
                        <ReviewField label="Sponsor Name" value={values.sponsor_name} />
                        <ReviewField label="Relationship" value={values.sponsor_relationship} />
                        <ReviewField label="Email" value={values.sponsor_email} />
                        <ReviewField label="Phone" value={values.sponsor_phone_number} />
                        <ReviewField label="Address" value={values.sponsor_contact_address} />
                    </>
                )}
            </ReviewSection>

            {/* Next of Kin */}
            <ReviewSection
                step={FormStep.NEXT_OF_KIN}
                title="Next of Kin"
                icon={Users}
                isCompleted={completedSteps.has(FormStep.NEXT_OF_KIN)}
                onEdit={() => onEditStep(FormStep.NEXT_OF_KIN)}
            >
                <ReviewField label="Full Name" value={values.next_of_kin_name} />
                <ReviewField label="Relationship" value={values.next_of_kin_relationship} />
                <ReviewField label="Phone" value={values.next_of_kin_phone_number} />
                <ReviewField label="Address" value={values.next_of_kin_address} />
                <ReviewField label="Email" value={values.next_of_kin_email} />
                <ReviewField label="Primary Contact" value={values.is_next_of_kin_primary_contact} />
                <ReviewField label="Occupation" value={values.next_of_kin_occupation} />
                <ReviewField label="Workplace" value={values.next_of_kin_workplace} />
            </ReviewSection>

            {/* Documents */}
            <ReviewSection
                step={FormStep.DOCUMENTS}
                title="Documents"
                icon={FileText}
                isCompleted={completedSteps.has(FormStep.DOCUMENTS)}
                onEdit={() => onEditStep(FormStep.DOCUMENTS)}
            >
                <FileReviewField label="Passport" file={values.passport} />
                <FileReviewField label="First School Leaving" file={values.first_school_leaving} />
                <FileReviewField label="O-Level Certificate" file={values.o_level} />
                {values.other_documents?.map((file, idx) => (
                    <FileReviewField key={idx} label={`Other Document ${idx + 1}`} file={file} />
                ))}
            </ReviewSection>

            {/* Qualification Information */}
            <ReviewSection
                step={FormStep.QUALIFICATION_FIELDS}
                title="Qualification Information"
                icon={GraduationCap}
                isCompleted={completedSteps.has(FormStep.QUALIFICATION_FIELDS)}
                onEdit={() => onEditStep(FormStep.QUALIFICATION_FIELDS)}
            >
                <ReviewField label="Awaiting Result" value={values.awaiting_result} />
                {!values.awaiting_result && (
                    <ReviewField
                        label="Result Type"
                        value={values.combined_result === 'combined_result' ? 'Combined Result' : 'Single Result'}
                    />
                )}
            </ReviewSection>

            {/* Exam Sitting */}
            <ReviewSection
                step={FormStep.EXAM_SITTING}
                title="Exam Sitting Details"
                icon={BookOpen}
                isCompleted={completedSteps.has(FormStep.EXAM_SITTING)}
                onEdit={() => onEditStep(FormStep.EXAM_SITTING)}
            >
                {values.awaiting_result ? (
                    <p className="text-sm italic text-muted-foreground">Skipped — awaiting results</p>
                ) : (
                    <>
                        <ReviewField label="First Sitting Type" value={values.first_sitting_type} />
                        <ReviewField label="First Sitting Year" value={values.first_sitting_year} />
                        <ReviewField label="First Sitting Exam No." value={values.first_sitting_exam_number} />
                        {values.combined_result === 'combined_result' && (
                            <>
                                <ReviewField label="Second Sitting Type" value={values.second_sitting_type} />
                                <ReviewField label="Second Sitting Year" value={values.second_sitting_year} />
                                <ReviewField label="Second Sitting Exam No." value={values.second_sitting_exam_number} />
                            </>
                        )}
                    </>
                )}
            </ReviewSection>

            {/* Exam Documents */}
            <ReviewSection
                step={FormStep.QUALIFICATION_DOCUMENTS}
                title="Exam Result Documents"
                icon={FolderOpen}
                isCompleted={completedSteps.has(FormStep.QUALIFICATION_DOCUMENTS)}
                onEdit={() => onEditStep(FormStep.QUALIFICATION_DOCUMENTS)}
            >
                {values.awaiting_result ? (
                    <p className="text-sm italic text-muted-foreground">Skipped — awaiting results</p>
                ) : (
                    <>
                        <FileReviewField label="First Sitting Result" file={values.first_sitting_result} />
                        {values.combined_result === 'combined_result' && (
                            <FileReviewField label="Second Sitting Result" file={values.second_sitting_result} />
                        )}
                    </>
                )}
            </ReviewSection>

            {/* Program Selection */}
            <ReviewSection
                step={FormStep.PROGRAM_SELECTION}
                title="Program Selection"
                icon={Settings}
                isCompleted={completedSteps.has(FormStep.PROGRAM_SELECTION)}
                onEdit={() => onEditStep(FormStep.PROGRAM_SELECTION)}
            >
                <ReviewField label="Start Term" value={values.startTerm} />
                <ReviewField label="Study Mode" value={values.studyMode === 'online' ? 'Online Learning' : 'On-Campus'} />
            </ReviewSection>

            {/* Terms & Conditions */}
            <motion.div {...fadeInUp}>
                <Card className={cn(
                    'border-2',
                    agreeToTerms ? 'border-primary/30 bg-primary/5' : 'border-border',
                    errors.agreeToTerms && 'border-destructive'
                )}>
                    <CardContent className="flex items-start gap-4 pt-6">
                        <Switch
                            id="agreeToTerms"
                            checked={agreeToTerms ?? false}
                            onCheckedChange={(checked) =>
                                setValue('agreeToTerms', checked as boolean, { shouldValidate: true, shouldDirty: true })
                            }
                        />
                        <div className="space-y-1">
                            <Label htmlFor="agreeToTerms" className="cursor-pointer text-sm font-medium">
                                I agree to the Terms and Conditions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                By checking this box, I confirm that all information provided is accurate and
                                complete. I understand that providing false information may result in the
                                cancellation of my admission.
                            </p>
                        </div>
                    </CardContent>
                </Card>
                {errors.agreeToTerms?.message && (
                    <p className="mt-2 text-sm text-destructive">{errors.agreeToTerms.message as string}</p>
                )}
            </motion.div>
        </motion.div>
    );
}
