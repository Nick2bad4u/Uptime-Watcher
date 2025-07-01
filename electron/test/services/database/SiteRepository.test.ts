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

const mockDatabase = {
    all: vi.fn(),
    get: vi.fn(),
    run: vi.fn(() => ({ changes: 1 })),
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
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: "Site 2" },
            ];
            mockDatabase.all.mockReturnValue(mockSites);

            const result = await siteRepository.findAll();

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT * FROM sites");
            expect(result).toEqual([
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: "Site 2" },
            ]);
        });

        it("should handle sites without names", async () => {
            const mockSites = [
                { identifier: "site1", name: null },
                { identifier: "site2", name: "Site 2" },
            ];
            mockDatabase.all.mockReturnValue(mockSites);

            const result = await siteRepository.findAll();

            expect(result).toEqual([
                { identifier: "site1", name: undefined },
                { identifier: "site2", name: "Site 2" },
            ]);
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(siteRepository.findAll()).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith("[SiteRepository] Failed to fetch all sites", error);
        });
    });

    describe("findByIdentifier", () => {
        it("should return site when found", async () => {
            const mockSite = { identifier: "site1", name: "Site 1" };
            mockDatabase.get.mockReturnValue(mockSite);

            const result = await siteRepository.findByIdentifier("site1");

            expect(mockDatabase.get).toHaveBeenCalledWith("SELECT * FROM sites WHERE identifier = ?", ["site1"]);
            expect(result).toEqual({ identifier: "site1", name: "Site 1" });
        });

        it("should return undefined when site not found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await siteRepository.findByIdentifier("nonexistent");

            expect(result).toBeUndefined();
        });

        it("should handle site without name", async () => {
            const mockSite = { identifier: "site1", name: null };
            mockDatabase.get.mockReturnValue(mockSite);

            const result = await siteRepository.findByIdentifier("site1");

            expect(result).toEqual({ identifier: "site1", name: undefined });
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.get.mockImplementation(() => {
                throw error;
            });

            await expect(siteRepository.findByIdentifier("site1")).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[SiteRepository] Failed to fetch site with identifier: site1",
                error
            );
        });
    });

    describe("getByIdentifier", () => {
        it("should return complete site with monitors and history", async () => {
            const mockSite = { identifier: "site1", name: "Site 1" };
            const mockMonitors = [
                { id: 1, type: "http", url: "https://example.com" },
                { id: 2, type: "port", host: "localhost", port: 3000 },
            ];
            const mockHistory = [{ id: 1, timestamp: Date.now(), status: "up" }];

            mockDatabase.get.mockReturnValue(mockSite);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue(mockMonitors);
            mockHistoryRepository.findByMonitorId.mockResolvedValue(mockHistory);

            const result = await siteRepository.getByIdentifier("site1");

            expect(mockMonitorRepository.findBySiteIdentifier).toHaveBeenCalledWith("site1");
            expect(mockHistoryRepository.findByMonitorId).toHaveBeenCalledWith(1);
            expect(mockHistoryRepository.findByMonitorId).toHaveBeenCalledWith(2);

            expect(result).toEqual({
                identifier: "site1",
                name: "Site 1",
                monitors: [
                    { id: 1, type: "http", url: "https://example.com", history: mockHistory },
                    { id: 2, type: "port", host: "localhost", port: 3000, history: mockHistory },
                ],
            });
        });

        it("should return undefined when site not found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await siteRepository.getByIdentifier("nonexistent");

            expect(result).toBeUndefined();
            expect(mockMonitorRepository.findBySiteIdentifier).not.toHaveBeenCalled();
        });

        it("should handle monitors without id", async () => {
            const mockSite = { identifier: "site1", name: "Site 1" };
            const mockMonitors = [
                { type: "http", url: "https://example.com" }, // No id
            ];

            mockDatabase.get.mockReturnValue(mockSite);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue(mockMonitors);

            const result = await siteRepository.getByIdentifier("site1");

            expect(mockHistoryRepository.findByMonitorId).not.toHaveBeenCalled();
            expect(result?.monitors[0]).not.toHaveProperty("history");
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.get.mockImplementation(() => {
                throw error;
            });

            await expect(siteRepository.getByIdentifier("site1")).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[SiteRepository] Failed to fetch complete site with identifier: site1",
                error
            );
        });
    });

    describe("upsert", () => {
        it("should create or update site", async () => {
            const site = { identifier: "site1", name: "Site 1" };

            await siteRepository.upsert(site);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)",
                ["site1", "Site 1"]
            );
            expect(mockLogger.debug).toHaveBeenCalledWith("[SiteRepository] Upserted site: site1");
        });

        it("should handle site without name", async () => {
            const site = { identifier: "site1" };

            await siteRepository.upsert(site);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "INSERT OR REPLACE INTO sites (identifier, name) VALUES (?, ?)",
                ["site1", null]
            );
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            const site = { identifier: "site1", name: "Site 1" };
            await expect(siteRepository.upsert(site)).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith("[SiteRepository] Failed to upsert site: site1", error);
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

        it("should handle undefined changes", async () => {
            mockDatabase.run.mockReturnValue({ changes: 0 });

            const result = await siteRepository.delete("site1");

            expect(result).toBe(false);
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(siteRepository.delete("site1")).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith("[SiteRepository] Failed to delete site: site1", error);
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

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.get.mockImplementation(() => {
                throw error;
            });

            await expect(siteRepository.exists("site1")).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[SiteRepository] Failed to check if site exists: site1",
                error
            );
        });
    });

    describe("exportAll", () => {
        it("should export all sites", async () => {
            const mockSites = [
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: null },
            ];
            mockDatabase.all.mockReturnValue(mockSites);

            const result = await siteRepository.exportAll();

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT * FROM sites");
            expect(result).toEqual([
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: undefined },
            ]);
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(siteRepository.exportAll()).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith("[SiteRepository] Failed to export sites", error);
        });
    });

    describe("deleteAll", () => {
        it("should delete all sites", async () => {
            await siteRepository.deleteAll();

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM sites");
            expect(mockLogger.info).toHaveBeenCalledWith("[SiteRepository] All sites deleted");
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(siteRepository.deleteAll()).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith("[SiteRepository] Failed to delete all sites", error);
        });
    });

    describe("bulkInsert", () => {
        it("should bulk insert sites", async () => {
            const sites = [
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: "Site 2" },
            ];

            await siteRepository.bulkInsert(sites);

            expect(mockDatabase.run).toHaveBeenCalledTimes(2);
            expect(mockDatabase.run).toHaveBeenNthCalledWith(1, "INSERT INTO sites (identifier, name) VALUES (?, ?)", [
                "site1",
                "Site 1",
            ]);
            expect(mockDatabase.run).toHaveBeenNthCalledWith(2, "INSERT INTO sites (identifier, name) VALUES (?, ?)", [
                "site2",
                "Site 2",
            ]);
            expect(mockLogger.info).toHaveBeenCalledWith("[SiteRepository] Bulk inserted 2 sites");
        });

        it("should handle sites without names", async () => {
            const sites = [{ identifier: "site1" }];

            await siteRepository.bulkInsert(sites);

            expect(mockDatabase.run).toHaveBeenCalledWith("INSERT INTO sites (identifier, name) VALUES (?, ?)", [
                "site1",
                null,
            ]);
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            const sites = [{ identifier: "site1", name: "Site 1" }];
            await expect(siteRepository.bulkInsert(sites)).rejects.toThrow("Database error");
            expect(mockLogger.error).toHaveBeenCalledWith("[SiteRepository] Failed to bulk insert sites", error);
        });
    });
});
