/**
 * Tests for useSiteMonitor hook.
 * Tests monitor selection, state management, and site data handling.
 */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useSiteMonitor } from "../hooks/site/useSiteMonitor";
import { useSitesStore } from "../stores";
import { Site, Monitor } from "../types";

// Mock the store
const mockStore = {
    getSelectedMonitorId: vi.fn(),
    setSelectedMonitorId: vi.fn(),
    sites: [] as Site[],
};

vi.mock("../stores", () => ({
    useSitesStore: vi.fn(),
}));

// Get mocked function for type safety
const mockUseSitesStore = vi.mocked(useSitesStore);

describe("useSiteMonitor", () => {
    const mockSite: Site = {
        identifier: "site-1",
        name: "Test Site",
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                status: "up",
                url: "https://example.com",
                responseTime: 200,
                history: [
                    { timestamp: 1640995200000, status: "up", responseTime: 200 },
                    { timestamp: 1640991600000, status: "down", responseTime: 0 },
                ],
                monitoring: true,
            },
            {
                id: "monitor-2",
                type: "port",
                status: "down",
                host: "example.com",
                port: 80,
                responseTime: 0,
                history: [{ timestamp: 1640995200000, status: "down", responseTime: 0 }],
                monitoring: false,
            },
        ] as Monitor[],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockStore.sites = [mockSite];
        mockStore.getSelectedMonitorId.mockReturnValue("monitor-1");
        mockUseSitesStore.mockReturnValue(mockStore);
    });

    describe("Basic Functionality", () => {
        it("should return monitor data for default selection", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.latestSite).toEqual(mockSite);
            expect(result.current.selectedMonitorId).toBe("monitor-1");
            expect(result.current.monitor).toEqual(mockSite.monitors[0]);
            expect(result.current.status).toBe("up");
            expect(result.current.responseTime).toBe(200);
            expect(result.current.isMonitoring).toBe(true);
            expect(result.current.monitorIds).toEqual(["monitor-1", "monitor-2"]);
            expect(result.current.filteredHistory).toEqual(mockSite.monitors[0]?.history ?? []);
        });

        it("should use store sites when available", () => {
            const updatedSite = {
                ...mockSite,
                name: "Updated Site",
                monitors: [
                    {
                        ...mockSite.monitors[0],
                        status: "down" as const,
                        responseTime: 500,
                    },
                    mockSite.monitors[1],
                ] as Monitor[],
            };

            mockStore.sites = [updatedSite];

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.latestSite).toEqual(updatedSite);
            expect(result.current.status).toBe("down");
            expect(result.current.responseTime).toBe(500);
        });

        it("should fallback to provided site when not found in store", () => {
            mockStore.sites = []; // Empty store

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.latestSite).toEqual(mockSite);
        });
    });

    describe("Monitor Selection", () => {
        it("should use selected monitor ID from store", () => {
            mockStore.getSelectedMonitorId.mockReturnValue("monitor-2");

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.selectedMonitorId).toBe("monitor-2");
            expect(result.current.monitor).toEqual(mockSite.monitors[1]);
            expect(result.current.status).toBe("down");
            expect(result.current.isMonitoring).toBe(false);
        });

        it("should use first monitor as default when no selection", () => {
            mockStore.getSelectedMonitorId.mockReturnValue(null);

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.selectedMonitorId).toBe("monitor-1");
            expect(result.current.monitor).toEqual(mockSite.monitors[0]);
        });

        it("should handle empty monitors array", () => {
            const emptySite: Site = {
                identifier: "empty-site",
                monitors: [],
            };

            mockStore.sites = [emptySite];
            mockStore.getSelectedMonitorId.mockReturnValue(null);

            const { result } = renderHook(() => useSiteMonitor(emptySite));

            expect(result.current.selectedMonitorId).toBe("");
            expect(result.current.monitor).toBeUndefined();
            expect(result.current.status).toBe("pending");
            expect(result.current.responseTime).toBeUndefined();
            expect(result.current.monitorIds).toEqual([]);
        });

        it("should handle invalid selected monitor ID", () => {
            mockStore.getSelectedMonitorId.mockReturnValue("invalid-monitor");

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.selectedMonitorId).toBe("invalid-monitor");
            expect(result.current.monitor).toBeUndefined();
            expect(result.current.status).toBe("pending");
        });
    });

    describe("Monitor State", () => {
        it("should return pending status for undefined monitor", () => {
            mockStore.getSelectedMonitorId.mockReturnValue("non-existent");

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.status).toBe("pending");
            expect(result.current.responseTime).toBeUndefined();
        });

        it("should default monitoring to true when undefined", () => {
            const siteWithUndefinedMonitoring: Site = {
                identifier: "site-1",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        status: "up",
                        history: [],
                        // monitoring is undefined
                    } as Monitor,
                ],
            };

            mockStore.sites = [siteWithUndefinedMonitoring];

            const { result } = renderHook(() => useSiteMonitor(siteWithUndefinedMonitoring));

            expect(result.current.isMonitoring).toBe(true);
        });

        it("should respect explicit monitoring false", () => {
            mockStore.getSelectedMonitorId.mockReturnValue("monitor-2");

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.isMonitoring).toBe(false);
        });
    });

    describe("History Handling", () => {
        it("should return monitor history", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.filteredHistory).toEqual(mockSite.monitors[0]?.history ?? []);
        });

        it("should return empty array for undefined monitor", () => {
            mockStore.getSelectedMonitorId.mockReturnValue("non-existent");

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.filteredHistory).toEqual([]);
        });

        it("should return empty array for monitor without history", () => {
            const siteWithoutHistory: Site = {
                identifier: "site-1",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        status: "up",
                        // history is undefined
                    } as Monitor,
                ],
            };

            mockStore.sites = [siteWithoutHistory];

            const { result } = renderHook(() => useSiteMonitor(siteWithoutHistory));

            expect(result.current.filteredHistory).toEqual([]);
        });
    });

    describe("Monitor Selection Handler", () => {
        it("should call setSelectedMonitorId when monitor changes", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            const mockEvent = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(mockEvent);
            });

            expect(mockStore.setSelectedMonitorId).toHaveBeenCalledWith("site-1", "monitor-2");
        });

        it("should handle empty string selection", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            const mockEvent = {
                target: { value: "" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(mockEvent);
            });

            expect(mockStore.setSelectedMonitorId).toHaveBeenCalledWith("site-1", "");
        });

        it("should be memoized and not change on re-renders", () => {
            const { result, rerender } = renderHook(() => useSiteMonitor(mockSite));

            const firstHandler = result.current.handleMonitorIdChange;

            rerender();

            expect(result.current.handleMonitorIdChange).toBe(firstHandler);
        });
    });

    describe("Memoization", () => {
        it("should memoize monitor IDs", () => {
            const { result, rerender } = renderHook(() => useSiteMonitor(mockSite));

            const firstMonitorIds = result.current.monitorIds;

            rerender();

            expect(result.current.monitorIds).toBe(firstMonitorIds);
        });

        it("should recalculate when site monitors change", () => {
            const { result, rerender } = renderHook((props) => useSiteMonitor(props.site), {
                initialProps: { site: mockSite },
            });

            const firstMonitorIds = result.current.monitorIds;

            const updatedSite = {
                ...mockSite,
                monitors: [
                    ...(mockSite.monitors[0] ? [mockSite.monitors[0]] : []),
                    {
                        id: "monitor-3",
                        type: "http",
                        status: "up",
                        history: [],
                    } as Monitor,
                ],
            };

            mockStore.sites = [updatedSite];

            rerender({ site: updatedSite });

            expect(result.current.monitorIds).not.toBe(firstMonitorIds);
            expect(result.current.monitorIds).toEqual(["monitor-1", "monitor-3"]);
        });

        it("should memoize selected monitor", () => {
            const { result, rerender } = renderHook(() => useSiteMonitor(mockSite));

            const firstMonitor = result.current.monitor;

            rerender();

            expect(result.current.monitor).toBe(firstMonitor);
        });

        it("should memoize filtered history", () => {
            const { result, rerender } = renderHook(() => useSiteMonitor(mockSite));

            const firstHistory = result.current.filteredHistory;

            rerender();

            expect(result.current.filteredHistory).toBe(firstHistory);
        });
    });

    describe("Edge Cases", () => {
        it("should handle site identifier change", () => {
            const siteWithDifferentId = {
                ...mockSite,
                identifier: "different-site",
            };

            const { rerender } = renderHook((props) => useSiteMonitor(props.site), {
                initialProps: { site: mockSite },
            });

            expect(mockStore.getSelectedMonitorId).toHaveBeenCalledWith("site-1");

            rerender({ site: siteWithDifferentId });

            expect(mockStore.getSelectedMonitorId).toHaveBeenCalledWith("different-site");
        });

        it("should handle site with single monitor", () => {
            const singleMonitorSite: Site = {
                identifier: "single-site",
                monitors: mockSite.monitors[0] ? [mockSite.monitors[0]] : [],
            };

            mockStore.sites = [singleMonitorSite];
            mockStore.getSelectedMonitorId.mockReturnValue(null);

            const { result } = renderHook(() => useSiteMonitor(singleMonitorSite));

            expect(result.current.selectedMonitorId).toBe("monitor-1");
            expect(result.current.monitorIds).toEqual(["monitor-1"]);
        });

        it("should handle monitor with all optional fields undefined", () => {
            const minimalMonitor: Monitor = {
                id: "minimal-monitor",
                type: "http",
                status: "pending",
                history: [],
            };

            const minimalSite: Site = {
                identifier: "minimal-site",
                monitors: [minimalMonitor],
            };

            mockStore.sites = [minimalSite];
            mockStore.getSelectedMonitorId.mockReturnValue("minimal-monitor");

            const { result } = renderHook(() => useSiteMonitor(minimalSite));

            expect(result.current.status).toBe("pending");
            expect(result.current.responseTime).toBeUndefined();
            expect(result.current.isMonitoring).toBe(true); // defaults to true
        });
    });
});
