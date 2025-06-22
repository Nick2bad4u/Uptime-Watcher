import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Site, StatusUpdate, Monitor, MonitorType } from "./types";
import { ThemeName } from "./theme/types";
import { DEFAULT_CHECK_INTERVAL, TIMEOUT_CONSTRAINTS } from "./constants";

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
    isMonitoring: boolean;
    checkInterval: number;
    darkMode: boolean; // Keep for backwards compatibility
    settings: AppSettings;
    showSettings: boolean;

    // Site details view
    selectedSite: Site | null;
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

    // Actions - Backend integration
    initializeApp: () => Promise<void>;
    createSite: (siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }) => Promise<void>;
    deleteSite: (url: string) => Promise<void>;
    checkSiteNow: (url: string, monitorType: MonitorType) => Promise<void>;
    modifySite: (url: string, updates: Partial<Site>) => Promise<void>;
    updateCheckIntervalValue: (interval: number) => Promise<void>;
    updateHistoryLimitValue: (limit: number) => Promise<void>;
    startSiteMonitoring: () => Promise<void>;
    stopSiteMonitoring: () => Promise<void>;
    exportAppData: () => Promise<string>;
    importAppData: (data: string) => Promise<boolean>;

    // Internal state actions (used by backend actions)
    setSites: (sites: Site[]) => void;
    addSite: (site: Site) => void;
    removeSite: (url: string) => void;
    updateSiteStatus: (update: StatusUpdate) => void;
    updateSite: (url: string, updates: Partial<Site>) => void;
    setMonitoring: (isMonitoring: boolean) => void;
    setCheckInterval: (interval: number) => void;
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
            isMonitoring: false,
            checkInterval: DEFAULT_CHECK_INTERVAL,
            darkMode: false,
            settings: defaultSettings,
            showSettings: false,

            // Site details initial state
            selectedSite: null,
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

            // Backend integration actions
            initializeApp: async () => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    const [sites, checkInterval, historyLimit] = await Promise.all([
                        window.electronAPI.getSites(),
                        window.electronAPI.getCheckInterval(),
                        window.electronAPI.getHistoryLimit(),
                    ]);

                    // Migrate legacy sites to new monitors[] structure if needed
                    const migratedSites = sites.map((site: any) => {
                        if (!site.monitors) {
                            // Legacy: convert monitorType, status, history to monitors[]
                            return {
                                ...site,
                                monitors: [{
                                    type: site.monitorType || "http",
                                    status: site.status,
                                    history: site.history || [],
                                }],
                            };
                        }
                        return site;
                    });

                    state.setSites(migratedSites);
                    state.setCheckInterval(checkInterval);
                    state.updateSettings({ historyLimit });

                    if (migratedSites.length > 0) {
                        await window.electronAPI.startMonitoring();
                        state.setMonitoring(true);
                    }
                } catch (error) {
                    state.setError(`Failed to initialize app: ${(error as Error).message}`);
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
                    const monitors = siteData.monitors || [{ type: "http", status: "pending", history: [] }];
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

            updateCheckIntervalValue: async (interval: number) => {
                const state = get();
                state.clearError();

                try {
                    await window.electronAPI.updateCheckInterval(interval);
                    state.setCheckInterval(interval);
                } catch (error) {
                    state.setError(`Failed to update check interval: ${(error as Error).message}`);
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

            startSiteMonitoring: async () => {
                const state = get();
                state.clearError();

                try {
                    await window.electronAPI.startMonitoring();
                    state.setMonitoring(true);
                } catch (error) {
                    state.setError(`Failed to start monitoring: ${(error as Error).message}`);
                    throw error;
                }
            },

            stopSiteMonitoring: async () => {
                const state = get();
                state.clearError();

                try {
                    await window.electronAPI.stopMonitoring();
                    state.setMonitoring(false);
                } catch (error) {
                    state.setError(`Failed to stop monitoring: ${(error as Error).message}`);
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
                    selectedSite: state.selectedSite?.url === url ? null : state.selectedSite,
                    showSiteDetails: state.selectedSite?.url === url ? false : state.showSiteDetails,
                })),

            updateSiteStatus: (update: StatusUpdate) =>
                set((state) => {
                    // update.site: { url, monitors }
                    const updatedSites = state.sites.map((site) => {
                        if (site.url !== update.site.url) return site;
                        // Merge monitors by type
                        const updatedMonitors = site.monitors.map((monitor: Monitor) => {
                            const updated = update.site.monitors.find((m: Monitor) => m.type === monitor.type);
                            return updated ? { ...monitor, ...updated } : monitor;
                        });
                        // Add any new monitor types from update
                        update.site.monitors.forEach((m: Monitor) => {
                            if (!updatedMonitors.find((um) => um.type === m.type)) {
                                updatedMonitors.push(m);
                            }
                        });
                        return { ...site, monitors: updatedMonitors };
                    });

                    // Update selected site if it matches
                    const updatedSelectedSite =
                        state.selectedSite?.url === update.site.url ? update.site : state.selectedSite;

                    // Calculate uptime/downtime statistics (all monitors)
                    const allHistory = updatedSites.flatMap((site) => site.monitors.flatMap((m) => m.history));
                    const totalUptime = allHistory.filter((h) => h.status === "up").length;
                    const totalDowntime = allHistory.filter((h) => h.status === "down").length;

                    return {
                        sites: updatedSites,
                        selectedSite: updatedSelectedSite,
                        totalUptime,
                        totalDowntime,
                    };
                }),

            updateSite: (url: string, updates: Partial<Site>) =>
                set((state) => {
                    const updatedSites = state.sites.map((site) => (site.url === url ? { ...site, ...updates } : site));
                    const updatedSelectedSite =
                        state.selectedSite?.url === url ? { ...state.selectedSite, ...updates } : state.selectedSite;
                    return {
                        sites: updatedSites,
                        selectedSite: updatedSelectedSite,
                    };
                }),

            setMonitoring: (isMonitoring: boolean) => set({ isMonitoring }),

            setCheckInterval: (interval: number) => set({ checkInterval: interval }),

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
            setSelectedSite: (site: Site | null) => set({ selectedSite: site }),

            setShowSiteDetails: (show: boolean) => set({ showSiteDetails: show }),

            // Error handling actions
            setError: (error: string | null) => set({ lastError: error }),

            setLoading: (loading: boolean) => set({ isLoading: loading }),

            clearError: () => set({ lastError: null }),

            // Synchronized UI actions
            setActiveSiteDetailsTab: (tab: string) =>
                set({ activeSiteDetailsTab: tab }),
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
                checkInterval: state.checkInterval,
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
