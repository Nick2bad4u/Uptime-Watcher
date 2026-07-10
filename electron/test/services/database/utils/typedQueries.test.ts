/**
 * @file Comprehensive tests for typedQueries database utilities Tests type-safe
 *   database query helpers with 100% coverage including error paths
 */

import type { HistoryRow, MonitorRow } from "@shared/types/database";
import type { Database } from "node-sqlite3-wasm";
import type { UnknownRecord } from "type-fest";

import { fc, test } from "@fast-check/vitest";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import {
    beforeEach,
    describe,
    expect,
    it,
    type MockedFunction,
    vi,
} from "vitest";

import {
    type CountResult,
    type IdOnlyResult,
    insertWithReturning,
    queryForCount,
    queryForIds,
    queryHistoryRow,
    queryMonitorRows,
} from "../../../../services/database/utils/queries/typedQueries";

/**
 * Mock database implementation for testing
 */
function createMockDatabase(): Database {
    return {
        get: vi.fn(),
        all: vi.fn(),
        run: vi.fn(),
        prepare: vi.fn(),
        exec: vi.fn(),
        close: vi.fn(),
        backup: vi.fn(),
        function: vi.fn(),
        loadExtension: vi.fn(),
        serialize: vi.fn(),
        checkpoint: vi.fn(),
    } as unknown as Database;
}

type MockAll = (...args: Parameters<Database["all"]>) => unknown[];
type MockGet = (...args: Parameters<Database["get"]>) => unknown;

describe("typedQueries - Comprehensive Database Query Helpers", () => {
    let mockDb: Database;
    let mockGet: MockedFunction<MockGet>;
    let mockAll: MockedFunction<MockAll>;

    beforeEach(() => {
        mockDb = createMockDatabase();
        mockGet = mockDb.get as unknown as MockedFunction<MockGet>;
        mockAll = mockDb.all as unknown as MockedFunction<MockAll>;
    });
    describe(insertWithReturning, () => {
        it("should return inserted record with generated fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            const mockResult = {
                id: 1,
                name: "test",
                created_at: "2023-01-01",
            };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = insertWithReturning(
                mockDb,
                "INSERT INTO sites (name) VALUES (?) RETURNING *",
                ["test"]
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockGet).toHaveBeenCalledWith(
                "INSERT INTO sites (name) VALUES (?) RETURNING *",
                ["test"]
            );
        });
        it("should handle INSERT without parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            const mockResult = { id: 2, timestamp: Date.now() };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = insertWithReturning(
                mockDb,
                "INSERT INTO logs DEFAULT VALUES RETURNING *"
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockGet).toHaveBeenCalledWith(
                "INSERT INTO logs DEFAULT VALUES RETURNING *",
                undefined
            );
        });
        it("should handle complex INSERT with multiple values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            const mockResult = {
                id: 3,
                url: "https://example.com",
                status: "active",
                checkInterval: 60_000,
            };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = insertWithReturning(
                mockDb,
                "INSERT INTO monitors (url, status, checkInterval) VALUES (?, ?, ?) RETURNING *",
                [
                    "https://example.com",
                    "active",
                    60_000,
                ]
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockGet).toHaveBeenCalledWith(
                "INSERT INTO monitors (url, status, checkInterval) VALUES (?, ?, ?) RETURNING *",
                [
                    "https://example.com",
                    "active",
                    60_000,
                ]
            );
        });
        it("should throw error when INSERT returns no result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            mockGet.mockReturnValue(undefined);

            // Act & Assert
            expect(() => {
                insertWithReturning(
                    mockDb,
                    "INSERT INTO sites (name) VALUES (?) RETURNING *",
                    ["test"]
                );
            }).toThrow("INSERT with RETURNING failed: no result returned");
        });
        it("should throw error when INSERT returns null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            mockGet.mockReturnValue(null);

            // Act & Assert
            expect(() => {
                insertWithReturning(
                    mockDb,
                    "INSERT INTO sites (name) VALUES (?) RETURNING *",
                    ["test"]
                );
            }).toThrow("INSERT with RETURNING failed: no result returned");
        });
        it("should enforce validation when provided", () => {
            mockGet.mockReturnValue({ id: "invalid" });

            expect(() =>
                insertWithReturning(
                    mockDb,
                    "INSERT INTO monitors (id) VALUES (?) RETURNING id",
                    [1],
                    {
                        label: "ValidatedRow",
                        validate: (
                            _row: UnknownRecord
                        ): _row is UnknownRecord => false,
                    }
                )
            ).toThrow(/ValidatedRow/v);
        });
        it("should handle empty array parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            const mockResult = { id: 4, default_field: "value" };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = insertWithReturning(
                mockDb,
                "INSERT INTO settings DEFAULT VALUES RETURNING *",
                []
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockGet).toHaveBeenCalledWith(
                "INSERT INTO settings DEFAULT VALUES RETURNING *",
                []
            );
        });

        describe("Property-Based insertWithReturning Tests", () => {
            test.prop([
                fc.string({ minLength: 10, maxLength: 200 }),
                fc.array(
                    fc.oneof(
                        fc.string({ maxLength: 100 }),
                        fc.integer({ min: -1000, max: 1000 }),
                        fc.constant(null)
                    ),
                    { minLength: 0, maxLength: 10 }
                ),
                fc.record({
                    id: fc.integer({ min: 1, max: 10_000 }),
                    name: fc.string({ maxLength: 50 }),
                    timestamp: fc.integer({ min: 0, max: Date.now() }),
                }),
            ])(
                "should handle various SQL queries and parameters",
                (query, params, mockResult) => {
                    // Arrange
                    mockGet.mockReturnValue(mockResult);

                    // Act
                    const result = insertWithReturning(mockDb, query, params);

                    // Assert
                    expect(result).toEqual(mockResult);
                    expect(mockGet).toHaveBeenCalledWith(query, params);
                }
            );

            test.prop([
                fc.constantFrom(
                    "INSERT INTO users (name, email) VALUES (?, ?) RETURNING *",
                    "INSERT INTO sites (url, status) VALUES (?, ?) RETURNING id, url",
                    "INSERT INTO monitors DEFAULT VALUES RETURNING *",
                    "INSERT INTO history (monitor_id, timestamp) VALUES (?, ?) RETURNING id"
                ),
                fc.array(
                    fc.oneof(
                        fc.string({ minLength: 1, maxLength: 100 }),
                        fc.integer({ min: 0, max: 100_000 }),
                        fc.float({ min: 0, max: 1000 })
                    ),
                    { minLength: 0, maxLength: 5 }
                ),
            ])(
                "should handle realistic database INSERT queries",
                (insertQuery, params) => {
                    // Arrange
                    const expectedResult = {
                        id: 101,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };
                    mockGet.mockReturnValue(expectedResult);

                    // Act
                    const result = insertWithReturning(
                        mockDb,
                        insertQuery,
                        params
                    );

                    // Assert
                    expect(result).toEqual(expectedResult);
                    expect(mockGet).toHaveBeenCalledWith(insertQuery, params);
                }
            );

            test.prop([
                fc.string({ minLength: 20, maxLength: 150 }),
                fc.record({
                    id: fc.integer({ min: 1, max: 1000 }),
                    name: fc.string({ minLength: 1, maxLength: 100 }),
                    value: fc.oneof(
                        fc.string({ maxLength: 200 }),
                        fc.integer({ min: -1000, max: 1000 }),
                        fc.float({ min: -100, max: 100 }),
                        fc.boolean(),
                        fc.constant(null)
                    ),
                    created_at: fc.integer({ min: 0, max: Date.now() }),
                }),
            ])(
                "should return various result structures correctly",
                (query, mockResult) => {
                    // Arrange
                    mockGet.mockReturnValue(mockResult);

                    // Act
                    const result = insertWithReturning(mockDb, query, []);

                    // Assert
                    expect(result).toEqual(mockResult);
                    expect(typeof result).toBe("object");
                    expect(result).not.toBeNull();

                    // Verify all properties are preserved
                    for (const [key, value] of Object.entries(mockResult)) {
                        expect(result[key]).toEqual(value);
                    }
                }
            );

            test.prop([
                fc.array(
                    fc.record({
                        query: fc.string({ minLength: 30, maxLength: 100 }),
                        params: fc.array(
                            fc.oneof(
                                fc.string({ maxLength: 50 }),
                                fc.integer({ min: 0, max: 1000 })
                            ),
                            { maxLength: 5 }
                        ),
                        result: fc.record({
                            id: fc.integer({ min: 1, max: 1000 }),
                            status: fc.constantFrom(
                                "success",
                                "pending",
                                "failed"
                            ),
                        }),
                    }),
                    { minLength: 1, maxLength: 5 }
                ),
            ])(
                "should handle multiple sequential inserts",
                (insertOperations) => {
                    // Reset mock for this property-based test iteration
                    mockGet.mockClear();

                    // Act & Assert
                    let callCount = 0;
                    for (const operation of insertOperations) {
                        mockGet.mockReturnValue(operation.result);

                        const result = insertWithReturning(
                            mockDb,
                            operation.query,
                            operation.params
                        );

                        expect(result).toEqual(operation.result);
                        callCount++;
                        expect(mockGet).toHaveBeenCalledTimes(callCount);
                        expect(mockGet).toHaveBeenNthCalledWith(
                            callCount,
                            operation.query,
                            operation.params
                        );
                    }
                }
            );
        });
        describe(queryForCount, () => {
            it("should return count result from COUNT query", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                const mockResult: CountResult = { count: 5 };
                mockGet.mockReturnValue(mockResult);

                // Act
                const result = queryForCount(
                    mockDb,
                    "SELECT COUNT(*) as count FROM sites"
                );

                // Assert
                expect(result).toEqual(mockResult);
                expect(mockGet).toHaveBeenCalledWith(
                    "SELECT COUNT(*) as count FROM sites",
                    undefined
                );
            });
            it("should return count result with parameters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                const mockResult: CountResult = { count: 3 };
                mockGet.mockReturnValue(mockResult);

                // Act
                const result = queryForCount(
                    mockDb,
                    "SELECT COUNT(*) as count FROM monitors WHERE status = ?",
                    ["active"]
                );

                // Assert
                expect(result).toEqual(mockResult);
                expect(mockGet).toHaveBeenCalledWith(
                    "SELECT COUNT(*) as count FROM monitors WHERE status = ?",
                    ["active"]
                );
            });
            it("should return undefined when no result found", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                mockGet.mockReturnValue(undefined);

                // Act
                const result = queryForCount(
                    mockDb,
                    "SELECT COUNT(*) as count FROM empty_table"
                );

                // Assert
                expect(result).toBeUndefined();
            });
            it("should handle COUNT with complex WHERE conditions", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                const mockResult: CountResult = { count: 12 };
                mockGet.mockReturnValue(mockResult);

                // Act
                const result = queryForCount(
                    mockDb,
                    "SELECT COUNT(*) as count FROM history WHERE timestamp > ? AND status = ?",
                    [1_640_995_200_000, "online"]
                );

                // Assert
                expect(result).toEqual(mockResult);
                expect(mockGet).toHaveBeenCalledWith(
                    "SELECT COUNT(*) as count FROM history WHERE timestamp > ? AND status = ?",
                    [1_640_995_200_000, "online"]
                );
            });
            it("should handle COUNT with zero results", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                const mockResult: CountResult = { count: 0 };
                mockGet.mockReturnValue(mockResult);

                // Act
                const result = queryForCount(
                    mockDb,
                    "SELECT COUNT(*) as count FROM nonexistent WHERE id = ?",
                    [999]
                );

                // Assert
                expect(result).toEqual(mockResult);
            });

            describe("Property-Based queryForCount Tests", () => {
                test.prop([
                    fc.constantFrom(
                        "SELECT COUNT(*) as count FROM users",
                        "SELECT COUNT(*) as count FROM sites WHERE active = 1",
                        "SELECT COUNT(DISTINCT monitor_id) as count FROM history",
                        "SELECT COUNT(*) as count FROM monitors WHERE status = 'running'"
                    ),
                    fc.integer({ min: 0, max: 10_000 }),
                ])(
                    "should return count results for various COUNT queries",
                    (query, expectedCount) => {
                        // Arrange
                        const mockResult: CountResult = {
                            count: expectedCount,
                        };
                        mockGet.mockReturnValue(mockResult);

                        // Act
                        const result = queryForCount(mockDb, query);

                        // Assert
                        expect(result).toEqual(mockResult);
                        expect(result).toBeDefined();
                        expect(result!.count).toBe(expectedCount);
                        expect(typeof result!.count).toBe("number");
                        expect(mockGet).toHaveBeenCalledWith(query, undefined);
                    }
                );

                test.prop([
                    fc.string({ minLength: 20, maxLength: 150 }),
                    fc.array(
                        fc.oneof(
                            fc.string({ maxLength: 50 }),
                            fc.integer({ min: 0, max: 1000 }),
                            fc.constant(null)
                        ),
                        { minLength: 0, maxLength: 5 }
                    ),
                    fc.integer({ min: 0, max: 100_000 }),
                ])(
                    "should handle COUNT queries with parameters",
                    (query, params, expectedCount) => {
                        // Arrange
                        const mockResult: CountResult = {
                            count: expectedCount,
                        };
                        mockGet.mockReturnValue(mockResult);

                        // Act
                        const result = queryForCount(mockDb, query, params);

                        // Assert
                        expect(result).toEqual(mockResult);
                        expect(result).toBeDefined();
                        expect(result!.count).toBe(expectedCount);
                        expect(mockGet).toHaveBeenCalledWith(query, params);
                    }
                );

                test.prop([
                    fc.array(fc.integer({ min: 0, max: 1000 }), {
                        minLength: 1,
                        maxLength: 10,
                    }),
                ])(
                    "should handle various count values including edge cases",
                    (countValues) => {
                        // Act & Assert
                        for (const count of countValues) {
                            const mockResult: CountResult = { count };
                            mockGet.mockReturnValue(mockResult);

                            const result = queryForCount(
                                mockDb,
                                "SELECT COUNT(*) as count FROM test_table"
                            );

                            expect(result).toBeDefined();
                            expect(result!.count).toBe(count);
                            expect(typeof result!.count).toBe("number");
                            expect(
                                Number.isInteger(result!.count)
                            ).toBeTruthy();
                            expect(result!.count).toBeGreaterThanOrEqual(0);
                        }
                    }
                );

                test.prop([
                    fc.constantFrom(0, 1, 100, 1000, 9999),
                    fc.constantFrom(
                        "SELECT COUNT(*) as count FROM table1",
                        "SELECT COUNT(id) as count FROM table2",
                        "SELECT COUNT(DISTINCT column) as count FROM table3"
                    ),
                ])(
                    "should handle specific edge case count values",
                    (count, query) => {
                        // Arrange
                        const mockResult: CountResult = { count };
                        mockGet.mockReturnValue(mockResult);

                        // Act
                        const result = queryForCount(mockDb, query);

                        // Assert
                        expect(result).toBeDefined();
                        expect(result!.count).toBe(count);
                        expect(mockGet).toHaveBeenCalledWith(query, undefined);

                        // Verify structure
                        expect(Object.keys(result!)).toEqual(["count"]);
                        expect(Object.hasOwn(result!, "count")).toBeTruthy();
                    }
                );
            });
        });
        describe(queryForIds, () => {
            it("should return array of ID objects", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                const mockResults: IdOnlyResult[] = [
                    { id: 1 },
                    { id: 2 },
                    { id: 3 },
                ];
                mockAll.mockReturnValue(mockResults);

                // Act
                const result = queryForIds(mockDb, "SELECT id FROM sites");

                // Assert
                expect(result).toEqual(mockResults);
                expect(mockAll).toHaveBeenCalledWith(
                    "SELECT id FROM sites",
                    undefined
                );
            });
            it("should return empty array when no IDs found", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                mockAll.mockReturnValue([]);

                // Act
                const result = queryForIds(
                    mockDb,
                    "SELECT id FROM sites WHERE status = ?",
                    ["deleted"]
                );

                // Assert
                expect(result).toEqual([]);
                expect(mockAll).toHaveBeenCalledWith(
                    "SELECT id FROM sites WHERE status = ?",
                    ["deleted"]
                );
            });
            it("should handle IDs with WHERE conditions", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                const mockResults: IdOnlyResult[] = [{ id: 5 }, { id: 8 }];
                mockAll.mockReturnValue(mockResults);

                // Act
                const result = queryForIds(
                    mockDb,
                    "SELECT id FROM monitors WHERE checkInterval > ?",
                    [30_000]
                );

                // Assert
                expect(result).toEqual(mockResults);
                expect(mockAll).toHaveBeenCalledWith(
                    "SELECT id FROM monitors WHERE checkInterval > ?",
                    [30_000]
                );
            });
            it("should handle complex ID queries with multiple conditions", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                const mockResults: IdOnlyResult[] = [
                    { id: 10 },
                    { id: 15 },
                    { id: 20 },
                ];
                mockAll.mockReturnValue(mockResults);

                // Act
                const result = queryForIds(
                    mockDb,
                    "SELECT id FROM history WHERE timestamp BETWEEN ? AND ? AND status = ?",
                    [
                        1_640_995_200_000,
                        1_641_081_600_000,
                        "online",
                    ]
                );

                // Assert
                expect(result).toEqual(mockResults);
            });
            it("should handle single ID result", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                const mockResults: IdOnlyResult[] = [{ id: 42 }];
                mockAll.mockReturnValue(mockResults);

                // Act
                const result = queryForIds(
                    mockDb,
                    "SELECT id FROM sites WHERE name = ?",
                    ["unique-site"]
                );

                // Assert
                expect(result).toEqual(mockResults);
            });

            describe("Property-Based queryForIds Tests", () => {
                test.prop([
                    fc.constantFrom(
                        "SELECT id FROM users",
                        "SELECT id FROM sites WHERE active = 1",
                        "SELECT id FROM monitors WHERE status = 'running'",
                        "SELECT DISTINCT monitor_id as id FROM history"
                    ),
                    fc.array(
                        fc.record({ id: fc.integer({ min: 1, max: 1000 }) }),
                        {
                            minLength: 0,
                            maxLength: 20,
                        }
                    ),
                ])(
                    "should return arrays of ID objects for various queries",
                    (query, expectedIds) => {
                        // Arrange
                        mockAll.mockReturnValue(expectedIds);

                        // Act
                        const result = queryForIds(mockDb, query);

                        // Assert
                        expect(result).toEqual(expectedIds);
                        expect(Array.isArray(result)).toBeTruthy();
                        expect(result).toHaveLength(expectedIds.length);

                        for (const item of result) {
                            expect(item).toHaveProperty("id");
                            expect(typeof item.id).toBe("number");
                        }

                        expect(mockAll).toHaveBeenCalledWith(query, undefined);
                    }
                );

                test.prop([
                    fc.string({ minLength: 20, maxLength: 100 }),
                    fc.array(
                        fc.oneof(
                            fc.string({ maxLength: 50 }),
                            fc.integer({ min: 0, max: 10_000 }),
                            fc.constant(null)
                        ),
                        { minLength: 0, maxLength: 5 }
                    ),
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 10_000 }),
                        }),
                        { minLength: 0, maxLength: 15 }
                    ),
                ])(
                    "should handle ID queries with parameters",
                    (query, params, expectedIds) => {
                        // Arrange
                        mockAll.mockReturnValue(expectedIds);

                        // Act
                        const result = queryForIds(mockDb, query, params);

                        // Assert
                        expect(result).toEqual(expectedIds);
                        expect(mockAll).toHaveBeenCalledWith(query, params);

                        if (result) {
                            for (const item of result) {
                                expect(typeof item.id).toBe("number");
                                expect(item.id).toBeGreaterThan(0);
                            }
                        }
                    }
                );

                test.prop([fc.integer({ min: 0, max: 3 })])(
                    "should handle empty result arrays",
                    (emptyArrayLength) => {
                        fc.pre(emptyArrayLength === 0);

                        // Arrange
                        mockAll.mockReturnValue([]);

                        // Act
                        const result = queryForIds(
                            mockDb,
                            "SELECT id FROM empty_table"
                        );

                        // Assert
                        expect(result).toEqual([]);
                        expect(Array.isArray(result)).toBeTruthy();
                        expect(result).toHaveLength(0);
                    }
                );
            });
        });
        describe("typed row helper wrappers", () => {
            it("should validate monitor rows", () => {
                const monitorRow: MonitorRow = {
                    id: 1,
                    site_identifier: "site-123",
                    type: "http",
                };
                mockAll.mockReturnValue([monitorRow]);

                const rows = queryMonitorRows(mockDb, "SELECT * FROM monitors");

                expect(rows).toEqual([monitorRow]);
            });

            it("should throw for invalid monitor rows", () => {
                mockAll.mockReturnValue([
                    {
                        site_identifier: "site-123",
                    },
                ]);

                expect(() =>
                    queryMonitorRows(mockDb, "SELECT * FROM monitors")
                ).toThrow(/MonitorRow/v);
            });

            it("should validate single history rows", () => {
                const historyRow: HistoryRow = {
                    monitorId: "monitor-1",
                    status: "up",
                    timestamp: Date.now(),
                };
                mockGet.mockReturnValue(historyRow);

                const row = queryHistoryRow(
                    mockDb,
                    "SELECT * FROM history WHERE monitor_id = ?",
                    ["monitor-1"]
                );

                expect(row).toEqual(historyRow);
            });

            it("should validate degraded history rows", () => {
                const historyRow: HistoryRow = {
                    monitorId: "monitor-1",
                    status: "degraded",
                    timestamp: Date.now(),
                };
                mockGet.mockReturnValue(historyRow);

                const row = queryHistoryRow(
                    mockDb,
                    "SELECT * FROM history WHERE monitor_id = ?",
                    ["monitor-1"]
                );

                expect(row).toEqual(historyRow);
            });

            it("should validate finite decimal string history response times", () => {
                const historyRow: UnknownRecord = {
                    monitorId: "monitor-1",
                    responseTime: "123.45",
                    status: "up",
                    timestamp: Date.now(),
                };
                mockGet.mockReturnValue(historyRow);

                const row = queryHistoryRow(
                    mockDb,
                    "SELECT * FROM history WHERE monitor_id = ?",
                    ["monitor-1"]
                );

                expect(row).toEqual(historyRow);
            });

            it("should reject infinite string history timestamps", () => {
                mockGet.mockReturnValue({
                    monitorId: "monitor-1",
                    status: "up",
                    timestamp: "Infinity",
                });

                expect(() =>
                    queryHistoryRow(
                        mockDb,
                        "SELECT * FROM history WHERE monitor_id = ?",
                        ["monitor-1"]
                    )
                ).toThrow(/HistoryRow/v);
            });

            it("should reject blank string history timestamps", () => {
                mockGet.mockReturnValue({
                    monitorId: "monitor-1",
                    status: "up",
                    timestamp: " ",
                });

                expect(() =>
                    queryHistoryRow(
                        mockDb,
                        "SELECT * FROM history WHERE monitor_id = ?",
                        ["monitor-1"]
                    )
                ).toThrow(/HistoryRow/v);
            });

            it.each([
                -1,
                "-1",
                1.5,
                "1.5",
                MAX_VALID_DATE_EPOCH_MS + 1,
                String(MAX_VALID_DATE_EPOCH_MS + 1),
            ])(
                "should reject history timestamps outside the epoch millisecond contract: %s",
                (timestamp) => {
                    mockGet.mockReturnValue({
                        monitorId: "monitor-1",
                        status: "up",
                        timestamp,
                    });

                    expect(() =>
                        queryHistoryRow(
                            mockDb,
                            "SELECT * FROM history WHERE monitor_id = ?",
                            ["monitor-1"]
                        )
                    ).toThrow(/HistoryRow/v);
                }
            );

            it.each([
                Number.NaN,
                Infinity,
                -Infinity,
            ])(
                "should reject non-finite numeric history response times: %s",
                (responseTime) => {
                    mockGet.mockReturnValue({
                        monitorId: "monitor-1",
                        responseTime,
                        status: "up",
                        timestamp: Date.now(),
                    });

                    expect(() =>
                        queryHistoryRow(
                            mockDb,
                            "SELECT * FROM history WHERE monitor_id = ?",
                            ["monitor-1"]
                        )
                    ).toThrow(/HistoryRow/v);
                }
            );

            it.each([
                "Infinity",
                "+Infinity",
                "-Infinity",
                "1e3",
                "0x10",
                "0b10",
            ])(
                "should reject non-decimal string history response times: %s",
                (responseTime) => {
                    mockGet.mockReturnValue({
                        monitorId: "monitor-1",
                        responseTime,
                        status: "up",
                        timestamp: Date.now(),
                    });

                    expect(() =>
                        queryHistoryRow(
                            mockDb,
                            "SELECT * FROM history WHERE monitor_id = ?",
                            ["monitor-1"]
                        )
                    ).toThrow(/HistoryRow/v);
                }
            );
        });
        describe("Type Interfaces", () => {
            it("should export CountResult interface", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Test that CountResult interface is properly typed
                const countResult: CountResult = { count: 10 };
                expect(countResult.count).toBe(10);
            });
            it("should export IdOnlyResult interface", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Test that IdOnlyResult interface is properly typed
                const idResult: IdOnlyResult = { id: 5 };
                expect(idResult.id).toBe(5);
            });
        });
        describe("Error Handling Edge Cases", () => {
            it("should handle database exceptions in insertWithReturning", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                mockGet.mockImplementation(() => {
                    throw new Error("Database connection lost");
                });
                // Act & Assert
                expect(() => {
                    insertWithReturning(
                        mockDb,
                        "INSERT INTO sites (name) VALUES (?) RETURNING *",
                        ["test"]
                    );
                }).toThrow("Database connection lost");
            });
            it("should handle database exceptions in queryForCount", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                mockGet.mockImplementation(() => {
                    throw new Error("Table does not exist");
                });
                // Act & Assert
                expect(() => {
                    queryForCount(
                        mockDb,
                        "SELECT COUNT(*) as count FROM nonexistent"
                    );
                }).toThrow("Table does not exist");
            });
            it("should handle database exceptions in queryForIds", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                mockAll.mockImplementation(() => {
                    throw new Error("SQL syntax error");
                });
                // Act & Assert
                expect(() => {
                    queryForIds(mockDb, "SELECT id FROM invalid_table");
                }).toThrow("SQL syntax error");
            });
            it("should handle database exceptions in queryMonitorRows", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                mockAll.mockImplementation(() => {
                    throw new Error("Permission denied");
                });
                // Act & Assert
                expect(() => {
                    queryMonitorRows(mockDb, "SELECT * FROM protected_table");
                }).toThrow("Permission denied");
            });
            it("should handle database exceptions in queryHistoryRow", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: typedQueries - Comprehensive Database Query Helpers",
                    "component"
                );

                // Arrange
                mockGet.mockImplementation(() => {
                    throw new Error("Connection timeout");
                });
                // Act & Assert
                expect(() => {
                    queryHistoryRow(
                        mockDb,
                        "SELECT * FROM slow_table WHERE id = ?",
                        [1]
                    );
                }).toThrow("Connection timeout");
            });
        });
    });
});
