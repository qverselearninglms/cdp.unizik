'use client'

import React, { useEffect } from 'react'
import AuthContauiner from '../components/AuthContainer';
import { AuthContainerHeader } from '../components/AuthContainerHeader';
import LoginFormContainer from './components/LoginFormContainer';
import { FormProvider } from '@/contexts/FormContext';
import { ApplySection } from './components/LoginFormFields';
import { toast } from 'sonner';

const AUTH_RECOVERY_COOKIE = "cdp_auth_session_recovered";

const LoginFormPage = () => {
    useEffect(() => {
        const hasRecoveryCookie = document.cookie
            .split(";")
            .map((cookie) => cookie.trim())
            .some((cookie) => cookie === `${AUTH_RECOVERY_COOKIE}=1`);

        if (!hasRecoveryCookie) return;

        toast.info("Session refreshed. Please sign in again.");
        document.cookie = `${AUTH_RECOVERY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    }, []);

    return (
        <AuthContauiner>
            {/* Header */}
            <AuthContainerHeader
                heading='Sign In'
                subHeading={`Please sign in to your account for more adventure!`}
            />
            {/* Form body */}
            <FormProvider>
                <LoginFormContainer />
            </FormProvider>

            {/* Apply Section */}
            <ApplySection />
        </AuthContauiner >
    );
}

export default LoginFormPage
