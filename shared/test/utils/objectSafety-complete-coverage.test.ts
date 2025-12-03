/**
 * Complete function coverage tests for shared/utils/objectSafety.ts
 *
 * Tests all exported functions to achieve 100% function coverage
 */

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

describe("shared/utils/objectSafety.ts - Complete Function Coverage", () => {
    describe(safeObjectAccess, () => {
        it("should return property value when exists and valid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { timeout: 5000, name: "test" };
            expect(safeObjectAccess(obj, "timeout", 1000)).toBe(5000);
            expect(safeObjectAccess(obj, "name", "default")).toBe("test");
        });

        it("should return fallback when object is not an object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeObjectAccess(null, "timeout", 1000)).toBe(1000);
            expect(safeObjectAccess(undefined, "timeout", 1000)).toBe(1000);
            expect(safeObjectAccess("string", "timeout", 1000)).toBe(1000);
            expect(safeObjectAccess(123, "timeout", 1000)).toBe(1000);
        });

        it("should return fallback when property doesn't exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { name: "test" };
            expect(safeObjectAccess(obj, "timeout", 1000)).toBe(1000);
            expect(safeObjectAccess(obj, "missing", "default")).toBe("default");
        });

        it("should work with symbol keys", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const symbolKey = Symbol("test");
            const obj = { [symbolKey]: "value" };
            expect(safeObjectAccess(obj, symbolKey, "default")).toBe("value");
        });

        it("should use validator when provided", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { timeout: "5000", count: 42 };
            const isNumber = (value: unknown): value is number =>
                typeof value === "number";

            expect(safeObjectAccess(obj, "timeout", 1000, isNumber)).toBe(1000); // String fails number validator
            expect(safeObjectAccess(obj, "count", 1000, isNumber)).toBe(42); // number passes validator
        });

        it("should return fallback when validator fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const obj = { value: "not-a-number" };
            const isNumber = (value: unknown): value is number =>
                typeof value === "number";

            expect(safeObjectAccess(obj, "value", 0, isNumber)).toBe(0);
        });
    });

    describe(safeObjectIteration, () => {
        it("should iterate over object properties safely", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2, c: 3 };
            const results: [string, unknown][] = [];

            safeObjectIteration(obj, (key, value) => {
                results.push([key, value]);
            });

            expect(results).toHaveLength(3);
            expect(results).toContainEqual(["a", 1]);
            expect(results).toContainEqual(["b", 2]);
            expect(results).toContainEqual(["c", 3]);
        });

        it("should not iterate when input is not an object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const callback = vi.fn();

            safeObjectIteration(null as any, callback);
            safeObjectIteration(undefined as any, callback);
            safeObjectIteration("string" as any, callback);
            safeObjectIteration(123 as any, callback);

            expect(callback).not.toHaveBeenCalled();
        });

        it("should handle empty objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const callback = vi.fn();
            safeObjectIteration({}, callback);
            expect(callback).not.toHaveBeenCalled();
        });

        it("should not include symbol keys (Object.entries limitation)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const symbolKey = Symbol("test");
            const obj = { [symbolKey]: "value", regular: "prop" };
            const results: [PropertyKey, unknown][] = [];

            safeObjectIteration(obj, (key, value) => {
                results.push([key, value]);
            });

            // Object.entries() only returns enumerable string keys, not symbols
            expect(results).toHaveLength(1);
            expect(results.some(([key]) => key === "regular")).toBeTruthy();
            expect(results.some(([key]) => key === symbolKey)).toBeFalsy();
        });
    });

    describe(safeObjectOmit, () => {
        it("should omit specified keys from object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2, c: 3, d: 4 };
            const result = safeObjectOmit(obj, ["b", "d"]);

            expect(result).toEqual({ a: 1, c: 3 });
            expect(result).not.toHaveProperty("b");
            expect(result).not.toHaveProperty("d");
        });

        it("should return empty object when input is null/undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeObjectOmit(null as any, ["key"])).toEqual({});
            expect(safeObjectOmit(undefined as any, ["key"])).toEqual({});
        });

        it("should handle empty omit array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2 };
            const result = safeObjectOmit(obj, []);

            expect(result).toEqual(obj);
        });

        it("should handle non-existent keys", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2 };
            const result = safeObjectOmit(obj, ["c", "d"] as any);

            expect(result).toEqual(obj);
        });

        it("should work with symbol keys", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const symbolKey = Symbol("test");
            const obj = { [symbolKey]: "value", regular: "prop" };
            const result = safeObjectOmit(obj, [symbolKey]);

            expect(result).toEqual({ regular: "prop" });
            expect(Object.hasOwn(result, symbolKey)).toBeFalsy();
        });
    });

    describe(safeObjectPick, () => {
        it("should pick specified keys from object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2, c: 3, d: 4 };
            const result = safeObjectPick(obj, ["a", "c"]);

            expect(result).toEqual({ a: 1, c: 3 });
            expect(result).not.toHaveProperty("b");
            expect(result).not.toHaveProperty("d");
        });

        it("should throw TypeError when input is null/undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => safeObjectPick(null as any, ["key"])).toThrowError(
                TypeError
            );
            expect(() =>
                safeObjectPick(undefined as any, ["key"])
            ).toThrowError(TypeError);
        });

        it("should handle empty pick array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2 };
            const result = safeObjectPick(obj, []);

            expect(result).toEqual({});
        });

        it("should handle non-existent keys", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2 };
            const result = safeObjectPick(obj, ["c", "d"] as any);

            expect(result).toEqual({});
        });

        it("should work with symbol keys", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const symbolKey = Symbol("test");
            const obj = { [symbolKey]: "value", regular: "prop" };
            const result = safeObjectPick(obj, [symbolKey]);

            expect(result).toEqual({ [symbolKey]: "value" });
            expect(result).not.toHaveProperty("regular");
        });
    });

    describe(typedObjectEntries, () => {
        it("should return typed object entries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2, c: 3 };
            const entries = typedObjectEntries(obj);

            expect(entries).toHaveLength(3);
            expect(entries).toContainEqual(["a", 1]);
            expect(entries).toContainEqual(["b", 2]);
            expect(entries).toContainEqual(["c", 3]);
        });

        it("should handle empty objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const entries = typedObjectEntries({});
            expect(entries).toEqual([]);
        });

        it("should preserve value types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { str: "hello", num: 42, bool: true };
            const entries = typedObjectEntries(obj);

            expect(entries).toContainEqual(["str", "hello"]);
            expect(entries).toContainEqual(["num", 42]);
            expect(entries).toContainEqual(["bool", true]);
        });
    });

    describe(typedObjectKeys, () => {
        it("should return typed object keys", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2, c: 3 };
            const keys = typedObjectKeys(obj);

            expect(keys).toHaveLength(3);
            expect(keys).toContain("a");
            expect(keys).toContain("b");
            expect(keys).toContain("c");
        });

        it("should handle empty objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const keys = typedObjectKeys({});
            expect(keys).toEqual([]);
        });

        it("should return keys in enumerable order", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { z: 1, a: 2, m: 3 };
            const keys = typedObjectKeys(obj);

            expect(keys).toEqual([
                "z",
                "a",
                "m",
            ]);
        });
    });

    describe(typedObjectValues, () => {
        it("should return typed object values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: 1, b: 2, c: 3 };
            const values = typedObjectValues(obj);

            expect(values).toHaveLength(3);
            expect(values).toContain(1);
            expect(values).toContain(2);
            expect(values).toContain(3);
        });

        it("should handle empty objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const values = typedObjectValues({});
            expect(values).toEqual([]);
        });

        it("should preserve value types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { str: "hello", num: 42, bool: true };
            const values = typedObjectValues(obj);

            expect(values).toContain("hello");
            expect(values).toContain(42);
            expect(values).toContain(true);
        });

        it("should return values in enumerable order", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = { a: "first", b: "second", c: "third" };
            const values = typedObjectValues(obj);

            expect(values).toEqual([
                "first",
                "second",
                "third",
            ]);
        });
    });

    describe("Integration and edge cases", () => {
        it("should handle objects with prototype pollution protection", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = Object.create(null);
            obj.a = 1;
            obj.b = 2;

            expect(safeObjectAccess(obj, "a", 0)).toBe(1);
            expect(typedObjectKeys(obj)).toContain("a");
            expect(typedObjectValues(obj)).toContain(1);
        });

        it("should handle nested object operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety-complete-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = {
                config: { timeout: 5000 },
                data: { count: 42 },
            };

            const config = safeObjectAccess(obj, "config", {});
            expect(safeObjectAccess(config, "timeout", 0)).toBe(5000);

            const picked = safeObjectPick(obj, ["config"]);
            expect(picked).toHaveProperty("config");
            expect(picked.config).toEqual({ timeout: 5000 });
        });
    });
});
