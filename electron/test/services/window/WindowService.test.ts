/**
 * Tests for WindowService.
 * Validates window management and lifecycle operations.
 */

 

import { BrowserWindow } from "electron";
import { describe, expect, it, vi, beforeEach, afterEach, MockedFunction } from "vitest";

import { WindowService } from "../../../services/window/WindowService";

// Mock Electron modules
vi.mock("electron", () => ({
    BrowserWindow: vi.fn(),
    app: {
        isPackaged: false,
    },
}));

vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("WindowService", () => {
    let windowService: WindowService;
    let mockBrowserWindow: any;
    let mockWebContents: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup mock BrowserWindow
        mockWebContents = {
            send: vi.fn(),
            openDevTools: vi.fn(),
        };

        mockBrowserWindow = {
            loadURL: vi.fn(() => Promise.resolve()),
            loadFile: vi.fn(() => Promise.resolve()),
            once: vi.fn(),
            on: vi.fn(),
            show: vi.fn(),
            close: vi.fn(),
            isDestroyed: vi.fn(() => false),
            webContents: mockWebContents,
        };

        (BrowserWindow as unknown as MockedFunction<any>).mockImplementation(() => mockBrowserWindow);
        (BrowserWindow as any).getAllWindows = vi.fn(() => [mockBrowserWindow]);

        windowService = new WindowService();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Constructor", () => {
        it("should initialize with null main window", () => {
            expect(windowService.getMainWindow()).toBeNull();
        });

        it("should not have a main window initially", () => {
            expect(windowService.hasMainWindow()).toBe(false);
        });
    });

    describe("createMainWindow", () => {
        it("should create a new BrowserWindow with correct configuration", () => {
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
                    preload: expect.stringContaining("preload.js"),
                },
                width: 1200,
            });

            expect(window).toBe(mockBrowserWindow);
        });

        it("should load content after window creation", () => {
            windowService.createMainWindow();
            expect(mockBrowserWindow.loadFile).toHaveBeenCalled();
        });

        it("should setup window events", () => {
            windowService.createMainWindow();
            expect(mockBrowserWindow.once).toHaveBeenCalledWith("ready-to-show", expect.any(Function));
            expect(mockBrowserWindow.on).toHaveBeenCalledWith("closed", expect.any(Function));
        });

        it("should return the created window", () => {
            const window = windowService.createMainWindow();
            expect(window).toBe(mockBrowserWindow);
            expect(windowService.getMainWindow()).toBe(mockBrowserWindow);
        });
    });

    describe("loadContent", () => {
        it("should load from file in production mode", async () => {
            const { isDev } = await import("../../../electronUtils");
            vi.mocked(isDev).mockReturnValue(false);

            windowService.createMainWindow();
            expect(mockBrowserWindow.loadFile).toHaveBeenCalledWith(expect.stringContaining("index.html"));
        });

        it("should load from localhost in development mode", async () => {
            const { isDev } = await import("../../../electronUtils");
            vi.mocked(isDev).mockReturnValue(true);

            // Create a new service instance to test dev mode
            const devWindowService = new WindowService();
            devWindowService.createMainWindow();

            expect(mockBrowserWindow.loadURL).toHaveBeenCalledWith("http://localhost:5173");
            expect(mockWebContents.openDevTools).toHaveBeenCalled();
        });

        it("should return early when mainWindow is null (line 43)", () => {
            // Test the guard clause on line 43: if (!this.mainWindow) return;

            // Clear existing mocks
            vi.clearAllMocks();

            // Create service and manually call loadContent when mainWindow is null
            const testService = new WindowService();

            // Call loadContent directly when mainWindow is null (this tests line 43)
            // We access the private method through bracket notation for testing
            (testService as any).loadContent();

            // Since mainWindow is null, loadContent should return early
            // and not call any loadURL or loadFile methods
            expect(mockBrowserWindow.loadURL).not.toHaveBeenCalled();
            expect(mockBrowserWindow.loadFile).not.toHaveBeenCalled();
        });
    });

    describe("setupWindowEvents", () => {
        it("should show window when ready-to-show event is triggered", () => {
            windowService.createMainWindow();

            // Get the ready-to-show event handler
            const readyToShowHandler = mockBrowserWindow.once.mock.calls.find(
                (call: any[]) => call[0] === "ready-to-show"
            )?.[1];

            expect(readyToShowHandler).toBeDefined();

            // Trigger the event
            readyToShowHandler();

            expect(mockBrowserWindow.show).toHaveBeenCalled();
        });

        it("should set main window to null when closed event is triggered", () => {
            windowService.createMainWindow();

            // Get the closed event handler
            const closedHandler = mockBrowserWindow.on.mock.calls.find((call: any[]) => call[0] === "closed")?.[1];

            expect(closedHandler).toBeDefined();

            // Trigger the event
            closedHandler();

            expect(windowService.getMainWindow()).toBeNull();
        });

        it("should return early when mainWindow is null in setupWindowEvents (line 59)", () => {
            // Test the guard clause on line 59: if (!this.mainWindow) return;

            // Clear existing mocks
            vi.clearAllMocks();

            // Create service and manually call setupWindowEvents when mainWindow is null
            const testService = new WindowService();

            // Call setupWindowEvents directly when mainWindow is null (this tests line 59)
            // We access the private method through bracket notation for testing
            (testService as any).setupWindowEvents();

            // Since mainWindow is null, setupWindowEvents should return early
            // and not call any event setup methods
            expect(mockBrowserWindow.once).not.toHaveBeenCalled();
            expect(mockBrowserWindow.on).not.toHaveBeenCalled();
        });
    });

    describe("getMainWindow", () => {
        it("should return null when no window is created", () => {
            expect(windowService.getMainWindow()).toBeNull();
        });

        it("should return the main window when created", () => {
            windowService.createMainWindow();
            expect(windowService.getMainWindow()).toBe(mockBrowserWindow);
        });
    });

    describe("hasMainWindow", () => {
        it("should return false when no window is created", () => {
            expect(windowService.hasMainWindow()).toBe(false);
        });

        it("should return false when window is null", () => {
            expect(windowService.hasMainWindow()).toBe(false);
        });

        it("should return true when window exists and is not destroyed", () => {
            windowService.createMainWindow();
            expect(windowService.hasMainWindow()).toBe(true);
        });

        it("should return false when window is destroyed", () => {
            windowService.createMainWindow();
            mockBrowserWindow.isDestroyed.mockReturnValue(true);
            expect(windowService.hasMainWindow()).toBe(false);
        });
    });

    describe("sendToRenderer", () => {
        it("should send message to renderer when window exists", () => {
            windowService.createMainWindow();
            windowService.sendToRenderer("test-channel", { test: "data" });

            expect(mockWebContents.send).toHaveBeenCalledWith("test-channel", { test: "data" });
        });

        it("should not send message when no window exists", () => {
            windowService.sendToRenderer("test-channel", { test: "data" });
            expect(mockWebContents.send).not.toHaveBeenCalled();
        });

        it("should not send message when window is destroyed", () => {
            windowService.createMainWindow();
            mockBrowserWindow.isDestroyed.mockReturnValue(true);

            windowService.sendToRenderer("test-channel", { test: "data" });
            expect(mockWebContents.send).not.toHaveBeenCalled();
        });

        it("should send message without data parameter", () => {
            windowService.createMainWindow();
            windowService.sendToRenderer("test-channel");

            expect(mockWebContents.send).toHaveBeenCalledWith("test-channel", undefined);
        });
    });

    describe("closeMainWindow", () => {
        it("should close window when it exists", () => {
            windowService.createMainWindow();
            windowService.closeMainWindow();

            expect(mockBrowserWindow.close).toHaveBeenCalled();
        });

        it("should not throw when no window exists", () => {
            expect(() => windowService.closeMainWindow()).not.toThrow();
        });

        it("should not close window when it is destroyed", () => {
            windowService.createMainWindow();
            mockBrowserWindow.isDestroyed.mockReturnValue(true);

            windowService.closeMainWindow();
            expect(mockBrowserWindow.close).not.toHaveBeenCalled();
        });
    });

    describe("getAllWindows", () => {
        it("should return all browser windows", () => {
            const windows = windowService.getAllWindows();
            expect(windows).toEqual([mockBrowserWindow]);
            expect(BrowserWindow.getAllWindows).toHaveBeenCalled();
        });
    });
});
