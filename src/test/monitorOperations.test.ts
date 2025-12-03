import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

import {
    DEFAULT_MONITOR_STATUS,
    STATUS_KIND,
    type Monitor,
    type MonitorType,
    type Site,
} from "@shared/types";

import {
    DEFAULT_MONITOR_CHECK_INTERVAL_MS,
    MIN_MONITOR_CHECK_INTERVAL_MS,
} from "@shared/constants/monitoring";
import { DEFAULT_MONITOR_CONFIG as SHARED_MONITOR_CONFIG } from "@shared/types/monitorConfig";

import {
    createDefaultMonitor,
    normalizeMonitor,
    findMonitorInSite,
    updateMonitorInSite,
    addMonitorToSite,
    removeMonitorFromSite,
    validateMonitorExists,
    monitorOperations,
} from "../stores/sites/utils/monitorOperations";
import { validateMonitor } from "@shared/types";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";

// Mock crypto.randomUUID
const mockUUID = "mock-uuid-123";
const mockCrypto = {
    randomUUID: vi.fn().mockReturnValue(mockUUID),
};

const SHARED_HTTP_TIMEOUT = SHARED_MONITOR_CONFIG.http?.timeout ?? 30_000;

const MONITOR_STATUS_VALUES = [
    STATUS_KIND.DEGRADED,
    STATUS_KIND.DOWN,
    STATUS_KIND.PAUSED,
    STATUS_KIND.PENDING,
    STATUS_KIND.UP,
] as const;

const validMonitorStatusArbitrary = fc.constantFrom(...MONITOR_STATUS_VALUES);

const monitorStatusSet = new Set<string>(MONITOR_STATUS_VALUES);

const invalidMonitorStatusArbitrary = fc
    .string({ minLength: 1, maxLength: 24 })
    .filter((candidate) => !monitorStatusSet.has(candidate));

const belowMinimumIntervalArbitrary = fc.integer({
    min: -1_000_000,
    max: MIN_MONITOR_CHECK_INTERVAL_MS - 1,
});

Object.defineProperty(globalThis, "crypto", {
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

    describe(createDefaultMonitor, () => {
        it("should create a default monitor with default values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const monitor = createDefaultMonitor();

            expect(monitor).toEqual({
                activeOperations: [],
                checkInterval:
                    SHARED_MONITOR_CONFIG.http?.checkInterval ??
                    DEFAULT_MONITOR_CHECK_INTERVAL_MS,
                history: [],
                id: mockUUID,
                monitoring: SHARED_MONITOR_CONFIG.http?.enabled ?? true,
                responseTime: -1,
                retryAttempts: SHARED_MONITOR_CONFIG.http?.retryAttempts ?? 3,
                status: DEFAULT_MONITOR_STATUS,
                timeout: SHARED_MONITOR_CONFIG.http?.timeout ?? 30_000,
                type: "http",
                url: "https://example.com",
            });
            expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1);
        });

        it("should create a monitor with overrides", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const overrides: Partial<Monitor> = {
                checkInterval: 60_000,
                history: [
                    { responseTime: 250, status: "up", timestamp: Date.now() },
                ],
                host: "example.com",
                id: "custom-id",
                lastChecked: new Date(),
                monitoring: false,
                port: 443,
                responseTime: 250,
                retryAttempts: 3,
                status: "up",
                timeout: 5000,
                type: "port" as MonitorType,
            };

            const monitor = createDefaultMonitor(overrides);

            expect(monitor).toEqual({
                activeOperations: [],
                checkInterval: 60_000,
                history: overrides.history,
                host: "example.com",
                id: "custom-id",
                lastChecked: overrides.lastChecked,
                monitoring: false,
                port: 443,
                responseTime: 250,
                retryAttempts: 3,
                status: "up",
                timeout: 5000,
                type: "port",
            });
            expect(mockCrypto.randomUUID).not.toHaveBeenCalled();
        });

        it("should handle partial overrides", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createDefaultMonitor({
                status: "down",
                url: "https://test.com",
            });

            expect(monitor).toEqual({
                activeOperations: [],
                checkInterval: 300_000,
                history: [],
                id: mockUUID,
                monitoring: true,
                responseTime: -1,
                retryAttempts: 3,
                status: "down",
                timeout: SHARED_HTTP_TIMEOUT,
                type: "http",
                url: "https://test.com",
            });
        });
    });

    describe(validateMonitor, () => {
        it("should return true for valid monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const validMonitor: Monitor = {
                activeOperations: [],
                history: [],
                id: "test-id",
                monitoring: true,
                status: "up",
                type: "http",
                responseTime: -1,
                checkInterval: 300_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            expect(validateMonitor(validMonitor)).toBeTruthy();
        });

        it("should return false for missing id", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                history: [],
                monitoring: true,
                status: "up",
                type: "http",
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for invalid id type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                history: [],
                id: 123,
                monitoring: true,
                status: "up" as const,
                type: "http" as MonitorType,
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for missing type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                history: [],
                id: "test-id",
                monitoring: true,
                status: "up" as const,
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for invalid type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                history: [],
                id: "test-id",
                monitoring: true,
                status: "up" as const,
                type: 123,
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for missing status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                history: [],
                id: "test-id",
                monitoring: true,
                type: "http",
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for invalid status value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                history: [],
                id: "test-id",
                monitoring: true,
                status: "invalid-status",
                type: "http" as MonitorType,
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for invalid status type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                history: [],
                id: "test-id",
                monitoring: true,
                status: 123,
                type: "http" as MonitorType,
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for missing monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                history: [],
                id: "test-id",
                status: "up",
                type: "http",
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for invalid monitoring type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                history: [],
                id: "test-id",
                monitoring: "true",
                status: "up",
                type: "http" as MonitorType,
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for missing history", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                id: "test-id",
                monitoring: true,
                status: "up",
                type: "http",
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should return false for invalid history type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const invalidMonitor = {
                history: "not-an-array",
                id: "test-id",
                monitoring: true,
                status: "up",
                type: "http" as MonitorType,
            };

            expect(
                validateMonitor(invalidMonitor as unknown as Monitor)
            ).toBeFalsy();
        });

        it("should validate all valid status values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            await fc.assert(
                fc.property(validMonitorStatusArbitrary, (status) => {
                    const monitor = {
                        ...createDefaultMonitor(),
                        status,
                    };

                    expect(
                        validateMonitor(monitor as unknown as Monitor)
                    ).toBeTruthy();
                })
            );
        });
    });

    describe(normalizeMonitor, () => {
        it("should normalize empty monitor with defaults", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = normalizeMonitor({});

            expect(result).toEqual({
                activeOperations: [],
                checkInterval:
                    SHARED_MONITOR_CONFIG.http?.checkInterval ??
                    DEFAULT_MONITOR_CHECK_INTERVAL_MS,
                history: [],
                id: mockUUID,
                monitoring: SHARED_MONITOR_CONFIG.http?.enabled ?? true,
                responseTime: -1,
                retryAttempts: SHARED_MONITOR_CONFIG.http?.retryAttempts ?? 3,
                status: DEFAULT_MONITOR_STATUS,
                timeout: SHARED_MONITOR_CONFIG.http?.timeout ?? 30_000,
                type: "http",
                url: "https://example.com",
            });
        });

        it("should preserve valid status values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const statusValues = [
                "pending",
                "up",
                "down",
            ] as const;

            for (const status of statusValues) {
                const result = normalizeMonitor({ status });
                expect(result.status).toBe(status);
            }
        });

        it("should default invalid status to pending", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await fc.assert(
                fc.property(invalidMonitorStatusArbitrary, (invalidStatus) => {
                    const result = normalizeMonitor({
                        status: invalidStatus as Monitor["status"],
                    });
                    expect(result.status).toBe(DEFAULT_MONITOR_STATUS);
                })
            );
        });

        it("should clamp checkInterval values below the shared minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            await fc.assert(
                fc.property(belowMinimumIntervalArbitrary, (interval) => {
                    const result = normalizeMonitor({
                        checkInterval: interval,
                    });
                    expect(result.checkInterval).toBe(
                        MIN_MONITOR_CHECK_INTERVAL_MS
                    );
                })
            );
        });

        it("should preserve existing id", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const existingId = "existing-id";
            const result = normalizeMonitor({ id: existingId });
            expect(result.id).toBe(existingId);
            expect(mockCrypto.randomUUID).not.toHaveBeenCalled();
        });

        it("should preserve existing type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = normalizeMonitor({ type: "http" as MonitorType });
            expect(result.type).toBe("http");
        });

        it("should preserve existing history", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const history = [
                {
                    responseTime: 250,
                    status: "up" as const,
                    timestamp: Date.now(),
                },
            ];
            const result = normalizeMonitor({ history });
            expect(result.history).toBe(history);
        });

        it("should include optional fields when provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const lastChecked = new Date();
            const partialMonitor: Partial<Monitor> = {
                checkInterval: 60_000,
                host: "example.com",
                lastChecked,
                monitoring: true,
                port: 443,
                responseTime: 250,
                retryAttempts: 3,
                timeout: 5000,
                type: "port", // Set type to port since we're providing host and port
            };

            const result = normalizeMonitor(partialMonitor);

            expect(result).toEqual({
                activeOperations: [],
                checkInterval: 60_000,
                history: [],
                host: "example.com",
                id: mockUUID,
                lastChecked,
                monitoring: true,
                port: 443,
                responseTime: 250,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                type: "port",
            });
        });

        it("should exclude optional fields when undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const partialMonitor: Partial<Monitor> = {};

            const result = normalizeMonitor(partialMonitor);

            expect(result).toEqual({
                activeOperations: [],
                checkInterval: 300_000,
                history: [],
                id: mockUUID,
                monitoring: true,
                responseTime: -1,
                retryAttempts: 3,
                status: "pending",
                timeout: SHARED_HTTP_TIMEOUT,
                type: "http",
                url: "https://example.com",
            });
        });

        it("should handle mixed defined and undefined optional fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const partialMonitor: Partial<Monitor> = {
                monitoring: true,
                port: 443,
                type: "port", // Set type to port since we're providing port
            };

            const result = normalizeMonitor(partialMonitor);

            expect(result).toEqual({
                activeOperations: [],
                checkInterval: 300_000,
                host: "localhost",
                history: [],
                id: mockUUID,
                monitoring: true,
                port: 443,
                responseTime: -1,
                retryAttempts: 3,
                status: "pending",
                timeout: SHARED_HTTP_TIMEOUT,
                type: "port",
            });
        });

        it("should provide default replication monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = normalizeMonitor({ type: "replication" });

            expect(result).toMatchObject({
                maxReplicationLagSeconds: 10,
                primaryStatusUrl: "https://primary.example.com/status",
                replicaStatusUrl: "https://replica.example.com/status",
                replicationTimestampField: "lastAppliedTimestamp",
                type: "replication",
            });
        });

        it("should provide default server heartbeat fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = normalizeMonitor({ type: "server-heartbeat" });

            expect(result).toMatchObject({
                heartbeatExpectedStatus: "ok",
                heartbeatMaxDriftSeconds: 60,
                heartbeatStatusField: "status",
                heartbeatTimestampField: "timestamp",
                type: "server-heartbeat",
                url: "https://example.com/heartbeat",
            });
        });

        it("should provide default WebSocket keepalive fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = normalizeMonitor({ type: "websocket-keepalive" });

            expect(result).toMatchObject({
                maxPongDelayMs: 1500,
                type: "websocket-keepalive",
                url: "wss://example.com/socket",
            });
        });
    });

    describe(findMonitorInSite, () => {
        const mockSite: Site = {
            identifier: "site-1",
            monitoring: true,
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    status: "up",
                    type: "http",
                    responseTime: -1,
                    checkInterval: 300_000,
                    timeout: SHARED_HTTP_TIMEOUT,
                    retryAttempts: 3,
                },
                {
                    history: [],
                    id: "monitor-2",
                    monitoring: false,
                    status: "down",
                    type: "port",
                    responseTime: -1,
                    checkInterval: 300_000,
                    timeout: SHARED_HTTP_TIMEOUT,
                    retryAttempts: 3,
                },
            ],
            name: "Test Site",
        };

        it("should find existing monitor by id", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Retrieval", "type");

            const result = findMonitorInSite(mockSite, "monitor-1");
            expect(result).toEqual(mockSite.monitors[0]);
        });

        it("should return undefined for non-existent monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = findMonitorInSite(mockSite, "non-existent");
            expect(result).toBeUndefined();
        });

        it("should handle empty monitors array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };
            const result = findMonitorInSite(siteWithNoMonitors, "monitor-1");
            expect(result).toBeUndefined();
        });

        it("should find monitor among multiple monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Retrieval", "type");

            const result = findMonitorInSite(mockSite, "monitor-2");
            expect(result).toEqual(mockSite.monitors[1]);
        });
    });

    describe(updateMonitorInSite, () => {
        const mockSite: Site = {
            identifier: "site-1",
            monitoring: true,
            monitors: [
                {
                    checkInterval: 300_000,
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    status: "up",
                    type: "http",
                    responseTime: -1,
                    timeout: SHARED_HTTP_TIMEOUT,
                    retryAttempts: 3,
                },
                {
                    checkInterval: 60_000,
                    history: [],
                    id: "monitor-2",
                    monitoring: false,
                    status: "down",
                    type: "port",
                    responseTime: -1,
                    timeout: SHARED_HTTP_TIMEOUT,
                    retryAttempts: 3,
                },
            ],
            name: "Test Site",
        };

        it("should update existing monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const updates = {
                monitoring: false,
                responseTime: 500,
                status: "down" as const,
            };

            const result = updateMonitorInSite(mockSite, "monitor-1", updates);

            expect(result.monitors[0]).toEqual({
                ...mockSite.monitors[0],
                ...updates,
                activeOperations: [],
                url: "https://example.com",
            });
            expect(result.monitors[1]).toEqual(mockSite.monitors[1]);
        });

        it("should throw error for non-existent monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const updates = { status: "down" as const };

            expect(() => {
                updateMonitorInSite(mockSite, "non-existent", updates);
            }).toThrowError("Monitor not found");
        });

        it("should not mutate original site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const updates = { status: "down" as const };
            const originalSite = { ...mockSite };

            const result = updateMonitorInSite(mockSite, "monitor-1", updates);

            expect(mockSite).toEqual(originalSite);
            expect(result).not.toBe(mockSite);
            expect(result.monitors).not.toBe(mockSite.monitors);
        });

        it("should handle partial updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const updates = { responseTime: 250 };

            const result = updateMonitorInSite(mockSite, "monitor-1", updates);

            expect(result.monitors[0]).toEqual({
                ...mockSite.monitors[0],
                responseTime: 250,
                activeOperations: [],
                url: "https://example.com",
            });
        });

        it("should handle empty updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const result = updateMonitorInSite(mockSite, "monitor-1", {});
            // When empty updates are applied, normalizeMonitor still ensures all fields are present
            expect(result.monitors[0]).toEqual({
                ...mockSite.monitors[0],
                activeOperations: [], // normalizeMonitor adds this field
                url: "https://example.com", // Default for http type
            });
        });
    });

    describe(addMonitorToSite, () => {
        const mockSite: Site = {
            identifier: "site-1",
            monitoring: true,
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    status: "up",
                    type: "http",
                    responseTime: -1,
                    checkInterval: 300_000,
                    timeout: SHARED_HTTP_TIMEOUT,
                    retryAttempts: 3,
                },
            ],
            name: "Test Site",
        };

        it("should add monitor to site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const newMonitor: Monitor = {
                history: [],
                id: "monitor-2",
                monitoring: false,
                status: "pending",
                type: "port",
                responseTime: -1,
                checkInterval: 300_000,
                timeout: SHARED_HTTP_TIMEOUT,
                retryAttempts: 3,
            };

            const result = addMonitorToSite(mockSite, newMonitor);

            expect(result.monitors).toHaveLength(2);
            expect(result.monitors[0]).toEqual(mockSite.monitors[0]);
            expect(result.monitors[1]).toEqual(newMonitor);
        });

        it("should not mutate original site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const newMonitor: Monitor = {
                history: [],
                id: "monitor-2",
                monitoring: false,
                status: "pending",
                type: "port",
                responseTime: -1,
                checkInterval: 300_000,
                timeout: SHARED_HTTP_TIMEOUT,
                retryAttempts: 3,
            };
            const originalSite = { ...mockSite };

            const result = addMonitorToSite(mockSite, newMonitor);

            expect(mockSite).toEqual(originalSite);
            expect(result).not.toBe(mockSite);
            expect(result.monitors).not.toBe(mockSite.monitors);
        });

        it("should add to empty monitors array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };
            const newMonitor: Monitor = {
                history: [],
                id: "monitor-1",
                monitoring: true,
                status: "pending",
                type: "http",
                responseTime: -1,
                checkInterval: 300_000,
                timeout: SHARED_HTTP_TIMEOUT,
                retryAttempts: 3,
            };

            const result = addMonitorToSite(siteWithNoMonitors, newMonitor);

            expect(result.monitors).toHaveLength(1);
            expect(result.monitors[0]).toEqual(newMonitor);
        });
    });

    describe(removeMonitorFromSite, () => {
        const mockSite: Site = {
            identifier: "site-1",
            monitoring: true,
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    status: "up",
                    type: "http",
                    responseTime: -1,
                    checkInterval: 300_000,
                    timeout: SHARED_HTTP_TIMEOUT,
                    retryAttempts: 3,
                },
                {
                    history: [],
                    id: "monitor-2",
                    monitoring: false,
                    status: "down",
                    type: "port",
                    responseTime: -1,
                    checkInterval: 300_000,
                    timeout: SHARED_HTTP_TIMEOUT,
                    retryAttempts: 3,
                },
            ],
            name: "Test Site",
        };

        it("should remove existing monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Deletion", "type");

            const result = removeMonitorFromSite(mockSite, "monitor-1");

            expect(result.monitors).toHaveLength(1);
            expect(result.monitors[0]).toEqual(mockSite.monitors[1]);
        });

        it("should handle non-existent monitor gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = removeMonitorFromSite(mockSite, "non-existent");

            expect(result.monitors).toHaveLength(2);
            expect(result.monitors).toEqual(mockSite.monitors);
        });

        it("should not mutate original site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const originalSite = { ...mockSite };

            const result = removeMonitorFromSite(mockSite, "monitor-1");

            expect(mockSite).toEqual(originalSite);
            expect(result).not.toBe(mockSite);
            expect(result.monitors).not.toBe(mockSite.monitors);
        });

        it("should remove last monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Deletion", "type");

            const siteWithOneMonitor: Site = {
                ...mockSite,
                monitors: [mockSite.monitors[0]!],
            };

            const result = removeMonitorFromSite(
                siteWithOneMonitor,
                "monitor-1"
            );

            expect(result.monitors).toHaveLength(0);
        });

        it("should handle empty monitors array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };

            const result = removeMonitorFromSite(
                siteWithNoMonitors,
                "monitor-1"
            );

            expect(result.monitors).toHaveLength(0);
        });
    });

    describe(validateMonitorExists, () => {
        const mockSite: Site = {
            identifier: "site-1",
            monitoring: true,
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    status: "up",
                    type: "http",
                    responseTime: -1,
                    checkInterval: 300_000,
                    timeout: SHARED_HTTP_TIMEOUT,
                    retryAttempts: 3,
                },
            ],
            name: "Test Site",
        };

        it("should not throw for existing monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            expect(() => {
                validateMonitorExists(mockSite, "monitor-1");
            }).not.toThrowError();
        });

        it("should throw error for undefined site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                validateMonitorExists(undefined, "monitor-1");
            }).toThrowError(ERROR_CATALOG.sites.NOT_FOUND);
        });

        it("should throw error for non-existent monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                validateMonitorExists(mockSite, "non-existent");
            }).toThrowError("Monitor not found");
        });

        it("should throw error for monitor in empty monitors array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const siteWithNoMonitors: Site = {
                ...mockSite,
                monitors: [],
            };

            expect(() => {
                validateMonitorExists(siteWithNoMonitors, "monitor-1");
            }).toThrowError("Monitor not found");
        });
    });

    describe("monitorOperations", () => {
        const mockMonitor: Monitor = {
            checkInterval: 300_000,
            history: [],
            id: "monitor-1",
            monitoring: true,
            responseTime: -1,
            retryAttempts: 3,
            status: "up",
            timeout: SHARED_HTTP_TIMEOUT,
            type: "http",
        };

        describe("toggleMonitoring", () => {
            it("should toggle monitoring from true to false", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Monitoring", "type");

                const result = monitorOperations.toggleMonitoring(mockMonitor);

                expect(result).toEqual({
                    ...mockMonitor,
                    monitoring: false,
                });
            });

            it("should toggle monitoring from false to true", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Monitoring", "type");

                const monitorWithMonitoringOff = {
                    ...mockMonitor,
                    monitoring: false,
                };

                const result = monitorOperations.toggleMonitoring(
                    monitorWithMonitoringOff
                );

                expect(result).toEqual({
                    ...mockMonitor,
                    monitoring: true,
                });
            });

            it("should not mutate original monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Monitoring", "type");

                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.toggleMonitoring(mockMonitor);

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });
        });

        describe("updateCheckInterval", () => {
            it("should update check interval", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Data Update", "type");

                const newInterval = 60_000;

                const result = monitorOperations.updateCheckInterval(
                    mockMonitor,
                    newInterval
                );

                expect(result).toEqual({
                    ...mockMonitor,
                    checkInterval: newInterval,
                });
            });

            it("should not mutate original monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Monitoring", "type");

                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.updateCheckInterval(
                    mockMonitor,
                    60_000
                );

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });

            it("should handle zero interval", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Business Logic", "type");

                const result = monitorOperations.updateCheckInterval(
                    mockMonitor,
                    0
                );

                expect(result.checkInterval).toBe(0);
            });
        });

        describe("updateRetryAttempts", () => {
            it("should update retry attempts", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Data Update", "type");

                const newRetryAttempts = 5;

                const result = monitorOperations.updateRetryAttempts(
                    mockMonitor,
                    newRetryAttempts
                );

                expect(result).toEqual({
                    ...mockMonitor,
                    retryAttempts: newRetryAttempts,
                });
            });

            it("should not mutate original monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Monitoring", "type");

                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.updateRetryAttempts(
                    mockMonitor,
                    5
                );

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });
        });

        describe("updateStatus", () => {
            it("should update status to pending", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Data Update", "type");

                const result = monitorOperations.updateStatus(
                    mockMonitor,
                    "pending"
                );

                expect(result).toEqual({
                    ...mockMonitor,
                    status: "pending",
                });
            });

            it("should update status to down", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Data Update", "type");

                const result = monitorOperations.updateStatus(
                    mockMonitor,
                    "down"
                );

                expect(result).toEqual({
                    ...mockMonitor,
                    status: "down",
                });
            });

            it("should not mutate original monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Monitoring", "type");

                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.updateStatus(
                    mockMonitor,
                    "down"
                );

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });
        });

        describe("updateTimeout", () => {
            it("should update timeout", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Data Update", "type");

                const newTimeout = 10_000;

                const result = monitorOperations.updateTimeout(
                    mockMonitor,
                    newTimeout
                );

                expect(result).toEqual({
                    ...mockMonitor,
                    timeout: newTimeout,
                });
            });

            it("should not mutate original monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Monitoring", "type");

                const originalMonitor = { ...mockMonitor };

                const result = monitorOperations.updateTimeout(
                    mockMonitor,
                    10_000
                );

                expect(mockMonitor).toEqual(originalMonitor);
                expect(result).not.toBe(mockMonitor);
            });

            it("should handle zero timeout", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorOperations", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Business Logic", "type");

                const result = monitorOperations.updateTimeout(mockMonitor, 0);

                expect(result.timeout).toBe(0);
            });
        });
    });
});
