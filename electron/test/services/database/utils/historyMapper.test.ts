/**
 * Comprehensive tests for historyMapper utilities.
 *
 * @remarks
 * Tests all mapping functions between database rows and StatusHistory objects,
 * including validation, conversion, and error handling scenarios.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { StatusHistory } from "../../../../../shared/types";
import type { HistoryRow as DatabaseHistoryRow } from "../../../../../shared/types/database.js";
import {
    historyEntryToRow,
    isValidHistoryRow,
    rowsToHistoryEntries,
    rowToHistoryEntry,
    rowToHistoryEntryOrUndefined,
    type HistoryRow,
} from "../../../../services/database/utils/historyMapper";
import { logger } from "../../../../utils/logger";

// Mock the logger
vi.mock("../../../../utils/logger", () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Test constants
const TEST_TIMESTAMP = 1_680_000_000_000;
const TEST_TIMESTAMP_2 = 1_680_000_001_000;

describe("historyMapper utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("historyEntryToRow", () => {
        it("should convert StatusHistory to database row format", () => {
            const monitorId = "monitor-123";
            const entry: StatusHistory = {
                status: "up",
                responseTime: 150,
                timestamp: TEST_TIMESTAMP,
            };

            const result = historyEntryToRow(monitorId, entry);

            expect(result).toEqual({
                monitorId: "monitor-123",
                responseTime: 150,
                status: "up",
                timestamp: TEST_TIMESTAMP,
            });
        });

        it("should include details when provided", () => {
            const monitorId = "monitor-456";
            const entry: StatusHistory = {
                status: "down",
                responseTime: 0,
                timestamp: TEST_TIMESTAMP,
                details: "Connection timeout",
            };
            const details = "Additional context";

            const result = historyEntryToRow(monitorId, entry, details);

            expect(result).toEqual({
                monitorId: "monitor-456",
                responseTime: 0,
                status: "down",
                timestamp: TEST_TIMESTAMP,
                details: "Additional context",
            });
        });

        it("should exclude details when not provided", () => {
            const monitorId = "monitor-789";
            const entry: StatusHistory = {
                status: "up",
                responseTime: 200,
                timestamp: TEST_TIMESTAMP,
            };

            const result = historyEntryToRow(monitorId, entry);

            expect(result).not.toHaveProperty("details");
        });

        it("should handle entry with details property", () => {
            const monitorId = "monitor-999";
            const entry: StatusHistory = {
                status: "down",
                responseTime: 500,
                timestamp: TEST_TIMESTAMP,
                details: "Server error",
            };

            const result = historyEntryToRow(monitorId, entry);

            expect(result).toEqual({
                monitorId: "monitor-999",
                responseTime: 500,
                status: "down",
                timestamp: TEST_TIMESTAMP,
            });
        });
    });

    describe("isValidHistoryRow", () => {
        it("should return true for valid row with all required fields", () => {
            const validRow: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            };

            expect(isValidHistoryRow(validRow)).toBe(true);
        });

        it("should return true for valid row with down status", () => {
            const validRow: DatabaseHistoryRow = {
                monitorId: "monitor-456",
                status: "down",
                timestamp: TEST_TIMESTAMP,
                responseTime: 0,
            };

            expect(isValidHistoryRow(validRow)).toBe(true);
        });

        it("should return false when monitorId is undefined", () => {
            const invalidRow = {
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            } as any;

            expect(isValidHistoryRow(invalidRow)).toBe(false);
        });

        it("should return false when status is undefined", () => {
            const invalidRow = {
                monitorId: "monitor-123",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            } as any;

            expect(isValidHistoryRow(invalidRow)).toBe(false);
        });

        it("should return false when timestamp is undefined", () => {
            const invalidRow = {
                monitorId: "monitor-123",
                status: "up",
                responseTime: 150,
            } as any;

            expect(isValidHistoryRow(invalidRow)).toBe(false);
        });

        it("should return false when monitorId is not a string", () => {
            const invalidRow = {
                monitorId: 123,
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            } as any;

            expect(isValidHistoryRow(invalidRow)).toBe(false);
        });

        it("should return false when status is invalid", () => {
            const invalidRow = {
                monitorId: "monitor-123",
                status: "invalid",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            } as any;

            expect(isValidHistoryRow(invalidRow)).toBe(false);
        });

        it("should return false when timestamp is NaN", () => {
            const invalidRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: Number.NaN,
                responseTime: 150,
            } as any;

            expect(isValidHistoryRow(invalidRow)).toBe(false);
        });

        it("should handle optional details field", () => {
            const validRowWithDetails: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
                details: "Success",
            };

            expect(isValidHistoryRow(validRowWithDetails)).toBe(true);
        });
    });

    describe("rowsToHistoryEntries", () => {
        it("should convert array of rows to array of StatusHistory objects", () => {
            const rows: DatabaseHistoryRow[] = [
                {
                    monitorId: "monitor-1",
                    status: "up",
                    timestamp: TEST_TIMESTAMP,
                    responseTime: 100,
                },
                {
                    monitorId: "monitor-2",
                    status: "down",
                    timestamp: TEST_TIMESTAMP_2,
                    responseTime: 0,
                },
            ];

            const result = rowsToHistoryEntries(rows);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 100,
            });
            expect(result[1]).toEqual({
                status: "down",
                timestamp: TEST_TIMESTAMP_2,
                responseTime: 0,
            });
        });

        it("should handle empty array", () => {
            const result = rowsToHistoryEntries([]);
            expect(result).toEqual([]);
        });

        it("should handle single row", () => {
            const rows: DatabaseHistoryRow[] = [
                {
                    monitorId: "monitor-1",
                    status: "up",
                    timestamp: TEST_TIMESTAMP,
                    responseTime: 250,
                    details: "OK",
                },
            ];

            const result = rowsToHistoryEntries(rows);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 250,
                details: "OK",
            });
        });
    });

    describe("rowToHistoryEntry", () => {
        it("should convert valid row to StatusHistory object", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            };

            const result = rowToHistoryEntry(row);

            expect(result).toEqual({
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            });
        });

        it("should include details when present as string", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
                details: "Connection successful",
            };

            const result = rowToHistoryEntry(row);

            expect(result).toEqual({
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
                details: "Connection successful",
            });
        });

        it("should stringify details when not a string", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
                details: { error: "timeout", code: 500 } as any,
            };

            const result = rowToHistoryEntry(row);

            expect(result).toEqual({
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
                details: '{"error":"timeout","code":500}',
            });
        });

        it("should exclude details when undefined", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
                details: undefined,
            };

            const result = rowToHistoryEntry(row);

            expect(result).not.toHaveProperty("details");
        });

        it("should handle string responseTime", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: "200" as any,
            };

            const result = rowToHistoryEntry(row);

            expect(result.responseTime).toBe(200);
        });

        it("should default invalid responseTime to 0", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: "invalid" as any,
            };

            const result = rowToHistoryEntry(row);

            expect(result.responseTime).toBe(0);
        });

        it("should handle string timestamp", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP.toString() as any,
                responseTime: 150,
            };

            const result = rowToHistoryEntry(row);

            expect(result.timestamp).toBe(TEST_TIMESTAMP);
        });

        it("should default invalid timestamp to current time", () => {
            const beforeTime = Date.now();
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: "invalid" as any,
                responseTime: 150,
            };

            const result = rowToHistoryEntry(row);
            const afterTime = Date.now();

            expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(result.timestamp).toBeLessThanOrEqual(afterTime);
        });

        it("should validate and correct invalid status", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "invalid" as any,
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            };

            const result = rowToHistoryEntry(row);

            expect(result.status).toBe("down");
            expect(logger.warn).toHaveBeenCalledWith(
                "[HistoryMapper] Invalid status value, defaulting to 'down'",
                { status: "invalid" }
            );
        });

        it("should handle valid up status", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            };

            const result = rowToHistoryEntry(row);

            expect(result.status).toBe("up");
            expect(logger.warn).not.toHaveBeenCalled();
        });

        it("should handle valid down status", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "down",
                timestamp: TEST_TIMESTAMP,
                responseTime: 0,
            };

            const result = rowToHistoryEntry(row);

            expect(result.status).toBe("down");
            expect(logger.warn).not.toHaveBeenCalled();
        });

        it("should handle NaN values appropriately", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: Number.NaN,
                responseTime: Number.NaN,
            };

            const beforeTime = Date.now();
            const result = rowToHistoryEntry(row);
            const afterTime = Date.now();

            expect(result.responseTime).toBe(0);
            expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(result.timestamp).toBeLessThanOrEqual(afterTime);
        });

        it("should throw and log error when mapping fails", () => {
            // Mock a scenario where JSON.stringify might throw
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
                details: {} as any,
            };

            // Create a circular reference to cause JSON.stringify to throw
            (row.details as any).self = row.details;

            expect(() => rowToHistoryEntry(row)).toThrow();
            expect(logger.error).toHaveBeenCalledWith(
                "[HistoryMapper] Failed to map database row to history entry",
                expect.objectContaining({
                    error: expect.any(Error),
                    row,
                    status: "up",
                    responseTime: 150,
                    timestamp: TEST_TIMESTAMP,
                })
            );
        });
    });

    describe("rowToHistoryEntryOrUndefined", () => {
        it("should return StatusHistory when row is provided", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            };

            const result = rowToHistoryEntryOrUndefined(row);

            expect(result).toEqual({
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            });
        });

        it("should return undefined when row is undefined", () => {
            const result = rowToHistoryEntryOrUndefined(undefined);
            expect(result).toBeUndefined();
        });

        it("should return undefined when row is null", () => {
            const result = rowToHistoryEntryOrUndefined(null as any);
            expect(result).toBeUndefined();
        });

        it("should handle row with details", () => {
            const row: DatabaseHistoryRow = {
                monitorId: "monitor-456",
                status: "down",
                timestamp: TEST_TIMESTAMP,
                responseTime: 0,
                details: "Connection failed",
            };

            const result = rowToHistoryEntryOrUndefined(row);

            expect(result).toEqual({
                status: "down",
                timestamp: TEST_TIMESTAMP,
                responseTime: 0,
                details: "Connection failed",
            });
        });
    });

    describe("Integration scenarios", () => {
        it("should handle complete workflow: entry to row and back", () => {
            const originalEntry: StatusHistory = {
                status: "up",
                responseTime: 250,
                timestamp: TEST_TIMESTAMP,
                details: "All good",
            };
            const monitorId = "monitor-workflow";

            // Convert to row
            const row = historyEntryToRow(monitorId, originalEntry);

            // Convert back to entry
            const convertedEntry = rowToHistoryEntry(row);

            expect(convertedEntry).toEqual({
                status: "up",
                responseTime: 250,
                timestamp: TEST_TIMESTAMP,
            });
        });

        it("should handle validation workflow", () => {
            const validRow: DatabaseHistoryRow = {
                monitorId: "monitor-123",
                status: "up",
                timestamp: TEST_TIMESTAMP,
                responseTime: 150,
            };

            expect(isValidHistoryRow(validRow)).toBe(true);

            const entry = rowToHistoryEntry(validRow);
            expect(entry.status).toBe("up");
            expect(entry.responseTime).toBe(150);
        });

        it("should handle batch processing workflow", () => {
            const rows: DatabaseHistoryRow[] = [
                {
                    monitorId: "monitor-1",
                    status: "up",
                    timestamp: TEST_TIMESTAMP,
                    responseTime: 100,
                },
                {
                    monitorId: "monitor-2",
                    status: "down",
                    timestamp: TEST_TIMESTAMP_2,
                    responseTime: 0,
                    details: "Timeout",
                },
            ];

            const entries = rowsToHistoryEntries(rows);

            expect(entries).toHaveLength(2);
            expect(entries[0].status).toBe("up");
            expect(entries[1].status).toBe("down");
            expect(entries[1].details).toBe("Timeout");
        });
    });
});
