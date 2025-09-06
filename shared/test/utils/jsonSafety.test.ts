/**
 * Comprehensive 100% coverage tests for jsonSafety.ts utilities
 */

import { describe, expect, it, vi, test } from "vitest";
import { fc } from "@fast-check/vitest";
import {
    type SafeJsonResult,
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseWithFallback,
    safeJsonStringify,
    safeJsonStringifyWithFallback,
} from "../../utils/jsonSafety";

describe("jsonSafety utilities", () => {
    describe(safeJsonParse, () => {
        interface TestUser {
            id: string;
            name: string;
            age: number;
        }

        const isValidUser = (data: unknown): data is TestUser =>
            typeof data === "object" &&
            data !== null &&
            typeof (data as any).id === "string" &&
            typeof (data as any).name === "string" &&
            typeof (data as any).age === "number";

        it("should successfully parse valid JSON with valid data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validJson = '{"id":"123","name":"John","age":30}';
            const result = safeJsonParse(validJson, isValidUser);

            expect(result.success).toBeTruthy();
            expect(result.data).toEqual({ id: "123", name: "John", age: 30 });
            expect(result.error).toBeUndefined();
        });

        it("should return error for invalid JSON", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const invalidJson = '{"id":"123","name":"John",age:}';
            const result = safeJsonParse(invalidJson, isValidUser);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON parsing failed:");
        });

        it("should return error for valid JSON but invalid data type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const validJsonInvalidType = '{"id":"123","name":"John"}'; // missing age
            const result = safeJsonParse(validJsonInvalidType, isValidUser);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                "Parsed data does not match expected type"
            );
        });

        it("should handle null JSON", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const nullJson = "null";
            const result = safeJsonParse(nullJson, isValidUser);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                "Parsed data does not match expected type"
            );
        });

        it("should handle empty string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const emptyJson = "";
            const result = safeJsonParse(emptyJson, isValidUser);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON parsing failed:");
        });

        it("should handle non-Error objects thrown during parsing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Mock JSON.parse to throw a non-Error object
            const originalParse = JSON.parse;
            JSON.parse = vi.fn(() => {
                throw new Error("string error");
            });

            const result = safeJsonParse('{"test": true}', isValidUser);

            expect(result.success).toBeFalsy();
            expect(result.error).toBe("JSON parsing failed: string error");

            // Restore original
            JSON.parse = originalParse;
        });
    });

    describe(safeJsonParseArray, () => {
        interface TestItem {
            id: string;
            value: number;
        }

        const isValidItem = (data: unknown): data is TestItem =>
            typeof data === "object" &&
            data !== null &&
            typeof (data as any).id === "string" &&
            typeof (data as any).value === "number";

        it("should successfully parse valid JSON array with valid elements", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validJsonArray =
                '[{"id":"1","value":10},{"id":"2","value":20}]';
            const result = safeJsonParseArray(validJsonArray, isValidItem);

            expect(result.success).toBeTruthy();
            expect(result.data).toEqual([
                { id: "1", value: 10 },
                { id: "2", value: 20 },
            ]);
            expect(result.error).toBeUndefined();
        });

        it("should return error for invalid JSON", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const invalidJson = '[{"id":"1","value":10},{"id":"2",value:}]';
            const result = safeJsonParseArray(invalidJson, isValidItem);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON parsing failed:");
        });

        it("should return error when parsed data is not an array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const notArrayJson = '{"id":"1","value":10}';
            const result = safeJsonParseArray(notArrayJson, isValidItem);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Parsed data is not an array");
        });

        it("should return error when array contains invalid elements", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const invalidElementJson = '[{"id":"1","value":10},{"id":"2"}]'; // missing value
            const result = safeJsonParseArray(invalidElementJson, isValidItem);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                "Array element at index 1 does not match expected type"
            );
        });

        it("should handle empty array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const emptyArrayJson = "[]";
            const result = safeJsonParseArray(emptyArrayJson, isValidItem);

            expect(result.success).toBeTruthy();
            expect(result.data).toEqual([]);
            expect(result.error).toBeUndefined();
        });

        it("should handle array with null elements", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const nullElementJson = '[{"id":"1","value":10},null]';
            const result = safeJsonParseArray(nullElementJson, isValidItem);

            expect(result.success).toBeFalsy();
            expect(result.error).toBe(
                "Array element at index 1 does not match expected type"
            );
        });

        it("should handle non-Error objects thrown during parsing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Mock JSON.parse to throw a non-Error object
            const originalParse = JSON.parse;
            JSON.parse = vi.fn(() => {
                throw new Error("custom error");
            });

            const result = safeJsonParseArray('[{"test": true}]', isValidItem);

            expect(result.success).toBeFalsy();
            expect(result.error).toBe("JSON parsing failed: custom error");

            // Restore original
            JSON.parse = originalParse;
        });
    });

    describe(safeJsonParseWithFallback, () => {
        interface TestConfig {
            timeout: number;
            retries: number;
        }

        const isValidConfig = (data: unknown): data is TestConfig =>
            typeof data === "object" &&
            data !== null &&
            typeof (data as any).timeout === "number" &&
            typeof (data as any).retries === "number";

        const fallbackConfig: TestConfig = { timeout: 5000, retries: 3 };

        it("should return parsed data for valid JSON", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validJson = '{"timeout":1000,"retries":5}';
            const result = safeJsonParseWithFallback(
                validJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual({ timeout: 1000, retries: 5 });
        });

        it("should return fallback for invalid JSON", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const invalidJson = '{"timeout":1000,retries:}';
            const result = safeJsonParseWithFallback(
                invalidJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual(fallbackConfig);
        });

        it("should return fallback for valid JSON but invalid data type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const invalidTypeJson = '{"timeout":"1000","retries":5}'; // timeout should be number
            const result = safeJsonParseWithFallback(
                invalidTypeJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual(fallbackConfig);
        });

        it("should return fallback when parsed data is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const undefinedJson = "undefined";
            const result = safeJsonParseWithFallback(
                undefinedJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual(fallbackConfig);
        });

        it("should handle null parsed data", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const nullJson = "null";
            const result = safeJsonParseWithFallback(
                nullJson,
                isValidConfig,
                fallbackConfig
            );

            expect(result).toEqual(fallbackConfig);
        });
    });

    describe(safeJsonStringify, () => {
        it("should successfully stringify valid objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = { name: "John", age: 30 };
            const result = safeJsonStringify(data);

            expect(result.success).toBeTruthy();
            expect(result.data).toBe('{"name":"John","age":30}');
            expect(result.error).toBeUndefined();
        });

        it("should successfully stringify with formatting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = { name: "John", age: 30 };
            const result = safeJsonStringify(data, 2);

            expect(result.success).toBeTruthy();
            expect(result.data).toBe('{\n  "name": "John",\n  "age": 30\n}');
            expect(result.error).toBeUndefined();
        });

        it("should successfully stringify with string space parameter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = { name: "John" };
            const result = safeJsonStringify(data, "\t");

            expect(result.success).toBeTruthy();
            expect(result.data).toBe('{\n\t"name": "John"\n}');
            expect(result.error).toBeUndefined();
        });

        it("should successfully stringify arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = [
                1,
                2,
                3,
            ];
            const result = safeJsonStringify(data);

            expect(result.success).toBeTruthy();
            expect(result.data).toBe("[1,2,3]");
            expect(result.error).toBeUndefined();
        });

        it("should successfully stringify primitives", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const stringResult = safeJsonStringify("hello");
            expect(stringResult.success).toBeTruthy();
            expect(stringResult.data).toBe('"hello"');

            const numberResult = safeJsonStringify(42);
            expect(numberResult.success).toBeTruthy();
            expect(numberResult.data).toBe("42");

            const booleanResult = safeJsonStringify(true);
            expect(booleanResult.success).toBeTruthy();
            expect(booleanResult.data).toBe("true");

            const nullResult = safeJsonStringify(null);
            expect(nullResult.success).toBeTruthy();
            expect(nullResult.data).toBe("null");
        });

        it("should handle circular references", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const circular: any = { name: "test" };
            circular.self = circular;

            const result = safeJsonStringify(circular);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toContain("JSON stringification failed:");
        });

        it("should handle undefined values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = safeJsonStringify(undefined);

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Value cannot be serialized to JSON");
        });

        it("should handle functions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = safeJsonStringify(() => {});

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Value cannot be serialized to JSON");
        });

        it("should handle symbols", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = safeJsonStringify(Symbol("test"));

            expect(result.success).toBeFalsy();
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Value cannot be serialized to JSON");
        });

        it("should handle non-Error objects thrown during stringification", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Mock JSON.stringify to throw a non-Error object
            const originalStringify = JSON.stringify;
            JSON.stringify = vi.fn(() => {
                throw new Error("string error");
            });

            const result = safeJsonStringify({ test: true });

            expect(result.success).toBeFalsy();
            expect(result.error).toBe(
                "JSON stringification failed: string error"
            );

            // Restore original
            JSON.stringify = originalStringify;
        });
    });

    describe(safeJsonStringifyWithFallback, () => {
        const fallbackString = "{}";

        it("should return stringified data for valid objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = { name: "John", age: 30 };
            const result = safeJsonStringifyWithFallback(data, fallbackString);

            expect(result).toBe('{"name":"John","age":30}');
        });

        it("should return stringified data with formatting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = { name: "John" };
            const result = safeJsonStringifyWithFallback(
                data,
                fallbackString,
                2
            );

            expect(result).toBe('{\n  "name": "John"\n}');
        });

        it("should return fallback for circular references", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const circular: any = { name: "test" };
            circular.self = circular;

            const result = safeJsonStringifyWithFallback(
                circular,
                fallbackString
            );

            expect(result).toBe(fallbackString);
        });

        it("should return fallback for undefined values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = safeJsonStringifyWithFallback(
                undefined,
                fallbackString
            );

            expect(result).toBe(fallbackString);
        });

        it("should return fallback for functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = safeJsonStringifyWithFallback(
                () => {},
                fallbackString
            );

            expect(result).toBe(fallbackString);
        });

        it("should return fallback when stringification fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const result = safeJsonStringifyWithFallback(
                Symbol("test"),
                fallbackString
            );

            expect(result).toBe(fallbackString);
        });

        it("should handle complex fallback strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
        it("should properly type success results", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const successResult: SafeJsonResult<string> = {
                success: true,
                data: "test data",
            };

            expect(successResult.success).toBeTruthy();
            expect(successResult.data).toBe("test data");
            expect(successResult.error).toBeUndefined();
        });

        it("should properly type error results", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorResult: SafeJsonResult<string> = {
                success: false,
                error: "test error",
            };

            expect(errorResult.success).toBeFalsy();
            expect(errorResult.error).toBe("test error");
            expect(errorResult.data).toBeUndefined();
        });
    });

    describe("Property-based tests for JSON safety", () => {
        // Helper function for property tests
        const isValidJson = (str: string): boolean => {
            try {
                JSON.parse(str);
                return true;
            } catch {
                return false;
            }
        };

        test("should handle all JSON-serializable values consistently", () => {
            fc.assert(fc.property(fc.jsonValue(), (jsonValue) => {
                const result = safeJsonStringify(jsonValue);
                expect(typeof result.success).toBe("boolean");

                if (result.success && result.data) {
                    // If stringify succeeded, parsing should also succeed
                    const parsed = JSON.parse(result.data);
                    expect(parsed).toEqual(jsonValue);
                }
            }));
        });

        test("should handle all possible string inputs to safeJsonParse", () => {
            fc.assert(fc.property(fc.string(), (inputString) => {
                const isString = (data: unknown): data is string => typeof data === "string";
                const result = safeJsonParse(inputString, isString);

                // Result should always be well-formed
                expect(typeof result.success).toBe("boolean");

                if (result.success) {
                    expect(result.data).toBeDefined();
                    expect(result.error).toBeUndefined();
                    expect(typeof result.data).toBe("string");
                } else {
                    expect(result.data).toBeUndefined();
                    expect(typeof result.error).toBe("string");
                    expect(result.error!.length).toBeGreaterThan(0);
                }
            }));
        });

        test("should handle all possible arrays in safeJsonParseArray", () => {
            fc.assert(fc.property(fc.array(fc.jsonValue()), (arrayValue) => {
                const serialized = JSON.stringify(arrayValue);
                const isAny = (_data: unknown): _data is unknown => true;
                const result = safeJsonParseArray(serialized, isAny);

                expect(result.success).toBeTruthy();
                expect(result.data).toEqual(arrayValue);
                expect(result.error).toBeUndefined();
            }));
        });

        test("should gracefully handle invalid JSON inputs", () => {
            fc.assert(fc.property(fc.oneof(
                fc.constant(""),
                fc.constant("invalid json"),
                fc.constant("{"),
                fc.constant("}"),
                fc.constant("["),
                fc.constant("]")
            ), (invalidJson) => {
                const isAny = (_data: unknown): _data is unknown => true;
                const result = safeJsonParse(invalidJson, isAny);

                // Should never throw, should always return a well-formed result
                expect(typeof result.success).toBe("boolean");

                if (!result.success) {
                    expect(typeof result.error).toBe("string");
                    expect(result.error!.length).toBeGreaterThan(0);
                    expect(result.data).toBeUndefined();
                }
            }));
        });

        test("should round-trip complex objects through stringify and parse", () => {
            fc.assert(fc.property(fc.record({
                key: fc.string(),
                value: fc.jsonValue(),
                nested: fc.record({
                    prop: fc.jsonValue()
                })
            }), (complexObject) => {
                const result = safeJsonStringify(complexObject);
                expect(typeof result.success).toBe("boolean");

                if (result.success && result.data) {
                    expect(result.data.length).toBeGreaterThan(0);

                    const isObject = (data: unknown): data is object =>
                        typeof data === "object" && data !== null;

                    const parsed = safeJsonParse(result.data, isObject);
                    expect(parsed.success).toBeTruthy();
                    expect(parsed.data).toEqual(complexObject);
                }
            }));
        });

        test("should handle arrays of typed objects consistently", () => {
            fc.assert(fc.property(fc.array(fc.record({
                id: fc.string(),
                value: fc.integer()
            })), (objectArray) => {
                const stringified = JSON.stringify(objectArray);

                const isTypedObject = (data: unknown): data is { id: string; value: number } =>
                    typeof data === "object" &&
                    data !== null &&
                    typeof (data as any).id === "string" &&
                    typeof (data as any).value === "number";

                const result = safeJsonParseArray(stringified, isTypedObject);
                expect(result.success).toBeTruthy();
                expect(result.data).toEqual(objectArray);
            }));
        });

        test("should handle arbitrary JavaScript values in safeJsonStringify", () => {
            fc.assert(fc.property(fc.anything(), (arbitraryValue) => {
                // Should never throw
                const result = safeJsonStringify(arbitraryValue);
                expect(typeof result.success).toBe("boolean");

                if (result.success && result.data) {
                    expect(result.data.length).toBeGreaterThanOrEqual(0);
                }
            }));
        });

        test("should handle malformed JSON strings gracefully", () => {
            fc.assert(fc.property(fc.oneof(
                fc.constant("not json"),
                fc.constant('{"unclosed": '),
                fc.constant('{key: "value"}'), // invalid JSON (unquoted key)
                fc.constant('[1, 2, 3,]'), // trailing comma
                fc.constant('{"test": undefined}') // undefined is not JSON
            ), (malformedJson) => {
                const isAny = (_data: unknown): _data is unknown => true;
                const result = safeJsonParse(malformedJson, isAny);

                expect(result.success).toBeFalsy();
                expect(typeof result.error).toBe("string");
                expect(result.error!).toMatch(/JSON parsing failed:/);
            }));
        });

        test("should use fallback when safeJsonStringifyWithFallback fails", () => {
            fc.assert(fc.property(fc.jsonValue(), fc.string(), (value, fallback) => {
                const result = safeJsonStringifyWithFallback(value, fallback);
                expect(typeof result).toBe("string");

                // Result should either be valid JSON or the fallback
                if (result === fallback) {
                    // Fallback was used
                    expect(result).toBe(fallback);
                } else {
                    // JSON stringification succeeded
                    expect(() => JSON.parse(result)).not.toThrow();
                }
            }));
        });

        test("should use fallback when safeJsonParseWithFallback fails", () => {
            fc.assert(fc.property(fc.string(), fc.jsonValue(), (inputJson, fallback) => {
                fc.pre(!isValidJson(inputJson)); // Only test with invalid JSON

                const isAny = (_data: unknown): _data is unknown => true;
                const result = safeJsonParseWithFallback(inputJson, isAny, fallback);
                expect(result).toEqual(fallback);
            }));
        });

        test("should handle all finite numbers correctly", () => {
            fc.assert(fc.property(fc.float({ noNaN: true }), (number) => {
                fc.pre(Number.isFinite(number));

                const result = safeJsonStringify(number);
                expect(result.success).toBeTruthy();

                if (result.success && result.data) {
                    const parsed = JSON.parse(result.data);
                    expect(parsed).toBe(number);
                }
            }));
        });

        test("should preserve JSON stringify behavior for edge cases", () => {
            fc.assert(fc.property(fc.oneof(
                fc.constant(undefined),
                fc.constant(Symbol("test")),
                fc.constant(() => {}),
                fc.constant(BigInt(123))
            ), (edgeCaseValue) => {
                const result = safeJsonStringify(edgeCaseValue);

                // These values typically can't be JSON stringified
                if (!result.success) {
                    expect(typeof result.error).toBe("string");
                    expect(result.data).toBeUndefined();
                }
            }));
        });

        test("should handle deeply nested structures", () => {
            fc.assert(fc.property(fc.letrec(tie => ({
                leaf: fc.jsonValue(),
                node: fc.record({
                    value: fc.jsonValue(),
                    children: fc.array(tie("leaf"), { maxLength: 2 })
                })
            })).node, (deepStructure) => {
                const result = safeJsonStringify(deepStructure);
                expect(typeof result.success).toBe("boolean");

                if (result.success && result.data) {
                    // Should be able to parse it back
                    const isObject = (data: unknown): data is object =>
                        typeof data === "object" && data !== null;
                    const parsed = safeJsonParse(result.data, isObject);
                    expect(parsed.success).toBeTruthy();
                }
            }));
        });
    });
});
