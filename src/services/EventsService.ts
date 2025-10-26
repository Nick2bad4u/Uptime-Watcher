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
    MonitoringControlEventData,
    MonitorStatusChangedEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

import { ensureError } from "@shared/utils/errorHandling";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("EventsService");
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

const isMonitoringStartedEventData = (
    data: MonitoringControlEventData
): data is MonitoringStartedEventData =>
    typeof data.monitorCount === "number" && typeof data.siteCount === "number";

const isMonitoringStoppedEventData = (
    data: MonitoringControlEventData
): data is MonitoringStoppedEventData =>
    typeof data.activeMonitors === "number" && typeof data.reason === "string";

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
    onCacheInvalidated: wrap(
        "onCacheInvalidated",
        (api, callback: (data: CacheInvalidatedEventData) => void) =>
            Promise.resolve(api.events.onCacheInvalidated(callback))
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
        (api, callback: (data: HistoryLimitUpdatedEventPayload) => void) =>
            Promise.resolve(api.events.onHistoryLimitUpdated(callback))
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
        (api, callback: (data: MonitorCheckCompletedEventPayload) => void) =>
            Promise.resolve(api.events.onMonitorCheckCompleted(callback))
    ),
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
    onMonitorDown: wrap(
        "onMonitorDown",
        (api, callback: (data: MonitorDownEventData) => void) =>
            Promise.resolve(api.events.onMonitorDown(callback))
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
        (api, callback: (data: MonitoringStartedEventData) => void) =>
            Promise.resolve(
                api.events.onMonitoringStarted(
                    (data: MonitoringControlEventData) => {
                        if (!isMonitoringStartedEventData(data)) {
                            return;
                        }

                        callback(data);
                    }
                )
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
     *         pausedMonitors: data.monitorCount,
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
        (api, callback: (data: MonitoringStoppedEventData) => void) =>
            Promise.resolve(
                api.events.onMonitoringStopped(
                    (data: MonitoringControlEventData) => {
                        if (!isMonitoringStoppedEventData(data)) {
                            return;
                        }

                        callback(data);
                    }
                )
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
        (api, callback: (update: MonitorStatusChangedEventData) => void) =>
            Promise.resolve(api.events.onMonitorStatusChanged(callback))
    ),

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
    onMonitorUp: wrap(
        "onMonitorUp",
        (api, callback: (data: MonitorUpEventData) => void) =>
            Promise.resolve(api.events.onMonitorUp(callback))
    ),

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
    onSiteAdded: wrap(
        "onSiteAdded",
        (api, callback: (data: SiteAddedEventData) => void) =>
            Promise.resolve(api.events.onSiteAdded(callback))
    ),

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
    onSiteRemoved: wrap(
        "onSiteRemoved",
        (api, callback: (data: SiteRemovedEventData) => void) =>
            Promise.resolve(api.events.onSiteRemoved(callback))
    ),

    /**
     * Register a callback for site updated events.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const cleanup = await EventsService.onSiteUpdated(
     *     ({ site, updatedFields }) => {
     *         logger.debug("Site updated", {
     *             id: site.identifier,
     *             updatedFields,
     *         });
     *     }
     * );
     * // Later: cleanup();
     * ```
     *
     * @param callback - Function invoked when a site mutation is broadcast to
     *   the renderer.
     *
     * @returns A cleanup function that removes the listener.
     */
    onSiteUpdated: wrap(
        "onSiteUpdated",
        (api, callback: (data: SiteUpdatedEventData) => void) =>
            Promise.resolve(api.events.onSiteUpdated(callback))
    ),

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
    onTestEvent: wrap(
        "onTestEvent",
        (api, callback: (data: TestEventData) => void) =>
            Promise.resolve(api.events.onTestEvent(callback))
    ),

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
    onUpdateStatus: wrap(
        "onUpdateStatus",
        (api, callback: (data: UpdateStatusEventData) => void) =>
            Promise.resolve(api.events.onUpdateStatus(callback))
    ),
};
