/**
 * Tests for Electron preload script. Validates secure IPC bridge and API
 * exposure to renderer process.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

import type { StatusUpdate } from "@shared/types";

describe("Electron Preload Script", () => {
    let mockContextBridge: { exposeInMainWorld: ReturnType<typeof vi.fn> };
    let mockIpcRenderer: {
        invoke: ReturnType<typeof vi.fn>;
        on: ReturnType<typeof vi.fn>;
        removeAllListeners: ReturnType<typeof vi.fn>;
        send: ReturnType<typeof vi.fn>;
    };

    // Helper function to safely get exposed API
    const getExposedAPI = () => {
        const exposedAPI =
            mockContextBridge.exposeInMainWorld.mock.calls[0]?.[1];
        expect(exposedAPI).toBeDefined();
        return exposedAPI;
    };

    beforeEach(() => {
        // Reset mocks before each test
        vi.resetModules();

        // Create fresh mock instances
        mockContextBridge = {
            exposeInMainWorld: vi.fn(),
        };

        // Mock site object for testing
        const mockSite = {
            identifier: "test-site",
            name: "Test Site",
            monitoring: false,
            monitors: [
                {
                    id: "test-monitor",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 60_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    status: "pending",
                    responseTime: 0,
                    monitoring: false,
                    history: [],
                },
            ],
        };

        mockIpcRenderer = {
            invoke: vi.fn((channel: string) => {
                // For site operations, return site data
                if (channel === "add-site" || channel === "update-site") {
                    return Promise.resolve({ success: true, data: mockSite });
                }
                // For site array operations
                if (channel === "get-sites") {
                    return Promise.resolve({ success: true, data: [mockSite] });
                }
                // For other operations, return generic success
                return Promise.resolve({ success: true, data: true });
            }),
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
        it("should expose electronAPI to main world", async ({ annotate }) => {
            await annotate("Component: Preload Script", "component");
            await annotate("Test Type: Unit - API Exposure", "test-type");
            await annotate(
                "Operation: Context Bridge API Exposure",
                "operation"
            );
            await annotate(
                "Priority: Critical - Security Boundary",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Security Context Validation",
                "complexity"
            );
            await annotate(
                "Security: Validates secure IPC bridge setup",
                "security"
            );
            await annotate(
                "Purpose: Ensure API is properly exposed to renderer",
                "purpose"
            );

            await import("../preload");

            expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
                "electronAPI",
                expect.any(Object)
            );
        });

        it("should expose all required API domains", async ({ annotate }) => {
            await annotate("Component: Preload Script", "component");
            await annotate(
                "Test Type: Unit - API Surface Validation",
                "test-type"
            );
            await annotate(
                "Operation: API Domain Completeness Check",
                "operation"
            );
            await annotate("Priority: Critical - API Completeness", "priority");
            await annotate(
                "Complexity: Low - Property Existence Check",
                "complexity"
            );
            await annotate(
                "API Domains: sites, monitoring, data, settings, events, system",
                "api-domains"
            );
            await annotate(
                "Purpose: Ensure all required API domains are exposed",
                "purpose"
            );

            await import("../preload");

            const exposedAPI =
                mockContextBridge.exposeInMainWorld.mock.calls[0]?.[1];

            expect(exposedAPI).toHaveProperty("sites");
            expect(exposedAPI).toHaveProperty("monitoring");
            expect(exposedAPI).toHaveProperty("data");
            expect(exposedAPI).toHaveProperty("settings");
            expect(exposedAPI).toHaveProperty("events");
            expect(exposedAPI).toHaveProperty("system");
        });
    });

    describe("Site API", () => {
        it("should expose all site management methods", async ({
            annotate,
        }) => {
            await annotate("Component: Site API", "component");
            await annotate("Test Type: Unit - Method Exposure", "test-type");
            await annotate(
                "Operation: Site Management Method Validation",
                "operation"
            );
            await annotate("Priority: Critical - CRUD Operations", "priority");
            await annotate(
                "Complexity: Low - Method Existence Check",
                "complexity"
            );
            await annotate(
                "Methods: addSite, getSites, removeSite, updateSite",
                "methods"
            );
            await annotate(
                "Purpose: Validate all site management methods are available",
                "purpose"
            );

            await import("../preload");

            const exposedAPI = getExposedAPI();
            const siteAPI = exposedAPI.sites;

            expect(siteAPI).toHaveProperty("addSite");
            expect(siteAPI).toHaveProperty("getSites");
            expect(siteAPI).toHaveProperty("removeSite");
            expect(siteAPI).toHaveProperty("updateSite");
        });

        it("should properly invoke IPC for addSite", async ({ annotate }) => {
            await annotate("Component: Site API", "component");
            await annotate(
                "Test Type: Unit - IPC Bridge Validation",
                "test-type"
            );
            await annotate(
                "Operation: Add Site IPC Communication",
                "operation"
            );
            await annotate("Priority: Critical - Data Persistence", "priority");
            await annotate(
                "Complexity: Medium - IPC Flow Validation",
                "complexity"
            );
            await annotate(
                "IPC Channel: Validates site addition flow",
                "ipc-channel"
            );
            await annotate(
                "Purpose: Ensure addSite properly communicates with main process",
                "purpose"
            );

            await import("../preload");

            const exposedAPI = getExposedAPI();
            const mockSite = {
                identifier: "test",
                name: "Test Site",
                monitors: [],
            };

            await exposedAPI.sites.addSite(mockSite);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "add-site",
                mockSite
            );
        });

        it("should properly invoke IPC for getSites", async ({ annotate }) => {
            await annotate("Component: Site API", "component");
            await annotate(
                "Test Type: Unit - IPC Bridge Validation",
                "test-type"
            );
            await annotate(
                "Operation: Get Sites IPC Communication",
                "operation"
            );
            await annotate("Priority: Critical - Data Retrieval", "priority");
            await annotate("Complexity: Low - Simple IPC Call", "complexity");
            await annotate("IPC Channel: get-sites", "ipc-channel");
            await annotate(
                "Purpose: Ensure getSites properly communicates with main process",
                "purpose"
            );

            await import("../preload");

            const exposedAPI = getExposedAPI();

            await exposedAPI.sites.getSites();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("get-sites");
        });

        it("should properly invoke IPC for removeSite", async ({
            annotate,
        }) => {
            await annotate("Component: Site API", "component");
            await annotate(
                "Test Type: Unit - IPC Bridge Validation",
                "test-type"
            );
            await annotate(
                "Operation: Remove Site IPC Communication",
                "operation"
            );
            await annotate("Priority: Critical - Data Deletion", "priority");
            await annotate(
                "Complexity: Medium - Deletion Flow Validation",
                "complexity"
            );
            await annotate("IPC Channel: remove-site", "ipc-channel");
            await annotate(
                "Purpose: Ensure removeSite properly communicates with main process",
                "purpose"
            );

            await import("../preload");

            const exposedAPI = getExposedAPI();
            const identifier = "test-site-123";

            await exposedAPI.sites.removeSite(identifier);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "remove-site",
                identifier
            );
        });

        it("should properly invoke IPC for updateSite", async ({
            annotate,
        }) => {
            await annotate("Component: Site API", "component");
            await annotate(
                "Test Type: Unit - IPC Bridge Validation",
                "test-type"
            );
            await annotate(
                "Operation: Update Site IPC Communication",
                "operation"
            );
            await annotate(
                "Priority: Critical - Data Modification",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Update Flow Validation",
                "complexity"
            );
            await annotate("IPC Channel: update-site", "ipc-channel");
            await annotate(
                "Purpose: Ensure updateSite properly communicates with main process",
                "purpose"
            );

            await import("../preload");

            const exposedAPI = getExposedAPI();
            const identifier = "test-site-123";
            const updates = { name: "Updated Name" };

            await exposedAPI.sites.updateSite(identifier, updates);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "update-site",
                identifier,
                updates
            );
        });

        describe("Monitoring API", () => {
            it("should expose all monitoring control methods", async ({
                annotate,
            }) => {
                await annotate("Component: Monitoring API", "component");
                await annotate(
                    "Test Type: Unit - Method Exposure",
                    "test-type"
                );
                await annotate(
                    "Operation: Monitoring Control Method Validation",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Monitoring Control",
                    "priority"
                );
                await annotate(
                    "Complexity: Low - Method Existence Check",
                    "complexity"
                );
                await annotate(
                    "Methods: start/stop monitoring globally and per-site",
                    "methods"
                );
                await annotate(
                    "Purpose: Validate all monitoring control methods are available",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const monitoringAPI = exposedAPI.monitoring;

                expect(monitoringAPI).toHaveProperty("checkSiteNow");
                expect(monitoringAPI).toHaveProperty("startMonitoring");
                expect(monitoringAPI).toHaveProperty("stopMonitoring");
                expect(monitoringAPI).toHaveProperty("startMonitoringForSite");
                expect(monitoringAPI).toHaveProperty("stopMonitoringForSite");
            });

            it("should properly invoke IPC for startMonitoring", async ({
                annotate,
            }) => {
                await annotate("Component: Monitoring API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Global Monitoring Start",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Global Monitoring Control",
                    "priority"
                );
                await annotate(
                    "Complexity: Low - Simple IPC Call",
                    "complexity"
                );
                await annotate("IPC Channel: start-monitoring", "ipc-channel");
                await annotate(
                    "Purpose: Ensure global monitoring start communicates properly",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

                await exposedAPI.monitoring.startMonitoring();

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "start-monitoring"
                );
            });

            it("should properly invoke IPC for stopMonitoring", async ({
                annotate,
            }) => {
                await annotate("Component: Monitoring API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Global Monitoring Stop",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Global Monitoring Control",
                    "priority"
                );
                await annotate(
                    "Complexity: Low - Simple IPC Call",
                    "complexity"
                );
                await annotate("IPC Channel: stop-monitoring", "ipc-channel");
                await annotate(
                    "Purpose: Ensure global monitoring stop communicates properly",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

                await exposedAPI.monitoring.stopMonitoring();

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "stop-monitoring"
                );
            });

            it("should properly invoke IPC for startMonitoringForSite", async ({
                annotate,
            }) => {
                await annotate("Component: Monitoring API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Site-Wide Monitoring Start",
                    "operation"
                );
                await annotate(
                    "Priority: High - Selective Monitoring Control",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Site-Specific Control",
                    "complexity"
                );
                await annotate(
                    "IPC Channel: start-monitoring-for-site",
                    "ipc-channel"
                );
                await annotate(
                    "Purpose: Ensure site-specific monitoring start works",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const identifier = "test-site";

                await exposedAPI.monitoring.startMonitoringForSite(identifier);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "start-monitoring-for-site",
                    identifier
                );
            });

            it("should properly invoke IPC for startMonitoringForMonitor", async ({
                annotate,
            }) => {
                await annotate("Component: Monitoring API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Monitor-Specific Monitoring Start",
                    "operation"
                );
                await annotate(
                    "Priority: High - Selective Monitoring Control",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Monitor-Level Control",
                    "complexity"
                );
                await annotate(
                    "IPC Channel: start-monitoring-for-monitor",
                    "ipc-channel"
                );
                await annotate(
                    "Purpose: Ensure monitor-specific monitoring start works",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const identifier = "test-site";
                const monitorId = "http";

                await exposedAPI.monitoring.startMonitoringForMonitor(
                    identifier,
                    monitorId
                );

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "start-monitoring-for-monitor",
                    identifier,
                    monitorId
                );
            });

            it("should properly invoke IPC for stopMonitoringForSite", async ({
                annotate,
            }) => {
                await annotate("Component: Monitoring API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Site-Wide Monitoring Stop",
                    "operation"
                );
                await annotate(
                    "Priority: High - Selective Monitoring Control",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Site-Specific Control",
                    "complexity"
                );
                await annotate(
                    "IPC Channel: stop-monitoring-for-site",
                    "ipc-channel"
                );
                await annotate(
                    "Purpose: Ensure site-specific monitoring stop works",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const identifier = "test-site";

                await exposedAPI.monitoring.stopMonitoringForSite(identifier);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "stop-monitoring-for-site",
                    identifier
                );
            });

            it("should properly invoke IPC for stopMonitoringForMonitor", async ({
                annotate,
            }) => {
                await annotate("Component: Monitoring API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Monitor-Specific Monitoring Stop",
                    "operation"
                );
                await annotate(
                    "Priority: High - Selective Monitoring Control",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Monitor-Level Control",
                    "complexity"
                );
                await annotate(
                    "IPC Channel: stop-monitoring-for-monitor",
                    "ipc-channel"
                );
                await annotate(
                    "Purpose: Ensure monitor-specific monitoring stop works",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const identifier = "test-site";
                const monitorId = "port";

                await exposedAPI.monitoring.stopMonitoringForMonitor(
                    identifier,
                    monitorId
                );

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "stop-monitoring-for-monitor",
                    identifier,
                    monitorId
                );
            });

            it("should properly invoke IPC for checkSiteNow", async ({
                annotate,
            }) => {
                await annotate("Component: Monitoring API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Manual Monitor Check IPC Communication",
                    "operation"
                );
                await annotate(
                    "Priority: High - On-Demand Monitoring",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Manual Check Flow",
                    "complexity"
                );
                await annotate("IPC Channel: check-site-now", "ipc-channel");
                await annotate(
                    "Purpose: Ensure manual monitor checks communicate properly",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const identifier = "test-site-123";
                const monitorId = "http-monitor";

                await exposedAPI.monitoring.checkSiteNow(identifier, monitorId);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "check-site-now",
                    identifier,
                    monitorId
                );
            });
        });

        describe("Data API", () => {
            it("should expose all data management methods", async ({
                annotate,
            }) => {
                await annotate("Component: Data API", "component");
                await annotate(
                    "Test Type: Unit - Method Exposure",
                    "test-type"
                );
                await annotate(
                    "Operation: Data Management Method Validation",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Data Operations",
                    "priority"
                );
                await annotate(
                    "Complexity: Low - Method Existence Check",
                    "complexity"
                );
                await annotate(
                    "Methods: exportData, importData, downloadSqliteBackup",
                    "methods"
                );
                await annotate(
                    "Purpose: Validate all data management methods are available",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const dataAPI = exposedAPI.data;

                expect(dataAPI).toHaveProperty("exportData");
                expect(dataAPI).toHaveProperty("importData");
                expect(dataAPI).toHaveProperty("downloadSqliteBackup");
            });

            it("should properly invoke IPC for exportData", async ({
                annotate,
            }) => {
                await annotate("Component: Data API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Data Export IPC Communication",
                    "operation"
                );
                await annotate("Priority: Critical - Data Backup", "priority");
                await annotate(
                    "Complexity: Medium - Data Serialization",
                    "complexity"
                );
                await annotate("IPC Channel: export-data", "ipc-channel");
                await annotate(
                    "Purpose: Ensure data export communicates properly with main process",
                    "purpose"
                );

                // Mock IPC response for exportData
                const mockExportedData = JSON.stringify({
                    sites: [],
                    events: [],
                });
                const mockExportResponse = {
                    success: true,
                    data: mockExportedData,
                };
                mockIpcRenderer.invoke.mockResolvedValueOnce(
                    mockExportResponse
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

                const result = await exposedAPI.data.exportData();

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "export-data"
                );
                expect(result).toBe(mockExportedData);
            });

            it("should properly invoke IPC for importData", async ({
                annotate,
            }) => {
                await annotate("Component: Data API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Data Import IPC Communication",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Data Restoration",
                    "priority"
                );
                await annotate(
                    "Complexity: High - Data Validation & Import",
                    "complexity"
                );
                await annotate("IPC Channel: import-data", "ipc-channel");
                await annotate(
                    "Purpose: Ensure data import communicates properly with main process",
                    "purpose"
                );
                await import("../preload");

                const exposedAPI = getExposedAPI();
                const data = '{"sites": []}';

                await exposedAPI.data.importData(data);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "import-data",
                    data
                );
            });

            it("should properly invoke IPC for downloadSqliteBackup", async ({
                annotate,
            }) => {
                await annotate("Component: Data API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: SQLite Backup Download",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Database Backup",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Binary Data Handling",
                    "complexity"
                );
                await annotate(
                    "IPC Channel: download-sqlite-backup",
                    "ipc-channel"
                );
                await annotate(
                    "Purpose: Ensure SQLite backup download works properly",
                    "purpose"
                );

                // Mock the IPC response with valid backup response format
                const mockBackupData = {
                    buffer: new ArrayBuffer(1024),
                    fileName: "backup_test.db",
                };
                const mockBackupResponse = {
                    success: true,
                    data: mockBackupData,
                };
                mockIpcRenderer.invoke.mockResolvedValueOnce(
                    mockBackupResponse
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

                const result = await exposedAPI.data.downloadSqliteBackup();

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "download-sqlite-backup"
                );
                expect(result).toEqual(mockBackupData);
            });
        });

        describe("Settings API", () => {
            it("should expose all settings methods", async ({ annotate }) => {
                await annotate("Component: Settings API", "component");
                await annotate(
                    "Test Type: Unit - Method Exposure",
                    "test-type"
                );
                await annotate(
                    "Operation: Settings Management Method Validation",
                    "operation"
                );
                await annotate(
                    "Priority: High - Configuration Management",
                    "priority"
                );
                await annotate(
                    "Complexity: Low - Method Existence Check",
                    "complexity"
                );
                await annotate(
                    "Methods: getHistoryLimit, updateHistoryLimit",
                    "methods"
                );
                await annotate(
                    "Purpose: Validate all settings management methods are available",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const settingsAPI = exposedAPI.settings;

                expect(settingsAPI).toHaveProperty("getHistoryLimit");
                expect(settingsAPI).toHaveProperty("updateHistoryLimit");
            });

            it("should properly invoke IPC for getHistoryLimit", async ({
                annotate,
            }) => {
                await annotate("Component: Settings API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: History Limit Retrieval",
                    "operation"
                );
                await annotate(
                    "Priority: Medium - Configuration Query",
                    "priority"
                );
                await annotate(
                    "Complexity: Low - Simple IPC Call",
                    "complexity"
                );
                await annotate("IPC Channel: get-history-limit", "ipc-channel");
                await annotate(
                    "Purpose: Ensure history limit retrieval works properly",
                    "purpose"
                );

                // Mock IPC response for getHistoryLimit
                const mockHistoryLimit = 100;
                const mockHistoryLimitResponse = {
                    success: true,
                    data: mockHistoryLimit,
                };
                mockIpcRenderer.invoke.mockResolvedValueOnce(
                    mockHistoryLimitResponse
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

                const result = await exposedAPI.settings.getHistoryLimit();

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "get-history-limit"
                );
                expect(result).toBe(mockHistoryLimit);
            });

            it("should properly invoke IPC for updateHistoryLimit", async ({
                annotate,
            }) => {
                await annotate("Component: Settings API", "component");
                await annotate(
                    "Test Type: Unit - IPC Bridge Validation",
                    "test-type"
                );
                await annotate("Operation: History Limit Update", "operation");
                await annotate(
                    "Priority: High - Configuration Management",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Configuration Persistence",
                    "complexity"
                );
                await annotate(
                    "IPC Channel: update-history-limit",
                    "ipc-channel"
                );
                await annotate(
                    "Purpose: Ensure history limit updates work properly",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const limit = 1000;

                mockIpcRenderer.invoke.mockResolvedValue({
                    success: true,
                    data: limit,
                });

                const result =
                    await exposedAPI.settings.updateHistoryLimit(limit);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "update-history-limit",
                    limit
                );
                expect(result).toBe(limit);
            });
        });

        describe("Events API", () => {
            it("should expose all event handling methods", async ({
                annotate,
            }) => {
                await annotate("Component: Events API", "component");
                await annotate(
                    "Test Type: Unit - Method Exposure",
                    "test-type"
                );
                await annotate(
                    "Operation: Event Handling Method Validation",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Real-time Communication",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Event System Validation",
                    "complexity"
                );
                await annotate(
                    "Methods: Status change events, listener management",
                    "methods"
                );
                await annotate(
                    "Purpose: Validate all event handling methods are available",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const eventsAPI = exposedAPI.events;

                expect(eventsAPI).toHaveProperty("onMonitorStatusChanged");
                expect(eventsAPI).toHaveProperty("onMonitorUp");
                expect(eventsAPI).toHaveProperty("onMonitorDown");
                expect(eventsAPI).toHaveProperty("onUpdateStatus");
                expect(eventsAPI).toHaveProperty("removeAllListeners");
            });

            it("should properly setup IPC listener for onMonitorStatusChanged", async ({
                annotate,
            }) => {
                await annotate("Component: Events API", "component");
                await annotate(
                    "Test Type: Unit - Event Listener Setup",
                    "test-type"
                );
                await annotate(
                    "Operation: Monitor Status Change Event Setup",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Status Change Notifications",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Event Registration",
                    "complexity"
                );
                await annotate(
                    "Event Type: Monitor status change events",
                    "event-type"
                );
                await annotate(
                    "Purpose: Ensure monitor status change events are properly registered",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const callback = vi.fn();

                exposedAPI.events.onMonitorStatusChanged(callback);

                expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                    "monitor:status-changed",
                    expect.any(Function)
                );
            });

            it("should properly setup IPC listener for onUpdateStatus", async ({
                annotate,
            }) => {
                await annotate("Component: Events API", "component");
                await annotate(
                    "Test Type: Unit - Event Listener Setup",
                    "test-type"
                );
                await annotate(
                    "Operation: Update Status Event Setup",
                    "operation"
                );
                await annotate(
                    "Priority: High - Application Updates",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Event Registration",
                    "complexity"
                );
                await annotate(
                    "Event Type: Application update status events",
                    "event-type"
                );
                await annotate(
                    "Purpose: Ensure update status events are properly registered",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const callback = vi.fn();

                exposedAPI.events.onUpdateStatus(callback);

                expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                    "update-status",
                    expect.any(Function)
                );
            });

            it("should properly remove listeners", async ({ annotate }) => {
                await annotate("Component: Events API", "component");
                await annotate("Test Type: Unit - Event Cleanup", "test-type");
                await annotate(
                    "Operation: Event Listener Removal",
                    "operation"
                );
                await annotate(
                    "Priority: Medium - Memory Management",
                    "priority"
                );
                await annotate(
                    "Complexity: Low - Cleanup Operation",
                    "complexity"
                );
                await annotate(
                    "Cleanup: Prevents memory leaks from event listeners",
                    "cleanup"
                );
                await annotate(
                    "Purpose: Ensure event listeners can be properly removed",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const channel = "monitor:status-changed";

                exposedAPI.events.removeAllListeners(channel);

                expect(mockIpcRenderer.removeAllListeners).toHaveBeenCalledWith(
                    channel
                );
            });

            it("should call callback with data when IPC event is received", async ({
                annotate,
            }) => {
                await annotate("Component: Events API", "component");
                await annotate(
                    "Test Type: Unit - Event Data Flow",
                    "test-type"
                );
                await annotate(
                    "Operation: IPC Event Data Transmission",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Event Data Integrity",
                    "priority"
                );
                await annotate(
                    "Complexity: High - Event Flow Simulation",
                    "complexity"
                );
                await annotate(
                    "Data Flow: IPC event -> callback with proper data",
                    "data-flow"
                );
                await annotate(
                    "Purpose: Ensure event data is properly passed to callbacks",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const callback = vi.fn();

                exposedAPI.events.onMonitorStatusChanged(callback);

                // Get the listener function that was registered
                const listenerCall = mockIpcRenderer.on.mock.calls.find(
                    (call) => call[0] === "monitor:status-changed"
                );
                expect(listenerCall).toBeDefined();

                const listener = listenerCall![1];

                // Simulate IPC event
                const testData = {
                    monitorId: "test-monitor",
                    siteIdentifier: "test-site",
                    status: "up",
                    previousStatus: "down",
                    timestamp: new Date().toISOString(),
                } satisfies StatusUpdate;
                listener(null, testData);

                expect(callback).toHaveBeenCalledWith(testData);
            });
        });

        describe("System API", () => {
            it("should expose system methods", async ({ annotate }) => {
                await annotate("Component: System API", "component");
                await annotate(
                    "Test Type: Unit - Method Exposure",
                    "test-type"
                );
                await annotate(
                    "Operation: System Method Validation",
                    "operation"
                );
                await annotate(
                    "Priority: Medium - System Integration",
                    "priority"
                );
                await annotate(
                    "Complexity: Low - Method Existence Check",
                    "complexity"
                );
                await annotate(
                    "System Operations: Platform-specific functionality",
                    "system-operations"
                );
                await annotate(
                    "Purpose: Validate system integration methods are available",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();
                const systemAPI = exposedAPI.system;

                expect(systemAPI).toHaveProperty("quitAndInstall");
            });

            it("should invoke IPC for quitAndInstall", async ({ annotate }) => {
                await annotate("Component: System API", "component");
                await annotate(
                    "Test Type: Unit - IPC Communication",
                    "test-type"
                );
                await annotate("Operation: Quit and Install IPC", "operation");
                await annotate(
                    "Priority: High - Application Updates",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - System-level Operation",
                    "complexity"
                );
                await annotate("IPC Channel: quit-and-install", "ipc-channel");
                await annotate(
                    "Purpose: Ensure quit and install operation works properly",
                    "purpose"
                );

                // Mock ipcRenderer.invoke for system API
                const mockInvoke = vi.fn(
                    async (channel: string, ...args: unknown[]) => {
                        if (channel === "diagnostics:verify-ipc-handler") {
                            const targetChannel = args[0];

                            return {
                                success: true,
                                data: {
                                    availableChannels: [
                                        "diagnostics:verify-ipc-handler",
                                        targetChannel,
                                    ],
                                    channel: targetChannel,
                                    registered: true,
                                },
                            };
                        }

                        if (channel === "quit-and-install") {
                            return {
                                success: true,
                                data: true,
                                metadata: { handler: channel },
                            };
                        }

                        return { success: true, data: true };
                    }
                );
                mockIpcRenderer.invoke = mockInvoke;

                await import("../preload");

                const exposedAPI = getExposedAPI();

                const result = await exposedAPI.system.quitAndInstall();

                expect(mockInvoke).toHaveBeenCalledWith("quit-and-install");
                expect(result).toBeTruthy();
            });
        });

        describe("Security Validation", () => {
            it("should only expose safe IPC communication methods", async ({
                annotate,
            }) => {
                await annotate("Component: Security", "component");
                await annotate(
                    "Test Type: Security - API Surface Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Dangerous Method Exclusion Check",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Security Boundary",
                    "priority"
                );
                await annotate(
                    "Complexity: High - Security Validation",
                    "complexity"
                );
                await annotate(
                    "Security Check: Ensures no dangerous methods are exposed",
                    "security-check"
                );
                await annotate(
                    "Purpose: Prevent exposure of dangerous Node.js APIs to renderer",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

                // Should not expose dangerous methods
                expect(exposedAPI).not.toHaveProperty("require");
                expect(exposedAPI).not.toHaveProperty("eval");
                expect(exposedAPI).not.toHaveProperty("process");
                expect(exposedAPI).not.toHaveProperty("global");
            });

            it("should use contextBridge instead of direct global assignment", async ({
                annotate,
            }) => {
                await annotate("Component: Security", "component");
                await annotate(
                    "Test Type: Security - Context Isolation",
                    "test-type"
                );
                await annotate(
                    "Operation: Context Bridge Usage Validation",
                    "operation"
                );
                await annotate(
                    "Priority: Critical - Renderer Isolation",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Security Architecture",
                    "complexity"
                );
                await annotate(
                    "Security Pattern: Uses contextBridge for safe API exposure",
                    "security-pattern"
                );
                await annotate(
                    "Purpose: Ensure proper context isolation is maintained",
                    "purpose"
                );
                await import("../preload");

                // Should use contextBridge.exposeInMainWorld
                expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalled();
            });

            it("should validate that all API methods return promises or are synchronous", async ({
                annotate,
            }) => {
                await annotate("Component: Security", "component");
                await annotate(
                    "Test Type: Security - API Contract Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Promise Return Type Validation",
                    "operation"
                );
                await annotate(
                    "Priority: Medium - API Consistency",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Return Type Validation",
                    "complexity"
                );
                await annotate(
                    "Contract: IPC methods must return promises",
                    "contract"
                );
                await annotate(
                    "Purpose: Ensure consistent async API interface",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

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
            it("should properly type the Site parameter in addSite", async ({
                annotate,
            }) => {
                await annotate("Component: Type Safety", "component");
                await annotate(
                    "Test Type: Unit - Type Contract Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Site Parameter Type Validation",
                    "operation"
                );
                await annotate("Priority: High - Data Type Safety", "priority");
                await annotate(
                    "Complexity: Medium - Type Interface Validation",
                    "complexity"
                );
                await annotate(
                    "Type Contract: Site object with required fields",
                    "type-contract"
                );
                await annotate(
                    "Purpose: Ensure addSite accepts properly typed Site objects",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

                // This should not throw type errors when called with proper Site object
                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitors: [],
                };

                await exposedAPI.sites.addSite(site);
                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "add-site",
                    site
                );
            });

            it("should properly handle partial Site updates in updateSite", async ({
                annotate,
            }) => {
                await annotate("Component: Type Safety", "component");
                await annotate(
                    "Test Type: Unit - Partial Type Validation",
                    "test-type"
                );
                await annotate(
                    "Operation: Partial Site Update Validation",
                    "operation"
                );
                await annotate(
                    "Priority: High - Flexible Update Interface",
                    "priority"
                );
                await annotate(
                    "Complexity: Medium - Partial Type Handling",
                    "complexity"
                );
                await annotate(
                    "Type Contract: Partial Site object for updates",
                    "type-contract"
                );
                await annotate(
                    "Purpose: Ensure updateSite accepts partial Site objects",
                    "purpose"
                );

                await import("../preload");

                const exposedAPI = getExposedAPI();

                const partialUpdate = { name: "New Name" };

                await exposedAPI.sites.updateSite("test-id", partialUpdate);
                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "update-site",
                    "test-id",
                    partialUpdate
                );
            });
        });
    });
});
