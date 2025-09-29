/**
 * @file Tests for shared/types.ts functions
 */

import { describe, expect, it } from "vitest";

import {
    isComputedSiteStatus,
    isMonitorStatus,
    isSiteStatus,
    validateMonitor,
    type MonitorStatus,
    type Monitor,
    BASE_MONITOR_TYPES,
    MONITOR_STATUS,
    DEFAULT_MONITOR_STATUS,
    DEFAULT_SITE_STATUS,
} from "../types";

describe("shared/types.ts main functions", () => {
    describe(validateMonitor, () => {
        it("should return true for valid monitor with undefined activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const validMonitor: Monitor = {
                id: "monitor3",
                type: "ping" as const,
                status: "up" as MonitorStatus,
                checkInterval: 45,
                timeout: 25,
                retryAttempts: 1,
                responseTime: 75,
                history: [],
                host: "example.com",
                monitoring: true,
                // ActiveOperations is undefined
            };

            // First check the actual validation
            const result = validateMonitor(validMonitor);
            expect(result).toBeTruthy();
        });
    });
});

describe("shared/types.ts function coverage", () => {
    describe(isComputedSiteStatus, () => {
        it("should return true for 'mixed' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("mixed")).toBeTruthy();
        });

        it("should return true for 'unknown' status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("unknown")).toBeTruthy();
        });

        it("should return false for monitor status values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isComputedSiteStatus("up")).toBeFalsy();
            expect(isComputedSiteStatus("down")).toBeFalsy();
            expect(isComputedSiteStatus("pending")).toBeFalsy();
            expect(isComputedSiteStatus("paused")).toBeFalsy();
        });

        it("should return false for invalid status values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isComputedSiteStatus("invalid")).toBeFalsy();
            expect(isComputedSiteStatus("")).toBeFalsy();
            expect(isComputedSiteStatus("online")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
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
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus("up")).toBeTruthy();
            expect(isMonitorStatus("down")).toBeTruthy();
            expect(isMonitorStatus("pending")).toBeTruthy();
            expect(isMonitorStatus("paused")).toBeTruthy();
        });

        it("should return false for invalid monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus("mixed")).toBeFalsy();
            expect(isMonitorStatus("unknown")).toBeFalsy();
            expect(isMonitorStatus("invalid")).toBeFalsy();
            expect(isMonitorStatus("")).toBeFalsy();
            expect(isMonitorStatus("online")).toBeFalsy();
            expect(isMonitorStatus("offline")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isMonitorStatus(null as any)).toBeFalsy();
            expect(isMonitorStatus(undefined as any)).toBeFalsy();
            expect(isMonitorStatus(123 as any)).toBeFalsy();
            expect(isMonitorStatus(true as any)).toBeFalsy();
            expect(isMonitorStatus({} as any)).toBeFalsy();
            expect(isMonitorStatus([] as any)).toBeFalsy();
        });

        it("should work with MONITOR_STATUS constants", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            expect(isMonitorStatus(MONITOR_STATUS.UP)).toBeTruthy();
            expect(isMonitorStatus(MONITOR_STATUS.DOWN)).toBeTruthy();
            expect(isMonitorStatus(MONITOR_STATUS.PENDING)).toBeTruthy();
            expect(isMonitorStatus(MONITOR_STATUS.PAUSED)).toBeTruthy();
        });
    });

    describe(isSiteStatus, () => {
        it("should return true for valid site statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Monitor statuses
            expect(isSiteStatus("up")).toBeTruthy();
            expect(isSiteStatus("down")).toBeTruthy();
            expect(isSiteStatus("pending")).toBeTruthy();
            expect(isSiteStatus("paused")).toBeTruthy();

            // Computed site statuses
            expect(isSiteStatus("mixed")).toBeTruthy();
            expect(isSiteStatus("unknown")).toBeTruthy();
        });

        it("should return false for invalid site statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus("invalid")).toBeFalsy();
            expect(isSiteStatus("")).toBeFalsy();
            expect(isSiteStatus("online")).toBeFalsy();
            expect(isSiteStatus("offline")).toBeFalsy();
            expect(isSiteStatus("active")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus(null as any)).toBeFalsy();
            expect(isSiteStatus(undefined as any)).toBeFalsy();
            expect(isSiteStatus(123 as any)).toBeFalsy();
            expect(isSiteStatus(true as any)).toBeFalsy();
            expect(isSiteStatus({} as any)).toBeFalsy();
            expect(isSiteStatus([] as any)).toBeFalsy();
        });

        it("should work with constants", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isSiteStatus(DEFAULT_SITE_STATUS)).toBeTruthy();
            expect(isSiteStatus(DEFAULT_MONITOR_STATUS)).toBeTruthy();
        });
    });

    describe(validateMonitor, () => {
        it("should return true for valid monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const validMonitor: Monitor = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
                activeOperations: [],
            };

            expect(validateMonitor(validMonitor)).toBeTruthy();
        });

        it("should return true for valid monitor with activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const validMonitor: Monitor = {
                id: "monitor2",
                type: "port",
                status: "up",
                checkInterval: 30,
                timeout: 20,
                retryAttempts: 2,
                responseTime: 50,
                history: [],
                host: "example.com",
                port: 443,
                monitoring: true,
                activeOperations: ["check", "retry"],
            };

            expect(validateMonitor(validMonitor)).toBeTruthy();
        });

        it("should return true for valid monitor with undefined activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const validMonitor: Monitor = {
                id: "monitor1",
                type: "http" as const,
                status: "up" as MonitorStatus,
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
                activeOperations: [],
            };

            expect(validateMonitor(validMonitor)).toBeTruthy();
        });

        it("should return false for monitor with missing id", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: Partial<Monitor> = {
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid id type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: 123, // Should be string
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with missing type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: Partial<Monitor> = {
                id: "monitor1",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "invalid-type",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "invalid-status",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid monitoring type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: "invalid-monitoring",
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid responseTime type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: "150", // Should be number
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid checkInterval type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: "60", // Should be number
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid timeout type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: "30", // Should be number
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid retryAttempts type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: "3", // Should be number
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid history type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: "not-an-array", // Should be array
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with invalid activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
                activeOperations: [""], // Contains empty string
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with activeOperations containing empty strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
                activeOperations: [
                    "check",
                    "",
                    "retry",
                ], // Contains empty string
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for monitor with non-array activeOperations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
                activeOperations: "not-an-array", // Should be array
            };

            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        it("should return false for completely invalid input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitor(null as any)).toBeFalsy();
            expect(validateMonitor(undefined as any)).toBeFalsy();
            expect(validateMonitor("string" as any)).toBeFalsy();
            expect(validateMonitor(123 as any)).toBeFalsy();
            expect(validateMonitor([] as any)).toBeFalsy();
        });
    });

    describe("constants validation", () => {
        it("should validate MONITOR_STATUS constants", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            expect(MONITOR_STATUS.UP).toBe("up");
            expect(MONITOR_STATUS.DOWN).toBe("down");
            expect(MONITOR_STATUS.PENDING).toBe("pending");
            expect(MONITOR_STATUS.PAUSED).toBe("paused");
        });

        it("should validate default values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            expect(DEFAULT_MONITOR_STATUS).toBe("pending");
            expect(DEFAULT_SITE_STATUS).toBe("unknown");
        });

        it("should validate BASE_MONITOR_TYPES", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            expect(BASE_MONITOR_TYPES).toContain("http");
            expect(BASE_MONITOR_TYPES).toContain("ping");
            expect(BASE_MONITOR_TYPES).toContain("port");
            expect(BASE_MONITOR_TYPES).toContain("dns");
            expect(BASE_MONITOR_TYPES).toContain("ssl");
            expect(BASE_MONITOR_TYPES).toContain("websocket-keepalive");
            expect(BASE_MONITOR_TYPES).toContain("server-heartbeat");
            expect(BASE_MONITOR_TYPES).toContain("replication");
            expect(BASE_MONITOR_TYPES).toContain("cdn-edge-consistency");
        });
    });

    describe("integration tests", () => {
        it("should work with all type guards together", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitorStatuses: MonitorStatus[] = [
                "up",
                "down",
                "pending",
                "paused",
            ];
            const computedStatuses = ["mixed", "unknown"];
            const allSiteStatuses = [...monitorStatuses, ...computedStatuses];

            // Verify all site statuses are properly defined
            expect(allSiteStatuses).toHaveLength(6);

            // Test all monitor statuses
            for (const status of monitorStatuses) {
                expect(isMonitorStatus(status)).toBeTruthy();
                expect(isSiteStatus(status)).toBeTruthy();
                expect(isComputedSiteStatus(status)).toBeFalsy();
            }

            // Test computed statuses
            for (const status of computedStatuses) {
                expect(isComputedSiteStatus(status)).toBeTruthy();
                expect(isSiteStatus(status)).toBeTruthy();
                expect(isMonitorStatus(status)).toBeFalsy();
            }

            // Test invalid statuses
            const invalidStatuses = [
                "invalid",
                "",
                "online",
                "offline",
            ];
            for (const status of invalidStatuses) {
                expect(isMonitorStatus(status)).toBeFalsy();
                expect(isSiteStatus(status)).toBeFalsy();
                expect(isComputedSiteStatus(status)).toBeFalsy();
            }
        });

        it("should validate monitors with different types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types.main-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            for (const type of BASE_MONITOR_TYPES) {
                const monitor: Monitor = {
                    id: `monitor-${type}`,
                    type,
                    status: "up",
                    checkInterval: 60,
                    timeout: 30,
                    retryAttempts: 3,
                    responseTime: 150,
                    history: [],
                    monitoring: true,
                    activeOperations: [],
                    ...(type === "http" && { url: "https://example.com" }),
                    ...(type === "port" && { host: "example.com", port: 443 }),
                    ...(type === "ping" && { host: "example.com" }),
                    ...(type === "dns" && {
                        host: "example.com",
                        recordType: "A",
                    }),
                };

                expect(validateMonitor(monitor)).toBeTruthy();
            }
        });
    });
});
