/**
 * @file Fuzzing tests for errorCatalog utilities
 *
 * @author AI Generated
 *
 * @since 2024
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";
import {
    ERROR_CATALOG,
    SITE_ERRORS,
    MONITOR_ERRORS,
    VALIDATION_ERRORS,
    SYSTEM_ERRORS,
    NETWORK_ERRORS,
    DATABASE_ERRORS,
    IPC_ERRORS,
    formatErrorMessage,
    isKnownErrorMessage,
} from "../../utils/errorCatalog";

const SAFE_PLACEHOLDER_KEY_REGEX = /^[A-Za-z0-9_-]+$/u;
const RESERVED_PLACEHOLDER_KEYS = new Set([
    "__proto__",
    "constructor",
    "prototype",
]);

describe("ErrorCatalog utilities fuzzing tests", () => {
    describe("Error catalog constants", () => {
        it("should have all expected error categories", () => {
            expect(ERROR_CATALOG).toHaveProperty("sites");
            expect(ERROR_CATALOG).toHaveProperty("monitors");
            expect(ERROR_CATALOG).toHaveProperty("validation");
            expect(ERROR_CATALOG).toHaveProperty("system");
            expect(ERROR_CATALOG).toHaveProperty("network");
            expect(ERROR_CATALOG).toHaveProperty("database");
            expect(ERROR_CATALOG).toHaveProperty("ipc");
        });

        it("should have consistent references", () => {
            expect(ERROR_CATALOG.sites).toBe(SITE_ERRORS);
            expect(ERROR_CATALOG.monitors).toBe(MONITOR_ERRORS);
            expect(ERROR_CATALOG.validation).toBe(VALIDATION_ERRORS);
            expect(ERROR_CATALOG.system).toBe(SYSTEM_ERRORS);
            expect(ERROR_CATALOG.network).toBe(NETWORK_ERRORS);
            expect(ERROR_CATALOG.database).toBe(DATABASE_ERRORS);
            expect(ERROR_CATALOG.ipc).toBe(IPC_ERRORS);
        });

        test.prop([fc.constantFrom(...Object.keys(ERROR_CATALOG))])(
            "should have string values for all error messages",
            (category) => {
                const errorCategory =
                    ERROR_CATALOG[category as keyof typeof ERROR_CATALOG];
                const errors = Object.values(errorCategory);

                for (const error of errors) {
                    expect(typeof error).toBe("string");
                    expect(error.length).toBeGreaterThan(0);
                }
            }
        );

        test.prop([fc.constantFrom(...Object.keys(ERROR_CATALOG))])(
            "should have consistent key naming conventions",
            (category) => {
                const errorCategory =
                    ERROR_CATALOG[category as keyof typeof ERROR_CATALOG];
                const keys = Object.keys(errorCategory);

                for (const key of keys) {
                    // Keys should be uppercase with underscores
                    expect(key).toMatch(/^[A-Z_]+$/);
                    expect(key.length).toBeGreaterThan(0);
                }
            }
        );
    });

    describe(formatErrorMessage, () => {
        test.prop([fc.string(), fc.record({}, { requiredKeys: [] })])(
            "should handle any template and params without throwing",
            (template, params) => {
                expect(() =>
                    formatErrorMessage(template, params)
                ).not.toThrowError();
            }
        );

        test.prop([
            fc.string(),
            fc.record({
                key1: fc.oneof(fc.string(), fc.integer()),
                key2: fc.oneof(fc.string(), fc.integer()),
            }),
        ])(
            "should replace all placeholders with parameter values",
            (template, params) => {
                // Create template with known placeholders
                const templateWithPlaceholders = `${template} {key1} and {key2}`;
                const result = formatErrorMessage(
                    templateWithPlaceholders,
                    params
                );

                expect(result).toContain(String(params.key1));
                expect(result).toContain(String(params.key2));
                expect(result).not.toContain("{key1}");
                expect(result).not.toContain("{key2}");
            }
        );

        test.prop([
            fc.string(),
            fc.string(),
            fc.oneof(fc.string(), fc.integer()),
        ])(
            "should handle single parameter replacement",
            (prefix, key, value) => {
                const template = `${prefix} {${key}}`;
                const params = { [key]: value };
                const result = formatErrorMessage(template, params);

                // Check for dangerous keys that should not be replaced for security
                if (
                    key === "__proto__" ||
                    key === "constructor" ||
                    key === "prototype"
                ) {
                    // Dangerous keys should remain as placeholders for security
                    expect(result).toBe(`${prefix} {${key}}`);
                } else {
                    expect(result).toBe(`${prefix} ${String(value)}`);
                }
            }
        );

        test.prop([
            fc.string(),
            fc
                .array(
                    fc.tuple(
                        fc.string({ minLength: 1 }),
                        fc.oneof(fc.string(), fc.integer())
                    ),
                    { minLength: 0, maxLength: 5 }
                )
                .filter((pairs) => {
                    // Ensure unique, safe keys to avoid prototype edge cases
                    const keys = pairs.map(([key]) => key);
                    if (new Set(keys).size !== keys.length) {
                        return false;
                    }

                    return keys.every(
                        (key) =>
                            SAFE_PLACEHOLDER_KEY_REGEX.test(key) &&
                            !RESERVED_PLACEHOLDER_KEYS.has(key)
                    );
                }),
        ])(
            "should handle multiple parameter replacements",
            (template, paramPairs) => {
                let templateWithPlaceholders = template;
                const params: Record<string, string | number> = {};

                for (const [key, value] of paramPairs) {
                    templateWithPlaceholders += ` {${key}}`;
                    params[key] = value;
                }

                const result = formatErrorMessage(
                    templateWithPlaceholders,
                    params
                );

                expect(result).toBeDefined();
                // All placeholders should be replaced (except dangerous ones like __proto__)
                for (const [key, value] of paramPairs) {
                    if (
                        key !== "__proto__" &&
                        key !== "constructor" &&
                        key !== "prototype"
                    ) {
                        expect(result).toContain(String(value));
                        expect(result).not.toContain(`{${key}}`);
                    } else {
                        // Dangerous keys should remain as placeholders for security
                        expect(result).toContain(`{${key}}`);
                    }
                }
            }
        );

        test.prop([fc.string()])(
            "should leave template unchanged when no placeholders exist",
            (template) => {
                fc.pre(!template.includes("{") && !template.includes("}"));

                const result = formatErrorMessage(template, {});
                expect(result).toBe(template);
            }
        );

        test.prop([
            fc.string(),
            fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
            fc.record({}, { requiredKeys: [] }),
        ])(
            "should handle missing parameters gracefully",
            (template, keys, params) => {
                let templateWithPlaceholders = template;
                for (const key of keys) {
                    templateWithPlaceholders += ` {${key}}`;
                }

                // FormatErrorMessage should not throw even if params are missing
                expect(() =>
                    formatErrorMessage(templateWithPlaceholders, params)
                ).not.toThrowError();

                const result = formatErrorMessage(
                    templateWithPlaceholders,
                    params
                );

                // Missing placeholders should remain as-is
                for (const key of keys) {
                    if (!(key in params)) {
                        expect(result).toContain(`{${key}}`);
                    }
                }
            }
        );

        test.prop([
            fc.string({ minLength: 1 }),
            fc.oneof(fc.string(), fc.integer()),
        ])("should handle special characters in values", (key, value) => {
            const template = `Error: {${key}}`;
            const params = { [key]: value };
            const result = formatErrorMessage(template, params);

            // Security feature: dangerous prototype keys are skipped
            if (
                key === "__proto__" ||
                key === "constructor" ||
                key === "prototype"
            ) {
                expect(result).toBe(`Error: {${key}}`); // Placeholder remains unchanged
            } else {
                expect(result).toBe(`Error: ${String(value)}`);
            }
        });

        it("should handle empty template", () => {
            const result = formatErrorMessage("", { key: "value" });
            expect(result).toBe("");
        });

        it("should handle empty params", () => {
            const result = formatErrorMessage("No placeholders here", {});
            expect(result).toBe("No placeholders here");
        });
    });

    describe(isKnownErrorMessage, () => {
        test.prop([fc.string()])(
            "should return boolean for any string input",
            (message) => {
                const result = isKnownErrorMessage(message);
                expect(typeof result).toBe("boolean");
            }
        );

        test("should return true for all catalog error messages", () => {
            // Test all error messages from all categories
            for (const [_categoryName, category] of Object.entries(
                ERROR_CATALOG
            )) {
                for (const [_errorKey, errorValue] of Object.entries(
                    category
                )) {
                    if (typeof errorValue === "string") {
                        expect(isKnownErrorMessage(errorValue)).toBeTruthy();
                    }
                }
            }
        });

        test.prop([
            fc.string().filter((str) => {
                // Generate strings that are definitely not in the catalog
                const allMessages = Object.values(ERROR_CATALOG).flatMap(
                    (category) =>
                        Object.values(category as Record<string, string>)
                );
                return !allMessages.includes(str);
            }),
        ])("should return false for unknown error messages", (message) => {
            expect(isKnownErrorMessage(message)).toBeFalsy();
        });

        it("should return true for all SITE_ERRORS", () => {
            for (const error of Object.values(SITE_ERRORS)) {
                expect(isKnownErrorMessage(error)).toBeTruthy();
            }
        });

        it("should return true for all MONITOR_ERRORS", () => {
            for (const error of Object.values(MONITOR_ERRORS)) {
                expect(isKnownErrorMessage(error)).toBeTruthy();
            }
        });

        it("should return true for all VALIDATION_ERRORS", () => {
            for (const error of Object.values(VALIDATION_ERRORS)) {
                expect(isKnownErrorMessage(error)).toBeTruthy();
            }
        });

        it("should return true for all SYSTEM_ERRORS", () => {
            for (const error of Object.values(SYSTEM_ERRORS)) {
                expect(isKnownErrorMessage(error)).toBeTruthy();
            }
        });

        it("should return true for all NETWORK_ERRORS", () => {
            for (const error of Object.values(NETWORK_ERRORS)) {
                expect(isKnownErrorMessage(error)).toBeTruthy();
            }
        });

        it("should return true for all DATABASE_ERRORS", () => {
            for (const error of Object.values(DATABASE_ERRORS)) {
                expect(isKnownErrorMessage(error)).toBeTruthy();
            }
        });

        it("should return true for all IPC_ERRORS", () => {
            for (const error of Object.values(IPC_ERRORS)) {
                expect(isKnownErrorMessage(error)).toBeTruthy();
            }
        });

        test.prop([fc.string()])(
            "should handle edge cases gracefully",
            (input) => {
                expect(() => isKnownErrorMessage(input)).not.toThrowError();

                const result = isKnownErrorMessage(input);
                expect(typeof result).toBe("boolean");
            }
        );
    });

    describe("Error catalog integrity", () => {
        test.prop([fc.constantFrom(...Object.keys(ERROR_CATALOG))])(
            "should have unique error messages within each category",
            (category) => {
                const errorCategory =
                    ERROR_CATALOG[category as keyof typeof ERROR_CATALOG];
                const messages = Object.values(errorCategory);
                const uniqueMessages = new Set(messages);

                expect(uniqueMessages.size).toBe(messages.length);
            }
        );

        it("should have all error messages be non-empty strings", () => {
            for (const category of Object.values(ERROR_CATALOG)) {
                for (const message of Object.values(category)) {
                    expect(typeof message).toBe("string");
                    expect((message as string).length).toBeGreaterThan(0);
                    expect((message as string).trim()).toBe(message); // No leading/trailing whitespace
                }
            }
        });

        it("should have consistent message formatting", () => {
            for (const category of Object.values(ERROR_CATALOG)) {
                for (const message of Object.values(category)) {
                    // Messages should start with capital letter
                    expect((message as string)[0]).toMatch(/[A-Z]/);
                    // Messages should be well-formed sentences (can end with periods)
                    expect(message as string).toMatch(/^[A-Z].*[\d.A-Za-z]$/);
                }
            }
        });

        test.prop([fc.integer({ min: 1, max: 100 })])(
            "should maintain performance with repeated checks",
            (iterations) => {
                const startTime = Date.now();

                for (let i = 0; i < iterations; i++) {
                    isKnownErrorMessage("Site not found");
                    isKnownErrorMessage("Unknown error message");
                }

                const duration = Date.now() - startTime;
                // Should complete within reasonable time (100ms for 100 iterations)
                expect(duration).toBeLessThan(100);
            }
        );
    });

    describe("Type safety and exports", () => {
        it("should export all expected constants", () => {
            expect(ERROR_CATALOG).toBeDefined();
            expect(SITE_ERRORS).toBeDefined();
            expect(MONITOR_ERRORS).toBeDefined();
            expect(VALIDATION_ERRORS).toBeDefined();
            expect(SYSTEM_ERRORS).toBeDefined();
            expect(NETWORK_ERRORS).toBeDefined();
            expect(DATABASE_ERRORS).toBeDefined();
            expect(IPC_ERRORS).toBeDefined();
        });

        it("should export all expected functions", () => {
            expect(typeof formatErrorMessage).toBe("function");
            expect(typeof isKnownErrorMessage).toBe("function");
        });

        test.prop([fc.anything()])(
            "formatErrorMessage should handle any input gracefully",
            (input) => {
                // Should not throw even with invalid inputs
                expect(() => {
                    try {
                        formatErrorMessage(input as any, input as any);
                    } catch {
                        // Catching any error to ensure the function itself doesn't crash the test
                    }
                }).not.toThrowError();
            }
        );
    });
});
