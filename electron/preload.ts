/**
 * Preload script that exposes safe IPC communication to the renderer process.
 * Creates a secure bridge between the main and renderer processes using Electron's contextBridge.
 * Organized by domain for better maintainability and type safety.
 */

import { contextBridge, ipcRenderer } from "electron";

import { Site } from "./types";

/** Site management API methods for CRUD operations */
const siteAPI = {
    /** Add a new site with monitors */
    addSite: (site: Site) => ipcRenderer.invoke("add-site", site),
    /** Trigger an immediate check for a specific site monitor */
    checkSiteNow: (identifier: string, monitorType: string) =>
        ipcRenderer.invoke("check-site-now", identifier, monitorType),
    /** Retrieve all sites from the database */
    getSites: () => ipcRenderer.invoke("get-sites"),
    /** Remove a site and all its data */
    removeSite: (identifier: string) => ipcRenderer.invoke("remove-site", identifier),
    /** Update site properties */
    updateSite: (identifier: string, updates: Partial<Site>) => ipcRenderer.invoke("update-site", identifier, updates),
};

/** Monitoring control API methods for starting/stopping monitoring */
const monitoringAPI = {
    /** Start monitoring for all sites */
    startMonitoring: () => ipcRenderer.invoke("start-monitoring"),
    /** Start monitoring for a specific site */
    startMonitoringForSite: (identifier: string, monitorType?: string) =>
        ipcRenderer.invoke("start-monitoring-for-site", identifier, monitorType),
    /** Stop monitoring for all sites */
    stopMonitoring: () => ipcRenderer.invoke("stop-monitoring"),
    /** Stop monitoring for a specific site */
    stopMonitoringForSite: (identifier: string, monitorType?: string) =>
        ipcRenderer.invoke("stop-monitoring-for-site", identifier, monitorType),
};

/** Data management API methods for import/export operations */
const dataAPI = {
    downloadSQLiteBackup: async () => {
        // Returns { buffer: ArrayBuffer, fileName: string }
        return await ipcRenderer.invoke("download-sqlite-backup");
    },
    exportData: () => ipcRenderer.invoke("export-data"),
    importData: (data: string) => ipcRenderer.invoke("import-data", data),
};

// Settings and configuration APIs
const settingsAPI = {
    getHistoryLimit: () => ipcRenderer.invoke("get-history-limit"),
    /**
     * Update the history limit in the backend and prune old history rows.
     * @param limit - The new history limit per monitor
     * @returns Promise that resolves when complete
     */
    updateHistoryLimit: (limit: number) => ipcRenderer.invoke("update-history-limit", limit),
};

// Event handling APIs
const eventsAPI = {
    onStatusUpdate: (callback: (data: unknown) => void) => {
        ipcRenderer.on("status-update", (_, data) => callback(data));
    },
    onUpdateStatus: (callback: (data: unknown) => void) => {
        ipcRenderer.on("update-status", (_, data) => callback(data));
    },
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },
};

// System and updater APIs
const systemAPI = {
    quitAndInstall: () => ipcRenderer.send("quit-and-install"),
};

// Expose organized API to renderer process
contextBridge.exposeInMainWorld("electronAPI", {
    // Backward compatibility - maintain existing flat API structure
    // TODO: Consider removing these in a future major version
    addSite: siteAPI.addSite,
    checkSiteNow: siteAPI.checkSiteNow,
    // Domain-specific APIs
    data: dataAPI,
    downloadSQLiteBackup: dataAPI.downloadSQLiteBackup,
    events: eventsAPI,
    exportData: dataAPI.exportData,
    getHistoryLimit: settingsAPI.getHistoryLimit,
    getSites: siteAPI.getSites,
    importData: dataAPI.importData,
    monitoring: monitoringAPI,
    onStatusUpdate: eventsAPI.onStatusUpdate,
    quitAndInstall: systemAPI.quitAndInstall,
    removeAllListeners: eventsAPI.removeAllListeners,
    removeSite: siteAPI.removeSite,
    settings: settingsAPI,
    sites: siteAPI,
    startMonitoring: monitoringAPI.startMonitoring,
    startMonitoringForSite: monitoringAPI.startMonitoringForSite,
    stopMonitoring: monitoringAPI.stopMonitoring,
    stopMonitoringForSite: monitoringAPI.stopMonitoringForSite,
    system: systemAPI,
    updateHistoryLimit: settingsAPI.updateHistoryLimit,
    updateSite: siteAPI.updateSite,
});
