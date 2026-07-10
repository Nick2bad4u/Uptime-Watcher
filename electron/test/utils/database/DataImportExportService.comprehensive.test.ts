/**
 * Comprehensive isolated tests for DataImportExportService.
 *
 * Uses complete dependency isolation to achieve maximum coverage of:
 *
 * - Data export operations (84/334 lines = 25% currently)
 * - JSON import parsing and validation
 * - Data persistence operations with transaction handling
 * - Error handling paths and event emission
 * - Private helper methods through integration testing
 *
 * Target: 90%+ coverage through systematic isolated testing.
 */

import type { Site } from "@shared/types";
import type { ImportSite } from "@shared/validation/importExportSchemas";
import type { Database } from "node-sqlite3-wasm";
import type { JsonValue, Promisable } from "type-fest";

import { MAX_IPC_JSON_IMPORT_BYTES } from "@shared/constants/backup";
import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import {
    safeJsonParse,
    safeJsonStringifyWithFallback,
    type SafeJsonResult,
} from "@shared/utils/jsonSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DataImportExportConfig } from "../../../services/database/DataImportExportService";
import type { HistoryRepositoryTransactionAdapter } from "../../../services/database/HistoryRepository";
import type { MonitorRepositoryTransactionAdapter } from "../../../services/database/MonitorRepository";
import type { SettingsRepositoryTransactionAdapter } from "../../../services/database/SettingsRepository";
import type { SiteRepositoryTransactionAdapter } from "../../../services/database/SiteRepository";

import { DATABASE_GRAPH_READ_CONCURRENCY } from "../../../constants";
import { DataImportExportService } from "../../../services/database/DataImportExportService";
import { DataImportExportError } from "../../../services/database/interfaces";
import { withDatabaseOperation } from "../../../utils/operationalHooks";

// Mock all dependencies
vi.mock("../../../../shared/utils/errorCatalog", () => ({
    ERROR_CATALOG: {
        database: {
            IMPORT_DATA_INVALID: "Invalid import data format",
        },
    },
}));

vi.mock("../../../../shared/utils/jsonSafety", () => ({
    safeJsonParse: vi.fn(),
    safeJsonStringifyWithFallback: vi.fn(),
}));

vi.mock("../../../../shared/utils/utfByteLength", async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import("../../../../shared/utils/utfByteLength")
        >();

    return {
        ...actual,
        getUtfByteLength: vi.fn(actual.getUtfByteLength),
    };
});

vi.mock("../../../utils/operationalHooks", () => ({
    withDatabaseOperation: vi.fn(),
}));

type Monitor = Site["monitors"][number];

const safeJsonParseMock = vi.mocked(safeJsonParse);
const safeJsonStringifyWithFallbackMock = vi.mocked(
    safeJsonStringifyWithFallback
);
const getUtfByteLengthMock = vi.mocked(getUtfByteLength);
const withDatabaseOperationMock = vi.mocked(withDatabaseOperation);

const createMockDatabase = () =>
    ({
        close: vi.fn<Database["close"]>(),
        exec: vi.fn<Database["exec"]>(),
        prepare: vi.fn<Database["prepare"]>(),
    }) satisfies Pick<
        Database,
        | "close"
        | "exec"
        | "prepare"
    >;

const createMockEventEmitter = () => ({
    emitTyped: vi.fn<DataImportExportConfig["eventEmitter"]["emitTyped"]>(),
});

const createMockLogger = () =>
    ({
        debug: vi.fn<DataImportExportConfig["logger"]["debug"]>(),
        error: vi.fn<DataImportExportConfig["logger"]["error"]>(),
        info: vi.fn<DataImportExportConfig["logger"]["info"]>(),
        warn: vi.fn<DataImportExportConfig["logger"]["warn"]>(),
    }) satisfies DataImportExportConfig["logger"];

const createMockRepositories = () => {
    const historyAddEntryInternal = vi.fn(
        (
            _database: Database,
            _monitorId: string,
            _entry: Parameters<
                HistoryRepositoryTransactionAdapter["addEntry"]
            >[1],
            _details?: string
        ): void => undefined
    );
    const historyDeleteAllInternal = vi.fn(
        (_database: Database): void => undefined
    );
    const monitorCreateInternal = vi.fn(
        (
            _database: Database,
            _siteIdentifier: string,
            _monitor: Monitor
        ): string => "created-monitor-id"
    );
    const monitorDeleteAllInternal = vi.fn(
        (_database: Database): void => undefined
    );
    const settingsBulkInsertInternal = vi.fn(
        (_database: Database, _settings: Record<string, string>): void =>
            undefined
    );
    const settingsDeleteAllInternal = vi.fn(
        (_database: Database): void => undefined
    );
    const settingsDeleteInternal = vi.fn(
        (_database: Database, _key: string): void => undefined
    );
    const settingsGetAllInternal = vi.fn(
        (_database: Database): Record<string, string> => ({})
    );
    const siteBulkInsertInternal = vi.fn(
        (
            _database: Database,
            _sites: Parameters<
                SiteRepositoryTransactionAdapter["bulkInsert"]
            >[0]
        ): void => undefined
    );
    const siteDeleteAllInternal = vi.fn(
        (_database: Database): void => undefined
    );

    return {
        history: {
            addEntryInternal: historyAddEntryInternal,
            createTransactionAdapter: vi.fn(
                (database: Database): HistoryRepositoryTransactionAdapter => ({
                    addEntry: vi.fn((monitorId, entry, details) =>
                        historyAddEntryInternal(
                            database,
                            monitorId,
                            entry,
                            details
                        )
                    ),
                    deleteAll: vi.fn(() => historyDeleteAllInternal(database)),
                    deleteByMonitorId: vi.fn(),
                    getHistoryCount: vi.fn(() => 0),
                    pruneAllHistory: vi.fn(),
                })
            ),
            deleteAllInternal: historyDeleteAllInternal,
            findByMonitorId: vi
                .fn<
                    DataImportExportConfig["repositories"]["history"]["findByMonitorId"]
                >()
                .mockResolvedValue([]),
        },
        monitor: {
            bulkCreate: vi.fn().mockResolvedValue([]),
            createInternal: monitorCreateInternal,
            createTransactionAdapter: vi.fn(
                (database: Database): MonitorRepositoryTransactionAdapter => ({
                    clearActiveOperations: vi.fn(),
                    create: vi.fn((siteIdentifier, monitor) =>
                        monitorCreateInternal(database, siteIdentifier, monitor)
                    ),
                    deleteAll: vi.fn(() => monitorDeleteAllInternal(database)),
                    deleteById: vi.fn(() => false),
                    deleteBySiteIdentifier: vi.fn(),
                    findBySiteIdentifier: vi.fn(() => []),
                    update: vi.fn(),
                })
            ),
            deleteAllInternal: monitorDeleteAllInternal,
            findBySiteIdentifier: vi
                .fn<
                    DataImportExportConfig["repositories"]["monitor"]["findBySiteIdentifier"]
                >()
                .mockResolvedValue([]),
        },
        settings: {
            bulkInsertInternal: settingsBulkInsertInternal,
            createTransactionAdapter: vi.fn(
                (database: Database): SettingsRepositoryTransactionAdapter => ({
                    bulkInsert: vi.fn((settings) =>
                        settingsBulkInsertInternal(database, settings)
                    ),
                    deleteAll: vi.fn(() => settingsDeleteAllInternal(database)),
                    deleteByKey: vi.fn((key) =>
                        settingsDeleteInternal(database, key)
                    ),
                    getAll: vi.fn(() => settingsGetAllInternal(database)),
                    set: vi.fn(),
                })
            ),
            deleteAllInternal: settingsDeleteAllInternal,
            deleteInternal: settingsDeleteInternal,
            getAllInternal: settingsGetAllInternal,
            getAll: vi
                .fn<
                    DataImportExportConfig["repositories"]["settings"]["getAll"]
                >()
                .mockResolvedValue({}),
        },
        site: {
            bulkInsertInternal: siteBulkInsertInternal,
            createTransactionAdapter: vi.fn(
                (database: Database): SiteRepositoryTransactionAdapter => ({
                    bulkInsert: vi.fn((sites) =>
                        siteBulkInsertInternal(database, sites)
                    ),
                    delete: vi.fn(() => false),
                    deleteAll: vi.fn(() => siteDeleteAllInternal(database)),
                    findAll: vi.fn(() => []),
                    findByIdentifier: vi.fn(),
                    upsert: vi.fn(),
                })
            ),
            deleteAllInternal: siteDeleteAllInternal,
            exportAllRows: vi
                .fn<
                    DataImportExportConfig["repositories"]["site"]["exportAllRows"]
                >()
                .mockResolvedValue([]),
        },
    };
};

type MockDatabase = ReturnType<typeof createMockDatabase>;
type MockEventEmitter = ReturnType<typeof createMockEventEmitter>;
type MockLogger = ReturnType<typeof createMockLogger>;
type MockRepositories = ReturnType<typeof createMockRepositories>;

const createMockDatabaseService = (database: MockDatabase) => {
    const productionDatabase = database as unknown as Database;
    const executeTransaction = vi.fn(
        async <T>(
            operation: (database: Database) => Promise<T> | T
        ): Promise<T> => operation(productionDatabase)
    );

    return {
        executeTransaction,
        getDatabase: vi.fn(() => productionDatabase),
    };
};

type MockDatabaseService = ReturnType<typeof createMockDatabaseService>;

const runDatabaseOperation: typeof withDatabaseOperation = async <T>(
    operation: () => Promisable<T>
): Promise<T> => {
    const result = await operation();
    return result;
};

const asUnvalidatedMonitors = (value: unknown): Site["monitors"] =>
    value as Site["monitors"];

const asUnvalidatedSettings = (value: unknown): Record<string, string> =>
    value as Record<string, string>;

describe("DataImportExportService - Comprehensive Coverage", () => {
    let service: DataImportExportService;
    let mockDatabase: MockDatabase;
    let mockEventEmitter: MockEventEmitter;
    let mockLogger: MockLogger;
    let mockRepositories: MockRepositories;
    let mockDatabaseService: MockDatabaseService;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        vi.mocked(getUtfByteLength).mockImplementation((value: string) =>
            Buffer.byteLength(value, "utf8")
        );
        withDatabaseOperationMock.mockImplementation(runDatabaseOperation);

        mockDatabase = createMockDatabase();
        mockEventEmitter = createMockEventEmitter();
        mockEventEmitter.emitTyped.mockResolvedValue(undefined);
        mockLogger = createMockLogger();
        mockRepositories = createMockRepositories();
        mockDatabaseService = createMockDatabaseService(mockDatabase);

        const mockConfig = {
            databaseService: mockDatabaseService,
            eventEmitter: mockEventEmitter,
            logger: mockLogger,
            repositories: mockRepositories,
        };

        service = new DataImportExportService(
            mockConfig as unknown as DataImportExportConfig
        );
    });

    describe("Constructor", () => {
        it("should initialize with all required dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(service).toBeInstanceOf(DataImportExportService);
            // Verify constructor properly assigned dependencies (tested through method calls)
        });
    });

    describe("exportAllData", () => {
        it("should export all data successfully with complete metadata", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const mockSites: Site[] = [
                {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: [],
                },
            ];
            const mockSettings = {
                theme: "dark",
                historyLimit: "1000",
                "cloud.dropbox.tokens": "ciphertext",
                "cloud.sync.deviceId": "device",
            };

            mockRepositories.site.exportAllRows.mockResolvedValue(mockSites);
            mockRepositories.settings.getAll.mockResolvedValue(mockSettings);
            safeJsonStringifyWithFallbackMock.mockReturnValue(
                '{"exported": true}'
            );

            const result = await service.exportAllData();

            expect(mockRepositories.site.exportAllRows).toHaveBeenCalledTimes(
                1
            );
            expect(mockRepositories.settings.getAll).toHaveBeenCalledTimes(1);
            const exportPayload = vi.mocked(safeJsonStringifyWithFallback).mock
                .calls[0]?.[0];
            expect(exportPayload).toBeDefined();
            expect(exportPayload).toEqual(
                expect.objectContaining({
                    exportedAt: expect.any(String),
                    settings: expect.objectContaining({
                        historyLimit: "1000",
                        theme: "dark",
                    }),
                    sites: mockSites,
                    version: "1.0",
                })
            );
            const exportPayloadRecord = exportPayload as {
                settings: Record<string, string>;
            };
            expect(
                Object.getPrototypeOf(exportPayloadRecord.settings)
            ).toBeNull();
            expect(safeJsonStringifyWithFallback).toHaveBeenCalledWith(
                exportPayload,
                "{}",
                2
            );
            expect(result).toBe('{"exported": true}');
        });

        it("should read the complete export snapshot inside one transaction", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Export", "category");
            await annotate("Type: Data Consistency", "type");

            let transactionActive = false;
            mockDatabaseService.executeTransaction.mockImplementation(
                async (operation) => {
                    transactionActive = true;
                    try {
                        return await operation(
                            mockDatabaseService.getDatabase()
                        );
                    } finally {
                        transactionActive = false;
                    }
                }
            );
            mockRepositories.site.exportAllRows.mockImplementation(async () => {
                expect(transactionActive).toBeTruthy();
                return [
                    {
                        identifier: "site-1",
                        monitoring: true,
                        name: "Site 1",
                    },
                ];
            });
            mockRepositories.monitor.findBySiteIdentifier.mockImplementation(
                async () => {
                    expect(transactionActive).toBeTruthy();
                    return [
                        {
                            checkInterval: 60_000,
                            history: [],
                            id: "monitor-1",
                            monitoring: true,
                            responseTime: 0,
                            retryAttempts: 3,
                            status: "pending",
                            timeout: 5000,
                            type: "http",
                            url: "https://example.com",
                        },
                    ];
                }
            );
            mockRepositories.history.findByMonitorId.mockImplementation(
                async () => {
                    expect(transactionActive).toBeTruthy();
                    return [];
                }
            );
            mockRepositories.settings.getAll.mockImplementation(async () => {
                expect(transactionActive).toBeTruthy();
                return {};
            });
            safeJsonStringifyWithFallbackMock.mockReturnValue(
                '{"exported":true}'
            );

            await service.exportAllData();

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(transactionActive).toBeFalsy();
        });

        it("should bound concurrent site graph reads during export", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Performance", "type");

            const siteRows = Array.from(
                { length: DATABASE_GRAPH_READ_CONCURRENCY + 2 },
                (_, index) => ({
                    identifier: `site-${index}`,
                    monitoring: true,
                    name: `Site ${index}`,
                })
            );
            let active = 0;
            let maxActive = 0;

            mockRepositories.site.exportAllRows.mockResolvedValue(siteRows);
            mockRepositories.monitor.findBySiteIdentifier.mockImplementation(
                async () => {
                    active += 1;
                    maxActive = Math.max(maxActive, active);
                    await new Promise((resolve) => {
                        setTimeout(resolve, 1);
                    });
                    active -= 1;
                    return [];
                }
            );
            safeJsonStringifyWithFallbackMock.mockReturnValue(
                '{"exported": true}'
            );

            await service.exportAllData();

            expect(
                mockRepositories.monitor.findBySiteIdentifier
            ).toHaveBeenCalledTimes(siteRows.length);
            expect(maxActive).toBeLessThanOrEqual(
                DATABASE_GRAPH_READ_CONCURRENCY
            );
        });

        it("should bound concurrent monitor history reads during export", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Performance", "type");

            const monitors = Array.from(
                { length: DATABASE_GRAPH_READ_CONCURRENCY + 2 },
                (_, index) => ({
                    checkInterval: 60_000,
                    history: [],
                    id: `monitor-${index}`,
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending" as const,
                    timeout: 5000,
                    type: "http" as const,
                    url: `https://example.com/${index}`,
                })
            );
            let active = 0;
            let maxActive = 0;

            mockRepositories.site.exportAllRows.mockResolvedValue([
                {
                    identifier: "site-1",
                    monitoring: true,
                    name: "Site 1",
                },
            ]);
            mockRepositories.monitor.findBySiteIdentifier.mockResolvedValue(
                monitors
            );
            mockRepositories.history.findByMonitorId.mockImplementation(
                async () => {
                    active += 1;
                    maxActive = Math.max(maxActive, active);
                    await new Promise((resolve) => {
                        setTimeout(resolve, 1);
                    });
                    active -= 1;
                    return [];
                }
            );
            safeJsonStringifyWithFallbackMock.mockReturnValue(
                '{"exported": true}'
            );

            await service.exportAllData();

            expect(
                mockRepositories.history.findByMonitorId
            ).toHaveBeenCalledTimes(monitors.length);
            expect(maxActive).toBeLessThanOrEqual(
                DATABASE_GRAPH_READ_CONCURRENCY
            );
        });

        it("should not throw when settings contains '__proto__' key", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Export", "category");

            // Simulate a corrupted database or hostile import that inserted a
            // dangerous key into the settings table.
            mockRepositories.settings.getAll.mockResolvedValue({
                ["__proto__"]: "evil",
                constructor: "unsafe-constructor",
                prototype: "unsafe-prototype",
                "ui.theme": "dark",
                "cloud.dropbox.tokens": "secret",
            });

            mockRepositories.site.exportAllRows.mockResolvedValue([]);
            safeJsonStringifyWithFallbackMock.mockReturnValue(
                '{"exported":true}'
            );

            const output = await service.exportAllData();

            expect(output).toBe('{"exported":true}');

            const calls = safeJsonStringifyWithFallbackMock.mock.calls;
            expect(calls).toHaveLength(1);

            const [payload] = calls[0] ?? [];
            expect(payload).toBeTruthy();
            expect(payload).toEqual(
                expect.objectContaining({
                    settings: expect.objectContaining({
                        "ui.theme": "dark",
                    }),
                })
            );

            expect(
                (payload as { settings: Record<string, string> }).settings
            ).not.toHaveProperty("cloud.dropbox.tokens");
            const exportedSettings = (
                payload as { settings: Record<string, string> }
            ).settings;
            expect(Object.getPrototypeOf(exportedSettings)).toBeNull();
            expect(Object.hasOwn(exportedSettings, "__proto__")).toBe(false);
            expect(Object.hasOwn(exportedSettings, "constructor")).toBe(false);
            expect(Object.hasOwn(exportedSettings, "prototype")).toBe(false);
        });

        it("should not invoke primitive prototype toString while exporting non-schema values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Export", "category");

            const bigintToStringSpy = vi
                .spyOn(BigInt.prototype, "toString")
                .mockImplementation(() => {
                    throw new Error("BigInt.prototype.toString called");
                });
            const symbolToStringSpy = vi
                .spyOn(Symbol.prototype, "toString")
                .mockImplementation(() => {
                    throw new Error("Symbol.prototype.toString called");
                });
            const symbolValue = Symbol("exported-setting");

            mockRepositories.site.exportAllRows.mockResolvedValue([]);
            mockRepositories.settings.getAll.mockResolvedValue(
                asUnvalidatedSettings({
                    numeric: 123n,
                    symbolic: symbolValue,
                })
            );
            safeJsonStringifyWithFallbackMock.mockReturnValue(
                '{"exported":true}'
            );

            try {
                await expect(service.exportAllData()).resolves.toBe(
                    '{"exported":true}'
                );

                const [firstCall] =
                    safeJsonStringifyWithFallbackMock.mock.calls;
                expect(firstCall).toBeDefined();

                const [payload] = firstCall!;
                const exportedSettings = (
                    payload as { settings: Record<string, string> }
                ).settings;

                expect(exportedSettings).toMatchObject({
                    numeric: "123",
                    symbolic: "Symbol(exported-setting)",
                });
                expect(bigintToStringSpy).not.toHaveBeenCalled();
                expect(symbolToStringSpy).not.toHaveBeenCalled();
            } finally {
                bigintToStringSpy.mockRestore();
                symbolToStringSpy.mockRestore();
            }
        });

        it("should serialize monitor lastChecked dates as importable ISO strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Export", "category");

            const lastChecked = new Date("2026-07-08T12:34:56.789Z");

            mockRepositories.site.exportAllRows.mockResolvedValue([
                {
                    identifier: "site-1",
                    monitoring: true,
                    name: "Site 1",
                },
            ]);
            mockRepositories.monitor.findBySiteIdentifier.mockResolvedValue([
                {
                    checkInterval: 60_000,
                    history: [],
                    id: "monitor-1",
                    lastChecked,
                    monitoring: true,
                    responseTime: 123,
                    retryAttempts: 3,
                    status: "up",
                    timeout: 5000,
                    type: "http",
                    url: "https://example.com",
                },
            ]);
            safeJsonStringifyWithFallbackMock.mockReturnValue(
                '{"exported":true}'
            );

            await service.exportAllData();

            const [payload] =
                safeJsonStringifyWithFallbackMock.mock.calls[0] ?? [];
            const exportedMonitor = (
                payload as { sites: [{ monitors: [{ lastChecked: string }] }] }
            ).sites[0].monitors[0];
            expect(exportedMonitor.lastChecked).toBe(
                "2026-07-08T12:34:56.789Z"
            );
        });

        it("should fail instead of returning normalized export data that still violates the schema", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Export", "category");
            await annotate("Type: Error Handling", "type");

            mockRepositories.site.exportAllRows.mockResolvedValue([]);
            mockRepositories.settings.getAll.mockResolvedValue(
                asUnvalidatedSettings({
                    theme: 123,
                })
            );

            await expect(service.exportAllData()).rejects.toThrow(
                "Export data payload did not match export schema after normalization."
            );
            expect(safeJsonStringifyWithFallbackMock).not.toHaveBeenCalled();
        });

        it("should handle export errors and emit database error event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const exportError = new Error("Database export failed");
            mockRepositories.site.exportAllRows.mockRejectedValue(exportError);

            await expect(service.exportAllData()).rejects.toThrow(
                DataImportExportError
            );
            await expect(service.exportAllData()).rejects.toThrow(
                "Failed to export data: Database export failed"
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to export data: Database export failed",
                exportError
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    details: "Failed to export data: Database export failed",
                    error: expect.objectContaining({
                        message: "Database export failed",
                        name: "Error",
                    }),
                    operation: "export-data",
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should handle non-Error objects in export failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const nonErrorObject = "String error message";
            mockRepositories.site.exportAllRows.mockRejectedValue(
                nonErrorObject
            );

            await expect(service.exportAllData()).rejects.toThrow(
                DataImportExportError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to export data: String error message",
                nonErrorObject
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    details: "Failed to export data: String error message",
                    error: expect.objectContaining({
                        message: "String error message",
                        name: "Error",
                    }),
                    operation: "export-data",
                })
            );
        });

        it("should handle settings.getAll failure during export", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const settingsError = new Error("Settings retrieval failed");
            mockRepositories.site.exportAllRows.mockResolvedValue([]);
            mockRepositories.settings.getAll.mockRejectedValue(settingsError);

            await expect(service.exportAllData()).rejects.toThrow(
                DataImportExportError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to export data: Settings retrieval failed",
                settingsError
            );
        });

        it("should reject exports that exceed the IPC byte budget", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Security", "type");

            const { getUtfByteLength } =
                await import("../../../../shared/utils/utfByteLength");
            const { MAX_IPC_JSON_EXPORT_BYTES } =
                await import("../../../../shared/constants/backup");

            mockRepositories.site.exportAllRows.mockResolvedValue([]);
            mockRepositories.settings.getAll.mockResolvedValue({});
            safeJsonStringifyWithFallbackMock.mockReturnValue(
                '{"exported":true}'
            );

            getUtfByteLengthMock.mockReturnValue(MAX_IPC_JSON_EXPORT_BYTES + 1);

            const exportPromise = service.exportAllData();
            await expect(exportPromise).rejects.toThrow(DataImportExportError);
            await expect(exportPromise).rejects.toThrow(
                /Failed to export data: Export payload is too large/v
            );

            expect(getUtfByteLength).toHaveBeenCalledWith('{"exported":true}');
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "export-data",
                })
            );
        });
    });

    describe("importDataFromJson", () => {
        it("should successfully parse and validate import data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const mockJsonData = '{"sites": [], "settings": {}}';
            const mockParsedData = {
                sites: [{ identifier: "test-site", name: "Test Site" }],
                settings: {
                    theme: "dark",
                    ["__proto__"]: "evil",
                    constructor: "unsafe-constructor",
                    prototype: "unsafe-prototype",
                    "cloud.dropbox.tokens": "ciphertext",
                },
            };

            safeJsonParseMock.mockReturnValue({
                success: true,
                data: mockParsedData,
            });

            const result = await service.importDataFromJson(mockJsonData);

            expect(safeJsonParse).toHaveBeenCalledWith(
                mockJsonData,
                expect.any(Function)
            );
            expect(result).toEqual({
                sites: mockParsedData.sites,
                settings: {
                    theme: "dark",
                },
            });
            expect(Object.getPrototypeOf(result.settings)).toBeNull();
            expect(Object.hasOwn(result.settings, "__proto__")).toBe(false);
            expect(Object.hasOwn(result.settings, "constructor")).toBe(false);
            expect(Object.hasOwn(result.settings, "prototype")).toBe(false);
        });

        it("should normalize imported setting keys before stripping protected settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const mockJsonData = '{"sites": [], "settings": {}}';
            const mockParsedData = {
                sites: [],
                settings: {
                    " cloud.dropbox.tokens ": "ciphertext",
                    " historyLimit ": " 00500 ",
                    " theme ": "dark",
                },
            };

            safeJsonParseMock.mockReturnValue({
                success: true,
                data: mockParsedData,
            });

            const result = await service.importDataFromJson(mockJsonData);

            expect(result).toEqual({
                sites: [],
                settings: {
                    historyLimit: "500",
                    theme: "dark",
                },
            });
            expect(result.settings).not.toHaveProperty(
                " cloud.dropbox.tokens "
            );
            expect(result.settings).not.toHaveProperty("cloud.dropbox.tokens");
        });

        it("should strip duplicate imported settings after key normalization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const mockJsonData = '{"sites": [], "settings": {}}';
            const mockParsedData = {
                sites: [],
                settings: {
                    " theme ": "dark",
                    theme: "light",
                },
            };

            safeJsonParseMock.mockReturnValue({
                success: true,
                data: mockParsedData,
            });

            const result = await service.importDataFromJson(mockJsonData);

            expect(result).toEqual({
                sites: [],
                settings: {
                    theme: "dark",
                },
            });
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[DataImportExportService] Stripped 1 invalid settings keys during import",
                { keysPreview: ["theme"] }
            );
        });

        it("accepts exported sites with empty monitor arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "regression");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const mockJsonData =
                '{"sites":[{"identifier":"example.com","monitors":[]}]}';
            const mockParsedData = {
                sites: [
                    {
                        identifier: "example.com",
                        monitors: [],
                    },
                ],
            };

            safeJsonParseMock.mockReturnValue({
                success: true,
                data: mockParsedData,
            });

            const result = await service.importDataFromJson(mockJsonData);

            expect(result.sites).toEqual(mockParsedData.sites);
        });

        it("should handle parsing failure with invalid JSON", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const invalidJsonData = "invalid json";

            safeJsonParseMock.mockReturnValue({
                success: false,
                error: "Unexpected token in JSON",
            });

            await expect(
                service.importDataFromJson(invalidJsonData)
            ).rejects.toThrow(DataImportExportError);
            await expect(
                service.importDataFromJson(invalidJsonData)
            ).rejects.toThrow("Failed to parse import data");

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to parse import data"),
                expect.any(Error)
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "import-data-parse",
                    details: expect.stringContaining(
                        "Invalid import data format"
                    ),
                })
            );
        });

        it("should reject oversized JSON imports before parsing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "regression");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Security", "type");

            const oversizedJsonData = "x".repeat(MAX_IPC_JSON_IMPORT_BYTES + 1);

            await expect(
                service.importDataFromJson(oversizedJsonData)
            ).rejects.toThrow(DataImportExportError);

            expect(safeJsonParse).not.toHaveBeenCalled();
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "import-data-parse",
                    details: expect.stringContaining("too large"),
                })
            );
        });

        it("should handle parsing success but no data returned", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            safeJsonParseMock.mockReturnValue({
                success: true,
            });

            await expect(service.importDataFromJson("{}")).rejects.toThrow(
                DataImportExportError
            );

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "import-data-parse",
                    error: expect.objectContaining({
                        name: "Error",
                    }),
                })
            );
        });

        it("should return empty settings when not provided in import data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Import Operation", "type");

            const mockParsedData = {
                sites: [{ identifier: "test-site" }],
                // No settings property
            };

            safeJsonParseMock.mockReturnValue({
                success: true,
                data: mockParsedData,
            });

            const result = await service.importDataFromJson("{}");

            expect(result).toEqual({
                sites: mockParsedData.sites,
                settings: {}, // Should default to empty object
            });
        });

        it("should handle non-Error objects in parsing failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            safeJsonParseMock.mockImplementation(() => {
                throw "String error";
            });

            await expect(service.importDataFromJson("invalid")).rejects.toThrow(
                DataImportExportError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to parse import data: String error",
                "String error"
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    error: expect.objectContaining({
                        name: "Error",
                    }),
                })
            );
        });
    });

    describe("persistImportedData", () => {
        it("should successfully persist sites and settings in transaction", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockSites: ImportSite[] = [
                {
                    identifier: "site1",
                    monitoring: false,
                    name: "Site 1",
                    monitors: [],
                },
                { identifier: "site2", name: "Site 2" }, // No monitors
            ];
            const mockSettings = { theme: "dark", historyLimit: "500" };
            mockRepositories.settings.getAllInternal.mockReturnValue({
                historyLimit: "1000",
                theme: "light",
            });

            await service.persistImportedData(mockSites, mockSettings);

            expect(withDatabaseOperation).toHaveBeenCalledWith(
                expect.any(Function),
                "data-import-persist",
                mockEventEmitter,
                {
                    sitesCount: 2,
                    settingsCount: 2,
                }
            );

            // Verify transaction operations
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalledWith(
                expect.any(Function)
            );
            expect(
                mockRepositories.settings.getAllInternal
            ).toHaveBeenCalledWith(mockDatabase);
            expect(
                mockRepositories.site.deleteAllInternal
            ).toHaveBeenCalledWith(mockDatabase);
            expect(
                mockRepositories.settings.deleteAllInternal
            ).not.toHaveBeenCalled();
            expect(
                mockRepositories.settings.deleteInternal
            ).toHaveBeenCalledWith(mockDatabase, "historyLimit");
            expect(
                mockRepositories.settings.deleteInternal
            ).toHaveBeenCalledWith(mockDatabase, "theme");
            expect(
                mockRepositories.monitor.deleteAllInternal
            ).toHaveBeenCalledWith(mockDatabase);
            expect(
                mockRepositories.history.deleteAllInternal
            ).toHaveBeenCalledWith(mockDatabase);

            // Verify bulk inserts
            expect(
                mockRepositories.site.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, [
                { identifier: "site1", name: "Site 1", monitoring: false },
                { identifier: "site2", name: "Site 2", monitoring: true },
            ]);
            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, mockSettings);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "Successfully imported 2 sites and 2 settings"
            );
        });

        it("should strip protected settings before persistence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Import Operation", "category");

            const mockSettings = {
                ["__proto__"]: "evil",
                constructor: "unsafe-constructor",
                prototype: "unsafe-prototype",
                theme: "dark",
                "cloud.dropbox.tokens": "ciphertext",
            };

            await service.persistImportedData([], mockSettings);

            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, { theme: "dark" });
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Successfully imported 0 sites and 1 settings"
            );
        });

        it("should strip malformed imported history limit settings before persistence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Import Operation", "category");

            mockRepositories.settings.getAllInternal.mockReturnValue({
                historyLimit: "1000",
            });

            await service.persistImportedData([], {
                historyLimit: "1e3",
                theme: "dark",
            });

            expect(
                mockRepositories.settings.deleteInternal
            ).toHaveBeenCalledWith(mockDatabase, "historyLimit");
            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, { theme: "dark" });
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[DataImportExportService] Stripped 1 invalid settings keys during persist",
                { keysPreview: ["historyLimit"] }
            );
        });

        it("should canonicalize valid imported history limit settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Import Operation", "category");

            await service.persistImportedData([], {
                historyLimit: " 00500 ",
            });

            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, { historyLimit: "500" });
        });

        it("should canonicalize imported setting keys before persistence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Import Operation", "category");

            await service.persistImportedData([], {
                " cloud.dropbox.tokens ": "ciphertext",
                " historyLimit ": " 00500 ",
                " theme ": "dark",
            });

            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, {
                historyLimit: "500",
                theme: "dark",
            });
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[DataImportExportService] Stripped 1 protected settings keys during persist",
                { keysPreview: [" cloud.dropbox.tokens "] }
            );
        });

        it("should preserve protected existing settings while replacing import-managed settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Import Operation", "category");

            mockRepositories.settings.getAllInternal.mockReturnValue({
                ["__proto__"]: "evil-existing",
                "cloud.dropbox.tokens": "existing-token",
                "cloud.sync.deviceId": "existing-device",
                constructor: "existing-constructor",
                historyLimit: "1000",
                prototype: "existing-prototype",
                theme: "light",
            });

            await service.persistImportedData([], { theme: "dark" });

            expect(mockRepositories.settings.getAll).not.toHaveBeenCalled();

            expect(
                mockRepositories.settings.deleteAllInternal
            ).not.toHaveBeenCalled();
            expect(
                mockRepositories.settings.deleteInternal
            ).toHaveBeenCalledWith(mockDatabase, "historyLimit");
            expect(
                mockRepositories.settings.deleteInternal
            ).toHaveBeenCalledWith(mockDatabase, "theme");

            const deletedKeys =
                mockRepositories.settings.deleteInternal.mock.calls.map(
                    (call: unknown[]) => call[1]
                );
            expect(deletedKeys).not.toEqual(
                expect.arrayContaining([
                    "__proto__",
                    "cloud.dropbox.tokens",
                    "cloud.sync.deviceId",
                    "constructor",
                    "prototype",
                ])
            );
            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, { theme: "dark" });
        });

        it("should reject duplicate site identifiers after import normalization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Import Operation", "category");

            const rawIdentifier =
                "https://user:site-secret@example.com/path?access_token=site-token#private-site";
            const mockSites: ImportSite[] = [
                { identifier: rawIdentifier, name: "First Site" },
                { identifier: ` ${rawIdentifier} `, name: "Duplicate Site" },
            ];

            let caughtError: unknown;
            try {
                await service.persistImportedData(mockSites, {});
            } catch (error) {
                caughtError = error;
            }

            expect(caughtError).toBeInstanceOf(Error);
            const message = Error.isError(caughtError)
                ? caughtError.message
                : "";
            expect(message).toContain(
                "Import contains duplicate site identifier after normalization: https://example.com/path"
            );
            expect(message).not.toMatch(/private-site|site-secret|site-token/v);

            expect(withDatabaseOperation).not.toHaveBeenCalled();
            expect(
                mockDatabaseService.executeTransaction
            ).not.toHaveBeenCalled();
            expect(
                mockRepositories.site.deleteAllInternal
            ).not.toHaveBeenCalled();
        });

        it("should handle sites without names during persistence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockSites: ImportSite[] = [
                { identifier: "site1" }, // No name
                { identifier: "site2", name: "" }, // Empty name
            ];

            await service.persistImportedData(mockSites, {});

            expect(
                mockRepositories.site.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, [
                { identifier: "site1", monitoring: true }, // No name property
                { identifier: "site2", monitoring: true }, // No name property for empty string
            ]);
        });

        it("should clamp imported monitor intervals below the shared minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Sanitization", "type");

            const rawMonitorId =
                "https://monitor.example/check?token=monitor-token#private-monitor";
            const rawSiteIdentifier =
                "https://user:site-secret@example.com/path?access_token=site-token#private-site";
            const lowIntervalMonitor = {
                checkInterval: 1000,
                history: [],
                id: rawMonitorId,
                monitoring: true,
                retryAttempts: 3,
                timeout: 5000,
                type: "http" as const,
                url: "https://example.com",
            };

            const mockSites: ImportSite[] = [
                {
                    identifier: rawSiteIdentifier,
                    monitors: asUnvalidatedMonitors([lowIntervalMonitor]),
                },
            ];

            await service.persistImportedData(mockSites, {});

            expect(
                mockRepositories.monitor.createInternal
            ).toHaveBeenCalledTimes(1);

            const [
                dbArg,
                siteIdentifier,
                createdMonitor,
            ] = mockRepositories.monitor.createInternal.mock.calls[0]!;

            expect(dbArg).toBe(mockDatabase);
            expect(siteIdentifier).toBe(rawSiteIdentifier);
            expect(createdMonitor).toEqual(
                expect.objectContaining({
                    id: rawMonitorId,
                    checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
                })
            );

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[DataImportExportService] Imported monitor checkInterval below minimum; clamping to shared floor",
                expect.objectContaining({
                    minimum: MIN_MONITOR_CHECK_INTERVAL_MS,
                    monitorId: "https://monitor.example/check",
                    originalInterval: 1000,
                    siteIdentifier: "https://example.com/path",
                })
            );

            const warningPayload = JSON.stringify(mockLogger.warn.mock.calls);
            expect(warningPayload).not.toContain("monitor-token");
            expect(warningPayload).not.toContain("private-monitor");
            expect(warningPayload).not.toContain("site-secret");
            expect(warningPayload).not.toContain("site-token");
            expect(warningPayload).not.toContain("private-site");
        });

        it("should handle empty sites and settings arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            await service.persistImportedData([], {});

            expect(
                mockRepositories.site.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, []);
            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, {});
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Successfully imported 0 sites and 0 settings"
            );
        });
    });

    describe("importMonitorsWithHistory - Integration Testing", () => {
        it("should import monitors with history for sites with monitor data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Import Operation", "type");

            const rawIdentifier =
                "https://user:site-secret@example.com/path?access_token=site-token#private-site";
            const mockMonitors = [
                {
                    id: "mon1",
                    type: "http" as const,
                    url: "https://example.com",
                    status: "up" as const,
                    lastChecked: new Date(),
                    responseTime: 100,
                    checkInterval: 5000,
                    monitoring: true,
                    retryAttempts: 3,
                    timeout: 5000,
                    history: [
                        {
                            status: "up" as const,
                            timestamp: Date.now(),
                            responseTime: 100,
                            details: "HTTP 200 OK",
                        },
                    ],
                },
            ];

            const mockSites: ImportSite[] = [
                {
                    identifier: rawIdentifier,
                    name: "Site 1",
                    monitors: mockMonitors,
                },
            ];

            mockRepositories.monitor.createInternal.mockReturnValueOnce("123");

            await service.persistImportedData(mockSites, {});

            expect(
                mockRepositories.monitor.createInternal
            ).toHaveBeenCalledWith(
                mockDatabase,
                rawIdentifier,
                expect.objectContaining({ id: "mon1" })
            );
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenCalledWith(
                mockDatabase,
                "123", // Created monitor ID
                {
                    status: "up",
                    timestamp: expect.any(Number),
                    responseTime: 100,
                },
                "HTTP 200 OK"
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[DataImportExportService] Imported 1 monitors for site: https://example.com/path"
            );
            const logPayload = JSON.stringify(mockLogger.debug.mock.calls);
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");
        });

        it("should handle sites without monitors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const mockSites: ImportSite[] = [
                { identifier: "site1", name: "Site 1" }, // No monitors
                { identifier: "site2", monitors: [] }, // Empty monitors
            ];

            await service.persistImportedData(mockSites, {});

            expect(
                mockRepositories.monitor.createInternal
            ).not.toHaveBeenCalled();
            expect(
                mockRepositories.history.addEntryInternal
            ).not.toHaveBeenCalled();
        });

        it("should abort the import when monitor creation fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const rawIdentifier =
                "https://user:site-secret@example.com/path?access_token=site-token#private-site";
            const mockSites: ImportSite[] = [
                {
                    identifier: rawIdentifier,
                    monitors: asUnvalidatedMonitors([
                        {
                            id: "mon1",
                            type: "http" as const,
                            url: "https://example.com",
                        },
                    ]),
                },
                {
                    identifier: "site2",
                    monitors: asUnvalidatedMonitors([
                        {
                            id: "mon2",
                            type: "ping" as const,
                            url: "https://test.com",
                        },
                    ]),
                },
            ];
            const createError = new Error("Monitor creation failed");
            mockRepositories.monitor.createInternal.mockImplementation(
                (_db: unknown, siteIdentifier: string) => {
                    if (siteIdentifier === rawIdentifier) {
                        throw createError;
                    }

                    return "456";
                }
            );

            await expect(
                service.persistImportedData(mockSites, {})
            ).rejects.toThrow(
                /Monitor import failed for site 'https:\/\/example\.com\/path'/v
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[DataImportExportService] Failed to import monitors for site https://example.com/path:",
                createError
            );
            const logPayload = JSON.stringify(mockLogger.error.mock.calls);
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");

            // Fail-fast behavior: we should not attempt to import the second
            // site once a monitor import fails.
            expect(
                mockRepositories.monitor.createInternal
            ).toHaveBeenCalledTimes(1);
        });

        it("should match monitors correctly for history import", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Import Operation", "type");

            const originalMonitors = [
                {
                    type: "http" as const,
                    url: "https://example.com",
                    port: undefined,
                    history: [
                        {
                            status: "up" as const,
                            timestamp: 1000,
                            responseTime: 50,
                        },
                        {
                            status: "down" as const,
                            timestamp: 2000,
                            responseTime: 0,
                        },
                    ],
                },
            ];

            const mockSites: ImportSite[] = [
                {
                    identifier: "test-site",
                    monitors: asUnvalidatedMonitors(originalMonitors),
                },
            ];

            mockRepositories.monitor.createInternal.mockReturnValue(
                "new-monitor-id"
            );

            await service.persistImportedData(mockSites, {});

            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenCalledTimes(2);
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenNthCalledWith(
                1,
                mockDatabase,
                "new-monitor-id",
                { status: "up", timestamp: 1000, responseTime: 50 },
                undefined
            );
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenNthCalledWith(
                2,
                mockDatabase,
                "new-monitor-id",
                { status: "down", timestamp: 2000, responseTime: 0 },
                undefined
            );
        });

        it("should preserve history order for duplicate endpoint monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Import Operation", "type");

            const duplicateEndpointMonitors = [
                {
                    type: "http" as const,
                    url: "https://example.com",
                    history: [
                        {
                            status: "up" as const,
                            timestamp: 1000,
                            responseTime: 50,
                        },
                    ],
                },
                {
                    type: "http" as const,
                    url: "https://example.com",
                    history: [
                        {
                            status: "down" as const,
                            timestamp: 2000,
                            responseTime: 0,
                        },
                    ],
                },
            ];

            const mockSites: ImportSite[] = [
                {
                    identifier: "test-site",
                    monitors: asUnvalidatedMonitors(duplicateEndpointMonitors),
                },
            ];

            mockRepositories.monitor.createInternal
                .mockReturnValueOnce("first-monitor-id")
                .mockReturnValueOnce("second-monitor-id");

            await service.persistImportedData(mockSites, {});

            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenCalledTimes(2);
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenNthCalledWith(
                1,
                mockDatabase,
                "first-monitor-id",
                { status: "up", timestamp: 1000, responseTime: 50 },
                undefined
            );
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenNthCalledWith(
                2,
                mockDatabase,
                "second-monitor-id",
                { status: "down", timestamp: 2000, responseTime: 0 },
                undefined
            );
        });

        it("should handle monitors without IDs during history import", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Import Operation", "type");

            const mockSites: ImportSite[] = [
                {
                    identifier: "test-site",
                    monitors: asUnvalidatedMonitors([
                        {
                            type: "http" as const,
                            url: "https://example.com",
                            history: [
                                {
                                    status: "up" as const,
                                    timestamp: 1000,
                                    responseTime: 50,
                                },
                            ],
                        },
                    ]),
                },
            ];

            // Simulate a repository bug returning a falsy ID so that the
            // history import path skips adding entries.
            mockRepositories.monitor.createInternal.mockReturnValueOnce("");

            await service.persistImportedData(mockSites, {});

            // Should not call addEntryInternal when monitor has no ID
            expect(
                mockRepositories.history.addEntryInternal
            ).not.toHaveBeenCalled();
        });
    });

    describe("Type Guard Function - isImportData", () => {
        it("should be tested through importDataFromJson integration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Import Operation", "type");

            // The parse-time guard is passed to safeJsonParse.
            //
            // @remarks
            // importDataFromJson accepts arbitrary JSON values at parse
            // time and then performs strict shape validation via the shared
            // Zod schemas.
            safeJsonParseMock.mockImplementation(
                <T extends JsonValue>(
                    _jsonData: string,
                    guardFunction: (data: unknown) => data is T
                ): SafeJsonResult<T> => {
                    // Test the type guard with valid data
                    const validData: unknown = {
                        sites: [{ identifier: "test" }],
                        settings: {},
                    };
                    const invalidData = { notSites: "invalid" };

                    expect(guardFunction(validData)).toBeTruthy();
                    // Parse-time guard is permissive; structural validation
                    // happens after parsing.
                    expect(guardFunction(invalidData)).toBeTruthy();
                    expect(guardFunction(null)).toBeTruthy();
                    expect(guardFunction("string")).toBeTruthy();
                    expect(guardFunction({})).toBeTruthy();
                    expect(guardFunction(undefined)).toBeFalsy();

                    if (!guardFunction(validData)) {
                        return {
                            error: "Parse-time guard rejected valid JSON",
                            success: false,
                        };
                    }

                    return {
                        success: true,
                        data: validData,
                    };
                }
            );

            await service.importDataFromJson('{"sites": []}');

            expect(safeJsonParse).toHaveBeenCalledWith(
                '{"sites": []}',
                expect.any(Function)
            );
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle withDatabaseOperation errors during persist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const operationError = new Error("Database operation failed");

            withDatabaseOperationMock.mockRejectedValue(operationError);

            await expect(service.persistImportedData([], {})).rejects.toThrow(
                operationError
            );
        });

        it("should handle transaction callback errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const transactionError = new Error("Transaction failed");
            mockDatabaseService.executeTransaction.mockRejectedValue(
                transactionError
            );

            await expect(service.persistImportedData([], {})).rejects.toThrow(
                transactionError
            );
        });

        it("should handle repository method failures during transaction", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const deleteError = new Error("Delete operation failed");
            mockRepositories.site.deleteAllInternal.mockImplementation(() => {
                throw deleteError;
            });

            await expect(service.persistImportedData([], {})).rejects.toThrow(
                deleteError
            );
        });
    });

    describe("Integration and Edge Cases", () => {
        it("should handle complex import data with multiple sites and monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Import Operation", "type");

            const complexSites: ImportSite[] = [
                {
                    identifier: "complex-site",
                    name: "Complex Site",
                    monitors: [
                        {
                            id: "http-monitor",
                            type: "http" as const,
                            url: "https://api.example.com",
                            checkInterval: 30_000,
                            monitoring: true,
                            responseTime: 0,
                            retryAttempts: 3,
                            status: "pending" as const,
                            timeout: 5000,
                            history: Array.from({ length: 5 }, (_, i) => ({
                                status:
                                    i % 2 === 0
                                        ? ("up" as const)
                                        : ("down" as const),
                                timestamp: Date.now() - i * 1000,
                                responseTime: (i + 1) * 40,
                            })),
                        },
                        {
                            id: "port-monitor",
                            type: "port" as const,
                            url: "database.example.com",
                            port: 5432,
                            checkInterval: 60_000,
                            monitoring: true,
                            responseTime: 0,
                            retryAttempts: 3,
                            status: "pending" as const,
                            timeout: 5000,
                            history: [],
                        },
                    ],
                },
            ];

            const complexSettings = {
                theme: "dark",
                historyLimit: "1000",
                notifications: "enabled",
                autoBackup: "true",
            };

            mockRepositories.monitor.createInternal
                .mockReturnValueOnce("http-monitor-1")
                .mockReturnValueOnce("port-monitor-1");

            await service.persistImportedData(complexSites, complexSettings);

            expect(
                mockRepositories.monitor.createInternal
            ).toHaveBeenCalledTimes(2);
            expect(
                mockRepositories.monitor.createInternal
            ).toHaveBeenNthCalledWith(
                1,
                mockDatabase,
                "complex-site",
                expect.objectContaining({ id: "http-monitor" })
            );
            expect(
                mockRepositories.monitor.createInternal
            ).toHaveBeenNthCalledWith(
                2,
                mockDatabase,
                "complex-site",
                expect.objectContaining({ id: "port-monitor" })
            );
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenCalledTimes(5); // Only HTTP monitor has history
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Successfully imported 1 sites and 4 settings"
            );
        });

        it("should maintain proper error context throughout operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Test that errors maintain proper context and don't lose information
            const originalError = new Error("Original database error");
            originalError.stack =
                "Error: Original database error\n    at someFunction";

            mockRepositories.site.exportAllRows.mockRejectedValue(
                originalError
            );

            try {
                await service.exportAllData();
            } catch (error) {
                expect(error).toBeInstanceOf(DataImportExportError);
                expect((error as Error).message).toContain(
                    "Failed to export data: Original database error"
                );
                // DataImportExportError preserves stack trace but doesn't set cause property
                expect((error as Error).stack).toContain(
                    "Original database error"
                );
                expect((error as Error).stack).toContain("Caused by:");
            }
        });
    });
});
