"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // Site management
    addSite: (site) => electron_1.ipcRenderer.invoke("add-site", site),
    removeSite: (identifier) => electron_1.ipcRenderer.invoke("remove-site", identifier),
    updateSite: (identifier, updates) => electron_1.ipcRenderer.invoke("update-site", identifier, updates),
    getSites: () => electron_1.ipcRenderer.invoke("get-sites"),
    checkSiteNow: (identifier, monitorType) => electron_1.ipcRenderer.invoke("check-site-now", identifier, monitorType),
    // Data management
    exportData: () => electron_1.ipcRenderer.invoke("export-data"),
    importData: (data) => electron_1.ipcRenderer.invoke("import-data", data),
    // Monitoring controls
    startMonitoring: () => electron_1.ipcRenderer.invoke("start-monitoring"),
    stopMonitoring: () => electron_1.ipcRenderer.invoke("stop-monitoring"),
    /**
     * Update the history limit in the backend and prune old history rows.
     * @param {number} limit - The new history limit per monitor
     * @returns {Promise<void>}
     */
    updateHistoryLimit: (limit) => electron_1.ipcRenderer.invoke("update-history-limit", limit),
    getHistoryLimit: () => electron_1.ipcRenderer.invoke("get-history-limit"),
    // Event listeners
    onStatusUpdate: (callback) => {
        electron_1.ipcRenderer.on("status-update", (_, data) => callback(data));
    },
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
    // Updater: allow renderer to trigger quitAndInstall
    quitAndInstall: () => electron_1.ipcRenderer.send("quit-and-install"),
    // Per-site monitoring
    startMonitoringForSite: (identifier, monitorType) => electron_1.ipcRenderer.invoke("start-monitoring-for-site", identifier, monitorType),
    stopMonitoringForSite: (identifier, monitorType) => electron_1.ipcRenderer.invoke("stop-monitoring-for-site", identifier, monitorType),
    // Direct SQLite backup download
    downloadSQLiteBackup: async () => {
        // Returns { buffer: ArrayBuffer, fileName: string }
        return await electron_1.ipcRenderer.invoke("download-sqlite-backup");
    },
});
