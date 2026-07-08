import { ERROR_CATALOG } from "./errorCatalog";
import { getOwnStringDataProperty } from "./errorPropertyAccess";
import { normalizeLogValue } from "./loggingContext";
import { isRecord } from "./typeHelpers";

export const DEFAULT_MAX_USER_FACING_ERROR_DETAIL_CHARS = 1000;

/**
 * Options for {@link normalizeUserFacingErrorDetail}.
 */
export interface NormalizeUserFacingErrorDetailOptions {
    /**
     * Maximum returned detail length before an ellipsis is appended.
     *
     * @defaultValue 1000
     */
    readonly maxLength?: number | undefined;
}

function removeAsciiControlCharacters(value: string): string {
    let sanitized = "";
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (
            codePoint !== undefined &&
            (codePoint < 0x20 || codePoint === 0x7f)
        ) {
            sanitized += " ";
            continue;
        }

        sanitized += character;
    }

    return sanitized;
}

function resolveMaxLength(
    options: NormalizeUserFacingErrorDetailOptions | undefined
): number {
    const maxLength = options?.maxLength;
    return typeof maxLength === "number" &&
        Number.isSafeInteger(maxLength) &&
        maxLength > 0
        ? maxLength
        : DEFAULT_MAX_USER_FACING_ERROR_DETAIL_CHARS;
}

/**
 * Redacts, compacts, and bounds a user-facing error detail string.
 */
export function normalizeUserFacingErrorDetail(
    value: string,
    options?: NormalizeUserFacingErrorDetailOptions
): string | undefined {
    const normalized = normalizeLogValue(value);
    if (typeof normalized !== "string") {
        return undefined;
    }

    const detail = removeAsciiControlCharacters(normalized)
        .replaceAll(/\s+/gu, " ")
        .trim();
    if (!detail) {
        return undefined;
    }

    const maxLength = resolveMaxLength(options);
    return detail.length <= maxLength
        ? detail
        : `${detail.slice(0, maxLength)}...`;
}

/**
 * Extracts a short, user-facing error message from an unknown thrown value.
 *
 * @remarks
 * Intended for UI strings and IPC error payloads where we want a stable message
 * without leaking internal details.
 *
 * - {@link Error} values return their own data `message` property.
 * - Plain objects with an own string data `message` property return that message.
 * - Strings and numbers are surfaced as-is.
 * - Everything else falls back to {@link ERROR_CATALOG.system.UNKNOWN_ERROR}.
 */
export function getUserFacingErrorDetail(error: unknown): string {
    if (Error.isError(error)) {
        const message = getOwnStringDataProperty(error, "message");

        return (
            (message && normalizeUserFacingErrorDetail(message)) ??
            ERROR_CATALOG.system.UNKNOWN_ERROR
        );
    }

    if (isRecord(error)) {
        const messageCandidate = getOwnStringDataProperty(error, "message");
        if (messageCandidate) {
            return (
                normalizeUserFacingErrorDetail(messageCandidate) ??
                ERROR_CATALOG.system.UNKNOWN_ERROR
            );
        }
    }

    if (typeof error === "string") {
        return (
            normalizeUserFacingErrorDetail(error) ??
            ERROR_CATALOG.system.UNKNOWN_ERROR
        );
    }

    if (typeof error === "number" || typeof error === "bigint") {
        return String(error);
    }

    return ERROR_CATALOG.system.UNKNOWN_ERROR;
}
