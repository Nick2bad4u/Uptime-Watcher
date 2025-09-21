/**
 * Type definitions for the Uptime Watcher frontend.
 *
 * @remarks
 * All core domain types are imported from shared/types.ts for consistency. This
 * module provides a single import location for all frontend type definitions.
 *
 * @packageDocumentation
 */

// Import types for global declarations
import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type {
    CacheInvalidatedEventData,
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";
import type { UnknownRecord } from "type-fest";

/**
 * Re-export monitor form-specific types for UI components.
 *
 * @remarks
 * These types are used for form validation and UI state management in monitor
 * creation and editing workflows.
 *
 * @public
 */

/**
 * Re-export monitor form-specific types for UI components.
 *
 * @remarks
 * These types are used for form validation and UI state management in monitor
 * creation and editing workflows.
 *
 * @public
 */
/**
 * Shared domain type imports.
 *
 * @remarks
 * Import shared domain types directly from "`@shared/types`".
 */

// Import monitor form types directly from "./types/monitor-forms" if needed

// Import monitor form functions directly from "./types/monitor-forms" if needed

/**
 * Electron API interface exposed to the renderer process.
 *
 * @remarks
 * Provides secure communication between the React frontend and Electron main
 * process through the contextBridge. All backend operations are accessed
 * through this API, available as `window.electronAPI` in the renderer process.
 *
 * The API is organized by functional domains:
 *
 * - `data`: Import/export and backup operations
 * - `events`: Event listening and management
 * - `monitoring`: Monitor control operations
 * - `monitorTypes`: Monitor type registry and configuration
 * - `settings`: Application configuration
 * - `sites`: Site and monitor CRUD operations
 * - `stateSync`: State synchronization operations
 * - `system`: System-level operations
 *
 * @public
 */
declare global {
    interface Window {
        electronAPI: {
            /**
             * @remarks
             * Data management operations for import, export, and backup.
             */
            data: {
                /**
                 * @remarks
                 * Download SQLite database backup as binary data.
                 *
                 * @returns A promise resolving to an object containing the
                 *   backup buffer and file name.
                 */
                downloadSQLiteBackup: () => Promise<{
                    buffer: ArrayBuffer;
                    fileName: string;
                }>;
                /**
                 * @remarks
                 * Export all application data as a JSON string.
                 *
                 * @returns A promise resolving to the exported data as a
                 *   string.
                 */
                exportData: () => Promise<string>;
                /**
                 * @remarks
                 * Import application data from a JSON string.
                 *
                 * @param data - The JSON string to import.
                 *
                 * @returns A promise resolving to true if import succeeded,
                 *   false otherwise.
                 */
                importData: (data: string) => Promise<boolean>;
            };

            /**
             * @remarks
             * Event management for real-time updates and communication.
             */
            events: {
                /**
                 * @remarks
                 * Register callback for cache invalidation events.
                 *
                 * @param callback - Function to invoke on cache invalidation.
                 *
                 * @returns A function to remove the listener.
                 */
                onCacheInvalidated: (
                    callback: (data: CacheInvalidatedEventData) => void
                ) => () => void;
                /**
                 * @remarks
                 * Register callback for monitor down events.
                 *
                 * @param callback - Function to invoke when a monitor is down.
                 *
                 * @returns A function to remove the listener.
                 */
                onMonitorDown: (
                    callback: (data: MonitorDownEventData) => void
                ) => () => void;
                /**
                 * @remarks
                 * Register callback for monitoring started events.
                 *
                 * @param callback - Function to invoke when monitoring starts.
                 *
                 * @returns A function to remove the listener.
                 */
                onMonitoringStarted: (
                    callback: (data: MonitoringControlEventData) => void
                ) => () => void;
                /**
                 * @remarks
                 * Register callback for monitoring stopped events.
                 *
                 * @param callback - Function to invoke when monitoring stops.
                 *
                 * @returns A function to remove the listener.
                 */
                onMonitoringStopped: (
                    callback: (data: MonitoringControlEventData) => void
                ) => () => void;
                /**
                 * @remarks
                 * Register callback for monitor status changes.
                 *
                 * @param callback - Function to invoke on status update.
                 *
                 * @returns A function to remove the listener.
                 */
                onMonitorStatusChanged: (
                    callback: (update: StatusUpdate) => void
                ) => () => void;
                /**
                 * @remarks
                 * Register callback for monitor up events.
                 *
                 * @param callback - Function to invoke when a monitor is up.
                 *
                 * @returns A function to remove the listener.
                 */
                onMonitorUp: (
                    callback: (data: MonitorUpEventData) => void
                ) => () => void;
                /**
                 * @remarks
                 * Register callback for test events (development/debugging).
                 *
                 * @param callback - Function to invoke on test event.
                 *
                 * @returns A function to remove the listener.
                 */
                onTestEvent: (
                    callback: (data: TestEventData) => void
                ) => () => void;
                /**
                 * @remarks
                 * Register callback for application update status events.
                 *
                 * @param callback - Function to invoke on update status event.
                 *
                 * @returns A function to remove the listener.
                 */
                onUpdateStatus: (
                    callback: (data: UpdateStatusEventData) => void
                ) => () => void;
                /**
                 * @remarks
                 * Remove all listeners for a specific event.
                 *
                 * @param event - The event name.
                 */
                removeAllListeners: (event: string) => void;
            };

            /**
             * @remarks
             * Monitoring control operations for starting and stopping checks.
             */
            monitoring: {
                /**
                 * @remarks
                 * Start monitoring for all configured sites.
                 *
                 * @returns A promise that resolves when monitoring has started.
                 */
                startMonitoring: () => Promise<void>;
                /**
                 * @remarks
                 * Start monitoring for a specific site or monitor.
                 *
                 * @param siteId - The site identifier.
                 * @param monitorId - Optional monitor identifier.
                 *
                 * @returns A promise resolving to boolean indicating success.
                 */
                startMonitoringForSite: (
                    siteId: string,
                    monitorId?: string
                ) => Promise<boolean>;
                /**
                 * @remarks
                 * Stop monitoring for all sites.
                 *
                 * @returns A promise that resolves when monitoring has stopped.
                 */
                stopMonitoring: () => Promise<void>;
                /**
                 * @remarks
                 * Stop monitoring for a specific site or monitor.
                 *
                 * @param siteId - The site identifier.
                 * @param monitorId - Optional monitor identifier.
                 *
                 * @returns A promise resolving to boolean indicating success.
                 */
                stopMonitoringForSite: (
                    siteId: string,
                    monitorId?: string
                ) => Promise<boolean>;
            };

            /**
             * @remarks
             * Monitor type registry and configuration operations.
             */
            monitorTypes: {
                /**
                 * @remarks
                 * Format monitor detail using backend registry.
                 *
                 * @param type - The monitor type.
                 * @param details - The monitor details as a string.
                 *
                 * @returns A promise resolving to an IPC response containing
                 *   the formatted detail string.
                 */
                formatMonitorDetail: (
                    type: string,
                    details: string
                ) => Promise<{
                    data?: string;
                    error?: string;
                    metadata?: UnknownRecord;
                    success: boolean;
                    warnings?: string[];
                }>;
                /**
                 * @remarks
                 * Format monitor title suffix using backend registry.
                 *
                 * @param type - The monitor type.
                 * @param monitor - The monitor data.
                 *
                 * @returns A promise resolving to an IPC response containing
                 *   the formatted title suffix.
                 */
                formatMonitorTitleSuffix: (
                    type: string,
                    monitor: Monitor
                ) => Promise<{
                    data?: string;
                    error?: string;
                    metadata?: UnknownRecord;
                    success: boolean;
                    warnings?: string[];
                }>;
                /**
                 * @remarks
                 * Get all available monitor type configurations.
                 *
                 * @returns A promise resolving to an IPC response containing
                 *   monitor type definitions.
                 */
                getMonitorTypes: () => Promise<{
                    data?: Array<{
                        description: string;
                        displayName: string;
                        fields: Array<{
                            helpText?: string;
                            label: string;
                            max?: number;
                            min?: number;
                            name: string;
                            placeholder?: string;
                            required: boolean;
                            type: string;
                        }>;
                        type: string;
                        version: string;
                    }>;
                    error?: string;
                    metadata?: UnknownRecord;
                    success: boolean;
                    warnings?: string[];
                }>;
                /**
                 * @remarks
                 * Validate monitor data using backend registry.
                 *
                 * @param type - The monitor type.
                 * @param data - The monitor data to validate.
                 *
                 * @returns A promise resolving to the validation result.
                 */
                validateMonitorData: (
                    type: string,
                    data: unknown
                ) => Promise<{
                    data?: unknown;
                    errors: readonly string[];
                    metadata?: UnknownRecord;
                    success: boolean;
                    warnings?: readonly string[];
                }>;
            };

            /**
             * @remarks
             * Application settings and configuration management.
             */
            settings: {
                /**
                 * @remarks
                 * Get current history retention limit.
                 *
                 * @returns A promise resolving to the history limit number.
                 */
                getHistoryLimit: () => Promise<number>;
                /**
                 * @remarks
                 * Reset all application settings to their default values.
                 *
                 * @returns A promise that resolves when all settings have been
                 *   reset.
                 */
                resetSettings: () => Promise<void>;
                /**
                 * @remarks
                 * Update history retention limit.
                 *
                 * @param limit - The new history limit.
                 *
                 * @returns A promise that resolves when the update is complete.
                 */
                updateHistoryLimit: (limit: number) => Promise<void>;
            };

            /**
             * @remarks
             * Site and monitor CRUD operations.
             */
            sites: {
                /**
                 * @remarks
                 * Add a new site with its monitors.
                 *
                 * @param site - The site to add.
                 *
                 * @returns A promise resolving to the added site.
                 */
                addSite: (site: Site) => Promise<Site>;
                /**
                 * @remarks
                 * Perform immediate manual check for a specific monitor.
                 *
                 * @param siteId - The site identifier.
                 * @param monitorId - The monitor identifier.
                 *
                 * @returns A promise that resolves when the check is complete.
                 */
                checkSiteNow: (
                    siteId: string,
                    monitorId: string
                ) => Promise<void>;
                /**
                 * @remarks
                 * Retrieve all configured sites with their monitors.
                 *
                 * @returns A promise resolving to an array of sites.
                 */
                getSites: () => Promise<Site[]>;
                /**
                 * @remarks
                 * Remove a specific monitor from a site.
                 *
                 * @param siteIdentifier - The site identifier.
                 * @param monitorId - The monitor identifier.
                 *
                 * @returns A promise that resolves when the monitor is removed.
                 */
                removeMonitor: (
                    siteIdentifier: string,
                    monitorId: string
                ) => Promise<void>;
                /**
                 * @remarks
                 * Remove a site and all its monitors.
                 *
                 * @param id - The site identifier.
                 *
                 * @returns A promise resolving to boolean indicating success.
                 */
                removeSite: (id: string) => Promise<boolean>;
                /**
                 * @remarks
                 * Update site configuration.
                 *
                 * @param id - The site identifier.
                 * @param updates - Partial site updates.
                 *
                 * @returns A promise that resolves when the update is complete.
                 */
                updateSite: (
                    id: string,
                    updates: Partial<Site>
                ) => Promise<void>;
            };

            /**
             * @remarks
             * State synchronization operations for real-time updates.
             */
            stateSync: {
                /**
                 * @remarks
                 * Get current synchronization status.
                 *
                 * @returns A promise resolving to the sync status.
                 */
                getSyncStatus: () => Promise<{
                    lastSync: null | number;
                    siteCount: number;
                    success: boolean;
                    synchronized: boolean;
                }>;
                /**
                 * @remarks
                 * Register listener for state synchronization events.
                 *
                 * @param callback - Function to invoke on sync event.
                 *
                 * @returns A function to remove the listener.
                 */
                onStateSyncEvent: (
                    callback: (event: {
                        action: "bulk-sync" | "delete" | "update";
                        siteIdentifier?: string;
                        sites?: Site[];
                        source?: "cache" | "database" | "frontend";
                        timestamp?: number;
                    }) => void
                ) => () => void;
                /**
                 * @remarks
                 * Manually request full state synchronization.
                 *
                 * @returns A promise resolving to the sync result.
                 */
                requestFullSync: () => Promise<{
                    siteCount: number;
                    success: boolean;
                }>;
            };

            /**
             * @remarks
             * System-level operations and utilities.
             */
            system: {
                /**
                 * @remarks
                 * Open a URL in the external browser.
                 *
                 * @param url - The URL to open.
                 */
                openExternal: (url: string) => void;
                /**
                 * @remarks
                 * Quit application and install pending update.
                 */
                quitAndInstall: () => void;
            };
        };
    }
}
