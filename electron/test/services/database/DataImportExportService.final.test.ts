/**
 * @fileoverview DataImportExportService Comprehensive Isolated Tests
 * Comprehensive isolated tests for DataImportExportService with corrected interface matching
 * and proper behavior expectations based on actual implementation analysis.
 *
 * @author AI Assistant
 * @version 3.0
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock ERROR_CATALOG before imports
vi.mock("@shared/utils/errorCatalog", () => ({
    ERROR_CATALOG: {
        database: {
            IMPORT_DATA_INVALID: "Invalid import data format",
        },
    },
}));

// Mock utility functions before imports
const mockSafeJsonStringifyWithFallback = vi.fn();
const mockSafeJsonParse = vi.fn();
const mockIsImportData = vi.fn();

vi.mock("@shared/utils/jsonUtils", () => ({
    safeJsonStringifyWithFallback: mockSafeJsonStringifyWithFallback,
    safeJsonParse: mockSafeJsonParse,
}));

vi.mock("@shared/types/validators", () => ({
    isImportData: mockIsImportData,
}));

// Mock operational hooks
const mockWithOperationalHooks = vi.fn();
vi.mock("@electron/utils/operationalHooks", () => ({
    withOperationalHooks: mockWithOperationalHooks,
}));

// Mock SiteLoadingError
class MockSiteLoadingError extends Error {
    constructor(message: string, cause?: Error) {
        super(message);
        this.name = "MockSiteLoadingError";
        if (cause) this.cause = cause;
    }
}

vi.mock("@shared/errors/SiteLoadingError", () => ({
    SiteLoadingError: MockSiteLoadingError,
}));

describe("DataImportExportService - Isolated Tests", () => {
    let DataImportExportService: any;
    let service: any;
    let mockConfig: any;

    beforeEach(async () => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup operational hooks mock
        mockWithOperationalHooks.mockImplementation(async (fn: any) => {
            const mockDb = { name: "mock-db" };
            return await fn(mockDb);
        });

        // Create comprehensive mock config with all required interfaces
        mockConfig = {
            databaseService: {
                executeTransaction: vi
                    .fn()
                    .mockImplementation(async (fn: any) => {
                        const mockDb = { name: "mock-db" };
                        return await fn(mockDb);
                    }),
            },
            eventEmitter: {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            },
            logger: {
                error: vi.fn(),
                warn: vi.fn(),
                info: vi.fn(),
                debug: vi.fn(),
            },
            repositories: {
                site: {
                    exportAll: vi.fn(),
                    createFromImport: vi.fn(),
                    deleteAllInternal: vi.fn().mockResolvedValue(undefined),
                },
                settings: {
                    getAll: vi.fn(),
                    updateBatch: vi.fn(),
                    deleteAllInternal: vi.fn().mockResolvedValue(undefined),
                },
                monitor: {
                    deleteAllInternal: vi.fn().mockResolvedValue(undefined),
                },
                history: {
                    deleteAllInternal: vi.fn().mockResolvedValue(undefined),
                },
            },
        };

        // Dynamic import to ensure mocks are applied
        const module = await import(
            "../../../utils/database/DataImportExportService"
        );
        DataImportExportService = module.DataImportExportService;

        // Create service instance with mocked dependencies
        service = new DataImportExportService(mockConfig);
    });

    describe("Constructor", () => {
        it("should initialize with provided config", () => {
            expect(service).toBeInstanceOf(DataImportExportService);
        });
    });

    describe("exportAllData", () => {
        const mockSites = [
            {
                id: "1",
                url: "https://example.com",
                name: "Test Site 1",
                monitoring: true,
                monitors: [],
            },
            {
                id: "2",
                url: "https://test.com",
                name: "Test Site 2",
                monitoring: false,
                monitors: [],
            },
        ];
        const mockSettings = {
            "app.theme": "light",
            "app.language": "en",
            "check.interval": "300",
            "notifications.enabled": "true",
        };

        it("should export sites and settings successfully", async () => {
            // Setup mocks
            mockConfig.repositories.site.exportAll.mockResolvedValue(mockSites);
            mockConfig.repositories.settings.getAll.mockResolvedValue(
                mockSettings
            );

            const expectedData = {
                exportedAt: expect.any(String),
                settings: mockSettings,
                sites: mockSites,
                version: "1.0",
            };

            mockSafeJsonStringifyWithFallback.mockReturnValue(
                '{"test": "data"}'
            );

            const result = await service.exportAllData();

            expect(result).toBe('{"test": "data"}');
            expect(mockConfig.repositories.site.exportAll).toHaveBeenCalled();
            expect(mockConfig.repositories.settings.getAll).toHaveBeenCalled();
            expect(mockSafeJsonStringifyWithFallback).toHaveBeenCalledWith(
                expectedData,
                "{}",
                2
            );
        });

        it("should handle sites repository error", async () => {
            const error = new Error("Sites fetch failed");
            mockConfig.repositories.site.exportAll.mockRejectedValue(error);

            await expect(service.exportAllData()).rejects.toThrow(
                "Sites fetch failed"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data: Sites fetch failed",
                error
            );
        });

        it("should handle settings repository error", async () => {
            const error = new Error("Settings fetch failed");
            mockConfig.repositories.site.exportAll.mockResolvedValue(mockSites);
            mockConfig.repositories.settings.getAll.mockRejectedValue(error);

            await expect(service.exportAllData()).rejects.toThrow(
                "Settings fetch failed"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data: Settings fetch failed",
                error
            );
        });

        it("should handle JSON stringify returning null", async () => {
            mockConfig.repositories.site.exportAll.mockResolvedValue(mockSites);
            mockConfig.repositories.settings.getAll.mockResolvedValue(
                mockSettings
            );
            mockSafeJsonStringifyWithFallback.mockReturnValue("{}");

            const result = await service.exportAllData();
            expect(result).toBe("{}");
        });
    });

    describe("importDataFromJson", () => {
        const validJsonData = JSON.stringify({
            sites: [{ id: "1", url: "https://example.com", name: "Test Site" }],
            settings: { "app.theme": "dark" },
        });

        it("should parse and validate JSON data successfully", async () => {
            const mockParseResult = {
                success: true,
                data: {
                    sites: [
                        {
                            id: "1",
                            url: "https://example.com",
                            name: "Test Site",
                        },
                    ],
                    settings: { "app.theme": "dark" },
                },
            };

            mockSafeJsonParse.mockReturnValue(mockParseResult);

            const result = await service.importDataFromJson(validJsonData);

            expect(result).toEqual({
                sites: mockParseResult.data.sites,
                settings: mockParseResult.data.settings,
            });
            expect(mockSafeJsonParse).toHaveBeenCalledWith(
                validJsonData,
                mockIsImportData
            );
        });

        it("should handle failed JSON parsing", async () => {
            const mockParseResult = { success: false, error: "Parse error" };
            mockSafeJsonParse.mockReturnValue(mockParseResult);

            await expect(
                service.importDataFromJson("invalid json")
            ).rejects.toThrow(MockSiteLoadingError);
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to parse import data: Invalid import data format: Parse error",
                expect.any(Error)
            );
        });

        it("should handle null parse result", async () => {
            mockSafeJsonParse.mockReturnValue(null);

            await expect(
                service.importDataFromJson("invalid json")
            ).rejects.toThrow(MockSiteLoadingError);
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to parse import data"),
                expect.any(Error)
            );
        });

        it("should handle missing data in parse result", async () => {
            const mockParseResult = { success: true, data: null };
            mockSafeJsonParse.mockReturnValue(mockParseResult);

            await expect(
                service.importDataFromJson(validJsonData)
            ).rejects.toThrow(MockSiteLoadingError);
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to parse import data"),
                expect.any(Error)
            );
        });
    });

    describe("persistImportedData", () => {
        const mockSites = [
            { id: "1", url: "https://example.com", name: "Test Site 1" },
            { id: "2", url: "https://test.com", name: "Test Site 2" },
        ];
        const mockSettings = {
            "app.theme": "dark",
            "app.language": "es",
        };

        it("should persist sites and settings successfully", async () => {
            mockConfig.repositories.site.createFromImport.mockResolvedValue(
                undefined
            );
            mockConfig.repositories.settings.updateBatch.mockResolvedValue(
                undefined
            );

            await expect(
                service.persistImportedData(mockSites, mockSettings)
            ).resolves.toBeUndefined();

            expect(
                mockConfig.databaseService.executeTransaction
            ).toHaveBeenCalled();
            expect(
                mockConfig.repositories.site.deleteAllInternal
            ).toHaveBeenCalled();
            expect(
                mockConfig.repositories.settings.deleteAllInternal
            ).toHaveBeenCalled();
            expect(
                mockConfig.repositories.monitor.deleteAllInternal
            ).toHaveBeenCalled();
            expect(
                mockConfig.repositories.history.deleteAllInternal
            ).toHaveBeenCalled();
            expect(
                mockConfig.repositories.site.createFromImport
            ).toHaveBeenCalledWith(mockSites, expect.any(Object));
            expect(
                mockConfig.repositories.settings.updateBatch
            ).toHaveBeenCalledWith(mockSettings, expect.any(Object));
        });

        it("should handle sites creation error", async () => {
            const error = new Error("Sites creation failed");
            mockConfig.repositories.site.createFromImport.mockRejectedValue(
                error
            );

            await expect(
                service.persistImportedData(mockSites, mockSettings)
            ).rejects.toThrow("Sites creation failed");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data: Sites creation failed",
                error
            );
        });

        it("should handle settings update error", async () => {
            const error = new Error("Settings update failed");
            mockConfig.repositories.site.createFromImport.mockResolvedValue(
                undefined
            );
            mockConfig.repositories.settings.updateBatch.mockRejectedValue(
                error
            );

            await expect(
                service.persistImportedData(mockSites, mockSettings)
            ).rejects.toThrow("Settings update failed");
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to persist imported data: Settings update failed",
                error
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
                "Failed to persist imported data: Transaction failed",
                error
            );
        });

        it("should handle empty sites array", async () => {
            mockConfig.repositories.site.createFromImport.mockResolvedValue(
                undefined
            );
            mockConfig.repositories.settings.updateBatch.mockResolvedValue(
                undefined
            );

            await expect(
                service.persistImportedData([], mockSettings)
            ).resolves.toBeUndefined();

            expect(
                mockConfig.repositories.site.createFromImport
            ).toHaveBeenCalledWith([], expect.any(Object));
            expect(
                mockConfig.repositories.settings.updateBatch
            ).toHaveBeenCalledWith(mockSettings, expect.any(Object));
        });
    });

    describe("Error Handling Integration", () => {
        it("should handle complete workflow errors", async () => {
            // Test import error propagation
            mockSafeJsonParse.mockReturnValue({
                success: false,
                error: "Invalid format",
            });

            await expect(service.importDataFromJson("invalid")).rejects.toThrow(
                MockSiteLoadingError
            );
            expect(mockConfig.eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "import-data-parse",
                    details: expect.stringContaining(
                        "Failed to parse import data"
                    ),
                })
            );
        });

        it("should handle export workflow with comprehensive error scenarios", async () => {
            // Test successful path first
            const mockSites = [
                { id: "1", url: "https://example.com", name: "Test" },
            ];
            const mockSettings = { "app.theme": "light" };

            mockConfig.repositories.site.exportAll.mockResolvedValue(mockSites);
            mockConfig.repositories.settings.getAll.mockResolvedValue(
                mockSettings
            );
            mockSafeJsonStringifyWithFallback.mockReturnValueOnce(
                '{"data": "success"}'
            );

            const result = await service.exportAllData();
            expect(result).toBe('{"data": "success"}');

            // Test failure path
            mockSafeJsonStringifyWithFallback.mockReturnValueOnce("{}");
            const fallbackResult = await service.exportAllData();
            expect(fallbackResult).toBe("{}");

            expect(mockConfig.eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    operation: "export-data",
                })
            );
        });
    });
});
