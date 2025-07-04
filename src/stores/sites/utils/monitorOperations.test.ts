import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Monitor, MonitorType, Site } from "../../types";
import { ERROR_MESSAGES } from "../../types";
import {
    createDefaultMonitor,
    validateMonitor,
    normalizeMonitor,
    findMonitorInSite,
    updateMonitorInSite,
    addMonitorToSite,
    removeMonitorFromSite,
    validateMonitorExists,
    monitorOperations,
} from "./monitorOperations";

// Mock crypto.randomUUID
const mockUUID = "mock-uuid-123";
const mockCrypto = {
    randomUUID: vi.fn().mockReturnValue(mockUUID),
};

Object.defineProperty(global, "crypto", {
    value: mockCrypto,
    writable: true,
});

describe("monitorOperations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Restore the mock return value after clearing
        mockCrypto.randomUUID.mockReturnValue(mockUUID);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("createDefaultMonitor", () => {
        it("should create a default monitor with default values", () => {
            const monitor = createDefaultMonitor();

            expect(monitor).toEqual({
                checkInterval: 300000,
                history: [],
                id: mockUUID,
                monitoring: true,
                status: "pending",
                type: "http",
            });
            expect(mockCrypto.randomUUID).toHaveBeenCalledOnce();
        });

        it("should create a monitor with overrides", () => {
            const overrides: Partial<Monitor> = {
                id: "custom-id",
                type: "port" as MonitorType,
                status: "up",
                monitoring: false,
                checkInterval: 60000,

                host: "example.com",
                port: 443,
                timeout: 5000,
                retryAttempts: 3,
                responseTime: 250,
                lastChecked: new Date(),
                history: [{ timestamp: Date.now(), status: "up", responseTime: 250 }],
            };

            const monitor = createDefaultMonitor(overrides);

            expect(monitor).toEqual({
                checkInterval: 60000,
                history: overrides.history,
                id: "custom-id",
                monitoring: false,
                status: "up",
                type: "port",

                host: "example.com",
                port: 443,
                timeout: 5000,
                retryAttempts: 3,
                responseTime: 250,
                lastChecked: overrides.lastChecked,
            });
            expect(mockCrypto.randomUUID).not.toHaveBeenCalled();
        });

        it("should handle partial overrides", () => {
            const monitor = createDefaultMonitor({
                status: "down",
                url: "https://test.com",
            });

            expect(monitor).toEqual({
                checkInterval: 300000,
                history: [],
                id: mockUUID,
                monitoring: true,
                status: "down",
                type: "http",
                url: "https://test.com",
            });
        });
    });

    describe("validateMonitor", () => {
        it("should return true for valid monitor", () => {
            const validMonitor: Monitor = {
                id: "test-id",
                type: "http",
                status: "up",
                monitoring: true,
                history: [],
            };

            expect(validateMonitor(validMonitor)).toBe(true);
        });

        it("should return false for missing id", () => {
            const invalidMonitor = {
                type: "http",
                status: "up",
                monitoring: true,
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for invalid id type", () => {
            const invalidMonitor = {
                id: 123,
                type: "http" as MonitorType,
                status: "up" as const,
                monitoring: true,
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for missing type", () => {
            const invalidMonitor = {
                id: "test-id",
                status: "up" as const,
                monitoring: true,
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for invalid type", () => {
            const invalidMonitor = {
                id: "test-id",
                type: 123,
                status: "up" as const,
                monitoring: true,
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for missing status", () => {
            const invalidMonitor = {
                id: "test-id",
                type: "http",
                monitoring: true,
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for invalid status value", () => {
            const invalidMonitor = {
                id: "test-id",
                type: "http" as MonitorType,
                status: "invalid-status",
                monitoring: true,
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for invalid status type", () => {
            const invalidMonitor = {
                id: "test-id",
                type: "http" as MonitorType,
                status: 123,
                monitoring: true,
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for missing monitoring", () => {
            const invalidMonitor = {
                id: "test-id",
                type: "http",
                status: "up",
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for invalid monitoring type", () => {
            const invalidMonitor = {
                id: "test-id",
                type: "http" as MonitorType,
                status: "up",
                monitoring: "true",
                history: [],
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for missing history", () => {
            const invalidMonitor = {
                id: "test-id",
                type: "http",
                status: "up",
                monitoring: true,
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should return false for invalid history type", () => {
            const invalidMonitor = {
                id: "test-id",
                type: "http" as MonitorType,
                status: "up",
                monitoring: true,
                history: "not-an-array",
            };

            expect(validateMonitor(invalidMonitor as unknown as Monitor)).toBe(false);
        });

        it("should validate all valid status values", () => {
            const statusValues = ["pending", "up", "down"];

            statusValues.forEach((status) => {
                const monitor = {
                    id: "test-id",
                    type: "http" as MonitorType,
                    status,
                    monitoring: true,
                    history: [],
                };
                expect(validateMonitor(monitor as unknown as Monitor)).toBe(true);
            });
        });
    });

    describe("normalizeMonitor", () => {
        it("should normalize empty monitor with defaults", () => {
            const result = normalizeMonitor({});

            expect(result).toEqual({
                history: [],
                id: mockUUID,
                status: "pending",
                type: "http",
            });
        });

        it("should preserve valid status values", () => {
            const statusValues = ["pending", "up", "down"] as const;

            statusValues.forEach((status) => {
                const result = normalizeMonitor({ status });
                expect(result.status).toBe(status);
            });
        });

        it("should default invalid status to pending", () => {
            const result = normalizeMonitor({ status: "invalid-status" as unknown as "up" | "down" | "pending" });
            expect(result.status).toBe("pending");
        });

        it("should preserve existing id", () => {
            const existingId = "existing-id";
            const result = normalizeMonitor({ id: existingId });
            expect(result.id).toBe(existingId);
            expect(mockCrypto.randomUUID).not.toHaveBeenCalled();
        });

        it("should preserve existing type", () => {
            const result = normalizeMonitor({ type: "tcp" as MonitorType });
            expect(result.type).toBe("tcp");
        });

        it("should preserve existing history", () => {
            const history = [{ timestamp: Date.now(), status: "up" as const, responseTime: 250 }];
            const result = normalizeMonitor({ history });
            expect(result.history).toBe(history);
        });

        it("should include optional fields when provided", () => {
            const lastChecked = new Date();
            const partialMonitor: Partial<Monitor> = {
                host: "example.com",
                port: 443,
                responseTime: 250,
                lastChecked,
                monitoring: true,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const result = normalizeMonitor(partialMonitor);

            expect(result).toEqual({
                history: [],
                id: mockUUID,
                status: "pending",
                type: "http",

                host: "example.com",
                port: 443,
                responseTime: 250,
                lastChecked,
                monitoring: true,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
            });
        });

        it("should exclude optional fields when undefined", () => {
            const partialMonitor: Partial<Monitor> = {
                url: undefined,
                host: undefined,
                port: undefined,
                responseTime: undefined,
                lastChecked: undefined,
                monitoring: undefined,
                checkInterval: undefined,
                timeout: undefined,
                retryAttempts: undefined,
            };

            const result = normalizeMonitor(partialMonitor);

            expect(result).toEqual({
                history: [],
                id: mockUUID,
                status: "pending",
                type: "http",
            });
        });

        it("should handle mixed defined and undefined optional fields", () => {
            const partialMonitor: Partial<Monitor> = {
                host: undefined,
                port: 443,
                responseTime: undefined,
                monitoring: true,
                checkInterval: undefined,
            };

            const result = normalizeMonitor(partialMonitor);

            expect(result).toEqual({
                history: [],
                id: mockUUID,
                status: "pending",
                type: "http",

                port: 443,
                monitoring: true,
            });
        });
    });

    describe("findMonitorInSite", () => {
        const mockSite: Site = {
            identifier: "site-1",
            name: "Test Site",

            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    history: [],
                },
                {
                    id: "monitor-2",
                    type: "port",
                    status: "down",
                    monitoring: false,
                    history: [],
                },
            ],
        };

        it("should find existing monitor by id", () => {
            const result = findMonitorInSite(mockSite, "monitor-1");
            expect(result).toEqual(mockSite.monitors[0]);
        });

        it("should return undefined for non-existent monitor", () => {
            const result = findMonitorInSite(mockSite, "non-existent");
            expect(result).toBeUndefined();
        });

        it("should handle empty monitors array", () => {
            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };
            const result = findMonitorInSite(siteWithNoMonitors, "monitor-1");
            expect(result).toBeUndefined();
        });

        it("should find monitor among multiple monitors", () => {
            const result = findMonitorInSite(mockSite, "monitor-2");
            expect(result).toEqual(mockSite.monitors[1]);
        });
    });

    describe("updateMonitorInSite", () => {
        const mockSite: Site = {
            identifier: "site-1",
            name: "Test Site",

            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    history: [],
                    checkInterval: 300000,
                },
                {
                    id: "monitor-2",
                    type: "port",
                    status: "down",
                    monitoring: false,
                    history: [],
                    checkInterval: 60000,
                },
            ],
        };

        it("should update existing monitor", () => {
            const updates = {
                status: "down" as const,
                monitoring: false,
                responseTime: 500,
            };

            const result = updateMonitorInSite(mockSite, "monitor-1", updates);

            expect(result.monitors[0]).toEqual({
                ...mockSite.monitors[0],
                ...updates,
            });
            expect(result.monitors[1]).toEqual(mockSite.monitors[1]);
        });

        it("should throw error for non-existent monitor", () => {
            const updates = { status: "down" as const };

            expect(() => {
                updateMonitorInSite(mockSite, "non-existent", updates);
            }).toThrow("Monitor not found");
        });

        it("should not mutate original site", () => {
            const updates = { status: "down" as const };
            const originalSite = { ...mockSite };

            const result = updateMonitorInSite(mockSite, "monitor-1", updates);

            expect(mockSite).toEqual(originalSite);
            expect(result).not.toBe(mockSite);
            expect(result.monitors).not.toBe(mockSite.monitors);
        });

        it("should handle partial updates", () => {
            const updates = { responseTime: 250 };

            const result = updateMonitorInSite(mockSite, "monitor-1", updates);

            expect(result.monitors[0]).toEqual({
                ...mockSite.monitors[0],
                responseTime: 250,
            });
        });

        it("should handle empty updates", () => {
            const result = updateMonitorInSite(mockSite, "monitor-1", {});

            expect(result.monitors[0]).toEqual(mockSite.monitors[0]);
        });
    });

    describe("addMonitorToSite", () => {
        const mockSite: Site = {
            identifier: "site-1",
            name: "Test Site",

            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    history: [],
                },
            ],
        };

        it("should add monitor to site", () => {
            const newMonitor: Monitor = {
                id: "monitor-2",
                type: "port",
                status: "pending",
                monitoring: false,
                history: [],
            };

            const result = addMonitorToSite(mockSite, newMonitor);

            expect(result.monitors).toHaveLength(2);
            expect(result.monitors[0]).toEqual(mockSite.monitors[0]);
            expect(result.monitors[1]).toEqual(newMonitor);
        });

        it("should not mutate original site", () => {
            const newMonitor: Monitor = {
                id: "monitor-2",
                type: "port",
                status: "pending",
                monitoring: false,
                history: [],
            };
            const originalSite = { ...mockSite };

            const result = addMonitorToSite(mockSite, newMonitor);

            expect(mockSite).toEqual(originalSite);
            expect(result).not.toBe(mockSite);
            expect(result.monitors).not.toBe(mockSite.monitors);
        });

        it("should add to empty monitors array", () => {
            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };
            const newMonitor: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "pending",
                monitoring: true,
                history: [],
            };

            const result = addMonitorToSite(siteWithNoMonitors, newMonitor);

            expect(result.monitors).toHaveLength(1);
            expect(result.monitors[0]).toEqual(newMonitor);
        });
    });

    describe("removeMonitorFromSite", () => {
        const mockSite: Site = {
            identifier: "site-1",
            name: "Test Site",

            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    history: [],
                },
                {
                    id: "monitor-2",
                    type: "port",
                    status: "down",
                    monitoring: false,
                    history: [],
                },
            ],
        };

        it("should remove existing monitor", () => {
            const result = removeMonitorFromSite(mockSite, "monitor-1");

            expect(result.monitors).toHaveLength(1);
            expect(result.monitors[0]).toEqual(mockSite.monitors[1]);
        });

        it("should handle non-existent monitor gracefully", () => {
            const result = removeMonitorFromSite(mockSite, "non-existent");

            expect(result.monitors).toHaveLength(2);
            expect(result.monitors).toEqual(mockSite.monitors);
        });

        it("should not mutate original site", () => {
            const originalSite = { ...mockSite };

            const result = removeMonitorFromSite(mockSite, "monitor-1");

            expect(mockSite).toEqual(originalSite);
            expect(result).not.toBe(mockSite);
            expect(result.monitors).not.toBe(mockSite.monitors);
        });

        it("should remove last monitor", () => {
            const siteWithOneMonitor: Site = {
                ...mockSite,
                monitors: [mockSite.monitors[0]!],
            };

            const result = removeMonitorFromSite(siteWithOneMonitor, "monitor-1");

            expect(result.monitors).toHaveLength(0);
        });

        it("should handle empty monitors array", () => {
            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };

            const result = removeMonitorFromSite(siteWithNoMonitors, "monitor-1");

            expect(result.monitors).toHaveLength(0);
        });
    });

    describe("validateMonitorExists", () => {
        const mockSite: Site = {
            identifier: "site-1",
            name: "Test Site",

            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    history: [],
                },
            ],
        };

        it("should not throw for existing monitor", () => {
            expect(() => {
                validateMonitorExists(mockSite, "monitor-1");
            }).not.toThrow();
        });

        it("should throw error for undefined site", () => {
            expect(() => {
                validateMonitorExists(undefined, "monitor-1");
            }).toThrow(ERROR_MESSAGES.SITE_NOT_FOUND);
        });

        it("should throw error for non-existent monitor", () => {
            expect(() => {
                validateMonitorExists(mockSite, "non-existent");
            }).toThrow("Monitor not found");
        });

        it("should throw error for monitor in empty monitors array", () => {
            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };

            expect(() => {
                validateMonitorExists(siteWithNoMonitors, "monitor-1");
            }).toThrow("Monitor not found");
        });
    });

    describe("monitorOperations", () => {
        const mockMonitor: Monitor = {
            id: "monitor-1",
            type: "http",
            status: "up",
            monitoring: true,
            history: [],
            checkInterval: 300000,
            timeout: 5000,
            retryAttempts: 3,
        };

        describe("toggleMonitoring", () => {
            it("should toggle monitoring from true to false", () => {
                const result = monitorOperations.toggleMonitoring(mockMonitor);

                expect(result).toEqual({
                    ...mockMonitor,
                    monitoring: false,
                });
            });

            it("should toggle monitoring from false to true", () => {
                const monitorWithMonitoringOff = {
                    ...mockMonitor,
                    monitoring: false,
                };

                const result = monitorOperations.toggleMonitoring(monitorWithMonitoringOff);

                expect(result).toEqual({
                    ...mockMonitor,
                    monitoring: true,
                });
            });

            it("should not mutate original monitor", () => {
                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.toggleMonitoring(mockMonitor);

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });
        });

        describe("updateCheckInterval", () => {
            it("should update check interval", () => {
                const newInterval = 60000;

                const result = monitorOperations.updateCheckInterval(mockMonitor, newInterval);

                expect(result).toEqual({
                    ...mockMonitor,
                    checkInterval: newInterval,
                });
            });

            it("should not mutate original monitor", () => {
                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.updateCheckInterval(mockMonitor, 60000);

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });

            it("should handle zero interval", () => {
                const result = monitorOperations.updateCheckInterval(mockMonitor, 0);

                expect(result.checkInterval).toBe(0);
            });
        });

        describe("updateRetryAttempts", () => {
            it("should update retry attempts", () => {
                const newRetryAttempts = 5;

                const result = monitorOperations.updateRetryAttempts(mockMonitor, newRetryAttempts);

                expect(result).toEqual({
                    ...mockMonitor,
                    retryAttempts: newRetryAttempts,
                });
            });

            it("should handle undefined retry attempts", () => {
                const result = monitorOperations.updateRetryAttempts(mockMonitor, undefined);

                expect(result).toEqual({
                    ...mockMonitor,
                    retryAttempts: undefined,
                });
            });

            it("should not mutate original monitor", () => {
                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.updateRetryAttempts(mockMonitor, 5);

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });
        });

        describe("updateStatus", () => {
            it("should update status to pending", () => {
                const result = monitorOperations.updateStatus(mockMonitor, "pending");

                expect(result).toEqual({
                    ...mockMonitor,
                    status: "pending",
                });
            });

            it("should update status to down", () => {
                const result = monitorOperations.updateStatus(mockMonitor, "down");

                expect(result).toEqual({
                    ...mockMonitor,
                    status: "down",
                });
            });

            it("should not mutate original monitor", () => {
                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.updateStatus(mockMonitor, "down");

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });
        });

        describe("updateTimeout", () => {
            it("should update timeout", () => {
                const newTimeout = 10000;

                const result = monitorOperations.updateTimeout(mockMonitor, newTimeout);

                expect(result).toEqual({
                    ...mockMonitor,
                    timeout: newTimeout,
                });
            });

            it("should handle undefined timeout", () => {
                const result = monitorOperations.updateTimeout(mockMonitor, undefined);

                expect(result).toEqual({
                    ...mockMonitor,
                    timeout: undefined,
                });
            });

            it("should not mutate original monitor", () => {
                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.updateTimeout(mockMonitor, 10000);

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });

            it("should handle zero timeout", () => {
                const result = monitorOperations.updateTimeout(mockMonitor, 0);

                expect(result.timeout).toBe(0);
            });
        });
    });
});
