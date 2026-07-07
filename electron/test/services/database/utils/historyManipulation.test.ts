/**
 * @file Comprehensive tests for historyManipulation utility functions Testing
 *   all database manipulation functions with proper mocking Enhanced with
 *   property-based testing for robust data validation coverage
 */

import type { StatusHistory } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import { STATUS_HISTORY_VALUES } from "@shared/types";
import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";
import { fc, test } from "@fast-check/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import functions to test
import {
    addHistoryEntry,
    deleteAllHistory,
    deleteHistoryByMonitorId,
    pruneHistoryForMonitor,
} from "../../../../services/database/utils/maintenance/historyManipulation";

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
    interpolateLogTemplate: vi.fn((template, data) =>
        template.replaceAll(/\{(?<key>\w+)\}/gv, (match: string, key: string) =>
            String(data[key] ?? match)
        )
    ),
    LOG_TEMPLATES: {
        debug: {
            HISTORY_ENTRY_ADDED:
                "[HistoryManipulation] Added history entry for monitor: {monitorId} - Status: {status}",
        },
        errors: {
            HISTORY_ADD_FAILED:
                "[HistoryManipulation] Failed to add history entry for monitor: {monitorId}",
            HISTORY_PRUNE_FAILED:
                "[HistoryManipulation] Failed to prune history for monitor: {monitorId}",
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

    const statusHistoryStatusArbitrary = fc.constantFrom<
        StatusHistory["status"]
    >(...STATUS_HISTORY_VALUES);

    const monitorId = "test-monitor-123";
    const rawMonitorId =
        "https://monitor.example/check?token=monitor-token#private-monitor";

    const getSafeMonitorId = (identifier: string): string =>
        getSafeIdentifierForLogging(identifier) ?? identifier;

    beforeEach(async () => {
        // Reset all mocks
        vi.clearAllMocks();

        // Get mocked dependencies
        const loggerModule = await import("../../../../utils/logger");
        mockLogger = vi.mocked(loggerModule.logger);

        const electronUtilsModule = await import("../../../../electronUtils");
        mockIsDev = vi.mocked(electronUtilsModule.isDev);

        const logTemplatesModule =
            await import("../../../../../shared/utils/logTemplates");
        vi.mocked(logTemplatesModule.interpolateLogTemplate);

        // Create mock database
        mockDb = {
            run: vi.fn(),
            prepare: vi.fn(),
            all: vi.fn(),
        } as unknown as Database;
    });

    const expectLogPayloadToRedactRawMonitorId = (): void => {
        const logPayload = JSON.stringify([
            ...mockLogger.debug.mock.calls,
            ...mockLogger.error.mock.calls,
            ...mockLogger.info.mock.calls,
        ]);

        expect(logPayload).toContain("https://monitor.example/check");
        expect(logPayload).not.toContain("monitor-token");
        expect(logPayload).not.toContain("private-monitor");
    };

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
                "[HistoryManipulation] Added history entry for monitor: test-monitor-123 - Status: up"
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
            expect(() => {
                addHistoryEntry(mockDb, monitorId, sampleStatusHistory);
            }).toThrow("Database connection failed");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[HistoryManipulation] Failed to add history entry for monitor: test-monitor-123",
                dbError
            );
        });

        it("redacts URL-shaped monitor identifiers in diagnostics while preserving insert parameters", () => {
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(true);

            addHistoryEntry(mockDb, rawMonitorId, sampleStatusHistory);

            expect(mockDb.run).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)",
                [
                    rawMonitorId,
                    sampleStatusHistory.timestamp,
                    sampleStatusHistory.status,
                    sampleStatusHistory.responseTime,
                    null,
                ]
            );
            expectLogPayloadToRedactRawMonitorId();
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

            test.prop([
                fc.record({
                    timestamp: fc.integer({
                        min: 0,
                        max: Date.now() + 1_000_000,
                    }),
                    status: statusHistoryStatusArbitrary,
                    responseTime: fc.integer({ min: -1, max: 30_000 }),
                }),
            ])("should handle various history entries", (historyEntry) => {
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
            });

            test.prop([
                fc.oneof(
                    fc.string(),
                    fc.constant(null),
                    fc.constant(undefined)
                ),
            ])("should handle various details values", (details) => {
                // Arrange
                mockDb.run = vi.fn();
                mockIsDev.mockReturnValue(false);
                const expectedDetails = details === undefined ? null : details;

                // Act
                addHistoryEntry(
                    mockDb,
                    monitorId,
                    sampleStatusHistory,
                    details!
                );

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
            });

            test.prop([
                fc.array(
                    fc.record({
                        monitorId: fc.string({ minLength: 1, maxLength: 30 }),
                        timestamp: fc.integer({ min: 0, max: Date.now() }),
                        status: statusHistoryStatusArbitrary,
                        responseTime: fc.integer({ min: -1, max: 30_000 }),
                        details: fc.oneof(
                            fc.string({ maxLength: 100 }),
                            fc.constant(null)
                        ),
                    }),
                    { minLength: 1, maxLength: 10 }
                ),
            ])(
                "should handle multiple sequential history additions",
                (historyBatch) => {
                    // Arrange
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    // Act
                    for (const entry of historyBatch) {
                        addHistoryEntry(
                            mockDb,
                            entry.monitorId,
                            {
                                timestamp: entry.timestamp,
                                status: entry.status,
                                responseTime: entry.responseTime,
                            },
                            entry.details ?? undefined
                        );
                    }

                    // Assert
                    expect(mockDb.run).toHaveBeenCalledTimes(
                        historyBatch.length
                    );

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
            expect(() => {
                deleteAllHistory(mockDb);
            }).toThrow("Cannot delete from history table");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[HistoryManipulation] Failed to clear all history",
                dbError
            );
        });

        it("redacts URL-shaped monitor identifiers in delete diagnostics while preserving delete parameters", () => {
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(true);

            deleteHistoryByMonitorId(mockDb, rawMonitorId);

            expect(mockDb.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE monitor_id = ?",
                [rawMonitorId]
            );
            expectLogPayloadToRedactRawMonitorId();
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
            expect(() => {
                deleteHistoryByMonitorId(mockDb, monitorId);
            }).toThrow("Monitor not found");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[HistoryManipulation] Failed to prune history for monitor: test-monitor-123",
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
                fc.boolean(),
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
                            `[HistoryManipulation] Deleted history for monitor: ${getSafeMonitorId(testMonitorId)}`
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
                ),
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
                    expect(() => {
                        deleteHistoryByMonitorId(mockDb, testMonitorId);
                    }).toThrow(errorMessage);

                    expect(mockLogger.error).toHaveBeenCalledWith(
                        `[HistoryManipulation] Failed to prune history for monitor: ${getSafeMonitorId(testMonitorId)}`,
                        dbError
                    );
                }
            );

            test.prop([
                fc.array(fc.string({ minLength: 1, maxLength: 30 }), {
                    minLength: 1,
                    maxLength: 10,
                }),
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
            const excessEntries = [{ id: 10 }];
            mockDb.all = vi.fn().mockReturnValue(excessEntries);
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(false);

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 5);

            // Assert
            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1 OFFSET ?",
                [monitorId, 5]
            );

            expect(mockDb.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE id IN (SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?)",
                [monitorId, 5]
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
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1 OFFSET ?",
                [monitorId, 10]
            );
            expect(mockDb.run).not.toHaveBeenCalled();
        });

        it("should handle malformed probe rows by skipping delete", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyManipulation", "component");
            await annotate("Function: pruneHistoryForMonitor", "function");
            await annotate("Edge case: Malformed probe row", "edge-case");

            // Arrange
            mockDb.all = vi.fn().mockReturnValue([{ notId: 123 }]);
            mockDb.run = vi.fn();

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 5);

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
            const excessEntries = [{ id: 1 }];
            mockDb.all = vi.fn().mockReturnValue(excessEntries);
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(true);

            // Act
            pruneHistoryForMonitor(mockDb, monitorId, 5);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[HistoryManipulation] Pruned history entries for monitor: ${monitorId} (limit: 5)`
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
            expect(() => {
                pruneHistoryForMonitor(mockDb, monitorId, 5);
            }).toThrow("Cannot select from history table");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[HistoryManipulation] Failed to prune history for monitor: test-monitor-123",
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
            expect(() => {
                pruneHistoryForMonitor(mockDb, monitorId, 5);
            }).toThrow("Cannot delete from history table");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[HistoryManipulation] Failed to prune history for monitor: test-monitor-123",
                deleteError
            );
        });

        it("redacts URL-shaped monitor identifiers in prune diagnostics while preserving query parameters", () => {
            const excessEntries = [{ id: 1 }];
            mockDb.all = vi.fn().mockReturnValue(excessEntries);
            mockDb.run = vi.fn();
            mockIsDev.mockReturnValue(true);

            pruneHistoryForMonitor(mockDb, rawMonitorId, 5);

            expect(mockDb.all).toHaveBeenCalledWith(
                "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1 OFFSET ?",
                [rawMonitorId, 5]
            );
            expect(mockDb.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE id IN (SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?)",
                [rawMonitorId, 5]
            );
            expectLogPayloadToRedactRawMonitorId();
        });

        describe("Property-Based pruneHistoryForMonitor Tests", () => {
            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 0, max: 5 }),
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
                            "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1 OFFSET ?",
                            [testMonitorId, limit]
                        );
                    }
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 1, max: 100 }),
                fc.array(
                    fc.record({
                        id: fc.oneof(
                            fc.integer({ min: 1, max: 1000 }),
                            fc.constant(null),
                            fc.constant(undefined),
                            fc.constant(0),
                            fc.integer({ min: -1000, max: -1 }),
                            fc.constant(Infinity),
                            fc.constant(Number.NEGATIVE_INFINITY),
                            fc.constant(NaN)
                        ),
                    }),
                    { minLength: 1, maxLength: 20 }
                ),
            ])(
                "should filter out invalid IDs and only delete valid ones",
                (testMonitorId, limit, historyEntries) => {
                    // Arrange
                    mockDb.all = vi.fn().mockReturnValue(historyEntries);
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(false);

                    const hasAnyValidId = historyEntries.some((entry) => {
                        const id = (entry as { id?: unknown }).id;
                        return (
                            (typeof id === "number" && Number.isFinite(id)) ||
                            (typeof id === "string" && id.length > 0)
                        );
                    });

                    // Act
                    pruneHistoryForMonitor(mockDb, testMonitorId, limit);

                    // Assert
                    expect(mockDb.all).toHaveBeenCalledWith(
                        "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1 OFFSET ?",
                        [testMonitorId, limit]
                    );

                    if (hasAnyValidId) {
                        expect(mockDb.run).toHaveBeenCalledWith(
                            "DELETE FROM history WHERE id IN (SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?)",
                            [testMonitorId, limit]
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
                fc.boolean(),
            ])(
                "should handle debug logging based on environment",
                (testMonitorId, limit, isDevEnvironment) => {
                    // Arrange
                    const validEntries = [
                        { id: 1 },
                        { id: 2 },
                        { id: 3 },
                    ];
                    mockDb.all = vi.fn().mockReturnValue(validEntries);
                    mockDb.run = vi.fn();
                    mockIsDev.mockReturnValue(isDevEnvironment);
                    mockLogger.debug = vi.fn();

                    // Act
                    pruneHistoryForMonitor(mockDb, testMonitorId, limit);

                    // Assert
                    if (isDevEnvironment) {
                        expect(mockLogger.debug).toHaveBeenCalledWith(
                            `[HistoryManipulation] Pruned history entries for monitor: ${getSafeMonitorId(testMonitorId)} (limit: ${limit})`
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
                ),
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
                    expect(() => {
                        pruneHistoryForMonitor(mockDb, testMonitorId, limit);
                    }).toThrow(errorMessage);

                    expect(mockLogger.error).toHaveBeenCalledWith(
                        `[HistoryManipulation] Failed to prune history for monitor: ${getSafeMonitorId(testMonitorId)}`,
                        selectError
                    );
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 1, max: 20 }),
                fc.array(fc.record({ id: fc.integer({ min: 1, max: 1000 }) }), {
                    minLength: 1,
                    maxLength: 10,
                }),
                fc.oneof(
                    fc.constant("Cannot delete from history table"),
                    fc.constant("Foreign key constraint"),
                    fc.constant("Database locked"),
                    fc.string({ minLength: 5, maxLength: 100 })
                ),
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
                    expect(() => {
                        pruneHistoryForMonitor(mockDb, testMonitorId, limit);
                    }).toThrow(errorMessage);

                    expect(mockLogger.error).toHaveBeenCalledWith(
                        `[HistoryManipulation] Failed to prune history for monitor: ${getSafeMonitorId(testMonitorId)}`,
                        deleteError
                    );
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 }),
                fc.integer({ min: 10, max: 1000 }),
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
                        "SELECT id FROM history WHERE monitor_id = ? ORDER BY timestamp DESC LIMIT 1 OFFSET ?",
                        [testMonitorId, largeLimit]
                    );

                    // Performance assertion
                    expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
                }
            );
        });
    });

    describe("Edge Cases and Integration", () => {
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
