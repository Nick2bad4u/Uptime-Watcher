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

vi.mock("../../../uptimeMonitor", () => ({
    UptimeMonitor: vi.fn(() => ({
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
            applicationService.uptimeMonitor = { stopMonitoring: vi.fn() };
            applicationService.windowService = { closeMainWindow: vi.fn() };

            applicationService.cleanup();

            expect(logger.error).toHaveBeenCalledWith("[ApplicationService] Error during cleanup", mockError);
        });
    });
});
