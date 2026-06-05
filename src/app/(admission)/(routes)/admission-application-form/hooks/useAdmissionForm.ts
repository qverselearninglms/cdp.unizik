'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { formStorage } from '@/lib/storage';
import {
    personalInfoSchema,
    sponsorInfoSchema,
    nextOfKinSchema,
    documentsSchema,
    qualificationFieldsSchema,
    examSittingSchema,
    qualificationDocumentsSchema,
    programSelectionSchema,
    odlProgramSchema,
} from '../schema/admission-schema';
import {
    FormStep,
    TOTAL_STEPS,
    FORM_STORAGE_KEY,
    STEP_STORAGE_KEY,
    DEFAULT_FORM_VALUES,
    STEP_FIELDS,
    type FormDefaultValues,
} from '../types/form-types';

// ─── Per-step schema resolver map ────────────────────────────────────────────
const STEP_SCHEMAS = {
    [FormStep.PERSONAL_INFO]: personalInfoSchema,
    [FormStep.SPONSOR_INFO]: sponsorInfoSchema,
    [FormStep.NEXT_OF_KIN]: nextOfKinSchema,
    [FormStep.DOCUMENTS]: documentsSchema,
    [FormStep.QUALIFICATION_FIELDS]: qualificationFieldsSchema,
    [FormStep.EXAM_SITTING]: examSittingSchema,
    [FormStep.QUALIFICATION_DOCUMENTS]: qualificationDocumentsSchema,
    [FormStep.PROGRAM_SELECTION]: programSelectionSchema,
} as const;

export interface UseAdmissionFormReturn {
    form: UseFormReturn<FormDefaultValues>;
    currentStep: FormStep;
    completedSteps: Set<FormStep>;
    isLoading: boolean;
    isSubmitting: boolean;
    isSubmitted: boolean;
    goToStep: (step: FormStep) => void;
    nextStep: () => Promise<boolean>;
    prevStep: () => void;
    submitForm: () => Promise<void>;
    saveProgress: () => Promise<void>;
    resetForm: () => Promise<void>;
    isStepValid: (step: FormStep) => boolean;
    getStepErrors: (step: FormStep) => string[];
    direction: 1 | -1;
}

export function useAdmissionForm(): UseAdmissionFormReturn {
    const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.PERSONAL_INFO);
    const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [direction, setDirection] = useState<1 | -1>(1);
    const hasLoadedRef = useRef(false);
    const skipNextAutoSaveRef = useRef(true);

    const form = useForm<FormDefaultValues>({
        defaultValues: DEFAULT_FORM_VALUES,
        mode: 'onTouched',
    });

    // ─── Load persisted data on mount ────────────────────────────────────────
    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        const loadSavedData = async () => {
            try {
                const savedData = await formStorage.loadFormData(FORM_STORAGE_KEY);
                if (savedData) {
                    const dataWithDefaults = { ...DEFAULT_FORM_VALUES, ...savedData } as FormDefaultValues;
                    form.reset(dataWithDefaults);
                    toast.success('Your previous progress has been restored.');
                }

                const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
                if (savedStep !== null) {
                    const step = Number(savedStep);
                    if (step >= 0 && step < TOTAL_STEPS) {
                        setCurrentStep(step as FormStep);
                    }
                }

                const savedCompleted = localStorage.getItem(`${STEP_STORAGE_KEY}_completed`);
                if (savedCompleted) {
                    const parsed = JSON.parse(savedCompleted) as number[];
                    setCompletedSteps(new Set(parsed as FormStep[]));
                }
            } catch (error) {
                console.error('Failed to load saved form data:', error);
            } finally {
                setIsLoading(false);
                // Skip the auto-save that fires when isLoading transitions to false
                // since we just loaded data — no need to immediately write it back
                skipNextAutoSaveRef.current = true;
            }
        };

        loadSavedData();
    }, [form]);

    // ─── Save progress to IndexedDB ─────────────────────────────────────────
    const saveProgress = useCallback(async () => {
        if (typeof window === 'undefined') return;

        try {
            const values = form.getValues();

            // Sanitize: replace undefined values with null for IndexedDB compatibility
            // and keep File instances intact (storage.ts handles file extraction)
            const sanitized: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(values)) {
                if (value === undefined) {
                    sanitized[key] = null;
                } else {
                    sanitized[key] = value;
                }
            }

            await formStorage.saveFormData(FORM_STORAGE_KEY, sanitized);
            localStorage.setItem(STEP_STORAGE_KEY, String(currentStep));
            localStorage.setItem(
                `${STEP_STORAGE_KEY}_completed`,
                JSON.stringify([...completedSteps])
            );
        } catch (error) {
            console.warn('Failed to save progress:', error);
        }
    }, [form, currentStep, completedSteps]);

    // ─── Auto-save on step change ────────────────────────────────────────────
    useEffect(() => {
        if (!isLoading) {
            // Skip the redundant save right after initial load
            if (skipNextAutoSaveRef.current) {
                skipNextAutoSaveRef.current = false;
                return;
            }
            saveProgress();
        }
    }, [currentStep, isLoading, saveProgress]);

    // ─── Validate current step fields ────────────────────────────────────────
    const validateCurrentStep = useCallback(async (): Promise<boolean> => {
        if (currentStep === FormStep.REVIEW) return true;

        // Skip document validation when awaiting results
        if (currentStep === FormStep.QUALIFICATION_DOCUMENTS && form.getValues('awaiting_result')) {
            return true;
        }

        const stepSchema = STEP_SCHEMAS[currentStep as keyof typeof STEP_SCHEMAS];
        if (!stepSchema) return true;

        const fields = STEP_FIELDS[currentStep];
        const values = form.getValues();

        // Extract only this step's field values
        const stepValues: Record<string, unknown> = {};
        fields.forEach(field => {
            stepValues[field] = values[field as keyof FormDefaultValues];
        });

        const result = await stepSchema.safeParseAsync(stepValues);

        if (!result.success) {
            // Map errors to react-hook-form
            result.error.issues.forEach(issue => {
                const fieldPath = issue.path.join('.') as keyof FormDefaultValues;
                form.setError(fieldPath, { message: issue.message });
            });
            return false;
        }

        // Clear step errors
        fields.forEach(field => {
            form.clearErrors(field as keyof FormDefaultValues);
        });

        return true;
    }, [currentStep, form]);

    // ─── Navigation ──────────────────────────────────────────────────────────
    const nextStep = useCallback(async (): Promise<boolean> => {
        const isValid = await validateCurrentStep();
        if (!isValid) {
            toast.error('Please fix the errors before proceeding.');
            return false;
        }

        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setDirection(1);

        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(prev => (prev + 1) as FormStep);
        }

        await saveProgress();
        return true;
    }, [currentStep, validateCurrentStep, saveProgress]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => (prev - 1) as FormStep);
        }
    }, [currentStep]);

    const goToStep = useCallback((step: FormStep) => {
        // Only allow going to completed steps or the current step + 1
        if (step <= currentStep || completedSteps.has(step) || step === currentStep + 1) {
            setDirection(step > currentStep ? 1 : -1);
            setCurrentStep(step);
        }
    }, [currentStep, completedSteps]);

    // ─── Check if a step has valid data ──────────────────────────────────────
    const isStepValid = useCallback((step: FormStep): boolean => {
        if (step === FormStep.REVIEW) return true;

        const stepSchema = STEP_SCHEMAS[step as keyof typeof STEP_SCHEMAS];
        if (!stepSchema) return true;

        const fields = STEP_FIELDS[step];
        const values = form.getValues();

        const stepValues: Record<string, unknown> = {};
        fields.forEach(field => {
            stepValues[field] = values[field as keyof FormDefaultValues];
        });

        const result = stepSchema.safeParse(stepValues);
        return result.success;
    }, [form]);

    // ─── Get step-specific errors ────────────────────────────────────────────
    const getStepErrors = useCallback((step: FormStep): string[] => {
        const fields = STEP_FIELDS[step];
        const errors = form.formState.errors;
        const stepErrors: string[] = [];

        fields.forEach(field => {
            const error = errors[field as keyof FormDefaultValues];
            if (error?.message) {
                stepErrors.push(error.message as string);
            }
        });

        return stepErrors;
    }, [form.formState.errors]);

    // ─── Submit full form ────────────────────────────────────────────────────
    const submitForm = useCallback(async () => {
        setIsSubmitting(true);
        try {
            const values = form.getValues();
            const result = await odlProgramSchema.safeParseAsync(values);

            if (!result.success) {
                console.warn('Submission validation errors:', result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`));
                result.error.issues.forEach(issue => {
                    const fieldPath = issue.path.join('.') as keyof FormDefaultValues;
                    form.setError(fieldPath, { message: issue.message });
                });
                toast.error('Please review and fix all errors before submitting.');
                return;
            }

            // TODO: API call to submit the application
            // await submitAdmissionApplication(result.data);

            await formStorage.clearFormData(FORM_STORAGE_KEY);
            localStorage.removeItem(STEP_STORAGE_KEY);
            localStorage.removeItem(`${STEP_STORAGE_KEY}_completed`);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Submission failed:', error);
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [form]);

    // ─── Reset form ──────────────────────────────────────────────────────────
    const resetForm = useCallback(async () => {
        form.reset(DEFAULT_FORM_VALUES);
        setCurrentStep(FormStep.PERSONAL_INFO);
        setCompletedSteps(new Set());
        await formStorage.clearFormData(FORM_STORAGE_KEY);
        localStorage.removeItem(STEP_STORAGE_KEY);
        localStorage.removeItem(`${STEP_STORAGE_KEY}_completed`);
        toast.info('Form has been reset.');
    }, [form]);

    return {
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
        resetForm,
        isStepValid,
        getStepErrors,
        direction,
    };
}
