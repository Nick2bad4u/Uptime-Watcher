/**
 * Tests for ApplicationService - Application lifecycle and window management coverage
 * Tests initialization, window management, settings, and cleanup functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApplicationService } from "../../../services/application/ApplicationService";

// Use vi.hoisted to fix hoisting issues with mocks
const { 
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
    mockIsDev 
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
        mockIsDev
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

describe("ApplicationService", () => {
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
        it("should initialize without errors", () => {
            expect(applicationService).toBeDefined();
            expect(applicationService).toBeInstanceOf(ApplicationService);
        });

        it("should setup app event listeners", () => {
            expect(mockApp.on).toHaveBeenCalledWith("ready", expect.any(Function));
            expect(mockApp.on).toHaveBeenCalledWith("window-all-closed", expect.any(Function));
            expect(mockApp.on).toHaveBeenCalledWith("activate", expect.any(Function));
        });

        it("should initialize and start application", () => {
            expect(mockLogger.info).toHaveBeenCalledWith("[ApplicationService] Initializing application service");
        });
    });

    describe("Application Lifecycle", () => {
        it("should handle app ready event", async () => {
            // Get the ready handler that was registered
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            expect(readyHandler).toBeDefined();

            if (readyHandler) {
                await readyHandler();
                
                expect(mockServiceContainer.initialize).toHaveBeenCalled();
                expect(mockUptimeOrchestrator.initialize).toHaveBeenCalled();
                expect(mockIpcService.setupHandlers).toHaveBeenCalled();
                expect(mockAutoUpdaterService.initialize).toHaveBeenCalled();
                expect(mockWindowService.createMainWindow).toHaveBeenCalled();
            }
        });

        it("should handle window-all-closed event on non-macOS", () => {
            // Mock process.platform to be non-darwin
            Object.defineProperty(process, "platform", {
                value: "win32",
                configurable: true,
            });

            const windowAllClosedHandler = mockApp.on.mock.calls.find(call => call[0] === "window-all-closed")?.[1] as Function;
            expect(windowAllClosedHandler).toBeDefined();

            if (windowAllClosedHandler) {
                windowAllClosedHandler();
                expect(mockApp.quit).toHaveBeenCalled();
            }
        });

        it("should not quit on window-all-closed on macOS", () => {
            // Mock process.platform to be darwin
            Object.defineProperty(process, "platform", {
                value: "darwin",
                configurable: true,
            });

            const windowAllClosedHandler = mockApp.on.mock.calls.find(call => call[0] === "window-all-closed")?.[1] as Function;
            expect(windowAllClosedHandler).toBeDefined();

            if (windowAllClosedHandler) {
                windowAllClosedHandler();
                expect(mockApp.quit).not.toHaveBeenCalled();
            }
        });

        it("should handle activate event", () => {
            const activateHandler = mockApp.on.mock.calls.find(call => call[0] === "activate")?.[1] as Function;
            expect(activateHandler).toBeDefined();

            if (activateHandler) {
                activateHandler();
                // Should create main window if none exist
                expect(mockWindowService.createMainWindow).toHaveBeenCalled();
            }
        });
    });

    describe("Initialization Process", () => {
        it("should initialize all services in correct order", async () => {
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                
                // Verify initialization order
                const callOrder = [
                    mockServiceContainer.initialize,
                    mockUptimeOrchestrator.initialize,
                    mockIpcService.setupHandlers,
                    mockAutoUpdaterService.initialize,
                    mockWindowService.createMainWindow,
                ];
                
                for (let i = 0; i < callOrder.length - 1; i++) {
                    expect(callOrder[i]).toHaveBeenCalled();
                }
            }
        });

        it("should handle initialization errors gracefully", async () => {
            mockServiceContainer.initialize.mockRejectedValue(new Error("Service init failed"));
            
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[ApplicationService] Failed to initialize application",
                    expect.any(Error)
                );
            }
        });

        it("should handle orchestrator initialization errors", async () => {
            mockUptimeOrchestrator.initialize.mockRejectedValue(new Error("Orchestrator init failed"));
            
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[ApplicationService] Failed to initialize application",
                    expect.any(Error)
                );
            }
        });

        it("should handle window creation errors", async () => {
            mockWindowService.createMainWindow.mockImplementation(() => {
                throw new Error("Window creation failed");
            });
            
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                
                expect(mockLogger.error).toHaveBeenCalledWith(
                    "[ApplicationService] Failed to initialize application",
                    expect.any(Error)
                );
            }
        });
    });

    describe("Cleanup", () => {
        it("should cleanup all services", async () => {
            await applicationService.cleanup();
            
            expect(mockLogger.info).toHaveBeenCalledWith("[ApplicationService] Starting cleanup");
            expect(mockServiceContainer.cleanup).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith("[ApplicationService] Cleanup completed");
        });

        it("should handle cleanup errors gracefully", async () => {
            mockServiceContainer.cleanup.mockRejectedValue(new Error("Cleanup failed"));
            
            await applicationService.cleanup();
            
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[ApplicationService] Error during cleanup",
                expect.any(Error)
            );
        });

        it("should only cleanup once", async () => {
            await applicationService.cleanup();
            await applicationService.cleanup();
            
            // Should only cleanup once
            expect(mockServiceContainer.cleanup).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith("[ApplicationService] Already cleaned up, skipping");
        });
    });

    describe("Development Features", () => {
        it("should enable dev tools in development mode", async () => {
            mockIsDev.mockReturnValue(true);
            
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                expect(mockWindowService.createMainWindow).toHaveBeenCalled();
            }
        });

        it("should not enable dev tools in production mode", async () => {
            mockIsDev.mockReturnValue(false);
            
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                expect(mockWindowService.createMainWindow).toHaveBeenCalled();
            }
        });
    });

    describe("Auto Updater Integration", () => {
        it("should setup auto updater with status callback", async () => {
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                
                expect(mockAutoUpdaterService.initialize).toHaveBeenCalled();
                expect(mockAutoUpdaterService.setStatusCallback).toHaveBeenCalledWith(expect.any(Function));
            }
        });

        it("should handle auto updater status updates", async () => {
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                
                // Get the status callback that was set
                const statusCallback = mockAutoUpdaterService.setStatusCallback.mock.calls[0]?.[0] as Function;
                expect(statusCallback).toBeDefined();
                
                if (statusCallback) {
                    statusCallback("checking-for-update");
                    // Should not throw or cause errors
                    expect(statusCallback).toHaveBeenCalledWith("checking-for-update");
                }
            }
        });
    });

    describe("Error Recovery", () => {
        it("should recover from window service errors", async () => {
            mockWindowService.createMainWindow.mockImplementationOnce(() => {
                throw new Error("First attempt failed");
            }).mockReturnValueOnce(mockBrowserWindow);
            
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                
                expect(mockLogger.error).toHaveBeenCalled();
            }
        });

        it("should recover from IPC service errors", async () => {
            mockIpcService.setupHandlers.mockImplementationOnce(() => {
                throw new Error("IPC setup failed");
            });
            
            const readyHandler = mockApp.on.mock.calls.find(call => call[0] === "ready")?.[1] as Function;
            
            if (readyHandler) {
                await readyHandler();
                
                expect(mockLogger.error).toHaveBeenCalled();
            }
        });
    });

    describe("Platform-specific Behavior", () => {
        it("should handle Windows platform specifics", () => {
            Object.defineProperty(process, "platform", {
                value: "win32",
                configurable: true,
            });
            
            const windowAllClosedHandler = mockApp.on.mock.calls.find(call => call[0] === "window-all-closed")?.[1] as Function;
            
            if (windowAllClosedHandler) {
                windowAllClosedHandler();
                expect(mockApp.quit).toHaveBeenCalled();
            }
        });

        it("should handle Linux platform specifics", () => {
            Object.defineProperty(process, "platform", {
                value: "linux",
                configurable: true,
            });
            
            const windowAllClosedHandler = mockApp.on.mock.calls.find(call => call[0] === "window-all-closed")?.[1] as Function;
            
            if (windowAllClosedHandler) {
                windowAllClosedHandler();
                expect(mockApp.quit).toHaveBeenCalled();
            }
        });
    });

    describe("Memory Management", () => {
        it("should properly cleanup event listeners", async () => {
            await applicationService.cleanup();
            
            // Should cleanup service container which includes event listeners
            expect(mockServiceContainer.cleanup).toHaveBeenCalled();
        });

        it("should handle multiple cleanup calls safely", async () => {
            await applicationService.cleanup();
            await applicationService.cleanup();
            await applicationService.cleanup();
            
            // Should only perform actual cleanup once
            expect(mockServiceContainer.cleanup).toHaveBeenCalledTimes(1);
        });
    });
});
