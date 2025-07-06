/**
 * @file Test suite for monitorLifecycle.ts
 * @description Tests for monitor lifecycle management utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
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
} as const;

// Mock MonitorScheduler
const mockMonitorScheduler = {
    startSite: vi.fn(),
    stopAll: vi.fn(),
    startMonitor: vi.fn(),
    stopMonitor: vi.fn(),
} as const;

// Mock EventEmitter
const mockEventEmitter = new EventEmitter();

// Helper function to create test monitor
const createTestMonitor = (partial: Partial<Monitor>): Monitor => ({
    id: "default-id",
    type: "http",
    status: "pending",
    history: [],
    url: "https://example.com",
    checkInterval: 5000,
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
    const sitesMap = new Map<string, Site>();
    sites.forEach((site) => sitesMap.set(site.identifier, site));
    
    return {
        sites: sitesMap,
        monitorScheduler: mockMonitorScheduler as unknown as MonitoringLifecycleConfig["monitorScheduler"],
        monitorRepository: mockMonitorRepository as unknown as MonitoringLifecycleConfig["monitorRepository"],
        eventEmitter: mockEventEmitter,
        logger: mockLogger,
        statusUpdateEvent: "status-update",
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
            const sites = [
                createTestSite({ identifier: "site-1" }),
                createTestSite({ identifier: "site-2" }),
            ];
            const config = createTestConfig(sites);
            
            const result = await startAllMonitoring(config, false);
            
            expect(result).toBe(true);
            expect(mockLogger.info).toHaveBeenCalledWith("Starting monitoring with 2 sites (per-site intervals)");
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledTimes(2);
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledWith(sites[0]);
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledWith(sites[1]);
            expect(mockLogger.info).toHaveBeenCalledWith("Started all monitoring operations");
        });

        it("should handle empty sites map", async () => {
            const config = createTestConfig([]);
            
            const result = await startAllMonitoring(config, false);
            
            expect(result).toBe(true);
            expect(mockLogger.info).toHaveBeenCalledWith("Starting monitoring with 0 sites (per-site intervals)");
            expect(mockMonitorScheduler.startSite).not.toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith("Started all monitoring operations");
        });
    });

    describe("stopAllMonitoring", () => {
        it("should stop all monitoring and return false", () => {
            const config = createTestConfig([]);
            
            const result = stopAllMonitoring(config);
            
            expect(result).toBe(false);
            expect(mockMonitorScheduler.stopAll).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith("Stopped all site monitoring intervals");
        });
    });

    describe("startMonitoringForSite", () => {
        it("should return false if site is not found", async () => {
            const config = createTestConfig([]);
            
            const result = await startMonitoringForSite(config, "nonexistent-site");
            
            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith("Site not found for monitoring: nonexistent-site");
        });

        it("should start monitoring for specific monitor", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1", checkInterval: 5000 })],
            });
            const config = createTestConfig([site]);
            
            mockMonitorRepository.update.mockResolvedValue(true);
            mockMonitorScheduler.startMonitor.mockReturnValue(true);
            
            const result = await startMonitoringForSite(config, "test-site", "monitor-1");
            
            expect(result).toBe(true);
            expect(mockMonitorRepository.update).toHaveBeenCalledWith("monitor-1", { monitoring: true });
            expect(mockMonitorScheduler.startMonitor).toHaveBeenCalledWith("test-site", site.monitors[0]);
            expect(mockLogger.debug).toHaveBeenCalledWith("Started monitoring for test-site:monitor-1");
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

        it("should handle errors when starting specific monitor", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1", checkInterval: 5000 })],
            });
            const config = createTestConfig([site]);
            
            const testError = new Error("Database error");
            mockMonitorRepository.update.mockRejectedValue(testError);
            
            const result = await startMonitoringForSite(config, "test-site", "monitor-1");
            
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalledWith("Failed to start monitoring for test-site:monitor-1", testError);
        });

        it("should start monitoring for all monitors in site when no monitorId provided", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [
                    createTestMonitor({ id: "monitor-1" }),
                    createTestMonitor({ id: "monitor-2" }),
                ],
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
                monitors: [
                    createTestMonitor({ id: "monitor-1" }),
                    createTestMonitor({ id: "monitor-2" }),
                ],
            });
            const config = createTestConfig([site]);
            
            const mockCallback = vi.fn()
                .mockResolvedValueOnce(true)  // First monitor succeeds
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

        it("should stop monitoring for specific monitor", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" })],
            });
            const config = createTestConfig([site]);
            
            mockMonitorRepository.update.mockResolvedValue(true);
            mockMonitorScheduler.stopMonitor.mockReturnValue(true);
            
            const result = await stopMonitoringForSite(config, "test-site", "monitor-1");
            
            expect(result).toBe(true);
            expect(mockMonitorRepository.update).toHaveBeenCalledWith("monitor-1", { monitoring: false });
            expect(mockMonitorScheduler.stopMonitor).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockLogger.debug).toHaveBeenCalledWith("Stopped monitoring for test-site:monitor-1");
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

        it("should handle errors when stopping specific monitor", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" })],
            });
            const config = createTestConfig([site]);
            
            const testError = new Error("Database error");
            mockMonitorRepository.update.mockRejectedValue(testError);
            
            const result = await stopMonitoringForSite(config, "test-site", "monitor-1");
            
            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalledWith("Failed to stop monitoring for test-site:monitor-1", testError);
        });

        it("should stop monitoring for all monitors in site when no monitorId provided", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [
                    createTestMonitor({ id: "monitor-1" }),
                    createTestMonitor({ id: "monitor-2" }),
                ],
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
                monitors: [
                    createTestMonitor({ id: "monitor-1" }),
                    createTestMonitor({ id: "monitor-2" }),
                ],
            });
            const config = createTestConfig([site]);
            
            const mockCallback = vi.fn()
                .mockResolvedValueOnce(true)  // First monitor succeeds
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
                monitors: [
                    createTestMonitor({ id: "monitor-1" }),
                    createTestMonitor({ id: "monitor-2" }),
                ],
            });
            const config = createTestConfig([site]);
            
            const mockCallback = vi.fn().mockResolvedValue(true); // All monitors succeed
            
            const result = await stopMonitoringForSite(config, "test-site", undefined, mockCallback);
            
            expect(result).toBe(true);
        });
    });

    describe("edge cases", () => {
        it("should handle scheduler returning false for start monitor", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1", checkInterval: 5000 })],
            });
            const config = createTestConfig([site]);
            
            mockMonitorRepository.update.mockResolvedValue(true);
            mockMonitorScheduler.startMonitor.mockReturnValue(false);
            
            const result = await startMonitoringForSite(config, "test-site", "monitor-1");
            
            expect(result).toBe(false);
            expect(mockMonitorRepository.update).toHaveBeenCalledWith("monitor-1", { monitoring: true });
            expect(mockMonitorScheduler.startMonitor).toHaveBeenCalledWith("test-site", site.monitors[0]);
            expect(mockLogger.debug).not.toHaveBeenCalledWith("Started monitoring for test-site:monitor-1");
        });

        it("should handle scheduler returning false for stop monitor", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [createTestMonitor({ id: "monitor-1" })],
            });
            const config = createTestConfig([site]);
            
            mockMonitorRepository.update.mockResolvedValue(true);
            mockMonitorScheduler.stopMonitor.mockReturnValue(false);
            
            const result = await stopMonitoringForSite(config, "test-site", "monitor-1");
            
            expect(result).toBe(false);
            expect(mockMonitorRepository.update).toHaveBeenCalledWith("monitor-1", { monitoring: false });
            expect(mockMonitorScheduler.stopMonitor).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockLogger.debug).not.toHaveBeenCalledWith("Stopped monitoring for test-site:monitor-1");
        });

        it("should handle empty monitors array", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [],
            });
            const config = createTestConfig([site]);
            
            const mockCallback = vi.fn();
            
            const result = await startMonitoringForSite(config, "test-site", undefined, mockCallback);
            
            expect(result).toBe(false); // Empty array results in false (no monitors to start)
            expect(mockCallback).not.toHaveBeenCalled();
        });

        it("should handle monitors with null/undefined IDs", async () => {
            const site = createTestSite({
                identifier: "test-site",
                monitors: [
                    { ...createTestMonitor({ id: "monitor-1" }) },
                    { ...createTestMonitor({ id: "" }) }, // Empty ID instead of undefined
                ],
            });
            const config = createTestConfig([site]);
            
            const mockCallback = vi.fn().mockResolvedValue(true);
            
            const result = await startMonitoringForSite(config, "test-site", undefined, mockCallback);
            
            expect(result).toBe(true);
            expect(mockCallback).toHaveBeenCalledTimes(1); // Only the monitor with valid ID
            expect(mockCallback).toHaveBeenCalledWith("test-site", "monitor-1");
        });
    });
});
