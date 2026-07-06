/**
 * Helpers for logging user-provided identifiers safely.
 *
 * @packageDocumentation
 */

import { getSafeUrlForLogging } from "./urlSafety";

/**
 * Redacts URL-shaped identifiers while leaving ordinary opaque identifiers
 * unchanged.
 */
export const getSafeIdentifierForLogging = (
    identifier: string | undefined
): string | undefined => {
    if (identifier === undefined) {
        return undefined;
    }

    const trimmed = identifier.trim();
    if (!trimmed) {
        return identifier;
    }

    return URL.canParse(trimmed) ? getSafeUrlForLogging(trimmed) : identifier;
};
