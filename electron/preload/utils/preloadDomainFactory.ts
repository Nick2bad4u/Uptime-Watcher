import { ensureError } from "@shared/utils/errorHandling";

import { preloadLogger } from "./preloadLogger";

/**
 * Options for safely constructing a preload domain API.
 *
 * @remarks
 * The preload layer should be resilient during bootstrap: a single failing
 * domain should not crash the entire preload script if we can expose a safe
 * fallback surface instead.
 *
 * This helper exists primarily to satisfy `ex/no-unhandled` by ensuring any
 * synchronous exceptions thrown during domain construction are caught and
 * converted into a deterministic fallback API.
 */
export interface PreloadDomainFactoryOptions<T> {
    /** Creates the real, fully-featured domain API. */
    readonly create: () => T;
    /**
     * Creates a fallback domain API used when
     * {@link PreloadDomainFactoryOptions.create} throws.
     *
     * @param unavailableError - A sanitized error explaining that the preload
     *   domain is unavailable.
     */
    readonly createFallback: (unavailableError: Error) => T;
    /** Friendly label for diagnostics/logging. */
    readonly domain: string;
}

/**
 * Accepts unused preload arguments.
 *
 * @remarks
 * Fallback APIs accept the same parameters as the real domain methods but
 * intentionally ignore them. This helper is used to satisfy strict lint rules
 * (unused vars, function scoping) without relying on the `void` operator.
 */
export function acceptUnusedPreloadArguments(
    ...args: readonly unknown[]
): number {
    return args.length;
}

/**
 * Safely constructs a preload domain API.
 *
 * @remarks
 * - Catches synchronous errors thrown during domain construction.
 * - Logs the root cause for diagnostics.
 * - Returns a typed fallback API whose methods should fail deterministically.
 */
export function createPreloadDomain<T>(
    options: PreloadDomainFactoryOptions<T>
): T {
    const { create, createFallback, domain } = options;

    try {
        return create();
    } catch (error) {
        const normalizedError = ensureError(error);

        preloadLogger.error(
            `[Preload] Failed initializing domain '${domain}'. Falling back to unavailable API surface.`,
            normalizedError
        );

        const unavailableError = new Error(
            `Preload domain '${domain}' failed to initialize and is unavailable.`
        );

        return createFallback(unavailableError);
    }
}
