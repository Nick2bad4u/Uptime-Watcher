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

import {
    MONITORING_CHANNELS,
    type MonitoringDomainBridge,
} from "@shared/types/preload";

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
     * @returns Promise resolving to the latest {@link StatusUpdate} or undefined
     *   when no update is available
     */
    checkSiteNow: MonitoringDomainBridge["checkSiteNow"];

    /**
     * Starts the global monitoring system
     *
     * @returns Promise resolving to the lifecycle summary returned by the
     *   backend.
     */
    startMonitoring: MonitoringDomainBridge["startMonitoring"];

    /**
     * Starts monitoring for a specific monitor within a site
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForMonitor: MonitoringDomainBridge["startMonitoringForMonitor"];

    /**
     * Starts monitoring for all monitors belonging to a specific site
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForSite: MonitoringDomainBridge["startMonitoringForSite"];

    /**
     * Stops the global monitoring system
     *
     * @returns Promise resolving to the lifecycle summary returned by the
     *   backend.
     */
    stopMonitoring: MonitoringDomainBridge["stopMonitoring"];

    /**
     * Stops monitoring for a specific monitor within a site
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForMonitor: MonitoringDomainBridge["stopMonitoringForMonitor"];

    /**
     * Stops monitoring for all monitors belonging to a specific site
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForSite: MonitoringDomainBridge["stopMonitoringForSite"];
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
    checkSiteNow: createTypedInvoker(MONITORING_CHANNELS.checkSiteNow),

    /**
     * Starts the global monitoring system
     *
     * @returns Promise resolving to the lifecycle summary emitted by the
     *   backend.
     */
    startMonitoring: createTypedInvoker(MONITORING_CHANNELS.startMonitoring),

    /**
     * Starts monitoring for a specific monitor within a site
     *
     * @param siteIdentifier - The site identifier
     * @param monitorId - The monitor identifier to start
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForMonitor: createTypedInvoker(
        MONITORING_CHANNELS.startMonitoringForMonitor
    ),

    /**
     * Starts monitoring for all monitors belonging to a specific site
     *
     * @param siteIdentifier - The site identifier
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForSite: createTypedInvoker(
        MONITORING_CHANNELS.startMonitoringForSite
    ),

    /**
     * Stops the global monitoring system
     *
     * @returns Promise resolving to the lifecycle summary emitted by the
     *   backend.
     */
    stopMonitoring: createTypedInvoker(MONITORING_CHANNELS.stopMonitoring),

    /**
     * Stops monitoring for a specific monitor within a site
     *
     * @param siteIdentifier - The site identifier
     * @param monitorId - The monitor identifier to stop
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForMonitor: createTypedInvoker(
        MONITORING_CHANNELS.stopMonitoringForMonitor
    ),

    /**
     * Stops monitoring for all monitors belonging to a specific site
     *
     * @param siteIdentifier - The site identifier
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForSite: createTypedInvoker(
        MONITORING_CHANNELS.stopMonitoringForSite
    ),
} as const;

/**
 * Type alias for the monitoring domain preload bridge.
 *
 * @public
 */
export type MonitoringApi = MonitoringApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
