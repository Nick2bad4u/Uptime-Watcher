/**
 * Site synchronization operations module.
 *
 * @remarks
 * Provides comprehensive site synchronization functionality including:
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

import logger from "../../services/logger";
import { safeExtractIpcData } from "../../types/ipc";
import { ensureError } from "../../utils/errorHandling";
import { useErrorStore } from "../error/useErrorStore";
import { logStoreAction, withErrorHandling } from "../utils";
import { SiteService } from "./services/SiteService";
import { StatusUpdateManager } from "./utils/statusUpdateHandler";

/**
 * Site synchronization actions interface.
 *
 * @remarks
 * Defines all available site synchronization operations that can be performed.
 * These actions are designed to work within the Zustand store architecture
 * and provide consistent error handling and logging.
 *
 * @public
 */
export interface SiteSyncActions {
    /**
     * Performs a complete synchronization from the backend.
     *
     * @remarks
     * Triggers a full sync operation that updates all local site data
     * with the latest information from the backend. This is typically
     * used during application startup or when recovering from errors.
     *
     * @returns Promise that resolves when synchronization is complete
     */
    fullSyncFromBackend: () => Promise<void>;

    /**
     * Retrieves current synchronization status from the backend.
     *
     * @remarks
     * Provides detailed information about the sync state including:
     * - Last synchronization timestamp
     * - Current site count
     * - Overall synchronization status
     * - Success/failure indicators
     *
     * Uses `safeExtractIpcData` to handle IPC response safely.
     *
     * @returns Promise resolving to sync status information
     */
    getSyncStatus: () => Promise<{
        /** Timestamp of last successful sync, undefined if never synced */
        lastSync: null | number | undefined;
        /** Current number of sites in the backend */
        siteCount: number;
        /** Whether the status retrieval was successful */
        success: boolean;
        /** Whether frontend and backend are synchronized */
        synchronized: boolean;
    }>;

    /**
     * Establishes subscription to real-time status updates.
     *
     * @remarks
     * Sets up event listeners for monitor status changes from the backend.
     * Uses the shared StatusUpdateManager to handle:
     * - Race condition prevention
     * - Fallback mechanisms
     * - Efficient incremental updates
     *
     * @param callback - Function to call when status updates are received
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
     * - Bulk synchronization events
     * - Individual site updates
     * - Site deletions
     *
     * Automatically handles different event types and triggers
     * appropriate local state updates.
     *
     * @returns Cleanup function to remove event listeners
     */
    subscribeToSyncEvents: () => () => void;

    /**
     * Synchronizes all sites from the backend.
     *
     * @remarks
     * Fetches the latest site data from the backend and updates
     * the local store state. Includes comprehensive error handling
     * and logging for debugging purposes.
     *
     * This is the core synchronization method used by other
     * sync operations.
     *
     * @returns Promise that resolves when sync is complete
     */
    syncSitesFromBackend: () => Promise<void>;

    /**
     * Removes subscription to status updates.
     *
     * @remarks
     * Cleanly unsubscribes from status update events and releases
     * associated resources. Should be called when components unmount
     * or when status updates are no longer needed.
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
 * These dependencies are injected into the sync actions to maintain
 * separation of concerns and enable easier testing. The dependencies
 * provide access to the site state without direct coupling to the
 * Zustand store implementation.
 *
 * @public
 */
export interface SiteSyncDependencies {
    /** Function to get current sites from the store */
    getSites: () => Site[];
    /** Function to update sites in the store */
    setSites: (sites: Site[]) => void;
}

// Create a shared status update manager instance - will be initialized when first used
// eslint-disable-next-line @typescript-eslint/init-declarations -- Intentional lazy initialization to create singleton instance only when needed, avoiding unnecessary object creation
let statusUpdateManager: StatusUpdateManager | undefined;

/**
 * Creates site synchronization actions with injected dependencies.
 *
 * @remarks
 * Factory function that creates all site synchronization actions with proper
 * dependency injection. This pattern allows for easier testing and maintains
 * separation of concerns between the sync logic and store state management.
 *
 * The created actions handle:
 * - Full backend synchronization
 * - Real-time status updates via WebSocket-like events
 * - Sync status monitoring and reporting
 * - Error handling and recovery
 *
 * @param deps - Dependencies required for synchronization operations
 * @returns Complete set of synchronization actions
 *
 * @public
 */
export const createSiteSyncActions = (
    deps: SiteSyncDependencies
): SiteSyncActions => {
    const actions: SiteSyncActions = {
        fullSyncFromBackend: async () => {
            await actions.syncSitesFromBackend();
            logStoreAction("SitesStore", "fullSyncFromBackend", {
                message: "Full backend synchronization completed",
                success: true,
            });
        },
        getSyncStatus: async () => {
            const errorStore = useErrorStore.getState();
            try {
                return await withErrorHandling(
                    async () => {
                        const response =
                            // eslint-disable-next-line n/no-sync -- Method name contains 'sync' but is not a synchronous file operation
                            await window.electronAPI.stateSync.getSyncStatus();
                        const status = safeExtractIpcData(response, {
                            lastSync: undefined,
                            siteCount: 0,
                            success: false,
                            synchronized: false,
                        });
                        logStoreAction("SitesStore", "getSyncStatus", {
                            message: "Sync status retrieved",
                            siteCount: status.siteCount,
                            success: true,
                            synchronized: status.synchronized,
                        });
                        return status;
                    },
                    {
                        clearError: () => {
                            errorStore.clearStoreError("sites-sync");
                        },
                        setError: (error) => {
                            errorStore.setStoreError("sites-sync", error);
                        },
                        setLoading: (loading) => {
                            errorStore.setOperationLoading(
                                "getSyncStatus",
                                loading
                            );
                        },
                    }
                );
            } catch {
                // Fallback for error case
                return {
                    lastSync: undefined,
                    siteCount: 0,
                    success: false,
                    synchronized: false,
                };
            }
        },
        subscribeToStatusUpdates: (
            callback: (update: StatusUpdate) => void
        ) => {
            // Initialize status update manager if not already done
            statusUpdateManager ??= new StatusUpdateManager({
                fullSyncFromBackend: actions.fullSyncFromBackend,
                getSites: deps.getSites,
                onUpdate: callback,
                setSites: deps.setSites,
            });

            try {
                // Use the new efficient StatusUpdateManager that handles incremental updates
                statusUpdateManager.subscribe();
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
        subscribeToSyncEvents: () => {
            // eslint-disable-next-line n/no-sync -- Switch case handles 'sync' event types, not synchronous file operations
            const cleanup = window.electronAPI.stateSync.onStateSyncEvent(
                (event) => {
                    logStoreAction("SitesStore", "syncEventReceived", {
                        action: event.action,
                        siteIdentifier: event.siteIdentifier,
                        source: event.source,
                        timestamp: event.timestamp,
                    }); // Handle different sync actions
                    switch (event.action) {
                        case "bulk-sync": {
                            if (event.sites) {
                                deps.setSites(event.sites);
                            }
                            break;
                        }
                        case "delete":
                        case "update": {
                            // For single site updates, trigger a full sync
                            void (async (): Promise<void> => {
                                try {
                                    await actions.syncSitesFromBackend();
                                } catch (error: unknown) {
                                    logStoreAction("SitesStore", "error", {
                                        error,
                                    });
                                }
                            })();
                            break;
                        }
                    }
                }
            );

            logStoreAction("SitesStore", "subscribeToSyncEvents", {
                message: "Successfully subscribed to sync events",
                success: true,
            });

            return cleanup;
        },
        syncSitesFromBackend: async () => {
            const errorStore = useErrorStore.getState();
            await withErrorHandling(
                async () => {
                    const backendSites = await SiteService.getSites();
                    deps.setSites(backendSites);

                    logStoreAction("SitesStore", "syncSitesFromBackend", {
                        message: "Sites synchronized from backend",
                        sitesCount: deps.getSites().length,
                        success: true,
                    });
                },
                {
                    clearError: () => {
                        errorStore.clearStoreError("sites-sync");
                    },
                    setError: (error) => {
                        errorStore.setStoreError("sites-sync", error);
                    },
                    setLoading: (loading) => {
                        errorStore.setOperationLoading(
                            "syncSitesFromBackend",
                            loading
                        );
                    },
                }
            );
        },
        unsubscribeFromStatusUpdates: () => {
            statusUpdateManager?.unsubscribe();
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
