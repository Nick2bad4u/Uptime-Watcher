/**
 * Status update handler utility for managing site status updates.
 * Provides optimized incremental updates and fallback mechanisms.
 */

import type { Site, StatusUpdate } from "@shared/types";

import { isDevelopment } from "../../../../shared/utils/environment";
import logger from "../../../services/logger";
import { ensureError, withUtilityErrorHandling } from "../../../utils/errorHandling";
import { logStoreAction, waitForElectronAPI } from "../../utils";

export interface StatusUpdateHandlerOptions {
    /** Function to trigger full sync */
    fullSyncFromBackend: () => Promise<void>;
    /** Function to get current sites */
    getSites: () => Site[];
    /** Optional callback for additional processing */
    onUpdate?: (update: StatusUpdate) => void;
    /** Function to set sites */
    setSites: (sites: Site[]) => void;
}

/**
 * Manages status update subscriptions
 */
export class StatusUpdateManager {
    private cleanupFunctions: (() => void)[] = [];
    private handler: ((update: StatusUpdate) => Promise<void>) | undefined = undefined;
    private isListenerAttached = false;
    private monitoringEventHandler: (() => Promise<void>) | undefined = undefined;

    /**
     * Check if currently subscribed
     */
    isSubscribed(): boolean {
        return this.handler !== undefined && this.isListenerAttached;
    }

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
            logger.error("Failed to initialize electronAPI:", ensureError(error));
            throw new Error("Failed to initialize electronAPI");
        }

        // Subscribe to monitor status changes
        const statusUpdateCleanup = window.electronAPI.events.onMonitorStatusChanged((update: StatusUpdate) => {
            void withUtilityErrorHandling(
                async () => {
                    await this.handler?.(update);
                },
                "Handle status update",
                undefined,
                false
            );
        });
        this.cleanupFunctions.push(statusUpdateCleanup);

        // Subscribe to monitoring state changes
        if (this.monitoringEventHandler) {
            const monitoringStartedCleanup = window.electronAPI.events.onMonitoringStarted(() => {
                void withUtilityErrorHandling(
                    async () => {
                        await this.monitoringEventHandler?.();
                    },
                    "Handle monitoring started event",
                    undefined,
                    false
                );
            });
            this.cleanupFunctions.push(monitoringStartedCleanup);

            const monitoringStoppedCleanup = window.electronAPI.events.onMonitoringStopped(() => {
                void withUtilityErrorHandling(
                    async () => {
                        await this.monitoringEventHandler?.();
                    },
                    "Handle monitoring stopped event",
                    undefined,
                    false
                );
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
            const siteId = update.site?.identifier ?? update.siteIdentifier;

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
                            return update.site ? { ...update.site } : site;
                        }
                        return site;
                    });

                    setSites(updatedSites);
                    logStoreAction("StatusUpdateHandler", "incrementalUpdate", {
                        siteId: update.site?.identifier ?? update.siteIdentifier,
                        timestamp: updateTimestamp,
                    });
                }
            } else {
                // Site not found in current state - trigger full sync as fallback
                if (isDevelopment()) {
                    logger.warn(
                        `Site ${update.site?.identifier ?? update.siteIdentifier} not found in store, triggering full sync`
                    );
                }
                await withUtilityErrorHandling(
                    async () => {
                        await fullSyncFromBackend();
                    },
                    "Fallback full sync after site not found",
                    undefined,
                    false
                );
            }

            // Clean up pending update tracking
            if (pendingUpdates.get(siteId) === updateTimestamp) {
                pendingUpdates.delete(siteId);
            }
        } catch (error) {
            logger.error("Error processing status update", ensureError(error));
            // Clean up pending update tracking on error
            const siteId = update.site?.identifier ?? update.siteIdentifier;
            pendingUpdates.delete(siteId);
            // Fallback to full sync on any processing error
            await withUtilityErrorHandling(
                async () => {
                    await fullSyncFromBackend();
                },
                "Fallback sync after error",
                undefined,
                false
            );
        }
    };
}
