/**
 * Status update handler utility for managing site status updates.
 * Provides optimized incremental updates and fallback mechanisms.
 */

import type { Site, StatusUpdate } from "../../types";

import { logger } from "../../../services";
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
 * Creates a status update handler with optimized incremental updates and race condition protection
 */
export function createStatusUpdateHandler(options: StatusUpdateHandlerOptions) {
    const { fullSyncFromBackend, getSites, onUpdate, setSites } = options;

    // Track pending updates to prevent race conditions
    const pendingUpdates = new Map<string, number>();

    return async (update: StatusUpdate): Promise<void> => {
        try {
            // Call the optional callback first
            if (onUpdate) {
                onUpdate(update);
            }

            const updateTimestamp = Date.now();
            const siteId = update.site.identifier;

            // Validate timestamp bounds
            if (!Number.isFinite(updateTimestamp) || updateTimestamp <= 0) {
                logger.error(
                    "Invalid timestamp generated for update",
                    new Error(`Invalid timestamp: ${updateTimestamp}`)
                );
                return;
            }

            // Check if there's a more recent update already pending
            const lastUpdateTime = pendingUpdates.get(siteId);
            if (lastUpdateTime && Number.isFinite(lastUpdateTime) && updateTimestamp < lastUpdateTime) {
                // This update is stale, ignore it
                return;
            }

            // Mark this update as pending
            pendingUpdates.set(siteId, updateTimestamp);

            // Get current sites and find the target site
            const currentSites = getSites();
            const siteIndex = currentSites.findIndex((site) => site.identifier === siteId);

            if (siteIndex !== -1) {
                // Site found - perform atomic update
                // Only proceed if this is still the latest update
                if (pendingUpdates.get(siteId) === updateTimestamp) {
                    const updatedSites = currentSites.map((site, index) => {
                        if (index === siteIndex) {
                            return { ...update.site };
                        }
                        return site;
                    });

                    setSites(updatedSites);
                    logStoreAction("StatusUpdateHandler", "incrementalUpdate", {
                        siteId: update.site.identifier,
                        timestamp: updateTimestamp,
                    });
                }
            } else {
                // Site not found in current state - trigger full sync as fallback
                if (process.env.NODE_ENV === "development") {
                    logger.warn(`Site ${update.site.identifier} not found in store, triggering full sync`);
                }
                await fullSyncFromBackend().catch((error) => {
                    if (process.env.NODE_ENV === "development") {
                        logger.error("Fallback full sync failed", error as Error);
                    }
                });
            }

            // Clean up pending update tracking
            if (pendingUpdates.get(siteId) === updateTimestamp) {
                pendingUpdates.delete(siteId);
            }
        } catch (error) {
            logger.error("Error processing status update", error as Error);
            // Clean up pending update tracking on error
            pendingUpdates.delete(update.site.identifier);
            // Fallback to full sync on any processing error
            await fullSyncFromBackend().catch((syncError) => {
                logger.error("Fallback sync after error failed", syncError as Error);
            });
        }
    };
}

/**
 * Manages status update subscriptions
 */
export class StatusUpdateManager {
    private handler: ((update: StatusUpdate) => Promise<void>) | undefined = undefined;
    private isListenerAttached = false;
    private monitoringEventHandler: (() => Promise<void>) | undefined = undefined;
    private cleanupFunctions: (() => void)[] = [];

    /**
     * Subscribe to status updates and monitoring events
     */
    async subscribe(
        handler: (update: StatusUpdate) => Promise<void>,
        fullSyncHandler?: () => Promise<void>
    ): Promise<void> {
        // If already subscribed, unsubscribe first to avoid duplicates
        if (this.isListenerAttached) {
            this.unsubscribe();
        }

        this.handler = handler;

        if (fullSyncHandler) {
            this.monitoringEventHandler = fullSyncHandler;
        }

        // Always wait for electronAPI to be ready before subscribing
        try {
            await waitForElectronAPI();
        } catch (error) {
            console.error("Failed to initialize electronAPI:", error);
            throw new Error("Failed to initialize electronAPI");
        }

        // Subscribe to monitor status changes
        const statusUpdateCleanup = window.electronAPI.events.onMonitorStatusChanged((update: StatusUpdate) => {
            this.handler?.(update).catch((error) => {
                console.error("Error in status update handler:", error);
            });
        });
        this.cleanupFunctions.push(statusUpdateCleanup);

        // Subscribe to monitoring state changes
        if (this.monitoringEventHandler) {
            const monitoringStartedCleanup = window.electronAPI.events.onMonitoringStarted(() => {
                this.monitoringEventHandler?.().catch((error) => {
                    console.error("Error in monitoring started handler:", error);
                });
            });
            this.cleanupFunctions.push(monitoringStartedCleanup);

            const monitoringStoppedCleanup = window.electronAPI.events.onMonitoringStopped(() => {
                this.monitoringEventHandler?.().catch((error) => {
                    console.error("Error in monitoring stopped handler:", error);
                });
            });
            this.cleanupFunctions.push(monitoringStoppedCleanup);
        }

        this.isListenerAttached = true;
        logStoreAction("StatusUpdateManager", "subscribed", {
            message: "Successfully subscribed to status updates",
            subscribed: true,
        });
    }

    /**
     * Unsubscribe from status updates and monitoring events
     */
    unsubscribe(): void {
        // Call all cleanup functions to properly remove listeners
        this.cleanupFunctions.forEach((cleanup) => cleanup());
        this.cleanupFunctions = [];
        
        this.handler = undefined;
        this.monitoringEventHandler = undefined;
        this.isListenerAttached = false;
        logStoreAction("StatusUpdateManager", "unsubscribed", {
            message: "Successfully unsubscribed from status updates",
            unsubscribed: true,
        });
    }

    /**
     * Check if currently subscribed
     */
    isSubscribed(): boolean {
        return this.handler !== undefined && this.isListenerAttached;
    }
}
