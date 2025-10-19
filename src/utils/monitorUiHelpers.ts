/**
 * Dynamic UI utilities that use monitor registry for extensible UI behavior.
 *
 * @remarks
 * These utilities eliminate hardcoded monitor type checks throughout the
 * frontend by providing dynamic configuration-based helpers for UI behavior.
 * All utilities support caching for optimal performance and include error
 * handling.
 *
 * @example
 *
 * ```typescript
 * // Check if a monitor type supports response time
 * const hasResponseTime = await supportsResponseTime("http");
 *
 * // Get the default monitor ID from a list
 * const defaultId = getDefaultMonitorId(["monitor-1", "monitor-2"]);
 * ```
 *
 * @public
 */

import type { Monitor, MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import { isMonitorTypeConfig } from "@shared/types/monitorTypes";

import { CacheKeys } from "@shared/utils/cacheKeys";
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import { validateMonitorType } from "@shared/utils/validation";

import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { AppCaches } from "./cache";
import {
    getAvailableMonitorTypes,
    getMonitorTypeConfig,
} from "./monitorTypeHelper";

/**
 * Help text configuration for monitor types.
 *
 * @remarks
 * Defines the structure for contextual help text displayed to users when
 * configuring monitors.
 *
 * @public
 */
export interface MonitorHelpTexts {
    /**
     * Primary help text shown prominently.
     *
     * @remarks
     * Main instructional text that appears first and provides essential
     * guidance for configuring the monitor type. Should be concise and focused
     * on the most important configuration details.
     */
    primary?: string;

    /**
     * Secondary help text with additional details.
     *
     * @remarks
     * Supplementary help text that provides more detailed information,
     * examples, or advanced configuration tips. Typically shown after or below
     * the primary help text.
     */
    secondary?: string;
}

/**
 * Retrieves monitor type configuration with automatic caching.
 *
 * @remarks
 * Checks the cache before performing a backend lookup and stores successful
 * results back into the cache.
 *
 * @param monitorType - The monitor type to get configuration for.
 * @param signal - Optional `AbortSignal` for cancellation.
 *
 * @returns Promise resolving to the monitor type configuration or `undefined`
 *   when not found.
 *
 * @internal
 */
async function getConfig(
    monitorType: MonitorType,
    signal?: AbortSignal
): Promise<MonitorTypeConfig | undefined> {
    if (signal?.aborted) {
        throw new Error("Operation aborted");
    }

    const cacheKey = CacheKeys.config.byName(`monitor-config-${monitorType}`);

    // Try to get from cache first
    const cached = AppCaches.uiHelpers.get(cacheKey);
    if (cached && isMonitorTypeConfig(cached)) {
        return cached;
    }

    // Check abort signal again before backend call
    if (signal?.aborted) {
        throw new Error("Operation aborted");
    }

    // Get from backend and cache
    const config = await getMonitorTypeConfig(monitorType);
    if (config) {
        AppCaches.uiHelpers.set(cacheKey, config);
    }

    return config;
}

/**
 * Clears the configuration cache.
 *
 * @remarks
 * Removes all cached monitor type configurations. Useful for tests or when
 * monitor types change and require cache invalidation.
 *
 * @public
 */
export function clearConfigCache(): void {
    AppCaches.uiHelpers.clear();
}

/**
 * Get the default monitor ID from a list of monitor IDs.
 *
 * @remarks
 * Returns the first element of the array if it exists; otherwise, an empty
 * string.
 *
 * @param monitorIds - Array of monitor IDs.
 *
 * @returns First monitor identifier in the list or an empty string when the
 *   collection is empty.
 *
 * @public
 */
export function getDefaultMonitorId(monitorIds: readonly string[]): string {
    return monitorIds[0] ?? "";
}

/**
 * Check if monitor type supports advanced analytics.
 *
 * @param monitorType - Type of monitor.
 *
 * @returns `true` when the monitor supports advanced analytics; otherwise
 *   `false`.
 *
 * @public
 */
export async function supportsAdvancedAnalytics(
    monitorType: MonitorType
): Promise<boolean> {
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
 * @param monitorType - Type of monitor.
 *
 * @returns `true` when the monitor provides response time analytics.
 *
 * @public
 */
export async function supportsResponseTime(
    monitorType: MonitorType
): Promise<boolean> {
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
 * Check if all monitor types in array support advanced analytics.
 *
 * @param monitorTypes - Array of monitor types to check.
 *
 * @returns `true` when every monitor type in the provided array supports
 *   advanced analytics.
 *
 * @public
 */
export async function allSupportsAdvancedAnalytics(
    monitorTypes: MonitorType[]
): Promise<boolean> {
    return withUtilityErrorHandling(
        async () => {
            const supportChecks = await Promise.all(
                monitorTypes.map((type) => supportsAdvancedAnalytics(type))
            );
            return supportChecks.every(Boolean);
        },
        "Check advanced analytics support for multiple types",
        false
    );
}

/**
 * Check if all monitor types in array support response time.
 *
 * @param monitorTypes - Array of monitor types to check.
 *
 * @returns `true` when every monitor type in the list supports response time
 *   analytics.
 *
 * @public
 */
export async function allSupportsResponseTime(
    monitorTypes: MonitorType[]
): Promise<boolean> {
    return withUtilityErrorHandling(
        async () => {
            const supportChecks = await Promise.all(
                monitorTypes.map((type) => supportsResponseTime(type))
            );
            return supportChecks.every(Boolean);
        },
        "Check response time support for multiple types",
        false
    );
}

/**
 * Format detail label dynamically based on monitor type configuration.
 *
 * @example
 *
 * ```typescript
 * const label = await formatMonitorDetail("http", "200"); // "Response Code: 200"
 * const label = await formatMonitorDetail("port", "80"); // "Port: 80"
 * ```
 *
 * @param monitorType - Type of monitor.
 * @param details - Detail value to format.
 *
 * @returns Formatted detail string supplied by the monitor registry.
 *
 * @public
 */
export async function formatMonitorDetail(
    monitorType: MonitorType,
    details: string
): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            // Use store method instead of direct IPC call
            const store = useMonitorTypesStore.getState();

            return store.formatMonitorDetail(monitorType, details);
        },
        `Format monitor detail for ${monitorType}`,
        details
    );
}

/**
 * Format title suffix dynamically based on monitor type configuration.
 *
 * @example
 *
 * ```typescript
 * const suffix = await formatMonitorTitleSuffix("http", {
 *     url: "https://example.com",
 * }); // " (https://example.com)"
 * const suffix = await formatMonitorTitleSuffix("port", {
 *     host: "localhost",
 *     port: 80,
 * }); // " (localhost:80)"
 * ```
 *
 * @param monitorType - Type of monitor.
 * @param monitor - Monitor data.
 *
 * @returns Title suffix string suitable for rendering in the UI.
 *
 * @public
 */
export async function formatMonitorTitleSuffix(
    monitorType: MonitorType,
    monitor: Monitor
): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            // Use store method instead of direct IPC call
            const store = useMonitorTypesStore.getState();

            return store.formatMonitorTitleSuffix(monitorType, monitor);
        },
        `Format monitor title suffix for ${monitorType}`,
        ""
    );
}

/**
 * Get analytics label for monitor type.
 *
 * @param monitorType - Type of monitor.
 *
 * @returns Analytics label from configuration or a fallback string.
 *
 * @public
 */
export async function getAnalyticsLabel(
    monitorType: MonitorType
): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getConfig(monitorType);
            return (
                config?.uiConfig?.detailFormats?.analyticsLabel ??
                `${monitorType.toUpperCase()} Response Time`
            );
        },
        `Get analytics label for ${monitorType}`,
        `${monitorType.toUpperCase()} Response Time`
    );
}

/**
 * Get help text for monitor type form fields.
 *
 * @param monitorType - Type of monitor.
 * @param signal - Optional `AbortSignal` for cancellation.
 *
 * @returns Object containing primary and secondary help texts.
 *
 * @public
 */
export async function getMonitorHelpTexts(
    monitorType: MonitorType,
    signal?: AbortSignal
): Promise<MonitorHelpTexts> {
    return withUtilityErrorHandling(
        async () => {
            if (signal?.aborted) {
                throw new Error("Operation aborted");
            }

            const config = await getConfig(monitorType, signal);
            return config?.uiConfig?.helpTexts ?? {};
        },
        `Get help texts for ${monitorType}`,
        {}
    );
}

/**
 * Get available monitor types that support a specific feature.
 *
 * @param feature - Feature to check for (`"responseTime"` or
 *   `"advancedAnalytics"`).
 *
 * @returns Array of monitor types that support the requested feature.
 *
 * @public
 */
export async function getTypesWithFeature(
    feature: "advancedAnalytics" | "responseTime"
): Promise<MonitorType[]> {
    return withUtilityErrorHandling(
        async () => {
            const allTypes = await getAvailableMonitorTypes();
            const supportedTypes: MonitorType[] = [];

            for (const config of allTypes) {
                const supports =
                    feature === "responseTime"
                        ? config.uiConfig?.supportsResponseTime
                        : config.uiConfig?.supportsAdvancedAnalytics;

                if (supports && validateMonitorType(config.type)) {
                    supportedTypes.push(config.type);
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
 * @param monitorType - Type of monitor.
 *
 * @returns `true` when URLs should appear in UI for the given monitor type.
 *
 * @public
 */
export async function shouldShowUrl(
    monitorType: MonitorType
): Promise<boolean> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getConfig(monitorType);
            return config?.uiConfig?.display?.showUrl ?? false;
        },
        `Check URL display for ${monitorType}`,
        false
    );
}
