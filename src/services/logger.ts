/**
 * Centralized logging service using electron-log for consistent logging across
 * processes.
 *
 * @remarks
 * Provides structured logging functionality organized by functional domains
 * (app, site, monitor, store) for contextual logging that's easy to filter.
 *
 * Uses electron-log/renderer for proper renderer process logging that
 * automatically forwards logs to the main process via IPC for centralized file
 * logging while maintaining console output in the renderer process for
 * development.
 *
 * @packageDocumentation
 */

import type {
    AppLogger,
    SiteLogger,
    SystemLogger,
    UnifiedLogger,
    UserLogger,
} from "@shared/utils/logger/interfaces";
import type { RendererLogger } from "electron-log";
import type { UnknownRecord } from "type-fest";

import log from "electron-log/renderer";

/**
 * Interface for the logger configuration.
 *
 * @remarks
 * Extends the unified logger interface with specialized logging methods for
 * frontend-specific functionality while maintaining compatibility with the
 * backend logger interface.
 */
interface LoggerInterface extends UnifiedLogger {
    // Specialized logging methods for common scenarios
    // Log application lifecycle events
    app: AppLogger;
    /**
     * Raw access to the underlying electron-log instance.
     *
     * @remarks
     * Use with caution! Direct access bypasses the application's logging
     * conventions and structured format. Only use for advanced scenarios where
     * the standard logger methods are insufficient.
     *
     * @example
     *
     * ```typescript
     * // Only use when absolutely necessary
     * logger.raw.transports.file.level = "warn";
     * ```
     */
    raw: RendererLogger & {
        default: RendererLogger;
    };
    // Log site monitoring events
    site: SiteLogger;
    // Log system/electron events
    system: SystemLogger;
    // Log user actions
    user: UserLogger;
}

/**
 * Type-safe access to log transports. Avoids index signature issues with
 * transport properties.
 */
interface LogTransports {
    console: {
        format: string;
        level: string;
    };
    file?: {
        level: string;
    };
}

/**
 * Safely access a log transport property.
 *
 * @param transportName - Name of the transport
 *
 * @returns Transport object or undefined if not available
 */
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe: Logger transport access with known structure */
function getLogTransport<K extends keyof LogTransports>(
    transportName: K
): LogTransports[K] | undefined {
    const transports = log.transports as unknown as UnknownRecord;

    if (transportName in transports) {
        return transports[transportName] as LogTransports[K];
    }

    return undefined;
}
/* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after safe log level parsing from unknown input */

// Configure electron-log for renderer process
// The /renderer import is specifically chosen because:
// 1. It handles IPC communication with main process automatically
// 2. Provides console logging in renderer while forwarding to main for file
// logging 3. Avoids direct file access conflicts that would occur with main
// process logging Check if we're in production mode (Vite sets MODE to
// 'production' in production builds)
const metaEnv = import.meta as { env?: { MODE?: string } };
const isProduction = metaEnv.env?.MODE === "production";
log.transports.console.level = isProduction ? "info" : "debug";
log.transports.console.format = "[{h}:{i}:{s}.{ms}] [{level}] {text}";

// File logging is handled by the main process via IPC communication
// Only configure if the transport exists and we're in a proper renderer context
const fileTransport = getLogTransport("file");
if (fileTransport && typeof window !== "undefined") {
    fileTransport.level = "info";
}

// Create base logger methods
const baseLoggerMethods = {
    // Debug level - for development debugging
    debug: (message: string, ...args: unknown[]): void => {
        try {
            if (args.length > 0) {
                log.debug(`[UPTIME-WATCHER] ${message}`, ...args);
            } else {
                log.debug(`[UPTIME-WATCHER] ${message}`);
            }
        } catch {
            // Silently ignore logging errors to prevent application crashes
        }
    },
    // Error level - errors that should be investigated
    error: (message: string, error?: unknown, ...args: unknown[]): void => {
        try {
            if (error instanceof Error) {
                const errorData = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                };
                if (args.length > 0) {
                    log.error(
                        `[UPTIME-WATCHER] ${message}`,
                        errorData,
                        ...args
                    );
                } else {
                    log.error(`[UPTIME-WATCHER] ${message}`, errorData);
                }
            } else if (error === undefined) {
                // No error object, just message and args
                if (args.length > 0) {
                    log.error(`[UPTIME-WATCHER] ${message}`, ...args);
                } else {
                    log.error(`[UPTIME-WATCHER] ${message}`);
                }
            } else if (args.length > 0) {
                // Error is defined but not an Error instance
                log.error(`[UPTIME-WATCHER] ${message}`, error, ...args);
            } else {
                // Error is defined but not an Error instance, no additional args
                log.error(`[UPTIME-WATCHER] ${message}`, error);
            }
        } catch {
            // Silently ignore logging errors to prevent application crashes
        }
    },
    // Info level - general application flow
    info: (message: string, ...args: unknown[]): void => {
        try {
            if (args.length > 0) {
                log.info(`[UPTIME-WATCHER] ${message}`, ...args);
            } else {
                log.info(`[UPTIME-WATCHER] ${message}`);
            }
        } catch {
            // Silently ignore logging errors to prevent application crashes
        }
    },
    // Silly level - extremely detailed debugging
    silly: (message: string, ...args: unknown[]): void => {
        try {
            if (args.length > 0) {
                log.silly(`[UPTIME-WATCHER] ${message}`, ...args);
            } else {
                log.silly(`[UPTIME-WATCHER] ${message}`);
            }
        } catch {
            // Silently ignore logging errors to prevent application crashes
        }
    },
    // Verbose level - very detailed debugging
    verbose: (message: string, ...args: unknown[]): void => {
        try {
            if (args.length > 0) {
                log.verbose(`[UPTIME-WATCHER] ${message}`, ...args);
            } else {
                log.verbose(`[UPTIME-WATCHER] ${message}`);
            }
        } catch {
            // Silently ignore logging errors to prevent application crashes
        }
    },
    // Warn level - something unexpected but not an error
    warn: (message: string, ...args: unknown[]): void => {
        try {
            if (args.length > 0) {
                log.warn(`[UPTIME-WATCHER] ${message}`, ...args);
            } else {
                log.warn(`[UPTIME-WATCHER] ${message}`);
            }
        } catch {
            // Silently ignore logging errors to prevent application crashes
        }
    },
};

// Create logger with app context
const loggerInstance: LoggerInterface = {
    // Log application lifecycle events
    app: {
        error: (context: string, error: Error): void => {
            baseLoggerMethods.error(`Application error in ${context}`, error);
        },
        performance: (operation: string, duration: number): void => {
            baseLoggerMethods.debug(
                `Performance: ${operation} took ${duration}ms`
            );
        },
        started: (): void => {
            baseLoggerMethods.info("Application started");
        },
        stopped: (): void => {
            baseLoggerMethods.info("Application stopped");
        },
    },

    // Implement the base logger methods from UnifiedLogger interface
    debug: baseLoggerMethods.debug,
    error: baseLoggerMethods.error,
    info: baseLoggerMethods.info,

    // Raw access to the underlying electron-log instance
    raw: log as RendererLogger & { default: RendererLogger },

    silly: baseLoggerMethods.silly,

    // Log site monitoring events
    site: {
        added: (identifier: string): void => {
            baseLoggerMethods.info(`Site added: ${identifier}`);
        },
        check: (
            identifier: string,
            status: string,
            responseTime?: number
        ): void => {
            const timeInfo = responseTime ? ` (${responseTime}ms)` : "";
            baseLoggerMethods.info(
                `Site check: ${identifier} - Status: ${status}${timeInfo}`
            );
        },
        error: (identifier: string, error: Error | string): void => {
            if (typeof error === "string") {
                baseLoggerMethods.error(
                    `Site check error: ${identifier} - ${error}`
                );
            } else {
                baseLoggerMethods.error(
                    `Site check error: ${identifier}`,
                    error
                );
            }
        },
        removed: (identifier: string): void => {
            baseLoggerMethods.info(`Site removed: ${identifier}`);
        },
        statusChange: (
            identifier: string,
            oldStatus: string,
            newStatus: string
        ): void => {
            baseLoggerMethods.info(
                `Site status change: ${identifier} - ${oldStatus} -> ${newStatus}`
            );
        },
    },

    // Log system/electron events
    system: {
        notification: (title: string, body: string): void => {
            baseLoggerMethods.debug(`Notification sent: ${title} - ${body}`);
        },
        tray: (action: string): void => {
            baseLoggerMethods.debug(`Tray action: ${action}`);
        },
        window: (action: string, windowName?: string): void => {
            const nameInfo = windowName ? ` (${windowName})` : "";
            baseLoggerMethods.debug(`Window ${action}${nameInfo}`);
        },
    },

    // Log user actions
    user: {
        action: (action: string, details?: unknown): void => {
            baseLoggerMethods.info(`User action: ${action}`, details ?? "");
        },
        settingsChange: (
            setting: string,
            oldValue: unknown,
            newValue: unknown
        ): void => {
            baseLoggerMethods.info(
                `Settings change: ${setting} - ${String(oldValue)} -> ${String(newValue)}`
            );
        },
    },

    verbose: baseLoggerMethods.verbose,
    warn: baseLoggerMethods.warn,
};

/**
 * Main logger instance for general frontend logging operations.
 *
 * @remarks
 * Provides structured logging functionality with domain-specific methods for
 * app, site, system, and user events. Uses electron-log/renderer for proper
 * renderer process logging that forwards to main process.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "./services/logger";
 *
 * logger.info("Application starting");
 * logger.site.added("example.com");
 * logger.error("Something went wrong", error);
 * ```
 *
 * @public
 */
export const logger: LoggerInterface = loggerInstance;

/**
 * TypeScript interface for the logger instance.
 *
 * @remarks
 * Provides full type safety and IntelliSense support for the logger methods.
 * Use this type for dependency injection or when you need to reference the
 * logger type in function parameters or return types.
 *
 * @example
 *
 * ```typescript
 * function setupLogging(loggerInstance: Logger): void {
 *     loggerInstance.info("Application starting");
 *     loggerInstance.site.added("example.com");
 * }
 * ```
 *
 * @public
 */
export type Logger = typeof logger;
