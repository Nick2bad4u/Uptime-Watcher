/**
 * Utility helpers for building renderer-side IPC services with consistent
 * initialization and error handling semantics.
 */

import { ensureError } from "@shared/utils/errorHandling";

import { waitForElectronAPI } from "../../stores/utils";
import { logger as defaultLogger } from "../logger";

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
    wrap<Args extends unknown[], Result>(
        methodName: string,
        handler: (
            api: typeof window.electronAPI,
            ...args: Args
        ) => Promise<Result>
    ): (...args: Args) => Promise<Result>;
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

    const wrap = <Args extends unknown[], Result>(
        methodName: string,
        handler: (
            api: typeof window.electronAPI,
            ...args: Args
        ) => Promise<Result>
    ): ((...args: Args) => Promise<Result>) => {
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
