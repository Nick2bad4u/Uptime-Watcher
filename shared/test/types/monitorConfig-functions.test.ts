/**
 * @file Tests for shared/types/monitorConfig.ts functions
 */

import { describe, expect, it } from "vitest";

import {
    isHttpMonitorConfig,
    isPingMonitorConfig,
    isPortMonitorConfig,
    type HttpMonitorConfig,
    type PingMonitorConfig,
    type PortMonitorConfig,
} from "../../types/monitorConfig";

describe("shared/types/monitorConfig function coverage", () => {
    describe("isHttpMonitorConfig", () => {
        it("should return true for valid HttpMonitorConfig", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const validConfig: HttpMonitorConfig = {
                id: "http-monitor-1",
                name: "HTTP Monitor",
                type: "http",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                url: "https://example.com",
                method: "GET",
                followRedirects: true,
                expectedStatusCodes: [200],
                userAgent: "UptimeBot/1.0",
                headers: {},
            };

            expect(isHttpMonitorConfig(validConfig)).toBe(true);
        });

        it("should return true for minimal valid HttpMonitorConfig", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const minimalConfig: HttpMonitorConfig = {
                id: "http-monitor-minimal",
                name: "Minimal HTTP Monitor",
                type: "http",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                url: "https://example.com",
                method: "GET",
                followRedirects: false,
                expectedStatusCodes: [],
            };

            expect(isHttpMonitorConfig(minimalConfig)).toBe(true);
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isHttpMonitorConfig(null as any)).toBe(false);
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isHttpMonitorConfig(undefined as any)).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isHttpMonitorConfig("string" as any)).toBe(false);
            expect(isHttpMonitorConfig(123 as any)).toBe(false);
            expect(isHttpMonitorConfig(true as any)).toBe(false);
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteConfig = {
                url: "https://example.com",
                // missing other required properties
            };

            expect(isHttpMonitorConfig(incompleteConfig as any)).toBe(false);
        });

        it("should return false for object with wrong property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidConfig = {
                url: 123, // should be string
                method: "GET",
                timeout: 30,
                followRedirects: false,
                maxRedirects: 0,
                validateSSL: true,
                userAgent: "",
                headers: {},
                expectedStatusCodes: [],
                expectedResponseTime: 0,
                bodyMatch: "",
                bodyNotMatch: "",
            };

            expect(isHttpMonitorConfig(invalidConfig as any)).toBe(false);
        });
    });

    describe("isPingMonitorConfig", () => {
        it("should return true for valid PingMonitorConfig", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const validConfig: PingMonitorConfig = {
                id: "ping-monitor-1",
                name: "Ping Monitor",
                type: "ping",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                host: "example.com",
                maxPacketLoss: 0,
                packetCount: 4,
                packetSize: 64,
            };

            expect(isPingMonitorConfig(validConfig)).toBe(true);
        });

        it("should return true for minimal valid PingMonitorConfig", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const minimalConfig: PingMonitorConfig = {
                id: "ping-monitor-minimal",
                name: "Minimal Ping Monitor",
                type: "ping",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                host: "localhost",
                maxPacketLoss: 0,
                packetCount: 1,
                packetSize: 32,
            };

            expect(isPingMonitorConfig(minimalConfig)).toBe(true);
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingMonitorConfig(null as any)).toBe(false);
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingMonitorConfig(undefined as any)).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingMonitorConfig("string" as any)).toBe(false);
            expect(isPingMonitorConfig(123 as any)).toBe(false);
            expect(isPingMonitorConfig(true as any)).toBe(false);
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteConfig = {
                host: "example.com",
                // missing other required properties
            };

            expect(isPingMonitorConfig(incompleteConfig as any)).toBe(false);
        });

        it("should return false for object with wrong property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidConfig = {
                host: 123, // should be string
                timeout: 5000,
                retries: 3,
                interval: 1000,
                packetSize: 64,
                expectedResponseTime: 100,
            };

            expect(isPingMonitorConfig(invalidConfig as any)).toBe(false);
        });
    });

    describe("isPortMonitorConfig", () => {
        it("should return true for valid PortMonitorConfig", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const validConfig: PortMonitorConfig = {
                id: "port-monitor-1",
                name: "Port Monitor",
                type: "port",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                host: "example.com",
                port: 80,
                connectionTimeout: 10_000,
            };

            expect(isPortMonitorConfig(validConfig)).toBe(true);
        });

        it("should return true for different protocol", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const udpConfig: PortMonitorConfig = {
                id: "port-monitor-udp",
                name: "UDP Port Monitor",
                type: "port",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                host: "dns.example.com",
                port: 53,
                connectionTimeout: 5000,
                protocol: {
                    useTls: false,
                    sendData: "test",
                },
            };

            expect(isPortMonitorConfig(udpConfig)).toBe(true);
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortMonitorConfig(null as any)).toBe(false);
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortMonitorConfig(undefined as any)).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortMonitorConfig("string" as any)).toBe(false);
            expect(isPortMonitorConfig(123 as any)).toBe(false);
            expect(isPortMonitorConfig(true as any)).toBe(false);
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteConfig = {
                host: "example.com",
                port: 80,
                // missing other required properties
            };

            expect(isPortMonitorConfig(incompleteConfig as any)).toBe(false);
        });

        it("should return false for object with wrong property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidConfig = {
                host: "example.com",
                port: "80", // should be number
                timeout: 5000,
                expectedResponseTime: 1000,
                protocol: "tcp",
            };

            expect(isPortMonitorConfig(invalidConfig as any)).toBe(false);
        });

        it("should handle edge case ports", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const edgeCaseConfig: PortMonitorConfig = {
                id: "port-monitor-edge",
                name: "Edge Case Port Monitor",
                type: "port",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                host: "example.com",
                port: 65_535, // max port
                connectionTimeout: 5000,
            };

            expect(isPortMonitorConfig(edgeCaseConfig)).toBe(true);
        });
    });

    describe("integration tests", () => {
        it("should differentiate between different monitor config types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const httpConfig: HttpMonitorConfig = {
                id: "http-test",
                name: "HTTP Test",
                type: "http",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                url: "https://example.com",
                method: "GET",
                followRedirects: false,
                expectedStatusCodes: [],
            };

            const pingConfig: PingMonitorConfig = {
                id: "ping-test",
                name: "Ping Test",
                type: "ping",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                host: "example.com",
                maxPacketLoss: 0,
                packetCount: 4,
                packetSize: 64,
            };

            const portConfig: PortMonitorConfig = {
                id: "port-test",
                name: "Port Test",
                type: "port",
                checkInterval: 300_000,
                enabled: true,
                retryAttempts: 3,
                timeout: 30_000,
                host: "example.com",
                port: 80,
                connectionTimeout: 10_000,
            };

            // Each config should only match its own type
            expect(isHttpMonitorConfig(httpConfig)).toBe(true);
            expect(isPingMonitorConfig(httpConfig)).toBe(false);
            expect(isPortMonitorConfig(httpConfig)).toBe(false);

            expect(isHttpMonitorConfig(pingConfig)).toBe(false);
            expect(isPingMonitorConfig(pingConfig)).toBe(true);
            expect(isPortMonitorConfig(pingConfig)).toBe(false);

            expect(isHttpMonitorConfig(portConfig)).toBe(false);
            expect(isPingMonitorConfig(portConfig)).toBe(false);
            expect(isPortMonitorConfig(portConfig)).toBe(true);
        });

        it("should handle complex real-world configurations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const complexHttpConfig: HttpMonitorConfig = {
                id: "complex-http",
                name: "Complex HTTP Monitor",
                type: "http",
                checkInterval: 600_000,
                enabled: true,
                retryAttempts: 5,
                timeout: 60_000,
                url: "https://api.example.com/health",
                method: "POST",
                followRedirects: true,
                expectedStatusCodes: [
                    200,
                    201,
                    202,
                ],
                userAgent: "UptimeBot/2.0 (Health Check)",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer token123",
                },
                auth: {
                    type: "basic",
                    username: "user",
                    password: "pass",
                },
            };

            expect(isHttpMonitorConfig(complexHttpConfig)).toBe(true);
        });

        it("should handle boundary values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Test with extreme but valid values
            const extremeConfig: PingMonitorConfig = {
                id: "extreme-ping",
                name: "Extreme Ping Monitor",
                type: "ping",
                checkInterval: 1,
                enabled: true,
                retryAttempts: 100,
                timeout: 1,
                host: "a".repeat(253), // max domain length
                maxPacketLoss: 100,
                packetCount: 1,
                packetSize: 1,
            };

            expect(isPingMonitorConfig(extremeConfig)).toBe(true);
        });
    });
});
