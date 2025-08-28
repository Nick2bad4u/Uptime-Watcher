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
import type { UnknownRecord } from "type-fest";
import * as jsonSafetyModule from "@shared/utils/jsonSafety";

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
            const validJson = '{"key": "value"}';
            const parseResult = jsonSafetyModule.safeJsonParse(
                validJson,
                isRecord
            );
            expect(parseResult.success).toBe(true);
            expect(parseResult.data).toEqual({ key: "value" });

            const invalidJson = "invalid json";
            const failResult = jsonSafetyModule.safeJsonParse(
                invalidJson,
                isRecord
            );
            expect(failResult.success).toBe(false);

            // Test safeJsonParseArray function
            const validArrayJson = "[1, 2, 3]";
            const arrayResult = jsonSafetyModule.safeJsonParseArray(
                validArrayJson,
                (item): item is number => typeof item === "number"
            );
            expect(arrayResult.success).toBe(true);
            expect(arrayResult.data).toEqual([
                1,
                2,
                3,
            ]);

            const invalidArrayJson = '{"not": "array"}';
            const arrayFailResult = jsonSafetyModule.safeJsonParseArray(
                invalidArrayJson,
                isArray
            );
            expect(arrayFailResult.success).toBe(false);

            // Test safeJsonParseWithFallback function
            const fallbackResult = jsonSafetyModule.safeJsonParseWithFallback(
                validJson,
                isRecord,
                { default: true }
            );
            expect(fallbackResult).toEqual({ key: "value" });

            const fallbackFailResult =
                jsonSafetyModule.safeJsonParseWithFallback(
                    invalidJson,
                    isRecord,
                    { default: true }
                );
            expect(fallbackFailResult).toEqual({ default: true });

            // Test safeJsonStringify function
            const stringifyResult = jsonSafetyModule.safeJsonStringify({
                key: "value",
            });
            expect(stringifyResult.success).toBe(true);
            expect(stringifyResult.data).toBe('{"key":"value"}');

            // Test with circular reference
            const circular: any = { a: 1 };
            circular.self = circular;
            const circularResult = jsonSafetyModule.safeJsonStringify(circular);
            expect(circularResult.success).toBe(false);

            // Test safeJsonStringifyWithFallback function
            const fallbackStringifyResult =
                jsonSafetyModule.safeJsonStringifyWithFallback(
                    { key: "value" },
                    "{}"
                );
            expect(fallbackStringifyResult).toBe('{"key":"value"}');

            const fallbackStringifyFailResult =
                jsonSafetyModule.safeJsonStringifyWithFallback(circular, "{}");
            expect(fallbackStringifyFailResult).toBe("{}");
        });
    });
});
