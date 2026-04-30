import { passwordSchema, emailSchema, nameSchema, selectMenuSchema, confirmPasswordSchema, genderSchema, phoneSchema, usernameSchema, regNumberSchema } from "@/lib/validations/zod"
import z, { object } from "zod"

// Define Zod Schemas for each step
export const personalInfoSchema = z.object({

    first_name: nameSchema('First name'),

    last_name: nameSchema('Last name'),

    other_name: nameSchema('Other name', true),

    gender: genderSchema,

    nationality: selectMenuSchema('country'),

    state: selectMenuSchema('state', true),
    
    local_gov_area: selectMenuSchema('local_gov_area', true),

    phone: phoneSchema(),
});

export const academicInfoSchema = z.object({
    course_name: nameSchema('Course Name', true),

    school_reg_number: regNumberSchema('School Registration Number', true),

    jamb_reg_number: regNumberSchema('Jamb Registration Number', true),

    school_email: emailSchema("School Email", true),
});


export const accouintInfoSchema = z.object({
    email: emailSchema(),

    username: usernameSchema('username'),

    password: passwordSchema,

    confirm_password: confirmPasswordSchema('password'),

}).refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const signUpSchema = object({
    ...personalInfoSchema.shape,
    ...academicInfoSchema.shape,
    ...accouintInfoSchema.shape,
});


export type SignUpFormData = z.infer<typeof signUpSchema>;
