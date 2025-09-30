/**
 * Site monitoring operations module.
 *
 * @remarks
 * Handles monitoring start/stop operations and manual checks. Uses centralized
 * error store for consistent error handling across the application.
 */

import { withErrorHandling } from "@shared/utils/errorHandling";

import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import { MonitoringService } from "./services/MonitoringService";

/**
 * Site monitoring actions interface for managing monitoring operations.
 *
 * @remarks
 * Defines the contract for site monitoring functionality including manual
 * checks and monitoring lifecycle management for sites and individual
 * monitors.
 *
 * @public
 */
export interface SiteMonitoringActions {
    /** Check a site now */
    checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
    /** Start monitoring for all monitors of a site */
    startSiteMonitoring: (siteId: string) => Promise<void>;
    /** Start monitoring for a site monitor */
    startSiteMonitorMonitoring: (
        siteId: string,
        monitorId: string
    ) => Promise<void>;
    /** Stop monitoring for all monitors of a site */
    stopSiteMonitoring: (siteId: string) => Promise<void>;
    /** Stop monitoring for a site monitor */
    stopSiteMonitorMonitoring: (
        siteId: string,
        monitorId: string
    ) => Promise<void>;
}

/**
 * Creates site monitoring actions for managing monitoring lifecycle operations.
 *
 * @remarks
 * This factory function creates actions for starting, stopping, and manually
 * checking sites. All operations communicate with the backend via IPC services
 * and rely on event-driven updates for state synchronization.
 *
 * @returns Object containing all site monitoring action functions
 */
export const createSiteMonitoringActions = (): SiteMonitoringActions => ({
    checkSiteNow: async (siteId: string, monitorId: string): Promise<void> => {
        logStoreAction("SitesStore", "checkSiteNow", { monitorId, siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.checkSiteNow(siteId, monitorId);
                // Backend will emit 'monitor:status-changed', which will
                // trigger incremental update
            },
            createStoreErrorHandler("sites-monitoring", "checkSiteNow")
        );
    },
    startSiteMonitoring: async (siteId: string): Promise<void> => {
        logStoreAction("SitesStore", "startSiteMonitoring", { siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.startSiteMonitoring(siteId);
                // No need for manual sync - StatusUpdateHandler will update UI
                // via events
            },
            createStoreErrorHandler("sites-monitoring", "startSiteMonitoring")
        );
    },
    startSiteMonitorMonitoring: async (
        siteId: string,
        monitorId: string
    ): Promise<void> => {
        logStoreAction("SitesStore", "startSiteMonitorMonitoring", {
            monitorId,
            siteId,
        });

        await withErrorHandling(
            async () => {
                await MonitoringService.startMonitoring(siteId, monitorId);
                // No need for manual sync - StatusUpdateHandler will update UI
                // via events
            },
            createStoreErrorHandler(
                "sites-monitoring",
                "startSiteMonitorMonitoring"
            )
        );
    },
    stopSiteMonitoring: async (siteId: string): Promise<void> => {
        logStoreAction("SitesStore", "stopSiteMonitoring", { siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.stopSiteMonitoring(siteId);
                // No need for manual sync - StatusUpdateHandler will update UI
                // via events
            },
            createStoreErrorHandler("sites-monitoring", "stopSiteMonitoring")
        );
    },
    stopSiteMonitorMonitoring: async (
        siteId: string,
        monitorId: string
    ): Promise<void> => {
        logStoreAction("SitesStore", "stopSiteMonitorMonitoring", {
            monitorId,
            siteId,
        });

        await withErrorHandling(
            async () => {
                await MonitoringService.stopMonitoring(siteId, monitorId);
                // No need for manual sync - StatusUpdateHandler will update UI
                // via events
            },
            createStoreErrorHandler(
                "sites-monitoring",
                "stopSiteMonitorMonitoring"
            )
        );
    },
});
