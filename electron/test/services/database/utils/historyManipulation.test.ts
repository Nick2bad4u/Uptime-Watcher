/**
 * @file Comprehensive tests for historyManipulation utility functions Testing
 *   all database manipulation functions with proper mocking
 * Enhanced with property-based testing for robust data validation coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { test, fc } from "@fast-check/vitest";
import type { Database } from "node-sqlite3-wasm";
import type { StatusHistory } from "../../../../../shared/types.js";

// Import functions to test
import {
    addHistoryEntry,
    bulkInsertHistory,
    deleteAllHistory,
    deleteHistoryByMonitorId,
    pruneHistoryForMonitor,
} from "../../../../services/database/utils/historyManipulation";

// Mock dependencies
vi.mock("../../../../electronUtils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("../../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../../../../shared/utils/logTemplates", () => ({
    interpolateLogTemplate: vi.fn(
        (template, data) => `${template} ${JSON.stringify(data)}`
    ),
    LOG_TEMPLATES: {
        debug: {
            HISTORY_ENTRY_ADDED: "HISTORY_ENTRY_ADDED",
        },
        services: {
            HISTORY_BULK_INSERT: "HISTORY_BULK_INSERT",
        },
        errors: {
            HISTORY_ADD_FAILED: "HISTORY_ADD_FAILED",
            HISTORY_BULK_INSERT_FAILED: "HISTORY_BULK_INSERT_FAILED",
            HISTORY_PRUNE_FAILED: "HISTORY_PRUNE_FAILED",
        },
    },
}));

describe("History Manipulation Utilities", () => {
    let mockDb: Database;
    let mockLogger: any;
    let mockIsDev: any;

    const sampleStatusHistory: StatusHistory = {
        timestamp: Date.now(),
        status: "up",
        responseTime: 123,
    };

    const monitorId = "test-monitor-123";

    beforeEach(async () => {
        // Reset all mocks
        vi.clearAllMocks();

        // Get mocked dependencies
        const loggerModule = await import("../../../../utils/logger");
        mockLogger = vi.mocked(loggerModule.logger);

        const electronUtilsModule = await import("../../../../electronUtils");
        mockIsDev = vi.mocked(electronUtilsModule.isDev);

        const logTemplatesModule = await import(
            "../../../../../shared/utils/logTemplates"
        );
        vi.mocked(logTemplatesModule.interpolateLogTemplate);

        // Create mock database
        mockDb = {
            run: vi.fn(),
            prepare: vi.fn(),
            all: vi.fn(),
        } as unknown as Database;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe(addHistoryEntry, () => {
        it("should add history entry successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: addHistoryEntry", "function");
            await annotate("Priority: Critical", "priority");

            // Arrange
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(false);

            // Act
            addHistoryEntry(mockDb, monitorId, sampleStatusHistory);

            // Assert
            expect(mockDb.run).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                [
                    monitorId,
                    sampleStatusHistory.timestamp,
                    sampleStatusHistory.status,
                    sampleStatusHistory.responseTime,
                    null,
                ]
            );
        });

        it("should add history entry with details", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: addHistoryEntry", "function");
            await annotate("Feature: Details parameter", "feature");

            // Arrange
            const details = "Connection timeout";
            mockDb.run = vi.fn();

            // Act
            addHistoryEntry(mockDb, monitorId, sampleStatusHistory, details);

            // Assert
            expect(mockDb.run).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                [
                    monitorId,
                    sampleStatusHistory.timestamp,
                    sampleStatusHistory.status,
                    sampleStatusHistory.responseTime,
                    details,
                ]
            );
        });

        it("should log debug message in development environment", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Environment: Development", "environment");
            await annotate("Feature: Debug logging", "feature");

            // Arrange
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(true);

            // Act
            addHistoryEntry(mockDb, monitorId, sampleStatusHistory);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                'HISTORY_ENTRY_ADDED {"monitorId":"test-monitor-123","status":"up"}'
            );
        });

        it("should not log debug message in production environment", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Environment: Production", "environment");
            await annotate("Feature: Debug logging disabled", "feature");

            // Arrange
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(false);

            // Act
            addHistoryEntry(mockDb, monitorId, sampleStatusHistory);

            // Assert
            expect(mockLogger.debug).not.toHaveBeenCalled();
        });

        it("should handle database errors properly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: addHistoryEntry", "function");
            await annotate("Category: Error handling", "category");

            // Arrange
            const dbError = new Error("Database connection failed");
            mockDb.run = vi.fn().mockImplementation(() => {
                throw dbError;
            });

            // Act & Assert
            expect(() =>
                addHistoryEntry(mockDb, monitorId, sampleStatusHistory)
            ).toThrow("Database connection failed");

            expect(mockLogger.error).toHaveBeenCalledWith(
                'HISTORY_ADD_FAILED {"monitorId":"test-monitor-123"}',
                dbError
            );
        });

        describe("Property-Based addHistoryEntry Tests", () => {
            test.prop([fc.string({ minLength: 1, maxLength: 50 })])(
                "should handle various monitor IDs",
                (monitorId) => {
                    // Arrange
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Act
                    addHistoryEntry(mockDb, monitorId, sampleStatusHistory);

                    // Assert
                    expect(mockDb.run).toHaveBeenCalledWith(
                        "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                        [
                            monitorId,
                            sampleStatusHistory.timestamp,
                            sampleStatusHistory.status,
                            sampleStatusHistory.responseTime,
                            null,
                        ]
                    );
                }
            );

            test.prop([fc.record({
                timestamp: fc.integer({ min: 0, max: Date.now() + 1_000_000 }),
                status: fc.constantFrom("up", "down"),
                responseTime: fc.integer({ min: -1, max: 30_000 })
            })])(
                "should handle various history entries",
                (historyEntry) => {
                    // Arrange
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Act
                    addHistoryEntry(mockDb, monitorId, historyEntry);

                    // Assert
                    expect(mockDb.run).toHaveBeenCalledWith(
                        "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                        [
                            monitorId,
                            historyEntry.timestamp,
                            historyEntry.status,
                            historyEntry.responseTime,
                            null,
                        ]
                    );
                }
            );

            test.prop([fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined))])(
                "should handle various details values",
                (details) => {
                    // Arrange
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);
                    const expectedDetails = details === undefined ? null : details;

                    // Act
                    addHistoryEntry(mockDb, monitorId, sampleStatusHistory, details as string);

                    // Assert
                    expect(mockDb.run).toHaveBeenCalledWith(
                        "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                        [
                            monitorId,
                            sampleStatusHistory.timestamp,
                            sampleStatusHistory.status,
                            sampleStatusHistory.responseTime,
                            expectedDetails,
                        ]
                    );
                }
            );

            test.prop([fc.array(fc.record({
                monitorId: fc.string({ minLength: 1, maxLength: 30 }),
                timestamp: fc.integer({ min: 0, max: Date.now() }),
                status: fc.constantFrom("up", "down"),
                responseTime: fc.integer({ min: -1, max: 30_000 }),
                details: fc.oneof(fc.string({ maxLength: 100 }), fc.constant(null))
            }), { minLength: 1, maxLength: 10 })])(
                "should handle multiple sequential history additions",
                (historyBatch) => {
                    // Arrange
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Act
                    for (const entry of historyBatch) {
                        addHistoryEntry(mockDb, entry.monitorId, {
                            timestamp: entry.timestamp,
                            status: entry.status,
                            responseTime: entry.responseTime
                        }, entry.details ?? undefined);
                    }

                    // Assert
                    expect(mockDb.run).toHaveBeenCalledTimes(historyBatch.length);

                    for (const [index, entry] of historyBatch.entries()) {
                        expect(mockDb.run).toHaveBeenNthCalledWith(
                            index + 1,
                            "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                            [
                                entry.monitorId,
                                entry.timestamp,
                                entry.status,
                                entry.responseTime,
                                entry.details,
                            ]
                        );
                    }
                }
            );
        });
    });

    describe(bulkInsertHistory, () => {
        const historyEntries = [
            { ...sampleStatusHistory, details: "First entry" },
            {
                ...sampleStatusHistory,
                timestamp: Date.now() + 1000,
                status: "down" as const,
            },
            {
                ...sampleStatusHistory,
                timestamp: Date.now() + 2000,
                responseTime: 456,
            },
        ];

        it("should handle empty history entries array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: bulkInsertHistory", "function");
            await annotate("Edge case: Empty array", "edge-case");

            // Act
            bulkInsertHistory(mockDb, monitorId, []);

            // Assert - should return early without any database operations
            expect(mockDb.prepare).not.toHaveBeenCalled();
        });

        it("should bulk insert history entries successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: bulkInsertHistory", "function");
            await annotate("Priority: High", "priority");

            // Arrange
            const mockStmt = {
                run: vi.fn(),
                finalize: vi.fn(),
            };
            mockDb.prepare = vi.fn().mockReturnValue(mockStmt);

            // Act
            bulkInsertHistory(mockDb, monitorId, historyEntries);

            // Assert
            expect(mockDb.prepare).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)"
            );

            expect(mockStmt.run).toHaveBeenCalledTimes(3);
            expect(mockStmt.run).toHaveBeenNthCalledWith(1, [
                monitorId,
                historyEntries[0]?.timestamp,
                historyEntries[0]?.status,
                historyEntries[0]?.responseTime,
                "First entry",
            ]);
            expect(mockStmt.run).toHaveBeenNthCalledWith(2, [
                monitorId,
                historyEntries[1]?.timestamp,
                historyEntries[1]?.status,
                historyEntries[1]?.responseTime,
                null,
            ]);

            expect(mockStmt.finalize).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith(
                'HISTORY_BULK_INSERT {"count":3,"monitorId":"test-monitor-123"}'
            );
        });

        it("should finalize statement even if run fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: bulkInsertHistory", "function");
            await annotate("Category: Error handling", "category");
            await annotate("Feature: Resource cleanup", "feature");

            // Arrange
            const runError = new Error("Statement execution failed");
            const mockStmt = {
                run: vi.fn().mockImplementation(() => {
                    throw runError;
                }),
                finalize: vi.fn(),
            };
            mockDb.prepare = vi.fn().mockReturnValue(mockStmt);

            // Act & Assert
            expect(() =>
                bulkInsertHistory(mockDb, monitorId, historyEntries)
            ).toThrow("Statement execution failed");

            expect(mockStmt.finalize).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).toHaveBeenCalledWith(
                'HISTORY_BULK_INSERT_FAILED {"monitorId":"test-monitor-123"}',
                runError
            );
        });

        it("should handle prepare statement failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: bulkInsertHistory", "function");
            await annotate("Category: Error handling", "category");
            await annotate("Feature: Prepare statement failure", "feature");

            // Arrange
            const prepareError = new Error("Failed to prepare statement");
            mockDb.prepare = vi.fn().mockImplementation(() => {
                throw prepareError;
            });

            // Act & Assert
            expect(() =>
                bulkInsertHistory(mockDb, monitorId, historyEntries)
            ).toThrow("Failed to prepare statement");

            expect(mockLogger.error).toHaveBeenCalledWith(
                'HISTORY_BULK_INSERT_FAILED {"monitorId":"test-monitor-123"}',
                prepareError
            );
        });

        describe("Property-Based bulkInsertHistory Tests", () => {
            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.array(fc.record({
                    timestamp: fc.integer({ min: 0, max: Date.now() }),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.integer({ min: -1, max: 60_000 })
                }), { minLength: 1, maxLength: 20 })
            ])(
                "should handle bulk insert with various data",
                (monitorId, historyEntries) => {
                    // Arrange
                    const mockPrepare = vi.fn().mockReturnValue({
                        run: vi.fn(),
                        finalize: vi.fn()
                    });
                    mockDb.prepare = mockPrepare;
                    mockIsDev.mockReturnValue(false);

                    // Act
                    bulkInsertHistory(mockDb, monitorId, historyEntries);

                    // Assert
                    expect(mockPrepare).toHaveBeenCalledWith(
                        "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)"
                    );
                    expect(mockPrepare().run).toHaveBeenCalledTimes(historyEntries.length);
                    expect(mockPrepare().finalize).toHaveBeenCalledTimes(1);
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 30 }),
                fc.integer({ min: 0, max: 100 })
            ])(
                "should handle bulk insert with empty arrays",
                (monitorId, emptyArraySize) => {
                    fc.pre(emptyArraySize === 0); // Only test with empty arrays

                    // Arrange
                    const mockPrepare = vi.fn();
                    mockDb.prepare = mockPrepare;
                    mockIsDev.mockReturnValue(false);

                    // Act
                    bulkInsertHistory(mockDb, monitorId, []);

                    // Assert - Should not prepare statement for empty array
                    expect(mockPrepare).not.toHaveBeenCalled();
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.array(fc.record({
                    timestamp: fc.oneof(
                        fc.integer({ min: 0, max: Date.now() }),
                        fc.integer({ min: -1_000_000, max: 0 }), // Negative timestamps
                        fc.integer({ min: Date.now(), max: Date.now() + 1_000_000 }) // Future timestamps
                    ),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.oneof(
                        fc.integer({ min: -1, max: 10 }),
                        fc.integer({ min: 30_000, max: 300_000 }) // Very high response times
                    )
                }), { minLength: 1, maxLength: 5 })
            ])(
                "should handle edge case timestamps and response times",
                (monitorId, historyEntries) => {
                    // Arrange
                    const mockStatement = {
                        run: vi.fn(),
                        finalize: vi.fn()
                    };
                    const mockPrepare = vi.fn().mockReturnValue(mockStatement);
                    mockDb.prepare = mockPrepare;
                    mockIsDev.mockReturnValue(false);

                    // Act
                    bulkInsertHistory(mockDb, monitorId, historyEntries);

                    // Assert
                    expect(mockStatement.run).toHaveBeenCalledTimes(historyEntries.length);

                    for (const [index, entry] of historyEntries.entries()) {
                        expect(mockStatement.run).toHaveBeenNthCalledWith(
                            index + 1,
                            [monitorId, entry.timestamp, entry.status, entry.responseTime, null]
                        );
                    }
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.array(fc.record({
                    timestamp: fc.integer({ min: 0, max: Date.now() }),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.integer({ min: 0, max: 5000 })
                }), { minLength: 50, maxLength: 200 })
            ])(
                "should handle large bulk inserts efficiently",
                (monitorId, largeHistoryArray) => {
                    // Arrange
                    const mockStatement = {
                        run: vi.fn(),
                        finalize: vi.fn()
                    };
                    const mockPrepare = vi.fn().mockReturnValue(mockStatement);
                    mockDb.prepare = mockPrepare;
                    mockIsDev.mockReturnValue(false);

                    // Act
                    const startTime = performance.now();
                    bulkInsertHistory(mockDb, monitorId, largeHistoryArray);
                    const endTime = performance.now();

                    // Assert
                    expect(mockPrepare).toHaveBeenCalledTimes(1);
                    expect(mockStatement.run).toHaveBeenCalledTimes(largeHistoryArray.length);
                    expect(mockStatement.finalize).toHaveBeenCalledTimes(1);

                    // Performance assertion - should complete quickly
                    expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 30 }),
                fc.array(fc.record({
                    timestamp: fc.integer({ min: 0, max: Date.now() }),
                    status: fc.constantFrom("up", "down"),
                    responseTime: fc.integer({ min: 0, max: 10_000 })
                }), { minLength: 1, maxLength: 10 })
            ])(
                "should properly clean up prepared statements",
                (monitorId, historyEntries) => {
                    // Arrange
                    const mockStatement = {
                        run: vi.fn(),
                        finalize: vi.fn()
                    };
                    const mockPrepare = vi.fn().mockReturnValue(mockStatement);
                    mockDb.prepare = mockPrepare;
                    mockIsDev.mockReturnValue(false);

                    // Act
                    bulkInsertHistory(mockDb, monitorId, historyEntries);

                    // Assert - Finalize should always be called for cleanup
                    expect(mockStatement.finalize).toHaveBeenCalledTimes(1);
                }
            );
        });
    });

    describe(deleteAllHistory, () => {
        it("should delete all history successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: deleteAllHistory", "function");
            await annotate("Priority: High", "priority");
            await annotate("Category: Destructive operation", "category");

            // Arrange
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(false);

            // Act
            deleteAllHistory(mockDb);

            // Assert
            expect(mockDb.run).toHaveBeenCalledWith("DELETE FROM history");
        });

        it("should log debug message in development environment", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Environment: Development", "environment");
            await annotate("Feature: Debug logging", "feature");

            // Arrange
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(true);

            // Act
            deleteAllHistory(mockDb);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[HistoryManipulation] Cleared all history"
            );
        });

        it("should handle database errors properly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: deleteAllHistory", "function");
            await annotate("Category: Error handling", "category");

            // Arrange
            const dbError = new Error("Cannot delete from history table");
            mockDb.run = vi.fn().mockImplementation(() => {
                throw dbError;
            });

            // Act & Assert
            expect(() => deleteAllHistory(mockDb)).toThrow(
                "Cannot delete from history table"
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[HistoryManipulation] Failed to clear all history",
                dbError
            );
        });
    });

    describe(deleteHistoryByMonitorId, () => {
        it("should delete history for specific monitor successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: deleteHistoryByMonitorId", "function");
            await annotate("Priority: High", "priority");

            // Arrange
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(false);

            // Act
            deleteHistoryByMonitorId(mockDb, monitorId);

            // Assert
            expect(mockDb.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE monitor_id = ?",
                [monitorId]
            );
        });

        it("should log debug message in development environment", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Environment: Development", "environment");
            await annotate("Feature: Debug logging", "feature");

            // Arrange
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(true);

            // Act
            deleteHistoryByMonitorId(mockDb, monitorId);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[HistoryManipulation] Deleted history for monitor: test-monitor-123"
            );
        });

        it("should handle database errors properly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: deleteHistoryByMonitorId", "function");
            await annotate("Category: Error handling", "category");

            // Arrange
            const dbError = new Error("Monitor not found");
            mockDb.run = vi.fn().mockImplementation(() => {
                throw dbError;
            });

            // Act & Assert
            expect(() => deleteHistoryByMonitorId(mockDb, monitorId)).toThrow(
                "Monitor not found"
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                'HISTORY_PRUNE_FAILED {"monitorId":"test-monitor-123"}',
                dbError
            );
        });

        describe("Property-Based deleteHistoryByMonitorId Tests", () => {
            test.prop([fc.string({ minLength: 1, maxLength: 100 })])(
                "should delete history for various monitor IDs",
                (testMonitorId) => {
                    // Arrange
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Act
                    deleteHistoryByMonitorId(mockDb, testMonitorId);

                    // Assert
                    expect(mockDb.run).toHaveBeenCalledWith(
                        "DELETE FROM history WHERE monitor_id = ?",
                        [testMonitorId]
                    );
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.boolean()
            ])(
                "should handle debug logging based on environment",
                (testMonitorId, isDevEnvironment) => {
                    // Arrange
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(isDevEnvironment);
                    mockLogger.debug = vi.fn();

                    // Act
                    deleteHistoryByMonitorId(mockDb, testMonitorId);

                    // Assert
                    if (isDevEnvironment) {
                        expect(mockLogger.debug).toHaveBeenCalledWith(
                            `[HistoryManipulation] Deleted history for monitor: ${testMonitorId}`
                        );
                    } else {
                        expect(mockLogger.debug).not.toHaveBeenCalled();
                    }
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.oneof(
                    fc.constant("Database connection error"),
                    fc.constant("Monitor not found"),
                    fc.constant("Constraint violation"),
                    fc.string({ minLength: 5, maxLength: 100 })
                )
            ])(
                "should handle various database errors",
                (testMonitorId, errorMessage) => {
                    // Arrange
                    const dbError = new Error(errorMessage);
                    mockDb.run = vi.fn().mockImplementation(() => {
                        throw dbError;
                    });
                    mockLogger.error = vi.fn();

                    // Act & Assert
                    expect(() => deleteHistoryByMonitorId(mockDb, testMonitorId)).toThrow(errorMessage);

                    expect(mockLogger.error).toHaveBeenCalledWith(
                        `HISTORY_PRUNE_FAILED {"monitorId":"${testMonitorId}"}`,
                        dbError
                    );
                }
            );

            test.prop([
                fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 10 })
            ])(
                "should handle sequential deletions for multiple monitors",
                (monitorIds) => {
                    // Arrange
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Act
                    for (const id of monitorIds) {
                        deleteHistoryByMonitorId(mockDb, id);
                    }

                    // Assert
                    expect(mockDb.run).toHaveBeenCalledTimes(monitorIds.length);

                    for (const [index, id] of monitorIds.entries()) {
                        expect(mockDb.run).toHaveBeenNthCalledWith(
                            index + 1,
                            "DELETE FROM history WHERE monitor_id = ?",
                            [id]
                        );
                    }
                }
            );
        });
    });

    describe(pruneHistoryForMonitor, () => {
        it("should return early when limit is zero or negative", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Edge case: Invalid limit", "edge-case");

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 0);
            pruneHistoryForMonitor(mockDb, monitorId, -5);

            // Assert - should not make any database calls
            expect(mockDb.all).not.toHaveBeenCalled();
            expect(mockDb.run).not.toHaveBeenCalled();
        });

        it("should prune excess history entries successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Priority: High", "priority");

            // Arrange
            const excessEntries = [
                { id: 10 },
                { id: 11 },
                { id: 12 },
            ];
            mockDb.all = vi.fn().mockReturnValue(excessEntries);
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(false);

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 5);

            // Assert
            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                [monitorId, 5]
            );

            expect(mockDb.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE id IN (?,?,?)",
                [
                    10,
                    11,
                    12,
                ]
            );
        });

        it("should handle no excess entries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Edge case: No excess entries", "edge-case");

            // Arrange
            mockDb.all = vi.fn().mockReturnValue([]);

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 10);

            // Assert
            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                [monitorId, 10]
            );
            expect(mockDb.run).not.toHaveBeenCalled();
        });

        it("should filter out invalid IDs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Edge case: Invalid IDs", "edge-case");

            // Arrange
            const entriesWithInvalidIds = [
                { id: 1 },
                { id: null },
                { id: undefined },
                { id: 0 },
                { id: -1 },
                { id: 5.5 },
                { id: Infinity },
                { id: Number.NaN },
                { id: 3 },
            ];
            mockDb.all = vi.fn().mockReturnValue(entriesWithInvalidIds);
            mockDb.run = vi.fn();

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 5);

            // Assert - should only include valid positive finite integers
            expect(mockDb.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE id IN (?,?,?)",
                [
                    1,
                    5.5,
                    3,
                ] // 5.5 would be included as it's finite, but 0, negative, null, undefined, Infinity, NaN are filtered out
            );
        });

        it("should handle all invalid IDs gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Edge case: All invalid IDs", "edge-case");

            // Arrange
            const entriesWithAllInvalidIds = [
                { id: null },
                { id: undefined },
                { id: 0 },
                { id: -1 },
                { id: Infinity },
                { id: Number.NaN },
            ];
            mockDb.all = vi.fn().mockReturnValue(entriesWithAllInvalidIds);

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 5);

            // Assert - should not make delete call when no valid IDs
            expect(mockDb.all).toHaveBeenCalled();
            expect(mockDb.run).not.toHaveBeenCalled();
        });

        it("should log debug message in development environment", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Environment: Development", "environment");
            await annotate("Feature: Debug logging", "feature");

            // Arrange
            const excessEntries = [{ id: 1 }, { id: 2 }];
            mockDb.all = vi.fn().mockReturnValue(excessEntries);
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(true);

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 5);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[HistoryManipulation] Pruned 2 old history entries for monitor: test-monitor-123"
            );
        });

        it("should handle database select errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Category: Error handling", "category");
            await annotate("Feature: Select query failure", "feature");

            // Arrange
            const selectError = new Error("Cannot select from history table");
            mockDb.all = vi.fn().mockImplementation(() => {
                throw selectError;
            });

            // Act & Assert
            expect(() => pruneHistoryForMonitor(mockDb, monitorId, 5)).toThrow(
                "Cannot select from history table"
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                'HISTORY_PRUNE_FAILED {"monitorId":"test-monitor-123"}',
                selectError
            );
        });

        it("should handle database delete errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Category: Error handling", "category");
            await annotate("Feature: Delete query failure", "feature");

            // Arrange
            const excessEntries = [{ id: 1 }, { id: 2 }];
            const deleteError = new Error("Cannot delete from history table");
            mockDb.all = vi.fn().mockReturnValue(excessEntries);
            mockDb.run = vi.fn().mockImplementation(() => {
                throw deleteError;
            });

            // Act & Assert
            expect(() => pruneHistoryForMonitor(mockDb, monitorId, 5)).toThrow(
                "Cannot delete from history table"
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                'HISTORY_PRUNE_FAILED {"monitorId":"test-monitor-123"}',
                deleteError
            );
        });

        describe("Property-Based pruneHistoryForMonitor Tests", () => {
            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 0, max: 5 })
            ])(
                "should handle zero and small positive limits correctly",
                (testMonitorId, limit) => {
                    fc.pre(limit >= 0 && limit <= 5);

                    // Arrange
                    mockDb.all = vi.fn();
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Act
                    pruneHistoryForMonitor(mockDb, testMonitorId, limit);

                    // Assert
                    if (limit <= 0) {
                        // Should return early without database calls
                        expect(mockDb.all).not.toHaveBeenCalled();
                        expect(mockDb.run).not.toHaveBeenCalled();
                    } else {
                        expect(mockDb.all).toHaveBeenCalledWith(
                            "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                            [testMonitorId, limit]
                        );
                    }
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 1, max: 100 }),
                fc.array(fc.record({
                    id: fc.oneof(
                        fc.integer({ min: 1, max: 1000 }),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.constant(0),
                        fc.integer({ min: -1000, max: -1 }),
                        fc.constant(Number.POSITIVE_INFINITY),
                        fc.constant(Number.NEGATIVE_INFINITY),
                        fc.constant(Number.NaN)
                    )
                }), { minLength: 1, maxLength: 20 })
            ])(
                "should filter out invalid IDs and only delete valid ones",
                (testMonitorId, limit, historyEntries) => {
                    // Arrange
                    mockDb.all = vi.fn().mockReturnValue(historyEntries);
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Calculate expected valid IDs
                    const validIds = historyEntries
                        .map(entry => entry.id)
                        .filter(id => typeof id === 'number' && Number.isFinite(id) && id > 0);

                    // Act
                    pruneHistoryForMonitor(mockDb, testMonitorId, limit);

                    // Assert
                    if (validIds.length > 0) {
                        const placeholders = validIds.map(() => '?').join(',');
                        expect(mockDb.run).toHaveBeenCalledWith(
                            `DELETE FROM history WHERE id IN (${placeholders})`,
                            validIds
                        );
                    } else {
                        // No valid IDs should mean no delete call
                        expect(mockDb.run).not.toHaveBeenCalled();
                    }
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 1, max: 50 }),
                fc.boolean()
            ])(
                "should handle debug logging based on environment",
                (testMonitorId, limit, isDevEnvironment) => {
                    // Arrange
                    const validEntries = [{ id: 1 }, { id: 2 }, { id: 3 }];
                    mockDb.all = vi.fn().mockReturnValue(validEntries);
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(isDevEnvironment);
                    mockLogger.debug = vi.fn();

                    // Act
                    pruneHistoryForMonitor(mockDb, testMonitorId, limit);

                    // Assert
                    if (isDevEnvironment) {
                        expect(mockLogger.debug).toHaveBeenCalledWith(
                            `[HistoryManipulation] Pruned ${validEntries.length} old history entries for monitor: ${testMonitorId}`
                        );
                    } else {
                        expect(mockLogger.debug).not.toHaveBeenCalled();
                    }
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 1, max: 20 }),
                fc.oneof(
                    fc.constant("Database connection error"),
                    fc.constant("Table not found"),
                    fc.constant("Permission denied"),
                    fc.string({ minLength: 5, maxLength: 100 })
                )
            ])(
                "should handle various database errors during selection",
                (testMonitorId, limit, errorMessage) => {
                    // Arrange
                    const selectError = new Error(errorMessage);
                    mockDb.all = vi.fn().mockImplementation(() => {
                        throw selectError;
                    });
                    mockLogger.error = vi.fn();

                    // Act & Assert
                    expect(() => pruneHistoryForMonitor(mockDb, testMonitorId, limit)).toThrow(errorMessage);

                    expect(mockLogger.error).toHaveBeenCalledWith(
                        `HISTORY_PRUNE_FAILED {"monitorId":"${testMonitorId}"}`,
                        selectError
                    );
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 1, max: 20 }),
                fc.array(fc.record({ id: fc.integer({ min: 1, max: 1000 }) }), { minLength: 1, maxLength: 10 }),
                fc.oneof(
                    fc.constant("Cannot delete from history table"),
                    fc.constant("Foreign key constraint"),
                    fc.constant("Database locked"),
                    fc.string({ minLength: 5, maxLength: 100 })
                )
            ])(
                "should handle various database errors during deletion",
                (testMonitorId, limit, validEntries, errorMessage) => {
                    // Arrange
                    const deleteError = new Error(errorMessage);
                    mockDb.all = vi.fn().mockReturnValue(validEntries);
                    mockDb.run = vi.fn().mockImplementation(() => {
                        throw deleteError;
                    });
                    mockLogger.error = vi.fn();

                    // Act & Assert
                    expect(() => pruneHistoryForMonitor(mockDb, testMonitorId, limit)).toThrow(errorMessage);

                    expect(mockLogger.error).toHaveBeenCalledWith(
                        `HISTORY_PRUNE_FAILED {"monitorId":"${testMonitorId}"}`,
                        deleteError
                    );
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 10, max: 1000 })
            ])(
                "should handle large limit values efficiently",
                (testMonitorId, largeLimit) => {
                    // Arrange
                    mockDb.all = vi.fn().mockReturnValue([]);
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Act
                    const startTime = performance.now();
                    pruneHistoryForMonitor(mockDb, testMonitorId, largeLimit);
                    const endTime = performance.now();

                    // Assert
                    expect(mockDb.all).toHaveBeenCalledWith(
                        "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?",
                        [testMonitorId, largeLimit]
                    );

                    // Performance assertion
                    expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
                }
            );
        });
    });

    describe("Edge Cases and Integration", () => {
        it("should handle extremely large datasets", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Category: Performance testing", "category");
            await annotate("Edge case: Large datasets", "edge-case");

            // Arrange
            const largeHistoryArray = Array.from({ length: 1000 }, (_, i) => ({
                ...sampleStatusHistory,
                timestamp: Date.now() + i * 1000,
                responseTime: i,
            }));

            const mockStmt = {
                run: vi.fn(),
                finalize: vi.fn(),
            };
            mockDb.prepare = vi.fn().mockReturnValue(mockStmt);

            // Act
            bulkInsertHistory(mockDb, monitorId, largeHistoryArray);

            // Assert
            expect(mockStmt.run).toHaveBeenCalledTimes(1000);
            expect(mockStmt.finalize).toHaveBeenCalledTimes(1);
        });

        it("should handle special characters in monitor ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Edge case: Special characters", "edge-case");
            await annotate("Category: Input validation", "category");

            // Arrange
            const specialMonitorId = "monitor-with-special-chars!@#$%^&*()_+-=";
            mockDb.run = vi.fn();

            // Act
            addHistoryEntry(mockDb, specialMonitorId, sampleStatusHistory);

            // Assert - should pass the ID as-is to parameterized query
            expect(mockDb.run).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                expect.arrayContaining([specialMonitorId])
            );
        });

        it("should handle unicode monitor ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Edge case: Unicode characters", "edge-case");
            await annotate("Category: Internationalization", "category");

            // Arrange
            const unicodeMonitorId = "モニター-测试-🚀-monitor";
            mockDb.run = vi.fn();

            // Act
            deleteHistoryByMonitorId(mockDb, unicodeMonitorId);

            // Assert
            expect(mockDb.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE monitor_id = ?",
                [unicodeMonitorId]
            );
        });

        it("should handle boundary values for prune limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Edge case: Boundary values", "edge-case");

            // Arrange
            mockDb.all = vi.fn().mockReturnValue([]);

            // Act & Assert - Test boundary values
            pruneHistoryForMonitor(mockDb, monitorId, 1); // Minimum valid value
            expect(mockDb.all).toHaveBeenCalledWith(expect.any(String), [
                monitorId,
                1,
            ]);

            pruneHistoryForMonitor(mockDb, monitorId, Number.MAX_SAFE_INTEGER); // Maximum safe integer
            expect(mockDb.all).toHaveBeenCalledWith(expect.any(String), [
                monitorId,
                Number.MAX_SAFE_INTEGER,
            ]);
        });
    });
});
