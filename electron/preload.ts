import { contextBridge, ipcRenderer } from "electron";
import { Site } from "./types";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
    // Site management
    addSite: (site: any) => ipcRenderer.invoke("add-site", site),
    removeSite: (url: string) => ipcRenderer.invoke("remove-site", url),
    updateSite: (url: string, updates: Partial<Site>) => ipcRenderer.invoke("update-site", url, updates),
    getSites: () => ipcRenderer.invoke("get-sites"),
    checkSiteNow: (url: string, monitorType: string) => ipcRenderer.invoke("check-site-now", url, monitorType),

    // Data management
    exportData: () => ipcRenderer.invoke("export-data"),
    importData: (data: string) => ipcRenderer.invoke("import-data", data),

    // Monitoring controls
    startMonitoring: () => ipcRenderer.invoke("start-monitoring"),
    stopMonitoring: () => ipcRenderer.invoke("stop-monitoring"),
    updateCheckInterval: (interval: number) => ipcRenderer.invoke("update-check-interval", interval),
    getCheckInterval: () => ipcRenderer.invoke("get-check-interval"),

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
});
