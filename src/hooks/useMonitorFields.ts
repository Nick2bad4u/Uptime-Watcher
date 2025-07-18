/**
 * Hook for accessing monitor field definitions from the registry.
 * Provides field configurations for dynamic form handling.
 */

import { useState, useEffect, useCallback } from "react";
import type { MonitorFieldDefinition } from "../../shared/types";

interface UseMonitorFieldsResult {
    /** Get field definitions for a specific monitor type */
    getFields: (monitorType: string) => MonitorFieldDefinition[];
    /** Get required fields for a specific monitor type */
    getRequiredFields: (monitorType: string) => string[];
    /** Check if a field is required for a monitor type */
    isFieldRequired: (monitorType: string, fieldName: string) => boolean;
    /** Whether field definitions are loaded */
    isLoaded: boolean;
}

/**
 * Hook to access monitor field definitions from the registry.
 */
export function useMonitorFields(): UseMonitorFieldsResult {
    const [fieldConfigs, setFieldConfigs] = useState<Record<string, MonitorFieldDefinition[]>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadFieldConfigs = async () => {
            try {
                const configs = await window.electronAPI.monitorTypes.getMonitorTypes();
                const fieldMap: Record<string, MonitorFieldDefinition[]> = {};

                for (const config of configs) {
                    fieldMap[config.type] = config.fields;
                }

                setFieldConfigs(fieldMap);
                setIsLoaded(true);
            } catch (error) {
                console.error("Failed to load monitor field configurations:", error);
                setIsLoaded(true); // Set loaded even on error to prevent infinite loading
            }
        };

        void loadFieldConfigs();
    }, []);

    const getFields = useCallback(
        (monitorType: string): MonitorFieldDefinition[] => {
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
        getFields,
        getRequiredFields,
        isFieldRequired,
        isLoaded,
    };
}
