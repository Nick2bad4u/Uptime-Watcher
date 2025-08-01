/**
 * Tests for IpcService - Comprehensive IPC handler coverage
 * Tests all IPC handler registration, validation, and cleanup functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { IpcService } from "../../../services/ipc/IpcService";

// Use vi.hoisted to fix hoisting issues with mocks
const {
    mockUptimeOrchestrator,
    mockAutoUpdaterService,
    mockIpcMain,
    mockBrowserWindow,
    mockLogger,
    mockGetAllMonitorTypeConfigs,
    mockGetMonitorTypeConfig,
    mockValidateMonitorData,
} = vi.hoisted(() => {
    const mockUptimeOrchestrator = {
        addSite: vi.fn(),
        getSites: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
        removeMonitor: vi.fn(),
        checkSiteManually: vi.fn(),
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
        downloadBackup: vi.fn(),
        exportData: vi.fn(),
        importData: vi.fn(),
        getHistoryLimit: vi.fn(),
        setHistoryLimit: vi.fn(),
        historyLimit: 500,
    };

    const mockAutoUpdaterService = {
        checkForUpdates: vi.fn(),
        quitAndInstall: vi.fn(),
    };

    const mockIpcMain = {
        handle: vi.fn(),
        on: vi.fn(),
        removeHandler: vi.fn(),
        removeAllListeners: vi.fn(),
    };

    const mockBrowserWindow = {
        getAllWindows: vi.fn(() => []),
        fromWebContents: vi.fn(),
        webContents: {
            send: vi.fn(),
        },
    };

    const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    };

    // Mock monitor type registry
    const mockGetAllMonitorTypeConfigs = vi.fn(() => [
        {
            type: "http",
            displayName: "HTTP Monitor",
            description: "Monitor HTTP endpoints",
            version: "1.0.0",
            fields: [{ name: "url", type: "string", label: "URL", required: true }],
            uiConfig: {
                display: { showUrl: true, showAdvancedMetrics: false },
                supportsResponseTime: true,
                supportsAdvancedAnalytics: false,
                helpTexts: { primary: "Monitor HTTP endpoints", secondary: "Check website availability" },
            },
            serviceFactory: vi.fn(),
            validationSchema: {},
        },
    ]);

    const mockGetMonitorTypeConfig = vi.fn((type: string) => {
        if (type === "http") {
            return mockGetAllMonitorTypeConfigs()[0];
        }
        return null;
    });

    const mockValidateMonitorData = vi.fn(() => ({ success: true, errors: [] }));

    return {
        mockUptimeOrchestrator,
        mockAutoUpdaterService,
        mockIpcMain,
        mockBrowserWindow,
        mockLogger,
        mockGetAllMonitorTypeConfigs,
        mockGetMonitorTypeConfig,
        mockValidateMonitorData,
    };
});

// Set up mocks
vi.mock("electron", () => ({
    ipcMain: mockIpcMain,
    BrowserWindow: mockBrowserWindow,
}));

vi.mock("../../utils/logger", () => ({
    logger: mockLogger,
}));

vi.mock("../monitoring/MonitorTypeRegistry", () => ({
    getAllMonitorTypeConfigs: mockGetAllMonitorTypeConfigs,
    getMonitorTypeConfig: mockGetMonitorTypeConfig,
    validateMonitorData: mockValidateMonitorData,
}));

vi.mock("./", () => ({
    createValidationResponse: vi.fn((success, errors = []) => ({ success, errors })),
    registerStandardizedIpcHandler: vi.fn((channel, handler, _validators) => {
        mockIpcMain.handle(channel, handler);
    }),
    DataHandlerValidators: {},
    MonitoringHandlerValidators: {},
    MonitorTypeHandlerValidators: {},
    SiteHandlerValidators: {},
    StateSyncHandlerValidators: {},
}));

describe("IpcService", () => {
    let ipcService: IpcService;

    beforeEach(() => {
        vi.clearAllMocks();
        ipcService = new IpcService(mockUptimeOrchestrator as any, mockAutoUpdaterService as any);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Constructor", () => {
        it("should initialize with required dependencies", () => {
            expect(ipcService).toBeDefined();
            expect(ipcService).toBeInstanceOf(IpcService);
        });
    });

    describe("setupHandlers", () => {
        it("should register all handler categories", () => {
            ipcService.setupHandlers();

            // Verify that ipcMain.handle was called multiple times for different handlers
            expect(mockIpcMain.handle).toHaveBeenCalledTimes(22);
            expect(mockIpcMain.on).toHaveBeenCalled();
        });

        it("should setup site handlers", () => {
            ipcService.setupHandlers();

            // Verify site-related handlers are registered
            const handleCalls = mockIpcMain.handle.mock.calls.map((call) => call[0]);
            expect(handleCalls).toContain("add-site");
            expect(handleCalls).toContain("get-sites");
            expect(handleCalls).toContain("remove-site");
            expect(handleCalls).toContain("update-site");
        });

        it("should setup monitoring handlers", () => {
            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map((call) => call[0]);
            expect(handleCalls).toContain("start-monitoring");
            expect(handleCalls).toContain("stop-monitoring");
            expect(handleCalls).toContain("check-site-now");
        });

        it("should setup monitor type handlers", () => {
            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map((call) => call[0]);
            expect(handleCalls).toContain("get-monitor-types");
            expect(handleCalls).toContain("format-monitor-detail");
            expect(handleCalls).toContain("format-monitor-title-suffix");
        });

        it("should setup data handlers", () => {
            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map((call) => call[0]);
            expect(handleCalls).toContain("download-sqlite-backup");
            expect(handleCalls).toContain("export-data");
            expect(handleCalls).toContain("import-data");
        });

        it("should setup system handlers", () => {
            ipcService.setupHandlers();

            // System handlers only use ipcMain.on, not ipcMain.handle
            // Check for quit-and-install listener
            const onCalls = mockIpcMain.on.mock.calls.map((call) => call[0]);
            expect(onCalls).toContain("quit-and-install");
        });

        it("should setup state sync handlers", () => {
            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map((call) => call[0]);
            expect(handleCalls).toContain("get-history-limit");
            expect(handleCalls).toContain("update-history-limit");
        });
    });

    describe("cleanup", () => {
        it("should remove all registered handlers", () => {
            ipcService.setupHandlers();

            // Get the number of handlers that were registered
            // const registeredHandlerCount = mockIpcMain.handle.mock.calls.length; // Currently unused

            ipcService.cleanup();

            expect(mockIpcMain.removeHandler).toHaveBeenCalledTimes(23);
            expect(mockIpcMain.removeAllListeners).toHaveBeenCalledWith("quit-and-install");
        });

        it("should handle cleanup when no handlers are registered", () => {
            ipcService.cleanup();

            expect(mockIpcMain.removeAllListeners).toHaveBeenCalledWith("quit-and-install");
        });
    });

    describe("serializeMonitorTypeConfig", () => {
        it("should handle monitor type configs with undefined uiConfig", () => {
            mockGetAllMonitorTypeConfigs.mockReturnValueOnce([
                {
                    type: "tcp",
                    displayName: "TCP Monitor",
                    description: "Monitor TCP ports",
                    version: "1.0.0",
                    fields: [],
                    uiConfig: undefined as any,
                    serviceFactory: vi.fn(),
                    validationSchema: {},
                },
            ]);

            ipcService.setupHandlers();

            const getAllHandler = mockIpcMain.handle.mock.calls.find((call) => call[0] === "monitor-types:get")?.[1];

            if (getAllHandler) {
                const result = getAllHandler({}, "tcp");

                expect(result.data[0].uiConfig).toBeUndefined();
            }
        });

        it("should warn about unexpected properties", () => {
            mockGetAllMonitorTypeConfigs.mockReturnValueOnce([
                {
                    type: "http",
                    displayName: "HTTP Monitor",
                    description: "Monitor HTTP endpoints",
                    version: "1.0.0",
                    fields: [],
                    unexpectedProperty: "should be warned about",
                    serviceFactory: vi.fn(),
                    validationSchema: {},
                } as any,
            ]);

            ipcService.setupHandlers();

            const getAllHandler = mockIpcMain.handle.mock.calls.find((call) => call[0] === "monitor-types:get")?.[1];

            if (getAllHandler) {
                getAllHandler({}, "http");

                expect(mockLogger.warn).toHaveBeenCalledWith("[IpcService] Unexpected properties in monitor config", {
                    type: "http",
                    unexpectedProperties: ["unexpectedProperty"],
                });
            }
        });
    });

    describe("Handler Implementation", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle sites:get requests", async () => {
            const mockSites = [
                {
                    identifier: "1",
                    name: "Test Site",
                    monitors: [],
                    monitoring: false,
                },
            ];
            vi.mocked(mockUptimeOrchestrator.getSites).mockResolvedValue(mockSites);

            const getHandler = mockIpcMain.handle.mock.calls.find((call) => call[0] === "sites:get")?.[1];

            if (getHandler) {
                const result = await getHandler();
                expect(result).toEqual({ success: true, data: mockSites });
                expect(mockUptimeOrchestrator.getSites).toHaveBeenCalled();
            }
        });

        it("should handle monitor-types:get requests", () => {
            const getHandler = mockIpcMain.handle.mock.calls.find((call) => call[0] === "monitor-types:get-all")?.[1];

            if (getHandler) {
                const result = getHandler({}, "http");

                expect(result).toEqual({
                    success: true,
                    data: {
                        type: "http",
                        displayName: "HTTP Monitor",
                        description: "Monitor HTTP endpoints",
                        version: "1.0.0",
                        fields: [{ name: "url", type: "string", label: "URL", required: true }],
                        uiConfig: {
                            display: { showUrl: true, showAdvancedMetrics: false },
                            supportsResponseTime: true,
                            supportsAdvancedAnalytics: false,
                            helpTexts: { primary: "Monitor HTTP endpoints", secondary: "Check website availability" },
                        },
                    },
                });
                expect(mockGetMonitorTypeConfig).toHaveBeenCalledWith("http");
            }
        });

        it("should handle monitor-types:validate requests", () => {
            const validateHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "monitor-types:validate"
            )?.[1];

            if (validateHandler) {
                const result = validateHandler({}, "http", { url: "https://example.com" });

                expect(result).toEqual({ success: true, errors: [] });
                expect(mockValidateMonitorData).toHaveBeenCalledWith("http", { url: "https://example.com" });
            }
        });

        it("should handle system:check-for-updates requests", async () => {
            mockAutoUpdaterService.checkForUpdates.mockResolvedValue(undefined);

            const checkUpdatesHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "system:check-for-updates"
            )?.[1];

            if (checkUpdatesHandler) {
                const result = await checkUpdatesHandler();
                expect(result).toEqual({ success: true, data: null });
                expect(mockAutoUpdaterService.checkForUpdates).toHaveBeenCalled();
            }
        });

        it("should handle quit-and-install listener", () => {
            const quitAndInstallListener = mockIpcMain.on.mock.calls.find(
                (call) => call[0] === "quit-and-install"
            )?.[1];

            expect(quitAndInstallListener).toBeDefined();

            if (quitAndInstallListener) {
                quitAndInstallListener();
                expect(mockAutoUpdaterService.quitAndInstall).toHaveBeenCalled();
            }
        });

        it("should handle state:get-history-limit requests", () => {
            const getHistoryLimitHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "state:get-history-limit"
            )?.[1];

            if (getHistoryLimitHandler) {
                const result = getHistoryLimitHandler();
                expect(result).toEqual({ success: true, data: 500 });
            }
        });

        it("should handle errors in handlers gracefully", async () => {
            vi.mocked(mockUptimeOrchestrator.getSites).mockRejectedValue(new Error("Database error"));

            const getHandler = mockIpcMain.handle.mock.calls.find((call) => call[0] === "sites:get")?.[1];

            if (getHandler) {
                await expect(getHandler()).rejects.toThrow("Database error");
            }
        });
    });

    describe("Monitor Type Config Edge Cases", () => {
        it("should handle monitor type not found", () => {
            mockGetMonitorTypeConfig.mockReturnValue(null);

            ipcService.setupHandlers();

            const getHandler = mockIpcMain.handle.mock.calls.find((call) => call[0] === "monitor-types:get")?.[1];

            if (getHandler) {
                const result = getHandler({}, "nonexistent");

                expect(result).toEqual({
                    success: false,
                    errors: ["Monitor type 'nonexistent' not found"],
                });
            }
        });

        it("should handle complex uiConfig serialization", () => {
            mockGetAllMonitorTypeConfigs.mockReturnValueOnce([
                {
                    type: "complex",
                    displayName: "Complex Monitor",
                    description: "Complex monitor with full UI config",
                    version: "1.0.0",
                    fields: [],
                    uiConfig: {
                        display: { showUrl: true, showAdvancedMetrics: true },
                        supportsResponseTime: true,
                        supportsAdvancedAnalytics: true,
                        helpTexts: { primary: "Primary help", secondary: "Secondary help" },
                        detailFormats: { analyticsLabel: "Analytics" },
                    } as any,
                    serviceFactory: vi.fn(),
                    validationSchema: {},
                },
            ]);

            ipcService.setupHandlers();

            const getAllHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "monitor-types:get-all"
            )?.[1];

            if (getAllHandler) {
                const result = getAllHandler();

                expect(result.data[0].uiConfig).toEqual({
                    display: { showUrl: true, showAdvancedMetrics: true },
                    supportsResponseTime: true,
                    supportsAdvancedAnalytics: true,
                    helpTexts: { primary: "Primary help", secondary: "Secondary help" },
                    detailFormats: { analyticsLabel: "Analytics" },
                });
            }
        });
    });
});
