/**
 * Tests for ApplicationService.
 * Validates main application service orchestration and lifecycle management.
 */

import { app } from "electron";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock all dependencies
vi.mock("electron", () => ({
    app: {
        on: vi.fn(),
        quit: vi.fn(),
    },
}));

vi.mock("../../../services/window/WindowService", () => ({
    WindowService: vi.fn(() => ({
        createMainWindow: vi.fn(),
        sendToRenderer: vi.fn(),
        closeMainWindow: vi.fn(),
        getAllWindows: vi.fn(() => []),
    })),
}));

vi.mock("../../../services/ipc/IpcService", () => ({
    IpcService: vi.fn(() => ({
        setupHandlers: vi.fn(),
        cleanup: vi.fn(),
    })),
}));

vi.mock("../../../services/notifications/NotificationService", () => ({
    NotificationService: vi.fn(() => ({
        notifyMonitorDown: vi.fn(),
        notifyMonitorUp: vi.fn(),
    })),
}));

vi.mock("../../../services/updater/AutoUpdaterService", () => ({
    AutoUpdaterService: vi.fn(() => ({
        setStatusCallback: vi.fn(),
        initialize: vi.fn(),
        checkForUpdates: vi.fn(),
    })),
}));

vi.mock("../../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: vi.fn(() => ({
        initialize: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        stopMonitoring: vi.fn(),
    })),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("ApplicationService", () => {
    let ApplicationService: any;
    let applicationService: any;
    let mockApp: any;
    let logger: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        mockApp = app;
        logger = (await import("../../../utils/logger")).logger;

        // Import ApplicationService after all mocks are set up
        const module = await import("../../../services/application/ApplicationService");
        ApplicationService = module.ApplicationService;

        applicationService = new ApplicationService();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Constructor", () => {
        it("should initialize all services", () => {
            expect(logger.info).toHaveBeenCalledWith("[ApplicationService] Initializing application services");
        });

        it("should setup application event handlers", () => {
            expect(mockApp.on).toHaveBeenCalledWith("ready", expect.any(Function));
            expect(mockApp.on).toHaveBeenCalledWith("window-all-closed", expect.any(Function));
            expect(mockApp.on).toHaveBeenCalledWith("activate", expect.any(Function));
        });
    });

    describe("Event Handlers", () => {
        it("should handle app ready event successfully", async () => {
            // Get the ready handler
            const readyHandler = mockApp.on.mock.calls.find((call: any) => call[0] === "ready")[1];

            await readyHandler();

            expect(applicationService.uptimeOrchestrator.initialize).toHaveBeenCalled();
            expect(applicationService.windowService.createMainWindow).toHaveBeenCalled();
            expect(applicationService.ipcService.setupHandlers).toHaveBeenCalled();
        });

        it("should handle app ready event errors", async () => {
            // Mock initialize to throw error
            applicationService.uptimeOrchestrator.initialize.mockRejectedValue(new Error("Init failed"));

            const readyHandler = mockApp.on.mock.calls.find((call: any) => call[0] === "ready")[1];

            await readyHandler();

            expect(logger.error).toHaveBeenCalledWith(
                "[ApplicationService] Error during app initialization",
                expect.any(Error)
            );
        });

        it("should handle window-all-closed on non-macOS", () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, "platform", { value: "win32" });

            const windowsClosedHandler = mockApp.on.mock.calls.find((call: any) => call[0] === "window-all-closed")[1];

            windowsClosedHandler();

            expect(logger.info).toHaveBeenCalledWith("[ApplicationService] All windows closed");
            expect(logger.info).toHaveBeenCalledWith("[ApplicationService] Quitting app (non-macOS)");
            expect(mockApp.quit).toHaveBeenCalled();

            Object.defineProperty(process, "platform", { value: originalPlatform });
        });

        it("should handle window-all-closed on macOS", () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, "platform", { value: "darwin" });

            const windowsClosedHandler = mockApp.on.mock.calls.find((call: any) => call[0] === "window-all-closed")[1];

            windowsClosedHandler();

            expect(logger.info).toHaveBeenCalledWith("[ApplicationService] All windows closed");
            expect(mockApp.quit).not.toHaveBeenCalled();

            Object.defineProperty(process, "platform", { value: originalPlatform });
        });

        it("should handle activate with no windows", () => {
            applicationService.windowService.getAllWindows.mockReturnValue([]);

            const activateHandler = mockApp.on.mock.calls.find((call: any) => call[0] === "activate")[1];

            activateHandler();

            expect(logger.info).toHaveBeenCalledWith("[ApplicationService] App activated");
            expect(logger.info).toHaveBeenCalledWith("[ApplicationService] No windows open, creating main window");
            expect(applicationService.windowService.createMainWindow).toHaveBeenCalled();
        });

        it("should handle activate with existing windows", () => {
            applicationService.windowService.getAllWindows.mockReturnValue([{ id: 1 }]);

            const activateHandler = mockApp.on.mock.calls.find((call: any) => call[0] === "activate")[1];

            activateHandler();

            expect(logger.info).toHaveBeenCalledWith("[ApplicationService] App activated");
            expect(applicationService.windowService.createMainWindow).not.toHaveBeenCalled();
        });
    });

    describe("UptimeOrchestrator Event Handlers", () => {
        beforeEach(async () => {
            // Reset the constructor call to get fresh event handlers
            vi.clearAllMocks();
            applicationService = new ApplicationService();

            // Trigger the ready event to setup monitor events
            const readyHandler = mockApp.on.mock.calls.find((call: any) => call[0] === "ready")?.[1];
            if (readyHandler) {
                await readyHandler();
            }
        });

        it("should handle status-update events", () => {
            // Find the call to uptimeOrchestrator.on with 'status-update'
            const mockUptimeOrchestrator = applicationService.uptimeOrchestrator;
            const onCalls = mockUptimeOrchestrator.on.mock.calls;
            const statusUpdateCall = onCalls.find((call: any) => call[0] === "status-update");

            expect(statusUpdateCall).toBeDefined();
            const statusUpdateHandler = statusUpdateCall?.[1];
            expect(statusUpdateHandler).toBeDefined();

            const statusData = {
                site: {
                    identifier: "test-site",
                    monitors: [
                        { type: "http", status: "up", responseTime: 150 },
                        { type: "port", status: "down" },
                    ],
                },
            };

            statusUpdateHandler!(statusData);

            expect(logger.debug).toHaveBeenCalledWith(
                "[ApplicationService] Status update for test-site: http: up (150ms), port: down"
            );
            expect(applicationService.windowService.sendToRenderer).toHaveBeenCalledWith("status-update", statusData);
        });

        it("should handle site-monitor-down events", () => {
            const mockUptimeOrchestrator = applicationService.uptimeOrchestrator;
            const onCalls = mockUptimeOrchestrator.on.mock.calls;
            const monitorDownCall = onCalls.find((call: any) => call[0] === "site-monitor-down");

            expect(monitorDownCall).toBeDefined();
            const monitorDownHandler = monitorDownCall?.[1];
            expect(monitorDownHandler).toBeDefined();

            const eventData = { monitorId: "monitor1", site: { name: "Test Site" } };

            monitorDownHandler!(eventData);

            expect(applicationService.notificationService.notifyMonitorDown).toHaveBeenCalledWith(
                eventData.site,
                eventData.monitorId
            );
        });

        it("should handle site-monitor-up events", () => {
            const mockUptimeOrchestrator = applicationService.uptimeOrchestrator;
            const onCalls = mockUptimeOrchestrator.on.mock.calls;
            const monitorUpCall = onCalls.find((call: any) => call[0] === "site-monitor-up");

            expect(monitorUpCall).toBeDefined();
            const monitorUpHandler = monitorUpCall?.[1];
            expect(monitorUpHandler).toBeDefined();

            const eventData = { monitorId: "monitor1", site: { name: "Test Site" } };

            monitorUpHandler!(eventData);

            expect(applicationService.notificationService.notifyMonitorUp).toHaveBeenCalledWith(
                eventData.site,
                eventData.monitorId
            );
        });

        it("should handle db-error events", () => {
            const mockUptimeOrchestrator = applicationService.uptimeOrchestrator;
            const onCalls = mockUptimeOrchestrator.on.mock.calls;
            const dbErrorCall = onCalls.find((call: any) => call[0] === "db-error");

            expect(dbErrorCall).toBeDefined();
            const dbErrorHandler = dbErrorCall?.[1];
            expect(dbErrorHandler).toBeDefined();

            const errorData = { error: new Error("DB Error"), operation: "save" };

            dbErrorHandler!(errorData);

            expect(logger.error).toHaveBeenCalledWith(
                "[ApplicationService] Database error during save",
                errorData.error
            );
        });
    });

    describe("Auto Updater Setup", () => {
        it("should setup auto updater with status callback", async () => {
            const readyHandler = mockApp.on.mock.calls.find((call: any) => call[0] === "ready")[1];

            await readyHandler();

            expect(applicationService.autoUpdaterService.setStatusCallback).toHaveBeenCalled();
            expect(applicationService.autoUpdaterService.initialize).toHaveBeenCalled();
            expect(applicationService.autoUpdaterService.checkForUpdates).toHaveBeenCalled();

            // Test the status callback
            const statusCallback = applicationService.autoUpdaterService.setStatusCallback.mock.calls[0][0];
            const statusData = { progress: 50 };

            statusCallback(statusData);

            expect(applicationService.windowService.sendToRenderer).toHaveBeenCalledWith("update-status", statusData);
        });
    });

    describe("cleanup", () => {
        it("should cleanup all services successfully", () => {
            applicationService.cleanup();

            expect(logger.info).toHaveBeenCalledWith("[ApplicationService] Cleaning up services");
        });

        it("should handle cleanup errors gracefully", () => {
            // Mock one of the cleanup methods to throw an error
            const mockError = new Error("Cleanup failed");
            applicationService.ipcService = {
                cleanup: vi.fn(() => {
                    throw mockError;
                }),
            };
            applicationService.uptimeOrchestrator = { stopMonitoring: vi.fn() };
            applicationService.windowService = { closeMainWindow: vi.fn() };

            applicationService.cleanup();

            expect(logger.error).toHaveBeenCalledWith("[ApplicationService] Error during cleanup", mockError);
        });
    });
});
