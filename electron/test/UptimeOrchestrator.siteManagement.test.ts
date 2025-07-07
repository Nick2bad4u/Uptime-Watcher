/**
 * Tests for UptimeOrchestrator - Site Management functionality.
 */

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

// Mock constants
vi.mock("../constants", () => ({
    DEFAULT_REQUEST_TIMEOUT: 10000,
    DEFAULT_CHECK_INTERVAL: 300000,
    STATUS_UPDATE_EVENT: "status-update",
    DEFAULT_HISTORY_LIMIT: 500,
}));

// Mock utils
vi.mock("../utils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("../utils/logger", () => ({
    monitorLogger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../utils/retry", () => ({
    withDbRetry: vi.fn((fn) => fn()),
}));

// Mock database services
const mockDatabaseInstance = {
    initialize: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    getDatabasePath: vi.fn(() => "/path/to/database.db"),
    downloadBackup: vi.fn(() => Promise.resolve({ buffer: Buffer.from("backup"), fileName: "backup.db" })),
    executeTransaction: vi.fn(async (callback) => await callback({ mockDb: true })),
};

const mockDatabaseService = {
    getInstance: vi.fn(() => mockDatabaseInstance),
};

const mockSiteRepositoryInstance = {
    create: vi.fn(() => Promise.resolve("mock-site-id")),
    delete: vi.fn(() => Promise.resolve()),
    findAll: vi.fn(() => Promise.resolve([])),
    findById: vi.fn(() => Promise.resolve(null)),
    findByIdentifier: vi.fn(() => Promise.resolve(undefined)),
    update: vi.fn(() => Promise.resolve()),
    upsert: vi.fn(() => Promise.resolve()),
    deleteByIdentifier: vi.fn(() => Promise.resolve()),
    exportAll: vi.fn(() => Promise.resolve([])),
    getByIdentifier: vi.fn(() => Promise.resolve(null)),
    bulkInsert: vi.fn(() => Promise.resolve()),
    deleteAll: vi.fn(() => Promise.resolve()),
};

const mockSiteRepository = vi.fn(() => mockSiteRepositoryInstance);

const mockMonitorRepositoryInstance = {
    create: vi.fn(() => Promise.resolve("mock-monitor-id")),
    delete: vi.fn(() => Promise.resolve()),
    findAll: vi.fn(() => Promise.resolve([])),
    findById: vi.fn(() => Promise.resolve(null)),
    findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
    update: vi.fn(() => Promise.resolve()),
    deleteByIds: vi.fn(() => Promise.resolve()),
    deleteBySiteIdentifier: vi.fn(() => Promise.resolve()),
    deleteBySiteIdentifierInternal: vi.fn(),
    updateStatus: vi.fn(() => Promise.resolve()),
    bulkCreate: vi.fn(() => Promise.resolve([])),
    deleteAll: vi.fn(() => Promise.resolve()),
};

const mockMonitorRepository = vi.fn(() => mockMonitorRepositoryInstance);

const mockHistoryRepositoryInstance = {
    create: vi.fn(() => Promise.resolve("mock-history-id")),
    delete: vi.fn(() => Promise.resolve()),
    findAll: vi.fn(() => Promise.resolve([])),
    findById: vi.fn(() => Promise.resolve(null)),
    findByMonitorId: vi.fn(() => Promise.resolve([])),
    update: vi.fn(() => Promise.resolve()),
    deleteByMonitorIds: vi.fn(() => Promise.resolve()),
    deleteOldEntries: vi.fn(() => Promise.resolve()),
    addEntry: vi.fn(() => Promise.resolve()),
    pruneHistory: vi.fn(() => Promise.resolve()),
    pruneAllHistory: vi.fn(() => Promise.resolve()),
    bulkInsert: vi.fn(() => Promise.resolve()),
    deleteAll: vi.fn(() => Promise.resolve()),
};

const mockHistoryRepository = vi.fn(() => mockHistoryRepositoryInstance);

const mockSettingsRepositoryInstance = {
    create: vi.fn(() => Promise.resolve("mock-setting-id")),
    delete: vi.fn(() => Promise.resolve()),
    findAll: vi.fn(() => Promise.resolve([])),
    findById: vi.fn(() => Promise.resolve(null)),
    update: vi.fn(() => Promise.resolve()),
    get: vi.fn(() => Promise.resolve(null)) as any,
    set: vi.fn(() => Promise.resolve()),
    getAll: vi.fn(() => Promise.resolve({})),
    bulkInsert: vi.fn(() => Promise.resolve()),
    deleteAll: vi.fn(() => Promise.resolve()),
};

const mockSettingsRepository = vi.fn(() => mockSettingsRepositoryInstance);

vi.mock("../services/database", () => ({
    DatabaseService: mockDatabaseService,
    SiteRepository: mockSiteRepository,
    MonitorRepository: mockMonitorRepository,
    HistoryRepository: mockHistoryRepository,
    SettingsRepository: mockSettingsRepository,
}));

// Mock monitoring services
const mockMonitorSchedulerInstance = {
    setCheckCallback: vi.fn(),
    scheduleMonitor: vi.fn(),
    unscheduleMonitor: vi.fn(),
    startAll: vi.fn(),
    stopAll: vi.fn(),
    isScheduled: vi.fn(() => false),
    startMonitor: vi.fn(() => true),
    stopMonitor: vi.fn(() => true),
    startSite: vi.fn(),
    stopSite: vi.fn(),
};

const mockMonitorScheduler = vi.fn(() => mockMonitorSchedulerInstance);

const mockMonitorFactory = {
    createMonitor: vi.fn().mockImplementation(() => ({
        check: vi.fn().mockResolvedValue({
            status: "up" as const,
            responseTime: 100,
            timestamp: Date.now(),
            details: "200",
            error: undefined,
        }),
    })),
    getMonitor: vi.fn().mockImplementation(() => ({
        check: vi.fn().mockResolvedValue({
            status: "up" as const,
            responseTime: 100,
            timestamp: Date.now(),
            details: "200",
            error: undefined,
        }),
    })),
};

vi.mock("../services/monitoring", () => ({
    MonitorScheduler: mockMonitorScheduler,
    MonitorFactory: mockMonitorFactory,
}));

// Helper functions
function resetAllMocks(): void {
    vi.clearAllMocks();

    // Reset specific mock implementations to default
    mockSiteRepositoryInstance.findAll.mockResolvedValue([]);
    mockMonitorRepositoryInstance.findBySiteIdentifier.mockResolvedValue([]);
    mockHistoryRepositoryInstance.findByMonitorId.mockResolvedValue([]);
    mockSettingsRepositoryInstance.get.mockResolvedValue(null);
}

async function createUptimeOrchestrator() {
    const { UptimeOrchestrator } = await import("../UptimeOrchestrator");
    return new UptimeOrchestrator();
}

describe("UptimeOrchestrator - Site Management", () => {
    let uptimeOrchestrator: any;

    beforeEach(async () => {
        resetAllMocks();
        uptimeOrchestrator = await createUptimeOrchestrator();
    });

    afterEach(() => {
        if (uptimeOrchestrator) {
            uptimeOrchestrator.removeAllListeners();
        }
    });

    describe("Site Management", () => {
        describe("getSites", () => {
            it("should return sites from database", async () => {
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;
                const mockSites = [
                    { identifier: "site1", name: "Site 1" },
                    { identifier: "site2", name: "Site 2" },
                ];
                siteRepoInstance.findAll.mockResolvedValue(mockSites);

                const result = await uptimeOrchestrator.getSites();

                expect(siteRepoInstance.findAll).toHaveBeenCalled();
                expect(result).toHaveLength(2);
            });

            it("should populate monitors for each site", async () => {
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;
                const monitorRepoInstance = mockMonitorRepository.mock.results[0]?.value;

                siteRepoInstance.findAll.mockResolvedValue([{ identifier: "site1", name: "Site 1" }]);

                monitorRepoInstance.findBySiteIdentifier.mockResolvedValue([
                    { id: "monitor1", type: "http", status: "up" },
                ]);

                const result = await uptimeOrchestrator.getSites();

                expect(monitorRepoInstance.findBySiteIdentifier).toHaveBeenCalledWith("site1");
                expect(result[0].monitors).toHaveLength(1);
            });
        });

        describe("addSite", () => {
            it("should add site to database", async () => {
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;
                const site = {
                    identifier: "new-site",
                    name: "New Site",
                    monitors: [],
                };

                const result = await uptimeOrchestrator.addSite(site);

                expect(siteRepoInstance.upsert).toHaveBeenCalledWith(
                    expect.objectContaining({
                        identifier: "new-site",
                        name: "New Site",
                    })
                );
                expect(result).toEqual(expect.objectContaining(site));
            });

            it("should create monitors for the site", async () => {
                const monitorRepoInstance = mockMonitorRepository.mock.results[0]?.value;
                const site = {
                    identifier: "new-site",
                    name: "New Site",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example.com",
                        },
                    ],
                };

                await uptimeOrchestrator.addSite(site);

                expect(monitorRepoInstance.create).toHaveBeenCalledWith(
                    "new-site",
                    expect.objectContaining({
                        type: "http",
                        url: "https://example.com",
                    })
                );
            });

            it("should update in-memory cache", async () => {
                const site = {
                    identifier: "new-site",
                    name: "New Site",
                    monitors: [],
                };

                await uptimeOrchestrator.addSite(site);

                const cachedSites = uptimeOrchestrator.getSitesFromCache();
                expect(cachedSites).toContainEqual(expect.objectContaining(site));
            });
        });

        describe("removeSite", () => {
            it("should remove site from database", async () => {
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;
                const monitorRepoInstance = mockMonitorRepository.mock.results[0]?.value;
                const identifier = "site-to-remove";

                // First add the site to in-memory cache so it can be removed
                const site = {
                    identifier,
                    name: "Site to Remove",
                    monitors: [],
                };
                await uptimeOrchestrator.addSite(site);

                const result = await uptimeOrchestrator.removeSite(identifier);

                expect(monitorRepoInstance.deleteBySiteIdentifierInternal).toHaveBeenCalledWith(
                    expect.anything(),
                    identifier
                );
                expect(siteRepoInstance.delete).toHaveBeenCalledWith(identifier);
                expect(result).toBe(true);
            });

            it("should remove monitors and history", async () => {
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;
                const monitorRepoInstance = mockMonitorRepository.mock.results[0]?.value;
                const identifier = "site-to-remove";

                // First add the site to in-memory cache so it can be removed
                const site = {
                    identifier,
                    name: "Site to Remove",
                    monitors: [
                        {
                            id: "monitor1",
                            siteIdentifier: identifier,
                            type: "http",
                            url: "https://example.com",
                            status: "pending",
                            history: [],
                        },
                    ],
                };
                await uptimeOrchestrator.addSite(site);

                await uptimeOrchestrator.removeSite(identifier);

                expect(monitorRepoInstance.deleteBySiteIdentifierInternal).toHaveBeenCalledWith(
                    expect.anything(),
                    identifier
                );
                expect(siteRepoInstance.delete).toHaveBeenCalledWith(identifier);
            });

            it("should return false when site does not exist", async () => {
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;
                siteRepoInstance.findByIdentifier.mockResolvedValue(null);

                const result = await uptimeOrchestrator.removeSite("non-existent");

                expect(result).toBe(false);
            });

            it("should remove from in-memory cache", async () => {
                const identifier = "site-to-remove";
                const site = { identifier, name: "Site", monitors: [] };

                // Add to cache first
                await uptimeOrchestrator.addSite(site);

                // Mock database operations
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;
                siteRepoInstance.findByIdentifier.mockResolvedValue(site);

                await uptimeOrchestrator.removeSite(identifier);

                const cachedSites = uptimeOrchestrator.getSitesFromCache();
                expect(cachedSites).not.toContainEqual(expect.objectContaining({ identifier }));
            });
        });
    });
});
