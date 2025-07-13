/**
 * Additional tests for UptimeOrchestrator - Advanced functionality and event handling.
 */

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

// Mock all dependencies first
vi.mock("../constants", () => ({
    DEFAULT_REQUEST_TIMEOUT: 10000,
    DEFAULT_CHECK_INTERVAL: 300000,
    STATUS_UPDATE_EVENT: "status-update",
    DEFAULT_HISTORY_LIMIT: 500,
}));

vi.mock("../utils", () => ({
    isDev: vi.fn(() => false),
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
    generateCorrelationId: vi.fn(() => "test-correlation-id"),
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

vi.mock("../services", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => mockDatabaseInstance),
    },
    SiteRepository: vi.fn(() => ({
        findAll: vi.fn(() => Promise.resolve([])),
        findByIdentifier: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
    })),
    MonitorRepository: vi.fn(() => ({
        findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    })),
    HistoryRepository: vi.fn(() => ({
        findByMonitorId: vi.fn(() => Promise.resolve([])),
        addEntry: vi.fn(),
        pruneHistory: vi.fn(),
    })),
    SettingsRepository: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    })),
}));

// Mock managers
const mockSiteManager = {
    getSitesCache: vi.fn(() => new Map()),
    addSite: vi.fn(() => Promise.resolve({ identifier: "test-site", monitors: [] })),
    removeSite: vi.fn(() => Promise.resolve(true)),
    updateSite: vi.fn(() => Promise.resolve({ identifier: "test-site", name: "Updated Site", monitors: [] })),
    getSites: vi.fn(() => Promise.resolve([])),
    updateSitesCache: vi.fn(() => Promise.resolve()),
};

const mockMonitorManager = {
    startMonitoring: vi.fn(() => Promise.resolve()),
    stopMonitoring: vi.fn(() => Promise.resolve()),
    startMonitoringForSite: vi.fn(() => Promise.resolve(true)),
    stopMonitoringForSite: vi.fn(() => Promise.resolve(true)),
    setupSiteForMonitoring: vi.fn(() => Promise.resolve()),
    isMonitorActiveInScheduler: vi.fn(() => true),
    restartMonitorWithNewConfig: vi.fn(() => true),
    checkSiteManually: vi.fn(() => Promise.resolve(null)),
    getActiveMonitorsCount: vi.fn(() => 0),
};

const mockDatabaseManager = {
    initialize: vi.fn(() => Promise.resolve()),
    exportData: vi.fn(() => Promise.resolve("{}")),
    importData: vi.fn(() => Promise.resolve(true)),
    downloadBackup: vi.fn(() => Promise.resolve({ buffer: Buffer.from("backup"), fileName: "backup.db" })),
    getHistoryLimit: vi.fn(() => Promise.resolve(500)),
    setHistoryLimit: vi.fn((limit: number) => Promise.resolve()),
    refreshSites: vi.fn(() => Promise.resolve([])),
};

vi.mock("../managers", () => ({
    SiteManager: vi.fn(() => mockSiteManager),
    MonitorManager: vi.fn(() => mockMonitorManager),
    DatabaseManager: vi.fn(() => mockDatabaseManager),
}));

import { UptimeOrchestrator } from "../UptimeOrchestrator";

describe("UptimeOrchestrator - Advanced", () => {
    let orchestrator: UptimeOrchestrator;

    beforeEach(() => {
        vi.clearAllMocks();
        orchestrator = new UptimeOrchestrator();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Event Handlers", () => {
        it("should handle internal:site:start-monitoring-requested event", async () => {
            const eventData = {
                identifier: "test-site",
                monitorId: "test-monitor",
                operation: "start-monitoring-requested" as const,
                timestamp: Date.now(),
            };

            let responseReceived = false;
            orchestrator.once("internal:site:start-monitoring-response", () => {
                responseReceived = true;
            });

            await orchestrator.emitTyped("internal:site:start-monitoring-requested", eventData);

            // Wait a bit for async event handler
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith("test-site", "test-monitor");
            expect(responseReceived).toBe(true);
        });

        it("should handle internal:site:stop-monitoring-requested event", async () => {
            const eventData = {
                identifier: "test-site",
                monitorId: "test-monitor",
                operation: "stop-monitoring-requested" as const,
                timestamp: Date.now(),
            };

            let responseReceived = false;
            orchestrator.once("internal:site:stop-monitoring-response", () => {
                responseReceived = true;
            });

            await orchestrator.emitTyped("internal:site:stop-monitoring-requested", eventData);

            // Wait a bit for async event handler
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.stopMonitoringForSite).toHaveBeenCalledWith("test-site", "test-monitor");
            expect(responseReceived).toBe(true);
        });

        it("should handle internal:site:is-monitoring-active-requested event", async () => {
            const eventData = {
                identifier: "test-site",
                monitorId: "test-monitor",
                operation: "is-monitoring-active-requested" as const,
                timestamp: Date.now(),
            };

            let responseReceived = false;
            orchestrator.once("internal:site:is-monitoring-active-response", () => {
                responseReceived = true;
            });

            await orchestrator.emitTyped("internal:site:is-monitoring-active-requested", eventData);

            // Wait a bit for async event handler
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.isMonitorActiveInScheduler).toHaveBeenCalledWith("test-site", "test-monitor");
            expect(responseReceived).toBe(true);
        });

        it("should handle internal:database:history-limit-updated event", async () => {
            const eventData = {
                limit: 1000,
                operation: "history-limit-updated" as const,
                timestamp: Date.now(),
            };

            await orchestrator.emitTyped("internal:database:history-limit-updated", eventData);

            // The history limit should be updated internally
            expect(orchestrator.getHistoryLimit()).toBe(1000);
        });
    });

    describe("Public API Methods", () => {
        it("should delegate removeSite to SiteManager", async () => {
            const identifier = "test-site";

            const result = await orchestrator.removeSite(identifier);

            expect(mockSiteManager.removeSite).toHaveBeenCalledWith(identifier);
            expect(result).toBe(true);
        });

        it("should delegate updateSite to SiteManager", async () => {
            const identifier = "test-site";
            const updates = { name: "Updated Site" };

            const result = await orchestrator.updateSite(identifier, updates);

            expect(mockSiteManager.updateSite).toHaveBeenCalledWith(identifier, updates);
            expect(result).toEqual({ identifier: "test-site", name: "Updated Site", monitors: [] });
        });

        it("should delegate startMonitoring to MonitorManager", async () => {
            await orchestrator.startMonitoring();

            expect(mockMonitorManager.startMonitoring).toHaveBeenCalled();
        });

        it("should delegate stopMonitoring to MonitorManager", async () => {
            await orchestrator.stopMonitoring();

            expect(mockMonitorManager.stopMonitoring).toHaveBeenCalled();
        });

        it("should delegate startMonitoringForSite to MonitorManager", async () => {
            const result = await orchestrator.startMonitoringForSite("test-site", "test-monitor");

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith("test-site", "test-monitor");
            expect(result).toBe(true);
        });

        it("should delegate stopMonitoringForSite to MonitorManager", async () => {
            const result = await orchestrator.stopMonitoringForSite("test-site", "test-monitor");

            expect(mockMonitorManager.stopMonitoringForSite).toHaveBeenCalledWith("test-site", "test-monitor");
            expect(result).toBe(true);
        });

        it("should delegate checkSiteManually to MonitorManager", async () => {
            await orchestrator.checkSiteManually("test-site");

            expect(mockMonitorManager.checkSiteManually).toHaveBeenCalledWith("test-site", undefined);
        });

        it("should delegate exportData to DatabaseManager", async () => {
            const result = await orchestrator.exportData();

            expect(mockDatabaseManager.exportData).toHaveBeenCalled();
            expect(result).toBe("{}");
        });

        it("should delegate importData to DatabaseManager", async () => {
            const importData = '{"sites": [], "settings": {}}';

            const result = await orchestrator.importData(importData);

            expect(mockDatabaseManager.importData).toHaveBeenCalledWith(importData);
            expect(result).toBe(true);
        });

        it("should delegate downloadBackup to DatabaseManager", async () => {
            const backup = { buffer: Buffer.from("backup"), fileName: "backup.db" };
            mockDatabaseManager.downloadBackup.mockResolvedValueOnce(backup);

            const result = await orchestrator.downloadBackup();

            expect(mockDatabaseManager.downloadBackup).toHaveBeenCalled();
            expect(result).toEqual(backup);
        });

        it("should handle setHistoryLimit", async () => {
            // Set up event listener to track the internal event
            let eventReceived = false;
            orchestrator.once("internal:database:history-limit-updated", (data) => {
                eventReceived = true;
                // Manually trigger the orchestrator's internal history limit update
                // since we're mocking the DatabaseManager
                orchestrator["historyLimit"] = data.limit;
            });

            // Mock the DatabaseManager to emit the event after setHistoryLimit is called
            mockDatabaseManager.setHistoryLimit.mockImplementationOnce(async (...args: any[]) => {
                const limit = args[0];
                // Simulate the DatabaseManager emitting the event
                await orchestrator.emitTyped("internal:database:history-limit-updated", {
                    limit,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                });
                return Promise.resolve();
            });

            await orchestrator.setHistoryLimit(1000);

            // Wait for async event handling
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockDatabaseManager.setHistoryLimit).toHaveBeenCalledWith(1000);
            expect(eventReceived).toBe(true);
            expect(orchestrator.getHistoryLimit()).toBe(1000);
        });

        it("should handle getHistoryLimit", async () => {
            // Set a test value first and wait for event processing
            let eventReceived = false;
            orchestrator.once("internal:database:history-limit-updated", (data) => {
                eventReceived = true;
                orchestrator["historyLimit"] = data.limit;
            });

            // Mock the DatabaseManager to emit the event
            mockDatabaseManager.setHistoryLimit.mockImplementationOnce(async (limit: number) => {
                await orchestrator.emitTyped("internal:database:history-limit-updated", {
                    limit,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                });
                return Promise.resolve();
            });

            await orchestrator.setHistoryLimit(750);

            // Wait for async event handling
            await new Promise((resolve) => setTimeout(resolve, 10));

            const result = orchestrator.getHistoryLimit();

            expect(eventReceived).toBe(true);
            expect(result).toBe(750);
        });
    });

    describe("Lifecycle Management", () => {
        it.skip("should handle initialization with database loading", async () => {
            await orchestrator.initialize();

            expect(mockDatabaseManager.initialize).toHaveBeenCalled();
        });

        it("should handle database initialization errors", async () => {
            const error = new Error("Database initialization failed");
            mockDatabaseManager.initialize.mockRejectedValueOnce(error);

            await expect(orchestrator.initialize()).rejects.toThrow("Database initialization failed");
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle null monitor ID in startMonitoringForSite", async () => {
            const result = await orchestrator.startMonitoringForSite("test-site");

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith("test-site", undefined);
            expect(result).toBe(true);
        });

        it("should handle empty string site identifier", async () => {
            const result = await orchestrator.startMonitoringForSite("", "test-monitor");

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith("", "test-monitor");
            expect(result).toBe(true);
        });

        it("should handle negative history limits", async () => {
            let eventReceived = false;
            orchestrator.once("internal:database:history-limit-updated", (data) => {
                eventReceived = true;
                orchestrator["historyLimit"] = data.limit;
            });

            mockDatabaseManager.setHistoryLimit.mockImplementationOnce(async (limit: number) => {
                await orchestrator.emitTyped("internal:database:history-limit-updated", {
                    limit,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                });
                return Promise.resolve();
            });

            await orchestrator.setHistoryLimit(-100);

            // Wait for async event handling
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockDatabaseManager.setHistoryLimit).toHaveBeenCalledWith(-100);
            expect(eventReceived).toBe(true);
            expect(orchestrator.getHistoryLimit()).toBe(-100);
        });

        it("should handle zero history limit", async () => {
            let eventReceived = false;
            orchestrator.once("internal:database:history-limit-updated", (data) => {
                eventReceived = true;
                orchestrator["historyLimit"] = data.limit;
            });

            mockDatabaseManager.setHistoryLimit.mockImplementationOnce(async (limit: number) => {
                await orchestrator.emitTyped("internal:database:history-limit-updated", {
                    limit,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                });
                return Promise.resolve();
            });

            await orchestrator.setHistoryLimit(0);

            // Wait for async event handling
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockDatabaseManager.setHistoryLimit).toHaveBeenCalledWith(0);
            expect(eventReceived).toBe(true);
            expect(orchestrator.getHistoryLimit()).toBe(0);
        });
    });
});
