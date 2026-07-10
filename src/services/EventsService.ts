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
    MonitoringStartedEventData,
    MonitoringStoppedEventData,
    MonitorStatusChangedEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";
import { subscribeWithCleanupValidation } from "./utils/preloadSubscriptions";

type IpcServiceHelpers = ReturnType<typeof getIpcServiceHelpers>;

const { ensureInitialized, wrap } = ((): IpcServiceHelpers => {
    try {
        return getIpcServiceHelpers("EventsService", {
            bridgeContracts: [
                {
                    domain: "events",
                    methods: [
                        "onCacheInvalidated",
                        "onHistoryLimitUpdated",
                        "onMonitorCheckCompleted",
                        "onMonitoringStarted",
                        "onMonitoringStopped",
                        "onMonitorStatusChanged",
                        "onUpdateStatus",
                    ],
                },
            ],
        });
    } catch (error) {
        throw ensureError(error);
    }
})();

type MonitorCheckCompletedEventPayload =
    RendererEventPayloadMap["monitor:check-completed"];
type HistoryLimitUpdatedEventPayload =
    RendererEventPayloadMap["settings:history-limit-updated"];

// Event payload validation is enforced at the preload boundary
// (electron/preload/domains/eventsApi.ts). The renderer should treat the preload
// bridge as a trusted interface and focus on cleanup contract validation.

const subscribeWithValidation = async (
    eventName: string,
    register: () => unknown
): Promise<() => void> =>
    subscribeWithCleanupValidation({
        eventName,
        logger,
        register,
        serviceName: "EventsService",
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
    onMonitoringStarted: (
        callback: (data: MonitoringStartedEventData) => void
    ) => Promise<() => void>;
    onMonitoringStopped: (
        callback: (data: MonitoringStoppedEventData) => void
    ) => Promise<() => void>;
    onMonitorStatusChanged: (
        callback: (update: MonitorStatusChangedEventData) => void
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
    onCacheInvalidated: wrap(
        "onCacheInvalidated",
        async (api, callback: (data: CacheInvalidatedEventData) => void) =>
            subscribeWithValidation("onCacheInvalidated", () =>
                api.events.onCacheInvalidated(callback)
            )
    ),

    /**
     * Register a callback for database history limit updates.
     *
     * @param callback - Function invoked when the retention limit changes.
     *
     * @returns Cleanup function removing the registered listener.
     */
    onHistoryLimitUpdated: wrap(
        "onHistoryLimitUpdated",
        async (
            api,
            callback: (data: HistoryLimitUpdatedEventPayload) => void
        ) =>
            subscribeWithValidation("onHistoryLimitUpdated", () =>
                api.events.onHistoryLimitUpdated(callback)
            )
    ),
    /**
     * Register a callback for monitor check completion events.
     *
     * @param callback - Function invoked with the completed check payload.
     *
     * @returns Cleanup function removing the registered listener.
     */
    onMonitorCheckCompleted: wrap(
        "onMonitorCheckCompleted",
        async (
            api,
            callback: (data: MonitorCheckCompletedEventPayload) => void
        ) =>
            subscribeWithValidation("onMonitorCheckCompleted", () =>
                api.events.onMonitorCheckCompleted(callback)
            )
    ),
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
    onMonitoringStarted: wrap(
        "onMonitoringStarted",
        async (api, callback: (data: MonitoringStartedEventData) => void) =>
            subscribeWithValidation("onMonitoringStarted", () =>
                api.events.onMonitoringStarted(callback)
            )
    ),

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
    onMonitoringStopped: wrap(
        "onMonitoringStopped",
        async (api, callback: (data: MonitoringStoppedEventData) => void) =>
            subscribeWithValidation("onMonitoringStopped", () =>
                api.events.onMonitoringStopped(callback)
            )
    ),

    /**
     * Register a callback for monitor status changes.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onMonitorStatusChanged(
     *     (update) => {
     *         logger.info("Monitor status changed", update);
     *     }
     * );
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function to invoke on status update.
     *
     * @returns A function to remove the listener.
     *
     * @throws If the electron API is unavailable.
     */
    onMonitorStatusChanged: wrap(
        "onMonitorStatusChanged",
        async (
            api,
            callback: (update: MonitorStatusChangedEventData) => void
        ) =>
            subscribeWithValidation("onMonitorStatusChanged", () =>
                api.events.onMonitorStatusChanged(callback)
            )
    ),

    /**
     * Register a callback for app update status events.
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
    onUpdateStatus: wrap(
        "onUpdateStatus",
        async (api, callback: (data: UpdateStatusEventData) => void) =>
            subscribeWithValidation("onUpdateStatus", () =>
                api.events.onUpdateStatus(callback)
            )
    ),
};
