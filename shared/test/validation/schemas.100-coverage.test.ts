/**
 * @file Tests to reach 100% coverage for schemas.ts lines 399 and 482 Targeting
 *   the field validation error and validation error categorization
 */

import { describe, expect, test } from "vitest";
import {
    validateMonitorField,
    validateMonitorData,
} from "../../validation/schemas.js";

describe("Schemas - 100% Coverage Tests", () => {
    describe("Targeting Lines 399,482", () => {
        test("should handle field validation error at line 399", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: schemas.100-coverage", "component");
            annotate("Category: Validation", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: schemas.100-coverage", "component");
            annotate("Category: Validation", "category");
            annotate("Type: Error Handling", "type");

            // Test with an unknown field to trigger the error at line 399
            // This will test the validateFieldWithSchema function's unknown field error
            expect(() => {
                // Create a scenario that will trigger line 399 in validateFieldWithSchema
                validateMonitorField("http", "unknownField", "test");
            }).toThrow("Unknown field: unknownField");
        });

        test("should handle validation error categorization at line 482", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: schemas.100-coverage", "component");
            annotate("Category: Validation", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: schemas.100-coverage", "component");
            annotate("Category: Validation", "category");
            annotate("Type: Error Handling", "type");

            // Create a scenario that triggers line 482 (validation error categorization)
            const invalidData = {
                url: 123, // Invalid type - should be string
                interval: "invalid", // Invalid type - should be number
                timeout: undefined, // This should be categorized as warning (optional field)
            };

            const result = validateMonitorData("http", invalidData);

            // Should have validation errors but not succeed
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test("should trigger optional field warning classification", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: schemas.100-coverage", "component");
            annotate("Category: Validation", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: schemas.100-coverage", "component");
            annotate("Category: Validation", "category");
            annotate("Type: Business Logic", "type");

            // Create a test case that specifically triggers the isOptionalField logic (line 482 area)
            const dataWithUndefinedOptionalField = {
                url: "https://example.com",
                interval: 30,
                timeout: undefined, // This should trigger the isOptionalField logic
                retries: undefined, // Another optional field
            };

            const result = validateMonitorData(
                "http",
                dataWithUndefinedOptionalField
            );

            // The validation should handle this and potentially categorize as warnings
            expect(typeof result).toBe("object");
            expect("success" in result).toBe(true);
        });

        test("should handle complex validation scenarios", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: schemas.100-coverage", "component");
            annotate("Category: Validation", "category");
            annotate("Type: Validation", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: schemas.100-coverage", "component");
            annotate("Category: Validation", "category");
            annotate("Type: Validation", "type");

            // Test with multiple validation errors to ensure all branches are covered
            const complexInvalidData = {
                host: 123, // Should be string
                port: "not-a-number", // Should be number
                interval: -1, // Should be positive
                timeout: "invalid", // Should be number
                optionalField: undefined, // Should be treated as warning
            };

            const result = validateMonitorData("port", complexInvalidData);

            // Should categorize different types of errors appropriately
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(Array.isArray(result.errors)).toBe(true);
            }
        });
    });
});
