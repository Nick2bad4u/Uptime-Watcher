/**
 * Performance benchmarks for shared error handling and safety utilities Tests
 * the performance of error handling, validation, and safety mechanisms
 */

import { bench, describe } from "vitest";
import { withErrorHandling } from "../../shared/utils/errorHandling";
import {
    safeJsonStringifyWithFallback,
    safeJsonParseWithFallback,
} from "../../shared/utils/jsonSafety";
import {
    safePropertyAccess,
    validateAndConvert,
    isArray,
    isRecord,
} from "../../shared/utils/typeHelpers";
import {
    isError,
    isObject,
    isString,
    hasProperty,
    hasProperties,
} from "../../shared/utils/typeGuards";

describe("Shared Error Handling and Safety Performance", () => {
    // Test data for safety and error handling benchmarks
    const validJsonStrings = [
        '{"key": "value"}',
        '{"number": 123, "boolean": true}',
        '{"nested": {"deep": {"value": "test"}}}',
        '{"array": [1, 2, 3, {"item": "nested"}]}',
        "[]",
        "{}",
    ];

    const invalidJsonStrings = [
        "{invalid json}",
        '{"unclosed": "string}',
        '{key: "value"}', // Missing quotes on key
        '{"trailing": "comma",}',
        "undefined",
        "null",
    ];

    const testObjects = [
        { simple: "value" },
        { nested: { deep: { value: 123 } } },
        {
            array: [
                1,
                2,
                3,
            ],
        },
        { mixed: { string: "test", number: 42, boolean: true } },
        null,
        undefined,
    ];

    const testErrors = [
        new Error("Simple error"),
        new TypeError("Type error"),
        new ReferenceError("Reference error"),
        new Error("Error with context"),
        { name: "CustomError", message: "Custom error object" },
    ];

    // Async operations for error handling testing
    const successfulAsyncOperation = () => Promise.resolve("success");
    const failingAsyncOperation = () =>
        Promise.reject(new Error("Operation failed"));

    // JSON safety benchmarks
    bench("safeJsonStringifyWithFallback - valid objects", () => {
        for (const obj of testObjects) {
            safeJsonStringifyWithFallback(obj, "fallback", 3);
        }
    });

    bench("safeJsonStringifyWithFallback - complex objects", () => {
        const complexObjects = [
            { timestamp: Date.now(), data: testObjects },
            { errors: testErrors, metadata: { version: "1.0" } },
            { circular: null as any },
        ];

        // Create circular reference
        complexObjects[2].circular = complexObjects[2];

        for (const obj of complexObjects) {
            safeJsonStringifyWithFallback(obj, "fallback", 3);
        }
    });

    bench("safeJsonParseWithFallback - valid JSON", () => {
        for (const jsonStr of validJsonStrings) {
            safeJsonParseWithFallback(
                jsonStr,
                (data): data is number => typeof data === "number",
                3
            );
        }
    });

    bench("safeJsonParseWithFallback - invalid JSON", () => {
        for (const jsonStr of invalidJsonStrings) {
            safeJsonParseWithFallback(
                jsonStr,
                (data): data is number => typeof data === "number",
                3
            );
        }
    });

    // Object safety benchmarks
    bench("safePropertyAccess - valid objects", () => {
        const validObjects = testObjects.filter(
            (obj) => obj !== null && obj !== undefined
        );
        for (const obj of validObjects) {
            safePropertyAccess(obj, "simple");
            safePropertyAccess(obj, "nested");
            safePropertyAccess(obj, "array");
            safePropertyAccess(obj, "nonexistent");
        }
    });

    bench("safePropertyAccess - null/undefined objects", () => {
        const nullObjects = [null, undefined];
        for (const obj of nullObjects) {
            safePropertyAccess(obj, "property");
        }
    });

    bench("hasProperty - property checking", () => {
        const validObjects = testObjects.filter(
            (obj) => obj !== null && obj !== undefined
        );
        for (const obj of validObjects) {
            hasProperty(obj, "simple");
            hasProperty(obj, "nested");
            hasProperty(obj, "array");
            hasProperty(obj, "nonexistent");
        }
    });

    bench("hasProperties - multiple property checking", () => {
        const validObjects = testObjects.filter(
            (obj) => obj !== null && obj !== undefined
        );
        for (const obj of validObjects) {
            hasProperties(obj, ["simple", "nested"]);
            hasProperties(obj, ["array", "mixed"]);
            hasProperties(obj, ["nonexistent", "missing"]);
        }
    });

    // Type checking benchmarks
    bench("isArray - array validation", () => {
        const mixedValues = [
            [
                1,
                2,
                3,
            ],
            [],
            "not an array",
            { length: 3 },
            null,
            undefined,
        ];

        for (const value of mixedValues) {
            isArray(value);
        }
    });

    bench("isRecord - record validation", () => {
        const mixedValues = [
            { key: "value" },
            {},
            [],
            "string",
            123,
            null,
            undefined,
        ];

        for (const value of mixedValues) {
            isRecord(value);
        }
    });

    bench("isError - error checking", () => {
        const mixedErrors = [
            ...testErrors,
            "string error",
            123,
            null,
            undefined,
        ];

        for (const error of mixedErrors) {
            isError(error);
        }
    });

    // Validation and conversion benchmarks
    bench("validateAndConvert - string validation", () => {
        const isString = (val: unknown): val is string =>
            typeof val === "string";
        const testValues = [
            "valid",
            123,
            null,
            undefined,
            true,
        ];

        for (const value of testValues) {
            try {
                validateAndConvert(value, isString);
            } catch {
                // Expected for invalid values
            }
        }
    });

    bench("validateAndConvert - number validation", () => {
        const isNumber = (val: unknown): val is number =>
            typeof val === "number";
        const testValues = [
            42,
            "123",
            null,
            undefined,
            true,
        ];

        for (const value of testValues) {
            try {
                validateAndConvert(value, isNumber);
            } catch {
                // Expected for invalid values
            }
        }
    });

    // Error handling wrapper benchmarks
    bench("withErrorHandling - successful operations", async () => {
        const mockContext = {
            logger: {
                error: () => {},
            },
            operationName: "benchmark-operation",
        };
        await withErrorHandling(successfulAsyncOperation, mockContext);
    });

    bench("withErrorHandling - failing operations", async () => {
        const mockContext = {
            logger: {
                error: () => {},
            },
            operationName: "benchmark-operation",
        };
        await withErrorHandling(failingAsyncOperation, mockContext);
    });

    // High-volume operations
    bench("high-volume JSON operations", () => {
        const operations = Array.from({ length: 100 }, (_, i) => ({
            stringify: { id: i, data: `test-${i}` },
            parse: `{"id": ${i}, "data": "test-${i}"}`,
        }));

        for (const op of operations) {
            safeJsonStringifyWithFallback(op.stringify, "fallback", 3);
            safeJsonParseWithFallback(
                op.parse,
                (data): data is number => typeof data === "number",
                3
            );
        }
    });

    bench("high-volume property access", () => {
        const objects = Array.from({ length: 100 }, (_, i) => ({
            id: i,
            name: `item-${i}`,
            data: { value: i * 2 },
        }));

        for (const obj of objects) {
            safePropertyAccess(obj, "id");
            safePropertyAccess(obj, "name");
            safePropertyAccess(obj, "data");
            safePropertyAccess(obj, "nonexistent");
            hasProperty(obj, "id");
            hasProperty(obj, "nonexistent");
            hasProperties(obj, ["id", "name"]);
        }
    });

    bench("high-volume type checking", () => {
        const values = Array.from({ length: 100 }, (_, i) => {
            const options = [
                i,
                `string-${i}`,
                [i, i + 1],
                { id: i },
                i % 2 === 0,
                null,
                undefined,
            ];
            return options[i % options.length];
        });

        for (const value of values) {
            isError(value);
            isObject(value);
            isString(value);
            isArray(value);
            isRecord(value);
        }
    });

    // Complex safety workflows
    bench("complex safety workflow", () => {
        const complexOperations = [
            {
                data: { config: { timeout: "30s" } },
                operation: () =>
                    safeJsonStringifyWithFallback(
                        { result: "success" },
                        "fallback",
                        3
                    ),
            },
            {
                data: null,
                operation: () => {
                    throw new Error("Invalid data");
                },
            },
            {
                data: { nested: { deep: { value: 123 } } },
                operation: () => safePropertyAccess({ test: "value" }, "test"),
            },
        ];

        for (const { data, operation } of complexOperations) {
            try {
                // Validate data
                if (hasProperty(data, "config")) {
                    safePropertyAccess(data, "config");
                }

                // Execute operation
                operation();

                // Format success
                safeJsonStringifyWithFallback(
                    { success: true, data },
                    "fallback",
                    3
                );
            } catch (error) {
                // Handle error
                isError(error);
            }
        }
    });

    // Memory-intensive operations
    bench("memory-intensive safety operations", () => {
        const largeDataSet = Array.from({ length: 200 }, (_, i) => ({
            id: i,
            data: {
                nested: {
                    deep: {
                        value: `item-${i}`,
                        metadata: { timestamp: Date.now(), index: i },
                    },
                },
            },
        }));

        for (const item of largeDataSet) {
            safeJsonStringifyWithFallback(item, "fallback", 3);
            safePropertyAccess(item, "data");
            safePropertyAccess(item.data, "nested");
            safePropertyAccess(item.data.nested, "deep");
            hasProperty(item.data.nested.deep, "value");
            hasProperties(item.data.nested.deep, ["value", "metadata"]);
            isRecord(item.data.nested.deep.metadata);
        }
    });

    // Edge case performance testing
    bench("edge case safety operations", () => {
        const edgeCases = [
            null,
            undefined,
            {},
            [],
            "",
            0,
            false,
            NaN,
            Infinity,
            -Infinity,
        ];

        for (const value of edgeCases) {
            safePropertyAccess(value, "property");
            hasProperty(value, "property");
            isError(value);
            isObject(value);
            isArray(value);
            isRecord(value);
            safeJsonStringifyWithFallback(value, "fallback", 3);
        }
    });
});
