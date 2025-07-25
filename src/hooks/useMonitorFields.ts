/**
 * Hook for accessing monitor field definitions from the registry.
 * Provides field configurations for dynamic form handling.
 *
 * @returns Object containing field accessor functions and loading state
 *
 * @remarks
 * This hook fetches monitor field definitions from the backend registry via IPC
 * and provides utilities to query field configurations for different monitor types.
 * It handles loading states and errors gracefully, maintaining field access even
 * when backend communication fails.
 *
 * Field definitions include validation rules, UI hints, and metadata needed
 * for dynamic form generation and validation.
 *
 * @example
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
 */

import type { MonitorFieldDefinition } from "@shared/types";

import { useCallback, useEffect, useState } from "react";

import logger from "../services/logger";

/**
 * Result interface for the useMonitorFields hook
 *
 * @public
 */
export interface UseMonitorFieldsResult {
    /** Error message if loading failed */
    error?: string | undefined;
    /** Get field definitions for a specific monitor type */
    getFields: (monitorType: string) => MonitorFieldDefinition[];
    /** Get required fields for a specific monitor type */
    getRequiredFields: (monitorType: string) => string[];
    /** Check if a field is required for a monitor type */
    isFieldRequired: (monitorType: string, fieldName: string) => boolean;
    /** Whether field definitions are loaded */
    isLoaded: boolean;
}

export function useMonitorFields(): UseMonitorFieldsResult {
    const [fieldConfigs, setFieldConfigs] = useState<Record<string, MonitorFieldDefinition[]>>({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        const loadFieldConfigs = async () => {
            try {
                setError(undefined);
                const configs = await window.electronAPI.monitorTypes.getMonitorTypes();
                const fieldMap: Record<string, MonitorFieldDefinition[]> = {};

                for (const config of configs) {
                    fieldMap[config.type] = config.fields;
                }

                setFieldConfigs(fieldMap);
                setIsLoaded(true);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Failed to load monitor field configurations";
                setError(errorMessage);
                logger.error(
                    "Failed to load monitor field configurations",
                    error instanceof Error ? error : new Error(String(error))
                );
                setIsLoaded(true); // Set loaded even on error to prevent infinite loading
            }
        };

        void loadFieldConfigs();
    }, []);

    const getFields = useCallback(
        (monitorType: string): MonitorFieldDefinition[] => {
            // ESLint disable justification: monitorType is a string parameter from function args,
            // not user input. It's used to access a Record with string keys that we control.
            // This is safe since fieldConfigs is populated from backend config with known types.
            // eslint-disable-next-line security/detect-object-injection
            return fieldConfigs[monitorType] ?? [];
        },
        [fieldConfigs]
    );

    const getRequiredFields = useCallback(
        (monitorType: string): string[] => {
            const fields = getFields(monitorType);
            return fields.filter((field) => field.required).map((field) => field.name);
        },
        [getFields]
    );

    const isFieldRequired = useCallback(
        (monitorType: string, fieldName: string): boolean => {
            const fields = getFields(monitorType);
            const field = fields.find((f) => f.name === fieldName);
            return field?.required ?? false;
        },
        [getFields]
    );

    return {
        error,
        getFields,
        getRequiredFields,
        isFieldRequired,
        isLoaded,
    };
}
