/**
 * Dynamic form component that generates monitor fields based on type configuration.
 *
 * @remarks
 * - Loads monitor field definitions from the backend using the monitor type.
 * - Eliminates hard-coded form field rendering.
 * - Handles loading and error states for monitor type configuration.
 * - Each field is rendered dynamically based on its definition.
 *
 * @packageDocumentation
 */

import { type MonitorFieldDefinition } from "@shared/types";
import { useCallback, useEffect } from "react";
import { type JSX } from "react/jsx-runtime";

import logger from "../../services/logger";
import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";
import { ThemedText } from "../../theme/components";
import { TextField } from "./FormFields";

/**
 * Props for the {@link DynamicField} component.
 *
 * @public
 */
export interface DynamicFieldProps {
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
 * Props for the {@link DynamicMonitorFields} component.
 *
 * @public
 */
export interface DynamicMonitorFieldsProps {
    /**
     * Whether the form is in a loading state.
     */
    readonly isLoading?: boolean;
    /**
     * The selected monitor type for which to render fields.
     */
    readonly monitorType: string;
    /**
     * Change handlers for each field, keyed by field name.
     */
    readonly onChange: Record<string, (value: number | string) => void>;
    /**
     * Current values for each field, keyed by field name.
     */
    readonly values: Record<string, number | string>;
}

/**
 * Renders form fields dynamically based on monitor type configuration loaded from backend.
 *
 * @remarks
 * - Fetches monitor type configuration using {@link getMonitorTypeConfig}.
 * - Displays loading and error states as appropriate.
 * - For each field in the configuration, renders a {@link DynamicField}.
 * - If a field's onChange handler is missing, logs an error.
 *
 * @param props - {@link DynamicMonitorFieldsProps}
 * @returns The rendered dynamic monitor fields as a React element.
 *
 * @throws If monitor type configuration fails to load, displays an error message.
 *
 * @example
 * ```tsx
 * <DynamicMonitorFields
 *   isLoading={false}
 *   monitorType="http"
 *   onChange={{ url: setUrl }}
 *   values={{ url: "https://example.com" }}
 * />
 * ```
 */
export const DynamicMonitorFields = ({
    isLoading = false,
    monitorType,
    onChange,
    values,
}: DynamicMonitorFieldsProps): JSX.Element => {
    const { isLoaded, lastError, loadMonitorTypes, monitorTypes } =
        useMonitorTypesStore();

    // Find the config for the current monitor type
    const config = monitorTypes.find((type) => type.type === monitorType);

    // Load monitor types when component mounts
    useEffect(() => {
        if (!isLoaded && !lastError) {
            void loadMonitorTypes();
        }
    }, [isLoaded, lastError, loadMonitorTypes]);

    if (!isLoaded) {
        return (
            <ThemedText variant="secondary">
                Loading monitor fields...
            </ThemedText>
        );
    }

    if (lastError) {
        return (
            <ThemedText variant="error">
                Error loading monitor fields: {lastError}
            </ThemedText>
        );
    }

    if (!config) {
        return (
            <ThemedText variant="error">
                Unknown monitor type: {monitorType}
            </ThemedText>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {config.fields.map((field) => {
                const fieldOnChange = onChange[field.name];
                if (!fieldOnChange) {
                    logger.error(
                        `Missing onChange handler for field: ${field.name}`
                    );
                }

                const fieldValue = values[field.name];
                const defaultValue = field.type === "number" ? 0 : "";

                return (
                    <DynamicField
                        disabled={isLoading}
                        field={field}
                        key={field.name}
                        onChange={
                            fieldOnChange ??
                            (() => {
                                logger.warn(
                                    `No onChange handler provided for field: ${field.name}`
                                );
                            })
                        }
                        value={fieldValue ?? defaultValue}
                    />
                );
            })}
        </div>
    );
};

/**
 * Renders a single form field based on its definition.
 *
 * @remarks
 * - Supports "number", "text", and "url" field types.
 * - For unsupported field types, displays an error message.
 * - Handles conversion and validation for numeric fields.
 *
 * @param props - {@link DynamicFieldProps}
 * @returns The rendered field as a React element.
 *
 * @example
 * ```tsx
 * <DynamicField
 *   disabled={false}
 *   field={{ name: "port", label: "Port", type: "number", required: true }}
 *   onChange={setPort}
 *   value={8080}
 * />
 * ```
 */
const DynamicField = ({
    disabled = false,
    field,
    onChange,
    value,
}: DynamicFieldProps) => {
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
        case "text":

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
};
