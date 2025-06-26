"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const constants_1 = require("./constants");
const defaultSettings = {
    autoStart: false,
    historyLimit: 100,
    maxRetries: 3,
    minimizeToTray: true,
    notifications: true,
    soundAlerts: false,
    theme: "system",
    timeout: constants_1.TIMEOUT_CONSTRAINTS.MAX / 10, // 6 seconds (reasonable default)
};
exports.useStore = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
    // Synchronized UI state for SiteDetails
    activeSiteDetailsTab: "overview",
    /**
     * Add a monitor to an existing site
     */
    addMonitorToSite: async (siteId, monitor) => {
        const state = get();
        state.setLoading(true);
        state.clearError();
        try {
            // Get the current site
            const site = state.sites.find((s) => s.identifier === siteId);
            if (!site)
                throw new Error("Site not found");
            // Allow multiple monitors of the same type (uniqueness is not enforced)
            const updatedMonitors = [...site.monitors, monitor];
            await window.electronAPI.updateSite(siteId, { monitors: updatedMonitors });
            await state.syncSitesFromBackend();
        }
        catch (error) {
            state.setError(`Failed to add monitor: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
        finally {
            state.setLoading(false);
        }
    },
    addSite: (site) => set((state) => ({ sites: [...state.sites, site] })),
    // Update: apply downloaded update and restart
    applyUpdate: () => {
        window.electronAPI.quitAndInstall?.();
    },
    checkSiteNow: async (siteId, monitorId) => {
        const state = get();
        state.clearError();
        try {
            await window.electronAPI.checkSiteNow(siteId, monitorId);
            // Backend will emit 'status-update', which will trigger syncSitesFromBackend
        }
        catch (error) {
            state.setError(`Failed to check site: ${error.message}`);
            throw error;
        }
    },
    clearError: () => set({ lastError: undefined }),
    createSite: async (siteData) => {
        const state = get();
        state.setLoading(true);
        state.clearError();
        try {
            // Default to HTTP monitor if none provided
            const monitors = (siteData.monitors && siteData.monitors.length > 0
                ? siteData.monitors
                : [
                    {
                        history: [],
                        id: crypto.randomUUID(),
                        monitoring: true,
                        status: "pending",
                        type: "http",
                    },
                ]).map((monitor) => ({
                ...monitor,
                id: monitor.id || crypto.randomUUID(),
                monitoring: typeof monitor.monitoring === "undefined" ? true : monitor.monitoring,
                status: ["pending", "up", "down"].includes(monitor.status)
                    ? monitor.status
                    : "pending",
                type: monitor.type,
            }));
            const newSite = await window.electronAPI.addSite({ ...siteData, monitors });
            state.addSite(newSite);
        }
        catch (error) {
            state.setError(`Failed to add site: ${error.message}`);
            throw error;
        }
        finally {
            state.setLoading(false);
        }
    },
    // Remove isMonitoring
    darkMode: false,
    deleteSite: async (identifier) => {
        const state = get();
        state.setLoading(true);
        state.clearError();
        try {
            await window.electronAPI.removeSite(identifier);
            state.removeSite(identifier);
        }
        catch (error) {
            state.setError(`Failed to remove site: ${error.message}`);
            throw error;
        }
        finally {
            state.setLoading(false);
        }
    },
    downloadSQLiteBackup: async () => {
        const state = get();
        state.setLoading(true);
        state.clearError();
        try {
            // Request SQLite file as ArrayBuffer from preload
            const { buffer, fileName } = await window.electronAPI.downloadSQLiteBackup();
            if (!buffer)
                throw new Error("No backup data received");
            // Create a Blob and trigger download
            const blob = new Blob([buffer], { type: "application/x-sqlite3" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName || `uptime-watcher-backup-${new Date().toISOString().split("T")[0]}.sqlite`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            state.setError(`Failed to download SQLite backup: ${error.message}`);
            throw error;
        }
        finally {
            state.setLoading(false);
        }
    },
    getSelectedMonitorId: (siteId) => {
        const ids = get().selectedMonitorIds || {};
        // Only allow access to own properties with string keys
        if (typeof siteId === "string" && Object.prototype.hasOwnProperty.call(ids, siteId)) {
            // eslint-disable-next-line security/detect-object-injection -- sanitized above
            return ids[siteId];
        }
        return undefined;
    },
    // Derived selector
    getSelectedSite: () => {
        const { selectedSiteId, sites } = get();
        if (!selectedSiteId)
            return undefined;
        return sites.find((s) => s.identifier === selectedSiteId) || undefined;
    },
    // Backend integration actions
    initializeApp: async () => {
        const state = get();
        state.setLoading(true);
        state.clearError();
        try {
            const [sites, historyLimit] = await Promise.all([
                window.electronAPI.getSites(),
                window.electronAPI.getHistoryLimit(),
            ]);
            state.setSites(sites);
            state.updateSettings({ historyLimit });
        }
        catch (error) {
            state.setError(`Failed to initialize app: ${error.message}`);
        }
        finally {
            state.setLoading(false);
        }
    },
    isLoading: false,
    // Error handling initial state
    lastError: undefined,
    modifySite: async (identifier, updates) => {
        const state = get();
        state.setLoading(true);
        state.clearError();
        try {
            await window.electronAPI.updateSite(identifier, updates);
            await state.syncSitesFromBackend();
        }
        catch (error) {
            state.setError(`Failed to update site: ${error.message}`);
            throw error;
        }
        finally {
            state.setLoading(false);
        }
    },
    removeSite: (identifier) => set((state) => ({
        selectedSiteId: state.selectedSiteId &&
            state.sites.find((s) => s.identifier === identifier && s.identifier === state.selectedSiteId)
            ? undefined
            : state.selectedSiteId,
        showSiteDetails: state.selectedSiteId &&
            state.sites.find((s) => s.identifier === identifier && s.identifier === state.selectedSiteId)
            ? false
            : state.showSiteDetails,
        sites: state.sites.filter((site) => site.identifier !== identifier),
    })),
    resetSettings: () => set({
        darkMode: false, // Reset to light mode
        settings: defaultSettings,
    }),
    // Selected monitor id per site (UI state, not persisted)
    selectedMonitorIds: {},
    selectedSiteId: undefined,
    // Synchronized UI actions
    setActiveSiteDetailsTab: (tab) => set({ activeSiteDetailsTab: tab }),
    // Error handling actions
    setError: (error) => set({ lastError: error }),
    setLoading: (loading) => set({ isLoading: loading }),
    setSelectedMonitorId: (siteId, monitorId) => set((state) => ({
        selectedMonitorIds: {
            ...state.selectedMonitorIds,
            [siteId]: monitorId,
        },
    })),
    // Site details actions
    setSelectedSite: (site) => {
        set({ selectedSiteId: site ? site.identifier : undefined });
    },
    setShowAdvancedMetrics: (show) => set({ showAdvancedMetrics: show }),
    setShowSettings: (show) => set({ showSettings: show }),
    setShowSiteDetails: (show) => set({ showSiteDetails: show }),
    setSiteDetailsChartTimeRange: (range) => set({ siteDetailsChartTimeRange: range }),
    // Internal state actions (used by backend actions and internal logic)
    setSites: (sites) => set({ sites }),
    settings: defaultSettings,
    // updateSiteStatus and updateSite removed: all updates come from backend fetches only
    setUpdateError: (error) => set({ updateError: error }),
    // Update status actions
    setUpdateStatus: (status) => set({ updateStatus: status }),
    showAdvancedMetrics: false,
    showSettings: false,
    showSiteDetails: false,
    siteDetailsChartTimeRange: "24h",
    sites: [],
    startSiteMonitorMonitoring: async (siteId, monitorId) => {
        const state = get();
        state.clearError();
        try {
            await window.electronAPI.startMonitoringForSite(siteId, monitorId);
            await state.syncSitesFromBackend();
        }
        catch (error) {
            state.setError(`Failed to start monitoring for monitor: ${error.message}`);
            throw error;
        }
    },
    stopSiteMonitorMonitoring: async (siteId, monitorId) => {
        const state = get();
        state.clearError();
        try {
            await window.electronAPI.stopMonitoringForSite(siteId, monitorId);
            await state.syncSitesFromBackend();
        }
        catch (error) {
            state.setError(`Failed to stop monitoring for monitor: ${error.message}`);
            throw error;
        }
    },
    subscribeToStatusUpdates: (callback) => {
        window.electronAPI.onStatusUpdate(async (update) => {
            // Always fetch latest sites/monitors/history from backend for live updates
            await get().syncSitesFromBackend();
            // Optionally, call the provided callback for custom logic
            if (callback)
                callback(update);
        });
    },
    syncSitesFromBackend: async () => {
        const state = get();
        state.setLoading(true);
        state.clearError();
        try {
            const backendSites = await window.electronAPI.getSites();
            state.setSites(backendSites);
        }
        catch (error) {
            state.setError(`Failed to sync sites: ${error.message}`);
        }
        finally {
            state.setLoading(false);
        }
    },
    toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode;
        // Update theme setting to match
        const newTheme = newDarkMode ? "dark" : "light";
        return {
            darkMode: newDarkMode,
            settings: { ...state.settings, theme: newTheme },
        };
    }),
    totalDowntime: 0,
    // Statistics initial state
    totalUptime: 0,
    unsubscribeFromStatusUpdates: () => {
        window.electronAPI.removeAllListeners("status-update");
    },
    updateError: undefined,
    updateHistoryLimitValue: async (limit) => {
        const state = get();
        state.clearError();
        state.setLoading(true);
        try {
            // Call backend to update and prune history
            await window.electronAPI.updateHistoryLimit(limit);
            // Reload the value from backend to ensure sync
            const newLimit = await window.electronAPI.getHistoryLimit();
            state.updateSettings({ historyLimit: newLimit });
        }
        catch (error) {
            state.setError(`Failed to update history limit: ${error.message}`);
            throw error;
        }
        finally {
            state.setLoading(false);
        }
    },
    updateSettings: (newSettings) => set((state) => {
        const updatedSettings = { ...state.settings, ...newSettings };
        // Keep darkMode in sync with theme setting for backwards compatibility
        // eslint-disable-next-line functional/no-let -- darkMode must be mutable for conditional assignment
        let darkMode = state.darkMode;
        if (newSettings.theme) {
            darkMode =
                updatedSettings.theme === "dark" ||
                    (updatedSettings.theme === "system" &&
                        window.matchMedia?.("(prefers-color-scheme: dark)").matches);
        }
        return {
            darkMode,
            settings: updatedSettings,
        };
    }),
    updateSiteCheckInterval: async (siteId, monitorId, interval) => {
        const state = get();
        state.clearError();
        try {
            // Update in backend (update the monitor in the site's monitors array)
            const site = get().sites.find((s) => s.identifier === siteId);
            if (!site)
                throw new Error("Site not found");
            const updatedMonitors = site.monitors.map((monitor) => monitor.id === monitorId ? { ...monitor, checkInterval: interval } : monitor);
            await window.electronAPI.updateSite(siteId, { monitors: updatedMonitors });
            await state.syncSitesFromBackend();
        }
        catch (error) {
            state.setError(`Failed to update monitor check interval: ${error.message}`);
            throw error;
        }
    },
    // Update status initial state
    updateStatus: "idle",
}), {
    name: "uptime-watcher-storage",
    partialize: (state) => ({
        activeSiteDetailsTab: state.activeSiteDetailsTab,
        darkMode: state.darkMode,
        settings: state.settings,
        showAdvancedMetrics: state.showAdvancedMetrics,
        siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
        totalDowntime: state.totalDowntime,
        totalUptime: state.totalUptime,
        // Don't persist sites, error states, loading states, or UI states
        // Don't persist selectedMonitorIds
    }),
}));
