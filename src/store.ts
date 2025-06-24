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
    selectedSiteId: string | undefined; // Store only the identifier
    showSiteDetails: boolean;

    // Error handling
    lastError: string | undefined;
    isLoading: boolean;

    // Statistics
    totalUptime: number;
    totalDowntime: number;

    // Synchronized UI state for SiteDetails
    activeSiteDetailsTab: string; // Was: "overview" | "analytics" | "history" | "settings"
    siteDetailsChartTimeRange: "1h" | "24h" | "7d" | "30d";
    showAdvancedMetrics: boolean;

    // Selected monitor id per site (UI state, not persisted)
    selectedMonitorIds: Record<string, string>;

    // Update status
    updateStatus: UpdateStatus;
    updateError: string | undefined;

    // Derived selector
    getSelectedSite: () => Site | undefined;

    // Actions - Backend integration
    initializeApp: () => Promise<void>;
    createSite: (siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }) => Promise<void>;
    deleteSite: (identifier: string) => Promise<void>;
    checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
    modifySite: (identifier: string, updates: Partial<Site>) => Promise<void>;
    updateSiteCheckInterval: (siteId: string, monitorId: string, interval: number) => Promise<void>;
    updateHistoryLimitValue: (limit: number) => Promise<void>;
    // Per-monitor only: monitorType is required
    startSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;
    stopSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;

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
    setSelectedSite: (site: Site | undefined) => void;
    setShowSiteDetails: (show: boolean) => void;

    // Error handling actions
    setError: (error: string | undefined) => void;
    setLoading: (loading: boolean) => void;
    clearError: () => void;

    // Synchronized UI actions
    setActiveSiteDetailsTab: (tab: string) => void; // Was: (tab: "overview" | "analytics" | "history" | "settings") => void;
    setSiteDetailsChartTimeRange: (range: "1h" | "24h" | "7d" | "30d") => void;
    setShowAdvancedMetrics: (show: boolean) => void;

    // Update status actions
    setUpdateStatus: (status: UpdateStatus) => void;
    setUpdateError: (error: string | undefined) => void;
    // Update: apply downloaded update and restart
    applyUpdate: () => void;
    subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => void;
    unsubscribeFromStatusUpdates: () => void;

    /**
     * Add a monitor to an existing site
     */
    addMonitorToSite: (siteId: string, monitor: Monitor) => Promise<void>;

    // UI actions for monitor id selection
    setSelectedMonitorId: (siteId: string, monitorId: string) => void;
    getSelectedMonitorId: (siteId: string) => string | undefined;

    downloadSQLiteBackup: () => Promise<void>;
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
            selectedSiteId: undefined,
            showSiteDetails: false,

            // Error handling initial state
            lastError: undefined,
            isLoading: false,

            // Statistics initial state
            totalUptime: 0,
            totalDowntime: 0,

            // Synchronized UI state for SiteDetails
            activeSiteDetailsTab: "overview",
            siteDetailsChartTimeRange: "24h",
            showAdvancedMetrics: false,

            // Selected monitor id per site (UI state, not persisted)
            selectedMonitorIds: {},

            // Update status initial state
            updateStatus: "idle",
            updateError: undefined,

            // Derived selector
            getSelectedSite: () => {
                const { sites, selectedSiteId } = get();
                if (!selectedSiteId) return undefined;
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
                    const monitors: Monitor[] = (siteData.monitors && siteData.monitors.length > 0
                        ? siteData.monitors
                        : [{
                            id: crypto.randomUUID(),
                            type: "http" as MonitorType,
                            status: "pending",
                            history: [],
                            monitoring: true
                        }]
                    ).map((monitor) => ({
                        ...monitor,
                        id: monitor.id || crypto.randomUUID(),
                        monitoring: typeof monitor.monitoring === "undefined" ? true : monitor.monitoring,
                        type: monitor.type as MonitorType,
                        status: ["pending", "up", "down"].includes(monitor.status)
                            ? (monitor.status as Monitor["status"])
                            : "pending"
                    }));
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

            checkSiteNow: async (siteId: string, monitorId: string) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.checkSiteNow(siteId, monitorId);
                    // Backend will emit 'status-update', which will trigger syncSitesFromBackend
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

            updateSiteCheckInterval: async (siteId: string, monitorId: string, interval: number) => {
                const state = get();
                state.clearError();
                try {
                    // Update in backend (update the monitor in the site's monitors array)
                    const site = get().sites.find((s) => s.identifier === siteId);
                    if (!site) throw new Error("Site not found");
                    const updatedMonitors = site.monitors.map((monitor) =>
                        monitor.id === monitorId ? { ...monitor, checkInterval: interval } : monitor
                    );
                    await window.electronAPI.updateSite(siteId, { monitors: updatedMonitors });
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to update monitor check interval: ${(error as Error).message}`);
                    throw error;
                }
            },
            updateHistoryLimitValue: async (limit: number) => {
                const state = get();
                state.clearError();
                state.setLoading(true);
                try {
                    // Call backend to update and prune history
                    await window.electronAPI.updateHistoryLimit(limit);
                    // Reload the value from backend to ensure sync
                    const newLimit = await window.electronAPI.getHistoryLimit();
                    state.updateSettings({ historyLimit: newLimit });
                } catch (error) {
                    state.setError(`Failed to update history limit: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },

            startSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.startMonitoringForSite(siteId, monitorId);
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to start monitoring for monitor: ${(error as Error).message}`);
                    throw error;
                }
            },
            stopSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.stopMonitoringForSite(siteId, monitorId);
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to stop monitoring for monitor: ${(error as Error).message}`);
                    throw error;
                }
            },

            downloadSQLiteBackup: async () => {
                const state = get();
                state.setLoading(true);
                state.clearError();
                try {
                    // Request SQLite file as ArrayBuffer from preload
                    const { buffer, fileName } = await window.electronAPI.downloadSQLiteBackup();
                    if (!buffer) throw new Error("No backup data received");
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
                } catch (error) {
                    state.setError(`Failed to download SQLite backup: ${(error as Error).message}`);
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
                            ? undefined
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
            setSelectedSite: (site: Site | undefined) => {
                set({ selectedSiteId: site ? site.identifier : undefined });
            },

            setShowSiteDetails: (show: boolean) => set({ showSiteDetails: show }),

            // Error handling actions
            setError: (error: string | undefined) => set({ lastError: error }),

            setLoading: (loading: boolean) => set({ isLoading: loading }),

            clearError: () => set({ lastError: undefined }),

            // Synchronized UI actions
            setActiveSiteDetailsTab: (tab: string) => set({ activeSiteDetailsTab: tab }),
            setSiteDetailsChartTimeRange: (range: "1h" | "24h" | "7d" | "30d") =>
                set({ siteDetailsChartTimeRange: range }),
            setShowAdvancedMetrics: (show: boolean) => set({ showAdvancedMetrics: show }),

            // Update status actions
            setUpdateStatus: (status: UpdateStatus) => set({ updateStatus: status }),
            setUpdateError: (error: string | undefined) => set({ updateError: error }),
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
                    // Allow multiple monitors of the same type (uniqueness is not enforced)
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
            setSelectedMonitorId: (siteId, monitorId) =>
                set((state) => ({
                    selectedMonitorIds: {
                        ...state.selectedMonitorIds,
                        [siteId]: monitorId,
                    },
                })),
            getSelectedMonitorId: (siteId) => {
                const ids = get().selectedMonitorIds || {};
                return ids[siteId];
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
                // Don't persist selectedMonitorIds
            }),
        }
    )
);

declare global {
    interface Window {
        electronAPI: {
            getSites: () => Promise<Site[]>;
            getHistoryLimit: () => Promise<number>;
            updateHistoryLimit: (limit: number) => Promise<void>;
            addSite: (site: Omit<Site, "id">) => Promise<Site>;
            removeSite: (id: string) => Promise<void>;
            updateSite: (id: string, updates: Partial<Site>) => Promise<void>;
            checkSiteNow: (siteId: string, monitorId: string) => Promise<void>;
            startMonitoringForSite: (siteId: string, monitorId: string) => Promise<void>;
            stopMonitoringForSite: (siteId: string, monitorId: string) => Promise<void>;
            exportData: () => Promise<string>;
            importData: (data: string) => Promise<boolean>;
            downloadSQLiteBackup: () => Promise<{ buffer: ArrayBuffer; fileName: string }>;
            onStatusUpdate: (callback: (update: StatusUpdate) => void) => void;
            removeAllListeners: (event: string) => void;
            quitAndInstall: () => void;
        };
    }
}
