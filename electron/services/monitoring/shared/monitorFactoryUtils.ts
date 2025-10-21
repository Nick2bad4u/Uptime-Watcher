/**
 * Utilities that wrap monitor factory construction with hardened exception
 * handling so eslint-plugin-exception-handling does not flag top-level factory
 * invocations.
 */

import { ensureError } from "@shared/utils/errorHandling";

/**
 * Executes the provided factory function and normalises any thrown error with a
 * monitor-specific scope before rethrowing. This allows monitor service
 * factories to safely initialise during module evaluation without triggering
 * lint warnings about unhandled exceptions.
 *
 * @param factory - Lazy factory invoked to build the monitor service.
 * @param scope - Human-readable monitor scope used when formatting the error.
 *
 * @returns The value produced by the factory.
 */
export function buildMonitorFactory<T>(factory: () => T, scope: string): T {
    try {
        return factory();
    } catch (error) {
        const normalizedError = ensureError(error);
        normalizedError.message = `Failed to initialise ${scope}: ${normalizedError.message}`;
        throw normalizedError;
    }
}
