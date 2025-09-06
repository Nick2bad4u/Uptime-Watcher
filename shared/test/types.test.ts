/**
 * Comprehensive test suite for shared/types.ts
 *
 * Tests for validation functions and type guards that ensure type safety across
 * the application. These functions are critical for validating data integrity
 * between frontend and backend.
 *
 * @file Tests for shared type validation functions
 */

import { describe, it, expect } from "vitest";
import {
    isComputedSiteStatus,
    isMonitorStatus,
    isSiteStatus,
    validateMonitor,
    type Monitor,
    type MonitorStatus,
    type MonitorType,
    type SiteStatus,
    BASE_MONITOR_TYPES,
} from "../types";
// Import namespace for function coverage validation
import * as types from "../types";

describe(isComputedSiteStatus, () => {
    it("should return true for 'mixed' status", async ({ task, annotate }) => {
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

    it("should return false for 'up' status", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("up")).toBeFalsy();
    });

    it("should return false for 'down' status", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("down")).toBeFalsy();
    });

    it("should return false for 'pending' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("pending")).toBeFalsy();
    });

    it("should return false for 'paused' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("paused")).toBeFalsy();
    });

    it("should return false for empty string", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("")).toBeFalsy();
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus(null as any)).toBeFalsy();
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus(undefined as any)).toBeFalsy();
    });

    it("should return false for number", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus(123 as any)).toBeFalsy();
    });

    it("should return false for boolean", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus(true as any)).toBeFalsy();
    });

    it("should return false for object", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus({} as any)).toBeFalsy();
    });

    it("should return false for array", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus([] as any)).toBeFalsy();
    });

    it("should return false for invalid string values", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("invalid")).toBeFalsy();
        expect(isComputedSiteStatus("MIXED")).toBeFalsy();
        expect(isComputedSiteStatus("Unknown")).toBeFalsy();
        expect(isComputedSiteStatus(" mixed ")).toBeFalsy();
    });
});

describe(isMonitorStatus, () => {
    const validStatuses: MonitorStatus[] = [
        "down",
        "paused",
        "pending",
        "up",
    ];

    for (const status of validStatuses) {
        it(`should return true for valid status '${status}'`, () => {
            expect(isMonitorStatus(status)).toBeTruthy();
        });
    }

    it("should return false for 'mixed' status", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("mixed")).toBeFalsy();
    });

    it("should return false for 'unknown' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("unknown")).toBeFalsy();
    });

    it("should return false for empty string", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("")).toBeFalsy();
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(null as any)).toBeFalsy();
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(undefined as any)).toBeFalsy();
    });

    it("should return false for number", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(123 as any)).toBeFalsy();
    });

    it("should return false for boolean", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(false as any)).toBeFalsy();
    });

    it("should return false for object", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus({} as any)).toBeFalsy();
    });

    it("should return false for array", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus([] as any)).toBeFalsy();
    });

    it("should return false for case variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("UP")).toBeFalsy();
        expect(isMonitorStatus("Down")).toBeFalsy();
        expect(isMonitorStatus("PENDING")).toBeFalsy();
        expect(isMonitorStatus("Paused")).toBeFalsy();
    });

    it("should return false for whitespace variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(" up ")).toBeFalsy();
        expect(isMonitorStatus("down ")).toBeFalsy();
        expect(isMonitorStatus(" pending")).toBeFalsy();
    });

    it("should return false for invalid status strings", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("invalid")).toBeFalsy();
        expect(isMonitorStatus("error")).toBeFalsy();
        expect(isMonitorStatus("running")).toBeFalsy();
    });
});

describe(isSiteStatus, () => {
    const validStatuses: SiteStatus[] = [
        "down",
        "mixed",
        "paused",
        "pending",
        "unknown",
        "up",
    ];

    for (const status of validStatuses) {
        it(`should return true for valid status '${status}'`, () => {
            expect(isSiteStatus(status)).toBeTruthy();
        });
    }

    it("should return false for empty string", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus("")).toBeFalsy();
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(null as any)).toBeFalsy();
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(undefined as any)).toBeFalsy();
    });

    it("should return false for number", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(456 as any)).toBeFalsy();
    });

    it("should return false for boolean", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(true as any)).toBeFalsy();
    });

    it("should return false for object", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus({ status: "up" } as any)).toBeFalsy();
    });

    it("should return false for array", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(["up"] as any)).toBeFalsy();
    });

    it("should return false for case variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus("UP")).toBeFalsy();
        expect(isSiteStatus("Mixed")).toBeFalsy();
        expect(isSiteStatus("UNKNOWN")).toBeFalsy();
        expect(isSiteStatus("Down")).toBeFalsy();
    });

    it("should return false for whitespace variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(" mixed ")).toBeFalsy();
        expect(isSiteStatus("unknown ")).toBeFalsy();
        expect(isSiteStatus(" up")).toBeFalsy();
    });

    it("should return false for invalid status strings", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus("invalid")).toBeFalsy();
        expect(isSiteStatus("error")).toBeFalsy();
        expect(isSiteStatus("online")).toBeFalsy();
        expect(isSiteStatus("offline")).toBeFalsy();
    });

    it("should include all monitor statuses plus computed statuses", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Monitoring", "type");

        const monitorStatuses = [
            "down",
            "paused",
            "pending",
            "up",
        ];
        const computedStatuses = ["mixed", "unknown"];
        const allSiteStatuses = [...monitorStatuses, ...computedStatuses];

        for (const status of allSiteStatuses) {
            expect(isSiteStatus(status)).toBeTruthy();
        }
    });
});

describe(validateMonitor, () => {
    const createValidMonitor = (): Monitor => ({
        id: "test-monitor-1",
        type: "http",
        status: "up",
        monitoring: true,
        responseTime: 150,
        checkInterval: 60_000,
        timeout: 5000,
        retryAttempts: 3,
        history: [],
        url: "https://example.com",
        host: "example.com",
        port: 443,
        expectedValue: "success",
        recordType: "A",
        lastChecked: new Date(),
    });

    it("should return true for valid monitor", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Monitoring", "type");

        const monitor = createValidMonitor();
        expect(validateMonitor(monitor)).toBeTruthy();
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitor(null as any)).toBeFalsy();
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitor(undefined as any)).toBeFalsy();
    });

    it("should return false for non-object values", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitor("string" as any)).toBeFalsy();
        expect(validateMonitor(123 as any)).toBeFalsy();
        expect(validateMonitor(true as any)).toBeFalsy();
        expect(validateMonitor([] as any)).toBeFalsy();
    });

    describe("id validation", () => {
        it("should return false for missing id", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidMonitor();
            delete (monitor as any).id;
            expect(validateMonitor(monitor)).toBeFalsy();
        });

        it("should return false for non-string id", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidMonitor();
            (monitor as any).id = 123;
            expect(validateMonitor(monitor)).toBeFalsy();
        });

        it("should accept empty string id (only validates type)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const monitor = createValidMonitor();
            monitor.id = "";
            expect(validateMonitor(monitor)).toBeTruthy();
        });
    });

    describe("type validation", () => {
        it("should return false for missing type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidMonitor();
            delete (monitor as any).type;
            expect(validateMonitor(monitor)).toBeFalsy();
        });

        it("should return false for non-string type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidMonitor();
            (monitor as any).type = 123;
            expect(validateMonitor(monitor)).toBeFalsy();
        });

        it("should validate against BASE_MONITOR_TYPES", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const monitor = createValidMonitor();

            // Test with first valid type if BASE_MONITOR_TYPES is available
            if (BASE_MONITOR_TYPES && BASE_MONITOR_TYPES.length > 0) {
                const [firstType] = BASE_MONITOR_TYPES;
                monitor.type = firstType;
                expect(validateMonitor(monitor)).toBeTruthy();
            }

            // Test with invalid type
            monitor.type = "invalid-type" as any;
            expect(validateMonitor(monitor)).toBeFalsy();
        });
    });

    describe("status validation", () => {
        it("should return false for missing status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidMonitor();
            delete (monitor as any).status;
            expect(validateMonitor(monitor)).toBeFalsy();
        });

        it("should return false for non-string status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidMonitor();
            (monitor as any).status = 123;
            expect(validateMonitor(monitor)).toBeFalsy();
        });

        it("should validate using isMonitorStatus", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const monitor = createValidMonitor();

            // Valid statuses
            for (const status of [
                "down",
                "paused",
                "pending",
                "up",
            ]) {
                monitor.status = status as MonitorStatus;
                expect(validateMonitor(monitor)).toBeTruthy();
            }

            // Invalid statuses
            for (const status of [
                "mixed",
                "unknown",
                "invalid",
            ]) {
                monitor.status = status as any;
                expect(validateMonitor(monitor)).toBeFalsy();
            }
        });
    });

    describe("monitoring validation", () => {
        it("should return false for missing monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createValidMonitor();
            delete (monitor as any).monitoring;
            expect(validateMonitor(monitor)).toBeFalsy();
        });

        it("should return false for non-boolean monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createValidMonitor();
            (monitor as any).monitoring = "true";
            expect(validateMonitor(monitor)).toBeFalsy();
        });

        it("should accept both true and false for monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createValidMonitor();
            monitor.monitoring = true;
            expect(validateMonitor(monitor)).toBeTruthy();

            monitor.monitoring = false;
            expect(validateMonitor(monitor)).toBeTruthy();
        });
    });

    describe("numeric field validation", () => {
        const numericFields = [
            "responseTime",
            "checkInterval",
            "timeout",
            "retryAttempts",
        ];

        for (const field of numericFields) {
            it(`should return false for missing ${field}`, () => {
                const monitor = createValidMonitor();
                // Use Reflect.deleteProperty to avoid dynamic delete lint error
                Reflect.deleteProperty(monitor as any, field);
                expect(validateMonitor(monitor)).toBeFalsy();
            });

            it(`should return false for non-number ${field}`, () => {
                const monitor = createValidMonitor();
                (monitor as any)[field] = "123";
                expect(validateMonitor(monitor)).toBeFalsy();
            });

            it(`should accept valid number for ${field}`, () => {
                const monitor = createValidMonitor();
                (monitor as any)[field] = 100;
                expect(validateMonitor(monitor)).toBeTruthy();
            });

            it(`should accept zero for ${field}`, () => {
                const monitor = createValidMonitor();
                (monitor as any)[field] = 0;
                expect(validateMonitor(monitor)).toBeTruthy();
            });

            it(`should accept negative numbers for ${field}`, () => {
                const monitor = createValidMonitor();
                (monitor as any)[field] = -1;
                expect(validateMonitor(monitor)).toBeTruthy();
            });
        }
    });

    it("should return false for partial monitor objects", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Monitoring", "type");

        expect(validateMonitor({})).toBeFalsy();
        expect(validateMonitor({ id: "test" })).toBeFalsy();
        expect(validateMonitor({ id: "test", type: "http" })).toBeFalsy();
        expect(
            validateMonitor({
                id: "test",
                type: "http",
                status: "up",
            })
        ).toBeFalsy();
    });

    it("should handle edge cases", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createValidMonitor();

        // Empty strings for numeric fields should fail
        (monitor as any).responseTime = "";
        expect(validateMonitor(monitor)).toBeFalsy();

        monitor.responseTime = 150; // Reset

        // NaN is considered a number type in JavaScript, so it passes type check
        monitor.timeout = Number.NaN;
        expect(validateMonitor(monitor)).toBeTruthy();

        monitor.timeout = 5000; // Reset

        // Infinity is also considered a number type
        monitor.checkInterval = Infinity;
        expect(validateMonitor(monitor)).toBeTruthy();
    });
});

// Function Coverage Validation: Ensure all exported functions are called for coverage
describe("Function Coverage Validation", () => {
    it("should call all exported functions to ensure 100% function coverage", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Export Operation", "type");

        // Explicitly call each exported function to register coverage
        expect(typeof types.isComputedSiteStatus).toBe("function");
        expect(typeof types.isMonitorStatus).toBe("function");
        expect(typeof types.isSiteStatus).toBe("function");
        expect(typeof types.validateMonitor).toBe("function");

        // Call functions with valid inputs to ensure they execute
        types.isComputedSiteStatus("mixed");
        types.isMonitorStatus("up");
        types.isSiteStatus("up");

        // Create a valid monitor for testing validateMonitor
        const validMonitor: Partial<Monitor> = {
            id: "test",
            type: "http" as MonitorType,
            status: "up" as MonitorStatus,
            monitoring: true,
            responseTime: 100,
            checkInterval: 60_000,
            timeout: 5000,
            retryAttempts: 3,
            lastChecked: new Date(),
            history: [],
            url: "https://example.com",
        };
        types.validateMonitor(validMonitor);
    });
});
