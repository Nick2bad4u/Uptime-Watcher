/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HistoryRepository } from "../../../services/database/HistoryRepository";
import { DatabaseService } from "../../../services/database/DatabaseService";
import { StatusHistory } from "../../../types";
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

describe("HistoryRepository", () => {
    let historyRepository: HistoryRepository;
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

        historyRepository = new HistoryRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("findByMonitorId", () => {
        it("should return history entries for a monitor", async () => {
            const mockRows = [
                {
                    timestamp: 1640995200000,
                    status: "up",
                    responseTime: 150,
                    details: "OK",
                },
                {
                    timestamp: 1640995100000,
                    status: "down",
                    responseTime: 0,
                    details: "Connection failed",
                },
            ];

            mockDatabase.all.mockReturnValue(mockRows);

            const result = await historyRepository.findByMonitorId("monitor-1");

            expect(mockDatabase.all).toHaveBeenCalledWith(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                ["monitor-1"]
            );
            expect(result).toEqual([
                {
                    timestamp: 1640995200000,
                    status: "up",
                    responseTime: 150,
                    details: "OK",
                },
                {
                    timestamp: 1640995100000,
                    status: "down",
                    responseTime: 0,
                    details: "Connection failed",
                },
            ]);
        });

        it("should return empty array when no history found", async () => {
            mockDatabase.all.mockReturnValue([]);

            const result = await historyRepository.findByMonitorId("monitor-1");

            expect(result).toEqual([]);
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(historyRepository.findByMonitorId("monitor-1")).rejects.toThrow("Database error");
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryRepository] Failed to fetch history for monitor: monitor-1",
                error
            );
        });

        it("should handle invalid status values", async () => {
            const mockRows = [
                {
                    timestamp: 1640995200000,
                    status: "invalid-status",
                    responseTime: 150,
                    details: "OK",
                },
            ];

            mockDatabase.all.mockReturnValue(mockRows);

            const result = await historyRepository.findByMonitorId("monitor-1");

            expect(result[0].status).toBe("down"); // Should default to "down"
        });

        it("should handle undefined details", async () => {
            const mockRows = [
                {
                    timestamp: 1640995200000,
                    status: "up",
                    responseTime: 150,
                    details: undefined,
                },
            ];

            mockDatabase.all.mockReturnValue(mockRows);

            const result = await historyRepository.findByMonitorId("monitor-1");

            expect(result[0].details).toBeUndefined();
        });
    });

    describe("addEntry", () => {
        const mockEntry: StatusHistory = {
            timestamp: 1640995200000,
            status: "up",
            responseTime: 150,
        };

        it("should add a history entry with details", async () => {
            (isDev as any).mockReturnValue(true);

            await historyRepository.addEntry("monitor-1", mockEntry, "Success");

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                ["monitor-1", 1640995200000, "up", 150, "Success"]
            );
            expect(logger.debug).toHaveBeenCalledWith(
                "[HistoryRepository] Added history entry: monitor_id=monitor-1, status=up, responseTime=150, timestamp=1640995200000"
            );
        });

        it("should add a history entry without details", async () => {
            (isDev as any).mockReturnValue(false);

            await historyRepository.addEntry("monitor-1", mockEntry);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                ["monitor-1", 1640995200000, "up", 150, null]
            );
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            const error = new Error("Insert failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(historyRepository.addEntry("monitor-1", mockEntry)).rejects.toThrow("Insert failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryRepository] Failed to add history entry for monitor: monitor-1",
                error
            );
        });
    });

    describe("deleteByMonitorId", () => {
        it("should delete history entries for a monitor", async () => {
            (isDev as any).mockReturnValue(true);

            await historyRepository.deleteByMonitorId("monitor-1");

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE monitor_id = ?", ["monitor-1"]);
            expect(logger.debug).toHaveBeenCalledWith("[HistoryRepository] Deleted history for monitor: monitor-1");
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(historyRepository.deleteByMonitorId("monitor-1")).rejects.toThrow("Delete failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryRepository] Failed to delete history for monitor: monitor-1",
                error
            );
        });
    });

    describe("pruneHistory", () => {
        it("should prune old history entries", async () => {
            (isDev as any).mockReturnValue(true);
            const excessEntries = [{ id: 1 }, { id: 2 }, { id: 3 }];
            mockDatabase.all.mockReturnValue(excessEntries);

            await historyRepository.pruneHistory("monitor-1", 5);

            expect(mockDatabase.all).toHaveBeenCalledWith(
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                ["monitor-1", 5]
            );
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE id IN (1,2,3)");
            expect(logger.debug).toHaveBeenCalledWith(
                "[HistoryRepository] Pruned 3 old history entries for monitor: monitor-1"
            );
        });

        it("should do nothing when limit is 0 or negative", async () => {
            await historyRepository.pruneHistory("monitor-1", 0);
            await historyRepository.pruneHistory("monitor-1", -1);

            expect(mockDatabase.all).not.toHaveBeenCalled();
            expect(mockDatabase.run).not.toHaveBeenCalled();
        });

        it("should do nothing when no excess entries", async () => {
            mockDatabase.all.mockReturnValue([]);

            await historyRepository.pruneHistory("monitor-1", 5);

            expect(mockDatabase.run).not.toHaveBeenCalledWith(expect.stringContaining("DELETE"));
        });

        it("should handle database errors", async () => {
            const error = new Error("Prune failed");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(historyRepository.pruneHistory("monitor-1", 5)).rejects.toThrow("Prune failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryRepository] Failed to prune history for monitor: monitor-1",
                error
            );
        });
    });

    describe("pruneAllHistory", () => {
        it("should prune history for all monitors", async () => {
            (isDev as any).mockReturnValue(true);
            const monitorRows = [{ id: 1 }, { id: 2 }];
            mockDatabase.all.mockReturnValue(monitorRows);

            // Mock the pruneHistory calls to not actually run
            const pruneHistorySpy = vi.spyOn(historyRepository, "pruneHistory").mockResolvedValue();

            await historyRepository.pruneAllHistory(10);

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT id FROM monitors");
            expect(pruneHistorySpy).toHaveBeenCalledWith("1", 10);
            expect(pruneHistorySpy).toHaveBeenCalledWith("2", 10);
            expect(logger.debug).toHaveBeenCalledWith(
                "[HistoryRepository] Pruned history for all monitors (limit: 10)"
            );
        });

        it("should do nothing when limit is 0 or negative", async () => {
            await historyRepository.pruneAllHistory(0);
            await historyRepository.pruneAllHistory(-1);

            expect(mockDatabase.all).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            const error = new Error("Prune all failed");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(historyRepository.pruneAllHistory(10)).rejects.toThrow("Prune all failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryRepository] Failed to prune history for all monitors",
                error
            );
        });
    });

    describe("getHistoryCount", () => {
        it("should return history count for a monitor", async () => {
            mockDatabase.get.mockReturnValue({ count: 25 });

            const result = await historyRepository.getHistoryCount("monitor-1");

            expect(mockDatabase.get).toHaveBeenCalledWith(
                "SELECT COUNT(*) as count FROM history WHERE monitor_id = ?",
                ["monitor-1"]
            );
            expect(result).toBe(25);
        });

        it("should return 0 when no result", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await historyRepository.getHistoryCount("monitor-1");

            expect(result).toBe(0);
        });

        it("should handle database errors", async () => {
            const error = new Error("Count failed");
            mockDatabase.get.mockImplementation(() => {
                throw error;
            });

            await expect(historyRepository.getHistoryCount("monitor-1")).rejects.toThrow("Count failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryRepository] Failed to get history count for monitor: monitor-1",
                error
            );
        });
    });

    describe("deleteAll", () => {
        it("should delete all history entries", async () => {
            (isDev as any).mockReturnValue(true);

            await historyRepository.deleteAll();

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history");
            expect(logger.debug).toHaveBeenCalledWith("[HistoryRepository] Cleared all history");
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete all failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(historyRepository.deleteAll()).rejects.toThrow("Delete all failed");
            expect(logger.error).toHaveBeenCalledWith("[HistoryRepository] Failed to clear all history", error);
        });
    });

    describe("getLatestEntry", () => {
        it("should return the latest history entry", async () => {
            const mockRow = {
                timestamp: 1640995200000,
                status: "up",
                responseTime: 150,
                details: "Success",
            };
            mockDatabase.get.mockReturnValue(mockRow);

            const result = await historyRepository.getLatestEntry("monitor-1");

            expect(mockDatabase.get).toHaveBeenCalledWith(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
                ["monitor-1"]
            );
            expect(result).toEqual({
                timestamp: 1640995200000,
                status: "up",
                responseTime: 150,
                details: "Success",
            });
        });

        it("should return undefined when no entry found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await historyRepository.getLatestEntry("monitor-1");

            expect(result).toBeUndefined();
        });

        it("should handle database errors", async () => {
            const error = new Error("Get latest failed");
            mockDatabase.get.mockImplementation(() => {
                throw error;
            });

            await expect(historyRepository.getLatestEntry("monitor-1")).rejects.toThrow("Get latest failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryRepository] Failed to get latest history entry for monitor: monitor-1",
                error
            );
        });
    });

    describe("bulkInsert", () => {
        it("should bulk insert history entries", async () => {
            const historyEntries = [
                {
                    timestamp: 1640995200000,
                    status: "up" as const,
                    responseTime: 150,
                    details: "Success",
                },
                {
                    timestamp: 1640995100000,
                    status: "down" as const,
                    responseTime: 0,
                },
            ];

            await historyRepository.bulkInsert("monitor-1", historyEntries);

            expect(mockDatabase.run).toHaveBeenCalledTimes(2);
            expect(mockDatabase.run).toHaveBeenNthCalledWith(
                1,
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                ["monitor-1", 1640995200000, "up", 150, "Success"]
            );
            expect(mockDatabase.run).toHaveBeenNthCalledWith(
                2,
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                ["monitor-1", 1640995100000, "down", 0, null]
            );
            expect(logger.info).toHaveBeenCalledWith(
                "[HistoryRepository] Bulk inserted 2 history entries for monitor: monitor-1"
            );
        });

        it("should handle invalid status values in bulk insert", async () => {
            const historyEntries = [
                {
                    timestamp: 1640995200000,
                    status: "invalid" as any,
                    responseTime: 150,
                },
            ];

            await historyRepository.bulkInsert("monitor-1", historyEntries);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                ["monitor-1", 1640995200000, "down", 150, null]
            );
        });

        it("should handle database errors", async () => {
            const error = new Error("Bulk insert failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            const historyEntries = [
                {
                    timestamp: 1640995200000,
                    status: "up" as const,
                    responseTime: 150,
                },
            ];

            await expect(historyRepository.bulkInsert("monitor-1", historyEntries)).rejects.toThrow(
                "Bulk insert failed"
            );
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryRepository] Failed to bulk insert history for monitor: monitor-1",
                error
            );
        });
    });

    describe("rowToHistoryEntry type conversion (lines 32,34 coverage)", () => {
        it("should convert string responseTime and timestamp to numbers", async () => {
            // Mock database rows with string values (common in SQLite)
            const mockRows = [
                {
                    timestamp: "1640995200000", // String timestamp
                    status: "up",
                    responseTime: "150", // String responseTime
                    details: "OK",
                },
                {
                    timestamp: "1640995100000", // String timestamp
                    status: "down",
                    responseTime: "0", // String responseTime
                    details: "Connection failed",
                },
            ];

            mockDatabase.all.mockReturnValue(mockRows);

            const result = await historyRepository.findByMonitorId("monitor-1");

            // Verify that string values were converted to numbers
            expect(result).toEqual([
                {
                    timestamp: 1640995200000, // Converted to number
                    status: "up",
                    responseTime: 150, // Converted to number
                    details: "OK",
                },
                {
                    timestamp: 1640995100000, // Converted to number
                    status: "down",
                    responseTime: 0, // Converted to number
                    details: "Connection failed",
                },
            ]);
        });

        it("should handle mixed number and string types from database", async () => {
            // Mock a single row for getLatestEntry
            const mockRow = {
                timestamp: "1640995200000", // String
                status: "up",
                responseTime: 150, // Already a number
                details: "Mixed types test",
            };

            mockDatabase.get.mockReturnValue(mockRow);

            const result = await historyRepository.getLatestEntry("monitor-1");

            expect(result).toEqual({
                timestamp: 1640995200000, // String converted to number
                status: "up",
                responseTime: 150, // Number stays as number
                details: "Mixed types test",
            });
        });
    });
});
