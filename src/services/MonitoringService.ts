/**
 * Monitoring service layer for handling all monitoring-related operations.
 * Provides a clean abstraction over electron API calls.
 *
 * @remarks
 * This service provides a frontend abstraction layer for monitoring operations,
 * ensuring the electron API is available before making calls and providing
 * consistent error handling patterns. All methods automatically initialize the
 * service before performing operations.
 *
 * The service supports both specific monitor operations and site-wide
 * operations: - Individual monitor control with monitor ID
 *
 * - Site-wide operations affecting all monitors of a site
 *
 * @example
 *
 * ```typescript
 * // Start monitoring for a specific monitor
 * await MonitoringService.startMonitoringForMonitor(
 *     "site-123",
 *     "monitor-456"
 * );
 *
 * // Start monitoring for all monitors of a site
 * await MonitoringService.startMonitoringForSite("site-123");
 *
 * // Stop specific monitor
 * await MonitoringService.stopMonitoringForMonitor(
 *     "site-123",
 *     "monitor-456"
 * );
 * ```
 *
 * @public
 */

import type { StatusUpdate } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("MonitoringService", {
            bridgeContracts: [
                {
                    domain: "monitoring",
                    methods: [
                        "checkSiteNow",
                        "startMonitoring",
                        "startMonitoringForMonitor",
                        "startMonitoringForSite",
                        "stopMonitoring",
                        "stopMonitoringForMonitor",
                        "stopMonitoringForSite",
                    ],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

interface MonitoringServiceContract {
    checkSiteNow: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<StatusUpdate | undefined>;
    initialize: () => Promise<void>;
    startMonitoring: () => Promise<void>;
    startMonitoringForMonitor: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    startMonitoringForSite: (siteIdentifier: string) => Promise<void>;
    stopMonitoring: () => Promise<void>;
    stopMonitoringForMonitor: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    stopMonitoringForSite: (siteIdentifier: string) => Promise<void>;
}

/**
 * Service for managing monitoring operations through Electron IPC.
 *
 * @remarks
 * Provides a clean interface for all monitoring-related operations including
 * starting and stopping monitors, manual checks, and site-wide monitoring
 * control with automatic service initialization and error handling.
 *
 * @public
 */
export const MonitoringService: MonitoringServiceContract = {
    /**
     * Perform an immediate manual check for a specific monitor.
     *
     * @param siteIdentifier - The identifier of the site containing the
     *   monitor.
     * @param monitorId - The identifier of the monitor to check.
     *
     * @returns The latest {@link StatusUpdate} when available, otherwise
     *   undefined.
     */
    checkSiteNow: wrap(
        "checkSiteNow",
        async (
            api,
            siteIdentifier: string,
            monitorId: string
        ): Promise<StatusUpdate | undefined> =>
            api.monitoring.checkSiteNow(siteIdentifier, monitorId)
    ),
    /**
     * Ensures the preload bridge is ready before invoking monitoring APIs.
     */
    initialize: ensureInitialized,
    /**
     * Starts monitoring across all configured sites.
     *
     * @throws Error when the backend declines to start global monitoring.
     */
    startMonitoring: wrap("startMonitoring", async (api): Promise<void> => {
        const success = await api.monitoring.startMonitoring();

        if (!success) {
            throw new Error("Failed to start monitoring across all sites");
        }
    }),
    /**
     * Starts monitoring for a single monitor within a site.
     *
     * @param siteIdentifier - Site that owns the monitor.
     * @param monitorId - Monitor identifier to start.
     *
     * @throws Error when the backend reports failure for the targeted monitor.
     */
    startMonitoringForMonitor: wrap(
        "startMonitoringForMonitor",
        async (
            api,
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            const success = await api.monitoring.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            if (!success) {
                throw new Error(
                    `Failed to start monitoring for monitor ${monitorId} of site ${siteIdentifier}: Backend operation failed`
                );
            }
        }
    ),
    /**
     * Starts monitoring for every monitor within the specified site.
     *
     * @param siteIdentifier - Identifier of the site whose monitors should
     *   begin monitoring.
     *
     * @throws Error when the backend declines the request.
     */
    startMonitoringForSite: wrap(
        "startMonitoringForSite",
        async (api, siteIdentifier: string): Promise<void> => {
            const success =
                await api.monitoring.startMonitoringForSite(siteIdentifier);

            if (!success) {
                throw new Error(
                    `Failed to start monitoring for site ${siteIdentifier}: Backend operation failed`
                );
            }
        }
    ),
    /**
     * Stops monitoring across all configured sites.
     *
     * @throws Error when the backend declines to stop global monitoring.
     */
    stopMonitoring: wrap("stopMonitoring", async (api): Promise<void> => {
        const success = await api.monitoring.stopMonitoring();

        if (!success) {
            throw new Error("Failed to stop monitoring across all sites");
        }
    }),
    /**
     * Stops monitoring for a specific monitor within a site.
     *
     * @param siteIdentifier - Site that owns the monitor.
     * @param monitorId - Monitor identifier to stop.
     *
     * @throws Error when the backend reports failure for the targeted monitor.
     */
    stopMonitoringForMonitor: wrap(
        "stopMonitoringForMonitor",
        async (
            api,
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            const success = await api.monitoring.stopMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            if (!success) {
                throw new Error(
                    `Failed to stop monitoring for monitor ${monitorId} of site ${siteIdentifier}: Backend operation failed`
                );
            }
        }
    ),
    /**
     * Stops monitoring for every monitor belonging to the specified site.
     *
     * @param siteIdentifier - Identifier of the site whose monitors should stop
     *   monitoring.
     *
     * @throws Error when the backend declines the request.
     */
    stopMonitoringForSite: wrap(
        "stopMonitoringForSite",
        async (api, siteIdentifier: string): Promise<void> => {
            const success =
                await api.monitoring.stopMonitoringForSite(siteIdentifier);

            if (!success) {
                throw new Error(
                    `Failed to stop monitoring for site ${siteIdentifier}: Backend operation failed`
                );
            }
        }
    ),
};
