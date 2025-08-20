/**
 * Validation Operations Performance Benchmarks
 *
 * @file Performance benchmarks for validation operations including schema
 *   validation, data parsing, type checking, and input sanitization.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark Validation
 *
 * @tags ["performance", "validation", "schema", "parsing", "sanitization"]
 */

import { bench, describe } from "vitest";

// Type definitions for benchmarking
interface ValidationTestData {
    sites: any[];
    monitors: any[];
    invalidData: any[];
    complexObjects: any[];
    malformedJson: string[];
}

// Mock validation schemas and functions
const siteSchema = {
    identifier: "string",
    name: "string",
    monitoring: "boolean",
    monitors: "array",
};

const monitorSchema = {
    id: "string",
    type: "string",
    monitoring: "boolean",
    checkInterval: "number",
    timeout: "number",
};

// Mock data generators for validation benchmarking
function generateValidationTestData(): ValidationTestData {
    const sites = Array.from({ length: 1000 }, (_, i) => ({
        identifier: `site-${i}`,
        name: `Test Site ${i}`,
        monitoring: true,
        monitors: [`monitor-${i}`],
    }));

    const monitors = Array.from({ length: 500 }, (_, i) => ({
        id: `monitor-${i}`,
        type: "http",
        monitoring: true,
        checkInterval: 30_000 + i * 1000,
        timeout: 5000 + i * 100,
        url: `https://example${i}.com`,
    }));

    const invalidData = Array.from({ length: 100 }, (_, i) => ({
        // Missing required fields, wrong types, etc.
        id: i % 2 === 0 ? `invalid-${i}` : null,
        name: i % 3 === 0 ? 123 : `Invalid ${i}`, // Wrong type
        monitoring: i % 4 === 0 ? "yes" : true, // Wrong type sometimes
        extraField: `unexpected-${i}`,
    }));

    const complexObjects = Array.from({ length: 200 }, (_, i) => ({
        id: `complex-${i}`,
        nested: {
            level1: {
                level2: {
                    level3: {
                        data: Array.from({ length: 50 }, (_, j) => ({
                            id: j,
                            value: Math.random() * 1000,
                            timestamp: Date.now() - j * 1000,
                        })),
                    },
                },
            },
        },
        arrays: {
            numbers: Array.from({ length: 100 }, () => Math.random()),
            strings: Array.from({ length: 100 }, (_, j) => `string-${j}`),
            booleans: Array.from({ length: 100 }, (_, j) => j % 2 === 0),
        },
    }));

    const malformedJson = [
        '{"incomplete": json',
        '{"missing": "closing_brace"',
        '{"trailing": "comma",}',
        '{invalid: "quotes"}',
        "not json at all",
        '{"circular": {"ref": "problem"}}',
        '{"numbers": [1,2,3,4,}',
        String.raw`{"escaped": "quotes\"inside"}`,
        String.raw`{"unicode": "\u0000\u0001"}`,
    ];

    return { sites, monitors, invalidData, complexObjects, malformedJson };
}

// Validation utility functions
function validateSchema(data: any, schema: any): boolean {
    for (const [key, expectedType] of Object.entries(schema)) {
        if (!(key in data)) return false;

        const value = data[key];
        switch (expectedType) {
            case "string": {
                if (typeof value !== "string") return false;
                break;
            }
            case "number": {
                if (typeof value !== "number" || isNaN(value)) return false;
                break;
            }
            case "boolean": {
                if (typeof value !== "boolean") return false;
                break;
            }
            case "array": {
                if (!Array.isArray(value)) return false;
                break;
            }
            default: {
                return false;
            }
        }
    }
    return true;
}

function sanitizeString(input: string): string {
    return input
        .replaceAll(/[<>]/g, "") // Remove potential HTML tags
        .replaceAll(/["']/g, "") // Remove quotes
        .replaceAll(/\s+/g, " ") // Normalize whitespace
        .trim()
        .slice(0, 1000); // Limit length
}

function parseAndValidateJson(jsonString: string): {
    valid: boolean;
    data?: any;
    error?: string;
} {
    try {
        const data = JSON.parse(jsonString);
        return { valid: true, data };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Parse error",
        };
    }
}

function validateNumberRange(value: number, min: number, max: number): boolean {
    return (
        typeof value === "number" &&
        !isNaN(value) &&
        value >= min &&
        value <= max
    );
}

function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

describe("Validation Operations Performance Benchmarks", () => {
    const testData = generateValidationTestData();
    const { sites, monitors, invalidData, complexObjects, malformedJson } =
        testData;

    describe("Schema Validation Benchmarks", () => {
        bench(
            "validate single site object",
            () => {
                validateSchema(sites[0], siteSchema);
            },
            {
                time: 1000,
                iterations: 10_000,
            }
        );

        bench(
            "validate bulk sites (1000 items)",
            () => {
                sites.every((site) => validateSchema(site, siteSchema));
            },
            {
                time: 2000,
                iterations: 100,
            }
        );

        bench(
            "validate single monitor object",
            () => {
                validateSchema(monitors[0], monitorSchema);
            },
            {
                time: 1000,
                iterations: 10_000,
            }
        );

        bench(
            "validate bulk monitors (500 items)",
            () => {
                monitors.every((monitor) =>
                    validateSchema(monitor, monitorSchema)
                );
            },
            {
                time: 2000,
                iterations: 200,
            }
        );

        bench(
            "validate invalid data (error paths)",
            () => {
                invalidData.every((item) => validateSchema(item, siteSchema));
            },
            {
                time: 1000,
                iterations: 500,
            }
        );
    });

    describe("Data Parsing Benchmarks", () => {
        const serializedSites = JSON.stringify(sites);
        const serializedMonitors = JSON.stringify(monitors);
        const serializedComplex = JSON.stringify(complexObjects);

        bench(
            "parse and validate simple JSON",
            () => {
                parseAndValidateJson(serializedSites);
            },
            {
                time: 2000,
                iterations: 100,
            }
        );

        bench(
            "parse and validate complex nested JSON",
            () => {
                parseAndValidateJson(serializedComplex);
            },
            {
                time: 3000,
                iterations: 50,
            }
        );

        bench(
            "handle malformed JSON gracefully",
            () => {
                malformedJson.forEach((json) => parseAndValidateJson(json));
            },
            {
                time: 1000,
                iterations: 1000,
            }
        );

        bench(
            "parse individual monitor objects",
            () => {
                monitors.forEach((monitor) => {
                    const json = JSON.stringify(monitor);
                    parseAndValidateJson(json);
                });
            },
            {
                time: 2000,
                iterations: 100,
            }
        );
    });

    describe("Type Checking Benchmarks", () => {
        bench(
            "check number ranges (timeout values)",
            () => {
                monitors.every((monitor) =>
                    validateNumberRange(monitor.timeout, 1000, 30_000)
                );
            },
            {
                time: 1000,
                iterations: 1000,
            }
        );

        bench(
            "check number ranges (intervals)",
            () => {
                monitors.every((monitor) =>
                    validateNumberRange(monitor.checkInterval, 10_000, 300_000)
                );
            },
            {
                time: 1000,
                iterations: 1000,
            }
        );

        bench(
            "validate URL formats",
            () => {
                monitors.every((monitor) =>
                    monitor.url ? validateUrl(monitor.url) : true
                );
            },
            {
                time: 1000,
                iterations: 500,
            }
        );

        bench(
            "type checking primitives",
            () => {
                const values = [
                    "string",
                    123,
                    true,
                    [],
                    {},
                    null,
                    undefined,
                    "another string",
                    456,
                    false,
                    [
                        1,
                        2,
                        3,
                    ],
                    { a: 1 },
                ];

                values.forEach((value) => {
                    typeof value === "string";
                    typeof value === "number";
                    typeof value === "boolean";
                    Array.isArray(value);
                    if (value !== null) typeof value === "object";
                });
            },
            {
                time: 1000,
                iterations: 10_000,
            }
        );
    });

    describe("String Sanitization Benchmarks", () => {
        const testStrings = Array.from(
            { length: 1000 },
            (_, i) =>
                `Test string ${i} with <script>alert('xss')</script> and "quotes" and   extra   spaces   `
        );

        bench(
            "sanitize single string",
            () => {
                sanitizeString(testStrings[0]);
            },
            {
                time: 1000,
                iterations: 10_000,
            }
        );

        bench(
            "sanitize bulk strings (1000 items)",
            () => {
                testStrings.forEach((str) => sanitizeString(str));
            },
            {
                time: 2000,
                iterations: 100,
            }
        );

        bench(
            "sanitize site names",
            () => {
                sites.forEach((site) => sanitizeString(site.name));
            },
            {
                time: 1000,
                iterations: 200,
            }
        );

        bench(
            "sanitize monitor URLs",
            () => {
                monitors.forEach((monitor) => {
                    if (monitor.url) {
                        sanitizeString(monitor.url);
                    }
                });
            },
            {
                time: 1000,
                iterations: 500,
            }
        );
    });

    describe("Complex Validation Workflows", () => {
        bench(
            "full site validation pipeline",
            () => {
                sites.slice(0, 100).every((site) => {
                    // Schema validation
                    if (!validateSchema(site, siteSchema)) return false;

                    // String sanitization
                    const sanitizedName = sanitizeString(site.name);
                    if (sanitizedName.length === 0) return false;

                    // Array validation
                    if (!Array.isArray(site.monitors)) return false;

                    return true;
                });
            },
            {
                time: 2000,
                iterations: 200,
            }
        );

        bench(
            "full monitor validation pipeline",
            () => {
                monitors.slice(0, 100).every((monitor) => {
                    // Schema validation
                    if (!validateSchema(monitor, monitorSchema)) return false;

                    // Range validation
                    if (!validateNumberRange(monitor.timeout, 1000, 30_000))
                        return false;
                    if (
                        !validateNumberRange(
                            monitor.checkInterval,
                            10_000,
                            300_000
                        )
                    )
                        return false;

                    // URL validation
                    if (monitor.url && !validateUrl(monitor.url)) return false;

                    return true;
                });
            },
            {
                time: 2000,
                iterations: 200,
            }
        );

        bench(
            "validate complex nested objects",
            () => {
                complexObjects.slice(0, 50).every((obj) => {
                    // Check structure exists
                    if (!obj.nested?.level1?.level2?.level3?.data) return false;

                    // Validate nested arrays
                    if (!Array.isArray(obj.nested.level1.level2.level3.data))
                        return false;
                    if (!Array.isArray(obj.arrays?.numbers)) return false;
                    if (!Array.isArray(obj.arrays?.strings)) return false;

                    // Validate data types in arrays
                    const numbersValid = obj.arrays.numbers.every(
                        (n: any) => typeof n === "number"
                    );
                    const stringsValid = obj.arrays.strings.every(
                        (s: any) => typeof s === "string"
                    );

                    return numbersValid && stringsValid;
                });
            },
            {
                time: 3000,
                iterations: 50,
            }
        );
    });

    describe("Error Recovery Benchmarks", () => {
        bench(
            "recover from validation errors",
            () => {
                invalidData.forEach((item) => {
                    try {
                        validateSchema(item, siteSchema);
                    } catch {
                        // Error recovery logic
                        const fallback = {
                            identifier: item.id || "unknown",
                            name:
                                typeof item.name === "string"
                                    ? item.name
                                    : "Unnamed",
                            monitoring: Boolean(item.monitoring),
                            monitors: Array.isArray(item.monitors)
                                ? item.monitors
                                : [],
                        };
                        validateSchema(fallback, siteSchema);
                    }
                });
            },
            {
                time: 1000,
                iterations: 500,
            }
        );

        bench(
            "handle JSON parsing failures gracefully",
            () => {
                malformedJson.forEach((json) => {
                    const result = parseAndValidateJson(json);
                    if (!result.valid) {
                        // Fallback parsing strategies
                        try {
                            // Try to extract partial data
                            const partial = `${json.slice(0, Math.max(0, json.indexOf("{") + 1))}}`;
                            parseAndValidateJson(partial);
                        } catch {
                            // Final fallback
                            parseAndValidateJson("{}");
                        }
                    }
                });
            },
            {
                time: 1000,
                iterations: 1000,
            }
        );
    });
});
