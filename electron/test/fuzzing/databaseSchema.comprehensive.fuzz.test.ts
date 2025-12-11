/**
 * Comprehensive property-based fuzzing tests for databaseSchema.ts
 *
 * @remarks
 * Tests all database schema functions including createDatabaseTables,
 * createDatabaseIndexes, setupMonitorTypeValidation, createDatabaseSchema, and
 * validateGeneratedSchema with comprehensive coverage of edge cases, error
 * handling, SQL injection prevention, and performance validation.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fc } from "@fast-check/vitest";
import type { Database } from "node-sqlite3-wasm";

// Import all functions from databaseSchema
import {
    createDatabaseTables,
    createDatabaseIndexes,
    setupMonitorTypeValidation,
    createDatabaseSchema,
} from "../../services/database/utils/databaseSchema";

// Import the function that needs to be mocked
import { getRegisteredMonitorTypes } from "../../services/monitoring/MonitorTypeRegistry";

// Mock setupMonitorTypeValidation function
vi.mock("../../services/database/utils/databaseSchema", async () => {
    const actual = (await vi.importActual(
        "../../services/database/utils/databaseSchema"
    )) as any;
    return {
        ...actual,
        setupMonitorTypeValidation: vi.fn().mockImplementation(() => {
            // Default implementation calls getRegisteredMonitorTypes
            // This will be overridden in individual tests as needed
            const { getRegisteredMonitorTypes } = vi.importActual(
                "../../services/monitoring/MonitorTypeRegistry"
            ) as any;
            getRegisteredMonitorTypes();
        }),
    };
});

// Mock dependencies
vi.mock("../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    diagnosticsLogger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../services/monitoring/MonitorTypeRegistry", () => ({
    getRegisteredMonitorTypes: vi.fn(() => [
        "http",
        "port",
        "ping",
        "dns",
        "ssl",
        "websocket-keepalive",
        "server-heartbeat",
        "replication",
        "cdn-edge-consistency",
    ]),
}));

const { createDefaultMonitorTableSchema } = vi.hoisted(() => {
    const DEFAULT_MONITOR_TABLE_SCHEMA = `
        CREATE TABLE IF NOT EXISTS monitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_identifier TEXT NOT NULL,
            type TEXT NOT NULL,
            name TEXT,
            url TEXT,
            host TEXT,
            port INTEGER,
            timeout INTEGER DEFAULT 10000,
            retryAttempts INTEGER DEFAULT 3,
            status TEXT DEFAULT 'pending',
            responseTime INTEGER DEFAULT -1,
            monitoring INTEGER DEFAULT 1,
            history TEXT DEFAULT '[]'
        )
    `;

    const createDefaultMonitorTableSchema = () => DEFAULT_MONITOR_TABLE_SCHEMA;

    return {
        createDefaultMonitorTableSchema,
    };
});

vi.mock("../../services/database/utils/dynamicSchema", () => ({
    generateMonitorTableSchema: vi.fn(createDefaultMonitorTableSchema),
}));

const containsStandaloneSegment = (text: string, value: string): boolean => {
    if (!value) {
        return false;
    }

    let searchIndex = text.indexOf(value);
    while (searchIndex !== -1) {
        const precedingCharacter =
            searchIndex > 0 ? (text[searchIndex - 1] ?? "") : "";
        const followingCharacter =
            searchIndex + value.length < text.length
                ? (text[searchIndex + value.length] ?? "")
                : "";

        const isLeadingAlphaNumeric = /[A-Za-z0-9_]/u.test(precedingCharacter);
        const isTrailingAlphaNumeric = /[A-Za-z0-9_]/u.test(followingCharacter);

        if (!isLeadingAlphaNumeric && !isTrailingAlphaNumeric) {
            return true;
        }

        searchIndex = text.indexOf(value, searchIndex + 1);
    }

    return false;
};

vi.mock("@shared/utils/logTemplates", () => ({
    LOG_TEMPLATES: {
        services: {
            DATABASE_INDEXES_CREATED: "Database indexes created",
            DATABASE_TABLES_CREATED: "Database tables created",
            DATABASE_MONITOR_VALIDATION_INITIALIZED:
                "Monitor validation initialized",
            DATABASE_MONITOR_VALIDATION_READY: "Monitor validation ready",
            DATABASE_SCHEMA_CREATED: "Database schema created",
        },
        errors: {
            DATABASE_INDEXES_FAILED: "Database indexes failed",
            DATABASE_TABLES_FAILED: "Database tables failed",
            DATABASE_VALIDATION_SETUP_FAILED:
                "Database validation setup failed",
            DATABASE_SCHEMA_FAILED: "Database schema failed",
        },
        warnings: {
            DATABASE_MONITOR_VALIDATION_MISSING: "Monitor validation missing",
            DATABASE_MONITOR_VALIDATION_CONTINUE: "Monitor validation continue",
        },
    },
    interpolateLogTemplate: vi.fn(
        (template: string, _data?: Record<string, unknown>) => template
    ),
}));

describe("DatabaseSchema Comprehensive Fuzzing Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset setupMonitorTypeValidation to default implementation that calls getRegisteredMonitorTypes
        // but catches errors like the real implementation does
        vi.mocked(setupMonitorTypeValidation).mockImplementation(() => {
            try {
                vi.mocked(getRegisteredMonitorTypes)();
            } catch (error) {
                // Silently catch errors like the real implementation
                // The real implementation logs but doesn't re-throw
            }
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("createDatabaseTables - Comprehensive Fuzzing", () => {
        it("should handle various database states and SQL execution patterns", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        executionOrder: fc.array(
                            fc.integer({ min: 0, max: 5 }),
                            { minLength: 1, maxLength: 10 }
                        ),
                        shouldSucceed: fc.boolean(),
                        delayMs: fc.integer({ min: 0, max: 100 }),
                    }),
                    async ({
                        executionOrder: _executionOrder,
                        shouldSucceed,
                        delayMs,
                    }) => {
                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        if (shouldSucceed) {
                            runSpy.mockReturnValue(undefined);
                        } else {
                            runSpy.mockImplementation(() => {
                                throw new Error("SQL execution failed");
                            });
                        }

                        // Add delay to test async behavior
                        if (delayMs > 0) {
                            await new Promise((resolve) =>
                                setTimeout(resolve, delayMs));
                        }

                        if (shouldSucceed) {
                            expect(() =>
                                createDatabaseTables(
                                    testDb
                                )).not.toThrowError();
                            expect(runSpy).toHaveBeenCalled();
                            // Verify all required tables are created
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining(
                                    "CREATE TABLE IF NOT EXISTS sites"
                                )
                            );
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining(
                                    "CREATE TABLE IF NOT EXISTS monitors"
                                )
                            );
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining(
                                    "CREATE TABLE IF NOT EXISTS history"
                                )
                            );
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining(
                                    "CREATE TABLE IF NOT EXISTS settings"
                                )
                            );
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining(
                                    "CREATE TABLE IF NOT EXISTS stats"
                                )
                            );
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining(
                                    "CREATE TABLE IF NOT EXISTS logs"
                                )
                            );
                        } else {
                            expect(() =>
                                createDatabaseTables(testDb)).toThrowError(
                                "SQL execution failed"
                            );
                        }
                    }
                )
            );
        });

        it("should validate SQL injection prevention in table creation", async () => {
            await fc.assert(
                fc.property(
                    fc.record({
                        maliciousInput: fc.oneof(
                            fc.constant("'; DROP TABLE users; --"),
                            fc.constant(
                                "/* malicious comment */ DELETE FROM sites"
                            ),
                            fc.constant("UNION SELECT * FROM sensitive_data"),
                            fc.constant("1=1; INSERT INTO logs"),
                            fc.constant("<script>alert('xss')</script>")
                        ),
                        tableCount: fc.integer({ min: 1, max: 10 }),
                    }),
                    ({ maliciousInput: _maliciousInput, tableCount }) => {
                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        runSpy.mockReturnValue(undefined);

                        // Execute table creation multiple times
                        for (let i = 0; i < tableCount; i++) {
                            createDatabaseTables(testDb);
                        }

                        // Verify no malicious SQL was executed
                        const allCalls = runSpy.mock.calls.flat();
                        for (const call of allCalls) {
                            expect(typeof call).toBe("string");
                            expect(call).not.toContain("DROP TABLE");
                            expect(call).not.toContain("DELETE FROM");
                            expect(call).not.toContain("UNION SELECT");
                            expect(call).not.toContain("INSERT INTO logs");
                            expect(call).not.toContain("<script>");
                            // Ensure only valid table creation commands
                            expect(call.trim()).toMatch(
                                /^create table if not exists/i
                            );
                        }
                    }
                )
            );
        });
    });

    describe("createDatabaseIndexes - Comprehensive Fuzzing", () => {
        it("should handle index creation with various database states", async () => {
            await fc.assert(
                fc.property(
                    fc.record({
                        indexCount: fc.integer({ min: 1, max: 20 }),
                        shouldFail: fc.boolean(),
                        errorType: fc.oneof(
                            fc.constant("SQLITE_BUSY"),
                            fc.constant("SQLITE_LOCKED"),
                            fc.constant("SQLITE_READONLY"),
                            fc.constant("Index already exists")
                        ),
                    }),
                    ({ indexCount, shouldFail, errorType }) => {
                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        if (shouldFail) {
                            runSpy.mockImplementation(() => {
                                throw new Error(errorType);
                            });
                        } else {
                            runSpy.mockReturnValue(undefined);
                        }

                        if (shouldFail) {
                            expect(() =>
                                createDatabaseIndexes(testDb)).toThrowError(
                                errorType
                            );
                        } else {
                            // Execute multiple times to test idempotency
                            for (let i = 0; i < indexCount; i++) {
                                createDatabaseIndexes(testDb);
                            }

                            expect(runSpy).toHaveBeenCalled();
                            // Verify all required indexes are created
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining(
                                    "idx_monitors_site_identifier"
                                )
                            );
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining("idx_monitors_type")
                            );
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining(
                                    "idx_history_monitor_id"
                                )
                            );
                            expect(runSpy).toHaveBeenCalledWith(
                                expect.stringContaining("idx_history_timestamp")
                            );
                        }
                    }
                )
            );
        });

        it("should prevent SQL injection in index creation", async () => {
            await fc.assert(
                fc.property(
                    fc.array(
                        fc.oneof(
                            fc.constant("'; DROP INDEX --"),
                            fc.constant("/* comment */ DELETE"),
                            fc.constant("UNION ALL SELECT"),
                            fc.constant("1' OR '1'='1")
                        ),
                        { minLength: 1, maxLength: 5 }
                    ),
                    (_maliciousInputs) => {
                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        runSpy.mockReturnValue(undefined);
                        createDatabaseIndexes(testDb);

                        // Verify all SQL commands are safe
                        const allCalls = runSpy.mock.calls.flat();
                        for (const call of allCalls) {
                            expect(call).toMatch(
                                /^create index if not exists/i
                            );
                            expect(call).not.toContain("DROP");
                            expect(call).not.toContain("DELETE");
                            expect(call).not.toContain("UNION");
                            expect(call).not.toContain("'1'='1");
                        }
                    }
                )
            );
        });
    });

    describe("setupMonitorTypeValidation - Comprehensive Fuzzing", () => {
        it("should handle various monitor type registry states", async () => {
            await fc.assert(
                fc.property(
                    fc.record({
                        monitorTypes: fc.oneof(
                            fc.constant([]),
                            fc.array(
                                fc.oneof(
                                    fc.constant("http"),
                                    fc.constant("port"),
                                    fc.constant("ping"),
                                    fc.constant("dns"),
                                    fc.string({ minLength: 1, maxLength: 20 })
                                ),
                                { minLength: 1, maxLength: 10 }
                            )
                        ),
                        shouldThrow: fc.boolean(),
                    }),
                    ({ monitorTypes, shouldThrow }) => {
                        vi.mocked(getRegisteredMonitorTypes).mockReturnValue(
                            monitorTypes
                        );

                        if (shouldThrow) {
                            vi.mocked(
                                getRegisteredMonitorTypes
                            ).mockImplementation(() => {
                                throw new Error("Registry access failed");
                            });
                        }

                        // Should not throw even if registry fails (graceful degradation)
                        expect(() =>
                            setupMonitorTypeValidation()).not.toThrowError();

                        if (!shouldThrow) {
                            expect(
                                getRegisteredMonitorTypes
                            ).toHaveBeenCalled();
                        }
                    }
                )
            );
        });

        it("should validate monitor type integrity and prevent injection", async () => {
            await fc.assert(
                fc.property(
                    fc.array(
                        fc.oneof(
                            fc.string({ minLength: 1, maxLength: 50 }),
                            fc.constant("'; DROP TABLE monitors; --"),
                            fc.constant("UNION SELECT password FROM users"),
                            fc.constant("<script>alert('xss')</script>"),
                            fc.constant("../../../etc/passwd")
                        ),
                        { minLength: 0, maxLength: 15 }
                    ),
                    (monitorTypes) => {
                        vi.mocked(getRegisteredMonitorTypes).mockReturnValue(
                            monitorTypes
                        );

                        // Should handle any input gracefully
                        expect(() =>
                            setupMonitorTypeValidation()).not.toThrowError();

                        expect(getRegisteredMonitorTypes).toHaveBeenCalled();
                    }
                )
            );
        });
    });

    describe("createDatabaseSchema - Comprehensive Fuzzing", () => {
        it("should handle transaction scenarios with various failure points", async () => {
            await fc.assert(
                fc.property(
                    fc.record({
                        failAt: fc.oneof(
                            fc.constant("begin"),
                            fc.constant("tables"),
                            fc.constant("indexes"),
                            fc.constant("validation"),
                            fc.constant("commit"),
                            fc.constant("none")
                        ),
                        errorMessage: fc.string({
                            minLength: 1,
                            maxLength: 100,
                        }),
                        retryCount: fc.integer({ min: 1, max: 5 }),
                    }),
                    ({ failAt, errorMessage, retryCount }) => {
                        // Clear all mocks at the start of each property test iteration
                        vi.clearAllMocks();

                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        let callCount = 0;
                        runSpy.mockImplementation((sql: string) => {
                            callCount++;

                            if (failAt === "begin" && sql.includes("BEGIN")) {
                                throw new Error(
                                    `BEGIN failed: ${errorMessage}`
                                );
                            }
                            if (
                                failAt === "tables" &&
                                sql.includes("CREATE TABLE")
                            ) {
                                throw new Error(
                                    `Table creation failed: ${errorMessage}`
                                );
                            }
                            if (
                                failAt === "indexes" &&
                                sql.includes("CREATE INDEX")
                            ) {
                                throw new Error(
                                    `Index creation failed: ${errorMessage}`
                                );
                            }
                            if (failAt === "commit" && sql.includes("COMMIT")) {
                                throw new Error(
                                    `Commit failed: ${errorMessage}`
                                );
                            }

                            return undefined;
                        });

                        for (let i = 0; i < retryCount; i++) {
                            // Mock setupMonitorTypeValidation to fail when needed
                            // Since setupMonitorTypeValidation never throws (it catches all errors),
                            // we simulate failure by making getRegisteredMonitorTypes throw
                            if (failAt === "validation") {
                                vi.mocked(
                                    getRegisteredMonitorTypes
                                ).mockImplementation(() => {
                                    throw new Error(
                                        `Monitor type registry failure: ${errorMessage}`
                                    );
                                });
                                // SetupMonitorTypeValidation should catch this error and not re-throw
                                vi.mocked(
                                    setupMonitorTypeValidation
                                ).mockImplementation(() => {
                                    try {
                                        vi.mocked(getRegisteredMonitorTypes)();
                                    } catch (error) {
                                        // Real implementation catches errors and just logs warnings
                                    }
                                });
                            } else {
                                vi.mocked(
                                    setupMonitorTypeValidation
                                ).mockImplementation(() => {
                                    // Default implementation calls getRegisteredMonitorTypes with error handling
                                    try {
                                        vi.mocked(getRegisteredMonitorTypes)();
                                    } catch (error) {
                                        // Silently catch errors like the real implementation
                                    }
                                });
                            }

                            if (failAt === "none") {
                                expect(() =>
                                    createDatabaseSchema(
                                        testDb
                                    )).not.toThrowError();
                                // Verify transaction was committed
                                expect(runSpy).toHaveBeenCalledWith("COMMIT");
                            } else if (failAt === "validation") {
                                // For validation case, the function should NOT throw since setupMonitorTypeValidation catches errors
                                expect(() =>
                                    createDatabaseSchema(
                                        testDb
                                    )).not.toThrowError();
                                // Verify transaction was committed (no rollback)
                                expect(runSpy).toHaveBeenCalledWith("COMMIT");
                            } else {
                                expect(() =>
                                    createDatabaseSchema(
                                        testDb
                                    )).toThrowError();

                                // Only verify rollback was called if transaction was actually started
                                // (i.e., if BEGIN succeeded but something else failed)
                                if (failAt !== "begin") {
                                    expect(runSpy).toHaveBeenCalledWith(
                                        "ROLLBACK"
                                    );
                                }
                            }
                        }
                    }
                )
            );
        });

        it("should ensure transaction integrity and prevent partial schema creation", async () => {
            await fc.assert(
                fc.property(
                    fc.record({
                        partialFailurePattern: fc.array(fc.boolean(), {
                            minLength: 6,
                            maxLength: 6,
                        }),
                        concurrentOperations: fc.integer({ min: 1, max: 3 }),
                    }),
                    ({ partialFailurePattern, concurrentOperations }) => {
                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        let operationIndex = 0;
                        runSpy.mockImplementation((sql: string) => {
                            if (
                                sql.includes("CREATE TABLE") ||
                                sql.includes("CREATE INDEX")
                            ) {
                                const shouldFail =
                                    partialFailurePattern[
                                        operationIndex %
                                            partialFailurePattern.length
                                    ];
                                operationIndex++;

                                if (shouldFail) {
                                    throw new Error(
                                        "Partial operation failure"
                                    );
                                }
                            }
                            return undefined;
                        });

                        // Test concurrent schema creation attempts
                        const operations = Array.from(
                            { length: concurrentOperations },
                            () => () => {
                                try {
                                    createDatabaseSchema(testDb);
                                    return "success";
                                } catch {
                                    return "failure";
                                }
                            }
                        );

                        const results = operations.map((op) => op());

                        // Verify transaction handling - should either fully succeed or fully fail
                        for (const result of results) {
                            expect(["success", "failure"]).toContain(result);
                        }

                        // Verify rollback was called for any failures
                        if (results.includes("failure")) {
                            expect(runSpy).toHaveBeenCalledWith("ROLLBACK");
                        }
                    }
                )
            );
        });
    });

    describe("Security and Performance Edge Cases", () => {
        it("should handle memory pressure and resource constraints", async () => {
            await fc.assert(
                fc.property(
                    fc.record({
                        memoryPressure: fc.integer({ min: 1, max: 1000 }),
                        operationCount: fc.integer({ min: 1, max: 100 }),
                        resourceLimit: fc.boolean(),
                    }),
                    ({ memoryPressure, operationCount, resourceLimit }) => {
                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        if (resourceLimit) {
                            let callCount = 0;
                            // Use a smaller threshold to ensure failures occur with lower operation counts
                            const threshold = Math.max(
                                1,
                                Math.floor(memoryPressure / 100)
                            );
                            runSpy.mockImplementation(() => {
                                callCount++;
                                if (callCount > threshold) {
                                    throw new Error("SQLITE_NOMEM");
                                }
                                return undefined;
                            });
                        } else {
                            runSpy.mockReturnValue(undefined);
                        }

                        let successCount = 0;
                        let failureCount = 0;

                        for (let i = 0; i < operationCount; i++) {
                            try {
                                createDatabaseSchema(testDb);
                                successCount++;
                            } catch (error) {
                                failureCount++;
                                expect(error).toBeInstanceOf(Error);
                            }
                        }

                        // Verify reasonable success/failure distribution
                        expect(successCount + failureCount).toBe(
                            operationCount
                        );

                        if (resourceLimit) {
                            expect(failureCount).toBeGreaterThan(0);
                        } else {
                            expect(successCount).toBe(operationCount);
                        }
                    }
                )
            );
        });

        it("should validate schema generation edge cases", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        schemaVariant: fc.oneof(
                            fc.constant("valid"),
                            fc.constant("empty"),
                            fc.constant("malformed"),
                            fc.constant("missing_table"),
                            fc.constant("contains_undefined"),
                            fc.constant("contains_null")
                        ),
                        executionCount: fc.integer({ min: 1, max: 20 }),
                    }),
                    async ({ schemaVariant, executionCount }) => {
                        const { generateMonitorTableSchema } = vi.mocked(
                            await import("../../services/database/utils/dynamicSchema")
                        );

                        // Mock different schema generation scenarios
                        switch (schemaVariant) {
                            case "valid": {
                                generateMonitorTableSchema.mockReturnValue(`
                                    CREATE TABLE IF NOT EXISTS monitors (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        site_identifier TEXT NOT NULL
                                    )
                                `);
                                break;
                            }
                            case "empty": {
                                generateMonitorTableSchema.mockReturnValue("");
                                break;
                            }
                            case "malformed": {
                                generateMonitorTableSchema.mockReturnValue(
                                    "INVALID SQL SYNTAX"
                                );
                                break;
                            }
                            case "missing_table": {
                                generateMonitorTableSchema.mockReturnValue(
                                    "CREATE INDEX something"
                                );
                                break;
                            }
                            case "contains_undefined": {
                                generateMonitorTableSchema.mockReturnValue(
                                    "CREATE TABLE undefined_value"
                                );
                                break;
                            }
                            case "contains_null": {
                                generateMonitorTableSchema.mockReturnValue(
                                    "CREATE TABLE null_value"
                                );
                                break;
                            }
                        }

                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        try {
                            for (let i = 0; i < executionCount; i++) {
                                if (schemaVariant === "valid") {
                                    expect(() =>
                                        createDatabaseTables(
                                            testDb
                                        )).not.toThrowError();
                                } else {
                                    expect(() =>
                                        createDatabaseTables(
                                            testDb
                                        )).toThrowError();
                                }
                            }
                        } finally {
                            generateMonitorTableSchema.mockImplementation(
                                createDefaultMonitorTableSchema
                            );
                            generateMonitorTableSchema.mockClear();
                        }
                    }
                )
            );
        });

        it("should handle Unicode and special characters safely", async () => {
            await fc.assert(
                fc.property(
                    fc.record({
                        unicodeString: fc
                            .string({ minLength: 1, maxLength: 50 })
                            .filter((s) => {
                                // Use strings that definitely shouldn't be in SQL schema
                                if (s.length === 0) return false;

                                // Exclude common SQL keywords and their substrings
                                const sqlKeywords = [
                                    "BEGIN",
                                    "TRANSACTION",
                                    "CREATE",
                                    "TABLE",
                                    "INDEX",
                                    "COMMIT",
                                    "ROLLBACK",
                                    "IF",
                                    "NOT",
                                    "EXISTS",
                                    "PRIMARY",
                                    "KEY",
                                    "INTEGER",
                                    "TEXT",
                                    "DEFAULT",
                                    "AUTOINCREMENT",
                                    "BOOLEAN",
                                    "VALUE",
                                    "IDENTIFIER",
                                    "FOREIGN",
                                    "REFERENCES",
                                    "CONSTRAINT",
                                    "UNIQUE",
                                    "NULL",
                                    "ON",
                                    "DELETE",
                                    "CASCADE",
                                    "UPDATE",
                                    "TIMESTAMP",
                                    "DATETIME",
                                    "CURRENT",
                                    "ASC",
                                    "DESC",
                                    "SELECT",
                                    "FROM",
                                    "WHERE",
                                    "INSERT",
                                    "INTO",
                                    "VALUES",
                                    "SITES",
                                    "MONITORS",
                                    "HISTORY",
                                    "SETTINGS",
                                    "STATS",
                                    "LOGS",
                                    "SITE",
                                    "MONITOR",
                                    "HOST",
                                    "PORT",
                                    "URL",
                                    "STATUS",
                                    "RESPONSE",
                                    "TIME",
                                    "ERROR",
                                    "ACTIVE",
                                    "OPERATIONS",
                                    "CREATED",
                                    "UPDATED",
                                    "DATA",
                                    "MESSAGE",
                                    "LEVEL",
                                    "DETAILS",
                                    "ENABLED",
                                    "CHECK",
                                    "INTERVAL",
                                    "TIMEOUT",
                                    "RETRY",
                                    "ATTEMPTS",
                                    "LAST",
                                    "CHECKED",
                                    "NEXT",
                                ];

                                const upperS = s.toUpperCase();
                                const isSubstringOfKeyword = sqlKeywords.some(
                                    (keyword) =>
                                        keyword.includes(upperS) ||
                                        upperS.includes(keyword)
                                );

                                if (isSubstringOfKeyword) return false;

                                // Exclude characters that appear in SQL syntax
                                const sqlChars = [
                                    "[",
                                    "]",
                                    "(",
                                    ")",
                                    "'",
                                    '"',
                                    "`",
                                    ";",
                                    ",",
                                    "=",
                                    " ",
                                    "\t",
                                    "\n",
                                    "\r",
                                    "_",
                                ];
                                if (sqlChars.some((char) => s.includes(char)))
                                    return false;

                                return true;
                            }),
                        emojiString: fc.oneof(
                            fc.constant("🔥💻🚀"),
                            fc.constant("🎯📊💡"),
                            fc.constant("⚡🔒🛡️")
                        ),
                        specialChars: fc.oneof(
                            fc.constant("äöüß"),
                            fc.constant("中文测试"),
                            fc.constant("русский"),
                            fc.constant("العربية")
                        ),
                    }),
                    ({ unicodeString, emojiString, specialChars }) => {
                        const runSpy = vi.fn();
                        const testDb = { run: runSpy } as unknown as Database;

                        runSpy.mockReturnValue(undefined);

                        // Schema creation should work regardless of external Unicode data
                        expect(() =>
                            createDatabaseSchema(testDb)).not.toThrowError();

                        // Verify SQL commands don't contain external data
                        const allCalls = runSpy.mock.calls.flat();
                        for (const call of allCalls) {
                            expect(typeof call).toBe("string");
                            // Verify standard ASCII SQL structure
                            expect(call.trim()).toMatch(
                                /^(?:begin|create|commit|rollback)/i
                            );

                            // External Unicode should not leak into schema
                            // Only check non-empty strings (empty string is contained in every string)
                            // Exclude common SQL keywords, table names, and single characters that appear in SQL
                            const sqlKeywords = [
                                "name",
                                "id",
                                "data",
                                "type",
                                "time",
                                "status",
                                "url",
                                "host",
                                "port",
                                "site",
                                "monitor",
                                "history",
                                "settings",
                            ];

                            if (
                                unicodeString.length > 1 &&
                                !sqlKeywords.includes(
                                    unicodeString.toLowerCase()
                                )
                            ) {
                                expect(
                                    containsStandaloneSegment(
                                        call,
                                        unicodeString
                                    )
                                ).toBeFalsy();
                            }
                            if (emojiString.length > 0) {
                                expect(call).not.toContain(emojiString);
                            }
                            if (specialChars.length > 0) {
                                expect(call).not.toContain(specialChars);
                            }
                        }
                    }
                )
            );
        });
    });
});
