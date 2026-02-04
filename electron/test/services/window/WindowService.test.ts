/**
 * Tests all functionality of the WindowService class including window creation,
 * content loading, event handling, and environment-specific behavior.
 *
 * @module WindowService.test
 *
 * @file Comprehensive tests for WindowService
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock electron module first
vi.mock("electron", () => {
    // Create a single mock browser window that can be reused
    const mockWindow = {
        close: vi.fn(),
        isDestroyed: vi.fn(() => false),
        loadFile: vi.fn().mockResolvedValue(undefined),
        loadURL: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        once: vi.fn(),
        removeListener: vi.fn(),
        show: vi.fn(),
        webContents: {
            on: vi.fn(),
            once: vi.fn(),
            openDevTools: vi.fn(),
            removeListener: vi.fn(),
            send: vi.fn(),
            setWindowOpenHandler: vi.fn(),
            session: {
                setPermissionCheckHandler: vi.fn(),
                setPermissionRequestHandler: vi.fn(),
                webRequest: {
                    onHeadersReceived: vi.fn(),
                },
            },
        },
    };

    const MockBrowserWindow = vi.fn(function MockBrowserWindowMock() {
        return mockWindow;
    }) as any;
    MockBrowserWindow.getAllWindows = vi.fn();
    MockBrowserWindow.__mockWindow = mockWindow;

    return {
        BrowserWindow: MockBrowserWindow,
        shell: {
            openExternal: vi.fn().mockResolvedValue(undefined),
        },
    };
});

// Mock logger
vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    });
    return {
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

// Mock electronUtils
vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(),
}));

// Mock shared utils
vi.mock("../../../../shared/utils/environment", async () => {
    const actual = await vi.importActual<
        typeof import("../../../../shared/utils/environment")
    >("../../../../shared/utils/environment");

    return {
        ...actual,
        // Override the environment classifier for deterministic tests.
        getNodeEnv: vi.fn(() => "test"),
    };
});

// Mock node modules
// NOTE: Do not mock node:path/node:url here.
// WindowService relies on real path and file URL behaviour for production
// navigation hardening (e.g., path.resolve + fileURLToPath).

// Mock global fetch for Vite server checking
globalThis.fetch = vi.fn();

import { BrowserWindow, shell } from "electron";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { WindowService } from "../../../services/window/WindowService";

describe(WindowService, () => {
    let windowService: WindowService;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock returns
        vi.mocked(isDev).mockReturnValue(false);
        vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([]);

        const mockWindowRef = (
            BrowserWindow as unknown as { __mockWindow: any }
        ).__mockWindow;
        vi.mocked(mockWindowRef.isDestroyed).mockReturnValue(false);
        vi.mocked(mockWindowRef.removeListener).mockImplementation(() => {
            // noop for cleanup assertions
        });
        vi.mocked(mockWindowRef.webContents.removeListener).mockImplementation(
            () => {
                // noop for cleanup assertions
            }
        );
        vi.mocked(
            mockWindowRef.webContents.session.webRequest.onHeadersReceived
        ).mockImplementation(() => {
            // Default noop
        });
        vi.mocked(mockWindowRef.webContents.openDevTools).mockReturnValue(
            undefined
        );

        // Create new service instance
        windowService = new WindowService();
    });

    describe("constructor", () => {
        it("should create a new WindowService instance", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(windowService).toBeInstanceOf(WindowService);
        });

        it("should log debug message in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(isDev).mockReturnValue(true);

            new WindowService();

            expect(logger.debug).toHaveBeenCalledWith(
                "[WindowService] Created WindowService in development mode"
            );
        });

        it("should not log debug message in production mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(isDev).mockReturnValue(false);

            new WindowService();

            expect(logger.debug).not.toHaveBeenCalledWith(
                "[WindowService] Created WindowService in development mode"
            );
        });
    });

    describe("createMainWindow", () => {
        it("should create a new BrowserWindow with correct configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const window = windowService.createMainWindow();

            expect(
                window.webContents.session.setPermissionCheckHandler
            ).toHaveBeenCalledWith(expect.any(Function));
            expect(
                window.webContents.session.setPermissionRequestHandler
            ).toHaveBeenCalledWith(expect.any(Function));

            expect(BrowserWindow).toHaveBeenCalledWith({
                height: 800,
                minHeight: 600,
                minWidth: 800,
                show: false,
                titleBarStyle: "default",
                webPreferences: {
                    contextIsolation: true,
                    nodeIntegration: false,
                    nodeIntegrationInSubFrames: false,
                    nodeIntegrationInWorker: false,
                    preload: expect.any(String),
                    sandbox: true,
                    webSecurity: true,
                    webviewTag: false,
                    allowRunningInsecureContent: false,
                },
                width: 1200,
            });

            expect(window).toBeDefined();
        });

        it("should setup window events", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const window = windowService.createMainWindow();

            expect(window.once).toHaveBeenCalledWith(
                "ready-to-show",
                expect.any(Function)
            );
            expect(window.webContents.once).toHaveBeenCalledWith(
                "dom-ready",
                expect.any(Function)
            );
            expect(window.webContents.once).toHaveBeenCalledWith(
                "did-finish-load",
                expect.any(Function)
            );
            expect(window.webContents.on).toHaveBeenCalledWith(
                "did-fail-load",
                expect.any(Function)
            );
            expect(window.webContents.on).toHaveBeenCalledWith(
                "will-navigate",
                expect.any(Function)
            );
            expect(window.webContents.on).toHaveBeenCalledWith(
                "will-redirect",
                expect.any(Function)
            );
            expect(window.webContents.on).toHaveBeenCalledWith(
                "will-attach-webview",
                expect.any(Function)
            );
            expect(
                window.webContents.setWindowOpenHandler
            ).toHaveBeenCalledWith(expect.any(Function));
            expect(window.on).toHaveBeenCalledWith(
                "closed",
                expect.any(Function)
            );
        });

        it("should return the created window", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const window = windowService.createMainWindow();
            expect(window).toBeDefined();
        });

        it("should be idempotent and reuse the existing main window", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const window1 = windowService.createMainWindow();
            const window2 = windowService.createMainWindow();

            expect(window2).toBe(window1);
            // BrowserWindow constructor should only be called once.
            expect(BrowserWindow).toHaveBeenCalledTimes(1);
        });
    });

    describe("getMainWindow", () => {
        it("should return null when no window is created", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(windowService.getMainWindow()).toBeNull();
        });

        it("should return the main window when created", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const window = windowService.createMainWindow();
            expect(windowService.getMainWindow()).toBe(window);
        });
    });

    describe("hasMainWindow", () => {
        it("should return false when no window is created", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(windowService.hasMainWindow()).toBeFalsy();
        });

        it("should return true when window exists and is not destroyed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const window = windowService.createMainWindow();
            vi.mocked(window.isDestroyed).mockReturnValue(false);

            expect(windowService.hasMainWindow()).toBeTruthy();
        });

        it("should return false when window is destroyed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const window = windowService.createMainWindow();
            vi.mocked(window.isDestroyed).mockReturnValue(true);

            expect(windowService.hasMainWindow()).toBeFalsy();
        });
    });

    describe("closeMainWindow", () => {
        it("should close the main window if it exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const window = windowService.createMainWindow();
            vi.mocked(window.isDestroyed).mockReturnValue(false);

            windowService.closeMainWindow();

            expect(window.close).toHaveBeenCalled();
        });

        it("should not throw if no window exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => windowService.closeMainWindow()).not.toThrowError();
        });

        it("should not close if window is destroyed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const window = windowService.createMainWindow();
            vi.mocked(window.isDestroyed).mockReturnValue(true);

            windowService.closeMainWindow();

            expect(window.close).not.toHaveBeenCalled();
        });
    });

    describe("navigation hardening", () => {
        it("prevents disallowed will-navigate and opens safe URLs externally", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(false);

            const window = windowService.createMainWindow();

            const onCalls = vi.mocked(window.webContents.on).mock
                .calls as unknown as [
                string,
                (event: any, url: string) => void,
            ][];
            const willNavigateHandler = onCalls.find(
                ([eventName]) => eventName === "will-navigate"
            )?.[1];

            expect(willNavigateHandler).toBeTypeOf("function");

            const event = {
                preventDefault: vi.fn(),
            };

            willNavigateHandler?.(event, "https://example.com");

            // Allow promise chain to flush
            await Promise.resolve();

            expect(event.preventDefault).toHaveBeenCalledTimes(1);

            expect(shell.openExternal).toHaveBeenCalledWith(
                "https://example.com"
            );
        });

        it("blocks file:// navigations outside the packaged renderer bundle", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(false);

            const window = windowService.createMainWindow();

            const onCalls = vi.mocked(window.webContents.on).mock
                .calls as unknown as [
                string,
                (event: any, url: string) => void,
            ][];
            const willNavigateHandler = onCalls.find(
                ([eventName]) => eventName === "will-navigate"
            )?.[1];

            expect(willNavigateHandler).toBeTypeOf("function");

            const event = {
                preventDefault: vi.fn(),
            };

            willNavigateHandler?.(event, "file:///etc/passwd");

            await Promise.resolve();

            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(shell.openExternal).not.toHaveBeenCalled();
        });

        it("prevents disallowed will-redirect and opens safe URLs externally", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(false);

            const window = windowService.createMainWindow();

            const onCalls = vi.mocked(window.webContents.on).mock
                .calls as unknown as [
                string,
                (event: any, url: string) => void,
            ][];
            const willRedirectHandler = onCalls.find(
                ([eventName]) => eventName === "will-redirect"
            )?.[1];

            expect(willRedirectHandler).toBeTypeOf("function");

            const event = {
                preventDefault: vi.fn(),
            };

            willRedirectHandler?.(event, "https://example.com/redirect");

            await Promise.resolve();

            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(shell.openExternal).toHaveBeenCalledWith(
                "https://example.com/redirect"
            );
        });
    });

    describe("getAllWindows", () => {
        it("should return all browser windows", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockWindows = [vi.fn(), vi.fn()];
            vi.mocked(BrowserWindow.getAllWindows).mockReturnValue(
                mockWindows as unknown as BrowserWindow[]
            );

            const windows = windowService.getAllWindows();

            expect(windows).toBe(mockWindows);
            expect(BrowserWindow.getAllWindows).toHaveBeenCalled();
        });
    });

    describe("window events", () => {
        it("should handle ready-to-show event", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const window = windowService.createMainWindow();

            // Get the callback and call it
            const readyCallback = (
                vi.mocked(window.once).mock.calls as any[]
            ).find(
                (call: any) => call[0] === "ready-to-show"
            )?.[1] as () => void;

            expect(readyCallback).toBeDefined();
            readyCallback();

            expect(logger.info).toHaveBeenCalledWith(
                "[WindowService] Main window ready to show"
            );
            expect(window.show).toHaveBeenCalled();
        });

        it("should avoid showing the window when headless flags are set", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const originalHeadless = process.env["HEADLESS"];
            process.env["HEADLESS"] = "true";

            const window = windowService.createMainWindow();
            const readyCallback = (
                vi.mocked(window.once).mock.calls as any[]
            ).find(
                (call: any) => call[0] === "ready-to-show"
            )?.[1] as () => void;

            expect(readyCallback).toBeDefined();
            readyCallback();

            expect(logger.info).toHaveBeenCalledWith(
                "[WindowService] Running in headless mode - window will not be shown"
            );
            expect(window.show).not.toHaveBeenCalled();

            if (originalHeadless === undefined) {
                delete process.env["HEADLESS"];
            } else {
                process.env["HEADLESS"] = originalHeadless;
            }
        });

        it("should handle dom-ready event", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const window = windowService.createMainWindow();

            // Get the callback and call it
            const domReadyCallback = (
                vi.mocked(window.webContents.once).mock.calls as any[]
            ).find((call: any) => call[0] === "dom-ready")?.[1] as () => void;

            expect(domReadyCallback).toBeDefined();
            domReadyCallback();

            expect(logger.debug).toHaveBeenCalledWith(
                "[WindowService] DOM ready in renderer"
            );
        });

        it("should handle did-finish-load event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Loading", "type");

            const window = windowService.createMainWindow();

            // Get the callback and call it
            const finishLoadCallback = (
                vi.mocked(window.webContents.once).mock.calls as any[]
            ).find(
                (call: any) => call[0] === "did-finish-load"
            )?.[1] as () => void;

            expect(finishLoadCallback).toBeDefined();
            finishLoadCallback();

            expect(logger.debug).toHaveBeenCalledWith(
                "[WindowService] Renderer finished loading"
            );
        });

        it("should handle did-fail-load event", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const window = windowService.createMainWindow();

            // Get the callback and call it
            const failLoadCallback = (
                vi.mocked(window.webContents.on).mock.calls as any[]
            ).find((call: any) => call[0] === "did-fail-load")?.[1] as (
                event: any,
                errorCode: number,
                errorDescription: string
            ) => void;

            expect(failLoadCallback).toBeDefined();
            failLoadCallback(null, 404, "Not Found");

            expect(logger.error).toHaveBeenCalledWith(
                "[WindowService] Failed to load renderer: 404 - Not Found"
            );
        });

        it("should handle closed event", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const window = windowService.createMainWindow();
            expect(windowService.getMainWindow()).toBe(window);

            // Get the callback and call it
            const closedCallback = (
                vi.mocked(window.on).mock.calls as any[]
            ).find((call: any) => call[0] === "closed")?.[1] as () => void;

            expect(closedCallback).toBeDefined();
            closedCallback();

            expect(logger.info).toHaveBeenCalledWith(
                "[WindowService] Main window closed"
            );
            expect(windowService.getMainWindow()).toBeNull();
        });
    });

    describe("content loading", () => {
        describe("production mode", () => {
            beforeEach(() => {
                vi.mocked(isDev).mockReturnValue(false);
            });

            it("should load from file in production mode", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Data Loading", "type");

                windowService.createMainWindow();

                expect(logger.debug).toHaveBeenCalledWith(
                    "[WindowService] Production mode: loading from dist"
                );
            });

            it("should handle file loading errors in production", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const window = windowService.createMainWindow();
                const error = new Error("File not found");
                vi.mocked(window.loadFile).mockRejectedValue(error);

                // Trigger the content loading
                await (windowService as any).loadContent();

                // Allow the asynchronous withErrorHandling call to complete
                await new Promise((resolve) => setTimeout(resolve, 0));

                expect(logger.error).toHaveBeenCalledWith(
                    "Failed to loadProductionContent",
                    expect.objectContaining({ message: "File not found" })
                );
            });
        });

        describe("development mode", () => {
            beforeEach(() => {
                vi.mocked(isDev).mockReturnValue(true);
                vi.mocked(globalThis.fetch).mockResolvedValue({
                    ok: true,
                } as Response);
            });

            it("should load from Vite server in development mode", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Data Loading", "type");

                windowService.createMainWindow();

                expect(logger.debug).toHaveBeenCalledWith(
                    "[WindowService] Development mode: waiting for Vite dev server"
                );
            });

            it("should wait for Vite server to be ready", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const window = windowService.createMainWindow();
                vi.mocked(window.isDestroyed).mockReturnValue(false);

                await (
                    windowService as unknown as {
                        loadDevelopmentContent: () => Promise<void>;
                    }
                ).loadDevelopmentContent();

                expect(globalThis.fetch).toHaveBeenCalledWith(
                    "http://localhost:5173",
                    expect.objectContaining({
                        signal: expect.any(AbortSignal),
                    })
                );

                await annotate("Type: Data Loading", "type");

                expect(window.loadURL).toHaveBeenCalledWith(
                    "http://localhost:5173"
                );
            });

            it("should handle Vite server connection errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                vi.mocked(isDev).mockReturnValue(true);
                const error = new Error("Connection refused");
                vi.mocked(globalThis.fetch).mockRejectedValue(error);

                // Create a new service just for this test to avoid affecting others
                const testWindowService = new WindowService();

                // Mock waitForViteServer to fail immediately
                const waitForViteServerSpy = vi
                    .spyOn(testWindowService as any, "waitForViteServer")
                    .mockRejectedValue(
                        new Error(
                            "Vite dev server did not become available after 20 attempts"
                        )
                    );

                testWindowService.createMainWindow();

                // Directly call loadDevelopmentContent to catch errors
                await expect(
                    (testWindowService as any).loadDevelopmentContent()
                ).rejects.toThrowError();

                expect(waitForViteServerSpy).toHaveBeenCalled();
                expect(logger.error).toHaveBeenCalledWith(
                    "Failed to loadDevelopmentContent",
                    expect.objectContaining({
                        message:
                            "Vite dev server did not become available after 20 attempts",
                    })
                );
            });

            it("should handle window destruction during Vite wait", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                vi.mocked(isDev).mockReturnValue(true);

                // Create a new service just for this test
                const testWindowService = new WindowService();
                const window = testWindowService.createMainWindow();

                // Mock waitForViteServer to succeed but then simulate window destruction check
                vi.spyOn(
                    testWindowService as any,
                    "waitForViteServer"
                ).mockResolvedValue(undefined);

                // Simulate window being destroyed after server is ready but before load
                vi.mocked(window.isDestroyed).mockReturnValue(true);

                // Directly call loadDevelopmentContent to catch errors
                await expect(
                    (testWindowService as any).loadDevelopmentContent()
                ).rejects.toThrowError();

                expect(logger.error).toHaveBeenCalledWith(
                    "Failed to loadDevelopmentContent",
                    expect.objectContaining({
                        message:
                            "Main window was destroyed while waiting for Vite server",
                    })
                );
            });

            it("should log a warning when opening DevTools fails", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                vi.useFakeTimers();

                try {
                    const window = windowService.createMainWindow();
                    vi.mocked(window.isDestroyed).mockReturnValue(false);
                    vi.mocked(
                        window.webContents.openDevTools
                    ).mockImplementation(() => {
                        throw new Error("DevTools blocked");
                    });

                    await (
                        windowService as unknown as {
                            loadDevelopmentContent: () => Promise<void>;
                        }
                    ).loadDevelopmentContent();

                    await vi.runAllTimersAsync();

                    expect(logger.warn).toHaveBeenCalledWith(
                        "[WindowService] Failed to open DevTools",
                        expect.objectContaining({
                            error: "DevTools blocked",
                            windowState: "active",
                        })
                    );
                } finally {
                    vi.useRealTimers();
                }
            });

            it("should skip DevTools opening when the window is destroyed before the delay elapses", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                vi.useFakeTimers();

                try {
                    const window = windowService.createMainWindow();
                    vi.mocked(window.isDestroyed).mockReturnValue(false);

                    await (
                        windowService as unknown as {
                            loadDevelopmentContent: () => Promise<void>;
                        }
                    ).loadDevelopmentContent();

                    vi.mocked(window.isDestroyed).mockReturnValue(true);

                    await vi.runAllTimersAsync();

                    expect(
                        window.webContents.openDevTools
                    ).not.toHaveBeenCalled();
                } finally {
                    vi.useRealTimers();
                }
            });
        });
    });

    describe("security headers", () => {
        it("should apply strict production security headers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(false);

            const mockWindowRef = (
                BrowserWindow as unknown as { __mockWindow: any }
            ).__mockWindow;
            const headerSpy = vi.mocked(
                mockWindowRef.webContents.session.webRequest.onHeadersReceived
            );

            windowService.createMainWindow();

            expect(headerSpy).toHaveBeenCalledWith(expect.any(Function));
            const [handler] = headerSpy.mock.calls[0];
            const callback = vi.fn();

            handler(
                {
                    responseHeaders: {},
                } as any,
                callback
            );

            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({
                    cancel: false,
                    responseHeaders: expect.objectContaining({
                        "Permissions-Policy": [
                            "camera=(), microphone=(), geolocation=(), fullscreen=()",
                        ],
                        "Referrer-Policy": ["no-referrer"],
                        "X-Content-Type-Options": ["nosniff"],
                        "X-Frame-Options": ["DENY"],
                    }),
                })
            );
        });

        it("should not inject CSP into non-document resources", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "regression");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(false);

            const mockWindowRef = (
                BrowserWindow as unknown as { __mockWindow: any }
            ).__mockWindow;
            const headerSpy = vi.mocked(
                mockWindowRef.webContents.session.webRequest.onHeadersReceived
            );

            windowService.createMainWindow();

            expect(headerSpy).toHaveBeenCalledWith(expect.any(Function));
            const [handler] = headerSpy.mock.calls[0];
            const callback = vi.fn();

            const originalHeaders = {
                "Cache-Control": ["max-age=3600"],
            };

            handler(
                {
                    resourceType: "image",
                    responseHeaders: originalHeaders,
                } as any,
                callback
            );

            expect(callback).toHaveBeenCalledWith({
                cancel: false,
                responseHeaders: originalHeaders,
            });
        });

        it("should warn when applying security middleware fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(false);

            const mockWindowRef = (
                BrowserWindow as unknown as { __mockWindow: any }
            ).__mockWindow;
            const headerSpy = vi.mocked(
                mockWindowRef.webContents.session.webRequest.onHeadersReceived
            );
            headerSpy.mockImplementationOnce(() => {
                throw new Error("session unavailable");
            });

            windowService.createMainWindow();

            expect(logger.warn).toHaveBeenCalledWith(
                "[WindowService] Failed to attach security header middleware",
                expect.objectContaining({
                    message: "session unavailable",
                })
            );
        });
    });

    describe("preload path resolution", () => {
        it("should resolve development preload path", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Loading", "type");

            vi.mocked(isDev).mockReturnValue(true);

            windowService.createMainWindow();

            expect(BrowserWindow).toHaveBeenCalledWith(
                expect.objectContaining({
                    webPreferences: expect.objectContaining({
                        preload: expect.stringMatching(
                            /dist[\\/]preload\.js$/u
                        ),
                    }),
                })
            );
        });

        it("should resolve production preload path", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Loading", "type");

            vi.mocked(isDev).mockReturnValue(false);

            windowService.createMainWindow();

            expect(BrowserWindow).toHaveBeenCalledWith(
                expect.objectContaining({
                    webPreferences: expect.objectContaining({
                        preload: expect.stringContaining("preload.js"),
                    }),
                })
            );
        });
    });

    describe("lifecycle cleanup", () => {
        it("should remove window event listeners during cleanup", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const window = windowService.createMainWindow();

            windowService.cleanupWindowEvents();

            expect(window.removeListener).toHaveBeenCalledWith(
                "ready-to-show",
                expect.any(Function)
            );
            expect(window.webContents.removeListener).toHaveBeenCalledWith(
                "dom-ready",
                expect.any(Function)
            );
            expect(window.webContents.removeListener).toHaveBeenCalledWith(
                "did-finish-load",
                expect.any(Function)
            );
            expect(window.webContents.removeListener).toHaveBeenCalledWith(
                "did-fail-load",
                expect.any(Function)
            );
            expect(window.webContents.removeListener).toHaveBeenCalledWith(
                "will-navigate",
                expect.any(Function)
            );
            expect(window.webContents.removeListener).toHaveBeenCalledWith(
                "will-redirect",
                expect.any(Function)
            );
            expect(window.webContents.removeListener).toHaveBeenCalledWith(
                "will-attach-webview",
                expect.any(Function)
            );
            expect(window.removeListener).toHaveBeenCalledWith(
                "closed",
                expect.any(Function)
            );
        });

        it("should skip cleanup when the window has been destroyed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const window = windowService.createMainWindow();
            vi.mocked(window.isDestroyed).mockReturnValue(true);

            windowService.cleanupWindowEvents();

            expect(window.removeListener).not.toHaveBeenCalled();
            expect(window.webContents.removeListener).not.toHaveBeenCalled();
        });
    });

    describe("error scenarios", () => {
        it("should handle missing main window in loadContent", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Loading", "type");

            // Create service but don't call createMainWindow
            const service = new WindowService();

            // Try to trigger loadContent without a window
            // This is a private method, so we test it indirectly through createMainWindow
            // but first nullify the window
            service.createMainWindow();
            (service as any).mainWindow = null;

            // Call loadContent via reflection
            (service as any).loadContent();

            expect(logger.error).toHaveBeenCalledWith(
                "[WindowService] Cannot load content: main window not initialized"
            );
        });

        it("should handle timeout during fetch", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(isDev).mockReturnValue(true);

            // Create a new service just for this test
            const testWindowService = new WindowService();

            // Mock waitForViteServer to fail with timeout
            const waitForViteServerSpy = vi
                .spyOn(testWindowService as any, "waitForViteServer")
                .mockRejectedValue(
                    new Error(
                        "Vite dev server did not become available after 20 attempts"
                    )
                );

            testWindowService.createMainWindow();

            // Directly call loadDevelopmentContent to catch errors
            await expect(
                (testWindowService as any).loadDevelopmentContent()
            ).rejects.toThrowError();

            expect(waitForViteServerSpy).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(
                "Failed to loadDevelopmentContent",
                expect.objectContaining({
                    message: expect.stringContaining(
                        "Vite dev server did not become available after 20 attempts"
                    ),
                })
            );
        });
    });

    describe("Vite server detection", () => {
        it("should detect server readiness when fetch is not mocked", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const originalFetch = globalThis.fetch;

            const plainFetch = async () => ({ ok: true }) as Response;

            (globalThis as unknown as { fetch: typeof plainFetch }).fetch =
                plainFetch;

            vi.mocked(logger.debug).mockClear();

            try {
                await (
                    windowService as unknown as {
                        waitForViteServer: () => Promise<void>;
                    }
                ).waitForViteServer();

                expect(logger.debug).toHaveBeenCalledWith(
                    "[WindowService] Vite dev server is ready"
                );
            } finally {
                (globalThis as any).fetch = originalFetch;
            }
        });

        it("should retry until the server responds successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const originalFetch = globalThis.fetch;

            let attempts = 0;
            const retryingFetch = async () => {
                attempts += 1;
                return { ok: attempts > 1 } as Response;
            };

            (globalThis as any).fetch = retryingFetch;

            try {
                const waitPromise = (
                    windowService as unknown as {
                        waitForViteServer: () => Promise<void>;
                    }
                ).waitForViteServer();

                await waitPromise;

                expect(attempts).toBe(2);
                expect(logger.debug).toHaveBeenCalledWith(
                    expect.stringMatching(/Waiting \d+ms before retry 2\/20/u)
                );
            } finally {
                (globalThis as any).fetch = originalFetch;
            }
        });

        it("should surface errors when mocked fetch indicates server unavailability", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const originalFetch = globalThis.fetch;
            const failingFetch = vi.fn().mockResolvedValue({
                ok: false,
            } as Response);

            (globalThis as any).fetch = failingFetch;

            await expect(
                (
                    windowService as unknown as {
                        waitForViteServer: () => Promise<void>;
                    }
                ).waitForViteServer()
            ).rejects.toThrowError(
                "Mocked fetch reported Vite server as unavailable"
            );

            (globalThis as any).fetch = originalFetch;
        });

        it("should exhaust retries when the server never becomes available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            vi.useFakeTimers();

            const originalFetch = globalThis.fetch;
            const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

            let attempts = 0;
            (globalThis as any).fetch = async () => {
                attempts += 1;
                return { ok: false } as Response;
            };

            try {
                const waitPromise = (
                    windowService as unknown as {
                        waitForViteServer: () => Promise<void>;
                    }
                ).waitForViteServer();

                for (let attempt = 0; attempt < 19; attempt++) {
                    await vi.advanceTimersToNextTimerAsync();
                }

                await expect(waitPromise).rejects.toThrowError(
                    "Vite dev server did not become available after 20 attempts"
                );
                expect(attempts).toBe(20);
            } finally {
                (globalThis as any).fetch = originalFetch;
                randomSpy.mockRestore();
                vi.useRealTimers();
            }
        });

        it("should log retry diagnostics for non-abort errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            vi.useFakeTimers();

            const originalFetch = globalThis.fetch;
            const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
            vi.mocked(logger.debug).mockClear();

            let attempts = 0;
            (globalThis as any).fetch = async () => {
                attempts += 1;
                if (attempts === 1) {
                    throw new Error("network down");
                }
                return { ok: true } as Response;
            };

            try {
                const waitPromise = (
                    windowService as unknown as {
                        waitForViteServer: () => Promise<void>;
                    }
                ).waitForViteServer();

                await vi.advanceTimersToNextTimerAsync();
                await waitPromise;

                expect(attempts).toBe(2);
                expect(logger.debug).toHaveBeenCalledWith(
                    expect.stringContaining("network down")
                );
            } finally {
                (globalThis as any).fetch = originalFetch;
                randomSpy.mockRestore();
                vi.useRealTimers();
            }
        });

        it("should avoid redundant logs for abort errors before the final attempt", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            vi.useFakeTimers();

            const originalFetch = globalThis.fetch;
            const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
            vi.mocked(logger.debug).mockClear();

            let attempts = 0;
            (globalThis as any).fetch = async () => {
                attempts += 1;
                if (attempts < 3) {
                    const abortError = new Error("timeout");
                    abortError.name = "AbortError";
                    throw abortError;
                }
                return { ok: true } as Response;
            };

            try {
                const waitPromise = (
                    windowService as unknown as {
                        waitForViteServer: () => Promise<void>;
                    }
                ).waitForViteServer();

                await vi.advanceTimersToNextTimerAsync();
                await vi.advanceTimersToNextTimerAsync();

                await waitPromise;

                const retryLogs = vi
                    .mocked(logger.debug)
                    .mock.calls.filter(
                        ([message]) =>
                            typeof message === "string" &&
                            message.includes("Vite server not ready")
                    );
                expect(retryLogs).toHaveLength(0);
                expect(attempts).toBe(3);
            } finally {
                (globalThis as any).fetch = originalFetch;
                randomSpy.mockRestore();
                vi.useRealTimers();
            }
        });
    });

    describe("edge cases", () => {
        it("should handle destroyed window in ready-to-show event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const window = windowService.createMainWindow();

            // Get the ready-to-show callback
            const readyCallback = (
                vi.mocked(window.once).mock.calls as any[]
            ).find(
                (call: any) => call[0] === "ready-to-show"
            )?.[1] as () => void;

            // Simulate window being destroyed before ready-to-show
            vi.mocked(window.isDestroyed).mockReturnValue(true);
            (windowService as any).mainWindow = null;

            // Should not crash when trying to show destroyed window
            expect(() => readyCallback()).not.toThrowError();
        });
    });

    describe("environment flag helper", () => {
        it("should return false when process is undefined", () => {
            const originalProcess = globalThis.process;

            try {
                (globalThis as any).process = undefined;
                expect(
                    (
                        windowService as unknown as {
                            getEnvFlag: (name: string) => boolean;
                        }
                    ).getEnvFlag("SHOULD_NOT_EXIST")
                ).toBeFalsy();
            } finally {
                (globalThis as any).process = originalProcess;
            }
        });

        it("should read boolean environment flags safely", () => {
            const originalValue = process.env["HEADLESS"];
            process.env["HEADLESS"] = "true";

            expect(
                (
                    windowService as unknown as {
                        getEnvFlag: (name: string) => boolean;
                    }
                ).getEnvFlag("HEADLESS")
            ).toBeTruthy();

            if (originalValue === undefined) {
                delete process.env["HEADLESS"];
            } else {
                process.env["HEADLESS"] = originalValue;
            }
        });
    });
});
