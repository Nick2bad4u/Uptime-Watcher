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

import type { MonitoringDomainBridge } from "@shared/types/preload";

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the monitoring domain API operations.
 *
 * @public
 */
export interface MonitoringApiInterface extends MonitoringDomainBridge {
    /**
     * Performs an immediate check for a specific monitor
     *
     * @param siteIdentifier - Identifier of the site containing the monitor
     * @param monitorId - ID of the monitor to check
     *
     * @returns Promise resolving to the latest {@link StatusUpdate} or undefined
     *   when no update is available
     */
    checkSiteNow: MonitoringDomainBridge["checkSiteNow"];

    /**
     * Formats monitor detail information for display
     *
     * @param monitorData - Monitor data to format
     *
     * @returns Promise resolving to formatted detail string
     */
    formatMonitorDetail: MonitoringDomainBridge["formatMonitorDetail"];

    /**
     * Formats monitor title suffix for display
     *
     * @param monitorData - Monitor data to format
     *
     * @returns Promise resolving to formatted title suffix
     */
    formatMonitorTitleSuffix: MonitoringDomainBridge["formatMonitorTitleSuffix"];

    /**
     * Starts the global monitoring system
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoring: MonitoringDomainBridge["startMonitoring"];

    /**
     * Starts monitoring for a specific site or monitor
     *
     * @param siteIdentifier - The site identifier
     * @param monitorId - Optional monitor identifier
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForSite: MonitoringDomainBridge["startMonitoringForSite"];

    /**
     * Stops the global monitoring system
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoring: MonitoringDomainBridge["stopMonitoring"];

    /**
     * Stops monitoring for a specific site or monitor
     *
     * @param siteIdentifier - The site identifier
     * @param monitorId - Optional monitor identifier
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForSite: MonitoringDomainBridge["stopMonitoringForSite"];

    /**
     * Validates monitor configuration data
     *
     * @param monitorType - Type of monitor to validate
     * @param monitorData - Monitor configuration data
     *
     * @returns Promise resolving to validation result
     */
    validateMonitorData: MonitoringDomainBridge["validateMonitorData"];
}

/**
 * Monitoring domain API providing all monitoring control operations.
 *
 * @public
 */
export const monitoringApi: MonitoringApiInterface = {
    /**
     * Performs an immediate check for a specific monitor
     */
    checkSiteNow: createTypedInvoker("check-site-now"),

    /**
     * Formats monitor detail information for display
     *
     * @param monitorData - Monitor data to format
     *
     * @returns Promise resolving to formatted detail string
     */
    formatMonitorDetail: createTypedInvoker("format-monitor-detail"),

    /**
     * Formats monitor title suffix for display
     *
     * @param monitorData - Monitor data to format
     *
     * @returns Promise resolving to formatted title suffix
     */
    formatMonitorTitleSuffix: createTypedInvoker("format-monitor-title-suffix"),

    /**
     * Starts the global monitoring system
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoring: createTypedInvoker("start-monitoring"),

    /**
     * Starts monitoring for a specific site or monitor
     *
     * @param siteIdentifier - The site identifier
     * @param monitorId - Optional monitor identifier
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForSite: createTypedInvoker("start-monitoring-for-site"),

    /**
     * Stops the global monitoring system
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoring: createTypedInvoker("stop-monitoring"),

    /**
     * Stops monitoring for a specific site or monitor
     *
     * @param siteIdentifier - The site identifier
     * @param monitorId - Optional monitor identifier
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForSite: createTypedInvoker("stop-monitoring-for-site"),

    /**
     * Validates monitor configuration data
     *
     * @param monitorType - Type of monitor to validate
     * @param monitorData - Monitor configuration data
     *
     * @returns Promise resolving to validation result
     */
    validateMonitorData: createTypedInvoker("validate-monitor-data"),
} as const;

/**
 * Type alias for the monitoring domain preload bridge.
 *
 * @public
 */
export type MonitoringApi = MonitoringApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
