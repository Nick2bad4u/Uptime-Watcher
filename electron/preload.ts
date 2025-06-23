import { contextBridge, ipcRenderer } from "electron";
import { Site } from "./types";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
    // Site management
    addSite: (site: any) => ipcRenderer.invoke("add-site", site),
    removeSite: (identifier: string) => ipcRenderer.invoke("remove-site", identifier),
    updateSite: (identifier: string, updates: Partial<Site>) => ipcRenderer.invoke("update-site", identifier, updates),
    getSites: () => ipcRenderer.invoke("get-sites"),
    checkSiteNow: (identifier: string, monitorType: string) =>
        ipcRenderer.invoke("check-site-now", identifier, monitorType),

    // Data management
    exportData: () => ipcRenderer.invoke("export-data"),
    importData: (data: string) => ipcRenderer.invoke("import-data", data),

    // Monitoring controls
    startMonitoring: () => ipcRenderer.invoke("start-monitoring"),
    stopMonitoring: () => ipcRenderer.invoke("stop-monitoring"),

    /**
     * Update the history limit in the backend and prune old history rows.
     * @param {number} limit - The new history limit per monitor
     * @returns {Promise<void>}
     */
    updateHistoryLimit: (limit: number) => ipcRenderer.invoke("update-history-limit", limit),

    getHistoryLimit: () => ipcRenderer.invoke("get-history-limit"),

    // Event listeners
    onStatusUpdate: (callback: (data: any) => void) => {
        ipcRenderer.on("status-update", (_, data) => callback(data));
    },

    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },

    // Updater: allow renderer to trigger quitAndInstall
    quitAndInstall: () => ipcRenderer.send("quit-and-install"),

    // Per-site monitoring
    startMonitoringForSite: (identifier: string, monitorType?: string) =>
        ipcRenderer.invoke("start-monitoring-for-site", identifier, monitorType),
    stopMonitoringForSite: (identifier: string, monitorType?: string) =>
        ipcRenderer.invoke("stop-monitoring-for-site", identifier, monitorType),

    // Direct SQLite backup download
    downloadSQLiteBackup: async () => {
        // Returns { buffer: ArrayBuffer, fileName: string }
        return await ipcRenderer.invoke("download-sqlite-backup");
    },
});
