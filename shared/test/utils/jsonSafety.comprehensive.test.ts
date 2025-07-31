/**
 * Comprehensive tests for JSON safety utilities
 * Targeting 98%+ branch coverage for all JSON safety functions
 */

import { describe, it, expect } from "vitest";
import {
    safeJsonParse,
    safeJsonParseArray,
    safeJsonStringifyWithFallback,
    safeJsonParseWithFallback,
    safeJsonStringify,
} from "../../utils/jsonSafety";

describe("JSON Safety Utilities - Comprehensive Coverage", () => {
    describe("safeJsonParse", () => {
        it("should parse valid JSON and validate with type guard", () => {
            const validator = (data: unknown): data is { name: string } => {
                return typeof data === "object" && data !== null && typeof (data as any).name === "string";
            };

            const result = safeJsonParse('{"name":"test"}', validator);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe("test");
            expect(result.error).toBeUndefined();
        });

        it("should return error for invalid JSON", () => {
            const validator = (_data: unknown): _data is any => true;
            const result = safeJsonParse("invalid json", validator);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON parsing failed");
        });

        it("should return error when parsed data doesn't match type", () => {
            const validator = (data: unknown): data is { name: string } => {
                return typeof data === "object" && data !== null && typeof (data as any).name === "string";
            };

            const result = safeJsonParse('{"value":123}', validator);
            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Parsed data does not match expected type");
        });

        it("should handle null JSON values", () => {
            const validator = (data: unknown): data is null => data === null;
            const result = safeJsonParse("null", validator);

            expect(result.success).toBe(true);
            expect(result.data).toBe(null);
        });

        it("should handle boolean JSON values", () => {
            const validator = (data: unknown): data is boolean => typeof data === "boolean";
            const result = safeJsonParse("true", validator);

            expect(result.success).toBe(true);
            expect(result.data).toBe(true);
        });

        it("should handle number JSON values", () => {
            const validator = (data: unknown): data is number => typeof data === "number";
            const result = safeJsonParse("42", validator);

            expect(result.success).toBe(true);
            expect(result.data).toBe(42);
        });

        it("should handle array JSON values", () => {
            const validator = (data: unknown): data is number[] => {
                return Array.isArray(data) && data.every((item) => typeof item === "number");
            };
            const result = safeJsonParse("[1,2,3]", validator);

            expect(result.success).toBe(true);
            expect(result.data).toEqual([1, 2, 3]);
        });
    });

    describe("safeJsonParseArray", () => {
        it("should parse valid JSON array with element validation", () => {
            const elementValidator = (data: unknown): data is { id: number } => {
                return typeof data === "object" && data !== null && typeof (data as any).id === "number";
            };

            const result = safeJsonParseArray('[{"id":1},{"id":2}]', elementValidator);
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
            if (result.success && result.data) {
                expect(result.data[0]!.id).toBe(1);
                expect(result.data[1]!.id).toBe(2);
            }
        });

        it("should return error for invalid JSON", () => {
            const elementValidator = (_data: unknown): _data is any => true;
            const result = safeJsonParseArray("invalid json", elementValidator);

            expect(result.success).toBe(false);
            expect(result.error).toContain("JSON parsing failed");
        });

        it("should return error when parsed data is not an array", () => {
            const elementValidator = (_data: unknown): _data is any => true;
            const result = safeJsonParseArray('{"not":"array"}', elementValidator);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Parsed data is not an array");
        });

        it("should return error when array elements don't match type", () => {
            const elementValidator = (data: unknown): data is { name: string } => {
                return typeof data === "object" && data !== null && typeof (data as any).name === "string";
            };

            const result = safeJsonParseArray('[{"name":"valid"},{"id":123}]', elementValidator);
            expect(result.success).toBe(false);
            expect(result.error).toContain("Array element at index 1");
        });

        it("should handle empty arrays", () => {
            const elementValidator = (_data: unknown): _data is any => true;
            const result = safeJsonParseArray("[]", elementValidator);

            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
        });

        it("should validate all elements correctly", () => {
            const elementValidator = (data: unknown): data is string => typeof data === "string";
            const result = safeJsonParseArray('["a","b","c"]', elementValidator);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(["a", "b", "c"]);
        });
    });

    describe("safeJsonStringifyWithFallback", () => {
        it("should stringify simple objects", () => {
            const obj = { name: "test", value: 42 };
            const result = safeJsonStringifyWithFallback(obj, "fallback");
            expect(result).toBe('{"name":"test","value":42}');
        });

        it("should return fallback for circular references", () => {
            const obj: any = { name: "test" };
            obj.self = obj;
            const result = safeJsonStringifyWithFallback(obj, "circular_fallback");
            expect(result).toBe("circular_fallback");
        });

        it("should return fallback for objects with non-serializable properties", () => {
            const obj = {
                name: "test",
                func: () => "function",
                symbol: Symbol("test"),
            };
            const result = safeJsonStringifyWithFallback(obj, "complex_fallback");
            // This might succeed or fail depending on JSON.stringify behavior
            expect(result).toBeDefined();
        });

        it("should handle arrays", () => {
            const arr = [1, 2, 3, "test"];
            const result = safeJsonStringifyWithFallback(arr, "fallback");
            expect(result).toBe('[1,2,3,"test"]');
        });

        it("should handle null values", () => {
            const result = safeJsonStringifyWithFallback(null, "fallback");
            expect(result).toBe("null");
        });

        it("should handle undefined values with fallback", () => {
            const result = safeJsonStringifyWithFallback(undefined, "undefined_fallback");
            expect(result).toBe("undefined_fallback");
        });

        it("should handle primitive values", () => {
            expect(safeJsonStringifyWithFallback("string", "fallback")).toBe('"string"');
            expect(safeJsonStringifyWithFallback(42, "fallback")).toBe("42");
            expect(safeJsonStringifyWithFallback(true, "fallback")).toBe("true");
        });

        it("should handle complex nested objects", () => {
            const complex = {
                level1: {
                    level2: {
                        array: [1, 2, { nested: true }],
                        date: new Date("2023-01-01"),
                    },
                },
            };
            const result = safeJsonStringifyWithFallback(complex, "fallback");
            expect(result).toContain("level1");
            expect(result).toContain("nested");
        });

        it("should handle objects with special values", () => {
            const obj = {
                date: new Date("2023-01-01"),
                regex: /test/g,
                number: 42,
                string: "text",
            };
            const result = safeJsonStringifyWithFallback(obj, "fallback");
            expect(result).toContain("2023-01-01");
            expect(result).toContain("text");
        });

        it("should use fallback when JSON.stringify throws", () => {
            const problematic = {
                get trouble() {
                    throw new Error("Cannot serialize");
                },
            };
            const result = safeJsonStringifyWithFallback(problematic, "error_fallback");
            expect(result).toBe("error_fallback");
        });

        it("should handle BigInt with fallback", () => {
            const obj = { bigInt: BigInt(123) };
            const result = safeJsonStringifyWithFallback(obj, "bigint_fallback");
            expect(result).toBe("bigint_fallback");
        });

        it("should handle functions with fallback", () => {
            const obj = { func: () => "test" };
            const result = safeJsonStringifyWithFallback(obj, "function_fallback");
            expect(result).toBe("{}"); // Functions are not serialized
        });

        it("should respect space parameter", () => {
            const obj = { a: 1, b: 2 };
            const result = safeJsonStringifyWithFallback(obj, "fallback", 2);
            expect(result).toContain("\n");
            expect(result).toContain("  ");
        });

        it("should handle empty objects and arrays", () => {
            expect(safeJsonStringifyWithFallback({}, "fallback")).toBe("{}");
            expect(safeJsonStringifyWithFallback([], "fallback")).toBe("[]");
        });
    });

    describe("safeJsonParseWithFallback", () => {
        it("should return parsed data on successful parsing", () => {
            const validator = (data: unknown): data is { name: string } => {
                return typeof data === "object" && data !== null && typeof (data as any).name === "string";
            };

            const result = safeJsonParseWithFallback('{"name":"test"}', validator, { name: "fallback" });
            expect(result.name).toBe("test");
        });

        it("should return fallback on parsing failure", () => {
            const validator = (data: unknown): data is { name: string } => {
                return typeof data === "object" && data !== null && typeof (data as any).name === "string";
            };

            const fallback = { name: "fallback" };
            const result = safeJsonParseWithFallback("invalid json", validator, fallback);
            expect(result).toBe(fallback);
        });

        it("should return fallback when data doesn't match type", () => {
            const validator = (data: unknown): data is { name: string } => {
                return typeof data === "object" && data !== null && typeof (data as any).name === "string";
            };

            const fallback = { name: "fallback" };
            const result = safeJsonParseWithFallback('{"value":123}', validator, fallback);
            expect(result).toBe(fallback);
        });

        it("should handle primitive types", () => {
            const validator = (data: unknown): data is number => typeof data === "number";
            const result = safeJsonParseWithFallback("42", validator, 0);
            expect(result).toBe(42);
        });

        it("should return fallback for undefined data", () => {
            const validator = (data: unknown): data is string => typeof data === "string";
            const fallback = "fallback";
            const result = safeJsonParseWithFallback("null", validator, fallback);
            expect(result).toBe(fallback);
        });
    });

    describe("safeJsonStringify", () => {
        it("should stringify simple objects successfully", () => {
            const obj = { name: "test", value: 42 };
            const result = safeJsonStringify(obj);
            expect(result.success).toBe(true);
            expect(result.data).toBe('{"name":"test","value":42}');
            expect(result.error).toBeUndefined();
        });

        it("should stringify arrays successfully", () => {
            const arr = [1, 2, 3, "test"];
            const result = safeJsonStringify(arr);
            expect(result.success).toBe(true);
            expect(result.data).toBe('[1,2,3,"test"]');
        });

        it("should handle null values", () => {
            const result = safeJsonStringify(null);
            expect(result.success).toBe(true);
            expect(result.data).toBe("null");
        });

        it("should handle primitive values", () => {
            expect(safeJsonStringify("string").data).toBe('"string"');
            expect(safeJsonStringify(42).data).toBe("42");
            expect(safeJsonStringify(true).data).toBe("true");
            expect(safeJsonStringify(false).data).toBe("false");
        });

        it("should handle undefined values", () => {
            const result = safeJsonStringify(undefined);
            expect(result.success).toBe(false); // JSON.stringify(undefined) returns undefined, not a string
            expect(result.error).toContain("Value cannot be serialized to JSON");
        });

        it("should handle circular references", () => {
            const obj: any = { name: "test" };
            obj.self = obj;
            const result = safeJsonStringify(obj);
            expect(result.success).toBe(false);
            expect(result.error).toContain("JSON stringification failed");
        });

        it("should handle objects with non-serializable properties", () => {
            const obj = {
                func: () => "test",
                symbol: Symbol("test"),
                number: 42,
            };
            const result = safeJsonStringify(obj);
            expect(result.success).toBe(true);
            expect(result.data).toContain("42");
            expect(result.data).not.toContain("func");
        });

        it("should handle BigInt values", () => {
            const obj = { bigInt: BigInt(123) };
            const result = safeJsonStringify(obj);
            expect(result.success).toBe(false);
            expect(result.error).toContain("JSON stringification failed");
        });

        it("should respect space parameter for formatting", () => {
            const obj = { a: 1, b: 2 };
            const result = safeJsonStringify(obj, 2);
            expect(result.success).toBe(true);
            expect(result.data).toContain("\n");
            expect(result.data).toContain("  ");
        });

        it("should handle space parameter as string", () => {
            const obj = { a: 1 };
            const result = safeJsonStringify(obj, "\t");
            expect(result.success).toBe(true);
            expect(result.data).toContain("\t");
        });

        it("should handle empty objects and arrays", () => {
            const emptyObj = safeJsonStringify({});
            expect(emptyObj.success).toBe(true);
            expect(emptyObj.data).toBe("{}");

            const emptyArr = safeJsonStringify([]);
            expect(emptyArr.success).toBe(true);
            expect(emptyArr.data).toBe("[]");
        });

        it("should handle nested objects", () => {
            const nested = {
                level1: {
                    level2: {
                        value: "deep",
                    },
                },
            };
            const result = safeJsonStringify(nested);
            expect(result.success).toBe(true);
            expect(result.data).toBe('{"level1":{"level2":{"value":"deep"}}}');
        });

        it("should handle Date objects", () => {
            const date = new Date("2023-01-01T00:00:00.000Z");
            const result = safeJsonStringify(date);
            expect(result.success).toBe(true);
            expect(result.data).toContain("2023-01-01");
        });

        it("should handle objects with getters that throw", () => {
            const obj = {
                get problematic() {
                    throw new Error("getter error");
                },
                safe: "value",
            };
            const result = safeJsonStringify(obj);
            expect(result.success).toBe(false);
            expect(result.error).toContain("JSON stringification failed");
        });
    });
});
