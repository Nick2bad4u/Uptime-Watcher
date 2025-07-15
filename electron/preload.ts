/**
 * Preload script that exposes safe IPC communication to the renderer process.
 *
 * @remarks
 * Creates a secure bridge between main and renderer processes using contextBridge.
 * Organized by functional domains: sites, monitoring, data, settings, events, system.
 *
 * @packageDocumentation
 */

import { contextBridge, ipcRenderer } from "electron";

import { Site } from "./types";

/**
 * Site management API methods for CRUD operations.
 */
const siteAPI = {
    /**
     * Add a new site with its monitors to the application.
     *
     * @param site - Complete site object with monitors
     * @returns Promise resolving to the created site with assigned IDs
     */
    addSite: (site: Site) => ipcRenderer.invoke("add-site", site),

    /**
     * Trigger an immediate health check for a specific monitor.
     *
     * @param identifier - Unique site identifier
     * @param monitorId - Unique monitor identifier
     * @returns Promise resolving when check is complete
     */
    checkSiteNow: (identifier: string, monitorId: string) =>
        ipcRenderer.invoke("check-site-now", identifier, monitorId),

    /**
     * Retrieve all configured sites from the database.
     *
     * @returns Promise resolving to array of all sites with their monitors
     */
    getSites: () => ipcRenderer.invoke("get-sites"),

    /**
     * Remove a specific monitor from a site.
     *
     * @param siteIdentifier - Unique site identifier
     * @param monitorId - Unique monitor identifier to remove
     * @returns Promise resolving when monitor is removed
     */
    removeMonitor: (siteIdentifier: string, monitorId: string) =>
        ipcRenderer.invoke("remove-monitor", siteIdentifier, monitorId),

    /**
     * Remove a site and all its associated data (monitors, history, etc.).
     *
     * @param identifier - Unique site identifier
     * @returns Promise resolving when site is completely removed
     */
    removeSite: (identifier: string) => ipcRenderer.invoke("remove-site", identifier),

    /**
     * Update site properties (name, monitoring status, etc.).
     *
     * @param identifier - Unique site identifier
     * @param updates - Partial site object with properties to update
     * @returns Promise resolving when update is complete
     */
    updateSite: (identifier: string, updates: Partial<Site>) => ipcRenderer.invoke("update-site", identifier, updates),
};

/**
 * Monitoring control API methods for starting and stopping health checks.
 *
 * @remarks
 * Controls the monitoring lifecycle for sites and individual monitors.
 * All monitoring operations are asynchronous and affect the background
 * monitoring scheduler.
 */
const monitoringAPI = {
    /**
     * Start monitoring for all configured sites.
     *
     * @returns Promise resolving when all monitors are started
     */
    startMonitoring: () => ipcRenderer.invoke("start-monitoring"),

    /**
     * Start monitoring for a specific site or individual monitor.
     *
     * @param identifier - Unique site identifier
     * @param monitorId - Optional specific monitor ID (if omitted, starts all monitors for the site)
     * @returns Promise resolving when monitoring is started
     */
    startMonitoringForSite: (identifier: string, monitorId?: string) =>
        ipcRenderer.invoke("start-monitoring-for-site", identifier, monitorId),

    /**
     * Stop monitoring for all sites.
     *
     * @returns Promise resolving when all monitors are stopped
     */
    stopMonitoring: () => ipcRenderer.invoke("stop-monitoring"),

    /**
     * Stop monitoring for a specific site or individual monitor.
     *
     * @param identifier - Unique site identifier
     * @param monitorId - Optional specific monitor ID (if omitted, stops all monitors for the site)
     * @returns Promise resolving when monitoring is stopped
     */
    stopMonitoringForSite: (identifier: string, monitorId?: string) =>
        ipcRenderer.invoke("stop-monitoring-for-site", identifier, monitorId),
};

/**
 * Data management API methods for import, export, and backup operations.
 *
 * @remarks
 * Handles application data persistence operations including JSON import/export
 * for configuration backup and SQLite database backup for complete data recovery.
 */
const dataAPI = {
    /**
     * Download a complete SQLite database backup.
     *
     * @returns Promise resolving to object containing backup data and suggested filename
     *
     * @example
     * ```typescript
     * const { buffer, fileName } = await window.electronAPI.data.downloadSQLiteBackup();
     * const blob = new Blob([buffer], { type: 'application/octet-stream' });
     * // Save blob as file with fileName
     * ```
     */
    downloadSQLiteBackup: async (): Promise<{ buffer: ArrayBuffer; fileName: string }> => {
        return ipcRenderer.invoke("download-sqlite-backup") as Promise<{ buffer: ArrayBuffer; fileName: string }>;
    },

    /**
     * Export all application data as JSON string.
     *
     * @returns Promise resolving to JSON string containing all sites, monitors, and settings
     */
    exportData: () => ipcRenderer.invoke("export-data"),

    /**
     * Import application data from JSON string.
     *
     * @param data - JSON string containing application data to import
     * @returns Promise resolving to true if import was successful, false otherwise
     */
    importData: (data: string) => ipcRenderer.invoke("import-data", data),
};

/**
 * Settings and configuration API methods.
 *
 * @remarks
 * Manages application-wide configuration settings that affect behavior
 * such as history retention, notification preferences, and other user preferences.
 */
const settingsAPI = {
    /**
     * Get the current history retention limit.
     *
     * @returns Promise resolving to the number of history records kept per monitor
     */
    getHistoryLimit: () => ipcRenderer.invoke("get-history-limit"),

    /**
     * Update the history retention limit and prune existing history.
     *
     * @param limit - The new maximum number of history records to keep per monitor
     * @returns Promise resolving when the limit is updated and old records are pruned
     *
     * @remarks
     * This operation will immediately prune history records that exceed the new limit
     * across all monitors to free up storage space.
     */
    updateHistoryLimit: (limit: number) => ipcRenderer.invoke("update-history-limit", limit),
};

/**
 * Event handling API methods for real-time communication.
 *
 * @remarks
 * Provides methods to listen for events from the main process, enabling
 * real-time UI updates when monitor statuses change or other significant
 * events occur in the background.
 */
const eventsAPI = {
    /**
     * Register a callback for monitor status update events.
     *
     * @param callback - Function to call when a monitor status changes
     *
     * @remarks
     * This is the primary way to receive real-time updates about monitor
     * status changes for UI updates and notifications.
     */
    onStatusUpdate: (callback: (data: unknown) => void) => {
        ipcRenderer.on("status-update", (_, data) => {
            callback(data);
        });
    },

    /**
     * Register a callback for monitoring started events.
     *
     * @param callback - Function to call when monitoring starts for a site/monitor
     *
     * @remarks
     * Called when a monitor begins actively monitoring a site.
     */
    onMonitoringStarted: (callback: (data: { siteId: string; monitorId: string }) => void) => {
        ipcRenderer.on("monitoring-started", (_, data: { siteId: string; monitorId: string }) => {
            callback(data);
        });
    },

    /**
     * Register a callback for monitoring stopped events.
     *
     * @param callback - Function to call when monitoring stops for a site/monitor
     *
     * @remarks
     * Called when a monitor stops actively monitoring a site.
     */
    onMonitoringStopped: (callback: (data: { siteId: string; monitorId: string }) => void) => {
        ipcRenderer.on("monitoring-stopped", (_, data: { siteId: string; monitorId: string }) => {
            callback(data);
        });
    },

    /**
     * Register a callback for test events (development/debugging).
     *
     * @param callback - Function to call when test events are received
     *
     * @remarks
     * Used primarily for development and debugging purposes.
     */
    onTestEvent: (callback: (data: unknown) => void) => {
        ipcRenderer.on("test-event", (_, data) => {
            callback(data);
        });
    },

    /**
     * Register a callback for application update status events.
     *
     * @param callback - Function to call when update status changes
     *
     * @remarks
     * Receives events about application updates (checking, downloading, ready to install).
     */
    onUpdateStatus: (callback: (data: unknown) => void) => {
        ipcRenderer.on("update-status", (_, data) => callback(data));
    },

    /**
     * Remove all event listeners for a specific channel.
     *
     * @param channel - The event channel to clear listeners from
     *
     * @remarks
     * Use this for cleanup when components unmount to prevent memory leaks.
     */
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },
};

/**
 * System and application-level API methods.
 *
 * @remarks
 * Handles system-level operations like application updates, external
 * URL opening, and other OS integration features.
 */
const systemAPI = {
    /**
     * Quit the application and install a pending update.
     *
     * @remarks
     * Only effective when an update has been downloaded and is ready to install.
     * This will close the application and start the update installer.
     */
    quitAndInstall: () => ipcRenderer.send("quit-and-install"),

    /**
     * Open a URL in the user's default external browser.
     *
     * @param url - The URL to open in the external browser
     *
     * @remarks
     * Provides a secure way to open external links without navigating
     * away from the application.
     */
    openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
};

/**
 * State synchronization API for real-time frontend updates.
 *
 * @remarks
 * Provides methods for registering event listeners for state changes
 * and managing synchronization between backend and frontend stores.
 */
const stateSyncAPI = {
    /**
     * Register listener for state synchronization events.
     *
     * @param callback - Function to call when state changes occur
     * @returns Cleanup function to remove the listener
     */
    onStateSyncEvent: (
        callback: (event: {
            action: "update" | "delete" | "bulk-sync";
            siteIdentifier?: string;
            sites?: Site[];
        }) => void
    ) => {
        const handler = (_event: Electron.IpcRendererEvent, eventData: Parameters<typeof callback>[0]) => {
            callback(eventData);
        };
        ipcRenderer.on("state-sync-event", handler);
        return () => ipcRenderer.removeListener("state-sync-event", handler);
    },

    /**
     * Manually request a full state synchronization.
     *
     * @returns Promise resolving when sync is complete
     */
    requestFullSync: () => ipcRenderer.invoke("request-full-sync"),
};

/**
 * Monitor types API methods for accessing monitor type registry.
 *
 * @remarks
 * Provides access to available monitor types and their configurations
 * for dynamic form generation and validation.
 */
const monitorTypesAPI = {
    /**
     * Get all available monitor types from backend registry.
     *
     * @returns Promise resolving to array of monitor type configurations
     */
    getMonitorTypes: () => ipcRenderer.invoke("get-monitor-types"),

    /**
     * Format monitor detail using backend registry.
     *
     * @param type - Monitor type
     * @param details - Detail value to format
     * @returns Promise resolving to formatted detail string
     */
    formatMonitorDetail: (type: string, details: string) => ipcRenderer.invoke("format-monitor-detail", type, details),

    /**
     * Format monitor title suffix using backend registry.
     *
     * @param type - Monitor type
     * @param monitor - Monitor data
     * @returns Promise resolving to formatted title suffix
     */
    formatMonitorTitleSuffix: (type: string, monitor: Record<string, unknown>) =>
        ipcRenderer.invoke("format-monitor-title-suffix", type, monitor),

    /**
     * Validate monitor data using backend registry.
     *
     * @param type - Monitor type to validate
     * @param data - Monitor data to validate
     * @returns Promise resolving to validation result
     */
    validateMonitorData: (type: string, data: unknown) => ipcRenderer.invoke("validate-monitor-data", type, data),
};

/**
 * Expose the organized API to the renderer process via contextBridge.
 *
 * @remarks
 * This creates the `window.electronAPI` object available in the renderer process.
 * The API is organized by functional domains for better maintainability and
 * type safety. Each domain corresponds to a specific area of functionality.
 */
contextBridge.exposeInMainWorld("electronAPI", {
    // Domain-specific APIs organized for maintainability
    data: dataAPI,
    events: eventsAPI,
    monitoring: monitoringAPI,
    settings: settingsAPI,
    sites: siteAPI,
    stateSync: stateSyncAPI,
    system: systemAPI,
    monitorTypes: monitorTypesAPI,
});
