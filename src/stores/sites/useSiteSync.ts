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
import type { StateSyncEventData } from "@shared/types/events";
import type { StateSyncStatusSummary } from "@shared/types/stateSync";

import { STATE_SYNC_ACTION } from "@shared/types/stateSync";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";

import type {
    StatusUpdateSubscriptionSummary,
    StatusUpdateUnsubscribeResult,
} from "./baseTypes";

import { logger } from "../../services/logger";
import { StateSyncService } from "../../services/StateSyncService";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import { SiteService } from "./services/SiteService";
import {
    StatusUpdateManager,
    type StatusUpdateSubscriptionResult,
} from "./utils/statusUpdateHandler";

/**
 * Site synchronization actions interface.
 *
 * @remarks
 * Defines all available site synchronization operations that can be performed.
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
 * Dependencies required for site synchronization operations.
 *
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

const FALLBACK_EXPECTED_LISTENERS = 3;

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

    const actions: SiteSyncActions = {
        fullResyncSites: async (): Promise<void> => {
            // If sync is already in progress, return the existing promise
            if (pendingSyncPromise) {
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
                const fallbackSummary: StatusUpdateSubscriptionSummary = {
                    errors: [message],
                    expectedListeners: resolveExpectedListenerCount(),
                    listenersAttached: 0,
                    message:
                        "Unable to retry status subscription without callback context",
                    subscribed: false,
                    success: false,
                };

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
                const fallbackSummary: StatusUpdateSubscriptionSummary = {
                    errors: [initializationMessage],
                    expectedListeners: resolveExpectedListenerCount(),
                    listenersAttached: 0,
                    message:
                        "Failed to subscribe to status updates due to missing callback",
                    subscribed: false,
                    success: false,
                };

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

                        const fallbackSummary: StatusUpdateSubscriptionSummary =
                            {
                                errors: [initializationMessage],
                                expectedListeners:
                                    resolveExpectedListenerCount(),
                                listenersAttached: 0,
                                message:
                                    "Failed to subscribe to status updates",
                                subscribed: false,
                                success: false,
                            };

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
                            success,
                        }: StatusUpdateSubscriptionResult =
                            await managerInstance.subscribe();

                        const summary: StatusUpdateSubscriptionSummary = {
                            errors,
                            expectedListeners,
                            listenersAttached,
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

                        const failureSummary: StatusUpdateSubscriptionSummary =
                            {
                                errors: [normalizedError.message],
                                expectedListeners:
                                    statusUpdateManager.instance?.getExpectedListenerCount() ??
                                    resolveExpectedListenerCount(),
                                listenersAttached: 0,
                                message:
                                    "Failed to subscribe to status updates",
                                subscribed: false,
                                success: false,
                            };

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
            let cleanup: (() => void) | null = null;
            let disposed = false;

            const handleEvent = (event: StateSyncEventData): void => {
                const hasSnapshot = Array.isArray(event.sites);

                logStoreAction("SitesStore", "syncEventReceived", {
                    action: event.action,
                    message: `Received sync event: ${event.action}`,
                    siteIdentifier: event.siteIdentifier,
                    source: event.source,
                    timestamp: event.timestamp,
                    ...(hasSnapshot && { sitesCount: event.sites.length }),
                });

                if (!hasSnapshot) {
                    logger.error(
                        "State sync event missing sites payload",
                        event
                    );
                    return;
                }

                switch (event.action) {
                    case STATE_SYNC_ACTION.BULK_SYNC:
                    case STATE_SYNC_ACTION.DELETE:
                    case STATE_SYNC_ACTION.UPDATE: {
                        deps.setSites(event.sites);
                        break;
                    }
                    default: {
                        logger.warn("Unknown sync event action:", event.action);
                    }
                }
            };

            void (async (): Promise<void> => {
                try {
                    const serviceCleanup =
                        await StateSyncService.onStateSyncEvent(handleEvent);

                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- disposed may flip while awaiting subscription.
                    if (disposed) {
                        serviceCleanup();
                        return;
                    }

                    cleanup = serviceCleanup;
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
                }
            })();

            logStoreAction("SitesStore", "subscribeToSyncEvents", {
                message: "Sync event subscription setup initiated",
                status: "pending",
            });

            return (): void => {
                disposed = true;
                if (cleanup) {
                    cleanup();
                    cleanup = null;
                }
            };
        },
        syncSites: async (): Promise<void> => {
            await withErrorHandling(
                async () => {
                    logStoreAction("SitesStore", "syncSites", {
                        status: "pending",
                    });

                    try {
                        const backendSites = await SiteService.getSites();
                        deps.setSites(backendSites);

                        logStoreAction("SitesStore", "syncSites", {
                            message: "Sites synchronized from backend",
                            sitesCount: deps.getSites().length,
                            status: "success",
                            success: true,
                        });
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
