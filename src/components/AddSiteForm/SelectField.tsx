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

import type { NamedExoticComponent } from "react";

import { ThemedSelect } from "../../theme/components/ThemedSelect";
import {
    createStringField,
    type StringFieldPropsBase,
} from "./fields/fieldFactories";

/**
 * Properties for the SelectField component.
 *
 * @public
 */
export interface SelectFieldProperties extends Omit<
    StringFieldPropsBase,
    "value"
> {
    /** Array of options to display in the dropdown */
    readonly options: SelectOption[];
    /** Placeholder text shown when no option is selected */
    readonly placeholder?: string;
    /** Current selected value */
    readonly value: string;
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
    value: string;
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
const SelectFieldBase = createStringField<
    SelectFieldProperties,
    HTMLSelectElement
>({
    displayName: "SelectField",
    renderControl: ({ ariaProps, handleChange, props }) => {
        const {
            disabled = false,
            id,
            options,
            placeholder,
            required = false,
            value,
        } = props;

        return (
            <ThemedSelect
                {...ariaProps}
                disabled={disabled}
                id={id}
                onChange={handleChange}
                required={required}
                title={ariaProps["aria-label"]}
                value={value}
            >
                {placeholder ? <option value="">{placeholder}</option> : null}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </ThemedSelect>
        );
    },
});

export const SelectField: NamedExoticComponent<SelectFieldProperties> =
    SelectFieldBase;
