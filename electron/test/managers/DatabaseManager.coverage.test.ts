/**
 * Coverage-focused tests for DatabaseManager. Uses comprehensive mocking to
 * achieve stable test coverage.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    DatabaseManager,
    type DatabaseManagerDependencies,
} from "../../managers/DatabaseManager";
import {
    createMockStandardizedCache,
    createMockEventBus,
    createMockRepositories,
    createMockConfigurationManager,
    createMockSiteLoadingOrchestrator,
    createTestSite,
} from "../utils/enhanced-testUtilities";

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

vi.mock("../../utils/database/serviceFactory", () => {
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
        createSiteCache: vi.fn(() => createMockStandardizedCache()),
        LoggerAdapter,
    };
});

vi.mock("../../utils/database/historyLimitManager", () => ({
    setHistoryLimit: vi.fn(),
    getHistoryLimit: vi.fn(() => Promise.resolve(100)),
}));

describe("DatabaseManager - Coverage Tests", () => {
    let databaseManager: DatabaseManager;
    let eventEmitter: ReturnType<typeof createMockEventBus>;
    let mockDependencies: DatabaseManagerDependencies;
    let mockRepositories: ReturnType<typeof createMockRepositories>;
    let mockConfigurationManager: ReturnType<
        typeof createMockConfigurationManager
    >;
    let mockSiteLoadingOrchestrator: ReturnType<
        typeof createMockSiteLoadingOrchestrator
    >;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Manually setup the history limit mock
        const historyLimitManager = await import(
            "../../utils/database/historyLimitManager"
        );
        vi.mocked(historyLimitManager.setHistoryLimit).mockImplementation(
            async (params) => {
                // Call the setHistoryLimit callback with the limit to simulate the real behavior
                if (params.setHistoryLimit) {
                    params.setHistoryLimit(params.limit);
                }
            }
        );

        eventEmitter = createMockEventBus();
        mockRepositories = createMockRepositories();
        mockConfigurationManager = createMockConfigurationManager();
        mockSiteLoadingOrchestrator = createMockSiteLoadingOrchestrator();

        // Ensure getHistoryRetentionRules returns proper structure
        mockConfigurationManager.getHistoryRetentionRules.mockReturnValue({
            defaultLimit: 500,
            maxLimit: Number.MAX_SAFE_INTEGER,
            minLimit: 25,
        });
        // Create test sites that the site loading orchestrator should return
        const testSites = [createTestSite("test1"), createTestSite("test2")];
        mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockImplementation(
            async (siteCache: any) => {
                siteCache.replaceAll(
                    testSites.map((site) => ({
                        key: site.identifier,
                        data: site,
                    }))
                );

                return {
                    success: true,
                    sitesLoaded: testSites.length,
                    message: `Successfully loaded ${testSites.length} sites`,
                };
            }
        );

        mockDependencies = {
            configurationManager: mockConfigurationManager as any,
            eventEmitter: eventEmitter as any,
            repositories: mockRepositories as any,
        };

        databaseManager = new DatabaseManager(mockDependencies);

        // Mock the private siteLoadingOrchestrator
        (databaseManager as any).siteLoadingOrchestrator =
            mockSiteLoadingOrchestrator;

        // Mock the private commandExecutor
        const mockCommandExecutor = {
            execute: vi.fn().mockImplementation(async (command: any) => {
                // Return different values based on command type
                if (command.constructor.name === "DownloadBackupCommand") {
                    return {
                        buffer: Buffer.from("test-backup-data"),
                        fileName: "backup-test.db",
                    };
                }
                if (command.constructor.name === "ExportDataCommand") {
                    return '{"test": "data"}';
                }
                if (command.constructor.name === "ImportDataCommand") {
                    return true; // Success by default
                }
                return "mock-result";
            }),
            rollbackAll: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
        };
        (databaseManager as any).commandExecutor = mockCommandExecutor;
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

        it("should handle negative history limit", async ({ annotate }) => {
            await annotate("Component: DatabaseManager", "component");
            await annotate("Test Type: Unit - Error Handling", "test-type");
            await annotate(
                "Operation: Negative History Limit Validation",
                "operation"
            );
            await annotate("Priority: High - Input Validation", "priority");
            await annotate(
                "Complexity: Low - Input Boundary Testing",
                "complexity"
            );
            await annotate(
                "Error Case: Negative values should be rejected",
                "error-case"
            );
            await annotate(
                "Purpose: Ensure negative history limits are rejected",
                "purpose"
            );

            await expect(
                databaseManager.setHistoryLimit(-100)
            ).rejects.toThrow();
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

            const mockExecutor = (databaseManager as any).commandExecutor;
            vi.mocked(mockExecutor.execute).mockResolvedValue("exported-data");

            const result = await databaseManager.exportData();

            expect(result).toBe("exported-data");
            expect(mockExecutor.execute).toHaveBeenCalled();
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

            const mockExecutor = (databaseManager as any).commandExecutor;
            const mockBackupData = {
                buffer: Buffer.from("test-backup"),
                fileName: "backup.db",
            };
            vi.mocked(mockExecutor.execute).mockResolvedValue(mockBackupData);

            const result = await databaseManager.downloadBackup();

            expect(result).toEqual(mockBackupData);
            expect(mockExecutor.execute).toHaveBeenCalled();
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

            const mockExecutor = (databaseManager as any).commandExecutor;
            vi.mocked(mockExecutor.execute).mockResolvedValue(true);

            const result = await databaseManager.importData('{"test": "data"}');

            expect(result).toBeTruthy();
            expect(mockExecutor.execute).toHaveBeenCalled();
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

            // Create a command executor mock that throws an error to simulate failure
            const failureCommandExecutor = {
                execute: vi.fn().mockRejectedValue(new Error("Import failed")),
                rollbackAll: vi.fn().mockResolvedValue(undefined),
                clear: vi.fn(),
            };
            (databaseManager as any).commandExecutor = failureCommandExecutor;

            const result = await databaseManager.importData("invalid-json");

            expect(result).toBeFalsy();
            expect(failureCommandExecutor.execute).toHaveBeenCalled();
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

            // The orchestrator should populate the cache when called
            mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockImplementation(
                async (siteCache: any) => {
                    siteCache.replaceAll(
                        testSites.map((site) => ({
                            key: site.identifier,
                            data: site,
                        }))
                    );

                    return {
                        success: true,
                        sites: testSites,
                        errorCount: 0,
                        metadata: {
                            totalProcessed: 2,
                            loadedFromCache: 0,
                            loadedFromDatabase: 2,
                        },
                    };
                }
            );

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

            // The orchestrator should populate the cache when called
            mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockImplementation(
                async (siteCache: any) => {
                    siteCache.replaceAll(
                        testSites.map((site) => ({
                            key: site.identifier,
                            data: site,
                        }))
                    );

                    return {
                        success: true,
                        sites: testSites,
                        errorCount: 0,
                        metadata: {
                            totalProcessed: 1,
                            loadedFromCache: 0,
                            loadedFromDatabase: 1,
                        },
                    };
                }
            );

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

            // The orchestrator should populate the cache when called
            mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockImplementation(
                async (siteCache: any) => {
                    siteCache.replaceAll(
                        testSites.map((site) => ({
                            key: site.identifier,
                            data: site,
                        }))
                    );

                    return {
                        success: true,
                        sites: testSites,
                        errorCount: 0,
                        metadata: {
                            totalProcessed: 1,
                            loadedFromCache: 0,
                            loadedFromDatabase: 1,
                        },
                    };
                }
            );

            // Perform multiple operations that should emit events
            await databaseManager.setHistoryLimit(999);
            await databaseManager.refreshSites();

            expect(eventEmitter.emitTyped).toHaveBeenCalledTimes(3); // History-limit-updated, update-sites-cache-requested, sites-refreshed
        });
    });
});
