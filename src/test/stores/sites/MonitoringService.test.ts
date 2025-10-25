/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MonitoringService } from "../../../stores/sites/services/MonitoringService";

// Mock the waitForElectronAPI utility
vi.mock("../../../stores/utils", () => ({
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

// Mock the electron window API
const mockElectronAPI = {
    monitoring: {
        startMonitoring: vi.fn().mockResolvedValue(true),
        startMonitoringForMonitor: vi.fn().mockResolvedValue(true),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoring: vi.fn().mockResolvedValue(true),
        stopMonitoringForMonitor: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("MonitoringService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
            ).rejects.toThrow("Failed to start monitoring");
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

            mockElectronAPI.monitoring.startMonitoring.mockResolvedValueOnce(
                true
            );

            await expect(
                MonitoringService.startMonitoring()
            ).resolves.toBeUndefined();
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
                false
            );

            await expect(MonitoringService.startMonitoring()).rejects.toThrow(
                "Failed to start monitoring across all sites"
            );
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

            await expect(MonitoringService.startMonitoring()).rejects.toThrow(
                "global failure"
            );
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
            ).rejects.toThrow("Failed to stop monitoring");
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

            mockElectronAPI.monitoring.stopMonitoring.mockResolvedValueOnce(
                true
            );

            await expect(
                MonitoringService.stopMonitoring()
            ).resolves.toBeUndefined();
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
                false
            );

            await expect(MonitoringService.stopMonitoring()).rejects.toThrow(
                "Failed to stop monitoring across all sites"
            );
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

            await expect(MonitoringService.stopMonitoring()).rejects.toThrow(
                "stop failed"
            );
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

            // Import the mock so we can control it
            const { waitForElectronAPI } = await import(
                "../../../stores/utils"
            );

            // Make waitForElectronAPI reject for all calls in this test
            const mockWaitForElectronAPI = vi.mocked(waitForElectronAPI);
            mockWaitForElectronAPI.mockRejectedValue(
                new Error("ElectronAPI not available")
            );

            await expect(
                MonitoringService.startMonitoringForMonitor("test", "test")
            ).rejects.toThrow("ElectronAPI not available");
            await expect(
                MonitoringService.stopMonitoringForMonitor("test", "test")
            ).rejects.toThrow("ElectronAPI not available");

            // Reset the mock for other tests
            mockWaitForElectronAPI.mockResolvedValue(undefined);
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
            ).rejects.toThrow("Network error");
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
            ).rejects.toThrow("Invalid site ID");
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
            ).rejects.toThrow("Request timeout");
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
            ).rejects.toThrow("Monitoring service unavailable");
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
                )
            );

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
                )
            );

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
                )
            );
            const stopOps = Array.from({ length: 3 }, (_, i) =>
                MonitoringService.stopMonitoringForMonitor(
                    `site-${i + 3}`,
                    `monitor-${i + 3}`
                )
            );

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
