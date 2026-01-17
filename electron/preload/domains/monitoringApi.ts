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



import type { StatusUpdate } from "@shared/types";

import {
    MONITORING_CHANNELS,
    type MonitoringDomainBridge,
} from "@shared/types/preload";
import { validateStatusUpdate } from "@shared/validation/guards";

import {
    createSafeParseAdapter,
    createTypedInvoker,
    createValidatedInvoker,
    safeParseBooleanResult,
    type SafeParseLike,
} from "../core/bridgeFactory";

const safeParseStatusUpdate = createSafeParseAdapter(validateStatusUpdate);

function safeParseOptionalStatusUpdate(
    candidate: unknown
): SafeParseLike<StatusUpdate | undefined> {
    if (candidate === undefined) {
        return { data: undefined, success: true };
    }

    const parsed = safeParseStatusUpdate(candidate);

    if (!("error" in parsed)) {
        return { data: parsed.data, success: true };
    }

    return { error: parsed.error, success: false };
}

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
    checkSiteNow: createValidatedInvoker(
        MONITORING_CHANNELS.checkSiteNow,
        safeParseOptionalStatusUpdate,
        {
            domain: "monitoringApi",
            guardName: "safeParseOptionalStatusUpdate",
        }
    ),

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
    startMonitoringForMonitor: createValidatedInvoker(
        MONITORING_CHANNELS.startMonitoringForMonitor,
        safeParseBooleanResult,
        {
            domain: "monitoringApi",
            guardName: "safeParseBooleanResult",
        }
    ),

    /**
     * Starts monitoring for all monitors belonging to a specific site
     *
     * @param siteIdentifier - The site identifier
     *
     * @returns Promise resolving to true if monitoring started successfully
     */
    startMonitoringForSite: createValidatedInvoker(
        MONITORING_CHANNELS.startMonitoringForSite,
        safeParseBooleanResult,
        {
            domain: "monitoringApi",
            guardName: "safeParseBooleanResult",
        }
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
    stopMonitoringForMonitor: createValidatedInvoker(
        MONITORING_CHANNELS.stopMonitoringForMonitor,
        safeParseBooleanResult,
        {
            domain: "monitoringApi",
            guardName: "safeParseBooleanResult",
        }
    ),

    /**
     * Stops monitoring for all monitors belonging to a specific site
     *
     * @param siteIdentifier - The site identifier
     *
     * @returns Promise resolving to true if monitoring stopped successfully
     */
    stopMonitoringForSite: createValidatedInvoker(
        MONITORING_CHANNELS.stopMonitoringForSite,
        safeParseBooleanResult,
        {
            domain: "monitoringApi",
            guardName: "safeParseBooleanResult",
        }
    ),
} as const;

/**
 * Type alias for the monitoring domain preload bridge.
 *
 * @public
 */
export type MonitoringApi = MonitoringApiInterface;
