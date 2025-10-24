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
        getAllWindows: vi.fn(),
        isDestroyed: vi.fn(() => false),
        close: vi.fn(),
        show: vi.fn(),
        loadURL: vi.fn().mockResolvedValue(undefined),
        loadFile: vi.fn().mockResolvedValue(undefined),
        once: vi.fn(),
        on: vi.fn(),
        webContents: {
            send: vi.fn(),
            openDevTools: vi.fn(),
            once: vi.fn(),
            on: vi.fn(),
        },
    };

    const MockBrowserWindow = vi.fn(function MockBrowserWindowMock() {
        return mockWindow;
    }) as any;
    MockBrowserWindow.getAllWindows = vi.fn();

    return {
        BrowserWindow: MockBrowserWindow,
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
vi.mock("../../../../shared/utils/environment", () => ({
    getNodeEnv: vi.fn(() => "test"),
}));

// Mock node modules
vi.mock("node:path", () => ({
    dirname: vi.fn(() => "/mock/path"),
    join: vi.fn((...args) => args.join("/")),
}));

vi.mock("node:url", () => ({
    fileURLToPath: vi.fn(() => "/mock/file.js"),
}));

// Mock global fetch for Vite server checking
globalThis.fetch = vi.fn();

import { BrowserWindow } from "electron";
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

            expect(BrowserWindow).toHaveBeenCalledWith({
                height: 800,
                minHeight: 600,
                minWidth: 800,
                show: false,
                titleBarStyle: "default",
                webPreferences: {
                    contextIsolation: true,
                    nodeIntegration: false,
                    preload: expect.any(String),
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

            expect(() => windowService.closeMainWindow()).not.toThrow();
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

                await (windowService as unknown as {
                    loadDevelopmentContent: () => Promise<void>;
                }).loadDevelopmentContent();

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
                ).rejects.toThrow();

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
                ).rejects.toThrow();

                expect(logger.error).toHaveBeenCalledWith(
                    "Failed to loadDevelopmentContent",
                    expect.objectContaining({
                        message:
                            "Main window was destroyed while waiting for Vite server",
                    })
                );
            });
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
                        preload: expect.stringContaining("dist/preload.js"),
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
            ).rejects.toThrow();

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
            expect(() => readyCallback()).not.toThrow();
        });
    });
});
