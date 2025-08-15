/**
 * Comprehensive tests for historyQuery utilities.
 *
 * @remarks
 * Tests all history query functions including edge cases, error handling, and
 * database interaction scenarios.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { Database } from "node-sqlite3-wasm";
import type { StatusHistory } from "../../../../../shared/types.js";
import type { HistoryRow as DatabaseHistoryRow } from "../../../../../shared/types/database.js";
import {
    findHistoryByMonitorId,
    getHistoryCount,
    getLatestHistoryEntry,
} from "../../../../services/database/utils/historyQuery";
import { logger } from "../../../../utils/logger";
import { rowToHistoryEntry } from "../../../../services/database/utils/historyMapper";

// Mock dependencies
vi.mock("../../../../utils/logger", () => ({
    logger: {
        error: vi.fn(),
    },
}));

vi.mock("../../../../services/database/utils/historyMapper", () => ({
    rowToHistoryEntry: vi.fn(),
}));

// Test constants
const TEST_TIMESTAMP = 1_680_000_000_000;
const TEST_TIMESTAMP_2 = 1_680_000_001_000;

describe("historyQuery utilities", () => {
    let mockDb: Database;
    const mockMonitorId = "monitor-123";

    beforeEach(() => {
        vi.clearAllMocks();

        // Create mock database with standard methods
        mockDb = {
            all: vi.fn(),
            get: vi.fn(),
            run: vi.fn(),
            prepare: vi.fn(),
            close: vi.fn(),
            exec: vi.fn(),
        } as unknown as Database;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("findHistoryByMonitorId", () => {
        it("should return empty array when no history entries exist", () => {
            const mockRows: DatabaseHistoryRow[] = [];
            (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRows
            );

            const result = findHistoryByMonitorId(mockDb, mockMonitorId);

            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                [mockMonitorId]
            );
            expect(result).toEqual([]);
        });

        it("should return mapped history entries when data exists", () => {
            const mockRows: DatabaseHistoryRow[] = [
                {
                    timestamp: TEST_TIMESTAMP,
                    status: "up",
                    responseTime: 150,
                    details: "OK",
                },
                {
                    timestamp: TEST_TIMESTAMP_2,
                    status: "down",
                    responseTime: 0,
                    details: "Timeout",
                },
            ];

            const mockMappedEntries: StatusHistory[] = [
                {
                    timestamp: TEST_TIMESTAMP,
                    status: "up",
                    responseTime: 150,
                    details: "OK",
                },
                {
                    timestamp: TEST_TIMESTAMP_2,
                    status: "down",
                    responseTime: 0,
                    details: "Timeout",
                },
            ];

            (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRows
            );
            (rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>)
                .mockReturnValueOnce(mockMappedEntries[0])
                .mockReturnValueOnce(mockMappedEntries[1]);

            const result = findHistoryByMonitorId(mockDb, mockMonitorId);

            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                [mockMonitorId]
            );
            expect(rowToHistoryEntry).toHaveBeenCalledTimes(2);
            expect(rowToHistoryEntry).toHaveBeenNthCalledWith(1, mockRows[0]);
            expect(rowToHistoryEntry).toHaveBeenNthCalledWith(2, mockRows[1]);
            expect(result).toEqual(mockMappedEntries);
        });

        it("should handle single history entry", () => {
            const mockRows: DatabaseHistoryRow[] = [
                {
                    timestamp: TEST_TIMESTAMP,
                    status: "up",
                    responseTime: 200,
                    details: "Success",
                },
            ];

            const mockMappedEntry: StatusHistory = {
                timestamp: TEST_TIMESTAMP,
                status: "up",
                responseTime: 200,
                details: "Success",
            };

            (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRows
            );
            (
                rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>
            ).mockReturnValue(mockMappedEntry);

            const result = findHistoryByMonitorId(mockDb, mockMonitorId);

            expect(result).toEqual([mockMappedEntry]);
            expect(rowToHistoryEntry).toHaveBeenCalledTimes(1);
            expect(rowToHistoryEntry).toHaveBeenCalledWith(mockRows[0]);
        });

        it("should throw and log error when database query fails", () => {
            const dbError = new Error("Database connection failed");
            (
                mockDb.all as unknown as ReturnType<typeof vi.fn>
            ).mockImplementation(() => {
                throw dbError;
            });

            expect(() => findHistoryByMonitorId(mockDb, mockMonitorId)).toThrow(
                dbError
            );

            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryQuery] Failed to fetch history for monitor: monitor-123",
                dbError
            );
        });

        it("should handle empty monitor ID", () => {
            const mockRows: DatabaseHistoryRow[] = [];
            (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRows
            );

            const result = findHistoryByMonitorId(mockDb, "");

            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                [""]
            );
            expect(result).toEqual([]);
        });

        it("should properly order results by timestamp DESC", () => {
            const mockRows: DatabaseHistoryRow[] = [
                {
                    timestamp: TEST_TIMESTAMP_2, // Newer timestamp first
                    status: "down",
                    responseTime: 0,
                },
                {
                    timestamp: TEST_TIMESTAMP, // Older timestamp second
                    status: "up",
                    responseTime: 150,
                },
            ];

            (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRows
            );
            (rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>)
                .mockReturnValueOnce({
                    timestamp: TEST_TIMESTAMP_2,
                    status: "down",
                    responseTime: 0,
                })
                .mockReturnValueOnce({
                    timestamp: TEST_TIMESTAMP,
                    status: "up",
                    responseTime: 150,
                });

            const result = findHistoryByMonitorId(mockDb, mockMonitorId);

            // Verify the SQL includes ORDER BY timestamp DESC
            expect(mockDb.all).toHaveBeenCalledWith(
                expect.stringContaining("ORDER BY timestamp DESC"),
                [mockMonitorId]
            );

            // Verify results maintain the order from the database
            expect(result[0].timestamp).toBe(TEST_TIMESTAMP_2);
            expect(result[1].timestamp).toBe(TEST_TIMESTAMP);
        });
    });

    describe("getHistoryCount", () => {
        it("should return count when history entries exist", () => {
            const mockResult = { count: 5 };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(mockDb.get).toHaveBeenCalledWith(
                "SELECT COUNT(*) as count FROM history WHERE monitor_id = ?",
                [mockMonitorId]
            );
            expect(result).toBe(5);
        });

        it("should return 0 when no history entries exist", () => {
            const mockResult = { count: 0 };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should return 0 when result is undefined", () => {
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                undefined
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should return 0 when result is null", () => {
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                null
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should return 0 when count property is undefined", () => {
            const mockResult = { count: undefined };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should return 0 when count property is null", () => {
            const mockResult = { count: null };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should handle large count values", () => {
            const mockResult = { count: 999_999 };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(999_999);
        });

        it("should throw and log error when database query fails", () => {
            const dbError = new Error("Database connection failed");
            (
                mockDb.get as unknown as ReturnType<typeof vi.fn>
            ).mockImplementation(() => {
                throw dbError;
            });

            expect(() => getHistoryCount(mockDb, mockMonitorId)).toThrow(
                dbError
            );

            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryQuery] Failed to get history count for monitor: monitor-123",
                dbError
            );
        });

        it("should handle empty monitor ID", () => {
            const mockResult = { count: 0 };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, "");

            expect(mockDb.get).toHaveBeenCalledWith(
                "SELECT COUNT(*) as count FROM history WHERE monitor_id = ?",
                [""]
            );
            expect(result).toBe(0);
        });
    });

    describe("getLatestHistoryEntry", () => {
        it("should return latest history entry when it exists", () => {
            const mockRow: DatabaseHistoryRow = {
                timestamp: TEST_TIMESTAMP,
                status: "up",
                responseTime: 150,
                details: "OK",
            };

            const mockMappedEntry: StatusHistory = {
                timestamp: TEST_TIMESTAMP,
                status: "up",
                responseTime: 150,
                details: "OK",
            };

            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRow
            );
            (
                rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>
            ).mockReturnValue(mockMappedEntry);

            const result = getLatestHistoryEntry(mockDb, mockMonitorId);

            expect(mockDb.get).toHaveBeenCalledWith(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
                [mockMonitorId]
            );
            expect(rowToHistoryEntry).toHaveBeenCalledWith(mockRow);
            expect(result).toEqual(mockMappedEntry);
        });

        it("should return undefined when no history entries exist", () => {
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                undefined
            );

            const result = getLatestHistoryEntry(mockDb, mockMonitorId);

            expect(mockDb.get).toHaveBeenCalledWith(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
                [mockMonitorId]
            );
            expect(rowToHistoryEntry).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        it("should return undefined when result is null", () => {
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                null
            );

            const result = getLatestHistoryEntry(mockDb, mockMonitorId);

            expect(result).toBeUndefined();
            expect(rowToHistoryEntry).not.toHaveBeenCalled();
        });

        it("should handle latest entry with minimal data", () => {
            const mockRow: DatabaseHistoryRow = {
                timestamp: TEST_TIMESTAMP,
                status: "down",
                responseTime: 0,
            };

            const mockMappedEntry: StatusHistory = {
                timestamp: TEST_TIMESTAMP,
                status: "down",
                responseTime: 0,
            };

            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRow
            );
            (
                rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>
            ).mockReturnValue(mockMappedEntry);

            const result = getLatestHistoryEntry(mockDb, mockMonitorId);

            expect(result).toEqual(mockMappedEntry);
        });

        it("should use LIMIT 1 to get only the latest entry", () => {
            const mockRow: DatabaseHistoryRow = {
                timestamp: TEST_TIMESTAMP,
                status: "up",
                responseTime: 100,
            };

            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRow
            );
            (
                rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>
            ).mockReturnValue({
                timestamp: TEST_TIMESTAMP,
                status: "up",
                responseTime: 100,
            });

            getLatestHistoryEntry(mockDb, mockMonitorId);

            // Verify the SQL includes LIMIT 1
            expect(mockDb.get).toHaveBeenCalledWith(
                expect.stringContaining("LIMIT 1"),
                [mockMonitorId]
            );
        });

        it("should throw and log error when database query fails", () => {
            const dbError = new Error("Database connection failed");
            (
                mockDb.get as unknown as ReturnType<typeof vi.fn>
            ).mockImplementation(() => {
                throw dbError;
            });

            expect(() => getLatestHistoryEntry(mockDb, mockMonitorId)).toThrow(
                dbError
            );

            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryQuery] Failed to get latest history entry for monitor: monitor-123",
                dbError
            );
        });

        it("should handle empty monitor ID", () => {
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                undefined
            );

            const result = getLatestHistoryEntry(mockDb, "");

            expect(mockDb.get).toHaveBeenCalledWith(
                "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
                [""]
            );
            expect(result).toBeUndefined();
        });

        it("should handle row mapping errors", () => {
            const mockRow: DatabaseHistoryRow = {
                timestamp: TEST_TIMESTAMP,
                status: "up",
                responseTime: 150,
            };

            const mappingError = new Error("Mapping failed");

            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRow
            );
            (
                rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>
            ).mockImplementation(() => {
                throw mappingError;
            });

            expect(() => getLatestHistoryEntry(mockDb, mockMonitorId)).toThrow(
                mappingError
            );
            expect(rowToHistoryEntry).toHaveBeenCalledWith(mockRow);
        });
    });

    describe("Integration scenarios", () => {
        it("should handle complete workflow from query to mapped result", () => {
            const mockRow: DatabaseHistoryRow = {
                timestamp: TEST_TIMESTAMP,
                status: "up",
                responseTime: 120,
                details: "All systems operational",
            };

            const mockMappedEntry: StatusHistory = {
                timestamp: TEST_TIMESTAMP,
                status: "up",
                responseTime: 120,
                details: "All systems operational",
            };

            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockRow
            );
            (
                rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>
            ).mockReturnValue(mockMappedEntry);

            const latest = getLatestHistoryEntry(mockDb, mockMonitorId);

            expect(latest).toEqual(mockMappedEntry);
            expect(mockDb.get).toHaveBeenCalledOnce();
            expect(rowToHistoryEntry).toHaveBeenCalledWith(mockRow);
        });

        it("should handle monitor with no data consistently across all functions", () => {
            // Setup mocks for a monitor with no data
            (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                []
            );
            (mockDb.get as unknown as ReturnType<typeof vi.fn>)
                .mockReturnValueOnce({ count: 0 }) // for getHistoryCount
                .mockReturnValueOnce(undefined); // for getLatestHistoryEntry

            const allHistory = findHistoryByMonitorId(mockDb, "empty-monitor");
            const count = getHistoryCount(mockDb, "empty-monitor");
            const latest = getLatestHistoryEntry(mockDb, "empty-monitor");

            expect(allHistory).toEqual([]);
            expect(count).toBe(0);
            expect(latest).toBeUndefined();
        });

        it("should handle database errors consistently across all functions", () => {
            const dbError = new Error("Database unavailable");

            (
                mockDb.all as unknown as ReturnType<typeof vi.fn>
            ).mockImplementation(() => {
                throw dbError;
            });
            (
                mockDb.get as unknown as ReturnType<typeof vi.fn>
            ).mockImplementation(() => {
                throw dbError;
            });

            expect(() => findHistoryByMonitorId(mockDb, mockMonitorId)).toThrow(
                dbError
            );
            expect(() => getHistoryCount(mockDb, mockMonitorId)).toThrow(
                dbError
            );
            expect(() => getLatestHistoryEntry(mockDb, mockMonitorId)).toThrow(
                dbError
            );

            // All functions should log errors
            expect(logger.error).toHaveBeenCalledTimes(3);
        });
    });
});
