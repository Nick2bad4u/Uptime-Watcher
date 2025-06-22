"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
    // Site management
    addSite: (site) => electron.ipcRenderer.invoke("add-site", site),
    removeSite: (url) => electron.ipcRenderer.invoke("remove-site", url),
    updateSite: (url, updates) => electron.ipcRenderer.invoke("update-site", url, updates),
    getSites: () => electron.ipcRenderer.invoke("get-sites"),
    checkSiteNow: (url, monitorType) => electron.ipcRenderer.invoke("check-site-now", url, monitorType),
    // Data management
    exportData: () => electron.ipcRenderer.invoke("export-data"),
    importData: (data) => electron.ipcRenderer.invoke("import-data", data),
    // Monitoring controls
    startMonitoring: () => electron.ipcRenderer.invoke("start-monitoring"),
    stopMonitoring: () => electron.ipcRenderer.invoke("stop-monitoring"),
    updateHistoryLimit: (limit) => electron.ipcRenderer.invoke("update-history-limit", limit),
    getHistoryLimit: () => electron.ipcRenderer.invoke("get-history-limit"),
    // Event listeners
    onStatusUpdate: (callback) => {
        electron.ipcRenderer.on("status-update", (_, data) => callback(data));
    },
    removeAllListeners: (channel) => {
        electron.ipcRenderer.removeAllListeners(channel);
    },
    // Updater: allow renderer to trigger quitAndInstall
    quitAndInstall: () => electron.ipcRenderer.send("quit-and-install"),
    // Per-site monitoring
    startMonitoringForSite: (url, monitorType) =>
        electron.ipcRenderer.invoke("start-monitoring-for-site", url, monitorType),
    stopMonitoringForSite: (url, monitorType) =>
        electron.ipcRenderer.invoke("stop-monitoring-for-site", url, monitorType),
});
