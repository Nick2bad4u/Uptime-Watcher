/**
 * Tests for AutoUpdaterService.
 * Validates auto-update functionality and status management.
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

vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("AutoUpdaterService", () => {
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
        it("should initialize without status callback", () => {
            expect(autoUpdaterService).toBeDefined();
        });
    });

    describe("setStatusCallback", () => {
        it("should set the status callback", () => {
            autoUpdaterService.setStatusCallback(statusCallback);

            // Initialize to setup event listeners and trigger a status change
            autoUpdaterService.initialize();

            // Get the checking-for-update event handler and trigger it
            const checkingHandler = getEventHandler("checking-for-update");
            checkingHandler();

            expect(statusCallback).toHaveBeenCalledWith({ status: "checking" });
        });

        it("should allow changing the status callback", () => {
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

        it("should log initialization", () => {
            expect(logger.info).toHaveBeenCalledWith("[AutoUpdaterService] Initializing auto-updater");
        });

        it("should setup all event listeners", () => {
            const expectedEvents = [
                "checking-for-update",
                "update-available",
                "update-not-available",
                "download-progress",
                "update-downloaded",
                "error",
            ];

            expectedEvents.forEach((event) => {
                expect(mockAutoUpdater.on).toHaveBeenCalledWith(event, expect.any(Function));
            });
        });

        it("should handle checking-for-update event", () => {
            const handler = getEventHandler("checking-for-update");
            handler();

            expect(logger.debug).toHaveBeenCalledWith("[AutoUpdaterService] Checking for updates");
            expect(statusCallback).toHaveBeenCalledWith({ status: "checking" });
        });

        it("should handle update-available event", () => {
            const updateInfo = { version: "1.0.1" };
            const handler = getEventHandler("update-available");
            handler(updateInfo);

            expect(logger.info).toHaveBeenCalledWith("[AutoUpdaterService] Update available", updateInfo);
            expect(statusCallback).toHaveBeenCalledWith({ status: "available" });
        });

        it("should handle update-not-available event", () => {
            const updateInfo = { version: "1.0.0" };
            const handler = getEventHandler("update-not-available");
            handler(updateInfo);

            expect(logger.debug).toHaveBeenCalledWith("[AutoUpdaterService] No update available", updateInfo);
            expect(statusCallback).toHaveBeenCalledWith({ status: "idle" });
        });

        it("should handle download-progress event", () => {
            const progressObj = {
                bytesPerSecond: 1024,
                percent: 50,
                total: 2048,
                transferred: 1024,
            };
            const handler = getEventHandler("download-progress");
            handler(progressObj);

            expect(logger.debug).toHaveBeenCalledWith("[AutoUpdaterService] Download progress", progressObj);
            expect(statusCallback).toHaveBeenCalledWith({ status: "downloading" });
        });

        it("should handle update-downloaded event", () => {
            const updateInfo = { version: "1.0.1" };
            const handler = getEventHandler("update-downloaded");
            handler(updateInfo);

            expect(logger.info).toHaveBeenCalledWith("[AutoUpdaterService] Update downloaded", updateInfo);
            expect(statusCallback).toHaveBeenCalledWith({ status: "downloaded" });
        });

        it("should handle error event with Error object", () => {
            const error = new Error("Update failed");
            const handler = getEventHandler("error");
            handler(error);

            expect(logger.error).toHaveBeenCalledWith("[AutoUpdaterService] Auto-updater error", error);
            expect(statusCallback).toHaveBeenCalledWith({
                status: "error",
                error: "Update failed",
            });
        });

        it("should handle error event with non-Error object", () => {
            const error = "String error";
            const handler = getEventHandler("error");
            handler(error);

            expect(logger.error).toHaveBeenCalledWith("[AutoUpdaterService] Auto-updater error", error);
            expect(statusCallback).toHaveBeenCalledWith({
                status: "error",
                error: "String error",
            });
        });

        it("should handle error event with null/undefined", () => {
            const handler = getEventHandler("error");
            handler(null);

            expect(statusCallback).toHaveBeenCalledWith({
                status: "error",
                error: "null",
            });
        });
    });

    describe("checkForUpdates", () => {
        beforeEach(() => {
            autoUpdaterService.setStatusCallback(statusCallback);
        });

        it("should call autoUpdater.checkForUpdatesAndNotify", async () => {
            mockAutoUpdater.checkForUpdatesAndNotify.mockResolvedValue(undefined);

            await autoUpdaterService.checkForUpdates();

            expect(mockAutoUpdater.checkForUpdatesAndNotify).toHaveBeenCalled();
        });

        it("should handle errors during update check", async () => {
            const error = new Error("Network error");
            mockAutoUpdater.checkForUpdatesAndNotify.mockRejectedValue(error);

            await autoUpdaterService.checkForUpdates();

            expect(logger.error).toHaveBeenCalledWith("[AutoUpdaterService] Failed to check for updates", error);
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
        it("should call autoUpdater.quitAndInstall", () => {
            autoUpdaterService.quitAndInstall();

            expect(logger.info).toHaveBeenCalledWith("[AutoUpdaterService] Quitting and installing update");
            expect(mockAutoUpdater.quitAndInstall).toHaveBeenCalled();
        });
    });

    describe("notifyStatusChange", () => {
        it("should not call callback when not set", () => {
            // Don't set a status callback
            autoUpdaterService.initialize();

            const handler = getEventHandler("checking-for-update");
            handler();

            // Should not throw
            expect(() => handler()).not.toThrow();
        });

        it("should call callback when set", () => {
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

        it("should handle complete update flow", () => {
            // Simulate complete update flow
            const checkingHandler = getEventHandler("checking-for-update");
            const availableHandler = getEventHandler("update-available");
            const progressHandler = getEventHandler("download-progress");
            const downloadedHandler = getEventHandler("update-downloaded");

            checkingHandler();
            expect(statusCallback).toHaveBeenLastCalledWith({ status: "checking" });

            availableHandler({ version: "1.0.1" });
            expect(statusCallback).toHaveBeenLastCalledWith({ status: "available" });

            progressHandler({ percent: 50, bytesPerSecond: 1024, total: 2048, transferred: 1024 });
            expect(statusCallback).toHaveBeenLastCalledWith({ status: "downloading" });

            downloadedHandler({ version: "1.0.1" });
            expect(statusCallback).toHaveBeenLastCalledWith({ status: "downloaded" });

            expect(statusCallback).toHaveBeenCalledTimes(4);
        });

        it("should handle error during update flow", () => {
            const checkingHandler = getEventHandler("checking-for-update");
            const errorHandler = getEventHandler("error");

            checkingHandler();
            expect(statusCallback).toHaveBeenLastCalledWith({ status: "checking" });

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
        const call = mockAutoUpdater.on.mock.calls.find((call: any[]) => call[0] === eventName);
        expect(call).toBeDefined();
        return call![1];
    }
});
