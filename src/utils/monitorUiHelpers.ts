/**
 * Dynamic UI utilities that use monitor registry for extensible UI behavior.
 * These utilities eliminate hardcoded monitor type checks throughout the frontend.
 */

import type { MonitorType } from "@shared/types";

import { AppCaches } from "./cache";
import { withUtilityErrorHandling } from "./errorHandling";
import { getAvailableMonitorTypes, getMonitorTypeConfig, type MonitorTypeConfig } from "./monitorTypeHelper";

/**
 * Check if all monitor types in array support advanced analytics.
 * Useful for conditional rendering of advanced analytics components.
 *
 * @param monitorTypes - Array of monitor types to check
 * @returns Whether all types support advanced analytics
 */
export async function allSupportsAdvancedAnalytics(monitorTypes: MonitorType[]): Promise<boolean> {
    return withUtilityErrorHandling(
        async () => {
            const supportChecks = await Promise.all(monitorTypes.map((type) => supportsAdvancedAnalytics(type)));
            return supportChecks.every(Boolean);
        },
        "Check advanced analytics support for multiple types",
        false
    );
}

/**
 * Check if all monitor types in array support response time.
 * Useful for conditional rendering of response time charts.
 *
 * @param monitorTypes - Array of monitor types to check
 * @returns Whether all types support response time
 */
export async function allSupportsResponseTime(monitorTypes: MonitorType[]): Promise<boolean> {
    return withUtilityErrorHandling(
        async () => {
            const supportChecks = await Promise.all(monitorTypes.map((type) => supportsResponseTime(type)));
            return supportChecks.every(Boolean);
        },
        "Check response time support for multiple types",
        false
    );
}

/**
 * Clear the configuration cache. Useful for testing or when monitor types change.
 */
export function clearConfigCache(): void {
    AppCaches.uiHelpers.clear();
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
 * const label = await formatMonitorDetail("http", "200"); // "Response Code: 200"
 * const label = await formatMonitorDetail("port", "80");  // "Port: 80"
 * ```
 */
export async function formatMonitorDetail(monitorType: MonitorType, details: string): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            // Use the IPC method to format on the backend where functions are available
            return window.electronAPI.monitorTypes.formatMonitorDetail(monitorType, details);
        },
        `Format monitor detail for ${monitorType}`,
        details
    );
}

/**
 * Format title suffix dynamically based on monitor type configuration.
 *
 * @param monitorType - Type of monitor
 * @param monitor - Monitor data
 * @returns Formatted title suffix string
 *
 * @example
 * ```typescript
 * const suffix = await formatMonitorTitleSuffix("http", { url: "https://example.com" }); // " (https://example.com)"
 * const suffix = await formatMonitorTitleSuffix("port", { host: "localhost", port: 80 }); // " (localhost:80)"
 * ```
 */
export async function formatMonitorTitleSuffix(
    monitorType: MonitorType,
    monitor: Record<string, unknown>
): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            // Use the IPC method to format on the backend where functions are available
            return window.electronAPI.monitorTypes.formatMonitorTitleSuffix(monitorType, monitor);
        },
        `Format monitor title suffix for ${monitorType}`,
        ""
    );
}

/**
 * Get analytics label for monitor type.
 *
 * @param monitorType - Type of monitor
 * @returns Analytics label or fallback
 */
export async function getAnalyticsLabel(monitorType: MonitorType): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getConfig(monitorType);
            return config?.uiConfig?.detailFormats?.analyticsLabel ?? `${monitorType.toUpperCase()} Response Time`;
        },
        `Get analytics label for ${monitorType}`,
        `${monitorType.toUpperCase()} Response Time`
    );
}

/**
 * Get the default monitor ID from a list of monitor IDs.
 * Returns the first monitor ID or an empty string if none exist.
 *
 * @param monitorIds - Array of monitor IDs
 * @returns Default monitor ID (first in array or empty string)
 */
export function getDefaultMonitorId(monitorIds: string[]): string {
    return monitorIds[0] ?? "";
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
    return withUtilityErrorHandling(
        async () => {
            const config = await getConfig(monitorType);
            return config?.uiConfig?.helpTexts ?? {};
        },
        `Get help texts for ${monitorType}`,
        {}
    );
}

/**
 * Get available monitor types that support a specific feature.
 *
 * @param feature - Feature to check for ('responseTime' | 'advancedAnalytics')
 * @returns Array of monitor types that support the feature
 */
export async function getTypesWithFeature(feature: "advancedAnalytics" | "responseTime"): Promise<MonitorType[]> {
    return withUtilityErrorHandling(
        async () => {
            const allTypes = await getAvailableMonitorTypes();
            const supportedTypes: MonitorType[] = [];

            for (const config of allTypes) {
                const supports =
                    feature === "responseTime"
                        ? config.uiConfig?.supportsResponseTime
                        : config.uiConfig?.supportsAdvancedAnalytics;

                if (supports) {
                    supportedTypes.push(config.type as MonitorType);
                }
            }

            return supportedTypes;
        },
        `Get types with feature ${feature}`,
        []
    );
}

/**
 * Check if monitor type should show URL in display.
 *
 * @param monitorType - Type of monitor
 * @returns Whether to show URL
 */
export async function shouldShowUrl(monitorType: MonitorType): Promise<boolean> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getConfig(monitorType);
            return config?.uiConfig?.display?.showUrl ?? false;
        },
        `Check URL display for ${monitorType}`,
        false
    );
}

/**
 * Check if monitor type supports advanced analytics.
 *
 * @param monitorType - Type of monitor
 * @returns Whether monitor supports advanced analytics
 */
export async function supportsAdvancedAnalytics(monitorType: MonitorType): Promise<boolean> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getConfig(monitorType);
            return config?.uiConfig?.supportsAdvancedAnalytics ?? false;
        },
        `Check advanced analytics support for ${monitorType}`,
        false
    );
}

/**
 * Check if monitor type supports response time analytics.
 *
 * @param monitorType - Type of monitor
 * @returns Whether monitor supports response time analytics
 */
export async function supportsResponseTime(monitorType: MonitorType): Promise<boolean> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getConfig(monitorType);
            return config?.uiConfig?.supportsResponseTime ?? false;
        },
        `Check response time support for ${monitorType}`,
        false
    );
}

/**
 * Get monitor type configuration with caching
 */
async function getConfig(monitorType: MonitorType): Promise<MonitorTypeConfig | undefined> {
    const cacheKey = `config-${monitorType}`;

    // Try to get from cache first
    const cached = AppCaches.uiHelpers.get(cacheKey) as MonitorTypeConfig | undefined;
    if (cached) {
        return cached;
    }

    // Get from backend and cache
    const config = await getMonitorTypeConfig(monitorType);
    if (config) {
        AppCaches.uiHelpers.set(cacheKey, config);
    }

    return config;
}
