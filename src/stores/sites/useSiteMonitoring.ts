/**
 * Site monitoring operations module.
 * Handles monitoring start/stop operations and manual checks.
 *
 * Note: Empty clearError and setLoading functions are intentional in withErrorHandling calls
 * as error handling is managed centrally by the store infrastructure.
 */

/* eslint-disable @typescript-eslint/no-empty-function */

import { logStoreAction, withErrorHandling } from "../utils";
import { MonitoringService, SiteService } from "./services";

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
    startSiteMonitoring: async (siteId: string) => {
        logStoreAction("SitesStore", "startSiteMonitoring", { siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.startSiteMonitoring(siteId);
                await deps.syncSitesFromBackend();
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
    stopSiteMonitoring: async (siteId: string) => {
        logStoreAction("SitesStore", "stopSiteMonitoring", { siteId });

        await withErrorHandling(
            async () => {
                await MonitoringService.stopSiteMonitoring(siteId);
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
