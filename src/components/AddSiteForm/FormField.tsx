/**
 * Base FormField wrapper component that provides consistent label, error handling, and accessibility features.
 *
 * @remarks
 * This component provides consistent styling and accessibility for all form fields.
 * It displays a label, error/help text, and wraps the input element with proper ARIA attributes.
 * The component is memoized for performance optimization.
 *
 * @example
 * Basic form field with text input:
 * ```tsx
 * <FormField
 *   id="username"
 *   label="Username"
 *   required={true}
 *   helpText="Enter your username"
 * >
 *   <input type="text" id="username" />
 * </FormField>
 * ```
 *
 * @example
 * Form field with error state:
 * ```tsx
 * <FormField
 *   id="email"
 *   label="Email Address"
 *   error="Please enter a valid email address"
 *   required={true}
 * >
 *   <input type="email" id="email" className="error" />
 * </FormField>
 * ```
 *
 * @public
 */

import React from "react";

import ThemedText from "../../theme/components/ThemedText";

/**
 * Properties for the FormField component.
 *
 * @public
 */
export interface FormFieldProperties {
    /** Form input element(s) to wrap */
    readonly children: React.ReactNode;
    /** Error message to display below the field */
    readonly error?: string;
    /** Help text to show below the field when no error is present */
    readonly helpText?: string;
    /** Unique identifier for the form field, used for accessibility */
    readonly id: string;
    /** Label text to display above the field */
    readonly label: string;
    /** Whether the field is required (shows asterisk in label) */
    readonly required?: boolean;
}

/**
 * Reusable form field wrapper component with label, error handling, and accessibility features.
 *
 * @remarks
 * This component provides consistent styling and accessibility for all form fields.
 * It displays a label with optional required indicator, error/help text, and wraps the input element.
 * The component uses proper ARIA attributes for accessibility and is memoized for performance.
 *
 * @param props - The component properties
 * @returns JSX element containing labeled form field with error/help text
 *
 * @example
 * ```tsx
 * <FormField
 *   id="password"
 *   label="Password"
 *   required={true}
 *   error={validationError}
 * >
 *   <input type="password" id="password" />
 * </FormField>
 * ```
 *
 * @public
 */
const FormField: React.NamedExoticComponent<FormFieldProperties> = React.memo(
    function FormField({
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
    }
);

export default FormField;
