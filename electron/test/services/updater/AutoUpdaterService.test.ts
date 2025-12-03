/**
 * Tests for AutoUpdaterService. Validates auto-update functionality and status
 * management.
 */

import { autoUpdater } from "electron-updater";

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { AutoUpdaterService } from "../../../services/updater/AutoUpdaterService";

// Mock electron-updater
vi.mock("electron-updater", () => ({
    autoUpdater: {
        on: vi.fn(),
        checkForUpdatesAndNotify: vi.fn(),
        quitAndInstall: vi.fn(),
    },
}));

vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    });
    return {
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

describe(AutoUpdaterService, () => {
    let autoUpdaterService: AutoUpdaterService;
    let mockAutoUpdater: any;
    let statusCallback: any;
    let logger: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        logger = (await import("../../../utils/logger")).logger;

        mockAutoUpdater = autoUpdater;
        statusCallback = vi.fn();

        autoUpdaterService = new AutoUpdaterService();
    });
    afterEach(() => {
        vi.resetAllMocks();
    });
    describe("Constructor", () => {
        it("should initialize without status callback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            expect(autoUpdaterService).toBeDefined();
        });
    });
    describe("setStatusCallback", () => {
        it("should set the status callback", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            autoUpdaterService.setStatusCallback(statusCallback);

            // Initialize to setup event listeners and trigger a status change
            autoUpdaterService.initialize();

            // Get the checking-for-update event handler and trigger it
            const checkingHandler = getEventHandler("checking-for-update");
            checkingHandler();

            expect(statusCallback).toHaveBeenCalledWith({ status: "checking" });
        });
        it("should allow changing the status callback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const firstCallback = vi.fn();
            const secondCallback = vi.fn();

            autoUpdaterService.setStatusCallback(firstCallback);
            autoUpdaterService.setStatusCallback(secondCallback);
            autoUpdaterService.initialize();

            // Trigger an event
            const checkingHandler = getEventHandler("checking-for-update");
            checkingHandler();

            expect(firstCallback).not.toHaveBeenCalled();
            expect(secondCallback).toHaveBeenCalledWith({ status: "checking" });
        });
    });
    describe("initialize", () => {
        beforeEach(() => {
            autoUpdaterService.setStatusCallback(statusCallback);
            autoUpdaterService.initialize();
        });
        it("should log initialization", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            expect(logger.info).toHaveBeenCalledWith(
                "[AutoUpdaterService] Initializing auto-updater"
            );
        });
        it("should setup all event listeners", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const expectedEvents = [
                "checking-for-update",
                "update-available",
                "update-not-available",
                "download-progress",
                "update-downloaded",
                "error",
            ];

            for (const event of expectedEvents) {
                expect(mockAutoUpdater.on).toHaveBeenCalledWith(
                    event,
                    expect.any(Function)
                );
            }
        });
        it("should handle checking-for-update event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const handler = getEventHandler("checking-for-update");
            handler();

            expect(logger.debug).toHaveBeenCalledWith(
                "[AutoUpdaterService] Checking for updates"
            );
            expect(statusCallback).toHaveBeenCalledWith({ status: "checking" });
        });
        it("should handle update-available event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const updateInfo = { version: "1.0.1" };
            const handler = getEventHandler("update-available");
            handler(updateInfo);

            expect(logger.info).toHaveBeenCalledWith(
                "[AutoUpdaterService] Update available",
                updateInfo
            );
            expect(statusCallback).toHaveBeenCalledWith({
                status: "available",
            });
        });
        it("should handle update-not-available event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const updateInfo = { version: "1.0.0" };
            const handler = getEventHandler("update-not-available");
            handler(updateInfo);

            expect(logger.debug).toHaveBeenCalledWith(
                "[AutoUpdaterService] No update available",
                updateInfo
            );
            expect(statusCallback).toHaveBeenCalledWith({ status: "idle" });
        });
        it("should handle download-progress event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const progressObj = {
                bytesPerSecond: 1024,
                percent: 50,
                total: 2048,
                transferred: 1024,
            };
            const handler = getEventHandler("download-progress");
            handler(progressObj);

            expect(logger.debug).toHaveBeenCalledWith(
                "[AutoUpdaterService] Download progress",
                progressObj
            );
            expect(statusCallback).toHaveBeenCalledWith({
                status: "downloading",
            });
        });
        it("should handle update-downloaded event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const updateInfo = { version: "1.0.1" };
            const handler = getEventHandler("update-downloaded");
            handler(updateInfo);

            expect(logger.info).toHaveBeenCalledWith(
                "[AutoUpdaterService] Update downloaded",
                updateInfo
            );
            expect(statusCallback).toHaveBeenCalledWith({
                status: "downloaded",
            });
        });
        it("should handle error event with Error object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const error = new Error("Update failed");
            const handler = getEventHandler("error");
            handler(error);

            expect(logger.error).toHaveBeenCalledWith(
                "[AutoUpdaterService] Auto-updater error",
                error
            );
            expect(statusCallback).toHaveBeenCalledWith({
                status: "error",
                error: "Update failed",
            });
        });
        it("should handle error event with non-Error object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const error = "String error";
            const handler = getEventHandler("error");
            handler(error);

            expect(logger.error).toHaveBeenCalledWith(
                "[AutoUpdaterService] Auto-updater error",
                error
            );
            expect(statusCallback).toHaveBeenCalledWith({
                status: "error",
                error: "String error",
            });
        });
    });
    describe("checkForUpdates", () => {
        beforeEach(() => {
            autoUpdaterService.setStatusCallback(statusCallback);
        });
        it("should call autoUpdater.checkForUpdatesAndNotify", async () => {
            mockAutoUpdater.checkForUpdatesAndNotify.mockResolvedValue();

            await autoUpdaterService.checkForUpdates();

            expect(mockAutoUpdater.checkForUpdatesAndNotify).toHaveBeenCalled();
        });
        it("should handle errors during update check", async () => {
            const error = new Error("Network error");
            mockAutoUpdater.checkForUpdatesAndNotify.mockRejectedValue(error);

            await autoUpdaterService.checkForUpdates();

            expect(logger.error).toHaveBeenCalledWith(
                "[AutoUpdaterService] Failed to check for updates",
                error
            );
            expect(statusCallback).toHaveBeenCalledWith({
                status: "error",
                error: "Network error",
            });
        });
        it("should handle non-Error objects during update check", async () => {
            const error = "String error";
            mockAutoUpdater.checkForUpdatesAndNotify.mockRejectedValue(error);

            await autoUpdaterService.checkForUpdates();

            expect(statusCallback).toHaveBeenCalledWith({
                status: "error",
                error: "String error",
            });
        });
    });
    describe("quitAndInstall", () => {
        it("should call autoUpdater.quitAndInstall", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            autoUpdaterService.quitAndInstall();

            expect(logger.info).toHaveBeenCalledWith(
                "[AutoUpdaterService] Quitting and installing update"
            );
            expect(mockAutoUpdater.quitAndInstall).toHaveBeenCalled();
        });
    });
    describe("notifyStatusChange", () => {
        it("should not call callback when not set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            // Don't set a status callback
            autoUpdaterService.initialize();

            const handler = getEventHandler("checking-for-update");
            handler();

            // Should not throw
            expect(() => handler()).not.toThrowError();
        });
        it("should call callback when set", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            autoUpdaterService.setStatusCallback(statusCallback);
            autoUpdaterService.initialize();

            const handler = getEventHandler("checking-for-update");
            handler();

            expect(statusCallback).toHaveBeenCalledWith({ status: "checking" });
        });
    });
    describe("Integration scenarios", () => {
        beforeEach(() => {
            autoUpdaterService.setStatusCallback(statusCallback);
            autoUpdaterService.initialize();
        });
        it("should handle complete update flow", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            // Simulate complete update flow
            const checkingHandler = getEventHandler("checking-for-update");
            const availableHandler = getEventHandler("update-available");
            const progressHandler = getEventHandler("download-progress");
            const downloadedHandler = getEventHandler("update-downloaded");

            checkingHandler();
            expect(statusCallback).toHaveBeenLastCalledWith({
                status: "checking",
            });
            availableHandler({ version: "1.0.1" });
            expect(statusCallback).toHaveBeenLastCalledWith({
                status: "available",
            });
            progressHandler({
                percent: 50,
                bytesPerSecond: 1024,
                total: 2048,
                transferred: 1024,
            });
            expect(statusCallback).toHaveBeenLastCalledWith({
                status: "downloading",
            });
            downloadedHandler({ version: "1.0.1" });
            expect(statusCallback).toHaveBeenLastCalledWith({
                status: "downloaded",
            });
            expect(statusCallback).toHaveBeenCalledTimes(4);
        });
        it("should handle error during update flow", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: AutoUpdaterService", "component");

            const checkingHandler = getEventHandler("checking-for-update");
            const errorHandler = getEventHandler("error");

            checkingHandler();
            expect(statusCallback).toHaveBeenLastCalledWith({
                status: "checking",
            });
            errorHandler(new Error("Download failed"));
            expect(statusCallback).toHaveBeenLastCalledWith({
                status: "error",
                error: "Download failed",
            });
            expect(statusCallback).toHaveBeenCalledTimes(2);
        });
    });
    // Helper function to get event handler
    function getEventHandler(eventName: string): (...args: unknown[]) => void {
        const call = mockAutoUpdater.on.mock.calls.find(
            (call: any[]) => call[0] === eventName
        );
        expect(call).toBeDefined();
        return call![1];
    }
});
