/**
 * Frontend helper utilities for monitor types.
 * Provides access to monitor type definitions through the IPC bridge.
 */

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { CacheKeys } from "../../shared/utils/cacheKeys";
// eslint-disable-next-line import-x/no-unassigned-import -- Side-effect import for global type declarations that must be loaded at module level
import "../types"; // Import global type declarations
import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { AppCaches } from "./cache";
import { withUtilityErrorHandling } from "./errorHandling";

/**
 * Frontend representation of monitor type configuration.
 */
// MonitorTypeConfig moved to shared/types/monitorTypes to avoid circular imports

/**
 * Clear the monitor type cache.
 *
 * @remarks
 * Useful for forcing a refresh of monitor type data when types have been
 * updated or when testing requires fresh data. This clears all cached
 * monitor type configurations, forcing the next request to fetch from backend.
 */
export function clearMonitorTypeCache(): void {
    AppCaches.monitorTypes.clear();
}

/**
 * Get all available monitor types from backend via IPC.
 *
 * @returns Promise resolving to array of monitor type configurations
 *
 * @remarks
 * Results are cached for performance using the AppCaches.monitorTypes cache.
 * The cache key "all-monitor-types" is used to store the complete list.
 * Cache can be cleared using clearMonitorTypeCache() to force refresh.
 * Falls back to empty array on error to prevent UI breakage.
 */
export async function getAvailableMonitorTypes(): Promise<MonitorTypeConfig[]> {
    const cacheKey = CacheKeys.config.byName("all-monitor-types");

    // Try cache first
    const cached = AppCaches.monitorTypes.get(cacheKey) as
        | MonitorTypeConfig[]
        | undefined;
    if (cached) {
        return cached;
    }

    // Fetch from store instead of direct IPC call
    const types = await withUtilityErrorHandling(
        async () => {
            const store = useMonitorTypesStore.getState();

            // Ensure types are loaded
            if (!store.isLoaded) {
                await store.loadMonitorTypes();
            }

            return useMonitorTypesStore.getState().monitorTypes;
        },
        "Fetch monitor types from backend",
        [] as MonitorTypeConfig[]
    );

    AppCaches.monitorTypes.set(cacheKey, types);
    return types;
}

/**
 * Get configuration for a specific monitor type.
 *
 * @param type - The monitor type identifier to look up
 * @returns Promise resolving to monitor type configuration, or undefined if type is not found
 *
 * @remarks
 * Searches through all available monitor types to find a match for the specified type.
 * Returns undefined if the monitor type is not registered or available from the backend.
 * The search uses the complete cached list from getAvailableMonitorTypes().
 */
export async function getMonitorTypeConfig(
    type: string
): Promise<MonitorTypeConfig | undefined> {
    const configs = await getAvailableMonitorTypes();
    return configs.find((config) => config.type === type);
}

/**
 * Get form options for monitor type selector.
 *
 * @returns Promise resolving to array of option objects for form selectors
 *
 * @remarks
 * Returns an array of objects with the shape `\{ label: string, value: string \}`
 * where label is the human-readable display name and value is the monitor type identifier.
 * This format is suitable for use with form select components and dropdown menus.
 * The options are derived from all available monitor types from the backend.
 */
export async function getMonitorTypeOptions(): Promise<
    Array<{ label: string; value: string }>
> {
    const configs = await getAvailableMonitorTypes();
    return configs.map((config) => ({
        label: config.displayName,
        value: config.type,
    }));
}
