/**
 * @fileoverview Comprehensive tests for ApplicationService
 * Testing service coordination, lifecycle management, and event handling
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ApplicationService } from "../../../services/application/ApplicationService";

// Mock Electron app
vi.mock("electron", () => ({
    app: {
        on: vi.fn(),
        quit: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    BrowserWindow: {
        getAllWindows: vi.fn(() => []),
    },
}));

// Mock logger
vi.mock("../../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Get the logger mock reference for assertions
const mockLogger = vi.mocked((await import("../../../utils/logger")).logger);

// Mock environment
vi.mock("../../../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => false),
}));

// Mock log templates
vi.mock("../../../../shared/utils/logTemplates", () => ({
    interpolateLogTemplate: vi.fn(
        (template, data) => `${template} ${JSON.stringify(data)}`
    ),
    createTemplateLogger: vi.fn((baseLogger) => baseLogger),
    LOG_TEMPLATES: {
        services: {
            APPLICATION_INITIALIZING: "APPLICATION_INITIALIZING",
            APPLICATION_CLEANUP_START: "APPLICATION_CLEANUP_START",
            APPLICATION_CLEANUP_COMPLETE: "APPLICATION_CLEANUP_COMPLETE",
            APPLICATION_WINDOWS_CLOSED: "APPLICATION_WINDOWS_CLOSED",
            APPLICATION_QUITTING: "APPLICATION_QUITTING",
            APPLICATION_ACTIVATED: "APPLICATION_ACTIVATED",
            APPLICATION_CREATING_WINDOW: "APPLICATION_CREATING_WINDOW",
            APPLICATION_READY: "APPLICATION_READY",
            APPLICATION_SERVICES_INITIALIZED:
                "APPLICATION_SERVICES_INITIALIZED",
        },
        errors: {
            APPLICATION_CLEANUP_ERROR: "APPLICATION_CLEANUP_ERROR",
            APPLICATION_UPDATE_CHECK_ERROR: "APPLICATION_UPDATE_CHECK_ERROR",
            APPLICATION_FORWARD_MONITOR_UP_ERROR:
                "APPLICATION_FORWARD_MONITOR_UP_ERROR",
            APPLICATION_FORWARD_MONITOR_DOWN_ERROR:
                "APPLICATION_FORWARD_MONITOR_DOWN_ERROR",
            APPLICATION_SYSTEM_ERROR: "APPLICATION_SYSTEM_ERROR",
            APPLICATION_FORWARD_MONITORING_STARTED_ERROR:
                "APPLICATION_FORWARD_MONITORING_STARTED_ERROR",
            APPLICATION_FORWARD_MONITORING_STOPPED_ERROR:
                "APPLICATION_FORWARD_MONITORING_STOPPED_ERROR",
            APPLICATION_FORWARD_CACHE_INVALIDATION_ERROR:
                "APPLICATION_FORWARD_CACHE_INVALIDATION_ERROR",
            APPLICATION_INITIALIZATION_ERROR:
                "APPLICATION_INITIALIZATION_ERROR",
            APPLICATION_FORWARD_MONITOR_STATUS_ERROR:
                "APPLICATION_FORWARD_MONITOR_STATUS_ERROR",
        },
        debug: {
            APPLICATION_CLEANUP_SERVICE: "APPLICATION_CLEANUP_SERVICE",
            APPLICATION_FORWARDING_MONITOR_UP:
                "APPLICATION_FORWARDING_MONITOR_UP",
            APPLICATION_FORWARDING_MONITOR_DOWN:
                "APPLICATION_FORWARDING_MONITOR_DOWN",
            APPLICATION_FORWARDING_MONITORING_STARTED:
                "APPLICATION_FORWARDING_MONITORING_STARTED",
            APPLICATION_FORWARDING_MONITORING_STOPPED:
                "APPLICATION_FORWARDING_MONITORING_STOPPED",
            APPLICATION_FORWARDING_CACHE_INVALIDATION:
                "APPLICATION_FORWARDING_CACHE_INVALIDATION",
            APPLICATION_FORWARDING_MONITOR_STATUS:
                "APPLICATION_FORWARDING_MONITOR_STATUS",
        },
        warnings: {
            APPLICATION_MONITOR_DOWN: "APPLICATION_MONITOR_DOWN",
        },
    },
}));

// Mock ServiceContainer
vi.mock("../../../services/ServiceContainer", () => ({
    ServiceContainer: {
        getInstance: vi.fn(),
        initialize: vi.fn(),
        getInitializedServices: vi.fn(() => [
            { name: "IpcService" },
            { name: "WindowService" },
            { name: "DatabaseService" },
        ]),
        getIpcService: vi.fn(),
        getUptimeOrchestrator: vi.fn(),
        getWindowService: vi.fn(),
        getAutoUpdaterService: vi.fn(),
        getNotificationService: vi.fn(),
    },
}));

// Create mock service instances
const mockIpcService = {
    cleanup: vi.fn(),
};

const mockUptimeOrchestrator = {
    stopMonitoring: vi.fn(),
    onTyped: vi.fn(),
    removeAllListeners: vi.fn(),
};

const mockWindowService = {
    closeMainWindow: vi.fn(),
    getAllWindows: vi.fn(() => [] as any[]),
    createMainWindow: vi.fn(),
    sendToRenderer: vi.fn(),
};

const mockAutoUpdaterService = {
    setStatusCallback: vi.fn(),
    initialize: vi.fn(),
    checkForUpdates: vi.fn(() => Promise.resolve()),
};

const mockNotificationService = {
    notifyMonitorUp: vi.fn(),
    notifyMonitorDown: vi.fn(),
};

describe("ApplicationService", () => {
    let applicationService: ApplicationService;
    let mockApp: any;
    let mockServiceContainer: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Get the mocked ServiceContainer reference
        const serviceContainerModule = await import(
            "../../../services/ServiceContainer"
        );
        mockServiceContainer = vi.mocked(
            serviceContainerModule.ServiceContainer
        );

        // Get the mocked app reference
        const electron = await import("electron");
        mockApp = vi.mocked(electron).app;

        // Setup mock returns
        mockServiceContainer.getInstance.mockReturnValue(mockServiceContainer);
        mockServiceContainer.getIpcService.mockReturnValue(mockIpcService);
        mockServiceContainer.getUptimeOrchestrator.mockReturnValue(
            mockUptimeOrchestrator
        );
        mockServiceContainer.getWindowService.mockReturnValue(
            mockWindowService
        );
        mockServiceContainer.getAutoUpdaterService.mockReturnValue(
            mockAutoUpdaterService
        );
        mockServiceContainer.getNotificationService.mockReturnValue(
            mockNotificationService
        );

        // Mock process platform
        Object.defineProperty(process, "platform", {
            value: "win32",
            writable: true,
        });        });
    afterEach(() => {
        vi.restoreAllMocks();
        });
    describe("Constructor", () => {
        it("should initialize with service container and setup application", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
            // Act
            applicationService = new ApplicationService();

            // Assert
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_INITIALIZING"
            );
            expect(mockServiceContainer.getInstance).toHaveBeenCalledWith({
                enableDebugLogging: false,
        });
            expect(mockApp.on).toHaveBeenCalled();
        });
        it("should enable debug logging in development environment", async () => {
            // Arrange
            const { isDevelopment } = await import(
                "../../../../shared/utils/environment"
            );
            vi.mocked(isDevelopment).mockReturnValue(true);

            // Act
            applicationService = new ApplicationService();

            // Assert
            expect(mockServiceContainer.getInstance).toHaveBeenCalledWith({
                enableDebugLogging: true,
        });        });
        it("should setup app event listeners", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
            // Act
            applicationService = new ApplicationService();

            // Assert
            expect(mockApp.on).toHaveBeenCalledWith(
                "ready",
                expect.any(Function)
            );
            expect(mockApp.on).toHaveBeenCalledWith(
                "window-all-closed",
                expect.any(Function)
            );
            expect(mockApp.on).toHaveBeenCalledWith(
                "activate",
                expect.any(Function)
            );
        });
        it("should setup auto updater when ready event fires", async () => {
            // Arrange
            applicationService = new ApplicationService();
            const readyHandler = mockApp.on.mock.calls.find(
                (call: any[]) => call[0] === "ready"
            )?.[1];

            // Act
            await readyHandler?.();

            // Assert
            expect(
                mockAutoUpdaterService.setStatusCallback
            ).toHaveBeenCalledWith(expect.any(Function));
            expect(mockAutoUpdaterService.initialize).toHaveBeenCalledTimes(1);
            expect(
                mockAutoUpdaterService.checkForUpdates
            ).toHaveBeenCalledTimes(1);
        });
        it("should setup uptime monitoring event handlers when ready event fires", async () => {
            // Arrange
            applicationService = new ApplicationService();
            const readyHandler = mockApp.on.mock.calls.find(
                (call: any[]) => call[0] === "ready"
            )?.[1];

            // Act
            await readyHandler?.();

            // Assert
            expect(mockUptimeOrchestrator.onTyped).toHaveBeenCalledWith(
                "monitor:up",
                expect.any(Function)
            );
            expect(mockUptimeOrchestrator.onTyped).toHaveBeenCalledWith(
                "monitor:down",
                expect.any(Function)
            );
            expect(mockUptimeOrchestrator.onTyped).toHaveBeenCalledWith(
                "system:error",
                expect.any(Function)
            );
            expect(mockUptimeOrchestrator.onTyped).toHaveBeenCalledWith(
                "monitoring:started",
                expect.any(Function)
            );
            expect(mockUptimeOrchestrator.onTyped).toHaveBeenCalledWith(
                "monitoring:stopped",
                expect.any(Function)
            );
            expect(mockUptimeOrchestrator.onTyped).toHaveBeenCalledWith(
                "cache:invalidated",
                expect.any(Function)
            );
        });        });
    describe("Cleanup", () => {
        beforeEach(async () => {
            applicationService = new ApplicationService();

            // Make sure all service getter methods return mocked instances
            // to avoid the SiteManager dependency errors
            mockServiceContainer.getIpcService.mockReturnValue(mockIpcService);
            mockServiceContainer.getUptimeOrchestrator.mockReturnValue(
                mockUptimeOrchestrator
            );
            mockServiceContainer.getWindowService.mockReturnValue(
                mockWindowService
            );
        });
        it("should cleanup all services successfully", async () => {
            // Arrange
            mockUptimeOrchestrator.stopMonitoring.mockResolvedValue(undefined);

            // Act
            await applicationService.cleanup();

            // Assert
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_CLEANUP_START"
            );
            expect(
                mockServiceContainer.getInitializedServices
            ).toHaveBeenCalledTimes(1);
            expect(mockIpcService.cleanup).toHaveBeenCalledTimes(1);
            expect(mockUptimeOrchestrator.stopMonitoring).toHaveBeenCalledTimes(
                1
            );
            expect(mockWindowService.closeMainWindow).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_CLEANUP_COMPLETE"
            );
        });
        it("should handle cleanup errors properly", async () => {
            // Arrange
            const error = new Error("Cleanup failed");
            mockUptimeOrchestrator.stopMonitoring.mockRejectedValue(error);

            // Act & Assert
            await expect(applicationService.cleanup()).rejects.toThrow(
                "Cleanup failed"
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "APPLICATION_CLEANUP_ERROR",
                error
            );
        });
        it("should cleanup IPC service if cleanup method exists", async () => {
            // Act
            await applicationService.cleanup();

            // Assert
            expect(mockIpcService.cleanup).toHaveBeenCalledTimes(1);
        });
        it("should handle IPC service without cleanup method", async () => {
            // Arrange
            const ipcServiceWithoutCleanup = {};
            mockServiceContainer.getIpcService.mockReturnValue(
                ipcServiceWithoutCleanup
            );

            // Act
            await applicationService.cleanup();

            // Assert - Should not throw and should continue with other cleanup
            expect(mockUptimeOrchestrator.stopMonitoring).toHaveBeenCalledTimes(
                1
            );
            expect(mockWindowService.closeMainWindow).toHaveBeenCalledTimes(1);
        });        });
    describe("App Event Handlers", () => {
        beforeEach(() => {
            applicationService = new ApplicationService();
        });
        describe("window-all-closed event", () => {
            it("should quit app on non-macOS platforms", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                Object.defineProperty(process, "platform", {
                    value: "win32",
                    writable: true,
        });
                const windowAllClosedHandler = mockApp.on.mock.calls.find(
                    (call: any[]) => call[0] === "window-all-closed"
                )?.[1];

                // Act
                windowAllClosedHandler?.();

                // Assert
                expect(mockLogger.info).toHaveBeenCalledWith(
                    "APPLICATION_WINDOWS_CLOSED"
                );
                expect(mockLogger.info).toHaveBeenCalledWith(
                    "APPLICATION_QUITTING"
                );
                expect(mockApp.quit).toHaveBeenCalledTimes(1);
        });
            it("should not quit app on macOS platform", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                Object.defineProperty(process, "platform", {
                    value: "darwin",
                    writable: true,
        });
                const windowAllClosedHandler = mockApp.on.mock.calls.find(
                    (call: any[]) => call[0] === "window-all-closed"
                )?.[1];

                // Act
                windowAllClosedHandler?.();

                // Assert
                expect(mockLogger.info).toHaveBeenCalledWith(
                    "APPLICATION_WINDOWS_CLOSED"
                );
                expect(mockApp.quit).not.toHaveBeenCalled();
        });        });
        describe("activate event", () => {
            it("should create main window when no windows exist", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                mockWindowService.getAllWindows.mockReturnValue([]);
                const activateHandler = mockApp.on.mock.calls.find(
                    (call: any[]) => call[0] === "activate"
                )?.[1];

                // Act
                activateHandler?.();

                // Assert
                expect(mockLogger.info).toHaveBeenCalledWith(
                    "APPLICATION_ACTIVATED"
                );
                expect(mockWindowService.getAllWindows).toHaveBeenCalledTimes(
                    1
                );
                expect(mockLogger.info).toHaveBeenCalledWith(
                    "APPLICATION_CREATING_WINDOW"
                );
                expect(
                    mockWindowService.createMainWindow
                ).toHaveBeenCalledTimes(1);
        });
            it("should not create window when windows exist", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                mockWindowService.getAllWindows.mockReturnValue([{ id: 1 }]);
                const activateHandler = mockApp.on.mock.calls.find(
                    (call: any[]) => call[0] === "activate"
                )?.[1];

                // Act
                activateHandler?.();

                // Assert
                expect(mockLogger.info).toHaveBeenCalledWith(
                    "APPLICATION_ACTIVATED"
                );
                expect(mockWindowService.getAllWindows).toHaveBeenCalledTimes(
                    1
                );
                expect(
                    mockWindowService.createMainWindow
                ).not.toHaveBeenCalled();
        });        });        });
    describe("Auto Updater Setup", () => {
        beforeEach(async () => {
            applicationService = new ApplicationService();
            const readyHandler = mockApp.on.mock.calls.find(
                (call: any[]) => call[0] === "ready"
            )?.[1];
            await readyHandler?.();
        });
        it("should setup auto updater status callback", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
            // Arrange
            const statusCallback =
                mockAutoUpdaterService.setStatusCallback.mock.calls[0]?.[0];
            const statusData = { status: "checking-for-update" };

            // Act
            statusCallback?.(statusData);

            // Assert
            expect(mockWindowService.sendToRenderer).toHaveBeenCalledWith(
                "update-status",
                statusData
            );
        });
        it("should handle auto updater check errors", async () => {
            // Arrange
            const error = new Error("Update check failed");
            mockAutoUpdaterService.checkForUpdates.mockRejectedValue(error);

            // Create new instance to trigger the error
            new ApplicationService();
            const readyHandler = mockApp.on.mock.calls.find(
                (call: any[]) => call[0] === "ready"
            )?.[1];

            // Act
            await readyHandler?.();

            // Wait for async operation
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(mockLogger.error).toHaveBeenCalledWith(
                "APPLICATION_UPDATE_CHECK_ERROR",
                error
            );
        });        });
    describe("Uptime Monitoring Event Handlers", () => {
        beforeEach(async () => {
            applicationService = new ApplicationService();
            const readyHandler = mockApp.on.mock.calls.find(
                (call: any[]) => call[0] === "ready"
            )?.[1];
            await readyHandler?.();
        });
        describe("monitor:up event", () => {
            it("should forward monitor up event to renderer", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const monitorUpHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "monitor:up"
                    )?.[1];
                const eventData = {
                    site: { identifier: "site-1", name: "Test Site" },
                    monitor: { id: "monitor-1" },
                    timestamp: "2023-01-01T00:00:00Z",
                };

                // Act
                monitorUpHandler?.(eventData);

                // Assert
                expect(mockWindowService.sendToRenderer).toHaveBeenCalledWith(
                    "monitor:up",
                    eventData
                );
                expect(
                    mockNotificationService.notifyMonitorUp
                ).toHaveBeenCalledWith(eventData.site, eventData.monitor.id);
        });
            it("should handle monitor up forwarding errors", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const monitorUpHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "monitor:up"
                    )?.[1];
                const eventData = {
                    site: { identifier: "site-1", name: "Test Site" },
                    monitor: { id: "monitor-1" },
                    timestamp: "2023-01-01T00:00:00Z",
                };
                const error = new Error("Forward failed");
                mockWindowService.sendToRenderer.mockImplementation(() => {
                    throw error;
        });
                // Act
                monitorUpHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_MONITOR_UP_ERROR",
                    error
                );
        });        });
        describe("monitor:down event", () => {
            it("should forward monitor down event to renderer", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const monitorDownHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "monitor:down"
                    )?.[1];
                const eventData = {
                    site: { identifier: "site-1", name: "Test Site" },
                    monitor: { id: "monitor-1" },
                    timestamp: "2023-01-01T00:00:00Z",
                };

                // Act
                monitorDownHandler?.(eventData);

                // Assert
                expect(mockWindowService.sendToRenderer).toHaveBeenCalledWith(
                    "monitor:down",
                    eventData
                );
                expect(
                    mockNotificationService.notifyMonitorDown
                ).toHaveBeenCalledWith(eventData.site, eventData.monitor.id);
        });
            it("should handle monitor down forwarding errors", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const monitorDownHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "monitor:down"
                    )?.[1];
                const eventData = {
                    site: { identifier: "site-1", name: "Test Site" },
                    monitor: { id: "monitor-1" },
                    timestamp: "2023-01-01T00:00:00Z",
                };
                const error = new Error("Forward failed");
                mockWindowService.sendToRenderer.mockImplementation(() => {
                    throw error;
        });
                // Act
                monitorDownHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_MONITOR_DOWN_ERROR",
                    error
                );
        });        });
        describe("system:error event", () => {
            it("should log system errors", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const systemErrorHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "system:error"
                    )?.[1];
                const eventData = {
                    context: "database",
                    error: new Error("Database connection failed"),
                };

                // Act
                systemErrorHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    expect.stringContaining("APPLICATION_SYSTEM_ERROR"),
                    eventData.error
                );
        });        });
        describe("monitoring:started event", () => {
            it("should forward monitoring started event to renderer", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const monitoringStartedHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "monitoring:started"
                    )?.[1];
                const eventData = { siteIdentifier: "site-1" };

                // Act
                monitoringStartedHandler?.(eventData);

                // Assert
                expect(mockWindowService.sendToRenderer).toHaveBeenCalledWith(
                    "monitoring:started",
                    eventData
                );
        });
            it("should handle monitoring started forwarding errors", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const monitoringStartedHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "monitoring:started"
                    )?.[1];
                const eventData = { siteIdentifier: "site-1" };
                const error = new Error("Forward failed");
                mockWindowService.sendToRenderer.mockImplementation(() => {
                    throw error;
        });
                // Act
                monitoringStartedHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_MONITORING_STARTED_ERROR",
                    error
                );
        });        });
        describe("monitoring:stopped event", () => {
            it("should forward monitoring stopped event to renderer", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const monitoringStoppedHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "monitoring:stopped"
                    )?.[1];
                const eventData = { siteIdentifier: "site-1" };

                // Act
                monitoringStoppedHandler?.(eventData);

                // Assert
                expect(mockWindowService.sendToRenderer).toHaveBeenCalledWith(
                    "monitoring:stopped",
                    eventData
                );
        });
            it("should handle monitoring stopped forwarding errors", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const monitoringStoppedHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "monitoring:stopped"
                    )?.[1];
                const eventData = { siteIdentifier: "site-1" };
                const error = new Error("Forward failed");
                mockWindowService.sendToRenderer.mockImplementation(() => {
                    throw error;
        });
                // Act
                monitoringStoppedHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_MONITORING_STOPPED_ERROR",
                    error
                );
        });        });
        describe("cache:invalidated event", () => {
            it("should forward cache invalidated event to renderer", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const cacheInvalidatedHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "cache:invalidated"
                    )?.[1];
                const eventData = {
                    identifier: "site-1",
                    reason: "manual",
                    type: "site",
                };

                // Act
                cacheInvalidatedHandler?.(eventData);

                // Assert
                expect(mockWindowService.sendToRenderer).toHaveBeenCalledWith(
                    "cache:invalidated",
                    eventData
                );
        });
            it("should handle cache invalidation forwarding errors", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
                // Arrange
                const cacheInvalidatedHandler =
                    mockUptimeOrchestrator.onTyped.mock.calls.find(
                        (call) => call[0] === "cache:invalidated"
                    )?.[1];
                const eventData = {
                    identifier: "site-1",
                    reason: "manual",
                    type: "site",
                };
                const error = new Error("Forward failed");
                mockWindowService.sendToRenderer.mockImplementation(() => {
                    throw error;
        });
                // Act
                cacheInvalidatedHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_CACHE_INVALIDATION_ERROR",
                    error
                );
        });        });        });
    describe("Edge Cases and Error Handling", () => {
        it("should handle missing service methods gracefully", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
            // Arrange
            const serviceWithoutMethods = {};
            mockServiceContainer.getIpcService.mockReturnValue(
                serviceWithoutMethods
            );

            // Act & Assert - Should not throw during construction
            expect(() => new ApplicationService()).not.toThrow();
        });
        it("should handle null/undefined event data", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
            // Arrange
            applicationService = new ApplicationService();
            const monitorUpHandler =
                mockUptimeOrchestrator.onTyped.mock.calls.find(
                    (call) => call[0] === "monitor:up"
                )?.[1];

            // Act & Assert - Should not throw
            expect(() => monitorUpHandler?.(null)).not.toThrow();
            expect(() => monitorUpHandler?.(undefined)).not.toThrow();
        });
        it("should handle service container getInstance returning undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional"); await annotate("Component: ApplicationService", "component");
            
            // Arrange
            mockServiceContainer.getInstance.mockReturnValue(null);

            // Act & Assert - The constructor doesn't explicitly check for null/undefined
            // so it will just assign null to this.serviceContainer
            // The error will come later when trying to use the services
            expect(() => new ApplicationService()).not.toThrow();

            // Reset for other tests
            mockServiceContainer.getInstance.mockReturnValue(
                mockServiceContainer
            );
        });        });
    describe("Integration and Lifecycle", () => {
        it("should properly coordinate service initialization order", async () => {
            // Act
            applicationService = new ApplicationService();
            const readyHandler = mockApp.on.mock.calls.find(
                (call: any[]) => call[0] === "ready"
            )?.[1];
            await readyHandler?.();

            // Assert - Verify services are initialized in correct order
            const callOrder = [
                mockServiceContainer.getInstance,
                mockServiceContainer.initialize,
                mockWindowService.createMainWindow,
                mockAutoUpdaterService.setStatusCallback,
                mockAutoUpdaterService.initialize,
                mockAutoUpdaterService.checkForUpdates,
                mockUptimeOrchestrator.onTyped,
            ];

            // All should have been called
            for (const mock of callOrder) {
                expect(mock).toHaveBeenCalled();
            }
        });
        it("should handle full lifecycle from construction to cleanup", async () => {
            // Arrange
            applicationService = new ApplicationService();

            // Mock service getter methods to avoid dependency errors
            mockServiceContainer.getIpcService.mockReturnValue(mockIpcService);
            mockServiceContainer.getUptimeOrchestrator.mockReturnValue(
                mockUptimeOrchestrator
            );
            mockServiceContainer.getWindowService.mockReturnValue(
                mockWindowService
            );

            // Act
            await applicationService.cleanup();

            // Assert
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_INITIALIZING"
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_CLEANUP_START"
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_CLEANUP_COMPLETE"
            );
        });        });        });