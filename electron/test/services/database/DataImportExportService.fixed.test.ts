/**
 * Test file for DataImportExportService - Corrected Implementation
 *
 * Fixed interface issues:
 * - Correct repository method signatures with db parameter
 * - Proper utility function mocking
 * - Aligned error handling and validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Database } from "node-sqlite3-wasm";

// Mock the utility modules first (must be hoisted)
const mockSafeJsonStringifyWithFallback = vi.hoisted(() => vi.fn());
const mockSafeJsonParse = vi.hoisted(() => vi.fn());

vi.mock("@shared/utils/jsonSafety", () => ({
    safeJsonStringifyWithFallback: mockSafeJsonStringifyWithFallback,
    safeJsonParse: mockSafeJsonParse,
}));

vi.mock("@shared/utils/errorCatalog", () => ({
    ERROR_CATALOG: {
        database: {
            IMPORT_DATA_INVALID: "Invalid import data format",
        },
    },
}));

// Import actual error classes
import { SiteLoadingError } from "../../../utils/database/interfaces";

// Mock operational hooks
const mockWithDatabaseOperation = vi.fn();
vi.mock("../operationalHooks", () => ({
    withDatabaseOperation: mockWithDatabaseOperation,
}));

// Mock SiteLoadingError
class MockSiteLoadingError extends Error {
    constructor(message: string, cause?: Error) {
        super(message);
        this.name = "MockSiteLoadingError";
        this.cause = cause;
    }
}

vi.mock("./interfaces", () => ({
    SiteLoadingError: MockSiteLoadingError,
}));

// Import the service after mocks
import { DataImportExportService } from "../../../utils/database/DataImportExportService";
import type { DataImportExportConfig } from "../../../utils/database/DataImportExportService";

describe("DataImportExportService - Corrected Implementation", () => {
    let service: DataImportExportService;
    let mockConfig: DataImportExportConfig;
    let mockDb: Database;

    // Use the hoisted mock functions directly
    const mockSafeJsonStringify = mockSafeJsonStringifyWithFallback;
    const mockSafeJsonParseFunc = mockSafeJsonParse;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock database reference
        mockDb = {} as Database;

        // Create comprehensive mock config with correct interfaces
        mockConfig = {
            databaseService: {
                executeTransaction: vi
                    .fn()
                    .mockImplementation(async (callback) => {
                        return await callback(mockDb);
                    }),
            },
            eventEmitter: {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            },
            logger: {
                info: vi.fn(),
                error: vi.fn(),
                warn: vi.fn(),
                debug: vi.fn(),
            },
            repositories: {
                site: {
                    exportAll: vi.fn(),
                    deleteAllInternal: vi.fn(),
                    bulkInsertInternal: vi.fn(),
                },
                settings: {
                    getAll: vi.fn(),
                    deleteAllInternal: vi.fn(),
                    bulkInsertInternal: vi.fn(),
                },
                monitor: {
                    deleteAllInternal: vi.fn(),
                    bulkInsertInternal: vi.fn(),
                },
                history: {
                    deleteAllInternal: vi.fn(),
                    bulkInsertInternal: vi.fn(),
                },
            },
        } as any;

        // Setup operational hooks mock
        mockWithDatabaseOperation.mockImplementation(async (operation) => {
            return await operation();
        });

        service = new DataImportExportService(mockConfig);
    });

    describe("Constructor", () => {
        it("should initialize with provided config", () => {
            expect(service).toBeInstanceOf(DataImportExportService);
        });
    });

    describe("exportAllData", () => {
        it("should export sites and settings successfully", async () => {
            // Setup mock data
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

            // Mock repository responses
            (mockConfig.repositories.site.exportAll as any).mockResolvedValue(
                mockSites
            );
            (mockConfig.repositories.settings.getAll as any).mockResolvedValue(
                mockSettings
            );

            // Mock utility function to return specific JSON
            mockSafeJsonStringify.mockReturnValue('{"test": "data"}');

            const result = await service.exportAllData();

            expect(result).toBe('{"test": "data"}');
            expect(mockConfig.repositories.site.exportAll).toHaveBeenCalled();
            expect(mockConfig.repositories.settings.getAll).toHaveBeenCalled();
            expect(mockSafeJsonStringify).toHaveBeenCalledWith(
                expect.objectContaining({
                    exportedAt: expect.any(String),
                    settings: mockSettings,
                    sites: mockSites,
                    version: "1.0",
                }),
                "{}",
                2
            );
        });

        it("should handle sites repository error", async () => {
            const error = new Error("Sites export failed");
            (mockConfig.repositories.site.exportAll as any).mockRejectedValue(
                error
            );

            await expect(service.exportAllData()).rejects.toThrow(
                "Failed to export data: Sites export failed"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data: Sites export failed",
                error
            );
        });

        it("should handle settings repository error", async () => {
            const error = new Error("Settings export failed");
            (mockConfig.repositories.site.exportAll as any).mockResolvedValue(
                []
            );
            (mockConfig.repositories.settings.getAll as any).mockRejectedValue(
                error
            );

            await expect(service.exportAllData()).rejects.toThrow(
                "Failed to export data: Settings export failed"
            );
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                "Failed to export data: Settings export failed",
                error
            );
        });

        it("should handle JSON stringify returning fallback", async () => {
            (mockConfig.repositories.site.exportAll as any).mockResolvedValue(
                []
            );
            (mockConfig.repositories.settings.getAll as any).mockResolvedValue(
                {}
            );
            mockSafeJsonStringify.mockReturnValue("{}");

            const result = await service.exportAllData();
            expect(result).toBe("{}");
        });
    });

    describe("importDataFromJson", () => {
        it("should parse and validate JSON data successfully", async () => {
            const validJsonData = '{"sites": [], "settings": {}}';
            const mockParseResult = {
                success: true,
                data: {
                    sites: [
                        {
                            id: "1",
                            name: "Test Site",
                            url: "https://example.com",
                        },
                    ],
                    settings: { "app.theme": "dark" },
                },
            };

            mockSafeJsonParseFunc.mockReturnValue(mockParseResult);

            const result = await service.importDataFromJson(validJsonData);

            expect(result).toEqual({
                sites: mockParseResult.data.sites,
                settings: mockParseResult.data.settings,
            });
            expect(mockSafeJsonParseFunc).toHaveBeenCalledWith(
                validJsonData,
                expect.any(Function)
            );
        });

        it("should handle failed JSON parsing", async () => {
            const mockParseResult = { success: false, error: "Parse error" };
            mockSafeJsonParseFunc.mockReturnValue(mockParseResult);

            await expect(
                service.importDataFromJson("invalid json")
            ).rejects.toThrow(SiteLoadingError);
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to parse import data"),
                expect.any(Error)
            );
        });

        it("should handle null parse result", async () => {
            mockSafeJsonParseFunc.mockReturnValue(null);

            await expect(
                service.importDataFromJson("invalid json")
            ).rejects.toThrow(SiteLoadingError);
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to parse import data"),
                expect.any(Error)
            );
        });

        it("should handle missing data in parse result", async () => {
            const mockParseResult = { success: true, data: null };
            mockSafeJsonParseFunc.mockReturnValue(mockParseResult);

            await expect(
                service.importDataFromJson('{"sites": []}')
            ).rejects.toThrow(SiteLoadingError);
        });
    });

    describe("persistImportedData", () => {
        const mockSites = [
            { identifier: "1", name: "Test Site", url: "https://example.com" },
        ];
        const mockSettings = { "app.theme": "dark" };

        it("should persist sites and settings successfully", async () => {
            await service.persistImportedData(mockSites, mockSettings);

            expect(
                mockConfig.databaseService.executeTransaction
            ).toHaveBeenCalled();

            // Verify transaction callback was called with correct operations
            const transactionCallback = (
                mockConfig.databaseService.executeTransaction as any
            ).mock.calls[0][0];
            await transactionCallback(mockDb);

            // Verify all repositories had deleteAllInternal called with db
            expect(
                mockConfig.repositories.site.deleteAllInternal
            ).toHaveBeenCalledWith(mockDb);
            expect(
                mockConfig.repositories.settings.deleteAllInternal
            ).toHaveBeenCalledWith(mockDb);
            expect(
                mockConfig.repositories.monitor.deleteAllInternal
            ).toHaveBeenCalledWith(mockDb);
            expect(
                mockConfig.repositories.history.deleteAllInternal
            ).toHaveBeenCalledWith(mockDb);

            // Verify bulk inserts called with db and data
            expect(
                mockConfig.repositories.site.bulkInsertInternal
            ).toHaveBeenCalledWith(
                mockDb,
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: mockSites[0].identifier,
                        name: mockSites[0].name,
                        monitoring: true,
                    }),
                ])
            );
            expect(
                mockConfig.repositories.settings.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDb, mockSettings);
        });

        it("should handle transaction error", async () => {
            const error = new Error("Transaction failed");
            (
                mockConfig.databaseService.executeTransaction as any
            ).mockRejectedValue(error);

            await expect(
                service.persistImportedData(mockSites, mockSettings)
            ).rejects.toThrow("Transaction failed");
        });

        it("should handle empty sites array", async () => {
            await service.persistImportedData([], mockSettings);

            expect(
                mockConfig.databaseService.executeTransaction
            ).toHaveBeenCalled();

            // Verify empty sites array is handled
            const transactionCallback = (
                mockConfig.databaseService.executeTransaction as any
            ).mock.calls[0][0];
            await transactionCallback(mockDb);

            expect(
                mockConfig.repositories.site.bulkInsertInternal
            ).toHaveBeenCalledWith(mockDb, []);
        });
    });

    describe("Error Handling Integration", () => {
        it("should handle complete workflow errors", async () => {
            const mockParseResult = { success: false, error: "Invalid format" };
            mockSafeJsonParseFunc.mockReturnValue(mockParseResult);

            await expect(service.importDataFromJson("invalid")).rejects.toThrow(
                SiteLoadingError
            );
            expect(mockConfig.eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    details: expect.stringContaining(
                        "Failed to parse import data"
                    ),
                    operation: "import-data-parse",
                    timestamp: expect.any(Number),
                })
            );
        });

        it("should handle export workflow with comprehensive error scenarios", async () => {
            // Test successful path first
            (mockConfig.repositories.site.exportAll as any).mockResolvedValue([
                { id: "1", url: "https://example.com", name: "Test" },
            ]);
            (mockConfig.repositories.settings.getAll as any).mockResolvedValue({
                "app.theme": "light",
            });
            mockSafeJsonStringify.mockReturnValue('{"data": "success"}');

            const result = await service.exportAllData();
            expect(result).toBe('{"data": "success"}');

            // Test failure path
            const error = new Error("Export system failure");
            (mockConfig.repositories.site.exportAll as any).mockRejectedValue(
                error
            );

            await expect(service.exportAllData()).rejects.toThrow(
                "Failed to export data: Export system failure"
            );
            expect(mockConfig.eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                expect.objectContaining({
                    details: "Failed to export data: Export system failure",
                    operation: "export-data",
                    timestamp: expect.any(Number),
                })
            );
        });
    });
});
