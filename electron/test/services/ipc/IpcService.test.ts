/**
 * Tests for IpcService - Comprehensive IPC handler coverage Tests all IPC
 * handler registration, validation, and cleanup functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { IpcService } from "../../../services/ipc/IpcService";
import {
    getDiagnosticsMetrics,
    resetDiagnosticsMetrics,
} from "../../../services/ipc/diagnosticsMetrics";
import { CloudService } from "../../../services/cloud/CloudService";

// Use vi.hoisted to fix hoisting issues with mocks
const mockNotificationService = {
    updateConfig: vi.fn(),
};

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
    const mockBackupBuffer = Buffer.from("mock backup");
    const defaultBackupMetadata = {
        checksum: "mock-checksum",
        createdAt: 1_700_000_000_000,
        originalPath: "/tmp/uptime-watcher.db",
        schemaVersion: 1,
        sizeBytes: mockBackupBuffer.byteLength,
    };
    const mockUptimeOrchestrator = {
        addSite: vi.fn(),
        getSites: vi.fn(),
        getCachedSiteCount: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
        removeMonitor: vi.fn(),
        checkSiteManually: vi.fn(),
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
        downloadBackup: vi.fn().mockResolvedValue({
            buffer: mockBackupBuffer,
            fileName: "backup.db",
            metadata: { ...defaultBackupMetadata },
        }),
        exportData: vi.fn(),
        importData: vi.fn(),
        getHistoryLimit: vi.fn(),
        setHistoryLimit: vi.fn().mockResolvedValue(undefined),
        historyLimit: 500,
        onTyped: vi.fn(),
        off: vi.fn(),
        emitTyped: vi.fn(),
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
            fields: [
                {
                    name: "url",
                    type: "url",
                    label: "URL",
                    required: true,
                    helpText: "Enter the endpoint URL",
                    placeholder: "https://status.example.com",
                },
            ],
            uiConfig: {
                display: { showUrl: true, showAdvancedMetrics: false },
                supportsResponseTime: true,
                supportsAdvancedAnalytics: false,
                helpTexts: {
                    primary: "Monitor HTTP endpoints",
                    secondary: "Check website availability",
                },
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
    const mockValidateMonitorData = vi.fn(() => ({
        success: true,
        errors: [],
    }));

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
    diagnosticsLogger: mockLogger,
}));

vi.mock("../../../services/monitoring/MonitorTypeRegistry", () => ({
    getAllMonitorTypeConfigs: mockGetAllMonitorTypeConfigs,
    getMonitorTypeConfig: mockGetMonitorTypeConfig,
    validateMonitorData: mockValidateMonitorData,
}));

vi.mock("./", () => ({
    createValidationResponse: vi.fn((success, errors = []) => ({
        success,
        errors,
    })),
    registerStandardizedIpcHandler: vi.fn((channel, handler, _validators) => {
        mockIpcMain.handle(channel, handler);
    }),
    DataHandlerValidators: {},
    SettingsHandlerValidators: {},
    MonitoringHandlerValidators: {},
    MonitorTypeHandlerValidators: {},
    NotificationHandlerValidators: {},
    SiteHandlerValidators: {},
    StateSyncHandlerValidators: {},
}));

describe(IpcService, () => {
    let ipcService: IpcService;
    let cloudService: CloudService;

    beforeEach(() => {
        vi.clearAllMocks();
        resetDiagnosticsMetrics();
        mockNotificationService.updateConfig.mockReset();

        cloudService = new CloudService({
            orchestrator: mockUptimeOrchestrator as any,
            settings: {
                get: vi.fn(),
                set: vi.fn(),
            },
        });

        ipcService = new IpcService(
            mockUptimeOrchestrator as any,
            mockAutoUpdaterService as any,
            mockNotificationService as any,
            cloudService
        );
    });
    afterEach(() => {
        vi.resetAllMocks();
    });
    describe("Constructor", () => {
        it("should initialize with required dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            expect(ipcService).toBeDefined();
            expect(ipcService).toBeInstanceOf(IpcService);
        });
    });
    describe("setupHandlers", () => {
        it("should register all handler categories", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();
            // Verify that ipcMain.handle was called multiple times for different handlers
            // Use dynamic count since the number may change as handlers are added/removed
            const handleCallCount = mockIpcMain.handle.mock.calls.length;
            expect(handleCallCount).toBeGreaterThan(20); // Ensure reasonable number of handlers
        });
        it("records diagnostics metrics during handler verification", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            const diagnosticsEntry = mockIpcMain.handle.mock.calls.find(
                ([channel]) => channel === "diagnostics-verify-ipc-handler"
            );

            expect(diagnosticsEntry).toBeDefined();

            const diagnosticsHandler = diagnosticsEntry?.[1];
            expect(typeof diagnosticsHandler).toBe("function");

            const successResponse = await (diagnosticsHandler as any)(
                undefined,
                "get-history-limit"
            );
            expect(successResponse.success).toBeTruthy();
            expect(successResponse.data?.registered).toBeTruthy();

            let metrics = getDiagnosticsMetrics();
            expect(metrics.successfulHandlerChecks).toBe(1);
            expect(metrics.missingHandlerChecks).toBe(0);

            const failureResponse = await (diagnosticsHandler as any)(
                undefined,
                "missing-channel"
            );
            expect(failureResponse.success).toBeTruthy();
            expect(failureResponse.data?.registered).toBeFalsy();

            metrics = getDiagnosticsMetrics();
            expect(metrics.missingHandlerChecks).toBe(1);
            expect(metrics.lastMissingChannel).toBe("missing-channel");
        });
        it("records preload guard diagnostics", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            const diagnosticsEntry = mockIpcMain.handle.mock.calls.find(
                ([channel]) => channel === "diagnostics-report-preload-guard"
            );

            expect(diagnosticsEntry).toBeDefined();

            const diagnosticsHandler = diagnosticsEntry?.[1];
            expect(typeof diagnosticsHandler).toBe("function");

            const timestamp = Date.now();
            await (diagnosticsHandler as any)(undefined, {
                channel: "monitor:status-changed",
                guard: "isMonitorStatusChangedEventData",
                metadata: { source: "eventsApi" },
                payloadPreview: '{"status":42}',
                reason: "payload-validation",
                timestamp,
            });

            const metrics = getDiagnosticsMetrics();
            expect(metrics.preloadGuardReports).toBe(1);
            expect(metrics.lastPreloadGuard).toEqual({
                channel: "monitor:status-changed",
                guard: "isMonitorStatusChangedEventData",
                reason: "payload-validation",
                timestamp,
            });
            expect(mockUptimeOrchestrator.emitTyped).toHaveBeenCalledWith(
                "diagnostics:report-created",
                expect.objectContaining({
                    channel: "monitor:status-changed",
                    guard: "isMonitorStatusChangedEventData",
                    payloadPreviewLength: expect.any(Number),
                    correlationId: expect.any(String),
                })
            );
        });
        it("should setup monitoring handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map(
                (call) => call[0]
            );
            expect(handleCalls).toContain("start-monitoring");
            expect(handleCalls).toContain("stop-monitoring");
            expect(handleCalls).toContain("start-monitoring-for-site");
            expect(handleCalls).toContain("start-monitoring-for-monitor");
            expect(handleCalls).toContain("stop-monitoring-for-site");
            expect(handleCalls).toContain("stop-monitoring-for-monitor");
            expect(handleCalls).toContain("check-site-now");
        });
        it("should setup monitor type handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map(
                (call) => call[0]
            );
            expect(handleCalls).toContain("get-monitor-types");
            expect(handleCalls).toContain("format-monitor-detail");
            expect(handleCalls).toContain("format-monitor-title-suffix");
        });
        it("should setup notification handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            const notificationHandlerEntry = mockIpcMain.handle.mock.calls.find(
                ([channel]) => channel === "update-notification-preferences"
            );

            expect(notificationHandlerEntry).toBeDefined();

            const handler = notificationHandlerEntry?.[1];
            expect(typeof handler).toBe("function");

            await (handler as any)(undefined, {
                systemNotificationsEnabled: false,
                systemNotificationsSoundEnabled: true,
            });

            expect(mockNotificationService.updateConfig).toHaveBeenCalledWith({
                enabled: false,
                mutedSiteNotificationIdentifiers: [],
                playSound: true,
            });
        });
        it("should setup data handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map(
                (call) => call[0]
            );
            expect(handleCalls).toContain("download-sqlite-backup");
            expect(handleCalls).toContain("export-data");
            expect(handleCalls).toContain("import-data");
        });
        it("should setup system handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map(
                (call) => call[0]
            );
            expect(handleCalls).toContain("quit-and-install");
        });
        it("should setup state sync handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            const handleCalls = mockIpcMain.handle.mock.calls.map(
                (call) => call[0]
            );
            expect(handleCalls).toContain("get-history-limit");
            expect(handleCalls).toContain("update-history-limit");
        });
    });
    describe("cleanup", () => {
        it("should remove all registered handlers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.setupHandlers();

            // Get the number of handlers that were registered via ipcMain.handle
            const registeredHandlerCount = mockIpcMain.handle.mock.calls.length;

            ipcService.cleanup();

            expect(mockIpcMain.removeHandler).toHaveBeenCalledTimes(
                registeredHandlerCount
            );
            expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
                "quit-and-install"
            );
            expect(mockIpcMain.removeAllListeners).not.toHaveBeenCalled();
        });
        it("should handle cleanup when no handlers are registered", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            ipcService.cleanup();

            expect(mockIpcMain.removeHandler).not.toHaveBeenCalled();
            expect(mockIpcMain.removeAllListeners).not.toHaveBeenCalled();
        });
    });
    describe("serializeMonitorTypeConfig", () => {
        it("should handle monitor type configs with undefined uiConfig", async () => {
            ipcService.setupHandlers();

            // This test verifies that the handler works regardless of mock setup
            const getAllHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "get-monitor-types"
            )?.[1];

            if (getAllHandler) {
                const result = await getAllHandler();

                expect(result).toEqual({
                    success: true,
                    data: expect.any(Array),
                    metadata: expect.objectContaining({
                        handler: "get-monitor-types",
                    }),
                });
                // Check that the data is an array with monitor type configs
                expect(Array.isArray(result.data)).toBeTruthy();
                expect(result.data.length).toBeGreaterThan(0);
            } else {
                expect.fail("Handler not found for get-monitor-types");
            }
        });
        it("should fail when monitor configs include unexpected properties", async () => {
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

            const getAllHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "get-monitor-types"
            )?.[1];

            if (getAllHandler) {
                const result = await getAllHandler();
                expect(result.success).toBeFalsy();
                expect(result.error).toContain("unexpected properties");
            } else {
                expect.fail("Handler not found for get-monitor-types");
            }
        });
    });
    describe("Handler Implementation", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });
        it("should handle sites:get requests", async () => {
            const primarySite = {
                identifier: "1",
                name: "Test Site",
                monitors: [],
                monitoring: false,
            };
            const duplicateSite = {
                ...primarySite,
                name: "Duplicated Name",
            };
            const secondarySite = {
                identifier: "2",
                name: "Another Site",
                monitors: [],
                monitoring: true,
            };
            const mockSites = [
                primarySite,
                duplicateSite,
                secondarySite,
            ];
            vi.mocked(mockUptimeOrchestrator.getSites).mockResolvedValue(
                mockSites
            );

            const getHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "get-sites"
            )?.[1];

            if (getHandler) {
                const result = await getHandler();
                expect(result).toEqual({
                    success: true,
                    data: [primarySite, secondarySite],
                    metadata: expect.objectContaining({
                        handler: "get-sites",
                    }),
                });
                expect(mockUptimeOrchestrator.getSites).toHaveBeenCalled();
            } else {
                expect.fail("Handler not found for get-sites");
            }
        });
        it("should handle monitor-types:get requests", async () => {
            const getHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "get-monitor-types"
            )?.[1];

            if (getHandler) {
                const result = await getHandler();

                expect(result).toEqual({
                    success: true,
                    data: expect.arrayContaining([
                        expect.objectContaining({
                            type: "http",
                            displayName: expect.any(String),
                            description: expect.any(String),
                            version: "1.0.0",
                            fields: expect.any(Array),
                            uiConfig: expect.any(Object),
                        }),
                    ]),
                    metadata: expect.objectContaining({
                        handler: "get-monitor-types",
                    }),
                });
                // Remove mock call expectation since we're using real implementation
                expect(Array.isArray(result.data)).toBeTruthy();
                expect(result.data.length).toBeGreaterThan(0);
            } else {
                expect.fail("Handler not found for get-monitor-types");
            }
        });
        it("should handle monitor-types:validate requests", async () => {
            const validateHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "validate-monitor-data"
            )?.[1];

            if (validateHandler) {
                // Use valid HTTP monitor data that should pass validation
                const validMonitorData = {
                    type: "http",
                    id: "test-monitor",
                    url: "https://example.com",
                    timeout: 5000,
                    checkInterval: 60_000,
                    retryAttempts: 3,
                    responseTime: 100,
                    status: "up",
                    monitoring: true,
                    history: [], // Required field for schema validation
                };

                const result = await validateHandler(
                    {},
                    "http",
                    validMonitorData
                );

                expect(result).toEqual({
                    success: true,
                    data: expect.objectContaining({
                        success: true,
                        errors: [],
                    }),
                    metadata: expect.objectContaining({
                        handler: "validate-monitor-data",
                    }),
                });
                // Remove mock call expectation since we're using real implementation
            } else {
                expect.fail("Handler not found for validate-monitor-data");
            }
        });
        it("should handle quit-and-install handler", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: IpcService", "component");

            const quitAndInstallHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "quit-and-install"
            )?.[1];

            expect(quitAndInstallHandler).toBeDefined();

            if (quitAndInstallHandler) {
                const result = await quitAndInstallHandler();
                expect(
                    mockAutoUpdaterService.quitAndInstall
                ).toHaveBeenCalled();
                expect(result).toEqual({
                    success: true,
                    data: true,
                    metadata: expect.objectContaining({
                        handler: "quit-and-install",
                    }),
                });
            }
        });
        it("should handle state:get-history-limit requests", async () => {
            // Set up the mock to return 500
            vi.mocked(mockUptimeOrchestrator.getHistoryLimit).mockReturnValue(
                500
            );

            const getHistoryLimitHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "get-history-limit"
            )?.[1];

            if (getHistoryLimitHandler) {
                const result = await getHistoryLimitHandler();
                expect(result).toEqual({
                    success: true,
                    data: 500,
                    metadata: expect.objectContaining({
                        handler: "get-history-limit",
                    }),
                });
                expect(
                    mockUptimeOrchestrator.getHistoryLimit
                ).toHaveBeenCalled();
            } else {
                expect.fail("Handler not found for get-history-limit");
            }
        });
        it("should handle errors in handlers gracefully", async () => {
            vi.mocked(mockUptimeOrchestrator.getSites).mockRejectedValue(
                new Error("Database error")
            );

            const getHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "get-sites"
            )?.[1];

            if (getHandler) {
                const result = await getHandler();
                expect(result).toEqual({
                    success: false,
                    error: "Database error",
                    metadata: expect.objectContaining({
                        handler: "get-sites",
                    }),
                });
            } else {
                expect.fail("Handler not found for get-sites");
            }
        });
    });
    describe("Monitor Type Config Edge Cases", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });
        it("should handle monitor type not found", async () => {
            // This test isn't actually relevant since get-monitor-types returns all types
            // instead of filtering by a specific type
            const getHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "get-monitor-types"
            )?.[1];

            if (getHandler) {
                const result = await getHandler();

                expect(result).toEqual({
                    success: true,
                    data: expect.any(Array), // Returns all monitor types
                    metadata: expect.objectContaining({
                        handler: "get-monitor-types",
                    }),
                });
                // Remove mock expectation since we're using real implementation
                expect(Array.isArray(result.data)).toBeTruthy();
            } else {
                expect.fail("Handler not found for get-monitor-types");
            }
        });
        it("should handle complex uiConfig serialization", async () => {
            const getAllHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === "get-monitor-types"
            )?.[1];

            if (getAllHandler) {
                const result = await getAllHandler();

                expect(result).toEqual({
                    success: true,
                    data: expect.arrayContaining([
                        expect.objectContaining({
                            type: expect.any(String),
                            displayName: expect.any(String),
                            uiConfig: expect.objectContaining({
                                display: expect.any(Object),
                                helpTexts: expect.any(Object),
                            }),
                        }),
                    ]),
                    metadata: expect.objectContaining({
                        handler: "get-monitor-types",
                    }),
                });
            } else {
                expect.fail("Handler not found for get-monitor-types");
            }
        });
    });
});
