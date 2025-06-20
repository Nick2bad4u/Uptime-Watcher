import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Site, StatusUpdate } from "./types";
import { ThemeName } from "./theme/types";
import { DEFAULT_CHECK_INTERVAL } from "./constants";

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

    // Actions
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
}

const defaultSettings: AppSettings = {
    notifications: true,
    autoStart: false,
    minimizeToTray: true,
    theme: "system",
    timeout: 10000,
    maxRetries: 3,
    soundAlerts: false,
    historyLimit: 100,
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
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

            setSites: (sites: Site[]) => set({ sites }),

            addSite: (site: Site) =>
                set((state) => {
                    const newSites = [...state.sites, site];
                    // Force persistence by updating the state
                    return {
                        sites: newSites,
                    };
                }),

            removeSite: (url: string) =>
                set((state) => ({
                    sites: state.sites.filter((site) => site.url !== url),
                    // Clear selected site if it's being removed
                    selectedSite: state.selectedSite?.url === url ? null : state.selectedSite,
                    showSiteDetails: state.selectedSite?.url === url ? false : state.showSiteDetails,
                })),

            updateSiteStatus: (update: StatusUpdate) =>
                set((state) => {
                    const updatedSites = state.sites.map((site) => (site.url === update.site.url ? update.site : site));

                    // Update selected site if it matches
                    const updatedSelectedSite =
                        state.selectedSite?.url === update.site.url ? update.site : state.selectedSite;

                    // Calculate uptime/downtime statistics
                    const allHistory = updatedSites.flatMap((site) => site.history);
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
                    const updatedSites = state.sites.map((site) =>
                        site.url === url ? { ...site, ...updates } : site
                    );

                    // Update selected site if it matches
                    const updatedSelectedSite =
                        state.selectedSite?.url === url
                            ? { ...state.selectedSite, ...updates }
                            : state.selectedSite;

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
                // Don't persist error states, loading states, or UI states
            }),
        }
    )
);
