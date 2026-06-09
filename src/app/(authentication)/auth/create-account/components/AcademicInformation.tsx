'use client';

import React from 'react';
import { SignUpFormData } from '@/schema/sign-up-schema';
import { GenericHookFormProps } from '@/types/forms';
import { ProgramSelector } from './ProgramSelector';

// AcademicInformation needs setValue and trigger — both present in GenericHookFormProps
type AcademicInformationProps = Required<
    Pick<GenericHookFormProps<SignUpFormData>, 'register' | 'errors' | 'setValue' | 'trigger'>
>;

export const AcademicInformation: React.FC<AcademicInformationProps> = ({
    errors,
    setValue,
    trigger,
}) => {
    return (
        <div className="space-y-6">
            <div>
                <h5 className="text-2xl font-bold text-accent">Select Program of Study</h5>
                <p className="text-sm text-gray-500 mt-1">
                    Navigate through the categories and enroll in your desired program.
                </p>
            </div>

            <ProgramSelector
                setValue={setValue}
                trigger={trigger}
                error={errors.program_id?.message}
            />
        </div>
    );
};








// import { InputField } from '@/components/core/forms/input-field'
// import { usePrograms } from '@/hooks/usePrograms'
// import { SignUpFormData } from '@/schema/sign-up-schema'
// import { GenericHookFormProps } from '@/types/forms'
// import React from 'react'

// type AcademicInformationProps = GenericHookFormProps<SignUpFormData>;

// export const AcademicInformation: React.FC<AcademicInformationProps> = ({ register, errors }) => {

//     return (
//         <div className="space-y-6">
//             <h5 className="text-2xl text-accent">
//                 Select Program of Study
//             </h5>
//             {/* PROGRAM SELECTION STEP */}

//         </div>
//     )
// }
