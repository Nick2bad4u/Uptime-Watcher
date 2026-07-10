/**
 * Foundation test for DatabaseManager - establishing working mock patterns This
 * test serves as a template for proper mocking architecture
 */

import type { Site } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseManagerDependencies } from "../../managers/DatabaseManager";
import type {
    DatabaseCommandExecutor,
    IDatabaseCommand,
} from "../../services/commands/DatabaseCommands";
import type { SiteLoadingOrchestrator } from "../../services/database/SiteRepositoryService";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import { DatabaseManager } from "../../managers/DatabaseManager";
import {
    DownloadBackupCommand,
    ExportDataCommand,
    ImportDataCommand,
} from "../../services/commands/DatabaseCommands";

type CommandExecutorFixture = Pick<
    DatabaseCommandExecutor,
    | "clear"
    | "execute"
    | "rollbackAll"
>;
type EventEmitterFixture = Pick<
    DatabaseManagerDependencies["eventEmitter"],
    | "addListener"
    | "emit"
    | "emitTyped"
    | "removeListener"
>;
type SiteLoadingOrchestratorFixture = Pick<
    SiteLoadingOrchestrator,
    "loadSitesFromDatabase"
>;

interface DatabaseManagerPrivateView {
    commandExecutor: CommandExecutorFixture;
    siteLoadingOrchestrator: SiteLoadingOrchestratorFixture;
}

function asDependency<TKey extends keyof DatabaseManagerDependencies>(
    value: unknown
): DatabaseManagerDependencies[TKey] {
    return value as DatabaseManagerDependencies[TKey];
}

function hasConstructorName(value: unknown, expectedName: string): boolean {
    if (
        typeof value !== "object" ||
        value === null ||
        !("constructor" in value)
    ) {
        return false;
    }

    const constructor: unknown = value.constructor;
    return (
        typeof constructor === "function" && constructor.name === expectedName
    );
}

function setPrivateMember<TKey extends keyof DatabaseManagerPrivateView>(
    manager: DatabaseManager,
    key: TKey,
    value: DatabaseManagerPrivateView[TKey]
): boolean {
    return Reflect.set(manager, key, value);
}

describe("DatabaseManager Foundation Tests", () => {
    let databaseManager: DatabaseManager;
    let mockDependencies: DatabaseManagerDependencies;
    let mockEventEmitter: EventEmitterFixture;

    const mockBackupMetadata = {
        createdAt: 1_700_000_600_000,
        originalPath: "/tmp/uptime-watcher.db",
        sizeBytes: 2048,
    };

    beforeEach(async () => {
        // Create comprehensive mocks for all dependencies
        mockEventEmitter = {
            emitTyped: vi.fn().mockResolvedValue(undefined),
            removeListener: vi.fn(),
            addListener: vi.fn(),
            emit: vi.fn(),
        };

        const mockRepositories = {
            database: {
                close: vi.fn().mockResolvedValue(undefined),
                execute: vi.fn().mockResolvedValue(undefined),
                query: vi.fn().mockResolvedValue([]),
                executeTransaction: vi.fn().mockResolvedValue(undefined),
                getDatabase: vi.fn().mockReturnValue({}),
                initialize: vi.fn().mockResolvedValue(undefined),
                db: {} as Database,
            },
            history: {
                getHistory: vi.fn().mockResolvedValue([]),
                addHistory: vi.fn().mockResolvedValue(undefined),
                clearHistory: vi.fn().mockResolvedValue(undefined),
                getAll: vi.fn().mockResolvedValue([]),
                getByIdentifier: vi.fn().mockResolvedValue(undefined),
                update: vi.fn().mockResolvedValue(true),
                delete: vi.fn().mockResolvedValue(true),
                add: vi.fn().mockResolvedValue(true),
            },
            monitor: {
                getAll: vi.fn().mockResolvedValue([]),
                getByIdentifier: vi.fn().mockResolvedValue(undefined),
                update: vi.fn().mockResolvedValue(true),
                delete: vi.fn().mockResolvedValue(true),
                add: vi.fn().mockResolvedValue(true),
            },
            settings: {
                get: vi.fn().mockResolvedValue("500"),
                set: vi.fn().mockResolvedValue(true),
                setInternal: vi.fn().mockResolvedValue(true), // Add missing method
                getInternal: vi.fn().mockResolvedValue("500"),
                getAll: vi.fn().mockResolvedValue([]),
                getByIdentifier: vi.fn().mockResolvedValue(undefined),
                update: vi.fn().mockResolvedValue(true),
                delete: vi.fn().mockResolvedValue(true),
                add: vi.fn().mockResolvedValue(true),
            },
            site: {
                getAll: vi.fn().mockResolvedValue([]),
                getByIdentifier: vi.fn().mockResolvedValue(undefined),
                update: vi.fn().mockResolvedValue(true),
                delete: vi.fn().mockResolvedValue(true),
                add: vi.fn().mockResolvedValue(true),
            },
        };

        const mockConfigurationManager = {
            getMonitoringConfiguration: vi.fn().mockReturnValue({
                maxRetries: 3,
                timeout: 5000,
                interval: 60_000,
            }),
            getHistoryRetentionRules: vi
                .fn()
                .mockReturnValue({ ...DEFAULT_HISTORY_LIMIT_RULES }),
            // Add missing required properties
            configCache: new Map(),
            monitorValidator: {},
            siteValidator: {},
            validationCache: new Map(),
            validateMonitor: vi
                .fn()
                .mockResolvedValue({ isValid: true, errors: [] }),
            validateSite: vi
                .fn()
                .mockResolvedValue({ isValid: true, errors: [] }),
            initializeValidators: vi.fn().mockResolvedValue(undefined),
            getValidationRules: vi.fn().mockReturnValue({}),
            refreshConfiguration: vi.fn().mockResolvedValue(undefined),
            clearCache: vi.fn().mockResolvedValue(undefined),
            getConfiguration: vi.fn().mockReturnValue({}),
            setConfiguration: vi.fn().mockResolvedValue(undefined),
            getCacheStats: vi.fn().mockReturnValue({}),
            getFileWatcher: vi.fn().mockReturnValue({}),
            isWatchingEnabled: vi.fn().mockReturnValue(false),
        };

        mockDependencies = {
            configurationManager: asDependency<"configurationManager">(
                mockConfigurationManager
            ),
            eventEmitter: asDependency<"eventEmitter">(mockEventEmitter),
            repositories: asDependency<"repositories">(mockRepositories),
        };

        // Create DatabaseManager
        databaseManager = new DatabaseManager(mockDependencies);

        // Create smart command executor mock that recognizes command types
        const executeCommand = vi
            .fn<(command: unknown) => Promise<unknown>>()
            .mockImplementation(async (command) => {
                // Identify command type and return appropriate response
                if (
                    command instanceof DownloadBackupCommand ||
                    hasConstructorName(command, "DownloadBackupCommand")
                ) {
                    const result = {
                        buffer: Buffer.from("backup-data"),
                        fileName: "backup-test.db",
                        metadata: { ...mockBackupMetadata },
                    };
                    // Emit the expected event
                    await mockEventEmitter.emitTyped(
                        "internal:database:backup-downloaded",
                        {
                            fileName: result.fileName,
                            operation: "backup-downloaded",
                            success: true,
                            timestamp: Date.now(),
                        }
                    );
                    return result;
                }

                if (
                    command instanceof ExportDataCommand ||
                    hasConstructorName(command, "ExportDataCommand")
                ) {
                    // Emit the expected event
                    await mockEventEmitter.emitTyped(
                        "internal:database:data-exported",
                        {
                            fileName: `export-${Date.now()}.json`,
                            operation: "data-exported",
                            success: true,
                            timestamp: Date.now(),
                        }
                    );
                    return '{"sites": [], "settings": []}';
                }

                if (
                    command instanceof ImportDataCommand ||
                    hasConstructorName(command, "ImportDataCommand")
                ) {
                    // Emit the expected event
                    await mockEventEmitter.emitTyped(
                        "internal:database:data-imported",
                        {
                            operation: "data-imported",
                            success: true,
                            timestamp: Date.now(),
                        }
                    );
                    return true;
                }

                // Default return for unknown commands
                return undefined;
            });

        const smartCommandExecutor = {
            execute: <TResult>(
                command: IDatabaseCommand<TResult>
            ): Promise<TResult> => executeCommand(command) as Promise<TResult>,
            rollbackAll: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
        } satisfies CommandExecutorFixture;

        // Replace the command executor after construction.
        expect(
            setPrivateMember(
                databaseManager,
                "commandExecutor",
                smartCommandExecutor
            )
        ).toBeTruthy();

        // Create smart site loading orchestrator mock
        const mockSiteLoadingOrchestrator = {
            loadSitesFromDatabase: vi.fn().mockResolvedValue({
                success: true,
                sitesLoaded: 0,
                message: "Sites loaded successfully",
            }),
        };

        expect(
            setPrivateMember(
                databaseManager,
                "siteLoadingOrchestrator",
                mockSiteLoadingOrchestrator
            )
        ).toBeTruthy();

        // Ensure the site cache has all required methods
        const siteCache = databaseManager["siteCache"];
        if (siteCache) {
            siteCache.clear = vi.fn();
            siteCache.set = vi.fn();
            siteCache.get = vi.fn();
            siteCache.getAll = vi.fn(() => []);
            siteCache.replaceAll = vi.fn();
            siteCache.entries = vi.fn<StandardizedCache<Site>["entries"]>(() =>
                new Map<string, Site>().entries()
            );
        }
    });

    describe("Basic Functionality", () => {
        it("should create DatabaseManager successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Constructor", "type");

            expect(databaseManager).toBeDefined();
            expect(databaseManager.getHistoryLimit()).toBe(500);
        });

        it("should download backup with proper return type and events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Backup Operation", "type");

            const result = await databaseManager.downloadBackup();

            expect(result).toEqual({
                buffer: expect.any(Buffer),
                fileName: "backup-test.db",
                metadata: expect.objectContaining(mockBackupMetadata),
            });

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:backup-downloaded",
                expect.objectContaining({
                    fileName: "backup-test.db",
                    operation: "backup-downloaded",
                })
            );
        });

        it("should export data with proper return type and events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Export Operation", "type");

            const result = await databaseManager.exportData();

            expect(result).toBe('{"sites": [], "settings": []}');

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-exported",
                expect.objectContaining({
                    operation: "data-exported",
                })
            );
        });

        it("should import data with proper return type and events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Import Operation", "type");

            const testData = '{"sites": [], "settings": []}';
            const isResult = await databaseManager.importData(testData);

            expect(isResult).toBeTruthy();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    operation: "data-imported",
                })
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:update-sites-cache-requested",
                expect.objectContaining({
                    operation: "update-sites-cache-requested",
                    sites: expect.any(Array),
                })
            );
        });

        it("should initialize successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            await expect(databaseManager.initialize()).resolves.not.toThrow();
        });

        it("should set history limit successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            await databaseManager.setHistoryLimit(1000);
            expect(databaseManager.getHistoryLimit()).toBe(1000);
        });
    });
});
