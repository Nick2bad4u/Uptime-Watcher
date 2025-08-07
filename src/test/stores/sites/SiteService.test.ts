/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

import { SiteService } from "../../../stores/sites/services/SiteService";

// Mock the waitForElectronAPI utility
vi.mock("../../../stores/utils", () => ({
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

// Mock the electron window API
const mockElectronAPI = {
    data: {
        downloadSQLiteBackup: vi.fn(),
    },
    sites: {
        addSite: vi.fn(),
        checkSiteNow: vi.fn(),
        getSites: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("SiteService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getSites", () => {
        it("should retrieve all sites successfully", async () => {
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

            mockElectronAPI.sites.getSites.mockResolvedValueOnce({
                success: true,
                data: mockSites,
            });

            const sites = await SiteService.getSites();

            expect(mockElectronAPI.sites.getSites).toHaveBeenCalledOnce();
            expect(sites).toEqual(mockSites);
        });

        it("should handle empty sites array", async () => {
            mockElectronAPI.sites.getSites.mockResolvedValueOnce([]);

            const sites = await SiteService.getSites();

            expect(sites).toEqual([]);
        });

        it("should handle errors when retrieving sites", async () => {
            const error = new Error("Failed to fetch sites");
            mockElectronAPI.sites.getSites.mockRejectedValueOnce(error);

            await expect(SiteService.getSites()).rejects.toThrow(
                "Failed to fetch sites"
            );
        });

        it("should handle network errors", async () => {
            const networkError = new Error("Network error");
            mockElectronAPI.sites.getSites.mockRejectedValueOnce(networkError);

            await expect(SiteService.getSites()).rejects.toThrow(
                "Network error"
            );
        });
    });

    describe("addSite", () => {
        it("should add a new site successfully", async () => {
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

            mockElectronAPI.sites.addSite.mockResolvedValueOnce(createdSite);

            const result = await SiteService.addSite(newSite);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(newSite);
            expect(result).toEqual(createdSite);
        });

        it("should handle creation errors", async () => {
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

        it("should handle validation errors", async () => {
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

        it("should handle duplicate site errors", async () => {
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
        it("should update an existing site successfully", async () => {
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

        it("should handle update errors", async () => {
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

        it("should handle non-existent site errors", async () => {
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

        it("should handle partial updates", async () => {
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
        it("should remove a site successfully", async () => {
            const identifier = "site-to-remove";
            mockElectronAPI.sites.removeSite.mockResolvedValueOnce(undefined);

            await SiteService.removeSite(identifier);

            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith(
                identifier
            );
        });

        it("should handle removal errors", async () => {
            const identifier = "site-to-remove";
            const error = new Error("Failed to remove site");
            mockElectronAPI.sites.removeSite.mockRejectedValueOnce(error);

            await expect(SiteService.removeSite(identifier)).rejects.toThrow(
                "Failed to remove site"
            );
        });

        it("should handle non-existent site removal", async () => {
            const identifier = "non-existent-site";
            const notFoundError = new Error("Site not found");
            mockElectronAPI.sites.removeSite.mockRejectedValueOnce(
                notFoundError
            );

            await expect(SiteService.removeSite(identifier)).rejects.toThrow(
                "Site not found"
            );
        });

        it("should handle empty site identifier", async () => {
            const identifier = "";
            mockElectronAPI.sites.removeSite.mockResolvedValueOnce(undefined);

            await SiteService.removeSite(identifier);

            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith("");
        });
    });

    describe("checkSiteNow", () => {
        it("should check a site now successfully", async () => {
            const siteId = "site1";
            const monitorId = "monitor1";
            mockElectronAPI.sites.checkSiteNow.mockResolvedValueOnce(undefined);

            await SiteService.checkSiteNow(siteId, monitorId);

            expect(mockElectronAPI.sites.checkSiteNow).toHaveBeenCalledWith(
                siteId,
                monitorId
            );
        });

        it("should handle check errors", async () => {
            const siteId = "site1";
            const monitorId = "monitor1";
            const error = new Error("Failed to check site");
            mockElectronAPI.sites.checkSiteNow.mockRejectedValueOnce(error);

            await expect(
                SiteService.checkSiteNow(siteId, monitorId)
            ).rejects.toThrow("Failed to check site");
        });

        it("should handle invalid site/monitor IDs", async () => {
            const siteId = "invalid-site";
            const monitorId = "invalid-monitor";
            const error = new Error("Invalid site or monitor ID");
            mockElectronAPI.sites.checkSiteNow.mockRejectedValueOnce(error);

            await expect(
                SiteService.checkSiteNow(siteId, monitorId)
            ).rejects.toThrow("Invalid site or monitor ID");
        });
    });

    describe("downloadSQLiteBackup", () => {
        it("should download SQLite backup successfully", async () => {
            const backupData = {
                buffer: new ArrayBuffer(100),
                fileName: "backup.db",
            };

            mockElectronAPI.data.downloadSQLiteBackup.mockResolvedValueOnce(
                backupData
            );

            const result = await SiteService.downloadSQLiteBackup();

            expect(
                mockElectronAPI.data.downloadSQLiteBackup
            ).toHaveBeenCalledOnce();
            expect(result).toEqual(backupData);
        });

        it("should handle download errors", async () => {
            const error = new Error("Failed to download backup");
            mockElectronAPI.data.downloadSQLiteBackup.mockRejectedValueOnce(
                error
            );

            await expect(SiteService.downloadSQLiteBackup()).rejects.toThrow(
                "Failed to download backup"
            );
        });
    });

    describe("Service availability", () => {
        it("should work when window.electronAPI is available", () => {
            expect(SiteService.getSites).toBeDefined();
            expect(SiteService.addSite).toBeDefined();
            expect(SiteService.updateSite).toBeDefined();
            expect(SiteService.removeSite).toBeDefined();
            expect(SiteService.checkSiteNow).toBeDefined();
            expect(SiteService.downloadSQLiteBackup).toBeDefined();
        });

        it("should handle undefined window.electronAPI gracefully", async () => {
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
            await expect(
                SiteService.checkSiteNow("test", "test")
            ).rejects.toThrow("ElectronAPI not available");
            await expect(SiteService.downloadSQLiteBackup()).rejects.toThrow(
                "ElectronAPI not available"
            );

            // Reset the mock for other tests
            mockWaitForElectronAPI.mockResolvedValue(undefined);
        });
    });

    describe("Parameter validation", () => {
        it("should accept valid site objects", async () => {
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

            mockElectronAPI.sites.addSite.mockResolvedValueOnce(
                validSite as Site
            );

            await SiteService.addSite(validSite);

            expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
                validSite
            );
        });

        it("should handle sites with multiple monitors", async () => {
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

            mockElectronAPI.sites.addSite.mockResolvedValueOnce(
                siteWithMonitors as Site
            );

            const result = await SiteService.addSite(siteWithMonitors);

            expect(result).toEqual(siteWithMonitors);
        });

        it("should handle special characters in site data", async () => {
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

            mockElectronAPI.sites.addSite.mockResolvedValueOnce(
                siteWithSpecialChars as Site
            );

            const result = await SiteService.addSite(siteWithSpecialChars);

            expect(result).toEqual(siteWithSpecialChars);
        });

        it("should handle Unicode characters in site data", async () => {
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

            mockElectronAPI.sites.addSite.mockResolvedValueOnce(
                siteWithUnicode as Site
            );

            const result = await SiteService.addSite(siteWithUnicode);

            expect(result).toEqual(siteWithUnicode);
        });
    });

    describe("Error handling", () => {
        it("should propagate network errors", async () => {
            const networkError = new Error("Network error");
            mockElectronAPI.sites.getSites.mockRejectedValueOnce(networkError);

            await expect(SiteService.getSites()).rejects.toThrow(
                "Network error"
            );
        });

        it("should propagate validation errors from backend", async () => {
            const validationError = new Error("Invalid site data");
            mockElectronAPI.sites.addSite.mockRejectedValueOnce(
                validationError
            );

            await expect(
                SiteService.addSite({} as Omit<Site, "id">)
            ).rejects.toThrow("Invalid site data");
        });

        it("should handle timeout errors", async () => {
            const timeoutError = new Error("Request timeout");
            mockElectronAPI.sites.updateSite.mockRejectedValueOnce(
                timeoutError
            );

            await expect(SiteService.updateSite("test", {})).rejects.toThrow(
                "Request timeout"
            );
        });

        it("should handle database connection errors", async () => {
            const dbError = new Error("Database connection failed");
            mockElectronAPI.data.downloadSQLiteBackup.mockRejectedValueOnce(
                dbError
            );

            await expect(SiteService.downloadSQLiteBackup()).rejects.toThrow(
                "Database connection failed"
            );
        });
    });
});
