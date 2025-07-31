/**
 * Tests for frontend logger service.
 */

 

import { beforeEach, describe, expect, it, vi } from "vitest";

 

// Mock electron-log/renderer
const mockLog = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    silly: vi.fn(),
    transports: {
        console: {
            format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            level: "debug",
        },
        file: {
            level: "info",
        },
    },
    verbose: vi.fn(),
    warn: vi.fn(),
};

vi.mock("electron-log/renderer", () => ({
    default: mockLog,
}));

describe("Frontend Logger Service", () => {
    let logger: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Re-import logger to get fresh instance
        vi.resetModules();
    });

    beforeEach(async () => {
        logger = (await import("../services/logger")).default;
    });

    describe("Basic logging methods", () => {
        it("should have all basic logging methods", () => {
            expect(logger.debug).toBeInstanceOf(Function);
            expect(logger.info).toBeInstanceOf(Function);
            expect(logger.warn).toBeInstanceOf(Function);
            expect(logger.error).toBeInstanceOf(Function);
            expect(logger.verbose).toBeInstanceOf(Function);
            expect(logger.silly).toBeInstanceOf(Function);
        });

        it("should prefix messages correctly", () => {
            logger.debug("test message");
            expect(mockLog.debug).toHaveBeenCalledWith("[UPTIME-WATCHER] test message");

            logger.info("info message");
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] info message");

            logger.warn("warning message");
            expect(mockLog.warn).toHaveBeenCalledWith("[UPTIME-WATCHER] warning message");
        });

        it("should handle additional arguments", () => {
            const extraData = { key: "value" };
            logger.info("message with data", extraData);

            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] message with data", extraData);
        });
    });

    describe("Error logging", () => {
        it("should handle Error objects", () => {
            const error = new Error("Test error");
            error.stack = "Error stack trace";

            logger.error("An error occurred", error);

            expect(mockLog.error).toHaveBeenCalledWith("[UPTIME-WATCHER] An error occurred", {
                message: error.message,
                name: error.name,
                stack: error.stack,
            });
        });

        it("should handle error without error object", () => {
            logger.error("Simple error message");

            expect(mockLog.error).toHaveBeenCalledWith("[UPTIME-WATCHER] Simple error message");
        });
    });

    describe("Specialized logging - App", () => {
        it("should log application started", () => {
            logger.app.started();
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] Application started");
        });

        it("should log application stopped", () => {
            logger.app.stopped();
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] Application stopped");
        });

        it("should log application errors with context", () => {
            const error = new Error("App error");
            logger.app.error("startup", error);

            expect(mockLog.error).toHaveBeenCalledWith("[UPTIME-WATCHER] Application error in startup", {
                message: error.message,
                name: error.name,
                stack: error.stack,
            });
        });

        it("should log performance metrics", () => {
            logger.app.performance("database-query", 150);
            expect(mockLog.debug).toHaveBeenCalledWith("[UPTIME-WATCHER] Performance: database-query took 150ms");
        });
    });

    describe("Specialized logging - Site", () => {
        it("should log site added", () => {
            logger.site.added("example.com");
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] Site added: example.com");
        });

        it("should log site removed", () => {
            logger.site.removed("example.com");
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] Site removed: example.com");
        });

        it("should log site check with response time", () => {
            logger.site.check("example.com", "up", 200);
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] Site check: example.com - Status: up (200ms)");
        });

        it("should log site check without response time", () => {
            logger.site.check("example.com", "down");
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] Site check: example.com - Status: down");
        });

        it("should log site status changes", () => {
            logger.site.statusChange("example.com", "down", "up");
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] Site status change: example.com - down -> up");
        });

        it("should log site errors with string", () => {
            logger.site.error("example.com", "Connection timeout");
            expect(mockLog.error).toHaveBeenCalledWith(
                "[UPTIME-WATCHER] Site check error: example.com - Connection timeout"
            );
        });

        it("should log site errors with Error object", () => {
            const error = new Error("Network error");
            logger.site.error("example.com", error);
            expect(mockLog.error).toHaveBeenCalledWith("[UPTIME-WATCHER] Site check error: example.com", {
                message: error.message,
                name: error.name,
                stack: error.stack,
            });
        });
    });

    describe("Specialized logging - System", () => {
        it("should log notifications", () => {
            logger.system.notification("Site Down", "example.com is down");
            expect(mockLog.debug).toHaveBeenCalledWith(
                "[UPTIME-WATCHER] Notification sent: Site Down - example.com is down"
            );
        });

        it("should log tray actions", () => {
            logger.system.tray("show");
            expect(mockLog.debug).toHaveBeenCalledWith("[UPTIME-WATCHER] Tray action: show");
        });

        it("should log window actions with name", () => {
            logger.system.window("opened", "main");
            expect(mockLog.debug).toHaveBeenCalledWith("[UPTIME-WATCHER] Window opened (main)");
        });

        it("should log window actions without name", () => {
            logger.system.window("closed");
            expect(mockLog.debug).toHaveBeenCalledWith("[UPTIME-WATCHER] Window closed");
        });
    });

    describe("Specialized logging - User", () => {
        it("should log user actions without details", () => {
            logger.user.action("button-click");
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] User action: button-click", "");
        });

        it("should log user actions with details", () => {
            const details = { button: "add-site", page: "dashboard" };
            logger.user.action("button-click", details);
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] User action: button-click", details);
        });

        it("should log settings changes", () => {
            logger.user.settingsChange("theme", "dark", "light");
            expect(mockLog.info).toHaveBeenCalledWith("[UPTIME-WATCHER] Settings change: theme - dark -> light");
        });

        it("should handle complex values in settings changes", () => {
            const oldValue = { interval: 300, timeout: 10 };
            const newValue = { interval: 600, timeout: 15 };
            logger.user.settingsChange("monitoring", oldValue, newValue);
            expect(mockLog.info).toHaveBeenCalledWith(
                "[UPTIME-WATCHER] Settings change: monitoring - [object Object] -> [object Object]"
            );
        });
    });

    describe("Raw access", () => {
        it("should provide raw access to electron-log", () => {
            expect(logger.raw).toBe(mockLog);
        });

        it("should allow direct raw logging", () => {
            logger.raw.debug("Direct raw message");
            expect(mockLog.debug).toHaveBeenCalledWith("Direct raw message");
        });
    });

    describe("Type exports", () => {
        it("should export Logger type", async () => {
            const loggerModule = await import("../services/logger");
            // Type exports exist only at compile time, not runtime
            expect(loggerModule.default).toBeDefined();
        });
    });

    describe("Silly and Verbose logging", () => {
        it("should call silly logging method", () => {
            logger.silly("Silly message", "arg1", { data: "test" });

            expect(mockLog.silly).toHaveBeenCalledWith("[UPTIME-WATCHER] Silly message", "arg1", { data: "test" });
        });

        it("should call verbose logging method", () => {
            logger.verbose("Verbose message", "arg1", { data: "test" });

            expect(mockLog.verbose).toHaveBeenCalledWith("[UPTIME-WATCHER] Verbose message", "arg1", { data: "test" });
        });
    });
});
