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
        subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: actions.fullSyncFromBackend,
                getSites: deps.getSites,
                onUpdate: callback,
                setSites: deps.setSites,
            });

            statusUpdateManager.subscribe(handler).catch((error) => {
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
    };

    return actions;
};
