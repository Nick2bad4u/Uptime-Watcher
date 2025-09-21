/**
 * Status update handler utility for managing site status updates.
 *
 * @remarks
 * Provides optimized incremental updates with fallback mechanisms for real-time
 * site status synchronization. This module handles the complex orchestration
 * between frontend state and backend events. Implements efficient incremental
 * updates to minimize unnecessary data fetching.
 *
 * @public
 */

import type { Monitor, MonitorStatus, Site, StatusUpdate } from "@shared/types";
import type { UnknownRecord } from "type-fest";

import { isDevelopment } from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";

import { EventsService } from "../../../services/EventsService";
import { logger } from "../../../services/logger";

/**
 * Monitor status changed event data structure.
 *
 * @remarks
 * This represents the actual data structure sent from the backend when a
 * monitor's status changes. Includes the complete monitor and site objects with
 * updated history for efficient incremental updates.
 *
 * @internal
 */
interface MonitorStatusChangedEvent {
    /** The complete monitor object with updated history. */
    monitor: Monitor;
    /** The ID of the monitor. */
    monitorId: string;
    /** The new status string. */
    newStatus: MonitorStatus;
    /** The previous status string. */
    previousStatus: MonitorStatus;
    /** Optional response time in ms. */
    responseTime?: number;
    /** The complete site object. */
    site: Site;
    /** The ID of the site. */
    siteId: string;
    /** Unix timestamp (ms) when the status changed. */
    timestamp: number;
}

/**
 * Configuration options for status update handler operations.
 *
 * @remarks
 * Defines the required dependencies and callbacks for managing status update
 * subscriptions. All functions should be stable references to avoid unnecessary
 * re-subscriptions.
 *
 * @public
 */
export interface StatusUpdateHandlerOptions {
    /**
     * Function to trigger full sync from backend.
     *
     * @remarks
     * Called when incremental updates fail or when a complete refresh is
     * needed.
     */
    fullResyncSites: () => Promise<void>;

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
     * Called before applying the update to the store. Can be used for logging
     * or side effects.
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
 * Manages status update subscriptions and event handling with efficient
 * incremental updates.
 *
 * @remarks
 * Provides a centralized manager for subscribing to and handling real-time
 * status updates from the backend. Handles IPC event management and cleanup
 * automatically. Prioritizes incremental updates over full syncs for better
 * performance.
 *
 * @example
 *
 * ```typescript
 * const manager = new StatusUpdateManager({
 *     fullResyncSites: () => syncSites(),
 *     getSites: () => store.getSites(),
 *     setSites: (sites) => store.setSites(sites),
 * });
 *
 * manager.subscribe();
 * ```
 *
 * @public
 */
export class StatusUpdateManager {
    /**
     * Array of cleanup functions for active event listeners.
     *
     * @remarks
     * Stores cleanup functions returned by IPC event listeners. These are
     * called during unsubscribe() to properly remove event listeners and
     * prevent memory leaks. Each function removes a specific event listener.
     *
     * @internal
     */
    private cleanupFunctions: Array<() => void> = [];

    /**
     * Function to trigger full site data sync from backend.
     *
     * @remarks
     * Callback function provided during construction that performs a complete
     * refresh of site data from the backend. Used as fallback when incremental
     * updates fail or when a full sync is required.
     *
     * @internal
     */
    private readonly fullResyncSites: () => Promise<void>;

    /**
     * Function to get current sites from store.
     *
     * @remarks
     * Callback function that returns the current array of sites from the store
     * state. Used to access current data when applying incremental status
     * updates.
     *
     * @internal
     */
    private readonly getSites: () => Site[];

    /**
     * Flag tracking whether event listener is currently attached.
     *
     * @remarks
     * Boolean flag that tracks the subscription state. True when IPC event
     * listeners are active and receiving status updates. Used to prevent
     * duplicate subscriptions and to provide subscription status.
     *
     * @internal
     */
    private isListenerAttached = false;

    /**
     * Optional callback for status update notifications.
     *
     * @remarks
     * Optional callback function that is invoked when a status update is
     * successfully applied. Receives the StatusUpdate object with details about
     * the change. Can be used for logging or triggering side effects.
     *
     * @internal
     */
    private readonly onUpdate: ((update: StatusUpdate) => void) | undefined;

    /**
     * Function to update sites in the store.
     *
     * @remarks
     * Callback function that updates the store with a new array of sites. Used
     * to apply incremental status updates and full sync results to the store
     * state.
     *
     * @internal
     */
    private readonly setSites: (sites: Site[]) => void;

    /**
     * Handle incremental status updates efficiently using complete event data.
     *
     * @remarks
     * Applies status changes using the complete monitor and site objects from
     * the backend event. This preserves the updated history and ensures check
     * counts increment correctly while providing real-time updates.
     *
     * @param event - Monitor status changed event with complete data
     *
     * @internal
     */
    private async handleIncrementalStatusUpdate(
        event: MonitorStatusChangedEvent
    ): Promise<void> {
        try {
            const currentSites = this.getSites();

            // Log if site not found in development mode
            const siteExists = currentSites.some(
                (site) => site.identifier === event.siteId
            );
            if (!siteExists && isDevelopment()) {
                logger.debug(`Site ${event.siteId} not found in store`);
            }

            // Apply the update using the complete monitor object from the event
            const updatedSites = this.applyMonitorStatusUpdate(
                currentSites,
                event
            );
            this.setSites(updatedSites);

            // Call optional update callback
            if (this.onUpdate) {
                this.onUpdate({
                    monitorId: event.monitorId,
                    previousStatus: event.previousStatus,
                    site: event.site, // Use the complete site from event
                    siteIdentifier: event.siteId,
                    status: event.newStatus,
                    timestamp: new Date(event.timestamp).toISOString(),
                });
            }

            if (isDevelopment()) {
                logger.debug(
                    `Applied incremental status update: site=${event.siteId}, monitor=${event.monitorId}, ${event.previousStatus} → ${event.newStatus}`
                );
            }
        } catch (error) {
            logger.error(
                "Failed to apply incremental status update, falling back to full sync",
                ensureError(error)
            );
            await this.fullResyncSites();
        }
    }

    /**
     * Constructs a new StatusUpdateManager instance.
     *
     * @remarks
     * Initializes the manager with the required dependencies for status update
     * handling. Does not start listening for events until subscribe() is
     * called.
     *
     * @param options - Configuration options for the status update manager
     */
    public constructor(options: StatusUpdateHandlerOptions) {
        this.fullResyncSites = options.fullResyncSites;
        this.getSites = options.getSites;
        this.setSites = options.setSites;
        this.onUpdate = options.onUpdate ?? undefined;
    }

    /**
     * Check if currently subscribed to status updates.
     *
     * @remarks
     * Returns true when event listeners are active.
     *
     * @returns True if subscribed and listening for events, false otherwise
     */
    public isSubscribed(): boolean {
        return this.isListenerAttached;
    }

    /**
     * Subscribe to status updates from the backend with efficient incremental
     * processing.
     *
     * @remarks
     * Sets up IPC event listeners for monitor status changes and monitoring
     * lifecycle events. Automatically performs an initial full sync when
     * subscribing. Prioritizes incremental updates over full syncs for better
     * performance.
     *
     * @example
     *
     * ```typescript
     * manager.subscribe();
     * ```
     */
    public subscribe(): void {
        // Cleanup existing subscriptions if any
        this.unsubscribe();

        // Initial full sync
        void (async (): Promise<void> => {
            try {
                await this.fullResyncSites();
            } catch (error) {
                // Log error but don't throw - subscription should continue
                logger.error(
                    "Initial full sync on status update handler subscribe failed",
                    ensureError(error)
                );
            }
        })();

        // Listen to monitor status changed events for efficient incremental
        // updates
        void (async (): Promise<void> => {
            try {
                const statusUpdateCleanup =
                    await EventsService.onMonitorStatusChanged(
                        (data: unknown) => {
                            void (async (): Promise<void> => {
                                try {
                                    if (
                                        this.isMonitorStatusChangedEvent(data)
                                    ) {
                                        logger.debug(
                                            "Processing valid monitor status change event"
                                        );
                                        await this.handleIncrementalStatusUpdate(
                                            data
                                        );
                                    } else {
                                        // Invalid data structure - trigger full sync
                                        // as fallback
                                        if (isDevelopment()) {
                                            logger.warn(
                                                "Invalid monitor status changed event data, triggering full sync",
                                                data
                                            );
                                        }
                                        logger.debug(
                                            "Event failed type guard, triggering full sync"
                                        );
                                        await this.fullResyncSites();
                                    }
                                } catch (error) {
                                    // Log error but don't throw - event handling should continue
                                    logger.error(
                                        "Monitor status update processing failed",
                                        ensureError(error)
                                    );
                                }
                            })();
                        }
                    );
                this.cleanupFunctions.push(statusUpdateCleanup);
            } catch (error) {
                logger.error(
                    "Failed to register monitor status change listener",
                    ensureError(error)
                );
            }
        })();

        // Subscribe to monitoring lifecycle events for full sync triggers
        void (async (): Promise<void> => {
            try {
                const monitoringStartedCleanup =
                    await EventsService.onMonitoringStarted(() => {
                        void (async (): Promise<void> => {
                            try {
                                await this.fullResyncSites();
                            } catch (error) {
                                // Log error but don't throw - event handling should continue
                                logger.error(
                                    "Full sync on monitoring started failed",
                                    ensureError(error)
                                );
                            }
                        })();
                    });

                this.cleanupFunctions.push(monitoringStartedCleanup);
            } catch (error) {
                logger.error(
                    "Failed to register monitoring started listener",
                    ensureError(error)
                );
            }
        })();

        void (async (): Promise<void> => {
            try {
                const monitoringStoppedCleanup =
                    await EventsService.onMonitoringStopped(() => {
                        void (async (): Promise<void> => {
                            try {
                                await this.fullResyncSites();
                            } catch (error) {
                                // Log error but don't throw - event handling should continue
                                logger.error(
                                    "Full sync on monitoring stopped failed",
                                    ensureError(error)
                                );
                            }
                        })();
                    });

                this.cleanupFunctions.push(monitoringStoppedCleanup);
            } catch (error) {
                logger.error(
                    "Failed to register monitoring stopped listener",
                    ensureError(error)
                );
            }
        })();

        this.isListenerAttached = true;
    }

    /**
     * Unsubscribe from all status update events.
     *
     * @remarks
     * Cleans up all IPC event listeners and resets internal state. Safe to call
     * multiple times - will not throw if already unsubscribed.
     *
     * @example
     *
     * ```typescript
     * manager.unsubscribe();
     * console.log(manager.isSubscribed()); // false
     * ```
     */
    public unsubscribe(): void {
        // Clean up all event listeners
        for (const cleanup of this.cleanupFunctions) {
            cleanup();
        }
        this.cleanupFunctions = [];

        // Reset state
        this.isListenerAttached = false;
    }

    /**
     * Apply monitor status update using smart merging of fresh monitor data.
     *
     * @remarks
     * Uses the fresh monitor object from the backend event to update the
     * specific monitor while preserving the existing site structure and other
     * monitors. This ensures updated history and response times are applied
     * without losing site-level context.
     *
     * @param sites - Current sites array
     * @param event - Status change event with fresh monitor data
     *
     * @returns Updated sites array
     *
     * @internal
     */
    private applyMonitorStatusUpdate(
        sites: Site[],
        event: MonitorStatusChangedEvent
    ): Site[] {
        return sites.map((site) => {
            // Only update the site that contains this monitor
            if (site.identifier !== event.siteId) {
                return site;
            }

            // Log if monitor not found in site
            const monitorExists = site.monitors.some(
                (m) => m.id === event.monitorId
            );
            if (!monitorExists && isDevelopment()) {
                logger.debug(
                    `Monitor ${event.monitorId} not found in site ${event.siteId}`
                );
            }

            // Update the specific monitor with fresh data from the event
            const updatedMonitors = site.monitors.map((monitor) => {
                if (monitor.id !== event.monitorId) {
                    return monitor;
                }

                // Use the fresh monitor data from the event which includes
                // updated history, response time, and all database changes
                return event.monitor;
            });

            // Preserve the existing site structure but update monitors
            return {
                ...site,
                monitors: updatedMonitors,
            };
        });
    }

    /**
     * Type guard to validate incoming data as complete
     * MonitorStatusChangedEvent.
     *
     * @remarks
     * Performs structural validation to ensure the data has the expected shape
     * for incremental processing with complete monitor and site objects. This
     * helps prevent runtime errors from malformed data.
     *
     * @param data - Unknown data from IPC events
     *
     * @returns True if data conforms to MonitorStatusChangedEvent interface
     *
     * @internal
     */
    private isMonitorStatusChangedEvent(
        data: unknown
    ): data is MonitorStatusChangedEvent {
        if (typeof data !== "object" || data === null) {
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: Type guard with runtime validation following
        const record = data as UnknownRecord;

        // Validate basic event fields
        const hasBasicFields =
            "monitorId" in data &&
            "newStatus" in data &&
            "previousStatus" in data &&
            "siteId" in data &&
            "timestamp" in data &&
            typeof record["monitorId"] === "string" &&
            typeof record["newStatus"] === "string" &&
            typeof record["previousStatus"] === "string" &&
            typeof record["siteId"] === "string" &&
            typeof record["timestamp"] === "number";

        // Validate complete monitor and site objects are present
        const hasCompleteObjects =
            "monitor" in data &&
            "site" in data &&
            typeof record["monitor"] === "object" &&
            record["monitor"] !== null &&
            typeof record["site"] === "object" &&
            record["site"] !== null;

        return hasBasicFields && hasCompleteObjects;
    }
}
