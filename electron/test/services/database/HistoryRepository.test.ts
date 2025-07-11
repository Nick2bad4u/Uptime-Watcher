import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HistoryRepository } from "../../../services/database/HistoryRepository";
import { DatabaseService } from "../../../services/database/DatabaseService";
import { StatusHistory } from "../../../types";
import { logger } from "../../../utils/logger";
import { isDev } from "../../../electronUtils";

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
vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(),
}));

describe("HistoryRepository", () => {
    let historyRepository: HistoryRepository;
    let mockDatabase: any;
    let mockDatabaseService: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock database methods
        const mockStatement = {
            run: vi.fn(),
            finalize: vi.fn(),
        };

        mockDatabase = {
            all: vi.fn(),
            get: vi.fn(),
            run: vi.fn(),
            prepare: vi.fn().mockReturnValue(mockStatement),
        };

        // Mock DatabaseService
        mockDatabaseService = {
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
            executeTransaction: vi.fn().mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            }),
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
                "[HistoryManipulation] Added history entry: monitor_id=monitor-1, status=up, responseTime=150, timestamp=1640995200000"
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
    });

    describe("deleteByMonitorId", () => {
        it("should delete history entries for a monitor", async () => {
            (isDev as any).mockReturnValue(true);

            await historyRepository.deleteByMonitorId("monitor-1");

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE monitor_id = ?", ["monitor-1"]);
            expect(logger.debug).toHaveBeenCalledWith("[HistoryManipulation] Deleted history for monitor: monitor-1");
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
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE id IN (?,?,?)", [1, 2, 3]);
            expect(logger.debug).toHaveBeenCalledWith(
                "[HistoryManipulation] Pruned 3 old history entries for monitor: monitor-1"
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
    });

    describe("pruneAllHistory", () => {
        it("should prune history for all monitors", async () => {
            (isDev as any).mockReturnValue(true);
            const monitorRows = [{ id: 1 }, { id: 2 }];
            
            // Mock the monitors query
            mockDatabase.all.mockReturnValueOnce(monitorRows);
            
            // Mock the excess entries queries for each monitor
            const excessEntries1 = [{ id: 10 }, { id: 11 }];
            const excessEntries2 = [{ id: 20 }, { id: 21 }];
            mockDatabase.all.mockReturnValueOnce(excessEntries1);
            mockDatabase.all.mockReturnValueOnce(excessEntries2);

            await historyRepository.pruneAllHistory(10);

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
            
            // Verify monitors query
            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT id FROM monitors");
            
            // Verify pruning queries for each monitor
            expect(mockDatabase.all).toHaveBeenCalledWith(
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                ["1", 10]
            );
            expect(mockDatabase.all).toHaveBeenCalledWith(
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                ["2", 10]
            );
            
            // Verify delete queries for excess entries
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE id IN (?,?)", [10, 11]);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE id IN (?,?)", [20, 21]);
            
            expect(logger.debug).toHaveBeenCalledWith(
                "[HistoryRepository] Pruned history for all monitors (limit: 10) (internal)"
            );
        });

        it("should do nothing when limit is 0 or negative", async () => {
            await historyRepository.pruneAllHistory(0);
            await historyRepository.pruneAllHistory(-1);

            expect(mockDatabaseService.executeTransaction).not.toHaveBeenCalled();
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
    });

    describe("deleteAll", () => {
        it("should delete all history entries", async () => {
            (isDev as any).mockReturnValue(true);

            await historyRepository.deleteAll();

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history");
            expect(logger.debug).toHaveBeenCalledWith("[HistoryManipulation] Cleared all history");
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

            // Since we now use executeTransaction, verify the transaction wrapper is called
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();

            // Should prepare statement
            expect(mockDatabase.prepare).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)"
            );

            // Should run statements for each entry
            const mockStatement = mockDatabase.prepare.mock.results[0].value;
            expect(mockStatement.run).toHaveBeenCalledTimes(2);
            expect(mockStatement.run).toHaveBeenNthCalledWith(1, ["monitor-1", 1640995200000, "up", 150, "Success"]);
            expect(mockStatement.run).toHaveBeenNthCalledWith(2, ["monitor-1", 1640995100000, "down", 0, null]);

            // Should finalize statement
            expect(mockStatement.finalize).toHaveBeenCalled();

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

            // Since we now use executeTransaction, verify the transaction wrapper is called
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();

            // Should prepare statement
            expect(mockDatabase.prepare).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)"
            );

            // Should run statement with corrected status (invalid -> down)
            const mockStatement = mockDatabase.prepare.mock.results[0].value;
            expect(mockStatement.run).toHaveBeenCalledWith(["monitor-1", 1640995200000, "down", 150, null]);

            // Should finalize statement
            expect(mockStatement.finalize).toHaveBeenCalled();
        });
    });

    describe("Database row to history entry conversion (utility function integration)", () => {
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
