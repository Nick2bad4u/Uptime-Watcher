/**
 * Hook for accessing monitor field definitions from the registry. Provides
 * field configurations for dynamic form handling.
 *
 * @remarks
 * This hook integrates with the monitor types store to provide field
 * configurations for dynamic form generation. It maintains backward
 * compatibility with existing utility functions while leveraging centralized
 * state management.
 *
 * Field definitions include validation rules, UI hints, and metadata needed for
 * dynamic form generation and validation.
 *
 * @example
 *
 * ```tsx
 * function MonitorForm({ monitorType }) {
 *   const { getFields, isFieldRequired, isLoaded, error } = useMonitorFields();
 *
 *   if (!isLoaded) return <div>Loading fields...</div>;
 *   if (error) return <div>Error loading fields: {error}</div>;
 *
 *   const fields = getFields(monitorType);
 *   return (
 *     <form>
 *       {fields.map(field => (
 *         <Field
 *           key={field.name}
 *           {...field}
 *           required={isFieldRequired(monitorType, field.name)}
 *         />
 *       ))}
 *     </form>
 *   );
 * }
 * ```
 *
 * @returns Object containing field accessor functions and loading state
 *
 * @public
 */

import type { MonitorFieldDefinition, MonitorType } from "@shared/types";

import { useCallback, useEffect } from "react";

import type { ErrorStore } from "../stores/error/types";

import { useErrorStore } from "../stores/error/useErrorStore";
import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";

const selectMonitorTypesError = (state: ErrorStore): string | undefined =>
    state.getStoreError("monitor-types");

/**
 * Result interface for the useMonitorFields hook
 *
 * @public
 */
export interface UseMonitorFieldsResult {
    /** Error message if loading failed */
    error?: string | undefined;
    /** Get field definitions for a specific monitor type */
    getFields: (monitorType: MonitorType) => MonitorFieldDefinition[];
    /** Get required fields for a specific monitor type */
    getRequiredFields: (monitorType: MonitorType) => string[];
    /** Check if a field is required for a monitor type */
    isFieldRequired: (monitorType: MonitorType, fieldName: string) => boolean;
    /** Whether field definitions are loaded */
    isLoaded: boolean;
}

/**
 * React hook for accessing monitor field definitions from the registry.
 *
 * @remarks
 * Provides field configurations for dynamic form handling with integration to
 * the monitor types store. Maintains backward compatibility with existing
 * utility functions while leveraging centralized state management.
 *
 * @returns Hook result containing field access methods and loading state.
 *
 * @public
 *
 * @see {@link useMonitorTypesStore} for the underlying registry.
 */
export function useMonitorFields(): UseMonitorFieldsResult {
    const monitorTypesError = useErrorStore(selectMonitorTypesError);

    const { fieldConfigs, isLoaded, loadMonitorTypes } = useMonitorTypesStore();

    useEffect(
        function loadMonitorFieldTypes() {
            // Load monitor types when hook is first used
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

    const getFields = useCallback(
        (monitorType: MonitorType): MonitorFieldDefinition[] =>
            fieldConfigs[monitorType] ?? [],
        [fieldConfigs]
    );

    const getRequiredFields = useCallback(
        (monitorType: MonitorType): string[] => {
            const fields = getFields(monitorType);
            return fields
                .filter((field) => field.required)
                .map((field) => field.name);
        },
        [getFields]
    );

    const isFieldRequired = useCallback(
        (monitorType: MonitorType, fieldName: string): boolean => {
            const fields = getFields(monitorType);
            const field = fields.find((f) => f.name === fieldName);
            return field?.required ?? false;
        },
        [getFields]
    );

    return {
        error: monitorTypesError,
        getFields,
        getRequiredFields,
        isFieldRequired,
        isLoaded,
    };
}
