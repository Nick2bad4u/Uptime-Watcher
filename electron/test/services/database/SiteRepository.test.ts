import { describe, it, expect, beforeEach, vi } from "vitest";
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
            executeTransaction: vi.fn().mockImplementation(async (callback) => {
                return callback(mockDatabase);
            }),
        };

        repository = new SiteRepository({ databaseService: mockDatabaseService });
    });

    describe("findAll", () => {
        it("should find all sites", async () => {
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

        it("should handle errors when finding all sites", async () => {
            const mockDb = mockDatabaseService.getDatabase();
            mockDb.all.mockImplementation(() => {
                throw new Error("Database error");
            });

            await expect(repository.findAll()).rejects.toThrow("Database error");
        });
    });

    describe("findByIdentifier", () => {
        it("should find a site by identifier", async () => {
            const mockSite = { identifier: "site1", name: "Site 1", monitoring: true };

            mockDatabase.get.mockReturnValue(mockSite);

            const result = await repository.findByIdentifier("site1");

            expect(mockDatabase.get).toHaveBeenCalledWith(expect.stringContaining("SELECT"), ["site1"]);
            expect(result).toEqual(mockSite);
        });

        it("should return undefined when site not found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await repository.findByIdentifier("nonexistent");

            expect(result).toBeUndefined();
        });
    });

    describe("upsert", () => {
        it("should upsert a site", async () => {
            const siteData = {
                identifier: "site1",
                name: "New Site",
                monitoring: true,
            };

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return callback(mockDatabase);
            });

            await repository.upsert(siteData);

            expect(mockDatabase.run).toHaveBeenCalledWith(expect.stringContaining("INSERT"), expect.any(Array));
        });

        it("should handle upsert errors", async () => {
            const siteData = {
                identifier: "site1",
                name: "New Site",
                monitoring: true,
            };

            // Mock getDatabase to throw an error
            mockDatabaseService.getDatabase.mockImplementation(() => {
                throw new Error("Upsert failed");
            });

            await expect(repository.upsert(siteData)).rejects.toThrow("Upsert failed");
        });
    });

    describe("delete", () => {
        it("should delete a site", async () => {
            const mockPrepare = vi.fn().mockReturnValue({
                run: vi.fn().mockReturnValue({ changes: 1 }),
                finalize: vi.fn(),
            });

            mockDatabaseService.executeTransaction.mockImplementation((callback: any) => {
                const mockDb = {
                    prepare: mockPrepare,
                    run: vi.fn().mockReturnValue({ changes: 1 }),
                };
                return callback(mockDb);
            });

            const result = await repository.delete("site1");

            expect(result).toBe(true);
        });

        it("should return false when site not found", async () => {
            const mockPrepare = vi.fn().mockReturnValue({
                run: vi.fn().mockReturnValue({ changes: 0 }),
                finalize: vi.fn(),
            });

            mockDatabaseService.executeTransaction.mockImplementation((callback: any) => {
                const mockDb = {
                    prepare: mockPrepare,
                    run: vi.fn().mockReturnValue({ changes: 0 }),
                };
                return callback(mockDb);
            });

            const result = await repository.delete("nonexistent");

            expect(result).toBe(false);
        });

        it("should handle deletion errors", async () => {
            mockDatabaseService.executeTransaction.mockImplementation(() => {
                throw new Error("Delete failed");
            });

            await expect(repository.delete("site1")).rejects.toThrow("Delete failed");
        });
    });

    describe("deleteAll", () => {
        it("should delete all sites", async () => {
            const mockPrepare = vi.fn().mockReturnValue({
                run: vi.fn().mockReturnValue({ changes: 3 }),
                finalize: vi.fn(),
            });
            const mockRun = vi.fn();

            mockDatabaseService.executeTransaction.mockImplementation((callback: any) => {
                const mockDb = {
                    prepare: mockPrepare,
                    run: mockRun,
                };
                return callback(mockDb);
            });

            await repository.deleteAll();

            expect(mockRun).toHaveBeenCalledWith(expect.stringContaining("DELETE"));
        });
    });

    describe("exists", () => {
        it("should return true when site exists", async () => {
            const mockSite = { identifier: "site1", name: "Site 1", monitoring: true };

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

        it("should return false when site does not exist", async () => {
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
        it("should insert multiple sites", async () => {
            const sites = [
                { identifier: "site1", name: "Site 1", monitoring: true },
                { identifier: "site2", name: "Site 2", monitoring: false },
            ];

            const mockPrepare = vi.fn().mockReturnValue({
                run: vi.fn().mockReturnValue({ changes: 1 }),
                finalize: vi.fn(),
            });

            mockDatabaseService.executeTransaction.mockImplementation((callback: any) => {
                const mockDb = { prepare: mockPrepare };
                return callback(mockDb);
            });

            await repository.bulkInsert(sites);

            expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining("INSERT"));
        });

        it("should handle bulk insert errors", async () => {
            const sites = [{ identifier: "site1", name: "Site 1", monitoring: true }];

            mockDatabaseService.executeTransaction.mockImplementation(() => {
                throw new Error("Bulk insert failed");
            });

            await expect(repository.bulkInsert(sites)).rejects.toThrow("Bulk insert failed");
        });
    });

    describe("exportAll", () => {
        it("should export all sites", async () => {
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
});
