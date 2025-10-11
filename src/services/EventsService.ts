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

import type { StatusUpdate } from "@shared/types";
import type {
    CacheInvalidatedEventData,
    MonitorDownEventData,
    MonitoringControlEventData,
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

interface EventsServiceContract {
    initialize: () => Promise<void>;
    onCacheInvalidated: (
        callback: (data: CacheInvalidatedEventData) => void
    ) => Promise<() => void>;
    onMonitorDown: (
        callback: (data: MonitorDownEventData) => void
    ) => Promise<() => void>;
    onMonitoringStarted: (
        callback: (data: MonitoringControlEventData) => void
    ) => Promise<() => void>;
    onMonitoringStopped: (
        callback: (data: MonitoringControlEventData) => void
    ) => Promise<() => void>;
    onMonitorStatusChanged: (
        callback: (update: StatusUpdate) => void
    ) => Promise<() => void>;
    onMonitorUp: (
        callback: (data: MonitorUpEventData) => void
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
     * const cleanup = await EventsService.onCacheInvalidated((data) => {
     *     console.log("Cache invalidated:", data);
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
     * Register a callback for monitor down events.
     *
     * @example
     *
     * ```typescript
     * const cleanup = await EventsService.onMonitorDown((data) => {
     *     console.log("Monitor down:", data.siteId, data.monitorId);
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
     * const cleanup = await EventsService.onMonitoringStarted((data) => {
     *     console.log("Monitoring started for:", data.siteId);
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
        (api, callback: (data: MonitoringControlEventData) => void) =>
            Promise.resolve(api.events.onMonitoringStarted(callback))
    ),

    /**
     * Register a callback for monitoring stopped events.
     *
     * @example
     *
     * ```typescript
     * const cleanup = await EventsService.onMonitoringStopped((data) => {
     *     console.log("Monitoring stopped for:", data.siteId);
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
        (api, callback: (data: MonitoringControlEventData) => void) =>
            Promise.resolve(api.events.onMonitoringStopped(callback))
    ),

    /**
     * Register a callback for monitor status changes.
     *
     * @example
     *
     * ```typescript
     * const cleanup = await EventsService.onMonitorStatusChanged(
     *     (update) => {
     *         console.log("Status changed:", update.status);
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
        (api, callback: (update: StatusUpdate) => void) =>
            Promise.resolve(api.events.onMonitorStatusChanged(callback))
    ),

    /**
     * Register a callback for monitor up events.
     *
     * @example
     *
     * ```typescript
     * const cleanup = await EventsService.onMonitorUp((data) => {
     *     console.log("Monitor up:", data.siteId, data.monitorId);
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
     * Register a callback for test events (development/debugging).
     *
     * @example
     *
     * ```typescript
     * const cleanup = await EventsService.onTestEvent((data) => {
     *     console.log("Test event:", data);
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
     * const cleanup = await EventsService.onUpdateStatus((data) => {
     *     console.log("Update status:", data.status);
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
