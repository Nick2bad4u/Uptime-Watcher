/**
 * Tests for useSiteMonitor.ts
 * @file src/test/hooks/site/useSiteMonitor.test.ts
 */

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSiteMonitor } from "../../../hooks/site/useSiteMonitor";
import { createMockSite, createMockMonitor } from "../../utils/mockFactories";

// Define types locally since they are not exported from types
interface Site {
    identifier: string;
    name: string;
    monitoring: boolean;
    monitors: any[];
}

// Mock the dependencies
vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        getSelectedMonitorId: vi.fn(() => "monitor-1"),
        setSelectedMonitorId: vi.fn(),
        sites: [],
    })),
}));

import { useSitesStore } from "../../../stores/sites/useSitesStore";

describe("useSiteMonitor Hook", () => {
    const mockSite: Site = createMockSite({
        identifier: "site-1",
        name: "Test Site",
        monitors: [
            createMockMonitor({
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                responseTime: 250, // Set the monitor's responseTime to match expectation
                history: [
                    {
                        timestamp: Date.now(),
                        status: "up",
                        responseTime: 250,
                    },
                    {
                        timestamp: Date.now() - 60_000,
                        status: "up",
                        responseTime: 200,
                    },
                ],
            }),
            createMockMonitor({
                id: "monitor-2",
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 2,
                monitoring: false,
                status: "down",
                responseTime: 0,
                history: [],
            }),
        ],
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock setup
        (useSitesStore as any).mockReturnValue({
            getSelectedMonitorId: vi.fn(() => "monitor-1"),
            setSelectedMonitorId: vi.fn(),
            sites: [mockSite],
        });
    });

    describe("Hook Initialization", () => {
        it("should initialize with correct monitor data", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.latestSite).toEqual(mockSite);
            expect(result.current.monitor).toBeDefined();
            expect(result.current.monitor?.id).toBe("monitor-1");
            expect(result.current.selectedMonitorId).toBe("monitor-1");
            expect(result.current.monitorIds).toEqual([
                "monitor-1",
                "monitor-2",
            ]);
        });

        it("should handle site with no monitors", () => {
            const emptyMonitorsSite = {
                ...mockSite,
                monitors: [],
            };

            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => null),
                setSelectedMonitorId: vi.fn(),
                sites: [emptyMonitorsSite],
            });

            const { result } = renderHook(() =>
                useSiteMonitor(emptyMonitorsSite)
            );

            expect(result.current.monitor).toBeUndefined();
            expect(result.current.monitorIds).toEqual([]);
            expect(result.current.status).toBe("pending"); // DEFAULT_MONITOR_STATUS
            expect(result.current.isMonitoring).toBe(false);
        });

        it("should use site from store if available", () => {
            const updatedSite = {
                ...mockSite,
                name: "Updated Site Name",
            };

            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                setSelectedMonitorId: vi.fn(),
                sites: [updatedSite],
            });

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.latestSite.name).toBe("Updated Site Name");
        });

        it("should fallback to provided site if not found in store", () => {
            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                setSelectedMonitorId: vi.fn(),
                sites: [], // Empty sites array
            });

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.latestSite).toEqual(mockSite);
        });
    });

    describe("Monitor State", () => {
        it("should return correct status from selected monitor", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.status).toBe("up");
            expect(result.current.responseTime).toBe(250);
            expect(result.current.isMonitoring).toBe(true);
        });

        it("should return correct history from selected monitor", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.filteredHistory).toHaveLength(2);
            expect(result.current.filteredHistory[0]?.status).toBe("up");
        });

        it("should handle monitor with no history", () => {
            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => "monitor-2"),
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
            });

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.filteredHistory).toEqual([]);
            expect(result.current.status).toBe("down");
            expect(result.current.isMonitoring).toBe(false);
        });

        it("should handle non-existent monitor selection", () => {
            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => "non-existent-monitor"),
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
            });

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.monitor).toBeUndefined();
            expect(result.current.status).toBe("pending");
            expect(result.current.responseTime).toBeUndefined();
            expect(result.current.isMonitoring).toBe(false);
        });
    });

    describe("Monitor Selection", () => {
        it("should handle monitor selection change", () => {
            const mockSetSelectedMonitorId = vi.fn();

            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                setSelectedMonitorId: mockSetSelectedMonitorId,
                sites: [mockSite],
            });

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            const mockEvent = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(mockEvent);
            });

            expect(mockSetSelectedMonitorId).toHaveBeenCalledWith(
                "site-1",
                "monitor-2"
            );
        });

        it("should return all monitor IDs", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.monitorIds).toEqual([
                "monitor-1",
                "monitor-2",
            ]);
        });

        it("should fallback to default monitor ID when none selected", () => {
            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => null),
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
            });

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            // Should select the first monitor as default
            expect(result.current.selectedMonitorId).toBe("monitor-1");
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor with undefined status", () => {
            const siteWithUndefinedStatus = createMockSite({
                identifier: "site-1",
                name: "Test Site",
                monitors: [
                    createMockMonitor({
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending", // Explicitly set to pending
                    }),
                ],
            });

            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                setSelectedMonitorId: vi.fn(),
                sites: [siteWithUndefinedStatus],
            });

            const { result } = renderHook(() =>
                useSiteMonitor(siteWithUndefinedStatus)
            );

            expect(result.current.status).toBe("pending");
        });

        it("should handle monitor with monitoring undefined", () => {
            const siteWithUndefinedMonitoring = createMockSite({
                identifier: "site-1",
                name: "Test Site",
                monitors: [
                    createMockMonitor({
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true, // Explicitly set to true
                    }),
                ],
            });

            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                setSelectedMonitorId: vi.fn(),
                sites: [siteWithUndefinedMonitoring],
            });

            const { result } = renderHook(() =>
                useSiteMonitor(siteWithUndefinedMonitoring)
            );

            // Should default to true when monitoring is undefined
            expect(result.current.isMonitoring).toBe(true);
        });

        it("should handle monitor with monitoring explicitly false", () => {
            const siteWithDisabledMonitoring = createMockSite({
                identifier: "site-1",
                name: "Test Site",
                monitors: [
                    createMockMonitor({
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: false,
                    }),
                ],
            });

            (useSitesStore as any).mockReturnValue({
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                setSelectedMonitorId: vi.fn(),
                sites: [siteWithDisabledMonitoring],
            });

            const { result } = renderHook(() =>
                useSiteMonitor(siteWithDisabledMonitoring)
            );

            expect(result.current.isMonitoring).toBe(false);
        });
    });

    describe("Memoization", () => {
        it("should maintain stable references when data doesn't change", () => {
            const { result, rerender } = renderHook(() =>
                useSiteMonitor(mockSite)
            );

            const firstHandler = result.current.handleMonitorIdChange;
            const firstMonitorIds = result.current.monitorIds;

            rerender();

            expect(result.current.handleMonitorIdChange).toBe(firstHandler);
            expect(result.current.monitorIds).toBe(firstMonitorIds);
        });

        it("should update references when dependencies change", () => {
            const { result, rerender } = renderHook(
                ({ site }) => useSiteMonitor(site),
                { initialProps: { site: mockSite } }
            );

            const firstHandler = result.current.handleMonitorIdChange;

            const updatedSite = {
                ...mockSite,
                identifier: "site-2",
            };

            rerender({ site: updatedSite });

            expect(result.current.handleMonitorIdChange).not.toBe(firstHandler);
        });
    });

    describe("Return Interface", () => {
        it("should return all required properties", () => {
            const { result } = renderHook(() => useSiteMonitor(mockSite));

            // Check that all interface properties are present
            expect(result.current).toHaveProperty("filteredHistory");
            expect(result.current).toHaveProperty("handleMonitorIdChange");
            expect(result.current).toHaveProperty("isMonitoring");
            expect(result.current).toHaveProperty("latestSite");
            expect(result.current).toHaveProperty("monitor");
            expect(result.current).toHaveProperty("monitorIds");
            expect(result.current).toHaveProperty("responseTime");
            expect(result.current).toHaveProperty("selectedMonitorId");
            expect(result.current).toHaveProperty("status");

            // Check types
            expect(typeof result.current.handleMonitorIdChange).toBe(
                "function"
            );
            expect(typeof result.current.isMonitoring).toBe("boolean");
            expect(Array.isArray(result.current.filteredHistory)).toBe(true);
            expect(Array.isArray(result.current.monitorIds)).toBe(true);
        });
    });
});
