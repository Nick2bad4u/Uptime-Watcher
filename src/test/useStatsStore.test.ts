/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStatsStore } from "../stores";
import type { Site } from "../types";

// Mock the utils
vi.mock("../../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

describe("useStatsStore - Uncovered Lines", () => {
    beforeEach(() => {
        // Reset the store before each test
        act(() => {
            useStatsStore.getState().resetStats();
        });
    });

    it("should handle computeStats with no sites provided", () => {
        const { result } = renderHook(() => useStatsStore());

        act(() => {
            result.current.computeStats();
        });

        // Should not crash and stats should remain at 0
        expect(result.current.totalUptime).toBe(0);
        expect(result.current.totalDowntime).toBe(0);
    });

    it("should handle computeStats with undefined sites", () => {
        const { result } = renderHook(() => useStatsStore());

        act(() => {
            result.current.computeStats(undefined);
        });

        // Should not crash and stats should remain at 0
        expect(result.current.totalUptime).toBe(0);
        expect(result.current.totalDowntime).toBe(0);
    });

    it("should compute stats from sites with up status", () => {
        const { result } = renderHook(() => useStatsStore());

        const mockSites: Site[] = [
            {
                identifier: "site1",
                name: "Site 1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60000,
                        timeout: 30000,
                        retryAttempts: 3,
                        history: [
                            {
                                details: "1",
                                timestamp: Date.now(),
                                status: "up",
                                responseTime: 200,
                            },
                            {
                                details: "2",
                                timestamp: Date.now(),
                                status: "up",
                                responseTime: 150,
                            },
                        ],
                    },
                ],
                monitoring: true,
            },
        ];

        act(() => {
            result.current.computeStats(mockSites);
        });

        // Should accumulate uptime
        expect(result.current.totalUptime).toBe(350); // 200 + 150
        expect(result.current.totalDowntime).toBe(0);
    });

    it("should compute stats from sites with down status", () => {
        const { result } = renderHook(() => useStatsStore());

        const mockSites: Site[] = [
            {
                identifier: "site1",
                name: "Site 1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "down",
                        monitoring: true,
                        checkInterval: 60000,
                        timeout: 30000,
                        retryAttempts: 3,
                        history: [
                            {
                                details: "1",
                                timestamp: Date.now(),
                                status: "down",
                                responseTime: 5000,
                            },
                            {
                                details: "2",
                                timestamp: Date.now(),
                                status: "down",
                                responseTime: 3000,
                            },
                        ],
                    },
                ],
                monitoring: true,
            },
        ];

        act(() => {
            result.current.computeStats(mockSites);
        });

        // Should accumulate downtime
        expect(result.current.totalUptime).toBe(0);
        expect(result.current.totalDowntime).toBe(8000); // 5000 + 3000
    });

    it("should compute stats from sites with mixed status", () => {
        const { result } = renderHook(() => useStatsStore());

        const mockSites: Site[] = [
            {
                identifier: "site1",
                name: "Site 1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60000,
                        timeout: 30000,
                        retryAttempts: 3,
                        history: [
                            {
                                details: "1",
                                timestamp: Date.now(),
                                status: "up",
                                responseTime: 200,
                            },
                            {
                                details: "2",
                                timestamp: Date.now(),
                                status: "down",
                                responseTime: 5000,
                            },
                            {
                                details: "3",
                                timestamp: Date.now(),
                                status: "paused",
                                responseTime: 1000,
                            },
                        ],
                    },
                ],
                monitoring: true,
            },
        ];

        act(() => {
            result.current.computeStats(mockSites);
        });

        // Should accumulate both uptime and downtime, ignoring pending
        expect(result.current.totalUptime).toBe(200);
        expect(result.current.totalDowntime).toBe(5000);
    });

    it("should set total downtime directly", () => {
        const { result } = renderHook(() => useStatsStore());

        act(() => {
            result.current.setTotalDowntime(5000);
        });

        expect(result.current.totalDowntime).toBe(5000);
        expect(result.current.totalUptime).toBe(0);
    });

    it("should set total uptime directly", () => {
        const { result } = renderHook(() => useStatsStore());

        act(() => {
            result.current.setTotalUptime(3000);
        });

        expect(result.current.totalUptime).toBe(3000);
        expect(result.current.totalDowntime).toBe(0);
    });

    it("should reset stats to zero", () => {
        const { result } = renderHook(() => useStatsStore());

        // Set some initial values
        act(() => {
            result.current.setTotalUptime(1000);
            result.current.setTotalDowntime(2000);
        });

        expect(result.current.totalUptime).toBe(1000);
        expect(result.current.totalDowntime).toBe(2000);

        // Reset
        act(() => {
            result.current.resetStats();
        });

        expect(result.current.totalUptime).toBe(0);
        expect(result.current.totalDowntime).toBe(0);
    });

    it("should handle multiple sites and monitors", () => {
        const { result } = renderHook(() => useStatsStore());

        const mockSites: Site[] = [
            {
                identifier: "site1",
                name: "Site 1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example1.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60000,
                        timeout: 30000,
                        retryAttempts: 3,
                        history: [
                            {
                                details: "1",
                                timestamp: Date.now(),
                                status: "up",
                                responseTime: 100,
                            },
                        ],
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://example1.com/api",
                        status: "down",
                        monitoring: true,
                        checkInterval: 60000,
                        timeout: 30000,
                        retryAttempts: 3,
                        history: [
                            {
                                details: "2",
                                timestamp: Date.now(),
                                status: "down",
                                responseTime: 2000,
                            },
                        ],
                    },
                ],
                monitoring: true,
            },
            {
                identifier: "site2",
                name: "Site 2",
                monitors: [
                    {
                        id: "monitor3",
                        type: "http",
                        url: "https://example2.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60000,
                        timeout: 30000,
                        retryAttempts: 3,
                        history: [
                            {
                                details: "3",
                                timestamp: Date.now(),
                                status: "up",
                                responseTime: 300,
                            },
                        ],
                    },
                ],
                monitoring: true,
            },
        ];

        act(() => {
            result.current.computeStats(mockSites);
        });

        // Should accumulate across all monitors and sites
        expect(result.current.totalUptime).toBe(400); // 100 + 300
        expect(result.current.totalDowntime).toBe(2000);
    });
});
