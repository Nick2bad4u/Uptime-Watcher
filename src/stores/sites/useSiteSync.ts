/**
 * Site synchronization operations module.
 * Handles syncing data from backend and status update subscriptions.
 *
 * Note: Empty clearError and setLoading functions are intentional in withErrorHandling calls
 * as error handling is managed centrally by the store infrastructure.
 */

import type { Site, StatusUpdate } from "../../types";

import { logStoreAction, withErrorHandling } from "../utils";
import { SiteService } from "./services";
import { StatusUpdateManager, createStatusUpdateHandler } from "./utils";

export interface SiteSyncActions {
    /** Sync sites from backend */
    syncSitesFromBackend: () => Promise<void>;
    /** Full sync from backend */
    fullSyncFromBackend: () => Promise<void>;
    /** Get sync status */
    getSyncStatus: () => Promise<{
        success: boolean;
        synchronized: boolean;
        lastSync: number | null | undefined;
        siteCount: number;
    }>;
    /** Subscribe to status updates */
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
        success: boolean;
        subscribed: boolean;
        message: string;
    };
    /** Unsubscribe from status updates */
    unsubscribeFromStatusUpdates: () => {
        success: boolean;
        unsubscribed: boolean;
        message: string;
    };
    /** Subscribe to sync events */
    subscribeToSyncEvents: () => () => void;
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
                    synchronized: status.synchronized,
                    siteCount: status.siteCount,
                    success: true,
                });
                return status;
            } catch (error) {
                logStoreAction("SitesStore", "error", { error });
                return {
                    success: false,
                    synchronized: false,
                    lastSync: undefined,
                    siteCount: 0,
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

            const result = { message: "Successfully subscribed to status updates", subscribed: true, success: true };
            logStoreAction("SitesStore", "subscribeToStatusUpdates", result);

            return result;
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
        subscribeToSyncEvents: () => {
            const cleanup = window.electronAPI.stateSync.onStateSyncEvent((event) => {
                logStoreAction("SitesStore", "syncEventReceived", {
                    action: event.action,
                    siteIdentifier: event.siteIdentifier,
                    timestamp: event.timestamp,
                    source: event.source,
                }); // Handle different sync actions
                switch (event.action) {
                    case "bulk-sync": {
                        if (event.sites) {
                            deps.setSites(event.sites);
                        }
                        break;
                    }
                    case "update":
                    case "delete": {
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
    };

    return actions;
};
