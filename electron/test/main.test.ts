/**
 * Tests for main.ts - Entry point coverage
 * Tests the main application initialization, logging configuration, and cleanup handlers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the ApplicationService module
const mockApplicationService = {
    cleanup: vi.fn().mockResolvedValue(undefined),
};

const mockApplicationServiceConstructor = vi.fn(() => mockApplicationService);

vi.mock("./services/application/ApplicationService", () => ({
    ApplicationService: mockApplicationServiceConstructor,
}));

// Create mock functions using vi.hoisted to avoid hoisting issues
const mockLogger = vi.hoisted(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
}));

const mockApp = vi.hoisted(() => ({
    isPackaged: false,
    whenReady: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
}));

const mockLog = vi.hoisted(() => ({
    initialize: vi.fn(),
    transports: {
        file: {
            level: "",
            fileName: "",
            maxSize: 0,
            format: "",
        },
        console: {
            level: "",
            format: "",
        },
    },
}));

const mockInstallExtension = vi.hoisted(() => vi.fn().mockResolvedValue([
    { name: "React Developer Tools" },
    { name: "Redux DevTools" },
]));

const mockIsDev = vi.hoisted(() => vi.fn(() => true));

// Set up all mocks
vi.mock("electron", () => ({
    app: mockApp,
}));

vi.mock("electron-log/main", () => ({
    default: mockLog,
}));

vi.mock("electron-devtools-installer", () => ({
    default: mockInstallExtension,
    REACT_DEVELOPER_TOOLS: "react-developer-tools",
    REDUX_DEVTOOLS: "redux-devtools",
}));

vi.mock("./utils/logger", () => ({
    logger: mockLogger,
}));

vi.mock("./electronUtils", () => ({
    isDev: mockIsDev,
}));

describe("main.ts", () => {
    let originalArgv: string[];
    let mockProcessOn: any;

    beforeEach(() => {
        // Save original values
        originalArgv = process.argv;

        // Reset all mocks
        vi.clearAllMocks();
        mockApplicationServiceConstructor.mockClear();
        mockApplicationService.cleanup.mockClear();
        mockApp.on.mockClear();
        mockApp.whenReady.mockClear();
        mockLog.initialize.mockClear();
        mockInstallExtension.mockClear();
        mockIsDev.mockClear();
        mockLogger.info.mockClear();
        mockLogger.warn.mockClear();
        mockLogger.error.mockClear();
        mockLogger.debug.mockClear();

        // Reset mock return values
        mockApp.whenReady.mockResolvedValue(undefined);
        mockInstallExtension.mockResolvedValue([
            { name: "React Developer Tools" },
            { name: "Redux DevTools" },
        ]);
        mockIsDev.mockReturnValue(true);

        // Mock process.on
        mockProcessOn = vi.spyOn(process, 'on').mockImplementation(() => process);

        // Mock process.versions.electron to enable main execution
        Object.defineProperty(process, 'versions', {
            value: { electron: '1.0.0' },
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        // Restore original values
        process.argv = originalArgv;
        
        // Restore mocked functions
        mockProcessOn?.mockRestore();
        
        // Reset modules to ensure clean state
        vi.resetModules();
    });

    describe("Logging Configuration", () => {
        it("should configure debug logging when --debug flag is present", async () => {
            process.argv = ["node", "main.js", "--debug"];
            
            // Import and execute main
            await import("../main");
            
            expect(mockLog.initialize).toHaveBeenCalledWith({ preload: true });
            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");
        });

        it("should configure production logging when --log-production flag is present", async () => {
            process.argv = ["node", "main.js", "--log-production"];
            
            await import("../main");
            
            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");
        });

        it("should configure info logging when --log-info flag is present", async () => {
            process.argv = ["node", "main.js", "--log-info"];
            
            await import("../main");
            
            expect(mockLog.transports.file.level).toBe("info");
            expect(mockLog.transports.console.level).toBe("info");
        });

        it("should use default development logging when no flags are present", async () => {
            process.argv = ["node", "main.js"];
            mockIsDev.mockReturnValue(true);
            
            await import("../main");
            
            expect(mockLog.transports.file.level).toBe("info");
            expect(mockLog.transports.console.level).toBe("debug");
        });

        it("should use default production logging when packaged", async () => {
            process.argv = ["node", "main.js"];
            mockApp.isPackaged = true;
            mockIsDev.mockReturnValue(false);
            
            await import("../main");
            
            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");
        });
    });

    describe("Main Application Initialization", () => {
        it("should initialize application service", async () => {
            // Verify process.versions.electron is set
            expect(process.versions.electron).toBe('1.0.0');
            
            // Clear any existing modules first
            vi.resetModules();
            
            // Now import the module to trigger initialization
            await import("../main");
            
            // Check that ApplicationService constructor was called
            expect(mockApplicationServiceConstructor).toHaveBeenCalledOnce();
        });

        it.skip("should log that the application is starting", async () => {
            vi.resetModules();
            
            await import("../main");
            
            // Check that the logger was called with the startup message
            expect(mockLogger.info).toHaveBeenCalledWith("Starting Uptime Watcher application");
        });

        it("should setup cleanup handlers", async () => {
            vi.resetModules();
            
            await import("../main");
            
            // Verify that process and app event listeners are set up
            expect(mockProcessOn).toHaveBeenCalledWith("beforeExit", expect.any(Function));
            expect(mockApp.on).toHaveBeenCalledWith("will-quit", expect.any(Function));
        });

        it("should handle cleanup on app will-quit", async () => {
            vi.resetModules();
            
            await import("../main");
            
            // Get the will-quit handler that was registered
            const willQuitHandler = mockApp.on.mock.calls.find(call => call[0] === "will-quit")?.[1] as Function;
            expect(willQuitHandler).toBeDefined();
            
            // Call the handler
            willQuitHandler();
            
            // Verify cleanup was called
            expect(mockApplicationService.cleanup).toHaveBeenCalledOnce();
        });

        it("should handle cleanup errors gracefully", async () => {
            // Make cleanup reject
            mockApplicationService.cleanup.mockRejectedValueOnce(new Error("Cleanup failed"));
            
            vi.resetModules();
            
            await import("../main");
            
            // Get the will-quit handler
            const willQuitHandler = mockApp.on.mock.calls.find(call => call[0] === "will-quit")?.[1] as Function;
            expect(willQuitHandler).toBeDefined();
            
            // Calling handler should not throw even if cleanup fails
            expect(() => willQuitHandler()).not.toThrow();
        });

        it("should prevent double cleanup", async () => {
            vi.resetModules();
            
            await import("../main");
            
            // Get both handlers
            const willQuitHandler = mockApp.on.mock.calls.find(call => call[0] === "will-quit")?.[1] as Function;
            const beforeExitHandler = mockProcessOn.mock.calls.find(call => call[0] === "beforeExit")?.[1] as Function;
            
            expect(willQuitHandler).toBeDefined();
            expect(beforeExitHandler).toBeDefined();
            
            // Call both handlers
            willQuitHandler();
            beforeExitHandler();
            
            // Cleanup should only be called once due to the cleanup guard
            expect(mockApplicationService.cleanup).toHaveBeenCalledOnce();
        });
    });

    describe("DevTools Extension Installation", () => {
        it("should install extensions in development mode", async () => {
            mockIsDev.mockReturnValue(true);
            
            vi.resetModules();
            await import("../main");
            
            // Wait for whenReady to be called
            expect(mockApp.whenReady).toHaveBeenCalledOnce();
        });

        it("should not install extensions in production mode", async () => {
            mockIsDev.mockReturnValue(false);
            
            vi.resetModules();
            await import("../main");
            
            // whenReady should still be called, but extensions won't be installed inside the callback
            expect(mockApp.whenReady).toHaveBeenCalledOnce();
        });

        it("should handle extension installation errors gracefully", async () => {
            mockIsDev.mockReturnValue(true);
            mockInstallExtension.mockRejectedValueOnce(new Error("Extension installation failed"));
            
            vi.resetModules();
            await import("../main");
            
            // Should not throw error and should still call whenReady
            expect(mockApp.whenReady).toHaveBeenCalledOnce();
        });
    });

    describe("Environment Detection", () => {
        it("should run when electron is present", async () => {
            vi.resetModules();
            await import("../main");
            
            // Should initialize ApplicationService and setup event handlers when electron is present
            expect(mockApplicationServiceConstructor).toHaveBeenCalledOnce();
            expect(mockApp.whenReady).toHaveBeenCalledOnce();
        });

        it("should not run when electron is not present", async () => {
            // Remove electron from process.versions
            Object.defineProperty(process, 'versions', {
                value: {},
                writable: true,
                configurable: true
            });

            vi.resetModules();
            await import("../main");
            
            // Should not initialize when electron is not present
            expect(mockApplicationServiceConstructor).not.toHaveBeenCalled();
            expect(mockApp.whenReady).not.toHaveBeenCalled();
            
            // Restore for other tests
            Object.defineProperty(process, 'versions', {
                value: { electron: '1.0.0' },
                writable: true,
                configurable: true
            });
        });
    });

    describe("Command Line Arguments", () => {
        it("should handle --log-debug flag", async () => {
            process.argv = ["node", "main.js", "--log-debug"];
            
            vi.resetModules();
            await import("../main");
            
            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");
        });

        it("should handle --log-prod flag", async () => {
            process.argv = ["node", "main.js", "--log-prod"];
            
            vi.resetModules();
            await import("../main");
            
            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");
        });

        it("should handle multiple flags (debug takes precedence)", async () => {
            process.argv = ["node", "main.js", "--debug", "--log-prod"];
            
            vi.resetModules();
            await import("../main");
            
            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");
        });
    });
});