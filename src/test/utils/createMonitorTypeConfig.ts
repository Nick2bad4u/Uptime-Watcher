import type { MonitorFieldDefinition, MonitorTypeConfig } from "@shared/types";

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

    return {
        description: "Mock monitor type used for testing",
        displayName: "Mock Monitor",
        fields: overrides.fields ?? defaultFields,
        type: overrides.type ?? "mock-monitor",
        uiConfig: overrides.uiConfig,
        version: overrides.version ?? "1.0.0",
    } satisfies MonitorTypeConfig;
};
