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

import { waitForElectronAPI } from "../stores/utils";
import { logger } from "./logger";

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
export const EventsService = {
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
    async initialize(): Promise<void> {
        try {
            await waitForElectronAPI();
        } catch (error) {
            logger.error(
                "Failed to initialize EventsService:",
                ensureError(error)
            );
            throw error;
        }
    },

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
    async onCacheInvalidated(
        callback: (data: CacheInvalidatedEventData) => void
    ): Promise<() => void> {
        await this.initialize();
        return window.electronAPI.events.onCacheInvalidated(callback);
    },

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
    async onMonitorDown(
        callback: (data: MonitorDownEventData) => void
    ): Promise<() => void> {
        await this.initialize();
        return window.electronAPI.events.onMonitorDown(callback);
    },

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
    async onMonitoringStarted(
        callback: (data: MonitoringControlEventData) => void
    ): Promise<() => void> {
        await this.initialize();
        return window.electronAPI.events.onMonitoringStarted(callback);
    },

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
    async onMonitoringStopped(
        callback: (data: MonitoringControlEventData) => void
    ): Promise<() => void> {
        await this.initialize();
        return window.electronAPI.events.onMonitoringStopped(callback);
    },

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
    async onMonitorStatusChanged(
        callback: (update: StatusUpdate) => void
    ): Promise<() => void> {
        await this.initialize();
        return window.electronAPI.events.onMonitorStatusChanged(callback);
    },

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
    async onMonitorUp(
        callback: (data: MonitorUpEventData) => void
    ): Promise<() => void> {
        await this.initialize();
        return window.electronAPI.events.onMonitorUp(callback);
    },

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
    async onTestEvent(
        callback: (data: TestEventData) => void
    ): Promise<() => void> {
        await this.initialize();
        return window.electronAPI.events.onTestEvent(callback);
    },

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
    async onUpdateStatus(
        callback: (data: UpdateStatusEventData) => void
    ): Promise<() => void> {
        await this.initialize();
        return window.electronAPI.events.onUpdateStatus(callback);
    },
};
