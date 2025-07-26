import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { DEFAULT_CHECK_INTERVAL } from "../../../constants";
import { MonitorScheduler } from "../../../services/monitoring/MonitorScheduler";
import { Site } from "../../../types";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";

// Mock dependencies - logger is mocked globally in setup.ts
vi.mock("../../../electronUtils");
vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    dbLogger: {
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
}));

// Unmock MonitorScheduler for this test file so we can test the real implementation
vi.unmock("../../../services/monitoring/MonitorScheduler");

describe("MonitorScheduler", () => {
    let scheduler: MonitorScheduler;
    let mockCheckCallback: Mock;

    const mockMonitor: Site["monitors"][0] = {
        id: "monitor-1",
        type: "http",
        url: "https://example.com",
        checkInterval: 60000, // 1 minute
        timeout: 5000,
        retryAttempts: 3,
        monitoring: true,
        status: "up",
        history: [],
        responseTime: 0,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Reset logger mock methods
        vi.mocked(logger.debug).mockClear();
        vi.mocked(logger.info).mockClear();
        vi.mocked(logger.warn).mockClear();
        vi.mocked(logger.error).mockClear();

        scheduler = new MonitorScheduler();
        mockCheckCallback = vi.fn().mockResolvedValue(undefined);
        (isDev as any).mockReturnValue(false);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("setCheckCallback", () => {
        it("should set the check callback function", () => {
            scheduler.setCheckCallback(mockCheckCallback);
            expect(scheduler["onCheckCallback"]).toBe(mockCheckCallback);
        });

        it("should allow setting callback multiple times", () => {
            const firstCallback = vi.fn();
            const secondCallback = vi.fn();

            scheduler.setCheckCallback(firstCallback);
            expect(scheduler["onCheckCallback"]).toBe(firstCallback);

            scheduler.setCheckCallback(secondCallback);
            expect(scheduler["onCheckCallback"]).toBe(secondCallback);
        });
    });

    describe("startMonitor", () => {
        it("should start monitoring for a valid monitor", () => {
            scheduler.setCheckCallback(mockCheckCallback);

            const result = scheduler.startMonitor("site-1", mockMonitor);

            expect(result).toBe(true);
            expect(scheduler["intervals"].has("site-1|monitor-1")).toBe(true);
        });

        it("should return false for monitor without ID", () => {
            const monitorWithoutId: Site["monitors"][0] = {
                ...mockMonitor,
                id: "", // Empty string instead of undefined
            };

            const result = scheduler.startMonitor("site-1", monitorWithoutId);

            expect(result).toBe(false);
            expect(logger.warn).toHaveBeenCalledWith(
                "[MonitorScheduler] Cannot start monitoring for monitor without ID: site-1"
            );
        });

        it("should use monitor-specific check interval", async () => {
            scheduler.setCheckCallback(mockCheckCallback);

            scheduler.startMonitor("site-1", mockMonitor);

            // Fast-forward time by the monitor's check interval
            await vi.advanceTimersByTimeAsync(mockMonitor.checkInterval);

            expect(mockCheckCallback).toHaveBeenCalledWith("site-1", "monitor-1");
        });

        it.skip("should use default check interval when monitor interval not specified", async () => {
            const monitorWithoutInterval: Site["monitors"][0] = {
                ...mockMonitor,
                checkInterval: 0, // Use 0 to indicate no interval specified
            };

            scheduler.setCheckCallback(mockCheckCallback);
            scheduler.startMonitor("site-1", monitorWithoutInterval);

            // Fast-forward time by the default check interval
            await vi.advanceTimersByTimeAsync(DEFAULT_CHECK_INTERVAL);

            expect(mockCheckCallback).toHaveBeenCalledWith("site-1", "monitor-1");
        });

        it("should stop existing interval before starting new one", () => {
            scheduler.setCheckCallback(mockCheckCallback);

            // Start monitoring first time
            scheduler.startMonitor("site-1", mockMonitor);
            const firstIntervalId = scheduler["intervals"].get("site-1|monitor-1");

            // Start monitoring again for same monitor
            scheduler.startMonitor("site-1", mockMonitor);
            const secondIntervalId = scheduler["intervals"].get("site-1|monitor-1");

            expect(firstIntervalId).not.toBe(secondIntervalId);
        });

        it("should log debug info when isDev returns true", () => {
            (isDev as any).mockReturnValue(true);
            scheduler.setCheckCallback(mockCheckCallback);

            scheduler.startMonitor("site-1", mockMonitor);

            expect(logger.debug).toHaveBeenCalledWith(
                "[MonitorScheduler] Monitor checkInterval: 60000, using: 60000ms for site-1|monitor-1"
            );
        });

        it("should handle callback errors gracefully", async () => {
            const errorCallback = vi.fn().mockRejectedValue(new Error("Callback error"));
            scheduler.setCheckCallback(errorCallback);

            scheduler.startMonitor("site-1", mockMonitor);

            // Fast-forward time to trigger the callback
            await vi.advanceTimersByTimeAsync(mockMonitor.checkInterval);

            // Verify the callback was called (the error handling is internal)
            expect(errorCallback).toHaveBeenCalledWith("site-1", "monitor-1");
        });

        it("should not execute callback if none is set", () => {
            scheduler.startMonitor("site-1", mockMonitor);

            // Fast-forward time by the monitor's check interval
            vi.advanceTimersByTime(mockMonitor.checkInterval!);

            expect(mockCheckCallback).not.toHaveBeenCalled();
        });
    });

    describe("stopMonitor", () => {
        it("should stop monitoring for a specific monitor", () => {
            scheduler.setCheckCallback(mockCheckCallback);
            scheduler.startMonitor("site-1", mockMonitor);

            expect(scheduler["intervals"].has("site-1|monitor-1")).toBe(true);

            const result = scheduler.stopMonitor("site-1", "monitor-1");

            expect(result).toBe(true);
            expect(scheduler["intervals"].has("site-1|monitor-1")).toBe(false);
        });

        it("should return false when stopping non-existent monitor", () => {
            const result = scheduler.stopMonitor("site-1", "non-existent");

            expect(result).toBe(false);
        });

        it("should log debug info when isDev returns true", () => {
            (isDev as any).mockReturnValue(true);
            scheduler.setCheckCallback(mockCheckCallback);
            scheduler.startMonitor("site-1", mockMonitor);

            scheduler.stopMonitor("site-1", "monitor-1");

            expect(logger.debug).toHaveBeenCalledWith("[MonitorScheduler] Stopped monitoring for site-1|monitor-1");
        });
    });

    describe("stopSiteMonitoring", () => {
        it("should stop all monitors for a site", () => {
            scheduler.setCheckCallback(mockCheckCallback);

            const monitor2: Site["monitors"][0] = {
                ...mockMonitor,
                id: "monitor-2",
            };

            scheduler.startMonitor("site-1", mockMonitor);
            scheduler.startMonitor("site-1", monitor2);

            expect(scheduler["intervals"].size).toBe(2);

            scheduler.stopSite("site-1");

            expect(scheduler["intervals"].size).toBe(0);
        });

        it("should stop specific monitors when provided", () => {
            scheduler.setCheckCallback(mockCheckCallback);

            const monitor2: Site["monitors"][0] = {
                ...mockMonitor,
                id: "monitor-2",
            };

            scheduler.startMonitor("site-1", mockMonitor);
            scheduler.startMonitor("site-1", monitor2);

            expect(scheduler["intervals"].size).toBe(2);

            scheduler.stopSite("site-1", [mockMonitor]);

            expect(scheduler["intervals"].size).toBe(1);
            expect(scheduler.isMonitoring("site-1", "monitor-2")).toBe(true);
        });

        it("should handle empty monitors array gracefully", () => {
            expect(() => scheduler.stopSite("site-1", [])).not.toThrow();
        });
    });

    describe("stopAll", () => {
        it("should stop all running monitors", () => {
            scheduler.setCheckCallback(mockCheckCallback);

            const monitor2: Site["monitors"][0] = {
                ...mockMonitor,
                id: "monitor-2",
            };

            scheduler.startMonitor("site-1", mockMonitor);
            scheduler.startMonitor("site-2", monitor2);

            expect(scheduler["intervals"].size).toBe(2);

            scheduler.stopAll();

            expect(scheduler["intervals"].size).toBe(0);
            expect(logger.info).toHaveBeenCalledWith("[MonitorScheduler] Stopped all monitoring intervals");
        });

        it("should handle empty intervals map gracefully", () => {
            expect(() => scheduler.stopAll()).not.toThrow();
            expect(scheduler["intervals"].size).toBe(0);
        });
    });

    describe("getActiveCount", () => {
        it("should return 0 when no monitors are active", () => {
            expect(scheduler.getActiveCount()).toBe(0);
        });

        it("should return correct count of active monitors", () => {
            scheduler.setCheckCallback(mockCheckCallback);

            const monitor2: Site["monitors"][0] = {
                ...mockMonitor,
                id: "monitor-2",
            };

            scheduler.startMonitor("site-1", mockMonitor);
            expect(scheduler.getActiveCount()).toBe(1);

            scheduler.startMonitor("site-2", monitor2);
            expect(scheduler.getActiveCount()).toBe(2);

            scheduler.stopMonitor("site-1", "monitor-1");
            expect(scheduler.getActiveCount()).toBe(1);
        });
    });

    describe("isMonitoring", () => {
        it("should return false for inactive monitor", () => {
            expect(scheduler.isMonitoring("site-1", "monitor-1")).toBe(false);
        });

        it("should return true for active monitor", () => {
            scheduler.setCheckCallback(mockCheckCallback);
            scheduler.startMonitor("site-1", mockMonitor);

            expect(scheduler.isMonitoring("site-1", "monitor-1")).toBe(true);
        });

        it("should return false after stopping monitor", () => {
            scheduler.setCheckCallback(mockCheckCallback);
            scheduler.startMonitor("site-1", mockMonitor);
            scheduler.stopMonitor("site-1", "monitor-1");

            expect(scheduler.isMonitoring("site-1", "monitor-1")).toBe(false);
        });
    });

    describe("startSiteMonitoring", () => {
        it("should start monitoring for all active monitors in a site", () => {
            const mockSite: Site = {
                identifier: "site-1",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    { ...mockMonitor, monitoring: true },
                    { ...mockMonitor, id: "monitor-2", monitoring: true },
                    { ...mockMonitor, id: "monitor-3", monitoring: false }, // Should not start
                ],
            };

            scheduler.setCheckCallback(mockCheckCallback);
            scheduler.startSite(mockSite);

            expect(scheduler.getActiveCount()).toBe(2);
            expect(scheduler.isMonitoring("site-1", "monitor-1")).toBe(true);
            expect(scheduler.isMonitoring("site-1", "monitor-2")).toBe(true);
            expect(scheduler.isMonitoring("site-1", "monitor-3")).toBe(false);
        });

        it("should skip monitors without IDs", () => {
            const monitorWithoutId = { ...mockMonitor };
            delete (monitorWithoutId as any).id;

            const mockSite: Site = {
                identifier: "site-1",
                name: "Test Site",
                monitoring: true,
                monitors: [monitorWithoutId as Site["monitors"][0]],
            };

            scheduler.setCheckCallback(mockCheckCallback);
            scheduler.startSite(mockSite);

            expect(scheduler.getActiveCount()).toBe(0);
        });
    });

    describe("restartMonitor", () => {
        it("should restart monitoring for a specific monitor", () => {
            scheduler.setCheckCallback(mockCheckCallback);
            scheduler.startMonitor("site-1", mockMonitor);

            expect(scheduler.isMonitoring("site-1", "monitor-1")).toBe(true);

            const result = scheduler.restartMonitor("site-1", mockMonitor);

            expect(result).toBe(true);
            expect(scheduler.isMonitoring("site-1", "monitor-1")).toBe(true);
        });

        it("should return false for monitor without ID", () => {
            const monitorWithoutId = { ...mockMonitor };
            delete (monitorWithoutId as any).id;

            const result = scheduler.restartMonitor("site-1", monitorWithoutId as Site["monitors"][0]);

            expect(result).toBe(false);
        });
    });

    describe("getActiveMonitors", () => {
        it("should return empty array when no monitors are active", () => {
            expect(scheduler.getActiveMonitors()).toEqual([]);
        });

        it("should return all active monitor keys", () => {
            scheduler.setCheckCallback(mockCheckCallback);

            const monitor2: Site["monitors"][0] = {
                ...mockMonitor,
                id: "monitor-2",
            };

            scheduler.startMonitor("site-1", mockMonitor);
            scheduler.startMonitor("site-2", monitor2);

            const activeMonitors = scheduler.getActiveMonitors();

            expect(activeMonitors).toContain("site-1|monitor-1");
            expect(activeMonitors).toContain("site-2|monitor-2");
            expect(activeMonitors).toHaveLength(2);
        });
    });
});
