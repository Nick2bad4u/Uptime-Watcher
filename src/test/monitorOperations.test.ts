import {
    DEFAULT_MONITOR_CHECK_INTERVAL_MS,
    MIN_MONITOR_CHECK_INTERVAL_MS,
} from "@shared/constants/monitoring";
import {
    DEFAULT_MONITOR_STATUS,
    MONITOR_STATUS_VALUES,
    type Monitor,
    type MonitorType,
    type Site,
} from "@shared/types";
import { validateMonitor } from "@shared/types";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import fc from "fast-check";
import { arrayFirst, safeCastTo } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    addMonitorToSite,
    createDefaultMonitor,
    normalizeMonitor,
    removeMonitorFromSite,
    updateMonitorInSite,
    validateMonitorExists,
} from "../stores/sites/utils/monitorOperations";

// Mock crypto.randomUUID
const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
const mockCrypto = {
    randomUUID: vi.fn().mockReturnValue(mockUUID),
};

const DEFAULT_HTTP_TIMEOUT = 30_000;

const validMonitorStatusArbitrary = fc.constantFrom<Monitor["status"]>(
    ...MONITOR_STATUS_VALUES
);

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
                checkInterval: DEFAULT_MONITOR_CHECK_INTERVAL_MS,
                history: [],
                id: mockUUID,
                monitoring: true,
                responseTime: -1,
                retryAttempts: 3,
                status: DEFAULT_MONITOR_STATUS,
                timeout: DEFAULT_HTTP_TIMEOUT,
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
                type: "port",
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
                timeout: DEFAULT_HTTP_TIMEOUT,
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
                type: safeCastTo<MonitorType>("http"),
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
                type: safeCastTo<MonitorType>("http"),
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
                type: safeCastTo<MonitorType>("http"),
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
                type: safeCastTo<MonitorType>("http"),
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
                type: safeCastTo<MonitorType>("http"),
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

                    expect(validateMonitor(monitor)).toBeTruthy();
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
                checkInterval: DEFAULT_MONITOR_CHECK_INTERVAL_MS,
                history: [],
                id: mockUUID,
                monitoring: true,
                responseTime: -1,
                retryAttempts: 3,
                status: DEFAULT_MONITOR_STATUS,
                timeout: DEFAULT_HTTP_TIMEOUT,
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

            for (const status of MONITOR_STATUS_VALUES) {
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

            const result = normalizeMonitor({ type: "http" });
            expect(result.type).toBe("http");
        });

        it("should not invoke accessor-backed monitor input fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            let urlAccesses = 0;
            const monitor = {
                type: "http" as const,
            };
            Object.defineProperty(monitor, "url", {
                configurable: true,
                enumerable: true,
                get: () => {
                    urlAccesses += 1;
                    throw new Error("Unexpected monitor url getter access");
                },
            });

            const result = normalizeMonitor(monitor);

            expect(result.type).toBe("http");
            expect(result.url).toBe("https://example.com");
            expect(urlAccesses).toBe(0);
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
                timeout: DEFAULT_HTTP_TIMEOUT,
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
                timeout: DEFAULT_HTTP_TIMEOUT,
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

        it("should accept complete numeric strings for type-specific thresholds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            expect(
                normalizeMonitor({
                    maxResponseTime: "2500.9" as never,
                    type: "http-latency",
                }).maxResponseTime
            ).toBe(2500);

            expect(
                normalizeMonitor({
                    maxPongDelayMs: "5000.9" as never,
                    type: "websocket-keepalive",
                }).maxPongDelayMs
            ).toBe(5000);

            expect(
                normalizeMonitor({
                    heartbeatMaxDriftSeconds: "120.9" as never,
                    type: "server-heartbeat",
                }).heartbeatMaxDriftSeconds
            ).toBe(120);

            expect(
                normalizeMonitor({
                    maxReplicationLagSeconds: "30.9" as never,
                    type: "replication",
                }).maxReplicationLagSeconds
            ).toBe(30);
        });

        it("should reject partially numeric type-specific threshold strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            expect(
                normalizeMonitor({
                    maxResponseTime: "2500ms" as never,
                    type: "http-latency",
                }).maxResponseTime
            ).toBe(2000);

            expect(
                normalizeMonitor({
                    maxPongDelayMs: "5000ms" as never,
                    type: "websocket-keepalive",
                }).maxPongDelayMs
            ).toBe(1500);

            expect(
                normalizeMonitor({
                    heartbeatMaxDriftSeconds: "120 seconds" as never,
                    type: "server-heartbeat",
                }).heartbeatMaxDriftSeconds
            ).toBe(60);

            expect(
                normalizeMonitor({
                    maxReplicationLagSeconds: "30 seconds" as never,
                    type: "replication",
                }).maxReplicationLagSeconds
            ).toBe(10);
        });

        it("should reject non-decimal type-specific threshold strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            expect(
                normalizeMonitor({
                    maxResponseTime: "1e3" as never,
                    type: "http-latency",
                }).maxResponseTime
            ).toBe(2000);

            expect(
                normalizeMonitor({
                    maxPongDelayMs: "0x10" as never,
                    type: "websocket-keepalive",
                }).maxPongDelayMs
            ).toBe(1500);

            expect(
                normalizeMonitor({
                    heartbeatMaxDriftSeconds: "1e3" as never,
                    type: "server-heartbeat",
                }).heartbeatMaxDriftSeconds
            ).toBe(60);

            expect(
                normalizeMonitor({
                    maxReplicationLagSeconds: "0x10" as never,
                    type: "replication",
                }).maxReplicationLagSeconds
            ).toBe(10);
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
                    timeout: DEFAULT_HTTP_TIMEOUT,
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
                    timeout: DEFAULT_HTTP_TIMEOUT,
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

            expect(arrayFirst(result.monitors)).toEqual({
                ...arrayFirst(mockSite.monitors),
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
            }).toThrow("Monitor not found");
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

            expect(arrayFirst(result.monitors)).toEqual({
                ...arrayFirst(mockSite.monitors),
                responseTime: 250,
                activeOperations: [],
                url: "https://example.com",
            });
        });

        it("should not invoke accessor-backed update fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            let statusAccesses = 0;
            const updates = {};
            Object.defineProperty(updates, "status", {
                configurable: true,
                enumerable: true,
                get: () => {
                    statusAccesses += 1;
                    throw new Error("Unexpected update status getter access");
                },
            });

            const result = updateMonitorInSite(mockSite, "monitor-1", updates);
            const firstMonitor = arrayFirst(result.monitors);

            expect(firstMonitor).toBeDefined();
            expect(firstMonitor?.status).toBe("up");
            expect(statusAccesses).toBe(0);
        });

        it("should handle empty updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorOperations", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const result = updateMonitorInSite(mockSite, "monitor-1", {});
            // When empty updates are applied, normalizeMonitor still ensures all fields are present
            expect(arrayFirst(result.monitors)).toEqual({
                ...arrayFirst(mockSite.monitors),
                activeOperations: [], // normalizeMonitor adds this field
                url: "https://example.com", // Default for HTTP type
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
                    timeout: DEFAULT_HTTP_TIMEOUT,
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
                timeout: DEFAULT_HTTP_TIMEOUT,
                retryAttempts: 3,
            };

            const result = addMonitorToSite(mockSite, newMonitor);

            expect(result.monitors).toHaveLength(2);
            expect(arrayFirst(result.monitors)).toEqual(
                arrayFirst(mockSite.monitors)
            );
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
                timeout: DEFAULT_HTTP_TIMEOUT,
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
                timeout: DEFAULT_HTTP_TIMEOUT,
                retryAttempts: 3,
            };

            const result = addMonitorToSite(siteWithNoMonitors, newMonitor);

            expect(result.monitors).toHaveLength(1);
            expect(arrayFirst(result.monitors)).toEqual(newMonitor);
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
                    timeout: DEFAULT_HTTP_TIMEOUT,
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
                    timeout: DEFAULT_HTTP_TIMEOUT,
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
            expect(arrayFirst(result.monitors)).toEqual(mockSite.monitors[1]);
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
                monitors: [arrayFirst(mockSite.monitors)!],
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
                    timeout: DEFAULT_HTTP_TIMEOUT,
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
            }).not.toThrow();
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
            }).toThrow(ERROR_CATALOG.sites.NOT_FOUND);
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
            }).toThrow("Monitor not found");
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
            }).toThrow("Monitor not found");
        });
    });

});
