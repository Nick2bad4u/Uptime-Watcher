"use strict";
/* eslint-disable testing-library/no-debugging-utils */
/**
 * Centralized logging service using electron-log
 * Provides consistent logging across main and renderer processes.
 * Example: logger.site.statusChange("example.com", "up", "down") // oldStatus -\> newStatus
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var renderer_1 = require("electron-log/renderer");
// Configure electron-log for renderer process
// The /renderer import handles the connection to main process automatically
renderer_1["default"].transports.console.level = "debug";
renderer_1["default"].transports.console.format = "[{h}:{i}:{s}.{ms}] [{level}] {text}";
// File logging will be handled by the main process via IPC
if (renderer_1["default"].transports.file) {
    renderer_1["default"].transports.file.level = "info";
}
// Create logger with app context
var logger = {
    // Log application lifecycle events
    app: {
        error: function (context, error) {
            logger.error("Application error in " + context, error);
        },
        performance: function (operation, duration) {
            logger.debug("Performance: " + operation + " took " + duration + "ms");
        },
        started: function () {
            logger.info("Application started");
        },
        stopped: function () {
            logger.info("Application stopped");
        }
    },
    // Debug level - for development debugging
    debug: function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        renderer_1["default"].debug.apply(renderer_1["default"], __spreadArrays(["[UPTIME-WATCHER] " + message], args));
    },
    // Error level - errors that should be investigated
    error: function (message, error) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (error instanceof Error) {
            renderer_1["default"].error.apply(renderer_1["default"], __spreadArrays(["[UPTIME-WATCHER] " + message, {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                }], args));
        }
        else if (error) {
            renderer_1["default"].error.apply(renderer_1["default"], __spreadArrays(["[UPTIME-WATCHER] " + message, error], args));
        }
        else {
            renderer_1["default"].error.apply(renderer_1["default"], __spreadArrays(["[UPTIME-WATCHER] " + message], args));
        }
    },
    // Info level - general application flow
    info: function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        renderer_1["default"].info.apply(renderer_1["default"], __spreadArrays(["[UPTIME-WATCHER] " + message], args));
    },
    // Raw access to electron-log for special cases
    raw: renderer_1["default"],
    // Silly level - extremely detailed debugging
    silly: function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        renderer_1["default"].silly.apply(renderer_1["default"], __spreadArrays(["[UPTIME-WATCHER] " + message], args));
    },
    // Specialized logging methods for common scenarios
    // Log site monitoring events
    site: {
        added: function (identifier) {
            logger.info("Site added: " + identifier);
        },
        check: function (identifier, status, responseTime) {
            logger.info("Site check: " + identifier + " - Status: " + status + (responseTime ? " (" + responseTime + "ms)" : ""));
        },
        error: function (identifier, error) {
            if (typeof error === "string") {
                logger.error("Site check error: " + identifier + " - " + error);
            }
            else {
                logger.error("Site check error: " + identifier, error);
            }
        },
        removed: function (identifier) {
            logger.info("Site removed: " + identifier);
        },
        statusChange: function (identifier, oldStatus, newStatus) {
            logger.info("Site status change: " + identifier + " - " + oldStatus + " -> " + newStatus);
        }
    },
    // Log system/electron events
    system: {
        notification: function (title, body) {
            logger.debug("Notification sent: " + title + " - " + body);
        },
        tray: function (action) {
            logger.debug("Tray action: " + action);
        },
        window: function (action, windowName) {
            logger.debug("Window " + action + (windowName ? " (" + windowName + ")" : ""));
        }
    },
    // Log user actions
    user: {
        action: function (action, details) {
            logger.info("User action: " + action, details !== null && details !== void 0 ? details : "");
        },
        settingsChange: function (setting, oldValue, newValue) {
            logger.info("Settings change: " + setting + " - " + String(oldValue) + " -> " + String(newValue));
        }
    },
    // Verbose level - very detailed debugging
    verbose: function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        renderer_1["default"].verbose.apply(renderer_1["default"], __spreadArrays(["[UPTIME-WATCHER] " + message], args));
    },
    // Warn level - something unexpected but not an error
    warn: function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        renderer_1["default"].warn.apply(renderer_1["default"], __spreadArrays(["[UPTIME-WATCHER] " + message], args));
    }
};
exports["default"] = logger;
