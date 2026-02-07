import { ensureError } from "@shared/utils/errorHandling";
import { isRecord } from "@shared/utils/typeHelpers";

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
    if (payload === null || payload === undefined) {
        return undefined;
    }

    const segments = path.split(".").filter((segment) => segment.length > 0);
    let current: unknown = payload;

    for (const segment of segments) {
        if (current === null || current === undefined) {
            return undefined;
        }

        const tokens = segment
            .split("[")
            .map((token) => token.replace("]", ""));
        const [firstToken, ...indexTokens] = tokens;
        const propertyToken = firstToken ?? "";

        if (propertyToken.length > 0) {
            if (!isRecord(current)) {
                return undefined;
            }

            current = current[propertyToken];
        }

        for (const indexToken of indexTokens) {
            if (indexToken.length === 0) {
                return undefined;
            }

            const parsedIndex = Number.parseInt(indexToken, 10);
            if (Number.isNaN(parsedIndex)) {
                return undefined;
            }

            if (!Array.isArray(current)) {
                return undefined;
            }

            current = current[parsedIndex];
        }
    }

    return current;
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
