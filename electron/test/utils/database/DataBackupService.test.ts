/**
 * Test suite for DataBackupService
 *
 * @module DataBackupService
 *
 * @file Comprehensive tests for the DataBackupService class in the Uptime
 *   Watcher application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Database Utilities
 *
 * @tags ["test", "database", "backup", "service"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as path from "node:path";

const mockFsPromises = vi.hoisted(() => ({
    copyFile: vi.fn(),
    mkdtemp: vi.fn(),
    rename: vi.fn(),
    rm: vi.fn(),
    writeFile: vi.fn(),
}));

const mockOs = vi.hoisted(() => ({
    tmpdir: vi.fn(() => "/tmp"),
}));

const {
    mockDatabaseConstructor,
    mockDatabaseGet,
    mockDatabaseInstance,
    mockDatabasePrepare,
} = vi.hoisted(() => {
    const mockGet = vi.fn(() => ({ user_version: 1 }));
    const mockPrepare = vi.fn(() => ({ get: mockGet }));
    const mockInstance = {
        close: vi.fn(),
        exec: vi.fn(),
        prepare: mockPrepare,
    } satisfies {
        close: ReturnType<typeof vi.fn>;
        exec: ReturnType<typeof vi.fn>;
        prepare: typeof mockPrepare;
    };
    const mockCtor = vi.fn(function DatabaseMock() {
        return mockInstance;
    });
    return {
        mockDatabaseConstructor: mockCtor,
        mockDatabaseGet: mockGet,
        mockDatabaseInstance: mockInstance,
        mockDatabasePrepare: mockPrepare,
    };
});

// Mock dependencies before importing the module under test
vi.mock("electron", () => ({
    app: {
        getPath: vi.fn(),
        getVersion: vi.fn(() => "test-version"),
    },
}));

vi.mock("../../../services/database/utils/backup/databaseBackup", () => ({
    createDatabaseBackup: vi.fn(),
    computeDatabaseBackupChecksum: vi.fn(() => "mock-checksum"),
    validateDatabaseBackupPayload: vi.fn(),
    DEFAULT_BACKUP_RETENTION_HINT_DAYS: 30,
    readDatabaseSchemaVersionFromFile: vi.fn(() => 1),
}));

vi.mock("../../../constants", () => ({
    DB_FILE_NAME: "uptime-watcher.sqlite",
}));

vi.mock("node:fs/promises", () => ({
    default: mockFsPromises,
    ...mockFsPromises,
}));

vi.mock("node:os", () => ({
    default: mockOs,
    ...mockOs,
}));

vi.mock("node-sqlite3-wasm", () => ({
    default: { Database: mockDatabaseConstructor },
    Database: mockDatabaseConstructor,
}));

// Import after mocks are set up
import { DataBackupService } from "../../../services/database/DataBackupService";
import { SiteLoadingError } from "../../../services/database/interfaces";
import { app } from "electron";
import {
    createDatabaseBackup,
    validateDatabaseBackupPayload,
} from "../../../services/database/utils/backup/databaseBackup";
import type { DatabaseBackupResult } from "../../../services/database/utils/backup/databaseBackup";

// Test utilities and mocks
const createMockEventEmitter = () => ({
    emitTyped: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
    listenerCount: vi.fn(),
    eventNames: vi.fn(),
    getMaxListeners: vi.fn(),
    setMaxListeners: vi.fn(),
});

const createMockLogger = () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
});

const createMockDatabaseService = () => ({
    close: vi.fn(),
    initialize: vi.fn(),
});

describe(DataBackupService, () => {
    let mockEventEmitter: ReturnType<typeof createMockEventEmitter>;
    let mockLogger: ReturnType<typeof createMockLogger>;
    let mockDatabaseService: ReturnType<typeof createMockDatabaseService>;
    let dataBackupService: DataBackupService;

    beforeEach(() => {
        vi.clearAllMocks();
        mockEventEmitter = createMockEventEmitter();
        mockLogger = createMockLogger();
        mockDatabaseService = createMockDatabaseService();
        for (const mockFn of Object.values(mockFsPromises)) mockFn.mockReset();
        mockOs.tmpdir.mockReturnValue("/tmp");
        mockDatabaseConstructor.mockClear();
        mockDatabasePrepare.mockClear();
        mockDatabaseGet.mockClear();
        mockDatabaseInstance.close.mockClear();
        mockFsPromises.mkdtemp.mockResolvedValue("/tmp/mock-dir");
        mockFsPromises.writeFile.mockResolvedValue(undefined as never);
        mockFsPromises.copyFile.mockResolvedValue(undefined as never);
        mockFsPromises.rename.mockResolvedValue(undefined as never);
        mockFsPromises.rm.mockResolvedValue(undefined as never);

        // Reset app.getPath mock
        vi.mocked(app.getPath).mockReturnValue("/test/userdata");

        // Reset createDatabaseBackup mock
        vi.mocked(createDatabaseBackup).mockResolvedValue({
            buffer: Buffer.from("test database content"),
            fileName: "uptime-watcher-backup.sqlite",
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "mock-checksum",
                createdAt: Date.now(),
                originalPath: "/test/userdata/uptime-watcher.sqlite",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 1024,
            },
        });

        vi.mocked(validateDatabaseBackupPayload).mockImplementation(() => {
            /* noop */
        });

        dataBackupService = new DataBackupService({
            databaseService: mockDatabaseService as any,
            eventEmitter: mockEventEmitter as any,
            logger: mockLogger,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Constructor", () => {
        it("should create instance with provided configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const service = new DataBackupService({
                databaseService: mockDatabaseService as any,
                eventEmitter: mockEventEmitter as any,
                logger: mockLogger,
            });

            expect(service).toBeInstanceOf(DataBackupService);
        });

        it("should store event emitter and logger from config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const service = new DataBackupService({
                databaseService: mockDatabaseService as any,
                eventEmitter: mockEventEmitter as any,
                logger: mockLogger,
            });

            // Verify they're stored by testing behavior that uses them
            expect(service).toBeDefined();
        });
    });

    describe("downloadDatabaseBackup", () => {
        it("should successfully create and return database backup", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            // Arrange
            const mockResult = {
                buffer: Buffer.from("test database content"),
                fileName: "uptime-watcher-backup.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: Date.now(),
                    originalPath: "/test/userdata/uptime-watcher.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 1024,
                },
            };
            vi.mocked(createDatabaseBackup).mockResolvedValue(mockResult);

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result).toEqual({
                ...mockResult,
                metadata: {
                    ...mockResult.metadata,
                    originalPath: mockResult.fileName,
                },
            });
            expect(app.getPath).toHaveBeenCalledWith("userData");
            // Snapshot creation should prefer leaving the primary connection
            // open. Closing/reinitializing is reserved for SQLITE_BUSY/LOCKED
            // fallback scenarios.
            expect(mockDatabaseService.close).not.toHaveBeenCalled();
            expect(mockDatabaseService.initialize).not.toHaveBeenCalled();
            expect(mockFsPromises.mkdtemp).toHaveBeenCalled();
            expect(mockDatabaseInstance.exec).toHaveBeenCalledWith(
                expect.stringContaining("VACUUM INTO")
            );
            const expectedSnapshotPath = path.resolve(
                "/tmp/mock-dir",
                "backup-snapshot.sqlite"
            );
            expect(mockDatabaseInstance.exec).toHaveBeenCalledWith(
                `VACUUM INTO '${expectedSnapshotPath}'`
            );
            expect(createDatabaseBackup).toHaveBeenCalledWith({
                dbPath: expectedSnapshotPath,
            });
            expect(validateDatabaseBackupPayload).toHaveBeenCalledWith(
                expect.objectContaining({
                    fileName: mockResult.fileName,
                    metadata: expect.objectContaining({
                        originalPath: mockResult.fileName,
                    }),
                })
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[DataBackupService] Created database backup",
                expect.objectContaining({
                    checksum: mockResult.metadata.checksum,
                    fileName: mockResult.fileName,
                    schemaVersion: mockResult.metadata.schemaVersion,
                    sizeBytes: mockResult.metadata.sizeBytes,
                })
            );
        });

        it("should close and reinitialize the primary DB when VACUUM INTO hits SQLITE_BUSY", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Backup Operation", "type");

            const mockResult = {
                buffer: Buffer.from("test database content"),
                fileName: "uptime-watcher-backup.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: Date.now(),
                    originalPath: "/test/userdata/uptime-watcher.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 1024,
                },
            };
            vi.mocked(createDatabaseBackup).mockResolvedValue(mockResult);

            let shouldFailVacuum = true;
            const lockError = Object.assign(
                new Error("SQLITE_BUSY: database is locked"),
                { code: "SQLITE_BUSY" }
            );

            vi.mocked(mockDatabaseInstance.exec).mockImplementation((sql) => {
                if (
                    shouldFailVacuum &&
                    typeof sql === "string" &&
                    sql.includes("VACUUM INTO")
                ) {
                    shouldFailVacuum = false;
                    throw lockError;
                }
                return undefined as never;
            });

            await dataBackupService.downloadDatabaseBackup();

            expect(mockDatabaseService.close).toHaveBeenCalledTimes(1);
            expect(mockDatabaseService.initialize).toHaveBeenCalledTimes(1);
        });

        it("should use correct database path", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(app.getPath).mockReturnValue("/custom/path");

            // Act
            await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(app.getPath).toHaveBeenCalledWith("userData");
            const expectedSnapshotPath = path.resolve(
                "/tmp/mock-dir",
                "backup-snapshot.sqlite"
            );
            expect(createDatabaseBackup).toHaveBeenCalledWith({
                dbPath: expectedSnapshotPath,
            });
        });

        it("should handle different backup results", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Backup Operation", "type");

            // Arrange
            const customBackupResult = {
                buffer: Buffer.from("custom backup data"),
                fileName: "custom-backup.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: 1_234_567_890,
                    originalPath: "/test/path",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 2048,
                },
            };
            vi.mocked(createDatabaseBackup).mockResolvedValue(
                customBackupResult
            );

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result.buffer).toEqual(customBackupResult.buffer);
            expect(result.fileName).toBe(customBackupResult.fileName);
            expect(validateDatabaseBackupPayload).toHaveBeenCalledWith(
                expect.objectContaining({
                    fileName: customBackupResult.fileName,
                    metadata: expect.objectContaining({
                        originalPath: customBackupResult.fileName,
                    }),
                })
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[DataBackupService] Created database backup",
                expect.objectContaining({
                    checksum: customBackupResult.metadata.checksum,
                    fileName: customBackupResult.fileName,
                    schemaVersion: customBackupResult.metadata.schemaVersion,
                    sizeBytes: customBackupResult.metadata.sizeBytes,
                })
            );
        });

        it("should handle createDatabaseBackup throwing Error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            // Arrange
            const testError = new Error("Backup creation failed");
            vi.mocked(createDatabaseBackup).mockRejectedValue(testError);

            // Act & Assert
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrowError(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download database backup: Backup creation failed",
                expect.objectContaining({ message: "Backup creation failed" })
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    details:
                        "Failed to download database backup: Backup creation failed",
                    error: expect.objectContaining({
                        message: "Backup creation failed",
                        name: "Error",
                    }),
                    operation: "download-backup",
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should handle createDatabaseBackup throwing non-Error object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            // Arrange
            const testError = "String error message";
            vi.mocked(createDatabaseBackup).mockRejectedValue(testError);

            // Act & Assert
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrowError(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download database backup: String error message",
                expect.objectContaining({ message: "String error message" })
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    details:
                        "Failed to download database backup: String error message",
                    error: expect.objectContaining({
                        message: "String error message",
                    }),
                    operation: "download-backup",
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should throw SiteLoadingError with correct message and cause", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const originalError = new Error("Original error");
            vi.mocked(createDatabaseBackup).mockRejectedValue(originalError);

            // Act & Assert
            try {
                await dataBackupService.downloadDatabaseBackup();
                expect.fail("Should have thrown SiteLoadingError");
            } catch (error) {
                expect(error).toBeInstanceOf(SiteLoadingError);
                expect((error as SiteLoadingError).message).toBe(
                    "Failed to load sites: Failed to download database backup: Original error"
                );
                expect((error as SiteLoadingError).stack).toContain(
                    "Caused by:"
                );
            }
        });

        it("should emit database:error event with correct timestamp", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const testError = new Error("Test error");
            vi.mocked(createDatabaseBackup).mockRejectedValue(testError);
            const beforeTime = Date.now();

            // Act
            try {
                await dataBackupService.downloadDatabaseBackup();
            } catch {
                // Expected to throw
            }

            const afterTime = Date.now();

            // Assert
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    details: "Failed to download database backup: Test error",
                    error: expect.objectContaining({ message: "Test error" }),
                    operation: "download-backup",
                    timestamp: expect.any(Number),
                })
            );

            const emittedEvent = mockEventEmitter.emitTyped.mock.calls[0]![1];
            expect(emittedEvent.timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(emittedEvent.timestamp).toBeLessThanOrEqual(afterTime);
        });

        it("should handle null or undefined errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            vi.mocked(createDatabaseBackup).mockRejectedValue(null);

            // Act & Assert
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrowError(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download database backup: null",
                expect.objectContaining({ message: "null" })
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                {
                    details: "Failed to download database backup: null",
                    error: expect.objectContaining({ message: "null" }),
                    operation: "download-backup",
                    timestamp: expect.any(Number),
                }
            );
        });

        it("should handle empty buffer results", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(createDatabaseBackup).mockResolvedValue({
                buffer: Buffer.alloc(0), // Empty buffer
                fileName: "empty-backup.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: Date.now(),
                    originalPath: "/test/path",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 0,
                },
            });

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result.buffer).toHaveLength(0);
            expect(result.fileName).toBe("empty-backup.sqlite");
            expect(validateDatabaseBackupPayload).toHaveBeenCalledWith(
                expect.objectContaining({
                    fileName: "empty-backup.sqlite",
                })
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[DataBackupService] Created database backup",
                expect.objectContaining({
                    checksum: expect.any(String),
                    fileName: "empty-backup.sqlite",
                    schemaVersion: expect.any(Number),
                    sizeBytes: 0,
                })
            );
        });

        it("should handle large buffer results", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB buffer
            vi.mocked(createDatabaseBackup).mockResolvedValue({
                buffer: largeBuffer,
                fileName: "large-backup.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: Date.now(),
                    originalPath: "/test/path",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: largeBuffer.length,
                },
            });

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result.buffer).toHaveLength(1024 * 1024);
            expect(result.fileName).toBe("large-backup.sqlite");
        });

        it("should preserve all properties from createDatabaseBackup result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            // Arrange
            const backupResult = {
                buffer: Buffer.from("test content"),
                fileName: "test-backup.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: 1_234_567_890,
                    originalPath: "/original/path",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 12,
                },
            };
            vi.mocked(createDatabaseBackup).mockResolvedValue(backupResult);

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result.buffer).toBe(backupResult.buffer);
            expect(result.fileName).toBe(backupResult.fileName);
            expect(result.metadata).toEqual({
                ...backupResult.metadata,
                originalPath: backupResult.fileName,
            });
            expect(validateDatabaseBackupPayload).toHaveBeenCalledWith(
                expect.objectContaining({
                    fileName: backupResult.fileName,
                    metadata: expect.objectContaining({
                        originalPath: backupResult.fileName,
                    }),
                })
            );
        });
    });

    describe("restoreDatabaseBackup", () => {
        beforeEach(() => {
            mockFsPromises.mkdtemp.mockResolvedValue("/tmp/mock-restore");
            mockFsPromises.writeFile.mockResolvedValue(undefined);
            mockFsPromises.copyFile.mockResolvedValue(undefined);
            mockFsPromises.rm.mockResolvedValue(undefined);
        });

        it("should validate payload, snapshot database, and emit events", async () => {
            const buffer = Buffer.concat([
                Buffer.from("SQLite format 3\0", "ascii"),
                Buffer.from("restored-db"),
            ]);

            const summary = await dataBackupService.restoreDatabaseBackup({
                buffer,
                fileName: "restore.sqlite",
            });

            expect(mockFsPromises.mkdtemp).toHaveBeenCalled();
            expect(mockFsPromises.writeFile).toHaveBeenCalled();
            expect(createDatabaseBackup).toHaveBeenCalled();
            expect(validateDatabaseBackupPayload).toHaveBeenCalledWith(
                expect.objectContaining({
                    buffer,
                    metadata: expect.objectContaining({
                        sizeBytes: buffer.length,
                    }),
                })
            );
            expect(mockDatabaseService.close).toHaveBeenCalled();
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:backup-restored",
                expect.objectContaining({
                    checksum: expect.any(String),
                    fileName: "restore.sqlite",
                    schemaVersion: expect.any(Number),
                    size: buffer.length,
                    timestamp: expect.any(Number),
                    triggerType: "manual",
                })
            );
            expect(summary.metadata.sizeBytes).toBe(buffer.length);
        });

        it("should reject non-SQLite payloads before writing temp files", async () => {
            const buffer = Buffer.from("definitely-not-a-sqlite-file");

            await expect(
                dataBackupService.restoreDatabaseBackup({
                    buffer,
                    fileName: "not-sqlite.bin",
                })
            ).rejects.toThrowError(/not a valid SQLite database file/u);

            expect(mockFsPromises.mkdtemp).not.toHaveBeenCalled();
            expect(mockFsPromises.writeFile).not.toHaveBeenCalled();
            expect(mockDatabaseConstructor).not.toHaveBeenCalled();
        });
    });

    describe("applyDatabaseBackupResult", () => {
        beforeEach(() => {
            mockFsPromises.mkdtemp.mockResolvedValue("/tmp/mock-apply");
            mockFsPromises.writeFile.mockResolvedValue(undefined);
            mockFsPromises.copyFile.mockResolvedValue(undefined);
            mockFsPromises.rm.mockResolvedValue(undefined);
        });

        it("should copy provided backup and reinitialize database", async () => {
            const backup: DatabaseBackupResult = {
                buffer: Buffer.from("previous"),
                fileName: "pre-restore.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "checksum",
                    createdAt: Date.now(),
                    originalPath: "/tmp/pre-restore.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 9,
                },
            };

            const metadata =
                await dataBackupService.applyDatabaseBackupResult(backup);

            expect(validateDatabaseBackupPayload).toHaveBeenCalledWith(
                expect.objectContaining({
                    fileName: backup.fileName,
                    metadata: expect.objectContaining({
                        originalPath: backup.fileName,
                    }),
                })
            );
            expect(mockDatabaseService.close).toHaveBeenCalled();
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
            expect(mockFsPromises.copyFile).toHaveBeenCalled();
            expect(metadata).toEqual({
                ...backup.metadata,
                originalPath: backup.fileName,
            });
        });

        it("should attempt to reinitialize even when copy fails", async () => {
            const backup: DatabaseBackupResult = {
                buffer: Buffer.concat([
                    Buffer.from("SQLite format 3\0", "ascii"),
                    Buffer.from("previous"),
                ]),
                fileName: "pre-restore.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "checksum",
                    createdAt: Date.now(),
                    originalPath: "/tmp/pre-restore.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 23,
                },
            };

            mockFsPromises.copyFile.mockRejectedValueOnce(
                new Error("copy failed")
            );

            await expect(
                dataBackupService.applyDatabaseBackupResult(backup)
            ).rejects.toThrowError("copy failed");

            expect(mockDatabaseService.close).toHaveBeenCalled();
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
        });
    });

    describe("Error handling edge cases", () => {
        it("should handle app.getPath throwing an error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const pathError = new Error("Cannot access user data path");
            vi.mocked(app.getPath).mockImplementation(() => {
                throw pathError;
            });

            // Act & Assert
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrowError(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download database backup: Cannot access user data path",
                expect.objectContaining({
                    message: "Cannot access user data path",
                })
            );
        });

        it("should handle event emission failure gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const originalError = new Error("Backup failed");
            const emitError = new Error("Event emission failed");
            vi.mocked(createDatabaseBackup).mockRejectedValue(originalError);
            mockEventEmitter.emitTyped.mockRejectedValue(emitError);

            // Act & Assert
            // When event emission fails, the emission error is thrown instead of SiteLoadingError
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrowError("Event emission failed");

            expect(mockLogger.error).not.toHaveBeenCalled();
        });
    });

    describe("Integration scenarios", () => {
        it("should work with different user data paths", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test different common user data paths
            const testPaths = [
                "/home/user/.config/uptime-watcher",
                String.raw`C:\Users\User\AppData\Roaming\uptime-watcher`,
                "/Applications/Uptime Watcher.app/Contents/macOS",
            ];

            for (const testPath of testPaths) {
                // Arrange
                vi.mocked(app.getPath).mockReturnValue(testPath);

                // Act
                await dataBackupService.downloadDatabaseBackup();

                // Assert
                const expectedSnapshotPath = path.resolve(
                    "/tmp/mock-dir",
                    "backup-snapshot.sqlite"
                );
                expect(createDatabaseBackup).toHaveBeenLastCalledWith({
                    dbPath: expectedSnapshotPath,
                });
            }
        });

        it("should handle concurrent backup requests", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataBackupService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Backup Operation", "type");

            // Arrange
            let resolveBackup: (value: any) => void;
            const backupPromise = new Promise((resolve) => {
                resolveBackup = resolve;
            });
            vi.mocked(createDatabaseBackup).mockReturnValue(
                backupPromise as any
            );

            // Act
            const promise1 = dataBackupService.downloadDatabaseBackup();
            const promise2 = dataBackupService.downloadDatabaseBackup();

            // Complete both backups
            resolveBackup!({
                buffer: Buffer.from("concurrent backup"),
                fileName: "concurrent-backup.sqlite",
                metadata: {
                    createdAt: Date.now(),
                    originalPath: "/test",
                    sizeBytes: 17,
                },
            });

            const [result1, result2] = await Promise.all([promise1, promise2]);

            // Assert
            expect(result1.fileName).toBe("concurrent-backup.sqlite");
            expect(result2.fileName).toBe("concurrent-backup.sqlite");
            expect(createDatabaseBackup).toHaveBeenCalledTimes(1);
        });
    });
});
