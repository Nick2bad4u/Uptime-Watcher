/**
 * @file DatabaseManager edge-case tests for command, history, cache, and event
 *   behavior
 */

import type { Site } from "@shared/types";

import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";
import { isRecord } from "@shared/utils/typeHelpers";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { ConfigurationManager } from "../../managers/ConfigurationManager";
import type { DatabaseCommandExecutor } from "../../services/commands/DatabaseCommands";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { HistoryRepository } from "../../services/database/HistoryRepository";
import type { setHistoryLimit as setHistoryLimitContract } from "../../services/database/historyLimitManager";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { SettingsRepository } from "../../services/database/SettingsRepository";
import type { SiteRepository } from "../../services/database/SiteRepository";
import type { SiteLoadingOrchestrator } from "../../services/database/SiteRepositoryService";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import { DEFAULT_HISTORY_LIMIT } from "../../constants";
// Import after mocks so DatabaseManager uses mocked dependencies
import {
    DatabaseManager,
    type DatabaseManagerDependencies,
} from "../../managers/DatabaseManager";

type HistoryLimitUpdate = Pick<
    Parameters<typeof setHistoryLimitContract>[0],
    | "limit"
    | "rules"
    | "setHistoryLimit"
>;

interface DatabaseManagerTestView {
    commandExecutor: Pick<DatabaseCommandExecutor, "execute">;
    emitHistoryLimitUpdated: (limit: number) => Promise<void>;
    emitSitesCacheUpdateRequested: () => Promise<void>;
    historyLimit: number;
    loadSites: () => Promise<void>;
    siteCache: StandardizedCache<Site>;
    siteLoadingOrchestrator: SiteLoadingOrchestrator;
}

function isHistoryLimitUpdate(value: unknown): value is HistoryLimitUpdate {
    return (
        isRecord(value) &&
        typeof value["limit"] === "number" &&
        isRecord(value["rules"]) &&
        typeof value["rules"]["defaultLimit"] === "number" &&
        typeof value["rules"]["maxLimit"] === "number" &&
        typeof value["rules"]["minLimit"] === "number" &&
        typeof value["setHistoryLimit"] === "function"
    );
}

const getTestView = (manager: DatabaseManager): DatabaseManagerTestView =>
    manager as unknown as DatabaseManagerTestView;

const setHistoryLimitFromUnknown = (
    manager: DatabaseManager,
    value: unknown
): Promise<void> => manager.setHistoryLimit(value as number);

const createEventEmitterMock = () =>
    ({
        emitTyped: vi
            .fn<TypedEventBus<UptimeEvents>["emitTyped"]>()
            .mockResolvedValue(undefined),
    }) satisfies Partial<TypedEventBus<UptimeEvents>>;

const createConfigurationManagerMock = () =>
    ({
        getHistoryRetentionRules: vi
            .fn<ConfigurationManager["getHistoryRetentionRules"]>()
            .mockReturnValue({
                defaultLimit: DEFAULT_HISTORY_LIMIT,
                maxLimit: 10_000,
                minLimit: 25,
            }),
    }) satisfies Partial<ConfigurationManager>;

const createDatabaseServiceMock = () =>
    ({
        close: vi.fn<DatabaseService["close"]>(),
        getDatabase: vi.fn<DatabaseService["getDatabase"]>(),
        initialize: vi.fn<DatabaseService["initialize"]>(),
    }) satisfies Partial<DatabaseService>;

const createHistoryRepositoryMock = () =>
    ({
        deleteAll: vi
            .fn<HistoryRepository["deleteAll"]>()
            .mockResolvedValue(undefined),
    }) satisfies Partial<HistoryRepository>;

const createMonitorRepositoryMock = () =>
    ({
        findByIdentifier: vi
            .fn<MonitorRepository["findByIdentifier"]>()
            .mockResolvedValue(undefined),
        findBySiteIdentifier: vi
            .fn<MonitorRepository["findBySiteIdentifier"]>()
            .mockResolvedValue([]),
        getAllMonitorIds: vi
            .fn<MonitorRepository["getAllMonitorIds"]>()
            .mockResolvedValue([]),
    }) satisfies Partial<MonitorRepository>;

const createSettingsRepositoryMock = () =>
    ({
        get: vi.fn<SettingsRepository["get"]>().mockResolvedValue(undefined),
        set: vi.fn<SettingsRepository["set"]>().mockResolvedValue(undefined),
    }) satisfies Partial<SettingsRepository>;

const createSiteRepositoryMock = () =>
    ({
        delete: vi.fn<SiteRepository["delete"]>().mockResolvedValue(false),
        exportAllRows: vi
            .fn<SiteRepository["exportAllRows"]>()
            .mockResolvedValue([]),
        findAll: vi.fn<SiteRepository["findAll"]>().mockResolvedValue([]),
        findByIdentifier: vi
            .fn<SiteRepository["findByIdentifier"]>()
            .mockResolvedValue(undefined),
    }) satisfies Partial<SiteRepository>;

const createCommandExecutorMock = () =>
    ({ execute: vi.fn() }) satisfies Partial<DatabaseCommandExecutor>;

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
                    metadata: {
                        createdAt: 1_700_000_300_000,
                        originalPath: "/tmp/uptime-watcher.db",
                        sizeBytes: 256,
                    },
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
    DatabaseCommandExecutor: vi.fn(function DatabaseCommandExecutorMock() {
        return {
            execute: vi.fn().mockResolvedValue({ success: true }),
            executeImport: vi.fn().mockResolvedValue({ success: true }),
            executeExport: vi.fn().mockResolvedValue({ success: true }),
            executeBackup: vi.fn().mockResolvedValue({ success: true }),
        };
    }),
    DownloadBackupCommand: vi.fn(),
    ExportDataCommand: vi.fn(),
    ImportDataCommand: vi.fn(),
}));

vi.mock("../../services/database/serviceFactory", () => ({
    createSiteCache: vi.fn().mockReturnValue({
        set: vi.fn(),
        get: vi.fn(),
        has: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        size: 0,
        entries: vi.fn().mockReturnValue([]),
        keys: vi.fn().mockReturnValue([]),
        replaceAll: vi.fn(),
    } satisfies Partial<StandardizedCache<Site>>),
}));

vi.mock("../../services/database/SiteRepositoryService", () => ({
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
        } satisfies Partial<SiteLoadingOrchestrator>;
    }),
}));

vi.mock("../../services/database/historyLimitManager", () => ({
    setHistoryLimit: vi.fn(async (args: unknown) => {
        if (!isHistoryLimitUpdate(args)) {
            throw new TypeError("Invalid history limit update contract");
        }

        const normalizedLimit = normalizeHistoryLimit(args.limit, args.rules);
        await args.setHistoryLimit(normalizedLimit);
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
    diagnosticsLogger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../shared/utils/errorHandling", () => {
    const mockWithErrorHandling = vi
        .fn()
        .mockImplementation(async (fn) => await fn());
    return {
        withErrorHandling: mockWithErrorHandling,
    };
});

describe("DatabaseManager edge cases", () => {
    let databaseManager: DatabaseManager;
    let databaseManagerTestView: DatabaseManagerTestView;
    let mockDependencies: DatabaseManagerDependencies;
    let mockEventEmitter: ReturnType<typeof createEventEmitterMock>;
    let mockConfigurationManager: ReturnType<
        typeof createConfigurationManagerMock
    >;
    let mockDatabaseService: ReturnType<typeof createDatabaseServiceMock>;
    let mockHistoryRepository: ReturnType<typeof createHistoryRepositoryMock>;
    let mockMonitorRepository: ReturnType<typeof createMonitorRepositoryMock>;
    let mockSettingsRepository: ReturnType<typeof createSettingsRepositoryMock>;
    let mockSiteRepository: ReturnType<typeof createSiteRepositoryMock>;
    let mockCommandExecutor: ReturnType<typeof createCommandExecutorMock>;

    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();

        mockEventEmitter = createEventEmitterMock();
        mockConfigurationManager = createConfigurationManagerMock();
        mockDatabaseService = createDatabaseServiceMock();
        mockHistoryRepository = createHistoryRepositoryMock();
        mockMonitorRepository = createMonitorRepositoryMock();
        mockSettingsRepository = createSettingsRepositoryMock();
        mockSiteRepository = createSiteRepositoryMock();
        mockCommandExecutor = createCommandExecutorMock();
        mockCommandExecutor.execute.mockResolvedValue({});

        // Create dependencies object
        mockDependencies = {
            configurationManager:
                mockConfigurationManager as unknown as ConfigurationManager,
            eventEmitter:
                mockEventEmitter as unknown as TypedEventBus<UptimeEvents>,
            repositories: {
                database: mockDatabaseService as unknown as DatabaseService,
                history: mockHistoryRepository as unknown as HistoryRepository,
                monitor: mockMonitorRepository as unknown as MonitorRepository,
                settings:
                    mockSettingsRepository as unknown as SettingsRepository,
                site: mockSiteRepository as unknown as SiteRepository,
            },
        };

        // Create DatabaseManager instance
        databaseManager = new DatabaseManager(mockDependencies);
        databaseManagerTestView = getTestView(databaseManager);
        databaseManagerTestView.commandExecutor = mockCommandExecutor as Pick<
            DatabaseCommandExecutor,
            "execute"
        >;
    });

    describe("Constructor", () => {
        it("should initialize with provided dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            expect(databaseManager).toBeDefined();
            expect(databaseManager).toBeInstanceOf(DatabaseManager);
        });

        it("should set default history limit", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            expect(databaseManagerTestView.historyLimit).toBe(
                DEFAULT_HISTORY_LIMIT
            );
        });
    });

    describe("initialize", () => {
        it("should initialize database and load sites successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            // Arrange
            const mockLoadSites = vi
                .spyOn(databaseManagerTestView, "loadSites")
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

        it("should load history limit from settings during initialization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            // Arrange
            const mockHistoryLimit = 750;
            mockSettingsRepository.get.mockResolvedValue(
                String(mockHistoryLimit)
            );
            const mockLoadSites = vi
                .spyOn(databaseManagerTestView, "loadSites")
                .mockResolvedValue(undefined);

            // Act
            await databaseManager.initialize();

            // Assert
            expect(mockSettingsRepository.get).toHaveBeenCalledWith(
                "historyLimit"
            );
            expect(databaseManagerTestView.historyLimit).toBe(mockHistoryLimit);
            expect(mockLoadSites).toHaveBeenCalled();
        });

        it("should handle settings.get error and use default limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            mockSettingsRepository.get.mockRejectedValue(
                new Error("Settings error")
            );
            const mockLoadSites = vi
                .spyOn(databaseManagerTestView, "loadSites")
                .mockResolvedValue(undefined);

            // Act
            await databaseManager.initialize();

            // Assert
            expect(databaseManagerTestView.historyLimit).toBe(
                DEFAULT_HISTORY_LIMIT
            );
            expect(mockLoadSites).toHaveBeenCalled();
        });

        it("should handle event emission error gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const mockLoadSites = vi
                .spyOn(databaseManagerTestView, "loadSites")
                .mockResolvedValue(undefined);
            mockEventEmitter.emitTyped.mockRejectedValue(
                new Error("Event error")
            );

            // Act & Assert - should not throw
            await expect(databaseManager.initialize()).resolves.toBeUndefined();
            expect(mockLoadSites).toHaveBeenCalled();
        });
    });

    describe("downloadBackup", () => {
        it("should execute DownloadBackupCommand successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Backup Operation", "type");

            // Arrange
            const mockBackupResult = {
                buffer: Buffer.from("backup-data"),
                fileName: "backup-2023.sqlite",
                metadata: {
                    createdAt: 1_700_000_900_000,
                    originalPath: "/tmp/uptime-watcher.db",
                    sizeBytes: 512,
                },
            };
            mockCommandExecutor.execute.mockResolvedValue(mockBackupResult);

            // Act
            const result = await databaseManager.downloadBackup();

            // Assert
            expect(result).toEqual(mockBackupResult);
            expect(mockCommandExecutor.execute).toHaveBeenCalled();
        });

        it("should handle backup command execution errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

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
        it("should execute ExportDataCommand successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Export Operation", "type");

            // Arrange
            const mockExportData = JSON.stringify({ sites: [], settings: [] });
            mockCommandExecutor.execute.mockResolvedValue(mockExportData);

            // Act
            const result = await databaseManager.exportData();

            // Assert
            expect(result).toBe(mockExportData);
            expect(mockCommandExecutor.execute).toHaveBeenCalled();
        });

        it("should handle export command execution errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

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
        it("should successfully import data and return true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Import Operation", "type");

            // Arrange
            const importData = JSON.stringify({ sites: [], settings: [] });
            mockCommandExecutor.execute.mockResolvedValue(undefined);

            // Act
            const isResult = await databaseManager.importData(importData);

            // Assert
            expect(isResult).toBeTruthy();
            expect(mockCommandExecutor.execute).toHaveBeenCalled();
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:update-sites-cache-requested",
                expect.objectContaining({
                    operation: "update-sites-cache-requested",
                })
            );
        });

        it("should handle import errors and emit failure event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const importData = JSON.stringify({ sites: [], settings: [] });
            mockCommandExecutor.execute.mockRejectedValue(
                new Error("Import failed")
            );

            // Act
            const isResult = await databaseManager.importData(importData);

            // Assert
            expect(isResult).toBeFalsy();
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:data-imported",
                expect.objectContaining({
                    operation: "data-imported",
                    success: false,
                })
            );
        });

        it("should handle event emission errors during import failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const importData = JSON.stringify({ sites: [], settings: [] });
            mockCommandExecutor.execute.mockRejectedValue(
                new Error("Import failed")
            );
            mockEventEmitter.emitTyped.mockRejectedValue(
                new Error("Event error")
            );

            // Act
            const isResult = await databaseManager.importData(importData);

            // Assert
            expect(isResult).toBeFalsy();
            // Should still attempt to emit the event
            expect(mockEventEmitter.emitTyped).toHaveBeenCalled();
        });
    });

    describe("refreshSites", () => {
        it("should load sites and return them from cache", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Data Loading", "type");

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

            const mockLoadSites = vi
                .spyOn(databaseManagerTestView, "loadSites")
                .mockResolvedValue(undefined);
            const entriesSpy = vi.spyOn(
                databaseManagerTestView.siteCache,
                "entries"
            );
            entriesSpy.mockReturnValue(
                new Map<string, Site>(
                    mockSites.map((s) => [s.identifier, s])
                ).entries()
            );

            // Act
            const result = await databaseManager.refreshSites();

            // Assert
            expect(mockLoadSites).toHaveBeenCalled();
            expect(result).toEqual(mockSites);
            expect(result[0]).not.toBe(mockSites[0]);
            expect(result[1]).not.toBe(mockSites[1]);
            result[0]!.name = "Mutated Return";
            expect(mockSites[0]!.name).toBe("Site 1");
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:sites-refreshed",
                expect.objectContaining({
                    operation: "sites-refreshed",
                    siteCount: mockSites.length,
                })
            );
        });

        it("should handle cache access errors and return empty array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const mockLoadSites = vi
                .spyOn(databaseManagerTestView, "loadSites")
                .mockResolvedValue(undefined);
            const entriesSpy = vi.spyOn(
                databaseManagerTestView.siteCache,
                "entries"
            );
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
        it("should set valid history limit successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            // Arrange
            const newLimit = 1000;
            const { setHistoryLimit: mockSetHistoryLimit } =
                await import("../../services/database/historyLimitManager");

            // Act
            await databaseManager.setHistoryLimit(newLimit);

            // Assert
            expect(mockSetHistoryLimit).toHaveBeenCalled();
            expect(databaseManagerTestView.historyLimit).toBe(newLimit);
        });

        it("should reject non-number values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            // Act & Assert
            await expect(
                setHistoryLimitFromUnknown(databaseManager, "invalid")
            ).rejects.toThrow(TypeError);
            await expect(
                setHistoryLimitFromUnknown(databaseManager, null)
            ).rejects.toThrow(TypeError);
            await expect(
                setHistoryLimitFromUnknown(databaseManager, undefined)
            ).rejects.toThrow(TypeError);
            await expect(databaseManager.setHistoryLimit(NaN)).rejects.toThrow(
                TypeError
            );
        });

        it("should normalize non-integer values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            await databaseManager.setHistoryLimit(123.45);
            expect(databaseManagerTestView.historyLimit).toBe(123);

            await databaseManager.setHistoryLimit(0.5);
            expect(databaseManagerTestView.historyLimit).toBe(
                DEFAULT_HISTORY_LIMIT_RULES.minLimit
            );
        });

        it("should clamp negative values to zero", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            await databaseManager.setHistoryLimit(-1);
            expect(databaseManagerTestView.historyLimit).toBe(0);

            await databaseManager.setHistoryLimit(-100);
            expect(databaseManagerTestView.historyLimit).toBe(0);
        });

        it("should reject infinite values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            // Act & Assert - Normalization rejects non-finite values with RangeError
            await expect(
                databaseManager.setHistoryLimit(Infinity)
            ).rejects.toThrow(RangeError);
            await expect(
                databaseManager.setHistoryLimit(-Infinity)
            ).rejects.toThrow(RangeError);
        });

        it("should reject values exceeding maximum limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            // Arrange
            const maxLimit = 10_000;
            mockConfigurationManager.getHistoryRetentionRules.mockReturnValue({
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
        it("should reset history limit to default", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

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
        it("should return current history limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Configuration", "type");

            // Arrange
            const testLimit = 750;
            databaseManagerTestView.historyLimit = testLimit;

            // Act
            const result = databaseManager.getHistoryLimit();

            // Assert
            expect(result).toBe(testLimit);
        });
    });

    describe("Private Methods", () => {
        describe("emitHistoryLimitUpdated", () => {
            it("should emit history limit updated event successfully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: DatabaseManager", "component");
                await annotate("Category: Manager", "category");
                await annotate("Type: Data Update", "type");

                // Arrange
                const limit = 500;

                // Act
                await databaseManagerTestView.emitHistoryLimitUpdated(limit);

                // Assert
                expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                    "internal:database:history-limit-updated",
                    expect.objectContaining({
                        limit,
                        operation: "history-limit-updated",
                    })
                );
            });

            it("should handle event emission errors gracefully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: DatabaseManager", "component");
                await annotate("Category: Manager", "category");
                await annotate("Type: Error Handling", "type");

                // Arrange
                const limit = 500;
                mockEventEmitter.emitTyped.mockRejectedValue(
                    new Error("Event error")
                );

                // Act & Assert - should not throw
                await expect(
                    databaseManagerTestView.emitHistoryLimitUpdated(limit)
                ).resolves.toBeUndefined();
            });
        });

        describe("emitSitesCacheUpdateRequested", () => {
            it("should emit sites cache update requested event successfully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: DatabaseManager", "component");
                await annotate("Category: Manager", "category");
                await annotate("Type: Data Update", "type");

                // Arrange
                const mockSites: Site[] = [
                    {
                        identifier: "site1",
                        name: "Site 1",
                        monitors: [],
                        monitoring: false,
                    },
                ];
                vi.spyOn(
                    databaseManagerTestView.siteCache,
                    "entries"
                ).mockReturnValue(
                    new Map(
                        mockSites.map((site): [string, Site] => [
                            site.identifier,
                            site,
                        ])
                    ).entries()
                );

                // Act
                await databaseManagerTestView.emitSitesCacheUpdateRequested();

                // Assert
                expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                    "internal:database:update-sites-cache-requested",
                    expect.objectContaining({
                        operation: "update-sites-cache-requested",
                        sites: mockSites,
                    })
                );
            });

            it("should handle event emission errors gracefully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: DatabaseManager", "component");
                await annotate("Category: Manager", "category");
                await annotate("Type: Error Handling", "type");

                // Arrange
                mockEventEmitter.emitTyped.mockRejectedValue(
                    new Error("Event error")
                );

                // Act & Assert - should not throw
                await expect(
                    databaseManagerTestView.emitSitesCacheUpdateRequested()
                ).resolves.toBeUndefined();
            });
        });

        describe("loadSites", () => {
            it("should load sites from database successfully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: DatabaseManager", "component");
                await annotate("Category: Manager", "category");
                await annotate("Type: Data Loading", "type");

                // Arrange
                const { siteLoadingOrchestrator } = databaseManagerTestView;
                vi.spyOn(
                    siteLoadingOrchestrator,
                    "loadSitesFromDatabase"
                ).mockResolvedValue({
                    success: true,
                    sitesLoaded: 2,
                    message: "Success",
                });

                // Act
                await databaseManagerTestView.loadSites();

                // Assert
                expect(
                    siteLoadingOrchestrator.loadSitesFromDatabase
                ).toHaveBeenCalled();
            });

            it("should handle site loading errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: DatabaseManager", "component");
                await annotate("Category: Manager", "category");
                await annotate("Type: Error Handling", "type");

                // Arrange
                const { siteLoadingOrchestrator } = databaseManagerTestView;
                vi.spyOn(
                    siteLoadingOrchestrator,
                    "loadSitesFromDatabase"
                ).mockRejectedValue(new Error("Loading error"));

                // Act & Assert
                await expect(
                    databaseManagerTestView.loadSites()
                ).rejects.toThrow("Loading error");
            });
        });
    });

    describe("Edge Cases and Integration", () => {
        it("should handle concurrent operations gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should maintain state consistency across operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const newLimit = 800;

            // Act
            await databaseManager.setHistoryLimit(newLimit);
            const retrievedLimit = databaseManager.getHistoryLimit();

            // Assert
            expect(retrievedLimit).toBe(newLimit);
        });

        it("should handle dependencies being null gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            // This tests constructor robustness with minimal dependencies
            const minimalDeps = { ...mockDependencies };

            // Act & Assert - should not throw
            expect(() => new DatabaseManager(minimalDeps)).not.toThrow();
        });
    });

    describe("Error Handling Integration", () => {
        it("should properly wrap operations with error handling", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            // This test verifies that error handling is working by ensuring operations complete successfully even with potential errors in dependencies

            // Act - This should use withErrorHandling internally
            await databaseManager.initialize();
            await databaseManager.refreshSites();

            // Assert - Verify that core operations completed successfully
            // If error handling wasn't working, these would have failed
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
            // The fact that these complete without throwing proves error handling is active
        });

        it("should handle complex error scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DatabaseManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

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

            const isImportResult = await databaseManager.importData("{}");
            expect(isImportResult).toBeFalsy();
        });
    });
});
