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

import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    type MockedFunction,
} from "vitest";
import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import type { Site } from "@shared/types";
import type { Database } from "node-sqlite3-wasm";

import { DataImportExportService } from "../../../utils/database/DataImportExportService";
import type {
    DataImportExportConfig,
    ImportSite,
} from "../../../utils/database/DataImportExportService";
import { SiteLoadingError } from "../../../utils/database/interfaces";

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
                // Legacy bulkCreate is kept for compatibility with older
                // tests but is no longer used by the service implementation.
                bulkCreate: vi.fn().mockResolvedValue([]),
                findBySiteIdentifier: vi.fn().mockResolvedValue([]),
            },
            settings: {
                deleteAllInternal: vi.fn(),
                bulkInsertInternal: vi.fn(),
                getAll: vi.fn().mockResolvedValue({}),
            },
            site: {
                deleteAllInternal: vi.fn(),
                bulkInsertInternal: vi.fn(),
                exportAll: vi.fn().mockResolvedValue([]),
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
                            factory(db, ...args));
                    }

                    return adapter;
                });
        };

        attachTransactionAdapter(mockRepositories.site, {
            bulkInsert: (db: unknown, rows: unknown) =>
                mockRepositories.site["bulkInsertInternal"](db, rows),
            deleteAll: (db: unknown) =>
                mockRepositories.site["deleteAllInternal"](db),
        });

        attachTransactionAdapter(mockRepositories.monitor, {
            deleteAll: (db: unknown) =>
                mockRepositories.monitor["deleteAllInternal"](db),
            create: (
                db: unknown,
                siteIdentifier: string,
                monitor: Site["monitors"][0]
            ) =>
                mockRepositories.monitor["createInternal"](
                    db,
                    siteIdentifier,
                    monitor
                ),
        });

        attachTransactionAdapter(mockRepositories.history, {
            deleteAll: (db: unknown) =>
                mockRepositories.history["deleteAllInternal"]?.(db),
            addEntry: (
                db: unknown,
                monitorId: unknown,
                entry: unknown,
                details: unknown
            ) =>
                mockRepositories.history["addEntryInternal"](
                    db,
                    monitorId,
                    entry,
                    details
                ),
        });

        attachTransactionAdapter(mockRepositories.settings, {
            deleteAll: (db: unknown) =>
                mockRepositories.settings["deleteAllInternal"](db),
            bulkInsert: (db: unknown, values: unknown) =>
                mockRepositories.settings["bulkInsertInternal"](db, values),
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
            const mockSettings = { theme: "dark", historyLimit: "1000" };

            mockRepositories.site.exportAll.mockResolvedValue(mockSites);
            mockRepositories.settings.getAll.mockResolvedValue(mockSettings);
            (
                safeJsonStringifyWithFallback as MockedFunction<any>
            ).mockReturnValue('{"exported": true}');

            const result = await service.exportAllData();

            expect(mockRepositories.site.exportAll).toHaveBeenCalledTimes(1);
            expect(mockRepositories.settings.getAll).toHaveBeenCalledTimes(1);
            expect(safeJsonStringifyWithFallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    sites: mockSites,
                    settings: mockSettings,
                    version: "1.0",
                    exportedAt: expect.any(String),
                }),
                "{}",
                2
            );
            expect(result).toBe('{"exported": true}');
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
            mockRepositories.site.exportAll.mockRejectedValue(exportError);

            await expect(service.exportAllData()).rejects.toThrowError(
                SiteLoadingError
            );
            await expect(service.exportAllData()).rejects.toThrowError(
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
            mockRepositories.site.exportAll.mockRejectedValue(nonErrorObject);

            await expect(service.exportAllData()).rejects.toThrowError(
                SiteLoadingError
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
            mockRepositories.site.exportAll.mockResolvedValue([]);
            mockRepositories.settings.getAll.mockRejectedValue(settingsError);

            await expect(service.exportAllData()).rejects.toThrowError(
                SiteLoadingError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to export data: Settings retrieval failed",
                settingsError
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
                settings: { theme: "dark" },
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
                settings: mockParsedData.settings,
            });
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
            ).rejects.toThrowError(SiteLoadingError);
            await expect(
                service.importDataFromJson(invalidJsonData)
            ).rejects.toThrowError("Failed to parse import data");

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

            await expect(service.importDataFromJson("{}")).rejects.toThrowError(
                SiteLoadingError
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

            await expect(
                service.importDataFromJson("invalid")
            ).rejects.toThrowError(SiteLoadingError);

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
            ).toHaveBeenCalledWith(mockDatabase);
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
            const lowIntervalMonitor = {
                checkInterval: 1000,
                history: [],
                id: "monitor-1",
                monitoring: true,
                retryAttempts: 3,
                timeout: 5000,
                type: "http" as const,
                url: "https://example.com",
            };

            const mockSites: ImportSite[] = [
                {
                    identifier: "site-with-low-interval",
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
            expect(siteIdentifier).toBe("site-with-low-interval");
            expect(createdMonitor).toEqual(
                expect.objectContaining({
                    id: "monitor-1",
                    checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
                })
            );

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[DataImportExportService] Imported monitor checkInterval below minimum; clamping to shared floor",
                expect.objectContaining({
                    minimum: MIN_MONITOR_CHECK_INTERVAL_MS,
                    monitorId: "monitor-1",
                    originalInterval: 1000,
                    siteIdentifier: "site-with-low-interval",
                })
            );
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
                        },
                    ],
                },
            ];

            const mockSites: ImportSite[] = [
                {
                    identifier: "site1",
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
                "site1",
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
                "" // Empty details
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[DataImportExportService] Imported 1 monitors for site: site1"
            );
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

        it("should handle monitor creation errors and continue with other sites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: DataImportExportService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const { withDatabaseOperation } =
                await import("../../../utils/operationalHooks");
            const mockSites: ImportSite[] = [
                {
                    identifier: "site1",
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
            mockRepositories.monitor.createInternal.mockImplementation((
                _db: unknown,
                siteIdentifier: string
            ) => {
                if (siteIdentifier === "site1") {
                    throw createError;
                }

                return "456";
            });

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

            await service.persistImportedData(mockSites, {});

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[DataImportExportService] Failed to import monitors for site site1:",
                createError
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[DataImportExportService] Imported 1 monitors for site: site2"
            );
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
            mockRepositories.monitor.createInternal.mockReturnValueOnce(
                "" as unknown as string
            );

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

            await service.persistImportedData(mockSites, {});

            // Should not call addEntryInternal when monitor has no ID
            expect(
                mockRepositories.history.addEntryInternal
            ).not.toHaveBeenCalled();
        });

        it("should handle numeric monitor IDs correctly", async ({
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

            // Simulate a numeric identifier being returned from the
            // repository and ensure it is normalised to a string for
            // history entries.
            mockRepositories.monitor.createInternal.mockReturnValueOnce(
                123 as unknown as string
            );

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => await operation()
            );

            await service.persistImportedData(mockSites, {});

            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenCalledWith(
                mockDatabase,
                "123", // Should be converted to string
                { status: "up", timestamp: 1000, responseTime: 50 },
                ""
            );
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

            // The type guard is passed to safeJsonParse, so we test it indirectly
            (safeJsonParse as MockedFunction<any>).mockImplementation((
                _jsonData: any,
                guardFunction: any
            ) => {
                // Test the type guard with valid data
                const validData = {
                    sites: [{ identifier: "test" }],
                    settings: {},
                };
                const invalidData = { notSites: "invalid" };

                expect(guardFunction(validData)).toBeTruthy();
                expect(guardFunction(invalidData)).toBeFalsy();
                expect(guardFunction(null)).toBeFalsy();
                expect(guardFunction("string")).toBeFalsy();
                expect(guardFunction({})).toBeFalsy(); // No sites array

                return {
                    success: true,
                    data: validData,
                    error: null,
                };
            });

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

            await expect(
                service.persistImportedData([], {})
            ).rejects.toThrowError(operationError);
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

            await expect(
                service.persistImportedData([], {})
            ).rejects.toThrowError(transactionError);
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

            await expect(
                service.persistImportedData([], {})
            ).rejects.toThrowError(deleteError);
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
                                responseTime: Math.random() * 200,
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

            mockRepositories.site.exportAll.mockRejectedValue(originalError);

            try {
                await service.exportAllData();
            } catch (error) {
                expect(error).toBeInstanceOf(SiteLoadingError);
                expect((error as Error).message).toContain(
                    "Failed to export data: Original database error"
                );
                // SiteLoadingError preserves stack trace but doesn't set cause property
                expect((error as Error).stack).toContain(
                    "Original database error"
                );
                expect((error as Error).stack).toContain("Caused by:");
            }
        });
    });
});
