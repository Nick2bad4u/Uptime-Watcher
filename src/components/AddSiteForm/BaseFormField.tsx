/**
 * Base form field component that wraps common form field functionality.
 *
 * @remarks
 * This component provides the common FormField wrapper and ARIA attribute logic
 * that is shared across all form field components (TextField, SelectField, RadioGroup, etc.).
 * It eliminates code duplication by centralizing the common patterns.
 *
 * @example
 * Basic usage with a custom input component:
 * ```tsx
 * <BaseFormField
 *   id="myField"
 *   label="My Field"
 *   required={true}
 *   error={error}
 *   helpText="Some help text"
 * >
 *   {(ariaProps) => (
 *     <input
 *       {...ariaProps}
 *       type="text"
 *       value={value}
 *       onChange={handleChange}
 *     />
 *   )}
 * </BaseFormField>
 * ```
 */

import type { ReactElement, ReactNode } from "react";

import { createAriaLabel, getAriaDescribedBy } from "./form-utils";
import FormField from "./FormField";

/**
 * ARIA properties that are automatically generated for form inputs.
 *
 * @public
 */
export interface AriaProperties {
    /** ARIA described-by attribute for error/help text association */
    readonly "aria-describedby"?: string;
    /** ARIA label for accessibility */
    readonly "aria-label": string;
}

/**
 * Properties for the BaseFormField component.
 *
 * @public
 */
export interface BaseFormFieldProperties {
    /** Render function that receives ARIA properties */
    readonly children: (ariaProps: AriaProperties) => ReactNode;
    /** Error message to display below the field */
    readonly error?: string;
    /** Help text to show below the field when no error is present */
    readonly helpText?: string;
    /** Unique identifier for the field */
    readonly id: string;
    /** Label text to display above the field */
    readonly label: string;
    /** Whether the field is required */
    readonly required?: boolean;
}

/**
 * Base form field component with common FormField wrapper and ARIA logic.
 *
 * @param properties - The component properties
 * @returns The rendered form field component
 *
 * @public
 */
export const BaseFormField = ({
    children,
    error,
    helpText,
    id,
    label,
    required = false,
}: BaseFormFieldProperties): ReactElement => {
    // Generate ARIA properties
    const ariaLabel = createAriaLabel(label, required);
    const ariaDescribedBy = getAriaDescribedBy(id, error, helpText);

    const ariaProps: AriaProperties = {
        "aria-label": ariaLabel,
        ...(ariaDescribedBy && { "aria-describedby": ariaDescribedBy }),
    };

    return (
        <FormField
            {...(error !== undefined && { error })}
            {...(helpText !== undefined && { helpText })}
            id={id}
            label={label}
            required={required}
        >
            {children(ariaProps)}
        </FormField>
    );
};

export default BaseFormField;
