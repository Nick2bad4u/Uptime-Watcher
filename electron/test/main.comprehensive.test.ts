/**
 * Comprehensive tests for main.ts - Electron main process entry point These
 * tests cover app initialization, logging configuration, and cleanup
 */

import type {
    BrowserWindow,
    Event as ElectronEvent,
    RenderProcessGoneDetails,
    WebContents,
} from "electron";

import { mockConstructableReturnValue } from "@shared/test/helpers/vitestConstructors";
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    type MockInstance,
    vi,
} from "vitest";

import type { ApplicationService as ApplicationServiceType } from "../services/application/ApplicationService";

// ========================================
// MOCK ALL DEPENDENCIES BEFORE MAIN.TS IMPORT
// ========================================

// Mock electron-log before importing
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
const createApplicationServiceMock = () => ({
    cleanup: vi.fn<ApplicationServiceType["cleanup"]>(),
});

const mockApplicationService = createApplicationServiceMock();

vi.mock("../services/application/ApplicationService", () => ({
    ApplicationService: vi.fn(function ApplicationServiceMock() {
        return mockApplicationService;
    }),
}));

// Mock logger
const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
};

const mockDiagnosticsLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
};

vi.mock("../utils/logger", () => ({
    logger: mockLogger,
    diagnosticsLogger: mockDiagnosticsLogger,
}));

// Mock electronUtils
const mockIsDev = vi.fn();
vi.mock("../electronUtils", () => ({
    isDev: mockIsDev,
}));

// Create comprehensive electron mock
type AppLifecycleHandler = (...args: readonly unknown[]) => void;

const createAppMock = () => ({
    exit: vi.fn<(exitCode?: number) => void>(),
    isPackaged: false,
    off: vi.fn<(eventName: string, handler: AppLifecycleHandler) => void>(),
    on: vi.fn<(eventName: string, handler: AppLifecycleHandler) => void>(),
    quit: vi.fn<() => void>(),
    whenReady: vi.fn<() => Promise<void>>(() => Promise.resolve()),
});

const mockApp = createAppMock();

type BrowserWindowConstructor = typeof import("electron").BrowserWindow;

const createBrowserWindowConstructorMock = () =>
    Object.assign(vi.fn(), {
        fromWebContents: vi.fn<BrowserWindowConstructor["fromWebContents"]>(),
    }) satisfies Pick<BrowserWindowConstructor, "fromWebContents">;

const mockBrowserWindow = createBrowserWindowConstructorMock();

const createElectronEvent = (): ElectronEvent =>
    ({
        defaultPrevented: false,
        preventDefault: vi.fn(),
    }) as ElectronEvent;

const createWebContentsMock = (id: number, url: string): WebContents =>
    ({
        getURL: vi.fn(() => url),
        id,
    }) as unknown as WebContents;

const createBrowserWindowReference = (id: number): BrowserWindow =>
    ({ id }) as unknown as BrowserWindow;

function getRegisteredAppHandler(
    eventName: "browser-window-created"
): (event: ElectronEvent, window: BrowserWindow) => void;
function getRegisteredAppHandler(
    eventName: "render-process-gone"
): (
    event: ElectronEvent,
    webContents: WebContents,
    details: RenderProcessGoneDetails
) => void;
function getRegisteredAppHandler(
    eventName: "will-quit"
): (event: ElectronEvent) => void;

function getRegisteredAppHandler(eventName: string): AppLifecycleHandler {
    const calls: readonly (readonly unknown[])[] = vi.mocked(mockApp.on).mock
        .calls;
    const handler = calls.find((call) => call[0] === eventName)?.[1];

    if (typeof handler !== "function") {
        throw new TypeError(
            `No handler registered for app event '${eventName}'`
        );
    }

    return (...args) => {
        Reflect.apply(handler, mockApp, args);
    };
}

async function waitForAppReadyCall(): Promise<void> {
    const result = vi.mocked(mockApp.whenReady).mock.results[0];
    const value: unknown = result?.value;

    if (!(value instanceof Promise)) {
        throw new TypeError("app.whenReady did not return a Promise");
    }

    await value;
}

// Mock electron with both named exports and default export
vi.mock("electron", () => {
    const mockElectron = {
        app: mockApp,
        BrowserWindow: mockBrowserWindow,
    };

    // Support both named imports and default import
    return {
        ...mockElectron,
        default: mockElectron,
    };
});

// Mock electron-debug
vi.mock("electron-debug", () => ({
    default: vi.fn(),
}));

describe("main.ts - Electron Main Process", () => {
    let originalArgv: string[];
    let originalVersions: NodeJS.ProcessVersions;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        originalArgv = process.argv;
        originalVersions = process.versions;

        // Reset mock log levels to defaults
        mockLog.transports.file.level = "info";
        mockLog.transports.console.level = "debug";

        // Reset mocks to default states
        mockIsDev.mockReturnValue(true);
        Reflect.set(mockApp, "isPackaged", false);
        mockApp.exit.mockReset();
        mockApp.quit.mockReset();
        vi.mocked(mockBrowserWindow.fromWebContents).mockReturnValue(
            createBrowserWindowReference(456)
        );
        mockInstallExtension.mockResolvedValue([
            { name: "React Developer Tools" },
            { name: "Redux DevTools" },
        ]);
        Reflect.set(
            mockApplicationService,
            "cleanup",
            createApplicationServiceMock().cleanup
        );
        mockApplicationService.cleanup.mockResolvedValue(undefined);

        // Set up process.versions.electron to indicate we're in Electron
        Object.defineProperty(process, "versions", {
            value: { ...originalVersions, electron: "25.0.0" },
            writable: true,
        });
    });
    afterEach(() => {
        process.argv = originalArgv;
        Object.defineProperty(process, "versions", {
            value: originalVersions,
            writable: true,
        });
        vi.resetModules();
    });
    describe("Logging Configuration", () => {
        it("should configure debug logging when --debug flag is present", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            process.argv = [
                "node",
                "main.js",
                "--debug",
            ];

            // Reset the module cache and import main.ts with new argv
            vi.resetModules();
            await import("../main");

            expect(mockLog.initialize).toHaveBeenCalledWith({ preload: true });
            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");
        }, 60_000);
        it("should configure production logging when --log-production flag is present", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            process.argv = [
                "node",
                "main.js",
                "--log-production",
            ];

            vi.resetModules();
            await import("../main");

            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");
        }, 60_000);
        it("should configure info logging when --log-info flag is present", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            process.argv = [
                "node",
                "main.js",
                "--log-info",
            ];

            vi.resetModules();
            await import("../main");

            expect(mockLog.transports.file.level).toBe("info");
            expect(mockLog.transports.console.level).toBe("info");
        });
        it("should use default development logging when no flags are present", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            process.argv = ["node", "main.js"];
            Reflect.set(mockApp, "isPackaged", false);

            vi.resetModules();
            await import("../main");

            expect(mockLog.transports.file.level).toBe("info");
            expect(mockLog.transports.console.level).toBe("debug");
        });
        it("should use default production logging when packaged", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            process.argv = ["node", "main.js"];
            Reflect.set(mockApp, "isPackaged", true);

            vi.resetModules();
            await import("../main");

            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");
        });
        it("should handle --log-prod flag as alias for --log-production", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            process.argv = [
                "node",
                "main.js",
                "--log-prod",
            ];

            vi.resetModules();
            await import("../main");

            expect(mockLog.transports.file.level).toBe("warn");
            expect(mockLog.transports.console.level).toBe("info");
        });
        it("should handle --log-debug flag as alias for --debug", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            process.argv = [
                "node",
                "main.js",
                "--log-debug",
            ];

            vi.resetModules();
            await import("../main");

            expect(mockLog.transports.file.level).toBe("debug");
            expect(mockLog.transports.console.level).toBe("debug");
        });
    });
    describe("Main Class Initialization", () => {
        it("should create ApplicationService instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const { ApplicationService } =
                await import("../services/application/ApplicationService");

            vi.resetModules();
            await import("../main");

            expect(ApplicationService).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Starting Uptime Watcher application"
            );
        });
        it("should set up process cleanup handlers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const processOnSpy = vi.spyOn(process, "on");

            vi.resetModules();
            await import("../main");

            expect(processOnSpy).toHaveBeenCalledWith(
                "beforeExit",
                expect.any(Function)
            );
            expect(mockApp.on).toHaveBeenCalledWith(
                "will-quit",
                expect.any(Function)
            );
        });
        it("should redact URLs from Electron lifecycle logs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Security", "type");

            vi.resetModules();
            await import("../main");

            const renderProcessGoneHandler = getRegisteredAppHandler(
                "render-process-gone"
            );
            const browserWindowCreatedHandler = getRegisteredAppHandler(
                "browser-window-created"
            );
            const webContents = createWebContentsMock(
                123,
                "https://user:password@example.com/private?token=secret#hash"
            );

            renderProcessGoneHandler(createElectronEvent(), webContents, {
                exitCode: 1,
                reason: "crashed",
            });

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[Main] Renderer process gone",
                expect.objectContaining({
                    url: "https://example.com/private",
                    webContentsId: 123,
                    windowId: 456,
                })
            );

            const windowHandlers = new Map<string, () => void>();
            const window = {
                id: 789,
                off: vi.fn(),
                on: vi.fn((eventName: string, handler: () => void) => {
                    windowHandlers.set(eventName, handler);
                    return window;
                }),
                once: vi.fn(),
                webContents: {
                    getURL: vi.fn(
                        () =>
                            "https://example.com/dashboard?session=secret#section"
                    ),
                },
            } as unknown as BrowserWindow;

            browserWindowCreatedHandler(createElectronEvent(), window);
            windowHandlers.get("unresponsive")?.();
            windowHandlers.get("responsive")?.();

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[Main] BrowserWindow became unresponsive",
                {
                    url: "https://example.com/dashboard",
                    windowId: 789,
                }
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[Main] BrowserWindow became responsive",
                {
                    url: "https://example.com/dashboard",
                    windowId: 789,
                }
            );
        });
        it("should delay re-quitting until one cleanup completes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Event Processing", "type");

            const order: string[] = [];
            let resolveCleanup!: () => void;
            mockApplicationService.cleanup.mockImplementationOnce(
                () =>
                    new Promise<void>((resolve) => {
                        order.push("cleanup");
                        resolveCleanup = resolve;
                    })
            );

            await import("../main");

            const willQuitHandler = getRegisteredAppHandler("will-quit");
            const initialQuitEvent = {
                defaultPrevented: false,
                preventDefault: vi.fn(() => {
                    order.push("preventDefault");
                }),
            } as ElectronEvent;
            const repeatedQuitEvent = createElectronEvent();
            const reentrantQuitEvent = createElectronEvent();

            mockApp.quit.mockImplementationOnce(() => {
                order.push("quit");
                willQuitHandler(reentrantQuitEvent);
            });

            willQuitHandler(initialQuitEvent);
            willQuitHandler(repeatedQuitEvent);

            expect(initialQuitEvent.preventDefault).toHaveBeenCalledOnce();
            expect(repeatedQuitEvent.preventDefault).toHaveBeenCalledOnce();
            expect(mockApplicationService.cleanup).toHaveBeenCalledOnce();
            expect(mockApp.quit).not.toHaveBeenCalled();
            expect(order).toStrictEqual(["preventDefault", "cleanup"]);

            resolveCleanup();

            await vi.waitFor(() => {
                expect(mockApp.quit).toHaveBeenCalledOnce();
            });

            expect(order).toStrictEqual([
                "preventDefault",
                "cleanup",
                "quit",
            ]);
            expect(reentrantQuitEvent.preventDefault).not.toHaveBeenCalled();
            expect(mockApplicationService.cleanup).toHaveBeenCalledOnce();
        });
        it("should resume quitting when normal cleanup rejects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const cleanupError = new Error("Cleanup failed");
            mockApplicationService.cleanup.mockRejectedValueOnce(cleanupError);

            await import("../main");

            const willQuitHandler = getRegisteredAppHandler("will-quit");
            const event = createElectronEvent();

            willQuitHandler(event);

            await vi.waitFor(() => {
                expect(mockApp.quit).toHaveBeenCalledOnce();
            });

            expect(event.preventDefault).toHaveBeenCalledOnce();
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[Main] App quit cleanup failed",
                cleanupError
            );
        });
        it("should bound normal cleanup before resuming quit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            mockApplicationService.cleanup.mockImplementationOnce(
                () => new Promise<void>(() => {})
            );

            await import("../main");
            vi.useFakeTimers();

            try {
                const willQuitHandler = getRegisteredAppHandler("will-quit");
                const event = createElectronEvent();

                willQuitHandler(event);

                expect(event.preventDefault).toHaveBeenCalledOnce();
                expect(mockApp.quit).not.toHaveBeenCalled();

                await vi.advanceTimersByTimeAsync(5000);

                expect(mockApp.quit).toHaveBeenCalledOnce();
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[Main] App quit cleanup failed",
                    expect.objectContaining({
                        message: "App cleanup timed out after 5000ms",
                    })
                );
            } finally {
                vi.useRealTimers();
            }
        });
        it("should only cleanup once when process and app shutdown overlap", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Event Processing", "type");

            const processOnSpy = vi.spyOn(process, "on");

            await import("../main");

            const beforeExitHandler = processOnSpy.mock.calls.find(
                (call) => call[0] === "beforeExit"
            )?.[1];
            const willQuitHandler = getRegisteredAppHandler("will-quit");

            expect(beforeExitHandler).toBeDefined();
            expect(willQuitHandler).toBeDefined();

            if (beforeExitHandler) {
                beforeExitHandler();
                beforeExitHandler();
            }
            willQuitHandler(createElectronEvent());

            await vi.waitFor(() => {
                expect(mockApp.quit).toHaveBeenCalledOnce();
            });

            expect(mockApplicationService.cleanup).toHaveBeenCalledTimes(1);
        });
        it("should handle cleanup errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.resetModules();
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
                expect(() => {
                    beforeExitHandler();
                }).not.toThrow();

                // Give some time for the async cleanup to run and error handling to complete
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[Main] Cleanup failed",
                expect.any(Error)
            );
        });
    });
    describe("DevTools Extension Installation", () => {
        it("should install devtools extensions in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            mockIsDev.mockReturnValue(true);

            await import("../main");

            // Wait for whenReady to be called and resolved
            expect(mockApp.whenReady).toHaveBeenCalled();

            // Manually trigger the whenReady promise resolution
            await waitForAppReadyCall();

            // Wait for the additional setTimeout delay (1ms) that happens after whenReady
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 10); // Use 10ms to be safe
            });

            expect(mockInstallExtension).toHaveBeenCalledWith(
                [
                    REDUX_DEVTOOLS,
                    REACT_DEVELOPER_TOOLS,
                    "jambeljnbnfbkcpnoiaedcabbgmnnlcd",
                ],
                {
                    loadExtensionOptions: { allowFileAccess: true },
                }
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[Main] Added Extensions: React Developer Tools, Redux DevTools"
            );
        });
        it("should not install extensions in production mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            mockIsDev.mockReturnValue(false);

            await import("../main");

            // Wait for whenReady to be called and resolved
            await waitForAppReadyCall();

            expect(mockInstallExtension).not.toHaveBeenCalled();
        });
        it("should handle extension installation failures gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.resetModules();
            mockIsDev.mockReturnValue(true);
            mockInstallExtension.mockRejectedValue(
                new Error("Extension installation failed")
            );

            await import("../main");

            await waitForAppReadyCall();

            // Wait for the setTimeout(resolve, 1) and extension installation code to complete
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[Main] Failed to install dev extensions (this is normal in production)",
                expect.any(Error)
            );
        });
        it("should wait for timing before installing extensions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            mockIsDev.mockReturnValue(true);
            const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

            await import("../main");

            await waitForAppReadyCall();

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1);
        });
    });
    describe("Electron Environment Detection", () => {
        it("should only initialize when in Electron environment", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            vi.resetModules();
            // Test with Electron environment
            Object.defineProperty(process, "versions", {
                value: { ...originalVersions, electron: "25.0.0" },
                writable: true,
            });
            const { ApplicationService } =
                await import("../services/application/ApplicationService");

            await import("../main");

            expect(ApplicationService).toHaveBeenCalled();
        });
        it("should not initialize when not in Electron environment", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            vi.resetModules();
            // Test without Electron environment
            Object.defineProperty(process, "versions", {
                value: { ...originalVersions },
                writable: true,
            });
            Reflect.deleteProperty(process.versions, "electron");

            const { ApplicationService } =
                await import("../services/application/ApplicationService");

            await import("../main");

            expect(ApplicationService).not.toHaveBeenCalled();
        });
    });
    describe("Main Class Edge Cases", () => {
        it("should handle missing cleanup method gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            Reflect.set(mockApplicationService, "cleanup", undefined);
            const processOnSpy = vi.spyOn(process, "on");

            await import("../main");

            const beforeExitHandler = processOnSpy.mock.calls.find(
                (call) => call[0] === "beforeExit"
            )?.[1];

            // Should not throw when cleanup method is missing
            expect(() => {
                if (beforeExitHandler) beforeExitHandler();
            }).not.toThrow();
        });
        it("should handle null applicationService gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            const { ApplicationService } =
                await import("../services/application/ApplicationService");

            // IMPORTANT: ApplicationService is instantiated with `new`.
            // `mockReturnValue` uses a non-constructable arrow implementation.
            // We use a constructable function implementation instead.
            mockConstructableReturnValue(
                vi.mocked(ApplicationService) as unknown as MockInstance<
                    () => ApplicationServiceType
                >,
                {} as unknown as ApplicationServiceType
            );

            const processOnSpy = vi.spyOn(process, "on");

            await import("../main");

            const beforeExitHandler = processOnSpy.mock.calls.find(
                (call) => call[0] === "beforeExit"
            )?.[1];

            // Should not throw when applicationService is null
            expect(() => {
                if (beforeExitHandler) beforeExitHandler();
            }).not.toThrow();

            // Restore default implementation for subsequent tests
            mockConstructableReturnValue(
                vi.mocked(ApplicationService) as unknown as MockInstance<
                    () => ApplicationServiceType
                >,
                mockApplicationService as unknown as ApplicationServiceType
            );
        });
    });
    describe("Log Transport Configuration", () => {
        it("should configure file transport correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            await import("../main");

            expect(mockLog.transports.file.fileName).toBe(
                "uptime-watcher-main.log"
            );
            expect(mockLog.transports.file.maxSize).toBe(1024 ** 2 * 5);
            expect(mockLog.transports.file.format).toBe(
                "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}"
            );
        });
        it("should configure console transport correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: main", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.resetModules();
            await import("../main");

            expect(mockLog.transports.console.format).toBe(
                "[{h}:{i}:{s}.{ms}] [{level}] {text}"
            );
        });
    });
});
