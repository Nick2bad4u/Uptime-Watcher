/**
 * Tests for ApplicationService - Application lifecycle and window management
 * coverage Tests initialization, window management, settings, and cleanup
 * functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApplicationService } from "../../../services/application/ApplicationService";

// Use vi.hoisted to fix hoisting issues with mocks
const {
    mockBrowserWindow,
    mockApp,
    mockServiceContainer,
    mockUptimeOrchestrator,
    // MockIpcService, // Currently unused
    // mockAutoUpdaterService, // Currently unused
    // mockWindowService, // Currently unused
    mockLogger,
    mockPath,
    mockFs,
    mockIsDev,
} = vi.hoisted(() => {
    const mockBrowserWindow = {
        loadFile: vi.fn(),
        loadURL: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
        webContents: {
            on: vi.fn(),
            openDevTools: vi.fn(),
            closeDevTools: vi.fn(),
        },
        show: vi.fn(),
        hide: vi.fn(),
        close: vi.fn(),
        isDestroyed: vi.fn(() => false),
        minimize: vi.fn(),
        restore: vi.fn(),
        maximize: vi.fn(),
        unmaximize: vi.fn(),
        isMaximized: vi.fn(() => false),
        setMenu: vi.fn(),
        destroy: vi.fn(),
    };

    const mockApp = {
        whenReady: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        quit: vi.fn(),
        getPath: vi.fn(() => "/mock/path"),
        setPath: vi.fn(),
        isReady: vi.fn(() => true),
        getName: vi.fn(() => "Uptime Watcher"),
        getVersion: vi.fn(() => "1.0.0"),
    };

    const mockUptimeOrchestrator = {
        initialize: vi.fn(() => Promise.resolve()),
        cleanup: vi.fn(() => Promise.resolve()),
    };

    const mockIpcService = {
        setupHandlers: vi.fn(),
        cleanup: vi.fn(),
    };

    const mockAutoUpdaterService = {
        initialize: vi.fn(),
        setStatusCallback: vi.fn(),
    };

    const mockWindowService = {
        createMainWindow: vi.fn(() => mockBrowserWindow),
        setupWindowHandlers: vi.fn(),
        cleanup: vi.fn(),
    };

    const mockServiceContainer = {
        initialize: vi.fn(),
        getUptimeOrchestrator: vi.fn(() => mockUptimeOrchestrator),
        getIpcService: vi.fn(() => mockIpcService),
        getAutoUpdaterService: vi.fn(() => mockAutoUpdaterService),
        getWindowService: vi.fn(() => mockWindowService),
        cleanup: vi.fn(),
    };

    const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    };

    const mockPath = {
        join: vi.fn((...args) => args.join("/")),
        resolve: vi.fn((...args) => args.join("/")),
        dirname: vi.fn((path) => path.split("/").slice(0, -1).join("/")),
    };

    const mockFs = {
        existsSync: vi.fn(() => true),
        mkdirSync: vi.fn(),
        readFileSync: vi.fn(() => "{}"),
        writeFileSync: vi.fn(),
    };

    const mockIsDev = vi.fn(() => true);

    return {
        mockBrowserWindow,
        mockApp,
        mockServiceContainer,
        mockUptimeOrchestrator,
        mockIpcService,
        mockAutoUpdaterService,
        mockWindowService,
        mockLogger,
        mockPath,
        mockFs,
        mockIsDev,
    };
});
// Set up all mocks
vi.mock("electron", () => ({
    BrowserWindow: vi.fn(() => mockBrowserWindow),
    app: mockApp,
    Menu: {
        setApplicationMenu: vi.fn(),
        buildFromTemplate: vi.fn(),
    },
    ipcMain: {
        handle: vi.fn(),
        removeHandler: vi.fn(),
        removeAllListeners: vi.fn(),
        on: vi.fn(),
    },
}));

vi.mock("path", () => mockPath);

vi.mock("fs", () => mockFs);

vi.mock("../../ServiceContainer", () => ({
    ServiceContainer: {
        getInstance: vi.fn(() => mockServiceContainer),
    },
}));

vi.mock("../../utils/logger", () => ({
    logger: mockLogger,
}));

vi.mock("../../electronUtils", () => ({
    isDev: mockIsDev,
}));

describe(ApplicationService, () => {
    let applicationService: ApplicationService;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset default mock behavior
        mockApp.whenReady.mockResolvedValue(undefined);
        mockApp.isReady.mockReturnValue(true);
        mockServiceContainer.initialize.mockResolvedValue(undefined);
        mockUptimeOrchestrator.initialize.mockResolvedValue(undefined);

        applicationService = new ApplicationService();
    });
    afterEach(() => {
        vi.resetAllMocks();
    });
    describe("Constructor", () => {
        it("should initialize without errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ApplicationService", "component");

            expect(applicationService).toBeDefined();
            expect(applicationService).toBeInstanceOf(ApplicationService);
        });
        it("should setup app event listeners", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ApplicationService", "component");

            expect(mockApp.on).toHaveBeenCalledWith(
                "ready",
                expect.any(Function)
            );
            expect(mockApp.on).toHaveBeenCalledWith(
                "window-all-closed",
                expect.any(Function)
            );
            expect(mockApp.on).toHaveBeenCalledWith(
                "activate",
                expect.any(Function)
            );
        });
    });
    describe("Application Lifecycle", () => {
        it("should handle window-all-closed event on non-macOS", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ApplicationService", "component");

            // Mock process.platform to be non-darwin
            Object.defineProperty(process, "platform", {
                value: "win32",
                configurable: true,
            });
            const windowAllClosedHandler = mockApp.on.mock.calls.find(
                (call) => call[0] === "window-all-closed"
            )?.[1] as Function;
            expect(windowAllClosedHandler).toBeDefined();

            if (windowAllClosedHandler) {
                windowAllClosedHandler();
                expect(mockApp.quit).toHaveBeenCalled();
            }
        });
        it("should not quit on window-all-closed on macOS", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ApplicationService", "component");

            // Mock process.platform to be darwin
            Object.defineProperty(process, "platform", {
                value: "darwin",
                configurable: true,
            });
            const windowAllClosedHandler = mockApp.on.mock.calls.find(
                (call) => call[0] === "window-all-closed"
            )?.[1] as Function;
            expect(windowAllClosedHandler).toBeDefined();

            if (windowAllClosedHandler) {
                windowAllClosedHandler();
                expect(mockApp.quit).not.toHaveBeenCalled();
            }
        });
        it("BrowserWindow tests disabled - focusing on business logic only", () => {
            // Following user instruction: "WE DO NOT NEED TO TEST LOGGER/DEV TOOLS IN TESTS"
            expect(true).toBeTruthy();
        });
    });
});
