import { safeObjectOmit } from "../../utils/objectSafety";

describe("ObjectSafety - Missing Coverage", () => {
    describe("safeObjectOmit null/undefined handling", () => {
        test("should handle null object input (lines 125-126)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // This should hit lines 125-126 where we handle null objects
            // Need to bypass TypeScript checking to test the runtime null check
            const result = safeObjectOmit(null as any, ["someKey"]);
            expect(result).toEqual({});
        });

        test("should handle undefined object input (lines 125-126)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // This should hit lines 125-126 where we handle undefined objects
            // Need to bypass TypeScript checking to test the runtime undefined check
            const result = safeObjectOmit(undefined as any, ["someKey"]);
            expect(result).toEqual({});
        });

        test("should handle various falsy and edge case inputs", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // Test different edge cases that might hit the uncovered lines

            // Null input - this tests the defensive null check
            expect(safeObjectOmit(null as any, [])).toEqual({});
            expect(safeObjectOmit(null as any, ["a", "b"])).toEqual({});

            // Undefined input - this tests the defensive undefined check
            expect(safeObjectOmit(undefined as any, [])).toEqual({});
            expect(safeObjectOmit(undefined as any, ["a", "b"])).toEqual({});

            // Empty keys array with null/undefined
            expect(safeObjectOmit(null as any, [] as const)).toEqual({});
            expect(safeObjectOmit(undefined as any, [] as const)).toEqual({});
        });

        test("should properly handle the null/undefined defensive check", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // Test the defensive programming check at the start of the function
            // These tests specifically target lines 125-126

            // Test with null
            const nullResult = safeObjectOmit(null as any, ["key1", "key2"]);
            expect(nullResult).toEqual({});
            expect(Object.keys(nullResult)).toHaveLength(0);

            // Test with undefined
            const undefinedResult = safeObjectOmit(undefined as any, [
                "key1",
                "key2",
            ]);
            expect(undefinedResult).toEqual({});
            expect(Object.keys(undefinedResult)).toHaveLength(0);

            // Verify return type is object
            expect(typeof nullResult).toBe("object");
            expect(typeof undefinedResult).toBe("object");
        });

        test("should handle edge cases that might bypass null/undefined check", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // Test various inputs to ensure we're hitting the right code paths

            // These should NOT hit the null/undefined branch
            const testCases = [
                { input: {}, keys: ["a"] },
                { input: { a: 1 }, keys: [] },
                { input: { a: 1, b: 2 }, keys: ["a"] },
            ];

            testCases.forEach(({ input, keys }) => {
                const result = safeObjectOmit(input as any, keys);
                expect(typeof result).toBe("object");
                expect(result).not.toBe(input); // Should be a new object
            });
        });

        test("should verify the exact conditional logic for null/undefined", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: objectSafety-missing-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            // Explicitly test the condition: obj === null || obj === undefined

            // Test null case
            const case1 = null;
            const result1 = safeObjectOmit(case1 as any, ["test"]);
            expect(result1).toEqual({});

            // Test undefined case
            const case2 = undefined;
            const result2 = safeObjectOmit(case2 as any, ["test"]);
            expect(result2).toEqual({});

            // Test combined case (shouldn't matter but tests the OR logic)
            [null, undefined].forEach((testValue) => {
                const result = safeObjectOmit(testValue as any, [
                    "a",
                    "b",
                    "c",
                ]);
                expect(result).toEqual({});
            });
        });
    });
});
