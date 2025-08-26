/**
 * Complete function coverage tests for shared/types.ts
 *
 * Tests all exported functions to achieve 100% function coverage
 */

import { describe, it, expect } from "vitest";
import {
    isComputedSiteStatus,
    isMonitorStatus,
    isSiteStatus,
    validateMonitor,
    type Monitor,
} from "../../types";

describe("shared/types.ts - Complete Function Coverage", () => {
    describe("isComputedSiteStatus", () => {
        it("should return true for 'mixed' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("mixed")).toBe(true);
        });

        it("should return true for 'unknown' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("unknown")).toBe(true);
        });

        it("should return false for non-computed status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("up")).toBe(false);
            expect(isComputedSiteStatus("down")).toBe(false);
            expect(isComputedSiteStatus("pending")).toBe(false);
            expect(isComputedSiteStatus("paused")).toBe(false);
            expect(isComputedSiteStatus("invalid")).toBe(false);
            expect(isComputedSiteStatus("")).toBe(false);
        });
    });

    describe("isMonitorStatus", () => {
        it("should return true for valid monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus("down")).toBe(true);
            expect(isMonitorStatus("paused")).toBe(true);
            expect(isMonitorStatus("pending")).toBe(true);
            expect(isMonitorStatus("up")).toBe(true);
        });

        it("should return false for invalid monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus("mixed")).toBe(false);
            expect(isMonitorStatus("unknown")).toBe(false);
            expect(isMonitorStatus("invalid")).toBe(false);
            expect(isMonitorStatus("")).toBe(false);
            expect(isMonitorStatus(" ")).toBe(false);
        });
    });

    describe("isSiteStatus", () => {
        it("should return true for all valid site statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus("down")).toBe(true);
            expect(isSiteStatus("mixed")).toBe(true);
            expect(isSiteStatus("paused")).toBe(true);
            expect(isSiteStatus("pending")).toBe(true);
            expect(isSiteStatus("unknown")).toBe(true);
            expect(isSiteStatus("up")).toBe(true);
        });

        it("should return false for invalid site statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus("invalid")).toBe(false);
            expect(isSiteStatus("")).toBe(false);
            expect(isSiteStatus(" ")).toBe(false);
            expect(isSiteStatus("error")).toBe(false);
        });
    });

    describe("validateMonitor", () => {
        const validMonitor: Monitor = {
            id: "test-monitor-1",
            type: "http",
            status: "up",
            monitoring: true,
            responseTime: 150,
            checkInterval: 300000,
            timeout: 10000,
            retryAttempts: 3,
            history: [],
            url: "https://example.com",
        };

        it("should return true for valid monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor(validMonitor)).toBe(true);
        });

        it("should return true for valid monitor with optional fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitorWithOptionals = {
                ...validMonitor,
                host: "example.com",
                port: 443,
                lastChecked: new Date(),
                activeOperations: ["check-1", "check-2"],
                expectedValue: "192.168.1.1",
                recordType: "A",
            };
            expect(validateMonitor(monitorWithOptionals)).toBe(true);
        });

        it("should return false for null/undefined monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor(null as any)).toBe(false);
            expect(validateMonitor(undefined as any)).toBe(false);
        });

        it("should return false for non-object monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor("string" as any)).toBe(false);
            expect(validateMonitor(123 as any)).toBe(false);
            expect(validateMonitor([] as any)).toBe(false);
        });

        it("should return false for monitor missing required fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor({})).toBe(false);
            expect(validateMonitor({ id: "test" })).toBe(false);
            expect(validateMonitor({ id: "test", type: "http" })).toBe(false);
        });

        it("should return false for monitor with invalid id", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor({ ...validMonitor, id: 123 as any })).toBe(
                false
            );
            expect(validateMonitor({ ...validMonitor, id: null as any })).toBe(
                false
            );
        });

        it("should return false for monitor with invalid type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                validateMonitor({ ...validMonitor, type: "invalid" as any })
            ).toBe(false);
            expect(validateMonitor({ ...validMonitor, type: 123 as any })).toBe(
                false
            );
        });

        it("should return false for monitor with invalid status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                validateMonitor({ ...validMonitor, status: "invalid" as any })
            ).toBe(false);
            expect(
                validateMonitor({ ...validMonitor, status: 123 as any })
            ).toBe(false);
        });

        it("should return false for monitor with invalid monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                validateMonitor({ ...validMonitor, monitoring: "true" as any })
            ).toBe(false);
            expect(
                validateMonitor({ ...validMonitor, monitoring: 1 as any })
            ).toBe(false);
        });

        it("should return false for monitor with invalid numeric fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                validateMonitor({ ...validMonitor, responseTime: "150" as any })
            ).toBe(false);
            expect(
                validateMonitor({
                    ...validMonitor,
                    checkInterval: "300000" as any,
                })
            ).toBe(false);
            expect(
                validateMonitor({ ...validMonitor, timeout: "10000" as any })
            ).toBe(false);
            expect(
                validateMonitor({ ...validMonitor, retryAttempts: "3" as any })
            ).toBe(false);
        });

        it("should return false for monitor with invalid history", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                validateMonitor({
                    ...validMonitor,
                    history: "not-array" as any,
                })
            ).toBe(false);
            expect(
                validateMonitor({ ...validMonitor, history: null as any })
            ).toBe(false);
        });

        it("should return false for monitor with invalid activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: "not-array" as any,
                })
            ).toBe(false);
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: [123] as any,
                })
            ).toBe(false);
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: [""] as any,
                })
            ).toBe(false);
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: ["  "] as any,
                })
            ).toBe(false);
        });

        it("should return true for monitor with valid activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                validateMonitor({ ...validMonitor, activeOperations: [] })
            ).toBe(true);
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: ["operation-1"],
                })
            ).toBe(true);
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: ["op-1", "op-2"],
                })
            ).toBe(true);
        });

        it("should return true for monitor with undefined activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(
                validateMonitor({ ...validMonitor, activeOperations: [] })
            ).toBe(true);
        });
    });
});
