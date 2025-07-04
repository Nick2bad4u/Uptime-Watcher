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
        startMonitoringForSite: vi.fn(),
        stopMonitoringForSite: vi.fn(),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("MonitoringService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("startMonitoring", () => {
        it("should start monitoring for a site and monitor", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.startMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle errors when starting monitoring", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";
            const error = new Error("Failed to start monitoring");

            mockElectronAPI.monitoring.startMonitoringForSite.mockRejectedValueOnce(error);

            await expect(MonitoringService.startMonitoring(siteId, monitorId)).rejects.toThrow(
                "Failed to start monitoring"
            );
        });

        it("should handle empty siteId", async () => {
            const siteId = "";
            const monitorId = "test-monitor-id";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.startMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith("", monitorId);
        });

        it("should handle empty monitorId", async () => {
            const siteId = "test-site-id";
            const monitorId = "";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.startMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith(siteId, "");
        });

        it("should handle special characters in IDs", async () => {
            const siteId = "test-site-id@#$%";
            const monitorId = "test-monitor-id!@#";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.startMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle Unicode characters in IDs", async () => {
            const siteId = "test-site-id-🌟";
            const monitorId = "test-monitor-id-💻";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.startMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });
    });

    describe("stopMonitoring", () => {
        it("should stop monitoring for a site and monitor", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.stopMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle errors when stopping monitoring", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";
            const error = new Error("Failed to stop monitoring");

            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValueOnce(error);

            await expect(MonitoringService.stopMonitoring(siteId, monitorId)).rejects.toThrow(
                "Failed to stop monitoring"
            );
        });

        it("should handle empty siteId", async () => {
            const siteId = "";
            const monitorId = "test-monitor-id";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.stopMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith("", monitorId);
        });

        it("should handle empty monitorId", async () => {
            const siteId = "test-site-id";
            const monitorId = "";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.stopMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith(siteId, "");
        });

        it("should handle special characters in IDs", async () => {
            const siteId = "test-site-id@#$%";
            const monitorId = "test-monitor-id!@#";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.stopMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle Unicode characters in IDs", async () => {
            const siteId = "test-site-id-🌟";
            const monitorId = "test-monitor-id-💻";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.stopMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });
    });

    describe("Service availability", () => {
        it("should work when window.electronAPI is available", () => {
            expect(MonitoringService.startMonitoring).toBeDefined();
            expect(MonitoringService.stopMonitoring).toBeDefined();
        });

        it("should handle undefined window.electronAPI gracefully", async () => {
            // Import the mock so we can control it
            const { waitForElectronAPI } = await import("../../../stores/utils");
            
            // Make waitForElectronAPI reject for all calls in this test
            const mockWaitForElectronAPI = vi.mocked(waitForElectronAPI);
            mockWaitForElectronAPI.mockRejectedValue(new Error("ElectronAPI not available"));

            await expect(MonitoringService.startMonitoring("test", "test")).rejects.toThrow("ElectronAPI not available");
            await expect(MonitoringService.stopMonitoring("test", "test")).rejects.toThrow("ElectronAPI not available");

            // Reset the mock for other tests
            mockWaitForElectronAPI.mockResolvedValue(undefined);
        });
    });

    describe("Parameter validation", () => {
        it("should accept valid string parameters", async () => {
            const siteId = "valid-site-id";
            const monitorId = "valid-monitor-id";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.startMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle long IDs", async () => {
            const siteId = "a".repeat(1000);
            const monitorId = "b".repeat(1000);

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.startMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle numeric-like string IDs", async () => {
            const siteId = "12345";
            const monitorId = "67890";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.stopMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle UUID-like IDs", async () => {
            const siteId = "550e8400-e29b-41d4-a716-446655440000";
            const monitorId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(undefined);

            await MonitoringService.startMonitoring(siteId, monitorId);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledWith(siteId, monitorId);
        });
    });

    describe("Error handling", () => {
        it("should propagate network errors", async () => {
            const networkError = new Error("Network error");
            mockElectronAPI.monitoring.startMonitoringForSite.mockRejectedValueOnce(networkError);

            await expect(MonitoringService.startMonitoring("test", "test")).rejects.toThrow("Network error");
        });

        it("should propagate validation errors from backend", async () => {
            const validationError = new Error("Invalid site ID");
            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValueOnce(validationError);

            await expect(MonitoringService.stopMonitoring("invalid", "test")).rejects.toThrow("Invalid site ID");
        });

        it("should handle timeout errors", async () => {
            const timeoutError = new Error("Request timeout");
            mockElectronAPI.monitoring.startMonitoringForSite.mockRejectedValueOnce(timeoutError);

            await expect(MonitoringService.startMonitoring("test", "test")).rejects.toThrow("Request timeout");
        });

        it("should handle backend service unavailable errors", async () => {
            const serviceError = new Error("Monitoring service unavailable");
            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValueOnce(serviceError);

            await expect(MonitoringService.stopMonitoring("test", "test")).rejects.toThrow("Monitoring service unavailable");
        });
    });

    describe("Concurrent operations", () => {
        it("should handle multiple concurrent start operations", async () => {
            const operations = Array.from({ length: 5 }, (_, i) => 
                MonitoringService.startMonitoring(`site-${i}`, `monitor-${i}`)
            );

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValue(undefined);

            await Promise.all(operations);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledTimes(5);
        });

        it("should handle multiple concurrent stop operations", async () => {
            const operations = Array.from({ length: 5 }, (_, i) => 
                MonitoringService.stopMonitoring(`site-${i}`, `monitor-${i}`)
            );

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(undefined);

            await Promise.all(operations);

            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledTimes(5);
        });

        it("should handle mixed concurrent operations", async () => {
            const startOps = Array.from({ length: 3 }, (_, i) => 
                MonitoringService.startMonitoring(`site-${i}`, `monitor-${i}`)
            );
            const stopOps = Array.from({ length: 3 }, (_, i) => 
                MonitoringService.stopMonitoring(`site-${i + 3}`, `monitor-${i + 3}`)
            );

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValue(undefined);
            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValue(undefined);

            await Promise.all([...startOps, ...stopOps]);

            expect(mockElectronAPI.monitoring.startMonitoringForSite).toHaveBeenCalledTimes(3);
            expect(mockElectronAPI.monitoring.stopMonitoringForSite).toHaveBeenCalledTimes(3);
        });

        it("should handle some operations failing while others succeed", async () => {
            mockElectronAPI.monitoring.startMonitoringForSite
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("Failed"))
                .mockResolvedValueOnce(undefined);

            const operations = [
                MonitoringService.startMonitoring("site-1", "monitor-1"),
                MonitoringService.startMonitoring("site-2", "monitor-2"),
                MonitoringService.startMonitoring("site-3", "monitor-3"),
            ];

            const results = await Promise.allSettled(operations);

            expect(results[0]?.status).toBe("fulfilled");
            expect(results[1]?.status).toBe("rejected");
            expect(results[2]?.status).toBe("fulfilled");
        });
    });
});
