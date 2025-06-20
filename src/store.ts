import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Site, StatusUpdate } from "./types";

interface AppSettings {
  notifications: boolean;
  autoStart: boolean;
  minimizeToTray: boolean;
  theme: "light" | "dark" | "system";
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
      checkInterval: 60000, // 1 minute
      darkMode: false,
      settings: defaultSettings,
      showSettings: false,

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
    }),
    {
      name: "uptime-watcher-storage",
      partialize: (state) => ({
        checkInterval: state.checkInterval,
        darkMode: state.darkMode,
        settings: state.settings,
      }),
    },
  ),
);
