/**
 * Tests for main process command-line logging and startup lifecycle behavior.
 */

import { afterEach, beforeEach, describe, expect, it, test, vi } from "vitest";

// Shared mocks for main process startup branches.
const mockLog = {
    initialize: vi.fn(),
    transports: {
        file: {
            level: "info",
            fileName: "uptime-watcher-main.log",
            maxSize: 1024 ** 2 * 5,
            format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}",
        },
        console: {
            level: "debug",
            format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
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
const mockLogger = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
};

const mockDiagnosticsLogger = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

const originalElectronVersionDescriptor = Object.getOwnPropertyDescriptor(
    process.versions,
    "electron"
);

vi.mock("../utils/logger", () => ({
    logger: mockLogger,
    diagnosticsLogger: mockDiagnosticsLogger,
}));

vi.mock("electron-log/main", () => ({ default: mockLog }));
vi.mock("electron-debug", () => ({ default: vi.fn() }));
vi.mock("electron-devtools-installer", () => ({
    installExtension: mockInstallExtension,
    REACT_DEVELOPER_TOOLS: "react-devtools",
    REDUX_DEVTOOLS: "redux-devtools",
}));
vi.mock("../electronUtils", () => ({ isDev: mockIsDev }));

// Mock electron module
vi.mock("electron", () => {
    const mockElectron = {
        app: mockApp,
        BrowserWindow: vi.fn(),
        Menu: { setApplicationMenu: vi.fn() },
        shell: { openExternal: vi.fn() },
        nativeTheme: { themeSource: "system" },
    };

    // Support both named imports and default import
    return {
        default: mockElectron,
        ...mockElectron,
    };
});

// Mock the app service to prevent actual initialization
vi.mock("../services/application/ApplicationService", () => ({
    ApplicationService: vi.fn(function ApplicationServiceMock() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            cleanup: vi.fn().mockResolvedValue(undefined),
        };
    }),
}));

describe("main process CLI and lifecycle behavior", () => {
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
        Reflect.deleteProperty(process.versions, "electron");
    });
    afterEach(() => {
        process.argv = originalArgv;
        if (originalElectronVersionDescriptor) {
            Object.defineProperty(
                process.versions,
                "electron",
                originalElectronVersionDescriptor
            );
        } else {
            Reflect.deleteProperty(process.versions, "electron");
        }
        vi.restoreAllMocks();
    });
    describe("Command Line Argument Processing", () => {
        test.for([
            {
                argv: [
                    "node",
                    "main.js",
                    "--debug",
                ],
                consoleLevel: "debug",
                fileLevel: "debug",
                name: "should handle --debug flag",
            },
            {
                argv: [
                    "node",
                    "main.js",
                    "--log-debug",
                ],
                consoleLevel: "debug",
                fileLevel: "debug",
                name: "should handle --log-debug flag",
            },
            {
                argv: [
                    "node",
                    "main.js",
                    "--log-production",
                ],
                consoleLevel: "info",
                fileLevel: "warn",
                name: "should handle --log-production flag",
            },
            {
                argv: [
                    "node",
                    "main.js",
                    "--log-info",
                ],
                consoleLevel: "info",
                fileLevel: "info",
                name: "should handle --log-info flag",
            },
        ])(
            "$name",
            { timeout: 60_000 },
            async ({ argv, consoleLevel, fileLevel }, { task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: main.cli-lifecycle", "component");
                await annotate("Category: Core", "category");
                await annotate("Type: Business Logic", "type");

                vi.resetModules();
                process.argv = argv;
                Object.defineProperty(process.versions, "electron", {
                    value: "1.0.0",
                    configurable: true,
                });
                mockApp.isPackaged = true;
                mockIsDev.mockReturnValue(false);

                await import("../main");

                expect(mockLog.transports.file.level).toBe(fileLevel);
                expect(mockLog.transports.console.level).toBe(consoleLevel);
            }
        );
        it("should handle unknown flags gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main.cli-lifecycle", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            process.argv = [
                "node",
                "main.js",
                "--unknown-flag",
                "--another-unknown",
            ];
            Object.defineProperty(process.versions, "electron", {
                value: "1.0.0",
                configurable: true,
            });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);

            // Import the module to trigger the configuration logic
            await import("../main");

            // Should not crash and use defaults (development mode)
            expect(mockLog.initialize).toHaveBeenCalled();
        });
    });
    describe("Development Extension Loading", () => {
        it("should handle extension loading in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main.cli-lifecycle", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            vi.resetModules();
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", {
                value: "1.0.0",
                configurable: true,
            });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockApp.whenReady).toHaveBeenCalled();
        });
        it("should handle extension loading failure gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main.cli-lifecycle", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.resetModules();
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", {
                value: "1.0.0",
                configurable: true,
            });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);
            mockInstallExtension.mockRejectedValue(
                new Error("Extension loading failed")
            );

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockApp.whenReady).toHaveBeenCalled();
        });
    });
    describe("Environment Detection Edge Cases", () => {
        it("should handle production environment correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main.cli-lifecycle", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", {
                value: "1.0.0",
                configurable: true,
            });
            mockApp.isPackaged = true;
            mockIsDev.mockReturnValue(false);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockApp.whenReady).toHaveBeenCalled();
        });
    });
    describe("Application Lifecycle", () => {
        it("should initialize logger", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main.cli-lifecycle", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            vi.resetModules();
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", {
                value: "1.0.0",
                configurable: true,
            });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockLog.initialize).toHaveBeenCalled();
        });
        it("should handle app ready event", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main.cli-lifecycle", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Event Processing", "type");

            vi.resetModules();
            process.argv = ["node", "main.js"];
            Object.defineProperty(process.versions, "electron", {
                value: "1.0.0",
                configurable: true,
            });
            mockApp.isPackaged = false;
            mockIsDev.mockReturnValue(true);

            // Import the module to trigger the configuration logic
            await import("../main");

            expect(mockApp.whenReady).toHaveBeenCalled();
        });
    });
});
