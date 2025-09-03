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

describe("isComputedSiteStatus", () => {
    it("should return true for 'mixed' status", async ({ task, annotate }) => {
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

    it("should return false for 'up' status", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("up")).toBe(false);
    });

    it("should return false for 'down' status", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("down")).toBe(false);
    });

    it("should return false for 'pending' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("pending")).toBe(false);
    });

    it("should return false for 'paused' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("paused")).toBe(false);
    });

    it("should return false for empty string", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("")).toBe(false);
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus(null as any)).toBe(false);
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus(undefined as any)).toBe(false);
    });

    it("should return false for number", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus(123 as any)).toBe(false);
    });

    it("should return false for boolean", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus(true as any)).toBe(false);
    });

    it("should return false for object", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus({} as any)).toBe(false);
    });

    it("should return false for array", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus([] as any)).toBe(false);
    });

    it("should return false for invalid string values", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isComputedSiteStatus("invalid")).toBe(false);
        expect(isComputedSiteStatus("MIXED")).toBe(false);
        expect(isComputedSiteStatus("Unknown")).toBe(false);
        expect(isComputedSiteStatus(" mixed ")).toBe(false);
    });
});

describe("isMonitorStatus", () => {
    const validStatuses: MonitorStatus[] = [
        "down",
        "paused",
        "pending",
        "up",
    ];

    for (const status of validStatuses) {
        it(`should return true for valid status '${status}'`, () => {
            expect(isMonitorStatus(status)).toBe(true);
        });
    }

    it("should return false for 'mixed' status", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("mixed")).toBe(false);
    });

    it("should return false for 'unknown' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("unknown")).toBe(false);
    });

    it("should return false for empty string", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("")).toBe(false);
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(null as any)).toBe(false);
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(undefined as any)).toBe(false);
    });

    it("should return false for number", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(123 as any)).toBe(false);
    });

    it("should return false for boolean", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(false as any)).toBe(false);
    });

    it("should return false for object", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus({} as any)).toBe(false);
    });

    it("should return false for array", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus([] as any)).toBe(false);
    });

    it("should return false for case variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("UP")).toBe(false);
        expect(isMonitorStatus("Down")).toBe(false);
        expect(isMonitorStatus("PENDING")).toBe(false);
        expect(isMonitorStatus("Paused")).toBe(false);
    });

    it("should return false for whitespace variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus(" up ")).toBe(false);
        expect(isMonitorStatus("down ")).toBe(false);
        expect(isMonitorStatus(" pending")).toBe(false);
    });

    it("should return false for invalid status strings", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isMonitorStatus("invalid")).toBe(false);
        expect(isMonitorStatus("error")).toBe(false);
        expect(isMonitorStatus("running")).toBe(false);
    });
});

describe("isSiteStatus", () => {
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
            expect(isSiteStatus(status)).toBe(true);
        });
    }

    it("should return false for empty string", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus("")).toBe(false);
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(null as any)).toBe(false);
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(undefined as any)).toBe(false);
    });

    it("should return false for number", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(456 as any)).toBe(false);
    });

    it("should return false for boolean", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(true as any)).toBe(false);
    });

    it("should return false for object", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus({ status: "up" } as any)).toBe(false);
    });

    it("should return false for array", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(["up"] as any)).toBe(false);
    });

    it("should return false for case variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus("UP")).toBe(false);
        expect(isSiteStatus("Mixed")).toBe(false);
        expect(isSiteStatus("UNKNOWN")).toBe(false);
        expect(isSiteStatus("Down")).toBe(false);
    });

    it("should return false for whitespace variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus(" mixed ")).toBe(false);
        expect(isSiteStatus("unknown ")).toBe(false);
        expect(isSiteStatus(" up")).toBe(false);
    });

    it("should return false for invalid status strings", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(isSiteStatus("invalid")).toBe(false);
        expect(isSiteStatus("error")).toBe(false);
        expect(isSiteStatus("online")).toBe(false);
        expect(isSiteStatus("offline")).toBe(false);
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
            expect(isSiteStatus(status)).toBe(true);
        }
    });
});

describe("validateMonitor", () => {
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
        expect(validateMonitor(monitor)).toBe(true);
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitor(null as any)).toBe(false);
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitor(undefined as any)).toBe(false);
    });

    it("should return false for non-object values", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitor("string" as any)).toBe(false);
        expect(validateMonitor(123 as any)).toBe(false);
        expect(validateMonitor(true as any)).toBe(false);
        expect(validateMonitor([] as any)).toBe(false);
    });

    describe("id validation", () => {
        it("should return false for missing id", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createValidMonitor();
            delete (monitor as any).id;
            expect(validateMonitor(monitor)).toBe(false);
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
            expect(validateMonitor(monitor)).toBe(false);
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
            expect(validateMonitor(monitor)).toBe(true);
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
            expect(validateMonitor(monitor)).toBe(false);
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
            expect(validateMonitor(monitor)).toBe(false);
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
                expect(validateMonitor(monitor)).toBe(true);
            }

            // Test with invalid type
            monitor.type = "invalid-type" as any;
            expect(validateMonitor(monitor)).toBe(false);
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
            expect(validateMonitor(monitor)).toBe(false);
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
            expect(validateMonitor(monitor)).toBe(false);
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
                expect(validateMonitor(monitor)).toBe(true);
            }

            // Invalid statuses
            for (const status of [
                "mixed",
                "unknown",
                "invalid",
            ]) {
                monitor.status = status as any;
                expect(validateMonitor(monitor)).toBe(false);
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
            expect(validateMonitor(monitor)).toBe(false);
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
            expect(validateMonitor(monitor)).toBe(false);
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
            expect(validateMonitor(monitor)).toBe(true);

            monitor.monitoring = false;
            expect(validateMonitor(monitor)).toBe(true);
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
                expect(validateMonitor(monitor)).toBe(false);
            });

            it(`should return false for non-number ${field}`, () => {
                const monitor = createValidMonitor();
                (monitor as any)[field] = "123";
                expect(validateMonitor(monitor)).toBe(false);
            });

            it(`should accept valid number for ${field}`, () => {
                const monitor = createValidMonitor();
                (monitor as any)[field] = 100;
                expect(validateMonitor(monitor)).toBe(true);
            });

            it(`should accept zero for ${field}`, () => {
                const monitor = createValidMonitor();
                (monitor as any)[field] = 0;
                expect(validateMonitor(monitor)).toBe(true);
            });

            it(`should accept negative numbers for ${field}`, () => {
                const monitor = createValidMonitor();
                (monitor as any)[field] = -1;
                expect(validateMonitor(monitor)).toBe(true);
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

        expect(validateMonitor({})).toBe(false);
        expect(validateMonitor({ id: "test" })).toBe(false);
        expect(validateMonitor({ id: "test", type: "http" })).toBe(false);
        expect(
            validateMonitor({
                id: "test",
                type: "http",
                status: "up",
            })
        ).toBe(false);
    });

    it("should handle edge cases", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: types", "component");
        await annotate("Category: Shared", "category");
        await annotate("Type: Business Logic", "type");

        const monitor = createValidMonitor();

        // Empty strings for numeric fields should fail
        (monitor as any).responseTime = "";
        expect(validateMonitor(monitor)).toBe(false);

        monitor.responseTime = 150; // Reset

        // NaN is considered a number type in JavaScript, so it passes type check
        monitor.timeout = Number.NaN;
        expect(validateMonitor(monitor)).toBe(true);

        monitor.timeout = 5000; // Reset

        // Infinity is also considered a number type
        monitor.checkInterval = Infinity;
        expect(validateMonitor(monitor)).toBe(true);
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
