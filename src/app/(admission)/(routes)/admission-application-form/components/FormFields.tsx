'use client';

import { useFormContext, type FieldError } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Upload, X, FileIcon } from 'lucide-react';
import type { FormDefaultValues } from '../types/form-types';

type FieldName = keyof FormDefaultValues;

// ─── FormInput ───────────────────────────────────────────────────────────────
interface FormInputProps {
    name: FieldName;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export function FormInput({
    name,
    label,
    type = 'text',
    placeholder,
    required,
    className,
    disabled,
}: FormInputProps) {
    const { register, formState: { errors } } = useFormContext<FormDefaultValues>();
    const error = errors[name] as FieldError | undefined;

    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={name}>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            <Input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={!!error}
                {...register(name)}
            />
            {error?.message && (
                <p className="text-sm text-destructive">{error.message}</p>
            )}
        </div>
    );
}

// ─── FormSelect ──────────────────────────────────────────────────────────────
interface FormSelectProps {
    name: FieldName;
    label: string;
    placeholder?: string;
    options: Array<{ value: string; label: string }>;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export function FormSelect({
    name,
    label,
    placeholder = 'Select...',
    options,
    required,
    className,
    disabled,
}: FormSelectProps) {
    const { setValue, watch, formState: { errors } } = useFormContext<FormDefaultValues>();
    const value = watch(name) as string;
    const error = errors[name] as FieldError | undefined;

    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={name}>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            <Select
                value={value || ''}
                onValueChange={(val) => setValue(name, val as never, { shouldValidate: true, shouldDirty: true })}
                disabled={disabled}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error?.message && (
                <p className="text-sm text-destructive">{error.message}</p>
            )}
        </div>
    );
}

// ─── FormSwitch ──────────────────────────────────────────────────────────────
interface FormSwitchProps {
    name: FieldName;
    label: string;
    description?: string;
    className?: string;
    disabled?: boolean;
}

export function FormSwitch({
    name,
    label,
    description,
    className,
    disabled,
}: FormSwitchProps) {
    const { setValue, watch } = useFormContext<FormDefaultValues>();
    const value = watch(name) as boolean;

    return (
        <div className={cn('flex items-center justify-between rounded-lg border p-4', className)}>
            <div className="space-y-0.5">
                <Label htmlFor={name} className="text-base font-medium">{label}</Label>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <Switch
                id={name}
                checked={value ?? false}
                onCheckedChange={(checked) => setValue(name, checked as never, { shouldValidate: true, shouldDirty: true })}
                disabled={disabled}
            />
        </div>
    );
}

// ─── FormTextarea ────────────────────────────────────────────────────────────
interface FormTextareaProps {
    name: FieldName;
    label: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export function FormTextarea({
    name,
    label,
    placeholder,
    required,
    className,
    disabled,
}: FormTextareaProps) {
    const { register, formState: { errors } } = useFormContext<FormDefaultValues>();
    const error = errors[name] as FieldError | undefined;

    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={name}>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            <Textarea
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={!!error}
                {...register(name)}
            />
            {error?.message && (
                <p className="text-sm text-destructive">{error.message}</p>
            )}
        </div>
    );
}

// ─── FormFileUpload ──────────────────────────────────────────────────────────
interface FormFileUploadProps {
    name: FieldName;
    label: string;
    accept?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    multiple?: boolean;
}

export function FormFileUpload({
    name,
    label,
    accept = 'image/*,.pdf,.doc,.docx',
    required,
    className,
    disabled,
    multiple = false,
}: FormFileUploadProps) {
    const { setValue, watch, formState: { errors } } = useFormContext<FormDefaultValues>();
    const value = watch(name);
    const error = errors[name] as FieldError | undefined;

    const currentFile = value instanceof File ? value : null;
    const currentFiles = Array.isArray(value) ? (value as File[]) : [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        if (multiple) {
            const fileArray = Array.from(files);
            setValue(name, [...currentFiles, ...fileArray] as never, { shouldValidate: true, shouldDirty: true });
        } else {
            setValue(name, files[0] as never, { shouldValidate: true, shouldDirty: true });
        }
    };

    const removeFile = (index?: number) => {
        if (multiple && typeof index === 'number') {
            const updated = currentFiles.filter((_, i) => i !== index);
            setValue(name, (updated.length > 0 ? updated : undefined) as never, { shouldValidate: true, shouldDirty: true });
        } else {
            setValue(name, undefined as never, { shouldValidate: true, shouldDirty: true });
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className={cn('space-y-2', className)}>
            <Label>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>

            {/* Drop Area */}
            <label
                className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                    'hover:border-primary/50 hover:bg-primary/5',
                    disabled && 'pointer-events-none opacity-50',
                    error && 'border-destructive',
                )}
            >
                <Upload className="mb-2 size-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                    Click to upload or drag & drop
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                    Max 5MB • Images, PDF, DOC
                </span>
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    disabled={disabled}
                />
            </label>

            {/* Single File Preview */}
            {currentFile && !multiple && (
                <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                    <FileIcon className="size-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{currentFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(currentFile.size)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => removeFile()}
                        className="rounded-full p-1 hover:bg-destructive/10"
                    >
                        <X className="size-4 text-destructive" />
                    </button>
                </div>
            )}

            {/* Multiple Files Preview */}
            {multiple && currentFiles.length > 0 && (
                <div className="space-y-2">
                    {currentFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                            <FileIcon className="size-5 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="rounded-full p-1 hover:bg-destructive/10"
                            >
                                <X className="size-4 text-destructive" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {error?.message && (
                <p className="text-sm text-destructive">{error.message}</p>
            )}
        </div>
    );
}
