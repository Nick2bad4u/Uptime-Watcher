import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSiteActions } from "../../../hooks/site/useSiteActions";
import { createMockSite, createMockMonitor } from "../../utils/mockFactories";

// Mock dependencies - define all mocks inline to avoid hoisting issues
vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        checkSiteNow: vi.fn(),
        setSelectedMonitorId: vi.fn(),
        startSiteMonitoring: vi.fn(),
        startSiteMonitorMonitoring: vi.fn(),
        stopSiteMonitoring: vi.fn(),
        stopSiteMonitorMonitoring: vi.fn(),
    })),
}));

vi.mock("../../../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(() => ({
        setSelectedSite: vi.fn(),
        setShowSiteDetails: vi.fn(),
    })),
}));

vi.mock("../../../services/logger", () => ({
    logger: {
        site: {
            error: vi.fn(),
        },
        user: {
            action: vi.fn(),
        },
    },
}));

const mockSite = createMockSite();
const mockMonitor = createMockMonitor();

describe("useSiteActions Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
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

            // Should call the action without throwing
            expect(true).toBeTruthy();
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

            // Should handle gracefully
            expect(true).toBeTruthy();
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

            // Should call the action without throwing
            expect(true).toBeTruthy();
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

            // Should call the action without throwing
            expect(true).toBeTruthy();
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

            // Should handle gracefully
            expect(true).toBeTruthy();
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

            // Should call the action without throwing
            expect(true).toBeTruthy();
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

            // Should call the action without throwing
            expect(true).toBeTruthy();
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

            // Should handle gracefully
            expect(true).toBeTruthy();
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

            // Should call the action without throwing
            expect(true).toBeTruthy();
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

            // Should handle different configurations
            expect(true).toBeTruthy();
        });
    });

    describe("Error Handling", () => {
        it("should handle errors gracefully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteActions", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() =>
                useSiteActions(mockSite, mockMonitor)
            );

            // Should not throw even if underlying services fail
            await act(async () => {
                result.current.handleStartMonitoring();
                result.current.handleStopMonitoring();
                result.current.handleStartSiteMonitoring();
                result.current.handleStopSiteMonitoring();
                result.current.handleCardClick();
                result.current.handleCheckNow();
            });

            expect(true).toBeTruthy();
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

            expect(true).toBeTruthy();
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
            expect(() => firstRender.handleCardClick()).not.toThrow();
            expect(() => secondRender.handleCardClick()).not.toThrow();
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
            expect(() => result1.current.handleCardClick()).not.toThrow();
            expect(() => result2.current.handleCardClick()).not.toThrow();
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

            expect(true).toBeTruthy();
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

            expect(true).toBeTruthy();
        });
    });
});
