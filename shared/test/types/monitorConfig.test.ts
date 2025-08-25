/**
 * Function coverage validation test for shared/types/monitorConfig.ts
 *
 * This test ensures all exported functions are called to achieve 100% function
 * coverage.
 *
 * @file Function coverage validation for monitor config type guards
 */

import { describe, it, expect } from "vitest";
import * as monitorConfig from "@shared/types/monitorConfig";

describe("Function Coverage Validation", () => {
    it("should call all exported functions to ensure 100% function coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Export Operation", "type");

        // Verify all functions are accessible
        expect(typeof monitorConfig.isHttpMonitorConfig).toBe("function");
        expect(typeof monitorConfig.isPingMonitorConfig).toBe("function");
        expect(typeof monitorConfig.isPortMonitorConfig).toBe("function");

        // Call each function with minimal valid inputs to register coverage
        const httpConfig = {
            id: "http1",
            name: "HTTP Monitor",
            type: "http",
            url: "https://example.com",
            method: "GET",
            expectedStatusCodes: [200],
            followRedirects: true,
            checkInterval: 30000,
            enabled: true,
            retryAttempts: 3,
            timeout: 5000,
        } as any;

        const pingConfig = {
            id: "ping1",
            name: "Ping Monitor",
            type: "ping",
            host: "example.com",
            maxPacketLoss: 0,
            packetCount: 4,
            packetSize: 32,
            checkInterval: 30000,
            enabled: true,
            retryAttempts: 3,
            timeout: 5000,
        } as any;

        const portConfig = {
            id: "port1",
            name: "Port Monitor",
            type: "port",
            host: "example.com",
            port: 80,
            connectionTimeout: 10000,
            checkInterval: 30000,
            enabled: true,
            retryAttempts: 3,
            timeout: 5000,
        } as any;

        monitorConfig.isHttpMonitorConfig(httpConfig);
        monitorConfig.isPingMonitorConfig(pingConfig);
        monitorConfig.isPortMonitorConfig(portConfig);

        // Verify basic functionality
        expect(monitorConfig.isHttpMonitorConfig(httpConfig)).toBe(true);
        expect(monitorConfig.isPingMonitorConfig(pingConfig)).toBe(true);
        expect(monitorConfig.isPortMonitorConfig(portConfig)).toBe(true);
    });
});
