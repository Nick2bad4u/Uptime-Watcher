import type { JsonValue } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import { safeJsonParse } from "@shared/utils/jsonSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import { isObject } from "@shared/utils/typeGuards";
import { objectEntries } from "ts-extras";

import { extractMonitorValueAtPath } from "./monitorPathTraversal";

/** Maximum UTF-8 byte budget accepted for monitor JSON payload parsing. */
const MAX_HTTP_JSON_PAYLOAD_PARSE_BYTES: number = 1 * 1024 * 1024;

/**
 * Result of attempting to parse a JSON payload.
 *
 * @internal
 */
export type JsonPayloadParseResult =
    | { readonly error: Error; readonly ok: false }
    | { readonly ok: true; readonly payload: unknown };

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
    });
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

function createJsonPayloadParseError(error: unknown): Error {
    const normalizedError = ensureError(error);
    return new SyntaxError(
        `HTTP JSON payload parsing failed: ${normalizedError.message}`,
        {
            cause: error,
        }
    );
}

function createJsonPayloadSizeError(sizeBytes: number): Error {
    return new RangeError(
        `HTTP JSON payload exceeds maximum parse size (${sizeBytes} > ${MAX_HTTP_JSON_PAYLOAD_PARSE_BYTES} bytes)`
    );
}

function isJsonValue(value: unknown): value is JsonValue {
    if (value === null) {
        return true;
    }

    const valueType = typeof value;
    if (
        valueType === "boolean" ||
        valueType === "number" ||
        valueType === "string"
    ) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every(isJsonValue);
    }

    return (
        isObject(value) &&
        objectEntries(value).every(([, entry]) => isJsonValue(entry))
    );
}

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
        const sizeBytes = getUtfByteLength(data);
        if (sizeBytes > MAX_HTTP_JSON_PAYLOAD_PARSE_BYTES) {
            const sizeError = createJsonPayloadSizeError(sizeBytes);
            onParseError?.(sizeError);
            return {
                error: sizeError,
                ok: false,
            };
        }

        const parseResult = safeJsonParse(data, isJsonValue);
        if (parseResult.success && parseResult.data !== undefined) {
            return {
                ok: true,
                payload: parseResult.data,
            };
        }

        const parseError = createJsonPayloadParseError(
            parseResult.error ?? "Unknown JSON parsing failure"
        );
        onParseError?.(parseError);
        return {
            error: parseError,
            ok: false,
        };
    }

    return { ok: true, payload: data };
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
