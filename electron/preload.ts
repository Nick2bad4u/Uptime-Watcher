import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Site management
  addSite: (site: any) => ipcRenderer.invoke("add-site", site),
  removeSite: (url: string) => ipcRenderer.invoke("remove-site", url),
  getSites: () => ipcRenderer.invoke("get-sites"),

  // Monitoring controls
  startMonitoring: () => ipcRenderer.invoke("start-monitoring"),
  stopMonitoring: () => ipcRenderer.invoke("stop-monitoring"),
  updateCheckInterval: (interval: number) =>
    ipcRenderer.invoke("update-check-interval", interval),

  // Event listeners
  onStatusUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on("status-update", (_, data) => callback(data));
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
