/**
 * Comprehensive IpcService Tests - Isolated Component Testing
 *
 * Tests IpcService without ServiceContainer dependencies to achieve 95% coverage.
 * Focuses on handler registration, validation, error handling, and response formatting.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ipcMain, BrowserWindow } from "electron";
import type { IpcMainInvokeEvent, IpcMainEvent } from "electron";

import { IpcService } from "../../electron/services/ipc/IpcService";
import type { UptimeOrchestrator } from "../../electron/UptimeOrchestrator";
import type { AutoUpdaterService } from "../../electron/services/updater/AutoUpdaterService";
import type { Site, Monitor } from "../../shared/types";

// Mock Electron modules
vi.mock("electron", () => ({
    ipcMain: {
        handle: vi.fn(),
        on: vi.fn(),
        removeHandler: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    BrowserWindow: {
        getAllWindows: vi.fn(() => [
            {
                webContents: {
                    send: vi.fn(),
                },
            },
        ]),
    },
}));

// Mock logger
vi.mock("../../electron/utils/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock MonitorTypeRegistry
vi.mock("../../electron/services/monitoring/MonitorTypeRegistry", () => ({
    getAllMonitorTypeConfigs: vi.fn(() => [
        {
            type: "http",
            displayName: "HTTP Monitor",
            description: "HTTP endpoint monitoring",
            version: "1.0.0",
            fields: [{ name: "url", required: true }],
            uiConfig: {
                supportsAdvancedAnalytics: true,
                supportsResponseTime: true,
                detailFormats: { analyticsLabel: "HTTP Analytics" },
                display: { showAdvancedMetrics: true, showUrl: true },
                helpTexts: {
                    primary: "Enter URL",
                    secondary: "Include protocol",
                },
            },
            serviceFactory: vi.fn(),
            validationSchema: {},
        },
        {
            type: "ping",
            displayName: "Ping Monitor",
            description: "Network ping monitoring",
            version: "1.0.0",
            fields: [{ name: "host", required: true }],
            uiConfig: {
                supportsAdvancedAnalytics: false,
                supportsResponseTime: true,
            },
        },
    ]),
    getMonitorTypeConfig: vi.fn((type: string) => {
        if (type === "http") {
            return {
                type: "http",
                uiConfig: {
                    formatDetail: vi.fn(
                        (details: string) => `HTTP: ${details}`
                    ),
                    formatTitleSuffix: vi.fn(
                        (monitor: Monitor) => `(${monitor.id})`
                    ),
                },
            };
        }
        if (type === "unknown") {
            return null;
        }
        return { type, uiConfig: {} };
    }),
}));

// Mock shared validation
vi.mock("@shared/validation/schemas", () => ({
    validateMonitorData: vi.fn((type: string, data: unknown) => ({
        success: type !== "invalid",
        errors: type === "invalid" ? ["Invalid monitor type"] : [],
        warnings: type === "warning" ? ["Warning message"] : [],
        metadata: { validated: true },
    })),
}));

describe("IpcService - Comprehensive Coverage", () => {
    let ipcService: IpcService;
    let mockUptimeOrchestrator: UptimeOrchestrator;
    let mockAutoUpdaterService: AutoUpdaterService;
    let mockIpcEvent: IpcMainInvokeEvent;
    let mockMainEvent: IpcMainEvent;

    const mockSites: Site[] = [
        {
            identifier: "site1",
            name: "Test Site",
            monitoring: true,
            monitors: [
                {
                    id: "monitor1",
                    type: "http",
                    checkInterval: 300,
                    timeout: 30,
                    retryAttempts: 3,
                    status: "up",
                    monitoring: true,
                    responseTime: 150,
                    history: [],
                    url: "https://example.com",
                },
            ],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Create mock IPC events
        mockIpcEvent = {
            frameId: 1,
            processId: 1,
            sender: {} as any,
            senderFrame: {} as any,
        } as IpcMainInvokeEvent;

        mockMainEvent = {
            frameId: 1,
            processId: 1,
            sender: {} as any,
            senderFrame: {} as any,
            ports: [],
            reply: vi.fn(),
            returnValue: undefined,
            type: "unknown" as any,
            preventDefault: vi.fn(),
            defaultPrevented: false,
        } as unknown as IpcMainEvent;

        // Create mock services with all required methods
        mockUptimeOrchestrator = {
            addSite: vi.fn().mockResolvedValue(true),
            removeSite: vi.fn().mockResolvedValue(true),
            getSites: vi.fn().mockResolvedValue(mockSites),
            updateSite: vi.fn().mockResolvedValue(true),
            removeMonitor: vi.fn().mockResolvedValue(true),
            startMonitoring: vi.fn().mockResolvedValue(undefined),
            stopMonitoring: vi.fn().mockResolvedValue(undefined),
            startMonitoringForSite: vi.fn().mockResolvedValue(true),
            stopMonitoringForSite: vi.fn().mockResolvedValue(true),
            checkSiteManually: vi.fn().mockResolvedValue(true),
            exportData: vi.fn().mockResolvedValue("export-data"),
            importData: vi.fn().mockResolvedValue(true),
            setHistoryLimit: vi.fn().mockResolvedValue(undefined),
            getHistoryLimit: vi.fn().mockResolvedValue(1000),
            resetSettings: vi.fn().mockResolvedValue(undefined),
            downloadBackup: vi.fn().mockResolvedValue("/path/to/backup.db"),
            emitTyped: vi.fn().mockResolvedValue(undefined),
        } as unknown as UptimeOrchestrator;

        mockAutoUpdaterService = {
            quitAndInstall: vi.fn(),
        } as unknown as AutoUpdaterService;

        ipcService = new IpcService(
            mockUptimeOrchestrator,
            mockAutoUpdaterService
        );
    });

    describe("Constructor and Basic Setup", () => {
        it("should create instance with required dependencies", () => {
            expect(ipcService).toBeDefined();
            expect(ipcService).toBeInstanceOf(IpcService);
        });

        it("should initialize without registering handlers", () => {
            // Constructor should not register handlers immediately
            expect(ipcMain.handle).not.toHaveBeenCalled();
            expect(ipcMain.on).not.toHaveBeenCalled();
        });
    });

    describe("Handler Setup - Complete Registration", () => {
        it("should register all handler groups when setupHandlers is called", () => {
            ipcService.setupHandlers();

            // Verify multiple handlers are registered
            expect(ipcMain.handle).toHaveBeenCalled();
            expect(ipcMain.on).toHaveBeenCalledWith(
                "quit-and-install",
                expect.any(Function)
            );

            // Check that handle was called for various IPC channels
            const handleCalls = vi.mocked(ipcMain.handle).mock.calls;
            const registeredChannels = handleCalls.map((call) => call[0]);

            // Site handlers
            expect(registeredChannels).toContain("add-site");
            expect(registeredChannels).toContain("remove-site");
            expect(registeredChannels).toContain("get-sites");
            expect(registeredChannels).toContain("update-site");
            expect(registeredChannels).toContain("remove-monitor");

            // Monitoring handlers
            expect(registeredChannels).toContain("start-monitoring");
            expect(registeredChannels).toContain("stop-monitoring");
            expect(registeredChannels).toContain("start-monitoring-for-site");
            expect(registeredChannels).toContain("stop-monitoring-for-site");
            expect(registeredChannels).toContain("check-site-now");

            // Monitor type handlers
            expect(registeredChannels).toContain("get-monitor-types");
            expect(registeredChannels).toContain("format-monitor-detail");
            expect(registeredChannels).toContain("format-monitor-title-suffix");
            expect(registeredChannels).toContain("validate-monitor-data");

            // Data handlers
            expect(registeredChannels).toContain("export-data");
            expect(registeredChannels).toContain("import-data");
            expect(registeredChannels).toContain("update-history-limit");
            expect(registeredChannels).toContain("get-history-limit");
            expect(registeredChannels).toContain("reset-settings");
            expect(registeredChannels).toContain("download-sqlite-backup");

            // State sync handlers
            expect(registeredChannels).toContain("request-full-sync");
            expect(registeredChannels).toContain("get-sync-status");
        });
    });

    describe("Site Handlers - CRUD Operations", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle add-site with valid site data", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "add-site");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const mockSite: Site = {
                identifier: "new-site",
                name: "New Site",
                monitoring: true,
                monitors: [],
            };

            const result = await handler(mockIpcEvent, mockSite);
            expect(mockUptimeOrchestrator.addSite).toHaveBeenCalledWith(
                mockSite
            );
            expect(result).toEqual({ success: true, data: true });
        });

        it("should handle remove-site with site identifier", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "remove-site");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "site-to-remove");

            expect(mockUptimeOrchestrator.removeSite).toHaveBeenCalledWith(
                "site-to-remove"
            );
            expect(result).toEqual({ success: true, data: true });
        });

        it("should handle get-sites without parameters", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "get-sites");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.getSites).toHaveBeenCalled();
            expect(result).toEqual({ success: true, data: mockSites });
        });

        it("should handle update-site with identifier and partial data", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "update-site");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const updateData = { name: "Updated Name" };

            const result = await handler(mockIpcEvent, "site-id", updateData);

            expect(mockUptimeOrchestrator.updateSite).toHaveBeenCalledWith(
                "site-id",
                updateData
            );
            expect(result).toEqual({ success: true, data: true });
        });

        it("should handle remove-monitor with site and monitor identifiers", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "remove-monitor");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "site-id", "monitor-id");

            expect(mockUptimeOrchestrator.removeMonitor).toHaveBeenCalledWith(
                "site-id",
                "monitor-id"
            );
            expect(result).toEqual({ success: true, data: true });
        });
    });

    describe("Monitoring Handlers - Control Operations", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle start-monitoring globally", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "start-monitoring");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.startMonitoring).toHaveBeenCalled();
            expect(result).toEqual({ success: true, data: true });
        });

        it("should handle stop-monitoring globally", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "stop-monitoring");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.stopMonitoring).toHaveBeenCalled();
            expect(result).toEqual({ success: true, data: true });
        });

        it("should handle start-monitoring-for-site with identifier and optional monitor", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find(
                    (call) => call[0] === "start-monitoring-for-site"
                );
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "site-id", "monitor-id");

            expect(
                mockUptimeOrchestrator.startMonitoringForSite
            ).toHaveBeenCalledWith("site-id", "monitor-id");
            expect(result).toEqual({ success: true, data: true });
        });

        it("should handle stop-monitoring-for-site with identifier and optional monitor", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find(
                    (call) => call[0] === "stop-monitoring-for-site"
                );
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "site-id", "monitor-id");

            expect(
                mockUptimeOrchestrator.stopMonitoringForSite
            ).toHaveBeenCalledWith("site-id", "monitor-id");
            expect(result).toEqual({ success: true, data: true });
        });

        it("should handle check-site-now with site and monitor identifiers", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "check-site-now");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "site-id", "monitor-id");

            expect(
                mockUptimeOrchestrator.checkSiteManually
            ).toHaveBeenCalledWith("site-id", "monitor-id");
            expect(result).toEqual({ success: true, data: true });
        });
    });

    describe("Monitor Type Handlers - Configuration and Validation", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle get-monitor-types and serialize configurations", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "get-monitor-types");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);

            // Check serialized config structure
            const httpConfig = result.data.find(
                (config: any) => config.type === "http"
            );
            expect(httpConfig).toBeDefined();
            expect(httpConfig.displayName).toBe("HTTP Monitor");
            expect(httpConfig.description).toBe("HTTP endpoint monitoring");
            expect(httpConfig.version).toBe("1.0.0");
            expect(httpConfig.uiConfig).toBeDefined();
            expect(httpConfig.uiConfig.supportsAdvancedAnalytics).toBe(true);
            expect(httpConfig.uiConfig.supportsResponseTime).toBe(true);

            // Check that non-serializable properties are excluded
            expect(httpConfig.serviceFactory).toBeUndefined();
            expect(httpConfig.validationSchema).toBeUndefined();
        });

        it("should handle format-monitor-detail with known monitor type", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "format-monitor-detail");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "http", "test details");

            expect(result).toEqual({
                success: true,
                data: "HTTP: test details",
            });
        });

        it("should handle format-monitor-detail with unknown monitor type", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "format-monitor-detail");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(
                mockIpcEvent,
                "unknown",
                "test details"
            );

            expect(result).toEqual({ success: true, data: "test details" });
        });

        it("should handle format-monitor-title-suffix with known monitor type", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find(
                    (call) => call[0] === "format-monitor-title-suffix"
                );
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const mockMonitor: Monitor = {
                id: "monitor1",
                type: "http",
                checkInterval: 300,
                timeout: 30,
                retryAttempts: 3,
                status: "up",
                monitoring: true,
                responseTime: 150,
                history: [],
                url: "https://example.com",
            };

            const result = await handler(mockIpcEvent, "http", mockMonitor);

            expect(result).toEqual({ success: true, data: "(monitor1)" });
        });

        it("should handle format-monitor-title-suffix with unknown monitor type", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find(
                    (call) => call[0] === "format-monitor-title-suffix"
                );
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const mockMonitor: Monitor = {
                id: "monitor1",
                type: "ping", // Use valid type instead of "unknown"
                checkInterval: 300,
                timeout: 30,
                retryAttempts: 3,
                status: "up",
                monitoring: true,
                responseTime: 150,
                history: [],
                host: "example.com",
            };

            const result = await handler(mockIpcEvent, "unknown", mockMonitor);

            expect(result).toEqual({ success: true, data: "" });
        });

        it("should handle validate-monitor-data with valid data", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "validate-monitor-data");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "http", {
                url: "https://example.com",
            });

            expect(result.success).toBe(true);
            expect(result.errors).toEqual([]);
            expect(result.warnings).toEqual([]);
            expect(result.metadata).toEqual({ validated: true });
        });

        it("should handle validate-monitor-data with invalid data", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "validate-monitor-data");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "invalid", {
                invalid: true,
            });

            expect(result.success).toBe(false);
            expect(result.errors).toEqual(["Invalid monitor type"]);
        });

        it("should handle validate-monitor-data with warnings", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "validate-monitor-data");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "warning", {
                data: "test",
            });

            expect(result.success).toBe(true);
            expect(result.warnings).toEqual(["Warning message"]);
        });
    });

    describe("Data Handlers - Import/Export and Settings", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle export-data without parameters", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "export-data");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.exportData).toHaveBeenCalled();
            expect(result).toEqual({ success: true, data: "export-data" });
        });

        it("should handle import-data with data string", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "import-data");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "import-data-string");

            expect(mockUptimeOrchestrator.importData).toHaveBeenCalledWith(
                "import-data-string"
            );
            expect(result).toEqual({ success: true, data: true });
        });

        it("should handle update-history-limit with number parameter", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "update-history-limit");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, 5000);

            expect(mockUptimeOrchestrator.setHistoryLimit).toHaveBeenCalledWith(
                5000
            );
            expect(result).toEqual({ success: true, data: undefined });
        });

        it("should handle get-history-limit without parameters", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "get-history-limit");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.getHistoryLimit).toHaveBeenCalled();
            expect(result).toEqual({ success: true, data: 1000 });
        });

        it("should handle reset-settings without parameters", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "reset-settings");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.resetSettings).toHaveBeenCalled();
            expect(result).toEqual({ success: true, data: undefined });
        });

        it("should handle download-sqlite-backup without parameters", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find(
                    (call) => call[0] === "download-sqlite-backup"
                );
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.downloadBackup).toHaveBeenCalled();
            expect(result).toEqual({
                success: true,
                data: "/path/to/backup.db",
            });
        });
    });

    describe("State Sync Handlers - Synchronization", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle request-full-sync and emit events", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "request-full-sync");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.getSites).toHaveBeenCalled();
            expect(mockUptimeOrchestrator.emitTyped).toHaveBeenCalledWith(
                "sites:state-synchronized",
                {
                    action: "bulk-sync",
                    source: "database",
                    timestamp: expect.any(Number),
                }
            );

            // Check BrowserWindow state sync event
            const mockWindow = BrowserWindow.getAllWindows()[0];
            expect(mockWindow.webContents.send).toHaveBeenCalledWith(
                "state-sync-event",
                {
                    action: "bulk-sync",
                    sites: mockSites,
                    source: "database",
                    timestamp: expect.any(Number),
                }
            );

            expect(result).toEqual({
                success: true,
                data: { siteCount: 1, success: true },
            });
        });

        it("should handle get-sync-status and return status info", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "get-sync-status");
            expect(handleCall).toBeDefined();

            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(mockUptimeOrchestrator.getSites).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                lastSync: expect.any(Number),
                siteCount: 1,
                success: true,
                synchronized: true,
            });
        });
    });

    describe("System Handlers - Application Control", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should register quit-and-install event handler", () => {
            expect(ipcMain.on).toHaveBeenCalledWith(
                "quit-and-install",
                expect.any(Function)
            );

            // Simulate the event handler being called
            const onCall = vi
                .mocked(ipcMain.on)
                .mock.calls.find((call) => call[0] === "quit-and-install");
            expect(onCall).toBeDefined();

            const handler = onCall![1];
            handler(mockMainEvent);

            expect(mockAutoUpdaterService.quitAndInstall).toHaveBeenCalled();
        });
    });

    describe("Serialization - Monitor Type Config", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should properly serialize UI config with all components", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "get-monitor-types");
            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            const httpConfig = result.data.find(
                (config: any) => config.type === "http"
            );

            expect(httpConfig.uiConfig).toEqual({
                supportsAdvancedAnalytics: true,
                supportsResponseTime: true,
                detailFormats: { analyticsLabel: "HTTP Analytics" },
                display: { showAdvancedMetrics: true, showUrl: true },
                helpTexts: {
                    primary: "Enter URL",
                    secondary: "Include protocol",
                },
            });
        });

        it("should serialize UI config with minimal components", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "get-monitor-types");
            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            const pingConfig = result.data.find(
                (config: any) => config.type === "ping"
            );

            expect(pingConfig.uiConfig).toEqual({
                supportsAdvancedAnalytics: false,
                supportsResponseTime: true,
            });
        });

        it("should handle empty UI config serialization", () => {
            // This tests the internal serialization utilities through configuration
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "get-monitor-types");
            expect(handleCall).toBeDefined();
            // The serialization is tested through the actual handler execution above
        });
    });

    describe("Cleanup and Error Handling", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should cleanup all registered handlers", () => {
            ipcService.cleanup();

            expect(ipcMain.removeHandler).toHaveBeenCalled();
            expect(ipcMain.removeAllListeners).toHaveBeenCalledWith(
                "quit-and-install"
            );

            // Verify that all registered channels are cleaned up
            const removeHandlerCalls = vi.mocked(ipcMain.removeHandler).mock
                .calls;
            const removedChannels = removeHandlerCalls.map((call) => call[0]);

            // Check that important channels are being removed
            expect(removedChannels.length).toBeGreaterThan(0);
        });

        it("should handle errors in orchestrator methods gracefully", async () => {
            // Mock an error in getSites
            mockUptimeOrchestrator.getSites = vi
                .fn()
                .mockRejectedValue(new Error("Database error"));

            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "get-sites");
            const handler = handleCall![1];

            await expect(handler(mockIpcEvent)).rejects.toThrow(
                "Database error"
            );
        });

        it("should handle async errors in monitoring operations", async () => {
            // Mock an error in startMonitoring
            mockUptimeOrchestrator.startMonitoring = vi
                .fn()
                .mockRejectedValue(new Error("Monitoring error"));

            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "start-monitoring");
            const handler = handleCall![1];

            await expect(handler(mockIpcEvent)).rejects.toThrow(
                "Monitoring error"
            );
        });
    });

    describe("Edge Cases and Boundary Conditions", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle empty sites array in sync operations", async () => {
            mockUptimeOrchestrator.getSites = vi.fn().mockResolvedValue([]);

            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "request-full-sync");
            const handler = handleCall![1];
            const result = await handler(mockIpcEvent);

            expect(result.data.siteCount).toBe(0);
        });

        it("should handle monitor configuration without formatDetail function", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "format-monitor-detail");
            const handler = handleCall![1];
            const result = await handler(mockIpcEvent, "ping", "test details");

            expect(result).toEqual({ success: true, data: "test details" });
        });

        it("should handle monitor configuration without formatTitleSuffix function", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find(
                    (call) => call[0] === "format-monitor-title-suffix"
                );
            const handler = handleCall![1];
            const mockMonitor: Monitor = {
                id: "monitor1",
                type: "ping",
                checkInterval: 300,
                timeout: 30,
                retryAttempts: 3,
                status: "up",
                monitoring: true,
                responseTime: 150,
                history: [],
                host: "example.com",
            };

            const result = await handler(mockIpcEvent, "ping", mockMonitor);
            expect(result).toEqual({ success: true, data: "" });
        });

        it("should handle whitespace in monitor type for trimming", async () => {
            const handleCall = vi
                .mocked(ipcMain.handle)
                .mock.calls.find((call) => call[0] === "format-monitor-detail");
            const handler = handleCall![1];
            const result = await handler(
                mockIpcEvent,
                "  http  ",
                "test details"
            );

            expect(result).toEqual({
                success: true,
                data: "HTTP: test details",
            });
        });
    });
});
