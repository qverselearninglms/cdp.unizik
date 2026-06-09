// hooks/use-signup-steps.ts
import { useState } from 'react';
import { FileText, GraduationCap, User } from 'lucide-react';
import {
    academicInfoSchema,
    accountInfoSchema,
    personalInfoSchema,
} from '@/schema/sign-up-schema';
import { UseFormReturn } from 'react-hook-form';

// Step configuration
export const STEPS = [
    {
        id: 'personal',
        title: 'Personal Information',
        description: 'Basic personal details',
        icon: User,
        schema: personalInfoSchema,
    },
    {
        id: 'Academics',
        title: 'Academic Information',
        description: 'Select your program of study',
        icon: GraduationCap,
        schema: academicInfoSchema,
    },
    {
        id: 'Account',
        title: 'Account Information',
        description: 'Username, Email and password info',
        icon: FileText,
        schema: accountInfoSchema,
    },
];

export const useSignupSteps = <T extends Record<string, unknown>>(
    form: UseFormReturn<T>
) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [previousStep, setPreviousStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const delta = currentStep - previousStep;

    // Validate the fields belonging to the current step
    const validateStep = async (stepIndex: number): Promise<boolean> => {
        const currentStepSchema = STEPS[stepIndex].schema;
        const currentValues = form.getValues();

        try {
            currentStepSchema.parse(currentValues);
            if (!completedSteps.includes(stepIndex)) {
                setCompletedSteps((prev) => [...prev, stepIndex]);
            }
            return true;
        } catch (error) {
            console.error('Step validation error:', error);
            // Trigger RHF to surface field-level error messages in the UI
            await form.trigger();
            return false;
        }
    };

    const nextStep = async () => {
        if (await validateStep(currentStep)) {
            if (currentStep < STEPS.length - 1) {
                setPreviousStep(currentStep);
                setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
            }
        }
    };

    const prevStep = () => {
        setPreviousStep(currentStep);
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const goToStep = async (stepIndex: number) => {
        if (stepIndex < currentStep || completedSteps.includes(stepIndex)) {
            setCurrentStep(stepIndex);
        } else if (stepIndex === currentStep + 1) {
            await nextStep();
        }
    };

    const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' => {
        if (completedSteps.includes(stepIndex)) return 'completed';
        if (stepIndex === currentStep) return 'current';
        if (stepIndex < currentStep) return 'completed';
        return 'upcoming';
    };

    return {
        delta,
        steps: STEPS,
        setCurrentStep,
        setCompletedSteps,
        currentStep,
        completedSteps,
        nextStep,
        prevStep,
        goToStep,
        getStepStatus,
        validateStep,
    };
};