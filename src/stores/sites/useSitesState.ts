/**
 * Sites state management module. Handles core state operations for sites,
 * selected site, and monitor selections.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";
import type { SiteSyncDelta } from "@shared/types/stateSync";
import type { Simplify } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import {
    DuplicateSiteIdentifierError,
    ensureUniqueSiteIdentifiers,
} from "@shared/validation/siteIntegrity";

import type { StatusUpdateSubscriptionSummary } from "./baseTypes";

import { logger } from "../../services/logger";
import { logStoreAction } from "../utils";
import {
    buildMonitoringLockKey,
    type OptimisticMonitoringLock,
} from "./utils/optimisticMonitoringLock";

const lockExpiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

const cancelLockExpiryTimer = (key: string): void => {
    const timerId = lockExpiryTimers.get(key);
    if (timerId !== undefined) {
        globalThis.clearTimeout(timerId);
        lockExpiryTimers.delete(key);
    }
};

/**
 * Sites state interface for managing site data and selection.
 *
 * @remarks
 * Defines the core state structure for site management including the sites
 * array, selected site tracking, and UI state for monitor selection.
 *
 * @public
 */
export interface SitesState {
    /** Most recent synchronization delta captured from state sync events. */
    lastSyncDelta: SiteSyncDelta | undefined;
    /**
     * Active optimistic monitoring locks for monitors keyed by site and monitor
     * id.
     */
    optimisticMonitoringLocks: Record<string, OptimisticMonitoringLock>;
    /** Selected monitor IDs per site (UI state, not persisted) */
    selectedMonitorIds: Record<string, string>;
    /** Currently selected site identifier */
    selectedSiteIdentifier: string | undefined;
    /** Array of monitored sites */
    sites: Site[];
    /** Latest status update subscription diagnostics. */
    statusSubscriptionSummary: StatusUpdateSubscriptionSummary | undefined;
}

/**
 * Sites state actions interface for managing site state operations.
 *
 * @remarks
 * Defines the contract for state management operations including CRUD
 * operations for sites and UI state management for selections.
 *
 * @public
 */
export interface SitesStateActions {
    /** Add a site to the store */
    addSite: (site: Site) => void;
    /** Clear optimistic monitoring locks for the provided monitors. */
    clearOptimisticMonitoringLocks: (
        siteIdentifier: string,
        monitorIds: readonly string[]
    ) => void;
    /** Returns a snapshot of the current optimistic monitoring locks */
    getOptimisticMonitoringLocks: () => Record<
        string,
        OptimisticMonitoringLock
    >;
    /** Get selected monitor ID for a site */
    getSelectedMonitorId: (siteIdentifier: string) => string | undefined;
    /** Get the currently selected site */
    getSelectedSite: () => Site | undefined;
    /** Record the latest site synchronization delta */
    recordSiteSyncDelta: (delta: SiteSyncDelta | undefined) => void;
    /** Register optimistic monitoring locks for monitors. */
    registerOptimisticMonitoringLock: (
        siteIdentifier: string,
        monitorIds: readonly string[],
        monitoring: boolean,
        durationMs: number
    ) => void;
    /** Remove a site from the store */
    removeSite: (identifier: string) => void;
    /** Select a site for focused operations and UI display */
    selectSite: (site: Site | undefined) => void;
    /** Set selected monitor ID for a site */
    setSelectedMonitorId: (siteIdentifier: string, monitorId: string) => void;
    /** Set sites data */
    setSites: (sites: Site[]) => void;
    /** Persist status subscription diagnostics */
    setStatusSubscriptionSummary: (
        summary: StatusUpdateSubscriptionSummary | undefined
    ) => void;
}

/**
 * Combined sites state store type including state and actions.
 *
 * @remarks
 * Provides a complete interface for site state management combining both the
 * state structure and the action methods. Uses Simplify to flatten the
 * intersection type for better IntelliSense and cleaner type display.
 *
 * @public
 */
export type SitesStateStore = Simplify<SitesState & SitesStateActions>;

/**
 * Creates state management actions for the sites store.
 *
 * @param set - Zustand state setter function for updating store state
 * @param get - Zustand state getter function for reading current state
 *
 * @returns Object containing all state management action functions.
 *
 * @public
 */
export const createSitesStateActions = (
    set: (function_: (state: SitesState) => Partial<SitesState>) => void,
    get: () => SitesState
): SitesStateActions => {
    const scheduleLockExpiry = (
        siteIdentifier: string,
        monitorId: string,
        durationMs: number
    ): void => {
        const key = buildMonitoringLockKey(siteIdentifier, monitorId);
        cancelLockExpiryTimer(key);

        const timeoutId = globalThis.setTimeout(() => {
            lockExpiryTimers.delete(key);
            const now = Date.now();
            set((state) => {
                const lock = state.optimisticMonitoringLocks[key];
                if (!lock || lock.expiresAt > now) {
                    return {};
                }

                const nextLocks = {
                    ...state.optimisticMonitoringLocks,
                };
                const removed = Reflect.deleteProperty(nextLocks, key);
                return removed ? { optimisticMonitoringLocks: nextLocks } : {};
            });
        }, durationMs + 25);

        lockExpiryTimers.set(key, timeoutId);
    };

    return {
        addSite: (site: Site): void => {
            logStoreAction("SitesStore", "addSite", { site });
            set((state) => ({ sites: [...state.sites, site] }));
        },
        clearOptimisticMonitoringLocks: (
            siteIdentifier: string,
            monitorIds: readonly string[]
        ): void => {
            if (monitorIds.length === 0) {
                return;
            }

            set((state) => {
                const currentLocks = { ...state.optimisticMonitoringLocks };
                let changed = false;

                for (const monitorId of monitorIds) {
                    const key = buildMonitoringLockKey(
                        siteIdentifier,
                        monitorId
                    );
                    if (currentLocks[key] !== undefined) {
                        const removed = Reflect.deleteProperty(
                            currentLocks,
                            key
                        );
                        if (removed) {
                            cancelLockExpiryTimer(key);
                            changed = true;
                        }
                    }
                }

                return changed
                    ? { optimisticMonitoringLocks: currentLocks }
                    : {};
            });
        },
        getOptimisticMonitoringLocks: () => ({
            ...get().optimisticMonitoringLocks,
        }),
        getSelectedMonitorId: (siteIdentifier: string): string | undefined => {
            const ids = get().selectedMonitorIds;

            return ids[siteIdentifier];
        },
        getSelectedSite: (): Site | undefined => {
            const { selectedSiteIdentifier, sites } = get();
            if (!selectedSiteIdentifier) {
                return undefined;
            }
            return (
                sites.find(
                    (site) => site.identifier === selectedSiteIdentifier
                ) ?? undefined
            );
        },
        recordSiteSyncDelta: (delta: SiteSyncDelta | undefined): void => {
            logStoreAction("SitesStore", "recordSiteSyncDelta", {
                addedCount: delta?.addedSites.length ?? 0,
                removedCount: delta?.removedSiteIdentifiers.length ?? 0,
                updatedCount: delta?.updatedSites.length ?? 0,
            });
            set(() => ({ lastSyncDelta: delta }));
        },
        registerOptimisticMonitoringLock: (
            siteIdentifier: string,
            monitorIds: readonly string[],
            monitoring: boolean,
            durationMs: number
        ): void => {
            if (monitorIds.length === 0) {
                return;
            }

            const expiresAt = Date.now() + Math.max(durationMs, 0);

            set((state) => {
                const optimisticMonitoringLocks = {
                    ...state.optimisticMonitoringLocks,
                };

                for (const monitorId of monitorIds) {
                    const key = buildMonitoringLockKey(
                        siteIdentifier,
                        monitorId
                    );
                    optimisticMonitoringLocks[key] = {
                        expiresAt,
                        monitoring,
                    } satisfies OptimisticMonitoringLock;
                }

                return { optimisticMonitoringLocks };
            });

            for (const monitorId of monitorIds) {
                const key = buildMonitoringLockKey(siteIdentifier, monitorId);
                if (durationMs > 0) {
                    scheduleLockExpiry(siteIdentifier, monitorId, durationMs);
                } else {
                    cancelLockExpiryTimer(key);
                }
            }
        },
        removeSite: (identifier: string): void => {
            logStoreAction("SitesStore", "removeSite", { identifier });
            set((state) => {
                const currentMonitorIds = state.selectedMonitorIds;

                const remainingMonitorIds = Object.fromEntries(
                    Object.entries(currentMonitorIds).filter(
                        ([key]) => key !== identifier
                    )
                );
                return {
                    selectedMonitorIds: remainingMonitorIds,
                    selectedSiteIdentifier:
                        state.selectedSiteIdentifier === identifier
                            ? undefined
                            : state.selectedSiteIdentifier,
                    sites: state.sites.filter(
                        (site) => site.identifier !== identifier
                    ),
                };
            });
        },
        selectSite: (site: Site | undefined): void => {
            logStoreAction("SitesStore", "selectSite", { site });
            set(() => ({
                selectedSiteIdentifier: site ? site.identifier : undefined,
            }));
        },
        setSelectedMonitorId: (
            siteIdentifier: string,
            monitorId: string
        ): void => {
            logStoreAction("SitesStore", "setSelectedMonitorId", {
                monitorId,
                siteIdentifier,
            });
            set((state) => ({
                selectedMonitorIds: {
                    ...state.selectedMonitorIds,
                    [siteIdentifier]: monitorId,
                },
            }));
        },
        setSites: (sites: Site[]): void => {
            try {
                ensureUniqueSiteIdentifiers(sites, "SitesStore.setSites");
            } catch (error: unknown) {
                if (error instanceof DuplicateSiteIdentifierError) {
                    logger.error(
                        "Duplicate site identifiers detected while replacing sites state",
                        {
                            duplicates: error.duplicates,
                            siteCount: sites.length,
                        }
                    );
                    throw error;
                }

                const normalizedError = ensureError(error);
                logger.error(
                    "Unexpected error while validating sites before state replacement",
                    normalizedError
                );
                throw normalizedError;
            }

            logStoreAction("SitesStore", "setSites", { count: sites.length });

            const locks = get().optimisticMonitoringLocks;
            const lockEntries = Object.entries(locks);

            const now = Date.now();
            const expiredLockKeys: string[] = [];
            let mutatedSiteCount = 0;

            const normalizedSites =
                lockEntries.length === 0
                    ? sites
                    : sites.map((site) => {
                          let siteMutated = false;
                          const normalizedMonitors: Monitor[] = [];

                          for (const monitor of site.monitors) {
                              const lockKey = buildMonitoringLockKey(
                                  site.identifier,
                                  monitor.id
                              );
                              const lock = locks[lockKey];

                              if (!lock) {
                                  normalizedMonitors.push(monitor);
                              } else if (lock.expiresAt <= now) {
                                  expiredLockKeys.push(lockKey);
                                  normalizedMonitors.push(monitor);
                              } else if (
                                  monitor.monitoring === lock.monitoring
                              ) {
                                  normalizedMonitors.push(monitor);
                              } else {
                                  siteMutated = true;
                                  normalizedMonitors.push({
                                      ...monitor,
                                      monitoring: lock.monitoring,
                                  });
                              }
                          }

                          if (!siteMutated) {
                              return site;
                          }

                          mutatedSiteCount += 1;
                          return {
                              ...site,
                              monitors: normalizedMonitors,
                          } satisfies Site;
                      });

            let sitesForState = sites;
            if (mutatedSiteCount > 0) {
                sitesForState = normalizedSites;
            }

            set((state) => {
                const validIdentifiers = new Set(
                    sitesForState.map((site) => site.identifier)
                );

                const nextSelectedSiteIdentifier =
                    state.selectedSiteIdentifier !== undefined &&
                    validIdentifiers.has(state.selectedSiteIdentifier)
                        ? state.selectedSiteIdentifier
                        : undefined;

                const siteLookup = new Map(
                    sitesForState.map(
                        (site) => [site.identifier, site] as const
                    )
                );

                const nextSelectedMonitorIds: Record<string, string> = {};
                for (const [siteId, monitorId] of Object.entries(
                    state.selectedMonitorIds
                )) {
                    if (validIdentifiers.has(siteId)) {
                        const candidateSite = siteLookup.get(siteId);
                        if (
                            candidateSite?.monitors.some(
                                (monitor) => monitor.id === monitorId
                            )
                        ) {
                            nextSelectedMonitorIds[siteId] = monitorId;
                        }
                    }
                }

                let { optimisticMonitoringLocks } = state;
                if (expiredLockKeys.length > 0) {
                    optimisticMonitoringLocks = {
                        ...optimisticMonitoringLocks,
                    };
                    for (const key of expiredLockKeys) {
                        const removed = Reflect.deleteProperty(
                            optimisticMonitoringLocks,
                            key
                        );
                        if (removed) {
                            cancelLockExpiryTimer(key);
                        }
                    }
                }

                return {
                    optimisticMonitoringLocks,
                    selectedMonitorIds: nextSelectedMonitorIds,
                    selectedSiteIdentifier: nextSelectedSiteIdentifier,
                    sites: sitesForState,
                };
            });
        },
        setStatusSubscriptionSummary: (
            summary: StatusUpdateSubscriptionSummary | undefined
        ): void => {
            logStoreAction("SitesStore", "setStatusSubscriptionSummary", {
                expectedListeners: summary?.expectedListeners,
                listenersAttached: summary?.listenersAttached,
                success: summary?.success,
            });
            set(() => ({ statusSubscriptionSummary: summary }));
        },
    };
};

/**
 * Initial state for the sites store. Provides default values for all state
 * properties.
 *
 * @public
 */
export const initialSitesState: SitesState = {
    lastSyncDelta: undefined,
    optimisticMonitoringLocks: {},
    selectedMonitorIds: {},
    selectedSiteIdentifier: undefined,
    sites: [],
    statusSubscriptionSummary: undefined,
};
