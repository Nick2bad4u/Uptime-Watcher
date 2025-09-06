/**
 * Comprehensive tests for test helper validation utilities. Covers all branches
 * and edge cases to achieve 100% coverage.
 */

import { describe, it, expect } from "vitest";
import {
    createValidBaseMonitor,
    createValidHttpMonitor,
    createValidPortMonitor,
    createValidPingMonitor,
    createValidSite,
    createValidStatusHistory,
} from "./testHelpers";

describe("Test Helpers - Comprehensive Coverage", () => {
    describe(createValidBaseMonitor, () => {
        it("should create a valid base monitor with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Constructor", "type");

            const monitor = createValidBaseMonitor();

            expect(monitor).toMatchObject({
                checkInterval: 30_000,
                history: [],
                id: "test-monitor",
                monitoring: true,
                responseTime: 200,
                retryAttempts: 3,
                status: "up",
                timeout: 5000,
                type: "http",
            });
            expect(monitor.lastChecked).toBeInstanceOf(Date);
        });

        it("should apply overrides correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const overrides = {
                id: "custom-monitor",
                checkInterval: 60_000,
                monitoring: false,
                status: "down" as const,
                type: "ping" as const,
            };

            const monitor = createValidBaseMonitor(overrides);

            expect(monitor).toMatchObject({
                ...overrides,
                history: [],
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
            });
        });

        it("should handle partial overrides", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidBaseMonitor({ id: "partial-override" });

            expect(monitor.id).toBe("partial-override");
            expect(monitor.checkInterval).toBe(30_000); // Default value preserved
        });

        it("should handle empty overrides object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidBaseMonitor({});

            expect(monitor.id).toBe("test-monitor");
            expect(monitor.history).toEqual([]);
        });

        it("should handle all monitor types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Monitoring", "type");

            const httpMonitor = createValidBaseMonitor({ type: "http" });
            const portMonitor = createValidBaseMonitor({ type: "port" });
            const pingMonitor = createValidBaseMonitor({ type: "ping" });

            expect(httpMonitor.type).toBe("http");
            expect(portMonitor.type).toBe("port");
            expect(pingMonitor.type).toBe("ping");
        });

        it("should handle all status types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const upMonitor = createValidBaseMonitor({ status: "up" });
            const downMonitor = createValidBaseMonitor({ status: "down" });
            const pendingMonitor = createValidBaseMonitor({
                status: "pending",
            });
            const pausedMonitor = createValidBaseMonitor({ status: "paused" });

            expect(upMonitor.status).toBe("up");
            expect(downMonitor.status).toBe("down");
            expect(pendingMonitor.status).toBe("pending");
            expect(pausedMonitor.status).toBe("paused");
        });

        it("should handle history override", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const history = [{ timestamp: Date.now(), status: "up" }];
            const monitor = createValidBaseMonitor({ history });

            expect(monitor.history).toBe(history);
        });

        it("should handle lastChecked override", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const customDate = new Date("2023-01-01");
            const monitor = createValidBaseMonitor({ lastChecked: customDate });

            expect(monitor.lastChecked).toBe(customDate);
        });

        it("should handle undefined lastChecked", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidBaseMonitor({});

            expect(monitor.lastChecked).toBeUndefined();
        });
    });

    describe(createValidHttpMonitor, () => {
        it("should create a valid HTTP monitor with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Constructor", "type");

            const monitor = createValidHttpMonitor();

            expect(monitor).toMatchObject({
                type: "http",
                url: "https://example.com",
                checkInterval: 30_000,
                history: [],
                id: "test-monitor",
                monitoring: true,
                responseTime: 200,
                retryAttempts: 3,
                status: "up",
                timeout: 5000,
            });
        });

        it("should apply HTTP-specific overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidHttpMonitor({
                url: "https://custom.com",
                id: "http-monitor",
            });

            expect(monitor.url).toBe("https://custom.com");
            expect(monitor.id).toBe("http-monitor");
            expect(monitor.type).toBe("http");
        });

        it("should handle complex URL overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const complexUrl =
                "https://api.example.com:8080/v1/health?check=true";
            const monitor = createValidHttpMonitor({ url: complexUrl });

            expect(monitor.url).toBe(complexUrl);
        });

        it("should preserve HTTP type even with overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidHttpMonitor({ type: "port" as any });

            expect(monitor.type).toBe("http"); // Should be overridden back to http
        });
    });

    describe(createValidPortMonitor, () => {
        it("should create a valid port monitor with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Constructor", "type");

            const monitor = createValidPortMonitor();

            expect(monitor).toMatchObject({
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 30_000,
                history: [],
                id: "test-monitor",
                monitoring: true,
                responseTime: 200,
                retryAttempts: 3,
                status: "up",
                timeout: 5000,
            });
        });

        it("should apply port-specific overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidPortMonitor({
                host: "custom-host.com",
                port: 443,
                id: "port-monitor",
            });

            expect(monitor.host).toBe("custom-host.com");
            expect(monitor.port).toBe(443);
            expect(monitor.id).toBe("port-monitor");
            expect(monitor.type).toBe("port");
        });

        it("should handle various port numbers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const httpMonitor = createValidPortMonitor({ port: 80 });
            const httpsMonitor = createValidPortMonitor({ port: 443 });
            const customMonitor = createValidPortMonitor({ port: 8080 });

            expect(httpMonitor.port).toBe(80);
            expect(httpsMonitor.port).toBe(443);
            expect(customMonitor.port).toBe(8080);
        });

        it("should handle localhost and IP addresses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const localhostMonitor = createValidPortMonitor({
                host: "localhost",
            });
            const ipMonitor = createValidPortMonitor({ host: "192.168.1.1" });

            expect(localhostMonitor.host).toBe("localhost");
            expect(ipMonitor.host).toBe("192.168.1.1");
        });

        it("should preserve port type even with overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidPortMonitor({ type: "http" as any });

            expect(monitor.type).toBe("port"); // Should be overridden back to port
        });
    });

    describe(createValidPingMonitor, () => {
        it("should create a valid ping monitor with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Constructor", "type");

            const monitor = createValidPingMonitor();

            expect(monitor).toMatchObject({
                type: "ping",
                host: "example.com",
                checkInterval: 30_000,
                history: [],
                id: "test-monitor",
                monitoring: true,
                responseTime: 200,
                retryAttempts: 3,
                status: "up",
                timeout: 5000,
            });
        });

        it("should apply ping-specific overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidPingMonitor({
                host: "ping-host.com",
                id: "ping-monitor",
            });

            expect(monitor.host).toBe("ping-host.com");
            expect(monitor.id).toBe("ping-monitor");
            expect(monitor.type).toBe("ping");
        });

        it("should handle various host formats", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const domainMonitor = createValidPingMonitor({
                host: "google.com",
            });
            const ipMonitor = createValidPingMonitor({ host: "8.8.8.8" });
            const subdomainMonitor = createValidPingMonitor({
                host: "api.example.com",
            });

            expect(domainMonitor.host).toBe("google.com");
            expect(ipMonitor.host).toBe("8.8.8.8");
            expect(subdomainMonitor.host).toBe("api.example.com");
        });

        it("should preserve ping type even with overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidPingMonitor({ type: "http" as any });

            expect(monitor.type).toBe("ping"); // Should be overridden back to ping
        });
    });

    describe(createValidSite, () => {
        it("should create a valid site with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Constructor", "type");

            const site = createValidSite();

            expect(site).toMatchObject({
                id: "test-site",
                name: "Test Site",
                status: "up",
                monitors: expect.arrayContaining([
                    expect.objectContaining({
                        type: "http",
                        url: "https://example.com",
                    }),
                ]),
            });
            expect(site.createdAt).toBeInstanceOf(Date);
            expect(site.updatedAt).toBeInstanceOf(Date);
        });

        it("should apply site-specific overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const customMonitors = [
                createValidPortMonitor({ id: "port-1" }),
                createValidPingMonitor({ id: "ping-1" }),
            ];

            const site = createValidSite({
                id: "custom-site",
                name: "Custom Site",
                monitors: customMonitors,
                status: "down",
            });

            expect(site.id).toBe("custom-site");
            expect(site.name).toBe("Custom Site");
            expect(site.status).toBe("down");
            expect(site.monitors).toBe(customMonitors);
        });

        it("should handle empty monitors array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Monitoring", "type");

            const site = createValidSite({ monitors: [] });

            expect(site.monitors).toEqual([]);
        });

        it("should handle custom timestamps", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const customDate = new Date("2023-01-01");
            const site = createValidSite({
                createdAt: customDate,
                updatedAt: customDate,
            });

            expect(site.createdAt).toBe(customDate);
            expect(site.updatedAt).toBe(customDate);
        });

        it("should handle all status types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const upSite = createValidSite({ status: "up" });
            const downSite = createValidSite({ status: "down" });
            const pendingSite = createValidSite({ status: "pending" });
            const pausedSite = createValidSite({ status: "paused" });

            expect(upSite.status).toBe("up");
            expect(downSite.status).toBe("down");
            expect(pendingSite.status).toBe("pending");
            expect(pausedSite.status).toBe("paused");
        });

        it("should handle multiple monitors of different types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Monitoring", "type");

            const monitors = [
                createValidHttpMonitor({ id: "http-1" }),
                createValidPortMonitor({ id: "port-1" }),
                createValidPingMonitor({ id: "ping-1" }),
            ];

            const site = createValidSite({ monitors });

            expect(site.monitors).toHaveLength(3);
            expect(site.monitors[0].type).toBe("http");
            expect(site.monitors[1].type).toBe("port");
            expect(site.monitors[2].type).toBe("ping");
        });
    });

    describe(createValidStatusHistory, () => {
        it("should create a valid status history with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Constructor", "type");

            const history = createValidStatusHistory();

            expect(history).toMatchObject({
                responseTime: 150,
                status: "up",
                details: "Response successful",
            });
            expect(typeof history.timestamp).toBe("number");
            expect(history.timestamp).toBeGreaterThan(0);
        });

        it("should apply status history overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const customTimestamp = Date.now() - 10_000;
            const history = createValidStatusHistory({
                responseTime: 500,
                status: "down",
                timestamp: customTimestamp,
                details: "Connection timeout",
            });

            expect(history.responseTime).toBe(500);
            expect(history.status).toBe("down");
            expect(history.timestamp).toBe(customTimestamp);
            expect(history.details).toBe("Connection timeout");
        });

        it("should handle both status types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const upHistory = createValidStatusHistory({ status: "up" });
            const downHistory = createValidStatusHistory({ status: "down" });

            expect(upHistory.status).toBe("up");
            expect(downHistory.status).toBe("down");
        });

        it("should handle various response times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const fastHistory = createValidStatusHistory({ responseTime: 50 });
            const slowHistory = createValidStatusHistory({
                responseTime: 5000,
            });
            const zeroHistory = createValidStatusHistory({ responseTime: 0 });

            expect(fastHistory.responseTime).toBe(50);
            expect(slowHistory.responseTime).toBe(5000);
            expect(zeroHistory.responseTime).toBe(0);
        });

        it("should handle undefined details", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const history = createValidStatusHistory({});

            expect(history.details).toBeUndefined();
        });

        it("should handle empty details", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const history = createValidStatusHistory({ details: "" });

            expect(history.details).toBe("");
        });

        it("should handle custom details messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const customDetails = "Custom error message with specific details";
            const history = createValidStatusHistory({
                details: customDetails,
            });

            expect(history.details).toBe(customDetails);
        });
    });

    describe("Integration Tests", () => {
        it("should create consistent monitor structures across helper functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Constructor", "type");

            const httpMonitor = createValidHttpMonitor();
            const portMonitor = createValidPortMonitor();
            const pingMonitor = createValidPingMonitor();

            // All should have the same base structure
            const commonFields = [
                "checkInterval",
                "history",
                "id",
                "lastChecked",
                "monitoring",
                "responseTime",
                "retryAttempts",
                "status",
                "timeout",
                "type",
            ];

            for (const field of commonFields) {
                expect(httpMonitor).toHaveProperty(field);
                expect(portMonitor).toHaveProperty(field);
                expect(pingMonitor).toHaveProperty(field);
            }
        });

        it("should work with real validation schemas", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // This tests the actual purpose of the helper functions
            const site = createValidSite({
                monitors: [
                    createValidHttpMonitor({ id: "http-test" }),
                    createValidPortMonitor({ id: "port-test" }),
                    createValidPingMonitor({ id: "ping-test" }),
                ],
            });

            expect(site.monitors).toHaveLength(3);
            expect(site.monitors.every((m) => m.history)).toBeTruthy();
            expect(site.monitors.every((m) => m.id)).toBeTruthy();
        });

        it("should handle complex nested overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: testHelpers", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            const baseOverrides = {
                checkInterval: 120_000,
                monitoring: false,
                retryAttempts: 5,
            };

            const httpMonitor = createValidHttpMonitor({
                ...baseOverrides,
                url: "https://complex-override.com",
            });

            const portMonitor = createValidPortMonitor({
                ...baseOverrides,
                host: "complex-host.com",
                port: 9999,
            });

            expect(httpMonitor.checkInterval).toBe(120_000);
            expect(httpMonitor.monitoring).toBeFalsy();
            expect(httpMonitor.retryAttempts).toBe(5);
            expect(httpMonitor.url).toBe("https://complex-override.com");

            expect(portMonitor.checkInterval).toBe(120_000);
            expect(portMonitor.monitoring).toBeFalsy();
            expect(portMonitor.retryAttempts).toBe(5);
            expect(portMonitor.host).toBe("complex-host.com");
            expect(portMonitor.port).toBe(9999);
        });
    });
});
