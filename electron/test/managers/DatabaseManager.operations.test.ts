/**
 * DatabaseManager operation tests using focused mocks for command, history, and
 * cache behavior.
 */

import type { Site } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    DatabaseManager,
    type DatabaseManagerDependencies,
} from "../../managers/DatabaseManager";
import type {
    DatabaseCommandExecutor,
    IDatabaseCommand,
} from "../../services/commands/DatabaseCommands";
import type { setHistoryLimit as setHistoryLimitContract } from "../../services/database/historyLimitManager";
import type { SiteLoadingOrchestrator } from "../../services/database/SiteRepositoryService";
import {
    createMockConfigurationManager,
    createMockEventBus,
    createMockRepositories,
    createMockStandardizedCache,
    createTestSite,
} from "../utils/enhanced-testUtilities";

type CommandExecutorView = Pick<
    DatabaseCommandExecutor,
    | "clear"
    | "execute"
    | "rollbackAll"
>;
type SetHistoryLimitParams = Parameters<typeof setHistoryLimitContract>[0];
type SiteLoadingOrchestratorView = Pick<
    SiteLoadingOrchestrator,
    "loadSitesFromDatabase"
>;

interface DatabaseManagerPrivateView {
    commandExecutor: CommandExecutorView;
    siteLoadingOrchestrator: SiteLoadingOrchestratorView;
}

function asDependency<TKey extends keyof DatabaseManagerDependencies>(
    value: unknown
): DatabaseManagerDependencies[TKey] {
    return value as DatabaseManagerDependencies[TKey];
}

function createCommandExecutorFixture() {
    const executeCommand = vi
        .fn<(command: IDatabaseCommand<unknown>) => Promise<unknown>>()
        .mockResolvedValue("mock-result");

    const commandExecutor = {
        clear: vi.fn(),
        execute: <TResult>(
            command: IDatabaseCommand<TResult>
        ): Promise<TResult> => executeCommand(command) as Promise<TResult>,
        rollbackAll: vi.fn().mockResolvedValue(undefined),
    } satisfies CommandExecutorView;

    return { commandExecutor, executeCommand };
}

function createSiteLoadingOrchestratorFixture() {
    return {
        loadSitesFromDatabase:
            vi.fn<SiteLoadingOrchestrator["loadSitesFromDatabase"]>(),
    } satisfies SiteLoadingOrchestratorView;
}

function mockLoadedSites(
    orchestrator: ReturnType<typeof createSiteLoadingOrchestratorFixture>,
    sites: Site[]
): void {
    orchestrator.loadSitesFromDatabase.mockImplementation(async (siteCache) => {
        siteCache.replaceAll(
            sites.map((site) => ({
                data: site,
                key: site.identifier,
            }))
        );

        return {
            message: `Successfully loaded ${sites.length} sites`,
            sitesLoaded: sites.length,
            success: true,
        };
    });
}

function setPrivateMember<TKey extends keyof DatabaseManagerPrivateView>(
    manager: DatabaseManager,
    key: TKey,
    value: DatabaseManagerPrivateView[TKey]
): void {
    Reflect.set(manager, key, value);
}

// Mock external dependencies
vi.mock("../../services/commands/DatabaseCommands", () => ({
    DatabaseCommandExecutor: vi.fn(function DatabaseCommandExecutorMock() {
        return {
            execute: vi.fn().mockResolvedValue("mock-result"),
            rollbackAll: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
        };
    }),
    DownloadBackupCommand: vi.fn(function DownloadBackupCommandMock() {}),
    ExportDataCommand: vi.fn(function ExportDataCommandMock() {}),
    ImportDataCommand: vi.fn(function ImportDataCommandMock() {}),
}));

vi.mock("../../services/database/serviceFactory", () => {
    const createLoggerAdapterMock = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    });

    const LoggerAdapter = vi.fn(function LoggerAdapterMock() {
        return createLoggerAdapterMock();
    });

    return {
        createSiteCache: vi.fn(() => createMockStandardizedCache<Site>()),
        LoggerAdapter,
    };
});

vi.mock("../../services/database/historyLimitManager", () => ({
    setHistoryLimit: vi.fn(async (params: SetHistoryLimitParams) => {
        const finalLimit = normalizeHistoryLimit(
            params.limit,
            params.rules ?? DEFAULT_HISTORY_LIMIT_RULES
        );
        await params.setHistoryLimit(finalLimit);

        return undefined;
    }),
    getHistoryLimit: vi.fn(() => Promise.resolve(100)),
}));

describe("DatabaseManager operations", () => {
    let databaseManager: DatabaseManager;
    let eventEmitter: ReturnType<typeof createMockEventBus>;
    let executeCommand: ReturnType<
        typeof createCommandExecutorFixture
    >["executeCommand"];
    let mockRepositories: ReturnType<typeof createMockRepositories>;
    let mockConfigurationManager: ReturnType<
        typeof createMockConfigurationManager
    >;
    let mockSiteLoadingOrchestrator: ReturnType<
        typeof createSiteLoadingOrchestratorFixture
    >;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Manually setup the history limit mock
        const historyLimitManager =
            await import("../../services/database/historyLimitManager");
        vi.mocked(historyLimitManager.setHistoryLimit).mockImplementation(
            async (params) => {
                if (!params?.setHistoryLimit) {
                    return;
                }

                const nextLimit = normalizeHistoryLimit(
                    params.limit,
                    params.rules ?? DEFAULT_HISTORY_LIMIT_RULES
                );
                await params.setHistoryLimit(nextLimit);
            }
        );

        eventEmitter = createMockEventBus();
        mockRepositories = createMockRepositories();
        mockConfigurationManager = createMockConfigurationManager();
        mockSiteLoadingOrchestrator = createSiteLoadingOrchestratorFixture();

        const sqliteAdapter = {} as Database;
        mockRepositories.database.getDatabase.mockReturnValue(sqliteAdapter);
        mockRepositories.database.executeTransaction.mockImplementation(
            async (...args: unknown[]) => {
                const operation = args[0];
                if (typeof operation !== "function") {
                    throw new TypeError(
                        "Expected a database transaction callback"
                    );
                }

                return Reflect.apply(operation, undefined, [sqliteAdapter]);
            }
        );

        // Ensure getHistoryRetentionRules returns proper structure
        mockConfigurationManager.getHistoryRetentionRules.mockReturnValue({
            defaultLimit: 500,
            maxLimit: Number.MAX_SAFE_INTEGER,
            minLimit: 25,
        });
        // Create test sites that the site loading orchestrator should return
        const testSites = [createTestSite("test1"), createTestSite("test2")];
        mockLoadedSites(mockSiteLoadingOrchestrator, testSites);

        const dependencies = {
            configurationManager: asDependency<"configurationManager">(
                mockConfigurationManager
            ),
            eventEmitter: asDependency<"eventEmitter">(eventEmitter),
            repositories: asDependency<"repositories">(mockRepositories),
        } satisfies DatabaseManagerDependencies;

        databaseManager = new DatabaseManager(dependencies);

        setPrivateMember(
            databaseManager,
            "siteLoadingOrchestrator",
            mockSiteLoadingOrchestrator
        );

        const commandExecutorFixture = createCommandExecutorFixture();
        executeCommand = commandExecutorFixture.executeCommand;
        setPrivateMember(
            databaseManager,
            "commandExecutor",
            commandExecutorFixture.commandExecutor
        );
    });

    describe("History Limit Management", () => {
        it("should update history limit successfully", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate(
                "Test Type: Unit - Configuration Management",
                "test-type"
            );
            await annotate("Operation: History Limit Update", "operation");
            await annotate(
                "Priority: High - Data Retention Policy",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Internal State Management",
                "complexity"
            );
            await annotate(
                "Feature: Dynamic history retention configuration",
                "feature"
            );
            await annotate(
                "Purpose: Ensure history limits can be updated and retrieved",
                "purpose"
            );

            const newLimit = 1000;
            await databaseManager.setHistoryLimit(newLimit);

            // The historyLimit should be set internally
            const retrievedLimit = databaseManager.getHistoryLimit();
            expect(retrievedLimit).toBe(newLimit);
        });

        it("should handle zero history limit", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Edge Case Handling", "test-type");
            await annotate(
                "Operation: Zero History Limit Handling",
                "operation"
            );
            await annotate(
                "Priority: Medium - Edge Case Validation",
                "priority"
            );
            await annotate(
                "Complexity: Low - Boundary Value Testing",
                "complexity"
            );
            await annotate("Edge Case: Zero history retention", "edge-case");
            await annotate(
                "Purpose: Ensure zero history limit is handled properly",
                "purpose"
            );
            await databaseManager.setHistoryLimit(0);
            const retrievedLimit = databaseManager.getHistoryLimit();
            expect(retrievedLimit).toBe(0); // Zero is allowed
        });

        it("should clamp negative history limits to zero", async ({
            annotate,
        }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Normalization", "test-type");
            await annotate(
                "Operation: Negative History Limit Normalization",
                "operation"
            );
            await annotate("Priority: High - Input Validation", "priority");
            await annotate(
                "Complexity: Low - Input Boundary Testing",
                "complexity"
            );
            await annotate(
                "Scenario: Negative values should normalize to the unlimited sentinel",
                "scenario"
            );
            await annotate(
                "Purpose: Ensure negative history limits are clamped to zero",
                "purpose"
            );

            await databaseManager.setHistoryLimit(-100);
            expect(databaseManager.getHistoryLimit()).toBe(0);
        });

        it("should emit event when history limit is updated", async ({
            annotate,
        }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Event Emission", "test-type");
            await annotate(
                "Operation: History Limit Change Event",
                "operation"
            );
            await annotate(
                "Priority: Medium - Event System Integration",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Event Flow Validation",
                "complexity"
            );
            await annotate(
                "Event: Notifies other components of config changes",
                "event"
            );
            await annotate(
                "Purpose: Ensure configuration changes emit proper events",
                "purpose"
            );

            await databaseManager.setHistoryLimit(750);

            expect(eventEmitter.emitTyped).toHaveBeenCalled();
        }, 15_000);
    });

    describe("Database Operations with Command Pattern", () => {
        it("should call export data command", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Command Pattern", "test-type");
            await annotate(
                "Operation: Data Export Command Execution",
                "operation"
            );
            await annotate(
                "Priority: High - Data Export Functionality",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Command Pattern Implementation",
                "complexity"
            );
            await annotate(
                "Pattern: Command pattern for database operations",
                "pattern"
            );
            await annotate(
                "Purpose: Ensure data export command executes properly",
                "purpose"
            );

            executeCommand.mockResolvedValue("exported-data");

            const result = await databaseManager.exportData();

            expect(result).toBe("exported-data");
            expect(executeCommand).toHaveBeenCalled();
        });

        it("should call download backup command", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Command Pattern", "test-type");
            await annotate(
                "Operation: Backup Download Command Execution",
                "operation"
            );
            await annotate("Priority: Critical - Data Backup", "priority");
            await annotate(
                "Complexity: Medium - Binary Data Handling",
                "complexity"
            );
            await annotate(
                "Pattern: Command pattern for backup operations",
                "pattern"
            );
            await annotate(
                "Purpose: Ensure backup download command executes properly",
                "purpose"
            );

            const mockBackupData = {
                buffer: Buffer.from("test-backup"),
                fileName: "backup.db",
                metadata: {
                    createdAt: 1_700_000_700_000,
                    originalPath: "/tmp/uptime-watcher.db",
                    sizeBytes: 1280,
                },
            };
            executeCommand.mockResolvedValue(mockBackupData);

            const result = await databaseManager.downloadBackup();

            expect(result).toEqual(mockBackupData);
            expect(executeCommand).toHaveBeenCalled();
        });

        it("should call import data command", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Command Pattern", "test-type");
            await annotate(
                "Operation: Data Import Command Execution",
                "operation"
            );
            await annotate("Priority: Critical - Data Restoration", "priority");
            await annotate(
                "Complexity: High - Data Validation & Import",
                "complexity"
            );
            await annotate(
                "Pattern: Command pattern for import operations",
                "pattern"
            );
            await annotate(
                "Purpose: Ensure data import command executes successfully",
                "purpose"
            );

            executeCommand.mockResolvedValue(true);

            const isResult =
                await databaseManager.importData('{"test": "data"}');

            expect(isResult).toBeTruthy();
            expect(executeCommand).toHaveBeenCalled();
        });

        it("should handle import data command failure", async ({
            annotate,
        }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Error Handling", "test-type");
            await annotate(
                "Operation: Import Command Failure Handling",
                "operation"
            );
            await annotate("Priority: High - Error Recovery", "priority");
            await annotate(
                "Complexity: Medium - Failure Simulation",
                "complexity"
            );
            await annotate(
                "Error Case: Import command execution failure",
                "error-case"
            );
            await annotate(
                "Purpose: Ensure import failures are properly handled",
                "purpose"
            );

            executeCommand.mockRejectedValue(new Error("Import failed"));

            const isResult = await databaseManager.importData("invalid-json");

            expect(isResult).toBeFalsy();
            expect(executeCommand).toHaveBeenCalled();
        });
    });

    describe("Site Loading and Cache Management", () => {
        it("should initialize database manager", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Initialization", "test-type");
            await annotate(
                "Operation: Database Manager Initialization",
                "operation"
            );
            await annotate("Priority: Critical - System Startup", "priority");
            await annotate(
                "Complexity: Medium - Multi-component Initialization",
                "complexity"
            );
            await annotate(
                "Dependencies: Cache, repositories, orchestrator setup",
                "dependencies"
            );
            await annotate(
                "Purpose: Ensure database manager initializes without errors",
                "purpose"
            );

            await expect(databaseManager.initialize()).resolves.not.toThrow();
        });

        it("should refresh sites", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Cache Management", "test-type");
            await annotate("Operation: Site Cache Refresh", "operation");
            await annotate("Priority: High - Data Synchronization", "priority");
            await annotate(
                "Complexity: High - Cache and Database Sync",
                "complexity"
            );
            await annotate(
                "Cache Operation: Reload sites from database into cache",
                "cache-operation"
            );
            await annotate(
                "Purpose: Ensure site cache can be refreshed from database",
                "purpose"
            );

            const testSites = [
                createTestSite("test1"),
                createTestSite("test2"),
            ];

            mockLoadedSites(mockSiteLoadingOrchestrator, testSites);

            const result = await databaseManager.refreshSites();

            expect(result).toEqual(testSites);
            expect(
                mockSiteLoadingOrchestrator.loadSitesFromDatabase
            ).toHaveBeenCalled();
        });

        it("should handle refresh sites error", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Error Handling", "test-type");
            await annotate(
                "Operation: Site Refresh Error Handling",
                "operation"
            );
            await annotate("Priority: High - Error Recovery", "priority");
            await annotate(
                "Complexity: Medium - Database Error Simulation",
                "complexity"
            );
            await annotate(
                "Error Case: Database connection or query failure",
                "error-case"
            );
            await annotate(
                "Purpose: Ensure site refresh errors are properly propagated",
                "purpose"
            );

            mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockRejectedValue(
                new Error("Database error")
            );

            await expect(databaseManager.refreshSites()).rejects.toThrow(
                "Database error"
            );
        });
    });

    describe("Settings Reset", () => {
        it("should handle reset settings error", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Error Handling", "test-type");
            await annotate(
                "Operation: Settings Reset Error Handling",
                "operation"
            );
            await annotate(
                "Priority: Medium - Configuration Management",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Repository Error Simulation",
                "complexity"
            );
            await annotate(
                "Error Case: Settings repository operation failure",
                "error-case"
            );
            await annotate(
                "Purpose: Ensure settings reset errors are properly handled",
                "purpose"
            );

            mockRepositories.settings.setInternal.mockRejectedValue(
                new Error("Reset failed")
            );

            // Reset settings swallows errors, so it should resolve but not throw
            await expect(
                databaseManager.resetSettings()
            ).resolves.not.toThrow();
        });
    });

    describe("Private Method Coverage", () => {
        it("should test private method emitHistoryLimitUpdated through public method", async ({
            annotate,
        }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate(
                "Test Type: Unit - Private Method Coverage",
                "test-type"
            );
            await annotate(
                "Operation: History Limit Event Emission",
                "operation"
            );
            await annotate(
                "Priority: Medium - Event System Integration",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Private Method Testing",
                "complexity"
            );
            await annotate(
                "Event: internal:database:history-limit-updated",
                "event"
            );
            await annotate(
                "Purpose: Test private event emission through public interface",
                "purpose"
            );

            await databaseManager.setHistoryLimit(999);

            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:history-limit-updated",
                expect.objectContaining({
                    limit: expect.any(Number),
                    operation: "history-limit-updated",
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should test private method emitSitesCacheUpdateRequested through refresh", async ({
            annotate,
        }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate(
                "Test Type: Unit - Private Method Coverage",
                "test-type"
            );
            await annotate(
                "Operation: Sites Cache Update Event Emission",
                "operation"
            );
            await annotate(
                "Priority: Medium - Cache Synchronization Events",
                "priority"
            );
            await annotate(
                "Complexity: High - Cache Update Event Flow",
                "complexity"
            );
            await annotate(
                "Event: internal:database:update-sites-cache-requested",
                "event"
            );
            await annotate(
                "Purpose: Test cache update event emission through refresh",
                "purpose"
            );

            const testSites = [createTestSite("test1")];

            mockLoadedSites(mockSiteLoadingOrchestrator, testSites);

            await databaseManager.refreshSites();

            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:update-sites-cache-requested",
                expect.any(Object)
            );
        });
    });

    describe("Event Emission Integration", () => {
        it("should emit multiple events during complex operations", async ({
            annotate,
        }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Integration - Event Flow", "test-type");
            await annotate(
                "Operation: Multi-Event Operation Flow",
                "operation"
            );
            await annotate(
                "Priority: Medium - Event System Validation",
                "priority"
            );
            await annotate(
                "Complexity: High - Multiple Event Coordination",
                "complexity"
            );
            await annotate(
                "Event Flow: Multiple operations trigger multiple events",
                "event-flow"
            );
            await annotate(
                "Purpose: Validate complex operations emit all expected events",
                "purpose"
            );

            const testSites = [createTestSite("test1")];

            mockLoadedSites(mockSiteLoadingOrchestrator, testSites);

            // Perform multiple operations that should emit events
            await databaseManager.setHistoryLimit(999);
            await databaseManager.refreshSites();

            expect(eventEmitter.emitTyped).toHaveBeenCalledTimes(3); // History-limit-updated, update-sites-cache-requested, sites-refreshed
        });
    });
});
