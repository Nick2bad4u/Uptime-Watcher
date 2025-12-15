/**
 * Tests for canonical JSON helpers used by cloud sync.
 */

import { describe, expect, it } from "vitest";

import {
    createCanonicalJsonValue,
    stringifyJsonValueStable,
} from "@shared/utils/canonicalJson";

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
});
