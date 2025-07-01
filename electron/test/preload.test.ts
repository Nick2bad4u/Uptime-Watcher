/**
 * Tests for Electron preload script.
 * Validates secure IPC bridge and API exposure to renderer process.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

describe("Electron Preload Script", () => {
    let mockContextBridge: { exposeInMainWorld: ReturnType<typeof vi.fn> };
    let mockIpcRenderer: { 
        invoke: ReturnType<typeof vi.fn>;
        on: ReturnType<typeof vi.fn>;
        removeAllListeners: ReturnType<typeof vi.fn>;
        send: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        // Reset mocks before each test
        vi.resetModules();
        
        // Create fresh mock instances
        mockContextBridge = {
            exposeInMainWorld: vi.fn(),
        };

        mockIpcRenderer = {
            invoke: vi.fn(() => Promise.resolve()),
            on: vi.fn(),
            removeAllListeners: vi.fn(),
            send: vi.fn(),
        };

        // Mock electron module
        vi.doMock("electron", () => ({
            contextBridge: mockContextBridge,
            ipcRenderer: mockIpcRenderer,
        }));
    });

    describe("API Exposure", () => {
        it("should expose electronAPI to main world", async () => {
            await import("../preload");
            
            expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith("electronAPI", expect.any(Object));
        });

        it("should expose all required API domains", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0]?.[1];
            
            expect(exposedAPI).toHaveProperty("sites");
            expect(exposedAPI).toHaveProperty("monitoring");
            expect(exposedAPI).toHaveProperty("data");
            expect(exposedAPI).toHaveProperty("settings");
            expect(exposedAPI).toHaveProperty("events");
            expect(exposedAPI).toHaveProperty("system");
        });
    });

    describe("Site API", () => {
        it("should expose all site management methods", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const siteAPI = exposedAPI.sites;
            
            expect(siteAPI).toHaveProperty("addSite");
            expect(siteAPI).toHaveProperty("getSites");
            expect(siteAPI).toHaveProperty("removeSite");
            expect(siteAPI).toHaveProperty("updateSite");
            expect(siteAPI).toHaveProperty("checkSiteNow");
        });

        it("should properly invoke IPC for addSite", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const mockSite = { identifier: "test", name: "Test Site", monitors: [] };
            
            await exposedAPI.sites.addSite(mockSite);
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("add-site", mockSite);
        });

        it("should properly invoke IPC for getSites", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            await exposedAPI.sites.getSites();
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("get-sites");
        });

        it("should properly invoke IPC for removeSite", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const identifier = "test-site-123";
            
            await exposedAPI.sites.removeSite(identifier);
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("remove-site", identifier);
        });

        it("should properly invoke IPC for updateSite", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const identifier = "test-site-123";
            const updates = { name: "Updated Name" };
            
            await exposedAPI.sites.updateSite(identifier, updates);
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("update-site", identifier, updates);
        });

        it("should properly invoke IPC for checkSiteNow", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const identifier = "test-site-123";
            const monitorType = "http";
            
            await exposedAPI.sites.checkSiteNow(identifier, monitorType);
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("check-site-now", identifier, monitorType);
        });
    });

    describe("Monitoring API", () => {
        it("should expose all monitoring control methods", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const monitoringAPI = exposedAPI.monitoring;
            
            expect(monitoringAPI).toHaveProperty("startMonitoring");
            expect(monitoringAPI).toHaveProperty("stopMonitoring");
            expect(monitoringAPI).toHaveProperty("startMonitoringForSite");
            expect(monitoringAPI).toHaveProperty("stopMonitoringForSite");
        });

        it("should properly invoke IPC for startMonitoring", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            await exposedAPI.monitoring.startMonitoring();
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("start-monitoring");
        });

        it("should properly invoke IPC for stopMonitoring", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            await exposedAPI.monitoring.stopMonitoring();
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("stop-monitoring");
        });

        it("should properly invoke IPC for startMonitoringForSite", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const identifier = "test-site";
            const monitorType = "http";
            
            await exposedAPI.monitoring.startMonitoringForSite(identifier, monitorType);
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("start-monitoring-for-site", identifier, monitorType);
        });

        it("should properly invoke IPC for stopMonitoringForSite", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const identifier = "test-site";
            const monitorType = "port";
            
            await exposedAPI.monitoring.stopMonitoringForSite(identifier, monitorType);
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("stop-monitoring-for-site", identifier, monitorType);
        });
    });

    describe("Data API", () => {
        it("should expose all data management methods", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const dataAPI = exposedAPI.data;
            
            expect(dataAPI).toHaveProperty("exportData");
            expect(dataAPI).toHaveProperty("importData");
            expect(dataAPI).toHaveProperty("downloadSQLiteBackup");
        });

        it("should properly invoke IPC for exportData", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            await exposedAPI.data.exportData();
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("export-data");
        });

        it("should properly invoke IPC for importData", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const data = '{"sites": []}';
            
            await exposedAPI.data.importData(data);
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("import-data", data);
        });

        it("should properly invoke IPC for downloadSQLiteBackup", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            await exposedAPI.data.downloadSQLiteBackup();
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("download-sqlite-backup");
        });
    });

    describe("Settings API", () => {
        it("should expose all settings methods", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const settingsAPI = exposedAPI.settings;
            
            expect(settingsAPI).toHaveProperty("getHistoryLimit");
            expect(settingsAPI).toHaveProperty("updateHistoryLimit");
        });

        it("should properly invoke IPC for getHistoryLimit", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            await exposedAPI.settings.getHistoryLimit();
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("get-history-limit");
        });

        it("should properly invoke IPC for updateHistoryLimit", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const limit = 1000;
            
            await exposedAPI.settings.updateHistoryLimit(limit);
            
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("update-history-limit", limit);
        });
    });

    describe("Events API", () => {
        it("should expose all event handling methods", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const eventsAPI = exposedAPI.events;
            
            expect(eventsAPI).toHaveProperty("onStatusUpdate");
            expect(eventsAPI).toHaveProperty("onUpdateStatus");
            expect(eventsAPI).toHaveProperty("removeAllListeners");
        });

        it("should properly setup IPC listener for onStatusUpdate", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const callback = vi.fn();
            
            exposedAPI.events.onStatusUpdate(callback);
            
            expect(mockIpcRenderer.on).toHaveBeenCalledWith("status-update", expect.any(Function));
        });

        it("should properly setup IPC listener for onUpdateStatus", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const callback = vi.fn();
            
            exposedAPI.events.onUpdateStatus(callback);
            
            expect(mockIpcRenderer.on).toHaveBeenCalledWith("update-status", expect.any(Function));
        });

        it("should properly remove listeners", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const channel = "status-update";
            
            exposedAPI.events.removeAllListeners(channel);
            
            expect(mockIpcRenderer.removeAllListeners).toHaveBeenCalledWith(channel);
        });

        it("should call callback with data when IPC event is received", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const callback = vi.fn();
            
            exposedAPI.events.onStatusUpdate(callback);
            
            // Get the listener function that was registered
            const listenerCall = mockIpcRenderer.on.mock.calls.find(call => call[0] === "status-update");
            const listener = listenerCall[1];
            
            // Simulate IPC event
            const testData = { site: { identifier: "test" } };
            listener(null, testData);
            
            expect(callback).toHaveBeenCalledWith(testData);
        });
    });

    describe("System API", () => {
        it("should expose system methods", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            const systemAPI = exposedAPI.system;
            
            expect(systemAPI).toHaveProperty("quitAndInstall");
        });

        it("should properly send IPC for quitAndInstall", async () => {
            // Mock ipcRenderer.send for system API
            const mockSend = vi.fn();
            mockIpcRenderer.send = mockSend;
            
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            exposedAPI.system.quitAndInstall();
            
            expect(mockSend).toHaveBeenCalledWith("quit-and-install");
        });
    });

    describe("Security Validation", () => {
        it("should only expose safe IPC communication methods", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            // Should not expose dangerous methods
            expect(exposedAPI).not.toHaveProperty("require");
            expect(exposedAPI).not.toHaveProperty("eval");
            expect(exposedAPI).not.toHaveProperty("process");
            expect(exposedAPI).not.toHaveProperty("global");
        });

        it("should use contextBridge instead of direct global assignment", async () => {
            await import("../preload");
            
            // Should use contextBridge.exposeInMainWorld
            expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalled();
        });

        it("should validate that all API methods return promises or are synchronous", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            // Check that IPC invoke methods are async
            const result1 = exposedAPI.sites.getSites();
            expect(result1).toBeInstanceOf(Promise);
            
            const result2 = exposedAPI.monitoring.startMonitoring();
            expect(result2).toBeInstanceOf(Promise);
            
            const result3 = exposedAPI.data.exportData();
            expect(result3).toBeInstanceOf(Promise);
        });
    });

    describe("Type Safety", () => {
        it("should properly type the Site parameter in addSite", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            // This should not throw type errors when called with proper Site object
            const site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
            };
            
            await exposedAPI.sites.addSite(site);
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("add-site", site);
        });

        it("should properly handle partial Site updates in updateSite", async () => {
            await import("../preload");
            
            const exposedAPI = mockContextBridge.exposeInMainWorld.mock.calls[0][1];
            
            const partialUpdate = { name: "New Name" };
            
            await exposedAPI.sites.updateSite("test-id", partialUpdate);
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("update-site", "test-id", partialUpdate);
        });
    });
});
