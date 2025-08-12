/**
 * Text input field component with accessibility, validation, and themed styling.
 *
 * @remarks
 * Supports "text", "url", and "number" input types with proper validation and error display.
 * The component integrates with FormField wrapper for consistent styling and accessibility.
 * Provides ARIA attributes and handles various input scenarios including min/max for numbers.
 *
 * @example
 * Basic text input field:
 * ```tsx
 * <TextField
 *   id="hostname"
 *   label="Hostname"
 *   type="text"
 *   value={hostname}
 *   onChange={setHostname}
 *   placeholder="Enter hostname"
 *   required={true}
 * />
 * ```
 *
 * @example
 * Number input with validation:
 * ```tsx
 * <TextField
 *   id="port"
 *   label="Port Number"
 *   type="number"
 *   value={port.toString()}
 *   onChange={(value) => setPort(Number(value))}
 *   min={1}
 *   max={65535}
 *   helpText="Enter port number (1-65535)"
 * />
 * ```
 *
 * @example
 * URL input with error state:
 * ```tsx
 * <TextField
 *   id="url"
 *   label="Website URL"
 *   type="url"
 *   value={url}
 *   onChange={setUrl}
 *   error={urlError}
 *   placeholder="https://example.com"
 * />
 * ```
 *
 * @public
 */

import React, { useCallback } from "react";

import ThemedInput from "../../theme/components/ThemedInput";
import { BaseFormField } from "./BaseFormField";

/**
 * Properties for the TextField component.
 *
 * @public
 */
export interface TextFieldProperties {
    /** Whether the field is disabled */
    readonly disabled?: boolean;
    /** Error message to display below the input field */
    readonly error?: string;
    /** Help text to show below the field when no error is present */
    readonly helpText?: string;
    /** Unique identifier for the input field, used for accessibility */
    readonly id: string;
    /** Label text to display above the input field */
    readonly label: string;
    /** Maximum value for number inputs (ignored for text/url types) */
    readonly max?: number;
    /** Minimum value for number inputs (ignored for text/url types) */
    readonly min?: number;
    /** Callback function triggered when value changes */
    readonly onChange: (value: string) => void;
    /** Placeholder text displayed when input is empty */
    readonly placeholder?: string;
    /** Whether the field is required */
    readonly required?: boolean;
    /** Input type - text, url, or number */
    readonly type?: "number" | "text" | "url";
    /** Current field value */
    readonly value: string;
}

/**
 * Text input field component with accessibility, validation, and themed styling.
 *
 * @remarks
 * Supports "text", "url", and "number" input types with proper validation and error display.
 * The component is memoized for performance and integrates with FormField for consistent styling.
 * Provides ARIA attributes and handles various input scenarios including min/max for numbers.
 *
 * @param props - The component properties
 * @returns JSX element containing an accessible text input field
 *
 * @example
 * Simple text input with validation:
 * ```tsx
 * <TextField
 *   id="siteName"
 *   label="Site Name"
 *   value={siteName}
 *   onChange={setSiteName}
 *   required={true}
 *   placeholder="Enter site name"
 * />
 * ```
 *
 * @public
 */
const TextField: React.NamedExoticComponent<TextFieldProperties> = React.memo(
    function TextField({
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
        const handleChange = useCallback(
            (event: React.ChangeEvent<HTMLInputElement>) => {
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
                    <ThemedInput
                        {...ariaProps}
                        disabled={disabled}
                        id={id}
                        {...(max !== undefined && { max })}
                        {...(min !== undefined && { min })}
                        onChange={handleChange}
                        {...(placeholder !== undefined && { placeholder })}
                        required={required}
                        type={type}
                        value={value}
                    />
                )}
            </BaseFormField>
        );
    }
);

export default TextField;
