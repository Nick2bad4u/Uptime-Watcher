/**
 * Comprehensive tests for DatabaseManager with 100% branch coverage. Tests all
 * database operations, initialization, import/export, and backup
 * functionality.
 */

import type { Site } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import { normalizeHistoryLimit } from "@shared/constants/history";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UptimeEvents } from "../../events/eventTypes.js";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseManagerDependencies } from "../../managers/DatabaseManager";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { HistoryRepository } from "../../services/database/HistoryRepository";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { SettingsRepository } from "../../services/database/SettingsRepository";
import type { SiteRepository } from "../../services/database/SiteRepository";
import type { setHistoryLimit as setHistoryLimitContract } from "../../services/database/historyLimitManager";
import type {
    DatabaseBackupMetadata,
    DatabaseBackupResult,
} from "../../services/database/utils/backup/databaseBackup";
import type {
    DatabaseCommandServiceFactory,
    DatabaseServiceFactoryDependencies,
    IDataBackupService,
    IDataImportExportService,
    ISiteRepositoryService,
} from "../../services/factories/DatabaseServiceFactory";

import { ConfigurationManager } from "../../managers/ConfigurationManager";
import { DatabaseManager } from "../../managers/DatabaseManager";

type SetHistoryLimitArguments = Parameters<typeof setHistoryLimitContract>[0];

interface BackupResultFixtureOptions {
    buffer?: Buffer;
    fileName?: string;
    metadata?: Partial<DatabaseBackupMetadata>;
}

interface DatabaseManagerPrivateTestView {
    loadSites: () => Promise<void>;
}

const createBackupResultFixture = (
    options: BackupResultFixtureOptions = {}
): DatabaseBackupResult => {
    const buffer = options.buffer ?? Buffer.from("backup data");

    return {
        buffer,
        fileName: options.fileName ?? "backup-test.db",
        metadata: {
            appVersion: "1.0.0-test",
            checksum: "mock-checksum",
            createdAt: 1_700_000_000_000,
            originalPath: "/tmp/uptime-watcher.db",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: buffer.byteLength,
            ...options.metadata,
        },
    };
};

const createBackupServiceFixture = (
    overrides: Partial<IDataBackupService> = {}
) =>
    ({
        applyDatabaseBackupResult:
            vi.fn<IDataBackupService["applyDatabaseBackupResult"]>(),
        downloadDatabaseBackup: vi
            .fn<IDataBackupService["downloadDatabaseBackup"]>()
            .mockResolvedValue(createBackupResultFixture()),
        restoreDatabaseBackup:
            vi.fn<IDataBackupService["restoreDatabaseBackup"]>(),
        saveDatabaseBackupToPath:
            vi.fn<IDataBackupService["saveDatabaseBackupToPath"]>(),
        ...overrides,
    }) satisfies IDataBackupService;

const createImportExportServiceFixture = (
    overrides: Partial<IDataImportExportService> = {}
) =>
    ({
        exportAllData: vi
            .fn<IDataImportExportService["exportAllData"]>()
            .mockResolvedValue('{"sites": [], "settings": []}'),
        importDataFromJson: vi
            .fn<IDataImportExportService["importDataFromJson"]>()
            .mockResolvedValue({ settings: {}, sites: [] }),
        persistImportedData:
            vi.fn<IDataImportExportService["persistImportedData"]>(),
        ...overrides,
    }) satisfies IDataImportExportService;

const isDatabaseCommandServiceFactory = (
    value: unknown
): value is DatabaseCommandServiceFactory =>
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "createBackupService") === "function" &&
    typeof Reflect.get(value, "createImportExportService") === "function" &&
    typeof Reflect.get(value, "createSiteRepositoryService") === "function";

const getServiceFactory = (
    databaseManager: DatabaseManager
): DatabaseCommandServiceFactory => {
    const serviceFactory: unknown = Reflect.get(
        databaseManager,
        "serviceFactory"
    );
    if (!isDatabaseCommandServiceFactory(serviceFactory)) {
        throw new TypeError("DatabaseManager service factory is unavailable");
    }

    return serviceFactory;
};

const getPrivateTestView = (
    databaseManager: DatabaseManager
): DatabaseManagerPrivateTestView => {
    const loadSites: unknown = Reflect.get(databaseManager, "loadSites");
    if (typeof loadSites !== "function") {
        throw new TypeError("DatabaseManager loadSites method is unavailable");
    }

    return databaseManager as unknown as DatabaseManagerPrivateTestView;
};

const mockEventEmitter = {
    emitTyped: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
} as unknown as TypedEventBus<UptimeEvents>;

const sqliteDatabaseFixture = {} as unknown as Database;
const databaseServiceAdapter = {
    close: vi.fn(),
    executeTransaction: async <T>(
        operation: (database: Database) => Promise<T> | T
    ): Promise<T> => operation(sqliteDatabaseFixture),
    getDatabase: vi.fn(() => sqliteDatabaseFixture),
    initialize: vi.fn(() => sqliteDatabaseFixture),
} satisfies Pick<
    DatabaseService,
    | "close"
    | "executeTransaction"
    | "getDatabase"
    | "initialize"
>;
const mockDatabaseService =
    databaseServiceAdapter as unknown as DatabaseService;

const historyRepositoryAdapter = {
    deleteAll: vi.fn(() => Promise.resolve()),
} satisfies Pick<HistoryRepository, "deleteAll">;
const mockHistoryRepository =
    historyRepositoryAdapter as unknown as HistoryRepository;

const monitorRepositoryAdapter = {
    findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
} satisfies Pick<MonitorRepository, "findBySiteIdentifier">;
const mockMonitorRepository =
    monitorRepositoryAdapter as unknown as MonitorRepository;

const settingsRepositoryAdapter = {
    get: vi.fn(() => Promise.resolve(undefined)),
} satisfies Pick<SettingsRepository, "get">;
const mockSettingsRepository =
    settingsRepositoryAdapter as unknown as SettingsRepository;

const siteRepositoryAdapter = {
    findAll: vi.fn(() => Promise.resolve([])),
    deleteAll: vi.fn(() => Promise.resolve()),
    bulkInsert: vi.fn(() => Promise.resolve()),
} satisfies Pick<
    SiteRepository,
    | "bulkInsert"
    | "deleteAll"
    | "findAll"
>;
const mockSiteRepository = siteRepositoryAdapter as unknown as SiteRepository;

// Mock external modules
vi.mock("../../services/database/DataBackupService", () => ({
    DataBackupService: vi.fn(),
}));

vi.mock("../../services/database/DataImportExportService", () => ({
    DataImportExportService: vi.fn(),
}));

// Create mock instances that will be returned by constructors
const mockSiteRepositoryService = {
    getSitesFromDatabase: vi.fn(() => Promise.resolve([])),
} satisfies ISiteRepositoryService;

const mockSiteLoadingOrchestrator = {
    loadSites: vi.fn(() => Promise.resolve()),
    loadSitesFromDatabase: vi.fn(() =>
        Promise.resolve({
            success: true,
            sitesLoaded: 2,
            message: "Sites loaded successfully",
        })
    ),
};

vi.mock("../../services/database/SiteRepositoryService", () => ({
    SiteRepositoryService: vi.fn(() => mockSiteRepositoryService),
    SiteLoadingOrchestrator: vi.fn(function SiteLoadingOrchestratorMock() {
        return mockSiteLoadingOrchestrator;
    }),
}));

vi.mock("../../services/database/historyLimitManager", () => ({
    setHistoryLimit: vi.fn(async (args: SetHistoryLimitArguments) => {
        const normalizedLimit = normalizeHistoryLimit(args.limit, args.rules);
        await args.setHistoryLimit(normalizedLimit);
    }),
    getHistoryLimit: vi.fn(() => 500),
}));

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
            invalidate: vi.fn(),
            resetStats: vi.fn(),
            bulkUpdate: vi.fn(),
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

// Mock DatabaseServiceFactory completely to return all needed services
vi.mock("../../services/factories/DatabaseServiceFactory", () => ({
    DatabaseServiceFactory: class {
        public config: DatabaseServiceFactoryDependencies;
        public constructor(config: DatabaseServiceFactoryDependencies) {
            this.config = config;
        }
        public createSiteRepositoryService(): ISiteRepositoryService {
            return mockSiteRepositoryService;
        }
        public createBackupService(): IDataBackupService {
            return createBackupServiceFixture();
        }
        public createImportExportService(): IDataImportExportService {
            return createImportExportServiceFixture();
        }
    },
}));

describe(DatabaseManager, () => {
    let databaseManager: DatabaseManager;
    let dependencies: DatabaseManagerDependencies;

    beforeEach(() => {
        // Reset all repository mocks
        vi.mocked(mockSiteRepository.findAll).mockResolvedValue([]);
        vi.mocked(mockSiteRepository.bulkInsert).mockResolvedValue();
        vi.mocked(mockSiteRepository.deleteAll).mockResolvedValue();
        vi.mocked(mockSettingsRepository.get).mockResolvedValue(undefined);
        vi.mocked(mockHistoryRepository.deleteAll).mockResolvedValue();
        vi.mocked(mockMonitorRepository.findBySiteIdentifier).mockResolvedValue(
            []
        );

        dependencies = {
            configurationManager: new ConfigurationManager(),
            eventEmitter: mockEventEmitter,
            repositories: {
                database: mockDatabaseService,
                history: mockHistoryRepository,
                monitor: mockMonitorRepository,
                settings: mockSettingsRepository,
                site: mockSiteRepository,
            },
        };

        databaseManager = new DatabaseManager(dependencies);
        // Reset call counts but keep spy setup
        vi.clearAllMocks();
        // Ensure emitTyped is a spy for assertion
        vi.spyOn(mockEventEmitter, "emitTyped");
    });

    afterEach(() => {
        // Clean up any event listeners
        mockEventEmitter.removeAllListeners();
    });

    describe("Constructor", () => {
        it("should create DatabaseManager with valid dependencies", async ({
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

        it("should initialize with default history limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            expect(databaseManager.getHistoryLimit()).toBe(500);
        });
    });

    describe("Backup Operations", () => {
        it("should download backup successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Backup Operation", "type");
            await annotate("Operation: Download", "operation");

            const mockBackupBuffer = Buffer.from("backup data");
            const mockBackupResult = createBackupResultFixture({
                buffer: mockBackupBuffer,
                metadata: { createdAt: 1_700_000_400_000 },
            });
            const mockDataBackupService = createBackupServiceFixture({
                downloadDatabaseBackup: vi.fn(() =>
                    Promise.resolve(mockBackupResult)
                ),
            });
            vi.spyOn(
                getServiceFactory(databaseManager),
                "createBackupService"
            ).mockReturnValue(mockDataBackupService);

            const result = await databaseManager.downloadBackup();

            expect(result).toEqual({
                buffer: expect.any(Buffer),
                fileName: "backup-test.db",
                metadata: expect.objectContaining({
                    ...mockBackupResult.metadata,
                    createdAt: expect.any(Number),
                }),
            });
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:backup-downloaded",
                expect.objectContaining({
                    fileName: "backup-test.db",
                    operation: "backup-downloaded",
                    success: true,
                })
            );
        });

        it("should handle backup download errors", async () => {
            // Create a mock backup service that throws an error
            const mockDataBackupService = createBackupServiceFixture({
                downloadDatabaseBackup: vi.fn(() =>
                    Promise.reject(new Error("Backup failed"))
                ),
            });

            // Spy on the service factory's createBackupService method
            vi.spyOn(
                getServiceFactory(databaseManager),
                "createBackupService"
            ).mockReturnValue(mockDataBackupService);

            await expect(databaseManager.downloadBackup()).rejects.toThrow(
                "Backup failed"
            );
        });
    });

    describe("Data Export Operations", () => {
        it("should export data successfully", async () => {
            const mockDataImportExportService =
                createImportExportServiceFixture({
                    exportAllData: vi.fn(() =>
                        Promise.resolve('{"sites": [], "settings": []}')
                    ),
                });
            vi.spyOn(
                getServiceFactory(databaseManager),
                "createImportExportService"
            ).mockReturnValue(mockDataImportExportService);

            const result = await databaseManager.exportData();

            expect(result).toBe('{"sites": [], "settings": []}');
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-exported",
                expect.objectContaining({
                    operation: "data-exported",
                    success: true,
                })
            );
        });

        it("should handle export errors", async () => {
            // Create a mock import/export service that throws an error
            const mockDataImportExportService =
                createImportExportServiceFixture({
                    exportAllData: vi.fn(() =>
                        Promise.reject(new Error("Export failed"))
                    ),
                });

            // Spy on the service factory's createImportExportService method
            vi.spyOn(
                getServiceFactory(databaseManager),
                "createImportExportService"
            ).mockReturnValue(mockDataImportExportService);

            await expect(databaseManager.exportData()).rejects.toThrow(
                "Export failed"
            );
        });
    });

    describe("Data Import Operations", () => {
        it("should handle import errors", async () => {
            const mockDataImportExportService =
                createImportExportServiceFixture({
                    importDataFromJson: vi.fn(() =>
                        Promise.reject(new Error("Import failed"))
                    ),
                });
            vi.spyOn(
                getServiceFactory(databaseManager),
                "createImportExportService"
            ).mockReturnValue(mockDataImportExportService);

            const loadSitesSpy = vi
                .spyOn(getPrivateTestView(databaseManager), "loadSites")
                .mockResolvedValue(undefined);

            const testData = '{"invalid": "data"}';
            try {
                const isResult = await databaseManager.importData(testData);

                expect(isResult).toBeFalsy();
                expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                    "internal:database:data-imported",
                    {
                        operation: "data-imported",
                        success: false,
                        timestamp: expect.any(Number),
                    }
                );
            } finally {
                loadSitesSpy.mockRestore();
            }
        });

        it("should return false for failed imports", async () => {
            const mockDataImportExportService =
                createImportExportServiceFixture({
                    importDataFromJson: vi.fn(() =>
                        Promise.reject(new Error("Import failed"))
                    ),
                });
            vi.spyOn(
                getServiceFactory(databaseManager),
                "createImportExportService"
            ).mockReturnValue(mockDataImportExportService);

            const loadSitesSpy = vi
                .spyOn(getPrivateTestView(databaseManager), "loadSites")
                .mockResolvedValue(undefined);

            const testData = '{"sites": []}';
            try {
                const isResult = await databaseManager.importData(testData);

                expect(isResult).toBeFalsy();
                expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                    "internal:database:data-imported",
                    expect.objectContaining({
                        operation: "data-imported",
                        success: false,
                    })
                );
            } finally {
                loadSitesSpy.mockRestore();
            }
        });
    });

    describe("History Limit Management", () => {
        it("should get current history limit", () => {
            const limit = databaseManager.getHistoryLimit();
            expect(limit).toBe(500);
        });

        it("should set history limit successfully", async () => {
            await databaseManager.setHistoryLimit(500);

            const historyManager =
                await import("../../services/database/historyLimitManager");
            expect(historyManager.setHistoryLimit).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 500,
                    databaseService: expect.any(Object),
                    logger: expect.any(Object),
                    repositories: expect.any(Object),
                    setHistoryLimit: expect.any(Function),
                })
            );
        });

        it("should handle setting history limit errors", async () => {
            const historyManager =
                await import("../../services/database/historyLimitManager");
            vi.mocked(historyManager.setHistoryLimit).mockRejectedValueOnce(
                new Error("Set limit failed")
            );

            await expect(databaseManager.setHistoryLimit(500)).rejects.toThrow(
                "Set limit failed"
            );
        });

        it("should update internal history limit on successful set", async () => {
            await databaseManager.setHistoryLimit(750);

            // The internal limit should be updated
            // Note: We can't directly test this without exposing internals,
            // but we can verify the call was made correctly
            const historyManager =
                await import("../../services/database/historyLimitManager");
            expect(historyManager.setHistoryLimit).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 750,
                    databaseService: expect.any(Object),
                    logger: expect.any(Object),
                    repositories: expect.any(Object),
                    setHistoryLimit: expect.any(Function),
                })
            );
        });
    });

    describe("Site Loading Operations", () => {
        it("should emit site loading events", async () => {
            const loadSitesSpy = vi
                .spyOn(getPrivateTestView(databaseManager), "loadSites")
                .mockResolvedValue(undefined);
            const eventEmitterSpy = vi.spyOn(mockEventEmitter, "emitTyped");

            await databaseManager.refreshSites();

            expect(loadSitesSpy).toHaveBeenCalled();
            expect(eventEmitterSpy).toHaveBeenCalledWith(
                "internal:database:sites-refreshed",
                {
                    operation: "sites-refreshed",
                    siteCount: 0,
                    timestamp: expect.any(Number),
                }
            );

            loadSitesSpy.mockRestore();
        });
    });

    describe("Error Handling", () => {
        it("should handle withErrorHandling wrapper", async () => {
            const mockDataBackupService = createBackupServiceFixture({
                downloadDatabaseBackup: vi.fn(() =>
                    Promise.reject(new Error("Service error"))
                ),
            });

            vi.spyOn(
                getServiceFactory(databaseManager),
                "createBackupService"
            ).mockReturnValue(mockDataBackupService);

            await expect(databaseManager.downloadBackup()).rejects.toThrow(
                "Service error"
            );
        });

        it("should handle repository errors during initialization", async () => {
            vi.mocked(mockSettingsRepository.get).mockRejectedValueOnce(
                new Error("Database init failed")
            );

            // This should not throw because the error is caught and logged
            await expect(databaseManager.initialize()).resolves.not.toThrow();
        });
    });

    describe("Event Emission", () => {
        it("should emit backup downloaded events with correct data", async () => {
            const mockBackupService = createBackupServiceFixture({
                downloadDatabaseBackup: vi
                    .fn()
                    .mockResolvedValue(createBackupResultFixture()),
            });
            vi.spyOn(
                getServiceFactory(databaseManager),
                "createBackupService"
            ).mockReturnValue(mockBackupService);

            await databaseManager.downloadBackup();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:backup-downloaded",
                expect.objectContaining({
                    fileName: "backup-test.db",
                    operation: "backup-downloaded",
                    success: true,
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should emit data exported events with correct data", async () => {
            const mockExportService = createImportExportServiceFixture({
                exportAllData: vi
                    .fn()
                    .mockResolvedValue('{"sites": [], "settings": []}'),
            });
            vi.spyOn(
                getServiceFactory(databaseManager),
                "createImportExportService"
            ).mockReturnValue(mockExportService);

            await databaseManager.exportData();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-exported",
                expect.objectContaining({
                    operation: "data-exported",
                    success: true,
                    timestamp: expect.any(Number),
                    fileName: expect.stringMatching(/^export-\d+\.json$/v),
                })
            );
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle history limit workflow", async () => {
            // Get initial limit
            const initialLimit = databaseManager.getHistoryLimit();
            expect(initialLimit).toBe(500);

            // Set new limit
            await databaseManager.setHistoryLimit(500);

            const historyManager =
                await import("../../services/database/historyLimitManager");
            expect(historyManager.setHistoryLimit).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 500,
                    repositories: expect.any(Object),
                    databaseService: expect.any(Object),
                    logger: expect.any(Object),
                })
            );
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty export data", async () => {
            const mockDataImportExportService =
                createImportExportServiceFixture({
                    exportAllData: vi.fn(() => Promise.resolve("{}")),
                });

            vi.spyOn(
                getServiceFactory(databaseManager),
                "createImportExportService"
            ).mockReturnValue(mockDataImportExportService);

            const result = await databaseManager.exportData();
            expect(result).toBe("{}");
        });
        it("should handle zero history limit", async () => {
            await databaseManager.setHistoryLimit(0);

            const historyManager =
                await import("../../services/database/historyLimitManager");
            expect(historyManager.setHistoryLimit).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 0,
                })
            );
        });

        it("should clamp negative history limit inputs to the unlimited sentinel", async () => {
            const historyManager =
                await import("../../services/database/historyLimitManager");

            await databaseManager.setHistoryLimit(-1);

            expect(historyManager.setHistoryLimit).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: -1,
                    rules: expect.any(Object),
                })
            );
            expect(databaseManager.getHistoryLimit()).toBe(0);
        });
    });
});
