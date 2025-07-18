/**
 * Centralized logging utilities for the Electron main process.
 * Provides structured logging with consistent formatting and categorization.
 */

import log from "electron-log/main";

/**
 * Creates a logger with a specific prefix for categorization.
 * @param prefix - The prefix to use for log messages (e.g., "MONITOR", "DB")
 * @returns A logger object with debug, error, info, and warn methods
 */
function createLogger(prefix: string) {
    return {
        debug: (message: string, ...args: unknown[]) => log.debug(`[${prefix}] ${message}`, ...args),
        error: (message: string, error?: unknown, ...args: unknown[]) => {
            if (error instanceof Error) {
                log.error(`[${prefix}] ${message}`, { message: error.message, stack: error.stack }, ...args);
            } else {
                log.error(`[${prefix}] ${message}`, error, ...args);
            }
        },
        info: (message: string, ...args: unknown[]) => log.info(`[${prefix}] ${message}`, ...args),
        warn: (message: string, ...args: unknown[]) => log.warn(`[${prefix}] ${message}`, ...args),
    };
}

/**
 * Centralized logger utility for the backend.
 * Provides consistent logging across all backend services.
 */
export const logger = createLogger("MONITOR");

/**
 * Database-specific logger for database operations and queries.
 */
export const dbLogger = createLogger("DB");

/**
 * Monitor-specific logger for monitoring operations and health checks.
 */
export const monitorLogger = createLogger("MONITOR");
