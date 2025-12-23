/**
 * Fixed DatabaseManager comprehensive tests - targeting 90%+ branch coverage
 * Focuses on error paths and edge cases not covered by existing tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Site } from "@shared/types";

// Mock database commands FIRST using vi.hoisted
const { DatabaseCommandExecutor } = vi.hoisted(() => {
    const mockExecutor = vi.fn(function DatabaseCommandExecutorMock() {
        const executeMethod = vi.fn().mockImplementation((command) => {
            // Return appropriate values based on command type
            if (command && command.constructor.name === "ImportDataCommand") {
                return Promise.resolve(true);
            } else if (
                command &&
                command.constructor.name === "DownloadBackupCommand"
            ) {
                return Promise.resolve("/path/to/backup.json");
            } else if (
                command &&
                command.constructor.name === "ExportDataCommand"
            ) {
                return Promise.resolve('{"sites": [], "settings": []}');
            }
            return Promise.resolve(undefined);
        });

        return {
            execute: executeMethod,
            rollbackAll: vi.fn().mockResolvedValue(undefined),
        };
    });

    return {
        DatabaseCommandExecutor: mockExecutor,
    };
});

vi.mock("../../services/commands/DatabaseCommands", () => ({
    ImportDataCommand: vi.fn(function ImportDataCommandMock() {
        return {};
    }),
    ExportDataCommand: vi.fn(function ExportDataCommandMock() {
        return {};
    }),
    DownloadBackupCommand: vi.fn(function DownloadBackupCommandMock() {
        return {};
    }),
    DatabaseCommandExecutor,
}));

// Mock DatabaseServiceFactory BEFORE importing DatabaseManager
vi.mock("../../services/factories/DatabaseServiceFactory", () => ({
    DatabaseServiceFactory: class {
        public config: unknown;
        public constructor(config: unknown) {
            this.config = config;
        }
        public createSiteRepositoryService() {
            return {
                getSitesFromDatabase: vi.fn().mockResolvedValue([]),
                loadSitesIntoCache: vi.fn().mockResolvedValue(undefined),
                applyHistoryLimitSetting: vi.fn().mockResolvedValue(undefined),
            };
        }
        public createBackupService() {
            return {
                downloadDatabaseBackup: vi.fn().mockResolvedValue({
                    buffer: Buffer.from("backup data"),
                    fileName: "backup-test.db",
                    metadata: {
                        createdAt: 1_700_000_800_000,
                        originalPath: "/tmp/uptime-watcher.db",
                        sizeBytes: 1024,
                    },
                }),
            };
        }
        public createImportExportService() {
            return {
                exportAllData: vi
                    .fn()
                    .mockResolvedValue('{"sites": [], "settings": []}'),
                importDataFromJson: vi
                    .fn()
                    .mockResolvedValue({ sites: [], settings: [] }),
                persistImportedData: vi.fn().mockResolvedValue(undefined),
            };
        }
    },
}));

// Mock SiteRepositoryService and SiteLoadingOrchestrator BEFORE importing DatabaseManager
vi.mock("../../utils/database/SiteRepositoryService", () => ({
    SiteRepositoryService: vi.fn(function SiteRepositoryServiceMock() {
        return {
            getSitesFromDatabase: vi.fn().mockResolvedValue([]),
        };
    }),
    SiteLoadingOrchestrator: vi.fn(function SiteLoadingOrchestratorMock() {
        return {
            loadSitesFromDatabase: vi.fn().mockResolvedValue({
                success: true,
                sitesLoaded: 0,
                message: "Success",
            }),
            siteRepositoryService: {
                getSitesFromDatabase: vi.fn().mockResolvedValue([]),
            },
        };
    }),
}));

import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";
import { DatabaseManager } from "../../managers/DatabaseManager";
import type { DatabaseManagerDependencies } from "../../managers/DatabaseManager";
import { TypedEventBus } from "../../events/TypedEventBus";
import type { UptimeEvents } from "../../events/eventTypes.js";

// Mock DataImportExportService
vi.mock("../../utils/database/DataImportExportService", () => ({
    DataImportExportService: vi.fn().mockImplementation(() => ({
        importDataFromJson: vi.fn(),
        persistImportedData: vi.fn(),
        exportDataToJson: vi.fn(),
        downloadBackup: vi.fn(),
        validateImportData: vi.fn(),
    })),
}));

// Import the mocked classes for use in tests
import { SiteLoadingOrchestrator } from "../../utils/database/SiteRepositoryService";
import { DataImportExportService } from "../../utils/database/DataImportExportService";

// Mock serviceFactory
vi.mock("../../utils/database/serviceFactory", () => ({
    createSiteCache: vi.fn(() => {
        const store = new Map<string, Site>();

        return {
            get: vi.fn((key: string) => store.get(key)),
            set: vi.fn((key: string, value: Site) => {
                store.set(key, value);
            }),
            has: vi.fn((key: string) => store.has(key)),
            delete: vi.fn((key: string) => store.delete(key)),
            clear: vi.fn(() => {
                store.clear();
            }),
            replaceAll: vi.fn((items: { key: string; data: Site }[]) => {
                store.clear();
                for (const { key, data } of items) {
                    store.set(key, data);
                }
            }),
            keys: vi.fn(() => Array.from(store.keys())),
            values: vi.fn(() => Array.from(store.values())),
            entries: vi.fn(() => store.entries()),
            get size() {
                return store.size;
            },
            getStats: vi.fn(() => ({
                hits: 0,
                misses: 0,
                hitRate: 0,
                size: store.size,
                maxSize: 100,
            })),
        };
    }),
    LoggerAdapter: vi.fn(function LoggerAdapterMock() {
        return {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };
    }),
}));

// Mock all dependencies
const mockEventEmitter = {
    emitTyped: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
} as unknown as TypedEventBus<UptimeEvents>;

const mockConfigurationManager = {
    getHistoryRetentionRules: vi.fn().mockReturnValue({
        defaultLimit: 500,
        maxLimit: 1000,
        minLimit: 25,
    }),
} as any;

const mockDatabaseService = {
    initialize: vi.fn(() => Promise.resolve()),
    close: vi.fn(),
    getDatabase: vi.fn(),
    executeTransaction: vi.fn((callback) => {
        // Mock the callback execution
        const mockDb = {};
        return Promise.resolve(callback(mockDb));
    }),
} as any;

const mockHistoryRepository = {
    findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
    deleteAll: vi.fn(() => Promise.resolve()),
    deleteOldHistoryEntriesBySiteId: vi.fn(() => Promise.resolve()),
    pruneAllHistoryInternal: vi.fn(),
    deleteAllInternal: vi.fn(),
} as any;

const mockMonitorRepository = {
    findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
    findByIdentifier: vi.fn(() => Promise.resolve(undefined)),
    getAllMonitorIds: vi.fn(() => Promise.resolve([])),
    deleteAllInternal: vi.fn(),
} as any;

const mockSettingsRepository = {
    findByKey: vi.fn(() => Promise.resolve(undefined)),
    get: vi.fn(() => Promise.resolve(undefined)),
    upsert: vi.fn(() => Promise.resolve()),
    setInternal: vi.fn(),
    exportAll: vi.fn(() => Promise.resolve([])),
} as any;

const mockSiteRepository = {
    findAll: vi.fn(() => Promise.resolve([])),
    findByIdentifier: vi.fn(() => Promise.resolve(undefined)),
    upsert: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve(true)),
    deleteAll: vi.fn(() => Promise.resolve()),
    exists: vi.fn(() => Promise.resolve(false)),
    bulkInsert: vi.fn(() => Promise.resolve()),
    exportAll: vi.fn(() => Promise.resolve([])),
    bulkInsertInternal: vi.fn(),
    deleteAllInternal: vi.fn(),
} as any;

const attachTransactionAdapter = (
    repository: Record<string, any>,
    builders: Record<string, Function>
) => {
    repository["createTransactionAdapter"] = vi
        .fn()
        .mockImplementation((db: unknown) => {
            const adapter: Record<string, any> = {};
            for (const [key, factory] of Object.entries(builders)) {
                adapter[key] = vi.fn((...args: unknown[]) =>
                    factory(db, ...args)
                );
            }
            return adapter;
        });
};

const initializeTransactionAdapters = (): void => {
    attachTransactionAdapter(mockSettingsRepository, {
        set: (db: unknown, key: unknown, value: unknown) =>
            mockSettingsRepository["setInternal"](db, key, value),
    });

    attachTransactionAdapter(mockHistoryRepository, {
        pruneAllHistory: (db: unknown, limit: unknown) =>
            mockHistoryRepository["pruneAllHistoryInternal"](db, limit),
        deleteAll: (db: unknown) =>
            mockHistoryRepository["deleteAllInternal"](db),
    });

    attachTransactionAdapter(mockMonitorRepository, {
        deleteAll: (db: unknown) =>
            mockMonitorRepository["deleteAllInternal"](db),
    });

    attachTransactionAdapter(mockSiteRepository, {
        bulkInsert: (db: unknown, rows: unknown) =>
            mockSiteRepository["bulkInsertInternal"](db, rows),
        deleteAll: (db: unknown) => mockSiteRepository["deleteAllInternal"](db),
    });
};

// Helper function to create proper mocks
const createSiteLoadingOrchestratorMock = (overrides = {}) => ({
    loadSitesFromDatabase: vi.fn().mockResolvedValue({
        success: true,
        sitesLoaded: 0,
        message: "Success",
    }),
    siteRepositoryService: {
        getSitesFromDatabase: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
});

const createDataImportExportServiceMock = (overrides = {}) => ({
    importDataFromJson: vi.fn(),
    persistImportedData: vi.fn(),
    exportDataToJson: vi.fn(),
    downloadBackup: vi.fn(),
    validateImportData: vi.fn(),
    ...overrides,
});

describe("DatabaseManager - Comprehensive Error Coverage", () => {
    let databaseManager: DatabaseManager;
    let mockDeps: DatabaseManagerDependencies;
    let mockOrchestrator: ReturnType<typeof createSiteLoadingOrchestratorMock>;

    beforeEach(async () => {
        vi.clearAllMocks();

        initializeTransactionAdapters();

        // Set up the orchestrator mock before creating DatabaseManager
        mockOrchestrator = createSiteLoadingOrchestratorMock();
        vi.mocked(SiteLoadingOrchestrator).mockImplementation(
            function SiteLoadingOrchestratorBaseMock() {
                return mockOrchestrator as any;
            }
        );

        vi.mocked(mockEventEmitter.emitTyped).mockResolvedValue(undefined);

        mockDeps = {
            eventEmitter: mockEventEmitter,
            configurationManager: mockConfigurationManager,
            repositories: {
                database: mockDatabaseService,
                history: mockHistoryRepository,
                monitor: mockMonitorRepository,
                settings: mockSettingsRepository,
                site: mockSiteRepository,
            },
        };

        databaseManager = new DatabaseManager(mockDeps);
    });

    describe("Initialize - Error Handling Branches", () => {
        it("should handle settings.get throwing an error during initialize", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            // Mock settings to throw an error
            vi.mocked(mockSettingsRepository.get).mockRejectedValue(
                new Error("Settings error")
            );

            // Should not throw and should use default history limit
            await expect(databaseManager.initialize()).resolves.toBeUndefined();

            // Should still call database initialization and load sites
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
            expect(mockOrchestrator.loadSitesFromDatabase).toHaveBeenCalled();
        });

        it("should handle event emission error during initialize", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            // Mock successful database operations
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("100");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 1,
                    message: "Success",
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorInitializeMock() {
                    return mockOrchestrator as any;
                }
            );

            // Mock event emission to fail for specific database events only
            vi.mocked(mockEventEmitter.emitTyped).mockImplementation(
                async (eventName, _payload) => {
                    if (eventName === "database:transaction-completed") {
                        throw new Error("Event emission failed");
                    }
                }
            );

            // Should not throw even if event emission fails
            await expect(databaseManager.initialize()).resolves.toBeUndefined();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.any(Object)
            );
        });

        it("should handle settings.get returning a value during initialize", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            // Mock settings.get to return a specific limit
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("250");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 1,
                    message: "Success",
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorSettingsMock() {
                    return mockOrchestrator as any;
                }
            );

            await databaseManager.initialize();

            // Should set the history limit from database
            expect(databaseManager.getHistoryLimit()).toBe(250);
        });

        it("should normalise persisted history limits below the minimum during initialize", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            vi.mocked(mockSettingsRepository.get).mockResolvedValue("10");

            await databaseManager.initialize();

            expect(databaseManager.getHistoryLimit()).toBe(
                DEFAULT_HISTORY_LIMIT_RULES.minLimit
            );
        });

        it("should convert negative persisted history limits to unlimited during initialize", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            vi.mocked(mockSettingsRepository.get).mockResolvedValue("-15");

            await databaseManager.initialize();

            expect(databaseManager.getHistoryLimit()).toBe(0);
        });

        it("should fall back to default when persisted history limit is invalid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            vi.mocked(mockSettingsRepository.get).mockResolvedValue(
                "not-a-number"
            );

            await databaseManager.initialize();

            expect(databaseManager.getHistoryLimit()).toBe(
                DEFAULT_HISTORY_LIMIT_RULES.defaultLimit
            );
        });
    });

    describe("LoadSites - Error Handling Branches", () => {
        it("should handle loadSitesFromDatabase returning success=false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Data Loading", "type");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: false,
                    sitesLoaded: 0,
                    message: "Failed to load sites",
                }),
            });

            // Direct property assignment since vi.mock doesn't intercept constructor calls
            (databaseManager as any).siteLoadingOrchestrator = mockOrchestrator;

            // Should throw when loadSitesFromDatabase fails
            await expect(databaseManager.initialize()).rejects.toThrowError(
                "Failed to load sites"
            );
        });

        it("should handle site cache operations during loadSites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Data Loading", "type");

            // Reset and configure the SiteLoadingOrchestrator mock
            // Mock to test the cache operations in loadSites
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi
                    .fn()
                    .mockImplementation(async (_tempCache, config) => {
                        // Call the callbacks to test cache operations
                        if (config.stopMonitoring)
                            await config.stopMonitoring("site1", "monitor1");
                        return {
                            success: true,
                            sitesLoaded: 1,
                            message: "Success",
                        };
                    }),
            });

            // Direct property assignment since vi.mock doesn't intercept constructor calls
            (databaseManager as any).siteLoadingOrchestrator = mockOrchestrator;

            await databaseManager.initialize();
            expect(mockOrchestrator.loadSitesFromDatabase).toHaveBeenCalled();
        });
    });

    describe("RefreshSites - Error Handling Branches", () => {
        it("should handle cache access errors during refreshSites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock();
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorLoadSitesMock() {
                    return mockOrchestrator as any;
                }
            );

            // Initialize first
            await databaseManager.initialize();

            // This should work without errors
            const result = await databaseManager.refreshSites();
            expect(Array.isArray(result)).toBeTruthy();
        });

        it("should return sites from cache during successful refreshSites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Caching", "type");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock();
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorCacheMock() {
                    return mockOrchestrator as any;
                }
            );

            await databaseManager.initialize();
            const result = await databaseManager.refreshSites();

            expect(Array.isArray(result)).toBeTruthy();
        });
    });

    describe("Event Emission Error Handling", () => {
        it("should handle emitHistoryLimitUpdated errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Mock configuration manager to return proper limits
            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            // Initialize first
            await databaseManager.initialize();

            // Mock event emission to fail specifically for start monitoring
            vi.mocked(mockEventEmitter.emitTyped).mockImplementation(
                async (eventName, _payload) => {
                    if (
                        eventName === "internal:site:start-monitoring-requested"
                    ) {
                        throw new Error("Event emission failed");
                    }
                }
            );

            // Should not throw even if event emission fails
            await expect(
                databaseManager.setHistoryLimit(100)
            ).resolves.toBeUndefined();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:history-limit-updated",
                expect.objectContaining({
                    limit: 100,
                })
            );
        });

        it("should handle emitSitesCacheUpdateRequested errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Reset and configure the SiteLoadingOrchestrator mock
            // Create a mock that uses the startMonitoring callback
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi
                    .fn()
                    .mockImplementation(async (_tempCache, config) => {
                        // Simulate calling startMonitoring which triggers emitSitesCacheUpdateRequested
                        if (config.startMonitoring)
                            await config.startMonitoring("site1", "monitor1");
                        return {
                            success: true,
                            sitesLoaded: 1,
                            message: "Success",
                        };
                    }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorHistoryMock() {
                    return mockOrchestrator as any;
                }
            );

            (databaseManager as any).siteLoadingOrchestrator =
                mockOrchestrator as any;

            // Mock event emission to fail
            vi.mocked(mockEventEmitter.emitTyped).mockImplementation(
                async (eventName, _payload) => {
                    if (
                        eventName === "internal:site:start-monitoring-requested"
                    ) {
                        throw new Error("Event emission failed");
                    }
                }
            );

            await expect(databaseManager.initialize()).rejects.toThrowError(
                "Event emission failed"
            );
        });
    });

    describe("Import Data Error Branches", () => {
        it("should handle importData with event emission failure during catch block", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Reset and configure the DataImportExportService mock
            // Mock import service to fail
            const mockImportService = createDataImportExportServiceMock({
                importDataFromJson: vi
                    .fn()
                    .mockRejectedValue(new Error("Import failed")),
            });
            vi.mocked(DataImportExportService).mockImplementation(
                () => mockImportService as any
            );

            const mockExecute = vi
                .fn()
                .mockRejectedValue(new Error("Import failed"));
            (databaseManager as any).commandExecutor = {
                execute: mockExecute,
                rollbackAll: vi.fn(),
            };

            // Mock first event emission to succeed, second to fail
            vi.mocked(mockEventEmitter.emitTyped)
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("Event emission failed"));

            const result = await databaseManager.importData('{"sites": []}');
            expect(result).toBeFalsy();
        });

        it("should handle successful importData flow", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Import Operation", "type");

            // Reset and configure the DataImportExportService mock
            const mockImportService = createDataImportExportServiceMock({
                importDataFromJson: vi
                    .fn()
                    .mockResolvedValue({ sites: [], settings: [] }),
                persistImportedData: vi.fn().mockResolvedValue(undefined),
            });
            vi.mocked(DataImportExportService).mockImplementation(
                () => mockImportService as any
            );

            // Mock the command executor to succeed for ImportDataCommand
            const mockExecute = vi.fn().mockResolvedValue(true);
            (databaseManager as any).commandExecutor = {
                execute: mockExecute,
                rollbackAll: vi.fn(),
            };

            const result = await databaseManager.importData(
                '{"sites": [{"identifier": "site1"}], "settings": []}'
            );

            expect(result).toBeTruthy();
            expect(mockExecute).toHaveBeenCalled();
        });
    });

    describe("History Limit Edge Cases", () => {
        it("should handle setHistoryLimit with different limit values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            // Mock configuration manager to return proper limits
            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            await databaseManager.initialize();
            await databaseManager.setHistoryLimit(100);
            expect(databaseManager.getHistoryLimit()).toBe(100);
        });

        it("should handle setHistoryLimit with utility throwing error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Mock configuration manager to return proper limits
            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            await databaseManager.initialize();

            // Mock the repository methods that are actually called by the utility
            const mockSetInternal = vi.fn().mockImplementation(() => {
                throw new Error("Failed to set limit");
            });

            // Use direct property assignment for repositories
            (databaseManager as any).dependencies.repositories.settings = {
                ...mockSettingsRepository,
                setInternal: mockSetInternal,
            };

            mockSettingsRepository.setInternal = mockSetInternal;
            attachTransactionAdapter(mockSettingsRepository, {
                set: (db: unknown, key: unknown, value: unknown) =>
                    mockSetInternal(db, key, value),
            });

            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.settings,
                {
                    set: (db: unknown, key: unknown, value: unknown) =>
                        mockSetInternal(db, key, value),
                }
            );

            await expect(
                databaseManager.setHistoryLimit(100)
            ).rejects.toThrowError("Failed to set limit");
        });
    });

    describe("Monitor Configuration Callbacks", () => {
        it("should handle stopMonitoring callback in loadSites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Data Loading", "type");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi
                    .fn()
                    .mockImplementation(async (_tempCache, config) => {
                        // Test the stopMonitoring callback
                        if (config.stopMonitoring) {
                            await config.stopMonitoring("site1", "monitor1");
                        }
                        return {
                            success: true,
                            sitesLoaded: 1,
                            message: "Success",
                        };
                    }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorMonitoringMock() {
                    return mockOrchestrator as any;
                }
            );

            // Should complete without errors
            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });

        it("should propagate stopMonitoring event failures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi
                    .fn()
                    .mockImplementation(async (_tempCache, config) => {
                        if (config.stopMonitoring) {
                            await config.stopMonitoring("site1", "monitor1");
                        }
                        return {
                            success: true,
                            sitesLoaded: 1,
                            message: "Success",
                        };
                    }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorStopFailureMock() {
                    return mockOrchestrator as any;
                }
            );

            (databaseManager as any).siteLoadingOrchestrator =
                mockOrchestrator as any;

            vi.mocked(mockEventEmitter.emitTyped).mockImplementation(
                async (eventName, _payload) => {
                    if (
                        eventName === "internal:site:stop-monitoring-requested"
                    ) {
                        throw new Error("Stop event failed");
                    }
                }
            );

            await expect(databaseManager.initialize()).rejects.toThrowError(
                "Stop event failed"
            );
        });

        it("should handle setupNewMonitors callback in loadSites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Data Loading", "type");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi
                    .fn()
                    .mockImplementation(async (_tempCache, config) => {
                        // Test the setupNewMonitors callback
                        if (config.setupNewMonitors) {
                            await config.setupNewMonitors([
                                "monitor1",
                                "monitor2",
                            ]);
                        }
                        return {
                            success: true,
                            sitesLoaded: 1,
                            message: "Success",
                        };
                    }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorIntegrationMock() {
                    return mockOrchestrator as any;
                }
            );

            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });

        it("should handle setHistoryLimit callback in monitoring config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            // Mock configuration manager to return proper limits
            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi
                    .fn()
                    .mockImplementation(async (_tempCache, config) => {
                        // Test the setHistoryLimit callback
                        if (config.setHistoryLimit) {
                            await config.setHistoryLimit(200);
                        }
                        return {
                            success: true,
                            sitesLoaded: 1,
                            message: "Success",
                        };
                    }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(
                function SiteLoadingOrchestratorEdgeCaseMock() {
                    return mockOrchestrator as any;
                }
            );

            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });

        it("should handle loadSitesFromDatabase throwing an error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi
                    .fn()
                    .mockRejectedValue(new Error("Database connection failed")),
            });

            // Direct property assignment since vi.mock doesn't intercept constructor calls
            (databaseManager as any).siteLoadingOrchestrator = mockOrchestrator;

            // Should propagate the error
            await expect(databaseManager.initialize()).rejects.toThrowError(
                "Database connection failed"
            );
        });
    });

    describe("Import/Export Operations", () => {
        it("should handle downloadBackup successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Backup Operation", "type");

            // Mock the command executor directly on the instance
            const mockBackupResult = {
                buffer: Buffer.from("backup data"),
                fileName: "backup-test.db",
                metadata: {
                    createdAt: 1_700_000_810_000,
                    originalPath: "/tmp/uptime-watcher.db",
                    sizeBytes: 2560,
                },
            };
            const mockExecute = vi.fn().mockResolvedValue(mockBackupResult);
            (databaseManager as any).commandExecutor = {
                execute: mockExecute,
                rollbackAll: vi.fn().mockResolvedValue(undefined),
            };

            const result = await databaseManager.downloadBackup();

            expect(mockExecute).toHaveBeenCalled();
            expect(result).toEqual(mockBackupResult);
        });

        it("should handle downloadBackup with file system errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Mock the command executor directly on the instance to throw error
            const mockExecute = vi
                .fn()
                .mockRejectedValue(new Error("File system error"));
            (databaseManager as any).commandExecutor = {
                execute: mockExecute,
                rollbackAll: vi.fn().mockResolvedValue(undefined),
            };

            const mockImportService = createDataImportExportServiceMock({
                downloadBackup: vi
                    .fn()
                    .mockRejectedValue(new Error("File system error")),
            });
            vi.mocked(DataImportExportService).mockImplementation(
                () => mockImportService as any
            );

            await expect(databaseManager.downloadBackup()).rejects.toThrowError(
                "File system error"
            );
        });
    });

    describe("History Management", () => {
        it("should handle setHistoryLimit with valid limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            // Mock the repository methods that are actually called by the utility
            const mockSetInternal = vi.fn();
            const mockPruneAllHistoryInternal = vi.fn();

            // Use direct property assignment for repositories
            (databaseManager as any).dependencies.repositories.settings = {
                ...mockSettingsRepository,
                setInternal: mockSetInternal,
            };
            (databaseManager as any).dependencies.repositories.history = {
                ...mockHistoryRepository,
                pruneAllHistoryInternal: mockPruneAllHistoryInternal,
            };

            mockSettingsRepository.setInternal = mockSetInternal;
            attachTransactionAdapter(mockSettingsRepository, {
                set: (db: unknown, key: unknown, value: unknown) =>
                    mockSetInternal(db, key, value),
            });

            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.settings,
                {
                    set: (db: unknown, key: unknown, value: unknown) =>
                        mockSetInternal(db, key, value),
                }
            );
            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.history,
                {
                    pruneAllHistory: (db: unknown, limit: unknown) =>
                        mockPruneAllHistoryInternal(db, limit),
                }
            );

            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.settings,
                {
                    set: (db: unknown, key: unknown, value: unknown) =>
                        mockSetInternal(db, key, value),
                }
            );
            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.history,
                {
                    pruneAllHistory: (db: unknown, limit: unknown) =>
                        mockPruneAllHistoryInternal(db, limit),
                }
            );

            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.settings,
                {
                    set: (db: unknown, key: unknown, value: unknown) =>
                        mockSetInternal(db, key, value),
                }
            );
            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.history,
                {
                    pruneAllHistory: (db: unknown, limit: unknown) =>
                        mockPruneAllHistoryInternal(db, limit),
                }
            );

            await databaseManager.setHistoryLimit(300);

            expect(mockSetInternal).toHaveBeenCalledWith(
                expect.anything(),
                "historyLimit",
                "300"
            );
            expect(mockPruneAllHistoryInternal).toHaveBeenCalledWith(
                expect.anything(),
                300
            );
            expect(databaseManager.getHistoryLimit()).toBe(300);
        });

        it("should handle setHistoryLimit with limit exceeding maximum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            // Should throw RangeError, not clamp
            await expect(
                databaseManager.setHistoryLimit(1500)
            ).rejects.toThrowError(
                "History limit exceeds maximum of 1000, received: 1500"
            );
        });

        it("should handle setHistoryLimit with limit below minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            // Mock the repository methods that are actually called by the utility
            const mockSetInternal = vi.fn();
            const mockPruneAllHistoryInternal = vi.fn();

            // Use direct property assignment for repositories
            (databaseManager as any).dependencies.repositories.settings = {
                ...mockSettingsRepository,
                setInternal: mockSetInternal,
            };
            (databaseManager as any).dependencies.repositories.history = {
                ...mockHistoryRepository,
                pruneAllHistoryInternal: mockPruneAllHistoryInternal,
            };

            mockSettingsRepository.setInternal = mockSetInternal;
            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.settings,
                {
                    set: (db: unknown, key: unknown, value: unknown) =>
                        mockSetInternal(db, key, value),
                }
            );
            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.history,
                {
                    pruneAllHistory: (db: unknown, limit: unknown) =>
                        mockPruneAllHistoryInternal(db, limit),
                }
            );

            await databaseManager.setHistoryLimit(10);

            // Utility enforces ConfigurationManager's minimum limit (25)
            expect(mockSetInternal).toHaveBeenCalledWith(
                expect.anything(),
                "historyLimit",
                DEFAULT_HISTORY_LIMIT_RULES.minLimit.toString()
            );
            expect(mockPruneAllHistoryInternal).toHaveBeenCalledWith(
                expect.anything(),
                DEFAULT_HISTORY_LIMIT_RULES.minLimit
            );
            expect(databaseManager.getHistoryLimit()).toBe(
                DEFAULT_HISTORY_LIMIT_RULES.minLimit
            );
        });

        it("should handle setHistoryLimit with database error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Mock configuration manager to return proper limits
            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            // Mock the repository methods that are actually called by the utility
            const mockSetInternal = vi.fn().mockImplementation(() => {
                throw new Error("Database write error");
            });

            // Use direct property assignment for repositories
            (databaseManager as any).dependencies.repositories.settings = {
                ...mockSettingsRepository,
                setInternal: mockSetInternal,
            };

            attachTransactionAdapter(
                (databaseManager as any).dependencies.repositories.settings,
                {
                    set: (db: unknown, key: unknown, value: unknown) =>
                        mockSetInternal(db, key, value),
                }
            );

            await expect(
                databaseManager.setHistoryLimit(200)
            ).rejects.toThrowError("Database write error");
        });
    });

    describe("Configuration and State", () => {
        it("should return correct history limit with default value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            // Before initialization or setting, should return default
            const result = databaseManager.getHistoryLimit();
            expect(result).toBe(500); // Default from mockConfigurationManager
        });

        it("should handle getHistoryLimit after custom setting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Data Retrieval", "type");

            // Mock configuration manager to return proper limits
            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            await databaseManager.setHistoryLimit(300);
            const result = databaseManager.getHistoryLimit();
            expect(result).toBe(300);
        });
    });

    describe("Edge Cases and Error Scenarios", () => {
        it("should handle multiple initialization calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            // Reset mocks for clean test
            vi.clearAllMocks();

            const mockOrchestrator = createSiteLoadingOrchestratorMock();
            // Direct property assignment since vi.mock doesn't intercept constructor calls
            (databaseManager as any).siteLoadingOrchestrator = mockOrchestrator;

            // First initialization
            await databaseManager.initialize();

            // Second initialization (should work without issues)
            await databaseManager.initialize();

            expect(mockDatabaseService.initialize).toHaveBeenCalledTimes(2);
            expect(
                mockOrchestrator.loadSitesFromDatabase
            ).toHaveBeenCalledTimes(2);
        });

        it("should handle configuration manager returning undefined rules", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue(undefined as any);

            await expect(
                databaseManager.setHistoryLimit(300)
            ).rejects.toThrowError(
                "[DatabaseManager.setHistoryLimit] History retention rules are not configured"
            );
        });

        it("should handle concurrent database operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            // Mock configuration manager to return proper limits
            vi.mocked(
                mockConfigurationManager.getHistoryRetentionRules
            ).mockReturnValue({
                defaultLimit: 500,
                maxLimit: 1000,
                minLimit: 25,
            });

            // Mock the repository methods that are actually called by the utility
            const mockSetInternal = vi.fn();
            const mockPruneAllHistoryInternal = vi.fn();

            // Use direct property assignment for repositories
            (databaseManager as any).dependencies.repositories.settings = {
                ...mockSettingsRepository,
                setInternal: mockSetInternal,
            };
            (databaseManager as any).dependencies.repositories.history = {
                ...mockHistoryRepository,
                pruneAllHistoryInternal: mockPruneAllHistoryInternal,
            };

            // Test concurrent setHistoryLimit calls
            const promises = [
                databaseManager.setHistoryLimit(100),
                databaseManager.setHistoryLimit(200),
                databaseManager.setHistoryLimit(300),
            ];

            await expect(Promise.all(promises)).resolves.toEqual([
                undefined,
                undefined,
                undefined,
            ]);

            const settingsAdapterMock = vi.mocked(
                (databaseManager as any).dependencies.repositories.settings
                    .createTransactionAdapter
            );

            let totalSetInvocations = 0;
            for (const invocation of settingsAdapterMock.mock.results) {
                if (invocation.type === "return") {
                    const adapter = invocation.value as {
                        set?: ReturnType<typeof vi.fn>;
                    };

                    if (adapter?.set) {
                        totalSetInvocations += adapter.set.mock.calls.length;
                    }
                }
            }

            expect(totalSetInvocations).toBe(3);
        });
    });
});
