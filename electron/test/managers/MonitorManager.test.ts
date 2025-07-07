/**
 * Tests for MonitorManager class.
 * Tests the handleScheduledCheck method and related functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import { MonitorManager } from "../../managers/MonitorManager";
import type { Site } from "../../types";
import * as monitoringUtils from "../../utils/monitoring";

// Mock the logger
vi.mock("../../utils/logger", () => ({
    default: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    monitorLogger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock the monitoring utilities
vi.mock("../../utils/monitoring", () => ({
    startAllMonitoring: vi.fn(),
    stopAllMonitoring: vi.fn(),
    performInitialMonitorChecks: vi.fn(),
    checkMonitor: vi.fn(),
}));

describe("MonitorManager", () => {
    let monitorManager: MonitorManager;
    let mockEventEmitter: EventEmitter;
    let mockSitesCache: Map<string, Site>;

    const mockSite: Site = {
        identifier: "test-site",
        name: "Test Site",
        monitors: [
            {
                id: "test-monitor",
                type: "http",
                status: "pending",
                history: [],
                url: "https://example.com",
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockEventEmitter = new EventEmitter();
        mockSitesCache = new Map();
        mockSitesCache.set("test-site", mockSite);

        // Create a minimal mock that satisfies the interface
        const mockRepositories = {
            monitor: vi.fn(),
            history: vi.fn(),
            site: vi.fn(),
        };

        const mockDependencies = {
            eventEmitter: mockEventEmitter,
            getSitesCache: () => mockSitesCache,
            getHistoryLimit: () => 30,
            repositories: mockRepositories,
        };

        // We need to use any here to bypass the complex repository type requirements
        // This is acceptable in a test context where we're focusing on specific behavior

        monitorManager = new MonitorManager(mockDependencies as any);
    });

    describe("handleScheduledCheck", () => {
        it("should call checkMonitor when site exists in cache", async () => {
            // Mock the checkMonitor utility
            const checkMonitorSpy = vi.spyOn(monitoringUtils, "checkMonitor");
            checkMonitorSpy.mockResolvedValue({
                site: mockSite,
                previousStatus: "pending",
            });

            // Get the scheduler and call the callback directly
            // We need to access the private property for testing

            const scheduler = (monitorManager as any).monitorScheduler;
            if (scheduler && scheduler.onCheckCallback) {
                await scheduler.onCheckCallback("test-site", "test-monitor");
            }

            // Verify that checkMonitor was called
            expect(checkMonitorSpy).toHaveBeenCalled();
        });

        it("should handle case when site does not exist in cache", async () => {
            // Mock the checkMonitor utility
            const checkMonitorSpy = vi.spyOn(monitoringUtils, "checkMonitor");
            checkMonitorSpy.mockResolvedValue(undefined);

            // Clear the sites cache to simulate the site not being found
            mockSitesCache.clear();

            // Get the scheduler and call the callback directly
            // We need to access the private property for testing

            const scheduler = (monitorManager as any).monitorScheduler;
            if (scheduler && scheduler.onCheckCallback) {
                // This should cover lines 181-185 where site is undefined
                await scheduler.onCheckCallback("non-existent-site", "test-monitor");
            }

            // Verify that checkMonitor was not called since site doesn't exist
            expect(checkMonitorSpy).not.toHaveBeenCalled();
        });
    });

    describe("isMonitoringActive", () => {
        it("should return the correct monitoring status", () => {
            const result = monitorManager.isMonitoringActive();
            expect(typeof result).toBe("boolean");
        });
    });
});
