/**
 * @file Complete Function Coverage Tests for shared/types.ts
 *
 *   This test ensures 100% function coverage for the shared types module,
 *   specifically targeting the type guard functions and utility functions that
 *   currently have 0% coverage according to the coverage report.
 */

import { describe, expect, it } from "vitest";
import * as typesModule from "../types";

describe("Shared Types - Complete Function Coverage", () => {
    describe("Function Coverage Validation", () => {
        it("should call every exported function for complete coverage", () => {
            // Verify the module exports we expect
            expect(typeof typesModule).toBe("object");
            expect(typesModule).toBeDefined();

            // Test isComputedSiteStatus function
            expect(typeof typesModule.isComputedSiteStatus).toBe("function");

            // Test all valid computed site status values
            expect(typesModule.isComputedSiteStatus("mixed")).toBe(true);
            expect(typesModule.isComputedSiteStatus("unknown")).toBe(true);

            // Test invalid values
            expect(typesModule.isComputedSiteStatus("up")).toBe(false);
            expect(typesModule.isComputedSiteStatus("down")).toBe(false);
            expect(typesModule.isComputedSiteStatus("pending")).toBe(false);
            expect(typesModule.isComputedSiteStatus("invalid")).toBe(false);
            expect(typesModule.isComputedSiteStatus("")).toBe(false);

            // Test isMonitorStatus function
            expect(typeof typesModule.isMonitorStatus).toBe("function");

            // Test all valid monitor status values
            expect(typesModule.isMonitorStatus("up")).toBe(true);
            expect(typesModule.isMonitorStatus("down")).toBe(true);
            expect(typesModule.isMonitorStatus("pending")).toBe(true);
            expect(typesModule.isMonitorStatus("paused")).toBe(true);

            // Test invalid values
            expect(typesModule.isMonitorStatus("mixed")).toBe(false);
            expect(typesModule.isMonitorStatus("unknown")).toBe(false);
            expect(typesModule.isMonitorStatus("invalid")).toBe(false);
            expect(typesModule.isMonitorStatus("")).toBe(false);

            // Test isSiteStatus function
            expect(typeof typesModule.isSiteStatus).toBe("function");

            // Test all valid site status values (includes both monitor statuses and computed)
            expect(typesModule.isSiteStatus("up")).toBe(true);
            expect(typesModule.isSiteStatus("down")).toBe(true);
            expect(typesModule.isSiteStatus("pending")).toBe(true);
            expect(typesModule.isSiteStatus("paused")).toBe(true);
            expect(typesModule.isSiteStatus("mixed")).toBe(true);
            expect(typesModule.isSiteStatus("unknown")).toBe(true);

            // Test invalid values
            expect(typesModule.isSiteStatus("invalid")).toBe(false);
            expect(typesModule.isSiteStatus("")).toBe(false);

            // Test validateMonitor function
            expect(typeof typesModule.validateMonitor).toBe("function");

            // Test valid monitor object
            const validMonitor = {
                id: "test-monitor-1",
                type: "http" as const,
                status: "up" as const,
                monitoring: true,
                responseTime: 150,
                checkInterval: 30000,
                timeout: 5000,
                retryAttempts: 3,
                history: [] as any[],
                activeOperations: ["operation-1", "operation-2"],
            };
            expect(typesModule.validateMonitor(validMonitor)).toBe(true);

            // Test valid monitor without optional fields
            const minimalValidMonitor = {
                id: "test-monitor-2",
                type: "port" as const,
                status: "down" as const,
                monitoring: false,
                responseTime: 0,
                checkInterval: 60000,
                timeout: 10000,
                retryAttempts: 1,
                history: [],
            };
            expect(typesModule.validateMonitor(minimalValidMonitor)).toBe(true);

            // Test invalid monitors
            expect(typesModule.validateMonitor(null as any)).toBe(false);
            expect(typesModule.validateMonitor(undefined as any)).toBe(false);
            expect(typesModule.validateMonitor({} as any)).toBe(false);
            expect(typesModule.validateMonitor("string" as any)).toBe(false);
            expect(typesModule.validateMonitor(123 as any)).toBe(false);

            // Test monitor with missing required fields
            expect(typesModule.validateMonitor({ id: "test" })).toBe(false);
            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "up",
                    monitoring: true,
                })
            ).toBe(false);

            // Test monitor with invalid field types
            expect(
                typesModule.validateMonitor({
                    id: 123 as any, // should be string
                    type: "http",
                    status: "up",
                    monitoring: true,
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                })
            ).toBe(false);

            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "invalid-type" as any, // should be valid monitor type
                    status: "up",
                    monitoring: true,
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                })
            ).toBe(false);

            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "invalid-status" as any, // should be valid monitor status
                    monitoring: true,
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                })
            ).toBe(false);

            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "up",
                    monitoring: "yes" as any, // should be boolean
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                })
            ).toBe(false);

            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    responseTime: "150" as any, // should be number
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                })
            ).toBe(false);

            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: "not-array" as any, // should be array
                })
            ).toBe(false);

            // Test monitor with invalid activeOperations
            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                    activeOperations: "not-array" as any, // should be array or undefined
                })
            ).toBe(false);

            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                    activeOperations: [123 as any, "valid"], // all elements should be strings
                })
            ).toBe(false);

            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                    activeOperations: ["", "valid"], // empty strings should be invalid
                })
            ).toBe(false);

            expect(
                typesModule.validateMonitor({
                    id: "test",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    responseTime: 150,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                    activeOperations: ["   ", "valid"], // whitespace-only strings should be invalid
                })
            ).toBe(false);
        });

        it("should test constants and type definitions", () => {
            // Test BASE_MONITOR_TYPES constant
            expect(Array.isArray(typesModule.BASE_MONITOR_TYPES)).toBe(true);
            expect(typesModule.BASE_MONITOR_TYPES).toContain("http");
            expect(typesModule.BASE_MONITOR_TYPES).toContain("port");
            expect(typesModule.BASE_MONITOR_TYPES).toContain("ping");
            expect(typesModule.BASE_MONITOR_TYPES).toContain("dns");

            // Test MONITOR_STATUS constant
            expect(typeof typesModule.MONITOR_STATUS).toBe("object");
            expect(typesModule.MONITOR_STATUS.UP).toBe("up");
            expect(typesModule.MONITOR_STATUS.DOWN).toBe("down");
            expect(typesModule.MONITOR_STATUS.PENDING).toBe("pending");
            expect(typesModule.MONITOR_STATUS.PAUSED).toBe("paused");

            // Test DEFAULT_MONITOR_STATUS constant
            expect(typesModule.DEFAULT_MONITOR_STATUS).toBe("pending");

            // Test DEFAULT_SITE_STATUS constant
            expect(typesModule.DEFAULT_SITE_STATUS).toBe("unknown");
        });

        it("should test all monitor types from BASE_MONITOR_TYPES", () => {
            // Ensure all base monitor types are valid in validateMonitor
            for (const monitorType of typesModule.BASE_MONITOR_TYPES) {
                const testMonitor = {
                    id: `test-${monitorType}`,
                    type: monitorType,
                    status: "up" as const,
                    monitoring: true,
                    responseTime: 100,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                };
                expect(typesModule.validateMonitor(testMonitor)).toBe(true);
            }
        });

        it("should test all status values from MONITOR_STATUS", () => {
            // Ensure all monitor status values work with type guards
            const statusValues = Object.values(typesModule.MONITOR_STATUS);

            for (const status of statusValues) {
                expect(typesModule.isMonitorStatus(status)).toBe(true);
                expect(typesModule.isSiteStatus(status)).toBe(true);

                // Test in validateMonitor
                const testMonitor = {
                    id: "test",
                    type: "http" as const,
                    status: status,
                    monitoring: true,
                    responseTime: 100,
                    checkInterval: 30000,
                    timeout: 5000,
                    retryAttempts: 3,
                    history: [],
                };
                expect(typesModule.validateMonitor(testMonitor)).toBe(true);
            }
        });

        it("should test edge cases and comprehensive coverage", () => {
            // Test type guards with various non-string inputs
            const nonStringInputs = [
                null,
                undefined,
                123,
                true,
                [],
                {},
                Symbol("test"),
            ];

            for (const input of nonStringInputs) {
                expect(typesModule.isComputedSiteStatus(input as any)).toBe(
                    false
                );
                expect(typesModule.isMonitorStatus(input as any)).toBe(false);
                expect(typesModule.isSiteStatus(input as any)).toBe(false);
            }

            // Test validateMonitor with various invalid inputs
            const invalidInputs = [
                null,
                undefined,
                "string",
                123,
                true,
                [],
                Symbol("test"),
            ];

            for (const input of invalidInputs) {
                expect(typesModule.validateMonitor(input as any)).toBe(false);
            }

            // Test validateMonitor with partial objects
            const partialObjects = [
                { id: "test" },
                { id: "test", type: "http" as const },
                { id: "test", type: "http" as const, status: "up" as const },
                {
                    id: "test",
                    type: "http" as const,
                    status: "up" as const,
                    monitoring: true,
                },
                {
                    id: "test",
                    type: "http" as const,
                    status: "up" as const,
                    monitoring: true,
                    responseTime: 100,
                },
            ];

            for (const obj of partialObjects) {
                expect(typesModule.validateMonitor(obj)).toBe(false);
            }
        });
    });
});
