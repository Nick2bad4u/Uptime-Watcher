/**
 * Performance benchmarks for shared utility functions and logging Tests the
 * performance of core shared utilities and templates
 */

import { bench, describe } from "vitest";
import { safeStringify } from "../../shared/utils/stringConversion";
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
    isDate,
    isFunction,
    isNonNullObject,
} from "../../shared/utils/typeGuards";
import {
    isBrowserEnvironment,
    isNodeEnvironment,
    getEnvironment,
} from "../../shared/utils/environment";

describe("Shared Utility Functions Performance", () => {
    // Test data for utility benchmarks
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

    const testValues = [
        "string",
        123,
        true,
        false,
        null,
        undefined,
        { object: "value" },
        [
            1,
            2,
            3,
        ],
        new Date(),
        new Error("test"),
        () => "function",
        Symbol("symbol"),
    ];

    const complexObjects = [
        { timestamp: Date.now(), data: { nested: { value: "test" } } },
        { id: 1, name: "Test", metadata: { version: "1.0", tags: ["a", "b"] } },
        { config: { timeout: 5000, retries: 3, enabled: true } },
    ];

    // String conversion benchmarks
    bench("safeStringify - mixed values", () => {
        for (const value of testValues) {
            safeStringify(value);
        }
    });

    bench("safeStringify - complex objects", () => {
        for (const obj of complexObjects) {
            safeStringify(obj);
        }
    });

    // Property access benchmarks
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
        for (const obj of [null, undefined]) {
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
        for (const value of testValues) {
            isArray(value);
        }
    });

    bench("isRecord - record validation", () => {
        for (const value of testValues) {
            isRecord(value);
        }
    });

    bench("isError - error checking", () => {
        for (const value of testValues) {
            isError(value);
        }
    });

    bench("isObject - object checking", () => {
        for (const value of testValues) {
            isObject(value);
        }
    });

    bench("isString - string checking", () => {
        for (const value of testValues) {
            isString(value);
        }
    });

    bench("isDate - date checking", () => {
        for (const value of testValues) {
            isDate(value);
        }
    });

    bench("isFunction - function checking", () => {
        for (const value of testValues) {
            isFunction(value);
        }
    });

    bench("isNonNullObject - non-null object checking", () => {
        for (const value of testValues) {
            isNonNullObject(value);
        }
    });

    // Validation and conversion benchmarks
    bench("validateAndConvert - string validation", () => {
        const isStringValidator = (val: unknown): val is string =>
            typeof val === "string";

        for (const value of testValues) {
            try {
                validateAndConvert(value, isStringValidator);
            } catch {
                // Expected for invalid values
            }
        }
    });

    bench("validateAndConvert - number validation", () => {
        const isNumberValidator = (val: unknown): val is number =>
            typeof val === "number";

        for (const value of testValues) {
            try {
                validateAndConvert(value, isNumberValidator);
            } catch {
                // Expected for invalid values
            }
        }
    });

    // Environment detection benchmarks
    bench("isBrowserEnvironment - environment detection", () => {
        // Run multiple times to test caching behavior
        for (let i = 0; i < 100; i++) {
            isBrowserEnvironment();
        }
    });

    bench("getEnvironment - environment type", () => {
        for (let i = 0; i < 100; i++) {
            getEnvironment();
        }
    });

    bench("isNodeEnvironment - node detection", () => {
        for (let i = 0; i < 100; i++) {
            isNodeEnvironment();
        }
    });

    // High-volume operations
    bench("high-volume type checking", () => {
        const values = Array.from({ length: 1000 }, (_, i) => {
            const options = [
                i,
                `string-${i}`,
                [i, i + 1],
                { id: i },
                i % 2 === 0,
                new Date(),
                () => i,
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
            isDate(value);
            isFunction(value);
        }
    });

    bench("high-volume property access", () => {
        const objects = Array.from({ length: 500 }, (_, i) => ({
            id: i,
            name: `item-${i}`,
            data: { value: i * 2, metadata: { timestamp: Date.now() } },
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

    bench("high-volume string conversion", () => {
        const values = Array.from({ length: 500 }, (_, i) => ({
            id: i,
            name: `item-${i}`,
            config: { enabled: i % 2 === 0 },
            timestamp: Date.now(),
        }));

        for (const value of values) {
            safeStringify(value);
        }
    });

    // Complex utility workflows
    bench("complex utility workflow", () => {
        const testData = [
            {
                config: { timeout: 5000, enabled: true },
                data: [
                    1,
                    2,
                    3,
                ],
            },
            { config: null, data: "string data" },
            { settings: { retries: 3 }, metadata: { version: "1.0" } },
            null,
            undefined,
        ];

        for (const item of testData) {
            // Type checking
            const isValid = isObject(item) && hasProperty(item, "config");

            if (isValid) {
                // Property access
                const config = safePropertyAccess(item, "config");
                const data = safePropertyAccess(item, "data");

                // More validation
                if (isObject(config)) {
                    hasProperty(config, "timeout");
                    hasProperty(config, "enabled");
                }

                if (isArray(data) || isString(data)) {
                    safeStringify(data);
                }
            }

            // Convert to string
            safeStringify(item);
        }
    });

    // Memory-intensive operations
    bench("memory-intensive utility operations", () => {
        const largeDataSet = Array.from({ length: 300 }, (_, i) => ({
            id: i,
            data: {
                nested: {
                    deep: {
                        value: `item-${i}`,
                        metadata: { timestamp: Date.now(), index: i },
                        tags: [`tag-${i}`, `category-${i % 10}`],
                    },
                },
            },
            config: {
                enabled: i % 2 === 0,
                timeout: 5000 + i * 100,
                retries: 3,
            },
        }));

        for (const item of largeDataSet) {
            // Type checking
            isObject(item);
            isArray(item.data.nested.deep.tags);

            // Property access
            safePropertyAccess(item, "data");
            safePropertyAccess(item.data, "nested");
            safePropertyAccess(item.data.nested, "deep");

            // Property validation
            hasProperty(item.data.nested.deep, "value");
            hasProperties(item.data.nested.deep, ["value", "metadata"]);
            hasProperties(item.config, [
                "enabled",
                "timeout",
                "retries",
            ]);

            // String conversion
            safeStringify(item.data.nested.deep.metadata);
        }
    });

    // Edge case performance testing
    bench("edge case utility operations", () => {
        const edgeCases = [
            null,
            undefined,
            {},
            [],
            "",
            0,
            false,
            Number.NaN,
            Infinity,
            -Infinity,
            Symbol("test"),
            () => {},
            new Date(),
            new Error("test"),
        ];

        for (const value of edgeCases) {
            // Safe operations that should never throw
            safePropertyAccess(value, "property");
            hasProperty(value, "property");
            isError(value);
            isObject(value);
            isArray(value);
            isRecord(value);
            isString(value);
            isDate(value);
            isFunction(value);
            safeStringify(value);
        }
    });
});
