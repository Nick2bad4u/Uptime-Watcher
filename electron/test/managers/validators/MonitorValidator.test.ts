/**
 * Comprehensive tests for MonitorValidator class.
 * Tests monitor validation logic with 100% line and branch coverage.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { MonitorValidator } from "../../../managers/validators/MonitorValidator";
import type { Monitor } from "../../../types";

describe("MonitorValidator", () => {
    let validator: MonitorValidator;

    beforeEach(() => {
        validator = new MonitorValidator();
    });

    describe("validateMonitorConfiguration", () => {
        it("should validate a valid HTTP monitor", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should validate a valid port monitor", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "port",
                status: "up",
                history: [],
                host: "localhost",
                port: 8080,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 2,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should validate monitor with minimal valid configuration", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should return errors for monitor without type", () => {
            const monitor = {
                id: "monitor-1",
                type: "", // Invalid empty type
                status: "up",
                history: [],
                url: "https://example.com",
            } as unknown as Monitor;

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor type is required");
        });

        it("should return errors for HTTP monitor without URL", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("HTTP monitors must have a URL");
        });

        it("should return errors for HTTP monitor with invalid URL", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "invalid-url",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("HTTP monitors must have a valid URL");
        });

        it("should return errors for port monitor without host", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "port",
                status: "up",
                history: [],
                port: 8080,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 2,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a host");
        });

        it("should return errors for port monitor without port", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "port",
                status: "up",
                history: [],
                host: "localhost",
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 2,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a valid port number (1-65535)");
        });

        it("should return errors for port monitor with invalid port", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "port",
                status: "up",
                history: [],
                host: "localhost",
                port: 0,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 2,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a valid port number (1-65535)");
        });

        it("should return errors for port monitor with port too high", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "port",
                status: "up",
                history: [],
                host: "localhost",
                port: 65536,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 2,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a valid port number (1-65535)");
        });

        it("should return errors for monitor with invalid check interval", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
                checkInterval: 500,
                timeout: 30000,
                retryAttempts: 3,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor check interval must be at least 1000ms");
        });

        it("should return errors for monitor with invalid timeout", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
                checkInterval: 300000,
                timeout: 500,
                retryAttempts: 3,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor timeout must be at least 1000ms");
        });

        it("should return errors for monitor with negative retry attempts", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: -1,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor retry attempts cannot be negative");
        });

        it("should return multiple errors for monitor with multiple issues", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "invalid-url",
                checkInterval: 500,
                timeout: 500,
                retryAttempts: -1,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("HTTP monitors must have a valid URL");
            expect(result.errors).toContain("Monitor check interval must be at least 1000ms");
            expect(result.errors).toContain("Monitor timeout must be at least 1000ms");
            expect(result.errors).toContain("Monitor retry attempts cannot be negative");
        });

        it("should return multiple errors for port monitor with multiple issues", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "port",
                status: "up",
                history: [],
                port: 0,
                checkInterval: 500,
                timeout: 500,
                retryAttempts: -1,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a host");
            expect(result.errors).toContain("Port monitors must have a valid port number (1-65535)");
            expect(result.errors).toContain("Monitor check interval must be at least 1000ms");
            expect(result.errors).toContain("Monitor timeout must be at least 1000ms");
            expect(result.errors).toContain("Monitor retry attempts cannot be negative");
        });
    });

    describe("shouldApplyDefaultInterval", () => {
        it("should return true for monitor without checkInterval", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
            };

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBe(true);
        });

        it("should return false for monitor with checkInterval", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
                checkInterval: 300000,
            };

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBe(false);
        });

        it("should return true for monitor with checkInterval of 0", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
                checkInterval: 0,
            };

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBe(true);
        });
    });

    describe("Edge cases", () => {
        it("should handle HTTP monitor with empty URL", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "",
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("HTTP monitors must have a URL");
        });

        it("should handle port monitor with empty host", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "port",
                status: "up",
                history: [],
                host: "",
                port: 8080,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a host");
        });

        it("should handle monitor with zero retry attempts", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
                retryAttempts: 0,
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should handle monitor with valid edge case values", () => {
            const monitor: Monitor = {
                id: "monitor-1",
                type: "port",
                status: "up",
                history: [],
                host: "localhost",
                port: 65535, // Maximum valid port
                checkInterval: 1000, // Minimum valid interval
                timeout: 1000, // Minimum valid timeout
                retryAttempts: 0, // Minimum valid retry attempts
            };

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should handle HTTP monitor with valid URL formats", () => {
            const monitors = [
                {
                    id: "monitor-1",
                    type: "http" as const,
                    status: "up" as const,
                    history: [],
                    url: "https://example.com",
                },
                {
                    id: "monitor-2",
                    type: "http" as const,
                    status: "up" as const,
                    history: [],
                    url: "http://localhost:3000",
                },
                {
                    id: "monitor-3",
                    type: "http" as const,
                    status: "up" as const,
                    history: [],
                    url: "https://subdomain.example.com/path",
                },
            ];

            for (const monitor of monitors) {
                const result = validator.validateMonitorConfiguration(monitor);
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            }
        });

        it("should handle port monitor with valid hosts", () => {
            const monitors = [
                {
                    id: "monitor-1",
                    type: "port" as const,
                    status: "up" as const,
                    history: [],
                    host: "localhost",
                    port: 8080,
                },
                {
                    id: "monitor-2",
                    type: "port" as const,
                    status: "up" as const,
                    history: [],
                    host: "192.168.1.1",
                    port: 80,
                },
                {
                    id: "monitor-3",
                    type: "port" as const,
                    status: "up" as const,
                    history: [],
                    host: "example.com",
                    port: 443,
                },
            ];

            for (const monitor of monitors) {
                const result = validator.validateMonitorConfiguration(monitor);
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            }
        });
    });
});
