/**
 * Single form field component that renders based on field definition. Supports
 * number, text, and URL field types with proper validation.
 *
 * @remarks
 * This component dynamically renders form fields based on their type
 * definition. It supports "number", "text", and "url" field types with proper
 * validation. For unsupported field types, displays an error message. Numeric
 * fields handle automatic conversion and validation of input values.
 *
 * @example Basic usage with a number field:
 *
 * ```tsx
 * <DynamicField
 *     disabled={false}
 *     field={{
 *         name: "port",
 *         label: "Port",
 *         type: "number",
 *         required: true,
 *         min: 1,
 *         max: 65535,
 *     }}
 *     onChange={setPort}
 *     value={8080}
 * />;
 * ```
 *
 * @example Text field with help text:
 *
 * ```tsx
 * <DynamicField
 *     field={{
 *         name: "hostname",
 *         label: "Hostname",
 *         type: "text",
 *         helpText: "Enter the hostname or IP address",
 *     }}
 *     onChange={setHostname}
 *     value="example.com"
 * />;
 * ```
 *
 * @public
 */

import type { MonitorFieldDefinition } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import { memo, type NamedExoticComponent, useCallback, useMemo } from "react";

import { logger } from "../../services/logger";
import { ThemedText } from "../../theme/components/ThemedText";
import { SelectField, type SelectOption } from "./SelectField";
import { TextField } from "./TextField";

/**
 * Props for the {@link DynamicField} component.
 *
 * @public
 */
interface DynamicFieldProperties {
    /**
     * Whether the field is disabled.
     */
    readonly disabled?: boolean;
    /**
     * Field definition describing the field's properties.
     */
    readonly field: MonitorFieldDefinition;
    /**
     * Change handler for the field value.
     *
     * @param value - The new value for the field.
     */
    readonly onChange: (value: number | string) => void;
    /**
     * Current value of the field.
     */
    readonly value: number | string;
}

/**
 * Renders a single form field based on its definition.
 *
 * @remarks
 * This component renders appropriate form fields based on the field type
 * definition. Supports "number", "text", and "url" field types with proper
 * validation. For unsupported field types, displays an error message. Numeric
 * fields handle automatic conversion and validation of input values.
 *
 * @example Number field with validation:
 *
 * ```tsx
 * <DynamicField
 *     disabled={false}
 *     field={{
 *         name: "port",
 *         label: "Port",
 *         type: "number",
 *         required: true,
 *         min: 1,
 *         max: 65535,
 *     }}
 *     onChange={setPort}
 *     value={8080}
 * />;
 * ```
 *
 * @param props - The component properties
 *
 * @returns The rendered field as a React element
 *
 * @public
 */
export const DynamicField: NamedExoticComponent<DynamicFieldProperties> = memo(
    function DynamicFieldComponent({
        disabled = false,
        field,
        onChange,
        value,
    }: DynamicFieldProperties): JSX.Element {
        const handleChange = useCallback(
            (newValue: number | string) => {
                onChange(newValue);
            },
            [onChange]
        );

        const handleNumericChange = useCallback(
            (val: string) => {
                const numericValue = Number(val);
                if (val === "" || !Number.isNaN(numericValue)) {
                    handleChange(val === "" ? 0 : numericValue);
                } else {
                    logger.error(`Invalid numeric input: ${val}`);
                }
            },
            [handleChange]
        );

        const handleStringChange = useCallback(
            (val: string) => {
                handleChange(val);
            },
            [handleChange]
        );

        const selectOptions = useMemo(
            () => (field.options ?? []) as SelectOption[],
            [field.options]
        );

        switch (field.type) {
            case "number": {
                return (
                    <TextField
                        disabled={disabled}
                        {...(field.helpText && { helpText: field.helpText })}
                        id={field.name}
                        label={field.label}
                        {...(field.max !== undefined && { max: field.max })}
                        {...(field.min !== undefined && { min: field.min })}
                        onChange={handleNumericChange}
                        {...(field.placeholder && {
                            placeholder: field.placeholder,
                        })}
                        required={field.required}
                        type="number"
                        value={String(value)}
                    />
                );
            }
            case "select": {
                return (
                    <SelectField
                        disabled={disabled}
                        {...(field.helpText && { helpText: field.helpText })}
                        id={field.name}
                        label={field.label}
                        onChange={handleStringChange}
                        options={selectOptions}
                        {...(field.placeholder && {
                            placeholder: field.placeholder,
                        })}
                        required={field.required}
                        value={String(value)}
                    />
                );
            }
            case "text":
            // Falls through
            case "url": {
                return (
                    <TextField
                        disabled={disabled}
                        {...(field.helpText && { helpText: field.helpText })}
                        id={field.name}
                        label={field.label}
                        onChange={handleStringChange}
                        {...(field.placeholder && {
                            placeholder: field.placeholder,
                        })}
                        required={field.required}
                        type={field.type}
                        value={String(value)}
                    />
                );
            }

            default: {
                return (
                    <ThemedText variant="error">
                        Unsupported field type: {field.type}
                    </ThemedText>
                );
            }
        }
    }
);
