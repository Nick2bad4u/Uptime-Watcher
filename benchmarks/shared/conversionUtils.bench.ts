/**
 * Performance benchmarks for shared conversion and validation utilities Tests
 * the performance of data conversion, type checking, and validation functions
 */

import { bench, describe } from "vitest";
import {
    safeNumberConversion,
    safeParseFloat,
    safeParseInt,
    safeParseTimeout,
} from "../../shared/utils/safeConversions";
import { safeStringify } from "../../shared/utils/stringConversion";
import {
    isString,
    isNumber,
    isBoolean,
    isObject,
    isArray,
    isValidPort,
    isValidTimestamp,
    isFiniteNumber,
    isNonNegativeNumber,
    isPositiveNumber,
} from "../../shared/utils/typeGuards";

describe("Shared Conversion and Validation Performance", () => {
    // Test data for conversion benchmarks
    const validNumbers = [
        123,
        456.78,
        -999,
        0,
        3.141_59,
    ];
    const stringNumbers = [
        "123",
        "456.78",
        "-999",
        "0",
        "3.14159",
    ];
    const invalidNumbers = [
        "abc",
        "not-a-number",
        "",
        "   ",
        null,
        undefined,
    ];

    const timeoutStrings = [
        "5s",
        "30s",
        "1m",
        "5m",
        "30m",
    ];
    const invalidTimeouts = [
        "invalid",
        "5x",
        "",
        "toolong123",
    ];

    const validPorts = [
        80,
        443,
        3000,
        8080,
        65_535,
    ];
    const invalidPorts = [
        0,
        -1,
        65_536,
        99_999,
        "80",
        "invalid",
    ];

    const validTimestamps = [
        Date.now(),
        Date.now() - 3_600_000,
        1_640_995_200_000,
    ];
    const invalidTimestamps = [
        -1,
        "invalid",
        null,
        undefined,
        Infinity,
        Number.NaN,
    ];

    const conversionTestValues = [
        "true",
        "false",
        "1",
        "0",
        "yes",
        "no",
        123,
        456.78,
        -999,
        0,
        true,
        false,
        null,
        undefined,
        { key: "value" },
        [
            1,
            2,
            3,
        ],
    ];

    // Number conversion benchmarks
    bench("safeNumberConversion - valid numbers", () => {
        for (const value of validNumbers) {
            safeNumberConversion(value);
        }
    });

    bench("safeNumberConversion - string numbers", () => {
        for (const value of stringNumbers) {
            safeNumberConversion(value);
        }
    });

    bench("safeNumberConversion - invalid values", () => {
        for (const value of invalidNumbers) {
            safeNumberConversion(value, 42);
        }
    });

    bench("safeParseFloat - mixed values", () => {
        const allValues = [
            ...validNumbers,
            ...stringNumbers,
            ...invalidNumbers,
        ];
        for (const value of allValues) {
            safeParseFloat(value, 1);
        }
    });

    bench("safeParseInt - mixed values", () => {
        const allValues = [
            ...validNumbers,
            ...stringNumbers,
            ...invalidNumbers,
        ];
        for (const value of allValues) {
            safeParseInt(value, 10);
        }
    });

    // Timeout parsing benchmarks
    bench("safeParseTimeout - valid timeouts", () => {
        for (const timeout of timeoutStrings) {
            safeParseTimeout(timeout);
        }
    });

    bench("safeParseTimeout - invalid timeouts", () => {
        for (const timeout of invalidTimeouts) {
            safeParseTimeout(timeout);
        }
    });

    // String conversion benchmarks
    bench("safeStringify - mixed values", () => {
        for (const value of conversionTestValues) {
            safeStringify(value);
        }
    });

    // Type checking benchmarks
    bench("isString - mixed values", () => {
        for (const value of conversionTestValues) {
            isString(value);
        }
    });

    bench("isNumber - mixed values", () => {
        for (const value of conversionTestValues) {
            isNumber(value);
        }
    });

    bench("isBoolean - mixed values", () => {
        for (const value of conversionTestValues) {
            isBoolean(value);
        }
    });

    bench("isObject - mixed values", () => {
        for (const value of conversionTestValues) {
            isObject(value);
        }
    });

    bench("isArray - mixed values", () => {
        for (const value of conversionTestValues) {
            isArray(value);
        }
    });

    bench("isValidPort - valid ports", () => {
        for (const port of validPorts) {
            isValidPort(port);
        }
    });

    bench("isValidPort - invalid ports", () => {
        for (const port of invalidPorts) {
            isValidPort(port);
        }
    });

    bench("isValidTimestamp - valid timestamps", () => {
        for (const timestamp of validTimestamps) {
            isValidTimestamp(timestamp);
        }
    });

    bench("isValidTimestamp - invalid timestamps", () => {
        for (const timestamp of invalidTimestamps) {
            isValidTimestamp(timestamp);
        }
    });

    bench("isFiniteNumber - mixed values", () => {
        const testValues = [
            ...validNumbers,
            Infinity,
            -Infinity,
            Number.NaN,
            "123",
        ];
        for (const value of testValues) {
            isFiniteNumber(value);
        }
    });

    bench("isNonNegativeNumber - mixed values", () => {
        const testValues = [
            ...validNumbers,
            -1,
            -999,
            0,
            123,
        ];
        for (const value of testValues) {
            isNonNegativeNumber(value);
        }
    });

    bench("isPositiveNumber - mixed values", () => {
        const testValues = [
            ...validNumbers,
            -1,
            0,
            123,
        ];
        for (const value of testValues) {
            isPositiveNumber(value);
        }
    });

    // High-volume operations
    bench("high-volume number conversions", () => {
        const values = Array.from({ length: 1000 }, (_, i) =>
            i % 2 === 0 ? String(i) : i
        );

        for (const value of values) {
            safeNumberConversion(value);
            safeParseFloat(value);
            safeParseInt(value);
        }
    });

    bench("high-volume type checking", () => {
        const values = Array.from({ length: 1000 }, (_, i) => {
            const options = [
                i,
                String(i),
                i % 2 === 0,
                null,
                undefined,
            ];
            return options[i % options.length];
        });

        for (const value of values) {
            isString(value);
            isNumber(value);
            isBoolean(value);
            isObject(value);
            isArray(value);
        }
    });

    bench("high-volume validation operations", () => {
        const ports = Array.from({ length: 1000 }, (_, i) => i + 1);
        const timestamps = Array.from(
            { length: 1000 },
            (_, i) => Date.now() - i * 1000
        );

        for (const port of ports) {
            isValidPort(port);
        }

        for (const timestamp of timestamps) {
            isValidTimestamp(timestamp);
        }
    });

    // Complex conversion workflows
    bench("complex conversion workflow", () => {
        const testConfigs = [
            { timeout: "30s", port: 3000, enabled: "true" },
            { timeout: "1m", port: "8080", enabled: "false" },
            { timeout: "5m", port: 443, enabled: "yes" },
            { timeout: "invalid", port: "invalid", enabled: "invalid" },
        ];

        for (const config of testConfigs) {
            const timeout = safeParseTimeout(config.timeout);
            const port = safeNumberConversion(config.port);
            const enabled = isString(config.enabled)
                ? config.enabled.toLowerCase() === "true"
                : false;

            // Validate conversions
            if (timeout > 0 && isValidPort(port)) {
                safeStringify(timeout);
                safeStringify(port);
                safeStringify(enabled);
            }
        }
    });

    // Memory-intensive operations
    bench("memory-intensive conversions", () => {
        const largeDataSet = Array.from({ length: 500 }, (_, i) => ({
            id: i,
            value: String(i),
            float: i * 1.5,
            port: 3000 + (i % 1000),
            timestamp: Date.now() - i * 1000,
        }));

        for (const item of largeDataSet) {
            safeNumberConversion(item.value);
            safeParseFloat(item.float);
            isValidPort(item.port);
            isValidTimestamp(item.timestamp);
            safeStringify(item.id);
        }
    });

    // Edge case performance testing
    bench("edge case conversions", () => {
        const edgeCases = [
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            0,
            -0,
            Infinity,
            -Infinity,
            Number.NaN,
            "",
            "0",
            "false",
            "null",
            "undefined",
        ];

        for (const value of edgeCases) {
            safeNumberConversion(value);
            safeParseFloat(value);
            safeParseInt(value);
            isString(value);
            isNumber(value);
            isFiniteNumber(value);
            safeStringify(value);
        }
    });

    // Object stringification performance
    bench("complex object stringification", () => {
        const complexObjects = [
            { simple: "value" },
            { nested: { deep: { value: 123 } } },
            {
                array: [
                    1,
                    2,
                    3,
                    { nested: "array" },
                ],
            },
            {
                mixed: {
                    string: "test",
                    number: 42,
                    boolean: true,
                    array: [1, 2],
                },
            },
            null,
            undefined,
            "simple string",
            42,
            true,
        ];

        for (const obj of complexObjects) {
            safeStringify(obj);
        }
    });
});
