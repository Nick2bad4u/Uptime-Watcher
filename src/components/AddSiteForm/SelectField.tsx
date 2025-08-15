/**
 * Select dropdown field component with accessibility, validation, and themed
 * styling.
 *
 * @remarks
 * Renders a select dropdown with options, error/help text, and ARIA attributes.
 * The component integrates with FormField wrapper for consistent styling and
 * accessibility. Supports both string and numeric values with proper type
 * handling.
 *
 * @example Basic select field with string options:
 *
 * ```tsx
 * <SelectField
 *     id="method"
 *     label="HTTP Method"
 *     value={selectedMethod}
 *     onChange={setMethod}
 *     options={[
 *         { label: "GET", value: "GET" },
 *         { label: "POST", value: "POST" },
 *         { label: "PUT", value: "PUT" },
 *     ]}
 *     required={true}
 * />;
 * ```
 *
 * @example Select field with numeric values and placeholder:
 *
 * ```tsx
 * <SelectField
 *     id="timeout"
 *     label="Timeout (seconds)"
 *     value={timeout}
 *     onChange={(value) => setTimeout(Number(value))}
 *     options={timeoutOptions}
 *     placeholder="Select timeout..."
 *     helpText="Choose request timeout duration"
 * />;
 * ```
 *
 * @public
 */

import React, { useCallback } from "react";

import ThemedSelect from "../../theme/components/ThemedSelect";
import { BaseFormField } from "./BaseFormField";

/**
 * Properties for the SelectField component.
 *
 * @public
 */
export interface SelectFieldProperties {
    /** Whether the field is disabled */
    readonly disabled?: boolean;
    /** Error message to display below the select field */
    readonly error?: string;
    /** Help text to show below the field when no error is present */
    readonly helpText?: string;
    /** Unique identifier for the select field, used for accessibility */
    readonly id: string;
    /** Label text to display above the select field */
    readonly label: string;
    /** Callback function triggered when selection changes */
    readonly onChange: (value: string) => void;
    /** Array of options to display in the dropdown */
    readonly options: SelectOption[];
    /** Placeholder text shown when no option is selected */
    readonly placeholder?: string;
    /** Whether the field is required */
    readonly required?: boolean;
    /** Current selected value (string or number) */
    readonly value: number | string;
}

/**
 * Single option interface for SelectField dropdown items.
 *
 * @public
 */
export interface SelectOption {
    /** Display text for the option */
    label: string;
    /** Value to be selected when this option is chosen */
    value: number | string;
}

/**
 * Select dropdown field component with accessibility, validation, and themed
 * styling.
 *
 * @remarks
 * Renders a select dropdown with options, error/help text, and ARIA attributes.
 * The component is memoized for performance and integrates with FormField for
 * consistent styling. Supports both string and numeric values with proper event
 * handling.
 *
 * @example Monitor type selection:
 *
 * ```tsx
 * <SelectField
 *     id="monitorType"
 *     label="Monitor Type"
 *     options={[
 *         { label: "HTTP", value: "http" },
 *         { label: "HTTPS", value: "https" },
 *     ]}
 *     value={monitorType}
 *     onChange={setMonitorType}
 *     required={true}
 * />;
 * ```
 *
 * @param props - The component properties
 *
 * @returns JSX element containing an accessible select dropdown
 *
 * @public
 */
const SelectField: React.NamedExoticComponent<SelectFieldProperties> =
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
        const handleChange = useCallback(
            (event: React.ChangeEvent<HTMLSelectElement>) => {
                onChange(event.target.value);
            },
            [onChange]
        );

        return (
            <BaseFormField
                {...(error !== undefined && { error })}
                {...(helpText !== undefined && { helpText })}
                id={id}
                label={label}
                required={required}
            >
                {(ariaProps) => (
                    <ThemedSelect
                        {...ariaProps}
                        disabled={disabled}
                        id={id}
                        onChange={handleChange}
                        required={required}
                        title={ariaProps["aria-label"]}
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
                )}
            </BaseFormField>
        );
    });

export default SelectField;
