/**
 * Canonical JSON utilities.
 *
 * @remarks
 * Used to produce deterministic JSON encodings for sync diffing.
 */

import type { JsonValue } from "@shared/types/cloudSync";

function isJsonRecord(value: JsonValue): value is Record<string, JsonValue> {
    return !Array.isArray(value) && typeof value === "object" && value !== null;
}

/**
 * Returns a JSON value with all object keys sorted recursively.
 */
// eslint-disable-next-line sonarjs/function-return-type -- Returns JsonValue union by design (primitives/arrays/objects).
export function createCanonicalJsonValue(value: JsonValue): JsonValue {
    if (Array.isArray(value)) {
        return value.map((entry) => createCanonicalJsonValue(entry));
    }

    if (isJsonRecord(value)) {
        const entries = Object.entries(value).toSorted(([a], [b]) =>
            a.localeCompare(b)
        );
        const result: Record<string, JsonValue> = {};
        for (const [key, entryValue] of entries) {
            result[key] = createCanonicalJsonValue(entryValue);
        }
        return result;
    }

    return value;
}

/**
 * Deterministically stringifies a JSON value by first canonicalizing keys.
 */
export function stringifyJsonValueStable(value: JsonValue): string {
    return JSON.stringify(createCanonicalJsonValue(value));
}
