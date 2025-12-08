import type { MonitorFieldDefinition } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

/**
 * Creates a fully populated {@link MonitorTypeConfig} object for tests.
 */
export const createMonitorTypeConfig = (
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => {
    const defaultFields: MonitorFieldDefinition[] = [
        {
            label: "URL",
            name: "url",
            placeholder: "https://example.com",
            required: true,
            type: "url",
        },
    ];

    const uiConfig = overrides.uiConfig;

    return {
        description: "Mock monitor type used for testing",
        displayName: "Mock Monitor",
        fields: overrides.fields ?? defaultFields,
        type: overrides.type ?? "mock-monitor",
        version: overrides.version ?? "1.0.0",
        ...(uiConfig ? { uiConfig } : {}),
    } satisfies MonitorTypeConfig;
};
