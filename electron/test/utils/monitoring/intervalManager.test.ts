/**
 * @file Test suite for intervalManager.ts
 * @description Tests for monitor interval management utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setDefaultMonitorIntervals } from "../../../utils/monitoring/intervalManager";
import type { Site, Monitor } from "../../../types";

// Mock logger
const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

// Mock update monitor callback
const mockUpdateMonitorCallback = vi.fn();

// Helper function to create test monitor
const createTestMonitor = (partial: Partial<Monitor>): Monitor => ({
    id: "default-id",
    type: "http",
    status: "pending",
    history: [],
    url: "https://example.com",
    ...partial,
});

describe("intervalManager", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("setDefaultMonitorIntervals", () => {
        it("should set default intervals for monitors without checkInterval", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({ 
                    id: "1", 
                    url: "https://example.com"
                    // No checkInterval
                }),
                createTestMonitor({ 
                    id: "2", 
                    url: "https://test.com", 
                    checkInterval: 10000 // Already has interval
                }),
                createTestMonitor({ 
                    id: "3", 
                    url: "https://another.com"
                    // No checkInterval
                }),
            ];

            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors,
            };

            const defaultInterval = 30000;
            mockUpdateMonitorCallback.mockResolvedValue(undefined);

            await setDefaultMonitorIntervals(site, defaultInterval, mockUpdateMonitorCallback, mockLogger);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Setting default intervals for site: test-site"
            );
            expect(mockUpdateMonitorCallback).toHaveBeenCalledTimes(2);
            expect(mockUpdateMonitorCallback).toHaveBeenCalledWith("1", { checkInterval: 30000 });
            expect(mockUpdateMonitorCallback).toHaveBeenCalledWith("3", { checkInterval: 30000 });
            expect(mockUpdateMonitorCallback).not.toHaveBeenCalledWith("2", expect.anything());
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Set default interval 30000ms for monitor: 1"
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Set default interval 30000ms for monitor: 3"
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Completed setting default intervals for site: test-site"
            );

            // Verify the monitors were updated
            expect(monitors[0].checkInterval).toBe(30000);
            expect(monitors[1].checkInterval).toBe(10000); // Should remain unchanged
            expect(monitors[2].checkInterval).toBe(30000);
        });

        it("should handle site with no monitors", async () => {
            const site: Site = {
                identifier: "empty-site",
                name: "Empty Site",
                monitors: [],
            };

            const defaultInterval = 30000;

            await setDefaultMonitorIntervals(site, defaultInterval, mockUpdateMonitorCallback, mockLogger);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Setting default intervals for site: empty-site"
            );
            expect(mockUpdateMonitorCallback).not.toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Completed setting default intervals for site: empty-site"
            );
        });

        it("should skip monitors without id", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({ 
                    id: "1", 
                    url: "https://example.com"
                    // No checkInterval
                }),
                createTestMonitor({ 
                    id: "", // Empty id
                    url: "https://test.com"
                }),
                createTestMonitor({ 
                    id: "3", 
                    url: "https://another.com"
                    // No checkInterval
                }),
            ];

            const site: Site = {
                identifier: "mixed-site",
                name: "Mixed Site",
                monitors,
            };

            const defaultInterval = 25000;
            mockUpdateMonitorCallback.mockResolvedValue(undefined);

            await setDefaultMonitorIntervals(site, defaultInterval, mockUpdateMonitorCallback, mockLogger);

            expect(mockUpdateMonitorCallback).toHaveBeenCalledTimes(2);
            expect(mockUpdateMonitorCallback).toHaveBeenCalledWith("1", { checkInterval: 25000 });
            expect(mockUpdateMonitorCallback).toHaveBeenCalledWith("3", { checkInterval: 25000 });

            expect(monitors[0].checkInterval).toBe(25000);
            expect(monitors[1].checkInterval).toBeUndefined(); // Should remain unchanged
            expect(monitors[2].checkInterval).toBe(25000);
        });

        it("should skip monitors that already have checkInterval set", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({ 
                    id: "1", 
                    url: "https://example.com", 
                    checkInterval: 5000 
                }),
                createTestMonitor({ 
                    id: "2", 
                    url: "https://test.com", 
                    checkInterval: 10000 
                }),
            ];

            const site: Site = {
                identifier: "existing-intervals-site",
                name: "Existing Intervals Site",
                monitors,
            };

            const defaultInterval = 30000;

            await setDefaultMonitorIntervals(site, defaultInterval, mockUpdateMonitorCallback, mockLogger);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Setting default intervals for site: existing-intervals-site"
            );
            expect(mockUpdateMonitorCallback).not.toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Completed setting default intervals for site: existing-intervals-site"
            );

            // Verify the monitors were not changed
            expect(monitors[0].checkInterval).toBe(5000);
            expect(monitors[1].checkInterval).toBe(10000);
        });

        it("should handle monitors with checkInterval of 0", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({ 
                    id: "1", 
                    url: "https://example.com", 
                    checkInterval: 0 
                }),
                createTestMonitor({ 
                    id: "2", 
                    url: "https://test.com"
                    // No checkInterval
                }),
            ];

            const site: Site = {
                identifier: "zero-interval-site",
                name: "Zero Interval Site",
                monitors,
            };

            const defaultInterval = 15000;
            mockUpdateMonitorCallback.mockResolvedValue(undefined);

            await setDefaultMonitorIntervals(site, defaultInterval, mockUpdateMonitorCallback, mockLogger);

            // Both monitors should be updated (0 is falsy in JavaScript)
            expect(mockUpdateMonitorCallback).toHaveBeenCalledTimes(2);
            expect(mockUpdateMonitorCallback).toHaveBeenCalledWith("1", { checkInterval: 15000 });
            expect(mockUpdateMonitorCallback).toHaveBeenCalledWith("2", { checkInterval: 15000 });

            expect(monitors[0].checkInterval).toBe(15000); // Should be updated
            expect(monitors[1].checkInterval).toBe(15000);
        });

        it("should handle update callback errors", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({ 
                    id: "1", 
                    url: "https://example.com"
                }),
                createTestMonitor({ 
                    id: "2", 
                    url: "https://test.com"
                }),
            ];

            const site: Site = {
                identifier: "error-site",
                name: "Error Site",
                monitors,
            };

            const defaultInterval = 20000;
            mockUpdateMonitorCallback
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("Database update failed"));

            await expect(setDefaultMonitorIntervals(site, defaultInterval, mockUpdateMonitorCallback, mockLogger))
                .rejects.toThrow("Database update failed");

            expect(mockUpdateMonitorCallback).toHaveBeenCalledTimes(2);
            expect(monitors[0].checkInterval).toBe(20000); // First one should be set
            expect(monitors[1].checkInterval).toBe(20000); // Second one should also be set before error
        });

        it("should handle different default interval values", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({ 
                    id: "1", 
                    url: "https://example.com"
                }),
            ];

            const site: Site = {
                identifier: "custom-interval-site",
                name: "Custom Interval Site",
                monitors,
            };

            const customInterval = 60000;
            mockUpdateMonitorCallback.mockResolvedValue(undefined);

            await setDefaultMonitorIntervals(site, customInterval, mockUpdateMonitorCallback, mockLogger);

            expect(mockUpdateMonitorCallback).toHaveBeenCalledWith("1", { checkInterval: 60000 });
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Set default interval 60000ms for monitor: 1"
            );
            expect(monitors[0].checkInterval).toBe(60000);
        });

        it("should handle empty string site identifier", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({ 
                    id: "1", 
                    url: "https://example.com"
                }),
            ];

            const site: Site = {
                identifier: "",
                name: "Empty Identifier Site",
                monitors,
            };

            const defaultInterval = 30000;
            mockUpdateMonitorCallback.mockResolvedValue(undefined);

            await setDefaultMonitorIntervals(site, defaultInterval, mockUpdateMonitorCallback, mockLogger);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Setting default intervals for site: "
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[setDefaultMonitorIntervals] Completed setting default intervals for site: "
            );
        });

        it("should handle monitors with string ids", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({ 
                    id: "123", 
                    url: "https://example.com"
                }),
            ];

            const site: Site = {
                identifier: "string-id-site",
                name: "String ID Site",
                monitors,
            };

            const defaultInterval = 30000;
            mockUpdateMonitorCallback.mockResolvedValue(undefined);

            await setDefaultMonitorIntervals(site, defaultInterval, mockUpdateMonitorCallback, mockLogger);

            expect(mockUpdateMonitorCallback).toHaveBeenCalledWith("123", { checkInterval: 30000 });
            expect(monitors[0].checkInterval).toBe(30000);
        });
    });
});
