/**
 * Preload script that exposes safe IPC communication to the renderer process.
 *
 * @remarks
 * Creates a secure bridge between main and renderer processes using
 * contextBridge. Organized by functional domains: sites, monitoring, data,
 * settings, events, system.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";
import type {
    CacheInvalidatedEventData,
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";
import type { IpcRendererEvent } from "electron";

import { getErrorMessage } from "@shared/utils/errorUtils";
import { contextBridge, ipcRenderer } from "electron";

/**
 * Runtime validation helpers for IPC responses
 */

/**
 * Standardized IPC response structure interface.
 */
interface IpcResponse<T = unknown> {
    data?: T;
    error?: string;
    metadata?: Record<string, unknown>;
    success: boolean;
}

/**
 * Validates and extracts boolean data from IPC responses.
 *
 * @param response - IPC response from main process
 *
 * @returns Boolean value from response data
 *
 * @throws Error if response is invalid or operation failed
 */
function extractBooleanIpcData(response: unknown): boolean {
    if (
        typeof response === "object" &&
        response !== null &&
        "success" in response &&
        "data" in response
    ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type is validated through runtime checks above
        const ipcResponse = response as IpcResponse<boolean>;

        if (!ipcResponse.success) {
            throw new Error(ipcResponse.error ?? "IPC operation failed");
        }

        if (typeof ipcResponse.data === "boolean") {
            return ipcResponse.data;
        }
    }

    throw new Error("Invalid IPC response format for boolean operation");
}

function validateBackupResponse(response: unknown): {
    buffer: ArrayBuffer;
    fileName: string;
} {
    // Handle standardized IPC response format
    if (
        typeof response === "object" &&
        response !== null &&
        "success" in response &&
        response.success === true &&
        "data" in response &&
        typeof response.data === "object" &&
        response.data !== null &&
        "buffer" in response.data &&
        "fileName" in response.data &&
        response.data.buffer instanceof ArrayBuffer &&
        typeof response.data.fileName === "string"
    ) {
        return {
            buffer: response.data.buffer,
            fileName: response.data.fileName,
        };
    }
    throw new Error("Invalid backup response format");
}

/**
 * Site management API methods for CRUD operations.
 */
const siteAPI = {
    /**
     * Add a new site with its monitors to the application.
     *
     * @param site - Complete site object with monitors
     *
     * @returns Promise resolving to the created site with assigned IDs
     */
    addSite: (site: Site): Promise<Site> =>
        ipcRenderer.invoke("add-site", site),

    /**
     * Trigger an immediate health check for a specific monitor.
     *
     * @param identifier - Unique site identifier
     * @param monitorId - Unique monitor identifier
     *
     * @returns Promise resolving when check is complete
     */
    checkSiteNow: (identifier: string, monitorId: string): Promise<void> =>
        ipcRenderer.invoke("check-site-now", identifier, monitorId),

    /**
     * Remove all sites from the database (primarily for testing).
     *
     * @remarks
     * This operation is destructive and irreversible. It will delete all sites
     * and their associated monitors from the database. Primarily intended for
     * testing purposes to ensure clean test state.
     *
     * @returns Promise resolving to the number of sites deleted
     */
    deleteAllSites: (): Promise<number> =>
        ipcRenderer.invoke("delete-all-sites"),

    /**
     * Retrieve all configured sites from the database.
     *
     * @returns Promise resolving to array of all sites with their monitors
     */
    getSites: (): Promise<Site[]> => ipcRenderer.invoke("get-sites"),

    /**
     * Remove a specific monitor from a site.
     *
     * @param siteIdentifier - Unique site identifier
     * @param monitorId - Unique monitor identifier to remove
     *
     * @returns Promise resolving when monitor is removed
     */
    removeMonitor: (siteIdentifier: string, monitorId: string): Promise<void> =>
        ipcRenderer.invoke("remove-monitor", siteIdentifier, monitorId),

    /**
     * Remove a site and all its associated data (monitors, history, etc.).
     *
     * @param identifier - Unique site identifier
     *
     * @returns Promise resolving to boolean indicating operation success
     */
    removeSite: async (identifier: string): Promise<boolean> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- IPC response type validated at runtime
            const response = await ipcRenderer.invoke(
                "remove-site",
                identifier
            );
            return extractBooleanIpcData(response);
        } catch (error) {
            throw new Error(
                `Failed to remove site: ${getErrorMessage(error)}`,
                { cause: error }
            );
        }
    },

    /**
     * Update site properties (name, monitoring status, etc.).
     *
     * @param identifier - Unique site identifier
     * @param updates - Partial site object with properties to update
     *
     * @returns Promise resolving when update is complete
     */
    updateSite: (identifier: string, updates: Partial<Site>): Promise<void> =>
        ipcRenderer.invoke("update-site", identifier, updates),
};

/**
 * Monitoring control API methods for starting and stopping health checks.
 *
 * @remarks
 * Controls the monitoring lifecycle for sites and individual monitors. All
 * monitoring operations are asynchronous and affect the background monitoring
 * scheduler.
 */
const monitoringAPI = {
    /**
     * Start monitoring for all configured sites.
     *
     * @returns Promise resolving when all monitors are started
     */
    startMonitoring: (): Promise<void> =>
        ipcRenderer.invoke("start-monitoring"),

    /**
     * Start monitoring for a specific site or individual monitor.
     *
     * @param identifier - Unique site identifier
     * @param monitorId - Optional specific monitor ID (if omitted, starts all
     *   monitors for the site)
     *
     * @returns Promise resolving to boolean indicating operation success
     */
    startMonitoringForSite: async (
        identifier: string,
        monitorId?: string
    ): Promise<boolean> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- IPC response type validated at runtime
            const response = await ipcRenderer.invoke(
                "start-monitoring-for-site",
                identifier,
                monitorId
            );
            return extractBooleanIpcData(response);
        } catch (error) {
            throw new Error(
                `Failed to start monitoring for site: ${getErrorMessage(error)}`,
                { cause: error }
            );
        }
    },

    /**
     * Stop monitoring for all sites.
     *
     * @returns Promise resolving when all monitors are stopped
     */
    stopMonitoring: (): Promise<void> => ipcRenderer.invoke("stop-monitoring"),

    /**
     * Stop monitoring for a specific site or individual monitor.
     *
     * @param identifier - Unique site identifier
     * @param monitorId - Optional specific monitor ID (if omitted, stops all
     *   monitors for the site)
     *
     * @returns Promise resolving to boolean indicating operation success
     */
    stopMonitoringForSite: async (
        identifier: string,
        monitorId?: string
    ): Promise<boolean> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- IPC response type validated at runtime
            const response = await ipcRenderer.invoke(
                "stop-monitoring-for-site",
                identifier,
                monitorId
            );
            return extractBooleanIpcData(response);
        } catch (error) {
            throw new Error(
                `Failed to stop monitoring for site: ${getErrorMessage(error)}`,
                { cause: error }
            );
        }
    },
};

/**
 * Data management API methods for import, export, and backup operations.
 *
 * @remarks
 * Handles application data persistence operations including JSON import/export
 * for configuration backup and SQLite database backup for complete data
 * recovery.
 */
const dataAPI = {
    /**
     * Download a complete SQLite database backup.
     *
     * @example
     *
     * ```typescript
     * const { buffer, fileName } =
     *     await window.electronAPI.data.downloadSQLiteBackup();
     * const blob = new Blob([buffer], {
     *     type: "application/octet-stream",
     * });
     * // Save blob as file with fileName
     * ```
     *
     * @returns Promise resolving to object containing backup data and suggested
     *   filename
     */
    downloadSQLiteBackup: async (): Promise<{
        buffer: ArrayBuffer;
        fileName: string;
    }> => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- IPC response type is validated at runtime
            const response = await ipcRenderer.invoke("download-sqlite-backup");
            return validateBackupResponse(response);
        } catch (error) {
            throw new Error(
                `Failed to download SQLite backup: ${getErrorMessage(error)}`,
                { cause: error }
            );
        }
    },
    /**
     * Export all application data as JSON string.
     *
     * @returns Promise resolving to JSON string containing all sites, monitors,
     *   and settings
     */
    exportData: (): Promise<string> => ipcRenderer.invoke("export-data"),

    /**
     * Import application data from JSON string.
     *
     * @param data - JSON string containing application data to import
     *
     * @returns Promise resolving to true if import was successful, false
     *   otherwise
     */
    importData: (data: string): Promise<boolean> =>
        ipcRenderer.invoke("import-data", data),
};

/**
 * Settings and configuration API methods.
 *
 * @remarks
 * Manages application-wide configuration settings that affect behavior such as
 * history retention, notification preferences, and other user preferences.
 */
const settingsAPI = {
    /**
     * Get the current history retention limit.
     *
     * @returns Promise resolving to the number of history records kept per
     *   monitor
     */
    getHistoryLimit: (): Promise<number> =>
        ipcRenderer.invoke("get-history-limit"),

    /**
     * Reset all application settings to their default values.
     *
     * @remarks
     * This operation will reset all application settings including:
     *
     * - History retention limit to default value
     * - Any other persisted settings to their defaults The operation is performed
     *   atomically within a database transaction.
     *
     * @returns Promise resolving when all settings have been reset to defaults
     */
    resetSettings: (): Promise<void> => ipcRenderer.invoke("reset-settings"),

    /**
     * Update the history retention limit and prune existing history.
     *
     * @remarks
     * This operation will immediately prune history records that exceed the new
     * limit across all monitors to free up storage space.
     *
     * @param limit - The new maximum number of history records to keep per
     *   monitor
     *
     * @returns Promise resolving when the limit is updated and old records are
     *   pruned
     */
    updateHistoryLimit: (limit: number): Promise<void> =>
        ipcRenderer.invoke("update-history-limit", limit),
};

/**
 * Event handling API methods for real-time communication.
 *
 * @remarks
 * Provides methods to listen for events from the main process, enabling
 * real-time UI updates when monitor statuses change or other significant events
 * occur in the background.
 */
const eventsAPI = {
    /**
     * Register a callback for cache invalidation events.
     *
     * @remarks
     * Called when backend caches are invalidated, allowing frontend to clear
     * its caches. Useful for keeping frontend and backend caches synchronized.
     *
     * **IMPORTANT:** Call the returned cleanup function to prevent memory
     * leaks, especially when components unmount or are destroyed.
     *
     * @example
     *
     * ```typescript
     * const cleanup = window.electronAPI.events.onCacheInvalidated(
     *     (data) => {
     *         console.log("Cache invalidated:", data);
     *     }
     * );
     *
     * // Later, when component unmounts:
     * cleanup();
     * ```
     *
     * @param callback - Function to call when cache is invalidated
     *
     * @returns Cleanup function to remove the listener
     */
    onCacheInvalidated: (
        callback: (data: CacheInvalidatedEventData) => void
    ): (() => void) => {
        const handler = (
            _: IpcRendererEvent,
            data: CacheInvalidatedEventData
        ): void => {
            callback(data);
        };
        ipcRenderer.on("cache:invalidated", handler);
        return (): void => {
            ipcRenderer.removeListener("cache:invalidated", handler);
        };
    },

    /**
     * Register a callback for monitor down events.
     *
     * @remarks
     * Called when a monitor detects a failure.
     *
     * @param callback - Function to call when a monitor goes down
     *
     * @returns Cleanup function to remove the listener
     */
    onMonitorDown: (
        callback: (data: MonitorDownEventData) => void
    ): (() => void) => {
        const handler = (
            _: IpcRendererEvent,
            data: MonitorDownEventData
        ): void => {
            callback(data);
        };
        ipcRenderer.on("monitor:down", handler);
        return (): void => {
            ipcRenderer.removeListener("monitor:down", handler);
        };
    },

    /**
     * Register a callback for monitoring started events.
     *
     * @remarks
     * Called when a monitor begins actively monitoring a site.
     *
     * @param callback - Function to call when monitoring starts for a
     *   site/monitor
     *
     * @returns Cleanup function to remove the listener
     */
    onMonitoringStarted: (
        callback: (data: MonitoringControlEventData) => void
    ) => {
        const handler = (
            _: IpcRendererEvent,
            data: MonitoringControlEventData
        ): void => {
            callback(data);
        };
        ipcRenderer.on("monitoring:started", handler);
        return (): void => {
            ipcRenderer.removeListener("monitoring:started", handler);
        };
    },

    /**
     * Register a callback for monitoring stopped events.
     *
     * @remarks
     * Called when a monitor stops actively monitoring a site.
     *
     * @param callback - Function to call when monitoring stops for a
     *   site/monitor
     *
     * @returns Cleanup function to remove the listener
     */
    onMonitoringStopped: (
        callback: (data: MonitoringControlEventData) => void
    ) => {
        const handler = (
            _: IpcRendererEvent,
            data: MonitoringControlEventData
        ): void => {
            callback(data);
        };
        ipcRenderer.on("monitoring:stopped", handler);
        return (): void => {
            ipcRenderer.removeListener("monitoring:stopped", handler);
        };
    },

    /**
     * Register a callback for monitor status update events.
     *
     * @remarks
     * This is the primary way to receive real-time updates about monitor status
     * changes for UI updates and notifications.
     *
     * @param callback - Function to call when a monitor status changes
     *
     * @returns Cleanup function to remove the listener
     */
    onMonitorStatusChanged: (
        callback: (data: unknown) => void
    ): (() => void) => {
        const handler = (_: IpcRendererEvent, data: unknown): void => {
            callback(data);
        };
        ipcRenderer.on("monitor:status-changed", handler);
        return (): void => {
            ipcRenderer.removeListener("monitor:status-changed", handler);
        };
    },

    /**
     * Register a callback for monitor up events.
     *
     * @remarks
     * Called when a monitor recovers from a down state.
     *
     * @param callback - Function to call when a monitor comes back up
     *
     * @returns Cleanup function to remove the listener
     */
    onMonitorUp: (
        callback: (data: MonitorUpEventData) => void
    ): (() => void) => {
        const handler = (
            _: IpcRendererEvent,
            data: MonitorUpEventData
        ): void => {
            callback(data);
        };
        ipcRenderer.on("monitor:up", handler);
        return (): void => {
            ipcRenderer.removeListener("monitor:up", handler);
        };
    },

    /**
     * Register a callback for test events (development/debugging).
     *
     * @remarks
     * Used primarily for development and debugging purposes.
     *
     * @param callback - Function to call when test events are received
     *
     * @returns Cleanup function to remove the listener
     */
    onTestEvent: (callback: (data: TestEventData) => void): (() => void) => {
        const handler = (_: IpcRendererEvent, data: TestEventData): void => {
            callback(data);
        };
        ipcRenderer.on("test-event", handler);
        return (): void => {
            ipcRenderer.removeListener("test-event", handler);
        };
    },

    /**
     * Register a callback for application update status events.
     *
     * @remarks
     * Receives events about application updates (checking, downloading, ready
     * to install).
     *
     * @param callback - Function to call when update status changes
     *
     * @returns Cleanup function to remove the listener
     */
    onUpdateStatus: (
        callback: (data: UpdateStatusEventData) => void
    ): (() => void) => {
        const handler = (
            _: IpcRendererEvent,
            data: UpdateStatusEventData
        ): void => {
            callback(data);
        };
        ipcRenderer.on("update-status", handler);
        return (): void => {
            ipcRenderer.removeListener("update-status", handler);
        };
    },

    /**
     * Remove all event listeners for a specific channel.
     *
     * @remarks
     * Use this for cleanup when components unmount to prevent memory leaks.
     *
     * @param channel - The event channel to clear listeners from
     */
    removeAllListeners: (channel: string): void => {
        ipcRenderer.removeAllListeners(channel);
    },
};

/**
 * System and application-level API methods.
 *
 * @remarks
 * Handles system-level operations like application updates, external URL
 * opening, and other OS integration features.
 */
const systemAPI = {
    /**
     * Open a URL in the user's default external browser.
     *
     * @remarks
     * Provides a secure way to open external links without navigating away from
     * the application.
     *
     * @param url - The URL to open in the external browser
     */
    openExternal: (url: string): Promise<void> =>
        ipcRenderer.invoke("open-external", url),

    /**
     * Quit the application and install a pending update.
     *
     * @remarks
     * Only effective when an update has been downloaded and is ready to
     * install. This will close the application and start the update installer.
     *
     * Note: Uses ipcRenderer.send instead of invoke because no response is
     * needed from the main process.
     */
    quitAndInstall: (): void => {
        ipcRenderer.send("quit-and-install");
    },
};

/**
 * State synchronization API for real-time frontend updates.
 *
 * @remarks
 * Provides methods for registering event listeners for state changes and
 * managing synchronization between backend and frontend stores.
 */
const stateSyncAPI = {
    /**
     * Get current synchronization status.
     *
     * @returns Promise with sync status information
     */
    getSyncStatus: (): Promise<{
        lastSync: null | number;
        siteCount: number;
        success: boolean;
        synchronized: boolean;
    }> => ipcRenderer.invoke("get-sync-status"),

    /**
     * Register listener for state synchronization events.
     *
     * @param callback - Function to call when state changes occur
     *
     * @returns Cleanup function to remove the listener
     */
    onStateSyncEvent: (
        callback: (event: {
            action: "bulk-sync" | "delete" | "update";
            siteIdentifier?: string;
            sites?: Site[];
            source?: "cache" | "database" | "frontend";
            timestamp?: number;
        }) => void
    ) => {
        const handler = (
            _event: IpcRendererEvent,
            eventData: Parameters<typeof callback>[0]
        ): void => {
            callback(eventData);
        };
        ipcRenderer.on("state-sync-event", handler);
        return (): void => {
            ipcRenderer.removeListener("state-sync-event", handler);
        };
    },

    /**
     * Manually request a full state synchronization.
     *
     * @returns Promise resolving when sync is complete
     */
    requestFullSync: (): Promise<{ siteCount: number; success: boolean }> =>
        ipcRenderer.invoke("request-full-sync"),
};

/**
 * Monitor types API methods for accessing monitor type registry.
 *
 * @remarks
 * Provides access to available monitor types and their configurations for
 * dynamic form generation and validation.
 */
const monitorTypesAPI = {
    /**
     * Format monitor detail using backend registry.
     *
     * @param type - Monitor type
     * @param details - Detail value to format
     *
     * @returns Promise resolving to formatted detail string
     */
    formatMonitorDetail: (type: string, details: string): Promise<string> =>
        ipcRenderer.invoke("format-monitor-detail", type, details),

    /**
     * Format monitor title suffix using backend registry.
     *
     * @param type - Monitor type
     * @param monitor - Monitor data
     *
     * @returns Promise resolving to formatted title suffix
     */
    formatMonitorTitleSuffix: (
        type: string,
        monitor: Monitor
    ): Promise<string> =>
        ipcRenderer.invoke("format-monitor-title-suffix", type, monitor),

    /**
     * Get all available monitor types from backend registry.
     *
     * @returns Promise resolving to array of monitor type configurations
     */
    getMonitorTypes: (): Promise<
        Array<{
            description: string;
            displayName: string;
            fields: unknown[];
            type: string;
            uiConfig: unknown;
            version: string;
        }>
    > => ipcRenderer.invoke("get-monitor-types"),

    /**
     * Validate monitor data using backend registry.
     *
     * @param type - Monitor type to validate
     * @param data - Monitor data to validate
     *
     * @returns Promise resolving to validation result wrapped in IPC response
     */
    validateMonitorData: (
        type: string,
        data: unknown
    ): Promise<{
        data?: {
            data?: unknown;
            errors: readonly string[];
            metadata?: unknown;
            success: boolean;
            warnings?: readonly string[];
        };
        error?: string;
        metadata?: unknown;
        success: boolean;
        warnings?: readonly string[];
    }> => ipcRenderer.invoke("validate-monitor-data", type, data),
};

/**
 * Exposes a structured API object (`window.electronAPI`) to the renderer
 * process, organized by functional domains: - `data`: Import/export and backup
 * operations
 *
 * - `events`: Real-time event listeners for backend changes
 * - `monitoring`: Control of monitoring lifecycle
 * - `monitorTypes`: Access to monitor type registry and validation
 * - `settings`: Application-wide configuration management
 * - `sites`: CRUD operations for sites and monitors
 * - `stateSync`: State synchronization and event listeners
 * - `system`: System-level actions (updates, external links)
 *
 * @remarks
 * Each domain provides a set of methods for a specific area of functionality,
 * improving maintainability and type safety. All APIs are exposed as immutable,
 * read-only properties to reinforce the security model.
 */
contextBridge.exposeInMainWorld("electronAPI", {
    // Domain-specific APIs organized for maintainability
    data: dataAPI,
    events: eventsAPI,
    monitoring: monitoringAPI,
    monitorTypes: monitorTypesAPI,
    settings: settingsAPI,
    sites: siteAPI,
    stateSync: stateSyncAPI,
    system: systemAPI,
});
