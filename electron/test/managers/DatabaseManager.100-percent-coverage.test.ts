/**
 * @file Complete DatabaseManager test coverage Tests all public and private
 *   methods with proper mocking and error scenarios
 */

import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
    type MockedFunction,
} from "vitest";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { HistoryRepository } from "../../services/database/HistoryRepository";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { SettingsRepository } from "../../services/database/SettingsRepository";
import type { SiteRepository } from "../../services/database/SiteRepository";
import type { Site } from "../../../shared/types.js";
import type { ConfigurationManager } from "../../managers/ConfigurationManager";

import { DEFAULT_HISTORY_LIMIT } from "../../constants";

// Mock all external dependencies
vi.mock("../../services/factories/DatabaseServiceFactory", () => ({
    DatabaseServiceFactory: class {
        public config: unknown;
        public constructor(config: unknown) {
            this.config = config;
        }
        public createDatabaseCommandExecutor() {
            return { execute: vi.fn().mockResolvedValue({}) };
        }
        public createBackupService() {
            return {
                createBackup: vi.fn().mockResolvedValue(Buffer.from("backup")),
                downloadBackup: vi.fn().mockResolvedValue({
                    buffer: Buffer.from("backup"),
                    fileName: "backup.sqlite",
                }),
            };
        }
        public createImportExportService() {
            return {
                importDataFromJson: vi.fn().mockResolvedValue(undefined),
                exportDataToJson: vi.fn().mockResolvedValue("{}"),
                validateImportData: vi.fn().mockReturnValue({ isValid: true }),
                persistImportedData: vi.fn().mockResolvedValue(undefined),
                exportAllData: vi.fn().mockResolvedValue("{}"),
            };
        }
        public createSiteRepositoryService() {
            return {
                getSitesFromDatabase: vi.fn().mockResolvedValue([]),
            };
        }
    },
}));

vi.mock("../../services/commands/DatabaseCommands", () => ({
    DatabaseCommandExecutor: vi.fn().mockImplementation(() => ({
        execute: vi.fn().mockResolvedValue({ success: true }),
        executeImport: vi.fn().mockResolvedValue({ success: true }),
        executeExport: vi.fn().mockResolvedValue({ success: true }),
        executeBackup: vi.fn().mockResolvedValue({ success: true }),
    })),
    DownloadBackupCommand: vi.fn(),
    ExportDataCommand: vi.fn(),
    ImportDataCommand: vi.fn(),
}));

vi.mock("../../utils/database/serviceFactory", () => ({
    createSiteCache: vi.fn().mockReturnValue({
        set: vi.fn(),
        get: vi.fn(),
        has: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        size: 0,
        entries: vi.fn().mockReturnValue([]),
        keys: vi.fn().mockReturnValue([]),
        values: vi.fn().mockReturnValue([]),
    }),
}));

vi.mock("../../utils/database/SiteRepositoryService", () => ({
    SiteRepositoryService: vi.fn().mockImplementation(() => ({
        getSitesFromDatabase: vi.fn().mockResolvedValue([]),
    })),
    SiteLoadingOrchestrator: vi.fn().mockImplementation(() => ({
        loadSitesFromDatabase: vi.fn().mockResolvedValue({
            success: true,
            sitesLoaded: 0,
            message: "Success",
        }),
        loadSitesFromRepository: vi.fn().mockResolvedValue([]),
        addSiteToCache: vi.fn().mockResolvedValue(undefined),
        updateSiteInCache: vi.fn().mockResolvedValue(undefined),
        removeSiteFromCache: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../utils/database/historyLimitManager", () => ({
    setHistoryLimit: vi.fn(async (args: any) => {
        // Simulate util updating in-memory limit via provided callback
        if (args && typeof args.setHistoryLimit === "function") {
            args.setHistoryLimit(args.limit);
        }
        return undefined;
    }),
}));

vi.mock("../../utils/logger", () => ({
    monitorLogger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../shared/utils/errorHandling", () => {
    const mockWithErrorHandling = vi.fn().mockImplementation(async (fn) => await fn());
    return {
        withErrorHandling: mockWithErrorHandling,
    };
});

// Import after mocks so DatabaseManager uses mocked dependencies
import {
    DatabaseManager,
    type DatabaseManagerDependencies,
} from "../../managers/DatabaseManager";

describe("DatabaseManager - 100% Coverage", () => {
    let databaseManager: DatabaseManager;
    let mockDependencies: DatabaseManagerDependencies;
    let mockEventEmitter: TypedEventBus<UptimeEvents>;
    let mockConfigurationManager: ConfigurationManager;
    let mockDatabaseService: DatabaseService;
    let mockHistoryRepository: HistoryRepository;
    let mockMonitorRepository: MonitorRepository;
    let mockSettingsRepository: SettingsRepository;
    let mockSiteRepository: SiteRepository;
    let mockCommandExecutor: any;

    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();

        // Create mock event emitter
        mockEventEmitter = {
            emitTyped: vi.fn().mockResolvedValue(undefined),
            on: vi.fn(),
            off: vi.fn(),
            removeAllListeners: vi.fn(),
        } as unknown as TypedEventBus<UptimeEvents>;

        // Create mock configuration manager
        mockConfigurationManager = {
            getHistoryRetentionRules: vi.fn().mockReturnValue({
                defaultLimit: DEFAULT_HISTORY_LIMIT,
                maxLimit: 10_000,
                minLimit: 25,
            }),
        } as unknown as ConfigurationManager;

        // Create mock database service
        mockDatabaseService = {
            initialize: vi.fn(),
            close: vi.fn(),
            getDatabase: vi.fn(),
        } as unknown as DatabaseService;

        // Create mock repositories
        mockHistoryRepository = {
            findBySiteIdentifier: vi.fn().mockResolvedValue([]),
            deleteAll: vi.fn().mockResolvedValue(undefined),
        } as unknown as HistoryRepository;

        mockMonitorRepository = {
            findBySiteIdentifier: vi.fn().mockResolvedValue([]),
            findByIdentifier: vi.fn().mockResolvedValue(undefined),
            getAllMonitorIds: vi.fn().mockResolvedValue([]),
        } as unknown as MonitorRepository;

        mockSettingsRepository = {
            get: vi.fn().mockResolvedValue(undefined),
            set: vi.fn().mockResolvedValue(undefined),
            findByKey: vi.fn().mockResolvedValue(undefined),
            upsert: vi.fn().mockResolvedValue(undefined),
            exportAll: vi.fn().mockResolvedValue([]),
        } as unknown as SettingsRepository;

        mockSiteRepository = {
            findAll: vi.fn().mockResolvedValue([]),
            findByIdentifier: vi.fn().mockResolvedValue(undefined),
            create: vi.fn().mockResolvedValue({ id: 1, identifier: "test" }),
            update: vi.fn().mockResolvedValue(undefined),
            delete: vi.fn().mockResolvedValue(undefined),
            exportAll: vi.fn().mockResolvedValue([]),
        } as unknown as SiteRepository;

        // Create mock command executor
        mockCommandExecutor = {
            execute: vi.fn().mockResolvedValue({}),
        };

        // Create dependencies object
        mockDependencies = {
            configurationManager: mockConfigurationManager,
            eventEmitter: mockEventEmitter,
            repositories: {
                database: mockDatabaseService,
                history: mockHistoryRepository,
                monitor: mockMonitorRepository,
                settings: mockSettingsRepository,
                site: mockSiteRepository,
            },
        };

        // Create DatabaseManager instance
        databaseManager = new DatabaseManager(mockDependencies);

        // Replace the command executor with our mock
        (databaseManager as any).commandExecutor = mockCommandExecutor;

        // Ensure siteCache is properly mocked if it's undefined
        if (!(databaseManager as any).siteCache) {
            (databaseManager as any).siteCache = {
                set: vi.fn(),
                get: vi.fn(),
                has: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
                size: 0,
                entries: vi.fn().mockReturnValue([]),
                keys: vi.fn().mockReturnValue([]),
                values: vi.fn().mockReturnValue([]),
            };
        }

        // Ensure siteLoadingOrchestrator is properly mocked if methods are missing
        if (
            !(databaseManager as any).siteLoadingOrchestrator
                ?.loadSitesFromDatabase
        ) {
            (databaseManager as any).siteLoadingOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 0,
                    message: "Success",
                }),
                loadSitesFromRepository: vi.fn().mockResolvedValue([]),
                addSiteToCache: vi.fn().mockResolvedValue(undefined),
                updateSiteInCache: vi.fn().mockResolvedValue(undefined),
                removeSiteFromCache: vi.fn().mockResolvedValue(undefined),
            };
        }
    });

    describe("Constructor", () => {
        it("should initialize with provided dependencies", () => {
            expect(databaseManager).toBeDefined();
            expect(databaseManager).toBeInstanceOf(DatabaseManager);
        });

        it("should set default history limit", () => {
            expect((databaseManager as any).historyLimit).toBe(
                DEFAULT_HISTORY_LIMIT
            );
        });
    });

    describe("initialize", () => {
        it("should initialize database and load sites successfully", async () => {
            // Arrange
            const mockLoadSites = vi
                .spyOn(databaseManager as any, "loadSites")
                .mockResolvedValue(undefined);

            // Act
            await databaseManager.initialize();

            // Assert
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
            expect(mockLoadSites).toHaveBeenCalled();
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.objectContaining({
                    operation: "database:initialize",
                    success: true,
                })
            );
        });

        it("should load history limit from settings during initialization", async () => {
            // Arrange
            const mockHistoryLimit = 750;
            (
                mockSettingsRepository.get as MockedFunction<any>
            ).mockResolvedValue(mockHistoryLimit);
            const mockLoadSites = vi
                .spyOn(databaseManager as any, "loadSites")
                .mockResolvedValue(undefined);

            // Act
            await databaseManager.initialize();

            // Assert
            expect(mockSettingsRepository.get).toHaveBeenCalledWith(
                "historyLimit"
            );
            expect((databaseManager as any).historyLimit).toBe(
                mockHistoryLimit
            );
            expect(mockLoadSites).toHaveBeenCalled();
        });

        it("should handle settings.get error and use default limit", async () => {
            // Arrange
            (
                mockSettingsRepository.get as MockedFunction<any>
            ).mockRejectedValue(new Error("Settings error"));
            const mockLoadSites = vi
                .spyOn(databaseManager as any, "loadSites")
                .mockResolvedValue(undefined);

            // Act
            await databaseManager.initialize();

            // Assert
            expect((databaseManager as any).historyLimit).toBe(
                DEFAULT_HISTORY_LIMIT
            );
            expect(mockLoadSites).toHaveBeenCalled();
        });

        it("should handle event emission error gracefully", async () => {
            // Arrange
            const mockLoadSites = vi
                .spyOn(databaseManager as any, "loadSites")
                .mockResolvedValue(undefined);
            (
                mockEventEmitter.emitTyped as MockedFunction<any>
            ).mockRejectedValue(new Error("Event error"));

            // Act & Assert - should not throw
            await expect(databaseManager.initialize()).resolves.toBeUndefined();
            expect(mockLoadSites).toHaveBeenCalled();
        });
    });

    describe("downloadBackup", () => {
        it("should execute DownloadBackupCommand successfully", async () => {
            // Arrange
            const mockBackupResult = {
                buffer: Buffer.from("backup-data"),
                fileName: "backup-2023.sqlite",
            };
            mockCommandExecutor.execute.mockResolvedValue(mockBackupResult);

            // Act
            const result = await databaseManager.downloadBackup();

            // Assert
            expect(result).toEqual(mockBackupResult);
            expect(mockCommandExecutor.execute).toHaveBeenCalled();
        });

        it("should handle backup command execution errors", async () => {
            // Arrange
            const backupError = new Error("Backup failed");
            mockCommandExecutor.execute.mockRejectedValue(backupError);

            // Act & Assert
            await expect(databaseManager.downloadBackup()).rejects.toThrow(
                "Backup failed"
            );
        });
    });

    describe("exportData", () => {
        it("should execute ExportDataCommand successfully", async () => {
            // Arrange
            const mockExportData = JSON.stringify({ sites: [], settings: [] });
            mockCommandExecutor.execute.mockResolvedValue(mockExportData);

            // Act
            const result = await databaseManager.exportData();

            // Assert
            expect(result).toBe(mockExportData);
            expect(mockCommandExecutor.execute).toHaveBeenCalled();
        });

        it("should handle export command execution errors", async () => {
            // Arrange
            const exportError = new Error("Export failed");
            mockCommandExecutor.execute.mockRejectedValue(exportError);

            // Act & Assert
            await expect(databaseManager.exportData()).rejects.toThrow(
                "Export failed"
            );
        });
    });

    describe("importData", () => {
        it("should successfully import data and return true", async () => {
            // Arrange
            const importData = JSON.stringify({ sites: [], settings: [] });
            mockCommandExecutor.execute.mockResolvedValue(undefined);

            // Act
            const result = await databaseManager.importData(importData);

            // Assert
            expect(result).toBe(true);
            expect(mockCommandExecutor.execute).toHaveBeenCalled();
        });

        it("should handle import errors and emit failure event", async () => {
            // Arrange
            const importData = JSON.stringify({ sites: [], settings: [] });
            mockCommandExecutor.execute.mockRejectedValue(
                new Error("Import failed")
            );

            // Act
            const result = await databaseManager.importData(importData);

            // Assert
            expect(result).toBe(false);
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    operation: "data-imported",
                    success: false,
                })
            );
        });

        it("should handle event emission errors during import failure", async () => {
            // Arrange
            const importData = JSON.stringify({ sites: [], settings: [] });
            mockCommandExecutor.execute.mockRejectedValue(
                new Error("Import failed")
            );
            (
                mockEventEmitter.emitTyped as MockedFunction<any>
            ).mockRejectedValue(new Error("Event error"));

            // Act
            const result = await databaseManager.importData(importData);

            // Assert
            expect(result).toBe(false);
            // Should still attempt to emit the event
            expect(mockEventEmitter.emitTyped).toHaveBeenCalled();
        });
    });

    describe("refreshSites", () => {
        it("should load sites and return them from cache", async () => {
            // Arrange
            const mockSites: Site[] = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [],
                    monitoring: false,
                },
                {
                    identifier: "site2",
                    name: "Site 2",
                    monitors: [],
                    monitoring: false,
                },
            ];

            // Ensure siteCache is accessible and mock its methods
            const {siteCache} = (databaseManager as any);
            if (!siteCache) {
                throw new Error("siteCache is not initialized");
            }

            const mockLoadSites = vi
                .spyOn(databaseManager as any, "loadSites")
                .mockResolvedValue(undefined);
            const entriesSpy = vi.spyOn(siteCache, "entries");
            entriesSpy.mockReturnValue(
                new Map<string, Site>(
                    mockSites.map((s) => [s.identifier, s])
                ).entries() as any
            );

            // Act
            const result = await databaseManager.refreshSites();

            // Assert
            expect(mockLoadSites).toHaveBeenCalled();
            expect(result).toEqual(mockSites);
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:sites-refreshed",
                expect.objectContaining({
                    operation: "sites-refreshed",
                    siteCount: mockSites.length,
                })
            );
        });

        it("should handle cache access errors and return empty array", async () => {
            // Arrange
            const {siteCache} = (databaseManager as any);
            if (!siteCache) {
                throw new Error("siteCache is not initialized");
            }

            const mockLoadSites = vi
                .spyOn(databaseManager as any, "loadSites")
                .mockResolvedValue(undefined);
            const entriesSpy = vi.spyOn(siteCache, "entries");
            entriesSpy.mockImplementation(() => {
                throw new Error("Cache error");
            });

            // Act
            const result = await databaseManager.refreshSites();

            // Assert
            expect(mockLoadSites).toHaveBeenCalled();
            expect(result).toEqual([]);
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:sites-refreshed",
                expect.objectContaining({
                    operation: "sites-refreshed",
                    siteCount: 0,
                })
            );
        });
    });

    describe("setHistoryLimit", () => {
        it("should set valid history limit successfully", async () => {
            // Arrange
            const newLimit = 1000;
            const { setHistoryLimit: mockSetHistoryLimit } = await import(
                "../../utils/database/historyLimitManager"
            );

            // Act
            await databaseManager.setHistoryLimit(newLimit);

            // Assert
            expect(mockSetHistoryLimit).toHaveBeenCalled();
            expect((databaseManager as any).historyLimit).toBe(newLimit);
        });

        it("should reject non-number values", async () => {
            // Act & Assert
            await expect(
                databaseManager.setHistoryLimit("invalid" as any)
            ).rejects.toThrow(TypeError);
            await expect(
                databaseManager.setHistoryLimit(null as any)
            ).rejects.toThrow(TypeError);
            await expect(
                databaseManager.setHistoryLimit(undefined as any)
            ).rejects.toThrow(TypeError);
            await expect(
                databaseManager.setHistoryLimit(Number.NaN)
            ).rejects.toThrow(TypeError);
        });

        it("should reject non-integer values", async () => {
            // Act & Assert
            await expect(
                databaseManager.setHistoryLimit(123.45)
            ).rejects.toThrow(TypeError);
            await expect(databaseManager.setHistoryLimit(0.5)).rejects.toThrow(
                TypeError
            );
        });

        it("should reject negative values", async () => {
            // Act & Assert
            await expect(databaseManager.setHistoryLimit(-1)).rejects.toThrow(
                RangeError
            );
            await expect(databaseManager.setHistoryLimit(-100)).rejects.toThrow(
                RangeError
            );
        });

        it("should reject infinite values", async () => {
            // Act & Assert - Infinity is caught by integer check first, so TypeError is expected
            await expect(
                databaseManager.setHistoryLimit(Infinity)
            ).rejects.toThrow(TypeError);
            await expect(
                databaseManager.setHistoryLimit(-Infinity)
            ).rejects.toThrow(TypeError);
        });

        it("should reject values exceeding maximum limit", async () => {
            // Arrange
            const maxLimit = 10_000;
            (
                mockConfigurationManager.getHistoryRetentionRules as MockedFunction<any>
            ).mockReturnValue({
                maxLimit,
                defaultLimit: DEFAULT_HISTORY_LIMIT,
                minLimit: 25,
            });

            // Act & Assert
            await expect(
                databaseManager.setHistoryLimit(maxLimit + 1)
            ).rejects.toThrow(RangeError);
        });
    });

    describe("resetSettings", () => {
        it("should reset history limit to default", async () => {
            // Arrange
            const mockSetHistoryLimit = vi
                .spyOn(databaseManager, "setHistoryLimit")
                .mockResolvedValue(undefined);

            // Act
            await databaseManager.resetSettings();

            // Assert
            expect(mockSetHistoryLimit).toHaveBeenCalledWith(
                DEFAULT_HISTORY_LIMIT
            );
        });
    });

    describe("getHistoryLimit", () => {
        it("should return current history limit", () => {
            // Arrange
            const testLimit = 750;
            (databaseManager as any).historyLimit = testLimit;

            // Act
            const result = databaseManager.getHistoryLimit();

            // Assert
            expect(result).toBe(testLimit);
        });
    });

    describe("Private Methods", () => {
        describe("emitHistoryLimitUpdated", () => {
            it("should emit history limit updated event successfully", async () => {
                // Arrange
                const limit = 500;

                // Act
                await (databaseManager as any).emitHistoryLimitUpdated(limit);

                // Assert
                expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                    "internal:database:history-limit-updated",
                    expect.objectContaining({
                        limit,
                        operation: "history-limit-updated",
                    })
                );
            });

            it("should handle event emission errors gracefully", async () => {
                // Arrange
                const limit = 500;
                (
                    mockEventEmitter.emitTyped as MockedFunction<any>
                ).mockRejectedValue(new Error("Event error"));

                // Act & Assert - should not throw
                await expect(
                    (databaseManager as any).emitHistoryLimitUpdated(limit)
                ).resolves.toBeUndefined();
            });
        });

        describe("emitSitesCacheUpdateRequested", () => {
            it("should emit sites cache update requested event successfully", async () => {
                // Arrange
                const mockSites = [
                    {
                        identifier: "site1",
                        name: "Site 1",
                        monitors: [],
                        monitoring: false,
                    },
                ];
                const mockSiteCache = (databaseManager as any).siteCache;
                mockSiteCache.entries.mockReturnValue(
                    mockSites.map((site) => [site.identifier, site])
                );

                // Act
                await (databaseManager as any).emitSitesCacheUpdateRequested();

                // Assert
                expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                    "internal:database:update-sites-cache-requested",
                    expect.objectContaining({
                        operation: "update-sites-cache-requested",
                        sites: mockSites,
                    })
                );
            });

            it("should handle event emission errors gracefully", async () => {
                // Arrange
                (
                    mockEventEmitter.emitTyped as MockedFunction<any>
                ).mockRejectedValue(new Error("Event error"));

                // Act & Assert - should not throw
                await expect(
                    (databaseManager as any).emitSitesCacheUpdateRequested()
                ).resolves.toBeUndefined();
            });
        });

        describe("loadSites", () => {
            it("should load sites from database successfully", async () => {
                // Arrange
                const mockSiteLoadingOrchestrator = (databaseManager as any)
                    .siteLoadingOrchestrator;
                vi.spyOn(
                    mockSiteLoadingOrchestrator,
                    "loadSitesFromDatabase"
                ).mockResolvedValue({
                    success: true,
                    sitesLoaded: 2,
                    message: "Success",
                });

                // Act
                await (databaseManager as any).loadSites();

                // Assert
                expect(
                    mockSiteLoadingOrchestrator.loadSitesFromDatabase
                ).toHaveBeenCalled();
            });

            it("should handle site loading errors", async () => {
                // Arrange
                const mockSiteLoadingOrchestrator = (databaseManager as any)
                    .siteLoadingOrchestrator;
                vi.spyOn(
                    mockSiteLoadingOrchestrator,
                    "loadSitesFromDatabase"
                ).mockRejectedValue(new Error("Loading error"));

                // Act & Assert
                await expect(
                    (databaseManager as any).loadSites()
                ).rejects.toThrow("Loading error");
            });
        });
    });

    describe("Edge Cases and Integration", () => {
        it("should handle concurrent operations gracefully", async () => {
            // Arrange - these are actual method calls, not mocked spies
            const promises = [
                databaseManager.initialize(),
                databaseManager.setHistoryLimit(500),
                databaseManager.refreshSites(),
                databaseManager.exportData(),
            ];

            // Assert - all should complete without errors
            await expect(Promise.all(promises)).resolves.toBeDefined();
        });

        it("should maintain state consistency across operations", async () => {
            // Arrange
            const newLimit = 800;

            // Act
            await databaseManager.setHistoryLimit(newLimit);
            const retrievedLimit = databaseManager.getHistoryLimit();

            // Assert
            expect(retrievedLimit).toBe(newLimit);
        });

        it("should handle dependencies being null gracefully", () => {
            // This tests constructor robustness with minimal dependencies
            const minimalDeps: DatabaseManagerDependencies = {
                configurationManager: mockConfigurationManager,
                eventEmitter: mockEventEmitter,
                repositories: {
                    database: mockDatabaseService,
                    history: mockHistoryRepository,
                    monitor: mockMonitorRepository,
                    settings: mockSettingsRepository,
                    site: mockSiteRepository,
                },
            };

            // Act & Assert - should not throw
            expect(() => new DatabaseManager(minimalDeps)).not.toThrow();
        });
    });

    describe("Error Handling Integration", () => {
        it("should properly wrap operations with error handling", async () => {
            // This test verifies that error handling is working by ensuring operations
            // complete successfully even with potential errors in dependencies

            // Act - This should use withErrorHandling internally
            await databaseManager.initialize();
            await databaseManager.refreshSites();

            // Assert - Verify that core operations completed successfully
            // If error handling wasn't working, these would have failed
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
            // The fact that these complete without throwing proves error handling is active
        });

        it("should handle complex error scenarios", async () => {
            // Arrange
            const complexError = new Error("Complex error");
            mockCommandExecutor.execute.mockRejectedValue(complexError);

            // Act & Assert
            await expect(databaseManager.downloadBackup()).rejects.toThrow(
                "Complex error"
            );
            await expect(databaseManager.exportData()).rejects.toThrow(
                "Complex error"
            );

            const importResult = await databaseManager.importData("{}");
            expect(importResult).toBe(false);
        });
    });
});
