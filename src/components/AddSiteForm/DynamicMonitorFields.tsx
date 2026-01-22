/**
 * Dynamic form component that generates monitor fields based on type
 * configuration. Loads field definitions from backend and renders appropriate
 * form fields.
 *
 * @remarks
 * -
 *
 * Loads monitor field definitions from the backend using the monitor type.
 *
 * - Eliminates hard-coded form field rendering.
 * - Handles loading and error states for monitor type configuration.
 * - Each field is rendered dynamically based on its definition.
 *
 * @packageDocumentation
 */

import type { JSX } from "react/jsx-runtime";

import { logger } from "@app/services/logger";
import { memo, type NamedExoticComponent, useCallback, useEffect } from "react";

import type { ErrorStore } from "../../stores/error/types";

import { useErrorStore } from "../../stores/error/useErrorStore";
import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";
import { ThemedText } from "../../theme/components/ThemedText";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { DynamicField } from "./DynamicField";

const selectMonitorTypesError = (state: ErrorStore): string | undefined =>
    state.getStoreError("monitor-types");

/**
 * Props for the {@link DynamicMonitorFields} component.
 *
 * @public
 */
export interface DynamicMonitorFieldsProperties {
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
    readonly onChange: Readonly<
        Record<string, (value: number | string) => void>
    >;
    /**
     * Current values for each field, keyed by field name.
     */
    readonly values: Readonly<Record<string, number | string>>;
}

/**
 * Renders form fields dynamically based on monitor type configuration loaded
 * from backend.
 *
 * @remarks
 * -
 *
 * Fetches monitor type configuration using `getMonitorTypeConfig` from
 * `monitorTypeHelper`.
 *
 * - Displays loading and error states as appropriate.
 * - For each field in the configuration, renders a {@link DynamicField}.
 * - If a field's onChange handler is missing, logs an error.
 *
 * @example
 *
 * ```tsx
 * <DynamicMonitorFields
 *     isLoading={false}
 *     monitorType="http"
 *     onChange={{ url: setUrl }}
 *     values={{ url: "https://example.com" }}
 * />;
 * ```
 *
 * @param props - {@link DynamicMonitorFieldsProperties}
 *
 * @returns The rendered dynamic monitor fields as a React element.
 *
 * @throws If monitor type configuration fails to load, displays an error
 *   message.
 */
export const DynamicMonitorFields: NamedExoticComponent<DynamicMonitorFieldsProperties> =
    memo(function DynamicMonitorFields({
        isLoading = false,
        monitorType,
        onChange,
        values,
    }: DynamicMonitorFieldsProperties): JSX.Element {
        const monitorTypesError = useErrorStore(selectMonitorTypesError);

        type MonitorTypesStoreState = ReturnType<
            typeof useMonitorTypesStore.getState
        >;
        const selectIsLoaded = useCallback(
            (state: MonitorTypesStoreState): boolean => state.isLoaded,
            []
        );
        const selectLoadMonitorTypes = useCallback(
            (
                state: MonitorTypesStoreState
            ): MonitorTypesStoreState["loadMonitorTypes"] =>
                state.loadMonitorTypes,
            []
        );
        const selectMonitorTypes = useCallback(
            (
                state: MonitorTypesStoreState
            ): MonitorTypesStoreState["monitorTypes"] => state.monitorTypes,
            []
        );

        const isLoaded = useMonitorTypesStore(selectIsLoaded);
        const loadMonitorTypes = useMonitorTypesStore(selectLoadMonitorTypes);
        const monitorTypes = useMonitorTypesStore(selectMonitorTypes);

        // Find the config for the current monitor type
        const config = monitorTypes.find((type) => type.type === monitorType);

        // Load monitor types when component mounts
        useEffect(
            function loadMonitorTypesOnMount() {
                if (!isLoaded && !monitorTypesError) {
                    void loadMonitorTypes();
                }
            },
            [
                isLoaded,
                loadMonitorTypes,
                monitorTypesError,
            ]
        );

        // Memoized default onChange handler to prevent new function creation on
        // each render
        const defaultOnChange = useCallback(
            (fieldName: string) => (): void => {
                logger.warn(
                    `No onChange handler provided for field: ${fieldName}`
                );
            },
            []
        );

        if (!isLoaded) {
            return (
                <ThemedText variant="secondary">
                    Loading monitor fields...
                </ThemedText>
            );
        }

        if (monitorTypesError) {
            return (
                <ErrorAlert
                    message={`Error loading monitor fields: ${monitorTypesError}`}
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

                    const isDnsExpectedValueDisabled =
                        monitorType === "dns" &&
                        field.name === "expectedValue" &&
                        String(values["recordType"]) === "ANY";

                    return (
                        <DynamicField
                            disabled={isLoading || isDnsExpectedValueDisabled}
                            field={field}
                            key={field.name}
                            onChange={
                                fieldOnChange ?? defaultOnChange(field.name)
                            }
                            value={fieldValue ?? defaultValue}
                        />
                    );
                })}
            </div>
        );
    });
