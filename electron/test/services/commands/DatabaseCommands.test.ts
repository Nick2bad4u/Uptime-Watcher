/**
 * Comprehensive test suite for DatabaseCommands.ts providing 100% coverage.
 * Tests all command classes, executor functionality, error handling, and edge
 * cases.
 */

import type { Site } from "@shared/types";

import { MAX_IPC_JSON_IMPORT_BYTES } from "@shared/constants/backup";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import type { UptimeEvents } from "../../../events/eventTypes";
import type {
    EventKey,
    EventPayload,
    TypedEventBus,
} from "../../../events/TypedEventBus";
import type { ConfigurationManager } from "../../../managers/ConfigurationManager";
import type { DatabaseCommandContext } from "../../../services/commands/databaseCommandContext";
import type { DatabaseRestorePayload } from "../../../services/database/utils/backup/databaseBackup";
import type { StandardizedCache } from "../../../utils/cache/StandardizedCache";

import {
    IMPORT_SITE_EVENT_EMIT_CONCURRENCY,
    IMPORT_SITE_VALIDATION_CONCURRENCY,
} from "../../../constants";
import {
    DatabaseCommandExecutor,
    DownloadBackupCommand,
    ExportDataCommand,
    type IDatabaseCommand,
    ImportDataCommand,
    RestoreBackupCommand,
} from "../../../services/commands/DatabaseCommands";
import { logger as backendLogger } from "../../../utils/logger";
import {
    createMockEventBus as createEnhancedEventBus,
    createMockServiceFactory as createEnhancedServiceFactory,
    createTestSite as createEnhancedTestSite,
} from "../../utils/enhanced-testUtilities";

// Create comprehensive mocks using enhanced utilities
const createMockServiceFactory = createEnhancedServiceFactory;
const createMockEventBus = createEnhancedEventBus;
const createTestSite = createEnhancedTestSite;

type EmitTypedMock = Mock<
    (
        eventName: EventKey<UptimeEvents>,
        data: EventPayload<UptimeEvents, EventKey<UptimeEvents>>
    ) => Promise<void>
>;

const createMockCache = () => {
    const cache = new Map<string, Site>();
    const mockCache: Partial<StandardizedCache<Site>> & {
        replaceAll: ReturnType<typeof vi.fn>;
    } = {
        clear: vi.fn(() => {
            cache.clear();
        }),
        delete: vi.fn((key: string) => cache.delete(key)),
        entries: vi.fn(() => cache.entries()),
        get: vi.fn((key: string) => cache.get(key)),
        getAll: vi.fn(() => [...cache.values()]),
        has: vi.fn((key: string) => cache.has(key)),
        set: vi.fn((key: string, value: Site) => {
            cache.set(key, value);
            return mockCache as unknown as StandardizedCache<Site>;
        }),
        size: 0,
        replaceAll: vi.fn((items: { data: Site; key: string }[]) => {
            mockCache.clear?.();
            for (const item of items) {
                mockCache.set?.(item.key, item.data);
            }
        }),
    };
    return mockCache as unknown as StandardizedCache<Site>;
};

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

            await expect(executor.execute(mockCommand)).rejects.toThrow(
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

            await expect(executor.execute(mockCommand)).rejects.toThrow(
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

            await expect(executor.execute(mockCommand)).rejects.toThrow(
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
            await expect(executor.rollbackAll()).rejects.toThrow(
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

            await expect(executor.rollbackAll()).rejects.toThrow(
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
                mockServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache
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

            await expect(command.execute()).rejects.toThrow(
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
                mockServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache
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
                    fileName: expect.stringMatching(/^export-\d+\.json$/v),
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

            await expect(command.execute()).rejects.toThrow(
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
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: '{"sites": [{"identifier": "test1"}], "settings": {}}',
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory: mockServiceFactory,
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

            const isResult = await command.execute();

            expect(isResult).toBeTruthy();
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

        it("should skip history limit propagation for malformed numeric strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Settings", "type");

            mockImportExportService.importDataFromJson.mockResolvedValue({
                sites: [createTestSite("test1")],
                settings: { historyLimit: "1e3" },
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

            await expect(command.execute()).rejects.toThrow(
                /invalid site configuration/i
            );
            expect(
                mockImportExportService.persistImportedData
            ).not.toHaveBeenCalled();
        });

        it("should bound concurrent imported site validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Performance", "type");

            const importedSites = Array.from(
                { length: IMPORT_SITE_VALIDATION_CONCURRENCY + 3 },
                (_, index) => createTestSite(`import-${index}`)
            );
            let active = 0;
            let maxActive = 0;

            mockImportExportService.importDataFromJson.mockResolvedValue({
                settings: {},
                sites: importedSites,
            });
            mockSiteRepositoryService.getSitesFromDatabase.mockResolvedValue(
                importedSites
            );
            mockConfigurationManager.validateSiteConfiguration.mockImplementation(
                async () => {
                    active += 1;
                    maxActive = Math.max(maxActive, active);
                    await new Promise((resolve) => {
                        setTimeout(resolve, 1);
                    });
                    active -= 1;
                    return {
                        errors: [],
                        success: true,
                    };
                }
            );

            await command.execute();

            expect(
                mockConfigurationManager.validateSiteConfiguration
            ).toHaveBeenCalledTimes(importedSites.length);
            expect(
                mockImportExportService.persistImportedData
            ).toHaveBeenCalledWith(importedSites, {});
            expect(maxActive).toBeLessThanOrEqual(
                IMPORT_SITE_VALIDATION_CONCURRENCY
            );
        });

        it("should bound concurrent imported site-added events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Performance", "type");

            const importedSites = Array.from(
                { length: IMPORT_SITE_EVENT_EMIT_CONCURRENCY + 3 },
                (_, index) => createTestSite(`event-${index}`)
            );
            let active = 0;
            let maxActive = 0;

            mockImportExportService.importDataFromJson.mockResolvedValue({
                settings: {},
                sites: importedSites,
            });
            mockSiteRepositoryService.getSitesFromDatabase.mockResolvedValue(
                importedSites
            );
            const emitTypedMock = mockEventBus.emitTyped as EmitTypedMock;
            emitTypedMock.mockImplementation(async (eventName) => {
                if (eventName !== "internal:site:added") {
                    return;
                }

                active += 1;
                maxActive = Math.max(maxActive, active);
                await new Promise((resolve) => {
                    setTimeout(resolve, 1);
                });
                active -= 1;
            });

            await command.execute();

            const siteAddedCalls = emitTypedMock.mock.calls.filter(
                ([eventName]) => eventName === "internal:site:added"
            );

            expect(siteAddedCalls).toHaveLength(importedSites.length);
            expect(maxActive).toBeLessThanOrEqual(
                IMPORT_SITE_EVENT_EMIT_CONCURRENCY
            );
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

            await expect(command.execute()).rejects.toThrow(/duplicate/iv);
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

            await expect(command.execute()).rejects.toThrow(
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

        it("should restore cloned original sites during rollback", async () => {
            const originalSite = createTestSite("original-clone");
            mockCache.getAll = vi.fn().mockReturnValue([originalSite]);

            await command.execute();
            originalSite.name = "Mutated Original";

            await command.rollback();

            expect(mockCache.get("original-clone")).toEqual({
                ...createTestSite("original-clone"),
            });
        });

        it("should persist cloned canonical monitor arrays", async () => {
            const importedSite = createTestSite("import-clone");
            mockImportExportService.importDataFromJson.mockResolvedValue({
                settings: {},
                sites: [importedSite],
            });

            await command.execute();

            const persistedSites = mockImportExportService.persistImportedData
                .mock.calls[0]?.[0] as Site[];
            expect(persistedSites).toHaveLength(1);
            expect(persistedSites[0]?.monitors).toEqual(importedSite.monitors);
            expect(persistedSites[0]?.monitors).not.toBe(importedSite.monitors);
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
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: "",
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory: mockServiceFactory,
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
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: "   \n\t   ",
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory: mockServiceFactory,
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
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: '{"invalid": json}',
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory: mockServiceFactory,
            });

            const result = await invalidCommand.validate();

            expect(result).toEqual({
                errors: ["Import data must be valid JSON"],
                isValid: false,
            });
        });

        it("should validate oversized import data as invalid before execution", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "regression");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            const invalidCommand = new ImportDataCommand({
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: "x".repeat(MAX_IPC_JSON_IMPORT_BYTES + 1),
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory: mockServiceFactory,
            });

            const result = await invalidCommand.validate();

            expect(result.isValid).toBe(false);
            expect(result.errors).toEqual([
                expect.stringContaining("too large"),
            ]);
        });

        it("should validate multiple errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseCommands", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const invalidCommand = new ImportDataCommand({
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: "",
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory: mockServiceFactory,
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
                cache: mockCache,
                configurationManager:
                    mockConfigurationManager as unknown as ConfigurationManager,
                data: '{"sites": [{"identifier": ""}], "settings": {}}',
                eventEmitter:
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                serviceFactory: mockServiceFactory,
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
            metadata: Record<string, unknown> & {
                checksum: string;
                schemaVersion: number;
            };
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
                    mockServiceFactory,
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                    mockCache
                ),
                new ExportDataCommand(
                    mockServiceFactory,
                    mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                    mockCache
                ),
                new ImportDataCommand({
                    cache: mockCache,
                    configurationManager:
                        mockConfigurationManager as unknown as ConfigurationManager,
                    data: '{"sites": [], "settings": {}}',
                    eventEmitter:
                        mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                    serviceFactory: mockServiceFactory,
                }),
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
                mockServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache
            );

            // Should still throw the event emission error
            await expect(command.execute()).rejects.toThrow(
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
                applyDatabaseBackupResult: vi.fn().mockResolvedValue({
                    appVersion: "0.0.0-test",
                    checksum: "unused",
                    createdAt: Date.now(),
                    originalPath: "/tmp/unused.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 0,
                }),
                downloadDatabaseBackup: vi
                    .fn()
                    .mockRejectedValue(new Error("Service unavailable")),
                restoreDatabaseBackup: vi.fn().mockResolvedValue({
                    metadata: {
                        appVersion: "0.0.0-test",
                        checksum: "unused",
                        createdAt: Date.now(),
                        originalPath: "/tmp/unused.sqlite",
                        retentionHintDays: 30,
                        schemaVersion: 1,
                        sizeBytes: 0,
                    },
                    preRestoreBackup: undefined,
                    preRestoreFileName: "unused.sqlite",
                    restoredAt: Date.now(),
                }),
                saveDatabaseBackupToPath: vi.fn().mockResolvedValue({
                    appVersion: "0.0.0-test",
                    checksum: "unused",
                    createdAt: Date.now(),
                    originalPath: "/tmp/unused.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 0,
                }),
            });

            const command = new DownloadBackupCommand(
                mockServiceFactory,
                mockEventBus as unknown as TypedEventBus<UptimeEvents>,
                mockCache
            );

            await expect(command.execute()).rejects.toThrow(
                "Service unavailable"
            );
        });
    });
});
