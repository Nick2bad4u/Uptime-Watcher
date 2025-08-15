/**
 * Centralized logging utilities for the Electron main process.
 *
 * @remarks
 * Provides structured logging with consistent formatting and categorization.
 * Supports multiple specialized loggers with distinct prefixes for easy
 * identification and filtering of log messages during development and
 * debugging.
 *
 * @example Basic usage:
 *
 * ```typescript
 * import { logger, dbLogger, monitorLogger } from "./logger";
 *
 * logger.info("Application started");
 * dbLogger.debug("Query executed", { sql: "SELECT * FROM users" });
 * monitorLogger.error("Monitor check failed", error);
 * ```
 *
 * @packageDocumentation
 */

import log from "electron-log/main";

/**
 * Interface for logger instance methods.
 *
 * @remarks
 * Defines the contract for logger objects with consistent method signatures
 * across all logging instances. All methods are synchronous and handle
 * formatting internally.
 *
 * @public
 */
interface Logger {
    /**
     * Log debug information for development and troubleshooting.
     *
     * @param message - The debug message to log
     * @param args - Additional arguments for context and structured data
     */
    debug: (message: string, ...args: unknown[]) => void;

    /**
     * Log error messages with optional error objects.
     *
     * @param message - The error message to log
     * @param error - Optional error object or additional context
     * @param args - Additional arguments for context and structured data
     */
    error: (message: string, error?: unknown, ...args: unknown[]) => void;

    /**
     * Log general informational messages.
     *
     * @param message - The information message to log
     * @param args - Additional arguments for context and structured data
     */
    info: (message: string, ...args: unknown[]) => void;

    /**
     * Log warning messages for potential issues.
     *
     * @param message - The warning message to log
     * @param args - Additional arguments for context and structured data
     */
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Creates a logger with a specific prefix for categorization.
 *
 * @remarks
 * The error method provides special handling for Error objects, extracting both
 * the error message and stack trace for comprehensive debugging information.
 * Non-Error objects are logged as-is for additional context.
 *
 * @example
 *
 * ```typescript
 * const apiLogger = createLogger("API");
 * apiLogger.info("Request received", { endpoint: "/users" });
 * apiLogger.error("Database connection failed", dbError);
 * ```
 *
 * @param prefix - The prefix to use for log messages (e.g., "MONITOR", "DB")
 *
 * @returns A logger object with debug, error, info, and warn methods
 *
 * @internal
 */
function createLogger(prefix: string): Logger {
    return {
        debug: (message: string, ...args: unknown[]): void => {
            log.debug(`[${prefix}] ${message}`, ...args);
        },
        error: (message: string, error?: unknown, ...args: unknown[]): void => {
            if (error instanceof Error) {
                log.error(
                    `[${prefix}] ${message}`,
                    { message: error.message, stack: error.stack },
                    ...args
                );
            } else {
                log.error(`[${prefix}] ${message}`, error, ...args);
            }
        },
        info: (message: string, ...args: unknown[]): void => {
            log.info(`[${prefix}] ${message}`, ...args);
        },
        warn: (message: string, ...args: unknown[]): void => {
            log.warn(`[${prefix}] ${message}`, ...args);
        },
    };
}

/**
 * Main backend logger for general application operations.
 *
 * @remarks
 * Uses "BACKEND" prefix to distinguish from specialized loggers. This is the
 * primary logger for general application events, startup/shutdown,
 * configuration changes, and other non-specific operations.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "./logger";
 *
 * logger.info("Application initializing");
 * logger.warn("Configuration value missing, using default");
 * logger.error("Unexpected application error", error);
 * ```
 *
 * @public
 */
export const logger: Logger = createLogger("BACKEND");

/**
 * Database-specific logger for database operations and queries.
 *
 * @remarks
 * Uses "DB" prefix for clear categorization of database-related logs. Ideal for
 * logging SQL queries, connection events, migration operations, and database
 * performance metrics.
 *
 * @example
 *
 * ```typescript
 * import { dbLogger } from "./logger";
 *
 * dbLogger.debug("Executing query", { sql: "SELECT * FROM sites" });
 * dbLogger.info("Database migration completed", { version: "1.2.0" });
 * dbLogger.error("Connection pool exhausted", connectionError);
 * ```
 *
 * @public
 */
export const dbLogger: Logger = createLogger("DB");

/**
 * Monitor-specific logger for monitoring operations and health checks.
 *
 * @remarks
 * Uses "MONITOR" prefix for clear categorization of monitoring-related logs.
 * Perfect for logging health check results, monitor configuration changes, and
 * monitoring system performance metrics.
 *
 * @example
 *
 * ```typescript
 * import { monitorLogger } from "./logger";
 *
 * monitorLogger.info("Monitor check started", { siteId: "abc123" });
 * monitorLogger.debug("Response time recorded", {
 *     time: 245,
 *     url: "https://example.com",
 * });
 * monitorLogger.error("Monitor check failed", {
 *     siteId: "abc123",
 *     error: "timeout",
 * });
 * ```
 *
 * @public
 */
export const monitorLogger: Logger = createLogger("MONITOR");
