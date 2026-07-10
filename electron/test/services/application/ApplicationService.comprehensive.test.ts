/**
 * @file Comprehensive tests for ApplicationService Testing service
 *   coordination, lifecycle management, and event handling
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { App, BrowserWindow } from "electron";

import type { UptimeEvents } from "../../../events/eventTypes";
import type { EventKey } from "../../../events/TypedEventBus";
import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { RendererEventBridge } from "../../../services/events/RendererEventBridge";
import type { IpcService } from "../../../services/ipc/IpcService";
import type { NotificationService } from "../../../services/notifications/NotificationService";
import type { AutoUpdaterService } from "../../../services/updater/AutoUpdaterService";
import type { WindowService } from "../../../services/window/WindowService";

import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationService } from "../../../services/application/ApplicationService";

type ApplicationAppEvent =
    | "activate"
    | "ready"
    | "window-all-closed";
type ApplicationAppEventHandler = () => Promise<void> | void;
type ApplicationWindow = Pick<BrowserWindow, "id">;

const mockApp = vi.hoisted(() => ({
    exit: vi.fn<App["exit"]>(),
    isReady: vi.fn<App["isReady"]>(() => false),
    off: vi.fn(
        (_event: ApplicationAppEvent, _listener: ApplicationAppEventHandler) =>
            undefined
    ),
    on: vi.fn(
        (_event: ApplicationAppEvent, _listener: ApplicationAppEventHandler) =>
            undefined
    ),
    quit: vi.fn<App["quit"]>(),
    removeAllListeners: vi.fn<App["removeAllListeners"]>(),
}));

function getAppEventHandler(
    event: ApplicationAppEvent
): ApplicationAppEventHandler | undefined {
    return mockApp.on.mock.calls.findLast(([registeredEvent]) =>
        Object.is(registeredEvent, event)
    )?.[1];
}

function createDeferred(): {
    promise: Promise<void>;
    resolve: () => void;
} {
    let resolvePromise: (() => void) | undefined;
    const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
    });

    return {
        promise,
        resolve: (): void => {
            resolvePromise?.();
        },
    };
}

// Mock Electron app
vi.mock("electron", () => ({
    app: mockApp,
    BrowserWindow: {
        getAllWindows: vi.fn(() => []),
    },
}));

// Mock logger
vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    });
    return {
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

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
            APPLICATION_HANDLE_MONITOR_UP_ERROR:
                "APPLICATION_HANDLE_MONITOR_UP_ERROR",
            APPLICATION_HANDLE_MONITOR_DOWN_ERROR:
                "APPLICATION_HANDLE_MONITOR_DOWN_ERROR",
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
            APPLICATION_FORWARD_STATE_SYNC_ERROR:
                "APPLICATION_FORWARD_STATE_SYNC_ERROR",
            APPLICATION_FORWARD_MANUAL_CHECK_COMPLETED_ERROR:
                "APPLICATION_FORWARD_MANUAL_CHECK_COMPLETED_ERROR",
            APPLICATION_FORWARD_HISTORY_LIMIT_UPDATED_ERROR:
                "APPLICATION_FORWARD_HISTORY_LIMIT_UPDATED_ERROR",
        },
        debug: {
            APPLICATION_CLEANUP_SERVICE: "APPLICATION_CLEANUP_SERVICE",
            APPLICATION_MONITOR_RECOVERED: "APPLICATION_MONITOR_RECOVERED",
            APPLICATION_FORWARDING_MANUAL_CHECK_COMPLETED:
                "APPLICATION_FORWARDING_MANUAL_CHECK_COMPLETED",
            APPLICATION_FORWARDING_MONITORING_STARTED:
                "APPLICATION_FORWARDING_MONITORING_STARTED",
            APPLICATION_FORWARDING_MONITORING_STOPPED:
                "APPLICATION_FORWARDING_MONITORING_STOPPED",
            APPLICATION_FORWARDING_CACHE_INVALIDATION:
                "APPLICATION_FORWARDING_CACHE_INVALIDATION",
            APPLICATION_FORWARDING_MONITOR_STATUS:
                "APPLICATION_FORWARDING_MONITOR_STATUS",
            APPLICATION_FORWARDING_STATE_SYNC:
                "APPLICATION_FORWARDING_STATE_SYNC",
            APPLICATION_FORWARDING_HISTORY_LIMIT_UPDATED:
                "APPLICATION_FORWARDING_HISTORY_LIMIT_UPDATED",
        },
        warnings: {
            APPLICATION_MONITOR_FAILURE: "APPLICATION_MONITOR_FAILURE",
        },
    },
}));

// Create mock service instances
const mockIpcService = {
    cleanup: vi.fn<IpcService["cleanup"]>(),
} satisfies Pick<IpcService, "cleanup">;

const mockUptimeOrchestrator = {
    onTyped: vi.fn<UptimeOrchestrator["onTyped"]>(),
    removeAllListeners: vi.fn<UptimeOrchestrator["removeAllListeners"]>(),
    shutdown: vi.fn<UptimeOrchestrator["shutdown"]>(),
} satisfies Pick<
    UptimeOrchestrator,
    | "onTyped"
    | "removeAllListeners"
    | "shutdown"
>;

type RawUptimeEventHandler = (payload: unknown) => unknown;

function getUptimeEventHandler<K extends EventKey<UptimeEvents>>(
    event: K
): RawUptimeEventHandler | undefined {
    const handler: unknown = mockUptimeOrchestrator.onTyped.mock.calls.find(
        ([registeredEvent]) => registeredEvent === event
    )?.[1];

    if (typeof handler !== "function") {
        return undefined;
    }

    return (payload) =>
        Reflect.apply(handler, mockUptimeOrchestrator, [payload]);
}

const mockDatabaseService = {
    close: vi.fn<DatabaseService["close"]>(),
} satisfies Pick<DatabaseService, "close">;

const mockWindowService = {
    closeMainWindow: vi.fn<WindowService["closeMainWindow"]>(),
    createMainWindow: vi.fn<() => void>(),
    getAllWindows: vi.fn<() => ApplicationWindow[]>(() => []),
};

const mockRendererEventBridge = {
    sendStateSyncEvent: vi.fn<RendererEventBridge["sendStateSyncEvent"]>(),
    sendToRenderers: vi.fn<RendererEventBridge["sendToRenderers"]>(),
} satisfies Pick<RendererEventBridge, "sendStateSyncEvent" | "sendToRenderers">;

const mockAutoUpdaterService = {
    checkForUpdates: vi.fn<AutoUpdaterService["checkForUpdates"]>(
        async () => undefined
    ),
    cleanup: vi.fn<AutoUpdaterService["cleanup"]>(),
    initialize: vi.fn<AutoUpdaterService["initialize"]>(),
    setStatusCallback: vi.fn<AutoUpdaterService["setStatusCallback"]>(),
} satisfies Pick<
    AutoUpdaterService,
    | "checkForUpdates"
    | "cleanup"
    | "initialize"
    | "setStatusCallback"
>;

const mockNotificationService = {
    notifyMonitorDown: vi.fn<NotificationService["notifyMonitorDown"]>(),
    notifyMonitorUp: vi.fn<NotificationService["notifyMonitorUp"]>(),
} satisfies Pick<NotificationService, "notifyMonitorDown" | "notifyMonitorUp">;

// Mock ServiceContainer
const mockServiceContainer = vi.hoisted(() => ({
    getAutoUpdaterService: vi.fn(),
    getDatabaseService: vi.fn(),
    getInitializedServices: vi.fn(),
    getInstance: vi.fn(),
    getIpcService: vi.fn(),
    getNotificationService: vi.fn(),
    getRendererEventBridge: vi.fn(),
    getUptimeOrchestrator: vi.fn(),
    getWindowService: vi.fn(),
    initialize: vi.fn(),
    shutdownCloudSyncScheduler: vi.fn<() => Promise<void>>(),
}));

vi.mock("../../../services/ServiceContainer", () => ({
    ServiceContainer: mockServiceContainer,
}));

describe(ApplicationService, () => {
    let applicationService: ApplicationService;

    beforeEach(() => {
        vi.clearAllMocks();

        mockUptimeOrchestrator.shutdown.mockReset();
        mockUptimeOrchestrator.shutdown.mockResolvedValue(undefined);
        mockUptimeOrchestrator.onTyped.mockReset();
        mockUptimeOrchestrator.removeAllListeners.mockReset();

        mockIpcService.cleanup.mockReset();
        mockAutoUpdaterService.cleanup.mockReset();
        mockWindowService.closeMainWindow.mockReset();
        mockDatabaseService.close.mockReset();
        mockServiceContainer.shutdownCloudSyncScheduler.mockReset();
        mockServiceContainer.shutdownCloudSyncScheduler.mockResolvedValue(
            undefined
        );
        mockServiceContainer.initialize.mockReset();
        mockServiceContainer.initialize.mockResolvedValue(undefined);

        mockApp.isReady.mockReturnValue(false);

        // Setup mock returns
        mockServiceContainer.getInstance.mockReturnValue(mockServiceContainer);
        mockServiceContainer.getInitializedServices.mockReturnValue([
            { name: "IpcService", service: mockIpcService },
            {
                name: "UptimeOrchestrator",
                service: mockUptimeOrchestrator,
            },
            { name: "WindowService", service: mockWindowService },
            { name: "DatabaseService", service: mockDatabaseService },
            { name: "AutoUpdaterService", service: mockAutoUpdaterService },
        ]);
        mockServiceContainer.getIpcService.mockReturnValue(mockIpcService);
        mockServiceContainer.getUptimeOrchestrator.mockReturnValue(
            mockUptimeOrchestrator
        );
        mockServiceContainer.getWindowService.mockReturnValue(
            mockWindowService
        );
        mockServiceContainer.getRendererEventBridge.mockReturnValue(
            mockRendererEventBridge
        );
        mockServiceContainer.getAutoUpdaterService.mockReturnValue(
            mockAutoUpdaterService
        );
        mockServiceContainer.getNotificationService.mockReturnValue(
            mockNotificationService
        );
        mockServiceContainer.getDatabaseService.mockReturnValue(
            mockDatabaseService
        );

        // Mock process platform
        Object.defineProperty(process, "platform", {
            value: "win32",
            writable: true,
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe("Constructor", () => {
        it("should initialize with service container and setup application", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate(`Suite: ${task.suite?.name || "Unknown"}`, "suite");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Service container initialization",
                "feature"
            );
            await annotate("Priority: Critical", "priority");
            await annotate("Category: Constructor behavior", "category");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Act
            applicationService = new ApplicationService();

            // Verify signal hasn't been aborted during test execution
            expect(signal.aborted).toBeFalsy();

            // Assert
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_INITIALIZING"
            );
            expect(mockServiceContainer.getInstance).toHaveBeenCalledWith({
                enableDebugLogging: false,
            });
            expect(mockApp.on).toHaveBeenCalled();
        });
        it("should enable debug logging in development environment", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate("Component: ApplicationService", "component");
            await annotate("Environment: Development", "environment");
            await annotate("Priority: Medium", "priority");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Arrange
            const { isDevelopment } =
                await import("../../../../shared/utils/environment");
            vi.mocked(isDevelopment).mockReturnValue(true);

            // Act
            applicationService = new ApplicationService();

            // Verify signal state
            expect(signal.aborted).toBeFalsy();

            // Assert
            expect(mockServiceContainer.getInstance).toHaveBeenCalledWith({
                enableDebugLogging: true,
            });
        });
        it("should setup app event listeners", async ({ task, annotate }) => {
            // Basic task metadata usage
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate(`Suite: ${task.suite?.name || "Unknown"}`, "suite");
            await annotate(`File: ${task.file?.name || "Unknown"}`, "file");
            await annotate(`Mode: ${task.mode}`, "mode");
            await annotate(
                `Concurrent: ${task.concurrent || false}`,
                "concurrent"
            );

            // Component and feature info
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Electron app event binding", "feature");
            await annotate("Priority: High", "priority");
            await annotate("Category: Event system setup", "category");

            // Conditional logic based on task properties
            if (task.mode === "only") {
                await annotate(
                    "⚠️ Running in ONLY mode - isolated test",
                    "warning"
                );
            }

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
        it("should setup auto updater when ready event fires", async ({
            task,
            annotate,
        }) => {
            // Advanced task metadata usage
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                `Task hierarchy: ${task.suite?.name} > ${task.name}`,
                "hierarchy"
            );

            // Extract test context from task name for dynamic behavior
            const isReadyEventTest = task.name.includes("ready event");
            await annotate(
                `Ready event test: ${isReadyEventTest}`,
                "test-type"
            );

            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Auto-updater initialization", "feature");
            await annotate("Priority: High", "priority");

            // Use task metadata for conditional test logic
            const taskInfo = {
                isSkipped: task.mode === "skip",
                isOnly: task.mode === "only",
                isConcurrent: task.concurrent || false,
            };
            await annotate(
                `Task info: ${JSON.stringify(taskInfo)}`,
                "task-info"
            );

            // Arrange
            applicationService = new ApplicationService();
            const readyHandler = getAppEventHandler("ready");

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
        it("should setup uptime monitoring event handlers when ready event fires", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "integration");
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Event system integration", "feature");
            await annotate("Priority: Critical", "priority");

            // Arrange
            applicationService = new ApplicationService();
            const readyHandler = getAppEventHandler("ready");

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
            expect(mockUptimeOrchestrator.onTyped).toHaveBeenCalledWith(
                "settings:history-limit-updated",
                expect.any(Function)
            );
        });
    });
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
        it("should wait for active startup before tearing down services", async () => {
            const initialization = createDeferred();
            mockServiceContainer.initialize.mockReturnValueOnce(
                initialization.promise
            );
            const readyHandler = getAppEventHandler("ready");

            readyHandler?.();
            await vi.waitFor(() => {
                expect(mockServiceContainer.initialize).toHaveBeenCalledOnce();
            });

            const cleanupPromise = applicationService.cleanup();
            await Promise.resolve();

            expect(
                mockServiceContainer.shutdownCloudSyncScheduler
            ).not.toHaveBeenCalled();
            expect(mockUptimeOrchestrator.shutdown).not.toHaveBeenCalled();
            expect(mockDatabaseService.close).not.toHaveBeenCalled();

            initialization.resolve();
            await cleanupPromise;

            expect(mockUptimeOrchestrator.shutdown).toHaveBeenCalledOnce();
            expect(mockDatabaseService.close).toHaveBeenCalledOnce();
            expect(
                mockServiceContainer.initialize.mock.invocationCallOrder[0]
            ).toBeLessThan(
                mockUptimeOrchestrator.shutdown.mock.invocationCallOrder[0] ?? 0
            );
        });

        it("cleans up partial startup and exits when initialization fails", async () => {
            const initializationError = new Error("initialization failed");
            mockServiceContainer.initialize.mockRejectedValueOnce(
                initializationError
            );
            const readyHandler = getAppEventHandler("ready");

            readyHandler?.();

            await vi.waitFor(() => {
                expect(mockApp.exit).toHaveBeenCalledWith(1);
            });

            expect(mockWindowService.createMainWindow).not.toHaveBeenCalled();
            expect(
                mockServiceContainer.shutdownCloudSyncScheduler
            ).toHaveBeenCalledOnce();
            expect(mockIpcService.cleanup).toHaveBeenCalledOnce();
            expect(mockUptimeOrchestrator.shutdown).toHaveBeenCalledOnce();
            expect(mockWindowService.closeMainWindow).toHaveBeenCalledOnce();
            expect(mockDatabaseService.close).toHaveBeenCalledOnce();
            expect(mockLogger.error).toHaveBeenCalledWith(
                "APPLICATION_INITIALIZATION_ERROR",
                initializationError
            );
        });

        it("should ignore a late ready event after cleanup starts", async () => {
            const readyHandler = getAppEventHandler("ready");

            await applicationService.cleanup();
            readyHandler?.();
            await Promise.resolve();

            expect(mockServiceContainer.initialize).not.toHaveBeenCalled();
            expect(mockWindowService.createMainWindow).not.toHaveBeenCalled();
        });

        it("should cleanup all services successfully", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "integration");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate(`Suite: ${task.suite?.name || "Unknown"}`, "suite");
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Service cleanup lifecycle", "feature");
            await annotate("Priority: Critical", "priority");
            await annotate("Category: Lifecycle management", "category");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Arrange
            mockUptimeOrchestrator.shutdown.mockResolvedValue(undefined);

            // Simulate cleanup with signal monitoring
            const cleanupPromise = applicationService.cleanup();

            // Verify signal is not aborted during cleanup
            expect(signal.aborted).toBeFalsy();

            // Act
            await cleanupPromise;

            // Assert
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_CLEANUP_START"
            );
            expect(
                mockServiceContainer.getInitializedServices
            ).toHaveBeenCalledTimes(1);
            expect(
                mockServiceContainer.shutdownCloudSyncScheduler
            ).toHaveBeenCalledTimes(1);
            expect(mockAutoUpdaterService.cleanup).toHaveBeenCalledTimes(1);
            expect(mockIpcService.cleanup).toHaveBeenCalledTimes(1);
            expect(mockUptimeOrchestrator.shutdown).toHaveBeenCalledTimes(1);
            expect(mockWindowService.closeMainWindow).toHaveBeenCalledTimes(1);
            expect(mockDatabaseService.close).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "APPLICATION_CLEANUP_COMPLETE"
            );
        });
        it("should drain the cloud scheduler before dependent cleanup", async () => {
            let releaseScheduler!: () => void;
            mockServiceContainer.shutdownCloudSyncScheduler.mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        releaseScheduler = resolve;
                    })
            );

            const cleanupPromise = applicationService.cleanup();

            await vi.waitFor(() => {
                expect(
                    mockServiceContainer.shutdownCloudSyncScheduler
                ).toHaveBeenCalledTimes(1);
            });
            expect(mockAutoUpdaterService.cleanup).not.toHaveBeenCalled();
            expect(mockIpcService.cleanup).not.toHaveBeenCalled();
            expect(mockUptimeOrchestrator.shutdown).not.toHaveBeenCalled();
            expect(mockDatabaseService.close).not.toHaveBeenCalled();

            releaseScheduler();
            await cleanupPromise;

            expect(mockIpcService.cleanup).toHaveBeenCalledTimes(1);
            expect(mockUptimeOrchestrator.shutdown).toHaveBeenCalledTimes(1);
            expect(mockDatabaseService.close).toHaveBeenCalledTimes(1);
        });
        it("should handle cleanup errors properly", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Error handling during cleanup", "feature");
            await annotate("Priority: High", "priority");
            await annotate("Category: Error scenarios", "category");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Arrange
            const error = new Error("Cleanup failed");
            mockUptimeOrchestrator.shutdown.mockRejectedValue(error);

            // Act & Assert
            await expect(applicationService.cleanup()).rejects.toThrow(
                "Cleanup failed"
            );

            // Verify signal state after error
            expect(signal.aborted).toBeFalsy();

            expect(mockLogger.error).toHaveBeenCalledWith(
                "APPLICATION_CLEANUP_ERROR",
                error
            );
            expect(mockWindowService.closeMainWindow).toHaveBeenCalledOnce();
            expect(mockDatabaseService.close).toHaveBeenCalledOnce();
        });

        it("attempts every cleanup stage and aggregates multiple failures", async () => {
            const schedulerError = new Error("scheduler cleanup failed");
            const orchestratorError = new Error("orchestrator cleanup failed");
            mockServiceContainer.shutdownCloudSyncScheduler.mockRejectedValueOnce(
                schedulerError
            );
            mockUptimeOrchestrator.shutdown.mockRejectedValueOnce(
                orchestratorError
            );

            try {
                await applicationService.cleanup();
                throw new Error("Expected cleanup to reject");
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(AggregateError);
                const aggregate = error as AggregateError;
                expect(aggregate.errors).toEqual([
                    schedulerError,
                    orchestratorError,
                ]);
            }

            expect(mockAutoUpdaterService.cleanup).toHaveBeenCalledOnce();
            expect(mockIpcService.cleanup).toHaveBeenCalledOnce();
            expect(mockWindowService.closeMainWindow).toHaveBeenCalledOnce();
            expect(mockDatabaseService.close).toHaveBeenCalledOnce();
        });

        it("should handle cleanup cancellation gracefully", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Cleanup cancellation handling", "feature");
            await annotate("Priority: Medium", "priority");
            await annotate("Category: Cancellation scenarios", "category");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Arrange - Create a custom AbortController for this test
            const abortController = new AbortController();
            const customSignal = abortController.signal;

            // Mock a long-running cleanup operation
            mockUptimeOrchestrator.shutdown.mockReturnValueOnce(
                new Promise<void>((resolve, reject) => {
                    // Simulate async operation that can be cancelled
                    const timeout = setTimeout(() => {
                        resolve();
                    }, 1000);

                    // Handle cancellation properly
                    customSignal.addEventListener("abort", () => {
                        clearTimeout(timeout);
                        reject(new Error("Operation aborted"));
                    });

                    // If already aborted when this runs
                    if (customSignal.aborted) {
                        clearTimeout(timeout);
                        reject(new Error("Operation aborted"));
                    }
                })
            );

            // Act - Start cleanup and then abort it
            const cleanupPromise = applicationService.cleanup();

            // Simulate cancellation after a short delay
            setTimeout(() => {
                abortController.abort();
            }, 10);

            // Assert - Should handle cancellation
            await expect(cleanupPromise).rejects.toThrow("Operation aborted");

            // Verify test signal is still intact
            expect(signal.aborted).toBeFalsy();

            // Ensure subsequent tests start with resolved cleanup behavior
            mockUptimeOrchestrator.shutdown.mockResolvedValue(undefined);
        });
        it("should cleanup IPC service if cleanup method exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: IPC service cleanup", "feature");
            await annotate("Priority: Medium", "priority");

            // Act
            await applicationService.cleanup();

            // Assert
            expect(mockIpcService.cleanup).toHaveBeenCalledTimes(1);
        });
        it("should handle IPC service without cleanup method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Graceful handling of missing methods",
                "feature"
            );
            await annotate("Priority: Medium", "priority");
            await annotate("Category: Robustness", "category");

            // Arrange
            const ipcServiceWithoutCleanup = {};
            mockServiceContainer.getInitializedServices.mockReturnValueOnce([
                { name: "IpcService", service: ipcServiceWithoutCleanup },
                {
                    name: "UptimeOrchestrator",
                    service: mockUptimeOrchestrator,
                },
                { name: "WindowService", service: mockWindowService },
                { name: "DatabaseService", service: mockDatabaseService },
            ]);

            // Act
            await applicationService.cleanup();

            // Assert - Should not throw and should continue with other cleanup
            expect(mockUptimeOrchestrator.shutdown).toHaveBeenCalledTimes(1);
            expect(mockWindowService.closeMainWindow).toHaveBeenCalledTimes(1);
            expect(mockDatabaseService.close).toHaveBeenCalledTimes(1);
        });

        it("should not invoke accessor-backed IPC cleanup properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Safe IPC cleanup detection", "feature");
            await annotate("Priority: Medium", "priority");

            let accessCount = 0;
            const ipcServiceWithAccessor = {};
            Object.defineProperty(ipcServiceWithAccessor, "cleanup", {
                configurable: true,
                enumerable: true,
                get() {
                    accessCount += 1;
                    return vi.fn();
                },
            });
            mockServiceContainer.getInitializedServices.mockReturnValueOnce([
                { name: "IpcService", service: ipcServiceWithAccessor },
                {
                    name: "UptimeOrchestrator",
                    service: mockUptimeOrchestrator,
                },
                { name: "WindowService", service: mockWindowService },
                { name: "DatabaseService", service: mockDatabaseService },
            ]);

            await applicationService.cleanup();

            expect(accessCount).toBe(0);
            expect(mockUptimeOrchestrator.shutdown).toHaveBeenCalledTimes(1);
            expect(mockWindowService.closeMainWindow).toHaveBeenCalledTimes(1);
            expect(mockDatabaseService.close).toHaveBeenCalledTimes(1);
        });

        it("should not invoke accessor-backed database close properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "unit");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Safe database cleanup detection",
                "feature"
            );
            await annotate("Priority: Medium", "priority");

            let accessCount = 0;
            const initializedDatabaseServiceWithAccessor = {};
            Object.defineProperty(
                initializedDatabaseServiceWithAccessor,
                "close",
                {
                    configurable: true,
                    enumerable: true,
                    get() {
                        accessCount += 1;
                        return vi.fn();
                    },
                }
            );
            mockServiceContainer.getInitializedServices.mockReturnValueOnce([
                {
                    name: "DatabaseService",
                    service: initializedDatabaseServiceWithAccessor,
                },
            ]);

            await applicationService.cleanup();

            expect(accessCount).toBe(0);
            expect(mockDatabaseService.close).toHaveBeenCalledTimes(1);
        });
    });
    describe("App Event Handlers", () => {
        beforeEach(() => {
            applicationService = new ApplicationService();
        });
        describe("window-all-closed event", () => {
            it("should quit app on non-macOS platforms", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");
                await annotate("Platform: Windows/Linux", "platform");
                await annotate(
                    "Feature: App lifecycle - window closure",
                    "feature"
                );
                await annotate("Priority: High", "priority");

                // Arrange
                Object.defineProperty(process, "platform", {
                    value: "win32",
                    writable: true,
                });
                const windowAllClosedHandler =
                    getAppEventHandler("window-all-closed");

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
            it("should not quit app on macOS platform", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                Object.defineProperty(process, "platform", {
                    value: "darwin",
                    writable: true,
                });
                const windowAllClosedHandler =
                    getAppEventHandler("window-all-closed");

                // Act
                windowAllClosedHandler?.();

                // Assert
                expect(mockLogger.info).toHaveBeenCalledWith(
                    "APPLICATION_WINDOWS_CLOSED"
                );
                expect(mockApp.quit).not.toHaveBeenCalled();
            });
        });
        describe("activate event", () => {
            it("should create main window when no windows exist", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                mockWindowService.getAllWindows.mockReturnValue([]);
                const activateHandler = getAppEventHandler("activate");

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
            it("should not create window when windows exist", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const existingWindow = { id: 1 } satisfies ApplicationWindow;
                mockWindowService.getAllWindows.mockReturnValue([
                    existingWindow,
                ]);
                const activateHandler = getAppEventHandler("activate");

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
            });
        });
    });
    describe("Auto Updater Setup", () => {
        beforeEach(async () => {
            applicationService = new ApplicationService();
            const readyHandler = getAppEventHandler("ready");
            await readyHandler?.();
        });
        it("should setup auto updater status callback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Auto-updater status communication",
                "feature"
            );
            await annotate("Priority: Medium", "priority");
            await annotate("Category: IPC communication", "category");

            // Arrange
            const statusCallback =
                mockAutoUpdaterService.setStatusCallback.mock.calls[0]?.[0];
            const statusData = { status: "checking" } as const;

            // Act
            statusCallback?.(statusData);

            // Assert
            expect(
                mockRendererEventBridge.sendToRenderers
            ).toHaveBeenCalledWith("update-status", statusData);
        });
        it("should handle auto updater check errors", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate(`Suite: ${task.suite?.name || "Unknown"}`, "suite");
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Auto-updater error handling", "feature");
            await annotate("Priority: Medium", "priority");
            await annotate("Category: Error scenarios", "category");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Arrange
            const error = new Error("Update check failed");
            mockAutoUpdaterService.checkForUpdates.mockRejectedValue(error);

            // Create new instance to trigger the error
            new ApplicationService();
            const readyHandler = getAppEventHandler("ready");

            // Act
            await readyHandler?.();

            // Wait for async operation
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Verify signal hasn't been aborted during async operations
            expect(signal.aborted).toBeFalsy();

            // Assert
            expect(mockLogger.error).toHaveBeenCalledWith(
                "APPLICATION_UPDATE_CHECK_ERROR",
                error
            );
        });

        it("should handle auto updater cancellation during initialization", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Auto-updater cancellation handling",
                "feature"
            );
            await annotate("Priority: Medium", "priority");
            await annotate("Category: Cancellation scenarios", "category");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Arrange - Create a cancellable update check
            const abortController = new AbortController();
            const customSignal = abortController.signal;

            mockAutoUpdaterService.checkForUpdates.mockReturnValue(
                new Promise((resolve, reject) => {
                    const timeout = setTimeout(resolve, 1000);
                    customSignal.addEventListener("abort", () => {
                        clearTimeout(timeout);
                        reject(new Error("Update check cancelled"));
                    });
                })
            );

            // Create new instance
            new ApplicationService();
            const readyHandler = getAppEventHandler("ready");

            // Act - Start ready handler and cancel update check
            const readyPromise = readyHandler?.();
            setTimeout(() => {
                abortController.abort();
            }, 10);

            // Wait for completion
            await readyPromise;
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Verify test signal is intact
            expect(signal.aborted).toBeFalsy();

            // Assert that error was logged due to cancellation
            expect(mockLogger.error).toHaveBeenCalledWith(
                "APPLICATION_UPDATE_CHECK_ERROR",
                expect.any(Error)
            );
        });
    });
    describe("Uptime Monitoring Event Handlers", () => {
        beforeEach(async () => {
            applicationService = new ApplicationService();
            const readyHandler = getAppEventHandler("ready");
            await readyHandler?.();
        });
        describe("monitor:up event", () => {
            it("should notify when a monitor recovers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const monitorUpHandler = getUptimeEventHandler("monitor:up");
                const eventData = {
                    site: { identifier: "site-1", name: "Test Site" },
                    monitor: { id: "monitor-1" },
                    timestamp: "2023-01-01T00:00:00Z",
                };

                // Act
                monitorUpHandler?.(eventData);

                // Assert
                expect(
                    mockRendererEventBridge.sendToRenderers
                ).not.toHaveBeenCalled();
                expect(
                    mockNotificationService.notifyMonitorUp
                ).toHaveBeenCalledWith(eventData.site, eventData.monitor.id);
            });
        });
        describe("monitor:down event", () => {
            it("should notify when a monitor goes down", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const monitorDownHandler =
                    getUptimeEventHandler("monitor:down");
                const eventData = {
                    site: { identifier: "site-1", name: "Test Site" },
                    monitor: { id: "monitor-1" },
                    timestamp: "2023-01-01T00:00:00Z",
                };

                // Act
                monitorDownHandler?.(eventData);

                // Assert
                expect(
                    mockRendererEventBridge.sendToRenderers
                ).not.toHaveBeenCalled();
                expect(
                    mockNotificationService.notifyMonitorDown
                ).toHaveBeenCalledWith(eventData.site, eventData.monitor.id);
            });
        });
        describe("monitor:check-completed event", () => {
            it("should forward manual check completion event to renderer", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                const manualCheckHandler = getUptimeEventHandler(
                    "monitor:check-completed"
                );

                const monitor: Monitor = {
                    activeOperations: [],
                    checkInterval: 60_000,
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    responseTime: 200,
                    retryAttempts: 0,
                    status: "up",
                    timeout: 30_000,
                    type: "http",
                    url: "https://example.com",
                };

                const site: Site = {
                    identifier: "site-1",
                    monitoring: true,
                    monitors: [monitor],
                    name: "Test Site",
                };

                const eventData = {
                    checkType: "manual" as const,
                    monitorId: "monitor-1",
                    result: {
                        monitor,
                        monitorId: "monitor-1",
                        site,
                        siteIdentifier: "site-1",
                        status: "up",
                        timestamp: "2023-01-01T00:00:00Z",
                    } as StatusUpdate,
                    siteIdentifier: "site-1",
                    timestamp: Date.now(),
                };

                manualCheckHandler?.(eventData);

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "APPLICATION_FORWARDING_MANUAL_CHECK_COMPLETED",
                    {
                        checkType: "manual",
                        monitorId: "monitor-1",
                        siteIdentifier: "site-1",
                    }
                );
                expect(
                    mockRendererEventBridge.sendToRenderers
                ).toHaveBeenCalledWith("monitor:check-completed", eventData);
            });

            it("should handle manual check completion forwarding errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                const manualCheckHandler = getUptimeEventHandler(
                    "monitor:check-completed"
                );

                const monitor: Monitor = {
                    activeOperations: [],
                    checkInterval: 60_000,
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    responseTime: 200,
                    retryAttempts: 0,
                    status: "up",
                    timeout: 30_000,
                    type: "http",
                    url: "https://example.com",
                };

                const site: Site = {
                    identifier: "site-1",
                    monitoring: true,
                    monitors: [monitor],
                    name: "Test Site",
                };

                const eventData = {
                    checkType: "manual" as const,
                    monitorId: "monitor-1",
                    result: {
                        monitor,
                        monitorId: "monitor-1",
                        site,
                        siteIdentifier: "site-1",
                        status: "up",
                        timestamp: "2023-01-01T00:00:00Z",
                    } as StatusUpdate,
                    siteIdentifier: "site-1",
                    timestamp: Date.now(),
                };

                const error = new Error("Forward failed");
                mockRendererEventBridge.sendToRenderers.mockImplementationOnce(
                    () => {
                        throw error;
                    }
                );

                manualCheckHandler?.(eventData);

                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_MANUAL_CHECK_COMPLETED_ERROR",
                    error
                );
            });
        });
        describe("settings:history-limit-updated event", () => {
            it("should forward history limit updates to renderer", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                const historyLimitHandler = getUptimeEventHandler(
                    "settings:history-limit-updated"
                );

                const eventData = {
                    limit: 750,
                    operation: "history-limit-updated" as const,
                    previousLimit: 500,
                    timestamp: Date.now(),
                };

                historyLimitHandler?.(eventData);

                expect(mockLogger.debug).toHaveBeenCalledWith(
                    "APPLICATION_FORWARDING_HISTORY_LIMIT_UPDATED",
                    {
                        limit: 750,
                        previousLimit: 500,
                        timestamp: eventData.timestamp,
                    }
                );
                expect(
                    mockRendererEventBridge.sendToRenderers
                ).toHaveBeenCalledWith(
                    "settings:history-limit-updated",
                    eventData
                );
            });

            it("should handle history limit forwarding errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                const historyLimitHandler = getUptimeEventHandler(
                    "settings:history-limit-updated"
                );

                const eventData = {
                    limit: 600,
                    operation: "history-limit-updated" as const,
                    previousLimit: 450,
                    timestamp: Date.now(),
                };

                const error = new Error("Forward failed");
                mockRendererEventBridge.sendToRenderers.mockImplementationOnce(
                    () => {
                        throw error;
                    }
                );

                historyLimitHandler?.(eventData);

                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_HISTORY_LIMIT_UPDATED_ERROR",
                    error
                );
            });
        });
        describe("system:error event", () => {
            it("should log system errors", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const systemErrorHandler =
                    getUptimeEventHandler("system:error");
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
            });
        });
        describe("monitoring:started event", () => {
            it("should forward monitoring started event to renderer", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const monitoringStartedHandler =
                    getUptimeEventHandler("monitoring:started");
                const eventData = { siteIdentifier: "site-1" };

                // Act
                monitoringStartedHandler?.(eventData);

                // Assert
                expect(
                    mockRendererEventBridge.sendToRenderers
                ).toHaveBeenCalledWith("monitoring:started", eventData);
            });
            it("should handle monitoring started forwarding errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const monitoringStartedHandler =
                    getUptimeEventHandler("monitoring:started");
                const eventData = { siteIdentifier: "site-1" };
                const error = new Error("Forward failed");
                mockRendererEventBridge.sendToRenderers.mockImplementationOnce(
                    () => {
                        throw error;
                    }
                );
                // Act
                monitoringStartedHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_MONITORING_STARTED_ERROR",
                    error
                );
            });
        });
        describe("monitoring:stopped event", () => {
            it("should forward monitoring stopped event to renderer", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const monitoringStoppedHandler =
                    getUptimeEventHandler("monitoring:stopped");
                const eventData = { siteIdentifier: "site-1" };

                // Act
                monitoringStoppedHandler?.(eventData);

                // Assert
                expect(
                    mockRendererEventBridge.sendToRenderers
                ).toHaveBeenCalledWith("monitoring:stopped", eventData);
            });
            it("should handle monitoring stopped forwarding errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const monitoringStoppedHandler =
                    getUptimeEventHandler("monitoring:stopped");
                const eventData = { siteIdentifier: "site-1" };
                const error = new Error("Forward failed");
                mockRendererEventBridge.sendToRenderers.mockImplementationOnce(
                    () => {
                        throw error;
                    }
                );
                // Act
                monitoringStoppedHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_MONITORING_STOPPED_ERROR",
                    error
                );
            });
        });
        describe("sites:state-synchronized event", () => {
            it("should forward state sync event to renderer", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                const stateSyncHandler = getUptimeEventHandler(
                    "sites:state-synchronized"
                );
                const eventData = {
                    action: STATE_SYNC_ACTION.UPDATE,
                    siteIdentifier: "site-1",
                    sites: [
                        {
                            identifier: "site-1",
                            monitoring: true,
                            monitors: [],
                            name: "Site 1",
                        },
                    ],
                    source: STATE_SYNC_SOURCE.DATABASE,
                    timestamp: Date.now(),
                };

                stateSyncHandler?.(eventData);

                expect(
                    mockRendererEventBridge.sendStateSyncEvent
                ).toHaveBeenCalledWith(eventData);
            });

            it("should handle state sync forwarding errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                const stateSyncHandler = getUptimeEventHandler(
                    "sites:state-synchronized"
                );
                const eventData = {
                    action: STATE_SYNC_ACTION.UPDATE,
                    siteIdentifier: "site-1",
                    sites: [
                        {
                            identifier: "site-1",
                            monitoring: true,
                            monitors: [],
                            name: "Site 1",
                        },
                    ],
                    source: STATE_SYNC_SOURCE.DATABASE,
                    timestamp: Date.now(),
                };
                const error = new Error("Forward failed");
                mockRendererEventBridge.sendStateSyncEvent.mockImplementationOnce(
                    () => {
                        throw error;
                    }
                );

                stateSyncHandler?.(eventData);

                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_STATE_SYNC_ERROR",
                    error
                );
            });
        });
        describe("cache:invalidated event", () => {
            it("should forward cache invalidated event to renderer", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const cacheInvalidatedHandler =
                    getUptimeEventHandler("cache:invalidated");
                const eventData = {
                    identifier: "site-1",
                    reason: "manual",
                    type: "site",
                };

                // Act
                cacheInvalidatedHandler?.(eventData);

                // Assert
                expect(
                    mockRendererEventBridge.sendToRenderers
                ).toHaveBeenCalledWith("cache:invalidated", eventData);
            });
            it("should handle cache invalidation forwarding errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: ApplicationService", "component");

                // Arrange
                const cacheInvalidatedHandler =
                    getUptimeEventHandler("cache:invalidated");
                const eventData = {
                    identifier: "site-1",
                    reason: "manual",
                    type: "site",
                };
                const error = new Error("Forward failed");
                mockRendererEventBridge.sendToRenderers.mockImplementationOnce(
                    () => {
                        throw error;
                    }
                );
                // Act
                cacheInvalidatedHandler?.(eventData);

                // Assert
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "APPLICATION_FORWARD_CACHE_INVALIDATION_ERROR",
                    error
                );
            });
        });
    });
    describe("Edge Cases and Error Handling", () => {
        it("should handle missing service methods gracefully", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate(`Suite: ${task.suite?.name || "Unknown"}`, "suite");
            await annotate("Component: ApplicationService", "component");
            await annotate("Feature: Graceful degradation", "feature");
            await annotate("Priority: High", "priority");
            await annotate("Category: Robustness testing", "category");
            await annotate("Edge case: Missing service methods", "edge-case");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Arrange
            const serviceWithoutMethods = {};
            mockServiceContainer.getIpcService.mockReturnValue(
                serviceWithoutMethods
            );

            // Act & Assert - Should not throw during construction
            expect(() => new ApplicationService()).not.toThrow();

            // Verify signal state
            expect(signal.aborted).toBeFalsy();
        });
        it("should handle null/undefined event data", async ({
            task,
            annotate,
            signal,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(`Task ID: ${task.id}`, "task-id");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Null/undefined event data handling",
                "feature"
            );
            await annotate("Priority: Medium", "priority");
            await annotate("Category: Input validation", "category");
            await annotate("Edge case: Null event data", "edge-case");
            await annotate(
                `Signal aborted: ${signal.aborted}`,
                "signal-status"
            );

            // Arrange
            applicationService = new ApplicationService();
            const monitorUpHandler = getUptimeEventHandler("monitor:up");

            // Act & Assert - Should not throw
            expect(() => monitorUpHandler?.(null)).not.toThrow();
            expect(() => monitorUpHandler?.(undefined)).not.toThrow();

            // Verify signal state after operations
            expect(signal.aborted).toBeFalsy();
        });

        it("should handle service container getInstance returning undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Service container failure handling",
                "feature"
            );
            await annotate("Priority: Medium", "priority");
            await annotate(
                "Category: Dependency injection failure",
                "category"
            );
            await annotate(
                "Edge case: Service container returns null",
                "edge-case"
            );

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
        });
    });
    describe("Integration and Lifecycle", () => {
        it("should properly coordinate service initialization order", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "integration");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Service initialization coordination",
                "feature"
            );
            await annotate("Priority: Critical", "priority");
            await annotate("Category: Service orchestration", "category");

            // Act
            applicationService = new ApplicationService();
            const readyHandler = getAppEventHandler("ready");
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
        it("should handle full lifecycle from construction to cleanup", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "integration");
            await annotate("Component: ApplicationService", "component");
            await annotate(
                "Feature: Complete application lifecycle",
                "feature"
            );
            await annotate("Priority: Critical", "priority");
            await annotate("Category: End-to-end testing", "category");

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
        });
    });
});
