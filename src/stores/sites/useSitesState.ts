/**
 * Sites state management module. Handles core state operations for sites,
 * selected site, and monitor selections.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";
import type { SiteSyncDelta } from "@shared/types/stateSync";
import type { Simplify } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import {
    DuplicateSiteIdentifierError,
    ensureUniqueSiteIdentifiers,
} from "@shared/validation/siteIntegrity";
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { isDefined, isEmpty, objectEntries, setHas } from "ts-extras";

import type { StatusUpdateSubscriptionSummary } from "./baseTypes";

import { logger } from "../../services/logger";
import { logStoreAction } from "../utils";
import {
    buildMonitoringLockKey,
    isOptimisticLockKey,
    type OptimisticLockKey,
    type OptimisticMonitoringLock,
} from "./utils/optimisticMonitoringLock";
import {
    buildSiteSelectionTelemetry,
    buildSiteTelemetry,
    safeTextForTelemetry,
} from "./utils/siteTelemetry";

const lockExpiryTimers = new Map<
    OptimisticLockKey,
    ReturnType<typeof setTimeout>
>();

const cancelLockExpiryTimer = (key: OptimisticLockKey): void => {
    const timerId = lockExpiryTimers.get(key);
    if (isDefined(timerId)) {
        globalThis.clearTimeout(timerId);
        lockExpiryTimers.delete(key);
    }
};

type OptimisticLockEntry = [OptimisticLockKey, OptimisticMonitoringLock];

const createOptimisticMonitoringLockMap =
    (): SitesState["optimisticMonitoringLocks"] =>
        createNullPrototypeObject<SitesState["optimisticMonitoringLocks"]>();

const setOptimisticMonitoringLockEntry = (
    target: SitesState["optimisticMonitoringLocks"],
    key: OptimisticLockKey,
    value: OptimisticMonitoringLock | undefined
): void => {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
};

const getOptimisticMonitoringLockEntry = (
    locks: SitesState["optimisticMonitoringLocks"],
    key: OptimisticLockKey
): OptimisticMonitoringLock | undefined =>
    Object.hasOwn(locks, key) ? locks[key] : undefined;

const cloneOptimisticMonitoringLocks = (
    locks: SitesState["optimisticMonitoringLocks"]
): SitesState["optimisticMonitoringLocks"] => {
    const nextLocks = createOptimisticMonitoringLockMap();

    for (const [key, lock] of objectEntries(locks)) {
        if (isOptimisticLockKey(key)) {
            setOptimisticMonitoringLockEntry(nextLocks, key, lock);
        }
    }

    return nextLocks;
};

const collectActiveLockEntries = (
    locks: SitesState["optimisticMonitoringLocks"]
): OptimisticLockEntry[] => {
    const entries: OptimisticLockEntry[] = [];

    for (const [rawKey, lock] of objectEntries(locks)) {
        if (isOptimisticLockKey(rawKey) && isDefined(lock)) {
            entries.push([rawKey, lock]);
        }
    }

    return entries;
};

type SelectedMonitorEntry = [Site["identifier"], Monitor["id"]];

const createSelectedMonitorIdMap = (): SitesState["selectedMonitorIds"] =>
    createNullPrototypeObject<SitesState["selectedMonitorIds"]>();

const setSelectedMonitorIdEntry = (
    target: SitesState["selectedMonitorIds"],
    siteIdentifier: Site["identifier"],
    monitorId: Monitor["id"] | undefined
): void => {
    Object.defineProperty(target, siteIdentifier, {
        configurable: true,
        enumerable: true,
        value: monitorId,
        writable: true,
    });
};

const getSelectedMonitorIdEntry = (
    selectedMonitorIds: SitesState["selectedMonitorIds"],
    siteIdentifier: Site["identifier"]
): Monitor["id"] | undefined =>
    Object.hasOwn(selectedMonitorIds, siteIdentifier)
        ? selectedMonitorIds[siteIdentifier]
        : undefined;

const collectSelectedMonitorEntries = (
    selectedMonitorIds: SitesState["selectedMonitorIds"]
): SelectedMonitorEntry[] => {
    const entries: SelectedMonitorEntry[] = [];

    for (const [siteId, monitorId] of objectEntries(selectedMonitorIds)) {
        if (typeof monitorId === "string") {
            entries.push([siteId, monitorId]);
        }
    }

    return entries;
};

const cloneSelectedMonitorIds = (
    selectedMonitorIds: SitesState["selectedMonitorIds"]
): SitesState["selectedMonitorIds"] => {
    const nextSelectedMonitorIds = createSelectedMonitorIdMap();

    for (const [siteId, monitorId] of collectSelectedMonitorEntries(
        selectedMonitorIds
    )) {
        setSelectedMonitorIdEntry(nextSelectedMonitorIds, siteId, monitorId);
    }

    return nextSelectedMonitorIds;
};

const omitSelectedMonitorEntryForSite = (
    selectedMonitorIds: SitesState["selectedMonitorIds"],
    identifier: Site["identifier"]
): SitesState["selectedMonitorIds"] => {
    const remainingMonitorIds = createSelectedMonitorIdMap();

    for (const [siteId, monitorId] of collectSelectedMonitorEntries(
        selectedMonitorIds
    )) {
        if (siteId !== identifier) {
            setSelectedMonitorIdEntry(remainingMonitorIds, siteId, monitorId);
        }
    }

    return remainingMonitorIds;
};

const collectOptimisticLockKeysForSite = (site: Site): OptimisticLockKey[] =>
    site.monitors.map((monitor) =>
        buildMonitoringLockKey(site.identifier, monitor.id)
    );

const collectOptimisticLockKeysForSites = (
    sites: readonly Site[]
): Set<OptimisticLockKey> => {
    const keys = new Set<OptimisticLockKey>();

    for (const site of sites) {
        for (const key of collectOptimisticLockKeysForSite(site)) {
            keys.add(key);
        }
    }

    return keys;
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
    /** Latest database backup metadata for UI display and diagnostics. */
    lastBackupMetadata: SerializedDatabaseBackupMetadata | undefined;
    /** Most recent synchronization delta captured from state sync events. */
    lastSyncDelta: SiteSyncDelta | undefined;
    /**
     * Active optimistic monitoring locks for monitors keyed by site and monitor
     * id.
     */
    optimisticMonitoringLocks: Partial<
        Record<string, OptimisticMonitoringLock>
    >;
    /** Selected monitor IDs per site (UI state, not persisted) */
    selectedMonitorIds: Partial<Record<Site["identifier"], Monitor["id"]>>;
    /** Currently selected site identifier */
    selectedSiteIdentifier: Site["identifier"] | undefined;
    /** Array of monitored sites */
    sites: Site[];
    /**
     * Monotonic counter incremented whenever the `sites` collection changes.
     *
     * @remarks
     * Used to detect and prevent stale full-sync responses from overwriting
     * newer local mutations (e.g., user creates a site while an initial sync is
     * still in-flight).
     */
    sitesRevision: number;
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
    /** Replace a site snapshot in the store */
    /**
     * Applies a site snapshot to local state.
     *
     * @remarks
     * This is a local state mutation helper (replace-by-identifier).
     */
    applySiteSnapshot: (site: Site) => void;
    /** Clear optimistic monitoring locks for the provided monitors. */
    clearOptimisticMonitoringLocks: (
        siteIdentifier: Site["identifier"],
        monitorIds: readonly Monitor["id"][]
    ) => void;
    /** Returns a snapshot of the current optimistic monitoring locks */
    getOptimisticMonitoringLocks: () => Partial<
        Record<string, OptimisticMonitoringLock>
    >;
    /** Get selected monitor ID for a site */
    getSelectedMonitorId: (
        siteIdentifier: Site["identifier"]
    ) => Monitor["id"] | undefined;
    getSelectedSite: () => Site | undefined;
    /** Record the latest site synchronization delta */
    recordSiteSyncDelta: (delta: SiteSyncDelta | undefined) => void;
    /** Register optimistic monitoring locks for monitors. */
    registerOptimisticMonitoringLock: (
        siteIdentifier: Site["identifier"],
        monitorIds: readonly Monitor["id"][],
        monitoring: boolean,
        durationMs: number
    ) => void;
    /** Remove a site from the store */
    removeSite: (identifier: Site["identifier"]) => void;
    /** Select a site for focused operations and UI display */
    selectSite: (site: Site | undefined) => void;
    /** Persist latest backup metadata for future display. */
    setLastBackupMetadata: (
        metadata: SerializedDatabaseBackupMetadata | undefined
    ) => void;
    /** Set selected monitor ID for a site */
    setSelectedMonitorId: (
        siteIdentifier: Site["identifier"],
        monitorId: Monitor["id"]
    ) => void;
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
        siteIdentifier: Site["identifier"],
        monitorId: Monitor["id"],
        durationMs: number
    ): void => {
        const key = buildMonitoringLockKey(siteIdentifier, monitorId);
        cancelLockExpiryTimer(key);

        const timeoutId = globalThis.setTimeout(() => {
            lockExpiryTimers.delete(key);
            const now = Date.now();
            set((state) => {
                const lock = getOptimisticMonitoringLockEntry(
                    state.optimisticMonitoringLocks,
                    key
                );
                if (!lock || lock.expiresAt > now) {
                    return {};
                }

                const nextLocks = cloneOptimisticMonitoringLocks(
                    state.optimisticMonitoringLocks
                );
                const isRemoved = Reflect.deleteProperty(nextLocks, key);
                return isRemoved
                    ? { optimisticMonitoringLocks: nextLocks }
                    : {};
            });
        }, durationMs + 25);

        lockExpiryTimers.set(key, timeoutId);
    };

    return {
        addSite: (site: Site): void => {
            logStoreAction("SitesStore", "addSite", buildSiteTelemetry(site));
            set((state) => ({
                sites: [...state.sites, site],
                sitesRevision: state.sitesRevision + 1,
            }));
        },
        applySiteSnapshot: (site: Site): void => {
            logStoreAction("SitesStore", "applySiteSnapshot", {
                siteIdentifier: safeTextForTelemetry(site.identifier),
            });
            set((state) => {
                const hasSite = state.sites.some(
                    (existing) => existing.identifier === site.identifier
                );

                if (!hasSite) {
                    return {};
                }

                return {
                    sites: state.sites.map((existing) =>
                        existing.identifier === site.identifier
                            ? site
                            : existing
                    ),
                    sitesRevision: state.sitesRevision + 1,
                };
            });
        },
        clearOptimisticMonitoringLocks: (
            siteIdentifier: Site["identifier"],
            monitorIds: readonly Monitor["id"][]
        ): void => {
            if (isEmpty(monitorIds)) {
                return;
            }

            set((state) => {
                const currentLocks = cloneOptimisticMonitoringLocks(
                    state.optimisticMonitoringLocks
                );
                let isChanged = false;

                for (const monitorId of monitorIds) {
                    const key = buildMonitoringLockKey(
                        siteIdentifier,
                        monitorId
                    );
                    if (
                        isDefined(
                            getOptimisticMonitoringLockEntry(currentLocks, key)
                        )
                    ) {
                        const isRemoved = Reflect.deleteProperty(
                            currentLocks,
                            key
                        );
                        if (isRemoved) {
                            cancelLockExpiryTimer(key);
                            isChanged = true;
                        }
                    }
                }

                return isChanged
                    ? { optimisticMonitoringLocks: currentLocks }
                    : {};
            });
        },
        getOptimisticMonitoringLocks: () =>
            cloneOptimisticMonitoringLocks(get().optimisticMonitoringLocks),
        getSelectedMonitorId: (
            siteIdentifier: Site["identifier"]
        ): Monitor["id"] | undefined => {
            const ids = get().selectedMonitorIds;

            return getSelectedMonitorIdEntry(ids, siteIdentifier);
        },
        getSelectedSite: (): Site | undefined => {
            const { selectedSiteIdentifier, sites } = get();
            if (!selectedSiteIdentifier) {
                return undefined;
            }
            return sites.find(
                (site) => site.identifier === selectedSiteIdentifier
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
            siteIdentifier: Site["identifier"],
            monitorIds: readonly Monitor["id"][],
            monitoring: boolean,
            durationMs: number
        ): void => {
            if (isEmpty(monitorIds)) {
                return;
            }

            if (durationMs <= 0) {
                for (const monitorId of monitorIds) {
                    cancelLockExpiryTimer(
                        buildMonitoringLockKey(siteIdentifier, monitorId)
                    );
                }
                return;
            }

            const expiresAt = Date.now() + durationMs;

            set((state) => {
                const optimisticMonitoringLocks =
                    cloneOptimisticMonitoringLocks(
                        state.optimisticMonitoringLocks
                    );

                for (const monitorId of monitorIds) {
                    const key = buildMonitoringLockKey(
                        siteIdentifier,
                        monitorId
                    );
                    setOptimisticMonitoringLockEntry(
                        optimisticMonitoringLocks,
                        key,
                        {
                            expiresAt,
                            monitoring,
                        }
                    );
                }

                return { optimisticMonitoringLocks };
            });

            for (const monitorId of monitorIds) {
                scheduleLockExpiry(siteIdentifier, monitorId, durationMs);
            }
        },
        removeSite: (identifier: Site["identifier"]): void => {
            logStoreAction("SitesStore", "removeSite", {
                siteIdentifier: safeTextForTelemetry(identifier),
            });
            set((state) => {
                const removedSite = state.sites.find(
                    (site) => site.identifier === identifier
                );
                const remainingMonitorIds = omitSelectedMonitorEntryForSite(
                    state.selectedMonitorIds,
                    identifier
                );

                let optimisticMonitoringLocks = state.optimisticMonitoringLocks;
                if (removedSite) {
                    optimisticMonitoringLocks = cloneOptimisticMonitoringLocks(
                        optimisticMonitoringLocks
                    );
                    for (const key of collectOptimisticLockKeysForSite(
                        removedSite
                    )) {
                        const isRemoved = Reflect.deleteProperty(
                            optimisticMonitoringLocks,
                            key
                        );
                        if (isRemoved) {
                            cancelLockExpiryTimer(key);
                        }
                    }
                }

                return {
                    optimisticMonitoringLocks,
                    selectedMonitorIds: remainingMonitorIds,
                    selectedSiteIdentifier:
                        state.selectedSiteIdentifier === identifier
                            ? undefined
                            : state.selectedSiteIdentifier,
                    sites: state.sites.filter(
                        (site) => site.identifier !== identifier
                    ),
                    sitesRevision: state.sitesRevision + 1,
                };
            });
        },
        selectSite: (site: Site | undefined): void => {
            logStoreAction(
                "SitesStore",
                "selectSite",
                buildSiteSelectionTelemetry(site)
            );
            set(() => ({
                selectedSiteIdentifier: site ? site.identifier : undefined,
            }));
        },
        setLastBackupMetadata: (
            metadata: SerializedDatabaseBackupMetadata | undefined
        ): void => {
            logStoreAction("SitesStore", "setLastBackupMetadata", {
                checksum: metadata?.checksum,
                schemaVersion: metadata?.schemaVersion,
                sizeBytes: metadata?.sizeBytes,
            });
            set(() => ({ lastBackupMetadata: metadata }));
        },
        setSelectedMonitorId: (
            siteIdentifier: Site["identifier"],
            monitorId: Monitor["id"]
        ): void => {
            logStoreAction("SitesStore", "setSelectedMonitorId", {
                monitorId,
                siteIdentifier: safeTextForTelemetry(siteIdentifier),
            });
            set((state) => ({
                selectedMonitorIds: (() => {
                    const selectedMonitorIds = cloneSelectedMonitorIds(
                        state.selectedMonitorIds
                    );
                    setSelectedMonitorIdEntry(
                        selectedMonitorIds,
                        siteIdentifier,
                        monitorId
                    );
                    return selectedMonitorIds;
                })(),
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

            const currentState = get();
            const locks = currentState.optimisticMonitoringLocks;
            const currentValidLockKeys = collectOptimisticLockKeysForSites(
                currentState.sites
            );
            const lockEntries = collectActiveLockEntries(locks);
            const applicableLockKeys = new Set(
                lockEntries
                    .filter(([key]) => setHas(currentValidLockKeys, key))
                    .map(([key]) => key)
            );

            const now = Date.now();
            const expiredLockKeys: OptimisticLockKey[] = [];
            let mutatedSiteCount = 0;

            const normalizedSites =
                applicableLockKeys.size === 0
                    ? sites
                    : sites.map((site) => {
                          let isSiteMutated = false;
                          const normalizedMonitors: Monitor[] = [];

                          for (const monitor of site.monitors) {
                              const lockKey = buildMonitoringLockKey(
                                  site.identifier,
                                  monitor.id
                              );
                              const lock = setHas(applicableLockKeys, lockKey)
                                  ? getOptimisticMonitoringLockEntry(
                                        locks,
                                        lockKey
                                    )
                                  : undefined;

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
                                  isSiteMutated = true;
                                  normalizedMonitors.push({
                                      ...monitor,
                                      monitoring: lock.monitoring,
                                  });
                              }
                          }

                          if (!isSiteMutated) {
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
                const {
                    optimisticMonitoringLocks:
                        optimisticMonitoringLocksFromState,
                    selectedMonitorIds,
                    selectedSiteIdentifier,
                    sitesRevision,
                } = state;
                const validIdentifiers = new Set<Site["identifier"]>(
                    sitesForState.map((site) => site.identifier)
                );

                const nextSelectedSiteIdentifier =
                    isDefined(selectedSiteIdentifier) &&
                    setHas(validIdentifiers, selectedSiteIdentifier)
                        ? selectedSiteIdentifier
                        : undefined;

                const siteLookup = new Map<Site["identifier"], Site>(
                    sitesForState.map(
                        (site) => [site.identifier, site] as const
                    )
                );

                const nextValidLockKeys =
                    collectOptimisticLockKeysForSites(sitesForState);

                const nextSelectedMonitorIds = createSelectedMonitorIdMap();
                for (const [siteId, monitorId] of collectSelectedMonitorEntries(
                    selectedMonitorIds
                )) {
                    if (!setHas(validIdentifiers, siteId)) {
                        continue;
                    }

                    const candidateSite = siteLookup.get(siteId);
                    if (
                        candidateSite?.monitors.some(
                            (monitor) => monitor.id === monitorId
                        )
                    ) {
                        setSelectedMonitorIdEntry(
                            nextSelectedMonitorIds,
                            siteId,
                            monitorId
                        );
                    }
                }

                let optimisticMonitoringLocks =
                    optimisticMonitoringLocksFromState;
                const lockKeysToPrune = new Set<OptimisticLockKey>(
                    expiredLockKeys
                );
                for (const [key] of collectActiveLockEntries(
                    optimisticMonitoringLocksFromState
                )) {
                    if (
                        !setHas(applicableLockKeys, key) ||
                        !setHas(nextValidLockKeys, key)
                    ) {
                        lockKeysToPrune.add(key);
                    }
                }

                if (lockKeysToPrune.size > 0) {
                    optimisticMonitoringLocks = cloneOptimisticMonitoringLocks(
                        optimisticMonitoringLocks
                    );
                    for (const key of lockKeysToPrune) {
                        const isRemoved = Reflect.deleteProperty(
                            optimisticMonitoringLocks,
                            key
                        );
                        if (isRemoved) {
                            cancelLockExpiryTimer(key);
                        }
                    }
                }

                return {
                    optimisticMonitoringLocks,
                    selectedMonitorIds: nextSelectedMonitorIds,
                    selectedSiteIdentifier: nextSelectedSiteIdentifier,
                    sites: sitesForState,
                    sitesRevision: sitesRevision + 1,
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
    lastBackupMetadata: undefined,
    lastSyncDelta: undefined,
    optimisticMonitoringLocks: createOptimisticMonitoringLockMap(),
    selectedMonitorIds: createSelectedMonitorIdMap(),
    selectedSiteIdentifier: undefined,
    sites: [],
    sitesRevision: 0,
    statusSubscriptionSummary: undefined,
};
