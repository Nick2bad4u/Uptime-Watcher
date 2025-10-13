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
 * await MonitoringService.startMonitoring("site-123", "monitor-456");
 *
 * // Start monitoring for all monitors of a site
 * await MonitoringService.startSiteMonitoring("site-123");
 *
 * // Stop specific monitor
 * await MonitoringService.stopMonitoring("site-123", "monitor-456");
 * ```
 *
 * @public
 */

import type { StatusUpdate } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";

import { getIpcServiceHelpers } from "../../../services/utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("MonitoringService");
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
    startMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    startSiteMonitoring: (siteIdentifier: string) => Promise<void>;
    stopMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    stopSiteMonitoring: (siteIdentifier: string) => Promise<void>;
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
     * Start monitoring for a specific monitor
     *
     * @example
     *
     * ```typescript
     * await MonitoringService.startMonitoring("site-123", "monitor-456");
     * ```
     *
     * @param siteIdentifier - The identifier of the site containing the monitor
     * @param monitorId - The identifier of the specific monitor to start
     *
     * @throws Error if the electron API is unavailable or the operation fails
     */
    startMonitoring: wrap(
        "startMonitoring",
        async (
            api,
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            const success = await api.monitoring.startMonitoringForSite(
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
     * Start monitoring for all monitors of a site
     *
     * @remarks
     * This method starts monitoring for all monitors associated with the
     * specified site. It calls the same backend API as startMonitoring but
     * without the monitorId parameter, which signals the backend to start all
     * monitors for the site.
     *
     * @example
     *
     * ```typescript
     * await MonitoringService.startSiteMonitoring("site-123");
     * ```
     *
     * @param siteIdentifier - The identifier of the site to start monitoring
     *
     * @throws Error if the electron API is unavailable or the operation fails
     */
    startSiteMonitoring: wrap(
        "startSiteMonitoring",
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
     * Stop monitoring for a specific monitor
     *
     * @example
     *
     * ```typescript
     * await MonitoringService.stopMonitoring("site-123", "monitor-456");
     * ```
     *
     * @param siteIdentifier - The identifier of the site containing the monitor
     * @param monitorId - The identifier of the specific monitor to stop
     *
     * @throws Error if the electron API is unavailable or the operation fails
     */
    stopMonitoring: wrap(
        "stopMonitoring",
        async (
            api,
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            const success = await api.monitoring.stopMonitoringForSite(
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
     * Stop monitoring for all monitors of a site
     *
     * @remarks
     * This method stops monitoring for all monitors associated with the
     * specified site. It calls the same backend API as stopMonitoring but
     * without the monitorId parameter, which signals the backend to stop all
     * monitors for the site.
     *
     * @example
     *
     * ```typescript
     * await MonitoringService.stopSiteMonitoring("site-123");
     * ```
     *
     * @param siteIdentifier - The identifier of the site to stop monitoring
     *
     * @throws Error if the electron API is unavailable or the operation fails
     */
    stopSiteMonitoring: wrap(
        "stopSiteMonitoring",
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
