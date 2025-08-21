/**
 * Frontend helper utilities for monitor types. Provides access to monitor type
 * definitions through the IPC bridge.
 */

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { CacheKeys } from "@shared/utils/cacheKeys";

// eslint-disable-next-line import-x/no-unassigned-import -- Side-effect import for global type declarations that must be loaded at module level
import "../types"; // Import global type declarations
import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { AppCaches } from "./cache";
import { withUtilityErrorHandling } from "./errorHandling";

/**
 * Frontend representation of monitor type configuration.
 */
// MonitorTypeConfig moved to shared/types/monitorTypes to avoid circular
// imports

/**
 * Option object for monitor type selectors
 *
 * @remarks
 * This interface defines the structure used for form select components and
 * dropdowns that allow users to choose monitor types. The label provides a
 * human-readable display name while the value contains the monitor type
 * identifier used internally.
 */
export interface MonitorTypeOption {
    /**
     * Display name for the monitor type.
     *
     * @remarks
     * Human-readable text that is shown to users in select dropdowns and form
     * controls. This should be descriptive and user-friendly.
     */
    label: string;

    /**
     * Unique identifier for the monitor type.
     *
     * @remarks
     * Internal monitor type key used for form submission and backend
     * processing. This value corresponds to the MonitorType enum values.
     */
    value: string;
}

/**
 * Clear the monitor type cache.
 *
 * @remarks
 * Useful for forcing a refresh of monitor type data when types have been
 * updated or when testing requires fresh data. This clears all cached monitor
 * type configurations, forcing the next request to fetch from backend.
 */
export function clearMonitorTypeCache(): void {
    AppCaches.monitorTypes.clear();
}

/**
 * Get all available monitor types from backend via IPC.
 *
 * @remarks
 * Results are cached for performance using the AppCaches.monitorTypes cache.
 * The cache key "all-monitor-types" is used to store the complete list. Cache
 * can be cleared using clearMonitorTypeCache() to force refresh. Falls back to
 * empty array on error to prevent UI breakage.
 *
 * @returns Promise resolving to array of monitor type configurations
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
 * @remarks
 * Searches through all available monitor types to find a match for the
 * specified type. Returns undefined if the monitor type is not registered or
 * available from the backend. The search uses the complete cached list from
 * getAvailableMonitorTypes().
 *
 * @param type - The monitor type identifier to look up
 *
 * @returns Promise resolving to monitor type configuration, or undefined if
 *   type is not found
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
 * @remarks
 * Returns an array of objects with the shape: `{ label: string, value: string}`
 * where label is the human-readable display name and value is the monitor type
 * identifier. This format is suitable for use with form select components and
 * dropdown menus. The options are derived from all available monitor types from
 * the backend.
 *
 * @returns Promise resolving to array of option objects for form selectors
 */
export async function getMonitorTypeOptions(): Promise<MonitorTypeOption[]> {
    const configs = await getAvailableMonitorTypes();
    return configs.map((config) => ({
        label: config.displayName,
        value: config.type,
    }));
}
