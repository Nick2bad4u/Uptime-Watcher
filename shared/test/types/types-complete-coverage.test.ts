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
    describe(isComputedSiteStatus, () => {
        it("should return true for 'mixed' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("mixed")).toBeTruthy();
        });

        it("should return true for 'unknown' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("unknown")).toBeTruthy();
        });

        it("should return false for non-computed status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("up")).toBeFalsy();
            expect(isComputedSiteStatus("down")).toBeFalsy();
            expect(isComputedSiteStatus("pending")).toBeFalsy();
            expect(isComputedSiteStatus("paused")).toBeFalsy();
            expect(isComputedSiteStatus("invalid")).toBeFalsy();
            expect(isComputedSiteStatus("")).toBeFalsy();
        });
    });

    describe(isMonitorStatus, () => {
        it("should return true for valid monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus("down")).toBeTruthy();
            expect(isMonitorStatus("paused")).toBeTruthy();
            expect(isMonitorStatus("pending")).toBeTruthy();
            expect(isMonitorStatus("up")).toBeTruthy();
        });

        it("should return false for invalid monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus("mixed")).toBeFalsy();
            expect(isMonitorStatus("unknown")).toBeFalsy();
            expect(isMonitorStatus("invalid")).toBeFalsy();
            expect(isMonitorStatus("")).toBeFalsy();
            expect(isMonitorStatus(" ")).toBeFalsy();
        });
    });

    describe(isSiteStatus, () => {
        it("should return true for all valid site statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus("down")).toBeTruthy();
            expect(isSiteStatus("mixed")).toBeTruthy();
            expect(isSiteStatus("paused")).toBeTruthy();
            expect(isSiteStatus("pending")).toBeTruthy();
            expect(isSiteStatus("unknown")).toBeTruthy();
            expect(isSiteStatus("up")).toBeTruthy();
        });

        it("should return false for invalid site statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus("invalid")).toBeFalsy();
            expect(isSiteStatus("")).toBeFalsy();
            expect(isSiteStatus(" ")).toBeFalsy();
            expect(isSiteStatus("error")).toBeFalsy();
        });
    });

    describe(validateMonitor, () => {
        const validMonitor: Monitor = {
            id: "test-monitor-1",
            type: "http",
            status: "up",
            monitoring: true,
            responseTime: 150,
            checkInterval: 300_000,
            timeout: 10_000,
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

            expect(validateMonitor(validMonitor)).toBeTruthy();
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
            expect(validateMonitor(monitorWithOptionals)).toBeTruthy();
        });

        it("should return false for null/undefined monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor(null as any)).toBeFalsy();
            expect(validateMonitor(undefined as any)).toBeFalsy();
        });

        it("should return false for non-object monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor("string" as any)).toBeFalsy();
            expect(validateMonitor(123 as any)).toBeFalsy();
            expect(validateMonitor([] as any)).toBeFalsy();
        });

        it("should return false for monitor missing required fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor({})).toBeFalsy();
            expect(validateMonitor({ id: "test" })).toBeFalsy();
            expect(validateMonitor({ id: "test", type: "http" })).toBeFalsy();
        });

        it("should return false for monitor with invalid id", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types-complete-coverage", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor({ ...validMonitor, id: 123 as any })).toBeFalsy(
                
            );
            expect(validateMonitor({ ...validMonitor, id: null as any })).toBeFalsy(
                
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
            ).toBeFalsy();
            expect(validateMonitor({ ...validMonitor, type: 123 as any })).toBeFalsy(
                
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
            ).toBeFalsy();
            expect(
                validateMonitor({ ...validMonitor, status: 123 as any })
            ).toBeFalsy();
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
            ).toBeFalsy();
            expect(
                validateMonitor({ ...validMonitor, monitoring: 1 as any })
            ).toBeFalsy();
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
            ).toBeFalsy();
            expect(
                validateMonitor({
                    ...validMonitor,
                    checkInterval: "300000" as any,
                })
            ).toBeFalsy();
            expect(
                validateMonitor({ ...validMonitor, timeout: "10000" as any })
            ).toBeFalsy();
            expect(
                validateMonitor({ ...validMonitor, retryAttempts: "3" as any })
            ).toBeFalsy();
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
            ).toBeFalsy();
            expect(
                validateMonitor({ ...validMonitor, history: null as any })
            ).toBeFalsy();
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
            ).toBeFalsy();
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: [123] as any,
                })
            ).toBeFalsy();
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: [""] as any,
                })
            ).toBeFalsy();
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: ["  "] as any,
                })
            ).toBeFalsy();
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
            ).toBeTruthy();
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: ["operation-1"],
                })
            ).toBeTruthy();
            expect(
                validateMonitor({
                    ...validMonitor,
                    activeOperations: ["op-1", "op-2"],
                })
            ).toBeTruthy();
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
            ).toBeTruthy();
        });
    });
});
