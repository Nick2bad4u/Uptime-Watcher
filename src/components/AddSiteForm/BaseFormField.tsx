/**
 * Base form field component that wraps common form field functionality.
 *
 * @remarks
 * This component provides the common FormField wrapper and ARIA attribute logic
 * that is shared across all form field components (TextField, SelectField,
 * RadioGroup, etc.). It eliminates code duplication by centralizing the common
 * patterns.
 *
 * @example Basic usage with a custom input component:
 *
 * ```tsx
 * <BaseFormField
 *     id="myField"
 *     label="My Field"
 *     required={true}
 *     error={error}
 *     helpText="Some help text"
 * >
 *     {(ariaProps) => (
 *         <input
 *             {...ariaProps}
 *             type="text"
 *             value={value}
 *             onChange={handleChange}
 *         />
 *     )}
 * </BaseFormField>;
 * ```
 */

import type { FormFieldBaseProperties } from "@shared/types/componentProps";
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
export interface BaseFormFieldProperties extends FormFieldBaseProperties {
    /** Render function that receives ARIA properties */
    readonly children: (ariaProps: AriaProperties) => ReactNode;
}

/**
 * Base form field component with common FormField wrapper and ARIA logic.
 *
 * @param properties - The component properties
 *
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
