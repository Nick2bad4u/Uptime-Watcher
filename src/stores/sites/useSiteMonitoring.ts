/**
 * Site monitoring operations module.
 *
 * @remarks
 * Handles monitoring start/stop operations and manual checks. Uses centralized
 * error store for consistent error handling across the application.
 *
 * @packageDocumentation
 */

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";

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
            status: "pending",
        });

        await withErrorHandling(
            async () => {
                try {
                    await deps.monitoringService.checkSiteNow(
                        siteIdentifier,
                        monitorId
                    );
                    logStoreAction("SitesStore", "checkSiteNow", {
                        monitorId,
                        siteIdentifier,
                        status: "success",
                    });
                } catch (error) {
                    const normalizedError = ensureError(error);
                    logStoreAction("SitesStore", "checkSiteNow", {
                        error: normalizedError.message,
                        monitorId,
                        siteIdentifier,
                        status: "failure",
                    });
                    throw error;
                }
            },
            createStoreErrorHandler("sites-monitoring", "checkSiteNow")
        );
    },
    startSiteMonitoring: async (siteIdentifier: string): Promise<void> => {
        logStoreAction("SitesStore", "startSiteMonitoring", {
            siteIdentifier,
            status: "pending",
        });

        await withErrorHandling(
            async () => {
                try {
                    await deps.monitoringService.startSiteMonitoring(
                        siteIdentifier
                    );
                    logStoreAction("SitesStore", "startSiteMonitoring", {
                        siteIdentifier,
                        status: "success",
                    });
                    // No need for manual sync - StatusUpdateHandler will update UI
                    // via events
                } catch (error) {
                    const normalizedError = ensureError(error);
                    logStoreAction("SitesStore", "startSiteMonitoring", {
                        error: normalizedError.message,
                        siteIdentifier,
                        status: "failure",
                    });
                    throw error;
                }
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
            status: "pending",
        });

        await withErrorHandling(
            async () => {
                try {
                    await deps.monitoringService.startMonitoring(
                        siteIdentifier,
                        monitorId
                    );
                    logStoreAction("SitesStore", "startSiteMonitorMonitoring", {
                        monitorId,
                        siteIdentifier,
                        status: "success",
                    });
                    // No need for manual sync - StatusUpdateHandler will update UI
                    // via events
                } catch (error) {
                    const normalizedError = ensureError(error);
                    logStoreAction("SitesStore", "startSiteMonitorMonitoring", {
                        error: normalizedError.message,
                        monitorId,
                        siteIdentifier,
                        status: "failure",
                    });
                    throw error;
                }
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
            status: "pending",
        });

        await withErrorHandling(
            async () => {
                try {
                    await deps.monitoringService.stopSiteMonitoring(
                        siteIdentifier
                    );
                    logStoreAction("SitesStore", "stopSiteMonitoring", {
                        siteIdentifier,
                        status: "success",
                    });
                    // No need for manual sync - StatusUpdateHandler will update UI
                    // via events
                } catch (error) {
                    const normalizedError = ensureError(error);
                    logStoreAction("SitesStore", "stopSiteMonitoring", {
                        error: normalizedError.message,
                        siteIdentifier,
                        status: "failure",
                    });
                    throw error;
                }
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
            status: "pending",
        });

        await withErrorHandling(
            async () => {
                try {
                    await deps.monitoringService.stopMonitoring(
                        siteIdentifier,
                        monitorId
                    );
                    logStoreAction("SitesStore", "stopSiteMonitorMonitoring", {
                        monitorId,
                        siteIdentifier,
                        status: "success",
                    });
                    // No need for manual sync - StatusUpdateHandler will update UI
                    // via events
                } catch (error) {
                    const normalizedError = ensureError(error);
                    logStoreAction("SitesStore", "stopSiteMonitorMonitoring", {
                        error: normalizedError.message,
                        monitorId,
                        siteIdentifier,
                        status: "failure",
                    });
                    throw error;
                }
            },
            createStoreErrorHandler(
                "sites-monitoring",
                "stopSiteMonitorMonitoring"
            )
        );
    },
});
