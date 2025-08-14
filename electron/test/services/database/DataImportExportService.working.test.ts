/**
 * DataImportExportService Tests - Isolated Component Testing
 *
 * Tests DataImportExportService without ServiceContainer dependencies.
 * Focuses on data export, import validation, and persistence operations.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataImportExportService } from "../../../utils/database/DataImportExportService";
import type { Site } from "@shared/types";

// Mock logger
vi.mock("../../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock error catalog
vi.mock("../../../../shared/utils/errorCatalog", () => ({
    ERROR_CATALOG: {
        EXPORT: {
            INVALID_DATA: {
                message: "Invalid data for export",
                code: "EXPORT_INVALID_DATA",
            },
            SITES_ERROR: {
                message: "Failed to export sites",
                code: "EXPORT_SITES_ERROR",
            },
            SETTINGS_ERROR: {
                message: "Failed to export settings",
                code: "EXPORT_SETTINGS_ERROR",
            },
        },
        IMPORT: {
            INVALID_FORMAT: {
                message: "Invalid import format",
                code: "IMPORT_INVALID_FORMAT",
            },
            PARSE_ERROR: {
                message: "Failed to parse import data",
                code: "IMPORT_PARSE_ERROR",
            },
            VALIDATION_FAILED: {
                message: "Import validation failed",
                code: "IMPORT_VALIDATION_FAILED",
            },
            SAVE_ERROR: {
                message: "Failed to save imported data",
                code: "IMPORT_SAVE_ERROR",
            },
        },
    },
}));

// Mock JSON utilities using factory function to avoid hoisting issues
vi.mock("../../../../shared/utils/jsonSafety", () => ({
    safeJsonParse: vi.fn(),
    safeJsonStringifyWithFallback: vi.fn(),
}));

describe("DataImportExportService - Isolated Tests", () => {
    let service: DataImportExportService;
    let mockConfig: any;
    let mockSites: Site[];
    let mockSettings: Record<string, string>;
    let mockSafeJsonParse: any;
    let mockSafeJsonStringifyWithFallback: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Import the mocked utilities
        const { safeJsonParse, safeJsonStringifyWithFallback } = await import(
            "../../../../shared/utils/jsonSafety"
        );
        mockSafeJsonParse = safeJsonParse;
        mockSafeJsonStringifyWithFallback = safeJsonStringifyWithFallback;

        // Mock sites data
        mockSites = [
            {
                identifier: "site1",
                name: "Test Site 1",
                monitoring: true,
                monitors: [],
            },
            {
                identifier: "site2",
                name: "Test Site 2",
                monitoring: false,
                monitors: [],
            },
        ];

        // Mock settings data
        mockSettings = {
            "app.theme": "light",
            "app.language": "en",
            "notifications.enabled": "true",
            "check.interval": "300",
        };

        // Mock repositories with proper methods
        const mockSiteRepository = {
            exportAll: vi.fn().mockResolvedValue(mockSites),
            bulkInsertInternal: vi.fn().mockResolvedValue(undefined),
            deleteAllInternal: vi.fn().mockResolvedValue(undefined),
            // Add required repository methods
            databaseService: null,
            bulkInsert: vi.fn(),
            delete: vi.fn(),
            deleteAll: vi.fn(),
            exists: vi.fn(),
            findAll: vi.fn(),
            findByIdentifier: vi.fn(),
            upsert: vi.fn(),
        };

        const mockSettingsRepository = {
            getAll: vi.fn().mockResolvedValue(mockSettings),
            bulkInsertInternal: vi.fn().mockResolvedValue(undefined),
            deleteAllInternal: vi.fn().mockResolvedValue(undefined),
            // Add required repository methods
            databaseService: null,
            bulkInsert: vi.fn(),
            delete: vi.fn(),
            deleteAll: vi.fn(),
            get: vi.fn(),
            set: vi.fn(),
        };

        // Mock other repositories
        const mockHistoryRepository = {
            databaseService: null,
            bulkInsert: vi.fn(),
            delete: vi.fn(),
            deleteAll: vi.fn(),
        };

        const mockMonitorRepository = {
            databaseService: null,
            bulkInsert: vi.fn(),
            delete: vi.fn(),
            deleteAll: vi.fn(),
        };

        // Mock database service
        const mockDatabaseService = {
            executeTransaction: vi.fn().mockImplementation((fn) => fn()),
            db: null,
            close: vi.fn(),
            getDatabase: vi.fn(),
            initialize: vi.fn(),
        };

        // Mock event emitter
        const mockEventEmitter = {
            emit: vi.fn(),
            busId: "test",
            maxMiddleware: 10,
            middlewares: [],
            emitTyped: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
        };

        // Mock logger
        const mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
            error: vi.fn(),
        };

        // Create config (cast to any to avoid complex interface matching)
        mockConfig = {
            repositories: {
                site: mockSiteRepository,
                settings: mockSettingsRepository,
                history: mockHistoryRepository,
                monitor: mockMonitorRepository,
            },
            databaseService: mockDatabaseService,
            eventEmitter: mockEventEmitter,
            logger: mockLogger,
        } as any;

        service = new DataImportExportService(mockConfig);
    });

    describe("Constructor", () => {
        it("should initialize with provided config", () => {
            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(DataImportExportService);
        });
    });

    describe("exportAllData", () => {
        it("should export sites and settings successfully", async () => {
            mockSafeJsonStringifyWithFallback.mockReturnValue(
                '{"sites":[],"settings":{},"metadata":{}}'
            );

            const result = await service.exportAllData();

            expect(mockConfig.repositories.site.exportAll).toHaveBeenCalled();
            expect(mockConfig.repositories.settings.getAll).toHaveBeenCalled();
            expect(mockSafeJsonStringifyWithFallback).toHaveBeenCalledWith(
                {
                    sites: mockSites,
                    settings: mockSettings,
                    metadata: {
                        exportDate: expect.any(String),
                        version: "1.0",
                        format: "uptime-watcher-backup",
                    },
                },
                2
            );
            expect(result).toBe('{"sites":[],"settings":{},"metadata":{}}');
            expect(mockConfig.logger.info).toHaveBeenCalledWith(
                "Data export completed successfully"
            );
        });

        it("should handle sites repository error", async () => {
            const error = new Error("Sites fetch failed");
            mockConfig.repositories.site.exportAll.mockRejectedValue(error);

            await expect(service.exportAllData()).rejects.toThrow(
                "Sites fetch failed"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data",
                { error }
            );
        });

        it("should handle settings repository error", async () => {
            const error = new Error("Settings fetch failed");
            mockConfig.repositories.settings.getAll.mockRejectedValue(error);

            await expect(service.exportAllData()).rejects.toThrow(
                "Settings fetch failed"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data",
                { error }
            );
        });

        it("should handle JSON stringify error", async () => {
            mockSafeJsonStringifyWithFallback.mockReturnValue(null);

            await expect(service.exportAllData()).rejects.toThrow(
                "Failed to serialize export data"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data",
                { error: expect.any(Error) }
            );
        });
    });

    describe("importDataFromJson", () => {
        const validJsonData = JSON.stringify({
            sites: [
                {
                    identifier: "site1",
                    name: "Test Site 1",
                    monitoring: true,
                    monitors: [],
                },
            ],
            settings: { "app.theme": "light" },
            metadata: {
                exportDate: new Date().toISOString(),
                version: "1.0",
                format: "uptime-watcher-backup",
            },
        });

        it("should parse and validate JSON data successfully", async () => {
            mockSafeJsonParse.mockReturnValue({
                sites: mockSites,
                settings: mockSettings,
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: "1.0",
                    format: "uptime-watcher-backup",
                },
            });

            const result = await service.importDataFromJson(validJsonData);

            expect(mockSafeJsonParse).toHaveBeenCalledWith(validJsonData);
            expect(result).toEqual({
                sites: mockSites,
                settings: mockSettings,
            });
            expect(mockConfig.logger.info).toHaveBeenCalledWith(
                "JSON data parsed and validated successfully"
            );
        });

        it("should handle invalid JSON", async () => {
            mockSafeJsonParse.mockReturnValue(null);

            await expect(
                service.importDataFromJson("invalid json")
            ).rejects.toThrow("Failed to parse JSON data");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to parse import data",
                { error: expect.any(Error) }
            );
        });

        it("should handle missing sites in data", async () => {
            mockSafeJsonParse.mockReturnValue({
                settings: mockSettings,
                metadata: { version: "1.0", format: "uptime-watcher-backup" },
            });

            await expect(
                service.importDataFromJson(validJsonData)
            ).rejects.toThrow("Invalid data format: missing sites array");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to parse import data",
                { error: expect.any(Error) }
            );
        });

        it("should handle missing settings in data", async () => {
            mockSafeJsonParse.mockReturnValue({
                sites: mockSites,
                metadata: { version: "1.0", format: "uptime-watcher-backup" },
            });

            await expect(
                service.importDataFromJson(validJsonData)
            ).rejects.toThrow("Invalid data format: missing settings object");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to parse import data",
                { error: expect.any(Error) }
            );
        });

        it("should handle invalid metadata format", async () => {
            mockSafeJsonParse.mockReturnValue({
                sites: mockSites,
                settings: mockSettings,
                metadata: { version: "2.0", format: "unknown-format" },
            });

            await expect(
                service.importDataFromJson(validJsonData)
            ).rejects.toThrow("Unsupported backup format: unknown-format");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to parse import data",
                { error: expect.any(Error) }
            );
        });

        it("should handle invalid sites array", async () => {
            mockSafeJsonParse.mockReturnValue({
                sites: "not an array",
                settings: mockSettings,
                metadata: { version: "1.0", format: "uptime-watcher-backup" },
            });

            await expect(
                service.importDataFromJson(validJsonData)
            ).rejects.toThrow("Invalid data format: sites must be an array");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to parse import data",
                { error: expect.any(Error) }
            );
        });

        it("should handle invalid settings object", async () => {
            mockSafeJsonParse.mockReturnValue({
                sites: mockSites,
                settings: "not an object",
                metadata: { version: "1.0", format: "uptime-watcher-backup" },
            });

            await expect(
                service.importDataFromJson(validJsonData)
            ).rejects.toThrow(
                "Invalid data format: settings must be an object"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to parse import data",
                { error: expect.any(Error) }
            );
        });
    });

    describe("persistImportedData", () => {
        it("should persist sites and settings successfully", async () => {
            await service.persistImportedData(mockSites, mockSettings);

            expect(
                mockConfig.databaseService.executeTransaction
            ).toHaveBeenCalled();
            expect(
                mockConfig.repositories.site.bulkInsertInternal
            ).toHaveBeenCalledWith(
                expect.any(Object),
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: "site1",
                        monitoring: true,
                    }),
                    expect.objectContaining({
                        identifier: "site2",
                        monitoring: true,
                    }),
                ])
            );
            expect(
                mockConfig.repositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(expect.any(Object), mockSettings);
            expect(mockConfig.eventEmitter.emit).toHaveBeenCalledWith(
                "data:imported",
                {
                    sitesCount: 2,
                    settingsUpdated: true,
                }
            );
            expect(mockConfig.logger.info).toHaveBeenCalledWith(
                "Successfully imported 2 sites and 4 settings"
            );
        });

        it("should handle sites creation error", async () => {
            const error = new Error("Sites creation failed");
            mockConfig.repositories.site.bulkInsertInternal.mockImplementation(
                () => {
                    throw error;
                }
            );

            await expect(
                service.persistImportedData(mockSites, mockSettings)
            ).rejects.toThrow("Sites creation failed");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data",
                { error }
            );
        });

        it("should handle settings update error", async () => {
            const error = new Error("Settings update failed");
            mockConfig.repositories.settings.bulkInsertInternal.mockImplementation(
                () => {
                    throw error;
                }
            );

            await expect(
                service.persistImportedData(mockSites, mockSettings)
            ).rejects.toThrow("Settings update failed");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data",
                { error }
            );
        });

        it("should handle transaction error", async () => {
            const error = new Error("Transaction failed");
            mockConfig.databaseService.executeTransaction.mockRejectedValue(
                error
            );

            await expect(
                service.persistImportedData(mockSites, mockSettings)
            ).rejects.toThrow("Transaction failed");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data",
                { error }
            );
        });

        it("should handle empty sites array", async () => {
            await service.persistImportedData([], mockSettings);

            expect(
                mockConfig.repositories.site.bulkInsertInternal
            ).toHaveBeenCalledWith(expect.any(Object), []);
            expect(
                mockConfig.repositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(expect.any(Object), mockSettings);
            expect(mockConfig.logger.info).toHaveBeenCalledWith(
                "Successfully imported 0 sites and 4 settings"
            );
        });
    });

    describe("Error Handling Integration", () => {
        it("should handle complete workflow errors", async () => {
            mockSafeJsonParse.mockReturnValue({
                sites: mockSites,
                settings: mockSettings,
                metadata: { version: "1.0", format: "uptime-watcher-backup" },
            });

            const error = new Error("Persistence failed");
            mockConfig.repositories.site.bulkInsertInternal.mockImplementation(
                () => {
                    throw error;
                }
            );

            const jsonData = JSON.stringify({
                sites: mockSites,
                settings: mockSettings,
                metadata: { version: "1.0", format: "uptime-watcher-backup" },
            });

            const importedData = await service.importDataFromJson(jsonData);
            await expect(
                service.persistImportedData(
                    importedData.sites,
                    importedData.settings
                )
            ).rejects.toThrow("Persistence failed");

            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data",
                { error }
            );
        });

        it("should handle export workflow with comprehensive error scenarios", async () => {
            // Test successful path first
            mockSafeJsonStringifyWithFallback.mockReturnValueOnce(
                '{"test":"data"}'
            );
            const result1 = await service.exportAllData();
            expect(result1).toBe('{"test":"data"}');

            // Test failure path
            mockSafeJsonStringifyWithFallback.mockReturnValueOnce(null);
            await expect(service.exportAllData()).rejects.toThrow(
                "Failed to serialize export data"
            );

            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data",
                { error: expect.any(Error) }
            );
        });
    });
});
