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

import type { MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { Promisable } from "type-fest";

import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import { isAbortError } from "@shared/utils/abortUtils";
import { CacheKeys } from "@shared/utils/cacheKeys";
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import { arrayFirst } from "ts-extras";

import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { AppCaches } from "./cache";
import { getMonitorTypeConfig } from "./monitorTypeHelper";

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
    return runMonitorUiOperation(
        `Format monitor detail for ${monitorType}`,
        details,
        async () => {
            const store = useMonitorTypesStore.getState();
            return store.formatMonitorDetail(monitorType, details);
        }
    );
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
    return arrayFirst(monitorIds) ?? "";
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
    return readMonitorUiConfigValue(
        monitorType,
        `Get help texts for ${monitorType}`,
        {},
        (config) => config?.uiConfig?.helpTexts ?? {},
        signal
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
    return readMonitorUiConfigValue(
        monitorType,
        `Check response time support for ${monitorType}`,
        false,
        (config) => config?.uiConfig?.supportsResponseTime ?? false
    );
}

/**
 * Retrieves monitor type configuration with automatic caching.
 *
 * @remarks
 * Checks the cache before performing a backend lookup and stores successful
 * results back into the cache for subsequent lookups.
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
        return undefined;
    }

    const buildMonitorConfigCacheKey = (monitorTypeName: MonitorType): string =>
        CacheKeys.config.byName(`monitor-config-${monitorTypeName}`);

    const cacheKey = buildMonitorConfigCacheKey(monitorType);

    // Try to get from cache first
    const cached = AppCaches.uiHelpers.get(cacheKey);
    if (cached && isMonitorTypeConfig(cached)) {
        return cached;
    }

    // Check abort signal again before backend call
    if (signal?.aborted) {
        return undefined;
    }

    // Get from backend and cache
    const config = await getMonitorTypeConfig(monitorType);
    if (config) {
        AppCaches.uiHelpers.set(cacheKey, config);
    }

    return config;
}

/**
 * Reads a derived value from a monitor type configuration with shared guards.
 *
 * @typeParam T - Result type returned by the selector.
 *
 * @param monitorType - Monitor type whose configuration is required.
 * @param description - Context string used for logging and error messaging.
 * @param fallback - Value returned when extraction fails.
 * @param selector - Selector applied to the configuration object.
 * @param signal - Optional abort signal for cancellation.
 *
 * @returns Result produced by the selector or the fallback value on failure.
 */
async function readMonitorUiConfigValue<T>(
    monitorType: MonitorType,
    description: string,
    fallback: T,
    selector: (config: MonitorTypeConfig | undefined) => Promisable<T>,
    signal?: AbortSignal
): Promise<T> {
    // If the caller already cancelled, return the fallback immediately.
    // This avoids logging aborted work as an error.
    if (signal?.aborted) {
        return fallback;
    }

    return runMonitorUiOperation(description, fallback, async () => {
        try {
            const config = await getConfig(monitorType, signal);
            return await selector(config);
        } catch (error: unknown) {
            if (signal?.aborted === true || isAbortError(error)) {
                return fallback;
            }

            throw error;
        }
    });
}

/**
 * Executes a monitor UI helper operation with standardized error handling.
 *
 * @typeParam T - Result type returned by the operation.
 *
 * @param description - Context string used for logging and error messaging.
 * @param fallback - Value returned when the operation fails.
 * @param operation - Callback encapsulating the operation logic.
 *
 * @returns Result of the operation or the fallback value on failure.
 */
async function runMonitorUiOperation<T>(
    description: string,
    fallback: T,
    operation: () => Promise<T>
): Promise<T> {
    return withUtilityErrorHandling(operation, description, fallback);
}
