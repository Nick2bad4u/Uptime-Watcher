/**
 * Property-based testing for all safe object manipulation functions with edge
 * cases
 *
 * @module shared/utils/objectSafety
 *
 * @version 1.0.0
 *
 *   This file provides 100% fuzzing test coverage for the objectSafety module
 *   using fast-check property-based testing. It validates type safety, edge
 *   cases, and comprehensive input handling across all object manipulation
 *   functions.
 *
 *   Coverage Goals:
 *
 *   - 100% line coverage for all objectSafety functions
 *   - Comprehensive edge case testing with property-based fuzzing
 *   - Type safety validation with arbitrary inputs
 *   - Object manipulation safety verification
 *   - Performance characteristics under extreme inputs
 *
 * @file Comprehensive fuzzing test coverage for objectSafety utilities
 */

import { fc, test } from "@fast-check/vitest";
import { describe, expect, vi } from "vitest";

import {
    safeObjectAccess,
    safeObjectIteration,
    safeObjectOmit,
    safeObjectPick,
    typedObjectEntries,
    typedObjectKeys,
    typedObjectValues,
} from "./objectSafety.js";

describe("objectSafety comprehensive fuzzing tests", () => {
    describe(safeObjectAccess, () => {
        test.prop([
            fc.anything(),
            fc.string(),
            fc.anything(),
        ])(
            "returns fallback for non-object inputs",
            (nonObject, key, fallback) => {
                fc.pre(typeof nonObject !== "object" || nonObject === null);
                const result = safeObjectAccess(nonObject, key, fallback);
                expect(result).toBe(fallback);
            }
        );

        test.prop([
            fc.record({}),
            fc.string(),
            fc.anything(),
        ])(
            "returns fallback for non-existent keys",
            (obj, nonExistentKey, fallback) => {
                fc.pre(!Object.hasOwn(obj, nonExistentKey));
                const result = safeObjectAccess(obj, nonExistentKey, fallback);
                expect(result).toBe(fallback);
            }
        );

        test.prop([fc.record({ test: fc.string() }), fc.string()])(
            "returns actual value when key exists and types match",
            (obj, fallback) => {
                const result = safeObjectAccess(obj, "test", fallback);
                if (typeof obj.test === typeof fallback) {
                    expect(result).toBe(obj.test);
                } else {
                    expect(result).toBe(fallback);
                }
            }
        );

        test.prop([fc.record({ num: fc.integer() }), fc.integer()])(
            "handles number properties correctly",
            (obj, fallback) => {
                const result = safeObjectAccess(obj, "num", fallback);
                expect(result).toBe(obj.num);
                expect(typeof result).toBe("number");
            }
        );

        test.prop([fc.record({ bool: fc.boolean() }), fc.boolean()])(
            "handles boolean properties correctly",
            (obj, fallback) => {
                const result = safeObjectAccess(obj, "bool", fallback);
                expect(result).toBe(obj.bool);
                expect(typeof result).toBe("boolean");
            }
        );

        test("handles symbol keys correctly", () => {
            const symbolKey = Symbol("test");
            const obj = { [symbolKey]: "symbol-value" };

            const result = safeObjectAccess(obj, symbolKey, "fallback");
            expect(result).toBe("symbol-value");

            const nonExistentSymbol = Symbol("nonexistent");
            const fallbackResult = safeObjectAccess(
                obj,
                nonExistentSymbol,
                "fallback"
            );
            expect(fallbackResult).toBe("fallback");
        });

        test.prop([fc.record({ value: fc.anything() }), fc.anything()])(
            "uses validator function when provided",
            (obj, fallback) => {
                const isString = (value: unknown): value is string =>
                    typeof value === "string";
                const result = safeObjectAccess(
                    obj,
                    "value",
                    fallback,
                    isString
                );

                if (typeof obj.value === "string") {
                    expect(result).toBe(obj.value);
                } else {
                    expect(result).toBe(fallback);
                }
            }
        );

        test("validator function is called correctly", () => {
            const obj = { test: 42 };

            let callCount = 0;
            let receivedValue: unknown = undefined;
            const validator = (value: unknown): value is number => {
                callCount++;
                receivedValue = value;
                return typeof value === "number";
            };

            const result = safeObjectAccess(obj, "test", 999, validator);

            expect(callCount).toBe(1);
            expect(receivedValue).toBe(42);
            expect(result).toBe(42);
        });

        test("validator function prevents incorrect type returns", () => {
            const obj = { test: "string-value" };

            let callCount = 0;
            let receivedValue: unknown = undefined;
            const numberValidator = (value: unknown): value is number => {
                callCount++;
                receivedValue = value;
                return typeof value === "number";
            };

            const result = safeObjectAccess(obj, "test", 999, numberValidator);

            expect(callCount).toBe(1);
            expect(receivedValue).toBe("string-value");
            expect(result).toBe(999); // Should return fallback
        });

        test("handles edge cases with complex objects", () => {
            const complexObj = {
                nested: { deep: { value: "found" } },
                array: [
                    1,
                    2,
                    3,
                ],
                func: () => "function",
                date: new Date(),
                regex: /test/,
            };

            expect(safeObjectAccess(complexObj, "nested", null)).toBe(
                complexObj.nested
            );
            expect(safeObjectAccess(complexObj, "array", null)).toBe(
                complexObj.array
            );
            expect(safeObjectAccess(complexObj, "func", null)).toBe(null); // Function type doesn't match null type
            expect(safeObjectAccess(complexObj, "date", null)).toBe(
                complexObj.date
            );
            expect(safeObjectAccess(complexObj, "regex", null)).toBe(
                complexObj.regex
            );
        });
    });

    describe(safeObjectIteration, () => {
        test.prop([fc.anything()])(
            "handles non-object inputs gracefully",
            (nonObject) => {
                fc.pre(typeof nonObject !== "object" || nonObject === null);

                const callback = vi.fn();
                const consoleSpy = vi
                    .spyOn(console, "warn")
                    .mockImplementation(() => {});

                safeObjectIteration(nonObject, callback);

                expect(callback).not.toHaveBeenCalled();
                expect(consoleSpy).toHaveBeenCalledWith(
                    `Safe object iteration: Expected object, got ${typeof nonObject}`
                );

                consoleSpy.mockRestore();
            }
        );

        test.prop([fc.record({})])(
            "iterates over object properties correctly",
            (obj) => {
                const entries: [string, unknown][] = [];
                const callback = vi.fn((key: string, value: unknown) => {
                    entries.push([key, value]);
                });

                safeObjectIteration(obj, callback);

                const expectedEntries = Object.entries(obj);
                expect(callback).toHaveBeenCalledTimes(expectedEntries.length);
                expect(entries).toEqual(expectedEntries);
            }
        );

        test.prop([
            fc.record({ a: fc.string(), b: fc.integer(), c: fc.boolean() }),
        ])("provides correct key-value pairs to callback", (obj) => {
            const receivedEntries: [string, unknown][] = [];

            safeObjectIteration(obj, (key, value) => {
                receivedEntries.push([key, value]);
            });

            for (const [key, value] of receivedEntries) {
                expect(Object.hasOwn(obj, key)).toBeTruthy();
                expect((obj as Record<string, unknown>)[key]).toBe(value);
            }
        });

        test("handles callback errors gracefully", () => {
            const obj = { a: 1, b: 2, c: 3 };
            const errorCallback = vi.fn(() => {
                throw new Error("Callback error");
            });

            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            safeObjectIteration(obj, errorCallback, "Test context");

            expect(errorCallback).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Object iteration failed for context:",
                "Test context",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        test("uses custom context in error messages", () => {
            const consoleSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            safeObjectIteration(null, vi.fn(), "Custom context");

            expect(consoleSpy).toHaveBeenCalledWith(
                "Custom context: Expected object, got object"
            );

            consoleSpy.mockRestore();
        });

        test("handles objects with symbol properties", () => {
            const symbolKey = Symbol("symbol");
            const obj = {
                stringKey: "string-value",
                [symbolKey]: "symbol-value",
            };

            const callback = vi.fn();
            safeObjectIteration(obj, callback);

            // Object.entries only returns string keys, not symbols
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith("stringKey", "string-value");
        });
    });

    describe(safeObjectOmit, () => {
        test.prop([fc.constantFrom(null, undefined), fc.array(fc.string())])(
            "returns empty object for null/undefined inputs",
            (nullishInput, keys) => {
                const result = safeObjectOmit(nullishInput, keys);
                expect(result).toEqual({});
                expect(typeof result).toBe("object");
            }
        );

        test.prop([
            fc.record({ a: fc.string(), b: fc.integer(), c: fc.boolean() }),
        ])("omits specified keys correctly", (obj) => {
            const result = safeObjectOmit(obj, ["a", "c"]);

            expect(result).not.toHaveProperty("a");
            expect(result).not.toHaveProperty("c");
            expect(result).toHaveProperty("b");
            expect(result.b).toBe(obj.b);
        });

        test.prop([
            fc.record({ a: fc.string(), b: fc.integer() }),
            fc.array(fc.string()),
        ])(
            "handles omitting non-existent keys gracefully",
            (obj, nonExistentKeys) => {
                fc.pre(
                    nonExistentKeys.every((key) => !Object.hasOwn(obj, key))
                );

                // Use type assertion to handle the generic constraint
                const result = safeObjectOmit(
                    obj as Record<string, unknown>,
                    nonExistentKeys as readonly string[]
                );
                expect(result).toEqual(obj);
            }
        );

        test("handles symbol properties correctly", () => {
            const symbolKey = Symbol("symbol");
            const obj = {
                stringKey: "string-value",
                numberKey: 42,
                [symbolKey]: "symbol-value",
            };

            const result = safeObjectOmit(obj, ["stringKey"]);

            expect(result).not.toHaveProperty("stringKey");
            expect(result).toHaveProperty("numberKey");
            expect(symbolKey in result).toBeTruthy();
            expect((result as Record<symbol, unknown>)[symbolKey]).toBe(
                "symbol-value"
            );
        });

        test("preserves all properties when omitting empty array", () => {
            const obj = { a: 1, b: "test", c: true };
            const result = safeObjectOmit(obj, []);

            expect(result).toEqual(obj);
            expect(result).not.toBe(obj); // Should be a new object
        });

        test.prop([
            fc.record({ a: fc.anything(), b: fc.anything(), c: fc.anything() }),
        ])("creates new object reference", (obj) => {
            const result = safeObjectOmit(obj, ["a"]);
            expect(result).not.toBe(obj);
            expect(typeof result).toBe("object");
        });

        test("handles complex nested objects", () => {
            const obj = {
                simple: "value",
                nested: { deep: { value: "nested" } },
                array: [
                    1,
                    2,
                    3,
                ],
                func: () => "function",
            };

            const result = safeObjectOmit(obj, ["simple"]);

            expect(result).toEqual({
                nested: { deep: { value: "nested" } },
                array: [
                    1,
                    2,
                    3,
                ],
                func: obj.func,
            });

            // Should maintain references to nested objects
            expect(result.nested).toBe(obj.nested);
            expect(result.array).toBe(obj.array);
            expect(result.func).toBe(obj.func);
        });
    });

    describe(safeObjectPick, () => {
        test.prop([
            fc.record({ a: fc.string(), b: fc.integer(), c: fc.boolean() }),
        ])("picks specified keys correctly", (obj) => {
            const result = safeObjectPick(obj, ["a", "c"]);

            expect(result).toHaveProperty("a");
            expect(result).toHaveProperty("c");
            expect(result).not.toHaveProperty("b");
            expect(result.a).toBe(obj.a);
            expect(result.c).toBe(obj.c);
        });

        test.prop([
            fc.record({ a: fc.string(), b: fc.integer() }),
            fc.array(fc.string()),
        ])(
            "handles picking non-existent keys gracefully",
            (obj, nonExistentKeys) => {
                fc.pre(
                    nonExistentKeys.every((key) => !Object.hasOwn(obj, key))
                );

                // Use type assertion to handle the generic constraint
                const result = safeObjectPick(
                    obj as Record<string, unknown>,
                    nonExistentKeys as readonly string[]
                );
                expect(result).toEqual({});
            }
        );

        test("handles symbol keys correctly", () => {
            const symbolKey = Symbol("symbol");
            const obj = {
                stringKey: "string-value",
                numberKey: 42,
                [symbolKey]: "symbol-value",
            };

            const result = safeObjectPick(obj, ["stringKey", symbolKey]);

            expect(result).toHaveProperty("stringKey");
            expect(symbolKey in result).toBeTruthy();
            expect(result).not.toHaveProperty("numberKey");
            expect(result.stringKey).toBe("string-value");
            expect((result as Record<symbol, unknown>)[symbolKey]).toBe(
                "symbol-value"
            );
        });

        test("returns empty object when picking empty array", () => {
            const obj = { a: 1, b: "test", c: true };
            const result = safeObjectPick(obj, []);

            expect(result).toEqual({});
        });

        test.prop([
            fc.record({ a: fc.anything(), b: fc.anything(), c: fc.anything() }),
        ])("creates new object reference", (obj) => {
            const result = safeObjectPick(obj, ["a", "b"]);
            expect(result).not.toBe(obj);
            expect(typeof result).toBe("object");
        });

        test("handles complex nested objects", () => {
            const obj = {
                simple: "value",
                nested: { deep: { value: "nested" } },
                array: [
                    1,
                    2,
                    3,
                ],
                func: () => "function",
                unused: "not-picked",
            };

            const result = safeObjectPick(obj, [
                "nested",
                "array",
                "func",
            ]);

            expect(result).toEqual({
                nested: { deep: { value: "nested" } },
                array: [
                    1,
                    2,
                    3,
                ],
                func: obj.func,
            });

            // Should maintain references to nested objects
            expect(result.nested).toBe(obj.nested);
            expect(result.array).toBe(obj.array);
            expect(result.func).toBe(obj.func);
        });
    });

    describe(typedObjectEntries, () => {
        test.prop([fc.record({})])(
            "returns entries in correct format",
            (obj) => {
                const result = typedObjectEntries(obj);
                const expected = Object.entries(obj);

                expect(result).toEqual(expected);
                expect(Array.isArray(result)).toBeTruthy();

                for (const [key, value] of result) {
                    expect(typeof key).toBe("string");
                    expect(obj).toHaveProperty(key);
                    expect(obj[key]).toBe(value);
                }
            }
        );

        test.prop([
            fc.record({ a: fc.string(), b: fc.integer(), c: fc.boolean() }),
        ])("provides correct typing for known object shapes", (obj) => {
            const entries = typedObjectEntries(obj);

            for (const [key, value] of entries) {
                // Type assertion validates that the types are preserved
                expect([
                    "a",
                    "b",
                    "c",
                ]).toContain(key);
                expect(obj[key]).toBe(value);
            }
        });

        test("handles empty objects", () => {
            const result = typedObjectEntries({});
            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBeTruthy();
        });

        test("handles objects with symbol properties", () => {
            const symbolKey = Symbol("symbol");
            const obj = {
                stringKey: "string-value",
                [symbolKey]: "symbol-value",
            };

            const result = typedObjectEntries(obj);

            // Object.entries only returns string keys, not symbols
            expect(result).toEqual([["stringKey", "string-value"]]);
        });

        test("handles objects with various value types", () => {
            const obj = {
                string: "text",
                number: 42,
                boolean: true,
                null: null,
                undefined: undefined,
                array: [
                    1,
                    2,
                    3,
                ],
                object: { nested: true },
                function: () => "test",
            };

            const result = typedObjectEntries(obj);

            expect(result).toHaveLength(8);
            for (const [key, value] of result) {
                expect(obj[key]).toBe(value);
            }
        });
    });

    describe(typedObjectKeys, () => {
        test.prop([fc.record({})])("returns keys in correct format", (obj) => {
            const result = typedObjectKeys(obj);
            const expected = Object.keys(obj);

            expect(result).toEqual(expected);
            expect(Array.isArray(result)).toBeTruthy();

            for (const key of result) {
                expect(typeof key).toBe("string");
                expect(obj).toHaveProperty(key);
            }
        });

        test.prop([
            fc.record({ a: fc.anything(), b: fc.anything(), c: fc.anything() }),
        ])("provides correct typing for known object shapes", (obj) => {
            const keys = typedObjectKeys(obj);

            expect(keys).toContain("a");
            expect(keys).toContain("b");
            expect(keys).toContain("c");
            expect(keys).toHaveLength(3);
        });

        test("handles empty objects", () => {
            const result = typedObjectKeys({});
            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBeTruthy();
        });

        test("handles objects with symbol properties", () => {
            const symbolKey = Symbol("symbol");
            const obj = {
                stringKey: "string-value",
                [symbolKey]: "symbol-value",
            };

            const result = typedObjectKeys(obj);

            // Object.keys only returns string keys, not symbols
            expect(result).toEqual(["stringKey"]);
        });

        test("preserves key order", () => {
            const obj = { z: 1, a: 2, m: 3 };
            const result = typedObjectKeys(obj);
            const expected = Object.keys(obj);

            expect(result).toEqual(expected);
        });
    });

    describe(typedObjectValues, () => {
        test.prop([fc.record({})])(
            "returns values in correct format",
            (obj) => {
                const result = typedObjectValues(obj);
                const expected = Object.values(obj);

                expect(result).toEqual(expected);
                expect(Array.isArray(result)).toBeTruthy();

                const objectValues = Object.values(obj);
                for (const [i, element] of result.entries()) {
                    expect(element).toBe(objectValues[i]);
                }
            }
        );

        test.prop([
            fc.record({ a: fc.string(), b: fc.integer(), c: fc.boolean() }),
        ])("provides correct typing for known object shapes", (obj) => {
            const values = typedObjectValues(obj);

            expect(values).toContain(obj.a);
            expect(values).toContain(obj.b);
            expect(values).toContain(obj.c);
            expect(values).toHaveLength(3);
        });

        test("handles empty objects", () => {
            const result = typedObjectValues({});
            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBeTruthy();
        });

        test("handles objects with symbol properties", () => {
            const symbolKey = Symbol("symbol");
            const obj = {
                stringKey: "string-value",
                [symbolKey]: "symbol-value",
            };

            const result = typedObjectValues(obj);

            // Object.values only returns values for string keys, not symbols
            expect(result).toEqual(["string-value"]);
        });

        test("handles objects with various value types", () => {
            const obj = {
                string: "text",
                number: 42,
                boolean: true,
                null: null,
                undefined: undefined,
                array: [
                    1,
                    2,
                    3,
                ],
                object: { nested: true },
                function: () => "test",
            };

            const result = typedObjectValues(obj);
            const expected = Object.values(obj);

            expect(result).toEqual(expected);
            expect(result).toHaveLength(8);
        });

        test("preserves value order corresponding to key order", () => {
            const obj = { z: "zulu", a: "alpha", m: "mike" };
            const result = typedObjectValues(obj);
            const keys = Object.keys(obj);

            for (const [i, key] of keys.entries()) {
                expect(result[i]).toBe((obj as Record<string, string>)[key]);
            }
        });
    });

    describe("Integration and cross-function property tests", () => {
        test.prop([fc.record({})])(
            "typed functions maintain consistency with native Object methods",
            (obj) => {
                const keys = typedObjectKeys(obj);
                const values = typedObjectValues(obj);
                const entries = typedObjectEntries(obj);

                expect(keys).toEqual(Object.keys(obj));
                expect(values).toEqual(Object.values(obj));
                expect(entries).toEqual(Object.entries(obj));
            }
        );

        test.prop([
            fc.record({ a: fc.anything(), b: fc.anything(), c: fc.anything() }),
        ])("pick and omit are complementary operations", (obj) => {
            const picked = safeObjectPick(obj, ["a", "b"]);
            const omitted = safeObjectOmit(obj, ["c"]);

            expect(picked).toEqual(omitted);
        });

        test.prop([fc.record({})])(
            "entries can reconstruct original object structure",
            (obj) => {
                const entries = typedObjectEntries(obj);
                const reconstructed = Object.fromEntries(entries);

                expect(reconstructed).toEqual(obj);
            }
        );

        test.prop([fc.record({})])(
            "keys and values have matching lengths",
            (obj) => {
                const keys = typedObjectKeys(obj);
                const values = typedObjectValues(obj);

                expect(keys).toHaveLength(values.length);
            }
        );

        test.prop([fc.record({ a: fc.anything(), b: fc.anything() })])(
            "safeObjectAccess works with all keys from typedObjectKeys",
            (obj) => {
                const keys = typedObjectKeys(obj);

                // Only test if there are keys to test
                if (keys.length === 0) {
                    return;
                }

                for (const key of keys) {
                    const value = safeObjectAccess(obj, key, "fallback");
                    // The value should match the original if types are compatible
                    if (typeof obj[key] === "string") {
                        expect(value).toBe(obj[key]);
                    } else {
                        // For non-string types, it should use the fallback
                        expect(value).toBe("fallback");
                    }
                }
            }
        );
    });

    describe("Performance and stress testing", () => {
        test.prop([
            fc.array(fc.record({}), { minLength: 100, maxLength: 1000 }),
        ])("handles large arrays of objects efficiently", (objects) => {
            const startTime = performance.now();

            for (const obj of objects) {
                typedObjectKeys(obj);
                typedObjectValues(obj);
                typedObjectEntries(obj);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should process 100-1000 objects in reasonable time (< 100ms)
            expect(duration).toBeLessThan(100);
        });

        test("handles objects with many properties efficiently", () => {
            // Create a large object for performance testing
            const largeObj: Record<string, number> = {};
            for (let i = 0; i < 1000; i++) {
                largeObj[`key${i}`] = i;
            }

            const startTime = performance.now();

            typedObjectKeys(largeObj);
            typedObjectValues(largeObj);
            typedObjectEntries(largeObj);

            const objKeys = Object.keys(largeObj);
            if (objKeys.length > 0) {
                safeObjectPick(
                    largeObj,
                    objKeys.slice(0, 10) as readonly string[]
                );
                safeObjectOmit(
                    largeObj,
                    objKeys.slice(0, 10) as readonly string[]
                );
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should handle large objects in reasonable time (< 100ms)
            expect(duration).toBeLessThan(100);
        });

        test("handles deep iteration without stack overflow", () => {
            const callback = vi.fn();
            const largeObj: Record<string, number> = {};

            // Create object with 10000 properties
            for (let i = 0; i < 10_000; i++) {
                largeObj[`key${i}`] = i;
            }

            expect(() => {
                safeObjectIteration(largeObj, callback);
            }).not.toThrow();

            expect(callback).toHaveBeenCalledTimes(10_000);
        });
    });
});
