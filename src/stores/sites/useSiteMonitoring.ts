/**
 * Site monitoring operations module.
 * Handles monitoring start/stop operations and manual checks.
 */

import { logStoreAction, withErrorHandling } from "../utils";
import { MonitoringService, SiteService } from "./services";

export interface SiteMonitoringActions {
    /** Start monitoring for a site monitor */
    startSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;
    /** Stop monitoring for a site monitor */
    stopSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;
    /** Check a site now */
    checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
}

export interface SiteMonitoringDependencies {
    syncSitesFromBackend: () => Promise<void>;
}

export const createSiteMonitoringActions = (deps: SiteMonitoringDependencies): SiteMonitoringActions => ({
    checkSiteNow: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "checkSiteNow", { monitorId, siteId });

        await withErrorHandling(
            async () => {
                await SiteService.checkSiteNow(siteId, monitorId);
                // Backend will emit 'status-update', which will trigger incremental update
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    startSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "startSiteMonitorMonitoring", { monitorId, siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.startMonitoring(siteId, monitorId);
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
    stopSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
        logStoreAction("SitesStore", "stopSiteMonitorMonitoring", { monitorId, siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.stopMonitoring(siteId, monitorId);
                await deps.syncSitesFromBackend();
            },
            {
                clearError: () => {},
                setError: (error) => logStoreAction("SitesStore", "error", { error }),
                setLoading: () => {},
            }
        );
    },
});
