/**
 * @version 1.0.0
 *
 * @file Comprehensive tests for form utility functions Enhanced with
 *   property-based testing for robust user input validation
 */

import { describe, expect, it, vi } from "vitest";
import { test, fc } from "@fast-check/vitest";
import type React from "react";
import {
    createStringInputHandler,
    createTypedInputHandler,
    createSelectChangeHandler,
    createCheckboxChangeHandler,
    validationPatterns,
} from "../../../components/shared/formUtils";

describe("Form Utilities", () => {
    describe("Property-Based Form Input Validation", () => {
        describe("Input Handler with Various Inputs", () => {
            test.prop([fc.string()])(
                "should handle any string input without validation",
                (inputValue) => {
                    const setValue = vi.fn();
                    const handler = createStringInputHandler(setValue);

                    const mockEvent = {
                        target: { value: inputValue },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(inputValue);
                }
            );

            test.prop([
                fc.oneof(
                    fc.string({ minLength: 1 }),
                    fc.string().filter((s) => s.trim().length === 0),
                    fc.constant("")
                ),
            ])(
                "should respect validation function results for all string inputs",
                (inputValue) => {
                    const setValue = vi.fn();
                    const mockValidator = vi
                        .fn()
                        .mockReturnValue(inputValue.trim().length > 0);
                    const handler = createStringInputHandler(
                        setValue,
                        mockValidator
                    );

                    const mockEvent = {
                        target: { value: inputValue },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);

                    expect(mockValidator).toHaveBeenCalledWith(inputValue);
                    if (inputValue.trim().length > 0) {
                        expect(setValue).toHaveBeenCalledWith(inputValue);
                    } else {
                        expect(setValue).not.toHaveBeenCalled();
                    }
                }
            );

            test.prop([fc.string({ minLength: 1, maxLength: 1000 })])(
                "should handle various character sets and encodings",
                (complexInput) => {
                    const setValue = vi.fn();
                    const handler = createStringInputHandler(setValue);

                    const mockEvent = {
                        target: { value: complexInput },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(complexInput);
                    expect(typeof complexInput).toBe("string");
                }
            );

            test.prop([fc.integer({ min: 0, max: 100 })])(
                "should handle numeric strings consistently",
                (numValue) => {
                    const setValue = vi.fn();
                    const handler = createStringInputHandler(setValue);
                    const stringValue = numValue.toString();

                    const mockEvent = {
                        target: { value: stringValue },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(stringValue);
                }
            );
        });

        describe("Select Handler with Various Options", () => {
            test.prop([fc.string()])(
                "should handle any string option without conversion",
                (optionValue) => {
                    const setValue = vi.fn();
                    const handler = createSelectChangeHandler(setValue);

                    const mockEvent = {
                        target: { value: optionValue },
                    } as React.ChangeEvent<HTMLSelectElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(optionValue);
                }
            );

            test.prop([fc.integer({ min: -1000, max: 1000 })])(
                "should convert numeric string options to numbers",
                (numValue) => {
                    const setValue = vi.fn();
                    const converter = (value: string) =>
                        Number.parseInt(value, 10);
                    const handler = createSelectChangeHandler(
                        setValue,
                        converter
                    );
                    const stringValue = numValue.toString();

                    const mockEvent = {
                        target: { value: stringValue },
                    } as React.ChangeEvent<HTMLSelectElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(numValue);
                }
            );

            test.prop([
                fc.constantFrom("true", "false", "1", "0", "yes", "no"),
            ])(
                "should handle boolean-like string conversions",
                (booleanLikeValue) => {
                    const setValue = vi.fn();
                    const converter = (value: string) =>
                        value === "true" || value === "1" || value === "yes";
                    const handler = createSelectChangeHandler(
                        setValue,
                        converter
                    );

                    const mockEvent = {
                        target: { value: booleanLikeValue },
                    } as React.ChangeEvent<HTMLSelectElement>;

                    handler(mockEvent);

                    const expectedBoolean = [
                        "true",
                        "1",
                        "yes",
                    ].includes(booleanLikeValue);
                    expect(setValue).toHaveBeenCalledWith(expectedBoolean);
                }
            );

            test.prop([
                fc.string().filter((s) => !/^\d+$/.test(s) && s.length > 0),
            ])(
                "should handle non-numeric strings in numeric conversion",
                (nonNumericValue) => {
                    const setValue = vi.fn();
                    const converter = (value: string) =>
                        Number.parseInt(value, 10);
                    const handler = createSelectChangeHandler(
                        setValue,
                        converter
                    );

                    const mockEvent = {
                        target: { value: nonNumericValue },
                    } as React.ChangeEvent<HTMLSelectElement>;

                    handler(mockEvent);

                    const convertedValue = Number.parseInt(nonNumericValue, 10);
                    expect(setValue).toHaveBeenCalledWith(convertedValue);

                    // Allow leading whitespace before optional sign/digit for numeric conversions
                    const trimmedValue = nonNumericValue.replace(/^\s+/, "");
                    const numericPattern = /^[+-]?\d/;

                    if (!numericPattern.test(trimmedValue)) {
                        expect(Number.isNaN(convertedValue)).toBeTruthy();
                    }
                }
            );
        });

        describe("Checkbox Handler with Various States", () => {
            test.prop([fc.boolean()])(
                "should handle any boolean checkbox state",
                (checkedState) => {
                    const setValue = vi.fn();
                    const handler = createCheckboxChangeHandler(setValue);

                    const mockEvent = {
                        target: { checked: checkedState },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(checkedState);
                }
            );

            test.prop([fc.boolean()])(
                "should maintain type safety for checkbox values",
                (checkedState) => {
                    const setValue = vi.fn();
                    const handler = createCheckboxChangeHandler(setValue);

                    const mockEvent = {
                        target: { checked: checkedState },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);

                    const calls = setValue.mock.calls || [];
                    const [calledValue] = calls[0] || [];
                    expect(typeof calledValue).toBe("boolean");
                    expect(calledValue).toBe(checkedState);
                }
            );
        });

        describe("Validation Patterns Property Testing", () => {
            test.prop([fc.string({ minLength: 1 })])(
                "should validate non-empty strings correctly",
                (nonEmptyString) => {
                    const isValid =
                        validationPatterns.nonEmptyString(nonEmptyString);
                    if (nonEmptyString.trim().length > 0) {
                        expect(isValid).toBeTruthy();
                    } else {
                        expect(isValid).toBeFalsy();
                    }
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.string().filter((s) => s.trim().length === 0)
                ),
            ])(
                "should reject empty and whitespace-only strings",
                (emptyString) => {
                    const isValid =
                        validationPatterns.nonEmptyString(emptyString);
                    expect(isValid).toBeFalsy();
                }
            );

            test.prop([fc.integer({ min: 1, max: 65_535 })])(
                "should validate port number ranges correctly",
                (portNumber) => {
                    const validator = validationPatterns.numberInRange(
                        1,
                        65_535
                    );
                    const isValid = validator(portNumber);
                    expect(isValid).toBeTruthy();
                }
            );

            test.prop([
                fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 65_536 })),
            ])("should reject invalid port number ranges", (invalidPort) => {
                const validator = validationPatterns.numberInRange(1, 65_535);
                const isValid = validator(invalidPort);
                expect(isValid).toBeFalsy();
            });

            test.prop([fc.constantFrom(5000, 10_000, 30_000, 60_000)])(
                "should validate allowed check intervals",
                (allowedInterval) => {
                    const validator = validationPatterns.oneOfNumbers([
                        5000,
                        10_000,
                        30_000,
                        60_000,
                    ]);
                    const isValid = validator(allowedInterval);
                    expect(isValid).toBeTruthy();
                }
            );

            test.prop([
                fc.integer({ min: 1, max: 100_000 }).filter(
                    (n) =>
                        ![
                            5000,
                            10_000,
                            30_000,
                            60_000,
                        ].includes(n)
                ),
            ])(
                "should reject non-allowed check intervals",
                (disallowedInterval) => {
                    const validator = validationPatterns.oneOfNumbers([
                        5000,
                        10_000,
                        30_000,
                        60_000,
                    ]);
                    const isValid = validator(disallowedInterval);
                    expect(isValid).toBeFalsy();
                }
            );

            test.prop([fc.constantFrom("http", "port", "ping")])(
                "should validate allowed monitor types",
                (allowedType) => {
                    const validator = validationPatterns.oneOfStrings([
                        "http",
                        "port",
                        "ping",
                    ]);
                    const isValid = validator(allowedType);
                    expect(isValid).toBeTruthy();
                }
            );

            test.prop([
                fc.string().filter(
                    (s) =>
                        ![
                            "http",
                            "port",
                            "ping",
                        ].includes(s) && s.length > 0
                ),
            ])("should reject non-allowed monitor types", (disallowedType) => {
                const validator = validationPatterns.oneOfStrings([
                    "http",
                    "port",
                    "ping",
                ]);
                const isValid = validator(disallowedType);
                expect(isValid).toBeFalsy();
            });

            test.prop([fc.string({ minLength: 1, maxLength: 50 })])(
                "should test pattern consistency across different inputs",
                (inputString) => {
                    // Test that nonEmptyString pattern behaves consistently
                    const result1 =
                        validationPatterns.nonEmptyString(inputString);
                    const result2 =
                        validationPatterns.nonEmptyString(inputString);
                    expect(result1).toBe(result2); // Consistency check
                    expect(typeof result1).toBe("boolean");

                    // Test numberInRange pattern consistency (example with port range)
                    const portValidator = validationPatterns.numberInRange(
                        1,
                        65_535
                    );
                    const testNumber = inputString.length; // Use length as test number
                    const numResult1 = portValidator(testNumber);
                    const numResult2 = portValidator(testNumber);
                    expect(numResult1).toBe(numResult2);
                    expect(typeof numResult1).toBe("boolean");

                    // Test oneOfStrings pattern consistency
                    const stringValidator = validationPatterns.oneOfStrings([
                        "test",
                        "demo",
                        "sample",
                    ]);
                    const stringResult1 = stringValidator(inputString);
                    const stringResult2 = stringValidator(inputString);
                    expect(stringResult1).toBe(stringResult2);
                    expect(typeof stringResult1).toBe("boolean");
                }
            );
        });

        describe("Edge Case Input Handling", () => {
            test.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.constant(" "),
                    fc.constant("\n"),
                    fc.constant("\t"),
                    fc.constant("\r\n"),
                    fc
                        .string()
                        .filter((s) => s.trim().length === 0 && s.length > 0)
                ),
            ])(
                "should handle whitespace and empty inputs consistently",
                (whitespaceInput) => {
                    const setValue = vi.fn();
                    const handler = createStringInputHandler(setValue);

                    const mockEvent = {
                        target: { value: whitespaceInput },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(whitespaceInput);

                    // Verify whitespace properties
                    expect(whitespaceInput.trim()).toHaveLength(0);
                }
            );

            test.prop([fc.string({ minLength: 1000, maxLength: 5000 })])(
                "should handle very long input strings",
                (longInput) => {
                    const setValue = vi.fn();
                    const handler = createStringInputHandler(setValue);

                    const mockEvent = {
                        target: { value: longInput },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(longInput);
                    expect(longInput.length).toBeGreaterThanOrEqual(1000);
                }
            );

            test.prop([
                fc
                    .string()
                    .filter(
                        (s) =>
                            s.includes("<") ||
                            s.includes(">") ||
                            s.includes("&") ||
                            s.includes("'") ||
                            s.includes('"')
                    ),
            ])(
                "should handle HTML-like characters in inputs",
                (htmlLikeInput) => {
                    const setValue = vi.fn();
                    const handler = createStringInputHandler(setValue);

                    const mockEvent = {
                        target: { value: htmlLikeInput },
                    } as React.ChangeEvent<HTMLInputElement>;

                    handler(mockEvent);
                    expect(setValue).toHaveBeenCalledWith(htmlLikeInput);

                    // Verify it contains HTML-like characters
                    const hasHtmlChars = [
                        "<",
                        ">",
                        "&",
                        "'",
                        '"',
                    ].some((char) => htmlLikeInput.includes(char));
                    expect(hasHtmlChars).toBeTruthy();
                }
            );
        });
    });

    describe(createStringInputHandler, () => {
        it("should create handler that sets value without validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Constructor", "type");

            const setValue = vi.fn();
            const handler = createStringInputHandler(setValue);

            const mockEvent = {
                target: { value: "test value" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("test value");
        });

        it("should create handler that sets value with successful validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Constructor", "type");

            const setValue = vi.fn();
            const validator = vi.fn().mockReturnValue(true);
            const handler = createStringInputHandler(setValue, validator);

            const mockEvent = {
                target: { value: "valid value" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(validator).toHaveBeenCalledWith("valid value");
            expect(setValue).toHaveBeenCalledWith("valid value");
        });

        it("should create handler that skips setting value with failed validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Constructor", "type");

            const setValue = vi.fn();
            const validator = vi.fn().mockReturnValue(false);
            const handler = createStringInputHandler(setValue, validator);

            const mockEvent = {
                target: { value: "invalid value" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(validator).toHaveBeenCalledWith("invalid value");
            expect(setValue).not.toHaveBeenCalled();
        });

        it("should handle numeric input values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Business Logic", "type");

            const setValue = vi.fn();
            const handler = createStringInputHandler(setValue);

            const mockEvent = {
                target: { value: "123" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("123");
        });

        it("should handle empty string values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Business Logic", "type");

            const setValue = vi.fn();
            const handler = createStringInputHandler(setValue);

            const mockEvent = {
                target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("");
        });

        it("should work with custom validation functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Validation", "type");

            const setValue = vi.fn();
            const minLengthValidator = (value: string) => value.length >= 3;
            const handler = createStringInputHandler(
                setValue,
                minLengthValidator
            );

            // Test valid input
            const validEvent = {
                target: { value: "abc" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(validEvent);
            expect(setValue).toHaveBeenCalledWith("abc");

            // Test invalid input
            setValue.mockClear();
            const invalidEvent = {
                target: { value: "ab" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(invalidEvent);
            expect(setValue).not.toHaveBeenCalled();
        });
    });

    describe(createSelectChangeHandler, () => {
        it("should create handler that sets value without conversion", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Constructor", "type");

            const setValue = vi.fn();
            const handler = createSelectChangeHandler(setValue);

            const mockEvent = {
                target: { value: "option1" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("option1");
        });

        it("should create handler that converts string to number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Constructor", "type");

            const setValue = vi.fn();
            const converter = (value: string) => Number.parseInt(value, 10);
            const handler = createSelectChangeHandler(setValue, converter);

            const mockEvent = {
                target: { value: "123" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(123);
        });

        it("should create handler that converts string to boolean", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Constructor", "type");

            const setValue = vi.fn();
            const converter = (value: string) => value === "true";
            const handler = createSelectChangeHandler(setValue, converter);

            const mockEvent = {
                target: { value: "true" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(true);
        });

        it("should handle empty select values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Business Logic", "type");

            const setValue = vi.fn();
            const handler = createSelectChangeHandler(setValue);

            const mockEvent = {
                target: { value: "" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("");
        });

        it("should handle converter that returns complex objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Business Logic", "type");

            const setValue = vi.fn();
            const converter = (value: string) => ({
                id: value,
                name: `Item ${value}`,
            });
            const handler = createSelectChangeHandler(setValue, converter);

            const mockEvent = {
                target: { value: "1" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith({ id: "1", name: "Item 1" });
        });

        it("should handle converter that returns undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Business Logic", "type");

            const setValue = vi.fn();
            const converter = () => undefined;
            const handler = createSelectChangeHandler(setValue, converter);

            const mockEvent = {
                target: { value: "test" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(undefined);
        });
    });

    describe(createCheckboxChangeHandler, () => {
        it("should create handler that sets checked state to true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Constructor", "type");

            const setValue = vi.fn();
            const handler = createCheckboxChangeHandler(setValue);

            const mockEvent = {
                target: { checked: true },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(true);
        });

        it("should create handler that sets checked state to false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Constructor", "type");

            const setValue = vi.fn();
            const handler = createCheckboxChangeHandler(setValue);

            const mockEvent = {
                target: { checked: false },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(false);
        });

        it("should handle multiple checkbox events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Event Processing", "type");

            const setValue = vi.fn();
            const handler = createCheckboxChangeHandler(setValue);

            // First click - check
            const checkEvent = {
                target: { checked: true },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(checkEvent);
            expect(setValue).toHaveBeenCalledWith(true);

            // Second click - uncheck
            const uncheckEvent = {
                target: { checked: false },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(uncheckEvent);
            expect(setValue).toHaveBeenCalledWith(false);

            expect(setValue).toHaveBeenCalledTimes(2);
        });
    });

    describe("validationPatterns", () => {
        describe("nonEmptyString", () => {
            it("should return true for non-empty strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                expect(validationPatterns.nonEmptyString("hello")).toBeTruthy();
                expect(validationPatterns.nonEmptyString("a")).toBeTruthy();
                expect(
                    validationPatterns.nonEmptyString("   content   ")
                ).toBeTruthy();
            });

            it("should return false for empty strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                expect(validationPatterns.nonEmptyString("")).toBeFalsy();
                expect(validationPatterns.nonEmptyString("   ")).toBeFalsy();
                expect(validationPatterns.nonEmptyString("\t\n")).toBeFalsy();
            });

            it("should handle special characters and unicode", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                expect(validationPatterns.nonEmptyString("🎉")).toBeTruthy();
                expect(validationPatterns.nonEmptyString("@#$%")).toBeTruthy();
                expect(validationPatterns.nonEmptyString("你好")).toBeTruthy();
            });
        });

        describe("numberInRange", () => {
            it("should create validator that accepts numbers in range", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Constructor", "type");

                const validator = validationPatterns.numberInRange(1, 10);

                expect(validator(1)).toBeTruthy();
                expect(validator(5)).toBeTruthy();
                expect(validator(10)).toBeTruthy();
            });

            it("should create validator that rejects numbers outside range", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Constructor", "type");

                const validator = validationPatterns.numberInRange(1, 10);

                expect(validator(0)).toBeFalsy();
                expect(validator(11)).toBeFalsy();
                expect(validator(-5)).toBeFalsy();
                expect(validator(100)).toBeFalsy();
            });

            it("should handle negative ranges", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.numberInRange(-10, -1);

                expect(validator(-5)).toBeTruthy();
                expect(validator(-10)).toBeTruthy();
                expect(validator(-1)).toBeTruthy();
                expect(validator(0)).toBeFalsy();
                expect(validator(-11)).toBeFalsy();
            });

            it("should handle floating point numbers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.numberInRange(0.1, 0.9);

                expect(validator(0.5)).toBeTruthy();
                expect(validator(0.1)).toBeTruthy();
                expect(validator(0.9)).toBeTruthy();
                expect(validator(0.05)).toBeFalsy();
                expect(validator(1)).toBeFalsy();
            });

            it("should handle single-point range", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.numberInRange(5, 5);

                expect(validator(5)).toBeTruthy();
                expect(validator(4)).toBeFalsy();
                expect(validator(6)).toBeFalsy();
            });
        });

        describe("oneOfNumbers", () => {
            it("should create validator that accepts allowed numbers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Constructor", "type");

                const validator = validationPatterns.oneOfNumbers([
                    1,
                    3,
                    5,
                    7,
                ]);

                expect(validator(1)).toBeTruthy();
                expect(validator(3)).toBeTruthy();
                expect(validator(5)).toBeTruthy();
                expect(validator(7)).toBeTruthy();
            });

            it("should create validator that rejects non-allowed numbers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Constructor", "type");

                const validator = validationPatterns.oneOfNumbers([
                    1,
                    3,
                    5,
                    7,
                ]);

                expect(validator(2)).toBeFalsy();
                expect(validator(4)).toBeFalsy();
                expect(validator(6)).toBeFalsy();
                expect(validator(8)).toBeFalsy();
                expect(validator(0)).toBeFalsy();
            });

            it("should handle empty array", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.oneOfNumbers([]);

                expect(validator(1)).toBeFalsy();
                expect(validator(0)).toBeFalsy();
                expect(validator(-1)).toBeFalsy();
            });

            it("should handle negative numbers", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.oneOfNumbers([
                    -1,
                    -5,
                    -10,
                ]);

                expect(validator(-1)).toBeTruthy();
                expect(validator(-5)).toBeTruthy();
                expect(validator(-10)).toBeTruthy();
                expect(validator(1)).toBeFalsy();
                expect(validator(0)).toBeFalsy();
            });

            it("should handle floating point numbers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.oneOfNumbers([
                    1.5,
                    2.7,
                    3.14,
                ]);

                expect(validator(1.5)).toBeTruthy();
                expect(validator(2.7)).toBeTruthy();
                expect(validator(3.14)).toBeTruthy();
                expect(validator(1.4)).toBeFalsy();
                expect(validator(3)).toBeFalsy();
            });
        });

        describe("oneOfStrings", () => {
            it("should create validator that accepts allowed strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Constructor", "type");

                const validator = validationPatterns.oneOfStrings([
                    "red",
                    "green",
                    "blue",
                ]);

                expect(validator("red")).toBeTruthy();
                expect(validator("green")).toBeTruthy();
                expect(validator("blue")).toBeTruthy();
            });

            it("should create validator that rejects non-allowed strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Constructor", "type");

                const validator = validationPatterns.oneOfStrings([
                    "red",
                    "green",
                    "blue",
                ]);

                expect(validator("yellow")).toBeFalsy();
                expect(validator("purple")).toBeFalsy();
                expect(validator("")).toBeFalsy();
                expect(validator("Red")).toBeFalsy(); // Case sensitive
            });

            it("should handle empty array", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.oneOfStrings([]);

                expect(validator("anything")).toBeFalsy();
                expect(validator("")).toBeFalsy();
            });

            it("should handle empty strings in allowed values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.oneOfStrings([
                    "",
                    "option1",
                    "option2",
                ]);

                expect(validator("")).toBeTruthy();
                expect(validator("option1")).toBeTruthy();
                expect(validator("option2")).toBeTruthy();
                expect(validator("option3")).toBeFalsy();
            });

            it("should handle special characters and unicode", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.oneOfStrings([
                    "@#$%",
                    "你好",
                    "🎉",
                ]);

                expect(validator("@#$%")).toBeTruthy();
                expect(validator("你好")).toBeTruthy();
                expect(validator("🎉")).toBeTruthy();
                expect(validator("hello")).toBeFalsy();
            });

            it("should be case sensitive", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: formUtils", "component");
                await annotate("Category: Component", "category");
                await annotate("Type: Business Logic", "type");

                const validator = validationPatterns.oneOfStrings([
                    "Hello",
                    "World",
                ]);

                expect(validator("Hello")).toBeTruthy();
                expect(validator("World")).toBeTruthy();
                expect(validator("hello")).toBeFalsy();
                expect(validator("world")).toBeFalsy();
                expect(validator("HELLO")).toBeFalsy();
            });
        });
    });

    describe("Integration scenarios", () => {
        it("should work with multiple handlers together", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Data Retrieval", "type");

            const setName = vi.fn();
            const setAge = vi.fn();
            const setActive = vi.fn();

            const nameHandler = createStringInputHandler(
                setName,
                validationPatterns.nonEmptyString
            );
            const ageHandler = createSelectChangeHandler(setAge, (value) =>
                Number.parseInt(value, 10)
            );
            const activeHandler = createCheckboxChangeHandler(setActive);

            // Test name input
            const nameEvent = {
                target: { value: "John Doe" },
            } as React.ChangeEvent<HTMLInputElement>;

            nameHandler(nameEvent);
            expect(setName).toHaveBeenCalledWith("John Doe");

            // Test age select
            const ageEvent = {
                target: { value: "25" },
            } as React.ChangeEvent<HTMLSelectElement>;

            ageHandler(ageEvent);
            expect(setAge).toHaveBeenCalledWith(25);

            // Test active checkbox
            const activeEvent = {
                target: { checked: true },
            } as React.ChangeEvent<HTMLInputElement>;

            activeHandler(activeEvent);
            expect(setActive).toHaveBeenCalledWith(true);
        });

        it("should handle complex validation workflows", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formUtils", "component");
            await annotate("Category: Component", "category");
            await annotate("Type: Validation", "type");

            const setValue = vi.fn();
            const rangeValidator = validationPatterns.numberInRange(1, 100);
            const allowedValidator = validationPatterns.oneOfNumbers([
                10,
                20,
                30,
                40,
                50,
            ]);

            // Combined validation for string inputs that represent numbers
            const combinedValidator = (value: string) => {
                const numValue = Number.parseInt(value, 10);
                return (
                    !Number.isNaN(numValue) &&
                    rangeValidator(numValue) &&
                    allowedValidator(numValue)
                );
            };

            const handler = createStringInputHandler(
                setValue,
                combinedValidator
            );

            // Valid: in range and allowed
            const validEvent = {
                target: { value: "30" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(validEvent);
            expect(setValue).toHaveBeenCalledWith("30");

            // Invalid: in range but not allowed
            setValue.mockClear();
            const invalidEvent1 = {
                target: { value: "25" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(invalidEvent1);
            expect(setValue).not.toHaveBeenCalled();

            // Invalid: not a valid number
            setValue.mockClear();
            const invalidEvent2 = {
                target: { value: "abc" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(invalidEvent2);
            expect(setValue).not.toHaveBeenCalled();
        });
    });

    describe("createStringInputHandler - Missing Function Coverage", () => {
        test.prop([fc.string()])(
            "should handle any string input without validation",
            (inputValue) => {
                const setValue = vi.fn();
                const handler = createStringInputHandler(setValue);

                const mockEvent = {
                    target: { value: inputValue },
                } as React.ChangeEvent<HTMLInputElement>;

                handler(mockEvent);
                expect(setValue).toHaveBeenCalledWith(inputValue);
            }
        );

        test.prop([fc.string()])(
            "should respect validation function - valid inputs",
            (inputValue) => {
                fc.pre(inputValue.trim().length > 0); // Only test non-empty strings
                const setValue = vi.fn();
                const validator = (value: string) => value.trim().length > 0;
                const handler = createStringInputHandler(setValue, validator);

                const mockEvent = {
                    target: { value: inputValue },
                } as React.ChangeEvent<HTMLInputElement>;

                handler(mockEvent);
                expect(setValue).toHaveBeenCalledWith(inputValue);
            }
        );

        test.prop([fc.constantFrom("", "   ", "\t", "\n", "  \t  \n  ")])(
            "should reject invalid inputs with validation",
            (emptyInput) => {
                const setValue = vi.fn();
                const validator = (value: string) => value.trim().length > 0;
                const handler = createStringInputHandler(setValue, validator);

                const mockEvent = {
                    target: { value: emptyInput },
                } as React.ChangeEvent<HTMLInputElement>;

                handler(mockEvent);
                expect(setValue).not.toHaveBeenCalled();
            }
        );

        it("should handle validation function that throws", () => {
            const setValue = vi.fn();
            const validator = () => {
                throw new Error("Validation error");
            };
            const handler = createStringInputHandler(setValue, validator);

            const mockEvent = {
                target: { value: "test" },
            } as React.ChangeEvent<HTMLInputElement>;

            expect(() => handler(mockEvent)).toThrowError("Validation error");
            expect(setValue).not.toHaveBeenCalled();
        });
    });

    describe("createTypedInputHandler - Missing Function Coverage", () => {
        test.prop([fc.integer({ min: -1000, max: 1000 })])(
            "should convert string to number without validation",
            (numValue) => {
                const setValue = vi.fn();
                const converter = (value: string) => Number.parseInt(value, 10);
                const handler = createTypedInputHandler(setValue, converter);

                const mockEvent = {
                    target: { value: numValue.toString() },
                } as React.ChangeEvent<HTMLInputElement>;

                handler(mockEvent);
                expect(setValue).toHaveBeenCalledWith(numValue);
            }
        );

        test.prop([fc.integer({ min: 1, max: 1000 })])(
            "should convert and validate positive numbers",
            (positiveNum) => {
                const setValue = vi.fn();
                const converter = (value: string) => Number.parseInt(value, 10);
                const validator = (num: number) => num > 0;
                const handler = createTypedInputHandler(
                    setValue,
                    converter,
                    validator
                );

                const mockEvent = {
                    target: { value: positiveNum.toString() },
                } as React.ChangeEvent<HTMLInputElement>;

                handler(mockEvent);
                expect(setValue).toHaveBeenCalledWith(positiveNum);
            }
        );

        test.prop([fc.integer({ min: -1000, max: 0 })])(
            "should reject negative numbers with positive validator",
            (negativeNum) => {
                const setValue = vi.fn();
                const converter = (value: string) => Number.parseInt(value, 10);
                const validator = (num: number) => num > 0;
                const handler = createTypedInputHandler(
                    setValue,
                    converter,
                    validator
                );

                const mockEvent = {
                    target: { value: negativeNum.toString() },
                } as React.ChangeEvent<HTMLInputElement>;

                handler(mockEvent);
                expect(setValue).not.toHaveBeenCalled();
            }
        );

        test.prop([
            fc.string().filter((s) => Number.isNaN(Number.parseInt(s, 10))),
        ])("should handle invalid number strings", (invalidString) => {
            const setValue = vi.fn();
            const converter = (value: string) => Number.parseInt(value, 10);
            const validator = (num: number) => !Number.isNaN(num);
            const handler = createTypedInputHandler(
                setValue,
                converter,
                validator
            );

            const mockEvent = {
                target: { value: invalidString },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);
            expect(setValue).not.toHaveBeenCalled();
        });

        it("should handle converter that throws", () => {
            const setValue = vi.fn();
            const converter = () => {
                throw new Error("Conversion error");
            };
            const handler = createTypedInputHandler(setValue, converter);

            const mockEvent = {
                target: { value: "test" },
            } as React.ChangeEvent<HTMLInputElement>;

            expect(() => handler(mockEvent)).toThrowError("Conversion error");
            expect(setValue).not.toHaveBeenCalled();
        });

        it("should handle validator that throws", () => {
            const setValue = vi.fn();
            const converter = (value: string) => Number.parseInt(value, 10);
            const validator = () => {
                throw new Error("Validation error");
            };
            const handler = createTypedInputHandler(
                setValue,
                converter,
                validator
            );

            const mockEvent = {
                target: { value: "123" },
            } as React.ChangeEvent<HTMLInputElement>;

            expect(() => handler(mockEvent)).toThrowError("Validation error");
            expect(setValue).not.toHaveBeenCalled();
        });

        // Test with different types
        test.prop([fc.string()])(
            "should work with boolean conversion",
            (stringValue) => {
                const setValue = vi.fn();
                const converter = (value: string) =>
                    value.toLowerCase() === "true";
                const handler = createTypedInputHandler(setValue, converter);

                const mockEvent = {
                    target: { value: stringValue },
                } as React.ChangeEvent<HTMLInputElement>;

                handler(mockEvent);
                expect(setValue).toHaveBeenCalledWith(
                    stringValue.toLowerCase() === "true"
                );
            }
        );

        test.prop([fc.float({ min: 0, max: 100 })])(
            "should work with float conversion",
            (floatValue) => {
                const setValue = vi.fn();
                const converter = (value: string) => Number.parseFloat(value);
                const handler = createTypedInputHandler(setValue, converter);

                const mockEvent = {
                    target: { value: floatValue.toString() },
                } as React.ChangeEvent<HTMLInputElement>;

                handler(mockEvent);
                expect(setValue).toHaveBeenCalledWith(floatValue);
            }
        );
    });
});
