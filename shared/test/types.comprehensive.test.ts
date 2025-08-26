/**
 * Comprehensive tests for shared/types.ts functions to achieve complete
 * function coverage
 */
import { describe, expect, it } from "vitest";
import {
    isComputedSiteStatus,
    isMonitorStatus,
    isSiteStatus,
    validateMonitor,
} from "../types";
import type { Monitor } from "../types";

describe("shared/types type guards and validators", () => {
    describe("isComputedSiteStatus", () => {
        it("should return true for 'mixed' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("mixed")).toBe(true);
        });

        it("should return true for 'unknown' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("unknown")).toBe(true);
        });

        it("should return false for other status values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("up")).toBe(false);
            expect(isComputedSiteStatus("down")).toBe(false);
            expect(isComputedSiteStatus("pending")).toBe(false);
            expect(isComputedSiteStatus("paused")).toBe(false);
            expect(isComputedSiteStatus("invalid")).toBe(false);
            expect(isComputedSiteStatus("")).toBe(false);
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus(null as any)).toBe(false);
            expect(isComputedSiteStatus(undefined as any)).toBe(false);
            expect(isComputedSiteStatus(123 as any)).toBe(false);
            expect(isComputedSiteStatus(true as any)).toBe(false);
            expect(isComputedSiteStatus({} as any)).toBe(false);
            expect(isComputedSiteStatus([] as any)).toBe(false);
        });
    });

    describe("isMonitorStatus", () => {
        it("should return true for valid monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
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
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus("mixed")).toBe(false);
            expect(isMonitorStatus("unknown")).toBe(false);
            expect(isMonitorStatus("invalid")).toBe(false);
            expect(isMonitorStatus("")).toBe(false);
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isMonitorStatus(null as any)).toBe(false);
            expect(isMonitorStatus(undefined as any)).toBe(false);
            expect(isMonitorStatus(123 as any)).toBe(false);
            expect(isMonitorStatus(true as any)).toBe(false);
            expect(isMonitorStatus({} as any)).toBe(false);
            expect(isMonitorStatus([] as any)).toBe(false);
        });
    });

    describe("isSiteStatus", () => {
        it("should return true for valid site statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
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
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus("invalid")).toBe(false);
            expect(isSiteStatus("")).toBe(false);
            expect(isSiteStatus("error")).toBe(false);
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus(null as any)).toBe(false);
            expect(isSiteStatus(undefined as any)).toBe(false);
            expect(isSiteStatus(123 as any)).toBe(false);
            expect(isSiteStatus(true as any)).toBe(false);
            expect(isSiteStatus({} as any)).toBe(false);
            expect(isSiteStatus([] as any)).toBe(false);
        });
    });

    describe("validateMonitor", () => {
        const validMonitor: Monitor = {
            id: "test-monitor-id",
            type: "http",
            status: "up",
            monitoring: true,
            responseTime: 150,
            checkInterval: 60000,
            timeout: 5000,
            retryAttempts: 3,
            history: [],
        };

        it("should return true for valid monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(validateMonitor(validMonitor)).toBe(true);
        });

        it("should return true for valid monitor with activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitorWithActiveOps = {
                ...validMonitor,
                activeOperations: ["check", "ping"],
            };
            expect(validateMonitor(monitorWithActiveOps)).toBe(true);
        });

        it("should return true for valid monitor with undefined activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitorWithUndefinedOps = { ...validMonitor };
            delete (monitorWithUndefinedOps as any).activeOperations;
            expect(validateMonitor(monitorWithUndefinedOps)).toBe(true);
        });

        it("should return false for monitor with missing id", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = { ...validMonitor };
            delete (invalidMonitor as any).id;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid id type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = { ...validMonitor, id: 123 } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with missing type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = { ...validMonitor };
            delete (invalidMonitor as any).type;
            expect(validateMonitor(invalidMonitor as any)).toBe(false);
        });

        it("should return false for monitor with invalid type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                type: "invalid-type",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                status: "invalid-status",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid monitoring type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                monitoring: "true",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid responseTime type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                responseTime: "150",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid checkInterval type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                checkInterval: "60000",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid timeout type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = { ...validMonitor, timeout: "5000" } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid retryAttempts type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                retryAttempts: "3",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid history type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = { ...validMonitor, history: "[]" } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                activeOperations: [
                    "valid",
                    123,
                    "invalid",
                ], // Contains non-string
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with activeOperations containing empty strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                activeOperations: [
                    "valid",
                    "",
                    "   ",
                ], // Contains empty/whitespace strings
            };
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with non-array activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                ...validMonitor,
                activeOperations: "not-an-array",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for completely invalid input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitor(null as any)).toBe(false);
            expect(validateMonitor(undefined as any)).toBe(false);
            expect(validateMonitor({} as any)).toBe(false);
            expect(validateMonitor("not an object" as any)).toBe(false);
            expect(validateMonitor(123 as any)).toBe(false);
        });
    });
});
