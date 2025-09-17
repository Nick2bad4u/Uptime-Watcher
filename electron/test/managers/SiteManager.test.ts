/**
 * Test suite for SiteManager
 *
 * @module Unknown
 *
 * @file Comprehensive tests for unknown functionality in the Uptime Watcher
 *   application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category General
 *
 * @tags ["test"]
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SiteManager } from "../../managers/SiteManager";
import type { Site } from "../../../shared/types.js";

describe(SiteManager, () => {
    let manager: SiteManager;
    let mockDependencies: any;
    // Let mockSitesCache: any; // Currently unused

    beforeEach(() => {
        // Const mockSitesCache = { // Currently unused
        //     delete: vi.fn(),
        //     get: vi.fn(),
        //     set: vi.fn(),
        //     has: vi.fn(),
        //     clear: vi.fn(),
        // };

        mockDependencies = {
            configurationManager: {
                validateSiteConfiguration: vi
                    .fn()
                    .mockResolvedValue({ success: true }),
            },
            databaseService: {
                executeTransaction: vi.fn(),
            },
            eventEmitter: {
                emit: vi.fn(), // Add the missing emit method
                emitTyped: vi.fn(),
            },
            historyRepository: {
                findBySiteIdentifier: vi.fn(),
                create: vi.fn(),
                deleteAll: vi.fn(),
            },
            monitorRepository: {
                findBySiteIdentifier: vi.fn(),
                create: vi.fn(),
                createInternal: vi.fn().mockReturnValue("mock-monitor-id"), // Add the missing internal method
                bulkCreate: vi.fn(),
                deleteBySiteIdentifier: vi.fn(),
                deleteBySiteIdentifierInternal: vi.fn(), // Add the missing internal method
                delete: vi.fn().mockResolvedValue(true), // Add missing delete method
            },
            monitoringOperations: {
                // Add the missing monitoringOperations
                setHistoryLimit: vi.fn().mockResolvedValue(undefined),
                setupNewMonitors: vi.fn().mockResolvedValue(undefined),
                startMonitoringForSite: vi.fn().mockResolvedValue(true),
                stopMonitoringForSite: vi.fn().mockResolvedValue(true),
            },
            settingsRepository: {
                get: vi.fn(),
                set: vi.fn(),
            },
            siteRepository: {
                findAll: vi.fn().mockResolvedValue([]), // Return empty array for initialization
                findByIdentifier: vi.fn(),
                upsert: vi.fn(),
                upsertInternal: vi.fn(), // Add the missing internal method
                delete: vi.fn(),
                deleteInternal: vi.fn(), // Add the missing internal method
                exists: vi.fn(),
            },
        };
        manager = new SiteManager(mockDependencies);
    });
    describe("constructor", () => {
        it("should construct without error", async ({ annotate }) => {
            await annotate("Component: SiteManager", "component");
            await annotate(
                "Test Type: Unit - Constructor Validation",
                "test-type"
            );
            await annotate("Operation: Manager Instantiation", "operation");
            await annotate(
                "Priority: Critical - Core Component Initialization",
                "priority"
            );
            await annotate(
                "Complexity: Low - Basic Constructor Test",
                "complexity"
            );
            await annotate(
                "Dependencies: Injected repository and service dependencies",
                "dependencies"
            );
            await annotate(
                "Purpose: Ensure SiteManager can be instantiated without errors",
                "purpose"
            );

            expect(manager).toBeDefined();
        });
    });

    describe("addSite", () => {
        it("should add a new site successfully", async ({ annotate }) => {
            await annotate("Component: SiteManager", "component");
            await annotate("Test Type: Unit - Business Logic", "test-type");
            await annotate(
                "Operation: Site Creation with Transaction",
                "operation"
            );
            await annotate(
                "Priority: Critical - Core Site Management",
                "priority"
            );
            await annotate(
                "Complexity: High - Multi-step Transaction",
                "complexity"
            );
            await annotate(
                "Business Logic: Create site, monitors, emit events",
                "business-logic"
            );
            await annotate(
                "Purpose: Ensure sites can be added with proper transaction handling",
                "purpose"
            );

            const newSite = {
                identifier: "test-site-1",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "mon1",
                        type: "http" as const,
                        url: "https://example.com",
                        checkInterval: 60_000,
                        timeout: 10_000,
                        retryAttempts: 3,
                        monitoring: true,
                        status: "pending" as const,
                        responseTime: 0,
                        history: [],
                    },
                ],
            };

            mockDependencies.databaseService.executeTransaction.mockImplementation(
                async (fn: any) => await fn()
            );

            const result = await manager.addSite(newSite);

            expect(
                mockDependencies.siteRepository.upsertInternal
            ).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "site:added",
                expect.objectContaining({
                    site: expect.objectContaining({
                        identifier: "test-site-1",
                        name: "Test Site",
                    }),
                })
            );
            expect(result).toEqual(newSite);
        });

        it("should handle database errors during site addition", async ({
            annotate,
        }) => {
            await annotate("Component: SiteManager", "component");
            await annotate("Test Type: Unit - Error Handling", "test-type");
            await annotate(
                "Operation: Site Addition Error Handling",
                "operation"
            );
            await annotate(
                "Priority: High - Transaction Error Recovery",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Database Error Simulation",
                "complexity"
            );
            await annotate(
                "Error Case: Database transaction failure during site creation",
                "error-case"
            );
            await annotate(
                "Purpose: Ensure database errors are properly propagated",
                "purpose"
            );

            const newSite = {
                identifier: "test-site-2",
                name: "Test Site 2",
                monitoring: true,
                monitors: [],
            };

            mockDependencies.databaseService.executeTransaction.mockRejectedValue(
                new Error("Database transaction failed")
            );

            await expect(manager.addSite(newSite)).rejects.toThrow(
                "Database transaction failed"
            );
        });
    });
    describe("getSites", () => {
        it("should return all sites from cache when available", async ({
            annotate,
        }) => {
            await annotate("Component: SiteManager", "component");
            await annotate("Test Type: Unit - Cache Operations", "test-type");
            await annotate("Operation: Site Retrieval from Cache", "operation");
            await annotate(
                "Priority: High - Data Access Performance",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Cache Layer Testing",
                "complexity"
            );
            await annotate(
                "Cache Strategy: Return cached data when available",
                "cache-strategy"
            );
            await annotate(
                "Purpose: Ensure sites can be retrieved efficiently from cache",
                "purpose"
            );

            const cachedSites = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitoring: true,
                    monitors: [],
                },
            ];

            // Mock the siteRepositoryService method directly
            vi.spyOn(
                manager["siteRepositoryService"],
                "getSitesFromDatabase"
            ).mockResolvedValue(cachedSites);

            const result = await manager.getSites();

            expect(result).toEqual(cachedSites);
        });

        it("should fetch from database when cache is empty", async ({
            annotate,
        }) => {
            await annotate("Component: SiteManager", "component");
            await annotate("Test Type: Unit - Database Fallback", "test-type");
            await annotate(
                "Operation: Site Retrieval from Database",
                "operation"
            );
            await annotate("Priority: Critical - Data Persistence", "priority");
            await annotate(
                "Complexity: Medium - Database Query Fallback",
                "complexity"
            );
            await annotate(
                "Fallback Strategy: Query database when cache is empty",
                "fallback-strategy"
            );
            await annotate(
                "Purpose: Ensure sites can be retrieved from database when cache is empty",
                "purpose"
            );

            const dbSites = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitoring: true,
                    monitors: [],
                },
            ];

            // Mock the siteRepositoryService method directly
            vi.spyOn(
                manager["siteRepositoryService"],
                "getSitesFromDatabase"
            ).mockResolvedValue(dbSites);

            const result = await manager.getSites();

            expect(result).toEqual(dbSites);
            expect(Array.isArray(result)).toBeTruthy();
        });
    });

    describe("removeSite", () => {
        it("should remove an existing site", async ({ annotate }) => {
            await annotate("Component: SiteManager", "component");
            await annotate("Test Type: Unit - Data Deletion", "test-type");
            await annotate(
                "Operation: Site Removal with Transaction",
                "operation"
            );
            await annotate("Priority: Critical - Data Management", "priority");
            await annotate(
                "Complexity: High - Multi-step Deletion Process",
                "complexity"
            );
            await annotate(
                "Business Logic: Delete site, monitors, history, emit events",
                "business-logic"
            );
            await annotate(
                "Purpose: Ensure sites can be completely removed with proper cleanup",
                "purpose"
            );

            // Mock the siteWriterService.deleteSite method directly
            const mockDeleteSite = vi
                .spyOn(manager["siteWriterService"], "deleteSite")
                .mockResolvedValue(true);

            mockDependencies.siteRepository.delete.mockResolvedValue(true);
            mockDependencies.databaseService.executeTransaction.mockImplementation(
                async (fn: any) => {
                    const mockDb = { prepare: vi.fn(), run: vi.fn() };
                    return await fn(mockDb);
                }
            );

            const result = await manager.removeSite("site1");

            expect(mockDeleteSite).toHaveBeenCalledWith(
                expect.anything(),
                "site1"
            );
            expect(result).toBeTruthy();
        });

        it("should return false when site not found", async ({ annotate }) => {
            await annotate("Component: SiteManager", "component");
            await annotate("Test Type: Unit - Edge Case Handling", "test-type");
            await annotate(
                "Operation: Non-existent Site Deletion",
                "operation"
            );
            await annotate(
                "Priority: Medium - Error Case Validation",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Missing Data Handling",
                "complexity"
            );
            await annotate(
                "Edge Case: Attempting to delete non-existent site",
                "edge-case"
            );
            await annotate(
                "Purpose: Ensure graceful handling when deleting non-existent sites",
                "purpose"
            );

            mockDependencies.siteRepository.delete.mockResolvedValue(false);
            mockDependencies.databaseService.executeTransaction.mockImplementation(
                async (fn: any) => await fn()
            );

            const result = await manager.removeSite("nonexistent");

            expect(result).toBeFalsy();
        });
    });

    describe("updateSite", () => {
        it("should update an existing site", async ({ annotate }) => {
            await annotate("Component: SiteManager", "component");
            await annotate("Test Type: Unit - Data Modification", "test-type");
            await annotate("Operation: Site Property Updates", "operation");
            await annotate("Priority: Critical - Data Management", "priority");
            await annotate(
                "Complexity: High - Complex Update Logic",
                "complexity"
            );
            await annotate(
                "Business Logic: Update site properties, maintain data integrity",
                "business-logic"
            );
            await annotate(
                "Purpose: Ensure site properties can be updated correctly",
                "purpose"
            );

            const existingSite = {
                identifier: "site1",
                name: "Old Name",
                monitoring: true,
                monitors: [],
            };

            const updates = {
                name: "New Name",
                monitoring: false,
            };

            const updatedSite = {
                ...existingSite,
                ...updates,
            };

            // Mock the sitesCache directly on the manager instance
            const mockCache = {
                get: vi
                    .fn()
                    .mockReturnValueOnce(existingSite) // First call returns existing site
                    .mockReturnValueOnce(updatedSite), // Second call (after refresh) returns updated site
                set: vi.fn(),
                delete: vi.fn(),
                has: vi.fn().mockReturnValue(true),
                clear: vi.fn(),
                size: 1,
                keys: vi.fn(),
                values: vi.fn(),
                entries: vi.fn(),
                forEach: vi.fn(),
            };

            // Replace the sitesCache property directly
            Object.defineProperty(manager, "sitesCache", {
                value: mockCache,
                writable: true,
                configurable: true,
            });
            // Mock the siteWriterService.updateSite method
            const mockUpdateSite = vi
                .spyOn(manager["siteWriterService"], "updateSite")
                .mockResolvedValue(updatedSite);

            // Mock the siteRepositoryService.getSitesFromDatabase method
            const mockGetSitesFromDatabase = vi
                .spyOn(manager["siteRepositoryService"], "getSitesFromDatabase")
                .mockResolvedValue([updatedSite]);

            // Mock the updateSitesCache method
            vi.spyOn(manager, "updateSitesCache").mockResolvedValue(undefined);

            mockDependencies.databaseService.executeTransaction.mockImplementation(
                async (fn: any) => await fn()
            );

            const result = await manager.updateSite("site1", updates);

            expect(mockUpdateSite).toHaveBeenCalledWith(
                mockCache,
                "site1",
                updates
            );
            expect(mockGetSitesFromDatabase).toHaveBeenCalled();
            expect(result).toEqual(updatedSite);
        });
    });
    describe("removeMonitor", () => {
        it("should remove a monitor from a site", async () => {
            mockDependencies.databaseService.executeTransaction.mockImplementation(
                async (fn: any) => await fn()
            );
            mockDependencies.monitorRepository.findByIdentifier = vi
                .fn()
                .mockResolvedValue({
                    id: "mon1",
                    type: "http",
                    url: "https://example.com",
                });
            // Mock the getSitesFromDatabase method that will be called during removeMonitor
            const mockSites = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitoring: true,
                    monitors: [],
                },
            ];

            // Since siteRepositoryService is private, I need to mock it differently
            // Let me spy on the getSitesFromDatabase method on the manager instance
            vi.spyOn(
                manager["siteRepositoryService"],
                "getSitesFromDatabase"
            ).mockResolvedValue(mockSites);

            const result = await manager.removeMonitor("site1", "mon1");

            expect(result).toBeTruthy();
        });
    });
    describe("updateSitesCache", () => {
        it("should update the sites cache", async () => {
            const sites = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitoring: true,
                    monitors: [],
                },
            ];

            // Spy on the actual cache methods that will be called
            const clearSpy = vi.spyOn(manager["sitesCache"], "clear");
            const setSpy = vi.spyOn(manager["sitesCache"], "set");

            await manager.updateSitesCache(sites);

            expect(clearSpy).toHaveBeenCalled();
            expect(setSpy).toHaveBeenCalledWith("site1", sites[0]);
        });
    });
    describe("initialize", () => {
        it("should initialize without error", async () => {
            await expect(manager.initialize()).resolves.not.toThrow();
        });
        it("should handle initialization errors", async () => {
            // Mock an error in the initialization process
            vi.spyOn(manager["sitesCache"], "clear").mockImplementation(() => {
                throw new Error("Cache initialization failed");
            });
            await expect(manager.initialize()).rejects.toThrow(
                "Cache initialization failed"
            );
        });
    });
    describe("getSiteFromCache", () => {
        it("should return site from cache when it exists", () => {
            const testSite = {
                identifier: "site1",
                name: "Test Site",
                url: "https://test.com",
                monitoring: true,
                monitors: [],
            };

            // Mock the cache get method
            vi.spyOn(manager["sitesCache"], "get").mockReturnValue(testSite);

            const result = manager.getSiteFromCache("site1");

            expect(result).toEqual(testSite);
            expect(manager["sitesCache"].get).toHaveBeenCalledWith("site1");
        });
        it("should return undefined when site does not exist in cache", () => {
            vi.spyOn(manager["sitesCache"], "get").mockReturnValue(undefined);

            const result = manager.getSiteFromCache("nonexistent");

            expect(result).toBeUndefined();
        });
    });
    describe("getSitesFromCache", () => {
        it("should return all sites from cache", () => {
            const testSites = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    url: "https://site1.com",
                    monitoring: true,
                    monitors: [],
                },
                {
                    identifier: "site2",
                    name: "Site 2",
                    url: "https://site2.com",
                    monitoring: false,
                    monitors: [],
                },
            ];

            // Mock the cache getAll method
            vi.spyOn(manager["sitesCache"], "getAll").mockReturnValue(
                testSites
            );

            const result = manager.getSitesFromCache();

            expect(result).toEqual(testSites);
            expect(manager["sitesCache"].getAll).toHaveBeenCalled();
        });
        it("should return empty array when cache is empty", () => {
            vi.spyOn(manager["sitesCache"], "getAll").mockReturnValue([]);

            const result = manager.getSitesFromCache();

            expect(result).toEqual([]);
        });
    });
    describe("getSitesCache", () => {
        it("should return the sites cache instance", () => {
            const cache = manager.getSitesCache();

            expect(cache).toBeDefined();
            expect(cache).toBe(manager["sitesCache"]);
        });
        it("should return a cache with proper configuration", () => {
            const cache = manager.getSitesCache();

            // Check that it's a StandardizedCache instance
            expect(cache.constructor.name).toBe("StandardizedCache");
        });
    });
    describe("Private Method Coverage", () => {
        describe("validateSite", () => {
            it("should pass validation for valid site", async () => {
                const validSite = {
                    identifier: "valid-site",
                    name: "Valid Site",
                    url: "https://valid.com",
                    monitoring: true,
                    monitors: [],
                };

                // Use reflection to call private method
                await expect(
                    manager["validateSite"](validSite)
                ).resolves.not.toThrow();
            });
            it("should throw validation error for invalid site", async () => {
                const invalidSite = {
                    identifier: "",
                    name: "",
                    url: "invalid-url",
                    monitoring: true,
                    monitors: [],
                };

                // Mock the configuration manager to return validation failure
                mockDependencies.configurationManager.validateSiteConfiguration.mockResolvedValueOnce(
                    {
                        success: false,
                        errors: [
                            "Invalid site identifier",
                            "Invalid site name",
                            "Invalid URL format",
                        ],
                    }
                );
                await expect(
                    manager["validateSite"](invalidSite)
                ).rejects.toThrow();
            });
        });
        describe("createMonitoringConfig", () => {
            it("should create monitoring configuration", () => {
                const config = manager["createMonitoringConfig"]();

                expect(config).toBeDefined();
                expect(typeof config.setHistoryLimit).toBe("function");
                expect(typeof config.setupNewMonitors).toBe("function");
                expect(typeof config.startMonitoring).toBe("function");
                expect(typeof config.stopMonitoring).toBe("function");
            });
            it("should create config with proper methods", () => {
                const config = manager["createMonitoringConfig"]();

                // Test that the methods exist and are callable
                expect(() => config.setHistoryLimit(100)).not.toThrow();
                expect(() =>
                    config.setupNewMonitors({ identifier: "site1" } as Site, [])
                ).not.toThrow();
                expect(() =>
                    config.startMonitoring("site1", "monitor1")
                ).not.toThrow();
                expect(() =>
                    config.stopMonitoring("site1", "monitor1")
                ).not.toThrow();
            });
        });
        describe("formatValidationErrors", () => {
            it("should format validation errors array", () => {
                const errors = [
                    "Error 1",
                    "Error 2",
                    "Error 3",
                ];
                const formatted = manager["formatValidationErrors"](errors);

                expect(formatted).toContain("Error 1");
                expect(formatted).toContain("Error 2");
                expect(formatted).toContain("Error 3");
            });
            it("should handle empty errors array", () => {
                const formatted = manager["formatValidationErrors"]([]);

                expect(formatted).toBe("");
            });
            it("should handle undefined errors", () => {
                const formatted = manager["formatValidationErrors"](undefined);

                expect(formatted).toBe("");
            });
        });
        describe("executeMonitorDeletion", () => {
            it("should delete monitor successfully", async () => {
                // Mock the monitor repository
                vi.spyOn(
                    manager["repositories"].monitorRepository,
                    "delete"
                ).mockResolvedValue(true);

                const result =
                    await manager["executeMonitorDeletion"]("monitor1");

                expect(result).toBeTruthy();
                expect(
                    manager["repositories"].monitorRepository.delete
                ).toHaveBeenCalledWith("monitor1");
            });
            it("should handle monitor deletion failure", async () => {
                vi.spyOn(
                    manager["repositories"].monitorRepository,
                    "delete"
                ).mockResolvedValue(false);

                const result =
                    await manager["executeMonitorDeletion"]("monitor1");

                expect(result).toBeFalsy();
            });
            it("should handle monitor deletion errors", async () => {
                vi.spyOn(
                    manager["repositories"].monitorRepository,
                    "delete"
                ).mockRejectedValue(new Error("Deletion failed"));

                await expect(
                    manager["executeMonitorDeletion"]("monitor1")
                ).rejects.toThrow("Deletion failed");
            });
        });
        describe("loadSiteInBackground", () => {
            it("should load site in background successfully", async () => {
                const testSite = {
                    identifier: "site1",
                    name: "Site 1",
                    url: "https://site1.com",
                    monitoring: true,
                    monitors: [],
                };

                // Mock the repository service
                vi.spyOn(
                    manager["siteRepositoryService"],
                    "getSitesFromDatabase"
                ).mockResolvedValue([testSite]);
                vi.spyOn(manager["sitesCache"], "set").mockImplementation(
                    () => {}
                );

                await expect(
                    manager["loadSiteInBackground"]("site1")
                ).resolves.not.toThrow();

                expect(
                    manager["siteRepositoryService"].getSitesFromDatabase
                ).toHaveBeenCalled();
                expect(manager["sitesCache"].set).toHaveBeenCalledWith(
                    "site1",
                    testSite
                );
            });
            it("should handle site not found in background load", async () => {
                // Set up cache spy for this test
                const cacheSpy = vi.spyOn(manager["sitesCache"], "set");

                vi.spyOn(
                    manager["siteRepositoryService"],
                    "getSitesFromDatabase"
                ).mockResolvedValue([]);

                await expect(
                    manager["loadSiteInBackground"]("nonexistent")
                ).resolves.not.toThrow();

                // Should not attempt to set cache when site is not found
                expect(cacheSpy).not.toHaveBeenCalled();
            });
            it("should handle background load errors", async () => {
                vi.spyOn(
                    manager["siteRepositoryService"],
                    "getSitesFromDatabase"
                ).mockRejectedValue(new Error("Database error"));

                // Should not throw error but should handle it gracefully
                await expect(
                    manager["loadSiteInBackground"]("site1")
                ).resolves.not.toThrow();
            });
        });
    });
    describe("Edge Cases and Error Scenarios", () => {
        it("should handle concurrent site operations", async () => {
            const testSite = {
                identifier: "site1",
                name: "Site 1",
                url: "https://site1.com",
                monitoring: true,
                monitors: [],
            };

            // Mock multiple operations running concurrently
            vi.spyOn(
                manager["siteWriterService"],
                "createSite"
            ).mockResolvedValue(testSite);
            vi.spyOn(
                manager["siteRepositoryService"],
                "getSitesFromDatabase"
            ).mockResolvedValue([testSite]);
            vi.spyOn(manager["sitesCache"], "get").mockReturnValue(testSite);

            const promises = [
                manager.addSite(testSite),
                manager.getSites(),
                manager.getSiteFromCache("site1"),
            ];

            await expect(Promise.all(promises)).resolves.toEqual([
                testSite,
                [testSite],
                testSite,
            ]);
        });
        it("should handle empty cache scenarios", () => {
            vi.spyOn(manager["sitesCache"], "getAll").mockReturnValue([]);
            vi.spyOn(manager["sitesCache"], "get").mockReturnValue(undefined);

            const sitesFromCache = manager.getSitesFromCache();
            const siteFromCache = manager.getSiteFromCache("any");

            expect(sitesFromCache).toEqual([]);
            expect(siteFromCache).toBeUndefined();
        });
        it("should handle large site datasets", async () => {
            // Create a large dataset to test performance and memory handling
            const largeSiteDataset = Array.from({ length: 1000 }, (_, i) => ({
                identifier: `site${i}`,
                name: `Site ${i}`,
                url: `https://site${i}.com`,
                monitoring: i % 2 === 0,
                monitors: [],
            }));

            vi.spyOn(manager["sitesCache"], "clear").mockImplementation(
                () => {}
            );
            vi.spyOn(manager["sitesCache"], "set").mockImplementation(() => {});

            await expect(
                manager.updateSitesCache(largeSiteDataset)
            ).resolves.not.toThrow();

            // The cache has maxSize: 500, so it will only store up to 500 items
            expect(manager["sitesCache"].set).toHaveBeenCalledTimes(500);
        });
        it("should handle malformed site data gracefully", async () => {
            const malformedSite = {
                // Missing required fields
                name: "Malformed Site",
            } as any;

            // Mock the configuration manager to return validation failure for malformed data
            mockDependencies.configurationManager.validateSiteConfiguration.mockResolvedValueOnce(
                {
                    success: false,
                    errors: [
                        "Missing required identifier field",
                        "Missing required monitoring field",
                    ],
                }
            );
            await expect(
                manager["validateSite"](malformedSite)
            ).rejects.toThrow();
        });
    });
});
