/**
 * Tests for monitoring service types. Validates that monitoring interfaces and
 * types work correctly.
 */

import { describe, expect, it } from "vitest";
import type {
    MonitorCheckResult,
    IMonitorService,
    MonitorConfig,
} from "../services/monitoring/types";
import type { Site } from "../../shared/types.js";

describe("Monitoring Types", () => {
    describe("MonitorCheckResult interface", () => {
        it("should create successful check result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const result: MonitorCheckResult = {
                status: "up",
                responseTime: 250,
                details: "All good",
            };

            expect(result.status).toBe("up");
            expect(result.responseTime).toBe(250);
            expect(result.details).toBe("All good");
        });

        it("should create failed check result", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const result: MonitorCheckResult = {
                status: "down",
                responseTime: 0,
                error: "Connection failed",
                details: "Timeout after 5000ms",
            };

            expect(result.status).toBe("down");
            expect(result.responseTime).toBe(0);
            expect(result.error).toBe("Connection failed");
            expect(result.details).toBe("Timeout after 5000ms");
        });

        it("should support minimal check result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
            };

            expect(result.status).toBe("up");
            expect(result.responseTime).toBe(100);
            expect(result.details).toBeUndefined();
            expect(result.error).toBeUndefined();
        });
    });

    describe("IMonitorService interface", () => {
        it("should define monitor service contract", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            // This is a type check to ensure the interface compiles correctly
            const mockService: IMonitorService = {
                async check(
                    monitor: Site["monitors"][0]
                ): Promise<MonitorCheckResult> {
                    return {
                        status: monitor.monitoring ? "up" : "down",
                        responseTime: 100,
                    };
                },
                getType(): Site["monitors"][0]["type"] {
                    return "http";
                },
                updateConfig: function (_config: Partial<MonitorConfig>): void {
                    throw new Error("Function not implemented.");
                },
            };

            expect(mockService.getType()).toBe("http");
            expect(typeof mockService.check).toBe("function");
        });

        it("should support HTTP monitor service", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const mockMonitor: Site["monitors"][0] = {
                id: "test-monitor",
                type: "http",
                status: "pending",
                history: [],
                monitoring: true,
                url: "https://example.com",
                responseTime: 0,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            const httpService: IMonitorService = {
                async check(
                    monitor: Site["monitors"][0]
                ): Promise<MonitorCheckResult> {
                    return {
                        status: monitor.url ? "up" : "down",
                        responseTime: 150,
                        details: monitor.url ?? "No URL provided",
                    };
                },
                getType(): Site["monitors"][0]["type"] {
                    return "http";
                },
                updateConfig: function (_config: Partial<MonitorConfig>): void {
                    throw new Error("Function not implemented.");
                },
            };

            const result = await httpService.check(mockMonitor);
            expect(result.status).toBe("up");
            expect(result.responseTime).toBe(150);
            expect(result.details).toBe("https://example.com");
            expect(httpService.getType()).toBe("http");
        });

        it("should support port monitor service", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const mockMonitor: Site["monitors"][0] = {
                id: "test-port-monitor",
                type: "port",
                status: "pending",
                history: [],
                monitoring: true,
                host: "example.com",
                port: 80,
                responseTime: 0,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            const portService: IMonitorService = {
                async check(
                    monitor: Site["monitors"][0]
                ): Promise<MonitorCheckResult> {
                    return {
                        status: monitor.host && monitor.port ? "up" : "down",
                        responseTime: 50,
                        details: monitor.port
                            ? String(monitor.port)
                            : "No port provided",
                    };
                },
                getType(): Site["monitors"][0]["type"] {
                    return "port";
                },
                updateConfig: function (_config: Partial<MonitorConfig>): void {
                    throw new Error("Function not implemented.");
                },
            };

            const result = await portService.check(mockMonitor);
            expect(result.status).toBe("up");
            expect(result.responseTime).toBe(50);
            expect(result.details).toBe("80");
            expect(portService.getType()).toBe("port");
        });
    });

    describe("MonitorConfig interface", () => {
        it("should create empty config", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const config: MonitorConfig = {};

            expect(config.timeout).toBeUndefined();
            expect(config.userAgent).toBeUndefined();
        });

        it("should create config with timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const config: MonitorConfig = {
                timeout: 5000,
            };

            expect(config.timeout).toBe(5000);
            expect(config.userAgent).toBeUndefined();
        });

        it("should create config with user agent", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const config: MonitorConfig = {
                userAgent: "Test Agent/1.0",
            };

            expect(config.userAgent).toBe("Test Agent/1.0");
            expect(config.timeout).toBeUndefined();
        });

        it("should create complete config", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitoringTypes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const config: MonitorConfig = {
                timeout: 10_000,
                userAgent: "Uptime Watcher/1.0",
            };

            expect(config.timeout).toBe(10_000);
            expect(config.userAgent).toBe("Uptime Watcher/1.0");
        });
    });
});
