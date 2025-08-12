/**
 * @fileoverview Comprehensive tests for typedQueries database utilities
 * Tests type-safe database query helpers with 100% coverage including error paths
 */

import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
    type MockedFunction,
} from "vitest";

import type { Database } from "node-sqlite3-wasm";

import {
    insertWithReturning,
    queryForCount,
    queryForIds,
    queryForRecords,
    queryForSingleRecord,
    type CountResult,
    type IdOnlyResult,
} from "../../../../services/database/utils/typedQueries";

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

describe("typedQueries - Comprehensive Database Query Helpers", () => {
    let mockDb: Database;
    let mockGet: MockedFunction<any>;
    let mockAll: MockedFunction<any>;

    beforeEach(() => {
        mockDb = createMockDatabase();
        mockGet = mockDb.get as MockedFunction<any>;
        mockAll = mockDb.all as MockedFunction<any>;
    });
    describe("insertWithReturning", () => {
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
                ["https://example.com", "active", 60_000]
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockGet).toHaveBeenCalledWith(
                "INSERT INTO monitors (url, status, checkInterval) VALUES (?, ?, ?) RETURNING *",
                ["https://example.com", "active", 60_000]
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
    });
    describe("queryForCount", () => {
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
    });
    describe("queryForIds", () => {
        it("should return array of ID objects", async ({ task, annotate }) => {
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
                [
                    "deleted",
                ]
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
                [1_640_995_200_000, 1_641_081_600_000, "online"]
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
    });
    describe("queryForRecords", () => {
        it("should return array of typed records", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            interface SiteRecord extends Record<string, unknown> {
                id: number;
                name: string;
                url: string;
            }
            const mockResults: SiteRecord[] = [
                { id: 1, name: "Site 1", url: "https://site1.com" },
                { id: 2, name: "Site 2", url: "https://site2.com" },
            ];
            mockAll.mockReturnValue(mockResults);

            // Act
            const result = queryForRecords<SiteRecord>(
                mockDb,
                "SELECT * FROM sites"
            );

            // Assert
            expect(result).toEqual(mockResults);
            expect(mockAll).toHaveBeenCalledWith(
                "SELECT * FROM sites",
                undefined
            );
        });
        it("should return empty array for no records", async ({
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
            const result = queryForRecords(mockDb, "SELECT * FROM empty_table");

            // Assert
            expect(result).toEqual([]);
        });
        it("should handle records with parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            interface MonitorRecord extends Record<string, unknown> {
                id: number;
                url: string;
                status: string;
                checkInterval: number;
            }
            const mockResults: MonitorRecord[] = [
                {
                    id: 1,
                    url: "https://api.example.com",
                    status: "active",
                    checkInterval: 60_000,
                },
            ];
            mockAll.mockReturnValue(mockResults);

            // Act
            const result = queryForRecords<MonitorRecord>(
                mockDb,
                "SELECT * FROM monitors WHERE status = ?",
                ["active"]
            );

            // Assert
            expect(result).toEqual(mockResults);
        });
        it("should handle generic Record type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            const mockResults = [
                { field1: "value1", field2: 123 },
                { field1: "value2", field2: 456 },
            ];
            mockAll.mockReturnValue(mockResults);

            // Act
            const result = queryForRecords(
                mockDb,
                "SELECT field1, field2 FROM generic_table"
            );

            // Assert
            expect(result).toEqual(mockResults);
        });
        it("should handle complex queries with JOINs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            interface JoinedRecord extends Record<string, unknown> {
                site_id: number;
                site_name: string;
                monitor_id: number;
                monitor_url: string;
            }
            const mockResults: JoinedRecord[] = [
                {
                    site_id: 1,
                    site_name: "Example Site",
                    monitor_id: 1,
                    monitor_url: "https://example.com",
                },
            ];
            mockAll.mockReturnValue(mockResults);

            // Act
            const result = queryForRecords<JoinedRecord>(
                mockDb,
                "SELECT s.id as site_id, s.name as site_name, m.id as monitor_id, m.url as monitor_url FROM sites s JOIN monitors m ON s.id = m.site_id WHERE s.active = ?",
                [1] // Changed from [true] to [1] to match DbValue constraint
            );

            // Assert
            expect(result).toEqual(mockResults);
        });
        it("should handle records with null/undefined values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            const mockResults = [
                { id: 1, name: "Test", optional_field: null },
                { id: 2, name: "Test2", optional_field: undefined },
            ];
            mockAll.mockReturnValue(mockResults);

            // Act
            const result = queryForRecords(
                mockDb,
                "SELECT id, name, optional_field FROM test_table"
            );

            // Assert
            expect(result).toEqual(mockResults);
        });
    });
    describe("queryForSingleRecord", () => {
        it("should return single record when found", async ({
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
                name: "Test Site",
                url: "https://test.com",
            };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = queryForSingleRecord(
                mockDb,
                "SELECT * FROM sites WHERE id = ?",
                [1]
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockGet).toHaveBeenCalledWith(
                "SELECT * FROM sites WHERE id = ?",
                [1]
            );
        });
        it("should return undefined when no record found", async ({
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
            const result = queryForSingleRecord(
                mockDb,
                "SELECT * FROM sites WHERE id = ?",
                [999]
            );

            // Assert
            expect(result).toBeUndefined();
        });
        it("should handle query without parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: typedQueries - Comprehensive Database Query Helpers",
                "component"
            );

            // Arrange
            const mockResult = { setting: "value", timestamp: Date.now() };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = queryForSingleRecord(
                mockDb,
                "SELECT * FROM settings LIMIT 1"
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockGet).toHaveBeenCalledWith(
                "SELECT * FROM settings LIMIT 1",
                undefined
            );
        });
        it("should handle complex single record queries", async ({
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
                id: 5,
                url: "https://api.service.com",
                last_check: 1_640_995_200_000,
                response_time: 250,
                status: "online",
            };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = queryForSingleRecord(
                mockDb,
                "SELECT * FROM monitors WHERE url = ? ORDER BY last_check DESC LIMIT 1",
                ["https://api.service.com"]
            );

            // Assert
            expect(result).toEqual(mockResult);
        });
        it("should handle queries with multiple parameters", async ({
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
                id: 10,
                monitor_id: 3,
                timestamp: 1_640_995_200_000,
                status: "offline",
                response_time: null,
            };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = queryForSingleRecord(
                mockDb,
                "SELECT * FROM history WHERE monitor_id = ? AND timestamp > ? ORDER BY timestamp DESC LIMIT 1",
                [3, 1_640_995_000_000]
            );

            // Assert
            expect(result).toEqual(mockResult);
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
            const mockResult = { count_total: 42 };
            mockGet.mockReturnValue(mockResult);

            // Act
            const result = queryForSingleRecord(
                mockDb,
                "SELECT COUNT(*) as count_total FROM all_records",
                []
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockGet).toHaveBeenCalledWith(
                "SELECT COUNT(*) as count_total FROM all_records",
                []
            );
        });
        it("should handle null return from database", async ({
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

            // Act
            const result = queryForSingleRecord(
                mockDb,
                "SELECT * FROM sites WHERE deleted = ?",
                [1] // Changed from [true] to [1] for DbValue compatibility
            );

            // Assert
            // Note: The implementation casts result but doesn't convert null to undefined
            expect(result).toBeNull();
        });
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
        it("should handle database exceptions in queryForRecords", async ({
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
                queryForRecords(mockDb, "SELECT * FROM protected_table");
            }).toThrow("Permission denied");
        });
        it("should handle database exceptions in queryForSingleRecord", async ({
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
                queryForSingleRecord(
                    mockDb,
                    "SELECT * FROM slow_table WHERE id = ?",
                    [1]
                );
            }).toThrow("Connection timeout");
        });
    });
});
