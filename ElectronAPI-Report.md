C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\preload.ts
518,1: contextBridge.exposeInMainWorld("electronAPI", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\SiteDetails\ScreenshotThumbnail.tsx
76,1: if (hasOpenExternal(window.electronAPI)) {
77,1: window.electronAPI.openExternal(url);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\SiteDetails\SiteDetailsHeader.tsx
90,1: const electronAPI = (
91,1: window.electronAPI as unknown as {
92,1: electronAPI?: { openExternal: (url: string) => void };
94,1: ).electronAPI;
95,1: if (hasOpenExternal(electronAPI)) {
96,1: electronAPI.openExternal(url);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\hooks\useMonitorFields.ts
76,1: const response = await window.electronAPI.monitorTypes.getMonitorTypes();

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\settings\useSettingsStore.ts
61,1: const historyLimitResponse = await window.electronAPI.settings.getHistoryLimit();
83,1: historyLimitResponse = await window.electronAPI.settings.getHistoryLimit();
132,1: await window.electronAPI.settings.resetSettings();
135,1: const historyLimitResponse = await window.electronAPI.settings.getHistoryLimit();
178,1: const historyLimitResponse = await window.electronAPI.settings.getHistoryLimit();
221,1: await window.electronAPI.settings.updateHistoryLimit(limit);
224,1: const backendLimitResponse = await window.electronAPI.settings.getHistoryLimit();

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\services\MonitoringService.ts
64,1: return window.electronAPI.monitoring.startMonitoringForSite(siteId, monitorId);
84,1: return window.electronAPI.monitoring.startMonitoringForSite(siteId);
100,1: return window.electronAPI.monitoring.stopMonitoringForSite(siteId, monitorId);
120,1: return window.electronAPI.monitoring.stopMonitoringForSite(siteId);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\services\SiteService.ts
29,1: const response = await window.electronAPI.sites.addSite(site);
47,1: const response = await window.electronAPI.sites.checkSiteNow(siteId, monitorId);
63,1: const response = await window.electronAPI.data.downloadSQLiteBackup();
79,1: const response = await window.electronAPI.sites.getSites();
114,1: const response = await window.electronAPI.sites.removeMonitor(siteIdentifier, monitorId);
131,1: const response = await window.electronAPI.sites.removeSite(identifier);
149,1: const response = await window.electronAPI.sites.updateSite(identifier, updates);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\utils\statusUpdateHandler.ts
162,1: const statusUpdateCleanup = window.electronAPI.events.onMonitorStatusChanged((data: unknown) => {
184,1: const monitoringStartedCleanup = window.electronAPI.events.onMonitoringStarted(() => {
197,1: const monitoringStoppedCleanup = window.electronAPI.events.onMonitoringStopped(() => {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\useSiteSync.ts
88,1: const status = await window.electronAPI.stateSync.getSyncStatus();
140,1: const cleanup = window.electronAPI.stateSync.onStateSyncEvent((event) => {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\updates\useUpdatesStore.ts
51,1: window.electronAPI.system.quitAndInstall();

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\utils.ts
180,1: if (typeof window.electronAPI?.sites?.getSites === "function") {
193,1: "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment."

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\test\setup.ts
81,1: Object.defineProperty(window, "electronAPI", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\types\electron.d.ts
23,1: electronAPI: {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\cacheSync.ts
36,1: if (typeof window === "undefined" || !window.electronAPI?.events) {
43,1: const cleanup = window.electronAPI.events.onCacheInvalidated((data: CacheInvalidationData) => {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\monitorTypeHelper.ts
87,1: const response = await window.electronAPI.monitorTypes.getMonitorTypes();

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\monitorUiHelpers.ts
74,1: throw new Error("ElectronAPI not available for monitor detail formatting");
78,1: const response = await window.electronAPI.monitorTypes.formatMonitorDetail(monitorType, details);
104,1: throw new Error("ElectronAPI not available for monitor title suffix formatting");
108,1: const response = await window.electronAPI.monitorTypes.formatMonitorTitleSuffix(monitorType, monitor);
294,1: window.electronAPI &&
295,1: typeof window.electronAPI.monitorTypes === "object" &&
296,1: typeof window.electronAPI.monitorTypes.formatMonitorDetail === "function" &&
297,1: typeof window.electronAPI.monitorTypes.formatMonitorTitleSuffix === "function"

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\monitorValidation.ts
66,1: const result = await window.electronAPI.monitorTypes.validateMonitorData(type, data);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\types.ts
58,1: electronAPI: {
