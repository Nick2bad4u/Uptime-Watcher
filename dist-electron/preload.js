"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Site management
  addSite: (site) => electron.ipcRenderer.invoke("add-site", site),
  removeSite: (identifier) => electron.ipcRenderer.invoke("remove-site", identifier),
  updateSite: (identifier, updates) => electron.ipcRenderer.invoke("update-site", identifier, updates),
  getSites: () => electron.ipcRenderer.invoke("get-sites"),
  checkSiteNow: (identifier, monitorType) => electron.ipcRenderer.invoke("check-site-now", identifier, monitorType),
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
  startMonitoringForSite: (identifier, monitorType) => electron.ipcRenderer.invoke("start-monitoring-for-site", identifier, monitorType),
  stopMonitoringForSite: (identifier, monitorType) => electron.ipcRenderer.invoke("stop-monitoring-for-site", identifier, monitorType)
});
