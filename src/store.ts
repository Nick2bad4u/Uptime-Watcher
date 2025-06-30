/**
 * Zustand store for managing global application state.
 * Handles sites, monitors, settings, UI state, and backend synchronization.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_HISTORY_LIMIT } from "./constants";
import { ThemeName } from "./theme/types";
import { Site, StatusUpdate, Monitor, MonitorType } from "./types";

/** Application update status types */
export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

/**
 * Application settings interface.
 * Contains user preferences and configuration options.
 */
interface AppSettings {
    /** Enable desktop notifications */
    notifications: boolean;
    /** Auto-start monitoring on app launch */
    autoStart: boolean;
    /** Minimize to system tray instead of closing */
    minimizeToTray: boolean;
    /** Current theme name */
    theme: ThemeName;
    /** Enable sound alerts for status changes */
    soundAlerts: boolean;
    /** Maximum number of history records to keep */
    historyLimit: number;
}

/**
 * Main application state interface.
 * Contains all global state including sites, settings, UI state, and actions.
 */
interface AppState {
    // Core data
    /** Array of monitored sites */
    sites: Site[];
    /** Application settings */
    settings: AppSettings;

    // UI state
    /** Whether settings modal is open */
    showSettings: boolean;
    /** Currently selected site identifier */
    selectedSiteId: string | undefined;
    /** Whether site details modal is open */
    showSiteDetails: boolean;

    // Error handling
    /** Last error message to display */
    lastError: string | undefined;
    /** Global loading state */
    isLoading: boolean;

    // Statistics (computed from site data)
    /** Total uptime across all sites */
    totalUptime: number;
    /** Total downtime across all sites */
    totalDowntime: number;

    // Site details UI state (synchronized across components)
    /** Active tab in site details modal */
    activeSiteDetailsTab: string;
    /** Selected time range for charts */
    siteDetailsChartTimeRange: "1h" | "24h" | "7d" | "30d";
    /** Whether to show advanced metrics */
    showAdvancedMetrics: boolean;

    // Per-site selected monitor (UI state, not persisted)
    /** Map of site ID to selected monitor ID */
    selectedMonitorIds: Record<string, string>;

    // Application updates
    /** Current update status */
    updateStatus: UpdateStatus;
    /** Update error message if any */
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
    updateMonitorRetryAttempts: (siteId: string, monitorId: string, retryAttempts: number | undefined) => Promise<void>;
    updateMonitorTimeout: (siteId: string, monitorId: string, timeout: number | undefined) => Promise<void>;
    updateHistoryLimitValue: (limit: number) => Promise<void>;
    // Per-monitor only: monitorType is required
    startSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;
    stopSiteMonitorMonitoring: (siteId: string, monitorId: string) => Promise<void>;

    fullSyncFromBackend: () => Promise<void>;
    syncSitesFromBackend: () => Promise<void>;

    // Internal state actions (used by backend actions)
    setSites: (sites: Site[]) => void;
    addSite: (site: Site) => void;
    removeSite: (identifier: string) => void;
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
    autoStart: false,
    historyLimit: DEFAULT_HISTORY_LIMIT,
    minimizeToTray: true,
    notifications: true,
    soundAlerts: false,
    theme: "system",
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
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
                    if (!site) throw new Error("Site not found");
                    // Allow multiple monitors of the same type (uniqueness is not enforced)
                    const updatedMonitors = [...site.monitors, monitor];
                    await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to add monitor: ${error instanceof Error ? error.message : String(error)}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },
            addSite: (site: Site) => set((state) => ({ sites: [...state.sites, site] })),
            // Update: apply downloaded update and restart
            applyUpdate: () => {
                window.electronAPI.system.quitAndInstall?.();
            },
            checkSiteNow: async (siteId: string, monitorId: string) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.sites.checkSiteNow(siteId, monitorId);
                    // Backend will emit 'status-update', which will trigger optimized incremental update
                } catch (error) {
                    state.setError(`Failed to check site: ${(error as Error).message}`);
                    throw error;
                }
            },
            clearError: () => set({ lastError: undefined }),
            createSite: async (siteData: Omit<Site, "id" | "monitors"> & { monitors?: Monitor[] }) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    // Default to HTTP monitor if none provided
                    const monitors: Monitor[] = (
                        siteData.monitors && siteData.monitors.length > 0
                            ? siteData.monitors
                            : [
                                  {
                                      history: [],
                                      id: crypto.randomUUID(),
                                      monitoring: true,
                                      status: "pending",
                                      type: "http" as MonitorType,
                                  },
                              ]
                    ).map((monitor) => ({
                        ...monitor,
                        id: monitor.id || crypto.randomUUID(),
                        monitoring: typeof monitor.monitoring === "undefined" ? true : monitor.monitoring,
                        status: ["pending", "up", "down"].includes(monitor.status)
                            ? (monitor.status as Monitor["status"])
                            : "pending",
                        type: monitor.type as MonitorType,
                    }));
                    const newSite = await window.electronAPI.sites.addSite({ ...siteData, monitors });
                    state.addSite(newSite);
                } catch (error) {
                    state.setError(`Failed to add site: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },
            // Remove isMonitoring
            deleteSite: async (identifier: string) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    // Stop monitoring for all monitors of this site before deleting
                    const site = state.sites.find((s) => s.identifier === identifier);
                    if (site) {
                        for (const monitor of site.monitors) {
                            try {
                                await window.electronAPI.monitoring.stopMonitoringForSite(identifier, monitor.id);
                            } catch (err) {
                                // Log but do not block deletion if stopping fails (development only)
                                if (process.env.NODE_ENV === "development") {
                                    console.warn(
                                        `Failed to stop monitoring for monitor ${monitor.id} of site ${identifier}:`,
                                        err
                                    );
                                }
                            }
                        }
                    }
                    await window.electronAPI.sites.removeSite(identifier);
                    state.removeSite(identifier);
                } catch (error) {
                    state.setError(`Failed to remove site: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },
            downloadSQLiteBackup: async () => {
                const state = get();
                state.setLoading(true);
                state.clearError();
                try {
                    // Request SQLite file as ArrayBuffer from preload
                    const { buffer, fileName } = await window.electronAPI.data.downloadSQLiteBackup();
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
            fullSyncFromBackend: async () => {
                const state = get();
                // Use syncSitesFromBackend for full refresh scenarios
                await state.syncSitesFromBackend();
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
                        window.electronAPI.sites.getSites(),
                        window.electronAPI.settings.getHistoryLimit(),
                    ]);
                    state.setSites(sites);
                    state.updateSettings({ historyLimit });
                } catch (error) {
                    state.setError(`Failed to initialize app: ${(error as Error).message}`);
                } finally {
                    state.setLoading(false);
                }
            },
            isLoading: false,
            // Error handling initial state
            lastError: undefined,
            modifySite: async (identifier: string, updates: Partial<Site>) => {
                const state = get();
                state.setLoading(true);
                state.clearError();

                try {
                    await window.electronAPI.sites.updateSite(identifier, updates);
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to update site: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },
            removeSite: (identifier: string) =>
                set((state) => ({
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
                    sites: state.sites.filter((site) => site.identifier !== identifier),
                })),
            resetSettings: () =>
                set({
                    settings: defaultSettings,
                }),
            // Selected monitor id per site (UI state, not persisted)
            selectedMonitorIds: {},
            selectedSiteId: undefined,
            // Synchronized UI actions
            setActiveSiteDetailsTab: (tab: string) => set({ activeSiteDetailsTab: tab }),
            // Error handling actions
            setError: (error: string | undefined) => set({ lastError: error }),
            setLoading: (loading: boolean) => set({ isLoading: loading }),
            setSelectedMonitorId: (siteId, monitorId) =>
                set((state) => ({
                    selectedMonitorIds: {
                        ...state.selectedMonitorIds,
                        [siteId]: monitorId,
                    },
                })),
            // Site details actions
            setSelectedSite: (site: Site | undefined) => {
                set({ selectedSiteId: site ? site.identifier : undefined });
            },
            setShowAdvancedMetrics: (show: boolean) => set({ showAdvancedMetrics: show }),
            setShowSettings: (show: boolean) => set({ showSettings: show }),
            setShowSiteDetails: (show: boolean) => set({ showSiteDetails: show }),
            setSiteDetailsChartTimeRange: (range: "1h" | "24h" | "7d" | "30d") =>
                set({ siteDetailsChartTimeRange: range }),
            // Internal state actions (used by backend actions and internal logic)
            setSites: (sites: Site[]) => set({ sites }),
            settings: defaultSettings,
            // updateSiteStatus and updateSite removed: all updates come from backend fetches only
            setUpdateError: (error: string | undefined) => set({ updateError: error }),
            // Update status actions
            setUpdateStatus: (status: UpdateStatus) => set({ updateStatus: status }),
            showAdvancedMetrics: false,
            showSettings: false,
            showSiteDetails: false,
            siteDetailsChartTimeRange: "24h",
            sites: [],
            startSiteMonitorMonitoring: async (siteId: string, monitorId: string) => {
                const state = get();
                state.clearError();
                try {
                    await window.electronAPI.monitoring.startMonitoringForSite(siteId, monitorId);
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
                    await window.electronAPI.monitoring.stopMonitoringForSite(siteId, monitorId);
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to stop monitoring for monitor: ${(error as Error).message}`);
                    throw error;
                }
            },
            subscribeToStatusUpdates: (callback: (update: StatusUpdate) => void) => {
                window.electronAPI.events.onStatusUpdate((update: StatusUpdate) => {
                    const state = get();

                    try {
                        // Smart incremental update - use the payload data directly
                        // This prevents unnecessary full DB fetches on every status update
                        const updatedSites = state.sites.map((site) => {
                            if (site.identifier === update.site.identifier) {
                                // Use the complete updated site data from the backend
                                // This ensures we have the latest monitor status, history, and metadata
                                return { ...update.site };
                            }
                            return site; // Keep other sites unchanged
                        });

                        // Check if the site was actually found and updated
                        const siteFound = state.sites.some((site) => site.identifier === update.site.identifier);

                        if (siteFound) {
                            // Update store state efficiently without loading indicator
                            state.setSites(updatedSites);
                        } else {
                            // Site not found in current state - trigger full sync as fallback
                            // This handles edge cases like new sites added externally
                            if (process.env.NODE_ENV === "development") {
                                console.warn(`Site ${update.site.identifier} not found in store, triggering full sync`);
                            }
                            state.fullSyncFromBackend().catch((error) => {
                                if (process.env.NODE_ENV === "development") {
                                    console.error("Fallback full sync failed:", error);
                                }
                                state.setError("Failed to sync site data");
                            });
                        }

                        // Call the provided callback for custom logic (logging, notifications, etc.)
                        if (callback) callback(update);
                    } catch (error) {
                        console.error("Error processing status update:", error);
                        // Fallback to full sync on any processing error
                        state.fullSyncFromBackend().catch((syncError) => {
                            console.error("Fallback sync after error failed:", syncError);
                            state.setError("Failed to process status update");
                        });
                    }
                });
            },
            syncSitesFromBackend: async () => {
                const state = get();
                state.setLoading(true);
                state.clearError();
                try {
                    const backendSites = await window.electronAPI.sites.getSites();
                    state.setSites(backendSites);
                } catch (error) {
                    state.setError(`Failed to sync sites: ${(error as Error).message}`);
                } finally {
                    state.setLoading(false);
                }
            },
            totalDowntime: 0,
            // Statistics initial state
            totalUptime: 0,
            unsubscribeFromStatusUpdates: () => {
                window.electronAPI.events.removeAllListeners("status-update");
            },
            updateError: undefined,
            updateHistoryLimitValue: async (limit: number) => {
                const state = get();
                state.clearError();
                state.setLoading(true);
                try {
                    // Call backend to update and prune history
                    await window.electronAPI.settings.updateHistoryLimit(limit);
                    // Reload the value from backend to ensure sync
                    const newLimit = await window.electronAPI.settings.getHistoryLimit();
                    state.updateSettings({ historyLimit: newLimit });
                } catch (error) {
                    state.setError(`Failed to update history limit: ${(error as Error).message}`);
                    throw error;
                } finally {
                    state.setLoading(false);
                }
            },
            updateMonitorRetryAttempts: async (
                siteId: string,
                monitorId: string,
                retryAttempts: number | undefined
            ) => {
                const state = get();
                state.clearError();
                try {
                    // Update in backend (update the monitor in the site's monitors array)
                    const site = get().sites.find((s) => s.identifier === siteId);
                    if (!site) throw new Error("Site not found");
                    const updatedMonitors = site.monitors.map((monitor) =>
                        monitor.id === monitorId ? { ...monitor, retryAttempts: retryAttempts } : monitor
                    );
                    await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to update monitor retry attempts: ${(error as Error).message}`);
                    throw error;
                }
            },
            updateMonitorTimeout: async (siteId: string, monitorId: string, timeout: number | undefined) => {
                const state = get();
                state.clearError();
                try {
                    // Update in backend (update the monitor in the site's monitors array)
                    const site = get().sites.find((s) => s.identifier === siteId);
                    if (!site) throw new Error("Site not found");
                    const updatedMonitors = site.monitors.map((monitor) =>
                        monitor.id === monitorId ? { ...monitor, timeout: timeout } : monitor
                    );
                    await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to update monitor timeout: ${(error as Error).message}`);
                    throw error;
                }
            },
            updateSettings: (newSettings: Partial<AppSettings>) =>
                set((state) => {
                    const updatedSettings = { ...state.settings, ...newSettings };
                    return {
                        settings: updatedSettings,
                    };
                }),
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
                    await window.electronAPI.sites.updateSite(siteId, { monitors: updatedMonitors });
                    await state.syncSitesFromBackend();
                } catch (error) {
                    state.setError(`Failed to update monitor check interval: ${(error as Error).message}`);
                    throw error;
                }
            },
            // Update status initial state
            updateStatus: "idle",
        }),
        {
            name: "uptime-watcher-storage",
            partialize: (state) => ({
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                settings: state.settings,
                showAdvancedMetrics: state.showAdvancedMetrics,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                totalDowntime: state.totalDowntime,
                totalUptime: state.totalUptime,
                // Don't persist sites, error states, loading states, or UI states
                // Don't persist selectedMonitorIds
            }),
        }
    )
);
