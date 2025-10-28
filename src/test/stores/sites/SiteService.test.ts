/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

import { SiteService } from "../../../services/SiteService";

const MOCK_BRIDGE_ERROR_MESSAGE =
    "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment.";

const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super(MOCK_BRIDGE_ERROR_MESSAGE);
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);

vi.mock("../../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

// Mock the waitForElectronAPI utility
vi.mock("../../../stores/utils", () => ({
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

// Mock the electron window API
const mockElectronAPI = {
    data: {
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "backup.db",
            metadata: {
                createdAt: 0,
                originalPath: "/tmp/backup.db",
                sizeBytes: 8,
            },
        }),
        exportData: vi.fn(),
    },
    sites: {
        addSite: vi.fn(),
        getSites: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
    },
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

const createValidHttpMonitor = (
    id: string,
    overrides: Partial<Site["monitors"][number]> = {}
): Site["monitors"][number] => ({
    checkInterval: 60_000,
    history: [],
    id,
    lastChecked: new Date(),
    monitoring: true,
    responseTime: 120,
    retryAttempts: 2,
    status: "up",
    timeout: 10_000,
    url: `https://example-${id}.com`,
    ...overrides,
    type: "http",
});

const createValidPortMonitor = (
    id: string,
    overrides: Partial<Site["monitors"][number]> = {}
): Site["monitors"][number] => ({
    checkInterval: 60_000,
    history: [],
    host: "example.com",
    id,
    lastChecked: new Date(),
    monitoring: true,
    port: 443,
    responseTime: 120,
    retryAttempts: 2,
    status: "up",
    timeout: 10_000,
    ...overrides,
    type: "port",
});

const createValidSite = (
    identifier: string,
    overrides: Partial<Site> = {}
): Site => ({
    identifier,
    monitors: overrides.monitors ?? [
        createValidHttpMonitor(`${identifier}-monitor`),
    ],
    monitoring: overrides.monitoring ?? true,
    name: overrides.name ?? `Site ${identifier}`,
});

describe("SiteService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWaitForElectronBridge.mockReset();
        mockWaitForElectronBridge.mockImplementation(async () => {
            const bridge =
                (globalThis as any).window?.electronAPI ??
                (globalThis as any).electronAPI;

            if (!bridge) {
                throw new MockElectronBridgeNotReadyError({
                    attempts: 1,
                    reason: "ElectronAPI not available",
                });
            }
        });
    });

    describe("getSites", () => {
        it("should retrieve all sites successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockSites: Site[] = [
                createValidSite("site1", {
                    monitoring: false,
                    name: "Test Site 1",
                }),
                createValidSite("site2", {
                    monitoring: false,
                    name: "Test Site 2",
                }),
            ];

            // Mock electronAPI to return extracted data directly (no IPC wrapper)
            mockElectronAPI.sites.getSites.mockResolvedValueOnce(mockSites);

            const sites = await SiteService.getSites();

            expect(mockElectronAPI.sites.getSites).toHaveBeenCalledTimes(1);
            expect(sites).toEqual(mockSites);
        });

        it("should handle empty sites array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Mock electronAPI to return extracted data directly (no IPC wrapper)
            mockElectronAPI.sites.getSites.mockResolvedValueOnce([]);

            const sites = await SiteService.getSites();

            expect(sites).toEqual([]);
        });

        it("should handle errors when retrieving sites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Failed to fetch sites");
            mockElectronAPI.sites.getSites.mockRejectedValueOnce(error);

            await expect(SiteService.getSites()).rejects.toThrow(
                "Failed to fetch sites"
            );
        });

        it("should handle network errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const networkError = new Error("Network error");
            mockElectronAPI.sites.getSites.mockRejectedValueOnce(networkError);

            await expect(SiteService.getSites()).rejects.toThrow(
                "Network error"
            );
        });
    });

    describe("addSite", () => {
        it("should add a new site successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const newSite = createValidSite("new-site", {
                monitoring: false,
                name: "New Site",
            });

            const createdSite = createValidSite("new-site", {
                monitoring: false,
                name: "New Site",
            });

            // Mock electronAPI to return extracted Site directly (no IPC wrapper)
            mockElectronAPI.sites.addSite.mockResolvedValueOnce(createdSite);

            const result = await SiteService.addSite(newSite);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(newSite);
            expect(result).toEqual(createdSite);
        });

        it("should handle creation errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const newSite: Omit<Site, "id"> = {
                identifier: "new-site",
                monitors: [],
                name: "New Site",
                monitoring: false,
            };

            const error = new Error("Failed to create site");
            mockElectronAPI.sites.addSite.mockRejectedValueOnce(error);

            await expect(SiteService.addSite(newSite)).rejects.toThrow(
                "Failed to create site"
            );
        });

        it("should handle validation errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const invalidSite: Omit<Site, "id"> = {
                identifier: "",
                monitors: [],
                name: "",
                monitoring: false,
            };

            const validationError = new Error("Invalid site data");
            mockElectronAPI.sites.addSite.mockRejectedValueOnce(
                validationError
            );

            await expect(SiteService.addSite(invalidSite)).rejects.toThrow(
                "Invalid site data"
            );
        });

        it("should handle duplicate site errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const duplicateSite: Omit<Site, "id"> = {
                identifier: "existing-site",
                monitors: [],
                name: "Existing Site",
                monitoring: false,
            };

            const duplicateError = new Error("Site already exists");
            mockElectronAPI.sites.addSite.mockRejectedValueOnce(duplicateError);

            await expect(SiteService.addSite(duplicateSite)).rejects.toThrow(
                "Site already exists"
            );
        });
    });

    describe("updateSite", () => {
        it("should update an existing site successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const identifier = "site1";
            const updates: Partial<Site> = {
                name: "Updated Site",
            };

            const updatedSite = createValidSite(identifier, {
                name: "Updated Site",
            });

            mockElectronAPI.sites.updateSite.mockResolvedValueOnce(updatedSite);

            const result = await SiteService.updateSite(identifier, updates);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                identifier,
                updates
            );
            expect(result).toEqual(updatedSite);
        });

        it("should handle update errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const identifier = "site1";
            const updates: Partial<Site> = {
                name: "Updated Site",
            };

            const error = new Error("Failed to update site");
            mockElectronAPI.sites.updateSite.mockRejectedValueOnce(error);

            await expect(
                SiteService.updateSite(identifier, updates)
            ).rejects.toThrow("Failed to update site");
        });

        it("should handle non-existent site errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const identifier = "non-existent";
            const updates: Partial<Site> = {
                name: "Non-existent Site",
            };

            const notFoundError = new Error("Site not found");
            mockElectronAPI.sites.updateSite.mockRejectedValueOnce(
                notFoundError
            );

            await expect(
                SiteService.updateSite(identifier, updates)
            ).rejects.toThrow("Site not found");
        });

        it("should handle partial updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const identifier = "site1";
            const updates: Partial<Site> = {
                name: "Partially Updated Site",
            };

            const updatedSite = createValidSite(identifier, {
                name: "Partially Updated Site",
            });

            mockElectronAPI.sites.updateSite.mockResolvedValueOnce(updatedSite);

            const result = await SiteService.updateSite(identifier, updates);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                identifier,
                updates
            );
            expect(result).toEqual(updatedSite);
        });
    });

    describe("removeSite", () => {
        it("should remove a site successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Deletion", "type");

            const identifier = "site-to-remove";
            mockElectronAPI.sites.removeSite.mockResolvedValueOnce(true);

            const result = await SiteService.removeSite(identifier);

            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith(
                identifier
            );
            expect(result).toBeTruthy();
        });

        it("should throw when backend returns false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const identifier = "site-to-remove";
            mockElectronAPI.sites.removeSite.mockResolvedValueOnce(false);

            await expect(SiteService.removeSite(identifier)).rejects.toThrow(
                /Backend operation returned false/
            );
        });

        it("should handle removal errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const identifier = "site-to-remove";
            const error = new Error("Failed to remove site");
            mockElectronAPI.sites.removeSite.mockRejectedValueOnce(error);

            await expect(SiteService.removeSite(identifier)).rejects.toThrow(
                "Failed to remove site"
            );
        });

        it("should handle non-existent site removal", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const identifier = "non-existent-site";
            const notFoundError = new Error("Site not found");
            mockElectronAPI.sites.removeSite.mockRejectedValueOnce(
                notFoundError
            );

            await expect(SiteService.removeSite(identifier)).rejects.toThrow(
                "Site not found"
            );
        });

        it("should handle empty site identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const identifier = "";
            mockElectronAPI.sites.removeSite.mockResolvedValueOnce(true);

            await SiteService.removeSite(identifier);

            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith("");
        });
    });

    describe("Service availability", () => {
        it("should work when window.electronAPI is available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            expect(SiteService.getSites).toBeDefined();
            expect(SiteService.addSite).toBeDefined();
            expect(SiteService.updateSite).toBeDefined();
            expect(SiteService.removeSite).toBeDefined();
        });

        it("should handle undefined window.electronAPI gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const originalWindowBridge = (globalThis as any).window
                ?.electronAPI;
            const originalGlobalBridge = (globalThis as any).electronAPI;

            (globalThis as any).window.electronAPI = undefined;
            (globalThis as any).electronAPI = undefined;

            try {
                await expect(SiteService.getSites()).rejects.toThrow(
                    MOCK_BRIDGE_ERROR_MESSAGE
                );
                await expect(
                    SiteService.addSite({} as Omit<Site, "id">)
                ).rejects.toThrow(MOCK_BRIDGE_ERROR_MESSAGE);
                await expect(
                    SiteService.updateSite("test", {})
                ).rejects.toThrow(MOCK_BRIDGE_ERROR_MESSAGE);
                await expect(SiteService.removeSite("test")).rejects.toThrow(
                    MOCK_BRIDGE_ERROR_MESSAGE
                );
            } finally {
                (globalThis as any).window.electronAPI = originalWindowBridge;
                (globalThis as any).electronAPI = originalGlobalBridge;
            }
        });
    });

    describe("Parameter validation", () => {
        it("should accept valid site objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const validSite = createValidSite("valid-site", {
                monitoring: false,
                name: "Valid Site",
            });

            // Mock electronAPI to return extracted Site directly (no IPC wrapper)
            mockElectronAPI.sites.addSite.mockResolvedValueOnce(
                validSite as Site
            );

            await SiteService.addSite(validSite);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                validSite
            );
        });

        it("should handle sites with multiple monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteWithMonitors = createValidSite("site-with-monitors", {
                monitors: [
                    createValidHttpMonitor("monitor1"),
                    createValidPortMonitor("monitor2", {
                        host: "monitored.com",
                        port: 443,
                    }),
                ],
                monitoring: false,
                name: "Site with Multiple Monitors",
            });

            // Mock electronAPI to return extracted Site directly (no IPC wrapper)
            mockElectronAPI.sites.addSite.mockResolvedValueOnce(
                siteWithMonitors as Site
            );

            const result = await SiteService.addSite(siteWithMonitors);

            expect(result).toEqual(siteWithMonitors);
        });

        it("should handle special characters in site data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteWithSpecialChars = createValidSite(
                "site-with-special-chars",
                {
                    monitors: [
                        createValidHttpMonitor("monitor1", {
                            url: "https://special-chars.com/path?param=value&other=test",
                        }),
                    ],
                    monitoring: false,
                    name: "Site with Special Characters",
                }
            );

            // Mock electronAPI to return extracted Site directly (no IPC wrapper)
            mockElectronAPI.sites.addSite.mockResolvedValueOnce(
                siteWithSpecialChars as Site
            );

            const result = await SiteService.addSite(siteWithSpecialChars);

            expect(result).toEqual(siteWithSpecialChars);
        });

        it("should handle Unicode characters in site data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteWithUnicode = createValidSite("site-with-unicode", {
                monitors: [
                    createValidHttpMonitor("monitor1", {
                        monitoring: false,
                        url: "https://unicode-site.com/🌟💻🚀",
                    }),
                ],
                monitoring: false,
                name: "Site with Unicode: 🌟💻🚀",
            });

            // Mock electronAPI to return extracted Site directly (no IPC wrapper)
            mockElectronAPI.sites.addSite.mockResolvedValueOnce(
                siteWithUnicode as Site
            );

            const result = await SiteService.addSite(siteWithUnicode);

            expect(result).toEqual(siteWithUnicode);
        });
    });

    describe("Error handling", () => {
        it("should propagate network errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const networkError = new Error("Network error");
            mockElectronAPI.sites.getSites.mockRejectedValueOnce(networkError);

            await expect(SiteService.getSites()).rejects.toThrow(
                "Network error"
            );
        });

        it("should propagate validation errors from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const validationError = new Error("Invalid site data");
            mockElectronAPI.sites.addSite.mockRejectedValueOnce(
                validationError
            );

            await expect(
                SiteService.addSite({} as Omit<Site, "id">)
            ).rejects.toThrow("Invalid site data");
        });

        it("should handle timeout errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const timeoutError = new Error("Request timeout");
            mockElectronAPI.sites.updateSite.mockRejectedValueOnce(
                timeoutError
            );

            await expect(SiteService.updateSite("test", {})).rejects.toThrow(
                "Request timeout"
            );
        });
    });
});
