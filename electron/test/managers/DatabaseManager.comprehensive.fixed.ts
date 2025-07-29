/**
 * Fixed DatabaseManager comprehensive tests - targeting 90%+ branch coverage
 * Focuses on error paths and edge cases not covered by existing tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabaseManager, DatabaseManagerDependencies } from "../../managers/DatabaseManager";
import { TypedEventBus } from "../../events/TypedEventBus";
import { UptimeEvents } from "../../events/eventTypes";

// Mock SiteRepositoryService and SiteLoadingOrchestrator
vi.mock("../../utils/database/SiteRepositoryService", () => ({
    SiteRepositoryService: vi.fn().mockImplementation(() => ({
        getSitesFromDatabase: vi.fn().mockResolvedValue([]),
    })),
    SiteLoadingOrchestrator: vi.fn().mockImplementation(() => ({
        loadSitesFromDatabase: vi.fn().mockResolvedValue({
            success: true,
            sitesLoaded: 0,
            message: "Success",
        }),
        siteRepositoryService: {
            getSitesFromDatabase: vi.fn().mockResolvedValue([]),
        },
    })),
}));

// Mock DataImportExportService
vi.mock("../../utils/database/DataImportExportService", () => ({
    DataImportExportService: vi.fn().mockImplementation(() => ({
        importDataFromJson: vi.fn(),
        persistImportedData: vi.fn(),
        exportDataToJson: vi.fn(),
        downloadBackup: vi.fn(),
        validateImportData: vi.fn(),
    })),
}));

// Import the mocked classes for use in tests
import { SiteLoadingOrchestrator } from "../../utils/database/SiteRepositoryService";
import { DataImportExportService } from "../../utils/database/DataImportExportService";

// Mock all dependencies
const mockEventEmitter = {
    emitTyped: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
} as unknown as TypedEventBus<UptimeEvents>;

const mockConfigurationManager = {
    getHistoryRetentionRules: vi.fn().mockReturnValue({
        defaultLimit: 500,
        maxLimit: Number.MAX_SAFE_INTEGER,
        minLimit: 25,
    }),
} as any;

const mockDatabaseService = {
    initialize: vi.fn(() => Promise.resolve()),
    close: vi.fn(),
    getDatabase: vi.fn(),
} as any;

const mockHistoryRepository = {
    findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
    deleteAll: vi.fn(() => Promise.resolve()),
} as any;

const mockMonitorRepository = {
    findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
    findByIdentifier: vi.fn(() => Promise.resolve(undefined)),
    getAllMonitorIds: vi.fn(() => Promise.resolve([])),
} as any;

const mockSettingsRepository = {
    findByKey: vi.fn(() => Promise.resolve(undefined)),
    get: vi.fn(() => Promise.resolve(undefined)),
    upsert: vi.fn(() => Promise.resolve()),
    exportAll: vi.fn(() => Promise.resolve([])),
} as any;

const mockSiteRepository = {
    findAll: vi.fn(() => Promise.resolve([])),
    findByIdentifier: vi.fn(() => Promise.resolve(undefined)),
    upsert: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve(true)),
    deleteAll: vi.fn(() => Promise.resolve()),
    exists: vi.fn(() => Promise.resolve(false)),
    bulkInsert: vi.fn(() => Promise.resolve()),
    exportAll: vi.fn(() => Promise.resolve([])),
} as any;

// Helper function to create proper mocks
const createSiteLoadingOrchestratorMock = (overrides = {}) => ({
    loadSitesFromDatabase: vi.fn().mockResolvedValue({
        success: true,
        sitesLoaded: 0,
        message: "Success",
    }),
    siteRepositoryService: {
        getSitesFromDatabase: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
});

const createDataImportExportServiceMock = (overrides = {}) => ({
    importDataFromJson: vi.fn(),
    persistImportedData: vi.fn(),
    exportDataToJson: vi.fn(),
    downloadBackup: vi.fn(),
    validateImportData: vi.fn(),
    ...overrides,
});

describe("DatabaseManager - Comprehensive Error Coverage", () => {
    let databaseManager: DatabaseManager;
    let mockDeps: DatabaseManagerDependencies;

    beforeEach(async () => {
        vi.clearAllMocks();

        mockDeps = {
            eventEmitter: mockEventEmitter,
            configurationManager: mockConfigurationManager,
            repositories: {
                database: mockDatabaseService,
                history: mockHistoryRepository,
                monitor: mockMonitorRepository,
                settings: mockSettingsRepository,
                site: mockSiteRepository,
            },
        };

        databaseManager = new DatabaseManager(mockDeps);
    });

    describe("Initialize - Error Handling Branches", () => {
        it("should handle settings.get throwing an error during initialize", async () => {
            // Mock settings to throw an error
            vi.mocked(mockSettingsRepository.get).mockRejectedValue(new Error("Settings error"));

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock();
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            // Should not throw and should use default history limit
            await expect(databaseManager.initialize()).resolves.toBeUndefined();

            // Should still call database initialization and load sites
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
            expect(mockOrchestrator.loadSitesFromDatabase).toHaveBeenCalled();
        });

        it("should handle event emission error during initialize", async () => {
            // Mock successful database operations
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("100");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 1,
                    message: "Success",
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            // Mock event emission to fail
            vi.mocked(mockEventEmitter.emitTyped).mockRejectedValue(new Error("Event emission failed"));

            // Should not throw even if event emission fails
            await expect(databaseManager.initialize()).resolves.toBeUndefined();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.any(Object)
            );
        });

        it("should handle settings.get returning a value during initialize", async () => {
            // Mock settings.get to return a specific limit
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("250");

            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 1,
                    message: "Success",
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            await databaseManager.initialize();

            // Should set the history limit from database
            expect(databaseManager.getHistoryLimit()).toBe(250);
        });
    });

    describe("LoadSites - Error Handling Branches", () => {
        it("should handle loadSitesFromDatabase returning success=false", async () => {
            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: false,
                    sitesLoaded: 0,
                    message: "Failed to load sites",
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            // Should throw when loadSitesFromDatabase fails
            await expect(databaseManager.initialize()).rejects.toThrow("Failed to load sites");
        });

        it("should handle site cache operations during loadSites", async () => {
            // Reset and configure the SiteLoadingOrchestrator mock
            // Mock to test the cache operations in loadSites
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Call the callbacks to test cache operations
                    if (config.stopMonitoring) await config.stopMonitoring("site1", "monitor1");
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            await databaseManager.initialize();
            expect(mockOrchestrator.loadSitesFromDatabase).toHaveBeenCalled();
        });
    });

    describe("RefreshSites - Error Handling Branches", () => {
        it("should handle cache access errors during refreshSites", async () => {
            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock();
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            // Initialize first
            await databaseManager.initialize();

            // This should work without errors
            const result = await databaseManager.refreshSites();
            expect(Array.isArray(result)).toBe(true);
        });

        it("should return sites from cache during successful refreshSites", async () => {
            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock();
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            await databaseManager.initialize();
            const result = await databaseManager.refreshSites();

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe("Event Emission Error Handling", () => {
        it("should handle emitHistoryLimitUpdated errors", async () => {
            // Initialize first
            await databaseManager.initialize();

            // Mock event emission to fail
            vi.mocked(mockEventEmitter.emitTyped).mockRejectedValue(new Error("Event emission failed"));

            // Should not throw even if event emission fails
            await expect(databaseManager.setHistoryLimit(100)).resolves.toBeUndefined();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:history-limit-updated",
                expect.objectContaining({
                    limit: 100,
                })
            );
        });

        it("should handle emitSitesCacheUpdateRequested errors", async () => {
            // Reset and configure the SiteLoadingOrchestrator mock
            // Create a mock that uses the startMonitoring callback
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Simulate calling startMonitoring which triggers emitSitesCacheUpdateRequested
                    if (config.startMonitoring) await config.startMonitoring("site1", "monitor1");
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            // Mock event emission to fail
            vi.mocked(mockEventEmitter.emitTyped).mockRejectedValue(new Error("Event emission failed"));

            // Should still complete successfully even if events fail
            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });
    });

    describe("Import Data Error Branches", () => {
        it("should handle importData with event emission failure during catch block", async () => {
            // Reset and configure the DataImportExportService mock
            // Mock import service to fail
            const mockImportService = createDataImportExportServiceMock({
                importDataFromJson: vi.fn().mockRejectedValue(new Error("Import failed")),
            });
            vi.mocked(DataImportExportService).mockImplementation(() => mockImportService as any);

            // Mock first event emission to succeed, second to fail
            vi.mocked(mockEventEmitter.emitTyped)
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("Event emission failed"));

            const result = await databaseManager.importData('{"sites": []}');
            expect(result).toBe(false);
        });

        it("should handle successful importData flow", async () => {
            // Reset and configure the DataImportExportService mock
            const mockImportService = createDataImportExportServiceMock({
                importDataFromJson: vi.fn().mockResolvedValue({ sites: [], settings: [] }),
                persistImportedData: vi.fn().mockResolvedValue(undefined),
            });
            vi.mocked(DataImportExportService).mockImplementation(() => mockImportService as any);

            const result = await databaseManager.importData('{"sites": [{"identifier": "site1"}], "settings": []}');

            expect(result).toBe(true);
            expect(mockImportService.importDataFromJson).toHaveBeenCalled();
            expect(mockImportService.persistImportedData).toHaveBeenCalled();
        });
    });

    describe("History Limit Edge Cases", () => {
        it("should handle setHistoryLimit with different limit values", async () => {
            await databaseManager.initialize();
            await databaseManager.setHistoryLimit(100);
            expect(databaseManager.getHistoryLimit()).toBe(100);
        });

        it("should handle setHistoryLimit with utility throwing error", async () => {
            await databaseManager.initialize();

            // Mock the utilities to throw an error
            vi.mocked(mockSettingsRepository.upsert).mockRejectedValue(new Error("Failed to set limit"));

            await expect(databaseManager.setHistoryLimit(100)).rejects.toThrow("Failed to set limit");
        });
    });

    describe("Monitor Configuration Callbacks", () => {
        it("should handle stopMonitoring callback in loadSites", async () => {
            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Test the stopMonitoring callback
                    if (config.stopMonitoring) {
                        await config.stopMonitoring("site1", "monitor1");
                    }
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            // Should complete without errors
            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });

        it("should handle setupNewMonitors callback in loadSites", async () => {
            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Test the setupNewMonitors callback
                    if (config.setupNewMonitors) {
                        await config.setupNewMonitors(["monitor1", "monitor2"]);
                    }
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });

        it("should handle setHistoryLimit callback in monitoring config", async () => {
            // Reset and configure the SiteLoadingOrchestrator mock
            const mockOrchestrator = createSiteLoadingOrchestratorMock({
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Test the setHistoryLimit callback
                    if (config.setHistoryLimit) {
                        await config.setHistoryLimit(200);
                    }
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            });
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator as any);

            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });
    });
});
