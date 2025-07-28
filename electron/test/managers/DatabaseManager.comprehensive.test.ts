/**
 * Comprehensive DatabaseManager tests - targeting 90%+ branch coverage
 * Focuses on error paths and edge cases not covered by existing tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabaseManager, DatabaseManagerDependencies } from "../../managers/DatabaseManager";
import { TypedEventBus } from "../../events/TypedEventBus";
import { UptimeEvents } from "../../events/eventTypes";

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
    deleteAll: vi.fn(() => Promise.resolve()),
    bulkInsert: vi.fn(() => Promise.resolve()),
    exportAll: vi.fn(() => Promise.resolve([])),
} as any;

// Mock external modules
vi.mock("../../utils/database/DataBackupService", () => ({
    DataBackupService: vi.fn().mockImplementation(() => ({
        downloadDatabaseBackup: vi.fn(() =>
            Promise.resolve({
                buffer: Buffer.from("backup data"),
                fileName: "backup-test.db",
            })
        ),
    })),
}));

vi.mock("../../utils/database/DataImportExportService", () => ({
    DataImportExportService: vi.fn().mockImplementation(() => ({
        exportAllData: vi.fn(() => Promise.resolve('{"sites": [], "settings": []}')),
        importDataFromJson: vi.fn(() => Promise.resolve({ sites: [], settings: [] })),
        persistImportedData: vi.fn(() => Promise.resolve()),
    })),
}));

vi.mock("../../utils/database/SiteRepositoryService", () => ({
    SiteRepositoryService: vi.fn().mockImplementation(() => ({
        loadSites: vi.fn(() => Promise.resolve([])),
    })),
    SiteLoadingOrchestrator: vi.fn().mockImplementation(() => ({
        loadSitesFromDatabase: vi.fn(() =>
            Promise.resolve({
                success: true,
                sitesLoaded: 2,
                message: "Sites loaded successfully",
            })
        ),
    })),
}));

vi.mock("../../utils/database/historyLimitManager", () => ({
    setHistoryLimit: vi.fn(() => Promise.resolve()),
    getHistoryLimit: vi.fn(() => 500),
}));

vi.mock("../../utils/database/serviceFactory", () => ({
    createSiteCache: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        has: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        keys: vi.fn(() => []),
        values: vi.fn(() => []),
        entries: vi.fn(() => []),
        size: 0,
        getStats: vi.fn(() => ({ hits: 0, misses: 0, hitRate: 0, size: 0, maxSize: 100 })),
        invalidate: vi.fn(),
        resetStats: vi.fn(),
        bulkUpdate: vi.fn(),
    })),
    LoggerAdapter: vi.fn().mockImplementation(() => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    })),
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
    __esModule: true,
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    monitorLogger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    default: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("DatabaseManager - Comprehensive Error Coverage", () => {
    let databaseManager: DatabaseManager;
    let dependencies: DatabaseManagerDependencies;

    beforeEach(() => {
        vi.clearAllMocks();

        dependencies = {
            configurationManager: mockConfigurationManager,
            eventEmitter: mockEventEmitter,
            repositories: {
                database: mockDatabaseService,
                history: mockHistoryRepository,
                monitor: mockMonitorRepository,
                settings: mockSettingsRepository,
                site: mockSiteRepository,
            },
        };

        databaseManager = new DatabaseManager(dependencies);
    });

    describe("Initialize - Error Handling Branches", () => {
        it("should handle settings.get throwing an error during initialize", async () => {
            // Mock settings.get to throw an error
            vi.mocked(mockSettingsRepository.get).mockRejectedValue(new Error("Settings access failed"));

            // Mock SiteLoadingOrchestrator to succeed
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");
            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 0,
                    message: "Success",
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            // Should not throw and should use default history limit
            await expect(databaseManager.initialize()).resolves.toBeUndefined();

            // Should still call database initialization and load sites
            expect(mockDatabaseService.initialize).toHaveBeenCalled();
            expect(mockOrchestrator.loadSitesFromDatabase).toHaveBeenCalled();
        });

        it("should handle event emission error during initialize", async () => {
            // Mock successful database operations
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("100");

            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");
            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 1,
                    message: "Success",
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            // Mock event emission to fail
            vi.mocked(mockEventEmitter.emitTyped).mockRejectedValue(new Error("Event emission failed"));

            // Should not throw even if event emission fails
            await expect(databaseManager.initialize()).resolves.toBeUndefined();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith("database:transaction-completed", expect.any(Object));
        });

        it("should handle settings.get returning a value during initialize", async () => {
            // Mock settings.get to return a specific limit
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("250");

            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");
            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 1,
                    message: "Success",
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            await databaseManager.initialize();

            // Should set the history limit from database
            expect(databaseManager.getHistoryLimit()).toBe(250);
        });
    });

    describe("LoadSites - Error Handling Branches", () => {
        it("should handle loadSitesFromDatabase returning success=false", async () => {
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");
            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: false,
                    sitesLoaded: 0,
                    message: "Failed to load sites",
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            // Should throw when loadSitesFromDatabase fails
            await expect(databaseManager.initialize()).rejects.toThrow("Failed to load sites");
        });

        it("should handle site cache operations during loadSites", async () => {
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");
            const { createSiteCache } = await import("../../utils/database/serviceFactory");

            // Create mock caches
            const mockTempCache = {
                entries: vi.fn(() => [
                    ["site1", { identifier: "site1", name: "Site 1", monitoring: true, monitors: [] }],
                    ["site2", { identifier: "site2", name: "Site 2", monitoring: false, monitors: [] }],
                ]),
            };

            const mockMainCache = {
                clear: vi.fn(),
                set: vi.fn(),
                entries: vi.fn(() => []),
            };

            vi.mocked(createSiteCache).mockReturnValueOnce(mockMainCache as any);

            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockImplementation((tempCache) => {
                    // Simulate adding sites to temp cache
                    vi.mocked(tempCache.entries).mockReturnValue([
                        ["site1", { identifier: "site1", name: "Site 1", monitoring: true, monitors: [] }],
                    ]);
                    return Promise.resolve({
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    });
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            await databaseManager.initialize();

            // Verify cache operations were called
            expect(mockMainCache.clear).toHaveBeenCalled();
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:sites-cache-update-requested",
                expect.any(Object)
            );
        });
    });

    describe("RefreshSites - Error Handling Branches", () => {
        it("should handle cache access errors during refreshSites", async () => {
            // Mock successful loadSites
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");
            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 1,
                    message: "Success",
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            // Create manager with cache that will throw
            const { createSiteCache } = await import("../../utils/database/serviceFactory");
            const mockFailingCache = {
                entries: vi.fn(() => {
                    throw new Error("Cache access failed");
                }),
                clear: vi.fn(),
                set: vi.fn(),
            };
            vi.mocked(createSiteCache).mockReturnValue(mockFailingCache as any);

            const newManager = new DatabaseManager(dependencies);

            // Should handle the error and return empty array
            const result = await newManager.refreshSites();

            expect(result).toEqual([]);
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:sites-refreshed",
                expect.objectContaining({
                    siteCount: 0,
                })
            );
        });

        it("should return sites from cache during successful refreshSites", async () => {
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");
            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockResolvedValue({
                    success: true,
                    sitesLoaded: 2,
                    message: "Success",
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            const { createSiteCache } = await import("../../utils/database/serviceFactory");
            const mockSites = [
                { identifier: "site1", name: "Site 1", monitoring: true, monitors: [] },
                { identifier: "site2", name: "Site 2", monitoring: false, monitors: [] },
            ];

            const mockCache = {
                entries: vi.fn(() => [
                    ["site1", mockSites[0]],
                    ["site2", mockSites[1]],
                ]),
                clear: vi.fn(),
                set: vi.fn(),
            };
            vi.mocked(createSiteCache).mockReturnValue(mockCache as any);

            const newManager = new DatabaseManager(dependencies);

            const result = await newManager.refreshSites();

            expect(result).toEqual(mockSites);
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:sites-refreshed",
                expect.objectContaining({
                    siteCount: 2,
                })
            );
        });
    });

    describe("Event Emission Error Handling", () => {
        it("should handle emitHistoryLimitUpdated errors", async () => {
            // Mock event emission to fail
            vi.mocked(mockEventEmitter.emitTyped).mockRejectedValue(new Error("Event emission failed"));

            // Should not throw even if event emission fails
            await expect(databaseManager.setHistoryLimit(100)).resolves.toBeUndefined();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:history-limit-updated",
                expect.any(Object)
            );
        });

        it("should handle emitSitesCacheUpdateRequested errors", async () => {
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");

            // Create a mock that uses the startMonitoring callback
            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Simulate calling startMonitoring which triggers emitSitesCacheUpdateRequested
                    await config.startMonitoring("site1", "monitor1");
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            // Mock event emission to fail
            vi.mocked(mockEventEmitter.emitTyped).mockRejectedValue(new Error("Event emission failed"));

            // Should still complete successfully even if events fail
            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });
    });

    describe("Import Data Error Branches", () => {
        it("should handle importData with event emission failure during catch block", async () => {
            const { DataImportExportService } = await import("../../utils/database/DataImportExportService");

            // Mock import service to fail
            const mockImportService = {
                importDataFromJson: vi.fn().mockRejectedValue(new Error("Import failed")),
                persistImportedData: vi.fn(),
            };
            vi.mocked(DataImportExportService).mockImplementation(() => mockImportService);

            // Mock first event emission to succeed, second to fail
            vi.mocked(mockEventEmitter.emitTyped)
                .mockResolvedValueOnce(undefined) // First call succeeds
                .mockRejectedValueOnce(new Error("Event emission failed")); // Second call fails

            const result = await databaseManager.importData('{"invalid": "data"}');

            // Should return false and handle the event emission error gracefully
            expect(result).toBe(false);
        });

        it("should handle successful importData flow", async () => {
            const { DataImportExportService } = await import("../../utils/database/DataImportExportService");

            // Mock successful import
            const mockImportService = {
                importDataFromJson: vi.fn().mockResolvedValue({ sites: [{ identifier: "site1" }], settings: [] }),
                persistImportedData: vi.fn().mockResolvedValue(undefined),
            };
            vi.mocked(DataImportExportService).mockImplementation(() => mockImportService);

            const result = await databaseManager.importData('{"sites": [{"identifier": "site1"}], "settings": []}');

            expect(result).toBe(true);
            expect(mockImportService.importDataFromJson).toHaveBeenCalled();
            expect(mockImportService.persistImportedData).toHaveBeenCalled();
        });
    });

    describe("History Limit Edge Cases", () => {
        it("should handle setHistoryLimit with different limit values", async () => {
            const { setHistoryLimit } = await import("../../utils/database/historyLimitManager");
            
            // Test different limit values
            await databaseManager.setHistoryLimit(0);
            expect(databaseManager.getHistoryLimit()).toBe(0);

            await databaseManager.setHistoryLimit(1000);
            expect(databaseManager.getHistoryLimit()).toBe(1000);

            expect(setHistoryLimit).toHaveBeenCalledTimes(2);
        });

        it("should handle setHistoryLimit with utility throwing error", async () => {
            const { setHistoryLimit } = await import("../../utils/database/historyLimitManager");
            
            // Mock setHistoryLimit to throw
            vi.mocked(setHistoryLimit).mockRejectedValue(new Error("Failed to set limit"));

            await expect(databaseManager.setHistoryLimit(100)).rejects.toThrow("Failed to set limit");
            
            // History limit should still be updated locally
            expect(databaseManager.getHistoryLimit()).toBe(100);
        });
    });

    describe("Monitor Configuration Callbacks", () => {
        it("should handle stopMonitoring callback in loadSites", async () => {
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");

            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Test the stopMonitoring callback
                    const result = await config.stopMonitoring("site1", "monitor1");
                    expect(result).toBe(true);
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            await databaseManager.initialize();

            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:site:stop-monitoring-requested",
                expect.any(Object)
            );
        });

        it("should handle setupNewMonitors callback in loadSites", async () => {
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");

            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Test the setupNewMonitors callback
                    const site = { identifier: "site1", name: "Site 1", monitoring: true, monitors: [] };
                    await config.setupNewMonitors(site, ["monitor1", "monitor2"]);
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            // Should complete without errors
            await expect(databaseManager.initialize()).resolves.toBeUndefined();
        });

        it("should handle setHistoryLimit callback in monitoring config", async () => {
            const { SiteLoadingOrchestrator } = await import("../../utils/database/SiteRepositoryService");

            const mockOrchestrator = {
                loadSitesFromDatabase: vi.fn().mockImplementation(async (tempCache, config) => {
                    // Test the setHistoryLimit callback
                    await config.setHistoryLimit(300);
                    return {
                        success: true,
                        sitesLoaded: 1,
                        message: "Success",
                    };
                }),
            };
            vi.mocked(SiteLoadingOrchestrator).mockImplementation(() => mockOrchestrator);

            await databaseManager.initialize();

            // Should update the history limit
            expect(databaseManager.getHistoryLimit()).toBe(300);
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:database:history-limit-updated",
                expect.any(Object)
            );
        });
    });
});
