"use strict";
/* eslint-disable testing-library/no-debugging-utils */
/**
 * Centralized logging service using electron-log
 * Provides consistent logging across main and renderer processes.
 * Example: logger.site.statusChange("example.com", "up", "down") // oldStatus -\> newStatus
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = __importDefault(require("electron-log/renderer"));
// Configure electron-log for renderer process
// The /renderer import handles the connection to main process automatically
renderer_1.default.transports.console.level = "debug";
renderer_1.default.transports.console.format = "[{h}:{i}:{s}.{ms}] [{level}] {text}";
// File logging will be handled by the main process via IPC
if (renderer_1.default.transports.file) {
    renderer_1.default.transports.file.level = "info";
}
// Create logger with app context
const logger = {
    // Log application lifecycle events
    app: {
        error: (context, error) => {
            logger.error(`Application error in ${context}`, error);
        },
        performance: (operation, duration) => {
            logger.debug(`Performance: ${operation} took ${duration}ms`);
        },
        started: () => {
            logger.info("Application started");
        },
        stopped: () => {
            logger.info("Application stopped");
        },
    },
    // Debug level - for development debugging
    debug: (message, ...args) => {
        renderer_1.default.debug(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Error level - errors that should be investigated
    error: (message, error, ...args) => {
        if (error instanceof Error) {
            renderer_1.default.error(`[UPTIME-WATCHER] ${message}`, {
                message: error.message,
                name: error.name,
                stack: error.stack,
            }, ...args);
        }
        else if (error) {
            renderer_1.default.error(`[UPTIME-WATCHER] ${message}`, error, ...args);
        }
        else {
            renderer_1.default.error(`[UPTIME-WATCHER] ${message}`, ...args);
        }
    },
    // Info level - general application flow
    info: (message, ...args) => {
        renderer_1.default.info(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Raw access to electron-log for special cases
    raw: renderer_1.default,
    // Silly level - extremely detailed debugging
    silly: (message, ...args) => {
        renderer_1.default.silly(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Specialized logging methods for common scenarios
    // Log site monitoring events
    site: {
        added: (identifier) => {
            logger.info(`Site added: ${identifier}`);
        },
        check: (identifier, status, responseTime) => {
            logger.info(`Site check: ${identifier} - Status: ${status}${responseTime ? ` (${responseTime}ms)` : ""}`);
        },
        error: (identifier, error) => {
            if (typeof error === "string") {
                logger.error(`Site check error: ${identifier} - ${error}`);
            }
            else {
                logger.error(`Site check error: ${identifier}`, error);
            }
        },
        removed: (identifier) => {
            logger.info(`Site removed: ${identifier}`);
        },
        statusChange: (identifier, oldStatus, newStatus) => {
            logger.info(`Site status change: ${identifier} - ${oldStatus} -> ${newStatus}`);
        },
    },
    // Log system/electron events
    system: {
        notification: (title, body) => {
            logger.debug(`Notification sent: ${title} - ${body}`);
        },
        tray: (action) => {
            logger.debug(`Tray action: ${action}`);
        },
        window: (action, windowName) => {
            logger.debug(`Window ${action}${windowName ? ` (${windowName})` : ""}`);
        },
    },
    // Log user actions
    user: {
        action: (action, details) => {
            logger.info(`User action: ${action}`, details ?? "");
        },
        settingsChange: (setting, oldValue, newValue) => {
            logger.info(`Settings change: ${setting} - ${String(oldValue)} -> ${String(newValue)}`);
        },
    },
    // Verbose level - very detailed debugging
    verbose: (message, ...args) => {
        renderer_1.default.verbose(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Warn level - something unexpected but not an error
    warn: (message, ...args) => {
        renderer_1.default.warn(`[UPTIME-WATCHER] ${message}`, ...args);
    },
};
exports.default = logger;
