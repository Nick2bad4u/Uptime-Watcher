/**
 * Utility helpers for building renderer-side IPC services with consistent
 * initialization and error handling semantics.
 */

import { ensureError } from "@shared/utils/errorHandling";
import log from "electron-log/renderer";

import { waitForElectronAPI } from "../../stores/utils";
import * as loggerModule from "../logger";
import {
    type ElectronBridgeContract,
    ElectronBridgeNotReadyError,
    type WaitForElectronBridgeOptions,
} from "./electronBridgeReadiness";

/**
 * Minimal logging shape used by the IPC helper utilities.
 *
 * @internal
 */
interface LoggerLike {
    debug?: (message: string, ...details: unknown[]) => void;
    error: (message: string, ...details: unknown[]) => void;
}

/**
 * Type guard verifying that a candidate matches {@link LoggerLike}.
 *
 * @internal
 */
const isLoggerLike = (candidate: unknown): candidate is LoggerLike => {
    if (typeof candidate !== "object" || candidate === null) {
        return false;
    }

    return typeof Reflect.get(candidate, "error") === "function";
};

/**
 * Safely reads a property from a module export without triggering getters.
 *
 * @internal
 */
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

/**
 * Resolves the default logger instance to use for IPC helper diagnostics.
 *
 * @internal
 */
const resolveDefaultLogger = (): LoggerLike | null => {
    const lowercaseCandidate = safeGetModuleExport(loggerModule, "logger");
    if (isLoggerLike(lowercaseCandidate)) {
        return lowercaseCandidate;
    }

    const uppercaseCandidate = safeGetModuleExport(loggerModule, "Logger");
    if (isLoggerLike(uppercaseCandidate)) {
        return uppercaseCandidate;
    }

    return null;
};

/**
 * Logger used when no custom logger is provided.
 *
 * @internal
 */
const defaultLogger: LoggerLike | null = resolveDefaultLogger();

/**
 * Creates an electron-log based logger tagged with the service name as a
 * fallback.
 *
 * @internal
 */
const createStructuredFallbackLogger = (serviceName: string): LoggerLike => ({
    debug: (message: string, ...details: unknown[]): void => {
        log.debug(`[${serviceName}] ${message}`, ...details);
    },
    error: (message: string, ...details: unknown[]): void => {
        log.error(`[${serviceName}] ${message}`, ...details);
    },
});

/**
 * Options for configuring {@link createIpcServiceHelpers} behavior.
 *
 * @internal
 */
interface CreateIpcServiceHelpersOptions {
    /** Contracts that must be satisfied before the service begins IPC calls. */
    bridgeContracts?: readonly ElectronBridgeContract[];
    /** Overrides for bridge polling parameters (contracts handled separately). */
    bridgeOptions?: Omit<WaitForElectronBridgeOptions, "contracts">;
    /** Optional logger instance. Defaults to the shared renderer logger. */
    logger?: LoggerLike;
}

/**
 * Typed wrapper utilities for building guarded IPC services.
 *
 * @remarks
 * Returned by {@link createIpcServiceHelpers} and {@link getIpcServiceHelpers}.
 * Consumers typically spread these helpers into service objects exposed from
 * `src/services`.
 *
 * @public
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
 * Creates helper utilities that enforce guarded access to
 * {@link window.electronAPI}.
 *
 * @remarks
 * Each helper waits for {@link waitForElectronBridge} before executing the
 * wrapped handler and logs failures using the provided logger (or a console
 * fallback). Primarily used by renderer services to standardize preload
 * access.
 *
 * @param serviceName - Human-readable service name used for log messages.
 * @param options - Optional configuration overrides.
 *
 * @returns Helper functions for building guarded IPC service methods.
 *
 * @public
 */
export function createIpcServiceHelpers(
    serviceName: string,
    options: CreateIpcServiceHelpersOptions = {}
): GuardedIpcServiceHelpers {
    const logger =
        options.logger ??
        defaultLogger ??
        createStructuredFallbackLogger(serviceName);
    const ensureInitialized = async (): Promise<void> => {
        try {
            await waitForElectronAPI(
                options.bridgeOptions?.maxAttempts,
                options.bridgeOptions?.baseDelay,
                options.bridgeContracts
            );
        } catch (error) {
            const normalizedError = ensureError(error);
            if (error instanceof ElectronBridgeNotReadyError) {
                logger.error(
                    `[${serviceName}] Failed to initialize:`,
                    normalizedError,
                    { diagnostics: error.diagnostics }
                );
            } else {
                logger.error(
                    `[${serviceName}] Failed to initialize:`,
                    normalizedError
                );
            }
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
 * Wraps {@link createIpcServiceHelpers} with additional error reporting so
 * callers receive contextual information when helper construction fails.
 *
 * @param serviceName - Human-readable service name used for log messages.
 * @param options - Optional configuration overrides.
 *
 * @returns Guarded IPC helper utilities.
 *
 * @public
 */
export function getIpcServiceHelpers(
    serviceName: string,
    options: CreateIpcServiceHelpersOptions = {}
): GuardedIpcServiceHelpers {
    try {
        return createIpcServiceHelpers(serviceName, options);
    } catch (error) {
        const ensuredError = ensureError(error);
        const loggerInstance =
            options.logger ??
            defaultLogger ??
            createStructuredFallbackLogger(serviceName);
        loggerInstance.error(
            `[${serviceName}] Failed to create IPC service helpers`,
            ensuredError
        );
        throw new Error(
            `[${serviceName}] Failed to create IPC service helpers`,
            { cause: error }
        );
    }
}
