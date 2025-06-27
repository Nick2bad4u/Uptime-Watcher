import React from "react";

import { ThemedInput, ThemedSelect, ThemedText } from "../../theme/components";

// Helper function to create aria-label with required indicator
const REQUIRED_SUFFIX = " (required)";
const createAriaLabel = (label: string, required: boolean): string => `${label}${required ? REQUIRED_SUFFIX : ""}`;

// Reusable form field with label and proper accessibility
export interface FormFieldProps {
    children: React.ReactNode;
    error?: string;
    helpText?: string;
    id: string;
    label: string;
    required?: boolean;
}

export const FormField = React.memo(function FormField({
    children,
    error,
    helpText,
    id,
    label,
    required = false,
}: FormFieldProps) {
    return (
        <div>
            <label className="block mb-1" htmlFor={id}>
                <ThemedText size="sm" variant="secondary" weight="medium">
                    {label} {required && "*"}
                </ThemedText>
            </label>
            {children}
            {error && (
                <div id={`${id}-error`}>
                    <ThemedText className="mt-1" size="xs" variant="error">
                        {error}
                    </ThemedText>
                </div>
            )}
            {helpText && !error && (
                <div id={`${id}-help`}>
                    <ThemedText className="mt-1" size="xs" variant="tertiary">
                        {helpText}
                    </ThemedText>
                </div>
            )}
        </div>
    );
});

// Text input field with proper accessibility
export interface TextFieldProps {
    disabled?: boolean;
    error?: string;
    helpText?: string;
    id: string;
    label: string;
    max?: number;
    min?: number;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    type?: "text" | "url" | "number";
    value: string;
}

export const TextField = React.memo(function TextField({
    disabled = false,
    error,
    helpText,
    id,
    label,
    max,
    min,
    onChange,
    placeholder,
    required = false,
    type = "text",
    value,
}: TextFieldProps) {
    return (
        <FormField error={error} helpText={helpText} id={id} label={label} required={required}>
            <ThemedInput
                aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
                aria-label={createAriaLabel(label, required)}
                disabled={disabled}
                id={id}
                max={max}
                min={min}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                type={type}
                value={value}
            />
        </FormField>
    );
});

// Select field with proper accessibility
export interface SelectOption {
    label: string;
    value: string | number;
}

export interface SelectFieldProps {
    disabled?: boolean;
    error?: string;
    helpText?: string;
    id: string;
    label: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    value: string | number;
}

export const SelectField = React.memo(function SelectField({
    disabled = false,
    error,
    helpText,
    id,
    label,
    onChange,
    options,
    placeholder,
    required = false,
    value,
}: SelectFieldProps) {
    return (
        <FormField error={error} helpText={helpText} id={id} label={label} required={required}>
            <ThemedSelect
                aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
                aria-label={createAriaLabel(label, required)}
                disabled={disabled}
                id={id}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                title={createAriaLabel(label, required)}
                value={value}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </ThemedSelect>
        </FormField>
    );
});

// Radio button group with proper accessibility
export interface RadioOption {
    label: string;
    value: string;
}

export interface RadioGroupProps {
    disabled?: boolean;
    error?: string;
    helpText?: string;
    id: string;
    label: string;
    name: string;
    onChange: (value: string) => void;
    options: RadioOption[];
    required?: boolean;
    value: string;
}

export const RadioGroup = React.memo(function RadioGroup({
    disabled = false,
    error,
    helpText,
    id,
    label,
    name,
    onChange,
    options,
    required = false,
    value,
}: RadioGroupProps) {
    return (
        <FormField error={error} helpText={helpText} id={id} label={label} required={required}>
            <div className="flex items-center gap-4" role="radiogroup">
                {options.map((option) => (
                    <label className="flex items-center gap-1" key={option.value}>
                        <input
                            checked={value === option.value}
                            disabled={disabled}
                            name={name}
                            onChange={() => onChange(option.value)}
                            required={required}
                            type="radio"
                            value={option.value}
                        />
                        <ThemedText size="sm">{option.label}</ThemedText>
                    </label>
                ))}
            </div>
        </FormField>
    );
});
