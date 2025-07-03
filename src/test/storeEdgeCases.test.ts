/**
 * Store Edge Cases Tests
 * Tests for edge cases and error scenarios in the store that might not be covered by regular tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useStore } from "../store";

// Mock window.electronAPI
const mockElectronAPI = {
    sites: {
        updateSite: vi.fn(),
        getSites: vi.fn(),
        syncSites: vi.fn().mockResolvedValue([]),
    },
    data: {
        downloadSQLiteBackup: vi.fn(),
    },
    settings: {
        getHistoryLimit: vi.fn(),
    },
    system: {
        quitAndInstall: vi.fn(),
    },
};

// Mock document methods for backup download
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

Object.defineProperty(document, "createElement", {
    value: mockCreateElement,
    writable: true,
});

Object.defineProperty(document.body, "appendChild", {
    value: mockAppendChild,
    writable: true,
});

Object.defineProperty(document.body, "removeChild", {
    value: mockRemoveChild,
    writable: true,
});

Object.defineProperty(URL, "createObjectURL", {
    value: mockCreateObjectURL,
    writable: true,
});

Object.defineProperty(URL, "revokeObjectURL", {
    value: mockRevokeObjectURL,
    writable: true,
});

describe("Store Edge Cases", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useStore.getState().clearError();
        useStore.getState().setLoading(false);

        // Setup default mock element
        const mockElement = {
            href: "",
            download: "",
            click: mockClick,
        };
        mockCreateElement.mockReturnValue(mockElement);
        mockCreateObjectURL.mockReturnValue("mock-url");
    });

    beforeEach(() => {
        // Reset store state before each test
        const store = useStore.getState();
        store.setSites([]);
        store.setSelectedSite(undefined);
        store.clearError();
        store.setLoading(false);
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("addMonitorToSite", () => {
        it("should handle errors when updating site fails", async () => {
            const error = new Error("Update failed");
            mockElectronAPI.sites.updateSite.mockRejectedValue(error);

            const store = useStore.getState();
            store.setSites([
                {
                    identifier: "test-site",
                    name: "Test Site",
                    monitors: [],
                },
            ]);

            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
            };

            try {
                await store.addMonitorToSite("test-site", monitor);
                expect.fail("Should have thrown an error");
            } catch (e) {
                expect(e).toEqual(error);
                // Get fresh state to check the error
                const updatedState = useStore.getState();
                expect(updatedState.lastError).toBeDefined();
                expect(updatedState.lastError!).toContain("Failed to add monitor");
                expect(updatedState.isLoading).toBe(false);
            }
        });
    });

    describe("applyUpdate", () => {
        it("should call quitAndInstall when available", () => {
            const store = useStore.getState();
            store.applyUpdate();
            expect(mockElectronAPI.system.quitAndInstall).toHaveBeenCalled();
        });

        it("should handle missing quitAndInstall method gracefully", () => {
            // Test the line 190 optional chaining branch
            const originalQuitAndInstall = mockElectronAPI.system.quitAndInstall;
            delete (mockElectronAPI.system as Record<string, unknown>).quitAndInstall;

            const store = useStore.getState();
            expect(() => store.applyUpdate()).not.toThrow();

            mockElectronAPI.system.quitAndInstall = originalQuitAndInstall;
        });
    });

    describe("downloadSQLiteBackup", () => {
        it("should handle backup download with custom filename", async () => {
            const mockBuffer = new ArrayBuffer(8);
            const mockFileName = "custom-backup.sqlite";
            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValue({
                buffer: mockBuffer,
                fileName: mockFileName,
            });

            // Set up proper DOM mocks
            const mockElement = {
                click: mockClick,
                href: "",
                download: "",
            };
            mockCreateElement.mockReturnValue(mockElement);
            mockCreateObjectURL.mockReturnValue("blob:mock-url");

            const store = useStore.getState();
            await store.downloadSQLiteBackup();

            expect(mockElectronAPI.data.downloadSQLiteBackup).toHaveBeenCalled();
            expect(mockElement.download).toBe(mockFileName);
        });

        it("should handle backup download without filename (default name)", async () => {
            const mockBuffer = new ArrayBuffer(8);
            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValue({
                buffer: mockBuffer,
                fileName: undefined,
            });

            // Set up proper DOM mocks
            const mockElement = {
                click: mockClick,
                href: "",
                download: "",
            };
            mockCreateElement.mockReturnValue(mockElement);
            mockCreateObjectURL.mockReturnValue("blob:mock-url");

            const store = useStore.getState();
            await store.downloadSQLiteBackup();

            expect(mockElectronAPI.data.downloadSQLiteBackup).toHaveBeenCalled();
            expect(mockElement.download).toMatch(/uptime-watcher-backup-\d{4}-\d{2}-\d{2}\.sqlite/);
        });

        it("should handle error when no backup data received", async () => {
            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValue({
                buffer: null,
                fileName: "test.sqlite",
            });

            const store = useStore.getState();
            await expect(store.downloadSQLiteBackup()).rejects.toThrow("No backup data received");
        });

        it("should handle error during backup download", async () => {
            const error = new Error("Download failed");
            mockElectronAPI.data.downloadSQLiteBackup.mockRejectedValue(error);

            const store = useStore.getState();

            try {
                await store.downloadSQLiteBackup();
                expect.fail("Should have thrown an error");
            } catch (e) {
                expect(e).toEqual(error);
                // Get fresh state to check the error
                const updatedState = useStore.getState();
                expect(updatedState.lastError).toBeDefined();
                expect(updatedState.lastError!).toBe("Failed to download SQLite backup: Download failed");
            }
        });
    });

    describe("getSelectedMonitorId", () => {
        it("should return undefined for non-string siteId", () => {
            const store = useStore.getState();
            store.setSelectedMonitorId("test-site", "monitor-1");

            // Test the typeof siteId === "string" branch (line 314)
            expect(store.getSelectedMonitorId(123 as unknown as string)).toBeUndefined();
            expect(store.getSelectedMonitorId(null as unknown as string)).toBeUndefined();
            expect(store.getSelectedMonitorId(undefined as unknown as string)).toBeUndefined();
        });

        it("should return undefined for siteId not in selectedMonitorIds", () => {
            const store = useStore.getState();
            store.setSelectedMonitorId("test-site", "monitor-1");

            // Test the hasOwnProperty branch (line 314-316)
            expect(store.getSelectedMonitorId("non-existent-site")).toBeUndefined();
        });

        it("should return monitor id for valid siteId", () => {
            const store = useStore.getState();
            store.setSelectedMonitorId("test-site", "monitor-1");

            expect(store.getSelectedMonitorId("test-site")).toBe("monitor-1");
        });
    });

    describe("fullSyncFromBackend", () => {
        it("should call syncSitesFromBackend", async () => {
            const store = useStore.getState();
            const syncSpy = vi.spyOn(store, "syncSitesFromBackend").mockResolvedValue();

            await store.fullSyncFromBackend();
            expect(syncSpy).toHaveBeenCalled();

            syncSpy.mockRestore();
        });
    });

    describe("initializeApp error handling", () => {
        it("should handle errors during initialization", async () => {
            const error = new Error("Initialization failed");
            mockElectronAPI.sites.getSites.mockRejectedValue(error);

            const store = useStore.getState();

            // This method doesn't throw - it just sets error state
            await store.initializeApp();

            // Get fresh state to check the error
            const updatedState = useStore.getState();
            expect(updatedState.lastError).toBeDefined();
            expect(updatedState.lastError!).toContain("Failed to initialize app");
            expect(updatedState.isLoading).toBe(false);
        });
    });

    describe("setSelectedSite edge cases", () => {
        it("should set selectedSiteId to undefined when site is undefined", () => {
            const store = useStore.getState();
            store.setSelectedSite(undefined);

            // Test the ternary operator branch (line 400)
            expect(store.selectedSiteId).toBeUndefined();
        });

        it("should set selectedSiteId to site identifier when site is provided", () => {
            const store = useStore.getState();
            const site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
            };
            store.setSelectedSite(site);

            // Get fresh state to check the update
            const updatedState = useStore.getState();
            expect(updatedState.selectedSiteId).toBe("test-site");
        });
    });

    describe("updateMonitorRetryAttempts error handling", () => {
        it("should handle site not found error", async () => {
            const store = useStore.getState();
            store.setSites([]); // No sites

            try {
                await store.updateMonitorRetryAttempts("non-existent-site", "monitor-1", 5);
                expect.fail("Should have thrown an error");
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect((e as Error).message).toBe("Site not found");
                // Get fresh state to check the error
                const updatedState = useStore.getState();
                expect(updatedState.lastError).toBeDefined();
                expect(updatedState.lastError!).toContain("Failed to update monitor retry attempts");
            }
        });

        it("should handle errors during site update", async () => {
            const error = new Error("Update failed");
            mockElectronAPI.sites.updateSite.mockRejectedValue(error);

            const store = useStore.getState();
            store.setSites([
                {
                    identifier: "test-site",
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor-1",
                            type: "http" as const,
                            url: "https://example.com",
                            status: "pending" as const,
                            checkInterval: 60000,
                            timeout: 5000,
                            retryAttempts: 3,
                            history: [],
                        },
                    ],
                },
            ]);

            try {
                await store.updateMonitorRetryAttempts("test-site", "monitor-1", 5);
                expect.fail("Should have thrown an error");
            } catch (e) {
                expect(e).toEqual(error);
                // Get fresh state to check the error
                const updatedState = useStore.getState();
                expect(updatedState.lastError).toBeDefined();
                expect(updatedState.lastError!).toContain("Failed to update monitor retry attempts");
            }
        });
    });

    describe("updateMonitorTimeout error handling", () => {
        it("should handle site not found error", async () => {
            const store = useStore.getState();
            store.setSites([]); // No sites

            try {
                await store.updateMonitorTimeout("non-existent-site", "monitor-1", 10000);
                expect.fail("Should have thrown an error");
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect((e as Error).message).toBe("Site not found");
                // Get fresh state to check the error
                const updatedState = useStore.getState();
                expect(updatedState.lastError).toBeDefined();
                expect(updatedState.lastError!).toContain("Failed to update monitor timeout");
            }
        });

        it("should handle errors during site update", async () => {
            const error = new Error("Update failed");
            mockElectronAPI.sites.updateSite.mockRejectedValue(error);

            const store = useStore.getState();
            store.setSites([
                {
                    identifier: "test-site",
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor-1",
                            type: "http" as const,
                            url: "https://example.com",
                            status: "pending" as const,
                            checkInterval: 60000,
                            timeout: 5000,
                            retryAttempts: 3,
                            history: [],
                        },
                    ],
                },
            ]);

            try {
                await store.updateMonitorTimeout("test-site", "monitor-1", 10000);
                expect.fail("Should have thrown an error");
            } catch (e) {
                expect(e).toEqual(error);
                // Get fresh state to check the error
                const updatedState = useStore.getState();
                expect(updatedState.lastError).toBeDefined();
                expect(updatedState.lastError!).toContain("Failed to update monitor timeout");
            }
        });
    });

    describe("updateSiteCheckInterval error handling", () => {
        it("should handle site not found error", async () => {
            const store = useStore.getState();
            store.setSites([]); // No sites

            try {
                await store.updateSiteCheckInterval("non-existent-site", "monitor-1", 30000);
                expect.fail("Should have thrown an error");
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect((e as Error).message).toBe("Site not found");
                // Get fresh state to check the error
                const updatedState = useStore.getState();
                expect(updatedState.lastError).toBeDefined();
                expect(updatedState.lastError!).toContain("Failed to update monitor check interval");
            }
        });

        it("should handle errors during site update", async () => {
            const error = new Error("Update failed");
            mockElectronAPI.sites.updateSite.mockRejectedValue(error);

            const store = useStore.getState();
            store.setSites([
                {
                    identifier: "test-site",
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor-1",
                            type: "http" as const,
                            url: "https://example.com",
                            status: "pending" as const,
                            checkInterval: 60000,
                            timeout: 5000,
                            retryAttempts: 3,
                            history: [],
                        },
                    ],
                },
            ]);

            try {
                await store.updateSiteCheckInterval("test-site", "monitor-1", 30000);
                expect.fail("Should have thrown an error");
            } catch (e) {
                expect(e).toEqual(error);
                // Get fresh state to check the error
                const updatedState = useStore.getState();
                expect(updatedState.lastError).toBeDefined();
                expect(updatedState.lastError!).toContain("Failed to update monitor check interval");
            }
        });
    });

    describe("getSelectedSite edge cases", () => {
        it("should return undefined when selectedSiteId is not set", () => {
            const store = useStore.getState();
            store.setSelectedSite(undefined); // Clear selection

            // Test the if (!selectedSiteId) branch (line 326)
            expect(store.getSelectedSite()).toBeUndefined();
        });

        it("should return undefined when site is not found in sites array", () => {
            const store = useStore.getState();
            store.setSites([
                {
                    identifier: "different-site",
                    name: "Different Site",
                    monitors: [],
                },
            ]);

            // Manually set selectedSiteId to a non-existent site
            useStore.setState({ selectedSiteId: "non-existent-site" });

            // Test the find() || undefined branch (line 327)
            expect(store.getSelectedSite()).toBeUndefined();
        });
    });
});
