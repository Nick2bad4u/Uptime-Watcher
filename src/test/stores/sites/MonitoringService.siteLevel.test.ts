/**
 * Test file for site-level monitoring functionality in MonitoringService
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { MonitoringService } from "../../../stores/sites/services/MonitoringService";

// Mock the waitForElectronAPI utility
vi.mock("../../../stores/utils", () => ({
    waitForElectronAPI: vi.fn().mockImplementation(() => Promise.resolve()),
}));

// Mock window.electronAPI
const mockElectronAPI = {
    monitoring: {
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("MonitoringService - Site-level monitoring", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("startSiteMonitoring", () => {
        it("should call startMonitoringForSite with only siteIdentifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "example.com";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startSiteMonitoring(siteIdentifier);

            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith(siteIdentifier);
            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle errors from startMonitoringForSite", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const siteIdentifier = "example.com";
            const error = new Error("Failed to start site monitoring");

            mockElectronAPI.monitoring.startMonitoringForSite.mockRejectedValueOnce(
                error
            );

            await expect(
                MonitoringService.startSiteMonitoring(siteIdentifier)
            ).rejects.toThrow("Failed to start site monitoring");
        });

        it("should work with empty string site identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValueOnce(
                true
            );

            await MonitoringService.startSiteMonitoring(siteIdentifier);

            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith("");
        });
    });

    describe("stopSiteMonitoring", () => {
        it("should call stopMonitoringForSite with only siteIdentifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "example.com";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(
                true
            );

            await MonitoringService.stopSiteMonitoring(siteIdentifier);

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith(siteIdentifier);
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle errors from stopMonitoringForSite", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const siteIdentifier = "example.com";
            const error = new Error("Failed to stop site monitoring");

            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValueOnce(
                error
            );

            await expect(
                MonitoringService.stopSiteMonitoring(siteIdentifier)
            ).rejects.toThrow("Failed to stop site monitoring");
        });

        it("should work with empty string site identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const siteIdentifier = "";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockResolvedValueOnce(
                true
            );

            await MonitoringService.stopSiteMonitoring(siteIdentifier);

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith("");
        });
    });

    describe("Site-level vs monitor-level distinction", () => {
        it("should distinguish between site-level and monitor-level calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "example.com";
            const monitorId = "monitor-1";

            mockElectronAPI.monitoring.startMonitoringForSite.mockResolvedValue(
                true
            );

            // Monitor-level call
            await MonitoringService.startMonitoring(siteIdentifier, monitorId);
            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);

            // Site-level call
            await MonitoringService.startSiteMonitoring(siteIdentifier);
            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith(siteIdentifier);

            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledTimes(2);
        });
    });

    describe("Error handling consistency", () => {
        it("should handle network errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const siteIdentifier = "example.com";

            mockElectronAPI.monitoring.startMonitoringForSite.mockRejectedValue(
                new Error("Network error")
            );

            await expect(
                MonitoringService.startSiteMonitoring(siteIdentifier)
            ).rejects.toThrow("Network error");
        });

        it("should handle timeout errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitoringService.siteLevel",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const siteIdentifier = "example.com";

            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValue(
                new Error("Request timeout")
            );

            await expect(
                MonitoringService.stopSiteMonitoring(siteIdentifier)
            ).rejects.toThrow("Request timeout");
        });
    });
});
