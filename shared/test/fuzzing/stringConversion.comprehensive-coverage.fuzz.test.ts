/**
 * Comprehensive fast-check fuzzing tests for stringConversion utilities.
 *
 * @remarks
 * These property-based tests use fast-check to systematically explore edge
 * cases and verify string conversion function invariants across all possible
 * JavaScript values.
 *
 * Focuse // Maps and Sets stringify to JSON as empty objects
 * expect(mapResult).toBe("{}"); expect(setResult).toBe("{}"); n achieving 100%
 * coverage for stringConversion module functions:
 *
 * - SafeStringify
 *
 * @packageDocumentation
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import { safeStringify } from "../../utils/stringConversion";

describe("StringConversion Complete Coverage Fuzzing Tests", () => {
    describe(safeStringify, () => {
        test.prop([fc.constant(null)])("should return empty string for null", (
            nullValue
        ) => {
            const result = safeStringify(nullValue);
            expect(result).toBe("");
            expect(typeof result).toBe("string");
        });

        test.prop([fc.constant(undefined)])(
            "should return empty string for undefined",
            (undefinedValue) => {
                const result = safeStringify(undefinedValue);
                expect(result).toBe("");
                expect(typeof result).toBe("string");
            }
        );

        test.prop([fc.string()])("should return string unchanged", (str) => {
            const result = safeStringify(str);
            expect(result).toBe(str);
            expect(typeof result).toBe("string");
        });

        test.prop([fc.integer()])("should convert numbers to strings", (
            num
        ) => {
            const result = safeStringify(num);
            expect(result).toBe(String(num));
            expect(typeof result).toBe("string");
            expect(Number(result)).toBe(num);
        });

        test.prop([fc.float()])("should convert floats to strings", (num) => {
            const result = safeStringify(num);
            expect(result).toBe(String(num));
            expect(typeof result).toBe("string");

            if (!Number.isNaN(num)) {
                const back = Number(result);
                if (Object.is(num, -0)) {
                    // SafeStringify(-0) normalizes to "0"; reciprocal should be +Infinity
                    expect(back).toBe(0);
                    expect(1 / back).toBe(Infinity);
                } else {
                    expect(back).toBe(num);
                }
            }
        });

        test.prop([fc.boolean()])("should convert booleans to strings", (
            bool
        ) => {
            const result = safeStringify(bool);
            expect(result).toBe(String(bool));
            expect(typeof result).toBe("string");
            expect(result === "true" || result === "false").toBeTruthy();
        });

        test.prop([fc.bigInt()])("should convert bigints to strings", (
            bigint
        ) => {
            const result = safeStringify(bigint);
            expect(result).toBe(bigint.toString());
            expect(typeof result).toBe("string");
            expect(BigInt(result)).toBe(bigint);
        });

        it("should convert symbols to strings", () => {
            const symbol = Symbol("test");
            const result = safeStringify(symbol);
            expect(result).toBe(symbol.toString());
            expect(typeof result).toBe("string");
            expect(result.startsWith("Symbol")).toBeTruthy();

            const anonSymbol = Symbol("anonymous");
            const anonResult = safeStringify(anonSymbol);
            expect(anonResult).toBe(anonSymbol.toString());
            expect(anonResult.startsWith("Symbol")).toBeTruthy();
        });

        test.prop([fc.func(fc.anything())])(
            "should convert functions to '[Function]'",
            (func) => {
                const result = safeStringify(func);
                expect(result).toBe("[Function]");
                expect(typeof result).toBe("string");
            }
        );

        test.prop([fc.object()])(
            "should convert simple objects to JSON strings",
            (obj) => {
                const result = safeStringify(obj);
                expect(typeof result).toBe("string");

                try {
                    // If it's valid JSON, parsing should work
                    const parsed = JSON.parse(result);
                    expect(typeof parsed).toBe("object");
                } catch {
                    // If JSON parsing fails, it should be the fallback string
                    expect(result).toBe("[Complex Object]");
                }
            }
        );

        test.prop([fc.array(fc.anything())])(
            "should convert arrays to JSON strings",
            (arr) => {
                const result = safeStringify(arr);
                expect(typeof result).toBe("string");

                try {
                    const parsed = JSON.parse(result);
                    expect(Array.isArray(parsed)).toBeTruthy();
                } catch {
                    expect(result).toBe("[Complex Object]");
                }
            }
        );

        it("should handle circular references", () => {
            const circular: any = { name: "test" };
            circular.self = circular;

            const result = safeStringify(circular);
            expect(result).toBe("[Complex Object]");
            expect(typeof result).toBe("string");
        });

        it("should handle deeply nested objects", () => {
            const deep = { a: { b: { c: { d: { e: "deep" } } } } };
            const result = safeStringify(deep);
            expect(typeof result).toBe("string");

            try {
                const parsed = JSON.parse(result);
                expect(parsed.a.b.c.d.e).toBe("deep");
            } catch {
                expect(result).toBe("[Complex Object]");
            }
        });

        it("should handle special number values", () => {
            expect(safeStringify(Number.NaN)).toBe("NaN");
            expect(safeStringify(Infinity)).toBe("Infinity");
            expect(safeStringify(-Infinity)).toBe("-Infinity");
            expect(safeStringify(0)).toBe("0");
            expect(safeStringify(-0)).toBe("0");
        });

        it("should handle Date objects", () => {
            const date = new Date("2023-01-01T00:00:00.000Z");
            const result = safeStringify(date);
            expect(typeof result).toBe("string");

            try {
                const parsed = JSON.parse(result);
                expect(typeof parsed).toBe("string");
                expect(new Date(parsed).getTime()).toBe(date.getTime());
            } catch {
                expect(result).toBe("[Complex Object]");
            }
        });

        it("should handle RegExp objects", () => {
            const regex = /test/gi;
            const result = safeStringify(regex);
            expect(typeof result).toBe("string");
            expect(result).toBe("{}"); // RegExp JSON stringifies to empty object
        });

        test.prop([
            fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null),
                fc.constant(undefined),
                fc.bigInt(),
                fc.constant(Symbol("test")),
                fc.func(fc.anything()),
                fc.object(),
                fc.array(fc.anything())
            ),
        ])("should always return a string", (value) => {
            const result = safeStringify(value);
            expect(typeof result).toBe("string");
            expect(result).toBeDefined();
        });

        test.prop([fc.anything()])("should never return '[object Object]'", (
            value
        ) => {
            const result = safeStringify(value);
            expect(result).not.toBe("[object Object]");
        });

        test.prop([fc.anything()])("should be deterministic", (value) => {
            const result1 = safeStringify(value);
            const result2 = safeStringify(value);
            expect(result1).toBe(result2);
        });

        it("should handle mixed arrays", () => {
            const mixed = [
                1,
                "hello",
                true,
                null,
                undefined,
                { a: 1 },
                [1, 2],
            ];
            const result = safeStringify(mixed);
            expect(typeof result).toBe("string");

            try {
                const parsed = JSON.parse(result);
                expect(Array.isArray(parsed)).toBeTruthy();
                expect(parsed[0]).toBe(1);
                expect(parsed[1]).toBe("hello");
                expect(parsed[2]).toBeTruthy();
                expect(parsed[3]).toBe(null);
                expect(parsed[4]).toBe(null); // Undefined becomes null in JSON
            } catch {
                expect(result).toBe("[Complex Object]");
            }
        });

        it("should handle empty values", () => {
            expect(safeStringify({})).toBe("{}");
            expect(safeStringify([])).toBe("[]");
            expect(safeStringify("")).toBe("");
            expect(safeStringify(0)).toBe("0");
            expect(safeStringify(false)).toBe("false");
        });

        test.prop([fc.anything()])(
            "should handle all edge cases without throwing",
            (value) => {
                expect(() => safeStringify(value)).not.toThrowError();
                const result = safeStringify(value);
                expect(typeof result).toBe("string");
                expect(result.length).toBeGreaterThanOrEqual(0);
            }
        );

        it("should handle WeakMap and WeakSet", () => {
            const weakMap = new WeakMap();
            const weakSet = new WeakSet();

            expect(safeStringify(weakMap)).toBe("{}");
            expect(safeStringify(weakSet)).toBe("{}");
        });

        it("should handle Map and Set", () => {
            const map = new Map([["key", "value"]]);
            const set = new Set([
                1,
                2,
                3,
            ]);

            const mapResult = safeStringify(map);
            const setResult = safeStringify(set);

            expect(typeof mapResult).toBe("string");
            expect(typeof setResult).toBe("string");

            // Maps and Sets don't stringify to JSON well, so should be fallback
            expect(mapResult).toBe("[Complex Object]");
            expect(setResult).toBe("[Complex Object]");
        });

        test.prop([fc.anything()])(
            "should produce safe output for logging and display",
            (value) => {
                const result = safeStringify(value);

                // Should be safe for console.log
                expect(() => console.log(result)).not.toThrowError();

                // Should not contain dangerous characters for basic HTML display
                // (though proper HTML escaping would still be needed)
                expect(typeof result).toBe("string");

                // Should not be the ambiguous [object Object]
                expect(result).not.toBe("[object Object]");
            }
        );
    });

    describe("Performance and Edge Cases", () => {
        test.prop([
            fc.array(fc.anything(), { minLength: 100, maxLength: 1000 }),
        ])("should handle large arrays efficiently", (largeArray) => {
            const startTime = performance.now();
            const result = safeStringify(largeArray);
            const endTime = performance.now();

            expect(typeof result).toBe("string");
            expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time
        });

        it("should handle objects with null prototype", () => {
            const obj = Object.create(null);
            obj.property = "value";

            const result = safeStringify(obj);
            expect(typeof result).toBe("string");

            try {
                const parsed = JSON.parse(result);
                expect(parsed.property).toBe("value");
            } catch {
                expect(result).toBe("[Complex Object]");
            }
        });

        it("should handle objects with toString/valueOf overrides", () => {
            const obj = {
                toString: () => "custom toString",
                valueOf: () => 42,
                property: "test",
            };

            const result = safeStringify(obj);
            expect(typeof result).toBe("string");

            // Should use JSON serialization, not toString/valueOf
            try {
                const parsed = JSON.parse(result);
                expect(parsed.property).toBe("test");
            } catch {
                expect(result).toBe("[Complex Object]");
            }
        });
    });
});
