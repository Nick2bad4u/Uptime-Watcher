/**
 * Tests all functionality of the WindowService class including window creation,
 * content loading, event handling, and environment-specific behavior.
 *
 * @module WindowService.test
 *
 * @file Comprehensive tests for WindowService
 */

import {
    BrowserWindow,
    shell,
    type BrowserWindow as ElectronBrowserWindow,
    type BrowserWindowConstructorOptions,
    type Event,
    type OnHeadersReceivedListenerDetails,
    type WebPreferences,
} from "electron";
import { pathToFileURL } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    resetProcessSnapshotOverrideForTesting,
    setProcessSnapshotOverrideForTesting,
} from "@shared/utils/environment";
import { isDev } from "../../../electronUtils";
import { WindowService } from "../../../services/window/WindowService";
import { logger } from "../../../utils/logger";

const electronFixtures = vi.hoisted(() => {
    const createMockSession = () => ({
        setPermissionCheckHandler: vi.fn(),
        setPermissionRequestHandler: vi.fn(),
        webRequest: {
            onHeadersReceived: vi.fn(),
        },
    });

    const createMockWebContents = () => ({
        isDestroyed: vi.fn(() => false),
        on: vi.fn(),
        once: vi.fn(),
        openDevTools: vi.fn(),
        removeListener: vi.fn(),
        send: vi.fn(),
        setWindowOpenHandler: vi.fn(),
        session: createMockSession(),
    });

    const createMockBrowserWindow = () => ({
        close: vi.fn(),
        isDestroyed: vi.fn(() => false),
        loadFile: vi.fn().mockResolvedValue(undefined),
        loadURL: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        once: vi.fn(),
        removeListener: vi.fn(),
        show: vi.fn(),
        webContents: createMockWebContents(),
    });

    return {
        createMockBrowserWindow,
        mockWindow: createMockBrowserWindow(),
    };
});

type MockBrowserWindowFixture = ReturnType<
    typeof electronFixtures.createMockBrowserWindow
>;

// Mock electron module first
vi.mock("electron", () => {
    const { mockWindow } = electronFixtures;

    const MockBrowserWindow = vi.fn(function MockBrowserWindowMock(
        _options?: BrowserWindowConstructorOptions
    ) {
        return mockWindow;
    });
    Reflect.set(
        MockBrowserWindow,
        "getAllWindows",
        vi.fn<() => ElectronBrowserWindow[]>()
    );
    Reflect.set(MockBrowserWindow, "__mockWindow", mockWindow);

    return {
        BrowserWindow: MockBrowserWindow,
        shell: {
            openExternal: vi.fn().mockResolvedValue(undefined),
        },
    };
});

const getMockBrowserWindow = (): MockBrowserWindowFixture => {
    const fixture: unknown = Reflect.get(BrowserWindow, "__mockWindow");
    if (fixture !== electronFixtures.mockWindow) {
        throw new TypeError("BrowserWindow mock fixture is unavailable");
    }

    return electronFixtures.mockWindow;
};

const getRegisteredListener = <
    TListener extends (...arguments_: never[]) => unknown,
>(
    mockCalls: unknown,
    eventName: string
): TListener => {
    if (!Array.isArray(mockCalls)) {
        throw new TypeError("Electron mock calls must be an array");
    }

    const matchingCall = mockCalls.find(
        (call: unknown) =>
            Array.isArray(call) &&
            call[0] === eventName &&
            typeof call[1] === "function"
    );
    if (!matchingCall) {
        throw new Error(`No listener registered for ${eventName}`);
    }

    return matchingCall[1] as TListener;
};

const getReflectedMethod = <TArguments extends unknown[], TResult>(
    target: object,
    propertyKey: string
): ((...arguments_: TArguments) => TResult) => {
    const member: unknown = Reflect.get(target, propertyKey);
    if (typeof member !== "function") {
        throw new TypeError(`${propertyKey} is not a function`);
    }

    return member.bind(target) as (...arguments_: TArguments) => TResult;
};

const createElectronEvent = (): Event => ({
    defaultPrevented: false,
    preventDefault: vi.fn(),
});

const createHeadersReceivedDetails = (
    overrides: Partial<OnHeadersReceivedListenerDetails> = {}
): OnHeadersReceivedListenerDetails => ({
    id: 1,
    method: "GET",
    referrer: "",
    resourceType: "mainFrame",
    statusCode: 200,
    statusLine: "HTTP/1.1 200 OK",
    timestamp: 0,
    url: "file:///dist/index.html",
    ...overrides,
});

const malformedElectronInput = <T>(value: unknown): T => value as T;

type NavigationListener = (event: Event, url: string) => void;
type WebviewAttachmentListener = (
    event: Event,
    webPreferences: WebPreferences,
    params: Record<string, string>
) => void;
type DidFailLoadListener = (
    event: Event,
    errorCode: number,
    errorDescription: string
) => void;

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

// Mock node modules NOTE: Do not mock node:path/node:URL here.
// WindowService relies on real path and file URL behaviour for production
// navigation hardening (e.g., path.resolve + fileURLToPath).

const createFetchResponse = (ok: boolean, status = ok ? 200 : 503): Response =>
    ({ ok, status }) as Response;

const setFetchForTesting = (replacement: typeof fetch): void => {
    globalThis.fetch = replacement;
};

// Mock global fetch for Vite server checking
globalThis.fetch = vi.fn<typeof fetch>();

describe(WindowService, () => {
    let windowService: WindowService;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        resetProcessSnapshotOverrideForTesting();

        // Setup default mock returns
        vi.mocked(isDev).mockReturnValue(false);
        vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([]);

        const mockWindowRef = getMockBrowserWindow();
        vi.mocked(mockWindowRef.isDestroyed).mockReturnValue(false);
        vi.mocked(mockWindowRef.webContents.isDestroyed).mockReturnValue(false);
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

            expect(() => {
                windowService.closeMainWindow();
            }).not.toThrow();
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

            const willNavigateHandler =
                getRegisteredListener<NavigationListener>(
                    vi.mocked(window.webContents.on).mock.calls,
                    "will-navigate"
                );

            expect(willNavigateHandler).toBeTypeOf("function");

            const event = createElectronEvent();

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

            const willNavigateHandler =
                getRegisteredListener<NavigationListener>(
                    vi.mocked(window.webContents.on).mock.calls,
                    "will-navigate"
                );

            expect(willNavigateHandler).toBeTypeOf("function");

            const event = createElectronEvent();

            willNavigateHandler?.(event, "file:///etc/passwd");

            await Promise.resolve();

            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(shell.openExternal).not.toHaveBeenCalled();
        });

        it("allows production file:// navigations inside the packaged renderer bundle", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(false);

            const window = windowService.createMainWindow();
            await Promise.resolve();

            const loadedFilePath = vi.mocked(window.loadFile).mock
                .calls[0]?.[0];
            expect(loadedFilePath).toBeTypeOf("string");

            const willNavigateHandler =
                getRegisteredListener<NavigationListener>(
                    vi.mocked(window.webContents.on).mock.calls,
                    "will-navigate"
                );

            expect(willNavigateHandler).toBeTypeOf("function");

            const event = createElectronEvent();

            willNavigateHandler?.(
                event,
                pathToFileURL(loadedFilePath!).toString()
            );

            await Promise.resolve();

            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(shell.openExternal).not.toHaveBeenCalled();
        });

        it("blocks chrome-extension navigations in production", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(false);

            const window = windowService.createMainWindow();

            const willNavigateHandler =
                getRegisteredListener<NavigationListener>(
                    vi.mocked(window.webContents.on).mock.calls,
                    "will-navigate"
                );

            expect(willNavigateHandler).toBeTypeOf("function");

            const event = createElectronEvent();

            willNavigateHandler?.(
                event,
                "chrome-extension://extension-id/index.html"
            );

            await Promise.resolve();

            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(shell.openExternal).not.toHaveBeenCalled();
        });

        it("redacts blocked webview attachment src before logging", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "regression");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            const window = windowService.createMainWindow();

            const willAttachWebviewHandler =
                getRegisteredListener<WebviewAttachmentListener>(
                    vi.mocked(window.webContents.on).mock.calls,
                    "will-attach-webview"
                );

            expect(willAttachWebviewHandler).toBeTypeOf("function");

            const event = createElectronEvent();

            willAttachWebviewHandler?.(
                event,
                {},
                {
                    src: "https://user:pass@evil.example/embed?token=secret#fragment",
                }
            );

            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(logger.warn).toHaveBeenCalledWith(
                "[WindowService] Blocked webview attachment",
                {
                    src: "https://evil.example/embed",
                }
            );
            expect(
                JSON.stringify(vi.mocked(logger.warn).mock.calls)
            ).not.toContain("secret");
            expect(
                JSON.stringify(vi.mocked(logger.warn).mock.calls)
            ).not.toContain("pass");
        });

        it("allows chrome-extension navigations in development", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Security", "type");

            vi.mocked(isDev).mockReturnValue(true);

            const window = windowService.createMainWindow();

            const willNavigateHandler =
                getRegisteredListener<NavigationListener>(
                    vi.mocked(window.webContents.on).mock.calls,
                    "will-navigate"
                );

            expect(willNavigateHandler).toBeTypeOf("function");

            const event = createElectronEvent();

            willNavigateHandler?.(
                event,
                "chrome-extension://extension-id/index.html"
            );

            await Promise.resolve();

            expect(event.preventDefault).not.toHaveBeenCalled();
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

            const willRedirectHandler =
                getRegisteredListener<NavigationListener>(
                    vi.mocked(window.webContents.on).mock.calls,
                    "will-redirect"
                );

            expect(willRedirectHandler).toBeTypeOf("function");

            const event = createElectronEvent();

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

            const mockWindows: ElectronBrowserWindow[] = [
                windowService.createMainWindow(),
            ];
            vi.mocked(BrowserWindow.getAllWindows).mockReturnValue(mockWindows);

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

            // WindowService treats CI as headless (by design) to avoid showing
            // real windows in automated environments. This test asserts the
            // non-headless behavior, so we must temporarily clear those flags.
            const originalCI = process.env["CI"];
            const originalHeadless = process.env["HEADLESS"];

            delete process.env["CI"];
            delete process.env["HEADLESS"];

            const window = windowService.createMainWindow();

            // Get the callback and call it
            const readyCallback = getRegisteredListener<() => void>(
                vi.mocked(window.once).mock.calls,
                "ready-to-show"
            );

            expect(readyCallback).toBeDefined();
            readyCallback();

            expect(logger.info).toHaveBeenCalledWith(
                "[WindowService] Main window ready to show"
            );
            expect(window.show).toHaveBeenCalled();

            // Restore env
            if (originalCI === undefined) {
                delete process.env["CI"];
            } else {
                process.env["CI"] = originalCI;
            }
            if (originalHeadless === undefined) {
                delete process.env["HEADLESS"];
            } else {
                process.env["HEADLESS"] = originalHeadless;
            }
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
            const readyCallback = getRegisteredListener<() => void>(
                vi.mocked(window.once).mock.calls,
                "ready-to-show"
            );

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
            const domReadyCallback = getRegisteredListener<() => void>(
                vi.mocked(window.webContents.once).mock.calls,
                "dom-ready"
            );

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
            const finishLoadCallback = getRegisteredListener<() => void>(
                vi.mocked(window.webContents.once).mock.calls,
                "did-finish-load"
            );

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
            const failLoadCallback = getRegisteredListener<DidFailLoadListener>(
                vi.mocked(window.webContents.on).mock.calls,
                "did-fail-load"
            );

            expect(failLoadCallback).toBeDefined();
            failLoadCallback(
                malformedElectronInput<Event>(null),
                404,
                "Not Found"
            );

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
            const closedCallback = getRegisteredListener<() => void>(
                vi.mocked(window.on).mock.calls,
                "closed"
            );

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
                windowService.loadContent();

                // Allow the asynchronous withErrorHandling call to complete
                await new Promise((resolve) => setTimeout(resolve, 0));

                expect(logger.error).toHaveBeenCalledWith(
                    "Failed to loadProductionContent",
                    expect.objectContaining({ message: "File not found" })
                );
            });

            it("should ignore production load interruptions while shutting down", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: WindowService", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const mockWindowRef = getMockBrowserWindow();

                const shutdownLoadError = new Error(
                    "ERR_FAILED (-2) loading 'file:///dist/index.html'"
                );
                vi.mocked(mockWindowRef.loadFile).mockRejectedValue(
                    shutdownLoadError
                );

                const window = windowService.createMainWindow();
                vi.mocked(window.isDestroyed).mockReturnValue(true);
                vi.mocked(window.webContents.isDestroyed).mockReturnValue(true);

                windowService.closeMainWindow();

                await new Promise((resolve) => setTimeout(resolve, 0));

                expect(logger.debug).toHaveBeenCalledWith(
                    "[WindowService] Ignoring production load interruption during shutdown",
                    expect.objectContaining({
                        message: shutdownLoadError.message,
                    })
                );
                expect(logger.error).not.toHaveBeenCalledWith(
                    "Failed to loadProductionContent",
                    expect.anything()
                );
            });
        });

        describe("development mode", () => {
            beforeEach(() => {
                vi.mocked(isDev).mockReturnValue(true);
                vi.mocked(fetch).mockResolvedValue({
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

                await getReflectedMethod<[], Promise<void>>(
                    windowService,
                    "loadDevelopmentContent"
                )();

                expect(fetch).toHaveBeenCalledWith(
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
                vi.mocked(fetch).mockRejectedValue(error);

                // Create a new service just for this test to avoid affecting others
                const testWindowService = new WindowService();

                // Mock waitForViteServer to fail immediately
                const waitForViteServerSpy = vi
                    .fn<() => Promise<void>>()
                    .mockRejectedValue(
                        new Error(
                            "Vite dev server did not become available after 20 attempts"
                        )
                    );
                Reflect.set(
                    testWindowService,
                    "waitForViteServer",
                    waitForViteServerSpy
                );

                testWindowService.createMainWindow();

                // Directly call loadDevelopmentContent to catch errors
                await expect(
                    getReflectedMethod<[], Promise<void>>(
                        testWindowService,
                        "loadDevelopmentContent"
                    )()
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
                const waitForViteServerSpy = vi
                    .fn<() => Promise<void>>()
                    .mockResolvedValue(undefined);
                Reflect.set(
                    testWindowService,
                    "waitForViteServer",
                    waitForViteServerSpy
                );

                // Simulate window being destroyed after server is ready but before load
                vi.mocked(window.isDestroyed).mockReturnValue(true);
                vi.clearAllMocks();

                await expect(
                    getReflectedMethod<[], Promise<void>>(
                        testWindowService,
                        "loadDevelopmentContent"
                    )()
                ).resolves.toBeUndefined();

                expect(waitForViteServerSpy).toHaveBeenCalled();
                expect(logger.debug).toHaveBeenCalledWith(
                    "[WindowService] Skipping development load because the main window closed before the Vite server was ready"
                );
                expect(logger.error).not.toHaveBeenCalledWith(
                    "Failed to loadDevelopmentContent",
                    expect.anything()
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

                    await getReflectedMethod<[], Promise<void>>(
                        windowService,
                        "loadDevelopmentContent"
                    )();

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

                    await getReflectedMethod<[], Promise<void>>(
                        windowService,
                        "loadDevelopmentContent"
                    )();

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

            const mockWindowRef = getMockBrowserWindow();
            const headerSpy = vi.mocked(
                mockWindowRef.webContents.session.webRequest.onHeadersReceived
            );

            windowService.createMainWindow();

            expect(headerSpy).toHaveBeenCalledWith(expect.any(Function));
            const firstHeaderCall = headerSpy.mock.calls[0];
            if (!firstHeaderCall) {
                throw new Error("Security header handler was not registered");
            }
            const [handler] = firstHeaderCall;
            const callback = vi.fn();

            handler(
                createHeadersReceivedDetails({ responseHeaders: {} }),
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

            const mockWindowRef = getMockBrowserWindow();
            const headerSpy = vi.mocked(
                mockWindowRef.webContents.session.webRequest.onHeadersReceived
            );

            windowService.createMainWindow();

            expect(headerSpy).toHaveBeenCalledWith(expect.any(Function));
            const firstHeaderCall = headerSpy.mock.calls[0];
            if (!firstHeaderCall) {
                throw new Error("Security header handler was not registered");
            }
            const [handler] = firstHeaderCall;
            const callback = vi.fn();

            const originalHeaders = {
                "Cache-Control": ["max-age=3600"],
            };

            handler(
                createHeadersReceivedDetails({
                    resourceType: "image",
                    responseHeaders: originalHeaders,
                }),
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

            const mockWindowRef = getMockBrowserWindow();
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
                            /dist[/\\]preload\.js$/u
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

            // Nullify the private window reference to exercise the public guard.
            service.createMainWindow();
            Reflect.set(service, "mainWindow", null);

            service.loadContent();

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
                .fn<() => Promise<void>>()
                .mockRejectedValue(
                    new Error(
                        "Vite dev server did not become available after 20 attempts"
                    )
                );
            Reflect.set(
                testWindowService,
                "waitForViteServer",
                waitForViteServerSpy
            );

            testWindowService.createMainWindow();

            // Directly call loadDevelopmentContent to catch errors
            await expect(
                getReflectedMethod<[], Promise<void>>(
                    testWindowService,
                    "loadDevelopmentContent"
                )()
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

    describe("Vite server detection", () => {
        it("should detect server readiness when fetch is not mocked", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const originalFetch = fetch;

            const plainFetch: typeof fetch = async () =>
                createFetchResponse(true);

            setFetchForTesting(plainFetch);

            vi.mocked(logger.debug).mockClear();

            try {
                await getReflectedMethod<[], Promise<void>>(
                    windowService,
                    "waitForViteServer"
                )();

                expect(logger.debug).toHaveBeenCalledWith(
                    "[WindowService] Vite dev server is ready"
                );
            } finally {
                setFetchForTesting(originalFetch);
            }
        });

        it("should retry mocked fetch implementations until the server responds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const originalFetch = fetch;

            let attempts = 0;
            const retryingFetch = vi.fn<typeof fetch>(async () => {
                attempts += 1;
                return createFetchResponse(attempts > 1);
            });

            setFetchForTesting(retryingFetch);

            try {
                const waitPromise = getReflectedMethod<[], Promise<void>>(
                    windowService,
                    "waitForViteServer"
                )();

                await waitPromise;

                expect(attempts).toBe(2);
                expect(retryingFetch).toHaveBeenCalledTimes(2);
                expect(logger.debug).toHaveBeenCalledWith(
                    expect.stringMatching(/Waiting \d+ms before retry 2\/20/v)
                );
            } finally {
                setFetchForTesting(originalFetch);
            }
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

            const originalFetch = fetch;
            let attempts = 0;
            const unavailableFetch: typeof fetch = async () => {
                attempts += 1;
                return createFetchResponse(false);
            };
            setFetchForTesting(unavailableFetch);

            try {
                const waitPromise = getReflectedMethod<[], Promise<void>>(
                    windowService,
                    "waitForViteServer"
                )();

                for (let attempt = 0; attempt < 19; attempt++) {
                    await vi.advanceTimersToNextTimerAsync();
                }

                await expect(waitPromise).rejects.toThrow(
                    "Vite dev server did not become available after 20 attempts"
                );
                expect(attempts).toBe(20);
            } finally {
                setFetchForTesting(originalFetch);
                vi.useRealTimers();
            }
        });

        it("should abort stalled fetch attempts before retrying", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: WindowService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Timeout Handling", "type");

            vi.useFakeTimers();

            const originalFetch = fetch;
            const observedSignals: AbortSignal[] = [];
            const stalledFetch = vi.fn<typeof fetch>(
                async (_input, init) =>
                    new Promise<Response>((_resolve, reject) => {
                        const signal = init?.signal;
                        if (!signal) {
                            reject(new Error("Missing fetch abort signal"));
                            return;
                        }

                        observedSignals.push(signal);
                        signal.addEventListener(
                            "abort",
                            () => {
                                const error = new Error("Vite fetch timed out");
                                error.name = "AbortError";
                                reject(error);
                            },
                            { once: true }
                        );
                    })
            );
            setFetchForTesting(stalledFetch);

            try {
                const waitPromise = getReflectedMethod<[], Promise<void>>(
                    windowService,
                    "waitForViteServer"
                )();
                const outcomePromise = waitPromise
                    .then(() => ({ status: "resolved" as const }))
                    .catch((error: unknown) => ({
                        error,
                        status: "rejected" as const,
                    }));

                await vi.runAllTimersAsync();
                const outcome = await outcomePromise;

                expect(outcome).toMatchObject({
                    error: expect.objectContaining({
                        message:
                            "Vite dev server did not become available after 20 attempts",
                    }),
                    status: "rejected",
                });
                expect(stalledFetch).toHaveBeenCalledTimes(20);
                expect(observedSignals).toHaveLength(20);
                expect(observedSignals.every((signal) => signal.aborted)).toBe(
                    true
                );
            } finally {
                setFetchForTesting(originalFetch);
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

            const originalFetch = fetch;
            vi.mocked(logger.debug).mockClear();

            let attempts = 0;
            const eventuallyAvailableFetch: typeof fetch = async () => {
                attempts += 1;
                if (attempts === 1) {
                    throw new Error("network down");
                }
                return createFetchResponse(true);
            };
            setFetchForTesting(eventuallyAvailableFetch);

            try {
                const waitPromise = getReflectedMethod<[], Promise<void>>(
                    windowService,
                    "waitForViteServer"
                )();

                await vi.advanceTimersToNextTimerAsync();
                await waitPromise;

                expect(attempts).toBe(2);
                expect(logger.debug).toHaveBeenCalledWith(
                    expect.stringContaining("network down")
                );
            } finally {
                setFetchForTesting(originalFetch);
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

            const originalFetch = fetch;
            vi.mocked(logger.debug).mockClear();

            let attempts = 0;
            const abortingFetch: typeof fetch = async () => {
                attempts += 1;
                if (attempts < 3) {
                    const abortError = new Error("timeout");
                    abortError.name = "AbortError";
                    throw abortError;
                }
                return createFetchResponse(true);
            };
            setFetchForTesting(abortingFetch);

            try {
                const waitPromise = getReflectedMethod<[], Promise<void>>(
                    windowService,
                    "waitForViteServer"
                )();

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
                setFetchForTesting(originalFetch);
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
            const readyCallback = getRegisteredListener<() => void>(
                vi.mocked(window.once).mock.calls,
                "ready-to-show"
            );

            // Simulate window being destroyed before ready-to-show
            vi.mocked(window.isDestroyed).mockReturnValue(true);
            Reflect.set(windowService, "mainWindow", null);

            // Should not crash when trying to show destroyed window
            expect(() => {
                readyCallback();
            }).not.toThrow();
        });
    });

    describe("environment flag helper", () => {
        it("should return false when process is undefined", () => {
            try {
                setProcessSnapshotOverrideForTesting(null);
                expect(
                    getReflectedMethod<[string], boolean>(
                        windowService,
                        "getEnvFlag"
                    )("SHOULD_NOT_EXIST")
                ).toBeFalsy();
            } finally {
                resetProcessSnapshotOverrideForTesting();
            }
        });

        it("should read boolean environment flags safely", () => {
            const originalValue = process.env["HEADLESS"];
            process.env["HEADLESS"] = "true";

            expect(
                getReflectedMethod<[string], boolean>(
                    windowService,
                    "getEnvFlag"
                )("HEADLESS")
            ).toBeTruthy();

            if (originalValue === undefined) {
                delete process.env["HEADLESS"];
            } else {
                process.env["HEADLESS"] = originalValue;
            }
        });
    });
});
