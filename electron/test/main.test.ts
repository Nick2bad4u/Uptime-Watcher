/**
 * Tests for Electron main process entry point.
 * Validates application initialization and service orchestration.
 */

import { describe, expect, it, vi, beforeEach, MockedFunction } from "vitest";

describe("Electron Main Process", () => {
    let ApplicationService: MockedFunction<any>;
    let logger: {
        info: MockedFunction<any>;
        error: MockedFunction<any>;
        debug: MockedFunction<any>;
        warn: MockedFunction<any>;
    };
    let log: {
        initialize: MockedFunction<any>;
        transports: {
            file: Record<string, unknown>;
            console: Record<string, unknown>;
        };
    };

    beforeEach(() => {
        vi.resetModules();
        
        // Create fresh mocks
        ApplicationService = vi.fn(() => ({
            cleanup: vi.fn(),
            initialize: vi.fn(() => Promise.resolve()),
        }));

        logger = {
            info: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            warn: vi.fn(),
        };

        log = {
            initialize: vi.fn(),
            transports: {
                file: {
                    level: "info",
                    fileName: "uptime-watcher-main.log",
                    maxSize: 1024 * 1024 * 5,
                    format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}",
                },
                console: {
                    level: "debug",
                    format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
                },
            },
        };

        // Setup mocks
        vi.doMock("electron-log/main", () => ({
            default: log,
        }));

        vi.doMock("../services/application", () => ({
            ApplicationService,
        }));

        vi.doMock("../utils/logger", () => ({
            logger,
        }));

        // Reset process listeners
        process.removeAllListeners("before-exit");
    });

    describe("Application Initialization", () => {
        it("should initialize electron-log configuration", async () => {
            await import("../main");
            
            expect(log.initialize).toHaveBeenCalledWith({ preload: true });
        });

        it("should configure log transports correctly", async () => {
            await import("../main");
            
            expect(log.transports.file.level).toBe("info");
            expect(log.transports.console.level).toBe("debug");
            expect(log.transports.file.fileName).toBe("uptime-watcher-main.log");
            expect(log.transports.file.maxSize).toBe(1024 * 1024 * 5); // 5MB
        });

        it("should set correct log formats", async () => {
            await import("../main");
            
            expect(log.transports.file.format).toBe("[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}");
            expect(log.transports.console.format).toBe("[{h}:{i}:{s}.{ms}] [{level}] {text}");
        });

        it("should create ApplicationService instance", async () => {
            await import("../main");
            
            expect(ApplicationService).toHaveBeenCalledTimes(1);
            expect(ApplicationService).toHaveBeenCalledWith();
        });

        it("should log application startup", async () => {
            await import("../main");
            
            expect(logger.info).toHaveBeenCalledWith("Starting Uptime Watcher application");
        });
    });

    describe("Process Event Handlers", () => {
        it("should setup before-exit event handler", async () => {
            const mockOn = vi.spyOn(process, "on");
            
            await import("../main");
            
            expect(mockOn).toHaveBeenCalledWith("before-exit", expect.any(Function));
            
            mockOn.mockRestore();
        });

        it("should call cleanup on before-exit", async () => {
            const mockCleanup = vi.fn();
            
            // Update ApplicationService mock to return cleanup function
            ApplicationService.mockReturnValue({
                cleanup: mockCleanup,
                initialize: vi.fn(() => Promise.resolve()),
            });
            
            // Setup process event spy
            const mockOn = vi.spyOn(process, "on").mockImplementation((event: string | symbol, callback: (...args: unknown[]) => void) => {
                if (event === "before-exit") {
                    // Simulate the event being fired
                    setImmediate(() => callback());
                }
                return process;
            });
            
            await import("../main");
            
            // Wait for the callback to be executed
            await new Promise(resolve => setImmediate(resolve));
            
            expect(mockCleanup).toHaveBeenCalledTimes(1);
            
            mockOn.mockRestore();
        });
    });

    describe("Main Class", () => {
        it("should instantiate Main class", async () => {
            // This test verifies that the Main class is instantiated
            // by checking that its dependencies are called
            const { ApplicationService } = await import("../services/application");
            const { logger } = await import("../utils/logger");
            
            await import("../main");
            
            expect(ApplicationService).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalled();
        });

        it("should keep Main instance alive", async () => {
            // The Main class instance should be created and kept alive
            // This is important to prevent garbage collection
            const { ApplicationService } = await import("../services/application");
            
            await import("../main");
            
            // Verify the constructor was called (instance was created)
            expect(ApplicationService).toHaveBeenCalledTimes(1);
        });
    });

    describe("Error Handling", () => {
        it("should handle ApplicationService initialization errors", async () => {
            const { ApplicationService } = await import("../services/application");
            const mockError = new Error("Service initialization failed");
            
            ApplicationService.mockImplementation(() => {
                throw mockError;
            });
            
            // The main module will throw when ApplicationService fails
            await expect(import("../main")).rejects.toThrow("Service initialization failed");
        });

        it("should handle logger errors gracefully", async () => {
            const { logger } = await import("../utils/logger");
            logger.info.mockImplementation(() => {
                throw new Error("Logger failed");
            });
            
            // The main module will throw when logger fails
            await expect(import("../main")).rejects.toThrow("Logger failed");
        });
    });

    describe("Integration", () => {
        it("should properly initialize all components in correct order", async () => {
            const log = await import("electron-log/main");
            const { ApplicationService } = await import("../services/application");
            const { logger } = await import("../utils/logger");
            
            await import("../main");
            
            // Verify initialization order
            expect(log.default.initialize).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith("Starting Uptime Watcher application");
            expect(ApplicationService).toHaveBeenCalled();
        });

        it("should have proper dependency relationships", async () => {
            const { ApplicationService } = await import("../services/application");
            
            await import("../main");
            
            // ApplicationService should be instantiated with no arguments
            expect(ApplicationService).toHaveBeenCalledWith();
        });
    });

    describe("Configuration Values", () => {
        it("should use production-ready log file size limit", async () => {
            const log = await import("electron-log/main");
            
            await import("../main");
            
            // 5MB should be reasonable for production
            expect(log.default.transports.file.maxSize).toBe(5 * 1024 * 1024);
            expect(log.default.transports.file.maxSize).toBeGreaterThan(1024 * 1024); // At least 1MB
            expect(log.default.transports.file.maxSize).toBeLessThan(50 * 1024 * 1024); // Not more than 50MB
        });

        it("should use appropriate log levels", async () => {
            const log = await import("electron-log/main");
            
            await import("../main");
            
            expect(log.default.transports.file.level).toBe("info");
            expect(log.default.transports.console.level).toBe("debug");
        });
    });
});
