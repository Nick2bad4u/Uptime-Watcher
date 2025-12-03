/**
 * @module shared/test/fuzzing/schemas
 *
 * @file Fast-Check fuzzing tests for validation schemas targeting uncovered
 *   lines
 */

import { describe, expect, it } from "vitest";
import { fc, test } from "@fast-check/vitest";
import {
    validateMonitorData,
    validateMonitorField,
} from "@shared/validation/monitorSchemas";
import { validateSiteData } from "@shared/validation/siteSchemas";

describe("Schemas Fuzzing - Lines 404,488", () => {
    describe("validateMonitorField - Line 404 Unknown field error", () => {
        test.prop([fc.string(), fc.anything()])(
            "should throw Unknown field error for unknown fields",
            (fieldName, value) => {
                // Target line 404: Unknown field error
                if (
                    ![
                        "name",
                        "type",
                        "interval",
                        "timeout",
                        "retries",
                        "url",
                        "port",
                        "host",
                        "method",
                        "headers",
                        "body",
                        "followRedirects",
                        "maxRedirects",
                        "validateSSL",
                    ].includes(fieldName)
                ) {
                    expect(() =>
                        validateMonitorField("http", fieldName, value)
                    ).toThrowError(/Unknown field/);
                }
            }
        );

        it("should trigger unknown field error for completely invalid fields", () => {
            // Directly target line 404
            expect(() =>
                validateMonitorField("http", "totallyInvalidFieldName", "value")
            ).toThrowError("Unknown field: totallyInvalidFieldName");
        });
    });

    describe("validateMonitorData - Line 488 Error categorization", () => {
        test.prop([
            fc.record({
                type: fc.constantFrom("http", "port"),
                name: fc.oneof(fc.string(), fc.constantFrom(undefined)),
                requiredField: fc.constantFrom(undefined),
            }),
        ])("should categorize validation errors correctly", (data) => {
            // Target line 488: error categorization in catch block
            const result = validateMonitorData(data.type, data);

            // Should always return a result structure
            expect(result).toHaveProperty("errors");
            expect(result).toHaveProperty("warnings");
            expect(result).toHaveProperty("metadata");
        });

        it("should handle ZodError categorization", () => {
            // Force validation errors to trigger line 488
            const invalidData = {
                type: "http",
                name: null, // Invalid name
                url: "not-a-url", // Invalid URL
                interval: "not-a-number", // Invalid interval
            };

            const result = validateMonitorData("http", invalidData);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe("Edge cases for comprehensive coverage", () => {
        test.prop([fc.anything()])(
            "should handle any input without crashing",
            (input) => {
                // Test robustness
                expect(() => {
                    const result = validateSiteData(input);
                    expect(result).toBeDefined();
                }).not.toThrowError();

                expect(() => {
                    const result = validateMonitorData("http", input);
                    expect(result).toBeDefined();
                }).not.toThrowError();
            }
        );
    });
});
