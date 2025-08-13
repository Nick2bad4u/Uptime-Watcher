/**
 * Monitoring service layer for handling all monitoring-related operations.
 * Provides a clean abstraction over electron API calls.
 *
 * @remarks
 * This service provides a frontend abstraction layer for monitoring
 * operations, ensuring the electron API is available before making calls and
 * providing consistent error handling patterns. All methods automatically
 * initialize
 * the service before performing operations.
 *
 * The service supports both specific monitor operations and site-wide
 * operations: - Individual monitor control with monitor ID
 * - Site-wide operations affecting all monitors of a site
 *
 * @example
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

import { waitForElectronAPI } from "../../utils";

export const MonitoringService = {
    /**
     * Initialize the service by ensuring electron API is available
     *
     * @remarks
     * This method is automatically called by all other service methods
     * to ensure the electron API is ready before making IPC calls.
     *
     * @throws Error if electron API cannot be initialized
     */
    async initialize(): Promise<void> {
        try {
            await waitForElectronAPI();
        } catch (error) {
            console.error("Failed to initialize MonitoringService:", error);
            throw error;
        }
    },
    /**
     * Start monitoring for a specific monitor
     *
     * @param siteId - The identifier of the site containing the monitor
     * @param monitorId - The identifier of the specific monitor to start
     * @throws Error if the electron API is unavailable or the operation fails
     *
     * @example
     * ```typescript
     * await MonitoringService.startMonitoring("site-123", "monitor-456");
     * ```
     */
    async startMonitoring(siteId: string, monitorId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.monitoring.startMonitoringForSite(
            siteId,
            monitorId
        );
    },
    /**
     * Start monitoring for all monitors of a site
     *
     * @param siteId - The identifier of the site to start monitoring
     * @throws Error if the electron API is unavailable or the operation fails
     *
     * @remarks
     * This method starts monitoring for all monitors associated with the
     * specified site. It calls the same backend API as startMonitoring but
     * without the monitorId parameter, which signals the backend to start all
     * monitors for the site.
     *
     * @example
     * ```typescript
     * await MonitoringService.startSiteMonitoring("site-123");
     * ```
     */
    async startSiteMonitoring(siteId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.monitoring.startMonitoringForSite(siteId);
    },
    /**
     * Stop monitoring for a specific monitor
     *
     * @param siteId - The identifier of the site containing the monitor
     * @param monitorId - The identifier of the specific monitor to stop
     * @throws Error if the electron API is unavailable or the operation fails
     *
     * @example
     * ```typescript
     * await MonitoringService.stopMonitoring("site-123", "monitor-456");
     * ```
     */
    async stopMonitoring(siteId: string, monitorId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.monitoring.stopMonitoringForSite(
            siteId,
            monitorId
        );
    },
    /**
     * Stop monitoring for all monitors of a site
     *
     * @param siteId - The identifier of the site to stop monitoring
     * @throws Error if the electron API is unavailable or the operation fails
     *
     * @remarks
     * This method stops monitoring for all monitors associated with the
     * specified site. It calls the same backend API as stopMonitoring but
     * without the monitorId parameter, which signals the backend to stop all
     * monitors for the site.
     *
     * @example
     * ```typescript
     * await MonitoringService.stopSiteMonitoring("site-123");
     * ```
     */
    async stopSiteMonitoring(siteId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.monitoring.stopMonitoringForSite(siteId);
    },
};
