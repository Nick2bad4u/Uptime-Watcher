/**
 * Canonical JSON utilities.
 *
 * @remarks
 * Used to produce deterministic JSON encodings for sync diffing.
 */

import type { JsonValue } from "@shared/types/cloudSync";
import type { JsonObject } from "type-fest";

import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { compareStringsCodeUnit } from "@shared/utils/stringOrdering";
import { objectEntries } from "ts-extras";

/**
 * Returns a JSON value with all object keys sorted recursively.
 */
function createCanonicalJsonValue(value: JsonValue): JsonValue {
    if (Array.isArray(value)) {
        return value.map((entry) => createCanonicalJsonValue(entry));
    }

    if (isJsonRecord(value)) {
        const entries = objectEntries(value).toSorted(([a], [b]) =>
            compareStringsCodeUnit(a, b)
        );
        const result = createNullPrototypeObject<JsonObject>();
        for (const [key, entryValue] of entries) {
            Object.defineProperty(result, key, {
                configurable: true,
                enumerable: true,
                value: createCanonicalJsonValue(entryValue),
                writable: true,
            });
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

function isJsonRecord(value: JsonValue): value is JsonObject {
    return !Array.isArray(value) && typeof value === "object" && value !== null;
}
