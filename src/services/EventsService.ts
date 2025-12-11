/**
 * Service layer for handling all event-related operations. Provides a clean
 * abstraction over electron API calls for event management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. This
 * service manages event registration and cleanup to prevent memory leaks with
 * automatic service initialization.
 *
 * @packageDocumentation
 */

import type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";
import type {
    CacheInvalidatedEventData,
    MonitorDownEventData,
    MonitorStatusChangedEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "./logger";
import { subscribeWithValidatedCleanup } from "./utils/cleanupHandlers";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("EventsService", {
            bridgeContracts: [
                {
                    domain: "events",
                    methods: [
                        "onCacheInvalidated",
                        "onHistoryLimitUpdated",
                        "onMonitorCheckCompleted",
                        "onMonitorDown",
                        "onMonitoringStarted",
                        "onMonitoringStopped",
                        "onMonitorStatusChanged",
                        "onMonitorUp",
                        "onSiteAdded",
                        "onSiteRemoved",
                        "onSiteUpdated",
                        "onTestEvent",
                        "onUpdateStatus",
                    ],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

type SiteAddedEventData = RendererEventPayloadMap["site:added"];
type SiteRemovedEventData = RendererEventPayloadMap["site:removed"];
type SiteUpdatedEventData = RendererEventPayloadMap["site:updated"];
type MonitoringStartedEventData = RendererEventPayloadMap["monitoring:started"];
type MonitoringStoppedEventData = RendererEventPayloadMap["monitoring:stopped"];
type MonitorCheckCompletedEventPayload =
    RendererEventPayloadMap["monitor:check-completed"];
type HistoryLimitUpdatedEventPayload =
    RendererEventPayloadMap["settings:history-limit-updated"];

/**
 * Runtime type guard narrowing monitoring control payloads to the "started"
 * variant.
 *
 * @param data - Raw payload emitted by the preload bridge.
 *
 * @returns `true` when the payload contains the counters associated with a
 *   monitoring-start event.
 */
const isMonitoringStartedEventData = (
    data: unknown
): data is MonitoringStartedEventData =>
    typeof data === "object" &&
    data !== null &&
    typeof (data as Partial<MonitoringStartedEventData>).monitorCount ===
        "number" &&
    typeof (data as Partial<MonitoringStartedEventData>).siteCount === "number";

/**
 * Runtime type guard narrowing monitoring control payloads to the "stopped"
 * variant.
 *
 * @param data - Raw payload emitted by the preload bridge.
 *
 * @returns `true` when the payload contains the fields expected from a
 *   monitoring-stop event.
 */
const isMonitoringStoppedEventData = (
    data: unknown
): data is MonitoringStoppedEventData =>
    typeof data === "object" &&
    data !== null &&
    typeof (data as Partial<MonitoringStoppedEventData>).activeMonitors ===
        "number" &&
    typeof (data as Partial<MonitoringStoppedEventData>).reason === "string";

/**
 * Builds a defensive cleanup handler used when the preload bridge returns an
 * invalid cleanup value.
 *
 * @param eventName - Name of the event whose cleanup failed validation.
 *
 * @returns A no-op cleanup function that logs a descriptive error when invoked.
 */
const createInvalidCleanupFallback = (eventName: string): (() => void) =>
    (): void => {
        logger.error(
            `[EventsService] Cleanup skipped for ${eventName}: invalid cleanup handler returned by preload bridge`
        );
    };

/**
 * Subscribes to a preload-managed event while enforcing cleanup contract
 * expectations using the shared cleanup validation utilities.
 *
 * @param eventName - Name of the event being subscribed to.
 * @param register - Callback invoking the preload registration function.
 *
 * @returns A promise resolving to a validated cleanup function.
 */
const subscribeWithValidation = async (
    eventName: string,
    register: () => unknown
): Promise<() => void> =>
    subscribeWithValidatedCleanup(register, {
        handleCleanupError: (error: unknown) => {
            logger.error(
                `[EventsService] Failed to cleanup ${eventName} listener:`,
                ensureError(error)
            );
        },
        handleInvalidCleanup: ({ actualType, cleanupCandidate }) => {
            logger.error(
                `[EventsService] Preload bridge returned an invalid cleanup handler for ${eventName}`,
                {
                    actualType,
                    value: cleanupCandidate,
                }
            );

            return createInvalidCleanupFallback(eventName);
        },
    });

/**
 * Contract describing the event subscription surface exposed by the
 * `EventsService` facade.
 */
interface EventsServiceContract {
    initialize: () => Promise<void>;
    onCacheInvalidated: (
        callback: (data: CacheInvalidatedEventData) => void
    ) => Promise<() => void>;
    onHistoryLimitUpdated: (
        callback: (data: HistoryLimitUpdatedEventPayload) => void
    ) => Promise<() => void>;
    onMonitorCheckCompleted: (
        callback: (data: MonitorCheckCompletedEventPayload) => void
    ) => Promise<() => void>;
    onMonitorDown: (
        callback: (data: MonitorDownEventData) => void
    ) => Promise<() => void>;
    onMonitoringStarted: (
        callback: (data: MonitoringStartedEventData) => void
    ) => Promise<() => void>;
    onMonitoringStopped: (
        callback: (data: MonitoringStoppedEventData) => void
    ) => Promise<() => void>;
    onMonitorStatusChanged: (
        callback: (update: MonitorStatusChangedEventData) => void
    ) => Promise<() => void>;
    onMonitorUp: (
        callback: (data: MonitorUpEventData) => void
    ) => Promise<() => void>;
    onSiteAdded: (
        callback: (data: SiteAddedEventData) => void
    ) => Promise<() => void>;
    onSiteRemoved: (
        callback: (data: SiteRemovedEventData) => void
    ) => Promise<() => void>;
    onSiteUpdated: (
        callback: (data: SiteUpdatedEventData) => void
    ) => Promise<() => void>;
    onTestEvent: (
        callback: (data: TestEventData) => void
    ) => Promise<() => void>;
    onUpdateStatus: (
        callback: (data: UpdateStatusEventData) => void
    ) => Promise<() => void>;
}

/**
 * Service for managing event operations through Electron IPC.
 *
 * @remarks
 * Provides a comprehensive interface for event listener management including
 * registration, cleanup tracking, and event handling with automatic service
 * initialization and memory leak prevention.
 *
 * @public
 */
export const EventsService: EventsServiceContract = {
    /**
     * Ensures the electron API is available before making backend calls.
     *
     * @remarks
     * This method should be called before any backend operation.
     *
     * @returns A promise that resolves when the electron API is ready.
     *
     * @throws If the electron API is not available.
     */
    initialize: ensureInitialized,

    /**
     * Register a callback for cache invalidation events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onCacheInvalidated((data) => {
     *     logger.info("Cache invalidated", data);
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke on cache invalidation.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onCacheInvalidated: wrap("onCacheInvalidated", async (
        api,
        callback: (data: CacheInvalidatedEventData) => void
    ) =>
        subscribeWithValidation("onCacheInvalidated", () =>
            api.events.onCacheInvalidated(callback))),

    /**
     * Register a callback for database history limit updates.
     *
     * @param callback - Function invoked when the retention limit changes.
     *
     * @returns Cleanup function removing the registered listener.
     */
    onHistoryLimitUpdated: wrap("onHistoryLimitUpdated", async (
        api,
        callback: (data: HistoryLimitUpdatedEventPayload) => void
    ) =>
        subscribeWithValidation("onHistoryLimitUpdated", () =>
            api.events.onHistoryLimitUpdated(callback))),
    /**
     * Register a callback for monitor check completion events.
     *
     * @param callback - Function invoked with the completed check payload.
     *
     * @returns Cleanup function removing the registered listener.
     */
    onMonitorCheckCompleted: wrap("onMonitorCheckCompleted", async (
        api,
        callback: (data: MonitorCheckCompletedEventPayload) => void
    ) =>
        subscribeWithValidation("onMonitorCheckCompleted", () =>
            api.events.onMonitorCheckCompleted(callback))),
    /**
     * Register a callback for monitor down events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onMonitorDown((data) => {
     *     logger.warn("Monitor down", {
     *         monitorId: data.monitorId,
     *         site: data.siteIdentifier,
     *     });
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke when a monitor is down.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onMonitorDown: wrap("onMonitorDown", async (
        api,
        callback: (data: MonitorDownEventData) => void
    ) =>
        subscribeWithValidation("onMonitorDown", () =>
            api.events.onMonitorDown(callback))),

    /**
     * Register a callback for monitoring started events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onMonitoringStarted((data) => {
     *     logger.info("Monitoring started", {
     *         activeMonitors: data.monitorCount,
     *     });
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke when monitoring starts.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onMonitoringStarted: wrap("onMonitoringStarted", async (
        api,
        callback: (data: MonitoringStartedEventData) => void
    ) =>
        subscribeWithValidation("onMonitoringStarted", () =>
            api.events.onMonitoringStarted((data) => {
                if (!isMonitoringStartedEventData(data)) {
                    logger.error(
                        "[EventsService] Dropped monitoring-start payload: invalid monitoring control event",
                        undefined,
                        {
                            payload: data,
                        }
                    );
                    return;
                }

                callback(data);
            }))),

    /**
     * Register a callback for monitoring stopped events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onMonitoringStopped((data) => {
     *     logger.info("Monitoring stopped", {
     *         activeMonitors: data.activeMonitors,
     *     });
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke when monitoring stops.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onMonitoringStopped: wrap("onMonitoringStopped", async (
        api,
        callback: (data: MonitoringStoppedEventData) => void
    ) =>
        subscribeWithValidation("onMonitoringStopped", () =>
            api.events.onMonitoringStopped((data) => {
                if (!isMonitoringStoppedEventData(data)) {
                    logger.error(
                        "[EventsService] Dropped monitoring-stop payload: invalid monitoring control event",
                        undefined,
                        {
                            payload: data,
                        }
                    );
                    return;
                }

                callback(data);
            }))),

    /**
     * Register a callback for monitor status changes.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onMonitorStatusChanged((
     *     update
     * ) => {
     *     logger.info("Monitor status changed", update);
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke on status update.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onMonitorStatusChanged: wrap("onMonitorStatusChanged", async (
        api,
        callback: (update: MonitorStatusChangedEventData) => void
    ) =>
        subscribeWithValidation("onMonitorStatusChanged", () =>
            api.events.onMonitorStatusChanged(callback))),

    /**
     * Register a callback for monitor up events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onMonitorUp((data) => {
     *     logger.info("Monitor up", {
     *         monitorId: data.monitorId,
     *         site: data.siteIdentifier,
     *     });
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke when a monitor is up.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onMonitorUp: wrap("onMonitorUp", async (
        api,
        callback: (data: MonitorUpEventData) => void
    ) =>
        subscribeWithValidation("onMonitorUp", () =>
            api.events.onMonitorUp(callback))),

    /**
     * Register a callback for site added events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onSiteAdded(({ site }) => {
     *     logger.info("New site registered", site.identifier);
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function invoked whenever a sanitized site addition
     *   event reaches the renderer.
     *
     * @returns A cleanup function that removes the listener.
     */
    onSiteAdded: wrap("onSiteAdded", async (
        api,
        callback: (data: SiteAddedEventData) => void
    ) =>
        subscribeWithValidation("onSiteAdded", () =>
            api.events.onSiteAdded(callback))),

    /**
     * Register a callback for site removal events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onSiteRemoved((data) => {
     *     logger.warn("Site removed", data.siteIdentifier);
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function invoked with the removal payload whenever a
     *   site is deleted.
     *
     * @returns A cleanup function that removes the listener.
     */
    onSiteRemoved: wrap("onSiteRemoved", async (
        api,
        callback: (data: SiteRemovedEventData) => void
    ) =>
        subscribeWithValidation("onSiteRemoved", () =>
            api.events.onSiteRemoved(callback))),

    /**
     * Register a callback for site updated events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onSiteUpdated(({
     *     site,
     *     updatedFields,
     * }) => {
     *     logger.debug("Site updated", {
     *         id: site.identifier,
     *         updatedFields,
     *     });
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function invoked when a site mutation is broadcast to
     *   the renderer.
     *
     * @returns A cleanup function that removes the listener.
     */
    onSiteUpdated: wrap("onSiteUpdated", async (
        api,
        callback: (data: SiteUpdatedEventData) => void
    ) =>
        subscribeWithValidation("onSiteUpdated", () =>
            api.events.onSiteUpdated(callback))),

    /**
     * Register a callback for test events (development/debugging).
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onTestEvent((data) => {
     *     logger.debug("Test event", data);
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke on test event.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onTestEvent: wrap("onTestEvent", async (
        api,
        callback: (data: TestEventData) => void
    ) =>
        subscribeWithValidation("onTestEvent", () =>
            api.events.onTestEvent(callback))),

    /**
     * Register a callback for application update status events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onUpdateStatus((data) => {
     *     logger.info("Update status", data);
     * });
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke on update status event.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onUpdateStatus: wrap("onUpdateStatus", async (
        api,
        callback: (data: UpdateStatusEventData) => void
    ) =>
        subscribeWithValidation("onUpdateStatus", () =>
            api.events.onUpdateStatus(callback))),
};
