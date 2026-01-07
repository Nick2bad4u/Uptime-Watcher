/**
 * Comprehensive tests for DataService
 *
 * @remarks
 * This test suite provides comprehensive coverage for the DataService including
 * initialization, data export/import, backup operations, error handling, and
 * edge cases to achieve 95%+ code coverage.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { DataService } from "../../services/DataService";
import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestorePayload,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";

const MOCK_BRIDGE_ERROR_MESSAGE =
    "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment.";

// Mock the bridge readiness helper to control initialization behavior
const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super(MOCK_BRIDGE_ERROR_MESSAGE);
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);

vi.mock("../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

// Mock the logger
const mockLogger = vi.hoisted(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
}));
vi.mock("../../services/logger", () => ({
    logger: mockLogger,
}));

// Mock ensureError & withUtilityErrorHandling from shared utils
const mockEnsureError = vi.hoisted(() => vi.fn((error) => error));
const mockWithUtilityErrorHandling = vi.hoisted(() =>
    vi.fn(
        <T>(
            operation: () => Promise<T>,
            _operationName: string,
            _fallbackValue?: T,
            _shouldThrow?: boolean
        ) => operation()
    )
);

vi.mock("../../../shared/utils/errorHandling", async () => {
    const actual = await vi.importActual<
        typeof import("../../../shared/utils/errorHandling")
    >("../../../shared/utils/errorHandling");

    return {
        ...actual,
        ensureError: mockEnsureError,
        withUtilityErrorHandling: mockWithUtilityErrorHandling,
    };
});

// Helper functions for creating mock data
function createMockBackupResult(): SerializedDatabaseBackupResult {
    const buffer = new ArrayBuffer(1024);
    return {
        buffer,
        fileName: "backup_2024-01-01_12-00-00.sqlite",
        metadata: {
            appVersion: "0.0.0-test",
            checksum: "mock-checksum",
            createdAt: 0,
            originalPath: "/tmp/backup.sqlite",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: 1024,
        },
    };
}

function createMockRestoreResult(): SerializedDatabaseRestoreResult {
    return {
        metadata: {
            appVersion: "0.0.0-test",
            checksum: "restore-checksum",
            createdAt: Date.now(),
            originalPath: "/tmp/restore.sqlite",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: 2048,
        },
        preRestoreFileName: "pre-restore.sqlite",
        restoredAt: Date.now(),
    };
}

function createMockRestorePayload(): SerializedDatabaseRestorePayload {
    return {
        buffer: new ArrayBuffer(2048),
        fileName: "restore.sqlite",
    };
}

function createMockSaveResult(
    overrides: Partial<SerializedDatabaseBackupSaveResult> = {}
): SerializedDatabaseBackupSaveResult {
    if ("canceled" in overrides && overrides.canceled === false) {
        return {
            canceled: false,
            fileName: "backup.sqlite",
            filePath: "/tmp/backup.sqlite",
            metadata: createMockBackupResult().metadata,
            ...overrides,
        } as SerializedDatabaseBackupSaveResult;
    }

    return {
        canceled: true,
        ...overrides,
    } as SerializedDatabaseBackupSaveResult;
}

function createMockDataApi() {
    return {
        downloadSqliteBackup: vi.fn(() =>
            Promise.resolve(createMockBackupResult())
        ),
        saveSqliteBackup: vi.fn(() =>
            Promise.resolve(createMockSaveResult())
        ),
        exportData: vi.fn(() =>
            Promise.resolve('{"sites":[],"monitors":[],"settings":{}}')
        ),
        importData: vi.fn(() => Promise.resolve(true)),
        restoreSqliteBackup: vi.fn(() =>
            Promise.resolve(createMockRestoreResult())
        ),
    };
}

describe("DataService", () => {
    let mockElectronAPI: { data: ReturnType<typeof createMockDataApi> };

    beforeEach(() => {
        vi.clearAllMocks();

        // Create fresh mock for each test
        mockElectronAPI = {
            data: createMockDataApi(),
        };

        // Set up global window.electronAPI mock
        (globalThis as any).window = {
            electronAPI: mockElectronAPI,
        };

        // Default successful initialization
        mockWaitForElectronBridge.mockReset();
        mockWaitForElectronBridge.mockImplementation(async () => {
            const bridge =
                (globalThis as any).window?.electronAPI ??
                (globalThis as any).electronAPI;

            if (!bridge) {
                throw new MockElectronBridgeNotReadyError({
                    attempts: 1,
                    reason: "ElectronAPI not available",
                });
            }
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
        delete (globalThis as any).window;
    });

    describe("Service Structure", () => {
        it("should expose all required methods", () => {
            const expectedMethods = [
                "downloadSqliteBackup",
                "saveSqliteBackup",
                "exportData",
                "importData",
                "restoreSqliteBackup",
                "initialize",
            ] as const;

            for (const method of expectedMethods) {
                expect(DataService).toHaveProperty(method);
                expect(typeof DataService[method]).toBe("function");
            }
        });
    });

    describe("initialize", () => {
        it("should initialize successfully when electron API is available", async () => {
            await expect(DataService.initialize()).resolves.toBeUndefined();

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it("should handle initialization errors and rethrow", async () => {
            const initializationError = new Error("Electron API not available");
            mockWaitForElectronBridge.mockRejectedValue(initializationError);

            await expect(DataService.initialize()).rejects.toThrowError(
                "Electron API not available"
            );

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockEnsureError).toHaveBeenCalledWith(initializationError);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[DataService] Failed to initialize:",
                initializationError
            );
        });

        it("should handle non-error initialization failures", async () => {
            const stringError = "String error message";
            mockWaitForElectronBridge.mockRejectedValue(stringError);

            await expect(DataService.initialize()).rejects.toBe(stringError);

            expect(mockEnsureError).toHaveBeenCalledWith(stringError);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it("should handle null/undefined initialization errors", async () => {
            const nullError = null;
            mockWaitForElectronBridge.mockRejectedValue(nullError);

            await expect(DataService.initialize()).rejects.toBe(nullError);

            expect(mockEnsureError).toHaveBeenCalledWith(nullError);
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe("downloadSqliteBackup", () => {
        it("should download backup successfully after initialization", async () => {
            const mockBackup = createMockBackupResult();
            mockElectronAPI.data.downloadSqliteBackup.mockResolvedValue(
                mockBackup
            );

            const result = await DataService.downloadSqliteBackup();

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.data.downloadSqliteBackup
            ).toHaveBeenCalled();
            expect(result).toEqual(mockBackup);
            expect(result.buffer).toBeInstanceOf(ArrayBuffer);
            expect(typeof result.fileName).toBe("string");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);

            await expect(
                DataService.downloadSqliteBackup()
            ).rejects.toThrowError("Init failed");

            expect(
                mockElectronAPI.data.downloadSqliteBackup
            ).not.toHaveBeenCalled();
        });

        it("should handle backup download errors", async () => {
            const backupError = new Error("Backup failed");
            mockElectronAPI.data.downloadSqliteBackup.mockRejectedValue(
                backupError
            );

            await expect(
                DataService.downloadSqliteBackup()
            ).rejects.toThrowError("Backup failed");

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.data.downloadSqliteBackup
            ).toHaveBeenCalled();
        });

        it("should handle different backup response formats", async () => {
            const emptyBuffer = new ArrayBuffer(0);
            mockElectronAPI.data.downloadSqliteBackup.mockResolvedValue({
                buffer: emptyBuffer,
                fileName: "empty.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: 0,
                    originalPath: "/tmp/empty.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 0,
                },
            });

            const result = await DataService.downloadSqliteBackup();

            expect(result.buffer).toBe(emptyBuffer);
            expect(result.fileName).toBe("empty.sqlite");
        });
    });

    describe("restoreSqliteBackup", () => {
        it("should restore backup successfully after initialization", async () => {
            const payload = createMockRestorePayload();
            const summary = createMockRestoreResult();
            mockElectronAPI.data.restoreSqliteBackup.mockResolvedValue(summary);

            const result = await DataService.restoreSqliteBackup(payload);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.data.restoreSqliteBackup
            ).toHaveBeenCalledWith(payload);
            expect(result).toEqual(summary);
        });

        it("should surface errors when initialization fails", async () => {
            const initError = new Error("Bridge init failed");
            mockWaitForElectronBridge.mockRejectedValueOnce(initError);

            await expect(
                DataService.restoreSqliteBackup(createMockRestorePayload())
            ).rejects.toThrowError("Bridge init failed");
        });

        it("should normalize backend errors via ensureError", async () => {
            const backendError = "Backend restore failed";
            mockElectronAPI.data.restoreSqliteBackup.mockRejectedValueOnce(
                backendError
            );

            await expect(
                DataService.restoreSqliteBackup(createMockRestorePayload())
            ).rejects.toBe(backendError);

            expect(mockEnsureError).toHaveBeenCalledWith(backendError);
        });
    });

    describe("exportData", () => {
        it("should export data successfully after initialization", async () => {
            const mockExportData =
                '{"sites":[{"id":"1","name":"Test Site"}],"monitors":[],"settings":{"theme":"dark"}}';
            mockElectronAPI.data.exportData.mockResolvedValue(mockExportData);

            const result = await DataService.exportData();

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.data.exportData).toHaveBeenCalled();
            expect(result).toBe(mockExportData);
            expect(typeof result).toBe("string");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);

            await expect(DataService.exportData()).rejects.toThrowError(
                "Init failed"
            );

            expect(mockElectronAPI.data.exportData).not.toHaveBeenCalled();
        });

        it("should handle export errors", async () => {
            const exportError = new Error("Export failed");
            mockElectronAPI.data.exportData.mockRejectedValue(exportError);

            await expect(DataService.exportData()).rejects.toThrowError(
                "Export failed"
            );

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.data.exportData).toHaveBeenCalled();
        });

        it("should handle empty export data", async () => {
            const emptyData = "{}";
            mockElectronAPI.data.exportData.mockResolvedValue(emptyData);

            const result = await DataService.exportData();

            expect(result).toBe(emptyData);
        });

        it("should handle large export data", async () => {
            const largeData = JSON.stringify({
                sites: Array.from({ length: 1000 }, (_, i) => ({
                    id: i,
                    name: `Site ${i}`,
                })),
                monitors: Array.from({ length: 5000 }, (_, i) => ({
                    id: i,
                    siteIdentifier: i % 1000,
                })),
                settings: {
                    theme: "dark",
                    systemNotificationsEnabled: true,
                    systemNotificationsSoundEnabled: false,
                },
            });
            mockElectronAPI.data.exportData.mockResolvedValue(largeData);

            const result = await DataService.exportData();

            expect(result).toBe(largeData);
            expect(result.length).toBeGreaterThan(10_000);
        });

        it("throws TypeError when backend returns non-string payload", async () => {
            mockElectronAPI.data.exportData.mockResolvedValueOnce(
                123 as unknown as string
            );

            await expect(DataService.exportData()).rejects.toThrowError(
                "Export data payload must be a string"
            );
        });
    });

    describe("importData", () => {
        it("should import data successfully after initialization", async () => {
            const importData =
                '{"sites":[{"id":"1","name":"Imported Site"}],"monitors":[]}';
            mockElectronAPI.data.importData.mockResolvedValue(true);

            const result = await DataService.importData(importData);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.data.importData).toHaveBeenCalledWith(
                importData
            );
            expect(result).toBeTruthy();
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const importData = '{"sites":[]}';

            await expect(
                DataService.importData(importData)
            ).rejects.toThrowError("Init failed");

            expect(mockElectronAPI.data.importData).not.toHaveBeenCalled();
        });

        it("should handle import errors", async () => {
            const importError = new Error("Import failed");
            mockElectronAPI.data.importData.mockRejectedValue(importError);
            const importData = '{"sites":[]}';

            await expect(
                DataService.importData(importData)
            ).rejects.toThrowError("Import failed");

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.data.importData).toHaveBeenCalledWith(
                importData
            );
        });

        it("should return false when backend signals failure", async () => {
            const emptyData = "";
            mockElectronAPI.data.importData.mockResolvedValue(false);

            const result = await DataService.importData(emptyData);

            expect(mockElectronAPI.data.importData).toHaveBeenCalledWith(
                emptyData
            );
            expect(result).toBeFalsy();
        });

        it("should propagate backend failure for invalid JSON", async () => {
            const invalidJson = '{"sites": [invalid json}';
            mockElectronAPI.data.importData.mockResolvedValue(false);

            const result = await DataService.importData(invalidJson);

            expect(mockElectronAPI.data.importData).toHaveBeenCalledWith(
                invalidJson
            );
            expect(result).toBeFalsy();
        });

        it("should handle various import data formats", async () => {
            const complexData = JSON.stringify({
                sites: [
                    { id: "1", name: "Site 1", url: "https://example.com" },
                    { id: "2", name: "Site 2", url: "https://test.com" },
                ],
                monitors: [
                    {
                        id: "1",
                        siteIdentifier: "1",
                        type: "http",
                        interval: 300,
                    },
                    {
                        id: "2",
                        siteIdentifier: "2",
                        type: "ping",
                        interval: 60,
                    },
                ],
                settings: {
                    theme: "light",
                    inAppAlertsEnabled: true,
                    inAppAlertsSoundEnabled: false,
                    systemNotificationsEnabled: true,
                    systemNotificationsSoundEnabled: false,
                },
            });
            mockElectronAPI.data.importData.mockResolvedValue(true);

            const result = await DataService.importData(complexData);

            expect(mockElectronAPI.data.importData).toHaveBeenCalledWith(
                complexData
            );
            expect(result).toBeTruthy();
        });

        it("throws TypeError when backend returns non-boolean result", async () => {
            mockElectronAPI.data.importData.mockResolvedValueOnce(
                "yes" as unknown as boolean
            );

            await expect(DataService.importData("{}")).rejects.toThrowError(
                "Import data response must be a boolean"
            );
        });
    });

    describe("Integration Testing", () => {
        it("should handle multiple operations in sequence", async () => {
            const exportData = '{"sites":[],"monitors":[]}';
            const importResult = true;
            const backupResult = createMockBackupResult();

            mockElectronAPI.data.exportData.mockResolvedValue(exportData);
            mockElectronAPI.data.importData.mockResolvedValue(importResult);
            mockElectronAPI.data.downloadSqliteBackup.mockResolvedValue(
                backupResult
            );

            // Perform multiple operations
            const exported = await DataService.exportData();
            const imported = await DataService.importData(exported);
            const backup = await DataService.downloadSqliteBackup();

            expect(exported).toBe(exportData);
            expect(imported).toBe(importResult);
            expect(backup).toEqual(backupResult);

            // Should only initialize once due to shared initialization
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(3);
        });

        it("should handle concurrent operations", async () => {
            const exportData = '{"sites":[],"monitors":[]}';
            const importResult = true;
            const backupResult = createMockBackupResult();

            mockElectronAPI.data.exportData.mockResolvedValue(exportData);
            mockElectronAPI.data.importData.mockResolvedValue(importResult);
            mockElectronAPI.data.downloadSqliteBackup.mockResolvedValue(
                backupResult
            );

            // Perform concurrent operations
            const [
                exported,
                imported,
                backup,
            ] = await Promise.all([
                DataService.exportData(),
                DataService.importData('{"test": true}'),
                DataService.downloadSqliteBackup(),
            ]);

            expect(exported).toBe(exportData);
            expect(imported).toBe(importResult);
            expect(backup).toEqual(backupResult);
        });

        it("should handle repeated initialization calls gracefully", async () => {
            // Multiple initialize calls should all succeed
            await Promise.all([
                DataService.initialize(),
                DataService.initialize(),
                DataService.initialize(),
            ]);

            // Concurrent calls share the same in-flight initialization.
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
        });
    });

    describe("Error Edge Cases", () => {
        it("should handle electron API method throwing synchronously", async () => {
            mockElectronAPI.data.exportData.mockImplementation(() => {
                throw new Error("Synchronous error");
            });

            await expect(DataService.exportData()).rejects.toThrowError(
                "Synchronous error"
            );
        });

        it("should handle missing electron API gracefully", async () => {
            // Remove the electronAPI
            delete (globalThis as any).window.electronAPI;

            await expect(DataService.exportData()).rejects.toThrowError();
        });

        it("should handle partial electron API gracefully", async () => {
            // Remove specific method
            delete (globalThis as any).window.electronAPI.data.exportData;

            await expect(DataService.exportData()).rejects.toThrowError();
        });

        it("should handle network-like errors in backup operations", async () => {
            const networkError = new Error("ECONNRESET");
            (networkError as any).code = "ECONNRESET";
            mockElectronAPI.data.downloadSqliteBackup.mockRejectedValue(
                networkError
            );

            await expect(
                DataService.downloadSqliteBackup()
            ).rejects.toThrowError("ECONNRESET");
        });

        it("should handle file system errors in import operations", async () => {
            const fsError = new Error("ENOSPC: no space left on device");
            (fsError as any).code = "ENOSPC";
            mockElectronAPI.data.importData.mockRejectedValue(fsError);

            await expect(
                DataService.importData('{"data":"test"}')
            ).rejects.toThrowError("ENOSPC");
        });
    });

    describe("Data Validation Edge Cases", () => {
        it("should reject extremely large backup files", async () => {
            const largeBuffer = new ArrayBuffer(50 * 1024 * 1024); // 50MB
            const largeBackup = {
                buffer: largeBuffer,
                fileName: "large_backup.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: 0,
                    originalPath: "/tmp/large_backup.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 50 * 1024 * 1024,
                },
            };
            mockElectronAPI.data.downloadSqliteBackup.mockResolvedValue(
                largeBackup
            );

            await expect(
                DataService.downloadSqliteBackup()
            ).rejects.toThrowError(/exceeds maximum ipc transfer size/i);
        });

        it("should handle unicode characters in export/import", async () => {
            const unicodeData = JSON.stringify({
                sites: [
                    { name: "测试网站", url: "https://测试.com" },
                    { name: "тестовый сайт", url: "https://тест.рф" },
                    { name: "🚀 Rocket Site", url: "https://rocket.space" },
                ],
            });

            mockElectronAPI.data.exportData.mockResolvedValue(unicodeData);
            mockElectronAPI.data.importData.mockResolvedValue(true);

            const exported = await DataService.exportData();
            const imported = await DataService.importData(unicodeData);

            expect(exported).toBe(unicodeData);
            expect(imported).toBeTruthy();
        });

        it("should handle special filename characters in backup", async () => {
            const specialBackup = {
                buffer: new ArrayBuffer(1024),
                fileName: "backup (copy) #1 [2024-01-01] @12-00-00.sqlite",
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "mock-checksum",
                    createdAt: 0,
                    originalPath: "/tmp/backup-special.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 1024,
                },
            };
            mockElectronAPI.data.downloadSqliteBackup.mockResolvedValue(
                specialBackup
            );

            const result = await DataService.downloadSqliteBackup();

            expect(result.fileName).toBe(
                "backup (copy) #1 [2024-01-01] @12-00-00.sqlite"
            );
        });
    });
});
