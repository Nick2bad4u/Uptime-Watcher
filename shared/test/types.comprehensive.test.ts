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
        it("should return true for 'mixed' status", () => {
            expect(isComputedSiteStatus("mixed")).toBe(true);
        });

        it("should return true for 'unknown' status", () => {
            expect(isComputedSiteStatus("unknown")).toBe(true);
        });

        it("should return false for other status values", () => {
            expect(isComputedSiteStatus("up")).toBe(false);
            expect(isComputedSiteStatus("down")).toBe(false);
            expect(isComputedSiteStatus("pending")).toBe(false);
            expect(isComputedSiteStatus("paused")).toBe(false);
            expect(isComputedSiteStatus("invalid")).toBe(false);
            expect(isComputedSiteStatus("")).toBe(false);
        });

        it("should return false for non-string values", () => {
            expect(isComputedSiteStatus(null as any)).toBe(false);
            expect(isComputedSiteStatus(undefined as any)).toBe(false);
            expect(isComputedSiteStatus(123 as any)).toBe(false);
            expect(isComputedSiteStatus(true as any)).toBe(false);
            expect(isComputedSiteStatus({} as any)).toBe(false);
            expect(isComputedSiteStatus([] as any)).toBe(false);
        });
    });

    describe("isMonitorStatus", () => {
        it("should return true for valid monitor statuses", () => {
            expect(isMonitorStatus("down")).toBe(true);
            expect(isMonitorStatus("paused")).toBe(true);
            expect(isMonitorStatus("pending")).toBe(true);
            expect(isMonitorStatus("up")).toBe(true);
        });

        it("should return false for invalid monitor statuses", () => {
            expect(isMonitorStatus("mixed")).toBe(false);
            expect(isMonitorStatus("unknown")).toBe(false);
            expect(isMonitorStatus("invalid")).toBe(false);
            expect(isMonitorStatus("")).toBe(false);
        });

        it("should return false for non-string values", () => {
            expect(isMonitorStatus(null as any)).toBe(false);
            expect(isMonitorStatus(undefined as any)).toBe(false);
            expect(isMonitorStatus(123 as any)).toBe(false);
            expect(isMonitorStatus(true as any)).toBe(false);
            expect(isMonitorStatus({} as any)).toBe(false);
            expect(isMonitorStatus([] as any)).toBe(false);
        });
    });

    describe("isSiteStatus", () => {
        it("should return true for valid site statuses", () => {
            expect(isSiteStatus("down")).toBe(true);
            expect(isSiteStatus("mixed")).toBe(true);
            expect(isSiteStatus("paused")).toBe(true);
            expect(isSiteStatus("pending")).toBe(true);
            expect(isSiteStatus("unknown")).toBe(true);
            expect(isSiteStatus("up")).toBe(true);
        });

        it("should return false for invalid site statuses", () => {
            expect(isSiteStatus("invalid")).toBe(false);
            expect(isSiteStatus("")).toBe(false);
            expect(isSiteStatus("error")).toBe(false);
        });

        it("should return false for non-string values", () => {
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

        it("should return true for valid monitor", () => {
            expect(validateMonitor(validMonitor)).toBe(true);
        });

        it("should return true for valid monitor with activeOperations", () => {
            const monitorWithActiveOps = {
                ...validMonitor,
                activeOperations: ["check", "ping"],
            };
            expect(validateMonitor(monitorWithActiveOps)).toBe(true);
        });

        it("should return true for valid monitor with undefined activeOperations", () => {
            const monitorWithUndefinedOps = { ...validMonitor };
            delete (monitorWithUndefinedOps as any).activeOperations;
            expect(validateMonitor(monitorWithUndefinedOps)).toBe(true);
        });

        it("should return false for monitor with missing id", () => {
            const invalidMonitor = { ...validMonitor };
            delete (invalidMonitor as any).id;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid id type", () => {
            const invalidMonitor = { ...validMonitor, id: 123 } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with missing type", () => {
            const invalidMonitor = { ...validMonitor };
            delete (invalidMonitor as any).type;
            expect(validateMonitor(invalidMonitor as any)).toBe(false);
        });

        it("should return false for monitor with invalid type", () => {
            const invalidMonitor = {
                ...validMonitor,
                type: "invalid-type",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid status", () => {
            const invalidMonitor = {
                ...validMonitor,
                status: "invalid-status",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid monitoring type", () => {
            const invalidMonitor = {
                ...validMonitor,
                monitoring: "true",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid responseTime type", () => {
            const invalidMonitor = {
                ...validMonitor,
                responseTime: "150",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid checkInterval type", () => {
            const invalidMonitor = {
                ...validMonitor,
                checkInterval: "60000",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid timeout type", () => {
            const invalidMonitor = { ...validMonitor, timeout: "5000" } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid retryAttempts type", () => {
            const invalidMonitor = {
                ...validMonitor,
                retryAttempts: "3",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid history type", () => {
            const invalidMonitor = { ...validMonitor, history: "[]" } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid activeOperations", () => {
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

        it("should return false for monitor with activeOperations containing empty strings", () => {
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

        it("should return false for monitor with non-array activeOperations", () => {
            const invalidMonitor = {
                ...validMonitor,
                activeOperations: "not-an-array",
            } as any;
            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for completely invalid input", () => {
            expect(validateMonitor(null as any)).toBe(false);
            expect(validateMonitor(undefined as any)).toBe(false);
            expect(validateMonitor({} as any)).toBe(false);
            expect(validateMonitor("not an object" as any)).toBe(false);
            expect(validateMonitor(123 as any)).toBe(false);
        });
    });
});
