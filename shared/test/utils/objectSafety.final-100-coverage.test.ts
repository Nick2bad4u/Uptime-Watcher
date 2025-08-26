/**
 * Final coverage test for objectSafety.ts to reach 100% coverage Specifically
 * targeting line 142 (symbol properties handling)
 */

import { describe, it, expect } from "vitest";
import { safeObjectOmit } from "../../utils/objectSafety";

describe("Object Safety - Final 100% Coverage", () => {
    describe("Targeting Line 142 (symbol properties omitting)", () => {
        it("should handle omitting symbol properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety.final-100-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const testSymbol = Symbol("test");
            const omitSymbol = Symbol("omit");

            const testObject = {
                regularProp: "value",
                [testSymbol]: "symbol value",
                [omitSymbol]: "omit this",
            };

            // Test omitting a symbol property - this should hit line 142
            const result = safeObjectOmit(testObject, [omitSymbol]);

            // Should have the regular prop and testSymbol but not omitSymbol
            expect(result.regularProp).toBe("value");
            expect(result[testSymbol]).toBe("symbol value");
            expect((result as any)[omitSymbol]).toBeUndefined();
        });

        it("should handle omitting multiple symbol properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety.final-100-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const testSymbol1 = Symbol("test1");
            const testSymbol2 = Symbol("test2");
            const keepSymbol = Symbol("keep");

            const testObject = {
                regularProp: "value",
                [testSymbol1]: "symbol value 1",
                [testSymbol2]: "symbol value 2",
                [keepSymbol]: "keep this",
            };

            // Omit multiple symbol properties
            const result = safeObjectOmit(testObject, [
                testSymbol1,
                testSymbol2,
            ]);

            // Should have regularProp and keepSymbol
            expect(result.regularProp).toBe("value");
            expect(result[keepSymbol]).toBe("keep this");
            expect((result as any)[testSymbol1]).toBeUndefined();
            expect((result as any)[testSymbol2]).toBeUndefined();
        });

        it("should handle objects with symbol properties when none are omitted", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety.final-100-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const testSymbol = Symbol("test");

            const testObject = {
                regularProp: "value",
                [testSymbol]: "symbol value",
            };

            // Don't omit any properties
            const result = safeObjectOmit(testObject, []);

            // Should see both the regular property and the symbol property
            expect((result as any).regularProp).toBe("value");
            expect((result as any)[testSymbol]).toBe("symbol value");
        });

        it("should handle edge case with symbol property names and ensure line 142 coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety.final-100-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const symbol1 = Symbol("first");
            const symbol2 = Symbol("second");
            const symbol3 = Symbol("third");

            const obj = {
                normal: "value",
                [symbol1]: "first value",
                [symbol2]: "second value",
                [symbol3]: "third value",
            };

            // Only omit symbol2 - this ensures line 142 is tested with the condition
            const result = safeObjectOmit(obj, [symbol2]);

            // Should have normal, symbol1, symbol3 but not symbol2
            expect(result.normal).toBe("value");
            expect(result[symbol1]).toBe("first value");
            expect(result[symbol3]).toBe("third value");
            expect((result as any)[symbol2]).toBeUndefined();
        });

        it("should ensure both branches of line 142 are covered", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: objectSafety.final-100-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const includeSymbol = Symbol("include");
            const omitSymbol = Symbol("omit");

            const testObject = {
                [includeSymbol]: "should be included",
                [omitSymbol]: "should be omitted",
            };

            const result = safeObjectOmit(testObject, [omitSymbol]);

            // This test specifically ensures that:
            // 1. The if condition on line 142 evaluates to false for omitSymbol (symbol is in keysToOmit)
            // 2. The if condition on line 142 evaluates to true for includeSymbol (symbol is NOT in keysToOmit)
            expect(result[includeSymbol]).toBe("should be included");
            expect((result as any)[omitSymbol]).toBeUndefined();
        });
    });
});
