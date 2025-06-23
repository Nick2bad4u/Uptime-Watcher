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
    selectedSiteId: string | null; // Store only the identifier
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

    // Selected monitor type per site (UI state, not persisted)
    selectedMonitorTypes: Record<string, MonitorType>;

    // Update status
    updateStatus: UpdateStatus;
    updateError: string | null;

    // Derived selector
    getSelectedSite: () => Site | null;

    // Actions - Backend integration
    initializeApp: () => Promise<void>;
    createSite: (siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }) => Promise<void>;
    deleteSite: (identifier: string) => Promise<void>;
    checkSiteNow: (identifier: string, monitorType: MonitorType) => Promise<void>;
    modifySite: (identifier: string, updates: Partial<Site>) => Promise<void>;
    updateSiteCheckInterval: (identifier: string, monitorType: MonitorType, interval: number) => Promise<void>;
    updateHistoryLimitValue: (limit: number) => Promise<void>;
    // Per-monitor only: monitorType is required
    startSiteMonitorMonitoring: (identifier: string, monitorType: MonitorType) => Promise<void>;
    stopSiteMonitorMonitoring: (identifier: string, monitorType: MonitorType) => Promise<void>;
    exportAppData: () => Promise<string>;
    importAppData: (data: string) => Promise<boolean>;
    syncSitesFromBackend: () => Promise<void>;

    // Internal state actions (used by backend actions)
    setSites: (sites: Site[]) => void;
    addSite: (site: Site) => void;
    removeSite: (identifier: string) => void;
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

    /**
     * Add a monitor to an existing site
     */
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;

    // UI actions for monitor type selection
    setSelectedMonitorType: (siteId: string, monitorType: MonitorType) => void;
    getSelectedMonitorType: (siteId: string) => MonitorType | undefined;
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

            // Selected monitor type per site (UI state, not persisted)
            selectedMonitorTypes: {},

            // Update status initial state
            updateStatus: "idle",
            updateError: null,

            // Derived selector
            getSelectedSite: () => {
                const { sites, selectedSiteId } = get();
                if (!selectedSiteId) return null;
                return sites.find((s) => s.identifier === selectedSiteId) || null;
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

            deleteSite: async (identifier: string) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    await window.electronAPI.removeSite(identifier);
                    state.removeSite(identifier);
                } catch (error) {
                    state.setError(`Failed to remove site: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },

            checkSiteNow: async (identifier: string, monitorType: MonitorType) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.checkSiteNow(identifier, monitorType);
                    // Do NOT call updateSiteStatus here!
                    // The backend will emit 'status-update', which will trigger syncSitesFromBackend and update the store with the full, correct data.
                } catch (error) {
                    state.setError(`Failed to check site: ${(error as Error).message}`);
                    throw error;
                }
            },

            modifySite: async (identifier: string, updates: Partial<Site>) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    await window.electronAPI.updateSite(identifier, updates);
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to update site: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },

            updateSiteCheckInterval: async (identifier: string, monitorType: MonitorType, interval: number) => {
                // Per-monitor check interval update
                const state = get();
                state.clearError();
                try {
                    // Update in backend (update the monitor in the site's monitors array)
                    await window.electronAPI.updateSite(identifier, {
                        monitors: get()
                            .sites.find((site) => site.identifier === identifier)
                            ?.monitors.map((monitor) =>
                                monitor.type === monitorType ? { ...monitor, checkInterval: interval } : monitor
                            ),
                    });
                    await state.syncSitesFromBackend();
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

            startSiteMonitorMonitoring: async (identifier: string, monitorType: MonitorType) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.startMonitoringForSite(identifier, monitorType);
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to start monitoring for monitor: ${(error as Error).message}`);
                    throw error;
                }
            },
            stopSiteMonitorMonitoring: async (identifier: string, monitorType: MonitorType) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.stopMonitoringForSite(identifier, monitorType);
                    await state.syncSitesFromBackend();
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
            addSite: (site: Site) => set((state) => ({ sites: [...state.sites, site] })),
            removeSite: (identifier: string) =>
                set((state) => ({
                    sites: state.sites.filter((site) => site.identifier !== identifier),
                    selectedSiteId:
                        state.selectedSiteId &&
                        state.sites.find((s) => s.identifier === identifier && s.identifier === state.selectedSiteId)
                            ? null
                            : state.selectedSiteId,
                    showSiteDetails:
                        state.selectedSiteId &&
                        state.sites.find((s) => s.identifier === identifier && s.identifier === state.selectedSiteId)
                            ? false
                            : state.showSiteDetails,
                })),
            // updateSiteStatus and updateSite removed: all updates come from backend fetches only

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
                set({ selectedSiteId: site ? site.identifier : null });
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
                window.electronAPI.onStatusUpdate(async (update) => {
                    // Always fetch latest sites/monitors/history from backend for live updates
                    await get().syncSitesFromBackend();
                    // Optionally, call the provided callback for custom logic
                    if (callback) callback(update);
                });
            },
            unsubscribeFromStatusUpdates: () => {
                window.electronAPI.removeAllListeners("status-update");
            },

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
                    if (!site) throw new Error("Site not found");
                    // Prevent duplicate monitor type
                    if (site.monitors.some((m) => m.type === monitor.type)) {
                        throw new Error(`Monitor of type '${monitor.type}' already exists for this site.`);
                    }
                    const updatedMonitors = [...site.monitors, monitor];
                    await window.electronAPI.updateSite(siteId, { monitors: updatedMonitors });
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to add monitor: ${error instanceof Error ? error.message : String(error)}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },
            setSelectedMonitorType: (siteId, monitorType) =>
                set((state) => ({
                    selectedMonitorTypes: {
                        ...state.selectedMonitorTypes,
                        [siteId]: monitorType,
                    },
                })),
            getSelectedMonitorType: (siteId) => {
                const types = get().selectedMonitorTypes || {};
                return types[siteId];
            },
        }),
        {
            name: "uptime-watcher-storage",
            partialize: (state) => ({
                darkMode: state.darkMode,
                settings: state.settings,
                totalUptime: state.totalUptime,
                totalDowntime: state.totalDowntime,
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                showAdvancedMetrics: state.showAdvancedMetrics,
                // Don't persist sites, error states, loading states, or UI states
                // Don't persist selectedMonitorTypes
            }),
        }
    )
);
