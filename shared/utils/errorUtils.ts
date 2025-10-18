/**
 * Derives a user-friendly message from an unknown error value.
 *
 * @remarks
 * When the supplied value is an {@link Error} instance the underlying `message`
 * property is returned. All other values yield the provided fallback string,
 * allowing a consistent logging surface.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "@app/services/logger";
 *
 * try {
 *     await riskyOperation();
 * } catch (error) {
 *     logger.error("Operation failed", getErrorMessage(error));
 * }
 * ```
 *
 * @defaultValue "Unknown error"
 *
 * @param error - Arbitrary value captured from a thrown exception or callback.
 * @param fallback - Message used when the value is not an {@link Error}.
 *
 * @returns A string suitable for logging or surfacing to the user.
 */
export function getErrorMessage(
    error: unknown,
    fallback = "Unknown error"
): string {
    return error instanceof Error ? error.message : fallback;
}
