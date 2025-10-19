/**
 * Text input field component with accessibility, validation, and themed
 * styling.
 *
 * @remarks
 * Supports "text", "url", and "number" input types with proper validation and
 * error display. The component integrates with FormField wrapper for consistent
 * styling and accessibility. Provides ARIA attributes and handles various input
 * scenarios including min/max for numbers.
 *
 * @example Basic text input field:
 *
 * ```tsx
 * <TextField
 *     id="hostname"
 *     label="Hostname"
 *     type="text"
 *     value={hostname}
 *     onChange={setHostname}
 *     placeholder="Enter hostname"
 *     required={true}
 * />;
 * ```
 *
 * @example Number input with validation:
 *
 * ```tsx
 * <TextField
 *     id="port"
 *     label="Port Number"
 *     type="number"
 *     value={port.toString()}
 *     onChange={(value) => setPort(Number(value))}
 *     min={1}
 *     max={65535}
 *     helpText="Enter port number (1-65535)"
 * />;
 * ```
 *
 * @example URL input with error state:
 *
 * ```tsx
 * <TextField
 *     id="url"
 *     label="Website URL"
 *     type="url"
 *     value={url}
 *     onChange={setUrl}
 *     error={urlError}
 *     placeholder="https://example.com"
 * />;
 * ```
 *
 * @public
 */

import type { NamedExoticComponent } from "react";

import { ThemedInput } from "../../theme/components/ThemedInput";
import {
    createStringField,
    type StringFieldPropsBase,
} from "./fields/fieldFactories";

/**
 * Properties for the TextField component.
 *
 * @public
 */
export interface TextFieldProperties extends StringFieldPropsBase {
    /** Maximum value for number inputs (ignored for text/url types) */
    readonly max?: number;
    /** Minimum value for number inputs (ignored for text/url types) */
    readonly min?: number;
    /** Placeholder text displayed when input is empty */
    readonly placeholder?: string;
    /** Input type - text, url, or number */
    readonly type?: "number" | "text" | "url";
}

/**
 * Text input field component with accessibility, validation, and themed
 * styling.
 *
 * @remarks
 * Supports "text", "url", and "number" input types with proper validation and
 * error display. The component is memoized for performance and integrates with
 * FormField for consistent styling. Provides ARIA attributes and handles
 * various input scenarios including min/max for numbers.
 *
 * @example Simple text input with validation:
 *
 * ```tsx
 * <TextField
 *     id="siteName"
 *     label="Site Name"
 *     value={siteName}
 *     onChange={setSiteName}
 *     required={true}
 *     placeholder="Enter site name"
 * />;
 * ```
 *
 * @param props - The component properties
 *
 * @returns JSX element containing an accessible text input field
 *
 * @public
 */
const TextFieldBase = createStringField<TextFieldProperties, HTMLInputElement>({
    displayName: "TextField",
    renderControl: ({ ariaProps, handleChange, props }) => {
        const {
            disabled = false,
            id,
            max,
            min,
            placeholder,
            required = false,
            type = "text",
            value,
        } = props;

        return (
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
        );
    },
});

export const TextField: NamedExoticComponent<TextFieldProperties> =
    TextFieldBase;
