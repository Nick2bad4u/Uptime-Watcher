/**
 * Test suite for useStatsStore.
 * Comprehensive tests for stats store functionality.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStatsStore } from "../stores/stats/useStatsStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import type { Site } from "../types";

// Mock the logger
vi.mock("../utils", () => ({
    logStoreAction: vi.fn(),
}));

// Mock the sites store
vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: {
        getState: vi.fn(),
    },
}));

const mockGetState = vi.mocked(useSitesStore.getState);

// Helper function to create mock sites state
const createMockSitesState = (sites: Partial<Site>[] = []) => {
    return {
        sites: sites.map(site => ({
            identifier: site.identifier ?? "test-site",
            name: site.name ?? "Test Site",
            monitors: site.monitors ?? [],
            monitoring: site.monitoring ?? false,
        })) as Site[],
        selectedMonitorIds: {},
        selectedSiteId: undefined,
        // Mock all the actions as no-ops since we only need the state
        initializeSites: vi.fn(),
        createSite: vi.fn(),
        deleteSite: vi.fn(),
        checkSiteNow: vi.fn(),
        modifySite: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        startSiteMonitorMonitoring: vi.fn(),
        stopSiteMonitorMonitoring: vi.fn(),
        addMonitorToSite: vi.fn(),
        syncSitesFromBackend: vi.fn(),
        fullSyncFromBackend: vi.fn(),
        setSites: vi.fn(),
        addSite: vi.fn(),
        removeSite: vi.fn(),
        setSelectedSite: vi.fn(),
        setSelectedMonitorId: vi.fn(),
        getSelectedMonitorId: vi.fn(),
        getSelectedSite: vi.fn(),
        subscribeToStatusUpdates: vi.fn(),
        unsubscribeFromStatusUpdates: vi.fn(),
        downloadSQLiteBackup: vi.fn(),
    };
};

describe("useStatsStore", () => {
    beforeEach(() => {
        // Reset the store before each test
        useStatsStore.setState({
            totalUptime: 0,
            totalDowntime: 0,
        });
        
        // Reset mocks
        vi.clearAllMocks();
    });

    describe("basic state management", () => {
        it("should initialize with zero values", () => {
            const { result } = renderHook(() => useStatsStore());
            
            expect(result.current.totalUptime).toBe(0);
            expect(result.current.totalDowntime).toBe(0);
        });

        it("should set total uptime", () => {
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.setTotalUptime(1000);
            });
            
            expect(result.current.totalUptime).toBe(1000);
        });

        it("should set total downtime", () => {
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.setTotalDowntime(500);
            });
            
            expect(result.current.totalDowntime).toBe(500);
        });

        it("should reset stats", () => {
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.setTotalUptime(1000);
                result.current.setTotalDowntime(500);
            });
            
            expect(result.current.totalUptime).toBe(1000);
            expect(result.current.totalDowntime).toBe(500);
            
            act(() => {
                result.current.resetStats();
            });
            
            expect(result.current.totalUptime).toBe(0);
            expect(result.current.totalDowntime).toBe(0);
        });
    });

    describe("computeStats", () => {
        it("should compute stats from empty sites", () => {
            const mockSitesState = createMockSitesState([]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.computeStats();
            });
            
            expect(result.current.totalUptime).toBe(0);
            expect(result.current.totalDowntime).toBe(0);
        });

        it("should compute stats from sites with up status", () => {
            const mockSitesState = createMockSitesState([
                {
                    identifier: "site1",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            status: "up",
                            history: [
                                { status: "up", responseTime: 100, timestamp: 1234567890 },
                                { status: "up", responseTime: 200, timestamp: 1234567891 },
                            ],
                        },
                    ],
                },
            ]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.computeStats();
            });
            
            expect(result.current.totalUptime).toBe(300);
            expect(result.current.totalDowntime).toBe(0);
        });

        it("should compute stats from sites with down status", () => {
            const mockSitesState = createMockSitesState([
                {
                    identifier: "site1",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            status: "down",
                            history: [
                                { status: "down", responseTime: 150, timestamp: 1234567890 },
                                { status: "down", responseTime: 250, timestamp: 1234567891 },
                            ],
                        },
                    ],
                },
            ]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.computeStats();
            });
            
            expect(result.current.totalUptime).toBe(0);
            expect(result.current.totalDowntime).toBe(400);
        });

        it("should compute stats from sites with mixed statuses", () => {
            const mockSitesState = createMockSitesState([
                {
                    identifier: "site1",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            status: "up",
                            history: [
                                { status: "up", responseTime: 100, timestamp: 1234567890 },
                                { status: "down", responseTime: 200, timestamp: 1234567891 },
                                { status: "up", responseTime: 300, timestamp: 1234567892 },
                            ],
                        },
                    ],
                },
                {
                    identifier: "site2",
                    monitors: [
                        {
                            id: "monitor2",
                            type: "http",
                            status: "up",
                            history: [
                                { status: "down", responseTime: 150, timestamp: 1234567890 },
                                { status: "up", responseTime: 250, timestamp: 1234567891 },
                            ],
                        },
                    ],
                },
            ]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.computeStats();
            });
            
            expect(result.current.totalUptime).toBe(650); // 100 + 300 + 250
            expect(result.current.totalDowntime).toBe(350); // 200 + 150
        });

        it("should handle history entries without responseTime", () => {
            const mockSitesState = createMockSitesState([
                {
                    identifier: "site1",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            status: "up",
                            history: [
                                { status: "up", responseTime: 0, timestamp: 1234567890 }, // No responseTime (0)
                                { status: "down", responseTime: 0, timestamp: 1234567891 }, // No responseTime (0)
                                { status: "up", responseTime: 100, timestamp: 1234567892 },
                            ],
                        },
                    ],
                },
            ]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.computeStats();
            });
            
            expect(result.current.totalUptime).toBe(100); // Only the entry with responseTime
            expect(result.current.totalDowntime).toBe(0);
        });

        it("should handle pending status entries", () => {
            const mockSitesState = createMockSitesState([
                {
                    identifier: "site1",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            status: "pending",
                            history: [
                                { status: "up", responseTime: 200, timestamp: 1234567891 },
                                { status: "down", responseTime: 300, timestamp: 1234567892 },
                            ],
                        },
                    ],
                },
            ]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.computeStats();
            });
            
            expect(result.current.totalUptime).toBe(200); // Only up status
            expect(result.current.totalDowntime).toBe(300); // Only down status
        });

        it("should handle multiple monitors per site", () => {
            const mockSitesState = createMockSitesState([
                {
                    identifier: "site1",
                    monitors: [
                        {
                            id: "monitor1",
                            type: "http",
                            status: "up",
                            history: [
                                { status: "up", responseTime: 100, timestamp: 1234567890 },
                            ],
                        },
                        {
                            id: "monitor2",
                            type: "http",
                            status: "down",
                            history: [
                                { status: "down", responseTime: 200, timestamp: 1234567890 },
                            ],
                        },
                    ],
                },
            ]);
            
            mockGetState.mockReturnValue(mockSitesState);
            
            const { result } = renderHook(() => useStatsStore());
            
            act(() => {
                result.current.computeStats();
            });
            
            expect(result.current.totalUptime).toBe(100);
            expect(result.current.totalDowntime).toBe(200);
        });
    });
});
