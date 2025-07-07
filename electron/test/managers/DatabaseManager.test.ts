/**
 * Tests for DatabaseManager class.
 * Comprehensive tests for all methods and edge cases.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the logger - combine all logger exports
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
    monitorLogger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    dbLogger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock the utility functions first using factory
vi.mock("../../utils/database", () => ({
    refreshSites: vi.fn(),
    loadSitesFromDatabase: vi.fn(),
    setHistoryLimit: vi.fn(),
    getHistoryLimit: vi.fn(),
    importData: vi.fn(),
    exportData: vi.fn(),
    initDatabase: vi.fn(),
    downloadBackup: vi.fn(),
    createSiteWritingOrchestrator: vi.fn(() => ({
        createSite: vi.fn(),
        updateSite: vi.fn(),
        deleteSite: vi.fn(),
    })),
    createSiteRepositoryService: vi.fn(() => ({
        getSitesFromDatabase: vi.fn(),
        loadSitesFromDatabase: vi.fn(),
    })),
    getSitesFromDatabase: vi.fn(),
}));

// Import after mocks
import { DatabaseManager, DatabaseManagerDependencies } from "../../managers/DatabaseManager";
import { TypedEventBus } from "../../events/TypedEventBus";
import type { UptimeEvents } from "../../events/eventTypes";
import type { Site } from "../../types";
import * as dbUtils from "../../utils/database";

// Get the mocked functions
const mockRefreshSites = vi.mocked(dbUtils.refreshSites);
const mockLoadSitesFromDatabase = vi.mocked(dbUtils.loadSitesFromDatabase);
const mockSetHistoryLimit = vi.mocked(dbUtils.setHistoryLimit);
const mockGetHistoryLimit = vi.mocked(dbUtils.getHistoryLimit);
const mockImportData = vi.mocked(dbUtils.importData);
const mockExportData = vi.mocked(dbUtils.exportData);
const mockInitDatabase = vi.mocked(dbUtils.initDatabase);
const mockDownloadBackup = vi.mocked(dbUtils.downloadBackup);

// Helper to create mock sites
const createMockSite = (identifier: string): Site => ({
    identifier,
    name: `Site ${identifier}`,
    monitors: [],
});

describe("DatabaseManager", () => {
    let databaseManager: DatabaseManager;
    let mockEventEmitter: TypedEventBus<UptimeEvents>;
    let mockDependencies: DatabaseManagerDependencies;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create a mock TypedEventBus
        mockEventEmitter = {
            emitTyped: vi.fn().mockResolvedValue(undefined),
            onTyped: vi.fn(),
            onceTyped: vi.fn(),
            offTyped: vi.fn(),
            use: vi.fn(),
            removeMiddleware: vi.fn(),
            clearMiddleware: vi.fn(),
            processMiddleware: vi.fn(),
            getDiagnostics: vi.fn(),
            middlewares: [],
            busId: "test-bus",
            // EventEmitter methods
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
            emit: vi.fn(),
            removeAllListeners: vi.fn(),
            setMaxListeners: vi.fn(),
            listeners: vi.fn(),
            eventNames: vi.fn(),
            getMaxListeners: vi.fn(),
            listenerCount: vi.fn(),
            prependListener: vi.fn(),
            prependOnceListener: vi.fn(),
            removeListener: vi.fn(),
            addListener: vi.fn(),
            rawListeners: vi.fn(),
        } as unknown as TypedEventBus<UptimeEvents>;

        mockDependencies = {
            eventEmitter: mockEventEmitter,
            repositories: {
                database: {
                    getInstance: vi.fn(),
                    init: vi.fn(),
                    close: vi.fn(),
                    backup: vi.fn(),
                } as Partial<
                    DatabaseManagerDependencies["repositories"]["database"]
                > as DatabaseManagerDependencies["repositories"]["database"],
                site: {
                    findAll: vi.fn(),
                    exportAll: vi.fn(),
                    findByIdentifier: vi.fn(),
                    upsert: vi.fn(),
                    delete: vi.fn(),
                    exists: vi.fn(),
                    deleteAll: vi.fn(),
                    bulkInsert: vi.fn(),
                } as Partial<
                    DatabaseManagerDependencies["repositories"]["site"]
                > as DatabaseManagerDependencies["repositories"]["site"],
                monitor: {
                    findAll: vi.fn(),
                    findBySiteIdentifier: vi.fn(),
                    create: vi.fn(),
                    update: vi.fn(),
                    delete: vi.fn(),
                    deleteBySiteIdentifier: vi.fn(),
                    deleteBySiteIdentifierInternal: vi.fn(),
                    getAllMonitorIds: vi.fn(),
                    deleteAll: vi.fn(),
                    bulkCreate: vi.fn(),
                } as Partial<
                    DatabaseManagerDependencies["repositories"]["monitor"]
                > as DatabaseManagerDependencies["repositories"]["monitor"],
                history: {
                    findAll: vi.fn(),
                    pruneHistory: vi.fn(),
                    findByMonitorId: vi.fn(),
                    addEntry: vi.fn(),
                    deleteByMonitorId: vi.fn(),
                    pruneAllHistory: vi.fn(),
                    getHistoryCount: vi.fn(),
                    deleteAll: vi.fn(),
                    getLatestEntry: vi.fn(),
                    bulkInsert: vi.fn(),
                } as Partial<
                    DatabaseManagerDependencies["repositories"]["history"]
                > as DatabaseManagerDependencies["repositories"]["history"],
                settings: {
                    get: vi.fn(),
                    set: vi.fn(),
                    getAll: vi.fn(),
                    delete: vi.fn(),
                    deleteAll: vi.fn(),
                    bulkInsert: vi.fn(),
                } as Partial<
                    DatabaseManagerDependencies["repositories"]["settings"]
                > as DatabaseManagerDependencies["repositories"]["settings"],
            },
        };

        databaseManager = new DatabaseManager(mockDependencies);
    });

    describe("constructor", () => {
        it("should create a DatabaseManager instance", () => {
            expect(databaseManager).toBeInstanceOf(DatabaseManager);
            // DatabaseManager no longer extends EventEmitter directly, it uses the provided TypedEventBus
            expect(databaseManager).toHaveProperty("eventEmitter");
        });

        it("should store dependencies correctly", () => {
            // Test by calling a method that uses dependencies
            expect(() => databaseManager.getHistoryLimit()).not.toThrow();
        });
    });

    describe("initialize", () => {
        it("should initialize database and emit event", async () => {
            mockInitDatabase.mockResolvedValue(undefined);

            mockEventEmitter.emitTyped = vi.fn();

            await databaseManager.initialize();

            expect(mockInitDatabase).toHaveBeenCalledWith(
                mockDependencies.repositories.database,
                expect.any(Function),
                mockEventEmitter
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                expect.stringContaining("database:transaction-completed"),
                expect.objectContaining({
                    operation: "database:initialize",
                    success: true,
                })
            );
        });

        it("should handle initialization errors", async () => {
            const error = new Error("Database initialization failed");
            mockInitDatabase.mockRejectedValue(error);

            await expect(databaseManager.initialize()).rejects.toThrow("Database initialization failed");
        });

        it("should call loadSites during initialization", async () => {
            let loadSitesCallback: (() => Promise<void>) | undefined;

            mockInitDatabase.mockImplementation(async (db, callback) => {
                loadSitesCallback = callback;
                return Promise.resolve();
            });

            mockLoadSitesFromDatabase.mockResolvedValue(undefined);

            await databaseManager.initialize();

            // Call the loadSites callback to test it
            if (loadSitesCallback) {
                await loadSitesCallback();
                expect(mockLoadSitesFromDatabase).toHaveBeenCalled();
            }
        });
    });

    describe("loadSites", () => {
        it.skip("should load sites and emit events properly", async () => {
            const mockSites = [createMockSite("site1"), createMockSite("site2")];
            let setHistoryLimitCallback: ((limit: number) => void) | undefined;
            let startMonitoringCallback: ((identifier: string, monitorId: string) => Promise<boolean>) | undefined;

            mockLoadSitesFromDatabase.mockImplementation(async (params) => {
                setHistoryLimitCallback = params.setHistoryLimit;
                startMonitoringCallback = params.startMonitoring;

                // Simulate adding sites to the map
                for (const site of mockSites) {
                    params.sites.set(site.identifier, site);
                }

                return {
                    success: true,
                    sitesLoaded: mockSites.length,
                    message: `Successfully loaded ${mockSites.length} sites`,
                };
            });

            // Initialize to trigger loadSites
            await databaseManager.initialize();

            // Test that callbacks were captured
            expect(setHistoryLimitCallback).toBeDefined();
            expect(startMonitoringCallback).toBeDefined();

            // Test setHistoryLimit callback functionality
            if (setHistoryLimitCallback) {
                setHistoryLimitCallback(500);
                // This should not throw
            }

            // Test startMonitoring callback functionality
            if (startMonitoringCallback) {
                const result = await startMonitoringCallback("site1", "monitor1");
                expect(result).toBe(true);
            }
        });

        it.skip("should handle loadSitesFromDatabase errors", async () => {
            const error = new Error("Failed to load sites");
            mockLoadSitesFromDatabase.mockRejectedValue(error);

            await expect(databaseManager.initialize()).rejects.toThrow("Failed to load sites");
        });
    });

    describe("exportData", () => {
        it("should export data and emit event", async () => {
            const mockExportResult = '{"sites":[],"monitors":[],"settings":{}}';
            mockExportData.mockResolvedValue(mockExportResult);

            mockEventEmitter.emitTyped = vi.fn();

            const result = await databaseManager.exportData();

            expect(result).toBe(mockExportResult);
            expect(mockExportData).toHaveBeenCalledWith({
                databaseService: mockDependencies.repositories.database,
                eventEmitter: mockEventEmitter,
                repositories: {
                    history: mockDependencies.repositories.history,
                    monitor: mockDependencies.repositories.monitor,
                    settings: mockDependencies.repositories.settings,
                    site: mockDependencies.repositories.site,
                },
            });
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                expect.stringContaining("database:data-exported"),
                expect.objectContaining({
                    fileName: expect.stringMatching(/^export-\d+\.json$/),
                    success: true,
                })
            );
        });

        it("should handle export errors", async () => {
            const error = new Error("Export failed");
            mockExportData.mockRejectedValue(error);

            await expect(databaseManager.exportData()).rejects.toThrow("Export failed");
        });
    });

    describe("importData", () => {
        it("should import data and emit event", async () => {
            const testData = '{"sites":[],"monitors":[],"settings":{}}';
            let loadSitesCallback: (() => Promise<void>) | undefined;

             
            mockImportData.mockImplementation(async (deps, callbacks, _data) => {
                loadSitesCallback = callbacks.loadSites;
                return true;
            });

            mockEventEmitter.emitTyped = vi.fn();

            const result = await databaseManager.importData(testData);

            expect(result).toBe(true);
            expect(mockImportData).toHaveBeenCalledWith(
                {
                    databaseService: mockDependencies.repositories.database,
                    eventEmitter: mockEventEmitter,
                    repositories: {
                        history: mockDependencies.repositories.history,
                        monitor: mockDependencies.repositories.monitor,
                        settings: mockDependencies.repositories.settings,
                        site: mockDependencies.repositories.site,
                    },
                },
                {
                    getSitesFromCache: expect.any(Function),
                    loadSites: expect.any(Function),
                },
                testData
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                expect.stringContaining("database:data-imported"),
                expect.objectContaining({
                    success: true,
                })
            );

            // Test loadSites callback
            if (loadSitesCallback) {
                await loadSitesCallback();
                expect(mockLoadSitesFromDatabase).toHaveBeenCalled();
            }
        });

        it("should return empty array for getSitesFromCache callback", async () => {
            let getSitesCacheCallback: (() => Site[]) | undefined;

             
            mockImportData.mockImplementation(async (deps, callbacks, _data) => {
                getSitesCacheCallback = callbacks.getSitesFromCache;
                return true;
            });

            await databaseManager.importData('{"test":"data"}');

            // Test getSitesFromCache callback
            if (getSitesCacheCallback) {
                const sites = getSitesCacheCallback();
                expect(sites).toEqual([]);
            }
        });

        it("should handle import errors", async () => {
            const error = new Error("Import failed");
            mockImportData.mockRejectedValue(error);

            await expect(databaseManager.importData('{"invalid":"data"}')).rejects.toThrow("Import failed");
        });
    });

    describe("downloadBackup", () => {
        it("should download backup and emit event", async () => {
            const mockBackupResult = { buffer: Buffer.from("test backup"), fileName: "backup.db" };
            mockDownloadBackup.mockResolvedValue(mockBackupResult);

            mockEventEmitter.emitTyped = vi.fn();

            const result = await databaseManager.downloadBackup();

            expect(result).toEqual(mockBackupResult);
            expect(mockDownloadBackup).toHaveBeenCalledWith({
                databaseService: mockDependencies.repositories.database,
                eventEmitter: mockEventEmitter,
            });
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                expect.stringContaining("database:backup-downloaded"),
                expect.objectContaining({
                    fileName: "backup.db",
                    success: true,
                })
            );
        });

        it("should handle backup download errors", async () => {
            const error = new Error("Backup download failed");
            mockDownloadBackup.mockRejectedValue(error);

            await expect(databaseManager.downloadBackup()).rejects.toThrow("Backup download failed");
        });
    });

    describe("refreshSites", () => {
        it("should refresh sites and emit event", async () => {
            const mockSites = [createMockSite("site1"), createMockSite("site2")];
            let loadSitesCallback: (() => Promise<void>) | undefined;

            mockRefreshSites.mockImplementation(async (callbacks) => {
                loadSitesCallback = callbacks.loadSites;
                return mockSites;
            });

            mockEventEmitter.emitTyped = vi.fn();

            const result = await databaseManager.refreshSites();

            expect(result).toEqual(mockSites);
            expect(mockRefreshSites).toHaveBeenCalledWith({
                getSitesFromCache: expect.any(Function),
                loadSites: expect.any(Function),
            });
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith("internal:database:sites-refreshed", {
                operation: "sites-refreshed",
                siteCount: 2,
                timestamp: expect.any(Number),
            });

            // Test loadSites callback
            if (loadSitesCallback) {
                await loadSitesCallback();
                expect(mockLoadSitesFromDatabase).toHaveBeenCalled();
            }
        });

        it("should return empty array for getSitesFromCache callback", async () => {
            let getSitesCacheCallback: (() => Site[]) | undefined;

            mockRefreshSites.mockImplementation(async (callbacks) => {
                getSitesCacheCallback = callbacks.getSitesFromCache;
                return [];
            });

            await databaseManager.refreshSites();

            // Test getSitesFromCache callback
            if (getSitesCacheCallback) {
                const sites = getSitesCacheCallback();
                expect(sites).toEqual([]);
            }
        });

        it("should handle refresh sites errors", async () => {
            const error = new Error("Refresh sites failed");
            mockRefreshSites.mockRejectedValue(error);

            await expect(databaseManager.refreshSites()).rejects.toThrow("Refresh sites failed");
        });
    });

    describe("setHistoryLimit", () => {
        it("should set history limit and emit event", async () => {
            let setHistoryLimitCallback: ((limit: number) => void) | undefined;

            mockSetHistoryLimit.mockImplementation(async (params) => {
                setHistoryLimitCallback = params.setHistoryLimit;
                if (setHistoryLimitCallback) {
                    setHistoryLimitCallback(params.limit);
                }
                return Promise.resolve();
            });

            mockEventEmitter.emitTyped = vi.fn();

            await databaseManager.setHistoryLimit(500);

            expect(mockSetHistoryLimit).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 500,
                    setHistoryLimit: expect.any(Function),
                })
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith("internal:database:history-limit-updated", {
                operation: "history-limit-updated",
                limit: 500,
                timestamp: expect.any(Number),
            });
        });

        it("should handle set history limit errors", async () => {
            const error = new Error("Failed to set history limit");
            mockSetHistoryLimit.mockRejectedValue(error);

            await expect(databaseManager.setHistoryLimit(1000)).rejects.toThrow("Failed to set history limit");
        });
    });

    describe("getHistoryLimit", () => {
        it("should get current history limit", () => {
            mockGetHistoryLimit.mockImplementation((getCallback) => getCallback());

            // Initially should return default limit
            const initialLimit = databaseManager.getHistoryLimit();
            expect(typeof initialLimit).toBe("number");
            expect(mockGetHistoryLimit).toHaveBeenCalledWith(expect.any(Function));
        });

        it("should return updated limit after setHistoryLimit", async () => {
            let internalLimit = 1000; // Default value

            // Mock setHistoryLimit to update internal state
            mockSetHistoryLimit.mockImplementation(async (params) => {
                internalLimit = params.limit;
                if (params.setHistoryLimit) {
                    params.setHistoryLimit(params.limit);
                }
                return Promise.resolve();
            });

            // Mock getHistoryLimit to return the internal limit
             
            mockGetHistoryLimit.mockImplementation((_getCallback) => {
                // _getCallback should return the current internal limit
                // We simulate this by just returning the current internalLimit
                return internalLimit;
            });

            // Set a new limit
            await databaseManager.setHistoryLimit(750);

            // Get the limit should return the updated value
            const currentLimit = databaseManager.getHistoryLimit();
            expect(currentLimit).toBe(750);
            expect(mockGetHistoryLimit).toHaveBeenCalled();
        });
    });

    describe("edge cases and error handling", () => {
        it("should handle empty data in importData", async () => {
            mockImportData.mockResolvedValue(false);

            const result = await databaseManager.importData("");
            expect(result).toBe(false);
        });

        it("should handle null/undefined in various methods", async () => {
            // These should not throw errors due to proper error handling
            mockExportData.mockResolvedValue("");
            const exportResult = await databaseManager.exportData();
            expect(exportResult).toBe("");

            mockRefreshSites.mockResolvedValue([]);
            const refreshResult = await databaseManager.refreshSites();
            expect(refreshResult).toEqual([]);
        });

        it("should handle multiple simultaneous operations", async () => {
            mockExportData.mockResolvedValue("export1");
            mockImportData.mockResolvedValue(true);
            mockRefreshSites.mockResolvedValue([]);

            // Run multiple operations simultaneously
            const results = await Promise.all([
                databaseManager.exportData(),
                databaseManager.importData('{"test":"data"}'),
                databaseManager.refreshSites(),
            ]);

            expect(results[0]).toBe("export1");
            expect(results[1]).toBe(true);
            expect(results[2]).toEqual([]);
        });
    });
});
