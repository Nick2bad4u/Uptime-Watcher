/**
 * Site monitoring operations module.
 *
 * @remarks
 * Handles monitoring start/stop operations and manual checks. Uses centralized
 * error store for consistent error handling across the application.
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";

import { logger } from "../../services/logger";
import { MonitoringService } from "../../services/MonitoringService";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import {
    applyStatusUpdateSnapshot,
    type StatusUpdateSnapshotPayload,
} from "./utils/statusUpdateHandler";

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
    /** Clears optimistic monitoring locks for the provided monitors. */
    clearOptimisticMonitoringLocks?: (
        siteIdentifier: string,
        monitorIds: readonly string[]
    ) => void;
    /**
     * Applies status update snapshots to the current sites collection.
     *
     * @remarks
     * Defaults to {@link applyStatusUpdateSnapshot}. Override for testing to
     * inspect inputs without mutating state.
     */
    applyStatusUpdate?: (
        sites: Site[],
        update: StatusUpdateSnapshotPayload
    ) => Site[];
    /** Reads current sites from the store for optimistic updates */
    getSites: () => Site[];
    /** Monitoring service abstraction */
    monitoringService: Pick<
        typeof MonitoringService,
        | "checkSiteNow"
        | "startMonitoringForMonitor"
        | "startMonitoringForSite"
        | "stopMonitoringForMonitor"
        | "stopMonitoringForSite"
    >;
    /** Registers optimistic monitoring locks for the provided monitors. */
    registerMonitoringLock?: (
        siteIdentifier: string,
        monitorIds: readonly string[],
        monitoring: boolean,
        durationMs: number
    ) => void;
    /** Replaces the sites collection in the store */
    setSites: (sites: Site[]) => void;
}

const defaultMonitoringDependencies: SiteMonitoringDependencies = Object.freeze(
    {
        clearOptimisticMonitoringLocks: () => undefined,
        applyStatusUpdate: applyStatusUpdateSnapshot,
        getSites: (): Site[] => [],
        monitoringService: MonitoringService,
        registerMonitoringLock: () => undefined,
        setSites: (): void => undefined,
    }
);

const OPTIMISTIC_MONITORING_HOLD_MS = 1_500;

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
    const {
        applyStatusUpdate,
        clearOptimisticMonitoringLocks = () => undefined,
        getSites,
        monitoringService,
        registerMonitoringLock = () => undefined,
        setSites,
    } = deps;
    const safeApplyStatusUpdate =
        applyStatusUpdate ?? applyStatusUpdateSnapshot;
    const applyOptimisticUpdate = (statusUpdate: StatusUpdate): void => {
        try {
            const currentSites = getSites();
            const updatedSites = safeApplyStatusUpdate(
                currentSites,
                statusUpdate
            );
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

    const applyOptimisticMonitoringState = (
        siteIdentifier: string,
        monitoring: boolean,
        monitorId?: string,
        {
            delayMs = 0,
            snapshotForRollback = false,
        }: {
            readonly delayMs?: number;
            readonly snapshotForRollback?: boolean;
        } = {}
    ): { readonly revert: () => void } => {
        const previousSites = snapshotForRollback
            ? structuredClone(getSites())
            : undefined;

        let applied = false;
        const updatedMonitorIds = new Set<string>();

        const executeUpdate = (): void => {
            try {
                const currentSites = getSites();
                let siteUpdated = false;

                const updatedSites = currentSites.map((site) => {
                    if (site.identifier !== siteIdentifier) {
                        return site;
                    }

                    let monitorStateChanged = false;
                    const updatedMonitors = site.monitors.map((monitor) => {
                        const shouldUpdate =
                            monitorId === undefined || monitor.id === monitorId;

                        if (
                            !shouldUpdate ||
                            monitor.monitoring === monitoring
                        ) {
                            return monitor;
                        }

                        monitorStateChanged = true;
                        updatedMonitorIds.add(monitor.id);
                        return {
                            ...monitor,
                            monitoring,
                        } satisfies Monitor;
                    });

                    if (!monitorStateChanged) {
                        return site;
                    }

                    siteUpdated = true;
                    return {
                        ...site,
                        monitors: updatedMonitors,
                    } satisfies Site;
                });

                if (!siteUpdated) {
                    return;
                }

                setSites(updatedSites);
                applied = true;

                const monitorIds = Array.from(updatedMonitorIds);
                if (monitorIds.length > 0) {
                    registerMonitoringLock(
                        siteIdentifier,
                        monitorIds,
                        monitoring,
                        OPTIMISTIC_MONITORING_HOLD_MS
                    );
                }

                logger.debug(
                    "[SitesStore] Applied optimistic monitoring state update",
                    {
                        monitorId: monitorId ?? "all",
                        monitoring,
                        siteIdentifier,
                    }
                );
            } catch (error: unknown) {
                const normalizedError = ensureError(error);
                logger.error(
                    "[SitesStore] Failed applying optimistic monitoring state update",
                    normalizedError,
                    {
                        monitorId: monitorId ?? "all",
                        monitoring,
                        siteIdentifier,
                    }
                );
            }
        };

        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        if (delayMs > 0) {
            timeoutId = globalThis.setTimeout(() => {
                timeoutId = undefined;
                executeUpdate();
            }, delayMs);
        } else {
            executeUpdate();
        }

        const revert = (): void => {
            if (timeoutId !== undefined) {
                globalThis.clearTimeout(timeoutId);
                timeoutId = undefined;
            }

            if (!applied) {
                return;
            }

            const monitorIds = Array.from(updatedMonitorIds);
            if (monitorIds.length > 0) {
                clearOptimisticMonitoringLocks(siteIdentifier, monitorIds);
            }

            if (snapshotForRollback && previousSites) {
                setSites(previousSites);
                return;
            }
        };

        return { revert };
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
                    let revertOptimistic: () => void = () => undefined;
                    try {
                        const { revert } = applyOptimisticMonitoringState(
                            siteIdentifier,
                            true,
                            undefined,
                            {
                                delayMs: 50,
                                snapshotForRollback: true,
                            }
                        );
                        revertOptimistic = revert;

                        await monitoringService.startMonitoringForSite(
                            siteIdentifier
                        );

                        revertOptimistic = () => undefined;

                        logStoreAction("SitesStore", "startSiteMonitoring", {
                            siteIdentifier,
                            status: "success",
                            success: true,
                        });
                        // No need for manual sync - StatusUpdateManager will update UI via events
                    } catch (error) {
                        revertOptimistic();
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
                    let revertOptimistic: () => void = () => undefined;
                    try {
                        const { revert } = applyOptimisticMonitoringState(
                            siteIdentifier,
                            true,
                            monitorId,
                            {
                                delayMs: 50,
                                snapshotForRollback: true,
                            }
                        );
                        revertOptimistic = revert;

                        await monitoringService.startMonitoringForMonitor(
                            siteIdentifier,
                            monitorId
                        );

                        revertOptimistic = () => undefined;

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
                        revertOptimistic();
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
                    let revertOptimistic: () => void = () => undefined;
                    try {
                        const { revert } = applyOptimisticMonitoringState(
                            siteIdentifier,
                            false,
                            undefined,
                            {
                                delayMs: 50,
                                snapshotForRollback: true,
                            }
                        );
                        revertOptimistic = revert;

                        await monitoringService.stopMonitoringForSite(
                            siteIdentifier
                        );

                        revertOptimistic = () => undefined;

                        logStoreAction("SitesStore", "stopSiteMonitoring", {
                            siteIdentifier,
                            status: "success",
                            success: true,
                        });
                        // No need for manual sync - StatusUpdateManager will update UI via events
                    } catch (error) {
                        revertOptimistic();
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
                    let revertOptimistic: () => void = () => undefined;
                    try {
                        const { revert } = applyOptimisticMonitoringState(
                            siteIdentifier,
                            false,
                            monitorId,
                            {
                                delayMs: 50,
                                snapshotForRollback: true,
                            }
                        );
                        revertOptimistic = revert;

                        await monitoringService.stopMonitoringForMonitor(
                            siteIdentifier,
                            monitorId
                        );

                        revertOptimistic = () => undefined;

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
                        revertOptimistic();
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
