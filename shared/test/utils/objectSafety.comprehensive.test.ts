import { describe, it, expect, vi } from "vitest";
import {
    safeObjectAccess,
    safeObjectIteration,
    safeObjectOmit,
    safeObjectPick,
    typedObjectEntries,
    typedObjectKeys,
    typedObjectValues,
} from "../../utils/objectSafety";

describe("Object Safety Utilities - Comprehensive Coverage", () => {
    // Helper objects for testing
    const testObj = {
        string: "test",
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        nested: { prop: "value" },
        array: [1, 2, 3],
    };

    const symbolKey = Symbol("test");
    const objWithSymbol = {
        ...testObj,
        [symbolKey]: "symbol value",
    };

    describe("safeObjectAccess", () => {
        it("should return the property value when it exists and matches type", () => {
            expect(safeObjectAccess(testObj, "string", "default")).toBe("test");
            expect(safeObjectAccess(testObj, "number", 0)).toBe(42);
            expect(safeObjectAccess(testObj, "boolean", false)).toBe(true);
        });

        it("should return fallback when object is not an object", () => {
            expect(safeObjectAccess(null, "key", "fallback")).toBe("fallback");
            expect(safeObjectAccess(undefined, "key", "fallback")).toBe("fallback");
            expect(safeObjectAccess("string", "key", "fallback")).toBe("fallback");
            expect(safeObjectAccess(42, "key", "fallback")).toBe("fallback");
            expect(safeObjectAccess([], "key", "fallback")).toBe("fallback");
        });

        it("should return fallback when property doesn't exist", () => {
            expect(safeObjectAccess(testObj, "nonexistent", "fallback")).toBe("fallback");
            expect(safeObjectAccess({}, "key", "fallback")).toBe("fallback");
        });

        it("should return fallback when property type doesn't match fallback type", () => {
            expect(safeObjectAccess(testObj, "string", 42)).toBe(42); // string vs number
            expect(safeObjectAccess(testObj, "number", "default")).toBe("default"); // number vs string
            expect(safeObjectAccess(testObj, "boolean", "default")).toBe("default"); // boolean vs string
        });

        it("should work with validator function", () => {
            const isString = (value: unknown): value is string => typeof value === "string";
            const isNumber = (value: unknown): value is number => typeof value === "number";
            const isPositiveNumber = (value: unknown): value is number => typeof value === "number" && value > 0;

            expect(safeObjectAccess(testObj, "string", "fallback", isString)).toBe("test");
            expect(safeObjectAccess(testObj, "number", 0, isNumber)).toBe(42);
            expect(safeObjectAccess(testObj, "number", 0, isPositiveNumber)).toBe(42);

            // Validator fails - use type assertions to test edge cases
            expect(safeObjectAccess(testObj, "string", "fallback", isNumber as any)).toBe("fallback");
            expect(safeObjectAccess(testObj, "number", 0, isString as any)).toBe(0);
            expect(safeObjectAccess({ negative: -5 }, "negative", 0, isPositiveNumber)).toBe(0);
        });

        it("should handle null and undefined values correctly", () => {
            expect(safeObjectAccess(testObj, "null", "fallback")).toBe("fallback");
            expect(safeObjectAccess(testObj, "undefined", "fallback")).toBe("fallback");
        });

        it("should work with symbol keys", () => {
            expect(safeObjectAccess(objWithSymbol, symbolKey, "fallback")).toBe("symbol value");
        });

        it("should handle nested objects", () => {
            const isObject = (value: unknown): value is object => typeof value === "object" && value !== null;

            expect(safeObjectAccess(testObj, "nested", {}, isObject)).toEqual({ prop: "value" });
        });

        it("should handle edge cases with validator", () => {
            const alwaysFails = (_value: unknown): _value is string => false;
            const alwaysPasses = (_value: unknown): _value is string => true;

            expect(safeObjectAccess(testObj, "string", "fallback", alwaysFails)).toBe("fallback");
            expect(safeObjectAccess(testObj, "string", "fallback", alwaysPasses)).toBe("test");
        });
    });

    describe("safeObjectIteration", () => {
        it("should iterate over object entries successfully", () => {
            const mockCallback = vi.fn();

            safeObjectIteration(testObj, mockCallback);

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith("string", "test");
            expect(mockCallback).toHaveBeenCalledWith("number", 42);
            expect(mockCallback).toHaveBeenCalledWith("boolean", true);
            expect(mockCallback).toHaveBeenCalledWith("null", null);
            expect(mockCallback).toHaveBeenCalledWith("undefined", undefined);
        });

        it("should handle non-object inputs gracefully", () => {
            const mockCallback = vi.fn();
            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            safeObjectIteration(null, mockCallback);
            safeObjectIteration(undefined, mockCallback);
            safeObjectIteration("string", mockCallback);
            safeObjectIteration(42, mockCallback);
            safeObjectIteration([], mockCallback);

            expect(mockCallback).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledTimes(5);
            expect(consoleSpy).toHaveBeenCalledWith("Safe object iteration: Expected object, got object"); // null
            expect(consoleSpy).toHaveBeenCalledWith("Safe object iteration: Expected object, got undefined");
            expect(consoleSpy).toHaveBeenCalledWith("Safe object iteration: Expected object, got string");
            expect(consoleSpy).toHaveBeenCalledWith("Safe object iteration: Expected object, got number");
            expect(consoleSpy).toHaveBeenCalledWith("Safe object iteration: Expected object, got object"); // array

            consoleSpy.mockRestore();
        });

        it("should use custom context in error messages", () => {
            const mockCallback = vi.fn();
            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            safeObjectIteration(null, mockCallback, "Custom context");

            expect(consoleSpy).toHaveBeenCalledWith("Custom context: Expected object, got object");

            consoleSpy.mockRestore();
        });

        it("should handle callback errors gracefully", () => {
            const errorCallback = vi.fn().mockImplementation(() => {
                throw new Error("Callback error");
            });
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            safeObjectIteration(testObj, errorCallback);

            expect(errorCallback).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith("Safe object iteration failed:", expect.any(Error));

            consoleSpy.mockRestore();
        });

        it("should handle callback errors with custom context", () => {
            const errorCallback = vi.fn().mockImplementation(() => {
                throw new Error("Callback error");
            });
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            safeObjectIteration(testObj, errorCallback, "Custom error context");

            expect(consoleSpy).toHaveBeenCalledWith("Custom error context failed:", expect.any(Error));

            consoleSpy.mockRestore();
        });

        it("should handle empty objects", () => {
            const mockCallback = vi.fn();

            safeObjectIteration({}, mockCallback);

            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe("safeObjectOmit", () => {
        it("should omit specified keys from object", () => {
            const result = safeObjectOmit(testObj, ["string", "number"]);

            expect(result).not.toHaveProperty("string");
            expect(result).not.toHaveProperty("number");
            expect(result).toHaveProperty("boolean", true);
            expect(result).toHaveProperty("null", null);
            expect(result).toHaveProperty("undefined", undefined);
            expect(result).toHaveProperty("nested");
            expect(result).toHaveProperty("array");
        });

        it("should return copy when omitting no keys", () => {
            const result = safeObjectOmit(testObj, []);

            expect(result).toEqual(testObj);
            expect(result).not.toBe(testObj); // Should be a copy
        });

        it("should handle omitting non-existent keys gracefully", () => {
            const result = safeObjectOmit(testObj, ["nonexistent" as keyof typeof testObj]);

            expect(result).toEqual(testObj);
        });

        it("should omit all keys when all are specified", () => {
            const smallObj = { a: 1, b: 2 };
            const result = safeObjectOmit(smallObj, ["a", "b"]);

            expect(result).toEqual({});
        });

        it("should handle symbol keys", () => {
            const result = safeObjectOmit(objWithSymbol, ["string"]);

            expect(result).not.toHaveProperty("string");
            expect(result[symbolKey]).toBe("symbol value");
        });

        it("should preserve nested object references", () => {
            const result = safeObjectOmit(testObj, ["string"]);

            expect(result.nested).toBe(testObj.nested); // Same reference
            expect(result.array).toBe(testObj.array); // Same reference
        });
    });

    describe("safeObjectPick", () => {
        it("should pick specified keys from object", () => {
            const result = safeObjectPick(testObj, ["string", "number", "boolean"]);

            expect(result).toEqual({
                string: "test",
                number: 42,
                boolean: true,
            });
            expect(result).not.toHaveProperty("null");
            expect(result).not.toHaveProperty("undefined");
            expect(result).not.toHaveProperty("nested");
            expect(result).not.toHaveProperty("array");
        });

        it("should return empty object when picking no keys", () => {
            const result = safeObjectPick(testObj, []);

            expect(result).toEqual({});
        });

        it("should handle picking non-existent keys gracefully", () => {
            const result = safeObjectPick(testObj, ["nonexistent" as keyof typeof testObj]);

            expect(result).toEqual({});
        });

        it("should pick all keys when all are specified", () => {
            const smallObj = { a: 1, b: 2 };
            const result = safeObjectPick(smallObj, ["a", "b"]);

            expect(result).toEqual(smallObj);
            expect(result).not.toBe(smallObj); // Should be a copy
        });

        it("should handle symbol keys", () => {
            const result = safeObjectPick(objWithSymbol, [symbolKey]);

            expect(result).toEqual({ [symbolKey]: "symbol value" });
        });

        it("should preserve nested object references", () => {
            const result = safeObjectPick(testObj, ["nested", "array"]);

            expect(result.nested).toBe(testObj.nested); // Same reference
            expect(result.array).toBe(testObj.array); // Same reference
        });

        it("should only pick existing keys", () => {
            const partialObj = { a: 1 };
            const result = safeObjectPick(partialObj, ["a", "b" as keyof typeof partialObj]);

            expect(result).toEqual({ a: 1 });
        });
    });

    describe("typedObjectEntries", () => {
        it("should return properly typed entries", () => {
            const entries = typedObjectEntries(testObj);

            expect(entries).toContainEqual(["string", "test"]);
            expect(entries).toContainEqual(["number", 42]);
            expect(entries).toContainEqual(["boolean", true]);
            expect(entries).toContainEqual(["null", null]);
            expect(entries).toContainEqual(["undefined", undefined]);
            expect(entries).toContainEqual(["nested", { prop: "value" }]);
            expect(entries).toContainEqual(["array", [1, 2, 3]]);
        });

        it("should handle empty objects", () => {
            const entries = typedObjectEntries({});

            expect(entries).toEqual([]);
        });

        it("should handle objects with different value types", () => {
            const mixedObj = {
                str: "string",
                num: 123,
                bool: false,
                arr: [1, 2],
                obj: { nested: true },
            };

            const entries = typedObjectEntries(mixedObj);

            expect(entries).toHaveLength(5);
            expect(entries.find(([key]) => key === "str")?.[1]).toBe("string");
            expect(entries.find(([key]) => key === "num")?.[1]).toBe(123);
            expect(entries.find(([key]) => key === "bool")?.[1]).toBe(false);
        });

        it("should not include symbol keys", () => {
            const entries = typedObjectEntries(objWithSymbol);

            // Symbol keys should not be included in Object.entries() result
            expect(entries.find(([key]) => key === symbolKey)).toBeUndefined();
        });
    });

    describe("typedObjectKeys", () => {
        it("should return properly typed keys", () => {
            const keys = typedObjectKeys(testObj);

            expect(keys).toContain("string");
            expect(keys).toContain("number");
            expect(keys).toContain("boolean");
            expect(keys).toContain("null");
            expect(keys).toContain("undefined");
            expect(keys).toContain("nested");
            expect(keys).toContain("array");
        });

        it("should handle empty objects", () => {
            const keys = typedObjectKeys({});

            expect(keys).toEqual([]);
        });

        it("should return all enumerable string keys", () => {
            const testObject = {
                first: 1,
                second: 2,
                third: 3,
            };

            const keys = typedObjectKeys(testObject);

            expect(keys).toHaveLength(3);
            expect(keys).toEqual(expect.arrayContaining(["first", "second", "third"]));
        });

        it("should not include symbol keys", () => {
            const keys = typedObjectKeys(objWithSymbol);

            // Symbol keys should not be included in Object.keys() result
            expect(keys).not.toContain(symbolKey);
        });
    });

    describe("typedObjectValues", () => {
        it("should return properly typed values", () => {
            const values = typedObjectValues(testObj);

            expect(values).toContain("test");
            expect(values).toContain(42);
            expect(values).toContain(true);
            expect(values).toContain(null);
            expect(values).toContain(undefined);
            expect(values).toContain(testObj.nested);
            expect(values).toContain(testObj.array);
        });

        it("should handle empty objects", () => {
            const values = typedObjectValues({});

            expect(values).toEqual([]);
        });

        it("should return all enumerable property values", () => {
            const testObject = {
                first: "one",
                second: "two",
                third: "three",
            };

            const values = typedObjectValues(testObject);

            expect(values).toHaveLength(3);
            expect(values).toEqual(expect.arrayContaining(["one", "two", "three"]));
        });

        it("should preserve object references", () => {
            const nestedObj = { prop: "value" };
            const testObject = {
                nested: nestedObj,
                array: [1, 2, 3],
            };

            const values = typedObjectValues(testObject);

            expect(values).toContain(nestedObj);
            expect(values.find((v) => v === nestedObj)).toBe(nestedObj); // Same reference
        });

        it("should not include symbol property values", () => {
            const values = typedObjectValues(objWithSymbol);

            // Symbol property values should not be included in Object.values() result
            expect(values).not.toContain("symbol value");
        });

        it("should handle objects with duplicate values", () => {
            const testObject = {
                first: "same",
                second: "same",
                third: "different",
            };

            const values = typedObjectValues(testObject);

            expect(values).toHaveLength(3);
            expect(values.filter((v) => v === "same")).toHaveLength(2);
            expect(values.filter((v) => v === "different")).toHaveLength(1);
        });
    });

    describe("Integration and Edge Cases", () => {
        it("should work together for complex object transformations", () => {
            const sourceObj = {
                id: 1,
                name: "John",
                email: "john@example.com",
                password: "secret",
                isActive: true,
                metadata: { role: "user" },
            };

            // Pick public fields
            const publicFields = safeObjectPick(sourceObj, ["id", "name", "email", "isActive"]);

            // Omit sensitive fields
            const safeObj = safeObjectOmit(sourceObj, ["password"]);

            // Use typed operations
            const keys = typedObjectKeys(publicFields);
            const values = typedObjectValues(publicFields);
            const entries = typedObjectEntries(publicFields);

            expect(publicFields).not.toHaveProperty("password");
            expect(publicFields).not.toHaveProperty("metadata");
            expect(safeObj).not.toHaveProperty("password");
            expect(safeObj).toHaveProperty("metadata");

            expect(keys).toEqual(expect.arrayContaining(["id", "name", "email", "isActive"]));
            expect(values).toEqual(expect.arrayContaining([1, "John", "john@example.com", true]));
            expect(entries).toHaveLength(4);
        });

        it("should handle objects with complex nested structures", () => {
            const complexObj = {
                level1: {
                    level2: {
                        level3: {
                            value: "deep",
                        },
                    },
                },
                array: [{ item: 1 }, { item: 2 }],
                mixed: null,
            };

            const deepValue = safeObjectAccess(
                safeObjectAccess(safeObjectAccess(complexObj, "level1", {}), "level2", {}),
                "level3",
                {}
            );

            expect(deepValue).toEqual({ value: "deep" });

            const picked = safeObjectPick(complexObj, ["level1", "array"]);
            expect(picked.level1).toBe(complexObj.level1); // Same reference
            expect(picked.array).toBe(complexObj.array); // Same reference
        });

        it("should handle prototype pollution safely", () => {
            const maliciousKey = "__proto__";
            const testObject = { normal: "value" };

            // These operations should be safe
            const accessResult = safeObjectAccess(testObject, maliciousKey, "fallback");
            const omitResult = safeObjectOmit(testObject, [maliciousKey as keyof typeof testObject]);
            const pickResult = safeObjectPick(testObject, [maliciousKey as keyof typeof testObject]);

            expect(accessResult).toBe("fallback");
            expect(omitResult).toEqual(testObject);
            expect(pickResult).toEqual({});
        });

        it("should maintain performance with large objects", () => {
            const largeObj = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`key${i}`, `value${i}`]));

            const start = Date.now();

            const keys = typedObjectKeys(largeObj);
            const values = typedObjectValues(largeObj);
            const entries = typedObjectEntries(largeObj);
            const picked = safeObjectPick(largeObj, ["key0", "key500", "key999"]);
            const omitted = safeObjectOmit(largeObj, ["key0", "key500", "key999"]);

            const end = Date.now();

            expect(keys).toHaveLength(1000);
            expect(values).toHaveLength(1000);
            expect(entries).toHaveLength(1000);
            expect(picked).toEqual({ key0: "value0", key500: "value500", key999: "value999" });
            expect(omitted).not.toHaveProperty("key0");
            expect(Object.keys(omitted)).toHaveLength(997);

            // Should complete within reasonable time (adjust as needed)
            expect(end - start).toBeLessThan(100);
        });
    });
});
