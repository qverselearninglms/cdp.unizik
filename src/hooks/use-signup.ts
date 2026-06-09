import { baseUrl } from '@/config';
import { SignUpFormData, signUpSchema } from '@/schema/sign-up-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { authApi } from '@/lib/services/auth';
import { toast } from 'sonner';
import { ApiError, SignupResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { STEPS, useSignupSteps } from './use-signup-steps';
import { createMutation } from '@/core/queryHooks';
import { handleApiError } from '@/lib/api-error';

interface UseSignupReturn extends UseFormReturn<SignUpFormData> {
    error: string | null;
    onSubmit: (data: SignUpFormData) => Promise<void>;
    isLoading: boolean;

    getStepStatus: (stepIndex: number) => 'completed' | 'current' | 'upcoming';
    goToStep: (stepIndex: number) => Promise<void>;
    STEPS: typeof STEPS;
    currentStep: number;
    completedSteps?: number[];
    nextStep: () => Promise<void>;
    prevStep: () => void;
    delta: number;
}

export function useSignup(): UseSignupReturn {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: 'onChange',
        defaultValues: {
            first_name: '',
            last_name: '',
            other_name: '',
            email: '',
            username: '',
            gender: '',
            nationality: '',
            phone: '',
            password: '',
            confirm_password: '',
            // program_id and program_name intentionally omitted so RHF treats it as undefined
            // until the student actively selects a program — this makes the
            // academic step's "Next" button correctly blocked until enrollment.
        },
    });

    const {
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        getStepStatus,
        setCurrentStep,
        setCompletedSteps,
        delta,
    } = useSignupSteps(form);

    const signup = createMutation({
        key: 'signup-user',
        fn: (credentials: SignUpFormData) => authApi.signup(credentials),
        defaultOptions: {
            onSuccess: async (res: SignupResponse) => {
                toast.success('Account Created Successfully!');
                const redirectUrl = res.user ? res.user.email : '';
                router.push(`${baseUrl}/auth/signin?email=${redirectUrl}`);
                form.reset();
                setCurrentStep(0);
                setCompletedSteps([]);
            },
            onError: (error: ApiError) => {
                handleApiError(error, 'Signup failed. Please try again.');
                setError(error.message || 'Signup failed. Please try again.');
            },
        },
    });

    const signupMutation = signup();

    const onSubmit = async (data: SignUpFormData) => {
        signupMutation.mutate(data);
    };

    return {
        ...form,
        formState: form.formState,
        onSubmit,
        error,
        isLoading: signupMutation.isPending,

        getStepStatus,
        goToStep,
        STEPS,
        currentStep,
        nextStep,
        prevStep,
        delta,
    };
}