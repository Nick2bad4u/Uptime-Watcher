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
    type Monitor,
} from "../types";

describe("shared/types type guards and validators", () => {
    describe(isComputedSiteStatus, () => {
        it("should return true for 'mixed' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("mixed")).toBeTruthy();
        });

        it("should return true for 'unknown' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("unknown")).toBeTruthy();
        });

        it("should return false for other status values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("up")).toBeFalsy();
            expect(isComputedSiteStatus("down")).toBeFalsy();
            expect(isComputedSiteStatus("pending")).toBeFalsy();
            expect(isComputedSiteStatus("paused")).toBeFalsy();
            expect(isComputedSiteStatus("invalid")).toBeFalsy();
            expect(isComputedSiteStatus("")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus(null as any)).toBeFalsy();
            expect(isComputedSiteStatus(undefined as any)).toBeFalsy();
            expect(isComputedSiteStatus(123 as any)).toBeFalsy();
            expect(isComputedSiteStatus(true as any)).toBeFalsy();
            expect(isComputedSiteStatus({} as any)).toBeFalsy();
            expect(isComputedSiteStatus([] as any)).toBeFalsy();
        });
    });

    describe(isMonitorStatus, () => {
        it("should return true for valid monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
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
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus("mixed")).toBeFalsy();
            expect(isMonitorStatus("unknown")).toBeFalsy();
            expect(isMonitorStatus("invalid")).toBeFalsy();
            expect(isMonitorStatus("")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isMonitorStatus(null as any)).toBeFalsy();
            expect(isMonitorStatus(undefined as any)).toBeFalsy();
            expect(isMonitorStatus(123 as any)).toBeFalsy();
            expect(isMonitorStatus(true as any)).toBeFalsy();
            expect(isMonitorStatus({} as any)).toBeFalsy();
            expect(isMonitorStatus([] as any)).toBeFalsy();
        });
    });

    describe(isSiteStatus, () => {
        it("should return true for valid site statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
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
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus("invalid")).toBeFalsy();
            expect(isSiteStatus("")).toBeFalsy();
            expect(isSiteStatus("error")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus(null as any)).toBeFalsy();
            expect(isSiteStatus(undefined as any)).toBeFalsy();
            expect(isSiteStatus(123 as any)).toBeFalsy();
            expect(isSiteStatus(true as any)).toBeFalsy();
            expect(isSiteStatus({} as any)).toBeFalsy();
            expect(isSiteStatus([] as any)).toBeFalsy();
        });
    });

    describe(validateMonitor, () => {
        const validMonitor: Monitor = {
            id: "test-monitor-id",
            type: "http",
            status: "up",
            monitoring: true,
            responseTime: 150,
            checkInterval: 60_000,
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

            expect(validateMonitor(validMonitor)).toBeTruthy();
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
            expect(validateMonitor(monitorWithActiveOps)).toBeTruthy();
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
            expect(validateMonitor(monitorWithUndefinedOps)).toBeTruthy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor as any)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
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
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for completely invalid input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitor(null as any)).toBeFalsy();
            expect(validateMonitor(undefined as any)).toBeFalsy();
            expect(validateMonitor({} as any)).toBeFalsy();
            expect(validateMonitor("not an object" as any)).toBeFalsy();
            expect(validateMonitor(123 as any)).toBeFalsy();
        });
    });
});
