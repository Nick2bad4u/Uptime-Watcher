/**
 * Identifier validation helpers for repository boundaries.
 *
 * @remarks
 * Repositories should defensively validate identifiers before issuing SQL
 * statements. Even though upstream IPC and shared Zod schemas validate most
 * inputs, repository-level checks prevent accidental corruption when called
 * from internal code paths (imports, migrations, tests, or future refactors).
 */

import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { MONITOR_ID_REQUIRED_MESSAGE } from "@shared/validation/monitorFieldConstants";
import {
    SITE_IDENTIFIER_MAX_LENGTH,
    SITE_IDENTIFIER_REQUIRED_MESSAGE,
    SITE_IDENTIFIER_TOO_LONG_MESSAGE,
} from "@shared/validation/siteFieldConstants";

/**
 * Returns whether a site identifier is acceptable for repository operations.
 */
export function isValidSiteIdentifier(identifier: string): boolean {
    return (
        identifier.trim().length > 0 &&
        identifier.length <= SITE_IDENTIFIER_MAX_LENGTH &&
        !hasAsciiControlCharacters(identifier)
    );
}

/**
 * Returns whether a monitor identifier is acceptable for repository
 * operations.
 */
export function isValidMonitorId(monitorId: string): boolean {
    return monitorId.trim().length > 0 && !hasAsciiControlCharacters(monitorId);
}

/**
 * Throws if the supplied site identifier is empty/whitespace, too long, or
 * contains ASCII control characters.
 *
 * @param identifier - Site identifier candidate.
 * @param context - Human-readable context included in thrown errors.
 */
export function assertValidSiteIdentifier(
    identifier: string,
    context: string
): void {
    if (identifier.trim().length === 0) {
        throw new TypeError(`[${context}] ${SITE_IDENTIFIER_REQUIRED_MESSAGE}`);
    }

    if (identifier.length > SITE_IDENTIFIER_MAX_LENGTH) {
        throw new RangeError(`[${context}] ${SITE_IDENTIFIER_TOO_LONG_MESSAGE}`);
    }

    if (hasAsciiControlCharacters(identifier)) {
        throw new TypeError(
            `[${context}] Site identifier contains invalid control characters`
        );
    }
}

/**
 * Throws if the supplied monitor identifier is empty/whitespace or contains
 * ASCII control characters.
 *
 * @param monitorId - Monitor identifier candidate.
 * @param context - Human-readable context included in thrown errors.
 */
export function assertValidMonitorId(monitorId: string, context: string): void {
    if (monitorId.trim().length === 0) {
        throw new TypeError(`[${context}] ${MONITOR_ID_REQUIRED_MESSAGE}`);
    }

    if (hasAsciiControlCharacters(monitorId)) {
        throw new TypeError(
            `[${context}] Monitor ID contains invalid control characters`
        );
    }
}
