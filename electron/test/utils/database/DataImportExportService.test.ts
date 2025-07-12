import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { DataImportExportService, DataImportExportOrchestrator } from "../../../utils/database/DataImportExportService";
import { SiteLoadingError } from "../../../utils/database/interfaces";

describe("DataImportExportService", () => {
    let mockRepositories: any;
    let mockDatabaseService: any;
    let mockLogger: any;
    let mockEventEmitter: any;
    let mockDb: any;
    let dataImportExportService: DataImportExportService;

    beforeEach(() => {
        mockDb = {
            run: vi.fn(),
            prepare: vi.fn(() => ({
                run: vi.fn(),
                finalize: vi.fn(),
            })),
        };

        mockRepositories = {
            site: {
                exportAll: vi.fn(),
                deleteAll: vi.fn(),
                deleteAllInternal: vi.fn(),
                bulkInsert: vi.fn(),
                bulkInsertInternal: vi.fn(),
            },
            settings: {
                getAll: vi.fn(),
                deleteAll: vi.fn(),
                deleteAllInternal: vi.fn(),
                bulkInsert: vi.fn(),
                bulkInsertInternal: vi.fn(),
            },
            monitor: {
                deleteAll: vi.fn(),
                deleteAllInternal: vi.fn(),
                bulkCreate: vi.fn(),
                createInternal: vi.fn(),
            },
            history: {
                deleteAll: vi.fn(),
                deleteAllInternal: vi.fn(),
                bulkInsert: vi.fn(),
                addEntryInternal: vi.fn(),
            },
        };

        mockDatabaseService = {
            executeTransaction: vi.fn(),
            getDatabase: vi.fn(() => mockDb),
        };

        mockLogger = {
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
        };

        mockEventEmitter = {
            emitTyped: vi.fn(),
        };

        dataImportExportService = new DataImportExportService({
            repositories: mockRepositories,
            databaseService: mockDatabaseService,
            logger: mockLogger,
            eventEmitter: mockEventEmitter,
        });

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("exportAllData", () => {
        it("should successfully export all data", async () => {
            const mockSites = [
                { identifier: "site1", name: "Site 1", monitors: [] },
                { identifier: "site2", name: "Site 2", monitors: [] },
            ];
            const mockSettings = { key1: "value1", key2: "value2" };

            mockRepositories.site.exportAll.mockReturnValue(mockSites);
            mockRepositories.settings.getAll.mockReturnValue(mockSettings);

            const result = await dataImportExportService.exportAllData();

            expect(mockRepositories.site.exportAll).toHaveBeenCalled();
            expect(mockRepositories.settings.getAll).toHaveBeenCalled();

            const parsedResult = JSON.parse(result);
            expect(parsedResult.sites).toEqual(mockSites);
            expect(parsedResult.settings).toEqual(mockSettings);
            expect(parsedResult.version).toBe("1.0");
            expect(parsedResult.exportedAt).toBeDefined();
        });

        it("should handle site export errors", async () => {
            const error = new Error("Site export failed");
            mockRepositories.site.exportAll.mockImplementation(() => {
                throw error;
            });

            await expect(dataImportExportService.exportAllData()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to export data: Site export failed", error);
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith("database:error", {
                details: "Failed to export data: Site export failed",
                error,
                operation: "export-data",
                timestamp: expect.any(Number),
            });
        });

        it("should handle settings export errors", async () => {
            const error = new Error("Settings export failed");
            mockRepositories.site.exportAll.mockReturnValue([]);
            mockRepositories.settings.getAll.mockImplementation(() => {
                throw error;
            });

            await expect(dataImportExportService.exportAllData()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to export data: Settings export failed", error);
        });

        it("should handle non-Error objects", async () => {
            const errorString = "String error";
            mockRepositories.site.exportAll.mockImplementation(() => {
                const error = new Error(errorString);
                error.name = "StringError";
                throw error;
            });

            await expect(dataImportExportService.exportAllData()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to export data: String error", expect.any(Error));
        });

        it("should handle empty sites and settings", async () => {
            mockRepositories.site.exportAll.mockReturnValue([]);
            mockRepositories.settings.getAll.mockReturnValue({});

            const result = await dataImportExportService.exportAllData();

            const parsedResult = JSON.parse(result);
            expect(parsedResult.sites).toEqual([]);
            expect(parsedResult.settings).toEqual({});
        });

        it("should handle null/undefined from repositories", async () => {
            mockRepositories.site.exportAll.mockReturnValue(null);
            mockRepositories.settings.getAll.mockReturnValue(undefined);

            const result = await dataImportExportService.exportAllData();

            const parsedResult = JSON.parse(result);
            expect(parsedResult.sites).toBeNull();
            expect(parsedResult.settings).toBeUndefined();
        });
    });

    describe("importDataFromJson", () => {
        it("should successfully parse valid JSON data", async () => {
            const mockData = {
                sites: [
                    { identifier: "site1", name: "Site 1" },
                    { identifier: "site2", name: "Site 2" },
                ],
                settings: { key1: "value1" },
            };

            const jsonData = JSON.stringify(mockData);

            const result = await dataImportExportService.importDataFromJson(jsonData);

            expect(result.sites).toEqual(mockData.sites);
            expect(result.settings).toEqual(mockData.settings);
        });

        it("should handle data without settings", async () => {
            const mockData = {
                sites: [{ identifier: "site1", name: "Site 1" }],
            };

            const jsonData = JSON.stringify(mockData);

            const result = await dataImportExportService.importDataFromJson(jsonData);

            expect(result.sites).toEqual(mockData.sites);
            expect(result.settings).toEqual({});
        });

        it("should handle invalid JSON", async () => {
            const invalidJson = "{ invalid json }";

            await expect(dataImportExportService.importDataFromJson(invalidJson)).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to parse import data:"),
                expect.any(SyntaxError)
            );
        });

        it("should handle missing sites array", async () => {
            const invalidData = { settings: { key1: "value1" } };
            const jsonData = JSON.stringify(invalidData);

            await expect(dataImportExportService.importDataFromJson(jsonData)).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to parse import data: Invalid import data format: missing or invalid sites array",
                expect.any(Error)
            );
        });

        it("should handle non-array sites", async () => {
            const invalidData = { sites: "not-an-array" };
            const jsonData = JSON.stringify(invalidData);

            await expect(dataImportExportService.importDataFromJson(jsonData)).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to parse import data: Invalid import data format: missing or invalid sites array",
                expect.any(Error)
            );
        });

        it("should handle null data", async () => {
            const nullData = "null";

            await expect(dataImportExportService.importDataFromJson(nullData)).rejects.toThrow(SiteLoadingError);
        });

        it("should handle empty string", async () => {
            const emptyString = "";

            await expect(dataImportExportService.importDataFromJson(emptyString)).rejects.toThrow(SiteLoadingError);
        });

        it("should handle valid data with empty sites array", async () => {
            const mockData = { sites: [] };
            const jsonData = JSON.stringify(mockData);

            const result = await dataImportExportService.importDataFromJson(jsonData);

            expect(result.sites).toEqual([]);
            expect(result.settings).toEqual({});
        });
    });

    describe("persistImportedData", () => {
        it("should successfully persist sites and settings", async () => {
            const sites = [
                { identifier: "site1", name: "Site 1", monitors: [] },
                { identifier: "site2", name: "Site 2", monitors: [] },
            ];
            const settings = { key1: "value1", key2: "value2" };

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: (db: any) => Promise<void>) => {
                await callback({} as any); // Pass mock database
                return Promise.resolve();
            });

            await dataImportExportService.persistImportedData(sites, settings);

            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
            expect(mockRepositories.site.deleteAllInternal).toHaveBeenCalled();
            expect(mockRepositories.settings.deleteAllInternal).toHaveBeenCalled();
            expect(mockRepositories.monitor.deleteAllInternal).toHaveBeenCalled();
            expect(mockRepositories.history.deleteAllInternal).toHaveBeenCalled();
            expect(mockRepositories.site.bulkInsertInternal).toHaveBeenCalledWith(mockDb, [
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: "Site 2" },
            ]);
            expect(mockRepositories.settings.bulkInsertInternal).toHaveBeenCalledWith(mockDb, settings);
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully imported 2 sites and 2 settings");
        });

        it("should handle sites with monitors", async () => {
            const sites = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            url: "https://example.com",
                            status: "active",
                            history: [],
                        },
                    ],
                },
            ];
            const settings = {};

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: (db: any) => Promise<void>) => {
                await callback({} as any); // Pass mock database
                return Promise.resolve();
            });
            mockRepositories.monitor.bulkCreate.mockResolvedValue([
                { id: "monitor1", type: "http", url: "https://example.com", status: "active", history: [] },
            ]);

            await dataImportExportService.persistImportedData(sites as any, settings);

            expect(mockRepositories.monitor.bulkCreate).toHaveBeenCalledWith("site1", sites[0].monitors);
        });

        it("should handle empty sites and settings", async () => {
            const sites: any[] = [];
            const settings = {};

            mockDatabaseService.executeTransaction.mockImplementation(async (callback: (db: any) => Promise<void>) => {
                await callback({} as any); // Pass mock database
                return Promise.resolve();
            });

            await dataImportExportService.persistImportedData(sites, settings);

            expect(mockRepositories.site.bulkInsertInternal).toHaveBeenCalledWith(mockDb, []);
            expect(mockRepositories.settings.bulkInsertInternal).toHaveBeenCalledWith(mockDb, {});
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully imported 0 sites and 0 settings");
        });

        it("should handle sites without monitors", async () => {
            const sites = [
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: "Site 2", monitors: undefined },
            ];
            const settings = {};

            mockDatabaseService.executeTransaction.mockImplementation((callback: () => void) => {
                callback();
                return Promise.resolve();
            });

            await dataImportExportService.persistImportedData(sites, settings);

            expect(mockRepositories.monitor.bulkCreate).not.toHaveBeenCalled();
        });

        it("should handle sites with empty monitors array", async () => {
            const sites = [{ identifier: "site1", name: "Site 1", monitors: [] }];
            const settings = {};

            mockDatabaseService.executeTransaction.mockImplementation((callback: () => void) => {
                callback();
                return Promise.resolve();
            });

            await dataImportExportService.persistImportedData(sites, settings);

            expect(mockRepositories.monitor.bulkCreate).not.toHaveBeenCalled();
        });
    });
});

describe("DataImportExportOrchestrator", () => {
    let mockDataImportExportService: any;
    let mockSiteCache: any;
    let mockOnSitesReloaded: any;
    let orchestrator: DataImportExportOrchestrator;

    beforeEach(() => {
        mockDataImportExportService = {
            exportAllData: vi.fn(),
            importDataFromJson: vi.fn(),
            persistImportedData: vi.fn(),
        };

        mockSiteCache = {
            clear: vi.fn(),
        };

        mockOnSitesReloaded = vi.fn();

        orchestrator = new DataImportExportOrchestrator(mockDataImportExportService);

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("exportData", () => {
        it("should delegate to data import/export service", async () => {
            const mockExportData = JSON.stringify({ sites: [], settings: {} });
            mockDataImportExportService.exportAllData.mockResolvedValue(mockExportData);

            const result = await orchestrator.exportData();

            expect(mockDataImportExportService.exportAllData).toHaveBeenCalled();
            expect(result).toBe(mockExportData);
        });

        it("should propagate errors from service", async () => {
            const error = new Error("Export failed");
            mockDataImportExportService.exportAllData.mockRejectedValue(error);

            await expect(orchestrator.exportData()).rejects.toThrow("Export failed");
        });
    });

    describe("importData", () => {
        it("should successfully import valid data", async () => {
            const jsonData = JSON.stringify({ sites: [], settings: {} });
            const parsedData = { sites: [], settings: {} };

            mockDataImportExportService.importDataFromJson.mockResolvedValue(parsedData);
            mockDataImportExportService.persistImportedData.mockResolvedValue(undefined);
            mockOnSitesReloaded.mockResolvedValue(undefined);

            const result = await orchestrator.importData(jsonData, mockSiteCache, mockOnSitesReloaded);

            expect(mockDataImportExportService.importDataFromJson).toHaveBeenCalledWith(jsonData);
            expect(mockDataImportExportService.persistImportedData).toHaveBeenCalledWith([], {});
            expect(mockSiteCache.clear).toHaveBeenCalled();
            expect(mockOnSitesReloaded).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.message).toBe("Successfully imported 0 sites and 0 settings");
        });

        it("should handle parse errors", async () => {
            const invalidJson = "invalid json";
            const error = new Error("Parse failed");

            mockDataImportExportService.importDataFromJson.mockRejectedValue(error);

            const result = await orchestrator.importData(invalidJson, mockSiteCache, mockOnSitesReloaded);

            expect(result.success).toBe(false);
            expect(result.message).toBe("Failed to import data: Parse failed");
        });

        it("should handle persistence errors", async () => {
            const jsonData = JSON.stringify({ sites: [], settings: {} });
            const parsedData = { sites: [], settings: {} };
            const error = new Error("Persist failed");

            mockDataImportExportService.importDataFromJson.mockResolvedValue(parsedData);
            mockDataImportExportService.persistImportedData.mockRejectedValue(error);

            const result = await orchestrator.importData(jsonData, mockSiteCache, mockOnSitesReloaded);

            expect(result.success).toBe(false);
            expect(result.message).toBe("Failed to import data: Persist failed");
        });

        it("should handle complex data structures", async () => {
            const complexData = {
                sites: [
                    {
                        identifier: "complex-site",
                        name: "Complex Site",
                        monitors: [],
                    },
                ],
                settings: {
                    key1: "value1",
                    key2: "value2",
                },
            };
            const jsonData = JSON.stringify(complexData);

            mockDataImportExportService.importDataFromJson.mockResolvedValue(complexData);
            mockDataImportExportService.persistImportedData.mockResolvedValue(undefined);
            mockOnSitesReloaded.mockResolvedValue(undefined);

            const result = await orchestrator.importData(jsonData, mockSiteCache, mockOnSitesReloaded);

            expect(mockDataImportExportService.persistImportedData).toHaveBeenCalledWith(
                complexData.sites,
                complexData.settings
            );
            expect(result.success).toBe(true);
            expect(result.message).toBe("Successfully imported 1 sites and 2 settings");
        });

        it("should handle onSitesReloaded errors", async () => {
            const jsonData = JSON.stringify({ sites: [], settings: {} });
            const parsedData = { sites: [], settings: {} };
            const error = new Error("Reload failed");

            mockDataImportExportService.importDataFromJson.mockResolvedValue(parsedData);
            mockDataImportExportService.persistImportedData.mockResolvedValue(undefined);
            mockOnSitesReloaded.mockRejectedValue(error);

            const result = await orchestrator.importData(jsonData, mockSiteCache, mockOnSitesReloaded);

            expect(result.success).toBe(false);
            expect(result.message).toBe("Failed to import data: Reload failed");
        });

        it("should handle non-Error exceptions", async () => {
            const jsonData = JSON.stringify({ sites: [], settings: {} });
            const errorString = "String error";

            mockDataImportExportService.importDataFromJson.mockImplementation(() => {
                const error = new Error(errorString);
                error.name = "StringError";
                throw error;
            });

            const result = await orchestrator.importData(jsonData, mockSiteCache, mockOnSitesReloaded);

            expect(result.success).toBe(false);
            expect(result.message).toBe("Failed to import data: String error");
        });
    });
});
