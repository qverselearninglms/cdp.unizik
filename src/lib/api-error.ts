import { toast } from 'sonner';
import { ApiError } from '@/types/auth';
import { capitalize } from './utils';

/**
 * Converts a snake_case field key like 'local_gov_area' → 'Local Gov Area'
 */
function formatFieldLabel(field: string): string {
    return field
        .replace(/_/g, ' ')
        .split(' ')
        .map(capitalize)
        .join(' ');
}

/**
 * Extracts all field-level messages from an ApiError into a flat string array.
 * Each entry is formatted as "Field Label: message text".
 */
export function extractFieldErrors(error: ApiError): string[] {
    const errors = error.errors;
    if (!errors || typeof errors !== 'object') return [];

    return Object.entries(errors).flatMap(([field, messages]) =>
        Array.isArray(messages)
            ? messages.map((msg) => `${formatFieldLabel(field)}: ${msg}`)
            : []
    );
}

/**
 * Displays a user-friendly toast notification for an API error.
 *
 * - The top-level `message` becomes the toast title.
 * - Any field-level errors (e.g. from a 422 validation response) are listed
 *   as a bulleted description so the user knows exactly what needs fixing.
 *
 * @example
 * onError: (error: ApiError) => {
 *   handleApiError(error, 'Signup failed. Please try again.');
 * }
 */
export function handleApiError(
    error: ApiError,
    fallbackMessage = 'Something went wrong. Please try again.'
): void {
    const message = error.message || fallbackMessage;
    const fieldErrors = extractFieldErrors(error);

    if (fieldErrors.length > 0) {
        toast.error(message, {
            description: fieldErrors.map((e) => `• ${e}`).join('\n'),
        });
    } else {
        toast.error(message);
    }
}
