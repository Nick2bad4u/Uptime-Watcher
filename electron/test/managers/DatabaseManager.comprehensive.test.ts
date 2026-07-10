/**
 * Fixed DatabaseManager comprehensive tests - targeting 90%+ branch coverage
 * Focuses on error paths and edge cases not covered by existing tests
 */

import type { Site } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";
import { mockConstructableReturnValue } from "@shared/test/helpers/vitestConstructors";
import {
    beforeEach,
    describe,
    expect,
    it,
    type MockInstance,
    vi,
} from "vitest";

import type { UptimeEvents } from "../../events/eventTypes.js";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { ConfigurationManager } from "../../managers/ConfigurationManager";
import type {
    DatabaseManagerDependencies,
    DatabaseManager as DatabaseManagerType,
} from "../../managers/DatabaseManager";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type {
    HistoryRepository,
    HistoryRepositoryTransactionAdapter,
} from "../../services/database/HistoryRepository";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type {
    SettingsRepository,
    SettingsRepositoryTransactionAdapter,
} from "../../services/database/SettingsRepository";
import type { SiteRepository } from "../../services/database/SiteRepository";

import { DatabaseManager } from "../../managers/DatabaseManager";
// Import the mocked classes for use in tests
import { SiteLoadingOrchestrator } from "../../services/database/SiteRepositoryService";

// Mock database commands FIRST using vi.hoisted
const { DatabaseCommandExecutor } = vi.hoisted(() => {
    const mockExecutor = vi.fn(function DatabaseCommandExecutorMock() {
        const executeMethod = vi.fn().mockImplementation((command: unknown) => {
            const constructor =
                typeof command === "object" && command !== null
                    ? Reflect.get(command, "constructor")
                    : undefined;
            const commandName =
                typeof constructor === "function"
                    ? constructor.name
                    : undefined;

            // Return appropriate values based on command type
            if (commandName === "ImportDataCommand") {
                return Promise.resolve(true);
            }
            if (commandName === "DownloadBackupCommand") {
                return Promise.resolve("/path/to/backup.json");
            }
            if (commandName === "ExportDataCommand") {
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
vi.mock("../../services/database/SiteRepositoryService", () => ({
    SiteRepositoryService: vi.fn(function SiteRepositoryServiceMock() {
        return {
            getSitesFromDatabase: vi.fn().mockResolvedValue([]),
        };
    }),
    SiteLoadingOrchestrator: vi.fn(function SiteLoadingOrchestratorMock(
        siteRepositoryService: unknown
    ) {
        const record = siteRepositoryService as Record<string, unknown>;

        const getSitesFromDatabase =
            typeof record["getSitesFromDatabase"] === "function"
                ? (record["getSitesFromDatabase"] as ReturnType<typeof vi.fn>)
                : vi.fn().mockResolvedValue([]);

        return {
            loadSitesFromDatabase: vi.fn().mockResolvedValue({
                success: true,
                sitesLoaded: 0,
                message: "Success",
            }),
            siteRepositoryService: {
                getSitesFromDatabase,
            },
        };
    }),
}));

// Mock serviceFactory
vi.mock("../../services/database/serviceFactory", () => ({
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
            replaceAll: vi.fn((items: { data: Site; key: string }[]) => {
                store.clear();
                for (const { key, data } of items) {
                    store.set(key, data);
                }
            }),
            keys: vi.fn(() => [...store.keys()]),
            values: vi.fn(() => [...store.values()]),
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

const configurationManagerFixture = {
    getHistoryRetentionRules: vi.fn().mockReturnValue({
        defaultLimit: 500,
        maxLimit: 1000,
        minLimit: 25,
    }),
};
const mockConfigurationManager =
    configurationManagerFixture as unknown as ConfigurationManager;

const sqliteDatabaseFixture = {} as unknown as Database;
const databaseServiceFixture = {
    initialize: vi.fn(() => Promise.resolve()),
    close: vi.fn(),
    getDatabase: vi.fn(() => sqliteDatabaseFixture),
    executeTransaction: vi.fn(
        async <T>(
            callback: (database: Database) => Promise<T> | T
        ): Promise<T> => callback(sqliteDatabaseFixture)
    ),
};
const mockDatabaseService =
    databaseServiceFixture as unknown as DatabaseService;

const historyRepositoryFixture = {
    createTransactionAdapter: vi.fn(),
    findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
    deleteAll: vi.fn(() => Promise.resolve()),
    deleteOldHistoryEntriesBySiteId: vi.fn(() => Promise.resolve()),
    pruneAllHistoryInternal: vi.fn(),
    deleteAllInternal: vi.fn(),
};
const mockHistoryRepository =
    historyRepositoryFixture as unknown as HistoryRepository;

const monitorRepositoryFixture = {
    findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
    findByIdentifier: vi.fn(() => Promise.resolve(undefined)),
    getAllMonitorIds: vi.fn(() => Promise.resolve([])),
    deleteAllInternal: vi.fn(),
};
const mockMonitorRepository =
    monitorRepositoryFixture as unknown as MonitorRepository;

const settingsRepositoryFixture = {
    createTransactionAdapter: vi.fn(),
    findByKey: vi.fn(() => Promise.resolve(undefined)),
    get: vi.fn(() => Promise.resolve(undefined)),
    upsert: vi.fn(() => Promise.resolve()),
    setInternal: vi.fn(),
    deleteAllInternal: vi.fn(),
    exportAllRows: vi.fn(() => Promise.resolve([])),
};
const mockSettingsRepository =
    settingsRepositoryFixture as unknown as SettingsRepository;

const siteRepositoryFixture = {
    findAll: vi.fn(() => Promise.resolve([])),
    findByIdentifier: vi.fn(() => Promise.resolve(undefined)),
    upsert: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve(true)),
    deleteAll: vi.fn(() => Promise.resolve()),
    exists: vi.fn(() => Promise.resolve(false)),
    bulkInsert: vi.fn(() => Promise.resolve()),
    exportAllRows: vi.fn(() => Promise.resolve([])),
    bulkInsertInternal: vi.fn(),
    deleteAllInternal: vi.fn(),
};
const mockSiteRepository = siteRepositoryFixture as unknown as SiteRepository;

const initializeTransactionAdapters = (): void => {
    vi.mocked(mockSettingsRepository.setInternal).mockReset();
    vi.mocked(mockHistoryRepository.pruneAllHistoryInternal).mockReset();

    vi.mocked(
        mockSettingsRepository.createTransactionAdapter
    ).mockImplementation(
        (database: Database): SettingsRepositoryTransactionAdapter => ({
            bulkInsert: vi.fn(),
            deleteAll: vi.fn(() =>
                mockSettingsRepository.deleteAllInternal(database)
            ),
            deleteByKey: vi.fn(),
            set: vi.fn((key: string, value: string) =>
                mockSettingsRepository.setInternal(database, key, value)
            ),
        })
    );

    vi.mocked(
        mockHistoryRepository.createTransactionAdapter
    ).mockImplementation(
        (database: Database): HistoryRepositoryTransactionAdapter => ({
            addEntry: vi.fn(),
            deleteAll: vi.fn(() =>
                mockHistoryRepository.deleteAllInternal(database)
            ),
            deleteByMonitorId: vi.fn(),
            getHistoryCount: vi.fn(() => 0),
            pruneAllHistory: vi.fn((limit: number) =>
                mockHistoryRepository.pruneAllHistoryInternal(database, limit)
            ),
        })
    );
};

// Helper function to create proper mocks
const createSiteLoadingOrchestratorFixture = () => ({
    loadSitesFromDatabase: vi.fn().mockResolvedValue({
        success: true,
        sitesLoaded: 0,
        message: "Success",
    }),
    siteRepositoryService: {
        getSitesFromDatabase: vi.fn().mockResolvedValue([]),
    },
});
type SiteLoadingOrchestratorFixture = ReturnType<
    typeof createSiteLoadingOrchestratorFixture
>;

const createSiteLoadingOrchestratorMock = (
    overrides: Partial<SiteLoadingOrchestratorFixture> = {}
): SiteLoadingOrchestratorFixture => ({
    ...createSiteLoadingOrchestratorFixture(),
    ...overrides,
});

/**
 * Configure the mocked {@link SiteLoadingOrchestrator} constructor.
 *
 * @remarks
 * `mockReturnValue` internally sets an arrow implementation (`() => value`)
 * which is not constructable and breaks `new SiteLoadingOrchestrator(...)`.
 */
const setSiteLoadingOrchestratorMock = (
    orchestrator: SiteLoadingOrchestratorFixture
): void => {
    type SiteLoadingOrchestratorConstructorMock = MockInstance<
        (
            ...args: ConstructorParameters<typeof SiteLoadingOrchestrator>
        ) => SiteLoadingOrchestrator
    >;

    mockConstructableReturnValue(
        vi.mocked(
            SiteLoadingOrchestrator
        ) as unknown as SiteLoadingOrchestratorConstructorMock,
        orchestrator as unknown as SiteLoadingOrchestrator
    );
};

const setPrivateCollaborator = (
    databaseManager: DatabaseManagerType,
    property: "commandExecutor" | "siteLoadingOrchestrator",
    value: unknown
): void => {
    expect(Reflect.set(databaseManager, property, value)).toBeTruthy();
};

describe("DatabaseManager - Comprehensive Error Coverage", () => {
    let databaseManager: DatabaseManagerType;
    let mockDeps: DatabaseManagerDependencies;
    let mockOrchestrator: SiteLoadingOrchestratorFixture;

    beforeEach(async () => {
        vi.clearAllMocks();

        initializeTransactionAdapters();

        // Set up the orchestrator mock before creating DatabaseManager
        mockOrchestrator = createSiteLoadingOrchestratorMock();
        setSiteLoadingOrchestratorMock(mockOrchestrator);

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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

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

        it("should fall back to default when persisted history limit uses exponent notation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            vi.mocked(mockSettingsRepository.get).mockResolvedValue("1e3");

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

            setPrivateCollaborator(
                databaseManager,
                "siteLoadingOrchestrator",
                mockOrchestrator
            );

            // Should throw when loadSitesFromDatabase fails
            await expect(databaseManager.initialize()).rejects.toThrow(
                "Failed to load sites"
            );
        });

        it("should sanitize failed loadSitesFromDatabase messages before throwing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Data Loading", "type");

            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    message:
                        "Failed to load sites\naccess_token=database-load-secret-token",
                    sitesLoaded: 0,
                    success: false,
                }),
            });

            setPrivateCollaborator(
                databaseManager,
                "siteLoadingOrchestrator",
                mockOrchestrator
            );

            let thrownError: unknown;
            try {
                await databaseManager.initialize();
            } catch (error: unknown) {
                thrownError = error;
            }

            expect(thrownError).toBeInstanceOf(Error);
            expect((thrownError as Error).message).toContain(
                "access_token=[redacted]"
            );
            expect((thrownError as Error).message).not.toContain(
                "database-load-secret-token"
            );
            expect((thrownError as Error).message).not.toMatch(/[\n\r]/u);
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
            setPrivateCollaborator(
                databaseManager,
                "siteLoadingOrchestrator",
                mockOrchestrator
            );

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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

            setPrivateCollaborator(
                databaseManager,
                "siteLoadingOrchestrator",
                mockOrchestrator
            );

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

            await expect(databaseManager.initialize()).rejects.toThrow(
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

            const mockExecute = vi
                .fn()
                .mockRejectedValue(new Error("Import failed"));
            setPrivateCollaborator(databaseManager, "commandExecutor", {
                clear: vi.fn(),
                execute: mockExecute,
                rollbackAll: vi.fn(),
            });

            // Mock first event emission to succeed, second to fail
            vi.mocked(mockEventEmitter.emitTyped)
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("Event emission failed"));

            const isResult = await databaseManager.importData('{"sites": []}');
            expect(isResult).toBeFalsy();
        });

        it("should handle successful importData flow", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Import Operation", "type");

            // Mock the command executor to succeed for ImportDataCommand
            const mockExecute = vi.fn().mockResolvedValue(true);
            setPrivateCollaborator(databaseManager, "commandExecutor", {
                clear: vi.fn(),
                execute: mockExecute,
                rollbackAll: vi.fn(),
            });

            const isResult = await databaseManager.importData(
                '{"sites": [{"identifier": "site1"}], "settings": []}'
            );

            expect(isResult).toBeTruthy();
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
            vi.mocked(mockSettingsRepository.setInternal).mockImplementation(
                () => {
                    throw new Error("Failed to set limit");
                }
            );

            await expect(databaseManager.setHistoryLimit(100)).rejects.toThrow(
                "Failed to set limit"
            );
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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

            setPrivateCollaborator(
                databaseManager,
                "siteLoadingOrchestrator",
                mockOrchestrator
            );

            vi.mocked(mockEventEmitter.emitTyped).mockImplementation(
                async (eventName, _payload) => {
                    if (
                        eventName === "internal:site:stop-monitoring-requested"
                    ) {
                        throw new Error("Stop event failed");
                    }
                }
            );

            await expect(databaseManager.initialize()).rejects.toThrow(
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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

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
            setSiteLoadingOrchestratorMock(mockOrchestrator);

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
            setPrivateCollaborator(
                databaseManager,
                "siteLoadingOrchestrator",
                mockOrchestrator
            );

            // Should propagate the error
            await expect(databaseManager.initialize()).rejects.toThrow(
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
            setPrivateCollaborator(databaseManager, "commandExecutor", {
                clear: vi.fn(),
                execute: mockExecute,
                rollbackAll: vi.fn().mockResolvedValue(undefined),
            });

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
            setPrivateCollaborator(databaseManager, "commandExecutor", {
                clear: vi.fn(),
                execute: mockExecute,
                rollbackAll: vi.fn().mockResolvedValue(undefined),
            });

            await expect(databaseManager.downloadBackup()).rejects.toThrow(
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
            const mockSetInternal = vi.fn<SettingsRepository["setInternal"]>();
            const mockPruneAllHistoryInternal =
                vi.fn<HistoryRepository["pruneAllHistoryInternal"]>();

            vi.mocked(mockSettingsRepository.setInternal).mockImplementation(
                mockSetInternal
            );
            vi.mocked(
                mockHistoryRepository.pruneAllHistoryInternal
            ).mockImplementation(mockPruneAllHistoryInternal);

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
            await expect(databaseManager.setHistoryLimit(1500)).rejects.toThrow(
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
            const mockSetInternal = vi.fn<SettingsRepository["setInternal"]>();
            const mockPruneAllHistoryInternal =
                vi.fn<HistoryRepository["pruneAllHistoryInternal"]>();

            vi.mocked(mockSettingsRepository.setInternal).mockImplementation(
                mockSetInternal
            );
            vi.mocked(
                mockHistoryRepository.pruneAllHistoryInternal
            ).mockImplementation(mockPruneAllHistoryInternal);

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
            vi.mocked(mockSettingsRepository.setInternal).mockImplementation(
                () => {
                    throw new Error("Database write error");
                }
            );

            await expect(databaseManager.setHistoryLimit(200)).rejects.toThrow(
                "Database write error"
            );
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
            setPrivateCollaborator(
                databaseManager,
                "siteLoadingOrchestrator",
                mockOrchestrator
            );

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

            expect(
                Reflect.set(
                    mockConfigurationManager,
                    "getHistoryRetentionRules",
                    vi.fn(() => undefined)
                )
            ).toBeTruthy();

            await expect(databaseManager.setHistoryLimit(300)).rejects.toThrow(
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
            const mockSetInternal = vi.fn<SettingsRepository["setInternal"]>();
            const mockPruneAllHistoryInternal =
                vi.fn<HistoryRepository["pruneAllHistoryInternal"]>();

            vi.mocked(mockSettingsRepository.setInternal).mockImplementation(
                mockSetInternal
            );
            vi.mocked(
                mockHistoryRepository.pruneAllHistoryInternal
            ).mockImplementation(mockPruneAllHistoryInternal);

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

            expect(mockSetInternal).toHaveBeenCalledTimes(3);
        });
    });
});
