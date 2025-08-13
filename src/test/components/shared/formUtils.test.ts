/**
 * @fileoverview Comprehensive tests for form utility functions
 * @version 1.0.0
 */

import { describe, expect, it, vi } from "vitest";
import type React from "react";
import {
    createInputChangeHandler,
    createSelectChangeHandler,
    createCheckboxChangeHandler,
    validationPatterns,
} from "../../../components/shared/formUtils";

describe("Form Utilities", () => {
    describe("createInputChangeHandler", () => {
        it("should create handler that sets value without validation", () => {
            const setValue = vi.fn();
            const handler = createInputChangeHandler(setValue);

            const mockEvent = {
                target: { value: "test value" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("test value");
        });

        it("should create handler that sets value with successful validation", () => {
            const setValue = vi.fn();
            const validator = vi.fn().mockReturnValue(true);
            const handler = createInputChangeHandler(setValue, validator);

            const mockEvent = {
                target: { value: "valid value" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(validator).toHaveBeenCalledWith("valid value");
            expect(setValue).toHaveBeenCalledWith("valid value");
        });

        it("should create handler that skips setting value with failed validation", () => {
            const setValue = vi.fn();
            const validator = vi.fn().mockReturnValue(false);
            const handler = createInputChangeHandler(setValue, validator);

            const mockEvent = {
                target: { value: "invalid value" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(validator).toHaveBeenCalledWith("invalid value");
            expect(setValue).not.toHaveBeenCalled();
        });

        it("should handle numeric input values", () => {
            const setValue = vi.fn();
            const handler = createInputChangeHandler<number>(setValue);

            const mockEvent = {
                target: { value: "123" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("123");
        });

        it("should handle empty string values", () => {
            const setValue = vi.fn();
            const handler = createInputChangeHandler(setValue);

            const mockEvent = {
                target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("");
        });

        it("should work with custom validation functions", () => {
            const setValue = vi.fn();
            const minLengthValidator = (value: string) => value.length >= 3;
            const handler = createInputChangeHandler(setValue, minLengthValidator);

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

    describe("createSelectChangeHandler", () => {
        it("should create handler that sets value without conversion", () => {
            const setValue = vi.fn();
            const handler = createSelectChangeHandler(setValue);

            const mockEvent = {
                target: { value: "option1" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("option1");
        });

        it("should create handler that converts string to number", () => {
            const setValue = vi.fn();
            const converter = (value: string) => Number.parseInt(value, 10);
            const handler = createSelectChangeHandler(setValue, converter);

            const mockEvent = {
                target: { value: "123" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(123);
        });

        it("should create handler that converts string to boolean", () => {
            const setValue = vi.fn();
            const converter = (value: string) => value === "true";
            const handler = createSelectChangeHandler(setValue, converter);

            const mockEvent = {
                target: { value: "true" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(true);
        });

        it("should handle empty select values", () => {
            const setValue = vi.fn();
            const handler = createSelectChangeHandler(setValue);

            const mockEvent = {
                target: { value: "" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith("");
        });

        it("should handle converter that returns complex objects", () => {
            const setValue = vi.fn();
            const converter = (value: string) => ({ id: value, name: `Item ${value}` });
            const handler = createSelectChangeHandler(setValue, converter);

            const mockEvent = {
                target: { value: "1" },
            } as React.ChangeEvent<HTMLSelectElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith({ id: "1", name: "Item 1" });
        });

        it("should handle converter that returns undefined", () => {
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

    describe("createCheckboxChangeHandler", () => {
        it("should create handler that sets checked state to true", () => {
            const setValue = vi.fn();
            const handler = createCheckboxChangeHandler(setValue);

            const mockEvent = {
                target: { checked: true },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(true);
        });

        it("should create handler that sets checked state to false", () => {
            const setValue = vi.fn();
            const handler = createCheckboxChangeHandler(setValue);

            const mockEvent = {
                target: { checked: false },
            } as React.ChangeEvent<HTMLInputElement>;

            handler(mockEvent);

            expect(setValue).toHaveBeenCalledWith(false);
        });

        it("should handle multiple checkbox events", () => {
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
            it("should return true for non-empty strings", () => {
                expect(validationPatterns.nonEmptyString("hello")).toBe(true);
                expect(validationPatterns.nonEmptyString("a")).toBe(true);
                expect(validationPatterns.nonEmptyString("   content   ")).toBe(true);
            });

            it("should return false for empty strings", () => {
                expect(validationPatterns.nonEmptyString("")).toBe(false);
                expect(validationPatterns.nonEmptyString("   ")).toBe(false);
                expect(validationPatterns.nonEmptyString("\t\n")).toBe(false);
            });

            it("should handle special characters and unicode", () => {
                expect(validationPatterns.nonEmptyString("🎉")).toBe(true);
                expect(validationPatterns.nonEmptyString("@#$%")).toBe(true);
                expect(validationPatterns.nonEmptyString("你好")).toBe(true);
            });
        });

        describe("numberInRange", () => {
            it("should create validator that accepts numbers in range", () => {
                const validator = validationPatterns.numberInRange(1, 10);

                expect(validator(1)).toBe(true);
                expect(validator(5)).toBe(true);
                expect(validator(10)).toBe(true);
            });

            it("should create validator that rejects numbers outside range", () => {
                const validator = validationPatterns.numberInRange(1, 10);

                expect(validator(0)).toBe(false);
                expect(validator(11)).toBe(false);
                expect(validator(-5)).toBe(false);
                expect(validator(100)).toBe(false);
            });

            it("should handle negative ranges", () => {
                const validator = validationPatterns.numberInRange(-10, -1);

                expect(validator(-5)).toBe(true);
                expect(validator(-10)).toBe(true);
                expect(validator(-1)).toBe(true);
                expect(validator(0)).toBe(false);
                expect(validator(-11)).toBe(false);
            });

            it("should handle floating point numbers", () => {
                const validator = validationPatterns.numberInRange(0.1, 0.9);

                expect(validator(0.5)).toBe(true);
                expect(validator(0.1)).toBe(true);
                expect(validator(0.9)).toBe(true);
                expect(validator(0.05)).toBe(false);
                expect(validator(1)).toBe(false);
            });

            it("should handle single-point range", () => {
                const validator = validationPatterns.numberInRange(5, 5);

                expect(validator(5)).toBe(true);
                expect(validator(4)).toBe(false);
                expect(validator(6)).toBe(false);
            });
        });

        describe("oneOfNumbers", () => {
            it("should create validator that accepts allowed numbers", () => {
                const validator = validationPatterns.oneOfNumbers([1, 3, 5, 7]);

                expect(validator(1)).toBe(true);
                expect(validator(3)).toBe(true);
                expect(validator(5)).toBe(true);
                expect(validator(7)).toBe(true);
            });

            it("should create validator that rejects non-allowed numbers", () => {
                const validator = validationPatterns.oneOfNumbers([1, 3, 5, 7]);

                expect(validator(2)).toBe(false);
                expect(validator(4)).toBe(false);
                expect(validator(6)).toBe(false);
                expect(validator(8)).toBe(false);
                expect(validator(0)).toBe(false);
            });

            it("should handle empty array", () => {
                const validator = validationPatterns.oneOfNumbers([]);

                expect(validator(1)).toBe(false);
                expect(validator(0)).toBe(false);
                expect(validator(-1)).toBe(false);
            });

            it("should handle negative numbers", () => {
                const validator = validationPatterns.oneOfNumbers([-1, -5, -10]);

                expect(validator(-1)).toBe(true);
                expect(validator(-5)).toBe(true);
                expect(validator(-10)).toBe(true);
                expect(validator(1)).toBe(false);
                expect(validator(0)).toBe(false);
            });

            it("should handle floating point numbers", () => {
                const validator = validationPatterns.oneOfNumbers([1.5, 2.7, 3.14]);

                expect(validator(1.5)).toBe(true);
                expect(validator(2.7)).toBe(true);
                expect(validator(3.14)).toBe(true);
                expect(validator(1.4)).toBe(false);
                expect(validator(3)).toBe(false);
            });
        });

        describe("oneOfStrings", () => {
            it("should create validator that accepts allowed strings", () => {
                const validator = validationPatterns.oneOfStrings(["red", "green", "blue"]);

                expect(validator("red")).toBe(true);
                expect(validator("green")).toBe(true);
                expect(validator("blue")).toBe(true);
            });

            it("should create validator that rejects non-allowed strings", () => {
                const validator = validationPatterns.oneOfStrings(["red", "green", "blue"]);

                expect(validator("yellow")).toBe(false);
                expect(validator("purple")).toBe(false);
                expect(validator("")).toBe(false);
                expect(validator("Red")).toBe(false); // Case sensitive
            });

            it("should handle empty array", () => {
                const validator = validationPatterns.oneOfStrings([]);

                expect(validator("anything")).toBe(false);
                expect(validator("")).toBe(false);
            });

            it("should handle empty strings in allowed values", () => {
                const validator = validationPatterns.oneOfStrings(["", "option1", "option2"]);

                expect(validator("")).toBe(true);
                expect(validator("option1")).toBe(true);
                expect(validator("option2")).toBe(true);
                expect(validator("option3")).toBe(false);
            });

            it("should handle special characters and unicode", () => {
                const validator = validationPatterns.oneOfStrings(["@#$%", "你好", "🎉"]);

                expect(validator("@#$%")).toBe(true);
                expect(validator("你好")).toBe(true);
                expect(validator("🎉")).toBe(true);
                expect(validator("hello")).toBe(false);
            });

            it("should be case sensitive", () => {
                const validator = validationPatterns.oneOfStrings(["Hello", "World"]);

                expect(validator("Hello")).toBe(true);
                expect(validator("World")).toBe(true);
                expect(validator("hello")).toBe(false);
                expect(validator("world")).toBe(false);
                expect(validator("HELLO")).toBe(false);
            });
        });
    });

    describe("Integration scenarios", () => {
        it("should work with multiple handlers together", () => {
            const setName = vi.fn();
            const setAge = vi.fn();
            const setActive = vi.fn();

            const nameHandler = createInputChangeHandler(setName, validationPatterns.nonEmptyString);
            const ageHandler = createSelectChangeHandler(setAge, (value) => Number.parseInt(value, 10));
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

        it("should handle complex validation workflows", () => {
            const setValue = vi.fn();
            const rangeValidator = validationPatterns.numberInRange(1, 100);
            const allowedValidator = validationPatterns.oneOfNumbers([10, 20, 30, 40, 50]);

            // Combined validation for string inputs that represent numbers
            const combinedValidator = (value: string) => {
                const numValue = Number.parseInt(value, 10);
                return !Number.isNaN(numValue) && rangeValidator(numValue) && allowedValidator(numValue);
            };

            const handler = createInputChangeHandler(setValue, combinedValidator);

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
});
