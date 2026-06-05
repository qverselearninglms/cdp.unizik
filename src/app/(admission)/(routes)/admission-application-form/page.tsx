'use client';

import { FormProvider } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdmissionForm } from './hooks/useAdmissionForm';
import FormStepIndicator from './components/FormStepIndicator';
import FormNavigation from './components/FormNavigation';
import SuccessModal from './components/SuccessModal';
import {
    PersonalInfoStep,
    SponsorInfoStep,
    NextOfKinStep,
    DocumentsStep,
    QualificationFieldsStep,
    ExamSittingStep,
    QualificationDocumentsStep,
    ProgramSelectionStep,
    ReviewStep,
} from './components/steps';
import { FormStep, TOTAL_STEPS } from './types/form-types';

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
    }),
};

function FormLoadingSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-center gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="size-10 rounded-full" />
                ))}
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
                <Skeleton className="h-10" />
                <Skeleton className="h-24" />
            </div>
        </div>
    );
}

function StepRenderer({
    step,
    completedSteps,
    onEditStep,
}: {
    step: FormStep;
    completedSteps: Set<FormStep>;
    onEditStep: (step: FormStep) => void;
}) {
    switch (step) {
        case FormStep.PERSONAL_INFO:
            return <PersonalInfoStep />;
        case FormStep.SPONSOR_INFO:
            return <SponsorInfoStep />;
        case FormStep.NEXT_OF_KIN:
            return <NextOfKinStep />;
        case FormStep.DOCUMENTS:
            return <DocumentsStep />;
        case FormStep.QUALIFICATION_FIELDS:
            return <QualificationFieldsStep />;
        case FormStep.EXAM_SITTING:
            return <ExamSittingStep />;
        case FormStep.QUALIFICATION_DOCUMENTS:
            return <QualificationDocumentsStep />;
        case FormStep.PROGRAM_SELECTION:
            return <ProgramSelectionStep />;
        case FormStep.REVIEW:
            return <ReviewStep completedSteps={completedSteps} onEditStep={onEditStep} />;
        default:
            return null;
    }
}

export default function AdmissionApplicationFormPage() {
    const {
        form,
        currentStep,
        completedSteps,
        isLoading,
        isSubmitting,
        isSubmitted,
        goToStep,
        nextStep,
        prevStep,
        submitForm,
        saveProgress,
        direction,
    } = useAdmissionForm();

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                <Card>
                    <FormLoadingSkeleton />
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <motion.div
                className="mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Admission Application Form
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Complete all steps below to submit your application.
                    Your progress is automatically saved.
                </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
                className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </motion.div>
            <p className="mb-6 text-right text-xs text-muted-foreground">
                Step {currentStep + 1} of {TOTAL_STEPS}
            </p>

            {/* Step Indicator */}
            <FormStepIndicator
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={goToStep}
            />

            {/* Form Content */}
            <FormProvider {...form}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Card className="mt-6">
                        <CardContent className="min-h-100 overflow-hidden p-6 sm:p-8">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    <StepRenderer
                                        step={currentStep}
                                        completedSteps={completedSteps}
                                        onEditStep={goToStep}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </CardContent>

                        {/* Navigation */}
                        <div className="px-6 pb-6 sm:px-8">
                            <FormNavigation
                                currentStep={currentStep}
                                isSubmitting={isSubmitting}
                                onNext={nextStep}
                                onPrev={prevStep}
                                onSubmit={submitForm}
                                onSave={saveProgress}
                            />
                        </div>
                    </Card>
                </form>
            </FormProvider>

            {/* Success Modal */}
            <SuccessModal isOpen={isSubmitted} />
        </div>
    );
}