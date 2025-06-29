/**
 * Form field components for the AddSiteForm.
 * Provides reusable, accessible form inputs with consistent styling and validation.
 */

import React from "react";

import { ThemedInput, ThemedSelect, ThemedText } from "../../theme/components";

/** Suffix for required field accessibility labels */
const REQUIRED_SUFFIX = " (required)";

/**
 * Create accessible aria-label with required indicator.
 * @param label - Base label text
 * @param required - Whether field is required
 * @returns Formatted aria-label string
 */
const createAriaLabel = (label: string, required: boolean): string => `${label}${required ? REQUIRED_SUFFIX : ""}`;

/**
 * Determine the appropriate aria-describedby value based on error and help text.
 * @param id - The field ID for generating the describedby value
 * @param error - Error message if present
 * @param helpText - Help text if present
 * @returns The aria-describedby value or undefined
 */
const getAriaDescribedBy = (id: string, error?: string, helpText?: string): string | undefined => {
    if (error) return `${id}-error`;
    if (helpText) return `${id}-help`;
    return undefined;
};

/** Props for the base FormField wrapper component */
export interface FormFieldProps {
    /** Form input element(s) to wrap */
    children: React.ReactNode;
    /** Error message to display */
    error?: string;
    /** Help text to show below the field */
    helpText?: string;
    /** Unique ID for the form field */
    id: string;
    /** Label text to display */
    label: string;
    /** Whether the field is required */
    required?: boolean;
}

/**
 * Reusable form field wrapper with label, error handling, and accessibility features.
 * Provides consistent styling and behavior for all form inputs.
 *
 * @param props - FormField component props
 * @returns JSX element containing labeled form field with error/help text
 */
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

/** Props for the TextField component */
export interface TextFieldProps {
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Error message to display */
    error?: string;
    /** Help text to show below the field */
    helpText?: string;
    /** Unique ID for the input field */
    id: string;
    /** Label text to display */
    label: string;
    /** Maximum value for number inputs */
    max?: number;
    /** Minimum value for number inputs */
    min?: number;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Placeholder text for the input */
    placeholder?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Input type (text, url, or number) */
    type?: "text" | "url" | "number";
    /** Current field value */
    value: string;
}

/**
 * Text input field component with proper accessibility and validation.
 * Supports different input types and provides consistent styling.
 *
 * @param props - TextField component props
 * @returns JSX element containing accessible text input field
 */
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
                aria-describedby={getAriaDescribedBy(id, error, helpText)}
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

/** Option interface for SelectField dropdown items */
export interface SelectOption {
    /** Display text for the option */
    label: string;
    /** Value to be selected */
    value: string | number;
}

/** Props for the SelectField component */
export interface SelectFieldProps {
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Error message to display */
    error?: string;
    /** Help text to show below the field */
    helpText?: string;
    /** Unique ID for the select field */
    id: string;
    /** Label text to display */
    label: string;
    /** Callback when selection changes */
    onChange: (value: string) => void;
    /** Array of options to display in dropdown */
    options: SelectOption[];
    /** Placeholder text for empty selection */
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
                aria-describedby={getAriaDescribedBy(id, error, helpText)}
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

/** Option interface for RadioGroup items */
export interface RadioOption {
    /** Display text for the radio option */
    label: string;
    /** Value to be selected */
    value: string;
}

/** Props for the RadioGroup component */
export interface RadioGroupProps {
    /** Whether the radio group is disabled */
    disabled?: boolean;
    /** Error message to display */
    error?: string;
    /** Help text to show below the field */
    helpText?: string;
    /** Unique ID for the radio group */
    id: string;
    /** Label text to display */
    label: string;
    /** Name attribute for radio inputs (should be unique) */
    name: string;
    /** Callback when selection changes */
    onChange: (value: string) => void;
    /** Array of radio options to display */
    options: RadioOption[];
    /** Whether a selection is required */
    required?: boolean;
    /** Currently selected value */
    value: string;
}

/**
 * RadioGroup component for selecting one option from multiple choices.
 * Provides an accessible radio button group with proper ARIA attributes and keyboard navigation.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   id="protocol"
 *   label="Protocol"
 *   name="protocol"
 *   value={formData.protocol}
 *   onChange={(value) => setFormData(prev => ({ ...prev, protocol: value }))}
 *   options={[
 *     { label: 'HTTP', value: 'http' },
 *     { label: 'HTTPS', value: 'https' }
 *   ]}
 *   required
 * />
 * ```
 */
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
