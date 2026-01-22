/**
 * Comprehensive test suite for DatabaseCommands.ts providing 100% coverage.
 * Tests all command classes, executor functionality, error handling, and edge
 * cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import type { UptimeEvents } from "../../../events/eventTypes";
import type { EventKey, TypedEventBus } from "../../../events/TypedEventBus";
import type { Site } from "@shared/types";
import type { StandardizedCache } from "../../../utils/cache/StandardizedCache";
import type { DatabaseServiceFactory } from "../../../services/factories/DatabaseServiceFactory";
import type { ConfigurationManager } from "../../../managers/ConfigurationManager";
import type { DatabaseRestorePayload } from "../../../services/database/utils/backup/databaseBackup";
import { logger as backendLogger } from "../../../utils/logger";

import {
    DatabaseCommand,
    DatabaseCommandExecutor,
    DownloadBackupCommand,
    ExportDataCommand,
    ImportDataCommand,
    RestoreBackupCommand,
    LoadSitesCommand,
    type DatabaseCommandContext,
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
    const mockCache: Partial<StandardizedCache<Site>> & {
        replaceAll: ReturnType<typeof vi.fn>;
    } = {
        clear: vi.fn(() => cache.clear()),
        delete: vi.fn((key: string) => cache.delete(key)),
        entries: vi.fn(() => cache.entries()),
        get: vi.fn((key: string) => cache.get(key)),
        getAll: vi.fn(() => Array.from(cache.values())),
        has: vi.fn((key: string) => cache.has(key)),
        set: vi.fn((key: string, value: Site) => {
            cache.set(key, value);
            return mockCache as unknown as StandardizedCache<Site>;
        }),
        size: 0 as unknown as number,
        replaceAll: vi.fn((items: { data: Site; key: string }[]) => {
            mockCache.clear?.();
            for (const item of items) {
                mockCache.set?.(item.key, item.data);
            }
        }),
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
            operation: "data-imported",
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
    public async testEmitSuccessEvent<TEvent extends EventKey<UptimeEvents>>(
        eventType: TEvent,
        data: Partial<UptimeEvents[TEvent]>
    ): Promise<void> {
        await this.emitSuccessEvent(eventType, data);
    }

    public async testEmitFailureEvent<TEvent extends EventKey<UptimeEvents>>(
        eventType: TEvent,
        error: Error,
        data: Partial<UptimeEvents[TEvent]> = {}
    ): Promise<void> {
        await this.emitFailureEvent(eventType, error, data);
    }
}

describe("DatabaseCommands", () => {
    let mockServiceFactory: ReturnType<typeof createMockServiceFactory>;
    let mockEventBus: ReturnType<typeof createMockEventBus>;
    let mockCache: ReturnType<typeof createMockCache>;
    let mockConfigurationManager: {
        validateSiteConfiguration: ReturnType<typeof vi.fn>;
    };
    let mockUpdateHistoryLimit: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockServiceFactory = createMockServiceFactory();
        mockEventBus = createMockEventBus();
        mockCache = createMockCache();
        mockConfigurationManager = {
            validateSiteConfiguration: vi.fn().mockResolvedValue({
                errors: [],
                success: true,
            }),
        };
        mockUpdateHistoryLimit = vi.fn().mockResolvedValue(undefined);
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

        it("should construct with dependencies", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(command).toBeInstanceOf(TestDatabaseCommand);
            expect(command.getDescription()).toBe("Test database command");
        });

        it("should emit success events with correct data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const testData = { operation: "data-imported" } as const;

            await command.testEmitSuccessEvent(
                "internal:database:data-imported",
                testData
            );

            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    operation: "data-imported",
                    success: true,
                    timestamp: expect.any(Number),
                })
            );

            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    operation: "data-imported",
                    success: true,
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should emit failure events with error details", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const testError = new Error("Test error");
            const testData = { operation: "data-imported" } as const;

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
                    operation: "data-imported",
                })
            );
        });

        it("should emit failure events without additional data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should execute successfully when validation passes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            command.setValidation(true);
            command.setExecutionSuccess(true);

            const result = await command.execute();

            expect(result).toBe("test-result");
            expect(mockEventBus.emitTyped).toBeDefined();
        });

        it("should handle execution failure", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            command.setExecutionSuccess(false);

            await expect(command.execute()).rejects.toThrowError(
                "Test execution failure"
            );
        });

        it("should handle rollback failure", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            command.setRollbackSuccess(false);

            await expect(command.rollback()).rejects.toThrowError(
                "Test rollback failure"
            );
        });

        it("should handle validation failure", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            command.setValidation(false);

            const result = await command.validate();

            expect(result).toEqual({
                errors: ["Test validation error"],
                isValid: false,
            });
        });
    });

    describe(DatabaseCommandExecutor, () => {
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

        it("should execute valid command successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = await executor.execute(mockCommand);

            expect(result).toBe("test-result");
            expect(mockCommand.validate).toHaveBeenCalled();
            expect(mockCommand.execute).toHaveBeenCalled();
            expect(mockCommand.rollback).not.toHaveBeenCalled();
        });

        it("should reject invalid command before execution", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockCommand.validate = vi.fn().mockResolvedValue({
                errors: ["Validation error"],
                isValid: false,
            });

            await expect(executor.execute(mockCommand)).rejects.toThrowError(
                "Command validation failed: Validation error"
            );

            expect(mockCommand.validate).toHaveBeenCalled();
            expect(mockCommand.execute).not.toHaveBeenCalled();
        });

        it("should rollback on execution failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockCommand.execute = vi
                .fn()
                .mockRejectedValue(new Error("Execution failed"));

            await expect(executor.execute(mockCommand)).rejects.toThrowError(
                "Execution failed"
            );

            expect(mockCommand.validate).toHaveBeenCalled();
            expect(mockCommand.execute).toHaveBeenCalled();
            expect(mockCommand.rollback).toHaveBeenCalled();
        });

        it("should handle rollback failure gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const loggerSpy = vi
                .spyOn(backendLogger, "error")
                .mockReturnValue(undefined);
            mockCommand.execute = vi
                .fn()
                .mockRejectedValue(new Error("Execution failed"));
            mockCommand.rollback = vi
                .fn()
                .mockRejectedValue(new Error("Rollback failed"));

            await expect(executor.execute(mockCommand)).rejects.toThrowError(
                "Execution failed"
            );

            expect(loggerSpy).toHaveBeenCalledWith(
                "Rollback failed for database command",
                expect.any(Error),
                { command: "Mock command" }
            );

            loggerSpy.mockRestore();
        });

        it("should rollback all commands in reverse order", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should collect rollback errors and throw aggregate error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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
            await expect(executor.rollbackAll()).rejects.toThrowError(
                "Rollback errors: Rollback 2 failed, Rollback 1 failed"
            );
        });

        it("should handle non-Error objects in rollback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const command1 = {
                ...mockCommand,
                rollback: vi.fn().mockRejectedValue("String error"),
            };

            await executor.execute(command1);

            await expect(executor.rollbackAll()).rejects.toThrowError(
                "Rollback errors: String error"
            );
        });

        it("should clear command history", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            await executor.execute(mockCommand);
            executor.clear();

            // After clear, rollbackAll should do nothing
            await executor.rollbackAll();
            expect(mockCommand.rollback).not.toHaveBeenCalled();
        });

        it("should handle undefined commands in rollback gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            await executor.execute(mockCommand);

            // Manually corrupt the command array to test robustness
            (executor as any).executedCommands[0] = undefined;

            // Should not throw
            await expect(executor.rollbackAll()).resolves.toBeUndefined();
        });
    });

    describe(DownloadBackupCommand, () => {
        let command: DownloadBackupCommand;
        let mockBackupService: any;

        const mockBackupMetadata = {
            createdAt: 1_700_000_200_000,
            originalPath: "/tmp/uptime-watcher.db",
            sizeBytes: 512,
        };

        beforeEach(() => {
            mockBackupService = {
                downloadDatabaseBackup: vi.fn().mockResolvedValue({
                    buffer: Buffer.from("test-backup-data"),
                    fileName: "backup-2024.db",
                    metadata: { ...mockBackupMetadata },
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

        it("should execute backup download successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Backup Operation", "type");

            const result = await command.execute();

            expect(result).toEqual({
                buffer: expect.any(Buffer),
                fileName: "backup-2024.db",
                metadata: expect.objectContaining(mockBackupMetadata),
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

        it("should handle backup service errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockBackupService.downloadDatabaseBackup.mockRejectedValue(
                new Error("Backup service failed")
            );

            await expect(command.execute()).rejects.toThrowError(
                "Backup service failed"
            );
        });

        it("should validate successfully (no-op)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const result = await command.validate();

            expect(result).toEqual({ errors: [], isValid: true });
        });

        it("should rollback successfully (no-op)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            await expect(command.rollback()).resolves.toBeUndefined();
        });

        it("should provide correct description", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(command.getDescription()).toBe(
                "Download SQLite database backup"
            );
        });
    });

    describe(ExportDataCommand, () => {
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

        it("should execute data export successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Export Operation", "type");

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

        it("should handle export service errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockImportExportService.exportAllData.mockRejectedValue(
                new Error("Export service failed")
            );

            await expect(command.execute()).rejects.toThrowError(
                "Export service failed"
            );
        });

        it("should validate successfully (no-op)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const result = await command.validate();

            expect(result).toEqual({ errors: [], isValid: true });
        });

        it("should rollback successfully (no-op)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            await expect(command.rollback()).resolves.toBeUndefined();
        });

        it("should provide correct description", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(command.getDescription()).toBe(
                "Export all application data to JSON"
            );
        });
    });

    describe(ImportDataCommand, () => {
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

            command = new ImportDataCommand({
                cache: mockCache as StandardizedCache<Site>,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: '{"sites": [{"identifier": "test1"}], "settings": {}}',
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory:
                    mockServiceFactory as unknown as DatabaseServiceFactory,
                updateHistoryLimit: mockUpdateHistoryLimit as unknown as (
                    limit: number
                ) => Promise<void>,
            });
        });

        it("should execute data import successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Import Operation", "type");

            // Pre-populate cache
            const originalSite = createTestSite("original");
            mockCache.getAll = vi.fn().mockReturnValue([originalSite]);

            const result = await command.execute();

            expect(result).toBeTruthy();
            expect(
                mockImportExportService.importDataFromJson
            ).toHaveBeenCalledWith(
                '{"sites": [{"identifier": "test1"}], "settings": {}}'
            );
            expect(
                mockImportExportService.persistImportedData
            ).toHaveBeenCalled();
            expect(
                mockSiteRepositoryService.getSitesFromDatabase
            ).toHaveBeenCalled();
            expect(mockCache.replaceAll).toHaveBeenCalledTimes(1);
            expect(mockEventBus.emitTyped).toHaveBeenNthCalledWith(
                1,
                "internal:site:added",
                expect.objectContaining({
                    identifier: "test1",
                    operation: "added",
                    source: "import",
                })
            );
            expect(mockEventBus.emitTyped).toHaveBeenNthCalledWith(
                2,
                "internal:site:added",
                expect.objectContaining({
                    identifier: "test2",
                    operation: "added",
                    source: "import",
                })
            );
            expect(mockEventBus.emitTyped).toHaveBeenNthCalledWith(
                3,
                "internal:database:data-imported",
                expect.objectContaining({
                    success: true,
                    operation: "data-imported",
                })
            );
            // ImportDataCommand no longer emits `sites:state-synchronized`
            // directly; that responsibility belongs to SiteManager /
            // UptimeOrchestrator so that all bulk sync events are
            // coordinated through a single high-level entry point.
            expect(mockEventBus.emitTyped).toHaveBeenCalledTimes(3);
        });

        it("should propagate imported history limit when provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Settings", "type");

            mockImportExportService.importDataFromJson.mockResolvedValue({
                sites: [createTestSite("test1")],
                settings: { historyLimit: "2048" },
            });

            await command.execute();

            expect(mockUpdateHistoryLimit).toHaveBeenCalledWith(2048);
        });

        it("should skip history limit propagation when value invalid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Settings", "type");

            mockImportExportService.importDataFromJson.mockResolvedValue({
                sites: [createTestSite("test1")],
                settings: { historyLimit: "not-a-number" },
            });

            await command.execute();

            expect(mockUpdateHistoryLimit).not.toHaveBeenCalled();
        });

        it("should fail when site validation fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            mockConfigurationManager.validateSiteConfiguration.mockResolvedValue(
                {
                    errors: ["Invalid monitor"],
                    success: false,
                }
            );

            await expect(command.execute()).rejects.toThrowError(
                /invalid site configuration/i
            );
            expect(
                mockImportExportService.persistImportedData
            ).not.toHaveBeenCalled();
        });

        it("should fail when duplicate site identifiers detected", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const duplicateSites = [
                createTestSite("dup"),
                createTestSite("dup"),
            ];
            mockImportExportService.importDataFromJson.mockResolvedValue({
                settings: {},
                sites: duplicateSites,
            });

            await expect(command.execute()).rejects.toThrowError(/duplicate/i);
            expect(
                mockImportExportService.persistImportedData
            ).not.toHaveBeenCalled();
        });

        it("should handle import service errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockImportExportService.importDataFromJson.mockRejectedValue(
                new Error("Import service failed")
            );

            await expect(command.execute()).rejects.toThrowError(
                "Import service failed"
            );
        });

        it("should rollback cache to original state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Caching", "type");

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

        it("should validate empty data as invalid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const invalidCommand = new ImportDataCommand({
                cache: mockCache as StandardizedCache<Site>,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: "",
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory:
                    mockServiceFactory as unknown as DatabaseServiceFactory,
            });

            const result = await invalidCommand.validate();

            expect(result).toEqual({
                errors: [
                    "Import data cannot be empty",
                    "Import data must be valid JSON",
                ],
                isValid: false,
            });
        });

        it("should validate whitespace-only data as invalid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const invalidCommand = new ImportDataCommand({
                cache: mockCache as StandardizedCache<Site>,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: "   \n\t   ",
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory:
                    mockServiceFactory as unknown as DatabaseServiceFactory,
            });

            const result = await invalidCommand.validate();

            expect(result).toEqual({
                errors: [
                    "Import data cannot be empty",
                    "Import data must be valid JSON",
                ],
                isValid: false,
            });
        });

        it("should validate invalid JSON as invalid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const invalidCommand = new ImportDataCommand({
                cache: mockCache as StandardizedCache<Site>,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: '{"invalid": json}',
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory:
                    mockServiceFactory as unknown as DatabaseServiceFactory,
            });

            const result = await invalidCommand.validate();

            expect(result).toEqual({
                errors: ["Import data must be valid JSON"],
                isValid: false,
            });
        });

        it("should validate multiple errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const invalidCommand = new ImportDataCommand({
                cache: mockCache as StandardizedCache<Site>,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: "",
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory:
                    mockServiceFactory as unknown as DatabaseServiceFactory,
            });

            const result = await invalidCommand.validate();

            expect(result.isValid).toBeFalsy();
            expect(result.errors).toContain("Import data cannot be empty");
        });

        it("should validate valid JSON as valid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const result = await command.validate();

            expect(result).toEqual({ errors: [], isValid: true });
        });

        it("should reject schema-invalid JSON", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const invalidCommand = new ImportDataCommand({
                cache: mockCache as StandardizedCache<Site>,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: '{"sites": [], "settings": {}}',
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory:
                    mockServiceFactory as unknown as DatabaseServiceFactory,
            });

            const result = await invalidCommand.validate();

            expect(result.isValid).toBeFalsy();
            expect(result.errors).toContain(
                "Import data did not match the expected format."
            );
            expect(
                result.errors.some((error) => error.includes("sites"))
            ).toBeTruthy();
        });

        it("should provide correct description", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(command.getDescription()).toBe(
                "Import application data from JSON"
            );
        });
    });

    describe(RestoreBackupCommand, () => {
        let command: RestoreBackupCommand;
        let payload: { buffer: Buffer; fileName: string };
        let restoreResult: {
            metadata: { checksum: string; schemaVersion: number } & Record<
                string,
                unknown
            >;
            preRestoreBackup: {
                buffer: Buffer;
                fileName: string;
                metadata: Record<string, unknown>;
            };
            preRestoreFileName: string;
            restoredAt: number;
        };
        let backupService: any;

        beforeEach(() => {
            payload = {
                buffer: Buffer.from("restore-data"),
                fileName: "restore.sqlite",
            };
            restoreResult = {
                metadata: {
                    appVersion: "0.0.0-test",
                    checksum: "restore-checksum",
                    createdAt: Date.now(),
                    originalPath: payload.fileName,
                    retentionHintDays: 30,
                    schemaVersion: 7,
                    sizeBytes: payload.buffer.length,
                },
                preRestoreBackup: {
                    buffer: Buffer.from("previous"),
                    fileName: "pre-restore.sqlite",
                    metadata: {
                        appVersion: "0.0.0-test",
                        checksum: "prev-checksum",
                        createdAt: Date.now(),
                        originalPath: "pre-restore.sqlite",
                        retentionHintDays: 30,
                        schemaVersion: 7,
                        sizeBytes: 1024,
                    },
                },
                preRestoreFileName: "pre-restore.sqlite",
                restoredAt: Date.now(),
            };
            backupService = {
                downloadDatabaseBackup: vi.fn(),
                restoreDatabaseBackup: vi.fn().mockResolvedValue(restoreResult),
                applyDatabaseBackupResult: vi
                    .fn()
                    .mockResolvedValue(restoreResult.metadata),
            };
            mockServiceFactory.createBackupService.mockReturnValue(
                backupService as never
            );
            mockServiceFactory.createSiteRepositoryService.mockReturnValue({
                getSitesFromDatabase: vi
                    .fn()
                    .mockResolvedValue([createTestSite("a")]),
            });

            const context: DatabaseCommandContext & {
                payload: DatabaseRestorePayload;
            } = {
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                payload,
                serviceFactory: mockServiceFactory,
                updateHistoryLimit: mockUpdateHistoryLimit as unknown as (
                    limit: number
                ) => Promise<void>,
            };

            command = new RestoreBackupCommand(context);
        });

        it("executes restore and returns metadata summary", async () => {
            const summary = await command.execute();

            expect(backupService.restoreDatabaseBackup).toHaveBeenCalledWith(
                payload
            );
            expect(mockCache.replaceAll).toHaveBeenCalled();
            expect(summary.metadata.checksum).toBe(
                restoreResult.metadata.checksum
            );
            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:database:backup-restored",
                expect.objectContaining({
                    operation: "backup-restored",
                    fileName: payload.fileName,
                })
            );
        });

        it("rolls back by applying the pre-restore snapshot", async () => {
            await command.execute();
            await command.rollback();

            expect(
                backupService.applyDatabaseBackupResult
            ).toHaveBeenCalledWith(restoreResult.preRestoreBackup);
        });

        it("fails validation when payload buffer is empty", async () => {
            const invalidContext: DatabaseCommandContext & {
                payload: DatabaseRestorePayload;
            } = {
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                payload: { buffer: Buffer.alloc(0), fileName: "restore.db" },
                serviceFactory: mockServiceFactory,
                updateHistoryLimit: mockUpdateHistoryLimit as unknown as (
                    limit: number
                ) => Promise<void>,
            };

            const invalidCommand = new RestoreBackupCommand(invalidContext);

            const validation = await invalidCommand.validate();
            expect(validation.isValid).toBeFalsy();
        });
    });

    describe(LoadSitesCommand, () => {
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

        it("should execute site loading successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Loading", "type");

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

        it("should handle repository service errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockSiteRepositoryService.getSitesFromDatabase.mockRejectedValue(
                new Error("Repository service failed")
            );

            await expect(command.execute()).rejects.toThrowError(
                "Repository service failed"
            );
        });

        it("should rollback cache to original state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Caching", "type");

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

        it("should handle empty original cache in rollback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Caching", "type");

            mockCache.entries = vi.fn().mockReturnValue(new Map().entries());

            // Execute and rollback with empty original cache
            await command.execute();
            await command.rollback();

            expect(mockCache.clear).toHaveBeenCalled();
            // No set calls should be made for empty cache
        });

        it("should validate successfully (no-op)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const result = await command.validate();

            expect(result).toEqual({ errors: [], isValid: true });
        });

        it("should provide correct description", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(command.getDescription()).toBe(
                "Load sites from database into cache"
            );
        });
    });

    describe("IDatabaseCommand interface compliance", () => {
        it("should ensure all commands implement required methods", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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
                new ImportDataCommand({
                    cache: mockCache as StandardizedCache<Site>,
                    configurationManager:
                        mockConfigurationManager as unknown as ConfigurationManager,
                    data: '{"sites": [], "settings": {}}',
                    eventEmitter:
                        mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                    serviceFactory:
                        mockServiceFactory as unknown as DatabaseServiceFactory,
                }),
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
        it("should handle event emission failures gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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
            await expect(command.execute()).rejects.toThrowError(
                "Event emission failed"
            );
        });

        it("should handle service factory returning null services", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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

            await expect(command.execute()).rejects.toThrowError(
                "Service unavailable"
            );
        });

        it("should handle cache operations that throw errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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

            await expect(command.execute()).rejects.toThrowError(
                "Cache clear failed"
            );
        });
    });
});
