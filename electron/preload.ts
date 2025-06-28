import { contextBridge, ipcRenderer } from "electron";

import { Site } from "./types";

/**
 * Preload script that exposes safe IPC communication to the renderer process.
 * Organized by domain for better maintainability and type safety.
 */

// Site management APIs
const siteAPI = {
    addSite: (site: Site) => ipcRenderer.invoke("add-site", site),
    checkSiteNow: (identifier: string, monitorType: string) =>
        ipcRenderer.invoke("check-site-now", identifier, monitorType),
    getSites: () => ipcRenderer.invoke("get-sites"),
    removeSite: (identifier: string) => ipcRenderer.invoke("remove-site", identifier),
    updateSite: (identifier: string, updates: Partial<Site>) => ipcRenderer.invoke("update-site", identifier, updates),
};

// Monitoring control APIs
const monitoringAPI = {
    startMonitoring: () => ipcRenderer.invoke("start-monitoring"),
    startMonitoringForSite: (identifier: string, monitorType?: string) =>
        ipcRenderer.invoke("start-monitoring-for-site", identifier, monitorType),
    stopMonitoring: () => ipcRenderer.invoke("stop-monitoring"),
    stopMonitoringForSite: (identifier: string, monitorType?: string) =>
        ipcRenderer.invoke("stop-monitoring-for-site", identifier, monitorType),
};

// Data management APIs
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
