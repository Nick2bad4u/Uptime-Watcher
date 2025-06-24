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
    debug: (message, ...args) => {
        log.debug(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Info level - general application flow
    info: (message, ...args) => {
        log.info(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Warn level - something unexpected but not an error
    warn: (message, ...args) => {
        log.warn(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Error level - errors that should be investigated
    error: (message, error, ...args) => {
        if (error instanceof Error) {
            log.error(`[UPTIME-WATCHER] ${message}`, {
                message: error.message,
                stack: error.stack,
                name: error.name,
            }, ...args);
        }
        else if (error) {
            log.error(`[UPTIME-WATCHER] ${message}`, error, ...args);
        }
        else {
            log.error(`[UPTIME-WATCHER] ${message}`, ...args);
        }
    },
    // Verbose level - very detailed debugging
    verbose: (message, ...args) => {
        log.verbose(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Silly level - extremely detailed debugging
    silly: (message, ...args) => {
        log.silly(`[UPTIME-WATCHER] ${message}`, ...args);
    },
    // Specialized logging methods for common scenarios
    // Log site monitoring events
    site: {
        check: (identifier, status, responseTime) => {
            logger.info(`Site check: ${identifier} - Status: ${status}${responseTime ? ` (${responseTime}ms)` : ""}`);
        },
        statusChange: (identifier, oldStatus, newStatus) => {
            logger.info(`Site status change: ${identifier} - ${oldStatus} -> ${newStatus}`);
        },
        added: (identifier) => {
            logger.info(`Site added: ${identifier}`);
        },
        removed: (identifier) => {
            logger.info(`Site removed: ${identifier}`);
        },
        error: (identifier, error) => {
            if (typeof error === "string") {
                logger.error(`Site check error: ${identifier} - ${error}`);
            }
            else {
                logger.error(`Site check error: ${identifier}`, error);
            }
        },
    },
    // Log user actions
    user: {
        action: (action, details) => {
            logger.info(`User action: ${action}`, details || "");
        },
        settingsChange: (setting, oldValue, newValue) => {
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
        error: (context, error) => {
            logger.error(`Application error in ${context}`, error);
        },
        performance: (operation, duration) => {
            logger.debug(`Performance: ${operation} took ${duration}ms`);
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
    // Raw access to electron-log for special cases
    raw: log,
};
export default logger;
