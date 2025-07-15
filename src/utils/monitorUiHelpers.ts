/**
 * Dynamic UI utilities that use monitor registry for extensible UI behavior.
 * These utilities eliminate hardcoded monitor type checks throughout the frontend.
 */

import type { MonitorType } from "../types";
import { getMonitorTypeConfig, getAvailableMonitorTypes, type MonitorTypeConfig } from "./monitorTypeHelper";

/**
 * Cache for monitor type configurations
 */
let configCache: Map<string, MonitorTypeConfig> | undefined;

/**
 * Get monitor type configuration with caching
 */
async function getConfig(monitorType: MonitorType): Promise<MonitorTypeConfig | undefined> {
    configCache ??= new Map();

    if (!configCache.has(monitorType)) {
        const config = await getMonitorTypeConfig(monitorType);
        if (config) {
            configCache.set(monitorType, config);
        }
    }

    return configCache.get(monitorType);
}

/**
 * Format detail label dynamically based on monitor type configuration.
 *
 * @param monitorType - Type of monitor
 * @param details - Detail value to format
 * @returns Formatted detail string
 *
 * @example
 * ```typescript
 * const label = formatMonitorDetail("http", "200"); // "Response Code: 200"
 * const label = formatMonitorDetail("port", "80");  // "Port: 80"
 * ```
 */
export function formatMonitorDetail(monitorType: MonitorType, details: string): string {
    try {
        // Recreate formatter functions based on monitor type since they can't be serialized over IPC
        const formatters: Record<MonitorType, (details: string) => string> = {
            http: (details: string) => `Response Code: ${details}`,
            port: (details: string) => `Port: ${details}`,
        };

        // eslint-disable-next-line security/detect-object-injection -- MonitorType is a known safe union type
        const formatter = formatters[monitorType];
        if (!formatter) {
            console.warn(`No formatter found for monitor type ${monitorType}`);
            return details;
        }
        return formatter(details);
    } catch (error) {
        console.warn(`Failed to format detail for monitor type ${monitorType}:`, error);
        return details;
    }
}

/**
 * Check if monitor type supports response time analytics.
 *
 * @param monitorType - Type of monitor
 * @returns Whether monitor supports response time analytics
 */
export async function supportsResponseTime(monitorType: MonitorType): Promise<boolean> {
    try {
        const config = await getConfig(monitorType);
        return config?.uiConfig?.supportsResponseTime ?? false;
    } catch (error) {
        console.warn(`Failed to check response time support for ${monitorType}:`, error);
        return false;
    }
}

/**
 * Check if monitor type supports advanced analytics.
 *
 * @param monitorType - Type of monitor
 * @returns Whether monitor supports advanced analytics
 */
export async function supportsAdvancedAnalytics(monitorType: MonitorType): Promise<boolean> {
    try {
        const config = await getConfig(monitorType);
        return config?.uiConfig?.supportsAdvancedAnalytics ?? false;
    } catch (error) {
        console.warn(`Failed to check advanced analytics support for ${monitorType}:`, error);
        return false;
    }
}

/**
 * Get help text for monitor type form fields.
 *
 * @param monitorType - Type of monitor
 * @returns Object containing primary and secondary help texts
 */
export async function getMonitorHelpTexts(monitorType: MonitorType): Promise<{
    primary?: string;
    secondary?: string;
}> {
    try {
        const config = await getConfig(monitorType);
        return config?.uiConfig?.helpTexts ?? {};
    } catch (error) {
        console.warn(`Failed to get help texts for ${monitorType}:`, error);
        return {};
    }
}

/**
 * Get analytics label for monitor type.
 *
 * @param monitorType - Type of monitor
 * @returns Analytics label or fallback
 */
export async function getAnalyticsLabel(monitorType: MonitorType): Promise<string> {
    try {
        const config = await getConfig(monitorType);
        return config?.uiConfig?.detailFormats?.analyticsLabel ?? `${monitorType.toUpperCase()} Response Time`;
    } catch (error) {
        console.warn(`Failed to get analytics label for ${monitorType}:`, error);
        return `${monitorType.toUpperCase()} Response Time`;
    }
}

/**
 * Check if monitor type should show URL in display.
 *
 * @param monitorType - Type of monitor
 * @returns Whether to show URL
 */
export async function shouldShowUrl(monitorType: MonitorType): Promise<boolean> {
    try {
        const config = await getConfig(monitorType);
        return config?.uiConfig?.display?.showUrl ?? false;
    } catch (error) {
        console.warn(`Failed to check URL display for ${monitorType}:`, error);
        return false;
    }
}

/**
 * Check if all monitor types in array support response time.
 * Useful for conditional rendering of response time charts.
 *
 * @param monitorTypes - Array of monitor types to check
 * @returns Whether all types support response time
 */
export async function allSupportsResponseTime(monitorTypes: MonitorType[]): Promise<boolean> {
    try {
        const supportChecks = await Promise.all(monitorTypes.map((type) => supportsResponseTime(type)));
        return supportChecks.every(Boolean);
    } catch (error) {
        console.warn("Failed to check response time support for multiple types:", error);
        return false;
    }
}

/**
 * Check if all monitor types in array support advanced analytics.
 * Useful for conditional rendering of advanced analytics components.
 *
 * @param monitorTypes - Array of monitor types to check
 * @returns Whether all types support advanced analytics
 */
export async function allSupportsAdvancedAnalytics(monitorTypes: MonitorType[]): Promise<boolean> {
    try {
        const supportChecks = await Promise.all(monitorTypes.map((type) => supportsAdvancedAnalytics(type)));
        return supportChecks.every(Boolean);
    } catch (error) {
        console.warn("Failed to check advanced analytics support for multiple types:", error);
        return false;
    }
}

/**
 * Get available monitor types that support a specific feature.
 *
 * @param feature - Feature to check for ('responseTime' | 'advancedAnalytics')
 * @returns Array of monitor types that support the feature
 */
export async function getTypesWithFeature(feature: "responseTime" | "advancedAnalytics"): Promise<MonitorType[]> {
    try {
        const allTypes = await getAvailableMonitorTypes();
        const supportedTypes: MonitorType[] = [];

        for (const config of allTypes) {
            const supports =
                feature === "responseTime"
                    ? config.uiConfig?.supportsResponseTime
                    : config.uiConfig?.supportsAdvancedAnalytics;

            if (supports) {
                supportedTypes.push(config.type);
            }
        }

        return supportedTypes;
    } catch (error) {
        console.warn(`Failed to get types with feature ${feature}:`, error);
        return [];
    }
}

/**
 * Clear the configuration cache. Useful for testing or when monitor types change.
 */
export function clearConfigCache(): void {
    configCache = undefined;
}
