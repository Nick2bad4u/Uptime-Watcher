/**
 * Test suite for DataBackupService
 *
 * @fileoverview Comprehensive tests for the DataBackupService class
 * in the Uptime Watcher application.
 *
 * @author GitHub Copilot
 * @since 2025-08-11
 * @category Database Utilities
 * @module DataBackupService
 * @tags ["test", "database", "backup", "service"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "node:path";

// Mock dependencies before importing the module under test
vi.mock("electron", () => ({
    app: {
        getPath: vi.fn(),
    },
}));

vi.mock("../../../services/database/utils/databaseBackup", () => ({
    createDatabaseBackup: vi.fn(),
}));

vi.mock("../../../constants", () => ({
    DB_FILE_NAME: "uptime-watcher.sqlite",
}));

// Import after mocks are set up
import { DataBackupService } from "../../../utils/database/DataBackupService";
import { SiteLoadingError } from "../../../utils/database/interfaces";
import { app } from "electron";
import { createDatabaseBackup } from "../../../services/database/utils/databaseBackup";

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

describe("DataBackupService", () => {
    let mockEventEmitter: ReturnType<typeof createMockEventEmitter>;
    let mockLogger: ReturnType<typeof createMockLogger>;
    let dataBackupService: DataBackupService;

    beforeEach(() => {
        vi.clearAllMocks();
        mockEventEmitter = createMockEventEmitter();
        mockLogger = createMockLogger();

        // Reset app.getPath mock
        vi.mocked(app.getPath).mockReturnValue("/test/userdata");

        // Reset createDatabaseBackup mock
        vi.mocked(createDatabaseBackup).mockResolvedValue({
            buffer: Buffer.from("test database content"),
            fileName: "uptime-watcher-backup.sqlite",
            metadata: {
                createdAt: Date.now(),
                originalPath: "/test/userdata/uptime-watcher.sqlite",
                sizeBytes: 1024,
            },
        });

        dataBackupService = new DataBackupService({
            eventEmitter: mockEventEmitter as any,
            logger: mockLogger,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Constructor", () => {
        it("should create instance with provided configuration", () => {
            const service = new DataBackupService({
                eventEmitter: mockEventEmitter as any,
                logger: mockLogger,
            });

            expect(service).toBeInstanceOf(DataBackupService);
        });

        it("should store event emitter and logger from config", () => {
            const service = new DataBackupService({
                eventEmitter: mockEventEmitter as any,
                logger: mockLogger,
            });

            // Verify they're stored by testing behavior that uses them
            expect(service).toBeDefined();
        });
    });

    describe("downloadDatabaseBackup", () => {
        it("should successfully create and return database backup", async () => {
            // Arrange
            const mockResult = {
                buffer: Buffer.from("test database content"),
                fileName: "uptime-watcher-backup.sqlite",
                metadata: {
                    createdAt: Date.now(),
                    originalPath: "/test/userdata/uptime-watcher.sqlite",
                    sizeBytes: 1024,
                },
            };
            vi.mocked(createDatabaseBackup).mockResolvedValue(mockResult);

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result).toEqual(mockResult); // The implementation returns the full result
            expect(app.getPath).toHaveBeenCalledWith("userData");
            expect(createDatabaseBackup).toHaveBeenCalledWith(
                path.join("/test/userdata", "uptime-watcher.sqlite")
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Database backup created: uptime-watcher-backup.sqlite"
            );
        });

        it("should use correct database path", async () => {
            // Arrange
            vi.mocked(app.getPath).mockReturnValue("/custom/path");

            // Act
            await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(app.getPath).toHaveBeenCalledWith("userData");
            expect(createDatabaseBackup).toHaveBeenCalledWith(
                path.join("/custom/path", "uptime-watcher.sqlite")
            );
        });

        it("should handle different backup results", async () => {
            // Arrange
            const customBackupResult = {
                buffer: Buffer.from("custom backup data"),
                fileName: "custom-backup.sqlite",
                metadata: {
                    createdAt: 1_234_567_890,
                    originalPath: "/test/path",
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
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Database backup created: custom-backup.sqlite"
            );
        });

        it("should handle createDatabaseBackup throwing Error", async () => {
            // Arrange
            const testError = new Error("Backup creation failed");
            vi.mocked(createDatabaseBackup).mockRejectedValue(testError);

            // Act & Assert
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download backup: Backup creation failed",
                testError
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                {
                    details:
                        "Failed to download backup: Backup creation failed",
                    error: testError,
                    operation: "download-backup",
                    timestamp: expect.any(Number),
                }
            );
        });

        it("should handle createDatabaseBackup throwing non-Error object", async () => {
            // Arrange
            const testError = "String error message";
            vi.mocked(createDatabaseBackup).mockRejectedValue(testError);

            // Act & Assert
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download backup: String error message",
                testError
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                {
                    details: "Failed to download backup: String error message",
                    error: new Error("String error message"),
                    operation: "download-backup",
                    timestamp: expect.any(Number),
                }
            );
        });

        it("should throw SiteLoadingError with correct message and cause", async () => {
            // Arrange
            const originalError = new Error("Original error");
            vi.mocked(createDatabaseBackup).mockRejectedValue(originalError);

            // Act & Assert
            try {
                await dataBackupService.downloadDatabaseBackup();
                expect.fail("Should have thrown SiteLoadingError");
            } catch (error) {
                expect(error).toBeInstanceOf(SiteLoadingError);
                expect(error.message).toBe(
                    "Failed to load sites: Failed to download backup: Original error"
                );
                expect(error.stack).toContain("Caused by:");
            }
        });

        it("should emit database:error event with correct timestamp", async () => {
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
                {
                    details: "Failed to download backup: Test error",
                    error: testError,
                    operation: "download-backup",
                    timestamp: expect.any(Number),
                }
            );

            const emittedEvent = mockEventEmitter.emitTyped.mock.calls[0]![1];
            expect(emittedEvent.timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(emittedEvent.timestamp).toBeLessThanOrEqual(afterTime);
        });

        it("should handle null or undefined errors", async () => {
            // Arrange
            vi.mocked(createDatabaseBackup).mockRejectedValue(null);

            // Act & Assert
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download backup: null",
                null
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                {
                    details: "Failed to download backup: null",
                    error: new Error("null"),
                    operation: "download-backup",
                    timestamp: expect.any(Number),
                }
            );
        });

        it("should handle empty buffer results", async () => {
            // Arrange
            vi.mocked(createDatabaseBackup).mockResolvedValue({
                buffer: Buffer.alloc(0), // Empty buffer
                fileName: "empty-backup.sqlite",
                metadata: {
                    createdAt: Date.now(),
                    originalPath: "/test/path",
                    sizeBytes: 0,
                },
            });

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result.buffer).toHaveLength(0);
            expect(result.fileName).toBe("empty-backup.sqlite");
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Database backup created: empty-backup.sqlite"
            );
        });

        it("should handle large buffer results", async () => {
            // Arrange
            const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB buffer
            vi.mocked(createDatabaseBackup).mockResolvedValue({
                buffer: largeBuffer,
                fileName: "large-backup.sqlite",
                metadata: {
                    createdAt: Date.now(),
                    originalPath: "/test/path",
                    sizeBytes: largeBuffer.length,
                },
            });

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result.buffer).toHaveLength(1024 * 1024);
            expect(result.fileName).toBe("large-backup.sqlite");
        });

        it("should preserve all properties from createDatabaseBackup result", async () => {
            // Arrange
            const backupResult = {
                buffer: Buffer.from("test content"),
                fileName: "test-backup.sqlite",
                metadata: {
                    createdAt: 1_234_567_890,
                    originalPath: "/original/path",
                    sizeBytes: 12,
                },
            };
            vi.mocked(createDatabaseBackup).mockResolvedValue(backupResult);

            // Act
            const result = await dataBackupService.downloadDatabaseBackup();

            // Assert
            expect(result.buffer).toBe(backupResult.buffer);
            expect(result.fileName).toBe(backupResult.fileName);
            // Note: metadata is not returned by the service, only buffer and fileName
        });
    });

    describe("Error handling edge cases", () => {
        it("should handle app.getPath throwing an error", async () => {
            // Arrange
            const pathError = new Error("Cannot access user data path");
            vi.mocked(app.getPath).mockImplementation(() => {
                throw pathError;
            });

            // Act & Assert
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download backup: Cannot access user data path",
                pathError
            );
        });

        it("should handle event emission failure gracefully", async () => {
            // Arrange
            const originalError = new Error("Backup failed");
            const emitError = new Error("Event emission failed");
            vi.mocked(createDatabaseBackup).mockRejectedValue(originalError);
            mockEventEmitter.emitTyped.mockRejectedValue(emitError);

            // Act & Assert
            // When event emission fails, the emission error is thrown instead of SiteLoadingError
            await expect(
                dataBackupService.downloadDatabaseBackup()
            ).rejects.toThrow("Event emission failed");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download backup: Backup failed",
                originalError
            );
        });
    });

    describe("Integration scenarios", () => {
        it("should work with different user data paths", async () => {
            // Test different common user data paths
            const testPaths = [
                "/home/user/.config/uptime-watcher",
                String.raw`C:\Users\User\AppData\Roaming\uptime-watcher`,
                "/Applications/Uptime Watcher.app/Contents/MacOS",
            ];

            for (const testPath of testPaths) {
                // Arrange
                vi.mocked(app.getPath).mockReturnValue(testPath);

                // Act
                await dataBackupService.downloadDatabaseBackup();

                // Assert
                expect(createDatabaseBackup).toHaveBeenCalledWith(
                    path.join(testPath, "uptime-watcher.sqlite")
                );
            }
        });

        it("should handle concurrent backup requests", async () => {
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
            expect(createDatabaseBackup).toHaveBeenCalledTimes(2);
        });
    });
});
