/**
 * @fileoverview Fuzzing tests for objectSafety utilities
 * @author AI Generated
 * @since 2024
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect, it, vi } from "vitest";
import {
    safeObjectAccess,
    safeObjectIteration,
    safeObjectOmit,
    safeObjectPick,
    typedObjectEntries,
    typedObjectKeys,
    typedObjectValues
} from "../../utils/objectSafety";

describe("objectSafety.ts fuzzing tests", () => {
    describe("safeObjectAccess", () => {
        test.prop([
            fc.anything(),
            fc.oneof(fc.string(), fc.constantFrom(Symbol("test"), Symbol.for("test"))),
            fc.anything()
        ])("should return fallback for non-objects", (nonObject, key, fallback) => {
            fc.pre(nonObject === null || typeof nonObject !== "object" || Array.isArray(nonObject));

            const result = safeObjectAccess(nonObject, key, fallback);
            expect(result).toBe(fallback);
        });

        test.prop([
            fc.record({}),
            fc.string(),
            fc.anything()
        ])("should return fallback for missing properties", (obj, key, fallback) => {
            fc.pre(!Object.hasOwn(obj, key));

            const result = safeObjectAccess(obj, key, fallback);
            expect(result).toBe(fallback);
        });

        test.prop([
            fc.string(),
            fc.string(),
            fc.string()
        ])("should return actual value when property exists and types match", (key, value, fallback) => {
            fc.pre(typeof value === typeof fallback);

            const obj = { [key]: value };
            const result = safeObjectAccess(obj, key, fallback);
            expect(result).toBe(value);
        });

        test.prop([
            fc.string(),
            fc.integer(),
            fc.string()
        ])("should return fallback when property exists but types don't match", (key, value, fallback) => {
            fc.pre(typeof value !== typeof fallback);

            const obj = { [key]: value };
            const result = safeObjectAccess(obj, key, fallback);
            expect(result).toBe(fallback);
        });

        test.prop([
            fc.string(),
            fc.anything(),
            fc.anything()
        ])("should use validator when provided", (key, value, fallback) => {
            const obj = { [key]: value };
            const [validatorResult] = fc.sample(fc.boolean(), 1);
            const validator = vi.fn().mockReturnValue(validatorResult);

            const result = safeObjectAccess(obj, key, fallback, validator);

            expect(validator).toHaveBeenCalledWith(value);
            expect(result).toBe(validatorResult ? value : fallback);
        });

        test.prop([fc.anything(), fc.anything()])(
            "should handle symbol keys correctly",
            (value, fallback) => {
                const symbolKey = Symbol("test");
                const obj = { [symbolKey]: value };

                const result = safeObjectAccess(obj, symbolKey, fallback);

                if (typeof value === typeof fallback) {
                    expect(result).toBe(value);
                } else {
                    expect(result).toBe(fallback);
                }
            }
        );
    });

    describe("safeObjectIteration", () => {
        test.prop([fc.anything()])(
            "should handle non-objects gracefully",
            (nonObject) => {
                fc.pre(nonObject === null || typeof nonObject !== "object" || Array.isArray(nonObject));

                const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
                const callback = vi.fn();

                safeObjectIteration(nonObject, callback);

                expect(callback).not.toHaveBeenCalled();
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining("Expected object, got")
                );

                consoleSpy.mockRestore();
            }
        );

        test.prop([
            fc.record({
                key1: fc.anything(),
                key2: fc.anything(),
                key3: fc.anything()
            }, { requiredKeys: [] })
        ])("should iterate over object entries", (obj) => {
            const callback = vi.fn();

            safeObjectIteration(obj, callback);

            const expectedCalls = Object.entries(obj).length;
            expect(callback).toHaveBeenCalledTimes(expectedCalls);

            for (const [key, value] of Object.entries(obj)) {
                expect(callback).toHaveBeenCalledWith(key, value);
            }
        });

        test.prop([fc.record({ key: fc.string() })])(
            "should handle callback errors gracefully",
            (obj) => {
                const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
                const callback = vi.fn().mockImplementation(() => {
                    throw new Error("Callback error");
                });

                expect(() => safeObjectIteration(obj, callback)).not.toThrow();
                expect(consoleSpy).toHaveBeenCalledWith(
                    "Object iteration failed for context:",
                    "Safe object iteration",
                    expect.any(Error)
                );

                consoleSpy.mockRestore();
            }
        );

        test.prop([fc.record({ key: fc.string() }), fc.string()])(
            "should use custom context in error messages",
            (obj, context) => {
                const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
                const callback = vi.fn().mockImplementation(() => {
                    throw new Error("Test error");
                });

                safeObjectIteration(obj, callback, context);

                expect(consoleSpy).toHaveBeenCalledWith(
                    "Object iteration failed for context:",
                    context,
                    expect.any(Error)
                );

                consoleSpy.mockRestore();
            }
        );
    });

    describe("safeObjectOmit", () => {
        test.prop([fc.constantFrom(null, undefined), fc.array(fc.string())])(
            "should return empty object for null/undefined input",
            (nullishInput, keys) => {
                const result = safeObjectOmit(nullishInput, keys);
                expect(result).toEqual({});
            }
        );

        test.prop([
            fc.record({
                keep1: fc.string(),
                keep2: fc.integer(),
                omit1: fc.boolean(),
                omit2: fc.anything()
            }, { requiredKeys: [] }),
            fc.constantFrom(["omit1"], ["omit2"], ["omit1", "omit2"])
        ])("should omit specified string keys", (obj, keysToOmit) => {
            const result = safeObjectOmit(obj, keysToOmit);

            // Check that omitted keys are not present
            for (const key of keysToOmit) {
                expect(Object.hasOwn(result, key)).toBe(false);
            }

            // Check that other keys are preserved
            for (const key of Object.keys(obj)) {
                if (!keysToOmit.includes(key)) {
                    expect(result).toHaveProperty(key, obj[key]);
                }
            }
        });

        test("should handle symbol keys correctly", () => {
            const keepSymbol = Symbol("keep");
            const omitSymbol = Symbol("omit");

            const obj = {
                stringKey: "value",
                [keepSymbol]: "keep this",
                [omitSymbol]: "omit this"
            };

            const result = safeObjectOmit(obj, [omitSymbol]);

            expect(result).toHaveProperty("stringKey", "value");
            expect(result[keepSymbol]).toBe("keep this");
            expect(Object.hasOwn(result, omitSymbol)).toBe(false);
        });

        test.prop([
            fc.record({
                prop1: fc.anything(),
                prop2: fc.anything(),
                prop3: fc.anything()
            }),
            fc.array(fc.string())
        ])("should maintain immutability", (obj, keys) => {
            const originalKeys = Object.keys(obj);
            const result = safeObjectOmit(obj, keys);

            // Original object should be unchanged
            expect(Object.keys(obj)).toEqual(originalKeys);

            // Result should be a different object
            expect(result).not.toBe(obj);
        });
    });

    describe("safeObjectPick", () => {
        test.prop([
            fc.record({
                keep1: fc.string(),
                keep2: fc.integer(),
                ignore1: fc.boolean(),
                ignore2: fc.anything()
            }, { requiredKeys: [] }),
            fc.constantFrom(["keep1"], ["keep2"], ["keep1", "keep2"])
        ])("should pick only specified keys", (obj, keysToPick) => {
            const result = safeObjectPick(obj, keysToPick);

            // Check that picked keys are present if they exist in source
            for (const key of keysToPick) {
                if (Object.hasOwn(obj, key)) {
                    expect(result).toHaveProperty(key, obj[key]);
                }
            }

            // Check that result only has picked keys
            for (const key of Object.keys(result)) {
                expect(keysToPick.includes(key)).toBe(true);
            }
        });

        test.prop([
            fc.record({ a: fc.string(), b: fc.integer() }),
            fc.array(fc.string()).filter(arr => arr.length > 0)
        ])("should maintain immutability", (obj, keys) => {
            const originalKeys = Object.keys(obj);
            const result = safeObjectPick(obj, keys);

            // Original object should be unchanged
            expect(Object.keys(obj)).toEqual(originalKeys);

            // Result should be a different object
            expect(result).not.toBe(obj);
        });

        test("should handle missing keys gracefully", () => {
            const obj = { existing: "value" };
            const result = safeObjectPick(obj, ["existing", "missing"] as (keyof typeof obj)[]);

            expect(result).toEqual({ existing: "value" });
            expect(Object.hasOwn(result, "missing")).toBe(false);
        });
    });

    describe("typedObjectEntries", () => {
        test.prop([
            fc.record({
                str: fc.string(),
                num: fc.integer(),
                bool: fc.boolean()
            }, { requiredKeys: [] })
        ])("should return all object entries", (obj) => {
            const result = typedObjectEntries(obj);
            const expected = Object.entries(obj);

            expect(result).toHaveLength(expected.length);

            for (const [i, entry] of expected.entries()) {
                expect(result[i]).toEqual(entry);
            }
        });

        test.prop([fc.record({ key: fc.anything() })])(
            "should preserve key-value relationships",
            (obj) => {
                const entries = typedObjectEntries(obj);

                for (const [key, value] of entries) {
                    expect(obj).toHaveProperty(key, value);
                }
            }
        );

        test("should not include symbol properties", () => {
            const symbolKey = Symbol("test");
            const obj = {
                stringKey: "value",
                [symbolKey]: "symbol value"
            };

            const entries = typedObjectEntries(obj);

            expect(entries).toEqual([["stringKey", "value"]]);
        });
    });

    describe("typedObjectKeys", () => {
        test.prop([
            fc.record({
                a: fc.anything(),
                b: fc.anything(),
                c: fc.anything()
            }, { requiredKeys: [] })
        ])("should return all object keys", (obj) => {
            const result = typedObjectKeys(obj);
            const expected = Object.keys(obj);

            expect(result).toEqual(expected);
        });

        test("should not include symbol keys", () => {
            const symbolKey = Symbol("test");
            const obj = {
                stringKey: "value",
                [symbolKey]: "symbol value"
            };

            const keys = typedObjectKeys(obj);

            expect(keys).toEqual(["stringKey"]);
        });

        test.prop([fc.record({ key: fc.anything() })])(
            "should only return enumerable properties",
            (obj) => {
                // Add a non-enumerable property
                Object.defineProperty(obj, "nonEnum", {
                    value: "test",
                    enumerable: false
                });

                const keys = typedObjectKeys(obj);

                expect(keys.includes("nonEnum")).toBe(false);
            }
        );
    });

    describe("typedObjectValues", () => {
        test.prop([
            fc.record({
                str: fc.string(),
                num: fc.integer(),
                bool: fc.boolean()
            }, { requiredKeys: [] })
        ])("should return all object values", (obj) => {
            const result = typedObjectValues(obj);
            const expected = Object.values(obj);

            expect(result).toEqual(expected);
        });

        test.prop([fc.record({ key: fc.anything() })])(
            "should preserve value relationships",
            (obj) => {
                const values = typedObjectValues(obj);
                const objValues = Object.values(obj);

                expect(values).toHaveLength(objValues.length);

                for (const value of values) {
                    expect(objValues.includes(value)).toBe(true);
                }
            }
        );

        test("should not include symbol property values", () => {
            const symbolKey = Symbol("test");
            const obj = {
                stringKey: "string value",
                [symbolKey]: "symbol value"
            };

            const values = typedObjectValues(obj);

            expect(values).toEqual(["string value"]);
        });
    });
});
