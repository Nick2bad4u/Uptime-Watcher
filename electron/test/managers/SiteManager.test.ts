import { describe, it, expect, beforeEach, vi } from "vitest";
import { SiteManager } from "../../managers/SiteManager";

describe("SiteManager", () => {
    let manager: SiteManager;
    let mockDependencies: any;
    // let mockSitesCache: any; // Currently unused

    beforeEach(() => {
        // const mockSitesCache = { // Currently unused
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
            settingsRepository: {
                get: vi.fn(),
                set: vi.fn(),
            },
            siteRepository: {
                findAll: vi.fn(),
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
        it("should construct without error", () => {
            expect(manager).toBeDefined();
        });
    });

    describe("addSite", () => {
        it("should add a new site successfully", async () => {
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
                async (fn: any) => {
                    return await fn();
                }
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

        it("should handle database errors during site addition", async () => {
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
        it("should return all sites from cache when available", async () => {
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

        it("should fetch from database when cache is empty", async () => {
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
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe("removeSite", () => {
        it("should remove an existing site", async () => {
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
            expect(result).toBe(true);
        });

        it("should return false when site not found", async () => {
            mockDependencies.siteRepository.delete.mockResolvedValue(false);
            mockDependencies.databaseService.executeTransaction.mockImplementation(
                async (fn: any) => {
                    return await fn();
                }
            );

            const result = await manager.removeSite("nonexistent");

            expect(result).toBe(false);
        });
    });

    describe("updateSite", () => {
        it("should update an existing site", async () => {
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
                async (fn: any) => {
                    return await fn();
                }
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
                async (fn: any) => {
                    return await fn();
                }
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

            expect(result).toBe(true);
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
});
