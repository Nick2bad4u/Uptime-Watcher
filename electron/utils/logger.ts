/**
 * Centralized logging utilities for the Electron main process.
 * Provides structured logging with consistent formatting and categorization.
 */

import log from "electron-log/main";

/**
 * Creates a logger with a specific prefix for categorization.
 *
 * @param prefix - The prefix to use for log messages (e.g., "MONITOR", "DB")
 * @returns A logger object with debug, error, info, and warn methods
 *
 * @remarks
 * The error method provides special handling for Error objects, extracting
 * both the error message and stack trace for comprehensive debugging information.
 * Non-Error objects are logged as-is for additional context.
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
 * Main backend logger for general application operations.
 * Uses "BACKEND" prefix to distinguish from specialized loggers.
 */
export const logger = createLogger("BACKEND");

/**
 * Database-specific logger for database operations and queries.
 * Uses "DB" prefix for clear categorization of database-related logs.
 */
export const dbLogger = createLogger("DB");

/**
 * Monitor-specific logger for monitoring operations and health checks.
 * Uses "MONITOR" prefix for clear categorization of monitoring-related logs.
 */
export const monitorLogger = createLogger("MONITOR");
