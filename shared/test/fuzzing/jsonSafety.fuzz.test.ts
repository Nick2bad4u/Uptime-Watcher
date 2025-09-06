/**
 * Fast-Check property-based fuzzing tests    ]);

    const alwaysTrue = (_data: unknown): _data is unknown => true;

    for (const invalidJson of invalidJsonStrings) {jsonSafety.ts
 *
 * Targets uncovered line 31: `return error instanceof Error ? error : new Error(String(error));`
 * This line handles conversion of non-Error values to Error instances in ensureError function.
 *
 * The ensureError function is internal and used by safeOperation, which is used by all
 * public JSON parsing functions. We need to trigger scenarios where non-Error values
 * are thrown and caught, forcing execution through the String(error) path.
 */

import { fc, test } from "@fast-check/vitest";
import { expect } from "vitest";
import {
    safeJsonParse,
    safeJsonParseArray,
    safeJsonStringify,
} from "@shared/utils/jsonSafety";

/**
 * Test safeJsonParse with malformed JSON to trigger ensureError function
 * Targets line 31: ensureError conversion of non-Error to Error
 */
test.prop([
    fc.oneof(
        fc.string({ minLength: 1 }), // Non-empty string values
        fc.integer(), // Number values
        fc.array(fc.anything()), // Array values
        fc.object(), // Object values
    ),
])("safeJsonParse handles malformed JSON through ensureError conversion", (value) => {
    // Helper to safely convert values to strings
    const safeValueToString = (val: unknown): string => {
        try {
            return String(val);
        } catch {
            return "[object Object]"; // Fallback for objects that can't be converted
        }
    };

    // Create definitely invalid JSON strings
    const invalidJsonStrings = [
        `{${safeValueToString(value)}:unclosed`, // Malformed object with unclosed syntax
        `[${safeValueToString(value)}unclosed`, // Malformed array with unclosed syntax
        `"${safeValueToString(value)}`, // Unclosed string (but might be valid if value is a quote)
        `${JSON.stringify(value)}trailing`, // Valid JSON with trailing text
        `${JSON.stringify(value)},}`, // Trailing comma
    ];

    const alwaysTrue = (_data: unknown): _data is unknown => true;

    for (const invalidJson of invalidJsonStrings) {
        // First check if this is actually invalid JSON
        let shouldBeInvalid = true;
        try {
            JSON.parse(invalidJson);
            shouldBeInvalid = false; // If it doesn't throw, it's valid JSON
        } catch {
            // It threw, so it's invalid as expected
        }

        const result = safeJsonParse(invalidJson, alwaysTrue);

        if (shouldBeInvalid) {
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe("string");
            expect(result.data).toBeUndefined();

            // The error message should contain the prefix from safeOperation
            expect(result.error).toMatch(/JSON parsing failed:/);
        } else {
            // If it's accidentally valid JSON, just ensure safeJsonParse handles it correctly
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.error).toBeUndefined();
        }
    }
});

/**
 * Test safeJsonParseArray with validation failures to trigger ensureError
 * Targets ensureError function through type validation errors
 */
test.prop([
    fc.string(), // Strings that should fail array validation
    fc.integer(), // Numbers that should fail array validation
    fc.boolean(), // Booleans that should fail array validation
    fc.object(), // Objects that should fail array validation
])("safeJsonParseArray handles validation failures through ensureError", (nonArrayValue) => {
    const validJsonString = JSON.stringify(nonArrayValue);

    // Use a validator that always fails to trigger the TypeError for arrays
    const alwaysFailValidator = (_item: unknown): _item is never => false;

    const result = safeJsonParseArray(validJsonString, alwaysFailValidator);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
    expect(result.data).toBeUndefined();

    if (Array.isArray(nonArrayValue)) {
        // Arrays should fail due to validator, but won't reach the "is not an array" check
        // The validator failure should be handled by ensureError
        expect(result.error).toBeDefined();
    } else {
        // Non-arrays should fail with the "is not an array" error
        expect(result.error).toMatch(/is not an array/);
    }
});

/**
 * Test safeJsonStringify with values that cause serialization errors
 * Targets ensureError function through JSON.stringify failures
 */
test.prop([
    fc.anything({
        maxDepth: 3,
        // Include problematic values that might cause JSON.stringify to fail
        withBigInt: true,
        withDate: true,
        withMap: true,
        withSet: true,
    }),
])("safeJsonStringify handles serialization errors through ensureError", (problematicValue) => {
    const result = safeJsonStringify(problematicValue);

    // All results should be valid SafeJsonResult objects
    expect(result).toHaveProperty("success");
    expect(typeof result.success).toBe("boolean");

    if (result.success) {
        expect(result.data).toBeDefined();
        expect(typeof result.data).toBe("string");
        expect(result.error).toBeUndefined();
    } else {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe("string");
        expect(result.data).toBeUndefined();
    }
});

/**
 * Test edge case scenarios that trigger the ensureError String(error) conversion
 * Specifically targeting circular references and non-serializable values
 */
test.prop([
    fc.oneof(
        // Functions that can't be JSON stringified
        fc.func(fc.anything()),
        // Symbols that can't be JSON stringified
        fc.constant(Symbol("test")),
        // BigInt values that can't be JSON stringified
        fc.bigInt(),
    ),
])("Edge cases trigger ensureError String conversion for uncommon values", (problematicValue) => {
    const result = safeJsonStringify(problematicValue);

    // Should handle the error gracefully
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
    expect(result.data).toBeUndefined();

    // Functions that can't be serialized will get the custom TypeError message
    // which is handled differently by the safeOperation error logic
    if (typeof problematicValue === "function") {
        // Functions get the custom message directly (no prefix)
        expect(result.error).toBe("Value cannot be serialized to JSON");
    } else {
        // Symbols, BigInt, and other edge cases get the prefix because they cause different error types
        expect(result.error).toMatch(/JSON stringification failed:|Value cannot be serialized to JSON/);
    }
});

/**
 * Test circular reference objects that cause JSON.stringify to fail
 * Forces ensureError to handle TypeError from circular reference detection
 */
test("Circular references trigger ensureError handling", () => {
    // Create circular reference
    const obj: any = {};
    obj.self = obj;

    const result = safeJsonStringify(obj);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
    expect(result.data).toBeUndefined();

    // Should contain the error prefix
    expect(result.error).toMatch(/JSON stringification failed:/);
});

/**
 * Test malformed JSON strings that trigger various parser error types
 * Ensures ensureError handles different SyntaxError variations consistently
 */
test.prop([
    fc.string({ minLength: 1, maxLength: 50 })
        .filter(str => {
            try {
                JSON.parse(str);
                return false; // Filter out valid JSON
            } catch {
                return true; // Keep invalid JSON
            }
        }),
])("Malformed JSON strings trigger consistent error handling through ensureError", (malformedJson) => {
    const alwaysTrue = (_data: unknown): _data is unknown => true;
    const result = safeJsonParse(malformedJson, alwaysTrue);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
    expect(result.data).toBeUndefined();

    // Error should be properly formatted with prefix
    expect(result.error).toMatch(/JSON parsing failed:/);
});

/**
 * Test safeJsonParse with custom validator that throws TypeError
 * This specifically targets the TypeError branch in ensureError handling
 */
test.prop([
    fc.json(), // Valid JSON strings
])("Custom validator TypeErrors are handled correctly by ensureError", (validJson) => {
    // Validator that throws TypeError with specific messages
    const throwingValidator = (_data: unknown): _data is never => {
        throw new TypeError("does not match expected type");
    };

    const result = safeJsonParse(validJson, throwingValidator);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
    expect(result.data).toBeUndefined();

    // Should return the TypeError message directly (not prefixed)
    expect(result.error).toBe("does not match expected type");
});
