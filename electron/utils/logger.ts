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

import type { Logger } from "@shared/utils/logger/interfaces";

import {
    buildErrorLogArguments,
    buildLogArguments,
} from "@shared/utils/logger/common";
import { extractLogContext } from "@shared/utils/loggingContext";
import log from "electron-log/main";

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
            const { context, remaining } = extractLogContext(args, "debug");
            const logArguments = buildLogArguments(prefix, message, remaining);
            const finalArgs = context
                ? [logArguments[0], context, ...logArguments.slice(1)]
                : Array.from(logArguments);
            log.debug(...finalArgs);
        },
        error: (message: string, error?: unknown, ...args: unknown[]): void => {
            const { context, remaining } = extractLogContext(args, "error");
            const logArguments = buildErrorLogArguments(
                prefix,
                message,
                error,
                remaining
            );
            const finalArgs = context
                ? [logArguments[0], context, ...logArguments.slice(1)]
                : Array.from(logArguments);
            log.error(...finalArgs);
        },
        info: (message: string, ...args: unknown[]): void => {
            const { context, remaining } = extractLogContext(args, "info");
            const logArguments = buildLogArguments(prefix, message, remaining);
            const finalArgs = context
                ? [logArguments[0], context, ...logArguments.slice(1)]
                : Array.from(logArguments);
            log.info(...finalArgs);
        },
        warn: (message: string, ...args: unknown[]): void => {
            const { context, remaining } = extractLogContext(args, "warn");
            const logArguments = buildLogArguments(prefix, message, remaining);
            const finalArgs = context
                ? [logArguments[0], context, ...logArguments.slice(1)]
                : Array.from(logArguments);
            log.warn(...finalArgs);
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
 * monitorLogger.info("Monitor check started", {
 *     siteIdentifier: "abc123",
 * });
 * monitorLogger.debug("Response time recorded", {
 *     time: 245,
 *     url: "https://example.com",
 * });
 * monitorLogger.error("Monitor check failed", {
 *     siteIdentifier: "abc123",
 *     error: "timeout",
 * });
 * ```
 *
 * @public
 */
export const monitorLogger: Logger = createLogger("MONITOR");

/**
 * Diagnostics-focused logger for IPC bridge and runtime health metrics.
 *
 * @remarks
 * Prefixed with "DIAGNOSTICS" so structured log pipelines and dashboards can
 * filter runtime health snapshots independently of general backend logs.
 */
export const diagnosticsLogger: Logger = createLogger("DIAGNOSTICS");
