/**
 * Site monitoring operations module.
 *
 * @remarks
 * Handles monitoring start/stop operations and manual checks. Uses centralized
 * error store for consistent error handling across the application.
 *
 * @packageDocumentation
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
    checkSiteNow: (siteIdentifier: string, monitorId: string) => Promise<void>;
    /** Start monitoring for all monitors of a site */
    startSiteMonitoring: (siteIdentifier: string) => Promise<void>;
    /** Start monitoring for a site monitor */
    startSiteMonitorMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    /** Stop monitoring for all monitors of a site */
    stopSiteMonitoring: (siteIdentifier: string) => Promise<void>;
    /** Stop monitoring for a site monitor */
    stopSiteMonitorMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
}

/**
 * External dependencies required for monitoring actions.
 *
 * @public
 */
export interface SiteMonitoringDependencies {
    /** Monitoring service abstraction */
    monitoringService: Pick<
        typeof MonitoringService,
        | "checkSiteNow"
        | "startMonitoring"
        | "startSiteMonitoring"
        | "stopMonitoring"
        | "stopSiteMonitoring"
    >;
}

const defaultMonitoringDependencies: SiteMonitoringDependencies = Object.freeze(
    {
        monitoringService: MonitoringService,
    }
);

/**
 * Creates site monitoring actions for managing monitoring lifecycle operations.
 *
 * @remarks
 * This factory function creates actions for starting, stopping, and manually
 * checking sites. All operations communicate with the backend via IPC services
 * and rely on event-driven updates for state synchronization.
 *
 * @returns Object containing all site monitoring action functions.
 *
 * @public
 */
export const createSiteMonitoringActions = (
    deps: SiteMonitoringDependencies = defaultMonitoringDependencies
): SiteMonitoringActions => ({
    checkSiteNow: async (
        siteIdentifier: string,
        monitorId: string
    ): Promise<void> => {
        logStoreAction("SitesStore", "checkSiteNow", {
            monitorId,
            siteIdentifier,
        });

        await withErrorHandling(
            async () => {
                await deps.monitoringService.checkSiteNow(
                    siteIdentifier,
                    monitorId
                );
                // Backend will emit 'monitor:status-changed', which will
                // trigger incremental update
            },
            createStoreErrorHandler("sites-monitoring", "checkSiteNow")
        );
    },
    startSiteMonitoring: async (siteIdentifier: string): Promise<void> => {
        logStoreAction("SitesStore", "startSiteMonitoring", {
            siteIdentifier,
        });

        await withErrorHandling(
            async () => {
                await deps.monitoringService.startSiteMonitoring(
                    siteIdentifier
                );
                // No need for manual sync - StatusUpdateHandler will update UI
                // via events
            },
            createStoreErrorHandler("sites-monitoring", "startSiteMonitoring")
        );
    },
    startSiteMonitorMonitoring: async (
        siteIdentifier: string,
        monitorId: string
    ): Promise<void> => {
        logStoreAction("SitesStore", "startSiteMonitorMonitoring", {
            monitorId,
            siteIdentifier,
        });

        await withErrorHandling(
            async () => {
                await deps.monitoringService.startMonitoring(
                    siteIdentifier,
                    monitorId
                );
                // No need for manual sync - StatusUpdateHandler will update UI
                // via events
            },
            createStoreErrorHandler(
                "sites-monitoring",
                "startSiteMonitorMonitoring"
            )
        );
    },
    stopSiteMonitoring: async (siteIdentifier: string): Promise<void> => {
        logStoreAction("SitesStore", "stopSiteMonitoring", {
            siteIdentifier,
        });

        await withErrorHandling(
            async () => {
                await deps.monitoringService.stopSiteMonitoring(siteIdentifier);
                // No need for manual sync - StatusUpdateHandler will update UI
                // via events
            },
            createStoreErrorHandler("sites-monitoring", "stopSiteMonitoring")
        );
    },
    stopSiteMonitorMonitoring: async (
        siteIdentifier: string,
        monitorId: string
    ): Promise<void> => {
        logStoreAction("SitesStore", "stopSiteMonitorMonitoring", {
            monitorId,
            siteIdentifier,
        });

        await withErrorHandling(
            async () => {
                await deps.monitoringService.stopMonitoring(
                    siteIdentifier,
                    monitorId
                );
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
