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
import type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";
import type { Site, StatusUpdate } from "@shared/types";

import { isDevelopment } from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";
import { isEnrichedMonitorStatusChangedEventData } from "@shared/validation/monitorStatusEvents";

import type { ListenerAttachmentState } from "../baseTypes";
import type { MonitorStatusChangedEvent } from "./statusUpdateMerge";

import { logger } from "../../../services/logger";
import {
    createInitialListenerStates,
    createStatusUpdateListenerDescriptors,
} from "./statusUpdateListeners";
import { mergeMonitorStatusChange } from "./statusUpdateMerge";

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
 * Result returned when attempting to subscribe to status updates.
 *
 * @public
 */
export interface StatusUpdateSubscriptionResult {
    /** Collected error messages encountered during subscription. */
    errors: string[];
    /** Expected number of listeners to attach. */
    expectedListeners: number;
    /** Total number of listeners that were attached. */
    listenersAttached: number;
    /** Detailed attachment state for each listener scope. */
    listenerStates: ListenerAttachmentState[];
    /** Whether all listeners were attached successfully without errors. */
    success: boolean;
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
    /** Number of listeners required for a healthy subscription. */
    public static readonly EXPECTED_LISTENER_COUNT = 4;

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
                (site) => site.identifier === event.siteIdentifier
            );
            if (!siteExists && isDevelopment()) {
                logger.debug(`Site ${event.siteIdentifier} not found in store`);
            }

            // Apply the update using the complete monitor object from the event
            const updatedSites = this.applyMonitorStatusUpdate(
                currentSites,
                event
            );
            this.setSites(updatedSites);

            const updatedSite = updatedSites.find(
                (site) => site.identifier === event.siteIdentifier
            );

            // Call optional update callback
            if (this.onUpdate && updatedSite) {
                const statusUpdate: StatusUpdate = {
                    monitor: event.monitor,
                    monitorId: event.monitorId,
                    site: updatedSite,
                    siteIdentifier: event.siteIdentifier,
                    status: event.status,
                    timestamp: new Date(event.timestamp).toISOString(),
                };

                if (event.details !== undefined) {
                    statusUpdate.details = event.details;
                }

                if (event.previousStatus !== undefined) {
                    statusUpdate.previousStatus = event.previousStatus;
                }

                if (event.responseTime !== undefined) {
                    statusUpdate.responseTime = event.responseTime;
                }

                this.onUpdate(statusUpdate);
            }

            if (isDevelopment()) {
                logger.debug(
                    `Applied incremental status update: site=${event.siteIdentifier}, monitor=${event.monitorId}, ${event.previousStatus} → ${event.status}`
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
    public async subscribe(): Promise<StatusUpdateSubscriptionResult> {
        // Cleanup existing subscriptions if any
        this.unsubscribe();

        const errors: string[] = [];
        let listenersAttached = 0;
        const expectedListeners = StatusUpdateManager.EXPECTED_LISTENER_COUNT;
        let encounteredListenerFailure = false;

        try {
            await this.fullResyncSites();
        } catch (error) {
            const normalizedError = ensureError(error);
            errors.push(`initial-sync: ${normalizedError.message}`);
            logger.error(
                "Initial full sync on status update handler subscribe failed",
                normalizedError
            );
        }

        const listenerDescriptors: Array<{
            label: string;
            register: () => Promise<() => void>;
            scope: string;
        }> = createStatusUpdateListenerDescriptors({
            handleMonitoringStarted: (event) => {
                this.handleMonitoringLifecycleEvent("started", event);
            },
            handleMonitoringStopped: (event) => {
                this.handleMonitoringLifecycleEvent("stopped", event);
            },
            processStatusUpdateCandidate: (candidate, source) => {
                void this.processStatusUpdateCandidate(candidate, source);
            },
        });

        let listenerStates: ListenerAttachmentState[] =
            createInitialListenerStates(listenerDescriptors);

        /* eslint-disable no-await-in-loop -- Event listeners must be attached sequentially to preserve registration order */
        for (const [
            index,
            { register, scope },
        ] of listenerDescriptors.entries()) {
            if (encounteredListenerFailure) {
                break;
            }

            try {
                const cleanup = await register();
                this.cleanupFunctions.push(cleanup);
                listenersAttached += 1;
                listenerStates = listenerStates.map((listenerState, idx) =>
                    idx === index
                        ? { ...listenerState, attached: true }
                        : listenerState);
            } catch (error) {
                const normalizedError = ensureError(error);
                errors.push(`${scope}: ${normalizedError.message}`);
                logger.error(
                    `Failed to register ${scope} listener`,
                    normalizedError
                );
                encounteredListenerFailure = true;
                listenersAttached = 0;
                this.unsubscribe();
            }
        }
        /* eslint-enable no-await-in-loop -- Sequential registration complete */

        this.isListenerAttached = listenersAttached === expectedListeners;

        return {
            errors,
            expectedListeners,
            listenersAttached,
            listenerStates,
            success:
                errors.length === 0 &&
                !encounteredListenerFailure &&
                listenersAttached === expectedListeners,
        } satisfies StatusUpdateSubscriptionResult;
    }

    /**
     * Process an unknown candidate payload that may represent an enriched
     * monitor status change.
     *
     * @remarks
     * This method centralizes:
     *
     * - Type guard checks
     * - Development diagnostics
     * - Fallback to full resync when payloads are incomplete
     * - Error containment so listener callbacks never throw
     */
    private async processStatusUpdateCandidate(
        candidate: unknown,
        source: string
    ): Promise<void> {
        try {
            if (this.isMonitorStatusChangedEvent(candidate)) {
                if (isDevelopment()) {
                    logger.debug(
                        `[StatusUpdateHandler] Processing status update candidate from ${source}`
                    );
                }

                await this.handleIncrementalStatusUpdate(candidate);
                return;
            }

            if (isDevelopment()) {
                logger.warn(
                    `[StatusUpdateHandler] ${source} payload missing enriched monitor/site data; triggering full sync`,
                    candidate
                );
            }

            await this.fullResyncSites();
        } catch (error) {
            logger.error(
                `[StatusUpdateHandler] ${source} processing failed`,
                ensureError(error)
            );
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
     * Retrieves the expected listener count for diagnostics.
     *
     * @returns Number of listeners the manager attempts to attach.
     */
    public getExpectedListenerCount(): number {
        return StatusUpdateManager.EXPECTED_LISTENER_COUNT;
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
     * Unsubscribe from all status update events.
     *
     * @remarks
     * Cleans up all IPC event listeners and resets internal state. Safe to call
     * multiple times - will not throw if already unsubscribed.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * manager.unsubscribe();
     * logger.info("Subscription active?", {
     *     isSubscribed: manager.isSubscribed(),
     * }); // false
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

    private handleMonitoringLifecycleEvent(
        phase: "started",
        event: RendererEventPayloadMap["monitoring:started"]
    ): void;

    private handleMonitoringLifecycleEvent(
        phase: "stopped",
        event: RendererEventPayloadMap["monitoring:stopped"]
    ): void;

    private handleMonitoringLifecycleEvent(
        phase: "started" | "stopped",
        event:
            | RendererEventPayloadMap["monitoring:started"]
            | RendererEventPayloadMap["monitoring:stopped"]
    ): void {
        const logPayload: Record<string, unknown> = { phase };

        if (event.monitorCount !== undefined) {
            logPayload["monitorCount"] = event.monitorCount;
        }

        if (event.siteCount !== undefined) {
            logPayload["siteCount"] = event.siteCount;
        }

        logPayload["timestamp"] = event["timestamp"];

        if (typeof event.activeMonitors === "number") {
            logPayload["activeMonitors"] = event.activeMonitors;
        }

        if (typeof event.reason === "string") {
            logPayload["reason"] = event.reason;
        }

        logger.debug("Received monitoring lifecycle event", logPayload);
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
        return mergeMonitorStatusChange(sites, event);
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
        return isEnrichedMonitorStatusChangedEventData(data);
    }
}
