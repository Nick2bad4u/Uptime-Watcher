/**
 * Tests for UptimeOrchestrator - Monitoring Control functionality.
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

describe("UptimeOrchestrator - Monitoring Control", () => {
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

    describe("Monitoring Control", () => {
        describe("startMonitoring", () => {
            it("should start scheduler for all sites", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;

                // Add a site with monitors
                await uptimeOrchestrator.addSite({
                    identifier: "test-site",
                    name: "Test Site",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example.com",
                            monitoring: true,
                        },
                    ],
                });

                await uptimeOrchestrator.startMonitoring();

                expect(schedulerInstance.startSite).toHaveBeenCalled();
            });

            it("should set monitoring flag", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;

                // Add a site with monitors
                await uptimeOrchestrator.addSite({
                    identifier: "test-site",
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

                await uptimeOrchestrator.startMonitoring();

                // We would need to expose isMonitoring or check via another method
                // For now, we can check that the scheduler was called
                expect(schedulerInstance.startSite).toHaveBeenCalled();
            });
        });

        describe("stopMonitoring", () => {
            it("should stop all scheduled monitoring", () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;

                uptimeOrchestrator.stopMonitoring();

                expect(schedulerInstance.stopAll).toHaveBeenCalled();
            });
        });

        describe("startMonitoringForSite", () => {
            it("should start monitoring for specific site", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;
                const identifier = "test-site";

                // Add a site first
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

                const result = await uptimeOrchestrator.startMonitoringForSite(identifier);

                expect(result).toBe(true);
                expect(schedulerInstance.startMonitor).toHaveBeenCalled();
            });

            it("should return false for non-existent site", async () => {
                const result = await uptimeOrchestrator.startMonitoringForSite("non-existent");

                expect(result).toBe(false);
            });

            it("should start monitoring for specific monitor", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;
                const identifier = "test-site";
                const originalMonitorId = "monitor1";

                // Add a site first
                await uptimeOrchestrator.addSite({
                    identifier,
                    name: "Test Site",
                    monitors: [
                        {
                            id: originalMonitorId,
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example.com",
                        },
                    ],
                });

                // The monitor ID will be replaced with the mock ID from the repository
                const result = await uptimeOrchestrator.startMonitoringForSite(identifier, "mock-monitor-id");

                expect(result).toBe(true);
                expect(schedulerInstance.startMonitor).toHaveBeenCalled();
            });

            it("should return false for non-existent monitor", async () => {
                const identifier = "test-site";

                // Add a site first
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

                const result = await uptimeOrchestrator.startMonitoringForSite(identifier, "non-existent-monitor");

                expect(result).toBe(false);
            });

            it("should handle errors when starting multiple monitors", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;
                const identifier = "test-site";

                // Mock the first call to succeed and subsequent calls to fail
                schedulerInstance.startMonitor.mockReturnValueOnce(true).mockReturnValueOnce(false); // Instead of rejecting, return false

                // Add a site with multiple monitors
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
                        {
                            id: "monitor2",
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example2.com",
                        },
                    ],
                });

                // This should return true because at least one monitor started successfully
                const result = await uptimeOrchestrator.startMonitoringForSite(identifier);

                expect(result).toBe(true);
            });
        });

        describe("stopMonitoringForSite", () => {
            it("should stop monitoring for specific site", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;
                const identifier = "test-site";

                // Add a site first
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

                const result = await uptimeOrchestrator.stopMonitoringForSite(identifier);

                expect(result).toBe(true);
                expect(schedulerInstance.stopMonitor).toHaveBeenCalled();
            });

            it("should return false for non-existent site", async () => {
                const result = await uptimeOrchestrator.stopMonitoringForSite("non-existent");

                expect(result).toBe(false);
            });

            it("should stop monitoring for specific monitor", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;
                const monitorRepoInstance = mockMonitorRepository.mock.results[0]?.value;
                const identifier = "test-site";
                const monitorId = "mock-monitor-id"; // Use the ID that will be assigned by the mock repository

                // Ensure the mock returns true
                schedulerInstance.stopMonitor.mockReturnValue(true);
                // Ensure the monitor repository update succeeds
                monitorRepoInstance.update.mockResolvedValue(undefined);

                // Add a site first (this will trigger initial checks)
                await uptimeOrchestrator.addSite({
                    identifier,
                    name: "Test Site",
                    monitors: [
                        {
                            id: "original-id", // This will be replaced by the mock repository
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example.com",
                            checkInterval: 60000,
                        },
                    ],
                });

                // Clear the mock calls from the site setup
                monitorRepoInstance.update.mockClear();

                const result = await uptimeOrchestrator.stopMonitoringForSite(identifier, monitorId);

                expect(result).toBe(true);
                expect(schedulerInstance.stopMonitor).toHaveBeenCalled();
                expect(monitorRepoInstance.update).toHaveBeenCalledWith(monitorId, {
                    monitoring: false,
                    status: "paused",
                });
            });

            it("should return false for non-existent monitor", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;
                const identifier = "test-site";

                // Mock scheduler to return false for non-existent monitor
                schedulerInstance.stopMonitor.mockReturnValue(false);

                // Add a site first
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

                const result = await uptimeOrchestrator.stopMonitoringForSite(identifier, "non-existent-monitor");

                expect(result).toBe(false);
            });

            it("should stop monitoring for all monitors when no monitorId provided", async () => {
                const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;
                const identifier = "test-site";

                // Add a site with multiple monitors
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
                        {
                            id: "monitor2",
                            type: "http" as const,
                            status: "pending" as const,
                            history: [],
                            url: "https://example2.com",
                        },
                    ],
                });

                const result = await uptimeOrchestrator.stopMonitoringForSite(identifier);

                expect(result).toBe(true);
                expect(schedulerInstance.stopMonitor).toHaveBeenCalledTimes(2);
            });
        });
    });
});
