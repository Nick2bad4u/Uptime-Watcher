/**
 * Comprehensive tests for databaseBackup.ts Testing database backup
 * functionality with all edge cases and error scenarios
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fc } from "@fast-check/vitest";

// Mock the logger with a factory function to avoid hoisting issues
vi.mock("../../../../../electron/utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock node:fs module
vi.mock("node:fs", () => ({
    promises: {
        readFile: vi.fn(),
    },
}));

// Import after mocking
import {
    createDatabaseBackup,
    type DatabaseBackupResult,
} from "../../../../../electron/services/database/utils/databaseBackup";
import { BACKUP_DB_FILE_NAME } from "../../../../../electron/constants";
import { logger } from "../../../../../electron/utils/logger";
import { promises as fs } from "node:fs";

// Get the mocked function
const mockReadFile = vi.mocked(fs.readFile);

describe("databaseBackup.ts - Comprehensive Coverage", () => {
    const testDbPath = "/test/path/database.sqlite";
    const testBuffer = Buffer.from("mock database content");

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
    });
    describe("createDatabaseBackup - Success scenarios", () => {
        it("should create database backup with default filename", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: databaseBackup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            mockReadFile.mockResolvedValue(testBuffer);
            const startTime = Date.now();

            const result = await createDatabaseBackup(testDbPath);

            expect(result).toMatchObject({
                buffer: testBuffer,
                fileName: BACKUP_DB_FILE_NAME,
                metadata: {
                    originalPath: testDbPath,
                    sizeBytes: testBuffer.length,
                },
            });
            expect(result.metadata.createdAt).toBeGreaterThanOrEqual(startTime);
            expect(result.metadata.createdAt).toBeLessThanOrEqual(Date.now());
            expect(mockReadFile).toHaveBeenCalledWith(testDbPath);
            expect(logger.info).toHaveBeenCalledWith(
                "[DatabaseBackup] Database backup created successfully",
                expect.objectContaining({
                    dbPath: testDbPath,
                    fileName: BACKUP_DB_FILE_NAME,
                    sizeBytes: testBuffer.length,
                    createdAt: expect.any(Number),
                })
            );
        });
        it("should create database backup with custom filename", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: databaseBackup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const customFileName = "custom-backup.sqlite";
            mockReadFile.mockResolvedValue(testBuffer);

            const result = await createDatabaseBackup(
                testDbPath,
                customFileName
            );

            expect(result.fileName).toBe(customFileName);
            expect(result.buffer).toBe(testBuffer);
            expect(logger.info).toHaveBeenCalledWith(
                "[DatabaseBackup] Database backup created successfully",
                expect.objectContaining({
                    fileName: customFileName,
                    dbPath: testDbPath,
                    sizeBytes: testBuffer.length,
                    createdAt: expect.any(Number),
                })
            );
        });
        it("should handle empty database file", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: databaseBackup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const emptyBuffer = Buffer.alloc(0);
            mockReadFile.mockResolvedValue(emptyBuffer);

            const result = await createDatabaseBackup(testDbPath);

            expect(result.buffer).toBe(emptyBuffer);
            expect(result.metadata.sizeBytes).toBe(0);
            expect(logger.info).toHaveBeenCalledWith(
                "[DatabaseBackup] Database backup created successfully",
                expect.objectContaining({
                    sizeBytes: 0,
                    dbPath: testDbPath,
                    fileName: BACKUP_DB_FILE_NAME,
                    createdAt: expect.any(Number),
                })
            );
        });
        it("should handle large database file", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: databaseBackup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const largeBuffer = Buffer.alloc(1024 * 1024 * 10); // 10MB
            largeBuffer.fill(42); // Fill with test data
            mockReadFile.mockResolvedValue(largeBuffer);

            const result = await createDatabaseBackup(testDbPath);

            expect(result.buffer).toBe(largeBuffer);
            expect(result.metadata.sizeBytes).toBe(largeBuffer.length);
            expect(logger.info).toHaveBeenCalledWith(
                "[DatabaseBackup] Database backup created successfully",
                expect.objectContaining({
                    sizeBytes: largeBuffer.length,
                    dbPath: testDbPath,
                    fileName: BACKUP_DB_FILE_NAME,
                    createdAt: expect.any(Number),
                })
            );
        });
        it("should handle special characters in path", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: databaseBackup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const specialPath = "/test/path with spaces/database-файл.sqlite";
            mockReadFile.mockResolvedValue(testBuffer);

            const result = await createDatabaseBackup(specialPath);

            expect(result.metadata.originalPath).toBe(specialPath);
            expect(mockReadFile).toHaveBeenCalledWith(specialPath);
        });
        it("should preserve buffer content integrity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: databaseBackup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const binaryData = Buffer.from([
                0x00,
                0xff,
                0xab,
                0xcd,
                0xef,
            ]);
            mockReadFile.mockResolvedValue(binaryData);

            const result = await createDatabaseBackup(testDbPath);

            expect(result.buffer).toStrictEqual(binaryData);
            expect([...result.buffer]).toEqual([
                0x00,
                0xff,
                0xab,
                0xcd,
                0xef,
            ]);
        });
        describe("createDatabaseBackup - Error scenarios", () => {
            it("should handle file read errors", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const fileError = new Error(
                    "ENOENT: no such file or directory"
                );
                fileError.name = "ENOENT";
                mockReadFile.mockRejectedValue(fileError);

                await expect(createDatabaseBackup(testDbPath)).rejects.toThrow(
                    fileError
                );

                expect(logger.error).toHaveBeenCalledWith(
                    "[DatabaseBackup] Failed to create database backup",
                    expect.objectContaining({
                        dbPath: testDbPath,
                        error: "ENOENT: no such file or directory",
                        fileName: BACKUP_DB_FILE_NAME,
                        stack: expect.any(String),
                    })
                );
            });
            it("should handle permission errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const permissionError = new Error("EACCES: permission denied");
                permissionError.name = "EACCES";
                mockReadFile.mockRejectedValue(permissionError);

                await expect(createDatabaseBackup(testDbPath)).rejects.toThrow(
                    permissionError
                );

                expect(logger.error).toHaveBeenCalledWith(
                    "[DatabaseBackup] Failed to create database backup",
                    expect.objectContaining({
                        error: "EACCES: permission denied",
                        dbPath: testDbPath,
                        fileName: BACKUP_DB_FILE_NAME,
                        stack: expect.any(String),
                    })
                );
            });
            it("should handle non-Error exceptions from readFile", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                mockReadFile.mockRejectedValue("String error");

                await expect(createDatabaseBackup(testDbPath)).rejects.toBe(
                    "String error"
                );

                expect(logger.error).toHaveBeenCalledWith(
                    "[DatabaseBackup] Failed to create database backup",
                    expect.objectContaining({
                        error: "String error",
                        stack: undefined,
                        dbPath: testDbPath,
                        fileName: BACKUP_DB_FILE_NAME,
                    })
                );
            });
            it("should handle file read timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const timeoutError = new Error("Operation timed out");
                timeoutError.name = "TIMEOUT";
                mockReadFile.mockRejectedValue(timeoutError);

                await expect(createDatabaseBackup(testDbPath)).rejects.toThrow(
                    timeoutError
                );

                expect(logger.error).toHaveBeenCalledWith(
                    "[DatabaseBackup] Failed to create database backup",
                    expect.objectContaining({
                        error: "Operation timed out",
                        dbPath: testDbPath,
                        fileName: BACKUP_DB_FILE_NAME,
                        stack: expect.any(String),
                    })
                );
            });
            it("should handle custom filename with errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const customFileName = "error-backup.sqlite";
                const error = new Error("File system error");
                mockReadFile.mockRejectedValue(error);

                await expect(
                    createDatabaseBackup(testDbPath, customFileName)
                ).rejects.toThrow(error);

                expect(logger.error).toHaveBeenCalledWith(
                    "[DatabaseBackup] Failed to create database backup",
                    expect.objectContaining({
                        fileName: customFileName,
                        error: "File system error",
                        dbPath: testDbPath,
                        stack: expect.any(String),
                    })
                );
            });
        });
        describe("createDatabaseBackup - Edge cases and boundary conditions", () => {
            it("should handle empty string paths", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                mockReadFile.mockResolvedValue(testBuffer);

                const result = await createDatabaseBackup("");

                expect(mockReadFile).toHaveBeenCalledWith("");
                expect(result.metadata.originalPath).toBe("");
            });
            it("should handle very long file paths", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const longPath = `/very/long/path/${"x".repeat(1000)}/database.sqlite`;
                mockReadFile.mockResolvedValue(testBuffer);

                const result = await createDatabaseBackup(longPath);

                expect(result.metadata.originalPath).toBe(longPath);
                expect(mockReadFile).toHaveBeenCalledWith(longPath);
            });
            it("should handle empty custom filename", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                mockReadFile.mockResolvedValue(testBuffer);

                const result = await createDatabaseBackup(testDbPath, "");

                expect(result.fileName).toBe("");
                expect(logger.info).toHaveBeenCalledWith(
                    "[DatabaseBackup] Database backup created successfully",
                    expect.objectContaining({
                        fileName: "",
                        dbPath: testDbPath,
                        sizeBytes: testBuffer.length,
                        createdAt: expect.any(Number),
                    })
                );
            });
            it("should handle very long custom filename", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const longFileName = `very-long-filename-${"x".repeat(1000)}.sqlite`;
                mockReadFile.mockResolvedValue(testBuffer);

                const result = await createDatabaseBackup(
                    testDbPath,
                    longFileName
                );

                expect(result.fileName).toBe(longFileName);
            });
            it("should handle unicode characters in filename", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const unicodeFileName = "backup-файл-数据库-🗃️.sqlite";
                mockReadFile.mockResolvedValue(testBuffer);

                const result = await createDatabaseBackup(
                    testDbPath,
                    unicodeFileName
                );

                expect(result.fileName).toBe(unicodeFileName);
            });
            it("should ensure timestamp precision", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                mockReadFile.mockResolvedValue(testBuffer);

                const before = Date.now();
                const result = await createDatabaseBackup(testDbPath);
                const after = Date.now();

                expect(result.metadata.createdAt).toBeGreaterThanOrEqual(
                    before
                );
                expect(result.metadata.createdAt).toBeLessThanOrEqual(after);
                expect(
                    Number.isInteger(result.metadata.createdAt)
                ).toBeTruthy();
            });
        });
        describe("createDatabaseBackup - Type safety and interface compliance", () => {
            it("should return correctly typed DatabaseBackupResult", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Backup Operation", "type");

                mockReadFile.mockResolvedValue(testBuffer);

                const result = await createDatabaseBackup(testDbPath);

                // Type checks
                expect(Buffer.isBuffer(result.buffer)).toBeTruthy();
                expect(typeof result.fileName).toBe("string");
                expect(typeof result.metadata).toBe("object");
                expect(typeof result.metadata.createdAt).toBe("number");
                expect(typeof result.metadata.originalPath).toBe("string");
                expect(typeof result.metadata.sizeBytes).toBe("number");

                // Interface compliance
                const expectedInterface: DatabaseBackupResult = result;
                expect(expectedInterface).toBeDefined();
            });
            it("should validate metadata consistency", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                mockReadFile.mockResolvedValue(testBuffer);

                const result = await createDatabaseBackup(
                    testDbPath,
                    "test.sqlite"
                );

                expect(result.metadata.sizeBytes).toBe(result.buffer.length);
                expect(result.metadata.originalPath).toBe(testDbPath);
                expect(result.fileName).toBe("test.sqlite");
            });
            it("should handle buffer edge cases", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: databaseBackup", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                // Test with various buffer types
                const testCases = [
                    Buffer.alloc(0), // Empty
                    Buffer.alloc(1, 0), // Single zero byte
                    Buffer.alloc(1, 255), // Single max byte
                    Buffer.from("test"), // String buffer
                    Buffer.from([
                        1,
                        2,
                        3,
                        4,
                        5,
                    ]), // Array buffer
                ];

                for (const testCase of testCases) {
                    mockReadFile.mockResolvedValue(testCase);

                    const result = await createDatabaseBackup(testDbPath);

                    expect(result.buffer).toBe(testCase);
                    expect(result.metadata.sizeBytes).toBe(testCase.length);
                }
            });
        });

        describe("Property-Based Database Backup Tests", () => {
            it("should handle various database file paths", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 100 }).map(
                            (s) => s.replaceAll(/["*:<>?|]/g, "_") // Remove invalid path characters
                        ),
                        fc.string({ minLength: 1, maxLength: 50 }).map(
                            (s) => s.replaceAll(/["*/:<>?\\|]/g, "_") // Remove invalid filename characters
                        ),
                        async (directory, filename) => {
                            const testPath = `/${directory}/${filename}.sqlite`;
                            const mockData = Buffer.from(
                                `test data for ${filename}`
                            );

                            mockReadFile.mockResolvedValue(mockData);

                            const result = await createDatabaseBackup(testPath);

                            expect(result).toBeDefined();
                            expect(result.buffer).toBe(mockData);
                            expect(result.metadata.sizeBytes).toBe(
                                mockData.length
                            );
                            expect(result.fileName).toBe(BACKUP_DB_FILE_NAME);
                            expect(result.metadata.originalPath).toBe(testPath);
                            expect(result.metadata.createdAt).toBeTypeOf(
                                "number"
                            );
                            expect(result.metadata.createdAt).toBeGreaterThan(
                                0
                            );
                            expect(mockReadFile).toHaveBeenCalledWith(testPath);
                        }
                    )
                );
            });

            it("should handle various buffer sizes and contents", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.uint8Array({ minLength: 0, maxLength: 10_000 }),
                        async (dataArray) => {
                            const testPath = "/test/database.sqlite";
                            const mockData = Buffer.from(dataArray);

                            mockReadFile.mockResolvedValue(mockData);

                            const result = await createDatabaseBackup(testPath);

                            expect(result).toBeDefined();
                            expect(result.buffer).toBe(mockData);
                            expect(result.metadata.sizeBytes).toBe(
                                mockData.length
                            );
                            expect(result.metadata.sizeBytes).toBe(
                                dataArray.length
                            );

                            // Verify buffer contents match
                            expect(
                                Buffer.compare(result.buffer, mockData)
                            ).toBe(0);
                        }
                    )
                );
            });

            it("should handle various error scenarios", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 200 }),
                        fc.oneof(
                            fc.constantFrom(
                                "ENOENT",
                                "EACCES",
                                "EISDIR",
                                "EMFILE",
                                "ENOMEM"
                            ),
                            fc.string({ minLength: 5, maxLength: 50 })
                        ),
                        async (testPath, errorCode) => {
                            const error = new Error(`Mock error: ${errorCode}`);
                            (error as any).code = errorCode;

                            mockReadFile.mockRejectedValue(error);

                            await expect(
                                createDatabaseBackup(testPath)
                            ).rejects.toThrow();
                            expect(logger.error).toHaveBeenCalledWith(
                                "[DatabaseBackup] Failed to create database backup",
                                expect.objectContaining({
                                    dbPath: testPath,
                                    error: `Mock error: ${errorCode}`,
                                    fileName: BACKUP_DB_FILE_NAME,
                                    stack: expect.any(String),
                                })
                            );
                        }
                    )
                );
            });

            it("should generate consistent metadata with various timestamps", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 5, maxLength: 100 }),
                        fc.integer({ min: 1000, max: 5000 }),
                        async (dbPath, dataSize) => {
                            const mockData = Buffer.alloc(dataSize, "x");
                            const beforeTimestamp = Date.now();

                            mockReadFile.mockResolvedValue(mockData);

                            const result = await createDatabaseBackup(dbPath);
                            const afterTimestamp = Date.now();

                            // Verify metadata consistency
                            expect(result.metadata.sizeBytes).toBe(dataSize);
                            expect(result.metadata.originalPath).toBe(dbPath);
                            expect(result.fileName).toBe(BACKUP_DB_FILE_NAME);
                            expect(
                                result.metadata.createdAt
                            ).toBeGreaterThanOrEqual(beforeTimestamp);
                            expect(
                                result.metadata.createdAt
                            ).toBeLessThanOrEqual(afterTimestamp);

                            // Verify buffer size matches metadata
                            expect(result.buffer).toHaveLength(
                                result.metadata.sizeBytes
                            );
                        }
                    )
                );
            });

            it("should handle edge case buffer patterns", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.oneof(
                            fc.constant(Buffer.alloc(0)), // Empty buffer
                            fc.constant(Buffer.alloc(1, 0)), // Single null byte
                            fc.constant(Buffer.alloc(1000, 255)), // All 0xFF bytes
                            fc.constant(Buffer.from("SQLite format 3\0")), // SQLite header
                            fc
                                .uint8Array({ minLength: 1, maxLength: 100 })
                                .map((arr) => Buffer.from(arr))
                        ),
                        async (testBuffer) => {
                            const testPath = "/edge/case/database.sqlite";

                            mockReadFile.mockResolvedValue(testBuffer);

                            const result = await createDatabaseBackup(testPath);

                            expect(result).toBeDefined();
                            expect(result.buffer).toBe(testBuffer);
                            expect(result.metadata.sizeBytes).toBe(
                                testBuffer.length
                            );

                            // Verify buffer integrity
                            expect(
                                Buffer.compare(result.buffer, testBuffer)
                            ).toBe(0);

                            // Verify logging for successful backup
                            expect(logger.info).toHaveBeenCalledWith(
                                "[DatabaseBackup] Database backup created successfully",
                                expect.objectContaining({
                                    dbPath: testPath,
                                    fileName: BACKUP_DB_FILE_NAME,
                                    sizeBytes: testBuffer.length,
                                    createdAt: expect.any(Number),
                                })
                            );
                        }
                    )
                );
            });

            it("should verify database backup result structure invariants", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 200 }),
                        fc.uint8Array({ minLength: 0, maxLength: 1000 }),
                        async (dbPath, dataArray) => {
                            const mockData = Buffer.from(dataArray);

                            mockReadFile.mockResolvedValue(mockData);

                            const result = await createDatabaseBackup(dbPath);

                            // Verify result structure invariants
                            expect(result).toHaveProperty("buffer");
                            expect(result).toHaveProperty("fileName");
                            expect(result).toHaveProperty("metadata");
                            expect(result.metadata).toHaveProperty("createdAt");
                            expect(result.metadata).toHaveProperty(
                                "originalPath"
                            );
                            expect(result.metadata).toHaveProperty("sizeBytes");

                            // Verify type invariants
                            expect(Buffer.isBuffer(result.buffer)).toBeTruthy();
                            expect(typeof result.fileName).toBe("string");
                            expect(typeof result.metadata.originalPath).toBe(
                                "string"
                            );
                            expect(typeof result.metadata.sizeBytes).toBe(
                                "number"
                            );
                            expect(typeof result.metadata.createdAt).toBe(
                                "number"
                            );

                            // Verify value invariants
                            expect(
                                result.metadata.sizeBytes
                            ).toBeGreaterThanOrEqual(0);
                            expect(result.metadata.createdAt).toBeGreaterThan(
                                0
                            );
                            expect(result.fileName.length).toBeGreaterThan(0);
                            expect(
                                result.metadata.originalPath.length
                            ).toBeGreaterThan(0);
                        }
                    )
                );
            });
        });
    });
});
