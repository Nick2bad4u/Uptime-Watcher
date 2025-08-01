/**
 * Status update handler utility for managing site status updates.
 *
 * @remarks
 * Provides optimized incremental updates with fallback mechanisms for real-time site status synchronization.
 * This module handles the complex orchestration between frontend state and backend events.
 * Implements efficient incremental updates to minimize unnecessary data fetching.
 *
 * @public
 */

import type { Monitor, MonitorStatus, Site, StatusUpdate } from "@shared/types";

import { isDevelopment } from "../../../../shared/utils/environment";
import logger from "../../../services/logger";
import { ensureError, withUtilityErrorHandling } from "../../../utils/errorHandling";

/**
 * Configuration options for status update handler operations.
 *
 * @remarks
 * Defines the required dependencies and callbacks for managing status update subscriptions.
 * All functions should be stable references to avoid unnecessary re-subscriptions.
 *
 * @public
 */
export interface StatusUpdateHandlerOptions {
    /**
     * Function to trigger full sync from backend.
     *
     * @remarks
     * Called when incremental updates fail or when a complete refresh is needed.
     */
    fullSyncFromBackend: () => Promise<void>;

    /**
     * Function to get current sites array.
     *
     * @remarks
     * Should return the current state of sites from the store.
     */
    getSites: () => Site[];

    /**
     * Optional callback for additional processing of updates.
     *
     * @remarks
     * Called before applying the update to the store. Can be used for logging or side effects.
     */
    onUpdate?: (update: StatusUpdate) => void;

    /**
     * Function to set sites array in store.
     *
     * @remarks
     * Should update the store with the new sites array.
     */
    setSites: (sites: Site[]) => void;
}

/**
 * Monitor status changed event data structure.
 *
 * @remarks
 * This represents the actual data structure sent from the backend
 * when a monitor's status changes. Used for efficient incremental updates.
 *
 * @internal
 */
interface MonitorStatusChangedEvent {
    monitorId: string;
    newStatus: MonitorStatus;
    previousStatus: MonitorStatus;
    siteId: string;
}

/**
 * Manages status update subscriptions and event handling with efficient incremental updates.
 *
 * @remarks
 * Provides a centralized manager for subscribing to and handling real-time status updates
 * from the backend. Handles IPC event management and cleanup automatically.
 * Prioritizes incremental updates over full syncs for better performance.
 *
 * @example
 * ```typescript
 * const manager = new StatusUpdateManager({
 *   fullSyncFromBackend: () => syncSites(),
 *   getSites: () => store.getSites(),
 *   setSites: (sites) => store.setSites(sites)
 * });
 *
 * manager.subscribe();
 * ```
 *
 * @public
 */
export class StatusUpdateManager {
    private cleanupFunctions: (() => void)[] = [];
    private readonly fullSyncFromBackend: () => Promise<void>;
    private readonly getSites: () => Site[];
    private isListenerAttached = false;
    private readonly onUpdate: ((update: StatusUpdate) => void) | undefined;
    private readonly setSites: (sites: Site[]) => void;

    /**
     * Constructs a new StatusUpdateManager instance.
     *
     * @param options - Configuration options for the status update manager
     *
     * @remarks
     * Initializes the manager with the required dependencies for status update handling.
     * Does not start listening for events until subscribe() is called.
     */
    constructor(options: StatusUpdateHandlerOptions) {
        this.fullSyncFromBackend = options.fullSyncFromBackend;
        this.getSites = options.getSites;
        this.setSites = options.setSites;
        this.onUpdate = options.onUpdate ?? undefined;
    }

    /**
     * Check if currently subscribed to status updates.
     *
     * @returns True if subscribed and listening for events, false otherwise
     *
     * @remarks
     * Returns true when event listeners are active.
     */
    isSubscribed(): boolean {
        return this.isListenerAttached;
    }

    /**
     * Subscribe to status updates from the backend with efficient incremental processing.
     *
     * @remarks
     * Sets up IPC event listeners for monitor status changes and monitoring lifecycle events.
     * Automatically performs an initial full sync when subscribing.
     * Prioritizes incremental updates over full syncs for better performance.
     *
     * @example
     * ```typescript
     * manager.subscribe();
     * ```
     */
    subscribe(): void {
        // Cleanup existing subscriptions if any
        this.unsubscribe();

        // Initial full sync
        void withUtilityErrorHandling(
            async () => {
                await this.fullSyncFromBackend();
            },
            "Initial full sync on status update handler subscribe",
            undefined,
            false
        );

        // Listen to monitor status changed events for efficient incremental updates
        const statusUpdateCleanup = window.electronAPI.events.onMonitorStatusChanged((data: unknown) => {
            void withUtilityErrorHandling(
                async () => {
                    if (this.isMonitorStatusChangedEvent(data)) {
                        await this.handleIncrementalStatusUpdate(data);
                    } else {
                        // Invalid data structure - trigger full sync as fallback
                        if (isDevelopment()) {
                            logger.warn("Invalid monitor status changed event data, triggering full sync", data);
                        }
                        await this.fullSyncFromBackend();
                    }
                },
                "Monitor status update processing",
                undefined,
                false
            );
        });

        this.cleanupFunctions.push(statusUpdateCleanup);

        // Subscribe to monitoring lifecycle events for full sync triggers
        const monitoringStartedCleanup = window.electronAPI.events.onMonitoringStarted(() => {
            void withUtilityErrorHandling(
                async () => {
                    await this.fullSyncFromBackend();
                },
                "Full sync on monitoring started",
                undefined,
                false
            );
        });

        this.cleanupFunctions.push(monitoringStartedCleanup);

        const monitoringStoppedCleanup = window.electronAPI.events.onMonitoringStopped(() => {
            void withUtilityErrorHandling(
                async () => {
                    await this.fullSyncFromBackend();
                },
                "Full sync on monitoring stopped",
                undefined,
                false
            );
        });

        this.cleanupFunctions.push(monitoringStoppedCleanup);

        this.isListenerAttached = true;
    }

    /**
     * Unsubscribe from all status update events.
     *
     * @remarks
     * Cleans up all IPC event listeners and resets internal state.
     * Safe to call multiple times - will not throw if already unsubscribed.
     *
     * @example
     * ```typescript
     * manager.unsubscribe();
     * console.log(manager.isSubscribed()); // false
     * ```
     */
    unsubscribe(): void {
        // Clean up all event listeners
        for (const cleanup of this.cleanupFunctions) {
            cleanup();
        }
        this.cleanupFunctions = [];

        // Reset state
        this.isListenerAttached = false;
    }

    /**
     * Apply monitor status update to sites array.
     *
     * @param sites - Current sites array
     * @param site - Site containing the monitor
     * @param monitor - Monitor to update
     * @param event - Status change event
     * @returns Updated sites array
     *
     * @internal
     */
    private applyMonitorStatusUpdate(
        sites: Site[],
        site: Site,
        monitor: Monitor,
        event: MonitorStatusChangedEvent
    ): Site[] {
        const updatedMonitor: Monitor = {
            ...monitor,
            lastChecked: new Date(),
            status: event.newStatus,
        };

        const updatedSite = {
            ...site,
            monitors: site.monitors.map((m) => (m.id === event.monitorId ? updatedMonitor : m)),
        };

        return sites.map((s) => (s.identifier === event.siteId ? updatedSite : s));
    }

    /**
     * Find a monitor in a site by monitor ID.
     *
     * @param site - Site to search for monitor
     * @param monitorId - Monitor ID to find
     * @returns Monitor if found, undefined otherwise
     *
     * @internal
     */
    private findMonitorInSite(site: Site, monitorId: string): Monitor | undefined {
        return site.monitors.find((monitor) => monitor.id === monitorId);
    }

    /**
     * Find a site in the store by identifier.
     *
     * @param sites - Array of sites to search
     * @param siteId - Site identifier to find
     * @returns Site if found, undefined otherwise
     *
     * @internal
     */
    private findSiteInStore(sites: Site[], siteId: string): Site | undefined {
        return sites.find((site) => site.identifier === siteId);
    }

    /**
     * Handle incremental status updates efficiently without full sync.
     *
     * @param event - Monitor status changed event data
     *
     * @remarks
     * Applies status changes directly to existing site/monitor data in the store.
     * This is much more efficient than triggering a full sync for every status change.
     * Falls back to full sync only if the site/monitor cannot be found.
     *
     * @internal
     */
    private async handleIncrementalStatusUpdate(event: MonitorStatusChangedEvent): Promise<void> {
        try {
            const currentSites = this.getSites();
            const site = this.findSiteInStore(currentSites, event.siteId);

            if (!site) {
                if (isDevelopment()) {
                    logger.debug(`Site ${event.siteId} not found in store, triggering full sync`);
                }
                await this.fullSyncFromBackend();
                return;
            }

            const monitor = this.findMonitorInSite(site, event.monitorId);

            if (!monitor) {
                if (isDevelopment()) {
                    logger.debug(`Monitor ${event.monitorId} not found in site ${event.siteId}, triggering full sync`);
                }
                await this.fullSyncFromBackend();
                return;
            }

            const updatedSites = this.applyMonitorStatusUpdate(currentSites, site, monitor, event);
            this.setSites(updatedSites);

            // Call optional update callback
            if (this.onUpdate) {
                const updatedSite = updatedSites.find((s) => s.identifier === event.siteId);
                if (updatedSite) {
                    this.onUpdate({
                        monitorId: event.monitorId,
                        previousStatus: event.previousStatus,
                        site: updatedSite,
                        siteIdentifier: event.siteId,
                        status: event.newStatus,
                        timestamp: new Date().toISOString(),
                    });
                }
            }

            if (isDevelopment()) {
                logger.debug(
                    `Applied incremental status update: site=${event.siteId}, monitor=${event.monitorId}, ${event.previousStatus} → ${event.newStatus}`
                );
            }
        } catch (error) {
            logger.error("Failed to apply incremental status update, falling back to full sync", ensureError(error));
            await this.fullSyncFromBackend();
        }
    }

    /**
     * Type guard to validate incoming data as MonitorStatusChangedEvent.
     *
     * @param data - Unknown data from IPC events
     * @returns True if data conforms to MonitorStatusChangedEvent interface
     *
     * @remarks
     * Performs structural validation to ensure the data has the expected shape
     * for incremental processing. This helps prevent runtime errors from malformed data.
     *
     * @internal
     */
    private isMonitorStatusChangedEvent(data: unknown): data is MonitorStatusChangedEvent {
        if (typeof data !== "object" || data === null) {
            return false;
        }

        const record = data as Record<string, unknown>;
        return (
            "monitorId" in data &&
            "newStatus" in data &&
            "previousStatus" in data &&
            "siteId" in data &&
            typeof record["monitorId"] === "string" &&
            typeof record["newStatus"] === "string" &&
            typeof record["previousStatus"] === "string" &&
            typeof record["siteId"] === "string"
        );
    }
}

/**
 * Creates a status update handler with robust concurrency control (legacy function).
 *
 * @param options - Configuration options for the status update handler
 * @returns Async function that processes status updates safely
 *
 * @remarks
 * This function is maintained for backward compatibility but is no longer the recommended approach.
 * Use StatusUpdateManager for better performance and more efficient incremental updates.
 *
 * @deprecated Use StatusUpdateManager instead for better performance
 * @public
 */
export function createStatusUpdateHandler(
    options: StatusUpdateHandlerOptions
): (update: StatusUpdate) => Promise<void> {
    const { fullSyncFromBackend, getSites, onUpdate, setSites } = options;

    // Track pending updates with completion promises to ensure proper sequencing
    const pendingOperations = new Map<string, Promise<void>>();

    return async (update: StatusUpdate): Promise<void> => {
        const siteId = update.site?.identifier ?? update.siteIdentifier;

        // Chain this update after any pending operation for the same site
        const previousOperation = pendingOperations.get(siteId) ?? Promise.resolve();

        const currentOperation = previousOperation
            .then(async () => {
                if (onUpdate) {
                    onUpdate(update);
                }
                // eslint-disable-next-line sonarjs/deprecation -- Legacy function maintained for backward compatibility
                return applySiteUpdateDirectly(update, siteId, getSites, setSites, fullSyncFromBackend);
            })
            .catch(async (error) => {
                logger.error(`Failed to process status update for site ${siteId}`, ensureError(error));
                return withUtilityErrorHandling(
                    async () => {
                        await fullSyncFromBackend();
                    },
                    "Fallback full sync after status update error",
                    undefined,
                    false
                );
            })
            .finally(() => {
                // Clean up this operation if it's still the current one
                if (pendingOperations.get(siteId) === currentOperation) {
                    pendingOperations.delete(siteId);
                }
            });

        // Track this operation as pending
        pendingOperations.set(siteId, currentOperation);

        // Wait for completion
        await currentOperation;
    };
}

/**
 * Applies a site update directly to the store without complex tracking (legacy function).
 *
 * @param update - The status update to apply
 * @param siteId - The site identifier
 * @param getSites - Function to get current sites
 * @param setSites - Function to update sites
 * @param fullSyncFromBackend - Fallback sync function
 *
 * @remarks
 * Simplified update application that either updates an existing site
 * or triggers a full sync if the site is not found.
 *
 * @deprecated Use StatusUpdateManager for better performance
 * @internal
 */
async function applySiteUpdateDirectly(
    update: StatusUpdate,
    siteId: string,
    getSites: () => Site[],
    setSites: (sites: Site[]) => void,
    fullSyncFromBackend: () => Promise<void>
): Promise<void> {
    const currentSites = getSites();
    const siteIndex = currentSites.findIndex((site) => site.identifier === siteId);

    if (siteIndex !== -1 && update.site && siteIndex >= 0 && siteIndex < currentSites.length) {
        // Update existing site with bounds checking
        const updatedSites = Array.from(currentSites);
        const siteToUpdate = update.site;
        // Safe assignment with bounds validation
        updatedSites.splice(siteIndex, 1, siteToUpdate);
        setSites(updatedSites);

        if (isDevelopment()) {
            logger.debug(`Applied status update for site: ${siteId}`);
        }
    } else {
        // Site not found or invalid update - trigger full sync
        if (isDevelopment()) {
            if (!update.site) {
                logger.warn(`Status update missing site data for ${siteId}, triggering full sync`);
            } else {
                logger.warn(`Site ${siteId} not found in store, triggering full sync`);
            }
        }
        await fullSyncFromBackend();
    }
}
