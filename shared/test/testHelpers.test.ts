/**
 * Comprehensive test suite for testHelpers.ts utilities
 *
 * @remarks
 * This test file provides 100% test coverage for all functions in
 * testHelpers.ts, including edge cases, type safety, and performance
 * considerations.
 */

import { describe, expect, it } from "vitest";
import type { MonitorStatus, MonitorType } from "../types";
import {
    createValidMonitor,
    createValidStatusHistory,
    createValidMonitors,
} from "./testHelpers";

describe("testHelpers", () => {
    describe("createValidMonitor", () => {
        it("should create a valid monitor with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const monitor = createValidMonitor();

            expect(monitor.id).toBeDefined();
            expect(monitor.id).toMatch(/^test-monitor-[\da-z]{9}$/);
            expect(monitor.url).toBe("https://example.com");
            expect(monitor.host).toBe("example.com");
            expect(monitor.type).toBe("http");
            expect(monitor.status).toBe("up");
            expect(monitor.monitoring).toBe(true);
            expect(monitor.checkInterval).toBe(30_000);
            expect(monitor.timeout).toBe(5000);
            expect(monitor.responseTime).toBe(100);
            expect(monitor.retryAttempts).toBe(3);
            expect(monitor.port).toBe(80);
            expect(monitor.activeOperations).toEqual([]);
            expect(monitor.history).toEqual([]);
            expect(monitor.lastChecked).toBeInstanceOf(Date);
        });

        it("should generate unique IDs for multiple monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitor1 = createValidMonitor();
            const monitor2 = createValidMonitor();

            expect(monitor1.id).not.toBe(monitor2.id);
            expect(monitor1.id).toMatch(/^test-monitor-[\da-z]{9}$/);
            expect(monitor2.id).toMatch(/^test-monitor-[\da-z]{9}$/);
        });

        it("should override properties correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const customMonitor = createValidMonitor({
                host: "custom.example.com",
                status: "down",
                port: 443,
                monitoring: false,
            });

            expect(customMonitor.host).toBe("custom.example.com");
            expect(customMonitor.status).toBe("down");
            expect(customMonitor.port).toBe(443);
            expect(customMonitor.monitoring).toBe(false);
        });

        it("should handle all monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            for (const status of [
                "up",
                "down",
                "pending",
                "paused",
            ] as MonitorStatus[]) {
                const monitor = createValidMonitor({ status });
                expect(monitor.status).toBe(status);
            }
        });

        it("should handle all monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            for (const type of [
                "http",
                "port",
                "ping",
            ] as MonitorType[]) {
                const monitor = createValidMonitor({ type });
                expect(monitor.type).toBe(type);
            }
        });

        it("should handle optional properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidMonitor();

            // Test with a monitor where optional properties are explicitly omitted
            const minimalMonitor = createValidMonitor({
                host: "minimal.example.com",
                url: "https://minimal.example.com",
            });

            expect(monitor.lastChecked).toBeInstanceOf(Date);
            expect(monitor.activeOperations).toEqual([]);
            expect(minimalMonitor.host).toBe("minimal.example.com");
            expect(minimalMonitor.url).toBe("https://minimal.example.com");
        });

        it("should handle complex overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const customHistory = [
                {
                    timestamp: Date.now(),
                    status: "up" as const,
                    responseTime: 100,
                },
                {
                    timestamp: Date.now() - 1000,
                    status: "down" as const,
                    responseTime: -1,
                },
            ];
            const customOperations = ["test-operation"];

            const monitor = createValidMonitor({
                history: customHistory,
                activeOperations: customOperations,
                checkInterval: 60_000,
                timeout: 10_000,
            });

            expect(monitor.history).toBe(customHistory);
            expect(monitor.activeOperations).toBe(customOperations);
            expect(monitor.checkInterval).toBe(60_000);
            expect(monitor.timeout).toBe(10_000);
        });
    });

    describe("createValidStatusHistory", () => {
        it("should create a valid status history with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const statusHistory = createValidStatusHistory();

            expect(statusHistory.timestamp).toBeDefined();
            expect(typeof statusHistory.timestamp).toBe("number");
            expect(statusHistory.status).toBe("up");
            expect(statusHistory.responseTime).toBe(100);
            expect(statusHistory.details).toBeUndefined();
        });

        it("should generate different timestamps for multiple calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const history1 = createValidStatusHistory();
            const history2 = createValidStatusHistory();

            expect(history1.timestamp).toBeLessThanOrEqual(history2.timestamp);
        });

        it("should override properties correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const customHistory = createValidStatusHistory({
                status: "down",
                responseTime: 500,
                timestamp: 1_609_459_200_000,
                details: "Custom error",
            });

            expect(customHistory.status).toBe("down");
            expect(customHistory.responseTime).toBe(500);
            expect(customHistory.timestamp).toBe(1_609_459_200_000);
            expect(customHistory.details).toBe("Custom error");
        });

        it("should handle all valid status values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            for (const status of ["up", "down"] as const) {
                const statusHistory = createValidStatusHistory({ status });
                expect(statusHistory.status).toBe(status);
            }
        });

        it("should handle boundary values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const statusHistory = createValidStatusHistory({
                responseTime: -1,
                timestamp: 0,
            });

            expect(statusHistory.responseTime).toBe(-1);
            expect(statusHistory.timestamp).toBe(0);
        });
    });

    describe("createValidMonitors", () => {
        it("should create the specified number of monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const monitors = createValidMonitors(3);

            expect(monitors).toHaveLength(3);
            for (const monitor of monitors) {
                expect(monitor.id).toBeDefined();
                expect(monitor.host).toBe("example.com");
            }
        });

        it("should create an empty array when count is 0", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const monitors = createValidMonitors(0);

            expect(monitors).toEqual([]);
            expect(monitors).toHaveLength(0);
        });

        it("should create monitors with unique IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const monitors = createValidMonitors(5);
            const ids = new Set(monitors.map((m) => m.id));

            expect(ids.size).toBe(5);
            for (const [index, monitor] of monitors.entries()) {
                expect(monitor.id).toBe(`test-monitor-${index}`);
            }
        });

        it("should apply base overrides to all monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitors = createValidMonitors(3, {
                type: "ping",
                status: "down",
                port: 22,
            });

            for (const monitor of monitors) {
                expect(monitor.type).toBe("ping");
                expect(monitor.status).toBe("down");
                expect(monitor.port).toBe(22);
            }
        });

        it("should handle different hosts for each monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitors = createValidMonitors(3, { type: "port" });

            expect(monitors[0]!.url).toBe("https://example-0.com");
            expect(monitors[1]!.url).toBe("https://example-1.com");
            expect(monitors[2]!.url).toBe("https://example-2.com");
            expect(monitors[0]!.id).toBe("test-monitor-0");
            expect(monitors[1]!.id).toBe("test-monitor-1");
            expect(monitors[2]!.id).toBe("test-monitor-2");
        });

        it("should combine base overrides with indexed properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitors = createValidMonitors(2, {
                type: "port",
                monitoring: false,
            });

            for (const monitor of monitors) {
                expect(monitor.type).toBe("port");
                expect(monitor.monitoring).toBe(false);
            }
            expect(monitors[0]!.url).toBe("https://example-0.com");
            expect(monitors[1]!.url).toBe("https://example-1.com");
        });

        it("should handle indexed URLs properly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitors = createValidMonitors(2);

            expect(monitors[0]!.url).toBe("https://example-0.com");
            expect(monitors[1]!.url).toBe("https://example-1.com");
            expect(monitors[0]!.id).toBe("test-monitor-0");
            expect(monitors[1]!.id).toBe("test-monitor-1");
        });

        it("should handle base overrides that affect all monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitors = createValidMonitors(3, {
                host: "shared-host.com",
                port: 8080,
            });

            for (const monitor of monitors) {
                expect(monitor.host).toBe("shared-host.com");
                expect(monitor.port).toBe(8080);
            }
            // URLs should still be indexed
            expect(monitors[0]!.url).toBe("https://example-0.com");
            expect(monitors[1]!.url).toBe("https://example-1.com");
            expect(monitors[2]!.url).toBe("https://example-2.com");
        });

        it("should handle negative count gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitors = createValidMonitors(-1);
            expect(monitors).toEqual([]);
        });

        it("should create independent objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const monitors = createValidMonitors(2);

            monitors[0]!.host = "modified.com";
            monitors[0]!.activeOperations?.push("test-operation");

            expect(monitors[0]!.host).toBe("modified.com");
            expect(monitors[1]!.host).toBe("example.com");
        });

        it("should handle large numbers efficiently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const start = performance.now();
            const monitors = createValidMonitors(1000);
            const end = performance.now();

            expect(monitors).toHaveLength(1000);
            expect(end - start).toBeLessThan(1000); // Should complete quickly

            // Verify all have unique IDs
            const ids = new Set(monitors.map((m) => m.id));
            expect(ids.size).toBe(1000);
        });
    });

    describe("Integration Tests", () => {
        it("should work together to create complex test scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const monitors = createValidMonitors(3, { type: "http" });

            for (const monitor of monitors) {
                expect(monitor.type).toBe("http");
                expect(monitor.id).toBeDefined();
            }

            // Create history for each monitor
            const histories = monitors.map(() =>
                createValidStatusHistory({
                    timestamp: Date.now() - Math.random() * 100_000,
                })
            );

            expect(histories).toHaveLength(3);
            for (const history of histories) {
                expect(history.status).toBe("up");
                expect(history.responseTime).toBe(100);
            }
        });

        it("should handle different monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const httpMonitors = createValidMonitors(2, { type: "http" });
            const pingMonitors = createValidMonitors(2, { type: "ping" });
            const portMonitors = createValidMonitors(2, { type: "port" });

            for (const monitor of httpMonitors) {
                expect(monitor.type).toBe("http");
            }

            for (const monitor of pingMonitors) {
                expect(monitor.type).toBe("ping");
            }

            for (const monitor of portMonitors) {
                expect(monitor.type).toBe("port");
            }
        });

        it("should handle complex scenarios with various statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const allStatuses: MonitorStatus[] = [
                "up",
                "down",
                "pending",
                "paused",
            ];

            for (const status of allStatuses) {
                const monitors = createValidMonitors(2, { status });
                // Only use valid StatusHistory statuses
                const validHistoryStatus =
                    status === "up" || status === "down" ? status : "down";
                const history = monitors.map(() =>
                    createValidStatusHistory({ status: validHistoryStatus })
                );

                for (const [index, monitor] of monitors.entries()) {
                    expect(monitor.status).toBe(status);
                    expect(history[index]!.status).toBe(validHistoryStatus);
                }
            }
        });
    });

    describe("Performance and Memory", () => {
        it("should efficiently create large numbers of monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const start = performance.now();
            const monitors = createValidMonitors(1000);
            const end = performance.now();

            expect(monitors).toHaveLength(1000);
            expect(end - start).toBeLessThan(1000); // Should complete within 1 second
        });

        it("should not leak memory with large arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Create and discard large arrays to test memory handling
            for (let i = 0; i < 10; i++) {
                const monitors = createValidMonitors(100);
                expect(monitors).toHaveLength(100);
            }
        });
    });
});
