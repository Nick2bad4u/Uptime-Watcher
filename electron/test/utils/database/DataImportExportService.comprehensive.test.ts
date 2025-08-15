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
import type { Site, StatusHistory } from "../../../../shared/types.js";
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
                deleteAllInternal: vi.fn(),
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

        mockDatabaseService = {
            executeTransaction: vi
                .fn()
                .mockImplementation(async (callback: Function) => {
                    return await callback(mockDatabase);
                }),
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
        it("should initialize with all required dependencies", () => {
            expect(service).toBeInstanceOf(DataImportExportService);
            // Verify constructor properly assigned dependencies (tested through method calls)
        });
    });

    describe("exportAllData", () => {
        it("should export all data successfully with complete metadata", async () => {
            const { safeJsonStringifyWithFallback } = await import(
                "../../../../shared/utils/jsonSafety"
            );
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

        it("should handle export errors and emit database error event", async () => {
            const exportError = new Error("Database export failed");
            mockRepositories.site.exportAll.mockRejectedValue(exportError);

            await expect(service.exportAllData()).rejects.toThrow(
                SiteLoadingError
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
                {
                    details: "Failed to export data: Database export failed",
                    error: exportError,
                    operation: "export-data",
                    timestamp: expect.any(Number),
                }
            );
        });

        it("should handle non-Error objects in export failure", async () => {
            const nonErrorObject = "String error message";
            mockRepositories.site.exportAll.mockRejectedValue(nonErrorObject);

            await expect(service.exportAllData()).rejects.toThrow(
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
                    error: expect.any(Error), // Should be converted to Error
                    operation: "export-data",
                })
            );
        });

        it("should handle settings.getAll failure during export", async () => {
            const settingsError = new Error("Settings retrieval failed");
            mockRepositories.site.exportAll.mockResolvedValue([]);
            mockRepositories.settings.getAll.mockRejectedValue(settingsError);

            await expect(service.exportAllData()).rejects.toThrow(
                SiteLoadingError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to export data: Settings retrieval failed",
                settingsError
            );
        });
    });

    describe("importDataFromJson", () => {
        it("should successfully parse and validate import data", async () => {
            const { safeJsonParse } = await import(
                "../../../../shared/utils/jsonSafety"
            );
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

        it("should handle parsing failure with invalid JSON", async () => {
            const { safeJsonParse } = await import(
                "../../../../shared/utils/jsonSafety"
            );
            const invalidJsonData = "invalid json";

            (safeJsonParse as MockedFunction<any>).mockReturnValue({
                success: false,
                data: null,
                error: "Unexpected token in JSON",
            });

            await expect(
                service.importDataFromJson(invalidJsonData)
            ).rejects.toThrow(SiteLoadingError);
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

        it("should handle parsing success but no data returned", async () => {
            const { safeJsonParse } = await import(
                "../../../../shared/utils/jsonSafety"
            );

            (safeJsonParse as MockedFunction<any>).mockReturnValue({
                success: true,
                data: null,
                error: null,
            });

            await expect(service.importDataFromJson("{}")).rejects.toThrow(
                SiteLoadingError
            );

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "import-data-parse",
                })
            );
        });

        it("should return empty settings when not provided in import data", async () => {
            const { safeJsonParse } = await import(
                "../../../../shared/utils/jsonSafety"
            );
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

        it("should handle non-Error objects in parsing failure", async () => {
            const { safeJsonParse } = await import(
                "../../../../shared/utils/jsonSafety"
            );

            (safeJsonParse as MockedFunction<any>).mockImplementation(() => {
                throw "String error";
            });

            await expect(service.importDataFromJson("invalid")).rejects.toThrow(
                SiteLoadingError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to parse import data: String error",
                "String error"
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    error: expect.any(Error), // Should be converted to Error
                })
            );
        });
    });

    describe("persistImportedData", () => {
        it("should successfully persist sites and settings in transaction", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            const mockSites: ImportSite[] = [
                { identifier: "site1", name: "Site 1", monitors: [] },
                { identifier: "site2", name: "Site 2" }, // No monitors
            ];
            const mockSettings = { theme: "dark", historyLimit: "500" };

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
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
                { identifier: "site1", name: "Site 1", monitoring: true },
                { identifier: "site2", name: "Site 2", monitoring: true },
            ]);
            expect(
                mockRepositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, mockSettings);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "Successfully imported 2 sites and 2 settings"
            );
        });

        it("should handle sites without names during persistence", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            const mockSites: ImportSite[] = [
                { identifier: "site1" }, // No name
                { identifier: "site2", name: "" }, // Empty name
            ];

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
            );

            await service.persistImportedData(mockSites, {});

            expect(
                mockRepositories.site.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, [
                { identifier: "site1", monitoring: true }, // No name property
                { identifier: "site2", monitoring: true }, // No name property for empty string
            ]);
        });

        it("should handle empty sites and settings arrays", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
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
        it("should import monitors with history for sites with monitor data", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            const mockMonitors = [
                {
                    id: "mon1",
                    type: "http" as const,
                    url: "https://example.com",
                    status: "up" as const,
                    lastChecked: Date.now(),
                    responseTime: 100,
                    checkInterval: 5000,
                    history: [
                        {
                            status: "up" as const,
                            timestamp: Date.now(),
                            responseTime: 100,
                        },
                    ],
                },
            ];

            const mockCreatedMonitors = [
                {
                    id: "123",
                    type: "http" as const,
                    url: "https://example.com",
                    status: "up" as const,
                    lastChecked: Date.now(),
                    responseTime: 100,
                    checkInterval: 5000,
                },
            ];

            const mockSites: ImportSite[] = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: mockMonitors,
                },
            ];

            mockRepositories.monitor.bulkCreate.mockResolvedValue(
                mockCreatedMonitors
            );

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
            );

            await service.persistImportedData(mockSites, {});

            expect(mockRepositories.monitor.bulkCreate).toHaveBeenCalledWith(
                "site1",
                mockMonitors
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

        it("should handle sites without monitors gracefully", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            const mockSites: ImportSite[] = [
                { identifier: "site1", name: "Site 1" }, // No monitors
                { identifier: "site2", monitors: [] }, // Empty monitors
            ];

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
            );

            await service.persistImportedData(mockSites, {});

            expect(mockRepositories.monitor.bulkCreate).not.toHaveBeenCalled();
            expect(
                mockRepositories.history.addEntryInternal
            ).not.toHaveBeenCalled();
        });

        it("should handle monitor creation errors and continue with other sites", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
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

            const bulkCreateError = new Error("Monitor creation failed");
            mockRepositories.monitor.bulkCreate
                .mockRejectedValueOnce(bulkCreateError) // Fail for site1
                .mockResolvedValueOnce([{ id: "456" }]); // Success for site2

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
            );

            await service.persistImportedData(mockSites, {});

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[DataImportExportService] Failed to import monitors for site site1:",
                bulkCreateError
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[DataImportExportService] Imported 1 monitors for site: site2"
            );
        });

        it("should match monitors correctly for history import", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
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

            const createdMonitors = [
                {
                    id: "new-monitor-id",
                    type: "http" as const,
                    url: "https://example.com",
                    port: undefined,
                },
            ];

            const mockSites: ImportSite[] = [
                {
                    identifier: "test-site",
                    monitors: originalMonitors as any,
                },
            ];

            mockRepositories.monitor.bulkCreate.mockResolvedValue(
                createdMonitors
            );

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
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
                String(Number.NaN), // Number conversion of "new-monitor-id"
                { status: "up", timestamp: 1000, responseTime: 50 },
                ""
            );
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenNthCalledWith(
                2,
                mockDatabase,
                String(Number.NaN),
                { status: "down", timestamp: 2000, responseTime: 0 },
                ""
            );
        });

        it("should handle monitors without IDs during history import", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            const createdMonitors = [
                {
                    // No id property
                    type: "http" as const,
                    url: "https://example.com",
                },
            ];

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

            mockRepositories.monitor.bulkCreate.mockResolvedValue(
                createdMonitors
            );

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
            );

            await service.persistImportedData(mockSites, {});

            // Should not call addEntryInternal when monitor has no ID
            expect(
                mockRepositories.history.addEntryInternal
            ).not.toHaveBeenCalled();
        });

        it("should handle numeric monitor IDs correctly", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            const createdMonitors = [
                {
                    id: 123, // Numeric ID
                    type: "http" as const,
                    url: "https://example.com",
                },
            ];

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

            mockRepositories.monitor.bulkCreate.mockResolvedValue(
                createdMonitors
            );

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
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
        it("should be tested through importDataFromJson integration", async () => {
            const { safeJsonParse } = await import("@shared/utils/jsonSafety");

            // The type guard is passed to safeJsonParse, so we test it indirectly
            (safeJsonParse as MockedFunction<any>).mockImplementation(
                (jsonData, guardFunction) => {
                    // Test the type guard with valid data
                    const validData = {
                        sites: [{ identifier: "test" }],
                        settings: {},
                    };
                    const invalidData = { notSites: "invalid" };

                    expect(guardFunction(validData)).toBe(true);
                    expect(guardFunction(invalidData)).toBe(false);
                    expect(guardFunction(null)).toBe(false);
                    expect(guardFunction("string")).toBe(false);
                    expect(guardFunction({})).toBe(false); // No sites array

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
        it("should handle withDatabaseOperation errors during persist", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            const operationError = new Error("Database operation failed");

            (withDatabaseOperation as MockedFunction<any>).mockRejectedValue(
                operationError
            );

            await expect(service.persistImportedData([], {})).rejects.toThrow(
                operationError
            );
        });

        it("should handle transaction callback errors", async () => {
            const transactionError = new Error("Transaction failed");
            mockDatabaseService.executeTransaction.mockRejectedValue(
                transactionError
            );

            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
            );

            await expect(service.persistImportedData([], {})).rejects.toThrow(
                transactionError
            );
        });

        it("should handle repository method failures during transaction", async () => {
            const deleteError = new Error("Delete operation failed");
            mockRepositories.site.deleteAllInternal.mockImplementation(() => {
                throw deleteError;
            });

            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation: any) => {
                    return await operation();
                }
            );

            await expect(service.persistImportedData([], {})).rejects.toThrow(
                deleteError
            );
        });
    });

    describe("Integration and Edge Cases", () => {
        it("should handle complex import data with multiple sites and monitors", async () => {
            const { withDatabaseOperation } = await import(
                "../../../utils/operationalHooks"
            );
            const complexSites: ImportSite[] = [
                {
                    identifier: "complex-site",
                    name: "Complex Site",
                    monitors: [
                        {
                            type: "http" as const,
                            url: "https://api.example.com",
                            checkInterval: 30_000,
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
                            type: "port" as const,
                            url: "database.example.com",
                            port: 5432,
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

            mockRepositories.monitor.bulkCreate.mockResolvedValue([
                {
                    id: "http-monitor-1",
                    type: "http",
                    url: "https://api.example.com",
                },
                {
                    id: "port-monitor-1",
                    type: "port",
                    url: "database.example.com",
                    port: 5432,
                },
            ]);

            (withDatabaseOperation as MockedFunction<any>).mockImplementation(
                async (operation) => {
                    return await operation();
                }
            );

            await service.persistImportedData(complexSites, complexSettings);

            expect(mockRepositories.monitor.bulkCreate).toHaveBeenCalledWith(
                "complex-site",
                complexSites[0].monitors
            );
            expect(
                mockRepositories.history.addEntryInternal
            ).toHaveBeenCalledTimes(5); // Only HTTP monitor has history
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Successfully imported 1 sites and 4 settings"
            );
        });

        it("should maintain proper error context throughout operations", async () => {
            // Test that errors maintain proper context and don't lose information
            const originalError = new Error("Original database error");
            originalError.stack =
                "Error: Original database error\n    at someFunction";

            mockRepositories.site.exportAll.mockRejectedValue(originalError);

            try {
                await service.exportAllData();
            } catch (error) {
                expect(error).toBeInstanceOf(SiteLoadingError);
                expect(error.message).toContain(
                    "Failed to export data: Original database error"
                );
                // SiteLoadingError preserves stack trace but doesn't set cause property
                expect(error.stack).toContain("Original database error");
                expect(error.stack).toContain("Caused by:");
            }
        });
    });
});
