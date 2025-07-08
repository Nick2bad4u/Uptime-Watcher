/**
 * Monitoring service layer for handling all monitoring-related operations.
 * Provides a clean abstraction over electron API calls.
 */

import { waitForElectronAPI } from "../../utils";

export const MonitoringService = {
    /**
     * Initialize the service by ensuring electron API is available
     */
    async initialize(): Promise<void> {
        await waitForElectronAPI();
    },
    /**
     * Start monitoring for a site
     */
    async startMonitoring(siteId: string, monitorId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.monitoring.startMonitoringForSite(siteId, monitorId);
    },
    /**
     * Start monitoring for all monitors of a site
     */
    async startSiteMonitoring(siteId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.monitoring.startMonitoringForSite(siteId);
    },
    /**
     * Stop monitoring for a site
     */
    async stopMonitoring(siteId: string, monitorId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.monitoring.stopMonitoringForSite(siteId, monitorId);
    },
    /**
     * Stop monitoring for all monitors of a site
     */
    async stopSiteMonitoring(siteId: string): Promise<void> {
        await this.initialize();
        return window.electronAPI.monitoring.stopMonitoringForSite(siteId);
    },
};
