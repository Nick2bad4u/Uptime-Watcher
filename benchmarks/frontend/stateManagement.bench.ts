/**
 * State Management Performance Benchmarks
 *
 * @file Performance benchmarks for state management patterns using real Zustand
 *   implementations.
 */

import { bench, describe } from "vitest";
import { createStore } from "zustand";
import type { StoreApi } from "zustand";
import { vi } from "vitest";

// Mock electron API
vi.mock("../../src/services/SettingsService", () => ({
    SettingsService: {
        getHistoryLimit: vi.fn().mockResolvedValue(500),
        setHistoryLimit: vi.fn().mockResolvedValue(undefined),
    },
}));

// Real application state patterns - Sites Store
interface SitesState {
    sites: {
        identifier: string;
        name: string;
        url: string;
        monitors: {
            id: string;
            name: string;
            type: "http" | "ping";
            status: "up" | "down" | "unknown";
        }[];
    }[];
    selectedSiteIdentifier?: string;
    selectedMonitorIds: Record<string, string>;
}

interface SitesActions {
    addSite: (site: SitesState["sites"][0]) => void;
    removeSite: (identifier: string) => void;
    setSites: (sites: SitesState["sites"]) => void;
    selectSite: (siteIdentifier: string | undefined) => void;
    setSelectedMonitorId: (siteIdentifier: string, monitorId: string) => void;
    getSelectedSite: () => SitesState["sites"][0] | undefined;
}

function createSitesStore(): StoreApi<SitesState & SitesActions> {
    return createStore<SitesState & SitesActions>()((set, get) => ({
        sites: [],
        selectedSiteIdentifier: undefined,
        selectedMonitorIds: {},

        addSite: (site) =>
            set((state) => ({
                sites: [...state.sites, site],
            })),

        removeSite: (identifier) =>
            set((state) => ({
                sites: state.sites.filter((s) => s.identifier !== identifier),
                selectedSiteIdentifier:
                    state.selectedSiteIdentifier === identifier
                        ? undefined
                        : state.selectedSiteIdentifier,
            })),

        setSites: (sites) => set({ sites }),

        selectSite: (siteIdentifier) =>
            set({ selectedSiteIdentifier: siteIdentifier }),

        setSelectedMonitorId: (siteIdentifier, monitorId) =>
            set((state) => ({
                selectedMonitorIds: {
                    ...state.selectedMonitorIds,
                    [siteIdentifier]: monitorId,
                },
            })),

        getSelectedSite: () => {
            const { selectedSiteIdentifier, sites } = get();
            return selectedSiteIdentifier
                ? sites.find((s) => s.identifier === selectedSiteIdentifier)
                : undefined;
        },
    }));
}

// Real application state patterns - Settings Store
interface SettingsState {
    settings: {
        theme: "light" | "dark" | "system";
        autoStart: boolean;
        notifications: boolean;
        soundAlerts: boolean;
        minimizeToTray: boolean;
        historyLimit: number;
    };
    isLoading: boolean;
}

interface SettingsActions {
    updateSettings: (updates: Partial<SettingsState["settings"]>) => void;
    resetSettings: () => void;
    setLoading: (loading: boolean) => void;
    initializeSettings: () => Promise<void>;
}

function createSettingsStore(): StoreApi<SettingsState & SettingsActions> {
    const defaultSettings = {
        theme: "system" as const,
        autoStart: false,
        notifications: true,
        soundAlerts: false,
        minimizeToTray: true,
        historyLimit: 500,
    };

    return createStore<SettingsState & SettingsActions>()((set, get) => ({
        settings: defaultSettings,
        isLoading: false,

        updateSettings: (updates) =>
            set((state) => ({
                settings: { ...state.settings, ...updates },
            })),

        resetSettings: () =>
            set({
                settings: defaultSettings,
            }),

        setLoading: (loading) => set({ isLoading: loading }),

        initializeSettings: async () => {
            set({ isLoading: true });
            // Simulate async settings loading
            await new Promise((resolve) => setTimeout(resolve, 10));
            set({ isLoading: false });
        },
    }));
}

// Real application state patterns - UI Store
interface UIState {
    showSettings: boolean;
    showAddSite: boolean;
    activeTab: "sites" | "monitors" | "history";
    theme: "light" | "dark";
    sidebarCollapsed: boolean;
}

interface UIActions {
    setShowSettings: (show: boolean) => void;
    setShowAddSite: (show: boolean) => void;
    setActiveTab: (tab: UIState["activeTab"]) => void;
    setTheme: (theme: UIState["theme"]) => void;
    toggleSidebar: () => void;
    resetUI: () => void;
}

function createUIStore(): StoreApi<UIState & UIActions> {
    const initialState: UIState = {
        showSettings: false,
        showAddSite: false,
        activeTab: "sites",
        theme: "light",
        sidebarCollapsed: false,
    };

    return createStore<UIState & UIActions>()((set) => ({
        ...initialState,

        setShowSettings: (show) => set({ showSettings: show }),
        setShowAddSite: (show) => set({ showAddSite: show }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () =>
            set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        resetUI: () => set(initialState),
    }));
}

// Test data generators
function generateTestSite(index: number) {
    return {
        identifier: `site-${index}`,
        name: `Test Site ${index}`,
        url: `https://example${index}.com`,
        monitors: [
            {
                id: `monitor-${index}-1`,
                name: `HTTP Monitor ${index}`,
                type: "http" as const,
                status: "up" as const,
            },
            {
                id: `monitor-${index}-2`,
                name: `Ping Monitor ${index}`,
                type: "ping" as const,
                status: "unknown" as const,
            },
        ],
    };
}

function generateTestSites(count: number) {
    return Array.from({ length: count }, (_, i) => generateTestSite(i));
}

describe("State Management Performance - Real Zustand Patterns", () => {
    describe("Sites Store Operations", () => {
        bench("Create sites store", () => {
            createSitesStore();
        });

        bench("Add single site", () => {
            const store = createSitesStore();
            const site = generateTestSite(1);
            store.getState().addSite(site);
        });

        bench("Add multiple sites", () => {
            const store = createSitesStore();
            const sites = generateTestSites(50);

            for (const site of sites) {
                store.getState().addSite(site);
            }
        });

        bench("Bulk set sites", () => {
            const store = createSitesStore();
            const sites = generateTestSites(100);
            store.getState().setSites(sites);
        });

        bench("Site selection operations", () => {
            const store = createSitesStore();
            const sites = generateTestSites(10);
            store.getState().setSites(sites);

            // Perform selection operations
            for (let i = 0; i < 10; i++) {
                store
                    .getState()
                    .selectSite(sites[i % sites.length]?.identifier);
                store.getState().getSelectedSite();
            }
        });

        bench("Monitor selection operations", () => {
            const store = createSitesStore();
            const sites = generateTestSites(10);
            store.getState().setSites(sites);

            // Set monitor selections
            for (const site of sites) {
                if (site.monitors[0]) {
                    store
                        .getState()
                        .setSelectedMonitorId(
                            site.identifier,
                            site.monitors[0].id
                        );
                }
            }
        });

        bench("Remove sites performance", () => {
            const store = createSitesStore();
            const sites = generateTestSites(50);
            store.getState().setSites(sites);

            // Remove half the sites
            for (let i = 0; i < 25; i++) {
                store.getState().removeSite(sites[i]?.identifier ?? "");
            }
        });
    });

    describe("Settings Store Operations", () => {
        bench("Create settings store", () => {
            createSettingsStore();
        });

        bench("Settings updates", () => {
            const store = createSettingsStore();

            // Multiple setting updates
            store.getState().updateSettings({ theme: "dark" });
            store.getState().updateSettings({ notifications: false });
            store.getState().updateSettings({ autoStart: true });
            store.getState().updateSettings({ historyLimit: 1000 });
        });

        bench("Bulk settings update", () => {
            const store = createSettingsStore();

            store.getState().updateSettings({
                theme: "dark",
                notifications: false,
                autoStart: true,
                soundAlerts: true,
                minimizeToTray: false,
                historyLimit: 1000,
            });
        });

        bench("Settings reset operation", () => {
            const store = createSettingsStore();

            // Make some changes then reset
            store
                .getState()
                .updateSettings({ theme: "dark", notifications: false });
            store.getState().resetSettings();
        });

        bench("Loading state management", () => {
            const store = createSettingsStore();

            // Simulate loading operations
            for (let i = 0; i < 10; i++) {
                store.getState().setLoading(true);
                store.getState().setLoading(false);
            }
        });
    });

    describe("UI Store Operations", () => {
        bench("Create UI store", () => {
            createUIStore();
        });

        bench("Modal state management", () => {
            const store = createUIStore();

            // Toggle modals
            for (let i = 0; i < 20; i++) {
                store.getState().setShowSettings(true);
                store.getState().setShowSettings(false);
                store.getState().setShowAddSite(true);
                store.getState().setShowAddSite(false);
            }
        });

        bench("Tab switching", () => {
            const store = createUIStore();
            const tabs: UIState["activeTab"][] = [
                "sites",
                "monitors",
                "history",
            ];

            // Switch between tabs
            for (let i = 0; i < 30; i++) {
                store.getState().setActiveTab(tabs[i % tabs.length]!);
            }
        });

        bench("Theme switching", () => {
            const store = createUIStore();

            // Alternate theme
            for (let i = 0; i < 20; i++) {
                store.getState().setTheme(i % 2 === 0 ? "light" : "dark");
            }
        });

        bench("Sidebar toggle operations", () => {
            const store = createUIStore();

            // Toggle sidebar multiple times
            for (let i = 0; i < 50; i++) {
                store.getState().toggleSidebar();
            }
        });

        bench("UI reset operation", () => {
            const store = createUIStore();

            // Make changes then reset
            store.getState().setShowSettings(true);
            store.getState().setActiveTab("history");
            store.getState().setTheme("dark");
            store.getState().toggleSidebar();
            store.getState().resetUI();
        });
    });

    describe("Multi-Store Operations", () => {
        bench("Create multiple stores", () => {
            createSitesStore();
            createSettingsStore();
            createUIStore();
        });

        bench("Cross-store state synchronization", () => {
            const sitesStore = createSitesStore();
            const settingsStore = createSettingsStore();
            const uiStore = createUIStore();

            // Simulate cross-store updates
            const sites = generateTestSites(10);
            sitesStore.getState().setSites(sites);

            // Select a site and update UI
            if (sites[0]) {
                sitesStore.getState().selectSite(sites[0].identifier);
                uiStore.getState().setActiveTab("monitors");
            }

            // Update theme based on settings
            settingsStore.getState().updateSettings({ theme: "dark" });
            uiStore.getState().setTheme("dark");
        });

        bench("Store subscription simulation", () => {
            const sitesStore = createSitesStore();
            const uiStore = createUIStore();

            // Simulate subscription-based updates
            const unsubscribe1 = sitesStore.subscribe(() => {
                // Simulate UI reaction to sites changes
                uiStore.getState().setActiveTab("sites");
            });

            const unsubscribe2 = uiStore.subscribe(() => {
                // Simulate reaction to UI changes
                const state = uiStore.getState();
                if (state.showAddSite) {
                    // Simulate some reaction
                }
            });

            // Trigger updates
            const sites = generateTestSites(5);
            sitesStore.getState().setSites(sites);
            uiStore.getState().setShowAddSite(true);

            unsubscribe1();
            unsubscribe2();
        });
    });

    describe("Large Dataset Operations", () => {
        bench("Large sites dataset operations", () => {
            const store = createSitesStore();
            const largeSites = generateTestSites(500);

            // Set large dataset
            store.getState().setSites(largeSites);

            // Perform various operations
            store.getState().selectSite(largeSites[250]?.identifier);
            store.getState().getSelectedSite();

            // Add more sites
            for (let i = 0; i < 50; i++) {
                store.getState().addSite(generateTestSite(500 + i));
            }
        });

        bench("Frequent state updates", () => {
            const sitesStore = createSitesStore();
            const uiStore = createUIStore();

            // Rapid fire updates
            for (let i = 0; i < 100; i++) {
                sitesStore.getState().selectSite(`site-${i}`);
                uiStore
                    .getState()
                    .setActiveTab(i % 2 === 0 ? "sites" : "monitors");

                if (i % 10 === 0) {
                    sitesStore.getState().addSite(generateTestSite(i));
                }
            }
        });
    });
});
