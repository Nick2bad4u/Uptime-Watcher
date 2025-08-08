/**
 * Centralized logging service using electron-log for consistent logging across processes.
 *
 * @remarks
 * Provides structured logging functionality organized by functional domains
 * (app, site, monitor, store) for contextual logging that's easy to filter.
 *
 * Uses electron-log/renderer for proper renderer process logging that automatically
 * forwards logs to the main process via IPC for centralized file logging while
 * maintaining console output in the renderer process for development.
 *
 * @packageDocumentation
 */

import { type RendererLogger } from "electron-log";
import log from "electron-log/renderer";

/**
 * Interface for the logger configuration.
 */
interface LoggerInterface {
    // Log application lifecycle events
    app: {
        error: (context: string, error: Error) => void;
        performance: (operation: string, duration: number) => void;
        started: () => void;
        stopped: () => void;
    };
    // Debug level - for development debugging
    debug: (message: string, ...args: unknown[]) => void;
    // Error level - errors that should be investigated
    error: (message: string, error?: Error, ...args: unknown[]) => void;
    // Info level - general application flow
    info: (message: string, ...args: unknown[]) => void;
    /**
     * Raw access to the underlying electron-log instance.
     *
     * @remarks
     * Use with caution! Direct access bypasses the application's
     * logging conventions and structured format. Only use for advanced
     * scenarios where the standard logger methods are insufficient.
     *
     * @example
     * ```typescript
     * // Only use when absolutely necessary
     * logger.raw.transports.file.level = "warn";
     * ```
     */
    raw: RendererLogger & {
        default: RendererLogger;
    };
    // Silly level - extremely detailed debugging
    silly: (message: string, ...args: unknown[]) => void;
    // Specialized logging methods for common scenarios
    // Log site monitoring events
    site: {
        added: (identifier: string) => void;
        check: (
            identifier: string,
            status: string,
            responseTime?: number
        ) => void;
        error: (identifier: string, error: Error | string) => void;
        removed: (identifier: string) => void;
        statusChange: (
            identifier: string,
            oldStatus: string,
            newStatus: string
        ) => void;
    };
    // Log system/electron events
    system: {
        notification: (title: string, body: string) => void;
        tray: (action: string) => void;
        window: (action: string, windowName?: string) => void;
    };
    // Log user actions
    user: {
        action: (action: string, details?: unknown) => void;
        settingsChange: (
            setting: string,
            oldValue: unknown,
            newValue: unknown
        ) => void;
    };
    // Verbose level - very detailed debugging
    verbose: (message: string, ...args: unknown[]) => void;
    // Warn level - something unexpected but not an error
    warn: (message: string, ...args: unknown[]) => void;
}

/**
 * Type-safe access to log transports.
 * Avoids index signature issues with transport properties.
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
 * @returns Transport object or undefined if not available
 */
function getLogTransport<K extends keyof LogTransports>(
    transportName: K
): LogTransports[K] | undefined {
    const transports = log.transports as unknown as Record<string, unknown>;

    if (transportName in transports) {
        return transports[transportName] as LogTransports[K];
    }

    return undefined;
}

// Configure electron-log for renderer process
// The /renderer import is specifically chosen because:
// 1. It handles IPC communication with main process automatically
// 2. Provides console logging in renderer while forwarding to main for file logging
// 3. Avoids direct file access conflicts that would occur with main process logging
// Check if we're in production mode (Vite sets MODE to 'production' in production builds)
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

// Create logger with app context
const logger: LoggerInterface = {
    // Log application lifecycle events
    app: {
        error: (context: string, error: Error): void => {
            logger.error(`Application error in ${context}`, error);
        },
        performance: (operation: string, duration: number): void => {
            logger.debug(`Performance: ${operation} took ${duration}ms`);
        },
        started: (): void => {
            logger.info("Application started");
        },
        stopped: (): void => {
            logger.info("Application stopped");
        },
    },
    // Debug level - for development debugging
    debug: (message: string, ...args: unknown[]): void => {
        if (args.length > 0) {
            log.debug(`[UPTIME-WATCHER] ${message}`, ...args);
        } else {
            log.debug(`[UPTIME-WATCHER] ${message}`);
        }
    },
    // Error level - errors that should be investigated
    error: (message: string, error?: Error, ...args: unknown[]): void => {
        if (error instanceof Error) {
            const errorData = {
                message: error.message,
                name: error.name,
                stack: error.stack,
            };
            if (args.length > 0) {
                log.error(`[UPTIME-WATCHER] ${message}`, errorData, ...args);
            } else {
                log.error(`[UPTIME-WATCHER] ${message}`, errorData);
            }
        } else if (args.length > 0) {
            log.error(`[UPTIME-WATCHER] ${message}`, ...args);
        } else {
            log.error(`[UPTIME-WATCHER] ${message}`);
        }
    },
    // Info level - general application flow
    info: (message: string, ...args: unknown[]): void => {
        if (args.length > 0) {
            log.info(`[UPTIME-WATCHER] ${message}`, ...args);
        } else {
            log.info(`[UPTIME-WATCHER] ${message}`);
        }
    },
    /**
     * Raw access to the underlying electron-log instance.
     *
     * @remarks
     * Use with caution! Direct access bypasses the application's
     * logging conventions and structured format. Only use for advanced
     * scenarios where the standard logger methods are insufficient.
     *
     * @example
     * ```typescript
     * // Only use when absolutely necessary
     * logger.raw.transports.file.level = "warn";
     * ```
     */
    raw: log,
    // Silly level - extremely detailed debugging
    silly: (message: string, ...args: unknown[]): void => {
        if (args.length > 0) {
            log.silly(`[UPTIME-WATCHER] ${message}`, ...args);
        } else {
            log.silly(`[UPTIME-WATCHER] ${message}`);
        }
    },
    // Specialized logging methods for common scenarios
    // Log site monitoring events
    site: {
        added: (identifier: string): void => {
            logger.info(`Site added: ${identifier}`);
        },
        check: (
            identifier: string,
            status: string,
            responseTime?: number
        ): void => {
            const timeInfo = responseTime ? ` (${responseTime}ms)` : "";
            logger.info(
                `Site check: ${identifier} - Status: ${status}${timeInfo}`
            );
        },
        error: (identifier: string, error: Error | string): void => {
            if (typeof error === "string") {
                logger.error(`Site check error: ${identifier} - ${error}`);
            } else {
                logger.error(`Site check error: ${identifier}`, error);
            }
        },
        removed: (identifier: string): void => {
            logger.info(`Site removed: ${identifier}`);
        },
        statusChange: (
            identifier: string,
            oldStatus: string,
            newStatus: string
        ): void => {
            logger.info(
                `Site status change: ${identifier} - ${oldStatus} -> ${newStatus}`
            );
        },
    },
    // Log system/electron events
    system: {
        notification: (title: string, body: string): void => {
            logger.debug(`Notification sent: ${title} - ${body}`);
        },
        tray: (action: string): void => {
            logger.debug(`Tray action: ${action}`);
        },
        window: (action: string, windowName?: string): void => {
            const nameInfo = windowName ? ` (${windowName})` : "";
            logger.debug(`Window ${action}${nameInfo}`);
        },
    },
    // Log user actions
    user: {
        action: (action: string, details?: unknown): void => {
            logger.info(`User action: ${action}`, details ?? "");
        },
        settingsChange: (
            setting: string,
            oldValue: unknown,
            newValue: unknown
        ): void => {
            logger.info(
                `Settings change: ${setting} - ${String(oldValue)} -> ${String(newValue)}`
            );
        },
    },
    // Verbose level - very detailed debugging
    verbose: (message: string, ...args: unknown[]): void => {
        if (args.length > 0) {
            log.verbose(`[UPTIME-WATCHER] ${message}`, ...args);
        } else {
            log.verbose(`[UPTIME-WATCHER] ${message}`);
        }
    },
    // Warn level - something unexpected but not an error
    warn: (message: string, ...args: unknown[]): void => {
        if (args.length > 0) {
            log.warn(`[UPTIME-WATCHER] ${message}`, ...args);
        } else {
            log.warn(`[UPTIME-WATCHER] ${message}`);
        }
    },
};

export default logger;

/**
 * TypeScript interface for the logger instance.
 *
 * @remarks
 * Provides full type safety and IntelliSense support for the logger methods.
 * Use this type for dependency injection or when you need to reference
 * the logger type in function parameters or return types.
 *
 * @example
 * ```typescript
 * function setupLogging(loggerInstance: Logger): void {
 *   loggerInstance.info("Application starting");
 *   loggerInstance.site.added("example.com");
 * }
 * ```
 *
 * @public
 */
export type Logger = typeof logger;
