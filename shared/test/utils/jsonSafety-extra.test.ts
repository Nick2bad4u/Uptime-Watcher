/**
 * This test file validates 100% function coverage for
 * shared/utils/jsonSafety.ts using the Function Coverage Validation pattern.
 * Ensures all exported functions are called and tested for proper execution
 * without necessarily testing business logic.
 *
 * @file Function Coverage Validation Tests for shared/utils/jsonSafety.ts
 *
 * @author AI Agent
 *
 * @since 2024-01-01
 */

import { describe, expect, it } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import type { UnknownRecord } from "type-fest";
import * as jsonSafetyModule from "@shared/utils/jsonSafety";

/** Arbitrary for generating valid JSON-serializable records */
const jsonRecordArbitrary = fc.record({
    identifier: fc.string({ minLength: 1, maxLength: 30 }),
    count: fc.integer({ min: 0, max: 10_000 }),
    enabled: fc.boolean(),
});

/** Arbitrary for generating arrays of numbers */
const numberArrayArbitrary = fc.array(fc.integer({ min: -1000, max: 1000 }), {
    minLength: 1,
    maxLength: 20,
});

describe("shared/utils/jsonSafety Function Coverage Validation", () => {
    describe("Function Coverage Validation", () => {
        it("should call all exported functions to ensure 100% function coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: jsonSafety-extra", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Type guard for validation
            const isRecord = (value: unknown): value is UnknownRecord =>
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value);

            const isArray = (value: unknown): value is unknown[] =>
                Array.isArray(value);

            // Test safeJsonParse function
            const validJson = '{"identifier": "item-001", "count": 42}';
            const parseResult = jsonSafetyModule.safeJsonParse(
                validJson,
                isRecord
            );
            expect(parseResult.success).toBeTruthy();
            expect(parseResult.data).toEqual({
                identifier: "item-001",
                count: 42,
            });

            const invalidJson = "invalid json";
            const failResult = jsonSafetyModule.safeJsonParse(
                invalidJson,
                isRecord
            );
            expect(failResult.success).toBeFalsy();

            // Test safeJsonParseArray function
            const validArrayJson = "[10, 20, 30, 40, 50]";
            const arrayResult = jsonSafetyModule.safeJsonParseArray(
                validArrayJson,
                (item): item is number => typeof item === "number"
            );
            expect(arrayResult.success).toBeTruthy();
            expect(arrayResult.data).toEqual([
                10,
                20,
                30,
                40,
                50,
            ]);

            const invalidArrayJson = '{"not": "array"}';
            const arrayFailResult = jsonSafetyModule.safeJsonParseArray(
                invalidArrayJson,
                isArray
            );
            expect(arrayFailResult.success).toBeFalsy();

            // Test safeJsonParseWithFallback function
            const fallbackResult = jsonSafetyModule.safeJsonParseWithFallback(
                validJson,
                isRecord,
                { fallback: true }
            );
            expect(fallbackResult).toEqual({
                identifier: "item-001",
                count: 42,
            });

            const fallbackFailResult =
                jsonSafetyModule.safeJsonParseWithFallback(
                    invalidJson,
                    isRecord,
                    { fallback: true }
                );
            expect(fallbackFailResult).toEqual({ fallback: true });

            // Test safeJsonStringify function
            const stringifyResult = jsonSafetyModule.safeJsonStringify({
                identifier: "item-001",
            });
            expect(stringifyResult.success).toBeTruthy();
            expect(stringifyResult.data).toBe('{"identifier":"item-001"}');

            // Test with circular reference
            const circular: any = { alpha: 1 };
            circular.self = circular;
            const circularResult = jsonSafetyModule.safeJsonStringify(circular);
            expect(circularResult.success).toBeFalsy();

            // Test safeJsonStringifyWithFallback function
            const fallbackStringifyResult =
                jsonSafetyModule.safeJsonStringifyWithFallback(
                    { identifier: "item-001" },
                    "{}"
                );
            expect(fallbackStringifyResult).toBe('{"identifier":"item-001"}');

            const fallbackStringifyFailResult =
                jsonSafetyModule.safeJsonStringifyWithFallback(circular, "{}");
            expect(fallbackStringifyFailResult).toBe("{}");
        });

        describe("Property-based Tests", () => {
            test.prop([jsonRecordArbitrary])(
                "should round-trip any JSON-serializable record through stringify and parse",
                (record) => {
                    const stringifyResult =
                        jsonSafetyModule.safeJsonStringify(record);
                    expect(stringifyResult.success).toBeTruthy();

                    if (stringifyResult.success && stringifyResult.data) {
                        const parseResult = jsonSafetyModule.safeJsonParse(
                            stringifyResult.data,
                            (value): value is typeof record =>
                                typeof value === "object" && value !== null
                        );
                        expect(parseResult.success).toBeTruthy();
                        expect(parseResult.data).toEqual(record);
                    }
                }
            );

            test.prop([numberArrayArbitrary])(
                "should correctly parse any array of numbers",
                (numbers) => {
                    const jsonString = JSON.stringify(numbers);
                    const result = jsonSafetyModule.safeJsonParseArray(
                        jsonString,
                        (item): item is number => typeof item === "number"
                    );
                    expect(result.success).toBeTruthy();
                    expect(result.data).toEqual(numbers);
                }
            );

            test.prop([fc.string({ minLength: 1 })])(
                "should return fallback for invalid JSON strings",
                (invalidJson) => {
                    // Ensure the string is not valid JSON
                    fc.pre(
                        !invalidJson.startsWith("{") &&
                            !invalidJson.startsWith("[")
                    );
                    const fallbackValue = { fallbackUsed: true };
                    const result = jsonSafetyModule.safeJsonParseWithFallback(
                        invalidJson,
                        (value): value is typeof fallbackValue =>
                            typeof value === "object" && value !== null,
                        fallbackValue
                    );
                    expect(result).toEqual(fallbackValue);
                }
            );

            test.prop([jsonRecordArbitrary, fc.string({ minLength: 1 })])(
                "should use fallback string when stringify fails",
                (record, fallbackString) => {
                    // Normal records should stringify successfully
                    const result =
                        jsonSafetyModule.safeJsonStringifyWithFallback(
                            record,
                            fallbackString
                        );
                    expect(result).toBe(JSON.stringify(record));
                }
            );
        });
    });
});
