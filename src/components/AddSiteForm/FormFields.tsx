/**
 * Form field components for the AddSiteForm.
 * Provides reusable, accessible form inputs with consistent styling and validation.
 * Includes text inputs, select dropdowns, and radio groups.
 *
 * @remarks
 * All components are designed for accessibility and consistent UI.
 * Use these components to ensure form fields are rendered with proper labeling, error handling, and ARIA attributes.
 */

import React from "react";

import { ThemedInput, ThemedSelect, ThemedText } from "../../theme/components";

/** Suffix for required field accessibility labels */
const REQUIRED_SUFFIX = " (required)";

/**
 * Creates an accessible aria-label string, appending a required indicator if needed.
 *
 * @param label - The base label text for the field.
 * @param required - Whether the field is required.
 * @returns The formatted aria-label string.
 *
 * @example
 * ```ts
 * createAriaLabel("Site Name", true); // "Site Name (required)"
 * ```
 */
const createAriaLabel = (label: string, required: boolean): string =>
    `${label}${required ? REQUIRED_SUFFIX : ""}`;

/**
 * Determines the appropriate aria-describedby value for a form field.
 *
 * @param id - The unique field ID.
 * @param error - Error message, if present.
 * @param helpText - Help text, if present.
 * @returns The aria-describedby value or undefined if neither error nor helpText is present.
 *
 * @remarks
 * If both error and helpText are present, error takes precedence for accessibility.
 */
const getAriaDescribedBy = (
    id: string,
    error?: string,
    helpText?: string
): string | undefined => {
    if (error) {
        return `${id}-error`;
    }
    if (helpText) {
        return `${id}-help`;
    }
    return undefined;
};

/**
 * Props for the base FormField wrapper component.
 */
export interface FormFieldProperties {
    /** Form input element(s) to wrap */
    readonly children: React.ReactNode;
    /** Error message to display */
    readonly error?: string;
    /** Help text to show below the field */
    readonly helpText?: string;
    /** Unique ID for the form field */
    readonly id: string;
    /** Label text to display */
    readonly label: string;
    /** Whether the field is required */
    readonly required?: boolean;
}

/**
 * Reusable form field wrapper with label, error handling, and accessibility features.
 *
 * @remarks
 * This component provides consistent styling and accessibility for all form fields.
 * It displays a label, error/help text, and wraps the input element.
 *
 * @param props - {@link FormFieldProperties}
 * @returns JSX element containing labeled form field with error/help text.
 */
export const FormField: React.NamedExoticComponent<FormFieldProperties> =
    React.memo(function FormField({
        children,
        error,
        helpText,
        id,
        label,
        required = false,
    }: FormFieldProperties) {
        return (
            <div>
                <label className="mb-1 block" htmlFor={id}>
                    <ThemedText size="sm" variant="secondary" weight="medium">
                        {label} {required ? "*" : null}
                    </ThemedText>
                </label>
                {children}
                {error ? (
                    <div id={`${id}-error`}>
                        <ThemedText className="mt-1" size="xs" variant="error">
                            {error}
                        </ThemedText>
                    </div>
                ) : null}
                {helpText && !error ? (
                    <div id={`${id}-help`}>
                        <ThemedText
                            className="mt-1"
                            size="xs"
                            variant="tertiary"
                        >
                            {helpText}
                        </ThemedText>
                    </div>
                ) : null}
            </div>
        );
    });

/**
 * Props for the TextField component.
 */
export interface TextFieldProperties {
    /** Whether the field is disabled */
    readonly disabled?: boolean;
    /** Error message to display */
    readonly error?: string;
    /** Help text to show below the field */
    readonly helpText?: string;
    /** Unique ID for the input field */
    readonly id: string;
    /** Label text to display */
    readonly label: string;
    /** Maximum value for number inputs */
    readonly max?: number;
    /** Minimum value for number inputs */
    readonly min?: number;
    /** Callback when value changes */
    readonly onChange: (value: string) => void;
    /** Placeholder text for the input */
    readonly placeholder?: string;
    /** Whether the field is required */
    readonly required?: boolean;
    /** Input type (text, url, or number) */
    readonly type?: "number" | "text" | "url";
    /** Current field value */
    readonly value: string;
}

/**
 * Text input field component with accessibility and validation.
 *
 * @remarks
 * Supports "text", "url", and "number" input types. Handles error and help text display.
 *
 * @param props - {@link TextFieldProperties}
 * @returns JSX element containing an accessible text input field.
 *
 * @example
 * ```tsx
 * <TextField
 *   id="siteName"
 *   label="Site Name"
 *   value={siteName}
 *   onChange={setSiteName}
 *   required
 * />
 * ```
 */
export const TextField: React.NamedExoticComponent<TextFieldProperties> =
    React.memo(function TextField({
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
    }: TextFieldProperties) {
        return (
            <FormField
                {...(error !== undefined && { error })}
                {...(helpText !== undefined && { helpText })}
                id={id}
                label={label}
                required={required}
            >
                <ThemedInput
                    {...(() => {
                        const ariaDescribedBy = getAriaDescribedBy(
                            id,
                            error,
                            helpText
                        );
                        return ariaDescribedBy
                            ? { "aria-describedby": ariaDescribedBy }
                            : {};
                    })()}
                    aria-label={createAriaLabel(label, required)}
                    disabled={disabled}
                    id={id}
                    {...(max !== undefined && { max })}
                    {...(min !== undefined && { min })}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        onChange(event.target.value);
                    }}
                    {...(placeholder !== undefined && { placeholder })}
                    required={required}
                    type={type}
                    value={value}
                />
            </FormField>
        );
    });

/**
 * Props for the SelectField component.
 */
export interface SelectFieldProperties {
    /** Whether the field is disabled */
    readonly disabled?: boolean;
    /** Error message to display */
    readonly error?: string;
    /** Help text to show below the field */
    readonly helpText?: string;
    /** Unique ID for the select field */
    readonly id: string;
    /** Label text to display */
    readonly label: string;
    /** Callback when selection changes */
    readonly onChange: (value: string) => void;
    /** Array of options to display in dropdown */
    readonly options: SelectOption[];
    /** Placeholder text for empty selection */
    readonly placeholder?: string;
    /** Whether the field is required */
    readonly required?: boolean;
    /** Current selected value */
    readonly value: number | string;
}

/**
 * Option interface for SelectField dropdown items.
 */
export interface SelectOption {
    /** Display text for the option */
    label: string;
    /** Value to be selected */
    value: number | string;
}

/**
 * Select dropdown field component with accessibility and validation.
 *
 * @remarks
 * Renders a select dropdown with options, error/help text, and ARIA attributes.
 *
 * @param props - {@link SelectFieldProperties}
 * @returns JSX element containing an accessible select dropdown.
 *
 * @example
 * ```tsx
 * <SelectField
 *   id="monitorType"
 *   label="Monitor Type"
 *   options={[{ label: "HTTP", value: "http" }]}
 *   value={monitorType}
 *   onChange={setMonitorType}
 * />
 * ```
 */
export const SelectField: React.NamedExoticComponent<SelectFieldProperties> =
    React.memo(function SelectField({
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
    }: SelectFieldProperties) {
        return (
            <FormField
                {...(error !== undefined && { error })}
                {...(helpText !== undefined && { helpText })}
                id={id}
                label={label}
                required={required}
            >
                <ThemedSelect
                    {...(() => {
                        const ariaDescribedBy = getAriaDescribedBy(
                            id,
                            error,
                            helpText
                        );
                        return ariaDescribedBy
                            ? { "aria-describedby": ariaDescribedBy }
                            : {};
                    })()}
                    aria-label={createAriaLabel(label, required)}
                    disabled={disabled}
                    id={id}
                    onChange={(event) => onChange(event.target.value)}
                    required={required}
                    title={createAriaLabel(label, required)}
                    value={value}
                >
                    {placeholder ? (
                        <option value="">{placeholder}</option>
                    ) : null}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </ThemedSelect>
            </FormField>
        );
    });

/**
 * Props for the RadioGroup component.
 */
export interface RadioGroupProperties {
    /** Whether the radio group is disabled */
    readonly disabled?: boolean;
    /** Error message to display */
    readonly error?: string;
    /** Help text to show below the field */
    readonly helpText?: string;
    /** Unique ID for the radio group */
    readonly id: string;
    /** Label text to display */
    readonly label: string;
    /** Name attribute for radio inputs (should be unique) */
    readonly name: string;
    /** Callback when selection changes */
    readonly onChange: (value: string) => void;
    /** Array of radio options to display */
    readonly options: RadioOption[];
    /** Whether a selection is required */
    readonly required?: boolean;
    /** Currently selected value */
    readonly value: string;
}

/**
 * Option interface for RadioGroup items.
 */
export interface RadioOption {
    /** Display text for the radio option */
    label: string;
    /** Value to be selected */
    value: string;
}

/**
 * RadioGroup component for selecting one option from multiple choices.
 *
 * @remarks
 * Provides an accessible radio button group with ARIA attributes and keyboard navigation.
 *
 * @param props - {@link RadioGroupProperties}
 * @returns JSX element containing a radio button group.
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
export const RadioGroup: React.NamedExoticComponent<RadioGroupProperties> =
    React.memo(function RadioGroup({
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
    }: RadioGroupProperties) {
        return (
            <FormField
                {...(error !== undefined && { error })}
                {...(helpText !== undefined && { helpText })}
                id={id}
                label={label}
                required={required}
            >
                <div className="flex items-center gap-4" role="radiogroup">
                    {options.map((option) => (
                        <label
                            className="flex items-center gap-1"
                            key={option.value}
                        >
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
