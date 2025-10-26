/**
 * Site monitoring operations module.
 *
 * @remarks
 * Handles monitoring start/stop operations and manual checks. Uses centralized
 * error store for consistent error handling across the application.
 *
 * @packageDocumentation
 */

import type { Site, StatusUpdate } from "@shared/types";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";

import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import { MonitoringService } from "./services/MonitoringService";
import { applyStatusUpdateSnapshot } from "./utils/statusUpdateHandler";
import { logger } from "../../services/logger";

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
        | "startMonitoringForMonitor"
        | "startMonitoringForSite"
        | "stopMonitoringForMonitor"
        | "stopMonitoringForSite"
    >;
    /** Reads current sites from the store for optimistic updates */
    getSites: () => Site[];
    /** Replaces the sites collection in the store */
    setSites: (sites: Site[]) => void;
    /**
     * Applies status update snapshots to the current sites collection.
     *
     * @remarks
     * Defaults to {@link applyStatusUpdateSnapshot}. Override for testing to
     * inspect inputs without mutating state.
     */
    applyStatusUpdate?: (sites: Site[], update: StatusUpdate) => Site[];
}

const defaultMonitoringDependencies: SiteMonitoringDependencies = Object.freeze(
    {
        monitoringService: MonitoringService,
        getSites: (): Site[] => [],
        setSites: (): void => undefined,
        applyStatusUpdate: applyStatusUpdateSnapshot,
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
): SiteMonitoringActions => {
    const { monitoringService, getSites, setSites } = deps;
    const applyStatusUpdate =
        deps.applyStatusUpdate ?? applyStatusUpdateSnapshot;

    const applyOptimisticUpdate = (statusUpdate: StatusUpdate): void => {
        try {
            const currentSites = getSites();
            const updatedSites = applyStatusUpdate(currentSites, statusUpdate);
            setSites(updatedSites);

            logger.debug(
                "[SitesStore] Applied optimistic manual check result",
                {
                    monitorId: statusUpdate.monitorId,
                    siteIdentifier: statusUpdate.siteIdentifier,
                    status: statusUpdate.status,
                }
            );
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            logger.error(
                "[SitesStore] Failed applying optimistic manual check result",
                normalizedError
            );
        }
    };

    return {
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
                        const statusUpdate =
                            await monitoringService.checkSiteNow(
                                siteIdentifier,
                                monitorId
                            );

                        if (statusUpdate) {
                            applyOptimisticUpdate(statusUpdate);
                        }

                        logStoreAction("SitesStore", "checkSiteNow", {
                            monitorId,
                            optimisticUpdate: Boolean(statusUpdate),
                            siteIdentifier,
                            status: "success",
                            success: true,
                        });
                    } catch (error) {
                        const normalizedError = ensureError(error);
                        logStoreAction("SitesStore", "checkSiteNow", {
                            error: normalizedError.message,
                            monitorId,
                            siteIdentifier,
                            status: "failure",
                            success: false,
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
                        await monitoringService.startMonitoringForSite(
                            siteIdentifier
                        );
                        logStoreAction("SitesStore", "startSiteMonitoring", {
                            siteIdentifier,
                            status: "success",
                            success: true,
                        });
                        // No need for manual sync - StatusUpdateManager will update UI via events
                    } catch (error) {
                        const normalizedError = ensureError(error);
                        logStoreAction("SitesStore", "startSiteMonitoring", {
                            error: normalizedError.message,
                            siteIdentifier,
                            status: "failure",
                            success: false,
                        });
                        throw error;
                    }
                },
                createStoreErrorHandler(
                    "sites-monitoring",
                    "startSiteMonitoring"
                )
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
                        await monitoringService.startMonitoringForMonitor(
                            siteIdentifier,
                            monitorId
                        );
                        logStoreAction(
                            "SitesStore",
                            "startSiteMonitorMonitoring",
                            {
                                monitorId,
                                siteIdentifier,
                                status: "success",
                                success: true,
                            }
                        );
                        // No need for manual sync - StatusUpdateManager will update UI via events
                    } catch (error) {
                        const normalizedError = ensureError(error);
                        logStoreAction(
                            "SitesStore",
                            "startSiteMonitorMonitoring",
                            {
                                error: normalizedError.message,
                                monitorId,
                                siteIdentifier,
                                status: "failure",
                                success: false,
                            }
                        );
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
                        await monitoringService.stopMonitoringForSite(
                            siteIdentifier
                        );
                        logStoreAction("SitesStore", "stopSiteMonitoring", {
                            siteIdentifier,
                            status: "success",
                            success: true,
                        });
                        // No need for manual sync - StatusUpdateManager will update UI via events
                    } catch (error) {
                        const normalizedError = ensureError(error);
                        logStoreAction("SitesStore", "stopSiteMonitoring", {
                            error: normalizedError.message,
                            siteIdentifier,
                            status: "failure",
                            success: false,
                        });
                        throw error;
                    }
                },
                createStoreErrorHandler(
                    "sites-monitoring",
                    "stopSiteMonitoring"
                )
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
                        await monitoringService.stopMonitoringForMonitor(
                            siteIdentifier,
                            monitorId
                        );
                        logStoreAction(
                            "SitesStore",
                            "stopSiteMonitorMonitoring",
                            {
                                monitorId,
                                siteIdentifier,
                                status: "success",
                                success: true,
                            }
                        );
                        // No need for manual sync - StatusUpdateManager will update UI via events
                    } catch (error) {
                        const normalizedError = ensureError(error);
                        logStoreAction(
                            "SitesStore",
                            "stopSiteMonitorMonitoring",
                            {
                                error: normalizedError.message,
                                monitorId,
                                siteIdentifier,
                                status: "failure",
                                success: false,
                            }
                        );
                        throw error;
                    }
                },
                createStoreErrorHandler(
                    "sites-monitoring",
                    "stopSiteMonitorMonitoring"
                )
            );
        },
    };
};
