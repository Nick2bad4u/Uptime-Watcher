/**
 * Comprehensive tests for useSitesStore.
 * Tests all store actions, state management, and error handling.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import type { Site, Monitor } from "../types";

import { useSitesStore } from "../stores/sites/useSitesStore";

// Mock electron API
const mockElectronAPI = {
    data: {
        downloadSQLiteBackup: vi.fn(),
        exportData: vi.fn(),
        importData: vi.fn(),
    },
    events: {
        onStatusUpdate: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        startMonitoring: vi.fn(),
        startMonitoringForSite: vi.fn(),
        stopMonitoring: vi.fn(),
        stopMonitoringForSite: vi.fn(),
    },
    settings: {
        getHistoryLimit: vi.fn(),
        updateHistoryLimit: vi.fn(),
    },
    sites: {
        addSite: vi.fn(),
        checkSiteNow: vi.fn(),
        getSites: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
    },
    system: {
        quitAndInstall: vi.fn(),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
    value: { randomUUID: vi.fn(() => "mock-uuid") },
    writable: true,
});

// Mock utils
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
    withErrorHandling: vi.fn((asyncFn, handlers) => {
        return asyncFn().catch((error: Error) => {
            handlers.setError(error);
            throw error;
        });
    }),
}));

describe("useSitesStore", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store state
        useSitesStore.setState({
            selectedMonitorIds: {},
            selectedSiteId: undefined,
            sites: [],
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("State Management", () => {
        it("should initialize with empty state", () => {
            const state = useSitesStore.getState();
            expect(state.sites).toEqual([]);
            expect(state.selectedMonitorIds).toEqual({});
            expect(state.selectedSiteId).toBeUndefined();
        });

        it("should add site to store", () => {
            const site: Site = {
                identifier: "test-site",
                monitors: [],
                name: "Test Site",
            };

            useSitesStore.getState().addSite(site);

            const state = useSitesStore.getState();
            expect(state.sites).toHaveLength(1);
            expect(state.sites[0]).toEqual(site);
        });

        it("should remove site from store", () => {
            const sites: Site[] = [
                {
                    identifier: "site-1",
                    monitors: [],
                    name: "Site 1",
                },
                {
                    identifier: "site-2",
                    monitors: [],
                    name: "Site 2",
                },
            ];
            useSitesStore.setState({ ...useSitesStore.getState(), sites });

            useSitesStore.getState().removeSite("site-1");

            const state = useSitesStore.getState();
            expect(state.sites).toHaveLength(1);
            expect(state.sites[0]!.identifier).toBe("site-2");
        });

        it("should set sites", () => {
            const sites: Site[] = [
                {
                    identifier: "site-1",
                    monitors: [],
                    name: "Site 1",
                },
            ];

            useSitesStore.getState().setSites(sites);

            const state = useSitesStore.getState();
            expect(state.sites).toEqual(sites);
        });
    });

    describe("createSite", () => {
        it("should create site with provided monitors", async () => {
            const siteData = {
                identifier: "test-site",
                monitors: [
                    {
                        history: [],
                        id: "monitor-1",
                        monitoring: true,
                        status: "pending" as const,
                        type: "http" as const,
                        url: "https://example.com",
                    },
                ],
                name: "Test Site",
            };

            const newSite: Site = {
                ...siteData,
                monitors: siteData.monitors,
            };

            mockElectronAPI.sites.addSite.mockResolvedValue(newSite);

            await useSitesStore.getState().createSite(siteData);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    identifier: "test-site",
                    monitors: expect.arrayContaining([
                        expect.objectContaining({
                            id: "monitor-1",
                            monitoring: true,
                            status: "pending",
                            type: "http",
                        }),
                    ]),
                    name: "Test Site",
                })
            );

            const state = useSitesStore.getState();
            expect(state.sites).toHaveLength(1);
            expect(state.sites[0]).toEqual(newSite);
        });

        it("should create site with default HTTP monitor when no monitors provided", async () => {
            const siteData = {
                identifier: "test-site",
                monitors: [],
                name: "Test Site",
            };

            const newSite: Site = {
                ...siteData,
                monitors: [
                    {
                        history: [],
                        id: "mock-uuid",
                        monitoring: true,
                        status: "pending" as const,
                        type: "http" as const,
                    },
                ],
            };

            mockElectronAPI.sites.addSite.mockResolvedValue(newSite);

            await useSitesStore.getState().createSite(siteData);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    monitors: expect.arrayContaining([
                        expect.objectContaining({
                            id: "mock-uuid",
                            monitoring: true,
                            status: "pending",
                            type: "http",
                        }),
                    ]),
                })
            );
        });

        it("should normalize monitor status to valid values", async () => {
            const siteData = {
                identifier: "test-site",
                monitors: [
                    {
                        history: [],
                        id: "monitor-1",
                        status: "invalid-status" as never,
                        type: "http" as const,
                    },
                ],
                name: "Test Site",
            };

            const newSite: Site = {
                ...siteData,
                monitors: [
                    {
                        history: [],
                        id: "monitor-1",
                        monitoring: true,
                        status: "pending" as const,
                        type: "http" as const,
                    },
                ],
            };

            mockElectronAPI.sites.addSite.mockResolvedValue(newSite);

            await useSitesStore.getState().createSite(siteData);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    monitors: expect.arrayContaining([
                        expect.objectContaining({
                            status: "pending",
                        }),
                    ]),
                })
            );
        });

        it("should handle createSite errors", async () => {
            const siteData = {
                identifier: "test-site",
                monitors: [],
                name: "Test Site",
            };

            mockElectronAPI.sites.addSite.mockRejectedValue(new Error("Backend error"));

            await expect(useSitesStore.getState().createSite(siteData)).rejects.toThrow("Backend error");
        });
    });

    describe("deleteSite", () => {
        beforeEach(() => {
            // Add some sites to the store
            const sites: Site[] = [
                {
                    identifier: "site-1",
                    monitors: [
                        {
                            history: [],
                            id: "monitor-1",
                            monitoring: true,
                            status: "up",
                            type: "http",
                        },
                    ],
                    name: "Site 1",
                },
                {
                    identifier: "site-2",
                    monitors: [],
                    name: "Site 2",
                },
            ];
            useSitesStore.setState({ ...useSitesStore.getState(), sites });
        });

        it("should delete site and stop monitoring", async () => {
            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(undefined);
            mockElectronAPI.sites.removeSite.mockResolvedValue(undefined);

            await useSitesStore.getState().deleteSite("site-1");

            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith("site-1", "monitor-1");
            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith("site-1");

            const state = useSitesStore.getState();
            expect(state.sites).toHaveLength(1);
            expect(state.sites[0]!.identifier).toBe("site-2");
        });

        it("should handle deletion of non-existent site", async () => {
            mockElectronAPI.sites.removeSite.mockResolvedValue(undefined);

            await useSitesStore.getState().deleteSite("non-existent");

            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith("non-existent");
        });

        it("should handle deleteSite errors", async () => {
            mockElectronAPI.sites.removeSite.mockRejectedValue(new Error("Delete failed"));

            await expect(useSitesStore.getState().deleteSite("site-1")).rejects.toThrow("Delete failed");
        });

        it("should continue deletion even if stop monitoring fails", async () => {
            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValue(new Error("Stop failed"));
            mockElectronAPI.sites.removeSite.mockResolvedValue(undefined);

            await useSitesStore.getState().deleteSite("site-1");

            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith("site-1");
        });
    });

    describe("addMonitorToSite", () => {
        beforeEach(() => {
            const sites: Site[] = [
                {
                    identifier: "site-1",
                    monitors: [
                        {
                            history: [],
                            id: "existing-monitor",
                            monitoring: true,
                            status: "up",
                            type: "http",
                        },
                    ],
                    name: "Site 1",
                },
            ];
            useSitesStore.setState({ ...useSitesStore.getState(), sites });
        });

        it("should add monitor to existing site", async () => {
            const newMonitor: Monitor = {
                history: [],
                host: "localhost",
                id: "new-monitor",
                monitoring: true,
                port: 3000,
                status: "pending",
                type: "port",
            };

            mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);

            // Mock the getSites method that syncSitesFromBackend calls
            const currentSites = useSitesStore.getState().sites;
            const existingSite = currentSites.find((s) => s.identifier === "site-1");
            if (!existingSite) throw new Error("Site not found in test setup");

            const updatedSite = {
                ...existingSite,
                monitors: [...existingSite.monitors, newMonitor],
            };
            mockElectronAPI.sites.getSites.mockResolvedValue([updatedSite]);

            await useSitesStore.getState().addMonitorToSite("site-1", newMonitor);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith("site-1", {
                monitors: [
                    expect.objectContaining({ id: "existing-monitor" }),
                    expect.objectContaining({ id: "new-monitor" }),
                ],
            });
            expect(mockElectronAPI.sites.getSites).toHaveBeenCalled();
        });

        it("should handle adding monitor to non-existent site", async () => {
            const newMonitor: Monitor = {
                history: [],
                id: "new-monitor",
                monitoring: true,
                status: "pending",
                type: "http",
            };

            await expect(useSitesStore.getState().addMonitorToSite("non-existent", newMonitor)).rejects.toThrow();
        });
    });

    describe("checkSiteNow", () => {
        it("should trigger immediate site check", async () => {
            mockElectronAPI.sites.checkSiteNow.mockResolvedValue(undefined);

            await useSitesStore.getState().checkSiteNow("site-1", "monitor-1");

            expect(mockElectronAPI.sites.checkSiteNow).toHaveBeenCalledWith("site-1", "monitor-1");
        });

        it("should handle checkSiteNow errors", async () => {
            mockElectronAPI.sites.checkSiteNow.mockRejectedValue(new Error("Check failed"));

            await expect(useSitesStore.getState().checkSiteNow("site-1", "monitor-1")).rejects.toThrow("Check failed");
        });
    });

    describe("downloadSQLiteBackup", () => {
        it("should download SQLite backup", async () => {
            const mockBuffer = new ArrayBuffer(100);
            const mockFileName = "backup.sqlite";

            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValue({
                buffer: mockBuffer,
                fileName: mockFileName,
            });

            // Mock DOM methods
            const mockCreateElement = vi.fn();
            const mockAppendChild = vi.fn();
            const mockRemoveChild = vi.fn();
            const mockClick = vi.fn();
            const mockCreateObjectURL = vi.fn().mockReturnValue("blob:url");
            const mockRevokeObjectURL = vi.fn();

            Object.defineProperty(document, "createElement", {
                value: mockCreateElement.mockReturnValue({
                    click: mockClick,
                    download: "",
                    href: "",
                }),
                writable: true,
            });
            Object.defineProperty(document.body, "appendChild", { value: mockAppendChild, writable: true });
            Object.defineProperty(document.body, "removeChild", { value: mockRemoveChild, writable: true });
            Object.defineProperty(URL, "createObjectURL", { value: mockCreateObjectURL, writable: true });
            Object.defineProperty(URL, "revokeObjectURL", { value: mockRevokeObjectURL, writable: true });

            await useSitesStore.getState().downloadSQLiteBackup();

            expect(mockElectronAPI.data.downloadSQLiteBackup).toHaveBeenCalled();
            expect(mockCreateElement).toHaveBeenCalledWith("a");
            expect(mockClick).toHaveBeenCalled();
        });

        it("should handle downloadSQLiteBackup errors", async () => {
            mockElectronAPI.data.downloadSQLiteBackup.mockRejectedValue(new Error("Download failed"));

            await expect(useSitesStore.getState().downloadSQLiteBackup()).rejects.toThrow("Download failed");
        });

        it("should handle missing buffer", async () => {
            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValue({
                buffer: null,
                fileName: "backup.sqlite",
            });

            await expect(useSitesStore.getState().downloadSQLiteBackup()).rejects.toThrow("No backup data received");
        });
    });

    describe("Selected Site Management", () => {
        beforeEach(() => {
            const sites: Site[] = [
                {
                    identifier: "site-1",
                    monitors: [
                        {
                            history: [],
                            id: "monitor-1",
                            monitoring: true,
                            status: "up",
                            type: "http",
                        },
                    ],
                    name: "Site 1",
                },
            ];
            useSitesStore.setState({ ...useSitesStore.getState(), sites });
        });

        it("should set selected site", () => {
            const site = useSitesStore.getState().sites[0]!;

            useSitesStore.getState().setSelectedSite(site);

            const state = useSitesStore.getState();
            expect(state.selectedSiteId).toBe("site-1");
        });

        it("should clear selected site", () => {
            useSitesStore.setState({ ...useSitesStore.getState(), selectedSiteId: "site-1" });

            useSitesStore.getState().setSelectedSite(undefined);

            const state = useSitesStore.getState();
            expect(state.selectedSiteId).toBeUndefined();
        });

        it("should get selected site", () => {
            useSitesStore.setState({ ...useSitesStore.getState(), selectedSiteId: "site-1" });

            const selectedSite = useSitesStore.getState().getSelectedSite();

            expect(selectedSite?.identifier).toBe("site-1");
        });

        it("should return undefined for non-existent selected site", () => {
            useSitesStore.setState({ ...useSitesStore.getState(), selectedSiteId: "non-existent" });

            const selectedSite = useSitesStore.getState().getSelectedSite();

            expect(selectedSite).toBeUndefined();
        });
    });

    describe("Monitor Selection", () => {
        it("should set selected monitor ID for site", () => {
            useSitesStore.getState().setSelectedMonitorId("site-1", "monitor-1");

            const state = useSitesStore.getState();
            expect(state.selectedMonitorIds["site-1"]).toBe("monitor-1");
        });

        it("should get selected monitor ID for site", () => {
            useSitesStore.setState({
                ...useSitesStore.getState(),
                selectedMonitorIds: { "site-1": "monitor-1" },
            });

            const monitorId = useSitesStore.getState().getSelectedMonitorId("site-1");

            expect(monitorId).toBe("monitor-1");
        });

        it("should return undefined for non-existent selected monitor", () => {
            const monitorId = useSitesStore.getState().getSelectedMonitorId("non-existent");

            expect(monitorId).toBeUndefined();
        });
    });
});
