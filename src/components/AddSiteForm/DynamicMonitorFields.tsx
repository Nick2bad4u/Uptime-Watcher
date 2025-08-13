/**
 * Dynamic form component that generates monitor fields based on type
 * configuration. Loads field definitions from backend and renders appropriate
 * form fields.
 *
 * @remarks
 * - Loads monitor field definitions from the backend using the monitor type.
 * - Eliminates hard-coded form field rendering.
 * - Handles loading and error states for monitor type configuration.
 * - Each field is rendered dynamically based on its definition.
 *
 * @packageDocumentation
 */

import type { JSX } from "react/jsx-runtime";

import { useEffect } from "react";

import logger from "../../services/logger";
import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";
import ThemedText from "../../theme/components/ThemedText";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import DynamicField from "./DynamicField";

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
 * Renders form fields dynamically based on monitor type configuration loaded
 * from backend.
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
const DynamicMonitorFields = ({
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
            <ErrorAlert
                message={`Error loading monitor fields: ${lastError}`}
                variant="error"
            />
        );
    }

    if (!config) {
        return (
            <ErrorAlert
                message={`Unknown monitor type: ${monitorType}`}
                variant="error"
            />
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
                            ((): void => {
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

export default DynamicMonitorFields;
