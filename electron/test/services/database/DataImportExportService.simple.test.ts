/**
 * @fileoverview Comprehensive isolated tests for DataImportExportService
 * 
 * Tests all public methods, error handling, and various edge cases 
 * for data import/export operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Database } from 'node-sqlite3-wasm';

// Mock implementations
const mockSiteLoadingError = class extends Error {
    constructor(message: string, cause?: Error) {
        super(message);
        this.name = 'SiteLoadingError';
        if (cause) this.cause = cause;
    }
};

const mockWithDatabaseOperation = vi.fn().mockImplementation(async (operation) => {
    return await operation();
});

const mockSafeJsonParse = vi.fn();
const mockSafeJsonStringifyWithFallback = vi.fn();

// Mock external modules
vi.mock('../../../utils/database/interfaces', () => ({
    SiteLoadingError: mockSiteLoadingError
}));

vi.mock('../../../utils/operationalHooks', () => ({
    withDatabaseOperation: mockWithDatabaseOperation
}));

vi.mock('@shared/utils/errorCatalog', () => ({
    ERROR_CATALOG: {
        database: {
            IMPORT_DATA_INVALID: 'Invalid import data format'
        }
    }
}));

vi.mock('@shared/utils/jsonSafety', () => ({
    safeJsonParse: mockSafeJsonParse,
    safeJsonStringifyWithFallback: mockSafeJsonStringifyWithFallback
}));

import { DataImportExportService, type DataImportExportConfig, type ImportSite } from '../../../utils/database/DataImportExportService';

describe('DataImportExportService', () => {
    // Mock dependencies
    let mockSiteRepository: any;
    let mockSettingsRepository: any;
    let mockMonitorRepository: any;
    let mockHistoryRepository: any;
    let mockDatabaseService: any;
    let mockEventEmitter: any;
    let mockLogger: any;
    let service: DataImportExportService;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup repository mocks
        mockSiteRepository = {
            exportAll: vi.fn(),
            bulkInsertInternal: vi.fn(),
            deleteAllInternal: vi.fn()
        };

        mockSettingsRepository = {
            getAll: vi.fn(),
            bulkInsertInternal: vi.fn(),
            deleteAllInternal: vi.fn()
        };

        mockMonitorRepository = {
            bulkCreate: vi.fn(),
            deleteAllInternal: vi.fn()
        };

        mockHistoryRepository = {
            deleteAllInternal: vi.fn(),
            addEntryInternal: vi.fn()
        };

        mockDatabaseService = {
            executeTransaction: vi.fn()
        };

        mockEventEmitter = {
            emitTyped: vi.fn()
        };

        mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn()
        };

        // Create service instance
        const config: DataImportExportConfig = {
            repositories: {
                site: mockSiteRepository,
                settings: mockSettingsRepository,
                monitor: mockMonitorRepository,
                history: mockHistoryRepository
            },
            databaseService: mockDatabaseService,
            eventEmitter: mockEventEmitter,
            logger: mockLogger
        };

        service = new DataImportExportService(config);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with provided configuration', () => {
            expect(service).toBeInstanceOf(DataImportExportService);
        });
    });

    describe('exportAllData', () => {
        it('should export all data successfully', async () => {
            const mockSites = [
                {
                    identifier: 'site1',
                    name: 'Test Site',
                    url: 'https://test.com'
                }
            ];

            const mockSettings = {
                'setting1': 'value1'
            };

            // Setup mocks
            mockSiteRepository.exportAll.mockResolvedValue(mockSites);
            mockSettingsRepository.getAll.mockResolvedValue(mockSettings);
            mockSafeJsonStringifyWithFallback.mockReturnValue('{"test":"data"}');

            const result = await service.exportAllData();

            expect(mockSiteRepository.exportAll).toHaveBeenCalledOnce();
            expect(mockSettingsRepository.getAll).toHaveBeenCalledOnce();
            expect(mockSafeJsonStringifyWithFallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    sites: mockSites,
                    settings: mockSettings,
                    version: '1.0',
                    exportedAt: expect.any(String)
                }),
                '{}',
                2
            );
            expect(result).toBe('{"test":"data"}');
        });

        it('should handle repository export errors', async () => {
            const exportError = new Error('Repository export failed');
            mockSiteRepository.exportAll.mockRejectedValue(exportError);

            await expect(service.exportAllData()).rejects.toThrow(mockSiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to export data'),
                exportError
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                'database:error',
                expect.objectContaining({
                    operation: 'export-data',
                    error: exportError,
                    details: expect.stringContaining('Failed to export data'),
                    timestamp: expect.any(Number)
                })
            );
        });

        it('should handle settings repository errors', async () => {
            const settingsError = new Error('Settings export failed');
            mockSiteRepository.exportAll.mockResolvedValue([]);
            mockSettingsRepository.getAll.mockRejectedValue(settingsError);

            await expect(service.exportAllData()).rejects.toThrow(mockSiteLoadingError);
        });

        it('should handle JSON stringification errors', async () => {
            const jsonError = new Error('JSON stringify failed');
            mockSiteRepository.exportAll.mockResolvedValue([]);
            mockSettingsRepository.getAll.mockResolvedValue({});
            mockSafeJsonStringifyWithFallback.mockImplementation(() => {
                throw jsonError;
            });

            await expect(service.exportAllData()).rejects.toThrow(mockSiteLoadingError);
        });

        it('should include correct timestamp in export data', async () => {
            const startTime = Date.now();
            
            mockSiteRepository.exportAll.mockResolvedValue([]);
            mockSettingsRepository.getAll.mockResolvedValue({});
            mockSafeJsonStringifyWithFallback.mockReturnValue('{}');

            await service.exportAllData();
            
            const endTime = Date.now();

            const callArgs = mockSafeJsonStringifyWithFallback.mock.calls[0][0] as any;
            const exportTime = new Date(callArgs.exportedAt).getTime();
            expect(exportTime).toBeGreaterThanOrEqual(startTime);
            expect(exportTime).toBeLessThanOrEqual(endTime);
        });
    });

    describe('importDataFromJson', () => {
        it('should parse valid JSON data successfully', async () => {
            const parsedData = {
                sites: [
                    {
                        identifier: 'imported-site1',
                        name: 'Imported Site'
                    }
                ],
                settings: {
                    'importedSetting': 'test'
                }
            };

            mockSafeJsonParse.mockReturnValue({
                success: true,
                data: parsedData
            });

            const result = await service.importDataFromJson('{"test":"data"}');

            expect(mockSafeJsonParse).toHaveBeenCalledWith('{"test":"data"}', expect.any(Function));
            expect(result).toEqual({
                sites: parsedData.sites,
                settings: parsedData.settings
            });
        });

        it('should handle data without settings', async () => {
            const parsedData = {
                sites: [
                    {
                        identifier: 'site1',
                        name: 'Test Site'
                    }
                ]
            };

            mockSafeJsonParse.mockReturnValue({
                success: true,
                data: parsedData
            });

            const result = await service.importDataFromJson('{"test":"data"}');

            expect(result).toEqual({
                sites: parsedData.sites,
                settings: {}
            });
        });

        it('should handle parsing errors', async () => {
            const parseError = 'Invalid JSON format';
            mockSafeJsonParse.mockReturnValue({
                success: false,
                error: parseError
            });

            await expect(service.importDataFromJson('invalid json')).rejects.toThrow(mockSiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to parse import data'),
                expect.any(Error)
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                'database:error',
                expect.objectContaining({
                    operation: 'import-data-parse',
                    details: expect.stringContaining('Failed to parse import data'),
                    timestamp: expect.any(Number)
                })
            );
        });

        it('should handle validation failures', async () => {
            mockSafeJsonParse.mockReturnValue({
                success: false,
                data: null
            });

            await expect(service.importDataFromJson('test')).rejects.toThrow(mockSiteLoadingError);
        });

        it('should handle empty data scenario', async () => {
            const emptyData = {
                sites: []
            };

            mockSafeJsonParse.mockReturnValue({
                success: true,
                data: emptyData
            });

            const result = await service.importDataFromJson('{"sites":[]}');

            expect(result).toEqual({
                sites: [],
                settings: {}
            });
        });
    });

    describe('persistImportedData', () => {
        const sampleSites: ImportSite[] = [
            {
                identifier: 'site1',
                name: 'Test Site',
                monitors: [
                    {
                        id: 'monitor1',
                        type: 'http',
                        history: [
                            {
                                status: 'up',
                                responseTime: 200,
                                timestamp: '2023-01-01T01:00:00.000Z'
                            }
                        ]
                    }
                ]
            }
        ];

        const sampleSettings = {
            'setting1': 'value1'
        };

        it('should persist imported data successfully', async () => {
            const createdMonitors = [
                {
                    id: '1',
                    type: 'http',
                    url: 'https://test.com',
                    port: undefined
                }
            ];

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sampleSites, sampleSettings);

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalledOnce();
            expect(mockSiteRepository.deleteAllInternal).toHaveBeenCalled();
            expect(mockSettingsRepository.deleteAllInternal).toHaveBeenCalled();
            expect(mockMonitorRepository.deleteAllInternal).toHaveBeenCalled();
            expect(mockHistoryRepository.deleteAllInternal).toHaveBeenCalled();

            expect(mockSiteRepository.bulkInsertInternal).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: 'site1',
                        name: 'Test Site',
                        monitoring: true
                    })
                ])
            );

            expect(mockSettingsRepository.bulkInsertInternal).toHaveBeenCalledWith(
                expect.anything(),
                sampleSettings
            );

            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Successfully imported 1 sites and 1 settings')
            );
        });

        it('should handle sites without names', async () => {
            const sitesWithoutNames: ImportSite[] = [
                {
                    identifier: 'site1'
                }
            ];

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });

            await service.persistImportedData(sitesWithoutNames, {});

            expect(mockSiteRepository.bulkInsertInternal).toHaveBeenCalledWith(
                expect.anything(),
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: 'site1',
                        monitoring: true
                    })
                ])
            );
        });

        it('should call withDatabaseOperation correctly', async () => {
            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });

            await service.persistImportedData([], {});

            expect(mockWithDatabaseOperation).toHaveBeenCalledWith(
                expect.any(Function),
                'data-import-persist',
                mockEventEmitter,
                {
                    sitesCount: 0,
                    settingsCount: 0
                }
            );
        });

        it('should handle monitor creation and history import', async () => {
            const createdMonitors = [
                {
                    id: '1',
                    type: 'http',
                    url: 'https://test.com',
                    port: undefined
                }
            ];

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sampleSites, sampleSettings);

            expect(mockMonitorRepository.bulkCreate).toHaveBeenCalledWith(
                'site1',
                sampleSites[0].monitors
            );
            expect(mockHistoryRepository.addEntryInternal).toHaveBeenCalledWith(
                expect.anything(),
                '1',
                {
                    status: 'up',
                    responseTime: 200,
                    timestamp: '2023-01-01T01:00:00.000Z'
                },
                ''
            );
        });

        it('should handle sites without monitors', async () => {
            const sitesWithoutMonitors: ImportSite[] = [
                {
                    identifier: 'site1',
                    name: 'Test Site'
                }
            ];

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });

            await service.persistImportedData(sitesWithoutMonitors, {});

            expect(mockMonitorRepository.bulkCreate).not.toHaveBeenCalled();
            expect(mockHistoryRepository.addEntryInternal).not.toHaveBeenCalled();
        });

        it('should handle monitor creation errors gracefully', async () => {
            const monitorError = new Error('Monitor creation failed');
            
            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });
            mockMonitorRepository.bulkCreate.mockRejectedValue(monitorError);

            await service.persistImportedData(sampleSites, sampleSettings);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Failed to import monitors for site site1'),
                monitorError
            );

            // Should still complete the rest of the import
            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Successfully imported 1 sites and 1 settings')
            );
        });

        it('should handle monitors without history', async () => {
            const sitesWithMonitorsNoHistory: ImportSite[] = [
                {
                    identifier: 'site1',
                    name: 'Test Site',
                    monitors: [
                        {
                            id: 'monitor1',
                            type: 'http'
                        }
                    ]
                }
            ];

            const createdMonitors = [
                {
                    id: '1',
                    type: 'http',
                    url: 'https://test.com',
                    port: undefined
                }
            ];

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sitesWithMonitorsNoHistory, {});

            expect(mockHistoryRepository.addEntryInternal).not.toHaveBeenCalled();
        });

        it('should handle multiple history entries per monitor', async () => {
            const sitesWithMultipleHistory: ImportSite[] = [
                {
                    identifier: 'site1',
                    name: 'Test Site',
                    monitors: [
                        {
                            id: 'monitor1',
                            type: 'http',
                            url: 'https://test.com',
                            port: undefined,
                            history: [
                                {
                                    status: 'up',
                                    responseTime: 200,
                                    timestamp: '2023-01-01T01:00:00.000Z'
                                },
                                {
                                    status: 'down',
                                    responseTime: 0,
                                    timestamp: '2023-01-01T02:00:00.000Z'
                                }
                            ]
                        }
                    ]
                }
            ];

            const createdMonitors = [
                {
                    id: '1',
                    type: 'http',
                    url: 'https://test.com',
                    port: undefined
                }
            ];

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sitesWithMultipleHistory, {});

            expect(mockHistoryRepository.addEntryInternal).toHaveBeenCalledTimes(2);
            expect(mockHistoryRepository.addEntryInternal).toHaveBeenNthCalledWith(1,
                expect.anything(),
                '1',
                {
                    status: 'up',
                    responseTime: 200,
                    timestamp: '2023-01-01T01:00:00.000Z'
                },
                ''
            );
            expect(mockHistoryRepository.addEntryInternal).toHaveBeenNthCalledWith(2,
                expect.anything(),
                '1',
                {
                    status: 'down',
                    responseTime: 0,
                    timestamp: '2023-01-01T02:00:00.000Z'
                },
                ''
            );
        });

        it('should handle created monitors without id', async () => {
            const createdMonitorsWithoutId = [
                {
                    type: 'http',
                    url: 'https://test.com',
                    port: undefined
                }
            ];

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitorsWithoutId);

            await service.persistImportedData(sampleSites, {});

            expect(mockHistoryRepository.addEntryInternal).not.toHaveBeenCalled();
        });

        it('should log debug information for successful monitor imports', async () => {
            const createdMonitors = [
                {
                    id: '1',
                    type: 'http',
                    url: 'https://test.com'
                }
            ];

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: any) => {
                return await callback({} as Database);
            });
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await service.persistImportedData(sampleSites, sampleSettings);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining('Imported 1 monitors for site: site1')
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle database transaction failures', async () => {
            const transactionError = new Error('Transaction failed');
            mockDatabaseService.executeTransaction.mockRejectedValue(transactionError);

            await expect(service.persistImportedData([], {})).rejects.toThrow();
        });

        it('should handle event emission failures during export', async () => {
            const emitError = new Error('Event emission failed');
            mockSiteRepository.exportAll.mockRejectedValue(new Error('Export failed'));
            mockEventEmitter.emitTyped.mockRejectedValue(emitError);

            await expect(service.exportAllData()).rejects.toThrow(mockSiteLoadingError);
        });

        it('should handle withDatabaseOperation failures', async () => {
            const operationError = new Error('Operation failed');
            mockWithDatabaseOperation.mockRejectedValue(operationError);

            await expect(service.persistImportedData([], {})).rejects.toThrow(operationError);
        });
    });
});
