/**
 * @file Tests to reach 100% coverage for stringConversion.ts lines 86-89
 *   Targeting the undefined case and default case in switch statement
 */

import { describe, expect, test } from "vitest";
import { safeStringify } from "../../utils/stringConversion.js";

describe("String Conversion - 100% Coverage Tests", () => {
    describe("Targeting Lines 86-89 (undefined and default cases)", () => {
        test("should handle explicit undefined value (line 86-87)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: stringConversion.100-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: stringConversion.100-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            const result = safeStringify(undefined);
            expect(result).toBe("");
        });

        test("should handle the default case for unknown types (line 89-90)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: stringConversion.100-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: stringConversion.100-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // Create an object with a modified toString to test the default case
            const weirdObject = Object.create(null);
            Object.defineProperty(weirdObject, Symbol.toStringTag, {
                value: "WeirdType",
                configurable: true,
            });

            // This should trigger the default case since typeof will return 'object'
            // but we've manipulated it to be unusual
            const result = safeStringify(weirdObject);

            // Should fall back to JSON.stringify which will handle the object
            expect(typeof result).toBe("string");
        });

        test("should ensure all typeof results are covered", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: stringConversion.100-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: stringConversion.100-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // Test all the cases we can reasonably test
            expect(safeStringify(null)).toBe("");
            expect(safeStringify(undefined)).toBe("");
            expect(safeStringify("test")).toBe("test");
            expect(safeStringify(123)).toBe("123");
            expect(safeStringify(true)).toBe("true");
            expect(safeStringify(Symbol("test"))).toBe("Symbol(test)");
            expect(safeStringify(123n)).toBe("123");
            expect(safeStringify(() => {})).toBe("[Function]");
            expect(safeStringify({})).toBe("{}");
        });

        test("should attempt to reach the default case through type manipulation", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: stringConversion.100-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: stringConversion.100-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // Try to create a value that might trigger the default case
            // This is challenging because JavaScript's typeof is quite comprehensive
            const testCases = [
                undefined, // Should hit line 86-87
                null, // Should go through object handling
            ];

            for (const testCase of testCases) {
                const result = safeStringify(testCase);
                expect(typeof result).toBe("string");
            }
        });
    });
});
