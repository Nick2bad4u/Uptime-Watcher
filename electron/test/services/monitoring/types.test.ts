/**
 * Tests for monitoring services types.
 * Validates type definitions and interfaces for monitoring functionality.
 */

import { describe, expect, it } from "vitest";

import type { IMonitorService, MonitorCheckResult, MonitorConfig } from "../../../services/monitoring";

describe("Monitoring Types", () => {
    describe("MonitorCheckResult", () => {
        it("should validate a successful check result", () => {
            const result: MonitorCheckResult = {
                status: "up",
                responseTime: 150,
                details: "Connection successful",
            };

            expect(result.status).toBe("up");
            expect(result.responseTime).toBe(150);
            expect(result.details).toBe("Connection successful");
        });

        it("should validate a failed check result", () => {
            const result: MonitorCheckResult = {
                status: "down",
                responseTime: 0,
                error: "Connection timeout",
            };

            expect(result.status).toBe("down");
            expect(result.responseTime).toBe(0);
            expect(result.error).toBe("Connection timeout");
        });

        it("should allow minimal check result", () => {
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

    describe("MonitorConfig", () => {
        it("should validate config with all properties", () => {
            const config: MonitorConfig = {
                timeout: 5000,
                userAgent: "UptimeWatcher/1.0",
            };

            expect(config.timeout).toBe(5000);
            expect(config.userAgent).toBe("UptimeWatcher/1.0");
        });

        it("should validate empty config", () => {
            const config: MonitorConfig = {};

            expect(config.timeout).toBeUndefined();
            expect(config.userAgent).toBeUndefined();
        });
    });

    describe("IMonitorService", () => {
        it("should validate interface structure", () => {
            // Mock implementation to test interface
            const mockService: IMonitorService = {
                async check(_monitor) {
                    return {
                        status: "up",
                        responseTime: 100,
                    };
                },
                getType() {
                    return "http";
                },
                updateConfig: function (config: Partial<MonitorConfig>): void {
                    throw new Error("Function not implemented.");
                }
            };

            expect(typeof mockService.check).toBe("function");
            expect(typeof mockService.getType).toBe("function");
            expect(mockService.getType()).toBe("http");
        });

        it("should work with async check method", async () => {
            const mockService: IMonitorService = {
                async check(_monitor) {
                    return {
                        status: "up",
                        responseTime: 150,
                    };
                },
                getType() {
                    return "port";
                },
                updateConfig: function (config: Partial<MonitorConfig>): void {
                    throw new Error("Function not implemented.");
                }
            };

            const mockMonitor = {
                id: "test",
                type: "port" as const,
                status: "pending" as const,
                history: [],
                responseTime: 0,
                monitoring: false,
                checkInterval: 30000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const result = await mockService.check(mockMonitor);
            expect(result.status).toBe("up");
            expect(result.responseTime).toBe(150);
        });
    });
});
