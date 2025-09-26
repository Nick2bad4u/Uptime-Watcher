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
import type { StateSyncStatusSummary } from "@shared/types/stateSync";

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";

import { logger } from "../../services/logger";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import { SiteService } from "./services/SiteService";
import { StatusUpdateManager } from "./utils/statusUpdateHandler";

/**
 * No-op cleanup implementation.
 */
const noOpCleanup = (): void => {
    // No cleanup needed
};

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
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
        /** Human-readable description of the operation */
        message: string;
        /** Whether subscription was successful */
        subscribed: boolean;
        /** Overall operation success status */
        success: boolean;
    };

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
    unsubscribeFromStatusUpdates: () => {
        /** Human-readable description of the operation */
        message: string;
        /** Overall operation success status */
        success: boolean;
        /** Whether unsubscription was successful */
        unsubscribed: boolean;
    };
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
}

// Create a shared status update manager instance - will be initialized when
// first used
// Singleton instance management for status updates, lazily initialized to
// avoid unnecessary object creation
const statusUpdateManager: { instance?: StatusUpdateManager } = {};

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
                try {
                    await actions.syncSites();
                    logStoreAction("SitesStore", "fullResyncSites", {
                        message: "Full backend resynchronization completed",
                        success: true,
                    });
                } finally {
                    // Clear the pending promise when done (success or failure)
                    pendingSyncPromise = null;
                }
            })();

            return pendingSyncPromise;
        },
        getSyncStatus: async () => {
            try {
                return await withErrorHandling(
                    async () => {
                        const status =
                            await window.electronAPI.stateSync.getSyncStatus();
                        logStoreAction("SitesStore", "getSyncStatus", {
                            lastSyncAt: status.lastSyncAt,
                            message: "Sync status retrieved",
                            siteCount: status.siteCount,
                            source: status.source,
                            success: true,
                            synchronized: status.synchronized,
                        });
                        return status;
                    },
                    createStoreErrorHandler("sites-sync", "getSyncStatus")
                );
            } catch {
                // Fallback for error case
                return {
                    lastSyncAt: null,
                    siteCount: 0,
                    source: "frontend" as const,
                    synchronized: false,
                };
            }
        },
        subscribeToStatusUpdates: (
            callback: (update: StatusUpdate) => void
        ) => {
            // Initialize status update manager if not already done
            statusUpdateManager.instance ??= new StatusUpdateManager({
                fullResyncSites: actions.fullResyncSites,
                getSites: deps.getSites,
                onUpdate: callback,
                setSites: deps.setSites,
            });

            try {
                // Use the new efficient StatusUpdateManager that handles
                // incremental updates
                statusUpdateManager.instance.subscribe();
            } catch (error) {
                logger.error(
                    "Failed to subscribe to status updates:",
                    ensureError(error)
                );
            }

            const result = {
                message:
                    "Successfully subscribed to status updates with efficient incremental updates",
                subscribed: true,
                success: true,
            };
            logStoreAction("SitesStore", "subscribeToStatusUpdates", result);

            return result;
        },
        subscribeToSyncEvents: (): (() => void) => {
            try {
                return window.electronAPI.stateSync.onStateSyncEvent(
                    (event) => {
                        logStoreAction("SitesStore", "syncEventReceived", {
                            action: event.action,
                            message: `Received sync event: ${event.action}`,
                            siteIdentifier: event.siteIdentifier,
                            sitesCount: event.sites?.length,
                            source: event.source,
                            timestamp: event.timestamp,
                        });

                        switch (event.action) {
                            case "bulk-sync": {
                                if (event.sites) {
                                    deps.setSites(event.sites);
                                }
                                break;
                            }
                            case "delete":
                            case "update": {
                                void (async (): Promise<void> => {
                                    try {
                                        await actions.syncSites();
                                    } catch (error: unknown) {
                                        logStoreAction("SitesStore", "error", {
                                            error: ensureError(error),
                                        });
                                    }
                                })();
                                break;
                            }
                            default: {
                                logger.warn(
                                    "Unknown sync event action:",
                                    event.action
                                );
                            }
                        }
                    }
                );
            } catch (error) {
                logger.error(
                    "Failed to subscribe to sync events:",
                    ensureError(error)
                );
                logStoreAction("SitesStore", "subscribeToSyncEvents", {
                    error: ensureError(error).message,
                    message: "Failed to subscribe to sync events",
                    success: false,
                });
                return noOpCleanup;
            } finally {
                logStoreAction("SitesStore", "subscribeToSyncEvents", {
                    message: "Sync event subscription setup completed",
                    success: true,
                });
            }
        },
        syncSites: async (): Promise<void> => {
            await withErrorHandling(
                async () => {
                    const backendSites = await SiteService.getSites();
                    deps.setSites(backendSites);

                    logStoreAction("SitesStore", "syncSites", {
                        message: "Sites synchronized from backend",
                        sitesCount: deps.getSites().length,
                        success: true,
                    });
                },
                createStoreErrorHandler("sites-sync", "syncSites")
            );
        },
        unsubscribeFromStatusUpdates: () => {
            statusUpdateManager.instance?.unsubscribe();
            const result = {
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
