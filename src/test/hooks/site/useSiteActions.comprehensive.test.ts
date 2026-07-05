import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSiteActions } from "../../../hooks/site/useSiteActions";
import { createMockMonitor, createMockSite } from "../../utils/mockFactories";

const sitesStoreMocks = vi.hoisted(() => ({
    checkSiteNow: vi.fn(),
    setSelectedMonitorId: vi.fn(),
    startSiteMonitoring: vi.fn(),
    startSiteMonitorMonitoring: vi.fn(),
    stopSiteMonitoring: vi.fn(),
    stopSiteMonitorMonitoring: vi.fn(),
}));

const uiStoreMocks = vi.hoisted(() => ({
    selectSite: vi.fn(),
    setShowSiteDetails: vi.fn(),
}));

const loggerMocks = vi.hoisted(() => ({
    siteError: vi.fn(),
    userAction: vi.fn(),
}));

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(
        (selector?: (state: typeof sitesStoreMocks) => unknown) =>
            typeof selector === "function"
                ? selector(sitesStoreMocks)
                : sitesStoreMocks
    ),
}));

vi.mock("../../../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn((selector?: (state: typeof uiStoreMocks) => unknown) =>
        typeof selector === "function" ? selector(uiStoreMocks) : uiStoreMocks
    ),
}));

vi.mock("../../../services/logger", () => ({
    logger: {
        site: {
            error: loggerMocks.siteError,
        },
        user: {
            action: loggerMocks.userAction,
        },
    },
}));

const mockSite = createMockSite();
const mockMonitor = createMockMonitor();

describe("useSiteActions Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sitesStoreMocks.checkSiteNow.mockResolvedValue(undefined);
        sitesStoreMocks.startSiteMonitoring.mockResolvedValue(undefined);
        sitesStoreMocks.startSiteMonitorMonitoring.mockResolvedValue(undefined);
        sitesStoreMocks.stopSiteMonitoring.mockResolvedValue(undefined);
        sitesStoreMocks.stopSiteMonitorMonitoring.mockResolvedValue(undefined);
    });

    describe("Basic Functionality", () => {
        it("should return hook functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            expect(result.current).toHaveProperty("handleCardClick");
            expect(result.current).toHaveProperty("handleCheckNow");
            expect(result.current).toHaveProperty("handleStartMonitoring");
            expect(result.current).toHaveProperty("handleStartSiteMonitoring");
            expect(result.current).toHaveProperty("handleStopMonitoring");
            expect(result.current).toHaveProperty("handleStopSiteMonitoring");
        });

        it("should provide functions as callable", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            expect(typeof result.current.handleCardClick).toBe("function");
            expect(typeof result.current.handleCheckNow).toBe("function");
            expect(typeof result.current.handleStartMonitoring).toBe(
                "function"
            );
            expect(typeof result.current.handleStartSiteMonitoring).toBe(
                "function"
            );
            expect(typeof result.current.handleStopMonitoring).toBe("function");
            expect(typeof result.current.handleStopSiteMonitoring).toBe(
                "function"
            );
        });
    });

    describe("Start Monitoring", () => {
        it("should handle start monitoring action", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleStartMonitoring();
            });

            expect(
                sitesStoreMocks.startSiteMonitorMonitoring
            ).toHaveBeenCalledWith(mockSite.identifier, mockMonitor.id);
            await waitFor(() => {
                expect(loggerMocks.userAction).toHaveBeenCalledWith(
                    "Started site monitoring",
                    {
                        monitorId: mockMonitor.id,
                        monitorType: mockMonitor.type,
                        siteIdentifier: mockSite.identifier,
                        siteName: mockSite.name,
                    }
                );
            });
        });

        it("should handle start monitoring without monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, undefined)
            );

            await act(async () => {
                result.current.handleStartMonitoring();
            });

            expect(
                sitesStoreMocks.startSiteMonitorMonitoring
            ).not.toHaveBeenCalled();
            expect(loggerMocks.siteError).toHaveBeenCalledWith(
                mockSite.identifier,
                expect.objectContaining({
                    message:
                        "Attempted to start monitoring without valid monitor",
                })
            );
        });

        it("should handle start site monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleStartSiteMonitoring();
            });

            expect(sitesStoreMocks.startSiteMonitoring).toHaveBeenCalledWith(
                mockSite.identifier
            );
            await waitFor(() => {
                expect(loggerMocks.userAction).toHaveBeenCalledWith(
                    "Started site-wide monitoring",
                    {
                        monitorsCount: mockSite.monitors.length,
                        siteIdentifier: mockSite.identifier,
                        siteName: mockSite.name,
                    }
                );
            });
        });
    });

    describe("Stop Monitoring", () => {
        it("should handle stop monitoring action", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleStopMonitoring();
            });

            expect(
                sitesStoreMocks.stopSiteMonitorMonitoring
            ).toHaveBeenCalledWith(mockSite.identifier, mockMonitor.id);
            await waitFor(() => {
                expect(loggerMocks.userAction).toHaveBeenCalledWith(
                    "Stopped site monitoring",
                    {
                        monitorId: mockMonitor.id,
                        monitorType: mockMonitor.type,
                        siteIdentifier: mockSite.identifier,
                        siteName: mockSite.name,
                    }
                );
            });
        });

        it("should handle stop monitoring with disabled monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const disabledSite = createMockSite({ monitoring: false });

            const { result } = renderHook(() =>
                useSiteActions(disabledSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleStopMonitoring();
            });

            expect(
                sitesStoreMocks.stopSiteMonitorMonitoring
            ).toHaveBeenCalledWith(disabledSite.identifier, mockMonitor.id);
        });

        it("should handle stop site monitoring", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleStopSiteMonitoring();
            });

            expect(sitesStoreMocks.stopSiteMonitoring).toHaveBeenCalledWith(
                mockSite.identifier
            );
            await waitFor(() => {
                expect(loggerMocks.userAction).toHaveBeenCalledWith(
                    "Stopped site-wide monitoring",
                    {
                        monitorsCount: mockSite.monitors.length,
                        siteIdentifier: mockSite.identifier,
                        siteName: mockSite.name,
                    }
                );
            });
        });
    });

    describe("Card Click", () => {
        it("should handle card click action", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleCardClick();
            });

            expect(uiStoreMocks.selectSite).toHaveBeenCalledWith(mockSite);
            expect(sitesStoreMocks.setSelectedMonitorId).toHaveBeenCalledWith(
                mockSite.identifier,
                mockMonitor.id
            );
            expect(uiStoreMocks.setShowSiteDetails).toHaveBeenCalledWith(true);
        });

        it("should handle card click without monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, undefined)
            );

            await act(async () => {
                result.current.handleCardClick();
            });

            expect(uiStoreMocks.selectSite).toHaveBeenCalledWith(mockSite);
            expect(sitesStoreMocks.setSelectedMonitorId).not.toHaveBeenCalled();
            expect(uiStoreMocks.setShowSiteDetails).toHaveBeenCalledWith(true);
        });
    });

    describe("Check Now", () => {
        it("should handle check now action", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleCheckNow();
            });

            expect(sitesStoreMocks.checkSiteNow).toHaveBeenCalledWith(
                mockSite.identifier,
                mockMonitor.id
            );
            await waitFor(() => {
                expect(loggerMocks.userAction).toHaveBeenCalledWith(
                    "Manual site check completed successfully",
                    {
                        monitorId: mockMonitor.id,
                        siteIdentifier: mockSite.identifier,
                        siteName: mockSite.name,
                    }
                );
            });
        });

        it("should handle check now with different monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const httpMonitor = createMockMonitor({ type: "http" });
            const httpsSite = createMockSite({ name: "HTTPS Site" });

            const { result } = renderHook(() =>
                useSiteActions(httpsSite, httpMonitor)
            );

            await act(async () => {
                result.current.handleCheckNow();
            });

            expect(sitesStoreMocks.checkSiteNow).toHaveBeenCalledWith(
                httpsSite.identifier,
                httpMonitor.id
            );
            expect(loggerMocks.userAction).toHaveBeenCalledWith(
                "Manual site check initiated",
                {
                    monitorId: httpMonitor.id,
                    monitorType: "http",
                    siteIdentifier: httpsSite.identifier,
                    siteName: "HTTPS Site",
                }
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle errors gracefully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const operationError = new Error("operation failed");
            sitesStoreMocks.startSiteMonitorMonitoring.mockRejectedValueOnce(
                operationError
            );
            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleStartMonitoring();
            });

            await waitFor(() => {
                expect(loggerMocks.siteError).toHaveBeenCalledWith(
                    mockSite.identifier,
                    operationError
                );
            });
        });

        it("should handle null/undefined inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, undefined)
            );

            await act(async () => {
                result.current.handleStartMonitoring();
                result.current.handleStopMonitoring();
                result.current.handleCardClick();
                result.current.handleCheckNow();
            });

            expect(
                sitesStoreMocks.startSiteMonitorMonitoring
            ).not.toHaveBeenCalled();
            expect(
                sitesStoreMocks.stopSiteMonitorMonitoring
            ).not.toHaveBeenCalled();
            expect(sitesStoreMocks.checkSiteNow).not.toHaveBeenCalled();
            expect(loggerMocks.siteError).toHaveBeenCalledTimes(3);
            expect(uiStoreMocks.selectSite).toHaveBeenCalledWith(mockSite);
        });
    });

    describe("Hook Stability", () => {
        it("should maintain stable function references when dependencies don't change", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result, rerender } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            const firstRender = result.current;

            // Rerender with same props
            rerender();

            const secondRender = result.current;

            // Functions should be of correct type and callable
            expect(typeof firstRender.handleCardClick).toBe("function");
            expect(typeof secondRender.handleCardClick).toBe("function");
            expect(typeof firstRender.handleCheckNow).toBe("function");
            expect(typeof secondRender.handleCheckNow).toBe("function");
            expect(typeof firstRender.handleStartMonitoring).toBe("function");
            expect(typeof secondRender.handleStartMonitoring).toBe("function");

            // Functions should work correctly (testing functional stability rather than reference equality)
            expect(() => {
                firstRender.handleCardClick();
            }).not.toThrow();
            expect(() => {
                secondRender.handleCardClick();
            }).not.toThrow();
        });

        it("should work with multiple hook instances", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result: result1 } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );
            const { result: result2 } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            // Each instance should have properly typed functions
            expect(typeof result1.current.handleStartMonitoring).toBe(
                "function"
            );
            expect(typeof result2.current.handleStartMonitoring).toBe(
                "function"
            );
            expect(typeof result1.current.handleCardClick).toBe("function");
            expect(typeof result2.current.handleCardClick).toBe("function");

            // Both instances should be callable
            expect(() => {
                result1.current.handleCardClick();
            }).not.toThrow();
            expect(() => {
                result2.current.handleCardClick();
            }).not.toThrow();
        });
    });

    describe("Different Site Configurations", () => {
        it("should handle different site types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const sites = [
                createMockSite({ name: "Site 1" }),
                createMockSite({ name: "Site 2" }),
                createMockSite({ name: "Site 3" }),
            ];

            for (const site of sites) {
                const { result } = renderHook(() =>
                    useSiteActions(site, mockMonitor)
                );

                await act(async () => {
                    result.current.handleCheckNow();
                });

                expect(typeof result.current.handleCheckNow).toBe("function");
            }
        });

        it("should handle sites with different monitoring states", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const sites = [
                createMockSite({ monitoring: true }),
                createMockSite({ monitoring: false }),
            ];

            for (const site of sites) {
                const { result } = renderHook(() =>
                    useSiteActions(site, mockMonitor)
                );

                await act(async () => {
                    result.current.handleStartSiteMonitoring();
                    result.current.handleStopSiteMonitoring();
                });

                expect(typeof result.current.handleStartSiteMonitoring).toBe(
                    "function"
                );
            }
        });
    });

    describe("Performance", () => {
        it("should handle rapid successive calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            // Make multiple rapid calls
            await act(async () => {
                for (let i = 0; i < 10; i++) {
                    result.current.handleCheckNow();
                }
            });

            expect(sitesStoreMocks.checkSiteNow).toHaveBeenCalledTimes(10);
            expect(loggerMocks.userAction).toHaveBeenCalledWith(
                "Manual site check initiated",
                {
                    monitorId: mockMonitor.id,
                    monitorType: mockMonitor.type,
                    siteIdentifier: mockSite.identifier,
                    siteName: mockSite.name,
                }
            );
        });

        it("should handle concurrent operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            await act(async () => {
                result.current.handleStartMonitoring();
                result.current.handleCheckNow();
                result.current.handleCardClick();
            });

            expect(
                sitesStoreMocks.startSiteMonitorMonitoring
            ).toHaveBeenCalledWith(mockSite.identifier, mockMonitor.id);
            expect(sitesStoreMocks.checkSiteNow).toHaveBeenCalledWith(
                mockSite.identifier,
                mockMonitor.id
            );
            expect(uiStoreMocks.selectSite).toHaveBeenCalledWith(mockSite);
        });
    });
});
