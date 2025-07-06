/**
 * Tests for UptimeOrchestrator - Manual Checks functionality.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    executeTransaction: vi.fn(async (callback) => await callback()),
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

describe("UptimeOrchestrator - Manual Checks", () => {
    let uptimeOrchestrator: any;

    // Mock data
    const mockCheckResult = {
        status: "up" as const,
        responseTime: 150,
        timestamp: Date.now(),
        details: "200",
        error: undefined,
    };

    beforeEach(async () => {
        resetAllMocks();
        uptimeOrchestrator = await createUptimeOrchestrator();
    });

    afterEach(() => {
        if (uptimeOrchestrator) {
            uptimeOrchestrator.removeAllListeners();
        }
    });

    describe("Manual Checks", () => {
        describe("checkSiteManually", () => {
            it("should perform manual check for site", async () => {
                const identifier = "test-site";
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;
                const site = {
                    identifier,
                    name: "Test Site",
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

                // Add a site with monitor
                await uptimeOrchestrator.addSite(site);

                // Mock the site repository to return the site with updated data
                siteRepoInstance.getByIdentifier.mockResolvedValue(site);

                // Mock monitor factory response
                const mockCheckFn = vi.fn().mockResolvedValue(mockCheckResult);
                mockMonitorFactory.getMonitor.mockReturnValue({
                    check: mockCheckFn,
                });

                const result = await uptimeOrchestrator.checkSiteManually(identifier);

                expect(result).toBeDefined();
                expect(result?.site.identifier).toBe(identifier);
            });

            it("should throw error for non-existent site", async () => {
                await expect(uptimeOrchestrator.checkSiteManually("non-existent")).rejects.toThrow(
                    "Site not found: non-existent"
                );
            });

            it("should throw error when no monitors found", async () => {
                const identifier = "test-site";

                // Add a site without monitors
                await uptimeOrchestrator.addSite({
                    identifier,
                    name: "Test Site",
                    monitors: [],
                });

                await expect(uptimeOrchestrator.checkSiteManually(identifier)).rejects.toThrow(
                    "No monitors found for site test-site"
                );
            });

            it("should throw error for invalid monitor ID", async () => {
                const identifier = "test-site";

                // Add a site with monitors
                await uptimeOrchestrator.addSite({
                    identifier,
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example.com",
                        },
                    ],
                });

                await expect(uptimeOrchestrator.checkSiteManually(identifier, "invalid-monitor")).rejects.toThrow(
                    "Monitor with ID invalid-monitor not found for site test-site"
                );
            });

            it("should emit status-update event", async () => {
                const identifier = "test-site";
                const eventListener = vi.fn();
                const siteRepoInstance = mockSiteRepository.mock.results[0]?.value;

                uptimeOrchestrator.on("status-update", eventListener);

                // Add a site with monitor
                const site = {
                    identifier,
                    name: "Test Site",
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

                // Mock the site repository to return the site with updated data
                siteRepoInstance.getByIdentifier.mockResolvedValue(site);

                await uptimeOrchestrator.checkSiteManually(identifier);

                expect(eventListener).toHaveBeenCalled();
            });

            it("should use specific monitor ID when provided", async () => {
                const identifier = "test-site";

                // Add a site with multiple monitors
                const site = {
                    identifier,
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example.com",
                        },
                        {
                            id: "monitor2",
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example2.com",
                        },
                    ],
                };

                await uptimeOrchestrator.addSite(site);

                // After adding the site, all monitor IDs will be replaced with mock IDs
                // We need to use the mock ID to test the specific monitor
                const result = await uptimeOrchestrator.checkSiteManually(identifier, "mock-monitor-id");

                expect(result).toBeDefined();
            });
        });
    });
});
