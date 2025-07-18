/**
 * Frontend helper utilities for monitor types.
 * Provides access to monitor type definitions through the IPC bridge.
 */

import type { MonitorFieldDefinition } from "../../shared/types";

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

// Cache for monitor type configurations from backend
let monitorTypeCache: MonitorTypeConfig[] | undefined;

/**
 * Clear the monitor type cache.
 * Useful for forcing a refresh of monitor type data.
 */
export function clearMonitorTypeCache(): void {
    monitorTypeCache = undefined;
}

/**
 * Get all available monitor types from backend via IPC.
 * Results are cached for performance.
 */
export async function getAvailableMonitorTypes(): Promise<MonitorTypeConfig[]> {
    monitorTypeCache ??= await withUtilityErrorHandling(
        async () => {
            return window.electronAPI.monitorTypes.getMonitorTypes();
        },
        "Fetch monitor types from backend",
        []
    );
    return monitorTypeCache;
}

/**
 * Get configuration for a specific monitor type.
 */
export async function getMonitorTypeConfig(type: string): Promise<MonitorTypeConfig | undefined> {
    const configs = await getAvailableMonitorTypes();
    return configs.find((config) => config.type === type);
}

/**
 * Get form options for monitor type selector.
 */
export async function getMonitorTypeOptions(): Promise<{ label: string; value: string }[]> {
    const configs = await getAvailableMonitorTypes();
    return configs.map((config) => ({
        label: config.displayName,
        value: config.type,
    }));
}
