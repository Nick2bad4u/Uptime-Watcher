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

import { MAX_IPC_JSON_IMPORT_BYTES } from "@shared/constants/backup";
import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import {
    beforeEach,
    describe,
    expect,
    it,
    type MockedFunction,
    vi,
} from "vitest";

import type { DataImportExportConfig } from "../../../services/database/DataImportExportService";

import { DATABASE_GRAPH_READ_CONCURRENCY } from "../../../constants";
import { DataImportExportService } from "../../../services/database/DataImportExportService";
import { DataImportExportError } from "../../../services/database/interfaces";

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

describe("DataImportExportService - Comprehensive Coverage", () => {
    let service: DataImportExportService;
    let mockConfig: DataImportExportConfig;
    let mockDatabase: Database;
    let mockEventEmitter: any;
    let mockLogger: any;
    let mockRepositories: any;
    let mockDatabaseService: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        vi.mocked(getUtfByteLength).mockImplementation((value: string) =>
            Buffer.byteLength(value, "utf8")
        );

        // Create comprehensive mocks
        mockDatabase = {
            exec: vi.fn(),
            prepare: vi.fn(),
            close: vi.fn(),
        } as any;

        mockEventEmitter = {
            emitTyped: vi.fn().mockResolvedValue(undefined),
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
        };

        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        mockRepositories = {
            history: {
                deleteAllInternal: vi.fn(),
                addEntryInternal: vi.fn(),
                findByMonitorId: vi.fn().mockResolvedValue([]),
            },
            monitor: {
                // Internal helpers used by the transaction adapter. These
                // mirror the repository's internal API surface without
                // requiring a real database.
                createInternal: vi.fn().mockReturnValue("created-monitor-id"),
                deleteAllInternal: vi.fn(),
                // Previous bulkCreate is kept for compatibility with older
                // tests but is no longer used by the service implementation.
                bulkCreate: vi.fn().mockResolvedValue([]),
                findBySiteIdentifier: vi.fn().mockResolvedValue([]),
            },
            settings: {
                deleteAllInternal: vi.fn(),
                deleteInternal: vi.fn(),
                bulkInsertInternal: vi.fn(),
                getAll: vi.fn().mockResolvedValue({}),
            },
            site: {
                deleteAllInternal: vi.fn(),
                bulkInsertInternal: vi.fn(),
                exportAllRows: vi.fn().mockResolvedValue([]),
            },
        };

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

        attachTransactionAdapter(mockRepositories.site, {
            bulkInsert: (db: unknown, rows: unknown) =>
                mockRepositories.site.bulkInsertInternal(db, rows),
            deleteAll: (db: unknown) =>
                mockRepositories.site.deleteAllInternal(db),
        });

        attachTransactionAdapter(mockRepositories.monitor, {
            deleteAll: (db: unknown) =>
                mockRepositories.monitor.deleteAllInternal(db),
            create: (
                db: unknown,
                siteIdentifier: string,
                monitor: Site["monitors"][0]
            ) =>
                mockRepositories.monitor.createInternal(
                    db,
                    siteIdentifier,
                    monitor
                ),
        });

        attachTransactionAdapter(mockRepositories.history, {
            deleteAll: (db: unknown) =>
                mockRepositories.history.deleteAllInternal?.(db),
            addEntry: (
                db: unknown,
                monitorId: unknown,
                entry: unknown,
                details: unknown
            ) =>
                mockRepositories.history.addEntryInternal(
                    db,
                    monitorId,
                    entry,
                    details
                ),
        });

        attachTransactionAdapter(mockRepositories.settings, {
            deleteAll: (db: unknown) =>
                mockRepositories.settings.deleteAllInternal(db),
            deleteByKey: (db: unknown, key: string) =>
                mockRepositories.settings.deleteInternal(db, key),
            bulkInsert: (db: unknown, values: unknown) =>
                mockRepositories.settings.bulkInsertInternal(db, values),
        });

        mockDatabaseService = {
            executeTransaction: vi
                .fn()
                .mockImplementation(
                    async (callback: Function) => await callback(mockDatabase)
                ),
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
        };

        mockConfig = {
            databaseService: mockDatabaseService,
            eventEmitter: mockEventEmitter,
            logger: mockLogger,
            repositories: mockRepositories,
        };

        service = new DataImportExportService(mockConfig);
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

            const { safeJsonStringifyWithFallback } =
                await import("../../../../shared/utils/jsonSafety");
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
            (
                safeJsonStringifyWithFallback as MockedFunction<any>
            ).mockReturnValue('{"exported": true}');

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

        it("should bound concurrent site graph reads during export", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Performance", "type");

            const { safeJsonStringifyWithFallback } =
                await import("../../../../shared/utils/jsonSafety");
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
            (
                safeJsonStringifyWithFallback as MockedFunction<any>
            ).mockReturnValue('{"exported": true}');

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

            const { safeJsonStringifyWithFallback } =
                await import("../../../../shared/utils/jsonSafety");
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
            (
                safeJsonStringifyWithFallback as MockedFunction<any>
            ).mockReturnValue('{"exported": true}');

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

            const { safeJsonStringifyWithFallback } =
                await import("@shared/utils/jsonSafety");
            const safeJsonStringifyWithFallbackMock = vi.mocked(
                safeJsonStringifyWithFallback
            );

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

            const { safeJsonStringifyWithFallback } =
                await import("@shared/utils/jsonSafety");
            const safeJsonStringifyWithFallbackMock = vi.mocked(
                safeJsonStringifyWithFallback
            );
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
            mockRepositories.settings.getAll.mockResolvedValue({
                numeric: 123n,
                symbolic: symbolValue,
            });
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

            const { safeJsonStringifyWithFallback } =
                await import("../../../../shared/utils/jsonSafety");
            const { getUtfByteLength } =
                await import("../../../../shared/utils/utfByteLength");
            const { MAX_IPC_JSON_EXPORT_BYTES } =
                await import("../../../../shared/constants/backup");

            mockRepositories.site.exportAllRows.mockResolvedValue([]);
            mockRepositories.settings.getAll.mockResolvedValue({});
            (
                safeJsonStringifyWithFallback as MockedFunction<any>
            ).mockReturnValue('{"exported":true}');

            (getUtfByteLength as MockedFunction<any>).mockReturnValue(
                MAX_IPC_JSON_EXPORT_BYTES + 1
            );

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

            const { safeJsonParse } =
                await import("../../../../shared/utils/jsonSafety");
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

            (safeJsonParse as MockedFunction<any>).mockReturnValue({
                success: true,
                data: mockParsedData,
                error: null,
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

        it("accepts exported sites with empty monitor arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "regression");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const { safeJsonParse } =
                await import("../../../../shared/utils/jsonSafety");
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

            (safeJsonParse as MockedFunction<any>).mockReturnValue({
                success: true,
                data: mockParsedData,
                error: null,
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

            const { safeJsonParse } =
                await import("../../../../shared/utils/jsonSafety");
            const invalidJsonData = "invalid json";

            (safeJsonParse as MockedFunction<any>).mockReturnValue({
                success: false,
                data: null,
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

            const { safeJsonParse } =
                await import("../../../../shared/utils/jsonSafety");
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

            const { safeJsonParse } =
                await import("../../../../shared/utils/jsonSafety");

            (safeJsonParse as MockedFunction<any>).mockReturnValue({
                success: true,
                data: null,
                error: null,
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

            const { safeJsonParse } =
                await import("../../../../shared/utils/jsonSafety");
            const mockParsedData = {
                sites: [{ identifier: "test-site" }],
                // No settings property
            };

            (safeJsonParse as MockedFunction<any>).mockReturnValue({
                success: true,
                data: mockParsedData,
                error: null,
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

            const { safeJsonParse } =
                await import("../../../../shared/utils/jsonSafety");

            (safeJsonParse as MockedFunction<any>).mockImplementation(() => {
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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
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
            mockRepositories.settings.getAll.mockResolvedValue({
                historyLimit: "1000",
                theme: "light",
            });

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            const mockSettings = {
                ["__proto__"]: "evil",
                constructor: "unsafe-constructor",
                prototype: "unsafe-prototype",
                theme: "dark",
                "cloud.dropbox.tokens": "ciphertext",
            };

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

            await service.persistImportedData([], mockSettings);

            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, { theme: "dark" });
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Successfully imported 0 sites and 1 settings"
            );
        });

        it("should preserve protected existing settings while replacing import-managed settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Import Operation", "category");

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");

            mockRepositories.settings.getAll.mockResolvedValue({
                ["__proto__"]: "evil-existing",
                "cloud.dropbox.tokens": "existing-token",
                "cloud.sync.deviceId": "existing-device",
                constructor: "existing-constructor",
                historyLimit: "1000",
                prototype: "existing-prototype",
                theme: "light",
            });

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

            await service.persistImportedData([], { theme: "dark" });

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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            const mockSites: ImportSite[] = [
                { identifier: "site1" }, // No name
                { identifier: "site2", name: "" }, // Empty name
            ];

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
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
                    monitors: [lowIntervalMonitor as any],
                },
            ];

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );
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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
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

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            const mockSites: ImportSite[] = [
                { identifier: "site1", name: "Site 1" }, // No monitors
                { identifier: "site2", monitors: [] }, // Empty monitors
            ];

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            const rawIdentifier =
                "https://user:site-secret@example.com/path?access_token=site-token#private-site";
            const mockSites: ImportSite[] = [
                {
                    identifier: rawIdentifier,
                    monitors: [
                        {
                            id: "mon1",
                            type: "http" as const,
                            url: "https://example.com",
                        } as any,
                    ],
                },
                {
                    identifier: "site2",
                    monitors: [
                        {
                            id: "mon2",
                            type: "ping" as const,
                            url: "https://test.com",
                        } as any,
                    ],
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

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
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
                    monitors: originalMonitors as any,
                },
            ];

            mockRepositories.monitor.createInternal.mockReturnValue(
                "new-monitor-id"
            );

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
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
                ""
            );
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenNthCalledWith(
                2,
                mockDatabase,
                "new-monitor-id",
                { status: "down", timestamp: 2000, responseTime: 0 },
                ""
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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
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
                    monitors: duplicateEndpointMonitors as any,
                },
            ];

            mockRepositories.monitor.createInternal
                .mockReturnValueOnce("first-monitor-id")
                .mockReturnValueOnce("second-monitor-id");

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
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
                "first-monitor-id",
                { status: "up", timestamp: 1000, responseTime: 50 },
                ""
            );
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenNthCalledWith(
                2,
                mockDatabase,
                "second-monitor-id",
                { status: "down", timestamp: 2000, responseTime: 0 },
                ""
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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            const mockSites: ImportSite[] = [
                {
                    identifier: "test-site",
                    monitors: [
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
                    ] as any,
                },
            ];

            // Simulate a repository bug returning a falsy ID so that the
            // history import path skips adding entries.
            mockRepositories.monitor.createInternal.mockReturnValueOnce("");

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

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

            const { safeJsonParse } = await import("@shared/utils/jsonSafety");

            // The parse-time guard is passed to safeJsonParse.
            //
            // @remarks
            // importDataFromJson intentionally accepts any JSON value at parse
            // time and then performs strict shape validation via the shared
            // Zod schemas.
            (safeJsonParse as MockedFunction<any>).mockImplementation(
                (_jsonData: any, guardFunction: any) => {
                    // Test the type guard with valid data
                    const validData = {
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

                    return {
                        success: true,
                        data: validData,
                        error: null,
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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            const operationError = new Error("Database operation failed");

            (withDatabaseOperation as MockedFunction<any>).mockRejectedValue(
                operationError
            );

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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

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

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
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

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

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
