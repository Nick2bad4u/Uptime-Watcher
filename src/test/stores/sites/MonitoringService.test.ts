/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
    StatusUpdate,
} from "@shared/types";
import {
    sampleOne,
    siteNameArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

import { MonitoringService } from "../../../services/MonitoringService";

const MOCK_BRIDGE_ERROR_MESSAGE =
    "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment.";

const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super(MOCK_BRIDGE_ERROR_MESSAGE);
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);

vi.mock("../../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

// Mock store utilities
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

// Mock the electron window API
const createStartSummary = (
    overrides: Partial<MonitoringStartSummary> = {}
): MonitoringStartSummary => ({
    attempted: 2,
    failed: 0,
    partialFailures: false,
    siteCount: 1,
    skipped: 0,
    succeeded: 2,
    isMonitoring: true,
    alreadyActive: false,
    ...overrides,
});

const createStopSummary = (
    overrides: Partial<MonitoringStopSummary> = {}
): MonitoringStopSummary => ({
    attempted: 2,
    failed: 0,
    partialFailures: false,
    siteCount: 1,
    skipped: 0,
    succeeded: 2,
    isMonitoring: false,
    alreadyInactive: false,
    ...overrides,
});

const mockElectronAPI = {
    monitoring: {
        checkSiteNow: vi.fn().mockResolvedValue(undefined),
        startMonitoring: vi.fn().mockResolvedValue(createStartSummary()),
        startMonitoringForMonitor: vi.fn().mockResolvedValue(true),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoring: vi.fn().mockResolvedValue(createStopSummary()),
        stopMonitoringForMonitor: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

const createMonitorFixture = () => ({
    activeOperations: [],
    checkInterval: 60_000,
    history: [],
    host: "1.1.1.1",
    id: "monitor-123",
    lastChecked: new Date(),
    monitoring: true,
    responseTime: 120,
    retryAttempts: 0,
    status: "up" as const,
    timeout: 10_000,
    type: "ping" as const,
});

const createStatusUpdateFixture = (): StatusUpdate => {
    const monitor = createMonitorFixture();
    const site = {
        identifier: "site-abc",
        monitoring: true,
        monitors: [createMonitorFixture()],
        name: sampleOne(siteNameArbitrary),
    };

    return {
        details: "Manual verification completed",
        monitor,
        monitorId: monitor.id,
        previousStatus: "down",
        responseTime: monitor.responseTime,
        site,
        siteIdentifier: site.identifier,
        status: monitor.status,
        timestamp: new Date().toISOString(),
    };
};

describe("MonitoringService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWaitForElectronBridge.mockReset();
        mockWaitForElectronBridge.mockImplementation(async () => {
            const bridge =
                (globalThis as any).window?.electronAPI ??
                (globalThis as any).electronAPI;

            if (!bridge) {
                throw new MockElectronBridgeNotReadyError({
                    attempts: 1,
                    reason: "ElectronAPI not available",
                });
            }
        });
    });

    describe("checkSiteNow", () => {
        it("should return validated status updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Monitoring", "category");
            await annotate("Type: Validation", "type");

            const statusUpdate = createStatusUpdateFixture();

            mockElectronAPI.monitoring.checkSiteNow.mockResolvedValueOnce(
                statusUpdate
            );

            const result = await MonitoringService.checkSiteNow(
                statusUpdate.siteIdentifier,
                statusUpdate.monitorId
            );

            expect(result).toEqual(statusUpdate);
        });

        it("should return undefined when backend returns no status update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Monitoring", "category");
            await annotate("Type: Validation", "type");

            mockElectronAPI.monitoring.checkSiteNow.mockResolvedValueOnce(
                undefined
            );

            const result = await MonitoringService.checkSiteNow(
                "site-abc",
                "monitor-123"
            );

            expect(result).toBeUndefined();
        });

        it("should throw when backend returns an invalid status update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Monitoring", "category");
            await annotate("Type: Error Handling", "type");

            mockElectronAPI.monitoring.checkSiteNow.mockResolvedValueOnce({
                monitorId: "monitor-123",
                siteIdentifier: "site-abc",
                status: "up",
                timestamp: new Date().toISOString(),
            });

            await expect(
                MonitoringService.checkSiteNow("site-abc", "monitor-123")
            ).rejects.toThrowError(
                "checkSiteNow returned an invalid status update"
            );
        });
    });

    describe("startMonitoringForMonitor", () => {
        it("should start monitoring for a site and monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "test-site-id";
            const monitorId = "test-monitor-id";

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle errors when starting monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const siteIdentifier = "test-site-id";
            const monitorId = "test-monitor-id";
            const error = new Error("Failed to start monitoring");

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockRejectedValueOnce(
                error
            );

            await expect(
                MonitoringService.startMonitoringForMonitor(
                    siteIdentifier,
                    monitorId
                )
            ).rejects.toThrowError("Failed to start monitoring");
        });

        it("should handle empty siteIdentifier", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "";
            const monitorId = "test-monitor-id";

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith("", monitorId);
        });

        it("should handle empty monitorId", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "test-site-id";
            const monitorId = "";

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, "");
        });

        it("should handle special characters in IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "test-site-id@#$%";
            const monitorId = "test-monitor-id!@#";

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle Unicode characters in IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "test-site-id-🌟";
            const monitorId = "test-monitor-id-💻";

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });
    });

    describe("startMonitoring", () => {
        it("should start monitoring globally", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const summary = createStartSummary();
            mockElectronAPI.monitoring.startMonitoring.mockResolvedValueOnce(
                summary
            );

            const result = await MonitoringService.startMonitoring();

            expect(result).toEqual(summary);
            expect(result).not.toBe(summary);
            expect(
                mockElectronAPI.monitoring.startMonitoring
            ).toHaveBeenCalledTimes(1);
        });

        it("should throw when backend declines global start", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            mockElectronAPI.monitoring.startMonitoring.mockResolvedValueOnce(
                createStartSummary({
                    attempted: 1,
                    failed: 1,
                    succeeded: 0,
                    isMonitoring: false,
                })
            );

            await expect(
                MonitoringService.startMonitoring()
            ).rejects.toMatchObject({
                message:
                    "Failed to start monitoring across all sites: 0/1 monitors activated.",
                summary: expect.objectContaining({
                    attempted: 1,
                    failed: 1,
                    succeeded: 0,
                    isMonitoring: false,
                }),
            });
        });

        it("should surface underlying errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const failure = new Error("global failure");
            mockElectronAPI.monitoring.startMonitoring.mockRejectedValueOnce(
                failure
            );

            await expect(
                MonitoringService.startMonitoring()
            ).rejects.toThrowError("global failure");
        });
    });

    describe("stopMonitoringForMonitor", () => {
        it("should stop monitoring for a site and monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "test-site-id";
            const monitorId = "test-monitor-id";

            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.stopMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle errors when stopping monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const siteIdentifier = "test-site-id";
            const monitorId = "test-monitor-id";
            const error = new Error("Failed to stop monitoring");

            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockRejectedValueOnce(
                error
            );

            await expect(
                MonitoringService.stopMonitoringForMonitor(
                    siteIdentifier,
                    monitorId
                )
            ).rejects.toThrowError("Failed to stop monitoring");
        });

        it("should handle empty siteIdentifier", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "";
            const monitorId = "test-monitor-id";

            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.stopMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledWith("", monitorId);
        });

        it("should handle empty monitorId", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "test-site-id";
            const monitorId = "";

            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.stopMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, "");
        });

        it("should handle special characters in IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "test-site-id@#$%";
            const monitorId = "test-monitor-id!@#";

            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.stopMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle Unicode characters in IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "test-site-id-🌟";
            const monitorId = "test-monitor-id-💻";

            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.stopMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });
    });

    describe("stopMonitoring", () => {
        it("should stop monitoring globally", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const summary = createStopSummary();
            mockElectronAPI.monitoring.stopMonitoring.mockResolvedValueOnce(
                summary
            );

            const result = await MonitoringService.stopMonitoring();

            expect(result).toEqual(summary);
            expect(result).not.toBe(summary);
            expect(
                mockElectronAPI.monitoring.stopMonitoring
            ).toHaveBeenCalledTimes(1);
        });

        it("should throw when backend declines global stop", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            mockElectronAPI.monitoring.stopMonitoring.mockResolvedValueOnce(
                createStopSummary({
                    attempted: 2,
                    failed: 2,
                    succeeded: 0,
                    isMonitoring: true,
                })
            );

            await expect(
                MonitoringService.stopMonitoring()
            ).rejects.toMatchObject({
                message:
                    "Failed to stop monitoring across all sites: 2/2 monitors remained active.",
                summary: expect.objectContaining({
                    attempted: 2,
                    failed: 2,
                    succeeded: 0,
                    isMonitoring: true,
                }),
            });
        });

        it("should surface underlying stop errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const failure = new Error("stop failed");
            mockElectronAPI.monitoring.stopMonitoring.mockRejectedValueOnce(
                failure
            );

            await expect(
                MonitoringService.stopMonitoring()
            ).rejects.toThrowError("stop failed");
        });
    });

    describe("Service availability", () => {
        it("should work when window.electronAPI is available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            expect(MonitoringService.startMonitoring).toBeDefined();
            expect(MonitoringService.stopMonitoring).toBeDefined();
        });

        it("should handle undefined window.electronAPI gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const originalWindowBridge = (globalThis as any).window
                ?.electronAPI;
            const originalGlobalBridge = (globalThis as any).electronAPI;

            (globalThis as any).window.electronAPI = undefined;
            (globalThis as any).electronAPI = undefined;

            try {
                await expect(
                    MonitoringService.startMonitoringForMonitor("test", "test")
                ).rejects.toThrowError(MOCK_BRIDGE_ERROR_MESSAGE);
                await expect(
                    MonitoringService.stopMonitoringForMonitor("test", "test")
                ).rejects.toThrowError(MOCK_BRIDGE_ERROR_MESSAGE);
            } finally {
                (globalThis as any).window.electronAPI = originalWindowBridge;
                (globalThis as any).electronAPI = originalGlobalBridge;
            }
        });
    });

    describe("Parameter validation", () => {
        it("should accept valid string parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "valid-site-id";
            const monitorId = "valid-monitor-id";

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle long IDs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "a".repeat(1000);
            const monitorId = "b".repeat(1000);

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle numeric-like string IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "12345";
            const monitorId = "67890";

            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.stopMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle UUID-like IDs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "550e8400-e29b-41d4-a716-446655440000";
            const monitorId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startMonitoringForMonitor(
                siteIdentifier,
                monitorId
            );

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });
    });

    describe("Error handling", () => {
        it("should propagate network errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const networkError = new Error("Network error");
            mockElectronAPI.monitoring.startMonitoringForMonitor.mockRejectedValueOnce(
                networkError
            );

            await expect(
                MonitoringService.startMonitoringForMonitor("test", "test")
            ).rejects.toThrowError("Network error");
        });

        it("should propagate validation errors from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const validationError = new Error("Invalid site ID");
            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockRejectedValueOnce(
                validationError
            );

            await expect(
                MonitoringService.stopMonitoringForMonitor("invalid", "test")
            ).rejects.toThrowError("Invalid site ID");
        });

        it("should handle timeout errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const timeoutError = new Error("Request timeout");
            mockElectronAPI.monitoring.startMonitoringForMonitor.mockRejectedValueOnce(
                timeoutError
            );

            await expect(
                MonitoringService.startMonitoringForMonitor("test", "test")
            ).rejects.toThrowError("Request timeout");
        });

        it("should handle backend service unavailable errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const serviceError = new Error("Monitoring service unavailable");
            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockRejectedValueOnce(
                serviceError
            );

            await expect(
                MonitoringService.stopMonitoringForMonitor("test", "test")
            ).rejects.toThrowError("Monitoring service unavailable");
        });
    });

    describe("Concurrent operations", () => {
        it("should handle multiple concurrent start operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const operations = Array.from({ length: 5 }, (_, i) =>
                MonitoringService.startMonitoringForMonitor(
                    `site-${i}`,
                    `monitor-${i}`
                ));

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValue(
                true
            );

            await Promise.all(operations);

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledTimes(5);
        });

        it("should handle multiple concurrent stop operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const operations = Array.from({ length: 5 }, (_, i) =>
                MonitoringService.stopMonitoringForMonitor(
                    `site-${i}`,
                    `monitor-${i}`
                ));

            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockResolvedValue(
                true
            );

            await Promise.all(operations);

            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledTimes(5);
        });

        it("should handle mixed concurrent operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const startOps = Array.from({ length: 3 }, (_, i) =>
                MonitoringService.startMonitoringForMonitor(
                    `site-${i}`,
                    `monitor-${i}`
                ));
            const stopOps = Array.from({ length: 3 }, (_, i) =>
                MonitoringService.stopMonitoringForMonitor(
                    `site-${i + 3}`,
                    `monitor-${i + 3}`
                ));

            mockElectronAPI.monitoring.startMonitoringForMonitor.mockResolvedValue(
                true
            );
            mockElectronAPI.monitoring.stopMonitoringForMonitor.mockResolvedValue(
                true
            );

            await Promise.all([...startOps, ...stopOps]);

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledTimes(3);
            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledTimes(3);
        });

        it("should handle some operations failing while others succeed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitoringService", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            mockElectronAPI.monitoring.startMonitoringForMonitor
                .mockResolvedValueOnce(true)
                .mockRejectedValueOnce(new Error("Failed"))
                .mockResolvedValueOnce(true);

            const operations = [
                MonitoringService.startMonitoringForMonitor(
                    "site-1",
                    "monitor-1"
                ),
                MonitoringService.startMonitoringForMonitor(
                    "site-2",
                    "monitor-2"
                ),
                MonitoringService.startMonitoringForMonitor(
                    "site-3",
                    "monitor-3"
                ),
            ];

            const results = await Promise.allSettled(operations);

            expect(results[0]?.status).toBe("fulfilled");
            expect(results[1]?.status).toBe("rejected");
            expect(results[2]?.status).toBe("fulfilled");
        });
    });
});
