/**
 * @fileoverview Tests for shared/types.ts functions
 */

import { describe, expect, it } from "vitest";

import {
    isComputedSiteStatus,
    isMonitorStatus,
    isSiteStatus,
    validateMonitor,
    type MonitorStatus,
    type Monitor,
    type SiteStatus,
    type ComputedSiteStatus,
    BASE_MONITOR_TYPES,
    MONITOR_STATUS,
    DEFAULT_MONITOR_STATUS,
    DEFAULT_SITE_STATUS,
} from "../types";

describe("shared/types.ts main functions", () => {
    describe("validateMonitor", () => {
        it("should return true for valid monitor with undefined activeOperations", () => {
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
                // activeOperations is undefined
            };

            // First check the actual validation
            const result = validateMonitor(validMonitor);
            expect(result).toBe(true);
        });
    });
});

describe("shared/types.ts function coverage", () => {
    describe("isComputedSiteStatus", () => {
        it("should return true for 'mixed' status", () => {
            expect(isComputedSiteStatus("mixed")).toBe(true);
        });

        it("should return true for 'unknown' status", () => {
            expect(isComputedSiteStatus("unknown")).toBe(true);
        });

        it("should return false for monitor status values", () => {
            expect(isComputedSiteStatus("up")).toBe(false);
            expect(isComputedSiteStatus("down")).toBe(false);
            expect(isComputedSiteStatus("pending")).toBe(false);
            expect(isComputedSiteStatus("paused")).toBe(false);
        });

        it("should return false for invalid status values", () => {
            expect(isComputedSiteStatus("invalid")).toBe(false);
            expect(isComputedSiteStatus("")).toBe(false);
            expect(isComputedSiteStatus("online")).toBe(false);
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
            expect(isMonitorStatus("up")).toBe(true);
            expect(isMonitorStatus("down")).toBe(true);
            expect(isMonitorStatus("pending")).toBe(true);
            expect(isMonitorStatus("paused")).toBe(true);
        });

        it("should return false for invalid monitor statuses", () => {
            expect(isMonitorStatus("mixed")).toBe(false);
            expect(isMonitorStatus("unknown")).toBe(false);
            expect(isMonitorStatus("invalid")).toBe(false);
            expect(isMonitorStatus("")).toBe(false);
            expect(isMonitorStatus("online")).toBe(false);
            expect(isMonitorStatus("offline")).toBe(false);
        });

        it("should return false for non-string values", () => {
            expect(isMonitorStatus(null as any)).toBe(false);
            expect(isMonitorStatus(undefined as any)).toBe(false);
            expect(isMonitorStatus(123 as any)).toBe(false);
            expect(isMonitorStatus(true as any)).toBe(false);
            expect(isMonitorStatus({} as any)).toBe(false);
            expect(isMonitorStatus([] as any)).toBe(false);
        });

        it("should work with MONITOR_STATUS constants", () => {
            expect(isMonitorStatus(MONITOR_STATUS.UP)).toBe(true);
            expect(isMonitorStatus(MONITOR_STATUS.DOWN)).toBe(true);
            expect(isMonitorStatus(MONITOR_STATUS.PENDING)).toBe(true);
            expect(isMonitorStatus(MONITOR_STATUS.PAUSED)).toBe(true);
        });
    });

    describe("isSiteStatus", () => {
        it("should return true for valid site statuses", () => {
            // Monitor statuses
            expect(isSiteStatus("up")).toBe(true);
            expect(isSiteStatus("down")).toBe(true);
            expect(isSiteStatus("pending")).toBe(true);
            expect(isSiteStatus("paused")).toBe(true);
            
            // Computed site statuses
            expect(isSiteStatus("mixed")).toBe(true);
            expect(isSiteStatus("unknown")).toBe(true);
        });

        it("should return false for invalid site statuses", () => {
            expect(isSiteStatus("invalid")).toBe(false);
            expect(isSiteStatus("")).toBe(false);
            expect(isSiteStatus("online")).toBe(false);
            expect(isSiteStatus("offline")).toBe(false);
            expect(isSiteStatus("active")).toBe(false);
        });

        it("should return false for non-string values", () => {
            expect(isSiteStatus(null as any)).toBe(false);
            expect(isSiteStatus(undefined as any)).toBe(false);
            expect(isSiteStatus(123 as any)).toBe(false);
            expect(isSiteStatus(true as any)).toBe(false);
            expect(isSiteStatus({} as any)).toBe(false);
            expect(isSiteStatus([] as any)).toBe(false);
        });

        it("should work with constants", () => {
            expect(isSiteStatus(DEFAULT_SITE_STATUS)).toBe(true);
            expect(isSiteStatus(DEFAULT_MONITOR_STATUS)).toBe(true);
        });
    });

    describe("validateMonitor", () => {
        it("should return true for valid monitor", () => {
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

            expect(validateMonitor(validMonitor)).toBe(true);
        });

        it("should return true for valid monitor with activeOperations", () => {
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

            expect(validateMonitor(validMonitor)).toBe(true);
        });

        it("should return true for valid monitor with undefined activeOperations", () => {
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
                activeOperations: undefined,
            };

            expect(validateMonitor(validMonitor)).toBe(true);
        });

        it("should return false for monitor with missing id", () => {
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

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid id type", () => {
            const invalidMonitor: any = {
                id: 123, // should be string
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

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with missing type", () => {
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

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid type", () => {
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

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid status", () => {
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

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid monitoring type", () => {
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

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid responseTime type", () => {
            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: "150", // should be number
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid checkInterval type", () => {
            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: "60", // should be number
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid timeout type", () => {
            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: "30", // should be number
                retryAttempts: 3,
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid retryAttempts type", () => {
            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: "3", // should be number
                responseTime: 150,
                history: [],
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid history type", () => {
            const invalidMonitor: any = {
                id: "monitor1",
                type: "http",
                status: "up",
                checkInterval: 60,
                timeout: 30,
                retryAttempts: 3,
                responseTime: 150,
                history: "not-an-array", // should be array
                url: "https://example.com",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with invalid activeOperations", () => {
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
                activeOperations: [""], // contains empty string
            };

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with activeOperations containing empty strings", () => {
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
                activeOperations: ["check", "", "retry"], // contains empty string
            };

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for monitor with non-array activeOperations", () => {
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
                activeOperations: "not-an-array", // should be array
            };

            expect(validateMonitor(invalidMonitor)).toBe(false);
        });

        it("should return false for completely invalid input", () => {
            expect(validateMonitor(null as any)).toBe(false);
            expect(validateMonitor(undefined as any)).toBe(false);
            expect(validateMonitor("string" as any)).toBe(false);
            expect(validateMonitor(123 as any)).toBe(false);
            expect(validateMonitor([] as any)).toBe(false);
        });
    });

    describe("constants validation", () => {
        it("should validate MONITOR_STATUS constants", () => {
            expect(MONITOR_STATUS.UP).toBe("up");
            expect(MONITOR_STATUS.DOWN).toBe("down");
            expect(MONITOR_STATUS.PENDING).toBe("pending");
            expect(MONITOR_STATUS.PAUSED).toBe("paused");
        });

        it("should validate default values", () => {
            expect(DEFAULT_MONITOR_STATUS).toBe("pending");
            expect(DEFAULT_SITE_STATUS).toBe("unknown");
        });

        it("should validate BASE_MONITOR_TYPES", () => {
            expect(BASE_MONITOR_TYPES).toContain("http");
            expect(BASE_MONITOR_TYPES).toContain("port");
            expect(BASE_MONITOR_TYPES).toContain("ping");
            expect(BASE_MONITOR_TYPES).toContain("dns");
        });
    });

    describe("integration tests", () => {
        it("should work with all type guards together", () => {
            const monitorStatuses: MonitorStatus[] = ["up", "down", "pending", "paused"];
            const computedStatuses = ["mixed", "unknown"];
            const allSiteStatuses = [...monitorStatuses, ...computedStatuses];

            // Test all monitor statuses
            for (const status of monitorStatuses) {
                expect(isMonitorStatus(status)).toBe(true);
                expect(isSiteStatus(status)).toBe(true);
                expect(isComputedSiteStatus(status)).toBe(false);
            }

            // Test computed statuses
            for (const status of computedStatuses) {
                expect(isComputedSiteStatus(status)).toBe(true);
                expect(isSiteStatus(status)).toBe(true);
                expect(isMonitorStatus(status)).toBe(false);
            }

            // Test invalid statuses
            const invalidStatuses = ["invalid", "", "online", "offline"];
            for (const status of invalidStatuses) {
                expect(isMonitorStatus(status)).toBe(false);
                expect(isSiteStatus(status)).toBe(false);
                expect(isComputedSiteStatus(status)).toBe(false);
            }
        });

        it("should validate monitors with different types", () => {
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
                    ...(type === "dns" && { host: "example.com", recordType: "A" }),
                };

                expect(validateMonitor(monitor)).toBe(true);
            }
        });
    });
});
