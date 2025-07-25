/**
 * Site monitoring operations module.
 * Handles monitoring start/stop operations and manual checks.
 *
 * Uses centralized error store for consistent error handling across the application.
 */

import { useErrorStore } from "../error/useErrorStore";
import { logStoreAction, withErrorHandling } from "../utils";
import { MonitoringService } from "./services/MonitoringService";
import { SiteService } from "./services/SiteService";

export interface SiteMonitoringActions {
    /** Check a site now */
    checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
    /** Start monitoring for all monitors of a site */
    startSiteMonitoring: (siteId: string) => Promise<void>;
    /** Start monitoring for a site monitor */
    startSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;
    /** Stop monitoring for all monitors of a site */
    stopSiteMonitoring: (siteId: string) => Promise<void>;
    /** Stop monitoring for a site monitor */
    stopSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;
}

/**
 * Creates site monitoring actions for managing monitoring lifecycle operations.
 *
 * @remarks
 * This factory function creates actions for starting, stopping, and manually checking sites.
 * All operations communicate with the backend via IPC services and rely on event-driven
 * updates for state synchronization.
 *
 * @returns Object containing all site monitoring action functions
 */
export const createSiteMonitoringActions = (): SiteMonitoringActions => ({
    checkSiteNow: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "checkSiteNow", { monitorId, siteId });

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                await SiteService.checkSiteNow(siteId, monitorId);
                // Backend will emit 'monitor:status-changed', which will trigger incremental update
            },
            {
                clearError: () => errorStore.clearStoreError("sites-monitoring"),
                setError: (error) => errorStore.setStoreError("sites-monitoring", error),
                setLoading: (loading) => errorStore.setOperationLoading("checkSiteNow", loading),
            }
        );
    },
    startSiteMonitoring: async (siteId: string) => {
        logStoreAction("SitesStore", "startSiteMonitoring", { siteId });

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                await MonitoringService.startSiteMonitoring(siteId);
                // No need for manual sync - StatusUpdateHandler will update UI via events
            },
            {
                clearError: () => errorStore.clearStoreError("sites-monitoring"),
                setError: (error) => errorStore.setStoreError("sites-monitoring", error),
                setLoading: (loading) => errorStore.setOperationLoading("startSiteMonitoring", loading),
            }
        );
    },
    startSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "startSiteMonitorMonitoring", { monitorId, siteId });

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                await MonitoringService.startMonitoring(siteId, monitorId);
                // No need for manual sync - StatusUpdateHandler will update UI via events
            },
            {
                clearError: () => errorStore.clearStoreError("sites-monitoring"),
                setError: (error) => errorStore.setStoreError("sites-monitoring", error),
                setLoading: (loading) => errorStore.setOperationLoading("startSiteMonitorMonitoring", loading),
            }
        );
    },
    stopSiteMonitoring: async (siteId: string) => {
        logStoreAction("SitesStore", "stopSiteMonitoring", { siteId });

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                await MonitoringService.stopSiteMonitoring(siteId);
                // No need for manual sync - StatusUpdateHandler will update UI via events
            },
            {
                clearError: () => errorStore.clearStoreError("sites-monitoring"),
                setError: (error) => errorStore.setStoreError("sites-monitoring", error),
                setLoading: (loading) => errorStore.setOperationLoading("stopSiteMonitoring", loading),
            }
        );
    },
    stopSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "stopSiteMonitorMonitoring", { monitorId, siteId });

        const errorStore = useErrorStore.getState();
        await withErrorHandling(
            async () => {
                await MonitoringService.stopMonitoring(siteId, monitorId);
                // No need for manual sync - StatusUpdateHandler will update UI via events
            },
            {
                clearError: () => errorStore.clearStoreError("sites-monitoring"),
                setError: (error) => errorStore.setStoreError("sites-monitoring", error),
                setLoading: (loading) => errorStore.setOperationLoading("stopSiteMonitorMonitoring", loading),
            }
        );
    },
});
