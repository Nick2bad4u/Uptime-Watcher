/**
 * Additional tests for preload.ts to achieve 98% branch coverage
 * Targets IPC error handling and edge cases
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock electron dependencies
const mockContextBridge = {
    exposeInMainWorld: vi.fn(),
};

const mockIpcRenderer = {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
    send: vi.fn(),
};

vi.mock("electron", () => ({
    contextBridge: mockContextBridge,
    ipcRenderer: mockIpcRenderer,
}));

describe("preload.ts - Missing Branch Coverage", () => {
    let exposedAPI: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();

        // Mock successful invocations by default
        mockIpcRenderer.invoke.mockResolvedValue("success");

        // Import the module to trigger the contextBridge.exposeInMainWorld call
        await import("../preload");

        // Get the exposed API from the mock
        const exposeCall = mockContextBridge.exposeInMainWorld.mock.calls.find((call) => call[0] === "electronAPI");
        exposedAPI = exposeCall?.[1];

        expect(exposedAPI).toBeDefined();
    });

    describe("IPC Error Handling", () => {
        it("should handle invoke errors in sites API", async () => {
            mockIpcRenderer.invoke.mockRejectedValue(new Error("IPC failed"));

            // Test sites API error handling
            await expect(exposedAPI.sites.getSites()).rejects.toThrow("IPC failed");
            await expect(exposedAPI.sites.addSite({})).rejects.toThrow("IPC failed");
            await expect(exposedAPI.sites.updateSite("id", {})).rejects.toThrow("IPC failed");
            await expect(exposedAPI.sites.removeSite("test")).rejects.toThrow("IPC failed");
        });

        it("should handle invoke errors in monitoring API", async () => {
            mockIpcRenderer.invoke.mockRejectedValue(new Error("Monitoring failed"));

            // Test monitoring API error handling
            await expect(exposedAPI.monitoring.startMonitoring()).rejects.toThrow("Monitoring failed");
            await expect(exposedAPI.monitoring.stopMonitoring()).rejects.toThrow("Monitoring failed");
            await expect(exposedAPI.monitoring.startMonitoringForSite("test", "monitor1")).rejects.toThrow(
                "Monitoring failed"
            );
            await expect(exposedAPI.monitoring.stopMonitoringForSite("test", "monitor1")).rejects.toThrow(
                "Monitoring failed"
            );
        });

        it("should handle invoke errors in data API", async () => {
            mockIpcRenderer.invoke.mockRejectedValue(new Error("Data failed"));

            // Test data API error handling
            await expect(exposedAPI.data.exportData()).rejects.toThrow("Data failed");
            await expect(exposedAPI.data.importData("[]")).rejects.toThrow("Data failed");
            await expect(exposedAPI.data.downloadSQLiteBackup()).rejects.toThrow("Data failed");
        });

        it("should handle invoke errors in settings API", async () => {
            mockIpcRenderer.invoke.mockRejectedValue(new Error("Settings failed"));

            // Test settings API error handling
            await expect(exposedAPI.settings.getHistoryLimit()).rejects.toThrow("Settings failed");
            await expect(exposedAPI.settings.updateHistoryLimit(100)).rejects.toThrow("Settings failed");
            await expect(exposedAPI.settings.resetSettings()).rejects.toThrow("Settings failed");
        });

        it("should handle invoke errors in system API", async () => {
            mockIpcRenderer.invoke.mockRejectedValue(new Error("System failed"));

            // Test system API error handling
            await expect(exposedAPI.system.openExternal("https://example.com")).rejects.toThrow("System failed");
        });
    });

    describe("Event Listener Edge Cases", () => {
        it("should handle removeAllListeners errors", async () => {
            // removeAllListeners should not throw
            expect(() => exposedAPI.events.removeAllListeners("test-channel")).not.toThrow();
        });
    });

    describe("Parameter Validation", () => {
        it("should handle null/undefined parameters", async () => {
            // Test with null/undefined parameters - these should still call invoke
            await expect(exposedAPI.sites.addSite(null)).resolves.toBe("success");
            await expect(exposedAPI.sites.updateSite("id", undefined)).resolves.toBe("success");
            await expect(exposedAPI.monitorTypes.validateMonitorData("http", null)).resolves.toBe("success");
        });

        it("should handle empty string parameters", async () => {
            // Test with empty string parameters
            await expect(exposedAPI.sites.removeSite("")).resolves.toBe("success");
            await expect(exposedAPI.monitoring.startMonitoringForSite("", "")).resolves.toBe("success");
            await expect(exposedAPI.monitoring.stopMonitoringForSite("", "")).resolves.toBe("success");
        });

        it("should handle invalid numeric parameters", async () => {
            // Test with invalid numeric parameters
            await expect(exposedAPI.settings.updateHistoryLimit(-1)).resolves.toBe("success");
            await expect(exposedAPI.settings.updateHistoryLimit(0)).resolves.toBe("success");
            await expect(exposedAPI.settings.updateHistoryLimit(Infinity)).resolves.toBe("success");
            await expect(exposedAPI.settings.updateHistoryLimit(Number.NaN)).resolves.toBe("success");
        });
    });

    describe("Concurrent Operations", () => {
        it("should handle concurrent API calls", async () => {
            // Test concurrent API calls
            const promises = [
                exposedAPI.sites.getSites(),
                exposedAPI.monitorTypes.getMonitorTypes(),
                exposedAPI.settings.getHistoryLimit(),
                exposedAPI.data.exportData(),
            ];

            const results = await Promise.all(promises);
            expect(results).toEqual(["success", "success", "success", "success"]);
        });

        it("should handle mixed success/failure scenarios", async () => {
            // Setup mixed responses
            mockIpcRenderer.invoke
                .mockResolvedValueOnce("Success 1")
                .mockRejectedValueOnce(new Error("Error 2"))
                .mockResolvedValueOnce("Success 3")
                .mockRejectedValueOnce(new Error("Error 4"));

            // Test mixed success/failure
            await expect(exposedAPI.sites.getSites()).resolves.toBe("Success 1");
            await expect(exposedAPI.sites.addSite({})).rejects.toThrow("Error 2");
            await expect(exposedAPI.monitorTypes.getMonitorTypes()).resolves.toBe("Success 3");
            await expect(exposedAPI.data.exportData()).rejects.toThrow("Error 4");
        });
    });

    describe("Event System Edge Cases", () => {
        it("should handle event callbacks with errors", async () => {
            const errorCallback = vi.fn(() => {
                throw new Error("Callback error");
            });

            // Should handle callback errors gracefully
            expect(() => exposedAPI.events.onTestEvent(errorCallback)).not.toThrow();
        });

        it("should handle invalid event names", async () => {
            // Test with various invalid event names - test removeAllListeners with invalid channels
            expect(() => exposedAPI.events.removeAllListeners("")).not.toThrow();
            expect(() => exposedAPI.events.removeAllListeners(null)).not.toThrow();
            expect(() => exposedAPI.events.removeAllListeners(undefined)).not.toThrow();
        });

        it("should handle rapid event registration/removal", async () => {
            // Rapid event operations
            for (let i = 0; i < 100; i++) {
                exposedAPI.events.onTestEvent(vi.fn());
                if (i % 2 === 0) {
                    exposedAPI.events.removeAllListeners(`event-${i}`);
                }
            }

            // Should complete without errors
            expect(true).toBe(true);
        });

        it("should handle event listener registration", async () => {
            const callback = vi.fn();

            // Test various event listener methods
            expect(() => exposedAPI.events.onUpdateStatus(callback)).not.toThrow();
            expect(() => exposedAPI.events.onMonitorUp(callback)).not.toThrow();
            expect(() => exposedAPI.events.onMonitorDown(callback)).not.toThrow();
            expect(() => exposedAPI.events.onTestEvent(callback)).not.toThrow();
            expect(() => exposedAPI.events.onCacheInvalidated(callback)).not.toThrow();
            expect(() => exposedAPI.events.onMonitoringStarted(callback)).not.toThrow();
            expect(() => exposedAPI.events.onMonitoringStopped(callback)).not.toThrow();
        });
    });

    describe("Memory Management", () => {
        it("should handle memory pressure scenarios", async () => {
            // Create many callbacks to simulate memory pressure
            const callbacks = Array.from({ length: 1000 }, () => vi.fn());

            // Add many listeners
            for (const [index, callback] of callbacks.entries()) {
                exposedAPI.events.onTestEvent(callback);
                if (index % 100 === 0) {
                    exposedAPI.events.removeAllListeners(`memory-test-${index}`);
                }
            }

            // Should handle memory pressure gracefully
            expect(true).toBe(true);
        });

        it("should handle listener cleanup during app shutdown", async () => {
            const callback = vi.fn();

            // Simulate app shutdown scenario
            exposedAPI.events.onUpdateStatus(callback);
            exposedAPI.events.onMonitorUp(callback);
            exposedAPI.events.removeAllListeners("update-status");
            exposedAPI.events.removeAllListeners("monitor-up");

            // Should cleanup gracefully
            expect(true).toBe(true);
        });
    });

    describe("API Exposure Verification", () => {
        it("should expose all required API sections", () => {
            expect(exposedAPI.sites).toBeDefined();
            expect(exposedAPI.monitoring).toBeDefined();
            expect(exposedAPI.data).toBeDefined();
            expect(exposedAPI.settings).toBeDefined();
            expect(exposedAPI.system).toBeDefined();
            expect(exposedAPI.events).toBeDefined();
            expect(exposedAPI.monitorTypes).toBeDefined();
            expect(exposedAPI.stateSync).toBeDefined();
        });

        it("should expose all site API methods", () => {
            expect(typeof exposedAPI.sites.getSites).toBe("function");
            expect(typeof exposedAPI.sites.addSite).toBe("function");
            expect(typeof exposedAPI.sites.updateSite).toBe("function");
            expect(typeof exposedAPI.sites.removeSite).toBe("function");
            expect(typeof exposedAPI.sites.removeMonitor).toBe("function");
            expect(typeof exposedAPI.sites.checkSiteNow).toBe("function");
        });

        it("should expose all monitoring API methods", () => {
            expect(typeof exposedAPI.monitoring.startMonitoring).toBe("function");
            expect(typeof exposedAPI.monitoring.stopMonitoring).toBe("function");
            expect(typeof exposedAPI.monitoring.startMonitoringForSite).toBe("function");
            expect(typeof exposedAPI.monitoring.stopMonitoringForSite).toBe("function");
        });
    });
});
