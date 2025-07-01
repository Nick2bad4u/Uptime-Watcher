import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MonitorRepository, MonitorRow } from "../../../services/database/MonitorRepository";
import { DatabaseService } from "../../../services/database/DatabaseService";
import { Site } from "../../../types";
import { logger } from "../../../utils/logger";
import { isDev } from "../../../utils";

// Mock dependencies
vi.mock("../../../services/database/DatabaseService");
vi.mock("../../../utils/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));
vi.mock("../../../utils", () => ({
    isDev: vi.fn(),
}));

describe("MonitorRepository", () => {
    let monitorRepository: MonitorRepository;
    let mockDatabase: any;
    let mockDatabaseService: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock database methods
        mockDatabase = {
            all: vi.fn(),
            get: vi.fn(),
            run: vi.fn(),
        };

        // Mock DatabaseService
        mockDatabaseService = {
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
        };

        // Mock the static getInstance method
        (DatabaseService.getInstance as any).mockReturnValue(mockDatabaseService);

        monitorRepository = new MonitorRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("findBySiteIdentifier", () => {
        it("should return monitors for a site", async () => {
            const mockRows: MonitorRow[] = [
                {
                    id: 1,
                    site_identifier: "site-1",
                    type: "http",
                    url: "https://example.com",
                    host: undefined,
                    port: undefined,
                    checkInterval: 300,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "up",
                    responseTime: 150,
                    lastChecked: "2024-01-01T00:00:00.000Z",
                },
            ];

            mockDatabase.all.mockReturnValue(mockRows);

            const result = await monitorRepository.findBySiteIdentifier("site-1");

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT * FROM monitors WHERE site_identifier = ?", [
                "site-1",
            ]);
            expect(result).toEqual([
                {
                    id: "1",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 300,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "up",
                    responseTime: 150,
                    lastChecked: new Date("2024-01-01T00:00:00.000Z"),
                    history: [],
                    host: undefined,
                    port: undefined,
                },
            ]);
        });

        it("should return empty array when no monitors found", async () => {
            mockDatabase.all.mockReturnValue([]);

            const result = await monitorRepository.findBySiteIdentifier("site-1");

            expect(result).toEqual([]);
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(monitorRepository.findBySiteIdentifier("site-1")).rejects.toThrow("Database error");
            expect(logger.error).toHaveBeenCalledWith(
                "[MonitorRepository] Failed to fetch monitors for site: site-1",
                error
            );
        });
    });

    describe("findById", () => {
        it("should return a monitor by ID", async () => {
            const mockRow: MonitorRow = {
                id: 1,
                site_identifier: "site-1",
                type: "port",
                url: undefined,
                host: "example.com",
                port: 80,
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: false,
                status: "down",
                responseTime: undefined,
                lastChecked: undefined,
            };

            mockDatabase.get.mockReturnValue(mockRow);

            const result = await monitorRepository.findById("1");

            expect(mockDatabase.get).toHaveBeenCalledWith("SELECT * FROM monitors WHERE id = ?", ["1"]);
            expect(result).toEqual({
                id: "1",
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: false,
                status: "down",
                history: [],
                lastChecked: undefined,
                responseTime: undefined,
                url: undefined,
            });
        });

        it("should return undefined when monitor not found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await monitorRepository.findById("999");

            expect(result).toBeUndefined();
        });

        it("should handle database errors", async () => {
            const error = new Error("Find failed");
            mockDatabase.get.mockImplementation(() => {
                throw error;
            });

            await expect(monitorRepository.findById("1")).rejects.toThrow("Find failed");
            expect(logger.error).toHaveBeenCalledWith("[MonitorRepository] Failed to fetch monitor with id: 1", error);
        });
    });

    describe("create", () => {
        it("should create a new monitor and return its ID", async () => {
            (isDev as any).mockReturnValue(true);
            mockDatabase.get.mockReturnValue({ id: 1 });

            const monitor: Omit<Site["monitors"][0], "id"> = {
                type: "http",
                url: "https://example.com",
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                history: [],
            };

            const result = await monitorRepository.create("site-1", monitor);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO monitors"),
                expect.arrayContaining(["site-1", "http", "https://example.com"])
            );
            expect(mockDatabase.get).toHaveBeenCalledWith(
                "SELECT id FROM monitors WHERE site_identifier = ? ORDER BY id DESC LIMIT 1",
                ["site-1"]
            );
            expect(result).toBe("1");
            expect(logger.debug).toHaveBeenCalledWith(
                "[MonitorRepository] Created monitor with id: 1 for site: site-1"
            );
        });

        it("should handle port monitor creation", async () => {
            (isDev as any).mockReturnValue(false);
            mockDatabase.get.mockReturnValue({ id: 2 });

            const monitor: Omit<Site["monitors"][0], "id"> = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 600,
                timeout: 10000,
                retryAttempts: 5,
                monitoring: false,
                status: "pending",
                history: [],
            };

            const result = await monitorRepository.create("site-2", monitor);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO monitors"),
                expect.arrayContaining(["site-2", "port", null, "example.com", 80])
            );
            expect(result).toBe("2");
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            const error = new Error("Create failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            const monitor: Omit<Site["monitors"][0], "id"> = {
                type: "http",
                url: "https://example.com",
                monitoring: true,
                status: "pending",
                history: [],
            };

            await expect(monitorRepository.create("site-1", monitor)).rejects.toThrow("Create failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[MonitorRepository] Failed to create monitor for site: site-1",
                error
            );
        });
    });

    describe("update", () => {
        it("should update monitor fields", async () => {
            (isDev as any).mockReturnValue(true);

            const updates: Partial<Site["monitors"][0]> = {
                url: "https://newurl.com",
                checkInterval: 600,
                monitoring: false,
                status: "up",
                responseTime: 200,
                lastChecked: new Date("2024-01-02T00:00:00.000Z"),
            };

            await monitorRepository.update("1", updates);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE monitors SET"),
                expect.arrayContaining(["https://newurl.com", 600, 0, "up", 200, "2024-01-02T00:00:00.000Z", "1"])
            );
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Updated monitor with id: 1");
        });

        it("should handle partial updates", async () => {
            const updates: Partial<Site["monitors"][0]> = {
                monitoring: true,
            };

            await monitorRepository.update("1", updates);

            expect(mockDatabase.run).toHaveBeenCalledWith("UPDATE monitors SET monitoring = ? WHERE id = ?", [1, "1"]);
        });

        it("should handle empty updates", async () => {
            await monitorRepository.update("1", {});

            expect(mockDatabase.run).not.toHaveBeenCalled();
        });

        it("should handle updating monitor type", async () => {
            const updates: Partial<Site["monitors"][0]> = {
                type: "port",
            };

            await monitorRepository.update("1", updates);

            expect(mockDatabase.run).toHaveBeenCalledWith("UPDATE monitors SET type = ? WHERE id = ?", ["port", "1"]);
        });

        it("should handle database errors", async () => {
            const error = new Error("Update failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(monitorRepository.update("1", { monitoring: true })).rejects.toThrow("Update failed");
            expect(logger.error).toHaveBeenCalledWith("[MonitorRepository] Failed to update monitor with id: 1", error);
        });
    });

    describe("delete", () => {
        it("should delete a monitor and return true on success", async () => {
            (isDev as any).mockReturnValue(true);
            // Mock that the deletion affected one row
            mockDatabase.run.mockReturnValue({ changes: 1 });

            const result = await monitorRepository.delete("1");

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM monitors WHERE id = ?", ["1"]);
            expect(result).toBe(true);
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Deleted monitor with id: 1");
        });

        it("should return false when monitor not found", async () => {
            mockDatabase.run.mockReturnValue({ changes: 0 });

            const result = await monitorRepository.delete("999");

            expect(result).toBe(false);
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(monitorRepository.delete("1")).rejects.toThrow("Delete failed");
            expect(logger.error).toHaveBeenCalledWith("[MonitorRepository] Failed to delete monitor with id: 1", error);
        });
    });

    describe("deleteBySiteIdentifier", () => {
        it("should delete all monitors for a site", async () => {
            (isDev as any).mockReturnValue(true);
            const mockMonitorIds = [{ id: 1 }, { id: 2 }];
            mockDatabase.all.mockReturnValue(mockMonitorIds);

            await monitorRepository.deleteBySiteIdentifier("site-1");

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT id FROM monitors WHERE site_identifier = ?", [
                "site-1",
            ]);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE monitor_id = ?", [1]);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE monitor_id = ?", [2]);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM monitors WHERE site_identifier = ?", ["site-1"]);
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Deleted all monitors for site: site-1");
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete by site failed");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(monitorRepository.deleteBySiteIdentifier("site-1")).rejects.toThrow("Delete by site failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[MonitorRepository] Failed to delete monitors for site: site-1",
                error
            );
        });
    });

    describe("getAllMonitorIds", () => {
        it("should return all monitor IDs", async () => {
            const mockRows = [{ id: 1 }, { id: 2 }, { id: 3 }];
            mockDatabase.all.mockReturnValue(mockRows);

            const result = await monitorRepository.getAllMonitorIds();

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT id FROM monitors");
            expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
        });

        it("should handle database errors", async () => {
            const error = new Error("Get all IDs failed");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(monitorRepository.getAllMonitorIds()).rejects.toThrow("Get all IDs failed");
            expect(logger.error).toHaveBeenCalledWith("[MonitorRepository] Failed to fetch all monitor IDs", error);
        });
    });

    describe("deleteAll", () => {
        it("should delete all monitors", async () => {
            (isDev as any).mockReturnValue(true);

            await monitorRepository.deleteAll();

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM monitors");
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Cleared all monitors");
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete all failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(monitorRepository.deleteAll()).rejects.toThrow("Delete all failed");
            expect(logger.error).toHaveBeenCalledWith("[MonitorRepository] Failed to clear all monitors", error);
        });
    });

    describe("bulkCreate", () => {
        it("should bulk create monitors", async () => {
            const monitors: Array<Site["monitors"][0]> = [
                {
                    id: "temp-1",
                    type: "http",
                    url: "https://example1.com",
                    monitoring: true,
                    status: "pending",
                    history: [],
                },
                {
                    id: "temp-2",
                    type: "port",
                    host: "example.com",
                    port: 80,
                    monitoring: false,
                    status: "pending",
                    history: [],
                },
            ];

            await monitorRepository.bulkCreate("site-1", monitors);

            expect(mockDatabase.run).toHaveBeenCalledTimes(2);
            expect(logger.info).toHaveBeenCalledWith("[MonitorRepository] Bulk created 2 monitors for site: site-1");
        });

        it("should handle database errors in bulk create", async () => {
            const error = new Error("Bulk create failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            const monitors: Array<Site["monitors"][0]> = [
                {
                    id: "temp-1",
                    type: "http",
                    url: "https://example.com",
                    monitoring: true,
                    status: "pending",
                    history: [],
                },
            ];

            await expect(monitorRepository.bulkCreate("site-1", monitors)).rejects.toThrow("Bulk create failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[MonitorRepository] Failed to bulk create monitors for site: site-1",
                error
            );
        });

        it("should handle case where insertSingleMonitor returns empty ID", async () => {
            const monitors = [
                {
                    id: "temp-1",
                    type: "http" as const,
                    url: "https://example.com",
                    monitoring: true,
                    status: "pending" as const,
                    history: [],
                },
                {
                    id: "temp-2",
                    type: "port" as const,
                    host: "example.com",
                    port: 80,
                    monitoring: false,
                    status: "pending" as const,
                    history: [],
                },
            ];

            // Mock insertSingleMonitor to return empty string for first, valid ID for second
            const repository = monitorRepository as any;
            const originalInsertSingle = repository.insertSingleMonitor;
            repository.insertSingleMonitor = vi
                .fn()
                .mockReturnValueOnce("") // First call returns empty
                .mockReturnValueOnce("2"); // Second call returns valid ID

            const result = await monitorRepository.bulkCreate("site-1", monitors);

            // Should only contain the monitor with valid ID
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("2");

            // Restore original method
            repository.insertSingleMonitor = originalInsertSingle;
        });
    });

    describe("Private helper methods", () => {
        it("should test safeNumberConvert with different value types", () => {
            const repository = new MonitorRepository();
            // Access private method for testing
            const safeNumberConvert = (repository as any).safeNumberConvert;

            // Test number input
            expect(safeNumberConvert(42)).toBe(42);

            // Test string input (value branch)
            expect(safeNumberConvert("123")).toBe(123);

            // Test empty string (no value branch)
            expect(safeNumberConvert("")).toBeUndefined();

            // Test null (no value branch)
            expect(safeNumberConvert(null)).toBeUndefined();

            // Test undefined (no value branch)
            expect(safeNumberConvert(undefined)).toBeUndefined();

            // Test zero (value branch)
            expect(safeNumberConvert(0)).toBe(0);
        });

        it("should test convertDateForDb with different inputs", () => {
            const repository = new MonitorRepository();
            const convertDateForDb = (repository as any).convertDateForDb;

            // Test null input
            expect(convertDateForDb(null)).toBeNull();

            // Test undefined input
            expect(convertDateForDb(undefined)).toBeNull();

            // Test Date object
            const date = new Date("2024-01-01T00:00:00.000Z");
            expect(convertDateForDb(date)).toBe("2024-01-01T00:00:00.000Z");

            // Test string input
            expect(convertDateForDb("2024-01-01")).toBe("2024-01-01");
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle update with no fields to update", async () => {
            (isDev as any).mockReturnValue(true);

            // Mock monitor with no fields to update (empty partial)
            const monitorUpdate = {};

            const result = await monitorRepository.update("monitor-1", monitorUpdate);

            expect(result).toBeUndefined();
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] No fields to update for monitor: monitor-1");
        });

        it("should handle string date values in convertDateForDb", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                lastChecked: "2024-01-01T00:00:00.000Z" as any, // String instead of Date
            };

            mockDatabase.get.mockReturnValue({ id: 123 });

            await monitorRepository.create("site-1", monitor);

            // Verify that the string date was handled properly
            expect(mockDatabase.run).toHaveBeenCalled();
        });

        it("should handle database error during get latest monitor ID", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
            };

            // Mock successful insert but failing ID fetch
            mockDatabase.run.mockImplementation(() => {});
            mockDatabase.get.mockReturnValue(undefined); // Simulate failure to get ID

            await expect(monitorRepository.create("site-1", monitor)).rejects.toThrow(
                "Failed to fetch monitor id after insert for site site-1"
            );
        });

        it("should handle database error with invalid ID type", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
            };

            // Mock successful insert but invalid ID type
            mockDatabase.run.mockImplementation(() => {});
            mockDatabase.get.mockReturnValue({ id: "invalid" }); // String instead of number

            await expect(monitorRepository.create("site-1", monitor)).rejects.toThrow(
                "Failed to fetch monitor id after insert for site site-1"
            );
        });

        it("should handle null values in safeNumberConvert", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                port: null as any, // Test null value
                timeout: 0, // Test zero value
                checkInterval: undefined, // Test undefined
            };

            mockDatabase.get.mockReturnValue({ id: 123 });

            await monitorRepository.create("site-1", monitor);

            expect(mockDatabase.run).toHaveBeenCalled();
        });

        it("should handle truthy but non-number values in safeNumberConvert", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                port: "8080" as any, // String number
                timeout: "5000" as any, // String number
            };

            mockDatabase.get.mockReturnValue({ id: 123 });

            await monitorRepository.create("site-1", monitor);

            expect(mockDatabase.run).toHaveBeenCalled();
        });
    });
});
