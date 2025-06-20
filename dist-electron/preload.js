"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Site management
  addSite: (site) => electron.ipcRenderer.invoke("add-site", site),
  removeSite: (url) => electron.ipcRenderer.invoke("remove-site", url),
  getSites: () => electron.ipcRenderer.invoke("get-sites"),
  checkSiteNow: (url) => electron.ipcRenderer.invoke("check-site-now", url),
  // Monitoring controls
  startMonitoring: () => electron.ipcRenderer.invoke("start-monitoring"),
  stopMonitoring: () => electron.ipcRenderer.invoke("stop-monitoring"),
  updateCheckInterval: (interval) => electron.ipcRenderer.invoke("update-check-interval", interval),
  // Event listeners
  onStatusUpdate: (callback) => {
    electron.ipcRenderer.on("status-update", (_, data) => callback(data));
  },
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
});
