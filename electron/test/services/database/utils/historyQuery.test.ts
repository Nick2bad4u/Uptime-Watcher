/**
 * Comprehensive tests for historyQuery utilities.
 *
 * @remarks
 * Tests all history query functions including edge cases, error handling, and
 * database interaction scenarios.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fc, test } from "@fast-check/vitest";
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
        it("should return empty array when no history entries exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should return mapped history entries when data exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle single history entry", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should throw and log error when database query fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle empty monitor ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should properly order results by timestamp DESC", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(result[0]!.timestamp).toBe(TEST_TIMESTAMP_2);
            expect(result[1]!.timestamp).toBe(TEST_TIMESTAMP);
        });

        describe("Property-Based findHistoryByMonitorId Tests", () => {
            test.prop([
                fc.string({ minLength: 1, maxLength: 100 }),
                fc.array(fc.record({
                    timestamp: fc.integer({ min: 0, max: Date.now() }),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.integer({ min: 0, max: 60_000 }),
                    details: fc.oneof(
                        fc.string({ maxLength: 200 }),
                        fc.constant(null),
                        fc.constant(undefined)
                    )
                }), { minLength: 0, maxLength: 20 })
            ])(
                "should handle various monitor IDs and history data",
                (monitorId, historyRows) => {
                    // Arrange
                    const mockRows: DatabaseHistoryRow[] = historyRows.map(row => ({
                        ...row,
                        monitorId
                    })) as DatabaseHistoryRow[];

                    (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRows);

                    const expectedMappedResults = historyRows.map(row => ({
                        status: row.status,
                        timestamp: row.timestamp,
                        responseTime: row.responseTime,
                        ...(row.details && { details: row.details })
                    }));

                    (rowToHistoryEntry as ReturnType<typeof vi.fn>).mockImplementation((row: any) => {
                        const { timestamp, status, responseTime, details } = row;
                        return {
                            status,
                            timestamp,
                            responseTime,
                            ...(details && { details })
                        };
                    });

                    // Act
                    const result = findHistoryByMonitorId(mockDb, monitorId);

                    // Assert
                    expect(mockDb.all).toHaveBeenCalledWith(
                        "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                        [monitorId]
                    );

                    expect(Array.isArray(result)).toBe(true);
                    expect(result).toHaveLength(historyRows.length);

                    if (historyRows.length > 0) {
                        for (const [index, item] of result.entries()) {
                            expect(item.status).toBe(historyRows[index].status);
                            expect(item.timestamp).toBe(historyRows[index].timestamp);
                            expect(item.responseTime).toBe(historyRows[index].responseTime);
                        }
                    }
                }
            );

            test.prop([fc.constantFrom(0)])(
                "should handle empty results correctly",
                (emptyLength) => {
                    fc.pre(emptyLength === 0);

                    // Arrange
                    (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);

                    // Act
                    const result = findHistoryByMonitorId(mockDb, "non-existent-monitor");

                    // Assert
                    expect(result).toEqual([]);
                    expect(Array.isArray(result)).toBe(true);
                    expect(result).toHaveLength(0);
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.array(fc.record({
                    timestamp: fc.integer({ min: Date.now() - 1_000_000, max: Date.now() }),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.oneof(
                        fc.integer({ min: 0, max: 100 }),
                        fc.integer({ min: 5000, max: 60_000 })
                    ),
                    details: fc.string({ maxLength: 100 })
                }), { minLength: 1, maxLength: 15 })
            ])(
                "should handle realistic history data with various timestamps",
                (monitorId, historyData) => {
                    // Arrange
                    const mockRows = historyData.map(row => ({
                        ...row,
                        monitorId
                    })) as DatabaseHistoryRow[];

                    (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRows);
                    (rowToHistoryEntry as ReturnType<typeof vi.fn>).mockImplementation((row: any) => ({
                        status: row.status,
                        timestamp: row.timestamp,
                        responseTime: row.responseTime,
                        details: row.details
                    }));

                    // Act
                    const result = findHistoryByMonitorId(mockDb, monitorId);

                    // Assert
                    expect(result).toHaveLength(historyData.length);
                    expect(rowToHistoryEntry).toHaveBeenCalledTimes(historyData.length);

                    // Verify all results are valid StatusHistory objects
                    for (const entry of result) {
                        expect(["up", "down"]).toContain(entry.status);
                        expect(typeof entry.timestamp).toBe("number");
                        expect(typeof entry.responseTime).toBe("number");
                    }
                }
            );

            test.prop([
                fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 })
            ])(
                "should handle sequential queries for different monitors",
                (monitorIds) => {
                    // Act & Assert
                    for (const monitorId of monitorIds) {
                        (mockDb.all as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);

                        const result = findHistoryByMonitorId(mockDb, monitorId);

                        expect(mockDb.all).toHaveBeenCalledWith(
                            "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC",
                            [monitorId]
                        );

                        expect(Array.isArray(result)).toBe(true);
                    }

                    expect(mockDb.all).toHaveBeenCalledTimes(monitorIds.length);
                }
            );
        });
    });

    describe("getHistoryCount", () => {
        it("should return count when history entries exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should return 0 when no history entries exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = { count: 0 };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should return 0 when result is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                undefined
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should return 0 when result is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                null
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should return 0 when count property is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = { count: undefined };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should return 0 when count property is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = { count: null };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(0);
        });

        it("should handle large count values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = { count: 999_999 };
            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                mockResult
            );

            const result = getHistoryCount(mockDb, mockMonitorId);

            expect(result).toBe(999_999);
        });

        it("should throw and log error when database query fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle empty monitor ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

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

        describe("Property-Based getHistoryCount Tests", () => {
            test.prop([
                fc.string({ minLength: 1, maxLength: 100 }),
                fc.integer({ min: 0, max: 100_000 })
            ])(
                "should return count for various monitor IDs and count values",
                (monitorId, expectedCount) => {
                    // Arrange
                    const mockResult = { count: expectedCount };
                    (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

                    // Act
                    const result = getHistoryCount(mockDb, monitorId);

                    // Assert
                    expect(mockDb.get).toHaveBeenCalledWith(
                        "SELECT COUNT(*) as count FROM history WHERE monitor_id = ?",
                        [monitorId]
                    );
                    expect(result).toBe(expectedCount);
                    expect(typeof result).toBe("number");
                    expect(result).toBeGreaterThanOrEqual(0);
                }
            );

            test.prop([
                fc.array(fc.record({
                    monitorId: fc.string({ minLength: 1, maxLength: 50 }),
                    count: fc.integer({ min: 0, max: 10_000 })
                }), { minLength: 1, maxLength: 10 })
            ])(
                "should handle sequential count queries for multiple monitors",
                (monitorCountPairs) => {
                    // Act & Assert
                    for (const { monitorId, count } of monitorCountPairs) {
                        const mockResult = { count };
                        (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

                        const result = getHistoryCount(mockDb, monitorId);

                        expect(result).toBe(count);
                        expect(mockDb.get).toHaveBeenCalledWith(
                            "SELECT COUNT(*) as count FROM history WHERE monitor_id = ?",
                            [monitorId]
                        );
                    }

                    expect(mockDb.get).toHaveBeenCalledTimes(monitorCountPairs.length);
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.constantFrom(0, 1, 100, 1000, 50_000, 999_999)
            ])(
                "should handle edge case count values correctly",
                (monitorId, edgeCount) => {
                    // Arrange
                    const mockResult = { count: edgeCount };
                    (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

                    // Act
                    const result = getHistoryCount(mockDb, monitorId);

                    // Assert
                    expect(result).toBe(edgeCount);
                    expect(Number.isInteger(result)).toBe(true);
                    expect(result).toBeGreaterThanOrEqual(0);
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.oneof(
                    fc.constant("Database connection failed"),
                    fc.constant("Table does not exist"),
                    fc.constant("Permission denied"),
                    fc.string({ minLength: 5, maxLength: 100 })
                )
            ])(
                "should handle various database errors",
                (monitorId, errorMessage) => {
                    // Arrange
                    const dbError = new Error(errorMessage);
                    (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
                        throw dbError;
                    });

                    // Act & Assert
                    expect(() => getHistoryCount(mockDb, monitorId)).toThrow(errorMessage);
                    expect(logger.error).toHaveBeenCalledWith(
                        `[HistoryQuery] Failed to get history count for monitor: ${monitorId}`,
                        dbError
                    );
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.string({ maxLength: 0 }),
                    fc.constant("   "),
                    fc.string({ minLength: 1, maxLength: 5 }).map(s => s.trim())
                )
            ])(
                "should handle empty or whitespace monitor IDs",
                (problematicMonitorId) => {
                    // Arrange
                    const mockResult = { count: 0 };
                    (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

                    // Act
                    const result = getHistoryCount(mockDb, problematicMonitorId);

                    // Assert
                    expect(mockDb.get).toHaveBeenCalledWith(
                        "SELECT COUNT(*) as count FROM history WHERE monitor_id = ?",
                        [problematicMonitorId]
                    );
                    expect(result).toBe(0);
                }
            );
        });
    });

    describe("getLatestHistoryEntry", () => {
        it("should return latest history entry when it exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should return undefined when no history entries exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should return undefined when result is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
                null
            );

            const result = getLatestHistoryEntry(mockDb, mockMonitorId);

            expect(result).toBeUndefined();
            expect(rowToHistoryEntry).not.toHaveBeenCalled();
        });

        it("should handle latest entry with minimal data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should use LIMIT 1 to get only the latest entry", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

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

        it("should throw and log error when database query fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle empty monitor ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should handle row mapping errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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

        describe("Property-Based getLatestHistoryEntry Tests", () => {
            test.prop([
                fc.string({ minLength: 1, maxLength: 100 }),
                fc.record({
                    timestamp: fc.integer({ min: 0, max: Date.now() }),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.integer({ min: 0, max: 60_000 }),
                    details: fc.oneof(
                        fc.string({ maxLength: 200 }),
                        fc.constant(null),
                        fc.constant(undefined)
                    )
                })
            ])(
                "should return latest history entry for various monitor IDs and data",
                (monitorId, mockRowData) => {
                    // Arrange
                    const mockRow: DatabaseHistoryRow = {
                        ...mockRowData,
                        monitorId
                    } as DatabaseHistoryRow;

                    const expectedMappedEntry: StatusHistory = {
                        timestamp: mockRowData.timestamp,
                        status: mockRowData.status,
                        responseTime: mockRowData.responseTime,
                        ...(mockRowData.details && { details: mockRowData.details })
                    };

                    (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRow);
                    (rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>).mockReturnValue(expectedMappedEntry);

                    // Act
                    const result = getLatestHistoryEntry(mockDb, monitorId);

                    // Assert
                    expect(mockDb.get).toHaveBeenCalledWith(
                        "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
                        [monitorId]
                    );
                    expect(rowToHistoryEntry).toHaveBeenCalledWith(mockRow);
                    expect(result).toEqual(expectedMappedEntry);

                    if (result) {
                        expect(["up", "down"]).toContain(result.status);
                        expect(typeof result.timestamp).toBe("number");
                        expect(typeof result.responseTime).toBe("number");
                    }
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 })
            ])(
                "should return undefined when no history entry exists",
                (monitorId) => {
                    // Arrange
                    (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

                    // Act
                    const result = getLatestHistoryEntry(mockDb, monitorId);

                    // Assert
                    expect(mockDb.get).toHaveBeenCalledWith(
                        "SELECT timestamp, status, responseTime, details FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1",
                        [monitorId]
                    );
                    expect(result).toBeUndefined();
                    expect(rowToHistoryEntry).not.toHaveBeenCalled();
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.oneof(
                    fc.constant("Database connection failed"),
                    fc.constant("Table not found"),
                    fc.constant("Query timeout"),
                    fc.string({ minLength: 5, maxLength: 100 })
                )
            ])(
                "should handle various database errors",
                (monitorId, errorMessage) => {
                    // Arrange
                    const dbError = new Error(errorMessage);
                    (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
                        throw dbError;
                    });

                    // Act & Assert
                    expect(() => getLatestHistoryEntry(mockDb, monitorId)).toThrow(errorMessage);
                    expect(logger.error).toHaveBeenCalledWith(
                        `[HistoryQuery] Failed to get latest history entry for monitor: ${monitorId}`,
                        dbError
                    );
                }
            );

            test.prop([
                fc.array(fc.record({
                    monitorId: fc.string({ minLength: 1, maxLength: 30 }),
                    timestamp: fc.integer({ min: Date.now() - 1_000_000, max: Date.now() }),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.integer({ min: 0, max: 5000 })
                }), { minLength: 1, maxLength: 8 })
            ])(
                "should handle sequential queries for multiple monitors",
                (monitorEntries) => {
                    // Act & Assert
                    for (const entry of monitorEntries) {
                        const mockRow: DatabaseHistoryRow = {
                            ...entry
                        } as DatabaseHistoryRow;

                        const expectedMappedEntry: StatusHistory = {
                            timestamp: entry.timestamp,
                            status: entry.status,
                            responseTime: entry.responseTime
                        };

                        (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRow);
                        (rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>).mockReturnValue(expectedMappedEntry);

                        const result = getLatestHistoryEntry(mockDb, entry.monitorId);

                        expect(result).toEqual(expectedMappedEntry);
                        expect(mockDb.get).toHaveBeenCalledWith(
                            expect.stringContaining("LIMIT 1"),
                            [entry.monitorId]
                        );
                    }

                    expect(mockDb.get).toHaveBeenCalledTimes(monitorEntries.length);
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.record({
                    timestamp: fc.oneof(
                        fc.integer({ min: 0, max: 1000 }),
                        fc.integer({ min: Date.now() - 1000, max: Date.now() }),
                        fc.integer({ min: Date.now(), max: Date.now() + 100_000 })
                    ),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.oneof(
                        fc.integer({ min: 0, max: 0 }),
                        fc.integer({ min: 1, max: 100 }),
                        fc.integer({ min: 30_000, max: 60_000 })
                    )
                })
            ])(
                "should handle edge case timestamps and response times",
                (monitorId, edgeData) => {
                    // Arrange
                    const mockRow: DatabaseHistoryRow = {
                        ...edgeData,
                        monitorId
                    } as DatabaseHistoryRow;

                    const expectedMappedEntry: StatusHistory = {
                        timestamp: edgeData.timestamp,
                        status: edgeData.status,
                        responseTime: edgeData.responseTime
                    };

                    (mockDb.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRow);
                    (rowToHistoryEntry as unknown as ReturnType<typeof vi.fn>).mockReturnValue(expectedMappedEntry);

                    // Act
                    const result = getLatestHistoryEntry(mockDb, monitorId);

                    // Assert
                    expect(result).toEqual(expectedMappedEntry);

                    if (result) {
                        expect(Number.isFinite(result.timestamp)).toBe(true);
                        expect(Number.isFinite(result.responseTime)).toBe(true);
                        expect(result.timestamp).toBe(edgeData.timestamp);
                        expect(result.responseTime).toBe(edgeData.responseTime);
                    }
                }
            );
        });
    });

    describe("Integration scenarios", () => {
        it("should handle complete workflow from query to mapped result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle monitor with no data consistently across all functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should handle database errors consistently across all functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyQuery", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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
