/**
 * Comprehensive 100% coverage tests for jsonSafety.ts utilities
 */

import { describe, expect, it, vi } from "vitest";
import {
    type SafeJsonResult,
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseWithFallback,
    safeJsonStringify,
    safeJsonStringifyWithFallback,
} from "../../utils/jsonSafety";

describe("jsonSafety utilities", () => {
    describe("safeJsonParse", () => {
        interface TestUser {
            id: string;
            name: string;
            age: number;
        }

        const isValidUser = (data: unknown): data is TestUser => {
            return (
                typeof data === "object" &&
                data !== null &&
                typeof (data as any).id === "string" &&
                typeof (data as any).name === "string" &&
                typeof (data as any).age === "number"
            );
        };

        it("should successfully parse valid JSON with valid data", () => {
            const validJson = '{"id":"123","name":"John","age":30}';
            const result = safeJsonParse(validJson, isValidUser);

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: "123", name: "John", age: 30 });
            expect(result.error).toBeUndefined();
        });

        it("should return error for invalid JSON", () => {
            const invalidJson = '{"id":"123","name":"John",age:}';
            const result = safeJsonParse(invalidJson, isValidUser);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON parsing failed:");
        });

        it("should return error for valid JSON but invalid data type", () => {
            const validJsonInvalidType = '{"id":"123","name":"John"}'; // missing age
            const result = safeJsonParse(validJsonInvalidType, isValidUser);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                "Parsed data does not match expected type"
            );
        });

        it("should handle null JSON", () => {
            const nullJson = "null";
            const result = safeJsonParse(nullJson, isValidUser);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                "Parsed data does not match expected type"
            );
        });

        it("should handle empty string", () => {
            const emptyJson = "";
            const result = safeJsonParse(emptyJson, isValidUser);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON parsing failed:");
        });

        it("should handle non-Error objects thrown during parsing", () => {
            // Mock JSON.parse to throw a non-Error object
            const originalParse = JSON.parse;
            JSON.parse = vi.fn(() => {
                throw "string error";
            });

            const result = safeJsonParse('{"test": true}', isValidUser);

            expect(result.success).toBe(false);
            expect(result.error).toBe("JSON parsing failed: string error");

            // Restore original
            JSON.parse = originalParse;
        });
    });

    describe("safeJsonParseArray", () => {
        interface TestItem {
            id: string;
            value: number;
        }

        const isValidItem = (data: unknown): data is TestItem => {
            return (
                typeof data === "object" &&
                data !== null &&
                typeof (data as any).id === "string" &&
                typeof (data as any).value === "number"
            );
        };

        it("should successfully parse valid JSON array with valid elements", () => {
            const validJsonArray =
                '[{"id":"1","value":10},{"id":"2","value":20}]';
            const result = safeJsonParseArray(validJsonArray, isValidItem);

            expect(result.success).toBe(true);
            expect(result.data).toEqual([
                { id: "1", value: 10 },
                { id: "2", value: 20 },
            ]);
            expect(result.error).toBeUndefined();
        });

        it("should return error for invalid JSON", () => {
            const invalidJson = '[{"id":"1","value":10},{"id":"2",value:}]';
            const result = safeJsonParseArray(invalidJson, isValidItem);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON parsing failed:");
        });

        it("should return error when parsed data is not an array", () => {
            const notArrayJson = '{"id":"1","value":10}';
            const result = safeJsonParseArray(notArrayJson, isValidItem);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Parsed data is not an array");
        });

        it("should return error when array contains invalid elements", () => {
            const invalidElementJson = '[{"id":"1","value":10},{"id":"2"}]'; // missing value
            const result = safeJsonParseArray(invalidElementJson, isValidItem);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                "Array element at index 1 does not match expected type"
            );
        });

        it("should handle empty array", () => {
            const emptyArrayJson = "[]";
            const result = safeJsonParseArray(emptyArrayJson, isValidItem);

            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
            expect(result.error).toBeUndefined();
        });

        it("should handle array with null elements", () => {
            const nullElementJson = '[{"id":"1","value":10},null]';
            const result = safeJsonParseArray(nullElementJson, isValidItem);

            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Array element at index 1 does not match expected type"
            );
        });

        it("should handle non-Error objects thrown during parsing", () => {
            // Mock JSON.parse to throw a non-Error object
            const originalParse = JSON.parse;
            JSON.parse = vi.fn(() => {
                throw { message: "custom error" };
            });

            const result = safeJsonParseArray('[{"test": true}]', isValidItem);

            expect(result.success).toBe(false);
            expect(result.error).toBe("JSON parsing failed: [object Object]");

            // Restore original
            JSON.parse = originalParse;
        });
    });

    describe("safeJsonParseWithFallback", () => {
        interface TestConfig {
            timeout: number;
            retries: number;
        }

        const isValidConfig = (data: unknown): data is TestConfig => {
            return (
                typeof data === "object" &&
                data !== null &&
                typeof (data as any).timeout === "number" &&
                typeof (data as any).retries === "number"
            );
        };

        const fallbackConfig: TestConfig = { timeout: 5000, retries: 3 };

        it("should return parsed data for valid JSON", () => {
            const validJson = '{"timeout":1000,"retries":5}';
            const result = safeJsonParseWithFallback(
                validJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual({ timeout: 1000, retries: 5 });
        });

        it("should return fallback for invalid JSON", () => {
            const invalidJson = '{"timeout":1000,retries:}';
            const result = safeJsonParseWithFallback(
                invalidJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual(fallbackConfig);
        });

        it("should return fallback for valid JSON but invalid data type", () => {
            const invalidTypeJson = '{"timeout":"1000","retries":5}'; // timeout should be number
            const result = safeJsonParseWithFallback(
                invalidTypeJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual(fallbackConfig);
        });

        it("should return fallback when parsed data is undefined", () => {
            const undefinedJson = "undefined";
            const result = safeJsonParseWithFallback(
                undefinedJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual(fallbackConfig);
        });

        it("should handle null parsed data", () => {
            const nullJson = "null";
            const result = safeJsonParseWithFallback(
                nullJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual(fallbackConfig);
        });
    });

    describe("safeJsonStringify", () => {
        it("should successfully stringify valid objects", () => {
            const data = { name: "John", age: 30 };
            const result = safeJsonStringify(data);

            expect(result.success).toBe(true);
            expect(result.data).toBe('{"name":"John","age":30}');
            expect(result.error).toBeUndefined();
        });

        it("should successfully stringify with formatting", () => {
            const data = { name: "John", age: 30 };
            const result = safeJsonStringify(data, 2);

            expect(result.success).toBe(true);
            expect(result.data).toBe('{\n  "name": "John",\n  "age": 30\n}');
            expect(result.error).toBeUndefined();
        });

        it("should successfully stringify with string space parameter", () => {
            const data = { name: "John" };
            const result = safeJsonStringify(data, "\t");

            expect(result.success).toBe(true);
            expect(result.data).toBe('{\n\t"name": "John"\n}');
            expect(result.error).toBeUndefined();
        });

        it("should successfully stringify arrays", () => {
            const data = [
                1,
                2,
                3,
            ];
            const result = safeJsonStringify(data);

            expect(result.success).toBe(true);
            expect(result.data).toBe("[1,2,3]");
            expect(result.error).toBeUndefined();
        });

        it("should successfully stringify primitives", () => {
            const stringResult = safeJsonStringify("hello");
            expect(stringResult.success).toBe(true);
            expect(stringResult.data).toBe('"hello"');

            const numberResult = safeJsonStringify(42);
            expect(numberResult.success).toBe(true);
            expect(numberResult.data).toBe("42");

            const booleanResult = safeJsonStringify(true);
            expect(booleanResult.success).toBe(true);
            expect(booleanResult.data).toBe("true");

            const nullResult = safeJsonStringify(null);
            expect(nullResult.success).toBe(true);
            expect(nullResult.data).toBe("null");
        });

        it("should handle circular references", () => {
            const circular: any = { name: "test" };
            circular.self = circular;

            const result = safeJsonStringify(circular);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON stringification failed:");
        });

        it("should handle undefined values", () => {
            const result = safeJsonStringify(undefined);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Value cannot be serialized to JSON");
        });

        it("should handle functions", () => {
            const result = safeJsonStringify(() => {});

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Value cannot be serialized to JSON");
        });

        it("should handle symbols", () => {
            const result = safeJsonStringify(Symbol("test"));

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Value cannot be serialized to JSON");
        });

        it("should handle non-Error objects thrown during stringification", () => {
            // Mock JSON.stringify to throw a non-Error object
            const originalStringify = JSON.stringify;
            JSON.stringify = vi.fn(() => {
                throw "string error";
            });

            const result = safeJsonStringify({ test: true });

            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "JSON stringification failed: string error"
            );

            // Restore original
            JSON.stringify = originalStringify;
        });
    });

    describe("safeJsonStringifyWithFallback", () => {
        const fallbackString = "{}";

        it("should return stringified data for valid objects", () => {
            const data = { name: "John", age: 30 };
            const result = safeJsonStringifyWithFallback(data, fallbackString);

            expect(result).toBe('{"name":"John","age":30}');
        });

        it("should return stringified data with formatting", () => {
            const data = { name: "John" };
            const result = safeJsonStringifyWithFallback(
                data,
                fallbackString,
                2
            );

            expect(result).toBe('{\n  "name": "John"\n}');
        });

        it("should return fallback for circular references", () => {
            const circular: any = { name: "test" };
            circular.self = circular;

            const result = safeJsonStringifyWithFallback(
                circular,
                fallbackString
            );

            expect(result).toBe(fallbackString);
        });

        it("should return fallback for undefined values", () => {
            const result = safeJsonStringifyWithFallback(
                undefined,
                fallbackString
            );

            expect(result).toBe(fallbackString);
        });

        it("should return fallback for functions", () => {
            const result = safeJsonStringifyWithFallback(
                () => {},
                fallbackString
            );

            expect(result).toBe(fallbackString);
        });

        it("should return fallback when stringification fails", () => {
            const result = safeJsonStringifyWithFallback(
                Symbol("test"),
                fallbackString
            );

            expect(result).toBe(fallbackString);
        });

        it("should handle complex fallback strings", () => {
            const complexFallback =
                '{"error":"serialization_failed","timestamp":"2024-01-01"}';
            const result = safeJsonStringifyWithFallback(
                undefined,
                complexFallback
            );

            expect(result).toBe(complexFallback);
        });
    });

    describe("SafeJsonResult interface", () => {
        it("should properly type success results", () => {
            const successResult: SafeJsonResult<string> = {
                success: true,
                data: "test data",
            };

            expect(successResult.success).toBe(true);
            expect(successResult.data).toBe("test data");
            expect(successResult.error).toBeUndefined();
        });

        it("should properly type error results", () => {
            const errorResult: SafeJsonResult<string> = {
                success: false,
                error: "test error",
            };

            expect(errorResult.success).toBe(false);
            expect(errorResult.error).toBe("test error");
            expect(errorResult.data).toBeUndefined();
        });
    });
});
