/**
 * Tests for UptimeOrchestrator - Basic functionality (Constructor and Initialization).
 */

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { EventEmitter } from "events";

// Mock dependencies
vi.mock("./constants", () => ({
    DEFAULT_REQUEST_TIMEOUT: 10000,
    DEFAULT_CHECK_INTERVAL: 300000,
    STATUS_UPDATE_EVENT: "status-update",
    DEFAULT_HISTORY_LIMIT: 500,
}));

vi.mock("./utils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("./utils", () => ({
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
    createMonitor: vi.fn(),
    getMonitor: vi.fn(),
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

describe("UptimeOrchestrator - Basic", () => {
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

    describe("Constructor", () => {
        it("should extend EventEmitter", () => {
            expect(uptimeOrchestrator).toBeInstanceOf(EventEmitter);
        });

        it("should initialize with default values", () => {
            expect(uptimeOrchestrator.getHistoryLimit()).toBe(500);
            expect(uptimeOrchestrator.getSitesFromCache()).toEqual([]);
        });

        it("should initialize database service singleton", () => {
            expect(mockDatabaseService.getInstance).toHaveBeenCalled();
        });

        it("should initialize all repository instances", () => {
            expect(mockSiteRepository).toHaveBeenCalled();
            expect(mockMonitorRepository).toHaveBeenCalled();
            expect(mockHistoryRepository).toHaveBeenCalled();
            expect(mockSettingsRepository).toHaveBeenCalled();
        });

        it("should initialize monitor scheduler", () => {
            expect(mockMonitorScheduler).toHaveBeenCalled();
        });

        it("should set scheduler callback", () => {
            const schedulerInstance = mockMonitorScheduler.mock.results[0]?.value;
            expect(schedulerInstance).toBeDefined();
            expect(schedulerInstance.setCheckCallback).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    describe("Initialization", () => {
        it("should initialize database on init", async () => {
            await uptimeOrchestrator.initialize();

            expect(mockDatabaseInstance.initialize).toHaveBeenCalled();
        });

        it("should load sites from database", async () => {
            await uptimeOrchestrator.initialize();

            expect(mockSiteRepositoryInstance.findAll).toHaveBeenCalled();
        });

        it("should load history limit from settings", async () => {
            mockSettingsRepositoryInstance.get.mockResolvedValue("1000");

            await uptimeOrchestrator.initialize();

            expect(mockSettingsRepositoryInstance.get).toHaveBeenCalledWith("historyLimit");
            expect(uptimeOrchestrator.getHistoryLimit()).toBe(1000);
        });

        it("should use default history limit when setting not found", async () => {
            const settingsRepoInstance = mockSettingsRepository.mock.results[0]?.value;
            expect(settingsRepoInstance).toBeDefined();
            settingsRepoInstance.get.mockResolvedValue(null);

            await uptimeOrchestrator.initialize();

            expect(uptimeOrchestrator.getHistoryLimit()).toBe(500);
        });

        it("should handle database initialization errors", async () => {
            const error = new Error("Database connection failed");
            mockDatabaseInstance.initialize.mockRejectedValue(error);

            // Since the error is caught and emitted as an event, we expect no throw
            await expect(uptimeOrchestrator.initialize()).resolves.toBeUndefined();
        });
    });
});
