/**
 * Helpers for renderer subscriptions backed by the preload bridge.
 *
 * @remarks
 * Many renderer services subscribe to event streams exposed by the preload
 * bridge. Those subscriptions are expected to return cleanup functions.
 *
 * This module centralizes the cross-cutting concerns:
 *
 * - Validate/normalize cleanup candidates (via
 *   {@link subscribeWithValidatedCleanup})
 * - Consistent diagnostics when the preload bridge returns invalid values
 *
 * Keeping this logic out of individual services helps reduce file size and
 * prevents drift in error handling between service layers.
 */

import type { UnifiedLogger } from "@shared/utils/logger/interfaces";

import { ensureError } from "@shared/utils/errorHandling";

import { subscribeWithValidatedCleanup } from "./cleanupHandlers";

type LoggerLike = Pick<UnifiedLogger, "debug" | "error">;

/**
 * Options for {@link subscribeWithCleanupValidation}.
 */
export interface PreloadSubscriptionOptions {
    /** Name of the event being subscribed to (for log prefixing). */
    readonly eventName: string;
    /** Logger used for diagnostics. */
    readonly logger: LoggerLike;
    /** Preload bridge registration function returning a cleanup candidate. */
    readonly register: () => unknown;
    /** Name of the renderer service owning the subscription (for log prefixing). */
    readonly serviceName: string;
}

/**
 * Subscribes to a preload-managed event while enforcing the cleanup contract.
 */
export const subscribeWithCleanupValidation = async (
    options: PreloadSubscriptionOptions
): Promise<() => void> => {
    const { eventName, logger, register, serviceName } = options;

    return subscribeWithValidatedCleanup(register, {
        handleCleanupError: (error: unknown) => {
            logger.error(
                `[${serviceName}] Failed to cleanup ${eventName} listener:`,
                ensureError(error)
            );
        },
        handleInvalidCleanup: ({ actualType, cleanupCandidate }) => {
            logger.error(
                `[${serviceName}] Preload bridge returned an invalid cleanup handler for ${eventName}`,
                {
                    actualType,
                    value: cleanupCandidate,
                }
            );

            // The returned cleanup is wrapped by resolveCleanupHandler, which is
            // idempotent. Keep this fallback minimal and diagnostic-only.
            return (): void => {
                logger.debug(
                    `[${serviceName}] Cleanup skipped for ${eventName}: invalid cleanup handler returned by preload bridge`
                );
            };
        },
    });
};
