/**
 * Tests for canonical JSON helpers used by cloud sync.
 */

import type { JsonValue } from "@shared/types/cloudSync";

import {
    createCanonicalJsonValue,
    stringifyJsonValueStable,
} from "@shared/utils/canonicalJson";
import { describe, expect, it } from "vitest";

describe(createCanonicalJsonValue, () => {
    it("sorts object keys recursively and preserves array ordering", () => {
        const value = {
            z: 1,
            a: {
                d: 4,
                b: 2,
                c: [
                    { y: 2, x: 1 },
                    { b: 1, a: 2 },
                ],
            },
        };

        expect(createCanonicalJsonValue(value)).toEqual({
            a: {
                b: 2,
                c: [
                    { x: 1, y: 2 },
                    { a: 2, b: 1 },
                ],
                d: 4,
            },
            z: 1,
        });

        expect(stringifyJsonValueStable(value)).toBe(
            '{"a":{"b":2,"c":[{"x":1,"y":2},{"a":2,"b":1}],"d":4},"z":1}'
        );
    });

    it("preserves prototype-named keys as canonical JSON data", () => {
        const value = Object.create(null) as JsonValue &
            Record<string, JsonValue>;
        Object.defineProperty(value, "__proto__", {
            configurable: true,
            enumerable: true,
            value: {
                z: 1,
                a: 2,
            },
            writable: true,
        });
        Object.defineProperty(value, "constructor", {
            configurable: true,
            enumerable: true,
            value: {
                prototype: "data",
            },
            writable: true,
        });

        const canonical = createCanonicalJsonValue(value);

        expect(Object.getPrototypeOf(canonical)).toBeNull();
        expect(
            Object.getOwnPropertyDescriptor(canonical, "__proto__")
        ).toMatchObject({
            enumerable: true,
            value: {
                a: 2,
                z: 1,
            },
        });
        expect(stringifyJsonValueStable(value)).toBe(
            '{"__proto__":{"a":2,"z":1},"constructor":{"prototype":"data"}}'
        );
    });
});
