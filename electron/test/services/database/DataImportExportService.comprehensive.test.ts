/**
 * @fileoverview Comprehensive isolated tests for DataImportExportService
 *
 * This test suite achieves high coverage for the DataImportExportService class
 * through comprehensive isolated testing with complete dependency mocking.
 * Tests all public methods, private method integration, error handling, and
 * various edge cases for data import/export operations.
 *
 * Coverage targets:
 * - Constructor initialization
 * - exportAllData method with success and error paths
 * - importDataFromJson method with validation scenarios
 * - persistImportedData method with transaction handling
 * - Private method integration (importMonitorsWithHistory, importHistoryForMonitors, importMonitorHistory)
 * - Error handling and event emission
 * - Edge cases and boundary conditions
 *
 * Testing Strategy:
 * - Complete dependency isolation using vi.mock and manual mocks
 * - Comprehensive scenario coverage for all code paths
 * - Error injection and recovery testing
 * - Integration testing of private method collaboration
 * - Event emission verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock all external dependencies at module level
vi.mock("../../../utils/database/interfaces", () => ({
    SiteLoadingError: class extends Error {
        constructor(message, cause) {
            super(message);
            this.name = "SiteLoadingError";
            if (cause) this.cause = cause;
        }
    },
}));

vi.mock("../../../utils/operationalHooks", () => ({
    withDatabaseOperation: vi.fn().mockImplementation(async (operation) => {
        return await operation();
    }),
}));

vi.mock("@shared/utils/errorCatalog", () => ({
    ERROR_CATALOG: {
        database: {
            IMPORT_DATA_INVALID: "Invalid import data format",
        },
    },
}));

vi.mock("@shared/utils/jsonSafety", () => ({
    safeJsonParse: vi.fn(),
    safeJsonStringifyWithFallback: vi.fn(),
}));

// Import the service after mocking dependencies
import {
    DataImportExportService,
    type DataImportExportConfig,
    type ImportSite,
} from "../../../utils/database/DataImportExportService";
import { SiteLoadingError } from "../../../utils/database/interfaces";
import { withDatabaseOperation } from "../../../utils/operationalHooks";
import {
    safeJsonParse,
    safeJsonStringifyWithFallback,
} from "@shared/utils/jsonSafety";

// Mock interfaces and types
interface MockDatabase {
    run: ReturnType<typeof vi.fn>;
    all: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
}

interface MockSite {
    identifier: string;
    name?: string;
    url?: string;
    isActive?: boolean;
    checkInterval?: number;
    timeout?: number;
    retryCount?: number;
    createdAt?: string;
    updatedAt?: string;
    monitors?: Array<{
        id?: string;
        siteId?: string;
        type?: string;
        config?: any;
        isActive?: boolean;
        createdAt?: string;
        updatedAt?: string;
        history?: Array<{
            id?: string;
            monitorId?: string;
            status?: string;
            responseTime?: number;
            timestamp?: string;
            details?: any;
        }>;
    }>;
}

describe("DataImportExportService", () => {
    // Mock dependencies
    let mockSiteRepository: any;
    let mockSettingsRepository: any;
    let mockMonitorRepository: any;
    let mockHistoryRepository: any;
    let mockDatabaseService: any;
    let mockEventEmitter: any;
    let mockLogger: any;
    let mockDatabase: MockDatabase;

    // Service instance
    let service: DataImportExportService;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup mock database
        mockDatabase = {
            run: vi.fn(),
            all: vi.fn(),
            get: vi.fn(),
        };

        // Setup repository mocks
        mockSiteRepository = {
            exportAll: vi.fn(),
            bulkInsertInternal: vi.fn(),
            deleteAllInternal: vi.fn(),
        };

        mockSettingsRepository = {
            getAll: vi.fn(),
            bulkInsertInternal: vi.fn(),
            deleteAllInternal: vi.fn(),
        };

        mockMonitorRepository = {
            bulkCreate: vi.fn(),
            deleteAllInternal: vi.fn(),
        };

        mockHistoryRepository = {
            deleteAllInternal: vi.fn(),
            addEntryInternal: vi.fn(),
        };

        // Setup database service mock
        mockDatabaseService = {
            executeTransaction: vi.fn(),
        };

        // Setup event emitter mock
        mockEventEmitter = {
            emitTyped: vi.fn(),
        };

        // Setup logger mock
        mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        };

        // Create service config
        const config: DataImportExportConfig = {
            repositories: {
                site: mockSiteRepository,
                settings: mockSettingsRepository,
                monitor: mockMonitorRepository,
                history: mockHistoryRepository,
            },
            databaseService: mockDatabaseService,
            eventEmitter: mockEventEmitter,
            logger: mockLogger,
        };

        // Create service instance
        service = new DataImportExportService(config);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Constructor", () => {
        it("should initialize with provided configuration", () => {
            const config: DataImportExportConfig = {
                repositories: {
                    site: mockSiteRepository,
                    settings: mockSettingsRepository,
                    monitor: mockMonitorRepository,
                    history: mockHistoryRepository,
                },
                databaseService: mockDatabaseService,
                eventEmitter: mockEventEmitter,
                logger: mockLogger,
            };

            const newService = new DataImportExportService(config);
            expect(newService).toBeInstanceOf(DataImportExportService);
        });

        it("should store all provided dependencies", () => {
            // Verify that the constructor properly stores dependencies
            // This is implicitly tested through method calls in other tests
            expect(service).toBeDefined();
        });
    });

    describe("exportAllData", () => {
        it("should export all data successfully with correct format", async () => {
            const mockSites: MockSite[] = [
                {
                    identifier: "site1",
                    name: "Test Site",
                    url: "https://test.com",
                    isActive: true,
                    checkInterval: 300,
                    timeout: 5000,
                    retryCount: 3,
                    createdAt: "2023-01-01T00:00:00.000Z",
                    updatedAt: "2023-01-01T00:00:00.000Z",
                },
            ];

            const mockSettings = {
                setting1: "value1",
                setting2: "value2",
            };

            const mockExportedData = {
                sites: mockSites,
                settings: mockSettings,
                version: "1.0",
                exportedAt: "2023-01-01T12:00:00.000Z",
            };

            // Setup mocks
            mockSiteRepository.exportAll.mockResolvedValue(mockSites);
            mockSettingsRepository.getAll.mockResolvedValue(mockSettings);
            vi.mocked(safeJsonStringifyWithFallback).mockReturnValue(
                JSON.stringify(mockExportedData)
            );

            const result = await service.exportAllData();

            expect(mockSiteRepository.exportAll).toHaveBeenCalledOnce();
            expect(mockSettingsRepository.getAll).toHaveBeenCalledOnce();
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
            expect(result).toBe(JSON.stringify(mockExportedData));
        });

        it("should include correct timestamp in export data", async () => {
            const startTime = Date.now();

            mockSiteRepository.exportAll.mockResolvedValue([]);
            mockSettingsRepository.getAll.mockResolvedValue({});
            vi.mocked(safeJsonStringifyWithFallback).mockReturnValue("{}");

            await service.exportAllData();

            const endTime = Date.now();

            const callArgs = vi.mocked(safeJsonStringifyWithFallback).mock
                .calls[0][0] as any;
            const exportTime = new Date(callArgs.exportedAt).getTime();
            expect(exportTime).toBeGreaterThanOrEqual(startTime);
            expect(exportTime).toBeLessThanOrEqual(endTime);
        });

        it("should handle repository export errors with proper error handling", async () => {
            const exportError = new Error("Repository export failed");
            mockSiteRepository.exportAll.mockRejectedValue(exportError);

            await expect(service.exportAllData()).rejects.toThrow(
                SiteLoadingError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to export data"),
                exportError
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "export-data",
                    error: exportError,
                    details: expect.stringContaining("Failed to export data"),
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should handle settings repository errors", async () => {
            const settingsError = new Error("Settings export failed");
            mockSiteRepository.exportAll.mockResolvedValue([]);
            mockSettingsRepository.getAll.mockRejectedValue(settingsError);

            await expect(service.exportAllData()).rejects.toThrow(
                SiteLoadingError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to export data"),
                settingsError
            );
        });

        it("should handle JSON stringification errors", async () => {
            const jsonError = new Error("JSON stringify failed");
            mockSiteRepository.exportAll.mockResolvedValue([]);
            mockSettingsRepository.getAll.mockResolvedValue({});
            vi.mocked(safeJsonStringifyWithFallback).mockImplementation(() => {
                throw jsonError;
            });

            await expect(service.exportAllData()).rejects.toThrow(
                SiteLoadingError
            );

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to export data"),
                jsonError
            );
        });

        it("should handle non-Error exceptions", async () => {
            const stringError = "String error";
            mockSiteRepository.exportAll.mockRejectedValue(stringError);

            await expect(service.exportAllData()).rejects.toThrow(
                SiteLoadingError
            );

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    error: expect.any(Error),
                    details: expect.stringContaining(stringError),
                })
            );
        });
    });

    describe("importDataFromJson", () => {
        const validJsonData = JSON.stringify({
            sites: [
                {
                    identifier: "imported-site1",
                    name: "Imported Site",
                    url: "https://imported.com",
                },
            ],
            settings: {
                importedSetting: "test",
            },
        });

        it("should parse valid JSON data successfully", async () => {
            const parsedData = {
                sites: [
                    {
                        identifier: "imported-site1",
                        name: "Imported Site",
                        url: "https://imported.com",
                    },
                ],
                settings: {
                    importedSetting: "test",
                },
            };

            vi.mocked(safeJsonParse).mockReturnValue({
                success: true,
                data: parsedData,
            });

            const result = await service.importDataFromJson(validJsonData);

            expect(safeJsonParse).toHaveBeenCalledWith(
                validJsonData,
                expect.any(Function)
            );
            expect(result).toEqual({
                sites: parsedData.sites,
                settings: parsedData.settings,
            });
        });

        it("should handle data without settings", async () => {
            const parsedData = {
                sites: [
                    {
                        identifier: "site1",
                        name: "Test Site",
                    },
                ],
            };

            vi.mocked(safeJsonParse).mockReturnValue({
                success: true,
                data: parsedData,
            });

            const result = await service.importDataFromJson(validJsonData);

            expect(result).toEqual({
                sites: parsedData.sites,
                settings: {},
            });
        });

        it("should handle parsing errors with proper error handling", async () => {
            const parseError = "Invalid JSON format";
            vi.mocked(safeJsonParse).mockReturnValue({
                success: false,
                error: parseError,
            });

            await expect(
                service.importDataFromJson("invalid json")
            ).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to parse import data"),
                expect.any(Error)
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "import-data-parse",
                    details: expect.stringContaining(
                        "Failed to parse import data"
                    ),
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should handle validation failures", async () => {
            vi.mocked(safeJsonParse).mockReturnValue({
                success: false,
                data: null,
            });

            await expect(
                service.importDataFromJson(validJsonData)
            ).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to parse import data"),
                expect.any(Error)
            );
        });

        it("should handle empty data scenario", async () => {
            const emptyData = {
                sites: [],
            };

            vi.mocked(safeJsonParse).mockReturnValue({
                success: true,
                data: emptyData,
            });

            const result = await service.importDataFromJson(
                JSON.stringify(emptyData)
            );

            expect(result).toEqual({
                sites: [],
                settings: {},
            });
        });

        it("should handle non-Error exceptions during parsing", async () => {
            const stringError = "String parsing error";
            vi.mocked(safeJsonParse).mockImplementation(() => {
                throw stringError;
            });

            await expect(
                service.importDataFromJson(validJsonData)
            ).rejects.toThrow(SiteLoadingError);

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    error: expect.any(Error),
                    details: expect.stringContaining(stringError),
                })
            );
        });
    });

    describe("persistImportedData", () => {
        const sampleSites: ImportSite[] = [
            {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor1",
                        siteId: "site1",
                        type: "http",
                        config: { timeout: 5000 },
                        isActive: true,
                        history: [
                            {
                                id: "history1",
                                monitorId: "monitor1",
                                status: "up",
                                responseTime: 200,
                                timestamp: "2023-01-01T01:00:00.000Z",
                            },
                        ],
                    },
                ],
            },
        ];

        const sampleSettings = {
            setting1: "value1",
            setting2: "value2",
        };

        it("should persist imported data successfully with transaction", async () => {
            const createdMonitors = [
                {
                    id: "1",
                    type: "http",
                    url: "https://test.com",
                    port: undefined,
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sampleSites, sampleSettings);

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledOnce();
            expect(mockSiteRepository.deleteAllInternal).toHaveBeenCalledWith(
                mockDatabase
            );
            expect(
                mockSettingsRepository.deleteAllInternal
            ).toHaveBeenCalledWith(mockDatabase);
            expect(
                mockMonitorRepository.deleteAllInternal
            ).toHaveBeenCalledWith(mockDatabase);
            expect(
                mockHistoryRepository.deleteAllInternal
            ).toHaveBeenCalledWith(mockDatabase);

            expect(mockSiteRepository.bulkInsertInternal).toHaveBeenCalledWith(
                mockDatabase,
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: "site1",
                        name: "Test Site",
                        monitoring: true,
                    }),
                ])
            );

            expect(
                mockSettingsRepository.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDatabase, sampleSettings);

            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Successfully imported 1 sites and 2 settings"
                )
            );
        });

        it("should handle sites without names", async () => {
            const sitesWithoutNames: ImportSite[] = [
                {
                    identifier: "site1",
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );

            await service.persistImportedData(sitesWithoutNames, {});

            expect(mockSiteRepository.bulkInsertInternal).toHaveBeenCalledWith(
                mockDatabase,
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: "site1",
                        monitoring: true,
                    }),
                ])
            );
        });

        it("should call withDatabaseOperation correctly", async () => {
            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );

            await service.persistImportedData([], {});

            expect(withDatabaseOperation).toHaveBeenCalledWith(
                expect.any(Function),
                "data-import-persist",
                mockEventEmitter,
                {
                    sitesCount: 0,
                    settingsCount: 0,
                }
            );
        });

        it("should handle monitor creation and history import", async () => {
            const createdMonitors = [
                {
                    id: "1",
                    type: "http",
                    url: "https://test.com",
                    port: undefined,
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sampleSites, sampleSettings);

            expect(mockMonitorRepository.bulkCreate).toHaveBeenCalledWith(
                "site1",
                sampleSites[0].monitors
            );
            expect(mockHistoryRepository.addEntryInternal).toHaveBeenCalledWith(
                mockDatabase,
                "1",
                {
                    status: "up",
                    responseTime: 200,
                    timestamp: "2023-01-01T01:00:00.000Z",
                },
                ""
            );
        });

        it("should handle sites without monitors", async () => {
            const sitesWithoutMonitors: ImportSite[] = [
                {
                    identifier: "site1",
                    name: "Test Site",
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );

            await service.persistImportedData(sitesWithoutMonitors, {});

            expect(mockMonitorRepository.bulkCreate).not.toHaveBeenCalled();
            expect(
                mockHistoryRepository.addEntryInternal
            ).not.toHaveBeenCalled();
        });

        it("should handle empty monitors array", async () => {
            const sitesWithEmptyMonitors: ImportSite[] = [
                {
                    identifier: "site1",
                    name: "Test Site",
                    monitors: [],
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );

            await service.persistImportedData(sitesWithEmptyMonitors, {});

            expect(mockMonitorRepository.bulkCreate).not.toHaveBeenCalled();
        });

        it("should handle monitor creation errors gracefully", async () => {
            const monitorError = new Error("Monitor creation failed");

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockRejectedValue(monitorError);

            await service.persistImportedData(sampleSites, sampleSettings);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Failed to import monitors for site site1"
                ),
                monitorError
            );

            // Should still complete the rest of the import
            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Successfully imported 1 sites and 2 settings"
                )
            );
        });

        it("should handle monitors without history", async () => {
            const sitesWithMonitorsNoHistory: ImportSite[] = [
                {
                    identifier: "site1",
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            isActive: true,
                        },
                    ],
                },
            ];

            const createdMonitors = [
                {
                    id: "1",
                    type: "http",
                    url: "https://test.com",
                    port: undefined,
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sitesWithMonitorsNoHistory, {});

            expect(
                mockHistoryRepository.addEntryInternal
            ).not.toHaveBeenCalled();
        });

        it("should handle monitors with empty history array", async () => {
            const sitesWithEmptyHistory: ImportSite[] = [
                {
                    identifier: "site1",
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            isActive: true,
                            history: [],
                        },
                    ],
                },
            ];

            const createdMonitors = [
                {
                    id: "1",
                    type: "http",
                    url: "https://test.com",
                    port: undefined,
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sitesWithEmptyHistory, {});

            expect(
                mockHistoryRepository.addEntryInternal
            ).not.toHaveBeenCalled();
        });

        it("should handle multiple history entries per monitor", async () => {
            const sitesWithMultipleHistory: ImportSite[] = [
                {
                    identifier: "site1",
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            url: "https://test.com",
                            port: undefined,
                            history: [
                                {
                                    status: "up",
                                    responseTime: 200,
                                    timestamp: "2023-01-01T01:00:00.000Z",
                                },
                                {
                                    status: "down",
                                    responseTime: 0,
                                    timestamp: "2023-01-01T02:00:00.000Z",
                                },
                            ],
                        },
                    ],
                },
            ];

            const createdMonitors = [
                {
                    id: "1",
                    type: "http",
                    url: "https://test.com",
                    port: undefined,
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sitesWithMultipleHistory, {});

            expect(
                mockHistoryRepository.addEntryInternal
            ).toHaveBeenCalledTimes(2);
            expect(
                mockHistoryRepository.addEntryInternal
            ).toHaveBeenNthCalledWith(
                1,
                mockDatabase,
                "1",
                {
                    status: "up",
                    responseTime: 200,
                    timestamp: "2023-01-01T01:00:00.000Z",
                },
                ""
            );
            expect(
                mockHistoryRepository.addEntryInternal
            ).toHaveBeenNthCalledWith(
                2,
                mockDatabase,
                "1",
                {
                    status: "down",
                    responseTime: 0,
                    timestamp: "2023-01-01T02:00:00.000Z",
                },
                ""
            );
        });

        it("should handle monitor matching with different ports", async () => {
            const sitesWithPortedMonitors: ImportSite[] = [
                {
                    identifier: "site1",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            url: "https://test.com",
                            port: 8080,
                            history: [
                                {
                                    status: "up",
                                    responseTime: 200,
                                    timestamp: "2023-01-01T01:00:00.000Z",
                                },
                            ],
                        },
                    ],
                },
            ];

            const createdMonitors = [
                {
                    id: "1",
                    type: "http",
                    url: "https://test.com",
                    port: 8080,
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sitesWithPortedMonitors, {});

            expect(mockHistoryRepository.addEntryInternal).toHaveBeenCalledWith(
                mockDatabase,
                "1",
                {
                    status: "up",
                    responseTime: 200,
                    timestamp: "2023-01-01T01:00:00.000Z",
                },
                ""
            );
        });

        it("should handle created monitors without id", async () => {
            const createdMonitorsWithoutId = [
                {
                    type: "http",
                    url: "https://test.com",
                    port: undefined,
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockResolvedValue(
                createdMonitorsWithoutId
            );

            await service.persistImportedData(sampleSites, {});

            expect(
                mockHistoryRepository.addEntryInternal
            ).not.toHaveBeenCalled();
        });

        it("should log debug information for successful monitor imports", async () => {
            const createdMonitors = [
                {
                    id: "1",
                    type: "http",
                    url: "https://test.com",
                },
            ];

            mockDatabaseService.executeTransaction.mockImplementation(
                async (callback) => {
                    return await callback(mockDatabase);
                }
            );
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sampleSites, {});

            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Imported 1 monitors for site: site1")
            );
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle database transaction failures", async () => {
            const transactionError = new Error("Transaction failed");
            mockDatabaseService.executeTransaction.mockRejectedValue(
                transactionError
            );

            await expect(service.persistImportedData([], {})).rejects.toThrow();
        });

        it("should handle event emission failures during export", async () => {
            const emitError = new Error("Event emission failed");
            mockSiteRepository.exportAll.mockRejectedValue(
                new Error("Export failed")
            );
            mockEventEmitter.emitTyped.mockRejectedValue(emitError);

            await expect(service.exportAllData()).rejects.toThrow(
                SiteLoadingError
            );
        });

        it("should handle event emission failures during import parsing", async () => {
            const emitError = new Error("Event emission failed");
            vi.mocked(safeJsonParse).mockReturnValue({
                success: false,
                error: "Parse failed",
            });
            mockEventEmitter.emitTyped.mockRejectedValue(emitError);

            await expect(service.importDataFromJson("invalid")).rejects.toThrow(
                SiteLoadingError
            );
        });

        it("should handle withDatabaseOperation failures", async () => {
            const operationError = new Error("Operation failed");
            vi.mocked(withDatabaseOperation).mockRejectedValue(operationError);

            await expect(service.persistImportedData([], {})).rejects.toThrow(
                operationError
            );
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle complete import/export cycle", async () => {
            // Test export
            const mockExportData = {
                sites: [{ identifier: "site1", name: "Test Site" }],
                settings: { key1: "value1" },
            };

            mockSiteRepository.exportAll.mockResolvedValue(
                mockExportData.sites
            );
            mockSettingsRepository.getAll.mockResolvedValue(
                mockExportData.settings
            );
            vi.mocked(safeJsonStringifyWithFallback).mockReturnValue(
                JSON.stringify(mockExportData)
            );

            const exportResult = await service.exportAllData();

            // Test import
            vi.mocked(safeJsonParse).mockReturnValue({
                success: true,
                data: mockExportData,
            });

            const importResult = await service.importDataFromJson(exportResult);

            expect(importResult.sites).toEqual(mockExportData.sites);
            expect(importResult.settings).toEqual(mockExportData.settings);
        });
    });
});
