/**
 * Utility helpers for building renderer-side IPC services with consistent
 * initialization and error handling semantics.
 */

import { ensureError } from "@shared/utils/errorHandling";

import { waitForElectronAPI } from "../../stores/utils";
import * as loggerModule from "../logger";

interface LoggerLike {
    debug?: (message: string, ...details: unknown[]) => void;
    error: (message: string, ...details: unknown[]) => void;
}

const consoleFallbackLogger: LoggerLike = {
    debug: (...details) => {
        console.debug(...details);
    },
    error: (...details) => {
        console.error(...details);
    },
};

const isLoggerLike = (candidate: unknown): candidate is LoggerLike => {
    if (typeof candidate !== "object" || candidate === null) {
        return false;
    }

    return typeof Reflect.get(candidate, "error") === "function";
};

const safeGetModuleExport = (
    module: unknown,
    property: PropertyKey
): unknown => {
    if (typeof module !== "object" || module === null) {
        return undefined;
    }

    try {
        if (Reflect.has(module, property)) {
            return Reflect.get(module, property);
        }
    } catch {
        return undefined;
    }

    return undefined;
};

const resolveDefaultLogger = (): LoggerLike => {
    const lowercaseCandidate = safeGetModuleExport(loggerModule, "logger");
    if (isLoggerLike(lowercaseCandidate)) {
        return lowercaseCandidate;
    }

    const uppercaseCandidate = safeGetModuleExport(loggerModule, "Logger");
    if (isLoggerLike(uppercaseCandidate)) {
        return uppercaseCandidate;
    }

    return consoleFallbackLogger;
};

const defaultLogger: LoggerLike = resolveDefaultLogger();

/**
 * Options for configuring {@link createIpcServiceHelpers} behavior.
 */
interface CreateIpcServiceHelpersOptions {
    /** Optional logger instance. Defaults to the shared renderer logger. */
    logger?: typeof defaultLogger;
}

/**
 * Typed wrapper utilities for building guarded IPC services.
 */
export interface GuardedIpcServiceHelpers {
    /** Ensures the preload bridge is ready before IPC calls. */
    ensureInitialized: () => Promise<void>;
    /**
     * Wraps a handler so it automatically waits for initialization and logs
     * failures using a consistent format.
     */
    wrap: <Args extends unknown[], Result>(
        methodName: string,
        handler: (
            api: typeof window.electronAPI,
            ...args: Args
        ) => Promise<Result>
    ) => (...args: Args) => Promise<Result>;
}

/**
 * Creates helper utilities that enforce guarded access to `window.electronAPI`.
 *
 * @param serviceName - Human-readable service name used for log messages.
 * @param options - Optional configuration overrides.
 *
 * @returns Helper functions for building guarded IPC service methods.
 */
export function createIpcServiceHelpers(
    serviceName: string,
    options: CreateIpcServiceHelpersOptions = {}
): GuardedIpcServiceHelpers {
    const logger = options.logger ?? defaultLogger;
    const ensureInitialized = async (): Promise<void> => {
        try {
            await waitForElectronAPI();
        } catch (error) {
            logger.error(
                `[${serviceName}] Failed to initialize:`,
                ensureError(error)
            );
            throw error;
        }
    };

    const wrap: GuardedIpcServiceHelpers["wrap"] = function wrap<
        Args extends unknown[],
        Result,
    >(
        methodName: string,
        handler: (
            api: typeof window.electronAPI,
            ...args: Args
        ) => Promise<Result>
    ): (...args: Args) => Promise<Result> {
        return async (...args: Args): Promise<Result> => {
            await ensureInitialized();

            try {
                return await handler(window.electronAPI, ...args);
            } catch (error) {
                logger.error(
                    `[${serviceName}] ${methodName} failed:`,
                    ensureError(error)
                );
                throw error;
            }
        };
    };

    return {
        ensureInitialized,
        wrap,
    };
}

/**
 * Creates IPC service helpers with guarded error handling.
 *
 * @remarks
 * Ensures that unexpected failures during helper construction are surfaced with
 * a descriptive error message and attached cause to aid diagnostics.
 *
 * @param serviceName - Human-readable service name used for log messages.
 * @param options - Optional configuration overrides.
 *
 * @returns Guarded IPC helper utilities.
 */
export function getIpcServiceHelpers(
    serviceName: string,
    options: CreateIpcServiceHelpersOptions = {}
): GuardedIpcServiceHelpers {
    try {
        return createIpcServiceHelpers(serviceName, options);
    } catch (error) {
        const ensuredError = ensureError(error);
        const logger = options.logger ?? defaultLogger;
        logger.error(
            `[${serviceName}] Failed to create IPC service helpers`,
            ensuredError
        );
        throw new Error(
            `[${serviceName}] Failed to create IPC service helpers`,
            { cause: error }
        );
    }
}
