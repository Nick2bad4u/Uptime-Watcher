/**
 * Comprehensive tests for string conversion utilities Targeting 98%+ branch
 * coverage for all string conversion functions
 */

import { describe, it, expect } from "vitest";
import { safeStringify } from "../../utils/stringConversion";

describe("String Conversion Utilities - Comprehensive Coverage", () => {
    describe("safeStringify", () => {
        it("should return empty string for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify(null)).toBe("");
        });

        it("should return empty string for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify(undefined)).toBe("");
        });

        it("should return string values as-is", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify("hello")).toBe("hello");
            expect(safeStringify("")).toBe("");
            expect(safeStringify("test string")).toBe("test string");
        });

        it("should convert numbers to strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify(42)).toBe("42");
            expect(safeStringify(0)).toBe("0");
            expect(safeStringify(-123)).toBe("-123");
            expect(safeStringify(3.14)).toBe("3.14");
            expect(safeStringify(Number.NaN)).toBe("NaN");
            expect(safeStringify(Infinity)).toBe("Infinity");
            expect(safeStringify(-Infinity)).toBe("-Infinity");
        });

        it("should convert booleans to strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify(true)).toBe("true");
            expect(safeStringify(false)).toBe("false");
        });

        it("should serialize simple objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify({ a: 1 })).toBe('{"a":1}');
            expect(safeStringify({ name: "test", value: 42 })).toBe(
                '{"name":"test","value":42}'
            );
            expect(safeStringify({})).toBe("{}");
        });

        it("should serialize arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                safeStringify([
                    1,
                    2,
                    3,
                ])
            ).toBe("[1,2,3]");
            expect(safeStringify([])).toBe("[]");
            expect(safeStringify(["a", "b"])).toBe('["a","b"]');
        });

        it("should handle circular references with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const circular: any = {};
            circular.self = circular;
            const result = safeStringify(circular);
            expect(result).toBe("[Complex Object]");
        });

        it("should handle complex objects with circular references", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj: any = { a: 1, b: { c: 2 } };
            obj.b.parent = obj;
            const result = safeStringify(obj);
            expect(result).toBe("[Complex Object]");
        });

        it("should handle functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify(() => {})).toBe("[Function]");
            expect(safeStringify(function test() {})).toBe("[Function]");
            expect(safeStringify(async () => {})).toBe("[Function]");
        });

        it("should handle symbols", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify(Symbol("test"))).toBe("Symbol(test)");
                        expect(safeStringify(Symbol("empty"))).toBe("Symbol(empty)");
            expect(safeStringify(Symbol.iterator)).toBe(
                "Symbol(Symbol.iterator)"
            );
        });

        it("should handle bigint values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeStringify(BigInt(123))).toBe("123");
            expect(safeStringify(BigInt(0))).toBe("0");
            expect(safeStringify(BigInt(-456))).toBe("-456");
        });

        it("should document unreachable code paths", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Note: The 'undefined' case in the switch statement is unreachable
            // because undefined is handled early in the function
            // This test documents that undefined is properly handled
            expect(safeStringify(undefined)).toBe("");

            // Note: The 'default' case is theoretically unreachable in JavaScript
            // since typeof only returns known string values. This would require
            // a future JavaScript version to add new types, or engine bugs.
            // We cannot easily test this path without mocking typeof behavior.
        });

        it("should handle nested objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const nested = {
                level1: {
                    level2: {
                        value: "deep",
                    },
                },
            };
            expect(safeStringify(nested)).toBe(
                '{"level1":{"level2":{"value":"deep"}}}'
            );
        });

        it("should handle objects with special properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = {
                toString: () => "custom",
                valueOf: () => 42,
                normalProp: "value",
            };
            const result = safeStringify(obj);
            expect(result).toContain("normalProp");
        });

        it("should handle Date objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const date = new Date("2023-01-01");
            const result = safeStringify(date);
            expect(result).toContain("2023-01-01");
        });

        it("should handle RegExp objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const regex = /test/gi;
            const result = safeStringify(regex);
            expect(result).toBe("{}"); // RegExp objects serialize as empty objects
        });

        it("should handle Error objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("test error");
            const result = safeStringify(error);
            expect(result).toBe("{}"); // Error objects serialize as empty objects
        });

        it("should handle objects with non-enumerable properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const obj = {};
            Object.defineProperty(obj, "hidden", {
                value: "secret",
                enumerable: false,
            });
            const result = safeStringify(obj);
            expect(result).toBe("{}");
        });

        it("should handle objects with getters that throw", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Retrieval", "type");

            const obj = {
                get problematic() {
                    throw new Error("getter error");
                },
                safe: "value",
            };
            // This might trigger the fallback
            const result = safeStringify(obj);
            expect(result).toBeDefined();
        });

        it("should handle very large objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const large = {};
            for (let i = 0; i < 1000; i++) {
                (large as any)[`prop${i}`] = i;
            }
            const result = safeStringify(large);
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });

        it("should handle Map objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const map = new Map([["key", "value"]]);
            const result = safeStringify(map);
            expect(result).toBeDefined();
        });

        it("should handle Set objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const set = new Set([
                1,
                2,
                3,
            ]);
            const result = safeStringify(set);
            expect(result).toBeDefined();
        });

        it("should handle WeakMap objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const weakMap = new WeakMap();
            const result = safeStringify(weakMap);
            expect(result).toBeDefined();
        });

        it("should handle WeakSet objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const weakSet = new WeakSet();
            const result = safeStringify(weakSet);
            expect(result).toBeDefined();
        });
    });
});
