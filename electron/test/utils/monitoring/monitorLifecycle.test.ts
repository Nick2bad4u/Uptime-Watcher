/**
 * @file Test suite for monitorLifecycle.ts
 * @description Tests for monitor lifecycle management utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    startAllMonitoring,
    stopAllMonitoring,
    startMonitoringForSite,
    stopMonitoringForSite,
    type MonitoringLifecycleConfig,
} from "../../../utils/monitoring/monitorLifecycle";
import type { Site, Monitor } from "../../../types";

// Mock logger
const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

// Mock MonitorRepository
const mockMonitorRepository = {
    update: vi.fn(),
    updateInternal: vi.fn(),
} as const;

// Mock database object
const mockDatabase = {} as any;

// Mock DatabaseService
const mockDatabaseService = {
    executeTransaction: vi.fn(async (callback) => {
        return await callback(mockDatabase);
    }),
};

// Mock MonitorScheduler
const mockMonitorScheduler = {
    startSite: vi.fn(),
    stopAll: vi.fn(),
    startMonitor: vi.fn(),
    stopMonitor: vi.fn(),
} as const;

// Mock EventEmitter with proper TypedEventBus interface
const mockEventEmitter = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
} as any;

// Helper function to create test monitor
const createTestMonitor = (partial: Partial<Monitor>): Monitor => ({
    id: "default-id",
    type: "http",
    status: "pending",
    responseTime: 0,
    lastChecked: new Date(),
    history: [],
    url: "https://example.com",
    checkInterval: 5000,
    monitoring: false,
    timeout: 10000,
    retryAttempts: 3,
    ...partial,
});

// Helper function to create test site
const createTestSite = (partial: Partial<Site>): Site => ({
    identifier: "test-site",
    name: "Test Site",
    monitors: [createTestMonitor({ id: "monitor-1" })],
    monitoring: false,
    ...partial,
});

// Helper function to create test config
const createTestConfig = (sites: Site[] = []): MonitoringLifecycleConfig => {
    const sitesCache = {
        getAll: () => sites,
        get: (key: string) => sites.find((s) => s.identifier === key),
        set: vi.fn(),
        has: (key: string) => sites.some((s) => s.identifier === key),
        delete: vi.fn(),
        clear: vi.fn(),
        size: () => sites.length,
        invalidate: vi.fn(),
    };

    return {
        sites: sitesCache as any,
        monitorScheduler: mockMonitorScheduler as unknown as MonitoringLifecycleConfig["monitorScheduler"],
        monitorRepository: mockMonitorRepository as unknown as MonitoringLifecycleConfig["monitorRepository"],
        databaseService: mockDatabaseService as any,
        eventEmitter: mockEventEmitter,
        logger: mockLogger,
    };
};

describe("monitorLifecycle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("startAllMonitoring", () => {
        it("should return true if monitoring is already running", async () => {
            const config = createTestConfig([]);
            const result = await startAllMonitoring(config, true);

            expect(result).toBe(true);
            expect(mockLogger.debug).toHaveBeenCalledWith("Monitoring already running");
            expect(mockMonitorScheduler.startSite).not.toHaveBeenCalled();
        });

        it("should start monitoring for all sites", async () => {
            const sites = [createTestSite({ identifier: "site-1" }), createTestSite({ identifier: "site-2" })];
            const config = createTestConfig(sites);

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockLogger.info).toHaveBeenCalledWith("Starting monitoring with 2 sites (per-site intervals)");
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledTimes(2);
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledWith(sites[0]);
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledWith(sites[1]);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Started all monitoring operations and set monitors to pending"
            );
        });

        it("should handle empty sites map", async () => {
            const config = createTestConfig([]);

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockLogger.info).toHaveBeenCalledWith("Starting monitoring with 0 sites (per-site intervals)");
            expect(mockMonitorScheduler.startSite).not.toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Started all monitoring operations and set monitors to pending"
            );
        });
    });

    describe("stopAllMonitoring", () => {
        it("should stop all monitoring and return false", async () => {
            const config = createTestConfig([]);

            const result = await stopAllMonitoring(config);

            expect(result).toBe(false);
            expect(mockMonitorScheduler.stopAll).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Stopped all site monitoring intervals and set monitors to paused"
            );
        });
    });

    describe("startMonitoringForSite", () => {
        it("should return false if site is not found", async () => {
            const config = createTestConfig([]);

            const result = await startMonitoringForSite(config, "nonexistent-site");

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith("Site not found for monitoring: nonexistent-site");
        });

        it("should return false if monitor is not found", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" })],
            });
            const config = createTestConfig([site]);

            const result = await startMonitoringForSite(config, "test-site", "nonexistent-monitor");

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith("Monitor not found: test-site:nonexistent-monitor");
        });

        it("should return false if monitor has no check interval", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1", checkInterval: undefined })],
            });
            const config = createTestConfig([site]);

            const result = await startMonitoringForSite(config, "test-site", "monitor-1");

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith("Monitor test-site:monitor-1 has no check interval set");
        });

        it("should start monitoring for all monitors in site when no monitorId provided", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" }), createTestMonitor({ id: "monitor-2" })],
            });
            const config = createTestConfig([site]);

            const mockCallback = vi.fn().mockResolvedValue(true);

            const result = await startMonitoringForSite(config, "test-site", undefined, mockCallback);

            expect(result).toBe(true);
            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockCallback).toHaveBeenCalledWith("test-site", "monitor-2");
        });

        it("should use optimistic logic when starting all monitors", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" }), createTestMonitor({ id: "monitor-2" })],
            });
            const config = createTestConfig([site]);

            const mockCallback = vi
                .fn()
                .mockResolvedValueOnce(true) // First monitor succeeds
                .mockResolvedValueOnce(false); // Second monitor fails

            const result = await startMonitoringForSite(config, "test-site", undefined, mockCallback);

            expect(result).toBe(true); // Should succeed because at least one monitor started
        });

        it("should return false when starting all monitors if no callback provided", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" })],
            });
            const config = createTestConfig([site]);

            const result = await startMonitoringForSite(config, "test-site");

            expect(result).toBe(false);
        });

        it("should filter out monitors without valid IDs", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [
                    createTestMonitor({ id: "monitor-1" }),
                    createTestMonitor({ id: "" }), // Empty ID
                    createTestMonitor({ id: "monitor-2" }),
                ],
            });
            const config = createTestConfig([site]);

            const mockCallback = vi.fn().mockResolvedValue(true);

            const result = await startMonitoringForSite(config, "test-site", undefined, mockCallback);

            expect(result).toBe(true);
            expect(mockCallback).toHaveBeenCalledTimes(2); // Should only call for valid IDs
            expect(mockCallback).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockCallback).toHaveBeenCalledWith("test-site", "monitor-2");
        });
    });

    describe("stopMonitoringForSite", () => {
        it("should return false if site is not found", async () => {
            const config = createTestConfig([]);

            const result = await stopMonitoringForSite(config, "nonexistent-site");

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith("Site not found for stopping monitoring: nonexistent-site");
        });

        it("should return false if monitor is not found", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" })],
            });
            const config = createTestConfig([site]);

            const result = await stopMonitoringForSite(config, "test-site", "nonexistent-monitor");

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith("Monitor not found: test-site:nonexistent-monitor");
        });

        it("should stop monitoring for all monitors in site when no monitorId provided", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" }), createTestMonitor({ id: "monitor-2" })],
            });
            const config = createTestConfig([site]);

            const mockCallback = vi.fn().mockResolvedValue(true);

            const result = await stopMonitoringForSite(config, "test-site", undefined, mockCallback);

            expect(result).toBe(true);
            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockCallback).toHaveBeenCalledWith("test-site", "monitor-2");
        });

        it("should use pessimistic logic when stopping all monitors", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" }), createTestMonitor({ id: "monitor-2" })],
            });
            const config = createTestConfig([site]);

            const mockCallback = vi
                .fn()
                .mockResolvedValueOnce(true) // First monitor succeeds
                .mockResolvedValueOnce(false); // Second monitor fails

            const result = await stopMonitoringForSite(config, "test-site", undefined, mockCallback);

            expect(result).toBe(false); // Should fail because not all monitors stopped
        });

        it("should return false when stopping all monitors if no callback provided", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" })],
            });
            const config = createTestConfig([site]);

            const result = await stopMonitoringForSite(config, "test-site");

            expect(result).toBe(false);
        });

        it("should succeed when stopping all monitors if all succeed", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" }), createTestMonitor({ id: "monitor-2" })],
            });
            const config = createTestConfig([site]);

            const mockCallback = vi.fn().mockResolvedValue(true); // All monitors succeed

            const result = await stopMonitoringForSite(config, "test-site", undefined, mockCallback);

            expect(result).toBe(true);
        });
    });
    describe("edge cases", () => {
        it("should handle empty monitors array", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [],
            });
            const config = createTestConfig([site]);

            const result = await startMonitoringForSite(config, "test-site");

            expect(result).toBe(false); // Empty array results in false (no monitors to start)
        });
    });
});
