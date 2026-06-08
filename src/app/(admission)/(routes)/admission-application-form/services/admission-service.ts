import { apiClient } from '@/core/client';
import type { ApiResponse } from '@/types/auth';
import type { ODLApplication } from '../schema/admission-schema';
import { SubmitApplicationResponse } from '../types/form-types';

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ApplicationRecord {
    id: number;
    user_id: string;
    gender: string;
    lga: string;
    hometown: string;
    hometown_address: string;
    contact_address: string;
    religion: string;
    disability: string;
    dob: string;
    passport: string;
    awaiting_result: boolean;
    first_sitting: Record<string, unknown>;
    second_sitting: Record<string, unknown>;
    next_of_kin_name: string;
    next_of_kin_relationship: string;
    next_of_kin_phone_number: string;
    next_of_kin_email: string;
    next_of_kin_address: string;
    is_next_of_kin_primary_contact: boolean;
    next_of_kin_alternate_phone_number: string;
    next_of_kin_occupation: string;
    next_of_kin_workplace: string;
    has_sponsor: boolean;
    sponsor_name: string;
    sponsor_relationship: string;
    sponsor_phone_number: string;
    sponsor_email: string;
    sponsor_contact_address: string;
    agreeToTerms: boolean;
    program: string;
    startTerm: string;
    studyMode: 'online' | 'offline';
    academic_session: string;
    first_school_leaving: string;
    o_level: string;
    other_documents: string[];
    created_at: string;
    updated_at: string;
}

export interface SubmitApplicationPayload {
    status: number;
    response: string;
    message: string;
    application: ApplicationRecord;
}

// ─── FormData Builder ─────────────────────────────────────────────────────────

function appendFile(fd: FormData, key: string, value: File | null | undefined): void {
    if (value instanceof File) {
        fd.append(key, value, value.name);
    }
}

function buildFormData(data: ODLApplication): FormData {
    const fd = new FormData();

    // ── Step 1: Personal Information ─────────────────────────────────────────
    fd.append('lga', data.lga ?? '');
    fd.append('religion', data.religion ?? '');
    fd.append('dob', data.dob ?? '');
    fd.append('gender', data.gender ?? '');
    fd.append('hometown', data.hometown ?? '');
    fd.append('hometown_address', data.hometown_address ?? '');
    fd.append('contact_address', data.contact_address ?? '');
    fd.append('has_disability', String(data.has_disability));
    fd.append('disability', data.disability ?? 'None');

    // ── Step 2: Sponsor Information ──────────────────────────────────────────
    fd.append('has_sponsor', String(data.has_sponsor));
    if (data.has_sponsor) {
        fd.append('sponsor_name', data.sponsor_name ?? '');
        fd.append('sponsor_relationship', data.sponsor_relationship ?? '');
        fd.append('sponsor_email', data.sponsor_email ?? '');
        fd.append('sponsor_contact_address', data.sponsor_contact_address ?? '');
        fd.append('sponsor_phone_number', data.sponsor_phone_number ?? '');
    }

    // ── Step 3: Next of Kin ──────────────────────────────────────────────────
    fd.append('next_of_kin_name', data.next_of_kin_name ?? '');
    fd.append('next_of_kin_relationship', data.next_of_kin_relationship ?? '');
    fd.append('next_of_kin_phone_number', data.next_of_kin_phone_number ?? '');
    fd.append('next_of_kin_address', data.next_of_kin_address ?? '');
    fd.append('next_of_kin_email', data.next_of_kin_email ?? '');
    fd.append('is_next_of_kin_primary_contact', String(data.is_next_of_kin_primary_contact ?? false));
    fd.append('next_of_kin_alternate_phone_number', data.next_of_kin_alternate_phone_number ?? '');
    fd.append('next_of_kin_occupation', data.next_of_kin_occupation ?? '');
    fd.append('next_of_kin_workplace', data.next_of_kin_workplace ?? '');

    // ── Step 4: Documents ────────────────────────────────────────────────────
    appendFile(fd, 'passport', data.passport);
    appendFile(fd, 'first_school_leaving', data.first_school_leaving);
    appendFile(fd, 'o_level', data.o_level);
    if (Array.isArray(data.other_documents)) {
        data.other_documents.forEach((file, index) => {
            fd.append(`other_documents[${index}]`, file, file.name);
        });
    }

    // ── Step 5: Qualification Fields ─────────────────────────────────────────
    fd.append('combined_result', data.combined_result ?? '');
    fd.append('awaiting_result', String(data.awaiting_result));

    // ── Step 6: Exam Sitting ─────────────────────────────────────────────────
    fd.append('first_sitting_type', data.first_sitting_type ?? '');
    fd.append('first_sitting_year', data.first_sitting_year ?? '');
    fd.append('first_sitting_exam_number', data.first_sitting_exam_number ?? '');
    fd.append('second_sitting_type', data.second_sitting_type ?? '');
    fd.append('second_sitting_year', data.second_sitting_year ?? '');
    fd.append('second_sitting_exam_number', data.second_sitting_exam_number ?? '');

    // ── Step 7: Qualification Documents ─────────────────────────────────────
    appendFile(fd, 'first_sitting_result', data.first_sitting_result);
    appendFile(fd, 'second_sitting_result', data.second_sitting_result);

    // ── Step 8: Program Selection ────────────────────────────────────────────
    fd.append('startTerm', data.startTerm ?? '');
    fd.append('studyMode', data.studyMode ?? 'online');
    fd.append('agreeToTerms', String(data.agreeToTerms));

    return fd;
}

// ─── Service Function ─────────────────────────────────────────────────────────
export async function submitAdmissionApplication(
    data: ODLApplication
): Promise<ApiResponse<SubmitApplicationResponse>> {
    const formData = buildFormData(data);
    return apiClient.upload<SubmitApplicationResponse>('/application/update-application-form', formData);
}
