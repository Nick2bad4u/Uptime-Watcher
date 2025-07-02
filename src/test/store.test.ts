/**
 * Test suite for Zustand store
 * Tests state management, actions, persistence, and backend integration
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_HISTORY_LIMIT } from "../constants";
import { useStore } from "../store";
import { Site, Monitor, MonitorType, StatusUpdate } from "../types";

// Mock the electron API
const mockElectronAPI = {
    sites: {
        addSite: vi.fn(),
        updateSite: vi.fn(),
        removeSite: vi.fn(),
        getSites: vi.fn(),
        checkSiteNow: vi.fn(),
        updateCheckInterval: vi.fn(),
        updateRetryAttempts: vi.fn(),
        updateTimeout: vi.fn(),
        addMonitor: vi.fn(),
    },
    monitoring: {
        startMonitoringForSite: vi.fn(),
        stopMonitoringForSite: vi.fn(),
    },
    settings: {
        getSettings: vi.fn(),
        updateSettings: vi.fn(),
        updateHistoryLimit: vi.fn(),
        getHistoryLimit: vi.fn(),
        downloadBackup: vi.fn(),
    },
    system: {
        quitAndInstall: vi.fn(),
    },
    events: {
        onStatusUpdate: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    data: {
        exportData: vi.fn(),
        importData: vi.fn(),
        downloadSQLiteBackup: vi.fn(),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
    value: {
        randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 11)),
    },
});

describe("Store", () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        
        // Reset store state
        useStore.setState({
            sites: [],
            settings: {
                autoStart: false,
                historyLimit: DEFAULT_HISTORY_LIMIT,
                minimizeToTray: true,
                notifications: true,
                soundAlerts: false,
                theme: "system",
            },
            showSettings: false,
            selectedSiteId: undefined,
            showSiteDetails: false,
            lastError: undefined,
            isLoading: false,
            totalUptime: 0,
            totalDowntime: 0,
            activeSiteDetailsTab: "overview",
            siteDetailsChartTimeRange: "24h",
            showAdvancedMetrics: false,
            selectedMonitorIds: {},
            updateStatus: "idle",
            updateError: undefined,
        });
    });

    describe("Initial State", () => {
        it("has correct default state", () => {
            const state = useStore.getState();
            
            expect(state.sites).toEqual([]);
            expect(state.settings).toEqual({
                autoStart: false,
                historyLimit: DEFAULT_HISTORY_LIMIT,
                minimizeToTray: true,
                notifications: true,
                soundAlerts: false,
                theme: "system",
            });
            expect(state.showSettings).toBe(false);
            expect(state.selectedSiteId).toBeUndefined();
            expect(state.showSiteDetails).toBe(false);
            expect(state.lastError).toBeUndefined();
            expect(state.isLoading).toBe(false);
            expect(state.activeSiteDetailsTab).toBe("overview");
            expect(state.siteDetailsChartTimeRange).toBe("24h");
            expect(state.showAdvancedMetrics).toBe(false);
            expect(state.updateStatus).toBe("idle");
        });
    });

    describe("Basic State Actions", () => {
        it("sets sites correctly", () => {
            const mockSites: Site[] = [
                {
                    identifier: "site1",
                    name: "Test Site",
                    monitors: [],
                },
            ];
            
            useStore.getState().setSites(mockSites);
            
            expect(useStore.getState().sites).toEqual(mockSites);
        });

        it("adds site correctly", () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [],
            };
            
            useStore.getState().addSite(mockSite);
            
            expect(useStore.getState().sites).toContain(mockSite);
        });

        it("removes site by identifier", () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [],
            };
            
            useStore.getState().setSites([mockSite]);
            useStore.getState().removeSite("site1");
            
            expect(useStore.getState().sites).toHaveLength(0);
        });

        it("updates settings correctly", () => {
            const updates = { notifications: false, theme: "dark" as const };
            
            useStore.getState().updateSettings(updates);
            
            const settings = useStore.getState().settings;
            expect(settings.notifications).toBe(false);
            expect(settings.theme).toBe("dark");
            expect(settings.autoStart).toBe(false); // unchanged
        });

        it("resets settings to defaults", () => {
            // First change settings
            useStore.getState().updateSettings({ notifications: false, autoStart: true });
            
            // Then reset
            useStore.getState().resetSettings();
            
            const settings = useStore.getState().settings;
            expect(settings).toEqual({
                autoStart: false,
                historyLimit: DEFAULT_HISTORY_LIMIT,
                minimizeToTray: true,
                notifications: true,
                soundAlerts: false,
                theme: "system",
            });
        });
    });

    describe("UI State Actions", () => {
        it("manages settings modal visibility", () => {
            useStore.getState().setShowSettings(true);
            expect(useStore.getState().showSettings).toBe(true);
            
            useStore.getState().setShowSettings(false);
            expect(useStore.getState().showSettings).toBe(false);
        });

        it("manages site details modal visibility", () => {
            useStore.getState().setShowSiteDetails(true);
            expect(useStore.getState().showSiteDetails).toBe(true);
            
            useStore.getState().setShowSiteDetails(false);
            expect(useStore.getState().showSiteDetails).toBe(false);
        });

        it("sets active site details tab", () => {
            useStore.getState().setActiveSiteDetailsTab("analytics");
            expect(useStore.getState().activeSiteDetailsTab).toBe("analytics");
        });

        it("sets site details chart time range", () => {
            useStore.getState().setSiteDetailsChartTimeRange("7d");
            expect(useStore.getState().siteDetailsChartTimeRange).toBe("7d");
        });

        it("toggles advanced metrics visibility", () => {
            useStore.getState().setShowAdvancedMetrics(true);
            expect(useStore.getState().showAdvancedMetrics).toBe(true);
            
            useStore.getState().setShowAdvancedMetrics(false);
            expect(useStore.getState().showAdvancedMetrics).toBe(false);
        });

        it("manages selected monitor IDs", () => {
            useStore.getState().setSelectedMonitorId("site1", "monitor1");
            expect(useStore.getState().getSelectedMonitorId("site1")).toBe("monitor1");
            
            expect(useStore.getState().getSelectedMonitorId("nonexistent")).toBeUndefined();
        });
    });

    describe("Error Handling", () => {
        it("sets and clears errors", () => {
            useStore.getState().setError("Test error");
            expect(useStore.getState().lastError).toBe("Test error");
            
            useStore.getState().clearError();
            expect(useStore.getState().lastError).toBeUndefined();
        });

        it("manages loading state", () => {
            useStore.getState().setLoading(true);
            expect(useStore.getState().isLoading).toBe(true);
            
            useStore.getState().setLoading(false);
            expect(useStore.getState().isLoading).toBe(false);
        });
    });

    describe("Update Status", () => {
        it("manages update status", () => {
            useStore.getState().setUpdateStatus("checking");
            expect(useStore.getState().updateStatus).toBe("checking");
            
            useStore.getState().setUpdateStatus("available");
            expect(useStore.getState().updateStatus).toBe("available");
        });

        it("manages update errors", () => {
            useStore.getState().setUpdateError("Update failed");
            expect(useStore.getState().updateError).toBe("Update failed");
            
            useStore.getState().setUpdateError(undefined);
            expect(useStore.getState().updateError).toBeUndefined();
        });

        it("calls electronAPI for apply update", () => {
            useStore.getState().applyUpdate();
            expect(mockElectronAPI.system.quitAndInstall).toHaveBeenCalled();
        });
    });

    describe("Selected Site Selector", () => {
        it("returns undefined when no site selected", () => {
            const selectedSite = useStore.getState().getSelectedSite();
            expect(selectedSite).toBeUndefined();
        });

        it("returns correct site when selected", () => {
            const mockSite: Site = {
                identifier: "site1", 
                name: "Test Site",
                monitors: [],
            };
            
            useStore.getState().setSites([mockSite]);
            useStore.getState().setSelectedSite(mockSite);
            
            const selectedSite = useStore.getState().getSelectedSite();
            expect(selectedSite).toEqual(mockSite);
        });

        it("handles selected site being removed", () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site", 
                monitors: [],
            };
            
            useStore.getState().setSites([mockSite]);
            useStore.getState().setSelectedSite(mockSite);
            useStore.getState().removeSite("site1");
            
            const selectedSite = useStore.getState().getSelectedSite();
            expect(selectedSite).toBeUndefined();
        });
    });

    describe("Backend Integration Actions", () => {
        it("creates site with default monitor", async () => {
            const siteData = {
                identifier: "new-site",
                name: "New Site",
                url: "https://new-site.com",
            };
            
            const expectedSite = {
                ...siteData,
                monitors: expect.arrayContaining([
                    expect.objectContaining({
                        type: "http",
                        status: "pending",
                        monitoring: true,
                    }),
                ]),
            };
            
            mockElectronAPI.sites.addSite.mockResolvedValue(expectedSite);
            
            await useStore.getState().createSite(siteData);
            
            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith({
                ...siteData,
                monitors: expect.arrayContaining([
                    expect.objectContaining({
                        type: "http",
                        status: "pending",
                        monitoring: true,
                    }),
                ]),
            });
            
            expect(useStore.getState().sites).toContainEqual(expectedSite);
        });

        it("creates site with custom monitors", async () => {
            const customMonitor: Monitor = {
                id: "custom-monitor",
                type: "port" as MonitorType,
                status: "up",
                monitoring: false,
                history: [],
                port: 8080,
            };
            
            const siteData = {
                identifier: "new-site",
                name: "New Site", 
                url: "https://new-site.com",
                monitors: [customMonitor],
            };
            
            const expectedSite = { ...siteData, id: "new-site" };
            mockElectronAPI.sites.addSite.mockResolvedValue(expectedSite);
            
            await useStore.getState().createSite(siteData);
            
            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(siteData);
        });

        it("handles create site error", async () => {
            const siteData = {
                identifier: "error-site",
                name: "Error Site",
                url: "https://error-site.com",
            };
            
            mockElectronAPI.sites.addSite.mockRejectedValue(new Error("Creation failed"));
            
            await expect(useStore.getState().createSite(siteData)).rejects.toThrow("Creation failed");
            expect(useStore.getState().lastError).toContain("Failed to add site");
            expect(useStore.getState().isLoading).toBe(false);
        });

        it("deletes site correctly", async () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [],
            };
            
            useStore.getState().setSites([mockSite]);
            mockElectronAPI.sites.removeSite.mockResolvedValue(undefined);
            
            await useStore.getState().deleteSite("site1");
            
            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith("site1");
            expect(useStore.getState().sites).toHaveLength(0);
        });

        it("handles delete site error", async () => {
            mockElectronAPI.sites.removeSite.mockRejectedValue(new Error("Delete failed"));
            
            await expect(useStore.getState().deleteSite("site1")).rejects.toThrow("Delete failed");
            expect(useStore.getState().lastError).toContain("Failed to remove site");
        });

        it("checks site now", async () => {
            mockElectronAPI.sites.checkSiteNow.mockResolvedValue(undefined);
            
            await useStore.getState().checkSiteNow("site1", "monitor1");
            
            expect(mockElectronAPI.sites.checkSiteNow).toHaveBeenCalledWith("site1", "monitor1");
        });

        it("handles check site error", async () => {
            mockElectronAPI.sites.checkSiteNow.mockRejectedValue(new Error("Check failed"));
            
            await expect(useStore.getState().checkSiteNow("site1", "monitor1")).rejects.toThrow("Check failed");
            expect(useStore.getState().lastError).toContain("Failed to check site");
        });
    });

    describe("Subscription Management", () => {
        it("manages status update subscriptions", () => {
            const callback = vi.fn();
            
            useStore.getState().subscribeToStatusUpdates(callback);
            expect(mockElectronAPI.events.onStatusUpdate).toHaveBeenCalledWith(expect.any(Function));
            
            useStore.getState().unsubscribeFromStatusUpdates();
            expect(mockElectronAPI.events.removeAllListeners).toHaveBeenCalledWith("status-update");
        });
    });

    describe("Advanced Backend Integration", () => {
        beforeEach(() => {
            // Setup default resolved values for mocks
            mockElectronAPI.sites.getSites.mockResolvedValue([]);
            mockElectronAPI.settings.getHistoryLimit = vi.fn().mockResolvedValue(DEFAULT_HISTORY_LIMIT);
        });

        it("initializes app correctly", async () => {
            const mockSites: Site[] = [
                {
                    identifier: "site1",
                    name: "Test Site",
                    monitors: [],
                },
            ];
            
            mockElectronAPI.sites.getSites.mockResolvedValue(mockSites);
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(1000);
            
            await useStore.getState().initializeApp();
            
            expect(mockElectronAPI.sites.getSites).toHaveBeenCalled();
            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();
            expect(useStore.getState().sites).toEqual(mockSites);
            expect(useStore.getState().settings.historyLimit).toBe(1000);
            expect(useStore.getState().isLoading).toBe(false);
        });

        it("handles initialization error", async () => {
            mockElectronAPI.sites.getSites.mockRejectedValue(new Error("Init failed"));
            
            await useStore.getState().initializeApp();
            
            expect(useStore.getState().lastError).toContain("Failed to initialize app");
            expect(useStore.getState().isLoading).toBe(false);
        });

        it("syncs sites from backend", async () => {
            const mockSites: Site[] = [
                {
                    identifier: "sync-site",
                    name: "Sync Site",
                    monitors: [],
                },
            ];
            
            mockElectronAPI.sites.getSites.mockResolvedValue(mockSites);
            
            await useStore.getState().syncSitesFromBackend();
            
            expect(mockElectronAPI.sites.getSites).toHaveBeenCalled();
            expect(useStore.getState().sites).toEqual(mockSites);
            expect(useStore.getState().isLoading).toBe(false);
        });

        it("handles sync error", async () => {
            mockElectronAPI.sites.getSites.mockRejectedValue(new Error("Sync failed"));
            
            await useStore.getState().syncSitesFromBackend();
            
            expect(useStore.getState().lastError).toContain("Failed to sync sites");
            expect(useStore.getState().isLoading).toBe(false);
        });

        it("performs full sync from backend", async () => {
            const syncSpy = vi.spyOn(useStore.getState(), "syncSitesFromBackend");
            
            await useStore.getState().fullSyncFromBackend();
            
            expect(syncSpy).toHaveBeenCalled();
        });

        it("modifies site correctly", async () => {
            const mockSite: Site = {
                identifier: "modify-site",
                name: "Original Name",
                monitors: [],
            };
            
            useStore.getState().setSites([mockSite]);
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);
            mockElectronAPI.sites.getSites.mockResolvedValue([
                { ...mockSite, name: "Updated Name" },
            ]);
            
            const updates = { name: "Updated Name" };
            await useStore.getState().modifySite("modify-site", updates);
            
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("modify-site", updates);
        });

        it("handles modify site error", async () => {
            mockElectronAPI.sites.updateSite.mockRejectedValue(new Error("Modify failed"));
            
            await expect(useStore.getState().modifySite("site1", {})).rejects.toThrow("Modify failed");
            expect(useStore.getState().lastError).toContain("Failed to update site");
        });
    });

    describe("Monitor Management", () => {
        beforeEach(() => {
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);
            mockElectronAPI.sites.getSites.mockResolvedValue([]);
        });

        it("adds monitor to site", async () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [],
            };
            
            const newMonitor: Monitor = {
                id: "monitor1",
                type: "http",
                status: "pending",
                history: [],
            };
            
            useStore.getState().setSites([mockSite]);
            
            await useStore.getState().addMonitorToSite("site1", newMonitor);
            
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("site1", {
                monitors: [newMonitor],
            });
        });

        it("handles add monitor to non-existent site", async () => {
            const newMonitor: Monitor = {
                id: "monitor1",
                type: "http",
                status: "pending",
                history: [],
            };
            
            await expect(useStore.getState().addMonitorToSite("nonexistent", newMonitor))
                .rejects.toThrow("Site not found");
            expect(useStore.getState().lastError).toContain("Failed to add monitor");
        });

        it("starts monitoring for site monitor", async () => {
            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValue(undefined);
            
            await useStore.getState().startSiteMonitorMonitoring("site1", "monitor1");
            
            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith("site1", "monitor1");
        });

        it("handles start monitoring error", async () => {
            mockElectronAPI.monitoring.startMonitoringForSite.mockRejectedValue(new Error("Start failed"));
            
            await expect(useStore.getState().startSiteMonitorMonitoring("site1", "monitor1"))
                .rejects.toThrow("Start failed");
            expect(useStore.getState().lastError).toContain("Failed to start monitoring");
        });

        it("stops monitoring for site monitor", async () => {
            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(undefined);
            
            await useStore.getState().stopSiteMonitorMonitoring("site1", "monitor1");
            
            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith("site1", "monitor1");
        });

        it("handles stop monitoring error", async () => {
            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValue(new Error("Stop failed"));
            
            await expect(useStore.getState().stopSiteMonitorMonitoring("site1", "monitor1"))
                .rejects.toThrow("Stop failed");
            expect(useStore.getState().lastError).toContain("Failed to stop monitoring");
        });

        it("updates site check interval", async () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "pending",
                        history: [],
                        checkInterval: 30000,
                    },
                ],
            };
            
            useStore.getState().setSites([mockSite]);
            
            await useStore.getState().updateSiteCheckInterval("site1", "monitor1", 60000);
            
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("site1", {
                monitors: [
                    expect.objectContaining({
                        id: "monitor1",
                        checkInterval: 60000,
                    }),
                ],
            });
        });

        it("handles update check interval for non-existent site", async () => {
            await expect(useStore.getState().updateSiteCheckInterval("nonexistent", "monitor1", 60000))
                .rejects.toThrow("Site not found");
            expect(useStore.getState().lastError).toContain("Failed to update monitor check interval");
        });

        it("updates monitor retry attempts", async () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "pending",
                        history: [],
                        retryAttempts: 3,
                    },
                ],
            };
            
            useStore.getState().setSites([mockSite]);
            
            await useStore.getState().updateMonitorRetryAttempts("site1", "monitor1", 5);
            
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("site1", {
                monitors: [
                    expect.objectContaining({
                        id: "monitor1",
                        retryAttempts: 5,
                    }),
                ],
            });
        });

        it("updates monitor timeout", async () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "pending",
                        history: [],
                        timeout: 10000,
                    },
                ],
            };
            
            useStore.getState().setSites([mockSite]);
            
            await useStore.getState().updateMonitorTimeout("site1", "monitor1", 15000);
            
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("site1", {
                monitors: [
                    expect.objectContaining({
                        id: "monitor1",
                        timeout: 15000,
                    }),
                ],
            });
        });
    });

    describe("Settings Management", () => {
        beforeEach(() => {
            mockElectronAPI.settings.updateHistoryLimit = vi.fn().mockResolvedValue(undefined);
            mockElectronAPI.settings.getHistoryLimit = vi.fn().mockResolvedValue(500);
        });

        it("updates history limit value", async () => {
            await useStore.getState().updateHistoryLimitValue(500);
            
            expect(mockElectronAPI.settings.updateHistoryLimit).toHaveBeenCalledWith(500);
            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();
            expect(useStore.getState().settings.historyLimit).toBe(500);
        });

        it("handles update history limit error", async () => {
            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(new Error("Update failed"));
            
            await expect(useStore.getState().updateHistoryLimitValue(500))
                .rejects.toThrow("Update failed");
            expect(useStore.getState().lastError).toContain("Failed to update history limit");
        });
    });

    describe("Data Export/Import", () => {
        beforeEach(() => {
            // Mock DOM methods
            const mockElement = {
                click: vi.fn(),
                remove: vi.fn(),
            };
            
            Object.defineProperty(document, "createElement", {
                value: vi.fn(() => mockElement),
                writable: true,
            });
            
            Object.defineProperty(document.body, "appendChild", {
                value: vi.fn(),
                writable: true,
            });
            
            Object.defineProperty(document.body, "removeChild", {
                value: vi.fn(),
                writable: true,
            });
            
            Object.defineProperty(URL, "createObjectURL", {
                value: vi.fn(() => "blob:mock-url"),
                writable: true,
            });
            
            Object.defineProperty(URL, "revokeObjectURL", {
                value: vi.fn(),
                writable: true,
            });
        });

        it("downloads SQLite backup", async () => {
            const mockBuffer = new ArrayBuffer(100);
            const mockFileName = "backup.sqlite";
            
            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValue({
                buffer: mockBuffer,
                fileName: mockFileName,
            });
            
            await useStore.getState().downloadSQLiteBackup();
            
            expect(mockElectronAPI.data.downloadSQLiteBackup).toHaveBeenCalled();
            expect(document.createElement).toHaveBeenCalledWith("a");
            expect(URL.createObjectURL).toHaveBeenCalled();
        });

        it("handles download backup error", async () => {
            mockElectronAPI.data.downloadSQLiteBackup.mockRejectedValue(new Error("Download failed"));
            
            await expect(useStore.getState().downloadSQLiteBackup())
                .rejects.toThrow("Download failed");
            expect(useStore.getState().lastError).toContain("Failed to download SQLite backup");
        });

        it("handles empty backup data", async () => {
            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValue({ buffer: null, fileName: "test.sqlite" });
            
            await expect(useStore.getState().downloadSQLiteBackup())
                .rejects.toThrow("No backup data received");
        });
    });

    describe("Status Update Processing", () => {
        it("processes status updates correctly", () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "down",
                        history: [],
                    },
                ],
            };
            
            const updatedSite: Site = {
                ...mockSite,
                monitors: [
                    {
                        ...mockSite.monitors[0],
                        status: "up",
                    },
                ],
            };
            
            useStore.getState().setSites([mockSite]);
            
            const callback = vi.fn();
            let capturedHandler: ((update: StatusUpdate) => void) | undefined;
            
            mockElectronAPI.events.onStatusUpdate.mockImplementation((handler) => {
                capturedHandler = handler;
            });
            
            useStore.getState().subscribeToStatusUpdates(callback);
            
            // Simulate status update
            if (capturedHandler) {
                capturedHandler({
                    site: updatedSite,
                    previousStatus: "down",
                });
            }
            
            expect(useStore.getState().sites[0].monitors[0].status).toBe("up");
            expect(callback).toHaveBeenCalledWith({
                site: updatedSite,
                previousStatus: "down",
            });
        });

        it("handles status update for non-existent site", () => {
            const updatedSite: Site = {
                identifier: "nonexistent",
                name: "Non-existent Site",
                monitors: [],
            };
            
            let capturedHandler: ((update: { site: Site }) => void) | undefined;
            
            mockElectronAPI.events.onStatusUpdate.mockImplementation((handler) => {
                capturedHandler = handler;
            });
            
            const fullSyncSpy = vi.spyOn(useStore.getState(), "fullSyncFromBackend")
                .mockResolvedValue();
            
            useStore.getState().subscribeToStatusUpdates(vi.fn());
            
            // Simulate status update for non-existent site
            if (capturedHandler) {
                capturedHandler({
                    site: updatedSite,
                });
            }
            
            expect(fullSyncSpy).toHaveBeenCalled();
        });
    });

    describe("Monitor ID Selection", () => {
        it("handles string validation for getSelectedMonitorId", () => {
            useStore.getState().setSelectedMonitorId("site1", "monitor1");
            
            // Valid string key
            expect(useStore.getState().getSelectedMonitorId("site1")).toBe("monitor1");
            
            // Non-string key should return undefined  
            expect(useStore.getState().getSelectedMonitorId("" as string)).toBeUndefined();
            // Test with falsy values that would be converted to strings
            expect(useStore.getState().getSelectedMonitorId("null")).toBeUndefined();
            expect(useStore.getState().getSelectedMonitorId("123")).toBeUndefined();
        });

        it("handles prototype pollution protection", () => {
            // The actual implementation allows __proto__ as a key but uses hasOwnProperty for safety
            // This test ensures that prototype chain properties are not accessible
            const maliciousKey = "constructor";
            
            // Try to access a property that exists on the prototype
            expect(useStore.getState().getSelectedMonitorId(maliciousKey)).toBeUndefined();
            
            // Ensure normal string keys work
            useStore.getState().setSelectedMonitorId("normalKey", "normalValue");
            expect(useStore.getState().getSelectedMonitorId("normalKey")).toBe("normalValue");
        });
    });

    describe("Site Removal with Selection Cleanup", () => {
        it("clears selection when selected site is removed", () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [],
            };
            
            useStore.getState().setSites([mockSite]);
            useStore.getState().setSelectedSite(mockSite);
            useStore.getState().setShowSiteDetails(true);
            
            // Remove the selected site
            useStore.getState().removeSite("site1");
            
            expect(useStore.getState().selectedSiteId).toBeUndefined();
            expect(useStore.getState().showSiteDetails).toBe(false);
        });

        it("preserves selection when different site is removed", () => {
            const mockSite1: Site = {
                identifier: "site1",
                name: "Test Site 1",
                monitors: [],
            };
            
            const mockSite2: Site = {
                identifier: "site2",
                name: "Test Site 2",
                monitors: [],
            };
            
            useStore.getState().setSites([mockSite1, mockSite2]);
            useStore.getState().setSelectedSite(mockSite1);
            useStore.getState().setShowSiteDetails(true);
            
            // Remove different site
            useStore.getState().removeSite("site2");
            
            expect(useStore.getState().selectedSiteId).toBe("site1");
            expect(useStore.getState().showSiteDetails).toBe(true);
        });
    });

    describe("Site Creation Edge Cases", () => {
        it("creates site with monitors having default values", async () => {
            const siteData = {
                identifier: "new-site",
                name: "New Site",
                monitors: [
                    {
                        id: "",
                        type: "http" as MonitorType,
                        status: "pending" as const,
                        history: [],
                    },
                ],
            };
            
            const expectedSite = {
                ...siteData,
                monitors: [
                    {
                        id: expect.any(String),
                        type: "http",
                        status: "pending",
                        monitoring: true,
                        history: [],
                    },
                ],
            };
            
            mockElectronAPI.sites.addSite.mockResolvedValue(expectedSite);
            
            await useStore.getState().createSite(siteData);
            
            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    monitors: [
                        expect.objectContaining({
                            id: expect.any(String),
                            status: "pending",
                            monitoring: true,
                        }),
                    ],
                })
            );
        });
    });

    describe("Delete Site with Monitor Cleanup", () => {
        it("stops monitoring for all monitors before deletion", async () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    { id: "monitor1", type: "http", status: "up", history: [] },
                    { id: "monitor2", type: "port", status: "down", history: [] },
                ],
            };
            
            useStore.getState().setSites([mockSite]);
            
            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(undefined);
            mockElectronAPI.sites.removeSite.mockResolvedValue(undefined);
            
            await useStore.getState().deleteSite("site1");
            
            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith("site1", "monitor1");
            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith("site1", "monitor2");
            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith("site1");
        });

        it("continues deletion even if stopping monitoring fails in development", async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";
            
            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
            
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    { id: "monitor1", type: "http", status: "up", history: [] },
                ],
            };
            
            useStore.getState().setSites([mockSite]);
            
            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValue(new Error("Stop failed"));
            mockElectronAPI.sites.removeSite.mockResolvedValue(undefined);
            
            await useStore.getState().deleteSite("site1");
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to stop monitoring"),
                expect.any(Error)
            );
            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith("site1");
            
            consoleSpy.mockRestore();
            process.env.NODE_ENV = originalEnv;
        });
    });

    describe("Monitor Configuration Updates", () => {
        beforeEach(() => {
            // Reset store state
            useStore.setState({
                sites: [],
                settings: {
                    autoStart: false,
                    historyLimit: DEFAULT_HISTORY_LIMIT,
                    minimizeToTray: true,
                    notifications: true,
                    soundAlerts: false,
                    theme: "system",
                },
                showSettings: false,
                selectedSiteId: undefined,
                showSiteDetails: false,
                lastError: undefined,
                isLoading: false,
                totalUptime: 0,
                totalDowntime: 0,
                activeSiteDetailsTab: "overview",
                siteDetailsChartTimeRange: "24h",
                showAdvancedMetrics: false,
                selectedMonitorIds: {},
                updateStatus: "idle",
                updateError: undefined,
            });
        });

        it("should update monitor retry attempts", async () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    { id: "monitor1", type: "http", status: "up", history: [], retryAttempts: 3 },
                ],
            };
            
            useStore.getState().setSites([mockSite]);
            
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);
            mockElectronAPI.sites.getSites.mockResolvedValue([
                {
                    ...mockSite,
                    monitors: [
                        { ...mockSite.monitors[0], retryAttempts: 5 }
                    ]
                }
            ]);
            
            await useStore.getState().updateMonitorRetryAttempts("site1", "monitor1", 5);
            
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("site1", {
                monitors: [{ ...mockSite.monitors[0], retryAttempts: 5 }]
            });
        });

        it("should handle site not found error for retry attempts update", async () => {
            useStore.getState().setSites([]);
            
            await expect(
                useStore.getState().updateMonitorRetryAttempts("nonexistent", "monitor1", 5)
            ).rejects.toThrow("Site not found");
            
            expect(useStore.getState().lastError).toContain("Failed to update monitor retry attempts");
        });

        it("should update monitor timeout", async () => {
            const mockSite: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    { id: "monitor1", type: "http", status: "up", history: [], timeout: 5000 },
                ],
            };
            
            useStore.getState().setSites([mockSite]);
            
            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);
            mockElectronAPI.sites.getSites.mockResolvedValue([
                {
                    ...mockSite,
                    monitors: [
                        { ...mockSite.monitors[0], timeout: 10000 }
                    ]
                }
            ]);
            
            await useStore.getState().updateMonitorTimeout("site1", "monitor1", 10000);
            
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("site1", {
                monitors: [{ ...mockSite.monitors[0], timeout: 10000 }]
            });
        });

        it("should handle site not found error for timeout update", async () => {
            useStore.getState().setSites([]);
            
            await expect(
                useStore.getState().updateMonitorTimeout("nonexistent", "monitor1", 5000)
            ).rejects.toThrow("Site not found");
            
            expect(useStore.getState().lastError).toContain("Failed to update monitor timeout");
        });
    });

    describe("Status Updates Error Handling", () => {
        beforeEach(() => {
            // Reset store state
            useStore.setState({
                sites: [],
                settings: {
                    autoStart: false,
                    historyLimit: DEFAULT_HISTORY_LIMIT,
                    minimizeToTray: true,
                    notifications: true,
                    soundAlerts: false,
                    theme: "system",
                },
                showSettings: false,
                selectedSiteId: undefined,
                showSiteDetails: false,
                lastError: undefined,
                isLoading: false,
                totalUptime: 0,
                totalDowntime: 0,
                activeSiteDetailsTab: "overview",
                siteDetailsChartTimeRange: "24h",
                showAdvancedMetrics: false,
                selectedMonitorIds: {},
                updateStatus: "idle",
                updateError: undefined,
            });
        });

        it("should trigger full sync when site not found in status update", async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";
            
            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
            const fullSyncSpy = vi.spyOn(useStore.getState(), "fullSyncFromBackend").mockResolvedValue();
            
            useStore.getState().setSites([]);
            
            const mockUpdate = {
                site: {
                    identifier: "nonexistent",
                    name: "Test",
                    monitors: []
                } as Site
            };
            
            const callback = vi.fn();
            useStore.getState().subscribeToStatusUpdates(callback);
            
            // Simulate the status update handler being called directly
            const statusUpdateHandler = mockElectronAPI.events.onStatusUpdate.mock.calls[0][0];
            statusUpdateHandler(mockUpdate);
            
            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("Site nonexistent not found in store")
            );
            expect(fullSyncSpy).toHaveBeenCalled();
            
            consoleWarnSpy.mockRestore();
            fullSyncSpy.mockRestore();
            process.env.NODE_ENV = originalEnv;
        });

        it("should handle status update processing errors", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
            const fullSyncSpy = vi.spyOn(useStore.getState(), "fullSyncFromBackend").mockRejectedValue(new Error("Sync failed"));
            
            useStore.getState().setSites([]);
            
            const callback = vi.fn();
            useStore.getState().subscribeToStatusUpdates(callback);
            
            // Get the actual handler that was registered
            const statusUpdateHandler = mockElectronAPI.events.onStatusUpdate.mock.calls[0][0];
            
            // Now call it with malformed data that will definitely cause an error
            statusUpdateHandler({ site: null } as unknown as StatusUpdate);
            
            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Error processing status update:",
                expect.any(Error)
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Fallback sync after error failed:",
                expect.any(Error)
            );
            expect(useStore.getState().lastError).toBe("Failed to process status update");
            
            consoleErrorSpy.mockRestore();
            consoleLogSpy.mockRestore();
            fullSyncSpy.mockRestore();
        });

        it("should handle fallback sync failure after site not found", async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";
            
            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const fullSyncSpy = vi.spyOn(useStore.getState(), "fullSyncFromBackend").mockRejectedValue(new Error("Fallback sync failed"));
            
            useStore.getState().setSites([]);
            
            const mockUpdate = {
                site: {
                    identifier: "nonexistent",
                    name: "Test",
                    monitors: []
                } as Site
            };
            
            const callback = vi.fn();
            useStore.getState().subscribeToStatusUpdates(callback);
            
            const statusUpdateHandler = mockElectronAPI.events.onStatusUpdate.mock.calls[0][0];
            statusUpdateHandler(mockUpdate);
            
            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Fallback full sync failed:",
                expect.any(Error)
            );
            expect(useStore.getState().lastError).toBe("Failed to sync site data");
            
            consoleWarnSpy.mockRestore();
            consoleErrorSpy.mockRestore();
            fullSyncSpy.mockRestore();
            process.env.NODE_ENV = originalEnv;
        });
    });
});
