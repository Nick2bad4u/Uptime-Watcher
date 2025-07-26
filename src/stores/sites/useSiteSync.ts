/**
 * Site synchronization operations module.
 * Handles syncing data from backend and status update subscriptions.
 *
 * Uses centralized error store for consistent error handling across the application.
 */

import type { Site, StatusUpdate } from "../../types";

import logger from "../../services/logger";
import { ensureError } from "../../utils/errorHandling";
import { useErrorStore } from "../error/useErrorStore";
import { logStoreAction, withErrorHandling } from "../utils";
import { SiteService } from "./services/SiteService";
import { StatusUpdateManager } from "./utils/statusUpdateHandler";

export interface SiteSyncActions {
    /**
     * Full sync from backend.
     * Triggers a complete synchronization of all sites from the backend.
     */
    fullSyncFromBackend: () => Promise<void>;
    /**
     * Get sync status.
     * Retrieves current synchronization status including last sync time and site count.
     */
    getSyncStatus: () => Promise<{
        lastSync: null | number | undefined;
        siteCount: number;
        success: boolean;
        synchronized: boolean;
    }>;
    /**
     * Subscribe to status updates.
     * Establishes subscription to monitor status change events from backend.
     * Uses shared status update manager to handle race conditions and fallback logic.
     */
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
        message: string;
        subscribed: boolean;
        success: boolean;
    };
    /**
     * Subscribe to sync events.
     * Establishes subscription to backend sync events for bulk updates and single site changes.
     */
    subscribeToSyncEvents: () => () => void;
    /**
     * Sync sites from backend.
     * Retrieves latest sites data from backend and updates local store state.
     * Handles error cases and provides centralized error logging.
     */
    syncSitesFromBackend: () => Promise<void>;
    /**
     * Unsubscribe from status updates.
     * Cleanly removes status update subscription and cleans up event listeners.
     */
    unsubscribeFromStatusUpdates: () => {
        message: string;
        success: boolean;
        unsubscribed: boolean;
    };
}

export interface SiteSyncDependencies {
    getSites: () => Site[];
    setSites: (sites: Site[]) => void;
}

// Create a shared status update manager instance - will be initialized when first used
let statusUpdateManager: StatusUpdateManager | undefined;

export const createSiteSyncActions = (deps: SiteSyncDependencies): SiteSyncActions => {
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
                        // eslint-disable-next-line n/no-sync -- Method name contains 'sync' but is not a synchronous file operation
                        const status = await window.electronAPI.stateSync.getSyncStatus();
                        logStoreAction("SitesStore", "getSyncStatus", {
                            message: "Sync status retrieved",
                            siteCount: status.siteCount,
                            success: true,
                            synchronized: status.synchronized,
                        });
                        return status;
                    },
                    {
                        clearError: () => errorStore.clearStoreError("sites-sync"),
                        setError: (error) => errorStore.setStoreError("sites-sync", error),
                        setLoading: (loading) => errorStore.setOperationLoading("getSyncStatus", loading),
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
        subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
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
                logger.error("Failed to subscribe to status updates:", ensureError(error));
            }

            const result = {
                message: "Successfully subscribed to status updates with efficient incremental updates",
                subscribed: true,
                success: true,
            };
            logStoreAction("SitesStore", "subscribeToStatusUpdates", result);

            return result;
        },
        subscribeToSyncEvents: () => {
            // eslint-disable-next-line n/no-sync -- Switch case handles 'sync' event types, not synchronous file operations
            const cleanup = window.electronAPI.stateSync.onStateSyncEvent((event) => {
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
                        actions.syncSitesFromBackend().catch((error: unknown) => {
                            logStoreAction("SitesStore", "error", { error });
                        });
                        break;
                    }
                }
            });

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
                    clearError: () => errorStore.clearStoreError("sites-sync"),
                    setError: (error) => errorStore.setStoreError("sites-sync", error),
                    setLoading: (loading) => errorStore.setOperationLoading("syncSitesFromBackend", loading),
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
            logStoreAction("SitesStore", "unsubscribeFromStatusUpdates", result);

            return result;
        },
    };

    return actions;
};
