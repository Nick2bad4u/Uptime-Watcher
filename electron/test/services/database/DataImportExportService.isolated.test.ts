/**
 * DataImportExportService Tests - Isolated Component Testing
 *
 * Tests DataImportExportService without ServiceContainer dependencies.
 * Focuses on data export, import validation, and persistence operations.
 */

/* eslint-disable @typescript-eslint/no-require-imports, unicorn/prefer-module -- Jest test mocking requires dynamic imports */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataImportExportService } from "../../../utils/database/DataImportExportService";

import type { DataImportExportConfig } from "../../../utils/database/DataImportExportService";
import type { Site, Settings } from "../../../../shared/types";

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

// Mock JSON utilities
vi.mock("../../../../shared/utils/jsonValidation", () => ({
    safeJsonParse: vi.fn(),
    safeJsonStringifyWithFallback: vi.fn(),
}));

describe("DataImportExportService - Isolated Tests", () => {
    let service: any;
    let mockConfig: DataImportExportConfig;
    let mockSites: Site[];
    let mockSettings: Settings;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock sites data
        mockSites = [
            {
                id: "site1",
                name: "Test Site 1",
                url: "https://example.com",
                isActive: true,
                checkInterval: 300,
                timeout: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "site2",
                name: "Test Site 2",
                url: "https://test.com",
                isActive: false,
                checkInterval: 600,
                timeout: 45,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        // Mock settings data
        mockSettings = {
            checkInterval: 300,
            timeout: 30,
            retryAttempts: 3,
            notifications: {
                email: {
                    enabled: true,
                    recipient: "test@example.com",
                    smtp: {
                        host: "smtp.example.com",
                        port: 587,
                        secure: false,
                        auth: {
                            user: "user@example.com",
                            pass: "password",
                        },
                    },
                },
                desktop: {
                    enabled: true,
                },
            },
            theme: "light",
            language: "en",
            autoStart: true,
        };

        // Mock repositories
        const mockSiteRepository = {
            getAll: vi.fn().mockResolvedValue(mockSites),
            create: vi.fn().mockResolvedValue(undefined),
            bulkCreate: vi.fn().mockResolvedValue(undefined),
        };

        const mockSettingsRepository = {
            get: vi.fn().mockResolvedValue(mockSettings),
            update: vi.fn().mockResolvedValue(undefined),
        };

        // Mock database service
        const mockDatabaseService = {
            executeTransaction: vi.fn().mockImplementation((fn) => fn()),
        };

        // Mock event emitter
        const mockEventEmitter = {
            emit: vi.fn(),
        };

        // Mock logger
        const mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
            error: vi.fn(),
        };

        // Create config
        mockConfig = {
            repositories: {
                site: mockSiteRepository,
                settings: mockSettingsRepository,
            },
            databaseService: mockDatabaseService,
            eventEmitter: mockEventEmitter,
            logger: mockLogger,
        };

        // Import the service class dynamically to avoid hoisting issues
        const { DataImportExportService } = await import(
            "../../../utils/database/DataImportExportService"
        );
        service = new DataImportExportService(mockConfig);
    });

    describe("Constructor", () => {
        it("should initialize with provided config", () => {
            expect(service).toBeDefined();
            expect(service.config).toEqual(mockConfig);
        });
    });

    describe("exportAllData", () => {
        it("should export sites and settings successfully", async () => {
            const {
                safeJsonStringifyWithFallback,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonStringifyWithFallback.mockReturnValue(
                '{"sites":[],"settings":{},"metadata":{}}'
            );

            const result = await service.exportAllData();

            expect(mockConfig.repositories.site.getAll).toHaveBeenCalled();
            expect(mockConfig.repositories.settings.get).toHaveBeenCalled();
            expect(safeJsonStringifyWithFallback).toHaveBeenCalledWith(
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
            mockConfig.repositories.site.getAll.mockRejectedValue(error);

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
            mockConfig.repositories.settings.get.mockRejectedValue(error);

            await expect(service.exportAllData()).rejects.toThrow(
                "Settings fetch failed"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data",
                { error }
            );
        });

        it("should handle JSON stringify error", async () => {
            const {
                safeJsonStringifyWithFallback,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonStringifyWithFallback.mockReturnValue(null);

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
            sites: mockSites,
            settings: mockSettings,
            metadata: {
                exportDate: new Date().toISOString(),
                version: "1.0",
                format: "uptime-watcher-backup",
            },
        });

        it("should parse and validate JSON data successfully", async () => {
            const {
                safeJsonParse,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonParse.mockReturnValue({
                sites: mockSites,
                settings: mockSettings,
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: "1.0",
                    format: "uptime-watcher-backup",
                },
            });

            const result = await service.importDataFromJson(validJsonData);

            expect(safeJsonParse).toHaveBeenCalledWith(validJsonData);
            expect(result).toEqual({
                sites: mockSites,
                settings: mockSettings,
            });
            expect(mockConfig.logger.info).toHaveBeenCalledWith(
                "JSON data parsed and validated successfully"
            );
        });

        it("should handle invalid JSON", async () => {
            const {
                safeJsonParse,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonParse.mockReturnValue(null);

            await expect(
                service.importDataFromJson("invalid json")
            ).rejects.toThrow("Failed to parse JSON data");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to parse import data",
                { error: expect.any(Error) }
            );
        });

        it("should handle missing sites in data", async () => {
            const {
                safeJsonParse,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonParse.mockReturnValue({
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
            const {
                safeJsonParse,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonParse.mockReturnValue({
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
            const {
                safeJsonParse,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonParse.mockReturnValue({
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
            const {
                safeJsonParse,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonParse.mockReturnValue({
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
            const {
                safeJsonParse,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonParse.mockReturnValue({
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
        const importedData = {
            sites: mockSites,
            settings: mockSettings,
        };

        it("should persist sites and settings successfully", async () => {
            await service.persistImportedData(importedData);

            expect(
                mockConfig.databaseService.executeTransaction
            ).toHaveBeenCalled();
            expect(
                mockConfig.repositories.site.bulkCreate
            ).toHaveBeenCalledWith(mockSites);
            expect(
                mockConfig.repositories.settings.update
            ).toHaveBeenCalledWith(mockSettings);
            expect(mockConfig.eventEmitter.emit).toHaveBeenCalledWith(
                "data:imported",
                {
                    sitesCount: 2,
                    settingsUpdated: true,
                }
            );
            expect(mockConfig.logger.info).toHaveBeenCalledWith(
                "Imported data persisted successfully",
                {
                    sitesCount: 2,
                    settingsUpdated: true,
                }
            );
        });

        it("should handle sites creation error", async () => {
            const error = new Error("Sites creation failed");
            mockConfig.repositories.site.bulkCreate.mockRejectedValue(error);

            await expect(
                service.persistImportedData(importedData)
            ).rejects.toThrow("Sites creation failed");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data",
                { error }
            );
        });

        it("should handle settings update error", async () => {
            const error = new Error("Settings update failed");
            mockConfig.repositories.settings.update.mockRejectedValue(error);

            await expect(
                service.persistImportedData(importedData)
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
                service.persistImportedData(importedData)
            ).rejects.toThrow("Transaction failed");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data",
                { error }
            );
        });

        it("should handle empty sites array", async () => {
            const dataWithEmptySites = {
                sites: [],
                settings: mockSettings,
            };

            await service.persistImportedData(dataWithEmptySites);

            expect(
                mockConfig.repositories.site.bulkCreate
            ).toHaveBeenCalledWith([]);
            expect(
                mockConfig.repositories.settings.update
            ).toHaveBeenCalledWith(mockSettings);
            expect(mockConfig.logger.info).toHaveBeenCalledWith(
                "Imported data persisted successfully",
                {
                    sitesCount: 0,
                    settingsUpdated: true,
                }
            );
        });
    });

    describe("Error Handling Integration", () => {
        it("should handle complete workflow errors", async () => {
            const {
                safeJsonParse,
            } = require("../../../../shared/utils/jsonValidation");
            safeJsonParse.mockReturnValue({
                sites: mockSites,
                settings: mockSettings,
                metadata: { version: "1.0", format: "uptime-watcher-backup" },
            });

            const error = new Error("Persistence failed");
            mockConfig.repositories.site.bulkCreate.mockRejectedValue(error);

            const jsonData = JSON.stringify({
                sites: mockSites,
                settings: mockSettings,
                metadata: { version: "1.0", format: "uptime-watcher-backup" },
            });

            const importedData = await service.importDataFromJson(jsonData);
            await expect(
                service.persistImportedData(importedData)
            ).rejects.toThrow("Persistence failed");

            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data",
                { error }
            );
        });

        it("should handle export workflow with comprehensive error scenarios", async () => {
            const {
                safeJsonStringifyWithFallback,
            } = require("../../../../shared/utils/jsonValidation");

            // Test successful path first
            safeJsonStringifyWithFallback.mockReturnValueOnce(
                '{"test":"data"}'
            );
            const result1 = await service.exportAllData();
            expect(result1).toBe('{"test":"data"}');

            // Test failure path
            safeJsonStringifyWithFallback.mockReturnValueOnce(null);
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
