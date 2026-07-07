/**
 * Console-backed fallback logger for shared utilities.
 *
 * @remarks
 * Shared code cannot import renderer or Electron logger implementations without
 * creating the wrong dependency direction. This adapter keeps unavoidable
 * fallback console usage centralized and formatted through the shared logging
 * helpers.
 */

import type { BaseLogger } from "./interfaces";

import { buildErrorLogArguments, buildLogArguments } from "./common";

export type ConsoleFallbackTransport = Pick<
    typeof console,
    | "debug"
    | "error"
    | "info"
    | "warn"
>;

function safelyInvokeTransport(operation: () => void): void {
    try {
        operation();
    } catch {
        // Fallback diagnostics must never break the caller's error path.
    }
}

/**
 * Creates a shared fallback logger backed by a console-like transport.
 *
 * @param prefix - Prefix added to every fallback log message.
 * @param transport - Console-compatible output target.
 *
 * @returns Logger implementation for last-resort shared diagnostics.
 */
export function createConsoleFallbackLogger(
    prefix = "SHARED",
    transport: ConsoleFallbackTransport = console
): BaseLogger {
    return {
        debug(message, ...args) {
            safelyInvokeTransport(() => {
                transport.debug(...buildLogArguments(prefix, message, args));
            });
        },
        error(message, error, ...args) {
            safelyInvokeTransport(() => {
                transport.error(
                    ...buildErrorLogArguments(prefix, message, error, args)
                );
            });
        },
        info(message, ...args) {
            safelyInvokeTransport(() => {
                transport.info(...buildLogArguments(prefix, message, args));
            });
        },
        warn(message, ...args) {
            safelyInvokeTransport(() => {
                transport.warn(...buildLogArguments(prefix, message, args));
            });
        },
    };
}

/**
 * Last-resort logger for shared utility modules.
 */
export const sharedFallbackLogger: BaseLogger = createConsoleFallbackLogger();
