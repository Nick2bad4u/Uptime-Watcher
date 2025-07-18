/**
 * Site synchronization operations module.
 * Handles syncing data from backend and status update subscriptions.
 *
 * Note: Empty clearError and setLoading functions are intentional in withErrorHandling calls
 * as error handling is managed centrally by the store infrastructure.
 */

import type { Site, StatusUpdate } from "../../types";

import { logStoreAction, withErrorHandling } from "../utils";
import { SiteService } from "./services/SiteService";
import { createStatusUpdateHandler, StatusUpdateManager } from "./utils/statusUpdateHandler";

export interface SiteSyncActions {
    /** Full sync from backend */
    fullSyncFromBackend: () => Promise<void>;
    /** Get sync status */
    getSyncStatus: () => Promise<{
        lastSync: null | number | undefined;
        siteCount: number;
        success: boolean;
        synchronized: boolean;
    }>;
    /** Subscribe to status updates */
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
        message: string;
        subscribed: boolean;
        success: boolean;
    };
    /** Subscribe to sync events */
    subscribeToSyncEvents: () => () => void;
    /** Sync sites from backend */
    syncSitesFromBackend: () => Promise<void>;
    /** Unsubscribe from status updates */
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

// Create a shared status update manager instance
const statusUpdateManager = new StatusUpdateManager();

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
            try {
                const status = await window.electronAPI.stateSync.getSyncStatus();
                logStoreAction("SitesStore", "getSyncStatus", {
                    message: "Sync status retrieved",
                    siteCount: status.siteCount,
                    success: true,
                    synchronized: status.synchronized,
                });
                return status;
            } catch (error) {
                logStoreAction("SitesStore", "error", { error });
                return {
                    lastSync: undefined,
                    siteCount: 0,
                    success: false,
                    synchronized: false,
                };
            }
        },
        subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: actions.fullSyncFromBackend,
                getSites: deps.getSites,
                onUpdate: callback,
                setSites: deps.setSites,
            });

            statusUpdateManager.subscribe(handler, actions.fullSyncFromBackend).catch((error) => {
                console.error("Failed to subscribe to status updates:", error);
            });

            const result = {
                message: "Successfully subscribed to status updates",
                subscribed: true,
                success: true,
            };
            logStoreAction("SitesStore", "subscribeToStatusUpdates", result);

            return result;
        },
        subscribeToSyncEvents: () => {
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
            await withErrorHandling(
                async () => {
                    const backendSites = await SiteService.getSites();
                    // Handle null/undefined responses from backend by defaulting to empty array
                    deps.setSites(backendSites);

                    logStoreAction("SitesStore", "syncSitesFromBackend", {
                        message: "Sites synchronized from backend",
                        sitesCount: deps.getSites().length,
                        success: true,
                    });
                },
                {
                    clearError: () => {},
                    setError: (error) => logStoreAction("SitesStore", "error", { error }),
                    setLoading: () => {},
                }
            );
        },
        unsubscribeFromStatusUpdates: () => {
            statusUpdateManager.unsubscribe();
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
