/**
 * Test suite for SiteRepository
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
import { fc } from "@fast-check/vitest";
import { SiteRepository } from "../../../services/database/SiteRepository";

describe("SiteRepository", () => {
    let repository: SiteRepository;
    let mockDatabaseService: any;
    let mockDatabase: any;

    beforeEach(() => {
        // Create mock database with direct methods (like node-sqlite3-wasm)
        mockDatabase = {
            all: vi.fn().mockReturnValue([]),
            get: vi.fn().mockReturnValue(undefined),
            run: vi.fn().mockReturnValue({ changes: 1 }),
            prepare: vi.fn().mockReturnValue({
                all: vi.fn().mockReturnValue([]),
                get: vi.fn().mockReturnValue(undefined),
                run: vi.fn().mockReturnValue({ changes: 1 }),
                finalize: vi.fn(),
            }),
        };

        mockDatabaseService = {
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
            executeTransaction: vi
                .fn()
                .mockImplementation(async (callback) => callback(mockDatabase)),
        };

        repository = new SiteRepository({
            databaseService: mockDatabaseService,
        });
    });
    describe("findAll", () => {
        it("should find all sites", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockSites = [
                { identifier: "site1", name: "Site 1", monitoring: 1 },
                { identifier: "site2", name: "Site 2", monitoring: 0 },
            ];

            const mockDb = mockDatabaseService.getDatabase();
            mockDb.all.mockReturnValue(mockSites);

            const result = await repository.findAll();

            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
            expect(mockDb.all).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
        it("should handle errors when finding all sites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const mockDb = mockDatabaseService.getDatabase();
            mockDb.all.mockImplementation(() => {
                throw new Error("Database error");
            });
            await expect(repository.findAll()).rejects.toThrow(
                "Database error"
            );
        });
    });
    describe("findByIdentifier", () => {
        it("should find a site by identifier", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockSite = {
                identifier: "site1",
                name: "Site 1",
                monitoring: true,
            };

            mockDatabase.get.mockReturnValue(mockSite);

            const result = await repository.findByIdentifier("site1");

            expect(mockDatabase.get).toHaveBeenCalledWith(
                expect.stringContaining("SELECT"),
                ["site1"]
            );
            expect(result).toEqual(mockSite);
        });
        it("should return undefined when site not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockDatabase.get.mockReturnValue(undefined);

            const result = await repository.findByIdentifier("nonexistent");

            expect(result).toBeUndefined();
        });
    });
    describe("upsert", () => {
        it("should upsert a site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const siteData = {
                identifier: "site1",
                name: "New Site",
                monitoring: true,
            };

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback: any) => callback(mockDatabase)
            );

            await repository.upsert(siteData);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                expect.stringContaining("INSERT"),
                expect.any(Array)
            );
        });
        it("should handle upsert errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const siteData = {
                identifier: "site1",
                name: "New Site",
                monitoring: true,
            };

            // Mock getDatabase to throw an error
            mockDatabaseService.getDatabase.mockImplementation(() => {
                throw new Error("Upsert failed");
            });
            await expect(repository.upsert(siteData)).rejects.toThrow(
                "Upsert failed"
            );
        });
    });
    describe("delete", () => {
        it("should delete a site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            const mockPrepare = vi.fn().mockReturnValue({
                run: vi.fn().mockReturnValue({ changes: 1 }),
                finalize: vi.fn(),
            });
            mockDatabaseService.executeTransaction.mockImplementation(
                (callback: any) => {
                    const mockDb = {
                        prepare: mockPrepare,
                        run: vi.fn().mockReturnValue({ changes: 1 }),
                    };
                    return callback(mockDb);
                }
            );

            const result = await repository.delete("site1");

            expect(result).toBe(true);
        });
        it("should return false when site not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockPrepare = vi.fn().mockReturnValue({
                run: vi.fn().mockReturnValue({ changes: 0 }),
                finalize: vi.fn(),
            });
            mockDatabaseService.executeTransaction.mockImplementation(
                (callback: any) => {
                    const mockDb = {
                        prepare: mockPrepare,
                        run: vi.fn().mockReturnValue({ changes: 0 }),
                    };
                    return callback(mockDb);
                }
            );

            const result = await repository.delete("nonexistent");

            expect(result).toBe(false);
        });
        it("should handle deletion errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.executeTransaction.mockImplementation(() => {
                throw new Error("Delete failed");
            });
            await expect(repository.delete("site1")).rejects.toThrow(
                "Delete failed"
            );
        });
    });
    describe("deleteAll", () => {
        it("should delete all sites", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            const mockPrepare = vi.fn().mockReturnValue({
                run: vi.fn().mockReturnValue({ changes: 3 }),
                finalize: vi.fn(),
            });
            const mockRun = vi.fn();

            mockDatabaseService.executeTransaction.mockImplementation(
                (callback: any) => {
                    const mockDb = {
                        prepare: mockPrepare,
                        run: mockRun,
                    };
                    return callback(mockDb);
                }
            );

            await repository.deleteAll();

            expect(mockRun).toHaveBeenCalledWith(
                expect.stringContaining("DELETE")
            );
        });
    });
    describe("exists", () => {
        it("should return true when site exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockSite = {
                identifier: "site1",
                name: "Site 1",
                monitoring: true,
            };

            const mockPrepare = vi.fn().mockReturnValue({
                get: vi.fn().mockReturnValue(mockSite),
                finalize: vi.fn(),
            });
            const mockGet = vi.fn().mockReturnValue(mockSite);
            mockDatabaseService.getDatabase.mockReturnValue({
                prepare: mockPrepare,
                get: mockGet,
            });
            const result = await repository.exists("site1");

            expect(result).toBe(true);
        });
        it("should return false when site does not exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockPrepare = vi.fn().mockReturnValue({
                get: vi.fn().mockReturnValue(undefined),
                finalize: vi.fn(),
            });
            const mockGet = vi.fn().mockReturnValue(undefined);
            mockDatabaseService.getDatabase.mockReturnValue({
                prepare: mockPrepare,
                get: mockGet,
            });
            const result = await repository.exists("nonexistent");

            expect(result).toBe(false);
        });
    });
    describe("bulkInsert", () => {
        it("should insert multiple sites", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const sites = [
                { identifier: "site1", name: "Site 1", monitoring: true },
                { identifier: "site2", name: "Site 2", monitoring: false },
            ];

            const mockPrepare = vi.fn().mockReturnValue({
                run: vi.fn().mockReturnValue({ changes: 1 }),
                finalize: vi.fn(),
            });
            mockDatabaseService.executeTransaction.mockImplementation(
                (callback: any) => {
                    const mockDb = { prepare: mockPrepare };
                    return callback(mockDb);
                }
            );

            await repository.bulkInsert(sites);

            expect(mockPrepare).toHaveBeenCalledWith(
                expect.stringContaining("INSERT")
            );
        });
        it("should handle bulk insert errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const sites = [
                { identifier: "site1", name: "Site 1", monitoring: true },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(() => {
                throw new Error("Bulk insert failed");
            });
            await expect(repository.bulkInsert(sites)).rejects.toThrow(
                "Bulk insert failed"
            );
        });
    });
    describe("exportAll", () => {
        it("should export all sites", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Export Operation", "type");

            const mockSites = [
                { identifier: "site1", name: "Site 1", monitoring: true },
                { identifier: "site2", name: "Site 2", monitoring: false },
            ];

            const mockPrepare = vi.fn().mockReturnValue({
                all: vi.fn().mockReturnValue(mockSites),
                finalize: vi.fn(),
            });
            const mockAll = vi.fn().mockReturnValue(mockSites);
            mockDatabaseService.getDatabase.mockReturnValue({
                prepare: mockPrepare,
                all: mockAll,
            });
            const result = await repository.exportAll();

            expect(result).toEqual(mockSites);
        });
    });

    describe("Property-Based SiteRepository Tests", () => {
        it("should handle various site creation scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        url: fc.webUrl(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        type: fc.constantFrom("http", "ping", "tcp"),
                        config: fc.record({
                            timeout: fc.integer({ min: 1000, max: 30_000 }),
                            retries: fc.integer({ min: 0, max: 5 })
                        })
                    }),
                    async (siteData) => {
                        const expectedSite = {
                            id: 1,
                            ...siteData,
                            createdAt: expect.any(Number),
                            updatedAt: expect.any(Number)
                        };

                        mockDatabase.run.mockReturnValue({
                            changes: 1,
                            lastInsertRowid: 1
                        });
                        mockDatabase.get.mockReturnValue(expectedSite);

                        const result = await repository.createSite(siteData);

                        expect(result).toMatchObject({
                            id: 1,
                            url: siteData.url,
                            name: siteData.name,
                            type: siteData.type
                        });
                        expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
                        expect(mockDatabase.run).toHaveBeenCalledWith(
                            expect.stringContaining("INSERT INTO sites"),
                            expect.arrayContaining([
                                siteData.url,
                                siteData.name,
                                siteData.type,
                                expect.any(String), // JSON config
                                expect.any(Number), // timestamp
                                expect.any(Number)  // timestamp
                            ])
                        );
                    }
                )
            );
        });

        it("should handle various site updates", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1, max: 1000 }),
                    fc.record({
                        url: fc.webUrl(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        type: fc.constantFrom("http", "ping", "tcp"),
                        config: fc.record({
                            timeout: fc.integer({ min: 1000, max: 30_000 }),
                            retries: fc.integer({ min: 0, max: 5 })
                        })
                    }),
                    async (siteId, updateData) => {
                        const updatedSite = {
                            id: siteId,
                            ...updateData,
                            createdAt: Date.now() - 86_400_000,
                            updatedAt: Date.now()
                        };

                        mockDatabase.run.mockReturnValue({ changes: 1 });
                        mockDatabase.get.mockReturnValue(updatedSite);

                        const result = await repository.update(siteId, updateData);

                        expect(result).toMatchObject({
                            id: siteId,
                            url: updateData.url,
                            name: updateData.name,
                            type: updateData.type
                        });
                        expect(mockDatabase.run).toHaveBeenCalledWith(
                            expect.stringContaining("UPDATE sites SET"),
                            expect.arrayContaining([
                                updateData.url,
                                updateData.name,
                                updateData.type,
                                expect.any(String), // JSON config
                                expect.any(Number), // updated timestamp
                                siteId
                            ])
                        );
                    }
                )
            );
        });

        it("should handle various site deletion scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.integer({ min: 1, max: 100 }),
                        { minLength: 1, maxLength: 10 }
                    ),
                    async (siteIds) => {
                        for (const siteId of siteIds) {
                            mockDatabase.run.mockReturnValue({ changes: 1 });

                            const result = await repository.delete(siteId);

                            expect(result).toBe(true);
                            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
                            expect(mockDatabase.run).toHaveBeenCalledWith(
                                "DELETE FROM sites WHERE id = ?",
                                [siteId]
                            );
                        }
                    }
                )
            );
        });

        it("should handle various findById scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.constant(null), // Site not found
                        fc.record({
                            id: fc.integer({ min: 1, max: 1000 }),
                            url: fc.webUrl(),
                            name: fc.string({ minLength: 1, maxLength: 100 }),
                            type: fc.constantFrom("http", "ping", "tcp"),
                            config: fc.record({
                                timeout: fc.integer({ min: 1000, max: 30_000 })
                            }),
                            createdAt: fc.integer({ min: Date.now() - 86_400_000, max: Date.now() }),
                            updatedAt: fc.integer({ min: Date.now() - 86_400_000, max: Date.now() })
                        })
                    ),
                    fc.integer({ min: 1, max: 1000 }),
                    async (mockSite, searchId) => {
                        mockDatabase.get.mockReturnValue(mockSite);

                        const result = await repository.findById(searchId);

                        if (mockSite) {
                            expect(result).toEqual(mockSite);
                        } else {
                            expect(result).toBeNull();
                        }
                        expect(mockDatabase.get).toHaveBeenCalledWith(
                            "SELECT * FROM sites WHERE id = ?",
                            [searchId]
                        );
                    }
                )
            );
        });

        it("should handle various findAll scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 1000 }),
                            url: fc.webUrl(),
                            name: fc.string({ minLength: 1, maxLength: 100 }),
                            type: fc.constantFrom("http", "ping", "tcp"),
                            config: fc.record({
                                timeout: fc.integer({ min: 1000, max: 30_000 })
                            }),
                            createdAt: fc.integer({ min: Date.now() - 86_400_000, max: Date.now() }),
                            updatedAt: fc.integer({ min: Date.now() - 86_400_000, max: Date.now() })
                        }),
                        { minLength: 0, maxLength: 20 }
                    ),
                    async (mockSites) => {
                        mockDatabase.all.mockReturnValue(mockSites);

                        const result = await repository.findAll();

                        expect(result).toEqual(mockSites);
                        expect(mockDatabase.all).toHaveBeenCalledWith(
                            "SELECT * FROM sites ORDER BY createdAt ASC"
                        );
                    }
                )
            );
        });

        it("should handle database errors consistently", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.constantFrom("SQLITE_BUSY", "SQLITE_LOCKED", "SQLITE_CONSTRAINT"),
                        fc.string({ minLength: 5, maxLength: 50 })
                    ),
                    fc.record({
                        url: fc.webUrl(),
                        name: fc.string({ minLength: 1, maxLength: 50 }),
                        type: fc.constantFrom("http", "ping", "tcp")
                    }),
                    async (errorMessage, siteData) => {
                        const dbError = new Error(errorMessage);
                        mockDatabase.run.mockImplementation(() => {
                            throw dbError;
                        });

                        await expect(repository.create(siteData)).rejects.toThrow(errorMessage);
                    }
                )
            );
        });

        it("should validate site data structures consistently", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        url: fc.webUrl(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        type: fc.constantFrom("http", "ping", "tcp"),
                        config: fc.oneof(
                            fc.record({ timeout: fc.integer({ min: 1000, max: 30_000 }) }),
                            fc.record({
                                timeout: fc.integer({ min: 1000, max: 30_000 }),
                                retries: fc.integer({ min: 0, max: 5 })
                            })
                        ),
                        createdAt: fc.integer({ min: 0, max: Date.now() }),
                        updatedAt: fc.integer({ min: 0, max: Date.now() })
                    }),
                    async (siteData) => {
                        mockDatabase.get.mockReturnValue(siteData);

                        const result = await repository.findById(siteData.id);

                        expect(result).toBeDefined();
                        if (result) {
                            expect(typeof result.id).toBe("number");
                            expect(typeof result.url).toBe("string");
                            expect(typeof result.name).toBe("string");
                            expect(typeof result.type).toBe("string");
                            expect(typeof result.config).toBe("object");
                            expect(typeof result.createdAt).toBe("number");
                            expect(typeof result.updatedAt).toBe("number");
                            expect(result.id).toBeGreaterThan(0);
                            expect(result.url.length).toBeGreaterThan(0);
                            expect(result.name.length).toBeGreaterThan(0);
                            expect(["http", "ping", "tcp"]).toContain(result.type);
                        }
                    }
                )
            );
        });
    });
});
