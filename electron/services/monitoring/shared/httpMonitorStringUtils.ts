import { ensureError } from "@shared/utils/errorHandling";
import { isRecord } from "@shared/utils/typeHelpers";

const TRIMMED_HEADER_VALUE_MAX_LENGTH = 2048;

/**
 * Returns a trimmed, non-empty string value or `null` when invalid.
 *
 * @param value - Candidate value to normalize.
 *
 * @returns Normalized string or `null` when the input is not usable.
 *
 * @internal
 */
export function getTrimmedNonEmptyString(value: unknown): null | string {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

/**
 * Normalizes an HTTP header name for lookups.
 *
 * @param value - Raw header name.
 *
 * @returns Lowercased, trimmed header name.
 *
 * @internal
 */
export function normalizeHeaderName(value: string): string {
    return value.trim().toLowerCase();
}

/**
 * Normalizes a header value for comparison or logging.
 *
 * @param value - Raw header value.
 *
 * @returns Trimmed header value capped to a safe length.
 *
 * @internal
 */
export function normalizeHeaderValue(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length > TRIMMED_HEADER_VALUE_MAX_LENGTH) {
        return `${trimmed.slice(0, TRIMMED_HEADER_VALUE_MAX_LENGTH)}…`;
    }

    return trimmed;
}

/**
 * Resolve a header value from the response header map.
 *
 * @param options - Resolution options including the raw headers, header name,
 *   and an optional serialization error callback.
 *
 * @returns Stringified header value or `null` when not found.
 *
 * @internal
 */
export function resolveHeaderValue(options: {
    readonly headerName: string;
    readonly headers: unknown;
    readonly onSerializeError?: (error: Error) => void;
}): null | string {
    const { headerName, headers, onSerializeError } = options;
    const normalizedName = normalizeHeaderName(headerName);

    if (!isRecord(headers)) {
        return null;
    }

    const rawValue = headers[normalizedName];

    if (rawValue === undefined || rawValue === null) {
        return null;
    }

    if (Array.isArray(rawValue)) {
        return rawValue.map(String).join(", ");
    }

    if (typeof rawValue === "string") {
        return rawValue;
    }

    if (typeof rawValue === "number" || typeof rawValue === "boolean") {
        return String(rawValue);
    }

    if (rawValue instanceof Date) {
        return rawValue.toISOString();
    }

    try {
        return JSON.stringify(rawValue);
    } catch (error: unknown) {
        onSerializeError?.(ensureError(error));
        return "[unserializable]";
    }
}
