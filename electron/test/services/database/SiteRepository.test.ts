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

describe(SiteRepository, () => {
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

    describe("exportAll", () => {
        it("should return the same data set as findAll", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockSites = [
                { identifier: "site1", name: "Site 1", monitoring: 1 },
                { identifier: "site2", name: "Site 2", monitoring: 0 },
            ];

            const mockDb = mockDatabaseService.getDatabase();
            mockDb.all.mockReturnValueOnce(mockSites);

            const findAllResult = await repository.findAll();

            mockDb.all.mockReturnValueOnce(mockSites);

            const exportAllResult = await repository.exportAll();

            expect(findAllResult).toEqual(exportAllResult);
            expect(mockDb.all).toHaveBeenCalledWith(
                expect.stringContaining("SELECT")
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
                        run: vi.fn().mockReturnValue({ changes: 0 }),
                    };
                    return callback(mockDb);
                }
            );

            const result = await repository.delete("nonexistent");

            expect(result).toBeFalsy();
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

            expect(result).toBeTruthy();
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

            expect(result).toBeFalsy();
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
    describe("Property-Based SiteRepository Tests", () => {
        it("should handle various site creation scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        identifier: fc
                            .string({ minLength: 1, maxLength: 100 })
                            .filter((s) => s.trim().length > 0),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        monitoring: fc.boolean(),
                    }),
                    async (siteData) => {
                        const expectedSite = {
                            identifier: siteData.identifier,
                            name: siteData.name,
                            monitoring: siteData.monitoring,
                        };

                        mockDatabase.run.mockReturnValue({
                            changes: 1,
                            lastInsertRowid: 1,
                        });
                        mockDatabase.get.mockReturnValue(expectedSite);

                        await repository.upsert(siteData);

                        // Upsert returns void, so we just verify it was called correctly
                        expect(
                            mockDatabaseService.getDatabase
                        ).toHaveBeenCalled();
                        expect(mockDatabase.run).toHaveBeenCalledWith(
                            expect.stringContaining(
                                "INSERT OR REPLACE INTO sites"
                            ),
                            expect.arrayContaining([
                                siteData.identifier,
                                siteData.name,
                                siteData.monitoring ? 1 : 0, // Monitoring is converted to number
                            ])
                        );
                    }
                )
            );
        });

        it("should handle various site updates", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc
                        .string({ minLength: 1, maxLength: 100 })
                        .filter((s) => s.trim().length > 0), // Identifier as string
                    fc.record({
                        identifier: fc
                            .string({ minLength: 1, maxLength: 100 })
                            .filter((s) => s.trim().length > 0),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        monitoring: fc.boolean(),
                    }),
                    async (_siteIdentifier, updateData) => {
                        // Use the identifier from updateData for consistency
                        const updatedSite = {
                            identifier: updateData.identifier,
                            name: updateData.name,
                            monitoring: updateData.monitoring,
                        };

                        mockDatabase.run.mockReturnValue({ changes: 1 });
                        mockDatabase.get.mockReturnValue(updatedSite);

                        await repository.upsert(updateData);

                        // Upsert returns void, so we just verify it was called correctly
                        expect(
                            mockDatabaseService.getDatabase
                        ).toHaveBeenCalled();
                        expect(mockDatabase.run).toHaveBeenCalledWith(
                            expect.stringContaining(
                                "INSERT OR REPLACE INTO sites"
                            ),
                            expect.arrayContaining([
                                updateData.identifier,
                                updateData.name,
                                updateData.monitoring ? 1 : 0,
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
                        fc
                            .string({ minLength: 1, maxLength: 100 })
                            .filter((s) => s.trim().length > 0), // Identifiers as strings
                        { minLength: 1, maxLength: 10 }
                    ),
                    async (siteIdentifiers) => {
                        for (const siteIdentifier of siteIdentifiers) {
                            mockDatabase.run.mockReturnValue({ changes: 1 });

                            const result =
                                await repository.delete(siteIdentifier);

                            expect(result).toBeTruthy();
                            expect(
                                mockDatabaseService.executeTransaction
                            ).toHaveBeenCalled();
                            expect(mockDatabase.run).toHaveBeenCalledWith(
                                "DELETE FROM sites WHERE identifier = ?",
                                [siteIdentifier]
                            );
                        }
                    }
                )
            );
        });

        it("should handle various findByIdentifier scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.constant(null), // Site not found
                        fc.record({
                            identifier: fc
                                .string({ minLength: 1, maxLength: 100 })
                                .filter((s) => s.trim().length > 0),
                            name: fc.string({ minLength: 1, maxLength: 100 }),
                            monitoring: fc.boolean(),
                        })
                    ),
                    fc
                        .string({ minLength: 1, maxLength: 100 })
                        .filter((s) => s.trim().length > 0), // SearchIdentifier as string
                    async (mockSite, searchIdentifier) => {
                        mockDatabase.get.mockReturnValue(mockSite);

                        const result =
                            await repository.findByIdentifier(searchIdentifier);

                        if (mockSite) {
                            expect(result).toEqual(mockSite);
                        } else {
                            expect(result).toBeUndefined(); // SiteRepository returns undefined for not found
                        }
                        expect(mockDatabase.get).toHaveBeenCalledWith(
                            expect.stringContaining("SELECT"),
                            [searchIdentifier]
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
                            identifier: fc
                                .string({ minLength: 1, maxLength: 100 })
                                .filter((s) => s.trim().length > 0),
                            name: fc.string({ minLength: 1, maxLength: 100 }),
                            monitoring: fc.boolean(),
                        }),
                        { minLength: 0, maxLength: 20 }
                    ),
                    async (mockSites) => {
                        mockDatabase.all.mockReturnValue(mockSites);

                        const result = await repository.findAll();

                        expect(result).toEqual(mockSites);
                        expect(mockDatabase.all).toHaveBeenCalledWith(
                            expect.stringContaining("SELECT")
                        );
                    }
                )
            );
        });

        it("should handle database errors consistently", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.constantFrom(
                            "SQLITE_BUSY",
                            "SQLITE_LOCKED",
                            "SQLITE_CONSTRAINT"
                        ),
                        fc.string({ minLength: 5, maxLength: 50 })
                    ),
                    fc.record({
                        identifier: fc
                            .string({ minLength: 1, maxLength: 100 })
                            .filter((s) => s.trim().length > 0),
                        name: fc.string({ minLength: 1, maxLength: 50 }),
                        monitoring: fc.boolean(),
                    }),
                    async (errorMessage, siteData) => {
                        const dbError = new Error(errorMessage);
                        mockDatabase.run.mockImplementation(() => {
                            throw dbError;
                        });

                        await expect(
                            repository.upsert(siteData)
                        ).rejects.toThrow(errorMessage);
                    }
                )
            );
        });

        it("should validate site data structures consistently", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        identifier: fc
                            .string({ minLength: 1, maxLength: 100 })
                            .filter((s) => s.trim().length > 0),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        monitoring: fc.boolean(),
                    }),
                    async (siteData) => {
                        mockDatabase.get.mockReturnValue(siteData);

                        const result = await repository.findByIdentifier(
                            siteData.identifier
                        );

                        expect(result).toBeDefined();
                        if (result) {
                            expect(typeof result.identifier).toBe("string");
                            expect(result.identifier.length).toBeGreaterThan(0);
                            if (result.name !== undefined) {
                                expect(typeof result.name).toBe("string");
                                expect(result.name.length).toBeGreaterThan(0);
                            }
                            if (result.monitoring !== undefined) {
                                expect(typeof result.monitoring).toBe(
                                    "boolean"
                                );
                            }
                        }
                    }
                )
            );
        });
    });
});
