/**
 * Comprehensive tests for shared/types.ts functions to achieve complete
 * function coverage
 */
import { describe, expect, it } from "vitest";

import {
    isComputedSiteStatus,
    isMonitorStatus,
    isSiteStatus,
    type Monitor,
    validateMonitor,
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

            expect(isComputedSiteStatus(null)).toBeFalsy();
            expect(isComputedSiteStatus(undefined)).toBeFalsy();
            expect(isComputedSiteStatus(123)).toBeFalsy();
            expect(isComputedSiteStatus(true)).toBeFalsy();
            expect(isComputedSiteStatus({})).toBeFalsy();
            expect(isComputedSiteStatus([])).toBeFalsy();
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

            expect(isMonitorStatus(null)).toBeFalsy();
            expect(isMonitorStatus(undefined)).toBeFalsy();
            expect(isMonitorStatus(123)).toBeFalsy();
            expect(isMonitorStatus(true)).toBeFalsy();
            expect(isMonitorStatus({})).toBeFalsy();
            expect(isMonitorStatus([])).toBeFalsy();
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

            expect(isSiteStatus(null)).toBeFalsy();
            expect(isSiteStatus(undefined)).toBeFalsy();
            expect(isSiteStatus(123)).toBeFalsy();
            expect(isSiteStatus(true)).toBeFalsy();
            expect(isSiteStatus({})).toBeFalsy();
            expect(isSiteStatus([])).toBeFalsy();
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

        const createMonitorCandidate = (
            overrides: Record<string, unknown> = {}
        ): Record<string, unknown> => ({
            ...validMonitor,
            ...overrides,
        });

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

            const monitorWithUndefinedOps = createMonitorCandidate();
            delete monitorWithUndefinedOps["activeOperations"];
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

            const invalidMonitor = createMonitorCandidate();
            delete invalidMonitor["id"];
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

            const invalidMonitor = createMonitorCandidate({ id: 123 });
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

            const invalidMonitor = createMonitorCandidate();
            delete invalidMonitor["type"];
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = createMonitorCandidate({
                type: "invalid-type",
            });
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

            const invalidMonitor = createMonitorCandidate({
                status: "invalid-status",
            });
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

            const invalidMonitor = createMonitorCandidate({
                monitoring: "true",
            });
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

            const invalidMonitor = createMonitorCandidate({
                responseTime: "150",
            });
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

            const invalidMonitor = createMonitorCandidate({
                checkInterval: "60000",
            });
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

            const invalidMonitor = createMonitorCandidate({
                timeout: "5000",
            });
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

            const invalidMonitor = createMonitorCandidate({
                retryAttempts: "3",
            });
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

            const invalidMonitor = createMonitorCandidate({
                history: "[]",
            });
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

            const invalidMonitor = createMonitorCandidate({
                activeOperations: [
                    "valid",
                    123,
                    "invalid",
                ], // Contains non-string
            });
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
                    " ".repeat(3),
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

            const invalidMonitor = createMonitorCandidate({
                activeOperations: "not-an-array",
            });
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

            expect(validateMonitor(null)).toBeFalsy();
            expect(validateMonitor(undefined)).toBeFalsy();
            expect(validateMonitor({})).toBeFalsy();
            expect(validateMonitor("not an object")).toBeFalsy();
            expect(validateMonitor(123)).toBeFalsy();
        });
    });
});
