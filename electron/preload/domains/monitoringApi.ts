/**
 * Monitoring Domain API - Auto-generated preload bridge for monitoring
 * operations
 *
 * @remarks
 * This module provides type-safe IPC communication for all monitoring-related
 * operations. All methods are automatically generated from backend IPC channel
 * definitions. As a thin wrapper over the bridge factory, exceptions are
 * intentionally propagated to the frontend for handling at the UI level.
 *
 * @packageDocumentation
 */

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import { createTypedInvoker, createVoidInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the monitoring domain API operations
 */
export interface MonitoringApiInterface {
    /**
     * Formats monitor detail information for display
     *
     * @param monitorData - Monitor data to format
     *
     * @returns Promise resolving to formatted detail string
     */
    formatMonitorDetail: (...args: unknown[]) => Promise<string>;

    /**
     * Formats monitor title suffix for display
     *
     * @param monitorData - Monitor data to format
     *
     * @returns Promise resolving to formatted title suffix
     */
    formatMonitorTitleSuffix: (...args: unknown[]) => Promise<string>;

    /**
     * Removes a monitor from a site
     *
     * @param siteId - ID of the site
     * @param monitorId - ID of the monitor to remove
     *
     * @returns Promise that resolves when monitor is removed
     */
    removeMonitor: (...args: unknown[]) => Promise<void>;

    /**
     * Starts the global monitoring system
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoring: (...args: unknown[]) => Promise<boolean>;

    /**
     * Starts monitoring for a specific site or monitor
     *
     * @param siteId - The site identifier
     * @param monitorId - Optional monitor identifier
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForSite: (...args: unknown[]) => Promise<boolean>;

    /**
     * Stops the global monitoring system
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoring: (...args: unknown[]) => Promise<boolean>;

    /**
     * Stops monitoring for a specific site or monitor
     *
     * @param siteId - The site identifier
     * @param monitorId - Optional monitor identifier
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForSite: (...args: unknown[]) => Promise<boolean>;

    /**
     * Validates monitor configuration data
     *
     * @param monitorType - Type of monitor to validate
     * @param monitorData - Monitor configuration data
     *
     * @returns Promise resolving to validation result
     */
    validateMonitorData: (...args: unknown[]) => Promise<unknown>;
}

/**
 * Monitoring domain API providing all monitoring control operations
 */
export const monitoringApi: MonitoringApiInterface = {
    /**
     * Formats monitor detail information for display
     *
     * @param monitorData - Monitor data to format
     *
     * @returns Promise resolving to formatted detail string
     */
    formatMonitorDetail: createTypedInvoker<string>(
        "format-monitor-detail"
    ) satisfies (...args: unknown[]) => Promise<string>,

    /**
     * Formats monitor title suffix for display
     *
     * @param monitorData - Monitor data to format
     *
     * @returns Promise resolving to formatted title suffix
     */
    formatMonitorTitleSuffix: createTypedInvoker<string>(
        "format-monitor-title-suffix"
    ) satisfies (...args: unknown[]) => Promise<string>,

    /**
     * Removes a monitor from a site
     *
     * @param siteId - ID of the site
     * @param monitorId - ID of the monitor to remove
     *
     * @returns Promise that resolves when monitor is removed
     */
    removeMonitor: createVoidInvoker("remove-monitor") satisfies (
        ...args: unknown[]
    ) => Promise<void>,

    /**
     * Starts the global monitoring system
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoring: createTypedInvoker<boolean>("start-monitoring") satisfies (
        ...args: unknown[]
    ) => Promise<boolean>,

    /**
     * Starts monitoring for a specific site or monitor
     *
     * @param siteId - The site identifier
     * @param monitorId - Optional monitor identifier
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForSite: createTypedInvoker<boolean>(
        "start-monitoring-for-site"
    ) satisfies (...args: unknown[]) => Promise<boolean>,

    /**
     * Stops the global monitoring system
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoring: createTypedInvoker<boolean>("stop-monitoring") satisfies (
        ...args: unknown[]
    ) => Promise<boolean>,

    /**
     * Stops monitoring for a specific site or monitor
     *
     * @param siteId - The site identifier
     * @param monitorId - Optional monitor identifier
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForSite: createTypedInvoker<boolean>(
        "stop-monitoring-for-site"
    ) satisfies (...args: unknown[]) => Promise<boolean>,

    /**
     * Validates monitor configuration data
     *
     * @param monitorType - Type of monitor to validate
     * @param monitorData - Monitor configuration data
     *
     * @returns Promise resolving to validation result
     */
    validateMonitorData: createTypedInvoker<unknown>(
        "validate-monitor-data"
    ) satisfies (...args: unknown[]) => Promise<unknown>,
} as const;

export type MonitoringApi = MonitoringApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
