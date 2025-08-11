/**
 * Coverage-focused tests for DatabaseManager.
 * Uses comprehensive mocking to achieve stable test coverage.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
    DatabaseCommandExecutor: vi.fn().mockImplementation(() => ({
        execute: vi.fn().mockResolvedValue("mock-result"),
        rollbackAll: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn(),
    })),
    DownloadBackupCommand: vi.fn(),
    ExportDataCommand: vi.fn(),
    ImportDataCommand: vi.fn(),
}));

vi.mock("../../utils/database/serviceFactory", () => ({
    createSiteCache: vi.fn(() => createMockStandardizedCache()),
    LoggerAdapter: vi.fn().mockImplementation(() => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    })),
}));

vi.mock("../../utils/database/historyLimitManager", () => ({
    setHistoryLimit: vi.fn(),
    getHistoryLimit: vi.fn(() => Promise.resolve(100)),
}));

describe("DatabaseManager - Coverage Tests", () => {
    let databaseManager: DatabaseManager;
    let eventEmitter: ReturnType<typeof createMockEventBus>;
    let mockDependencies: DatabaseManagerDependencies;
    let mockRepositories: ReturnType<typeof createMockRepositories>;
    let mockConfigurationManager: ReturnType<typeof createMockConfigurationManager>;
    let mockSiteLoadingOrchestrator: ReturnType<typeof createMockSiteLoadingOrchestrator>;

    beforeEach(async () => {
        vi.clearAllMocks();
        
        // Manually setup the history limit mock
        const historyLimitManager = await import("../../utils/database/historyLimitManager");
        vi.mocked(historyLimitManager.setHistoryLimit).mockImplementation(async (params) => {
            // Call the setHistoryLimit callback with the limit to simulate the real behavior
            if (params.setHistoryLimit) {
                params.setHistoryLimit(params.limit);
            }
        });
        
        eventEmitter = createMockEventBus();
        mockRepositories = createMockRepositories();
        mockConfigurationManager = createMockConfigurationManager();
        mockSiteLoadingOrchestrator = createMockSiteLoadingOrchestrator();
        
        // Ensure getHistoryRetentionRules returns proper structure
        mockConfigurationManager.getHistoryRetentionRules.mockReturnValue({
            defaultLimit: 500,
            maxLimit: 1000,
            minLimit: 25,
        });
        
        // Create test sites that the site loading orchestrator should return
        const testSites = [createTestSite("test1"), createTestSite("test2")];
        mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockImplementation(async (siteCache: any) => {
            // Populate the cache with test sites (simulate the real behavior)
            for (const site of testSites) {
                siteCache.set(site.identifier, site);
            }
            
            return {
                success: true,
                sitesLoaded: testSites.length,
                message: `Successfully loaded ${testSites.length} sites`,
            };
        });

        mockDependencies = {
            configurationManager: mockConfigurationManager as any,
            eventEmitter: eventEmitter as any,
            repositories: mockRepositories as any,
        };

        databaseManager = new DatabaseManager(mockDependencies);
        
        // Mock the private siteLoadingOrchestrator
        (databaseManager as any).siteLoadingOrchestrator = mockSiteLoadingOrchestrator;
        
        // Mock the private commandExecutor
        const mockCommandExecutor = {
            execute: vi.fn().mockImplementation(async (command: any) => {
                // Return different values based on command type
                if (command.constructor.name === 'DownloadBackupCommand') {
                    return {
                        buffer: Buffer.from("test-backup-data"),
                        fileName: "backup-test.db",
                    };
                }
                if (command.constructor.name === 'ExportDataCommand') {
                    return '{"test": "data"}';
                }
                if (command.constructor.name === 'ImportDataCommand') {
                    return true; // Success by default
                }
                return "mock-result";
            }),
            rollbackAll: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
        };
        (databaseManager as any).commandExecutor = mockCommandExecutor;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("History Limit Management", () => {
        it("should update history limit successfully", async () => {
            const newLimit = 1000;
            await databaseManager.setHistoryLimit(newLimit);
            
            // The historyLimit should be set internally
            const retrievedLimit = databaseManager.getHistoryLimit();
            expect(retrievedLimit).toBe(newLimit);
        });

        it("should handle zero history limit", async () => {
            await databaseManager.setHistoryLimit(0);
            const retrievedLimit = databaseManager.getHistoryLimit();
            expect(retrievedLimit).toBe(0); // Zero is allowed
        });

        it("should handle negative history limit", async () => {
            await expect(databaseManager.setHistoryLimit(-100)).rejects.toThrow();
        });

        it("should emit event when history limit is updated", async () => {
            await databaseManager.setHistoryLimit(750);

            expect(eventEmitter.emitTyped).toHaveBeenCalled();
        }, 15_000);
    });

    describe("Database Operations with Command Pattern", () => {
        it("should call export data command", async () => {
            const mockExecutor = (databaseManager as any).commandExecutor;
            vi.mocked(mockExecutor.execute).mockResolvedValue("exported-data");

            const result = await databaseManager.exportData();

            expect(result).toBe("exported-data");
            expect(mockExecutor.execute).toHaveBeenCalled();
        });

        it("should call download backup command", async () => {
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

        it("should call import data command", async () => {
            const mockExecutor = (databaseManager as any).commandExecutor;
            vi.mocked(mockExecutor.execute).mockResolvedValue(true);

            const result = await databaseManager.importData('{"test": "data"}');

            expect(result).toBe(true);
            expect(mockExecutor.execute).toHaveBeenCalled();
        });

        it("should handle import data command failure", async () => {
            // Create a command executor mock that throws an error to simulate failure
            const failureCommandExecutor = {
                execute: vi.fn().mockRejectedValue(new Error("Import failed")),
                rollbackAll: vi.fn().mockResolvedValue(undefined),
                clear: vi.fn(),
            };
            (databaseManager as any).commandExecutor = failureCommandExecutor;

            const result = await databaseManager.importData("invalid-json");

            expect(result).toBe(false);
            expect(failureCommandExecutor.execute).toHaveBeenCalled();
        });
    });

    describe("Site Loading and Cache Management", () => {
        it("should initialize database manager", async () => {
            await expect(databaseManager.initialize()).resolves.not.toThrow();
        });

        it("should refresh sites", async () => {
            const testSites = [createTestSite("test1"), createTestSite("test2")];
            
            // The orchestrator should populate the cache when called
            mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockImplementation(async (siteCache: any) => {
                // Clear and populate the cache with test sites
                siteCache.clear();
                for (const site of testSites) {
                    siteCache.set(site.identifier, site);
                }
                
                return {
                    success: true,
                    sites: testSites,
                    errorCount: 0,
                    metadata: { totalProcessed: 2, loadedFromCache: 0, loadedFromDatabase: 2 },
                };
            });

            const result = await databaseManager.refreshSites();

            expect(result).toEqual(testSites);
            expect(mockSiteLoadingOrchestrator.loadSitesFromDatabase).toHaveBeenCalled();
        });

        it("should handle refresh sites error", async () => {
            mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockRejectedValue(
                new Error("Database error")
            );

            await expect(databaseManager.refreshSites()).rejects.toThrow("Database error");
        });
    });

    describe("Settings Reset", () => {
        it("should handle reset settings error", async () => {
            mockRepositories.settings.setInternal.mockRejectedValue(
                new Error("Reset failed")
            );

            // Reset settings swallows errors, so it should resolve but not throw
            await expect(databaseManager.resetSettings()).resolves.not.toThrow();
        });
    });

    describe("Private Method Coverage", () => {
        it("should test private method emitHistoryLimitUpdated through public method", async () => {
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

        it("should test private method emitSitesCacheUpdateRequested through refresh", async () => {
            const testSites = [createTestSite("test1")];
            
            // The orchestrator should populate the cache when called
            mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockImplementation(async (siteCache: any) => {
                // Clear and populate the cache with test sites
                siteCache.clear();
                for (const site of testSites) {
                    siteCache.set(site.identifier, site);
                }
                
                return {
                    success: true,
                    sites: testSites,
                    errorCount: 0,
                    metadata: { totalProcessed: 1, loadedFromCache: 0, loadedFromDatabase: 1 },
                };
            });

            await databaseManager.refreshSites();

            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:update-sites-cache-requested",
                expect.any(Object)
            );
        });
    });

    describe("Event Emission Integration", () => {
        it("should emit multiple events during complex operations", async () => {
            const testSites = [createTestSite("test1")];
            
            // The orchestrator should populate the cache when called
            mockSiteLoadingOrchestrator.loadSitesFromDatabase.mockImplementation(async (siteCache: any) => {
                // Clear and populate the cache with test sites
                siteCache.clear();
                for (const site of testSites) {
                    siteCache.set(site.identifier, site);
                }
                
                return {
                    success: true,
                    sites: testSites,
                    errorCount: 0,
                    metadata: { totalProcessed: 1, loadedFromCache: 0, loadedFromDatabase: 1 },
                };
            });

            // Perform multiple operations that should emit events
            await databaseManager.setHistoryLimit(999);
            await databaseManager.refreshSites();

            expect(eventEmitter.emitTyped).toHaveBeenCalledTimes(3); // history-limit-updated, update-sites-cache-requested, sites-refreshed
        });
    });
});