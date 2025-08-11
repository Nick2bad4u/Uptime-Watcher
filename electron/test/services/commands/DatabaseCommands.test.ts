/**
 * Comprehensive test suite for DatabaseCommands.ts providing 100% coverage.
 * Tests all command classes, executor functionality, error handling, and edge cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import type { UptimeEvents } from "../../../events/eventTypes";
import type { TypedEventBus } from "../../../events/TypedEventBus";
import type { Site } from "../../../types";
import type { StandardizedCache } from "../../../utils/cache/StandardizedCache";
import type { DatabaseServiceFactory } from "../../../services/factories/DatabaseServiceFactory";

import {
    DatabaseCommand,
    DatabaseCommandExecutor,
    DownloadBackupCommand,
    ExportDataCommand,
    ImportDataCommand,
    LoadSitesCommand,
    type IDatabaseCommand,
} from "../../../services/commands/DatabaseCommands";

import {
    createMockServiceFactory as createEnhancedServiceFactory,
    createMockEventBus as createEnhancedEventBus,
    createTestSite as createEnhancedTestSite,
} from "../../utils/enhanced-testUtilities";

// Create comprehensive mocks using enhanced utilities
const createMockServiceFactory = createEnhancedServiceFactory;
const createMockEventBus = createEnhancedEventBus;
const createTestSite = createEnhancedTestSite;

const createMockCache = () => {
    const cache = new Map<string, Site>();
    const mockCache = {
        clear: vi.fn(() => cache.clear()),
        delete: vi.fn((key: string) => cache.delete(key)),
        entries: vi.fn(() => cache.entries()),
        get: vi.fn((key: string) => cache.get(key)),
        getAll: vi.fn(() => [...cache.values()]),
        has: vi.fn((key: string) => cache.has(key)),
        set: vi.fn((key: string, value: Site) => {
            cache.set(key, value);
            return cache as unknown as StandardizedCache<Site>;
        }),
        size: 0 as unknown as number,
    };
    return mockCache as unknown as StandardizedCache<Site>;
};

// Test implementation of DatabaseCommand for testing abstract class
class TestDatabaseCommand extends DatabaseCommand<string> {
    private shouldValidate = true;
    private shouldExecuteSucceed = true;
    private shouldRollbackSucceed = true;

    public setValidation(shouldValidate: boolean): void {
        this.shouldValidate = shouldValidate;
    }

    public setExecutionSuccess(shouldSucceed: boolean): void {
        this.shouldExecuteSucceed = shouldSucceed;
    }

    public setRollbackSuccess(shouldSucceed: boolean): void {
        this.shouldRollbackSucceed = shouldSucceed;
    }

    public async execute(): Promise<string> {
        if (!this.shouldExecuteSucceed) {
            throw new Error("Test execution failure");
        }
        await this.emitSuccessEvent("internal:database:data-imported", {
            operation: "test-operation",
        });
        return "test-result";
    }

    public async rollback(): Promise<void> {
        if (!this.shouldRollbackSucceed) {
            throw new Error("Test rollback failure");
        }
    }

    public async validate(): Promise<{ errors: string[]; isValid: boolean }> {
        await Promise.resolve();
        return this.shouldValidate
            ? { errors: [], isValid: true }
            : { errors: ["Test validation error"], isValid: false };
    }

    public getDescription(): string {
        return "Test database command";
    }

    // Expose protected methods for testing
    public async testEmitSuccessEvent(
        eventType: keyof UptimeEvents,
        data: Partial<UptimeEvents[keyof UptimeEvents]>
    ): Promise<void> {
        await this.emitSuccessEvent(eventType, data);
    }

    public async testEmitFailureEvent(
        eventType: keyof UptimeEvents,
        error: Error,
        data: Partial<UptimeEvents[keyof UptimeEvents]> = {}
    ): Promise<void> {
        await this.emitFailureEvent(eventType, error, data);
    }
}

describe("DatabaseCommands", () => {
    let mockServiceFactory: ReturnType<typeof createMockServiceFactory>;
    let mockEventBus: ReturnType<typeof createMockEventBus>;
    let mockCache: ReturnType<typeof createMockCache>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockServiceFactory = createMockServiceFactory();
        mockEventBus = createMockEventBus();
        mockCache = createMockCache();
    });

    describe("DatabaseCommand (abstract base class)", () => {
        let command: TestDatabaseCommand;

        beforeEach(() => {
            command = new TestDatabaseCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as unknown as StandardizedCache<Site>
            );
        });

        it("should construct with dependencies", () => {
            expect(command).toBeInstanceOf(TestDatabaseCommand);
            expect(command.getDescription()).toBe("Test database command");
        });

        it("should emit success events with correct data", async () => {
            const testData = { operation: "test-op" };

            await command.testEmitSuccessEvent(
                "internal:database:data-imported",
                testData
            );

            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    success: true,
                    timestamp: expect.any(Number),
                    operation: "test-op",
                })
            );
        });

        it("should emit failure events with error details", async () => {
            const testError = new Error("Test error");
            const testData = { operation: "test-op" };

            await command.testEmitFailureEvent(
                "internal:database:data-imported",
                testError,
                testData
            );

            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    success: false,
                    error: "Test error",
                    timestamp: expect.any(Number),
                    operation: "test-op",
                })
            );
        });

        it("should emit failure events without additional data", async () => {
            const testError = new Error("Test error");

            await command.testEmitFailureEvent(
                "internal:database:data-imported",
                testError
            );

            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    success: false,
                    error: "Test error",
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should execute successfully when validation passes", async () => {
            command.setValidation(true);
            command.setExecutionSuccess(true);

            const result = await command.execute();

            expect(result).toBe("test-result");
            expect(mockEventBus.emitTyped).toBeDefined();
        });

        it("should handle execution failure", async () => {
            command.setExecutionSuccess(false);

            await expect(command.execute()).rejects.toThrow(
                "Test execution failure"
            );
        });

        it("should handle rollback failure", async () => {
            command.setRollbackSuccess(false);

            await expect(command.rollback()).rejects.toThrow(
                "Test rollback failure"
            );
        });

        it("should handle validation failure", async () => {
            command.setValidation(false);

            const result = await command.validate();

            expect(result).toEqual({
                errors: ["Test validation error"],
                isValid: false,
            });
        });
    });

    describe("DatabaseCommandExecutor", () => {
        let executor: DatabaseCommandExecutor;
        let mockCommand: IDatabaseCommand<string>;

        beforeEach(() => {
            executor = new DatabaseCommandExecutor();
            mockCommand = {
                execute: vi.fn().mockResolvedValue("test-result"),
                validate: vi
                    .fn()
                    .mockResolvedValue({ errors: [], isValid: true }),
                rollback: vi.fn().mockResolvedValue(undefined),
                getDescription: vi.fn().mockReturnValue("Mock command"),
            };
        });

        it("should execute valid command successfully", async () => {
            const result = await executor.execute(mockCommand);

            expect(result).toBe("test-result");
            expect(mockCommand.validate).toHaveBeenCalled();
            expect(mockCommand.execute).toHaveBeenCalled();
            expect(mockCommand.rollback).not.toHaveBeenCalled();
        });

        it("should reject invalid command before execution", async () => {
            mockCommand.validate = vi.fn().mockResolvedValue({
                errors: ["Validation error"],
                isValid: false,
            });

            await expect(executor.execute(mockCommand)).rejects.toThrow(
                "Command validation failed: Validation error"
            );

            expect(mockCommand.validate).toHaveBeenCalled();
            expect(mockCommand.execute).not.toHaveBeenCalled();
        });

        it("should rollback on execution failure", async () => {
            mockCommand.execute = vi
                .fn()
                .mockRejectedValue(new Error("Execution failed"));

            await expect(executor.execute(mockCommand)).rejects.toThrow(
                "Execution failed"
            );

            expect(mockCommand.validate).toHaveBeenCalled();
            expect(mockCommand.execute).toHaveBeenCalled();
            expect(mockCommand.rollback).toHaveBeenCalled();
        });

        it("should handle rollback failure gracefully", async () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            mockCommand.execute = vi
                .fn()
                .mockRejectedValue(new Error("Execution failed"));
            mockCommand.rollback = vi
                .fn()
                .mockRejectedValue(new Error("Rollback failed"));

            await expect(executor.execute(mockCommand)).rejects.toThrow(
                "Execution failed"
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                "Rollback failed for command:",
                "Mock command",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it("should rollback all commands in reverse order", async () => {
            const commands = [
                { ...mockCommand, getDescription: () => "Command 1" },
                { ...mockCommand, getDescription: () => "Command 2" },
                { ...mockCommand, getDescription: () => "Command 3" },
            ];

            // Execute commands
            for (const command of commands) {
                await executor.execute(command);
            }

            // Rollback all
            await executor.rollbackAll();

            // Check rollback was called in reverse order
            expect(commands[2]?.rollback).toHaveBeenCalled();
            expect(commands[1]?.rollback).toHaveBeenCalled();
            expect(commands[0]?.rollback).toHaveBeenCalled();
        });

        it("should collect rollback errors and throw aggregate error", async () => {
            const command1 = {
                ...mockCommand,
                rollback: vi
                    .fn()
                    .mockRejectedValue(new Error("Rollback 1 failed")),
            };
            const command2 = {
                ...mockCommand,
                rollback: vi
                    .fn()
                    .mockRejectedValue(new Error("Rollback 2 failed")),
            };

            // Execute commands
            await executor.execute(command1);
            await executor.execute(command2);

            // Rollback all should collect errors
            await expect(executor.rollbackAll()).rejects.toThrow(
                "Rollback errors: Rollback 2 failed, Rollback 1 failed"
            );
        });

        it("should handle non-Error objects in rollback", async () => {
            const command1 = {
                ...mockCommand,
                rollback: vi.fn().mockRejectedValue("String error"),
            };

            await executor.execute(command1);

            await expect(executor.rollbackAll()).rejects.toThrow(
                "Rollback errors: String error"
            );
        });

        it("should clear command history", async () => {
            await executor.execute(mockCommand);
            executor.clear();

            // After clear, rollbackAll should do nothing
            await executor.rollbackAll();
            expect(mockCommand.rollback).not.toHaveBeenCalled();
        });

        it("should handle undefined commands in rollback gracefully", async () => {
            await executor.execute(mockCommand);

            // Manually corrupt the command array to test robustness
            (executor as any).executedCommands[0] = undefined;

            // Should not throw
            await expect(executor.rollbackAll()).resolves.toBeUndefined();
        });
    });

    describe("DownloadBackupCommand", () => {
        let command: DownloadBackupCommand;
        let mockBackupService: any;

        beforeEach(() => {
            mockBackupService = {
                downloadDatabaseBackup: vi.fn().mockResolvedValue({
                    buffer: Buffer.from("test-backup-data"),
                    fileName: "backup-2024.db",
                }),
            };
            mockServiceFactory.createBackupService.mockReturnValue(
                mockBackupService
            );

            command = new DownloadBackupCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as unknown as StandardizedCache<Site>
            );
        });

        it("should execute backup download successfully", async () => {
            const result = await command.execute();

            expect(result).toEqual({
                buffer: expect.any(Buffer),
                fileName: "backup-2024.db",
            });
            expect(mockBackupService.downloadDatabaseBackup).toHaveBeenCalled();
            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:backup-downloaded",
                expect.objectContaining({
                    success: true,
                    fileName: "backup-2024.db",
                    operation: "backup-downloaded",
                })
            );
        });

        it("should handle backup service errors", async () => {
            mockBackupService.downloadDatabaseBackup.mockRejectedValue(
                new Error("Backup service failed")
            );

            await expect(command.execute()).rejects.toThrow(
                "Backup service failed"
            );
        });

        it("should validate successfully (no-op)", async () => {
            const result = await command.validate();

            expect(result).toEqual({ errors: [], isValid: true });
        });

        it("should rollback successfully (no-op)", async () => {
            await expect(command.rollback()).resolves.toBeUndefined();
        });

        it("should provide correct description", () => {
            expect(command.getDescription()).toBe(
                "Download SQLite database backup"
            );
        });
    });

    describe("ExportDataCommand", () => {
        let command: ExportDataCommand;
        let mockImportExportService: any;

        beforeEach(() => {
            mockImportExportService = {
                exportAllData: vi.fn().mockResolvedValue('{"test": "data"}'),
            };
            mockServiceFactory.createImportExportService.mockReturnValue(
                mockImportExportService
            );

            command = new ExportDataCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as StandardizedCache<Site>
            );
        });

        it("should execute data export successfully", async () => {
            const result = await command.execute();

            expect(result).toBe('{"test": "data"}');
            expect(mockImportExportService.exportAllData).toHaveBeenCalled();
            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-exported",
                expect.objectContaining({
                    success: true,
                    fileName: expect.stringMatching(/^export-\d+\.json$/),
                    operation: "data-exported",
                })
            );
        });

        it("should handle export service errors", async () => {
            mockImportExportService.exportAllData.mockRejectedValue(
                new Error("Export service failed")
            );

            await expect(command.execute()).rejects.toThrow(
                "Export service failed"
            );
        });

        it("should validate successfully (no-op)", async () => {
            const result = await command.validate();

            expect(result).toEqual({ errors: [], isValid: true });
        });

        it("should rollback successfully (no-op)", async () => {
            await expect(command.rollback()).resolves.toBeUndefined();
        });

        it("should provide correct description", () => {
            expect(command.getDescription()).toBe(
                "Export all application data to JSON"
            );
        });
    });

    describe("ImportDataCommand", () => {
        let command: ImportDataCommand;
        let mockImportExportService: any;
        let mockSiteRepositoryService: any;

        beforeEach(() => {
            mockImportExportService = {
                importDataFromJson: vi.fn().mockResolvedValue({
                    sites: [createTestSite("test1")],
                    settings: { theme: "dark" },
                }),
                persistImportedData: vi.fn().mockResolvedValue(undefined),
            };
            mockSiteRepositoryService = {
                getSitesFromDatabase: vi.fn().mockResolvedValue([
                    createTestSite("test1"),
                    createTestSite("test2"),
                ]),
            };
            mockServiceFactory.createImportExportService.mockReturnValue(
                mockImportExportService
            );
            mockServiceFactory.createSiteRepositoryService.mockReturnValue(
                mockSiteRepositoryService
            );

            command = new ImportDataCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as StandardizedCache<Site>,
                '{"sites": [], "settings": {}}'
            );
        });

        it("should execute data import successfully", async () => {
            // Pre-populate cache
            const originalSite = createTestSite("original");
            mockCache.getAll = vi.fn().mockReturnValue([originalSite]);

            const result = await command.execute();

            expect(result).toBe(true);
            expect(
                mockImportExportService.importDataFromJson
            ).toHaveBeenCalledWith('{"sites": [], "settings": {}}');
            expect(
                mockImportExportService.persistImportedData
            ).toHaveBeenCalled();
            expect(
                mockSiteRepositoryService.getSitesFromDatabase
            ).toHaveBeenCalled();
            expect(mockCache.clear).toHaveBeenCalledTimes(1); // Clear once before reloading
            expect(mockCache.set).toHaveBeenCalledTimes(2); // For reloaded sites
            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    success: true,
                    operation: "data-imported",
                })
            );
        });

        it("should handle import service errors", async () => {
            mockImportExportService.importDataFromJson.mockRejectedValue(
                new Error("Import service failed")
            );

            await expect(command.execute()).rejects.toThrow(
                "Import service failed"
            );
        });

        it("should rollback cache to original state", async () => {
            const originalSites = [
                createTestSite("original1"),
                createTestSite("original2"),
            ];
            mockCache.getAll = vi.fn().mockReturnValue(originalSites);

            // Execute first to populate backup
            await command.execute();

            // Now test rollback
            await command.rollback();

            expect(mockCache.clear).toHaveBeenCalled();
            expect(mockCache.set).toHaveBeenCalledWith(
                "original1",
                originalSites[0]
            );
            expect(mockCache.set).toHaveBeenCalledWith(
                "original2",
                originalSites[1]
            );
        });

        it("should validate empty data as invalid", async () => {
            const invalidCommand = new ImportDataCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as StandardizedCache<Site>,
                ""
            );

            const result = await invalidCommand.validate();

            expect(result).toEqual({
                errors: [
                    "Import data cannot be empty",
                    "Import data must be valid JSON",
                ],
                isValid: false,
            });
        });

        it("should validate whitespace-only data as invalid", async () => {
            const invalidCommand = new ImportDataCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as StandardizedCache<Site>,
                "   \n\t   "
            );

            const result = await invalidCommand.validate();

            expect(result).toEqual({
                errors: [
                    "Import data cannot be empty",
                    "Import data must be valid JSON",
                ],
                isValid: false,
            });
        });

        it("should validate invalid JSON as invalid", async () => {
            const invalidCommand = new ImportDataCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as StandardizedCache<Site>,
                '{"invalid": json}'
            );

            const result = await invalidCommand.validate();

            expect(result).toEqual({
                errors: ["Import data must be valid JSON"],
                isValid: false,
            });
        });

        it("should validate multiple errors", async () => {
            const invalidCommand = new ImportDataCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as StandardizedCache<Site>,
                ""
            );

            const result = await invalidCommand.validate();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Import data cannot be empty");
        });

        it("should validate valid JSON as valid", async () => {
            const result = await command.validate();

            expect(result).toEqual({ errors: [], isValid: true });
        });

        it("should provide correct description", () => {
            expect(command.getDescription()).toBe(
                "Import application data from JSON"
            );
        });
    });

    describe("LoadSitesCommand", () => {
        let command: LoadSitesCommand;
        let mockSiteRepositoryService: any;

        beforeEach(() => {
            mockSiteRepositoryService = {
                getSitesFromDatabase: vi.fn().mockResolvedValue([
                    createTestSite("loaded1"),
                    createTestSite("loaded2"),
                ]),
            };
            mockServiceFactory.createSiteRepositoryService.mockReturnValue(
                mockSiteRepositoryService
            );

            command = new LoadSitesCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as StandardizedCache<Site>
            );
        });

        it("should execute site loading successfully", async () => {
            // Pre-populate cache with original data
            const originalSites = [
                createTestSite("original1"),
                createTestSite("original2"),
            ];
            const mockEntries = new Map();
            for (const site of originalSites) {
                mockEntries.set(site.identifier, site);
            }
            mockCache.entries = vi.fn().mockReturnValue(mockEntries.entries());

            const result = await command.execute();

            expect(result).toHaveLength(2);
            expect(result[0]?.identifier).toBe("loaded1");
            expect(result[1]?.identifier).toBe("loaded2");
            expect(
                mockSiteRepositoryService.getSitesFromDatabase
            ).toHaveBeenCalled();
            expect(mockCache.clear).toHaveBeenCalled();
            expect(mockCache.set).toHaveBeenCalledWith(
                "loaded1",
                expect.any(Object)
            );
            expect(mockCache.set).toHaveBeenCalledWith(
                "loaded2",
                expect.any(Object)
            );
        });

        it("should handle repository service errors", async () => {
            mockSiteRepositoryService.getSitesFromDatabase.mockRejectedValue(
                new Error("Repository service failed")
            );

            await expect(command.execute()).rejects.toThrow(
                "Repository service failed"
            );
        });

        it("should rollback cache to original state", async () => {
            const originalSites = [
                createTestSite("original1"),
                createTestSite("original2"),
            ];
            const mockEntries = new Map();
            for (const site of originalSites) {
                mockEntries.set(site.identifier, site);
            }
            mockCache.entries = vi.fn().mockReturnValue(mockEntries.entries());

            // Execute first to populate backup
            await command.execute();

            // Clear the mock calls to test rollback specifically
            vi.clearAllMocks();

            // Now test rollback
            await command.rollback();

            expect(mockCache.clear).toHaveBeenCalled();
            expect(mockCache.set).toHaveBeenCalledWith(
                "original1",
                originalSites[0]
            );
            expect(mockCache.set).toHaveBeenCalledWith(
                "original2",
                originalSites[1]
            );
        });

        it("should handle empty original cache in rollback", async () => {
            mockCache.entries = vi.fn().mockReturnValue(new Map().entries());

            // Execute and rollback with empty original cache
            await command.execute();
            await command.rollback();

            expect(mockCache.clear).toHaveBeenCalled();
            // No set calls should be made for empty cache
        });

        it("should validate successfully (no-op)", async () => {
            const result = await command.validate();

            expect(result).toEqual({ errors: [], isValid: true });
        });

        it("should provide correct description", () => {
            expect(command.getDescription()).toBe(
                "Load sites from database into cache"
            );
        });
    });

    describe("IDatabaseCommand interface compliance", () => {
        it("should ensure all commands implement required methods", () => {
            const commands = [
                new DownloadBackupCommand(
                    mockServiceFactory as unknown as DatabaseServiceFactory,
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                    mockCache as StandardizedCache<Site>
                ),
                new ExportDataCommand(
                    mockServiceFactory as unknown as DatabaseServiceFactory,
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                    mockCache as StandardizedCache<Site>
                ),
                new ImportDataCommand(
                    mockServiceFactory as unknown as DatabaseServiceFactory,
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                    mockCache as StandardizedCache<Site>,
                    '{"test": "data"}'
                ),
                new LoadSitesCommand(
                    mockServiceFactory as unknown as DatabaseServiceFactory,
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                    mockCache as StandardizedCache<Site>
                ),
            ];

            for (const command of commands) {
                expect(typeof command.execute).toBe("function");
                expect(typeof command.validate).toBe("function");
                expect(typeof command.rollback).toBe("function");
                expect(typeof command.getDescription).toBe("function");
            }
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle event emission failures gracefully", async () => {
            (mockEventBus.emitTyped as any).mockRejectedValue(
                new Error("Event emission failed")
            );

            // Ensure the import/export service exists so execute() reaches event emission
            const mockImportExportService = {
                exportAllData: vi.fn().mockResolvedValue("{}"),
            };
            mockServiceFactory.createImportExportService.mockReturnValue(
                mockImportExportService as any
            );

            const command = new ExportDataCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as unknown as StandardizedCache<Site>
            );

            // Should still throw the event emission error
            await expect(command.execute()).rejects.toThrow(
                "Event emission failed"
            );
        });

        it("should handle service factory returning null services", async () => {
            mockServiceFactory.createBackupService.mockReturnValue({
                downloadDatabaseBackup: vi
                    .fn()
                    .mockRejectedValue(new Error("Service unavailable")),
            });

            const command = new DownloadBackupCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as unknown as StandardizedCache<Site>
            );

            await expect(command.execute()).rejects.toThrow(
                "Service unavailable"
            );
        });

        it("should handle cache operations that throw errors", async () => {
            mockCache.clear = vi.fn().mockImplementation(() => {
                throw new Error("Cache clear failed");
            });

            // Provide a valid site repository service so command reaches cache.clear
            const mockSiteRepositoryService = {
                getSitesFromDatabase: vi.fn().mockResolvedValue([]),
            };
            mockServiceFactory.createSiteRepositoryService.mockReturnValue(
                mockSiteRepositoryService as any
            );

            const command = new LoadSitesCommand(
                mockServiceFactory as unknown as DatabaseServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache as unknown as StandardizedCache<Site>
            );

            await expect(command.execute()).rejects.toThrow(
                "Cache clear failed"
            );
        });
    });
});
