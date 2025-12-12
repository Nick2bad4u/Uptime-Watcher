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

import type { OptimisticMonitoringLock } from "./utils/optimisticMonitoringLock";
import type { StatusUpdateSnapshotPayload } from "./utils/statusUpdateSnapshot";

import { logger } from "../../services/logger";
import { MonitoringService } from "../../services/MonitoringService";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import { applyStatusUpdateSnapshot } from "./utils/statusUpdateSnapshot";

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
    /** Clears optimistic monitoring locks for the provided monitors. */
    clearOptimisticMonitoringLocks?: (
        siteIdentifier: string,
        monitorIds: readonly string[]
    ) => void;
    /** Snapshot accessor for current optimistic monitoring locks. */
    getOptimisticMonitoringLocks?: () => Partial<
        Record<string, OptimisticMonitoringLock>
    >;
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
        applyStatusUpdate: applyStatusUpdateSnapshot,
        clearOptimisticMonitoringLocks: () => {},
        getOptimisticMonitoringLocks: () => ({}),
        getSites: (): Site[] => [],
        monitoringService: MonitoringService,
        registerMonitoringLock: () => {},
        setSites: (): void => undefined,
    }
);

const OPTIMISTIC_MONITORING_HOLD_MS = 1500;
const OPTIMISTIC_MONITORING_DELAY_MS = 50;

const noopClearOptimisticLocks: NonNullable<
    SiteMonitoringDependencies["clearOptimisticMonitoringLocks"]
> = () => {};

const noopRegisterMonitoringLock: NonNullable<
    SiteMonitoringDependencies["registerMonitoringLock"]
> = () => {};

/**
 * Prevents unhandled rejection warnings for fire-and-forget store actions while
 * keeping the original rejection semantics intact for callers that await the
 * returned promise.
 *
 * @param promise - Promise produced by a store action.
 *
 * @returns The same promise instance, so callers can still await or chain it.
 */
const trackStorePromise = <T>(promise: Promise<T>): Promise<T> => {
    void (async (): Promise<void> => {
        try {
            await promise;
        } catch {
            // Intentionally ignored – the returned promise still rejects for awaiting callers.
        }
    })();

    return promise;
};

type MonitoringActionName =
    | "startSiteMonitoring"
    | "startSiteMonitorMonitoring"
    | "stopSiteMonitoring"
    | "stopSiteMonitorMonitoring";

const buildMonitoringLogPayload = (
    siteIdentifier: string,
    monitorId: string | undefined,
    base: Record<string, unknown>
): Record<string, unknown> => {
    if (monitorId === undefined) {
        return {
            siteIdentifier,
            ...base,
        } satisfies Record<string, unknown>;
    }

    return {
        monitorId,
        siteIdentifier,
        ...base,
    } satisfies Record<string, unknown>;
};

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
    const { applyStatusUpdate, getSites, monitoringService, setSites } = deps;
    const clearOptimisticMonitoringLocks =
        deps.clearOptimisticMonitoringLocks ?? noopClearOptimisticLocks;
    const registerMonitoringLock =
        deps.registerMonitoringLock ?? noopRegisterMonitoringLock;
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
    ): { readonly revert: () => void; readonly whenReady: Promise<void> } => {
        const previousSites: Site[] | undefined = snapshotForRollback
            ? structuredClone(getSites())
            : undefined;

        let applied = false;
        const updatedMonitorIds = new Set<string>();
        let resolveReady: (() => void) | null = null;
        const whenReady = new Promise<void>((resolve) => {
            resolveReady = resolve;
        });

        const resolveIfPending = (): void => {
            resolveReady?.();
            resolveReady = null;
        };

        const updateSiteForOptimism = (
            site: Site
        ): {
            readonly changed: boolean;
            readonly site: Site;
        } => {
            if (site.identifier !== siteIdentifier) {
                return { changed: false, site };
            }

            let monitorStateChanged = false;
            const updatedMonitors: Monitor[] = [];

            for (const monitor of site.monitors) {
                const shouldUpdate =
                    monitorId === undefined || monitor.id === monitorId;

                if (!shouldUpdate || monitor.monitoring === monitoring) {
                    updatedMonitors.push(monitor);
                } else {
                    monitorStateChanged = true;
                    updatedMonitorIds.add(monitor.id);
                    updatedMonitors.push({
                        ...monitor,
                        monitoring,
                    });
                }
            }

            if (!monitorStateChanged) {
                return { changed: false, site };
            }

            return {
                changed: true,
                site: {
                    ...site,
                    monitors: updatedMonitors,
                },
            };
        };

        const executeUpdate = (): void => {
            try {
                const currentSites = getSites();
                let siteUpdated = false;
                const updatedSites: Site[] = [];

                for (const site of currentSites) {
                    const { changed, site: normalizedSite } =
                        updateSiteForOptimism(site);
                    if (changed) {
                        siteUpdated = true;
                    }
                    updatedSites.push(normalizedSite);
                }

                if (!siteUpdated) {
                    resolveIfPending();
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
            resolveIfPending();
        };

        let timeoutId: null | ReturnType<typeof setTimeout> = null;
        if (delayMs > 0) {
            timeoutId = globalThis.setTimeout(() => {
                timeoutId = null;
                executeUpdate();
            }, delayMs);
        } else {
            executeUpdate();
        }

        const revert = (): void => {
            if (timeoutId !== null) {
                globalThis.clearTimeout(timeoutId);
                timeoutId = null;
                // Ensure optimistic state is applied at least once so we can
                // reliably roll it back and clean up any locks, even if the
                // backend operation fails before the deferred update executes.
                executeUpdate();
            }

            if (!applied) {
                return;
            }

            const monitorIds = Array.from(updatedMonitorIds);
            if (monitorIds.length > 0) {
                clearOptimisticMonitoringLocks(siteIdentifier, monitorIds);
            }

            if (previousSites) {
                setSites(previousSites);
            }
        };

        return { revert, whenReady };
    };

    const executeMonitoringOperation = async (
        actionName: MonitoringActionName,
        siteIdentifier: string,
        monitoring: boolean,
        operation: () => Promise<void>,
        monitorId?: string
    ): Promise<void> => {
        const { revert, whenReady } = applyOptimisticMonitoringState(
            siteIdentifier,
            monitoring,
            monitorId,
            {
                delayMs: OPTIMISTIC_MONITORING_DELAY_MS,
                snapshotForRollback: true,
            }
        );

        let operationError: unknown = undefined;
        const runOperation = async (): Promise<void> => {
            try {
                await operation();
            } catch (error: unknown) {
                operationError = error;
            }
        };

        await Promise.all([runOperation(), whenReady]);

        if (operationError) {
            revert();
            const normalizedError = ensureError(operationError);
            logStoreAction(
                "SitesStore",
                actionName,
                buildMonitoringLogPayload(siteIdentifier, monitorId, {
                    error: normalizedError.message,
                    status: "failure",
                    success: false,
                })
            );
            throw normalizedError;
        }

        logStoreAction(
            "SitesStore",
            actionName,
            buildMonitoringLogPayload(siteIdentifier, monitorId, {
                status: "success",
                success: true,
            })
        );
        // StatusUpdateManager will propagate the authoritative update
    };

    return {
        checkSiteNow: (
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            logStoreAction("SitesStore", "checkSiteNow", {
                monitorId,
                siteIdentifier,
                status: "pending",
            });

            return trackStorePromise(
                withErrorHandling(
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
                )
            );
        },
        startSiteMonitoring: (siteIdentifier: string): Promise<void> => {
            logStoreAction("SitesStore", "startSiteMonitoring", {
                siteIdentifier,
                status: "pending",
            });

            return trackStorePromise(
                withErrorHandling(
                    async (): Promise<void> => {
                        await executeMonitoringOperation(
                            "startSiteMonitoring",
                            siteIdentifier,
                            true,
                            () =>
                                monitoringService.startMonitoringForSite(
                                    siteIdentifier
                                )
                        );
                    },
                    createStoreErrorHandler(
                        "sites-monitoring",
                        "startSiteMonitoring"
                    )
                )
            );
        },
        startSiteMonitorMonitoring: (
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            logStoreAction("SitesStore", "startSiteMonitorMonitoring", {
                monitorId,
                siteIdentifier,
                status: "pending",
            });

            return trackStorePromise(
                withErrorHandling(
                    async (): Promise<void> => {
                        await executeMonitoringOperation(
                            "startSiteMonitorMonitoring",
                            siteIdentifier,
                            true,
                            () =>
                                monitoringService.startMonitoringForMonitor(
                                    siteIdentifier,
                                    monitorId
                                ),
                            monitorId
                        );
                    },
                    createStoreErrorHandler(
                        "sites-monitoring",
                        "startSiteMonitorMonitoring"
                    )
                )
            );
        },
        stopSiteMonitoring: (siteIdentifier: string): Promise<void> => {
            logStoreAction("SitesStore", "stopSiteMonitoring", {
                siteIdentifier,
                status: "pending",
            });

            return trackStorePromise(
                withErrorHandling(
                    async (): Promise<void> => {
                        await executeMonitoringOperation(
                            "stopSiteMonitoring",
                            siteIdentifier,
                            false,
                            () =>
                                monitoringService.stopMonitoringForSite(
                                    siteIdentifier
                                )
                        );
                    },
                    createStoreErrorHandler(
                        "sites-monitoring",
                        "stopSiteMonitoring"
                    )
                )
            );
        },
        stopSiteMonitorMonitoring: (
            siteIdentifier: string,
            monitorId: string
        ): Promise<void> => {
            logStoreAction("SitesStore", "stopSiteMonitorMonitoring", {
                monitorId,
                siteIdentifier,
                status: "pending",
            });

            return trackStorePromise(
                withErrorHandling(
                    async (): Promise<void> => {
                        await executeMonitoringOperation(
                            "stopSiteMonitorMonitoring",
                            siteIdentifier,
                            false,
                            () =>
                                monitoringService.stopMonitoringForMonitor(
                                    siteIdentifier,
                                    monitorId
                                ),
                            monitorId
                        );
                    },
                    createStoreErrorHandler(
                        "sites-monitoring",
                        "stopSiteMonitorMonitoring"
                    )
                )
            );
        },
    };
};
