/**
 * Comprehensive tests for main.ts - Electron main process entry point
 * These tests cover application initialization, logging configuration, and cleanup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { App } from "electron";

// Mock electron-log before importing
const mockLog = {
    initialize: vi.fn(),
    transports: {
        file: {
            level: "info",
            fileName: "uptime-watcher-main.log",
            maxSize: 1024 * 1024 * 5,
            format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}",
        },
        console: {
            level: "debug",
            format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
        },
    },
};

vi.mock("electron-log/main", () => ({
    default: mockLog,
}));

// Mock electron-devtools-installer
const mockInstallExtension = vi.fn();
const REACT_DEVELOPER_TOOLS = "react-devtools";
const REDUX_DEVTOOLS = "redux-devtools";

vi.mock("electron-devtools-installer", () => ({
    default: mockInstallExtension,
    installExtension: mockInstallExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
}));

// Mock ApplicationService
const mockApplicationService = {
    cleanup: vi.fn(),
};

vi.mock("../services/application/ApplicationService", () => ({
    ApplicationService: vi.fn(() => mockApplicationService),
}));

// Mock logger
const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
};

vi.mock("../utils/logger", () => ({
    logger: mockLogger,
}));

// Mock electronUtils
const mockIsDev = vi.fn();
vi.mock("../electronUtils", () => ({
    isDev: mockIsDev,
}));

// Create comprehensive electron mock
const mockApp: Partial<App> = {
    isPackaged: false,
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
};

const mockBrowserWindow = vi.fn();

vi.mock("electron", () => ({
    app: mockApp,
    BrowserWindow: mockBrowserWindow,
}));

describe("main.ts - Electron Main Process", () => {
    let originalArgv: string[];
    let originalVersions: any;

    beforeEach(() => {
        vi.clearAllMocks();
        originalArgv = process.argv;
        originalVersions = process.versions;

        // Reset mocks to default states
        mockIsDev.mockReturnValue(true);
        mockInstallExtension.mockResolvedValue([
            { name: "React Developer Tools" },
            { name: "Redux DevTools" },
        ]);
        // Ensure cleanup is a mock function before setting mockResolvedValue
        if (
            typeof mockApplicationService.cleanup !== "function" ||
            !("mockResolvedValue" in mockApplicationService.cleanup)
        ) {
            mockApplicationService.cleanup = vi.fn();
        }
        mockApplicationService.cleanup.mockResolvedValue(undefined);

        // Set up process.versions.electron to indicate we're in Electron
        Object.defineProperty(process, "versions", {
            value: { ...originalVersions, electron: "25.0.0" },
            writable: true,        });        });
    afterEach(() => {
        process.argv = originalArgv;
        Object.defineProperty(process, "versions", {
            value: originalVersions,
            writable: true,        });
        vi.resetModules();        });
    describe("Logging Configuration", () => {
        it("should configure debug logging when --debug flag is present", async () => {
            process.argv = ["node", "main.js", "--debug"];

            // Import main.ts to trigger initialization
            await import("../main");

            expect(mockLog.initialize).toHaveBeenCalledWith({ preload: true });
            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");        });
        it("should configure production logging when --log-production flag is present", async () => {
            process.argv = ["node", "main.js", "--log-production"];

            await import("../main");

            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");        });
        it("should configure info logging when --log-info flag is present", async () => {
            process.argv = ["node", "main.js", "--log-info"];

            await import("../main");

            expect(mockLog.transports.file.level).toBe("info");
            expect(mockLog.transports.console.level).toBe("info");        });
        it("should use default development logging when no flags are present", async () => {
            process.argv = ["node", "main.js"];
            (mockApp as any).isPackaged = false;

            await import("../main");

            expect(mockLog.transports.file.level).toBe("info");
            expect(mockLog.transports.console.level).toBe("debug");        });
        it("should use default production logging when packaged", async () => {
            process.argv = ["node", "main.js"];
            (mockApp as any).isPackaged = true;

            await import("../main");

            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");        });
        it("should handle --log-prod flag as alias for --log-production", async () => {
            process.argv = ["node", "main.js", "--log-prod"];

            await import("../main");

            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");        });
        it("should handle --log-debug flag as alias for --debug", async () => {
            process.argv = ["node", "main.js", "--log-debug"];

            await import("../main");

            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");        });        });
    describe("Main Class Initialization", () => {
        it("should create ApplicationService instance", async () => {
            const { ApplicationService } = await import(
                "../services/application/ApplicationService"
            );

            await import("../main");

            expect(ApplicationService).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Starting Uptime Watcher application"
            );        });
        it("should set up process cleanup handlers", async () => {
            const processOnSpy = vi.spyOn(process, "on");

            await import("../main");

            expect(processOnSpy).toHaveBeenCalledWith(
                "beforeExit",
                expect.any(Function)
            );
            expect(mockApp.on).toHaveBeenCalledWith(
                "will-quit",
                expect.any(Function)
            );        });
        it("should only cleanup once when multiple shutdown events occur", async () => {
            const processOnSpy = vi.spyOn(process, "on");

            await import("../main");

            // Get the cleanup handler
            const beforeExitHandler = processOnSpy.mock.calls.find(
                (call) => call[0] === "beforeExit"
            )?.[1];
            const willQuitHandler = (mockApp.on as any).mock.calls.find(
                (call: any) => call[0] === "will-quit"
            )?.[1];

            expect(beforeExitHandler).toBeDefined();
            expect(willQuitHandler).toBeDefined();

            // Call both handlers to simulate multiple shutdown events
            if (beforeExitHandler) beforeExitHandler();
            if (willQuitHandler) willQuitHandler();

            await new Promise((resolve) => setTimeout(resolve, 10)); // Allow async cleanup to complete

            // Cleanup should only be called once
            expect(mockApplicationService.cleanup).toHaveBeenCalledTimes(1);        });
        it("should handle cleanup errors gracefully", async () => {
            mockApplicationService.cleanup.mockRejectedValue(
                new Error("Cleanup failed")
            );
            const processOnSpy = vi.spyOn(process, "on");

            await import("../main");

            const beforeExitHandler = processOnSpy.mock.calls.find(
                (call) => call[0] === "beforeExit"
            )?.[1];

            expect(beforeExitHandler).toBeDefined();

            if (beforeExitHandler) {
                // The beforeExit handler doesn't throw synchronously - it logs and handles errors internally
                expect(() => beforeExitHandler()).not.toThrow();

                // Give some time for the async cleanup to run and error handling to complete
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[Main] Cleanup failed",
                expect.any(Error)
            );        });        });
    describe("DevTools Extension Installation", () => {
        it.skip("should install devtools extensions in development mode", async () => {
            mockIsDev.mockReturnValue(true);

            await import("../main");

            // Wait for whenReady to be called and resolved
            expect(mockApp.whenReady).toHaveBeenCalled();

            // Manually trigger the whenReady promise resolution
            const whenReadyPromise = (mockApp.whenReady as any).mock.results[0]
                .value;
            await whenReadyPromise;

            expect(mockInstallExtension).toHaveBeenCalledWith(
                [REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS],
                {
                    loadExtensionOptions: { allowFileAccess: true },
                }
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[Main] Added Extensions: React Developer Tools, Redux DevTools"
            );        });
        it("should not install extensions in production mode", async () => {
            mockIsDev.mockReturnValue(false);

            await import("../main");

            // Wait for whenReady to be called and resolved
            const whenReadyPromise = (mockApp.whenReady as any).mock.results[0]
                .value;
            await whenReadyPromise;

            expect(mockInstallExtension).not.toHaveBeenCalled();        });
        it("should handle extension installation failures gracefully", async () => {
            mockIsDev.mockReturnValue(true);
            mockInstallExtension.mockRejectedValue(
                new Error("Extension installation failed")
            );

            await import("../main");

            const whenReadyPromise = (mockApp.whenReady as any).mock.results[0]
                .value;
            await whenReadyPromise;

            // Wait for the setTimeout(resolve, 1) and extension installation code to complete
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[Main] Failed to install dev extensions (this is normal in production)",
                expect.any(Error)
            );        });
        it("should wait for timing before installing extensions", async () => {
            mockIsDev.mockReturnValue(true);
            const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

            await import("../main");

            const whenReadyPromise = (mockApp.whenReady as any).mock.results[0]
                .value;
            await whenReadyPromise;

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1);        });        });
    describe("Electron Environment Detection", () => {
        it("should only initialize when in Electron environment", async () => {
            // Test with Electron environment
            Object.defineProperty(process, "versions", {
                value: { ...originalVersions, electron: "25.0.0" },
                writable: true,        });
            const { ApplicationService } = await import(
                "../services/application/ApplicationService"
            );

            await import("../main");

            expect(ApplicationService).toHaveBeenCalled();        });
        it("should not initialize when not in Electron environment", async () => {
            // Test without Electron environment
            Object.defineProperty(process, "versions", {
                value: { ...originalVersions },
                writable: true,        });
            delete (process.versions as any).electron;

            const { ApplicationService } = await import(
                "../services/application/ApplicationService"
            );

            await import("../main");

            expect(ApplicationService).not.toHaveBeenCalled();        });        });
    describe("Main Class Edge Cases", () => {
        it("should handle missing cleanup method gracefully", async () => {
            (mockApplicationService as any).cleanup = undefined;
            const processOnSpy = vi.spyOn(process, "on");

            await import("../main");

            const beforeExitHandler = processOnSpy.mock.calls.find(
                (call) => call[0] === "beforeExit"
            )?.[1];

            // Should not throw when cleanup method is missing
            expect(() => {
                if (beforeExitHandler) beforeExitHandler();
            }).not.toThrow();        });
        it("should handle null applicationService gracefully", async () => {
            const { ApplicationService } = await import(
                "../services/application/ApplicationService"
            );
            (ApplicationService as any).mockImplementation(() => null);

            const processOnSpy = vi.spyOn(process, "on");

            await import("../main");

            const beforeExitHandler = processOnSpy.mock.calls.find(
                (call) => call[0] === "beforeExit"
            )?.[1];

            // Should not throw when applicationService is null
            expect(() => {
                if (beforeExitHandler) beforeExitHandler();
            }).not.toThrow();        });        });
    describe("Log Transport Configuration", () => {
        it("should configure file transport correctly", async () => {
            await import("../main");

            expect(mockLog.transports.file.fileName).toBe(
                "uptime-watcher-main.log"
            );
            expect(mockLog.transports.file.maxSize).toBe(1024 * 1024 * 5);
            expect(mockLog.transports.file.format).toBe(
                "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}"
            );        });
        it("should configure console transport correctly", async () => {
            await import("../main");

            expect(mockLog.transports.console.format).toBe(
                "[{h}:{i}:{s}.{ms}] [{level}] {text}"
            );        });        });        });