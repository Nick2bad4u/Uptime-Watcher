/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "../../../../shared/types";

import { SiteService } from "../../../stores/sites/services/SiteService";

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

describe("SiteService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
                {
                    identifier: "site1",
                    monitors: [
                        {
                            history: [],
                            id: "monitor1",
                            status: "up",
                            type: "http",
                            url: "https://test1.com",
                            responseTime: 0,
                            monitoring: false,
                            checkInterval: 0,
                            timeout: 0,
                            retryAttempts: 0,
                        },
                    ],
                    name: "Test Site 1",
                    monitoring: false,
                },
                {
                    identifier: "site2",
                    monitors: [
                        {
                            history: [],
                            host: "test2.com",
                            id: "monitor2",
                            port: 80,
                            status: "down",
                            type: "port",
                            responseTime: 0,
                            monitoring: false,
                            checkInterval: 0,
                            timeout: 0,
                            retryAttempts: 0,
                        },
                    ],
                    name: "Test Site 2",
                    monitoring: false,
                },
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

            const newSite: Omit<Site, "id"> = {
                identifier: "new-site",
                monitors: [
                    {
                        history: [],
                        id: "monitor1",
                        status: "pending",
                        type: "http",
                        url: "https://newsite.com",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "New Site",
                monitoring: false,
            };

            const createdSite: Site = {
                identifier: "new-site",
                monitors: [
                    {
                        history: [],
                        id: "monitor1",
                        status: "pending",
                        type: "http",
                        url: "https://newsite.com",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "New Site",
                monitoring: false,
            };

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

            mockElectronAPI.sites.updateSite.mockResolvedValueOnce(undefined);

            await SiteService.updateSite(identifier, updates);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                identifier,
                updates
            );
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

            mockElectronAPI.sites.updateSite.mockResolvedValueOnce(undefined);

            await SiteService.updateSite(identifier, updates);

            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                identifier,
                updates
            );
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

    describe("downloadSqliteBackup", () => {
        it("should successfully download SQLite backup", async () => {
            // Mock the API response
            const mockBackupData = new ArrayBuffer(1024);
            const mockResponse = {
                buffer: mockBackupData,
                fileName: "backup_20240101_120000.sqlite",
                metadata: {
                    createdAt: 0,
                    originalPath: "/tmp/backup.sqlite",
                    sizeBytes: 1024,
                },
            };

            mockElectronAPI.data.downloadSqliteBackup.mockResolvedValueOnce(
                mockResponse
            );

            const result = await SiteService.downloadSqliteBackup();

            expect(result).toEqual(mockResponse);
            expect(
                mockElectronAPI.data.downloadSqliteBackup
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle download errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Failed to download backup");
            mockElectronAPI.data.downloadSqliteBackup.mockRejectedValueOnce(
                error
            );

            await expect(SiteService.downloadSqliteBackup()).rejects.toThrow(
                "Failed to download backup"
            );
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
            expect(SiteService.downloadSqliteBackup).toBeDefined();
        });

        it("should handle undefined window.electronAPI gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Import the mock so we can control it
            const { waitForElectronAPI } = await import(
                "../../../stores/utils"
            );

            // Make waitForElectronAPI reject for all calls in this test
            const mockWaitForElectronAPI = vi.mocked(waitForElectronAPI);
            mockWaitForElectronAPI.mockRejectedValue(
                new Error("ElectronAPI not available")
            );

            await expect(SiteService.getSites()).rejects.toThrow(
                "ElectronAPI not available"
            );
            await expect(
                SiteService.addSite({} as Omit<Site, "id">)
            ).rejects.toThrow("ElectronAPI not available");
            await expect(SiteService.updateSite("test", {})).rejects.toThrow(
                "ElectronAPI not available"
            );
            await expect(SiteService.removeSite("test")).rejects.toThrow(
                "ElectronAPI not available"
            );
            await expect(SiteService.downloadSqliteBackup()).rejects.toThrow(
                "ElectronAPI not available"
            );

            // Reset the mock for other tests
            mockWaitForElectronAPI.mockResolvedValue(undefined);
        });
    });

    describe("Parameter validation", () => {
        it("should accept valid site objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const validSite: Omit<Site, "id"> = {
                identifier: "valid-site",
                monitors: [
                    {
                        history: [],
                        id: "monitor1",
                        status: "pending",
                        type: "http",
                        url: "https://valid.com",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "Valid Site",
                monitoring: false,
            };

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

            const siteWithMonitors: Omit<Site, "id"> = {
                identifier: "site-with-monitors",
                monitors: [
                    {
                        history: [],
                        id: "monitor1",
                        status: "up",
                        type: "http",
                        url: "https://monitored.com",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                    {
                        history: [],
                        host: "monitored.com",
                        id: "monitor2",
                        port: 443,
                        status: "down",
                        type: "port",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "Site with Multiple Monitors",
                monitoring: false,
            };

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

            const siteWithSpecialChars: Omit<Site, "id"> = {
                identifier: "site-with-special-chars",
                monitors: [
                    {
                        history: [],
                        id: "monitor1",
                        status: "pending",
                        type: "http",
                        url: "https://special-chars.com/path?param=value&other=test",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "Site with Special Characters: @#$%",
                monitoring: false,
            };

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

            const siteWithUnicode: Omit<Site, "id"> = {
                identifier: "site-with-unicode",
                monitors: [
                    {
                        history: [],
                        id: "monitor1",
                        status: "pending",
                        type: "http",
                        url: "https://unicode-site.com",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "Site with Unicode: 🌟💻🚀",
                monitoring: false,
            };

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

        it("should handle database connection errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const dbError = new Error("Database connection failed");
            mockElectronAPI.data.downloadSqliteBackup.mockRejectedValueOnce(
                dbError
            );

            await expect(SiteService.downloadSqliteBackup()).rejects.toThrow(
                "Database connection failed"
            );
        });
    });
});
