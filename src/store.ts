import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Site, StatusUpdate, Monitor, MonitorType } from "./types";
import { ThemeName } from "./theme/types";
import { TIMEOUT_CONSTRAINTS } from "./constants";

export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

interface AppSettings {
    notifications: boolean;
    autoStart: boolean;
    minimizeToTray: boolean;
    theme: ThemeName;
    timeout: number;
    maxRetries: number;
    soundAlerts: boolean;
    historyLimit: number;
}

interface AppState {
    sites: Site[];
    // Removed global isMonitoring and checkInterval (per-monitor only)
    darkMode: boolean; // Keep for backwards compatibility
    settings: AppSettings;
    // UI state
    showSettings: boolean;
    selectedSiteId: string | null; // Store only the id
    showSiteDetails: boolean;

    // Error handling
    lastError: string | null;
    isLoading: boolean;

    // Statistics
    totalUptime: number;
    totalDowntime: number;

    // Synchronized UI state for SiteDetails
    activeSiteDetailsTab: string; // Was: "overview" | "analytics" | "history" | "settings"
    siteDetailsChartTimeRange: "1h" | "24h" | "7d" | "30d";
    showAdvancedMetrics: boolean;

    // Update status
    updateStatus: UpdateStatus;
    updateError: string | null;

    // Derived selector
    getSelectedSite: () => Site | null;

    // Actions - Backend integration
    initializeApp: () => Promise<void>;
    createSite: (siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }) => Promise<void>;
    deleteSite: (url: string) => Promise<void>;
    checkSiteNow: (url: string, monitorType: MonitorType) => Promise<void>;
    modifySite: (url: string, updates: Partial<Site>) => Promise<void>;
    updateSiteCheckInterval: (url: string, monitorType: MonitorType, interval: number) => Promise<void>;
    updateHistoryLimitValue: (limit: number) => Promise<void>;
    // Per-monitor only: monitorType is required
    startSiteMonitorMonitoring: (url: string, monitorType: MonitorType) => Promise<void>;
    stopSiteMonitorMonitoring: (url: string, monitorType: MonitorType) => Promise<void>;
    exportAppData: () => Promise<string>;
    importAppData: (data: string) => Promise<boolean>;
    syncSitesFromBackend: () => Promise<void>;

    // Internal state actions (used by backend actions)
    setSites: (sites: Site[]) => void;
    addSite: (site: Site) => void;
    removeSite: (url: string) => void;
    updateSiteStatus: (update: StatusUpdate) => void;
    updateSite: (url: string, updates: Partial<Site>) => void;
    toggleDarkMode: () => void; // Keep for backwards compatibility
    updateSettings: (settings: Partial<AppSettings>) => void;
    setShowSettings: (show: boolean) => void;
    resetSettings: () => void;

    // Site details actions
    setSelectedSite: (site: Site | null) => void;
    setShowSiteDetails: (show: boolean) => void;

    // Error handling actions
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
    clearError: () => void;

    // Synchronized UI actions
    setActiveSiteDetailsTab: (tab: string) => void; // Was: (tab: "overview" | "analytics" | "history" | "settings") => void;
    setSiteDetailsChartTimeRange: (range: "1h" | "24h" | "7d" | "30d") => void;
    setShowAdvancedMetrics: (show: boolean) => void;

    // Update status actions
    setUpdateStatus: (status: UpdateStatus) => void;
    setUpdateError: (error: string | null) => void;
    // Update: apply downloaded update and restart
    applyUpdate: () => void;
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => void;
    unsubscribeFromStatusUpdates: () => void;
}

const defaultSettings: AppSettings = {
    notifications: true,
    autoStart: false,
    minimizeToTray: true,
    theme: "system",
    timeout: TIMEOUT_CONSTRAINTS.MAX / 10, // 6 seconds (reasonable default)
    maxRetries: 3,
    soundAlerts: false,
    historyLimit: 100,
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            sites: [],
            // Remove isMonitoring
            darkMode: false,
            settings: defaultSettings,
            showSettings: false,
            selectedSiteId: null,
            showSiteDetails: false,

            // Error handling initial state
            lastError: null,
            isLoading: false,

            // Statistics initial state
            totalUptime: 0,
            totalDowntime: 0,

            // Synchronized UI state for SiteDetails
            activeSiteDetailsTab: "overview",
            siteDetailsChartTimeRange: "24h",
            showAdvancedMetrics: false,

            // Update status initial state
            updateStatus: "idle",
            updateError: null,

            // Derived selector
            getSelectedSite: () => {
                const { sites, selectedSiteId } = get();
                if (!selectedSiteId) return null;
                return sites.find((s) => s.id === selectedSiteId) || null;
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

                    // Ensure every monitor has monitoring property (default true)
                    const migratedSites = sites.map((site: any) => {
                        const { monitors = [], ...siteRest } = site;
                        return {
                            ...siteRest,
                            monitors: monitors.map((monitor: any) =>
                                typeof monitor.monitoring === "undefined" ? { ...monitor, monitoring: true } : monitor
                            ),
                        };
                    });

                    state.setSites(migratedSites);
                    state.updateSettings({ historyLimit });
                } catch (error) {
                    state.setError(`Failed to initialize app: ${(error as Error).message}`);
                } finally {
                    state.setLoading(false);
                }
            },

            syncSitesFromBackend: async () => {
                const state = get();
                state.setLoading(true);
                state.clearError();
                try {
                    const backendSites = await window.electronAPI.getSites();
                    state.setSites(backendSites);
                } catch (error) {
                    state.setError(`Failed to sync sites: ${(error as Error).message}`);
                } finally {
                    state.setLoading(false);
                }
            },

            createSite: async (siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    // Default to HTTP monitor if none provided
                    const monitors = (siteData.monitors || [{ type: "http", status: "pending", history: [] }]).map(
                        (monitor) =>
                            typeof monitor.monitoring === "undefined" ? { ...monitor, monitoring: true } : monitor
                    );
                    const newSite = await window.electronAPI.addSite({ ...siteData, monitors });
                    state.addSite(newSite);
                } catch (error) {
                    state.setError(`Failed to add site: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },

            deleteSite: async (url: string) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    await window.electronAPI.removeSite(url);
                    state.removeSite(url);
                } catch (error) {
                    state.setError(`Failed to remove site: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },

            checkSiteNow: async (url: string, monitorType: MonitorType) => {
                const state = get();
                state.clearError();
                try {
                    const statusUpdate = await window.electronAPI.checkSiteNow(url, monitorType);
                    state.updateSiteStatus(statusUpdate);
                } catch (error) {
                    state.setError(`Failed to check site: ${(error as Error).message}`);
                    throw error;
                }
            },

            modifySite: async (url: string, updates: Partial<Site>) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    await window.electronAPI.updateSite(url, updates);
                    state.updateSite(url, updates);
                } catch (error) {
                    state.setError(`Failed to update site: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },

            updateSiteCheckInterval: async (url: string, monitorType: MonitorType, interval: number) => {
                // Per-monitor check interval update
                const state = get();
                state.clearError();
                try {
                    // Update in backend (update the monitor in the site's monitors array)
                    await window.electronAPI.updateSite(url, {
                        monitors: get()
                            .sites.find((site) => site.url === url)
                            ?.monitors.map((monitor) =>
                                monitor.type === monitorType ? { ...monitor, checkInterval: interval } : monitor
                            ),
                    });
                    // Update in store
                    set((prev) => ({
                        sites: prev.sites.map((site) =>
                            site.url === url
                                ? {
                                      ...site,
                                      monitors: site.monitors.map((monitor) =>
                                          monitor.type === monitorType
                                              ? { ...monitor, checkInterval: interval }
                                              : monitor
                                      ),
                                  }
                                : site
                        ),
                    }));
                } catch (error) {
                    state.setError(`Failed to update monitor check interval: ${(error as Error).message}`);
                    throw error;
                }
            },
            updateHistoryLimitValue: async (limit: number) => {
                const state = get();
                state.clearError();

                try {
                    await window.electronAPI.updateHistoryLimit(limit);
                    state.updateSettings({ historyLimit: limit });
                } catch (error) {
                    state.setError(`Failed to update history limit: ${(error as Error).message}`);
                    throw error;
                }
            },

            startSiteMonitorMonitoring: async (url: string, monitorType: MonitorType) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.startMonitoringForSite(url, monitorType);
                    set((prev) => ({
                        sites: prev.sites.map((site) => {
                            if (site.url !== url) return site;
                            // Only update the specific monitor by type
                            const updatedMonitors = site.monitors.map((monitor) =>
                                monitor.type === monitorType ? { ...monitor, monitoring: true } : monitor
                            );
                            return { ...site, monitors: updatedMonitors };
                        }),
                    }));
                } catch (error) {
                    state.setError(`Failed to start monitoring for monitor: ${(error as Error).message}`);
                    throw error;
                }
            },
            stopSiteMonitorMonitoring: async (url: string, monitorType: MonitorType) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.stopMonitoringForSite(url, monitorType);
                    set((prev) => ({
                        sites: prev.sites.map((site) => {
                            if (site.url !== url) return site;
                            // Only update the specific monitor by type
                            const updatedMonitors = site.monitors.map((monitor) =>
                                monitor.type === monitorType ? { ...monitor, monitoring: false } : monitor
                            );
                            return { ...site, monitors: updatedMonitors };
                        }),
                    }));
                } catch (error) {
                    state.setError(`Failed to stop monitoring for monitor: ${(error as Error).message}`);
                    throw error;
                }
            },

            exportAppData: async () => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    const data = await window.electronAPI.exportData();
                    return data;
                } catch (error) {
                    state.setError(`Failed to export data: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },

            importAppData: async (data: string) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    const success = await window.electronAPI.importData(data);
                    if (success) {
                        // Reload app data after successful import
                        await state.initializeApp();
                    }
                    return success;
                } catch (error) {
                    state.setError(`Failed to import data: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },

            // Internal state actions (used by backend actions and internal logic)
            setSites: (sites: Site[]) => set({ sites }),

            addSite: (site: Site) =>
                set((state) => {
                    const newSites = [...state.sites, site];
                    return { sites: newSites };
                }),

            removeSite: (url: string) =>
                set((state) => ({
                    sites: state.sites.filter((site) => site.url !== url),
                    selectedSiteId:
                        state.selectedSiteId && state.sites.find((s) => s.url === url && s.id === state.selectedSiteId)
                            ? null
                            : state.selectedSiteId,
                    showSiteDetails:
                        state.selectedSiteId && state.sites.find((s) => s.url === url && s.id === state.selectedSiteId)
                            ? false
                            : state.showSiteDetails,
                })),

            updateSiteStatus: (update: StatusUpdate) =>
                set((state) => ({
                    sites: state.sites.map((site) => (site.id === update.site.id ? update.site : site)),
                })),

            updateSite: (url: string, updates: Partial<Site>) =>
                set((state) => ({
                    sites: state.sites.map((site) => (site.url === url ? { ...site, ...updates } : site)),
                })),

            toggleDarkMode: () =>
                set((state) => {
                    const newDarkMode = !state.darkMode;
                    // Update theme setting to match
                    const newTheme = newDarkMode ? "dark" : "light";
                    return {
                        darkMode: newDarkMode,
                        settings: { ...state.settings, theme: newTheme },
                    };
                }),

            updateSettings: (newSettings: Partial<AppSettings>) =>
                set((state) => {
                    const updatedSettings = { ...state.settings, ...newSettings };
                    // Keep darkMode in sync with theme setting for backwards compatibility
                    let darkMode = state.darkMode;

                    if (newSettings.theme) {
                        darkMode =
                            updatedSettings.theme === "dark" ||
                            (updatedSettings.theme === "system" &&
                                window.matchMedia?.("(prefers-color-scheme: dark)").matches);
                    }

                    return {
                        settings: updatedSettings,
                        darkMode,
                    };
                }),

            setShowSettings: (show: boolean) => set({ showSettings: show }),

            resetSettings: () =>
                set({
                    settings: defaultSettings,
                    darkMode: false, // Reset to light mode
                }),

            // Site details actions
            setSelectedSite: (site: Site | null) => {
                set({ selectedSiteId: site ? site.id : null });
            },

            setShowSiteDetails: (show: boolean) => set({ showSiteDetails: show }),

            // Error handling actions
            setError: (error: string | null) => set({ lastError: error }),

            setLoading: (loading: boolean) => set({ isLoading: loading }),

            clearError: () => set({ lastError: null }),

            // Synchronized UI actions
            setActiveSiteDetailsTab: (tab: string) => set({ activeSiteDetailsTab: tab }),
            setSiteDetailsChartTimeRange: (range: "1h" | "24h" | "7d" | "30d") =>
                set({ siteDetailsChartTimeRange: range }),
            setShowAdvancedMetrics: (show: boolean) => set({ showAdvancedMetrics: show }),

            // Update status actions
            setUpdateStatus: (status: UpdateStatus) => set({ updateStatus: status }),
            setUpdateError: (error: string | null) => set({ updateError: error }),
            // Update: apply downloaded update and restart
            applyUpdate: () => {
                window.electronAPI.quitAndInstall?.();
            },
            subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
                window.electronAPI.onStatusUpdate(callback);
            },
            unsubscribeFromStatusUpdates: () => {
                window.electronAPI.removeAllListeners("status-update");
            },
        }),
        {
            name: "uptime-watcher-storage",
            partialize: (state) => ({
                darkMode: state.darkMode,
                settings: state.settings,
                sites: state.sites, // Persist sites to maintain history
                totalUptime: state.totalUptime,
                totalDowntime: state.totalDowntime,
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                showAdvancedMetrics: state.showAdvancedMetrics,
                // Don't persist error states, loading states, or UI states
            }),
        }
    )
);
