/**
 * Centralized logging service using electron-log
 * Provides consistent logging across main and renderer processes
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
    debug: (message: string, ...args: any[]) => {
        log.debug(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Info level - general application flow
    info: (message: string, ...args: any[]) => {
        log.info(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Warn level - something unexpected but not an error
    warn: (message: string, ...args: any[]) => {
        log.warn(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Error level - errors that should be investigated
    error: (message: string, error?: Error | any, ...args: any[]) => {
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
    verbose: (message: string, ...args: any[]) => {
        log.verbose(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Silly level - extremely detailed debugging
    silly: (message: string, ...args: any[]) => {
        log.silly(`[UPTIME-WATCHER] ${message}`, ...args);
    },

    // Specialized logging methods for common scenarios

    // Log site monitoring events
    site: {
        check: (url: string, status: string, responseTime?: number) => {
            logger.info(`Site check: ${url} - Status: ${status}${responseTime ? ` (${responseTime}ms)` : ""}`);
        },

        statusChange: (url: string, oldStatus: string, newStatus: string) => {
            logger.info(`Site status change: ${url} - ${oldStatus} -> ${newStatus}`);
        },

        added: (url: string) => {
            logger.info(`Site added: ${url}`);
        },

        removed: (url: string) => {
            logger.info(`Site removed: ${url}`);
        },

        error: (url: string, error: Error | string) => {
            if (typeof error === "string") {
                logger.error(`Site check error: ${url} - ${error}`);
            } else {
                logger.error(`Site check error: ${url}`, error);
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
