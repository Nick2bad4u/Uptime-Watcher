/**
 * Status update handler utility for managing site status updates.
 * Provides optimized incremental updates and fallback mechanisms.
 */

import type { Site, StatusUpdate } from "../../types";

import { logStoreAction, waitForElectronAPI } from "../../utils";

export interface StatusUpdateHandlerOptions {
    /** Function to get current sites */
    getSites: () => Site[];
    /** Function to set sites */
    setSites: (sites: Site[]) => void;
    /** Function to trigger full sync */
    fullSyncFromBackend: () => Promise<void>;
    /** Optional callback for additional processing */
    onUpdate?: (update: StatusUpdate) => void;
}

/**
 * Creates a status update handler with optimized incremental updates
 */
export function createStatusUpdateHandler(options: StatusUpdateHandlerOptions) {
    const { fullSyncFromBackend, getSites, onUpdate, setSites } = options;

    return async (update: StatusUpdate): Promise<void> => {
        try {
            // Validate update payload
            if (!update?.site) {
                throw new Error("Invalid status update: update or update.site is null/undefined");
            }

            // Call the optional callback first
            if (onUpdate) {
                onUpdate(update);
            }

            // Smart incremental update - use the payload data directly
            const currentSites = getSites();
            const updatedSites = currentSites.map((site) => {
                if (site.identifier === update.site.identifier) {
                    // Use the complete updated site data from the backend
                    return { ...update.site };
                }
                return site; // Keep other sites unchanged
            });

            // Check if the site was actually found and updated
            const siteFound = currentSites.some((site) => site.identifier === update.site.identifier);

            if (siteFound) {
                // Update store state efficiently
                setSites(updatedSites);
                logStoreAction("StatusUpdateHandler", "incrementalUpdate", {
                    siteId: update.site.identifier,
                });
            } else {
                // Site not found in current state - trigger full sync as fallback
                if (process.env.NODE_ENV === "development") {
                    console.warn(`Site ${update.site.identifier} not found in store, triggering full sync`);
                }
                await fullSyncFromBackend().catch((error) => {
                    if (process.env.NODE_ENV === "development") {
                        console.error("Fallback full sync failed:", error);
                    }
                });
            }
        } catch (error) {
            console.error("Error processing status update:", error);
            // Fallback to full sync on any processing error
            await fullSyncFromBackend().catch((syncError) => {
                console.error("Fallback sync after error failed:", syncError);
            });
        }
    };
}

/**
 * Manages status update subscriptions
 */
export class StatusUpdateManager {
    private handler: ((update: StatusUpdate) => Promise<void>) | undefined = undefined;

    /**
     * Subscribe to status updates
     */
    async subscribe(handler: (update: StatusUpdate) => Promise<void>): Promise<void> {
        this.handler = handler;

        // Check if electronAPI is available before subscribing
        if (!window.electronAPI?.events?.onStatusUpdate) {
            // If electronAPI is not ready, wait for it and retry
            try {
                await waitForElectronAPI();
            } catch (error) {
                console.error("Failed to initialize electronAPI:", error);
                throw new Error("Failed to initialize electronAPI");
            }
        }

        if (!window.electronAPI?.events?.onStatusUpdate) {
            throw new Error("electronAPI.events.onStatusUpdate is not available");
        }

        window.electronAPI.events.onStatusUpdate(this.handler);
        logStoreAction("StatusUpdateManager", "subscribed");
    }

    /**
     * Unsubscribe from status updates
     */
    unsubscribe(): void {
        if (window.electronAPI?.events?.removeAllListeners) {
            window.electronAPI.events.removeAllListeners("status-update");
        }
        this.handler = undefined;
        logStoreAction("StatusUpdateManager", "unsubscribed");
    }

    /**
     * Check if currently subscribed
     */
    isSubscribed(): boolean {
        return this.handler !== undefined;
    }
}
