import { ensureError } from "@shared/utils/errorHandling";

import { extractMonitorValueAtPath } from "./monitorPathTraversal";

/**
 * Result of attempting to parse a JSON payload.
 *
 * @internal
 */
export type JsonPayloadParseResult =
    | { readonly error: Error; readonly ok: false }
    | { readonly ok: true; readonly payload: unknown };

/**
 * Parses an HTTP payload into JSON when it is a string.
 *
 * @param data - Raw payload from the HTTP response.
 * @param onParseError - Optional callback invoked when parsing fails.
 *
 * @returns Parse result including the normalized payload.
 *
 * @internal
 */
export function parseJsonPayload(
    data: unknown,
    onParseError?: (error: Error) => void
): JsonPayloadParseResult {
    if (typeof data === "string") {
        try {
            return {
                ok: true,
                payload: JSON.parse(data),
            };
        } catch (error) {
            const normalizedError = ensureError(error);
            onParseError?.(normalizedError);
            return {
                error: normalizedError,
                ok: false,
            };
        }
    }

    return { ok: true, payload: data };
}

/**
 * Type guard for parse failures.
 *
 * @param result - Parse result to inspect.
 *
 * @returns `true` when the payload failed to parse.
 *
 * @internal
 */
export function isParseFailure(
    result: JsonPayloadParseResult
): result is { readonly error: Error; readonly ok: false } {
    return !result.ok;
}

/**
 * Extracts a nested value from a JSON-compatible payload using a dot path.
 *
 * @param payload - Payload to traverse.
 * @param path - Dot/bracket path (e.g. `data.items[0].name`).
 *
 * @returns Resolved value or `undefined` when not found.
 *
 * @internal
 */
export function extractJsonValueAtPath(
    payload: unknown,
    path: string
): unknown {
    return extractMonitorValueAtPath(payload, path, {
        allowArrayIndexTokens: true,
        trimSegments: true,
    });
}

/**
 * Serializes a JSON value into a normalized string form.
 *
 * @param value - Value to normalize.
 * @param onSerializeError - Optional callback invoked when serialization fails.
 *
 * @returns Normalized string for comparisons/logging.
 *
 * @internal
 */
export function stringifyJsonValue(
    value: unknown,
    onSerializeError?: (error: Error) => void
): string {
    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (value === null) {
        return "null";
    }

    try {
        return JSON.stringify(value);
    } catch (error: unknown) {
        onSerializeError?.(ensureError(error));
        return "[unserializable]";
    }
}
