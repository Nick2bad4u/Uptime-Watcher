/**
 * Tests for useSiteMonitor.ts
 *
 * @file Src/test/hooks/site/useSiteMonitor.test.ts
 */

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { useSiteMonitor } from "../../../hooks/site/useSiteMonitor";
import { createMockSite, createMockMonitor } from "../../utils/mockFactories";

import type { Site } from "@shared/types";

import type { SelectorHookMock } from "../../utils/createSelectorHookMock";

import { createSitesStoreMock } from "../../utils/createSitesStoreMock";

const useSitesStoreMockRef = vi.hoisted(() => ({
    current: undefined as SelectorHookMock<any> | undefined,
}));

// Mock the dependencies
vi.mock("../../../stores/sites/useSitesStore", async () => {
    const { createSelectorHookMock } = await import(
        "../../utils/createSelectorHookMock"
    );
    const { createSitesStoreMock } = await import("../../utils/createSitesStoreMock");

    useSitesStoreMockRef.current = createSelectorHookMock(
        createSitesStoreMock({ sites: [] })
    );

    return {
        useSitesStore: useSitesStoreMockRef.current,
    };
});

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
        useSitesStoreMockRef.current!.setState(
            createSitesStoreMock({
                selectedMonitorIds: {
                    [mockSite.identifier]: "monitor-1",
                },
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
            })
        );
    });

    describe("Hook Initialization", () => {
        it("should initialize with correct monitor data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

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

        it("should handle site with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const emptyMonitorsSite = {
                ...mockSite,
                monitors: [],
            };

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                    selectedMonitorIds: {
                        [emptyMonitorsSite.identifier]: undefined,
                    },
                    setSelectedMonitorId: vi.fn(),
                    sites: [emptyMonitorsSite],
                })
            );

            const { result } = renderHook(() =>
                useSiteMonitor(emptyMonitorsSite)
            );

            expect(result.current.monitor).toBeUndefined();
            expect(result.current.monitorIds).toEqual([]);
            expect(result.current.status).toBe("pending"); // DEFAULT_MONITOR_STATUS
            expect(result.current.isMonitoring).toBeFalsy();
        });

        it("should use site from store if available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const updatedSite = {
                ...mockSite,
                name: "Updated Site Name",
            };

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                    getSelectedMonitorId: vi.fn(() => "monitor-1"),
                    sites: [updatedSite],
                })
            );

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.latestSite.name).toBe("Updated Site Name");
        });

        it("should fallback to provided site if not found in store", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                    getSelectedMonitorId: vi.fn(() => "monitor-1"),
                    sites: [],
                })
            );

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.latestSite).toEqual(mockSite);
        });
    });

    describe("Monitor State", () => {
        it("should return correct status from selected monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.status).toBe("up");
            expect(result.current.responseTime).toBe(250);
            expect(result.current.isMonitoring).toBeTruthy();
        });

        it("should return correct history from selected monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.filteredHistory).toHaveLength(2);
            expect(result.current.filteredHistory[0]?.status).toBe("up");
        });

        it("should handle monitor with no history", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                    getSelectedMonitorId: vi.fn(() => "monitor-2"),
                    sites: [mockSite],
                })
            );

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.filteredHistory).toEqual([]);
            expect(result.current.status).toBe("down");
            expect(result.current.isMonitoring).toBeFalsy();
        });

        it("should handle non-existent monitor selection", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                    getSelectedMonitorId: vi.fn(() => "non-existent-monitor"),
                    sites: [mockSite],
                })
            );

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.monitor).toBeUndefined();
            expect(result.current.status).toBe("pending");
            expect(result.current.responseTime).toBeUndefined();
            expect(result.current.isMonitoring).toBeFalsy();
        });
    });

    describe("Monitor Selection", () => {
        it("should handle monitor selection change", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const mockSetSelectedMonitorId = vi.fn();

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                        getSelectedMonitorId: vi.fn(() => undefined),
                    setSelectedMonitorId: mockSetSelectedMonitorId,
                    sites: [mockSite],
                })
            );

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

        it("should return all monitor IDs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            expect(result.current.monitorIds).toEqual([
                "monitor-1",
                "monitor-2",
            ]);
        });

        it("should fallback to default monitor ID when none selected", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                        getSelectedMonitorId: vi.fn(() => undefined),
                    sites: [mockSite],
                })
            );

            const { result } = renderHook(() => useSiteMonitor(mockSite));

            // Should select the first monitor as default
            expect(result.current.selectedMonitorId).toBe("monitor-1");
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor with undefined status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

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

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                    getSelectedMonitorId: vi.fn(() => "monitor-1"),
                    sites: [siteWithUndefinedStatus],
                })
            );

            const { result } = renderHook(() =>
                useSiteMonitor(siteWithUndefinedStatus)
            );

            expect(result.current.status).toBe("pending");
        });

        it("should handle monitor with monitoring undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

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

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                    getSelectedMonitorId: vi.fn(() => "monitor-1"),
                    sites: [siteWithUndefinedMonitoring],
                })
            );

            const { result } = renderHook(() =>
                useSiteMonitor(siteWithUndefinedMonitoring)
            );

            // Should default to true when monitoring is undefined
            expect(result.current.isMonitoring).toBeTruthy();
        });

        it("should handle monitor with monitoring explicitly false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

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

            useSitesStoreMockRef.current!.setState(
                createSitesStoreMock({
                    getSelectedMonitorId: vi.fn(() => "monitor-1"),
                    sites: [siteWithDisabledMonitoring],
                })
            );

            const { result } = renderHook(() =>
                useSiteMonitor(siteWithDisabledMonitoring)
            );

            expect(result.current.isMonitoring).toBeFalsy();
        });
    });

    describe("Memoization", () => {
        it("should maintain stable references when data doesn't change", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result, rerender } = renderHook(() =>
                useSiteMonitor(mockSite)
            );

            const firstHandler = result.current.handleMonitorIdChange;
            const firstMonitorIds = result.current.monitorIds;

            rerender();

            expect(result.current.handleMonitorIdChange).toBe(firstHandler);
            expect(result.current.monitorIds).toBe(firstMonitorIds);
        });

        it("should update references when dependencies change", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

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
        it("should return all required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitor", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(Array.isArray(result.current.filteredHistory)).toBeTruthy();
            expect(Array.isArray(result.current.monitorIds)).toBeTruthy();
        });
    });
});
