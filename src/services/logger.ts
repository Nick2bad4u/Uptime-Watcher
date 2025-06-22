/**
 * Centralized logging service using electron-log
 * Provides consistent logging across ma        action: (action: string, details?: unknown) => {
            logger.info(`User action: ${action}`, details);
        },

        settingsChange: (setting: string, oldValue: unknown, newValue: unknown) => {d renderer processes
 */

import log from "electron-log/renderer";

// Configure electron-log for renderer process
// The /renderer import handles the connection to main process automatically
log.transports.console.level = "debug";
log.transports.console.format = "[{h}:{i}:{s}.{ms}] [{level}] {text}";

// File logging will be handled by the main process via IPC
if (log.transports.file) {
    log.transports.file.level = "info";
}

// Create logger with app context
const logger = {
    // Debug level - for development debugging
    debug: (message: string, ...args: unknown[]) => {
        log.debug(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Info level - general application flow
    info: (message: string, ...args: unknown[]) => {
        log.info(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Warn level - something unexpected but not an error
    warn: (message: string, ...args: unknown[]) => {
        log.warn(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Error level - errors that should be investigated
    error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
        if (error instanceof Error) {
            log.error(
                `[UPTIME-WATCHER] ${message}`,
                {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
                ...args
            );
        } else if (error) {
            log.error(`[UPTIME-WATCHER] ${message}`, error, ...args);
        } else {
            log.error(`[UPTIME-WATCHER] ${message}`, ...args);
        }
    },

    // Verbose level - very detailed debugging
    verbose: (message: string, ...args: unknown[]) => {
        log.verbose(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Silly level - extremely detailed debugging
    silly: (message: string, ...args: unknown[]) => {
        log.silly(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Specialized logging methods for common scenarios

    // Log site monitoring events
    site: {
        check: (identifier: string, status: string, responseTime?: number) => {
            logger.info(`Site check: ${identifier} - Status: ${status}${responseTime ? ` (${responseTime}ms)` : ""}`);
        },

        statusChange: (identifier: string, oldStatus: string, newStatus: string) => {
            logger.info(`Site status change: ${identifier} - ${oldStatus} -> ${newStatus}`);
        },

        added: (identifier: string) => {
            logger.info(`Site added: ${identifier}`);
        },

        removed: (identifier: string) => {
            logger.info(`Site removed: ${identifier}`);
        },

        error: (identifier: string, error: Error | string) => {
            if (typeof error === "string") {
                logger.error(`Site check error: ${identifier} - ${error}`);
            } else {
                logger.error(`Site check error: ${identifier}`, error);
            }
        },
    },

    // Log user actions
    user: {
        action: (action: string, details?: any) => {
            logger.info(`User action: ${action}`, details || "");
        },

        settingsChange: (setting: string, oldValue: any, newValue: any) => {
            logger.info(`Settings change: ${setting} - ${oldValue} -> ${newValue}`);
        },
    },

    // Log application lifecycle events
    app: {
        started: () => {
            logger.info("Application started");
        },

        stopped: () => {
            logger.info("Application stopped");
        },

        error: (context: string, error: Error) => {
            logger.error(`Application error in ${context}`, error);
        },

        performance: (operation: string, duration: number) => {
            logger.debug(`Performance: ${operation} took ${duration}ms`);
        },
    },

    // Log system/electron events
    system: {
        notification: (title: string, body: string) => {
            logger.debug(`Notification sent: ${title} - ${body}`);
        },

        tray: (action: string) => {
            logger.debug(`Tray action: ${action}`);
        },

        window: (action: string, windowName?: string) => {
            logger.debug(`Window ${action}${windowName ? ` (${windowName})` : ""}`);
        },
    },

    // Raw access to electron-log for special cases
    raw: log,
};

export default logger;

// Also export a typed interface for better IDE support
export type Logger = typeof logger;
