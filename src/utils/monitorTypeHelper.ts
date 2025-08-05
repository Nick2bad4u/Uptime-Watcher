/**
 * Frontend helper utilities for monitor types.
 * Provides access to monitor type definitions through the IPC bridge.
 */

import type { MonitorFieldDefinition } from "@shared/types";

import "../types"; // Import global type declarations
import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { AppCaches } from "./cache";
import { withUtilityErrorHandling } from "./errorHandling";

/**
 * Frontend representation of monitor type configuration.
 */
export interface MonitorTypeConfig {
    /** Description of what this monitor checks */
    description: string;
    /** Human-readable display name */
    displayName: string;
    /** Field definitions for dynamic form generation */
    fields: MonitorFieldDefinition[];
    /** Unique identifier for the monitor type */
    type: string;
    /** UI display configuration */
    uiConfig?: {
        /** Detail label formatter for different contexts */
        detailFormats?: {
            /** Format for analytics display */
            analyticsLabel?: string;
            // Note: Functions are excluded as they can't be serialized over IPC
        };
        /** Display preferences */
        display?: {
            showAdvancedMetrics?: boolean;
            showUrl?: boolean;
        };
        /** Help text for form fields */
        helpTexts?: {
            primary?: string;
            secondary?: string;
        };
        /** Whether this monitor type supports advanced analytics */
        supportsAdvancedAnalytics?: boolean;
        /** Whether this monitor type supports response time analytics */
        supportsResponseTime?: boolean;
    };
    /** Version of the monitor implementation */
    version: string;
}

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
    const cacheKey = "all-monitor-types";

    // Try cache first
    const cached = AppCaches.monitorTypes.get(cacheKey) as MonitorTypeConfig[] | undefined;
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
        []
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
export async function getMonitorTypeConfig(type: string): Promise<MonitorTypeConfig | undefined> {
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
export async function getMonitorTypeOptions(): Promise<{ label: string; value: string }[]> {
    const configs = await getAvailableMonitorTypes();
    return configs.map((config) => ({
        label: config.displayName,
        value: config.type,
    }));
}
