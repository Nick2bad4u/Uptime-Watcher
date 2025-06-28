import log from "electron-log/main";

/**
 * Centralized logger utility for the backend
 * Provides consistent logging across all backend services
 */
export const logger = {
    debug: (message: string, ...args: unknown[]) => log.debug(`[MONITOR] ${message}`, ...args),
    error: (message: string, error?: unknown, ...args: unknown[]) => {
        if (error instanceof Error) {
            log.error(`[MONITOR] ${message}`, { message: error.message, stack: error.stack }, ...args);
        } else {
            log.error(`[MONITOR] ${message}`, error, ...args);
        }
    },
    info: (message: string, ...args: unknown[]) => log.info(`[MONITOR] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) => log.warn(`[MONITOR] ${message}`, ...args),
};

/**
 * Domain-specific loggers for better organization
 */
export const dbLogger = {
    debug: (message: string, ...args: unknown[]) => log.debug(`[DB] ${message}`, ...args),
    error: (message: string, error?: unknown, ...args: unknown[]) => {
        if (error instanceof Error) {
            log.error(`[DB] ${message}`, { message: error.message, stack: error.stack }, ...args);
        } else {
            log.error(`[DB] ${message}`, error, ...args);
        }
    },
    info: (message: string, ...args: unknown[]) => log.info(`[DB] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) => log.warn(`[DB] ${message}`, ...args),
};

export const monitorLogger = {
    debug: (message: string, ...args: unknown[]) => log.debug(`[MONITOR] ${message}`, ...args),
    error: (message: string, error?: unknown, ...args: unknown[]) => {
        if (error instanceof Error) {
            log.error(`[MONITOR] ${message}`, { message: error.message, stack: error.stack }, ...args);
        } else {
            log.error(`[MONITOR] ${message}`, error, ...args);
        }
    },
    info: (message: string, ...args: unknown[]) => log.info(`[MONITOR] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) => log.warn(`[MONITOR] ${message}`, ...args),
};
