/**
 * Comprehensive tests for Sites domain API Includes fast-check property-based
 * testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

// Mock electron using vi.hoisted() to ensure proper initialization order
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

import {
    sitesApi,
    type SitesApiInterface,
} from "../../../preload/domains/sitesApi";

// Helper functions for creating properly formatted IPC responses
function createIpcResponse<T>(data: T): { success: true; data: T } {
    return { success: true, data };
}

describe("Sites Domain API", () => {
    let api: SitesApiInterface;

    beforeEach(() => {
        vi.clearAllMocks();
        api = sitesApi;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("API Structure Validation", () => {
        it("should expose all required sites methods", () => {
            const expectedMethods = [
                "addSite",
                "checkSiteNow",
                "deleteAllSites",
                "getSites",
                "removeSite",
                "startMonitoringForSite",
                "stopMonitoringForSite",
                "updateSite",
            ];

            for (const method of expectedMethods) {
                expect(api).toHaveProperty(method);
                expect(typeof api[method as keyof typeof api]).toBe("function");
            }
        });

        it("should reference the same sitesApi instance", () => {
            expect(api).toBe(sitesApi);
        });
    });

    describe("getSites", () => {
        it("should call IPC with correct channel and return array", async () => {
            const mockSites = [
                {
                    identifier: "site1",
                    name: "Test Site 1",
                    monitoring: true,
                    monitors: [],
                },
                {
                    identifier: "site2",
                    name: "Test Site 2",
                    monitoring: false,
                    monitors: [],
                },
            ];

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockSites)
            );

            const result = await api.getSites();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("get-sites");
            expect(result).toEqual(mockSites);
            expect(Array.isArray(result)).toBeTruthy();
        });

        it("should handle empty sites array", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse([]));

            const result = await api.getSites();

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBeTruthy();
        });

        it("should handle IPC errors", async () => {
            const error = new Error("Failed to get sites");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.getSites()).rejects.toThrow("Failed to get sites");
        });
    });

    describe("addSite", () => {
        it("should call IPC with site data and return created site", async () => {
            const siteData = {
                name: "New Site",
                url: "https://newsite.com",
                interval: 300,
            };
            const mockCreatedSite = {
                identifier: "new-site",
                name: "New Site",
                monitoring: false,
                monitors: [],
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockCreatedSite)
            );

            const result = await api.addSite(siteData);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "add-site",
                siteData
            );
            expect(result).toEqual(mockCreatedSite);
        });

        it("should handle site creation errors", async () => {
            const invalidSiteData = { name: "", url: "invalid-url" };
            const error = new Error("Invalid site configuration");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.addSite(invalidSiteData)).rejects.toThrow(
                "Invalid site configuration"
            );
        });
    });

    describe("updateSite", () => {
        it("should call IPC with site ID and update data", async () => {
            const siteId = "site-123";
            const updateData = { name: "Updated Site Name" };
            const mockUpdatedSite = {
                identifier: siteId,
                name: "Updated Site Name",
                monitoring: true,
                monitors: [],
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockUpdatedSite)
            );

            const result = await api.updateSite(siteId, updateData);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "update-site",
                siteId,
                updateData
            );
            expect(result).toEqual(mockUpdatedSite);
        });

        it("should handle update errors", async () => {
            const error = new Error("Site not found");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.updateSite("invalid", {})).rejects.toThrow(
                "Site not found"
            );
        });
    });

    describe("removeSite", () => {
        it("should call IPC with site ID and return removal status", async () => {
            const siteId = "site-to-remove";
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const result = await api.removeSite(siteId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "remove-site",
                siteId
            );
            expect(result).toBeTruthy();
        });

        it("should handle removal of non-existent site", async () => {
            const error = new Error("Site not found");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.removeSite("non-existent")).rejects.toThrow(
                "Site not found"
            );
        });
    });

    describe("checkSiteNow", () => {
        it("should call IPC with site ID and return updated site", async () => {
            const siteId = "site-check";
            const mockCheckedSite = {
                identifier: siteId,
                name: "Checked Site",
                monitoring: true,
                monitors: [],
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockCheckedSite)
            );

            const result = await api.checkSiteNow(siteId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "check-site-now",
                siteId
            );
            expect(result).toEqual(mockCheckedSite);
        });

        it("should handle check failures", async () => {
            const error = new Error("Check failed");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.checkSiteNow("failing-site")).rejects.toThrow(
                "Check failed"
            );
        });
    });

    describe("startMonitoringForSite and stopMonitoringForSite", () => {
        it("should start monitoring for a site", async () => {
            const siteId = "site-start";
            const mockSite = {
                identifier: siteId,
                name: "Started Site",
                monitoring: true,
                monitors: [],
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockSite)
            );

            const result = await api.startMonitoringForSite(siteId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "start-monitoring-for-site",
                siteId
            );
            expect(result).toEqual(mockSite);
        });

        it("should stop monitoring for a site", async () => {
            const siteId = "site-stop";
            const mockSite = {
                identifier: siteId,
                name: "Stopped Site",
                monitoring: false,
                monitors: [],
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockSite)
            );

            const result = await api.stopMonitoringForSite(siteId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "stop-monitoring-for-site",
                siteId
            );
            expect(result).toEqual(mockSite);
        });

        it("should handle monitoring control errors", async () => {
            const error = new Error("Monitoring control failed");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.startMonitoringForSite("site")).rejects.toThrow(
                "Monitoring control failed"
            );
            await expect(api.stopMonitoringForSite("site")).rejects.toThrow(
                "Monitoring control failed"
            );
        });
    });

    describe("deleteAllSites", () => {
        it("should call IPC and return count of deleted sites", async () => {
            const deletedCount = 5;
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(deletedCount)
            );

            const result = await api.deleteAllSites();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "delete-all-sites"
            );
            expect(result).toBe(deletedCount);
            expect(typeof result).toBe("number");
        });

        it("should handle deletion when no sites exist", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(0));

            const result = await api.deleteAllSites();

            expect(result).toBe(0);
        });

        it("should handle deletion errors", async () => {
            const error = new Error("Failed to delete sites");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.deleteAllSites()).rejects.toThrow(
                "Failed to delete sites"
            );
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various site configurations for adding", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        url: fc.webUrl(),
                    }),
                    async (siteConfig) => {
                        const mockSite = {
                            identifier: "generated-id",
                            name: siteConfig.name,
                            monitoring: false,
                            monitors: [],
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(mockSite)
                        );

                        const result = await api.addSite(siteConfig);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "add-site",
                            siteConfig
                        );
                        expect(result).toEqual(mockSite);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle various site IDs for operations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1, maxLength: 50 }),
                    async (siteId) => {
                        const mockSite = {
                            identifier: siteId,
                            name: "Test Site",
                            monitoring: true,
                            monitors: [],
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(mockSite)
                        );

                        const result = await api.checkSiteNow(siteId);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "check-site-now",
                            siteId
                        );
                        expect(result.identifier).toBe(siteId);
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle various update scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    fc.record({
                        name: fc.option(fc.string({ minLength: 1 })),
                    }),
                    async (siteId, updateData) => {
                        const mockUpdatedSite = {
                            identifier: siteId,
                            name: updateData.name || "Original Name",
                            monitoring: false,
                            monitors: [],
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(mockUpdatedSite)
                        );

                        const result = await api.updateSite(siteId, updateData);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "update-site",
                            siteId,
                            updateData
                        );
                        expect(result.identifier).toBe(siteId);
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle various error scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc
                            .string({ minLength: 1 })
                            .map((msg) => new Error(msg)),
                        fc.constant(new Error("Database error")),
                        fc.constant(new Error("Network error"))
                    ),
                    async (error) => {
                        mockIpcRenderer.invoke.mockRejectedValue(error);
                        await expect(api.getSites()).rejects.toThrow(
                            error.message
                        );
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    describe("Integration and workflow scenarios", () => {
        it("should handle complete site lifecycle", async () => {
            const siteData = { name: "Test Site", url: "https://test.com" };

            // Add site
            const mockCreatedSite = {
                identifier: "lifecycle-site",
                name: "Test Site",
                monitoring: false,
                monitors: [],
            };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(mockCreatedSite)
            );
            const created = await api.addSite(siteData);
            expect(created.identifier).toBe("lifecycle-site");

            // Start monitoring
            const mockMonitoringSite = { ...mockCreatedSite, monitoring: true };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(mockMonitoringSite)
            );
            const monitoring = await api.startMonitoringForSite(
                created.identifier
            );
            expect(monitoring.monitoring).toBeTruthy();

            // Check site
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(mockMonitoringSite)
            );
            const checked = await api.checkSiteNow(created.identifier);
            expect(checked.identifier).toBe(created.identifier);

            // Update site
            const updateData = { name: "Updated Test Site" };
            const mockUpdatedSite = {
                ...mockMonitoringSite,
                name: "Updated Test Site",
            };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(mockUpdatedSite)
            );
            const updated = await api.updateSite(
                created.identifier,
                updateData
            );
            expect(updated.name).toBe("Updated Test Site");

            // Stop monitoring
            const mockStoppedSite = { ...mockUpdatedSite, monitoring: false };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(mockStoppedSite)
            );
            const stopped = await api.stopMonitoringForSite(created.identifier);
            expect(stopped.monitoring).toBeFalsy();

            // Remove site
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(true)
            );
            const removed = await api.removeSite(created.identifier);
            expect(removed).toBeTruthy();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(6);
        });

        it("should handle batch site operations", async () => {
            const mockSites = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitoring: false,
                    monitors: [],
                },
                {
                    identifier: "site2",
                    name: "Site 2",
                    monitoring: false,
                    monitors: [],
                },
                {
                    identifier: "site3",
                    name: "Site 3",
                    monitoring: false,
                    monitors: [],
                },
            ];

            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(mockSites)
            );
            const sites = await api.getSites();
            expect(sites).toHaveLength(3);

            // Start monitoring for all sites
            for (const site of sites) {
                const mockMonitoring = { ...site, monitoring: true };
                mockIpcRenderer.invoke.mockResolvedValueOnce(
                    createIpcResponse(mockMonitoring)
                );
                await api.startMonitoringForSite(site.identifier);
            }

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(4); // 1 get + 3 start
        });

        it("should handle error recovery in workflows", async () => {
            const siteId = "error-recovery-site";

            // First operation fails
            mockIpcRenderer.invoke.mockRejectedValueOnce(
                new Error("Temporary failure")
            );
            await expect(api.checkSiteNow(siteId)).rejects.toThrow(
                "Temporary failure"
            );

            // Retry succeeds
            const mockSite = {
                identifier: siteId,
                name: "Recovery Site",
                monitoring: true,
                monitors: [],
            };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(mockSite)
            );
            const recovered = await api.checkSiteNow(siteId);
            expect(recovered.identifier).toBe(siteId);
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle network connectivity issues", async () => {
            const networkError = new Error("Network unreachable");
            mockIpcRenderer.invoke.mockRejectedValue(networkError);

            await expect(api.getSites()).rejects.toThrow("Network unreachable");
            await expect(api.addSite({})).rejects.toThrow(
                "Network unreachable"
            );
            await expect(api.checkSiteNow("site")).rejects.toThrow(
                "Network unreachable"
            );
        });

        it("should handle database errors", async () => {
            const dbError = new Error("Database connection failed");
            mockIpcRenderer.invoke.mockRejectedValue(dbError);

            await expect(api.getSites()).rejects.toThrow(
                "Database connection failed"
            );
            await expect(api.deleteAllSites()).rejects.toThrow(
                "Database connection failed"
            );
        });

        it("should handle malformed responses", async () => {
            const malformedSite = { invalid: "structure" };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(malformedSite)
            );

            const result = await api.checkSiteNow("malformed");
            expect(result).toEqual(malformedSite);
        });

        it("should handle very large site datasets", async () => {
            const largeSiteList = Array.from({ length: 1000 }, (_, i) => ({
                identifier: `site-${i}`,
                name: `Site ${i}`,
                monitoring: i % 2 === 0,
                monitors: [],
            }));

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(largeSiteList)
            );

            const result = await api.getSites();
            expect(result).toHaveLength(1000);
            expect(Array.isArray(result)).toBeTruthy();
        });

        it("should handle concurrent site operations", async () => {
            const siteIds = [
                "site1",
                "site2",
                "site3",
                "site4",
                "site5",
            ];

            mockIpcRenderer.invoke.mockImplementation((_, siteId) =>
                Promise.resolve(
                    createIpcResponse({
                        identifier: siteId,
                        name: `Site ${siteId}`,
                        monitoring: true,
                        monitors: [],
                    })
                )
            );

            const promises = siteIds.map((id) => api.checkSiteNow(id));
            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(5);
        });

        it("should handle timeout scenarios", async () => {
            const timeoutError = new Error("Operation timed out");
            mockIpcRenderer.invoke.mockRejectedValue(timeoutError);

            await expect(api.checkSiteNow("timeout-site")).rejects.toThrow(
                "Operation timed out"
            );
        });
    });

    describe("Type safety and contract validation", () => {
        it("should maintain proper typing for all return values", async () => {
            const mockSite = {
                identifier: "typed-site",
                name: "Typed Site",
                monitoring: true,
                monitors: [],
            };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockSite)
            );

            const addResult = await api.addSite({});
            const checkResult = await api.checkSiteNow("site");
            const updateResult = await api.updateSite("site", {});
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));
            const removeResult = await api.removeSite("site");

            expect(typeof addResult.identifier).toBe("string");
            expect(typeof checkResult.name).toBe("string");
            expect(typeof updateResult.monitoring).toBe("boolean");
            expect(removeResult).toBeTruthy();

            // Array operation should return array
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse([mockSite])
            );
            const sitesResult = await api.getSites();
            expect(Array.isArray(sitesResult)).toBeTruthy();

            // Delete operation should return number
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(5));
            const deleteResult = await api.deleteAllSites();
            expect(typeof deleteResult).toBe("number");
        });

        it("should handle function context properly", async () => {
            const { getSites, addSite, checkSiteNow } = api;

            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse([]));
            const sites = await getSites();
            expect(Array.isArray(sites)).toBeTruthy();

            const mockSite = {
                identifier: "test",
                name: "Test",
                monitoring: false,
                monitors: [],
            };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockSite)
            );

            const added = await addSite({});
            const checked = await checkSiteNow("test");

            expect(added).toEqual(mockSite);
            expect(checked).toEqual(mockSite);
        });

        it("should return Promise types correctly", () => {
            const promises = [
                api.getSites(),
                api.addSite({}),
                api.checkSiteNow("site"),
                api.deleteAllSites(),
            ];

            for (const promise of promises) {
                expect(promise).toBeInstanceOf(Promise);
            }
        });
    });
});
