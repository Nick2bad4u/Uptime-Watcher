/**
 * @file Complete Function Coverage Tests for stringConversion.ts
 *
 *   This test ensures 100% function coverage for the stringConversion module
 *   using the proven Function Coverage Validation pattern with namespace
 *   imports and systematic function calls.
 */

import { describe, expect, it } from "vitest";
import * as stringConversionModule from "@shared/utils/stringConversion";

describe("StringConversion - Complete Function Coverage", () => {
    describe("Function Coverage Validation", () => {
        it("should call every exported function for complete coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: stringConversion-complete-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Verify the module exports we expect
            expect(typeof stringConversionModule).toBe("object");
            expect(stringConversionModule).toBeDefined();

            // Test safeStringify function - the only export
            expect(typeof stringConversionModule.safeStringify).toBe(
                "function"
            );

            // Test all branches of the switch statement to achieve 100% coverage

            // Test null and undefined cases
            expect(stringConversionModule.safeStringify(null)).toBe("");
            expect(stringConversionModule.safeStringify(undefined)).toBe("");

            // Test string case
            expect(stringConversionModule.safeStringify("")).toBe("");
            expect(stringConversionModule.safeStringify("hello")).toBe("hello");
            expect(stringConversionModule.safeStringify("test string")).toBe(
                "test string"
            );

            // Test number case
            expect(stringConversionModule.safeStringify(0)).toBe("0");
            expect(stringConversionModule.safeStringify(123)).toBe("123");
            expect(stringConversionModule.safeStringify(-456)).toBe("-456");
            expect(stringConversionModule.safeStringify(3.14)).toBe("3.14");
            expect(stringConversionModule.safeStringify(Number.NaN)).toBe(
                "NaN"
            );
            expect(stringConversionModule.safeStringify(Infinity)).toBe(
                "Infinity"
            );
            expect(stringConversionModule.safeStringify(-Infinity)).toBe(
                "-Infinity"
            );

            // Test boolean case
            expect(stringConversionModule.safeStringify(true)).toBe("true");
            expect(stringConversionModule.safeStringify(false)).toBe("false");

            // Test bigint case
            expect(stringConversionModule.safeStringify(BigInt(123))).toBe(
                "123"
            );
            expect(stringConversionModule.safeStringify(BigInt(0))).toBe("0");
            expect(stringConversionModule.safeStringify(BigInt(-456))).toBe(
                "-456"
            );

            // Test function case
            const testFunction = () => "test";
            const namedFunction = function namedFn() {
                return "named";
            };
            const arrowFunction = (x: number) => x * 2;
            expect(stringConversionModule.safeStringify(testFunction)).toBe(
                "[Function]"
            );
            expect(stringConversionModule.safeStringify(namedFunction)).toBe(
                "[Function]"
            );
            expect(stringConversionModule.safeStringify(arrowFunction)).toBe(
                "[Function]"
            );

            // Test symbol case
            const symbol1 = Symbol();
            const symbol2 = Symbol("test");
            const symbol3 = Symbol.for("global");
            expect(stringConversionModule.safeStringify(symbol1)).toBe(
                "Symbol()"
            );
            expect(stringConversionModule.safeStringify(symbol2)).toBe(
                "Symbol(test)"
            );
            expect(stringConversionModule.safeStringify(symbol3)).toBe(
                "Symbol(global)"
            );

            // Test object case (using safeJsonStringifyWithFallback)
            expect(stringConversionModule.safeStringify({})).toBe("{}");
            expect(stringConversionModule.safeStringify({ key: "value" })).toBe(
                '{"key":"value"}'
            );
            expect(stringConversionModule.safeStringify({ a: 1, b: 2 })).toBe(
                '{"a":1,"b":2}'
            );
            expect(stringConversionModule.safeStringify([])).toBe("[]");
            expect(
                stringConversionModule.safeStringify([
                    1,
                    2,
                    3,
                ])
            ).toBe("[1,2,3]");
            expect(
                stringConversionModule.safeStringify([{ a: 1 }, { b: 2 }])
            ).toBe('[{"a":1},{"b":2}]');

            // Test circular references (should fallback to "[Complex Object]")
            const circular: any = { name: "test" };
            circular.self = circular;
            expect(stringConversionModule.safeStringify(circular)).toBe(
                "[Complex Object]"
            );

            // Test Date objects
            const date = new Date("2023-01-01T00:00:00.000Z");
            const dateResult = stringConversionModule.safeStringify(date);
            expect(dateResult).toContain("2023-01-01T00:00:00.000Z");

            // Test other objects that should serialize
            const regex = /test/gi;
            const regexResult = stringConversionModule.safeStringify(regex);
            expect(regexResult).toBeTruthy();
            expect(typeof regexResult).toBe("string");
        });

        it("should handle complex objects and edge cases", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: stringConversion-complete-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test complex objects that might fail serialization
            const complexObject = {
                func: () => "test",
                symbol: Symbol("test"),
                date: new Date(),
                nested: {
                    deep: {
                        value: "test",
                    },
                },
            };
            const complexResult =
                stringConversionModule.safeStringify(complexObject);
            expect(typeof complexResult).toBe("string");
            // Should either be valid JSON or fallback to "[Complex Object]"
            expect(
                complexResult === "[Complex Object]" ||
                    complexResult.startsWith("{")
            ).toBe(true);

            // Test various object types
            const map = new Map([["key", "value"]]);
            const set = new Set([
                1,
                2,
                3,
            ]);
            const buffer = new ArrayBuffer(8);
            const uint8Array = new Uint8Array([
                1,
                2,
                3,
                4,
            ]);
            const promise = Promise.resolve("test");
            const error = new Error("test error");

            expect(typeof stringConversionModule.safeStringify(map)).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify(set)).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify(buffer)).toBe(
                "string"
            );
            expect(
                typeof stringConversionModule.safeStringify(uint8Array)
            ).toBe("string");
            expect(typeof stringConversionModule.safeStringify(promise)).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify(error)).toBe(
                "string"
            );
        });

        it("should be consistent and deterministic", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: stringConversion-complete-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test that the function always returns a string
            const testValues = [
                null,
                undefined,
                "",
                "test",
                0,
                123,
                true,
                false,
                BigInt(456),
                Symbol("test"),
                {},
                { key: "value" },
                [],
                [
                    1,
                    2,
                    3,
                ],
                new Date(),
                /regex/,
                () => {},
                new Error(),
            ];

            for (const value of testValues) {
                const result = stringConversionModule.safeStringify(value);
                expect(typeof result).toBe("string");
                expect(result).toBeDefined();

                // Test consistency - same input should produce same output
                const result2 = stringConversionModule.safeStringify(value);
                expect(result).toBe(result2);
            }
        });

        it("should cover all switch case branches", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: stringConversion-complete-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test to ensure all typeof cases are covered for 100% branch coverage

            // The switch statement has these cases:
            // - null/undefined (handled early)
            // - bigint
            // - boolean
            // - function
            // - number
            // - object
            // - string
            // - symbol
            // - undefined (redundant with early check)
            // - default

            // All these are already tested above, but let's be explicit for coverage
            expect(typeof stringConversionModule.safeStringify(BigInt(1))).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify(true)).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify(() => {})).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify(42)).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify({})).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify("test")).toBe(
                "string"
            );
            expect(typeof stringConversionModule.safeStringify(Symbol())).toBe(
                "string"
            );

            // The default case should theoretically never be reached with current JS types
            // but it's there for safety and future-proofing
        });
    });
});
