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
}

interface AppState {
  sites: Site[];
  isMonitoring: boolean;
  checkInterval: number;
  darkMode: boolean;
  settings: AppSettings;
  showSettings: boolean;

  // Site details view
  selectedSite: Site | null;
  showSiteDetails: boolean;

  // Error handling
  lastError: string | null;
  isLoading: boolean;

  // Actions
  setSites: (sites: Site[]) => void;
  addSite: (site: Site) => void;
  removeSite: (url: string) => void;
  updateSiteStatus: (update: StatusUpdate) => void;
  setMonitoring: (isMonitoring: boolean) => void;
  setCheckInterval: (interval: number) => void;
  toggleDarkMode: () => void;
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

      setSites: (sites: Site[]) => set({ sites }),

      addSite: (site: Site) =>
        set((state) => ({
          sites: [...state.sites, site],
        })),

      removeSite: (url: string) =>
        set((state) => ({
          sites: state.sites.filter((site) => site.url !== url),
        })),

      updateSiteStatus: (update: StatusUpdate) =>
        set((state) => ({
          sites: state.sites.map((site) =>
            site.url === update.site.url ? update.site : site,
          ),
        })),

      setMonitoring: (isMonitoring: boolean) => set({ isMonitoring }),

      setCheckInterval: (interval: number) => set({ checkInterval: interval }),

      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      updateSettings: (newSettings: Partial<AppSettings>) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setShowSettings: (show: boolean) => set({ showSettings: show }),

      resetSettings: () => set({ settings: defaultSettings }),

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
        // Don't persist error states
      }),
    },
  ),
);
