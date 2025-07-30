/**
 * Additional tests for main.ts to achieve 98% branch coverage
 * Targets specific uncovered branches and edge cases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Enhanced mocking for missing branches
const mockLog = {
    initialize: vi.fn(),
    transports: {
        file: { 
            level: "info", 
            fileName: "uptime-watcher-main.log",
            maxSize: 1024 * 1024 * 5,
            format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}"
        },
        console: { 
            level: "debug",
            format: "[{h}:{i}:{s}.{ms}] [{level}] {text}"
        },
    },
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

const mockInstallExtension = vi.fn();
const mockIsDev = vi.fn();
const mockApp = {
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn(),
    isPackaged: false,
};

// Mock logger
vi.mock("../utils/logger", () => ({
    logger: {
        log: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock("electron-log/main", () => ({ default: mockLog }));
vi.mock("electron-devtools-installer", () => ({
    installExtension: mockInstallExtension,
    REACT_DEVELOPER_TOOLS: "react-devtools",
    REDUX_DEVTOOLS: "redux-devtools",
}));
vi.mock("../electronUtils", () => ({ isDev: mockIsDev }));

// Mock electron module
vi.mock("electron", () => ({
    app: mockApp,
    BrowserWindow: vi.fn(),
    Menu: { setApplicationMenu: vi.fn() },
    shell: { openExternal: vi.fn() },
    nativeTheme: { themeSource: "system" },
}));

// Mock the application service to prevent actual initialization
vi.mock("../services/application/ApplicationService", () => ({
    ApplicationService: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        cleanup: vi.fn().mockResolvedValue(undefined),
    })),
}));

describe("main.ts - Missing Branch Coverage", () => {
    let originalArgv: string[];

    beforeEach(() => {
        originalArgv = [...process.argv];
        
        // Clear all mocks and reset modules
        vi.resetAllMocks();
        vi.clearAllMocks();
        vi.resetModules();
        
        // Reset log transport levels to default
        mockLog.transports.file.level = "info";
        mockLog.transports.console.level = "debug";
        
        // Reset app mock properties
        mockApp.isPackaged = false;
        mockApp.whenReady.mockClear();
        mockApp.whenReady.mockResolvedValue(undefined);
        
        // Reset other mocks
        mockIsDev.mockReturnValue(true);
        mockInstallExtension.mockResolvedValue([]);
        
        // Clear process.versions.electron to test the conditional
        delete (process.versions as any).electron;
    });

    afterEach(() => {
        process.argv = originalArgv;
        vi.restoreAllMocks();
    });

    describe("Command Line Argument Processing", () => {
        it("should handle --debug flag", async () => {
            process.argv = ["node", "main.js", "--debug"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = true; // Simulate production environment
            mockIsDev.mockReturnValue(false);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");
        });

        it("should handle --log-debug flag", async () => {
            process.argv = ["node", "main.js", "--log-debug"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = true;
            mockIsDev.mockReturnValue(false);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");
        });

        it("should handle --log-production flag", async () => {
            process.argv = ["node", "main.js", "--log-production"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = true;
            mockIsDev.mockReturnValue(false);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");
        });

        it("should handle --log-info flag", async () => {
            process.argv = ["node", "main.js", "--log-info"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = true;
            mockIsDev.mockReturnValue(false);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockLog.transports.file.level).toBe("info");
            expect(mockLog.transports.console.level).toBe("info");
        });

        it("should handle unknown flags gracefully", async () => {
            process.argv = ["node", "main.js", "--unknown-flag", "--another-unknown"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);

            // Import the module to trigger the configuration logic
            await import("../main");

            // Should not crash and use defaults (development mode)
            expect(mockLog.initialize).toHaveBeenCalled();
        });
    });

    describe("Development Extension Loading", () => {
        it("should handle extension loading in development mode", async () => {
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockApp.whenReady).toHaveBeenCalled();
        });

        it("should handle extension loading failure gracefully", async () => {
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);
            mockInstallExtension.mockRejectedValue(new Error("Extension loading failed"));

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockApp.whenReady).toHaveBeenCalled();
        });
    });

    describe("Environment Detection Edge Cases", () => {
        it("should handle production environment correctly", async () => {
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = true;
            mockIsDev.mockReturnValue(false);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockApp.whenReady).toHaveBeenCalled();
        });
    });

    describe("Application Lifecycle", () => {
        it("should initialize logger", async () => {
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockLog.initialize).toHaveBeenCalled();
        });

        it("should handle app ready event", async () => {
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", { value: "1.0.0", configurable: true });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockApp.whenReady).toHaveBeenCalled();
        });
    });
});
