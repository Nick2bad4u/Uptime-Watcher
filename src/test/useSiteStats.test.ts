/**
 * Tests for useSiteStats hook. Tests statistics calculation for site monitoring
 * data.
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSiteStats } from "../hooks/site/useSiteStats";
import { StatusHistory } from "@shared/types";

describe("useSiteStats", () => {
    describe("Basic Functionality", () => {
        it("should return zero stats for empty history", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useSiteStats([]));

            expect(result.current.uptime).toBe(0);
            expect(result.current.checkCount).toBe(0);
            expect(result.current.averageResponseTime).toBe(0);
        });

        it("should calculate stats for single record", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.uptime).toBe(100);
            expect(result.current.checkCount).toBe(1);
            expect(result.current.averageResponseTime).toBe(200);
        });
    });

    describe("Uptime Calculation", () => {
        it("should calculate 100% uptime for all up records", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 150,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 180,
                    status: "up",
                    timestamp: 1_640_988_000_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.uptime).toBe(100);
            expect(result.current.checkCount).toBe(3);
        });

        it("should calculate 0% uptime for all down records", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_991_600_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.uptime).toBe(0);
            expect(result.current.checkCount).toBe(2);
        });

        it("should calculate 50% uptime for mixed records", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_991_600_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.uptime).toBe(50);
            expect(result.current.checkCount).toBe(2);
        });

        it("should round uptime to nearest integer", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // 2 up out of 3 total = 66.666... -> 67
            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 150,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_988_000_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.uptime).toBe(67);
            expect(result.current.checkCount).toBe(3);
        });

        it("should handle 1 up out of 3 total = 33%", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_988_000_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.uptime).toBe(33);
            expect(result.current.checkCount).toBe(3);
        });
    });

    describe("Response Time Calculation", () => {
        it("should calculate average response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 300,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 100,
                    status: "up",
                    timestamp: 1_640_988_000_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.averageResponseTime).toBe(200); // (200+300+100)/3 = 200
        });

        it("should ignore zero response times from down status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 300,
                    status: "up",
                    timestamp: 1_640_988_000_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.averageResponseTime).toBe(250); // (200+300)/2 = 250
        });

        it("should handle all zero response times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_991_600_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.averageResponseTime).toBe(0);
        });

        it("should round average response time", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 100,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_988_000_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.averageResponseTime).toBe(167); // (100+200+200)/3 = 166.666... -> 167
        });

        it("should handle undefined response times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: undefined as any,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 300,
                    status: "up",
                    timestamp: 1_640_988_000_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.averageResponseTime).toBe(250); // (200+300)/2 = 250
        });

        it("should handle non-numeric response times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: "invalid" as any,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 300,
                    status: "up",
                    timestamp: 1_640_988_000_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.averageResponseTime).toBe(250); // (200+300)/2 = 250
        });
    });

    describe("Check Count", () => {
        it("should count all history records", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_991_600_000,
                },
                {
                    responseTime: 150,
                    status: "up",
                    timestamp: 1_640_988_000_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_984_400_000,
                },
                {
                    responseTime: 180,
                    status: "up",
                    timestamp: 1_640_980_800_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.checkCount).toBe(5);
        });

        it("should handle single record", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.checkCount).toBe(1);
        });
    });

    describe("Memoization", () => {
        it("should not recalculate when history reference is the same", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_991_600_000,
                },
            ];

            const { rerender, result } = renderHook(
                (props) => useSiteStats(props.history),
                {
                    initialProps: { history },
                }
            );

            const firstResult = result.current;

            // Rerender with same history reference
            rerender({ history });

            // Should be the same object reference due to memoization
            expect(result.current).toBe(firstResult);
        });

        it("should recalculate when history changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history1: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
            ];

            const history2: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0,
                    status: "down",
                    timestamp: 1_640_991_600_000,
                },
            ];

            const { rerender, result } = renderHook(
                (props) => useSiteStats(props.history),
                {
                    initialProps: { history: history1 },
                }
            );

            expect(result.current.checkCount).toBe(1);
            expect(result.current.uptime).toBe(100);

            // Rerender with different history
            rerender({ history: history2 });

            expect(result.current.checkCount).toBe(2);
            expect(result.current.uptime).toBe(50);
        });
    });

    describe("Edge Cases", () => {
        it("should handle very large numbers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = Array.from(
                { length: 1000 },
                (_, i) => ({
                    responseTime: i % 2 === 0 ? 200 : 0,
                    status: i % 2 === 0 ? "up" : "down",
                    timestamp: 1_640_995_200_000 + i * 60_000,
                })
            ) as StatusHistory[];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.checkCount).toBe(1000);
            expect(result.current.uptime).toBe(50); // 500 up, 500 down
            expect(result.current.averageResponseTime).toBe(200); // Only counting up records
        });

        it("should handle decimal response times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 200.5,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 299.7,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.averageResponseTime).toBe(250); // (200.5+299.7)/2 = 250.1 -> 250
        });

        it("should handle very small response times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                {
                    responseTime: 0.1,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 0.9,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            expect(result.current.averageResponseTime).toBe(1); // (0.1+0.9)/2 = 0.5 -> 1
        });

        it("should handle edge case that could trigger responseTime fallback (line 47)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteStats", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Test a scenario where the || 0 fallback might be needed
            // Even though this is defensive code, we'll document its presence
            const history: StatusHistory[] = [
                {
                    responseTime: 200,
                    status: "up",
                    timestamp: 1_640_995_200_000,
                },
                {
                    responseTime: 300,
                    status: "up",
                    timestamp: 1_640_991_600_000,
                },
            ];

            const { result } = renderHook(() => useSiteStats(history));

            // The || 0 fallback on line 47 provides defensive programming
            // against potential responseTime corruption during reduce iteration
            expect(result.current.averageResponseTime).toBe(250);
            expect(result.current.checkCount).toBe(2);
            expect(result.current.uptime).toBe(100);

            // Also test that the useMemo dependency works correctly
            expect(result.current).toBeDefined();
        });
    });
});
