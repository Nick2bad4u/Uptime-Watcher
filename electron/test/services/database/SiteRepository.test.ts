/**
 * Tests for SiteRepository.
 * Validates site data persistence and CRUD operations.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { SiteRepository } from "../../../services/database/SiteRepository";

// Mock dependencies
vi.mock("../../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => ({
            getDatabase: vi.fn(() => mockDatabase),
            executeTransaction: vi.fn((callback) => {
                // Mock transaction by calling the callback with the mock database
                return Promise.resolve(callback(mockDatabase));
            }),
        })),
    },
}));

vi.mock("../../../services/database/MonitorRepository", () => ({
    MonitorRepository: vi.fn(() => ({
        findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
    })),
}));

vi.mock("../../../services/database/HistoryRepository", () => ({
    HistoryRepository: vi.fn(() => ({
        findByMonitorId: vi.fn(() => Promise.resolve([])),
    })),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

const mockPreparedStatement = {
    run: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
    finalize: vi.fn(),
};

const mockDatabase = {
    all: vi.fn(),
    get: vi.fn(),
    run: vi.fn(() => ({ changes: 1 })),
    prepare: vi.fn(() => mockPreparedStatement),
};

describe("SiteRepository", () => {
    let siteRepository: SiteRepository;
    let mockMonitorRepository: any;
    let mockHistoryRepository: any;
    let mockLogger: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        mockLogger = await import("../../../utils/logger").then((m) => m.logger);

        const { MonitorRepository } = await import("../../../services/database/MonitorRepository");
        const { HistoryRepository } = await import("../../../services/database/HistoryRepository");

        mockMonitorRepository = {
            findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
        };
        mockHistoryRepository = {
            findByMonitorId: vi.fn(() => Promise.resolve([])),
        };

        (MonitorRepository as any).mockImplementation(() => mockMonitorRepository);
        (HistoryRepository as any).mockImplementation(() => mockHistoryRepository);

        siteRepository = new SiteRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("findAll", () => {
        it("should return all sites", async () => {
            const mockSites = [
                { identifier: "site1", name: "Site 1", monitoring: 1 },
                { identifier: "site2", name: "Site 2", monitoring: 0 },
            ];
            mockDatabase.all.mockReturnValue(mockSites);

            const result = await siteRepository.findAll();

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT identifier, name, monitoring FROM sites");
            expect(result).toEqual([
                { identifier: "site1", name: "Site 1", monitoring: true },
                { identifier: "site2", name: "Site 2", monitoring: false },
            ]);
        });
    });

    describe("findByIdentifier", () => {
        it("should return site when found", async () => {
            const mockSite = { identifier: "site1", name: "Site 1" };
            mockDatabase.get.mockReturnValue(mockSite);

            const result = await siteRepository.findByIdentifier("site1");

            expect(mockDatabase.get).toHaveBeenCalledWith(
                "SELECT identifier, name, monitoring FROM sites WHERE identifier = ?",
                ["site1"]
            );
            expect(result).toEqual({ identifier: "site1", name: "Site 1" });
        });

        it("should return undefined when site not found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await siteRepository.findByIdentifier("nonexistent");

            expect(result).toBeUndefined();
        });
    });

    describe("getByIdentifier", () => {
        it("should return undefined when site not found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await siteRepository.getByIdentifier("nonexistent");

            expect(result).toBeUndefined();
            expect(mockMonitorRepository.findBySiteIdentifier).not.toHaveBeenCalled();
        });
    });

    describe("upsert", () => {
        it("should create or update site", async () => {
            const site = { identifier: "site1", name: "Site 1", monitoring: false };

            await siteRepository.upsert(site);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "INSERT OR REPLACE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)",
                ["site1", "Site 1", 0]
            );
            expect(mockLogger.debug).toHaveBeenCalledWith("[SiteRepository] Upserted site: site1");
        });
    });

    describe("delete", () => {
        it("should delete site successfully", async () => {
            mockDatabase.run.mockReturnValue({ changes: 1 });

            const result = await siteRepository.delete("site1");

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM sites WHERE identifier = ?", ["site1"]);
            expect(result).toBe(true);
            expect(mockLogger.debug).toHaveBeenCalledWith("[SiteRepository] Deleted site: site1");
        });

        it("should return false when site not found", async () => {
            mockDatabase.run.mockReturnValue({ changes: 0 });

            const result = await siteRepository.delete("nonexistent");

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith("[SiteRepository] Site not found for deletion: nonexistent");
        });

        it("should handle null changes property (line 131 nullish coalescing)", async () => {
            mockDatabase.run.mockReturnValue({ changes: null as any });

            const result = await siteRepository.delete("site1");

            expect(result).toBe(false); // (null ?? 0) > 0 = false
        });

        it("should handle undefined changes property (line 131 nullish coalescing)", async () => {
            mockDatabase.run.mockReturnValue({ changes: undefined as any });

            const result = await siteRepository.delete("site1");

            expect(result).toBe(false); // (undefined ?? 0) > 0 = false
        });

        it("should handle result object without changes property (line 131 nullish coalescing)", async () => {
            mockDatabase.run.mockReturnValue({} as any); // No changes property

            const result = await siteRepository.delete("site1");

            expect(result).toBe(false); // (undefined ?? 0) > 0 = false
        });
    });

    describe("exists", () => {
        it("should return true when site exists", async () => {
            const mockSite = { identifier: "site1", name: "Site 1" };
            mockDatabase.get.mockReturnValue(mockSite);

            const result = await siteRepository.exists("site1");

            expect(result).toBe(true);
        });

        it("should return false when site does not exist", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await siteRepository.exists("nonexistent");

            expect(result).toBe(false);
        });
    });

    describe("exportAll", () => {
        it("should handle falsy identifier in exportAll (line 167)", async () => {
            const mockSites = [
                { identifier: "site1", name: "Site 1" },
                { identifier: "", name: "Empty identifier" }, // Empty string - falsy
                { identifier: null, name: "Null identifier" }, // Null - falsy
                { identifier: undefined, name: "Undefined identifier" }, // Undefined - falsy
                { identifier: 0, name: "Zero identifier" }, // 0 - falsy
                { identifier: false, name: "False identifier" }, // false - falsy
            ];
            mockDatabase.all.mockReturnValue(mockSites);

            const result = await siteRepository.exportAll();

            expect(result).toEqual([
                { identifier: "site1", name: "Site 1" },
                { identifier: "", name: "Empty identifier" }, // Empty string stays empty
                { identifier: "", name: "Null identifier" }, // Null becomes ""
                { identifier: "", name: "Undefined identifier" }, // Undefined becomes ""
                { identifier: "", name: "Zero identifier" }, // 0 becomes ""
                { identifier: "", name: "False identifier" }, // false becomes ""
            ]);
        });
    });

    describe("deleteAll", () => {
        it("should delete all sites", async () => {
            await siteRepository.deleteAll();

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM sites");
            expect(mockLogger.info).toHaveBeenCalledWith("[SiteRepository] All sites deleted");
        });
    });

    describe("bulkInsert", () => {
        it("should bulk insert sites", async () => {
            const sites = [
                { identifier: "site1", name: "Site 1", monitoring: false },
                { identifier: "site2", name: "Site 2", monitoring: true },
            ];

            await siteRepository.bulkInsert(sites);

            // Check that executeTransaction was called (via the mock)
            expect(mockDatabase.prepare).toHaveBeenCalledWith(
                "INSERT INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)"
            );

            // Check prepared statement calls
            expect(mockPreparedStatement.run).toHaveBeenCalledWith(["site1", "Site 1", 0]);
            expect(mockPreparedStatement.run).toHaveBeenCalledWith(["site2", "Site 2", 1]);
            expect(mockPreparedStatement.finalize).toHaveBeenCalled();

            expect(mockLogger.info).toHaveBeenCalledWith("[SiteRepository] Bulk inserted 2 sites");
        });

        it("should handle sites without names", async () => {
            const sites = [{ identifier: "site1", monitoring: true }];

            await siteRepository.bulkInsert(sites);

            // Check that executeTransaction was called and prepared statement used correctly
            expect(mockPreparedStatement.run).toHaveBeenCalledWith(["site1", null, 1]);
        });
    });
});
