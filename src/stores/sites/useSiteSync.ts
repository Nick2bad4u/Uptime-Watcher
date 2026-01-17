/**
 * Site synchronization operations module.
 *
 * @remarks
 * Provides comprehensive site synchronization functionality including:
 *
 * - Full backend synchronization
 * - Real-time status updates via event subscriptions
 * - Sync status monitoring and reporting
 * - Centralized error handling through the error store
 *
 * All operations are designed to work with the Zustand-based sites store and
 * maintain consistency between frontend state and backend data.
 *
 * @packageDocumentation
 */
import type { Site, StatusUpdate } from "@shared/types";
import type {
    BulkStateSyncEventData,
    DeltaStateSyncEventData,
    StateSyncEventData,
} from "@shared/types/events";
import type {
    SiteSyncDelta,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { UnknownRecord } from "type-fest";

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import {
    deriveSiteSnapshot,
    hasSiteSyncChanges,
    prepareSiteSyncSnapshot,
} from "@shared/utils/siteSnapshots";

import type {
    StatusUpdateSubscriptionSummary,
    StatusUpdateUnsubscribeResult,
} from "./baseTypes";

import { logger } from "../../services/logger";
import { StateSyncService } from "../../services/StateSyncService";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import { buildSanitizedIncomingSiteSyncDelta } from "./useSiteSync.deltaSanitizer";
import {
    StatusUpdateManager,
    type StatusUpdateSubscriptionResult,
} from "./utils/statusUpdateHandler";

/**
 * Site synchronization actions interface.
 *
 * These actions are designed to work within the Zustand store architecture and
 * provide consistent error handling and logging.
 *
 * @public
 */
export interface SiteSyncActions {
    /**
     * Performs complete resynchronization from the backend with full state
     * replacement.
     *
     * @remarks
     * Triggers a comprehensive sync operation that replaces all local site data
     * with authoritative information from the backend. This method provides
     * complete data consistency and is used for recovery scenarios.
     *
     * @returns Promise that resolves when synchronization is complete
     */
    fullResyncSites: () => Promise<void>;

    /**
     * Retrieves current synchronization status from the backend.
     *
     * @remarks
     * Provides detailed information about the sync state including:
     *
     * - Last synchronization timestamp
     * - Current site count
     * - Origin of the synchronized data
     * - Whether the renderer is in sync with the backend
     *
     * @returns Promise resolving to sync status information
     */
    getSyncStatus: () => Promise<StateSyncStatusSummary>;

    /** Retry status update subscription using the most recent callback */
    retryStatusSubscription: (
        callback?: (update: StatusUpdate) => void
    ) => Promise<StatusUpdateSubscriptionSummary>;

    /**
     * Establishes subscription to real-time status updates.
     *
     * @remarks
     * Sets up event listeners for monitor status changes from the backend. Uses
     * the shared StatusUpdateManager to handle:
     *
     * - Race condition prevention
     * - Fallback mechanisms
     * - Efficient incremental updates
     *
     * @param callback - Function to call when status updates are received
     *
     * @returns Subscription result with success indicators
     */
    subscribeToStatusUpdates: (
        callback?: (update: StatusUpdate) => void
    ) => Promise<StatusUpdateSubscriptionSummary>;

    /**
     * Establishes subscription to backend synchronization events.
     *
     * @remarks
     * Listens for various sync events including:
     *
     * - Bulk synchronization events
     * - Individual site updates
     * - Site deletions
     *
     * Automatically handles different event types and triggers appropriate
     * local state updates.
     *
     * @returns Cleanup function to remove event listeners
     */
    subscribeToSyncEvents: () => () => void;

    /**
     * Synchronizes sites data with backend while preserving local state.
     *
     * @remarks
     * Fetches the latest site data from the backend and updates the local store
     * state. Includes comprehensive error handling and logging for debugging
     * purposes.
     *
     * This is the core synchronization method used by other sync operations.
     *
     * @returns Promise that resolves when sync is complete
     */
    syncSites: () => Promise<void>;

    /**
     * Removes subscription to status updates.
     *
     * @remarks
     * Cleanly unsubscribes from status update events and releases associated
     * resources. Should be called when components unmount or when status
     * updates are no longer needed.
     *
     * @returns Unsubscription result with success indicators
     */
    unsubscribeFromStatusUpdates: () => StatusUpdateUnsubscribeResult;
}

/**
 * @remarks
 * These dependencies are injected into the sync actions to maintain separation
 * of concerns and enable easier testing. The dependencies provide access to the
 * site state without direct coupling to the Zustand store implementation.
 *
 * @public
 */
export interface SiteSyncDependencies {
    /** Function to get current sites from the store */
    getSites: () => Site[];

    /** Returns the current sites revision counter. */
    getSitesRevision: () => number;

    /** Optional callback to receive diffed site synchronization events */
    onSiteDelta?: (delta: SiteSyncDelta) => void;

    /** Function to update sites in the store */
    setSites: (sites: Site[]) => void;

    /** Function to persist subscription diagnostics */
    setStatusSubscriptionSummary: (
        summary: StatusUpdateSubscriptionSummary | undefined
    ) => void;
}

// Create a shared status update manager instance - will be initialized when
// first used
// Singleton instance management for status updates, lazily initialized to
// avoid unnecessary object creation
const statusUpdateManager: {
    callback?: (update: StatusUpdate) => void;
    instance?: StatusUpdateManager;
} = {};

/**
 * Resets the module-level status update manager singleton.
 *
 * @remarks
 * The sites sync module keeps a lazily-initialized singleton
 * {@link StatusUpdateManager} instance. This helper exists to support
 * deterministic testing and to avoid leaked event subscriptions when modules
 * are reloaded in development.
 *
 * @internal
 */
export function resetStatusUpdateManagerForTesting(): void {
    statusUpdateManager.instance?.unsubscribe();
    delete statusUpdateManager.instance;
    delete statusUpdateManager.callback;
}

const FALLBACK_EXPECTED_LISTENERS = 4;

const resolveExpectedListenerCount = (): number => {
    const candidate = (
        StatusUpdateManager as {
            EXPECTED_LISTENER_COUNT?: number;
        }
    ).EXPECTED_LISTENER_COUNT;

    return typeof candidate === "number"
        ? candidate
        : FALLBACK_EXPECTED_LISTENERS;
};

const buildStatusSubscriptionFailureSummary = (args: {
    errors: string[];
    expectedListeners: number;
    message: string;
}): StatusUpdateSubscriptionSummary => ({
    errors: args.errors,
    expectedListeners: args.expectedListeners,
    listenersAttached: 0,
    listenerStates: [],
    message: args.message,
    subscribed: false,
    success: false,
});

const resolveManagerExpectedListenerCount = (
    manager: StatusUpdateManager | undefined,
    fallback: number
): number => manager?.getExpectedListenerCount() ?? fallback;

/**
 * Creates site synchronization actions with injected dependencies.
 *
 * @remarks
 * Factory function that creates all site synchronization actions with proper
 * dependency injection. This pattern allows for easier testing and maintains
 * separation of concerns between the sync logic and store state management.
 *
 * The created actions handle:
 *
 * - Full backend synchronization
 * - Real-time status updates via WebSocket-like events
 * - Sync status monitoring and reporting
 * - Error handling and recovery
 *
 * @param deps - Dependencies required for synchronization operations
 *
 * @returns Complete set of synchronization actions
 *
 * @public
 */
export const createSiteSyncActions = (
    deps: SiteSyncDependencies
): SiteSyncActions => {
    // Synchronization state to prevent concurrent syncs
    let pendingSyncPromise: null | Promise<void> = null;

    const syncEventSubscription: {
        cleanup?: () => void;
        pending?: Promise<void>;
        refCount: number;
        shouldCleanupOnReady: boolean;
    } = {
        refCount: 0,
        shouldCleanupOnReady: false,
    };

    /**
     * Normalizes backend site snapshots by removing duplicate identifiers while
     * preserving the first occurrence of each site.
     *
     * @param sites - Raw site collection returned by the backend service.
     *
     * @returns The sanitized site list alongside the identifiers that were
     *   filtered out for observability.
     */
    const actions: SiteSyncActions = {
        fullResyncSites: async (): Promise<void> => {
            // If sync is already in progress, return the existing promise
            if (pendingSyncPromise) {
                logStoreAction("SitesStore", "fullResyncSites", {
                    coalesced: true,
                    message: "Coalesced site resync request",
                    status: "pending",
                });
                return pendingSyncPromise;
            }

            // Start a new sync and store the promise
            pendingSyncPromise = (async (): Promise<void> => {
                logStoreAction("SitesStore", "fullResyncSites", {
                    status: "pending",
                });
                try {
                    await actions.syncSites();
                    logStoreAction("SitesStore", "fullResyncSites", {
                        message: "Full backend resynchronization completed",
                        status: "success",
                        success: true,
                    });
                } catch (error) {
                    const normalizedError = ensureError(error);
                    logStoreAction("SitesStore", "fullResyncSites", {
                        error: normalizedError.message,
                        status: "failure",
                        success: false,
                    });
                    throw error;
                } finally {
                    // Clear the pending promise when done (success or failure)
                    pendingSyncPromise = null;
                }
            })();

            return pendingSyncPromise;
        },
        getSyncStatus: async () => {
            try {
                logStoreAction("SitesStore", "getSyncStatus", {
                    status: "pending",
                });
                const status = await StateSyncService.getSyncStatus();
                logStoreAction("SitesStore", "getSyncStatus", {
                    lastSyncAt: status.lastSyncAt,
                    message: "Sync status retrieved",
                    siteCount: status.siteCount,
                    source: status.source,
                    status: "success",
                    success: true,
                    synchronized: status.synchronized,
                });
                return status;
            } catch (error) {
                const normalizedError = ensureError(error);
                logger.error(
                    "Failed to retrieve sync status:",
                    normalizedError
                );
                logStoreAction("SitesStore", "getSyncStatus", {
                    error: normalizedError.message,
                    status: "failure",
                    success: false,
                });
                return {
                    lastSyncAt: null,
                    siteCount: 0,
                    source: "frontend" as const,
                    synchronized: false,
                } satisfies StateSyncStatusSummary;
            }
        },
        retryStatusSubscription: async (
            callback?: (update: StatusUpdate) => void
        ): Promise<StatusUpdateSubscriptionSummary> => {
            const errorHandler = createStoreErrorHandler(
                "sites-sync",
                "retryStatusSubscription"
            );
            const effectiveCallback = callback ?? statusUpdateManager.callback;

            if (!effectiveCallback) {
                const message =
                    "Retry attempted without previously registered callback";
                const fallbackSummary = buildStatusSubscriptionFailureSummary({
                    errors: [message],
                    expectedListeners: resolveExpectedListenerCount(),
                    message:
                        "Unable to retry status subscription without callback context",
                });

                deps.setStatusSubscriptionSummary(fallbackSummary);
                errorHandler.setError(message);
                logger.error(
                    "Failed to retry status subscription due to missing callback",
                    message
                );
                logStoreAction("SitesStore", "retryStatusSubscription", {
                    ...fallbackSummary,
                    status: "failure",
                });
                return fallbackSummary;
            }

            if (statusUpdateManager.instance) {
                statusUpdateManager.instance.unsubscribe();
                delete statusUpdateManager.instance;
            }

            deps.setStatusSubscriptionSummary(undefined);

            return actions.subscribeToStatusUpdates(effectiveCallback);
        },
        subscribeToStatusUpdates: async (
            callback?: (update: StatusUpdate) => void
        ): Promise<StatusUpdateSubscriptionSummary> => {
            const errorHandler = createStoreErrorHandler(
                "sites-sync",
                "subscribeToStatusUpdates"
            );
            const effectiveCallback = callback ?? statusUpdateManager.callback;

            if (!effectiveCallback) {
                const initializationMessage =
                    "Status update subscription attempted without a callback";
                const fallbackSummary = buildStatusSubscriptionFailureSummary({
                    errors: [initializationMessage],
                    expectedListeners: resolveExpectedListenerCount(),
                    message:
                        "Failed to subscribe to status updates due to missing callback",
                });

                deps.setStatusSubscriptionSummary(fallbackSummary);
                errorHandler.setError(initializationMessage);
                logger.error(
                    "Status update subscription requires a callback",
                    initializationMessage
                );
                logStoreAction("SitesStore", "subscribeToStatusUpdates", {
                    ...fallbackSummary,
                    status: "failure",
                });
                return fallbackSummary;
            }

            statusUpdateManager.callback = effectiveCallback;
            statusUpdateManager.instance ??= new StatusUpdateManager({
                fullResyncSites: actions.fullResyncSites,
                getSites: deps.getSites,
                onUpdate: effectiveCallback,
                setSites: deps.setSites,
            });

            const executeSubscription =
                async (): Promise<StatusUpdateSubscriptionSummary> => {
                    const managerInstance = statusUpdateManager.instance;

                    if (!managerInstance) {
                        const initializationMessage =
                            "StatusUpdateManager instance is not initialized";
                        errorHandler.setError(initializationMessage);
                        logger.error(
                            "Status update subscription attempted without an initialized manager",
                            initializationMessage
                        );
                        const fallbackSummary =
                            buildStatusSubscriptionFailureSummary({
                                errors: [initializationMessage],
                                expectedListeners:
                                    resolveExpectedListenerCount(),
                                message:
                                    "Failed to subscribe to status updates",
                            });

                        deps.setStatusSubscriptionSummary(fallbackSummary);

                        logStoreAction(
                            "SitesStore",
                            "subscribeToStatusUpdates",
                            fallbackSummary
                        );

                        return fallbackSummary;
                    }

                    try {
                        const {
                            errors,
                            expectedListeners,
                            listenersAttached,
                            listenerStates,
                            success,
                        }: StatusUpdateSubscriptionResult =
                            await managerInstance.subscribe();

                        const summary: StatusUpdateSubscriptionSummary = {
                            errors,
                            expectedListeners,
                            listenersAttached,
                            listenerStates,
                            message: success
                                ? "Successfully subscribed to status updates with efficient incremental updates"
                                : "Failed to subscribe to status updates",
                            subscribed: success,
                            success,
                        };

                        deps.setStatusSubscriptionSummary(summary);

                        if (!success) {
                            const detailMessage = `Status update subscription failed (${listenersAttached}/${expectedListeners} listeners attached)`;
                            errorHandler.setError(detailMessage);
                            logger.error(
                                "Status update subscription encountered errors",
                                {
                                    detailMessage,
                                    errors,
                                    expectedListeners,
                                    listenersAttached,
                                }
                            );
                        }

                        logStoreAction(
                            "SitesStore",
                            "subscribeToStatusUpdates",
                            {
                                ...summary,
                                expectedListeners,
                                status: success ? "success" : "failure",
                            }
                        );

                        return summary;
                    } catch (error) {
                        const normalizedError = ensureError(error);
                        errorHandler.setError(normalizedError.message);

                        logger.error(
                            "Status update subscription threw an exception",
                            normalizedError
                        );

                        const failureSummary =
                            buildStatusSubscriptionFailureSummary({
                                errors: [normalizedError.message],
                                expectedListeners:
                                    resolveManagerExpectedListenerCount(
                                        statusUpdateManager.instance,
                                        resolveExpectedListenerCount()
                                    ),
                                message:
                                    "Failed to subscribe to status updates",
                            });

                        deps.setStatusSubscriptionSummary(failureSummary);

                        logStoreAction(
                            "SitesStore",
                            "subscribeToStatusUpdates",
                            {
                                ...failureSummary,
                                status: "failure",
                            }
                        );

                        return failureSummary;
                    }
                };

            return withErrorHandling(executeSubscription, errorHandler);
        },
        subscribeToSyncEvents: (): (() => void) => {
            syncEventSubscription.refCount += 1;

            // A previous cleanup request can set `shouldCleanupOnReady` while
            // subscription setup is still pending. If a new subscriber attaches
            // before setup completes, we must not auto-cleanup on completion.
            syncEventSubscription.shouldCleanupOnReady = false;
            let released = false;

            const shouldAttachSubscription =
                syncEventSubscription.cleanup === undefined &&
                syncEventSubscription.pending === undefined;

            if (shouldAttachSubscription) {
                const logSyncEventReceived = (
                    event: StateSyncEventData
                ): void => {
                const {
                    action,
                    revision,
                    siteIdentifier,
                    source,
                    timestamp,
                } = event;

                let sitesCount: number | undefined = undefined;
                if (action === "bulk-sync") {
                    const { sites } = event;
                    sitesCount = sites.length;
                }

                    logStoreAction("SitesStore", "syncEventReceived", {
                        action,
                        message: `Received sync event: ${action}`,
                        revision,
                        siteIdentifier,
                        source,
                        timestamp,
                        ...(typeof sitesCount === "number"
                            ? { sitesCount }
                            : {}),
                    });
                };

            const applySnapshotEvent = (event: BulkStateSyncEventData): void => {
                const {
                    action,
                    revision,
                    siteIdentifier,
                    sites,
                    source,
                    timestamp,
                } = event;

                const snapshot = prepareSiteSyncSnapshot({
                    previousSnapshot: deps.getSites(),
                    sites,
                });

                const { delta, duplicates, emissionSnapshot } = snapshot;

                if (duplicates.length > 0) {
                    logger.error(
                        "Duplicate site identifiers detected in state sync snapshot",
                        {
                            action,
                            duplicates,
                            originalSiteCount: sites.length,
                            sanitizedSiteCount: emissionSnapshot.length,
                            source,
                        }
                    );
                }

                const hasChanges = hasSiteSyncChanges(delta);

                logStoreAction("SitesStore", "applySyncDelta", {
                    action,
                    addedCount: delta.addedSites.length,
                    removedCount: delta.removedSiteIdentifiers.length,
                    sanitizedSiteCount: emissionSnapshot.length,
                    source,
                    timestamp,
                    updatedCount: delta.updatedSites.length,
                });

                if (!hasChanges) {
                    logger.debug(
                        "Sync snapshot did not change site state; skipping store update",
                        {
                            action,
                            revision,
                            siteIdentifier,
                            source,
                            timestamp,
                        }
                    );
                    deps.onSiteDelta?.(delta);
                    return;
                }

                deps.setSites(emissionSnapshot);
                deps.onSiteDelta?.(delta);
            };

            const applyDeltaEvent = (event: DeltaStateSyncEventData): void => {
                const {
                    action,
                    delta,
                    revision,
                    siteIdentifier,
                    source,
                    timestamp,
                } = event;

                const {
                    delta: sanitizedDelta,
                    diagnostics: {
                        addedDuplicates,
                        overlapIdentifiers,
                        updatedDuplicates,
                    },
                } = buildSanitizedIncomingSiteSyncDelta(delta);

                if (addedDuplicates.length > 0) {
                    logger.error(
                        "Duplicate site identifiers detected in incoming sync delta additions",
                        {
                            action,
                            duplicates: addedDuplicates,
                            source,
                        }
                    );
                }

                if (updatedDuplicates.length > 0) {
                    logger.error(
                        "Duplicate site identifiers detected in incoming sync delta updates",
                        {
                            action,
                            duplicates: updatedDuplicates,
                            source,
                        }
                    );
                }

                if (overlapIdentifiers.length > 0) {
                    logger.error(
                        "Incoming sync delta contains overlapping added/updated identifiers",
                        {
                            action,
                            overlapIdentifiers,
                            source,
                        }
                    );
                }

                const hasChanges = hasSiteSyncChanges(sanitizedDelta);
                if (!hasChanges) {
                    logger.debug(
                        "Sync delta did not change site state; skipping store update",
                        {
                            action,
                            revision,
                            siteIdentifier,
                            source,
                            timestamp,
                        }
                    );
                    deps.onSiteDelta?.(sanitizedDelta);
                    return;
                }

                const currentSites = deps.getSites();
                const removedIdentifiers = new Set(
                    sanitizedDelta.removedSiteIdentifiers
                );
                const {
                    addedSites,
                    removedSiteIdentifiers,
                    updatedSites,
                } = sanitizedDelta;

                    const updatedByIdentifier = new Map(
                        updatedSites.map((site) => [site.identifier, site] as const)
                );

                const nextSites: Site[] = [];
                const seenIdentifiers = new Set<string>();

                for (const site of currentSites) {
                    const { identifier } = site;
                    const removed = removedIdentifiers.has(identifier);
                    if (!removed) {
                        const updatedSite = updatedByIdentifier.get(identifier);
                        nextSites.push(updatedSite ?? site);
                        seenIdentifiers.add(identifier);
                    }
                }

                for (const site of addedSites) {
                    const { identifier } = site;
                    const shouldAdd =
                        !removedIdentifiers.has(identifier) &&
                        !seenIdentifiers.has(identifier);

                    if (shouldAdd) {
                        nextSites.push(site);
                        seenIdentifiers.add(identifier);
                    }
                }

                // Treat unknown updates as upserts.
                for (const site of updatedSites) {
                    const { identifier } = site;
                    const shouldAdd =
                        !removedIdentifiers.has(identifier) &&
                        !seenIdentifiers.has(identifier);

                    if (shouldAdd) {
                        nextSites.push(site);
                        seenIdentifiers.add(identifier);
                    }
                }

                const snapshot = deriveSiteSnapshot(nextSites);
                const { duplicates, sanitizedSites } = snapshot;
                if (duplicates.length > 0) {
                    logger.error(
                        "Duplicate site identifiers detected after applying sync delta",
                        {
                            action,
                            duplicates,
                            source,
                        }
                    );
                }

                logStoreAction("SitesStore", "applySyncDelta", {
                    action,
                    addedCount: addedSites.length,
                    removedCount: removedSiteIdentifiers.length,
                    sanitizedSiteCount: sanitizedSites.length,
                    source,
                    timestamp,
                    updatedCount: updatedSites.length,
                });

                deps.setSites(sanitizedSites);
                deps.onSiteDelta?.(sanitizedDelta);
            };

            const handleEvent = (event: StateSyncEventData): void => {
                try {
                    logSyncEventReceived(event);

                    if (event.truncated === true) {
                        // Normally handled upstream by StateSyncService (full-sync recovery),
                        // but keep this guard to avoid applying incomplete payloads.
                        const {
                            action,
                            revision,
                            siteIdentifier,
                            source,
                        } = event;
                        logger.warn(
                            "Ignoring truncated state sync event in SitesStore",
                            {
                                action,
                                revision,
                                siteIdentifier,
                                source,
                            }
                        );
                        return;
                    }

                    if (event.action === "bulk-sync") {
                        applySnapshotEvent(event);
                        return;
                    }

                    applyDeltaEvent(event);
                } catch (error: unknown) {
                    const normalizedError = ensureError(error);
                    const { action, revision, siteIdentifier, source } = event;
                    logger.error(
                        "Failed to apply state sync event",
                        normalizedError,
                        {
                            action,
                            revision,
                            siteIdentifier,
                            source,
                        }
                    );
                }
            };

                syncEventSubscription.pending = (async (): Promise<void> => {
                try {
                    const serviceCleanup =
                        await StateSyncService.onStateSyncEvent(handleEvent);

                    if (syncEventSubscription.refCount === 0) {
                        serviceCleanup();
                        syncEventSubscription.shouldCleanupOnReady = false;
                        return;
                    }

                    syncEventSubscription.cleanup = serviceCleanup;
                    logStoreAction("SitesStore", "subscribeToSyncEvents", {
                        message: "Sync event subscription setup completed",
                        status: "success",
                        success: true,
                    });
                } catch (error) {
                    const normalizedError = ensureError(error);
                    logger.error(
                        "Failed to subscribe to sync events:",
                        normalizedError
                    );
                    logStoreAction("SitesStore", "subscribeToSyncEvents", {
                        error: normalizedError.message,
                        message: "Failed to subscribe to sync events",
                        status: "failure",
                        success: false,
                    });

                    syncEventSubscription.refCount = 0;
                    syncEventSubscription.shouldCleanupOnReady = false;
                } finally {
                    delete syncEventSubscription.pending;

                    if (
                        syncEventSubscription.refCount === 0 &&
                        syncEventSubscription.cleanup
                    ) {
                        syncEventSubscription.cleanup();
                        delete syncEventSubscription.cleanup;
                        syncEventSubscription.shouldCleanupOnReady = false;
                    }
                }
                })();

                logStoreAction("SitesStore", "subscribeToSyncEvents", {
                    message: "Sync event subscription setup initiated",
                    status: "pending",
                });
            }

            return (): void => {
                if (released) {
                    return;
                }

                released = true;
                syncEventSubscription.refCount = Math.max(
                    0,
                    syncEventSubscription.refCount - 1
                );

                if (syncEventSubscription.refCount > 0) {
                    return;
                }

                if (syncEventSubscription.cleanup) {
                    syncEventSubscription.cleanup();
                    delete syncEventSubscription.cleanup;
                    syncEventSubscription.shouldCleanupOnReady = false;
                    return;
                }

                if (syncEventSubscription.pending) {
                    syncEventSubscription.shouldCleanupOnReady = true;
                }
            };
        },
        syncSites: async (): Promise<void> => {
            // Sync operations use the standard factory-based store error
            // handler; no custom rollback logic is required here. See
            // ADR-003 "Store Error Handling Contexts" for the rationale.
            await withErrorHandling(
                async () => {
                    logStoreAction("SitesStore", "syncSites", {
                        status: "pending",
                    });

                    try {
                        const fullSyncResult =
                            // eslint-disable-next-line n/no-sync -- Backend API name uses "Sync" suffix but returns a Promise
                            await StateSyncService.requestFullSync();
                        const {
                            completedAt,
                            siteCount,
                            sites,
                            source,
                            synchronized,
                        } = fullSyncResult;

                        const snapshot = deriveSiteSnapshot(sites);
                        if (snapshot.duplicates.length > 0) {
                            logger.error(
                                "Duplicate site identifiers detected in full sync response",
                                {
                                    duplicates: snapshot.duplicates,
                                    originalSiteCount: siteCount,
                                    sanitizedSiteCount:
                                        snapshot.sanitizedSites.length,
                                    source,
                                }
                            );
                        }

                        deps.setSites(snapshot.sanitizedSites);

                        if (!synchronized) {
                            logger.warn(
                                "Backend full sync completed without synchronized flag",
                                {
                                    completedAt,
                                    originalSitesCount: siteCount,
                                    sanitizedSiteCount:
                                        snapshot.sanitizedSites.length,
                                    source,
                                }
                            );
                        }

                        const telemetryPayload: UnknownRecord = {
                            completedAt,
                            message: synchronized
                                ? "Sites synchronized from backend"
                                : "Backend full sync completed but reported unsynchronized state",
                            originalSitesCount: siteCount,
                            sitesCount: snapshot.sanitizedSites.length,
                            source,
                            status: synchronized ? "success" : "failure",
                            success: synchronized,
                        };

                        if (!synchronized) {
                            telemetryPayload["failureReason"] =
                                "backend-not-synchronized";
                        }

                        logStoreAction(
                            "SitesStore",
                            "syncSites",
                            telemetryPayload
                        );
                    } catch (error) {
                        const normalizedError = ensureError(error);
                        logStoreAction("SitesStore", "syncSites", {
                            error: normalizedError.message,
                            status: "failure",
                            success: false,
                        });
                        throw error;
                    }
                },
                createStoreErrorHandler("sites-sync", "syncSites")
            );
        },
        unsubscribeFromStatusUpdates: () => {
            statusUpdateManager.instance?.unsubscribe();
            delete statusUpdateManager.instance;
            delete statusUpdateManager.callback;
            deps.setStatusSubscriptionSummary(undefined);
            const result: StatusUpdateUnsubscribeResult = {
                message: "Successfully unsubscribed from status updates",
                success: true,
                unsubscribed: true,
            };
            logStoreAction(
                "SitesStore",
                "unsubscribeFromStatusUpdates",
                result
            );

            return result;
        },
    };

    return actions;
};
