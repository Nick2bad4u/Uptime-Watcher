/**
 * @fileoverview Fuzzing tests for typeHelpers utilities
 * @author AI Generated
 * @since 2024
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect, it, vi } from "vitest";
import {
    castIpcResponse,
    isArray,
    isRecord,
    safePropertyAccess,
    validateAndConvert,
} from "../../utils/typeHelpers";

describe("TypeHelpers utilities fuzzing tests", () => {
    describe("castIpcResponse", () => {
        test.prop([fc.anything()])(
            "should return input when no validator provided",
            (response) => {
                const result = castIpcResponse(response);
                expect(result).toBe(response);
            }
        );

        test.prop([fc.anything()])(
            "should return input when validator returns true",
            (response) => {
                const validator = vi.fn().mockReturnValue(true);
                const result = castIpcResponse(response, validator);

                expect(validator).toHaveBeenCalledWith(response);
                expect(result).toBe(response);
            }
        );

        test.prop([fc.anything()])(
            "should throw when validator returns false",
            (response) => {
                const validator = vi.fn().mockReturnValue(false);

                expect(() => castIpcResponse(response, validator)).toThrow("IPC response validation failed");
                expect(validator).toHaveBeenCalledWith(response);
            }
        );

        test.prop([
            fc.anything(),
            fc.func(fc.boolean())
        ])("should handle any validator function", (response, validatorResult) => {
            const validator = vi.fn().mockReturnValue(validatorResult);

            if (validatorResult) {
                expect(castIpcResponse(response, validator)).toBe(response);
            } else {
                expect(() => castIpcResponse(response, validator)).toThrow();
            }
        });

        it("should have proper TypeScript typing", () => {
            interface TestType {
                id: number;
                name: string;
            }

            const response = { id: 1, name: "test" };
            const validator = (val: unknown): val is TestType =>
                typeof val === "object" && val !== null &&
                typeof (val as any).id === "number" &&
                typeof (val as any).name === "string";

            const result = castIpcResponse<TestType>(response, validator);
            expect(result).toEqual(response);
        });
    });

    describe("isArray", () => {
        test.prop([fc.array(fc.anything())])(
            "should return true for all arrays",
            (arr) => {
                expect(isArray(arr)).toBe(true);
            }
        );

        test.prop([fc.anything().filter(x => !Array.isArray(x))])(
            "should return false for non-arrays",
            (nonArray) => {
                expect(isArray(nonArray)).toBe(false);
            }
        );

        test.prop([fc.anything()])(
            "should never throw errors",
            (value) => {
                expect(() => isArray(value)).not.toThrow();
                expect(typeof isArray(value)).toBe("boolean");
            }
        );

        it("should handle edge cases", () => {
            expect(isArray([])).toBe(true);
            expect(isArray(null)).toBe(false);
            expect(isArray(undefined)).toBe(false);
            expect(isArray({})).toBe(false);
            expect(isArray("")).toBe(false);
            expect(isArray(0)).toBe(false);
            expect(isArray([])).toBe(true);
            expect(isArray([])).toBe(true);
        });

        test.prop([fc.integer({ min: 0, max: 100 })])(
            "should work with arrays of any length",
            (length) => {
                const arr = Array.from({ length });
                expect(isArray(arr)).toBe(true);
            }
        );
    });

    describe("isRecord", () => {
        test.prop([fc.record({})])(
            "should return true for all records",
            (record) => {
                expect(isRecord(record)).toBe(true);
            }
        );

        test.prop([fc.anything().filter(x =>
            typeof x !== "object" || x === null || Array.isArray(x)
        )])(
            "should return false for non-records",
            (nonRecord) => {
                expect(isRecord(nonRecord)).toBe(false);
            }
        );

        test.prop([fc.anything()])(
            "should never throw errors",
            (value) => {
                expect(() => isRecord(value)).not.toThrow();
                expect(typeof isRecord(value)).toBe("boolean");
            }
        );

        it("should handle edge cases", () => {
            expect(isRecord({})).toBe(true);
            expect(isRecord({ a: 1 })).toBe(true);
            expect(isRecord(null)).toBe(false);
            expect(isRecord(undefined)).toBe(false);
            expect(isRecord([])).toBe(false);
            expect(isRecord("")).toBe(false);
            expect(isRecord(0)).toBe(false);
            expect(isRecord(new Date())).toBe(true);
            expect(isRecord(new Error("Test error"))).toBe(true);
        });

        test.prop([fc.record({}, { withDeletedKeys: true })])(
            "should work with records with deleted keys",
            (record) => {
                expect(isRecord(record)).toBe(true);
            }
        );
    });

    describe("safePropertyAccess", () => {
        test.prop([
            fc.string(),
            fc.anything()
        ])("should return property value when it exists", (key, value) => {
            const obj = { [key]: value };

            const result = safePropertyAccess(obj, key);
            expect(result).toBe(value);
        });

        test.prop([
            fc.record({}),
            fc.string()
        ])("should return undefined when property doesn't exist", (obj, key) => {
            fc.pre(!(key in obj));

            const result = safePropertyAccess(obj, key);
            expect(result).toBeUndefined();
        });

        test.prop([
            fc.anything().filter(x => typeof x !== "object" || x === null || Array.isArray(x)),
            fc.string()
        ])("should return undefined for non-records", (nonRecord, key) => {
            const result = safePropertyAccess(nonRecord, key);
            expect(result).toBeUndefined();
        });

        test.prop([
            fc.anything(),
            fc.string()
        ])("should never throw errors", (obj, key) => {
            expect(() => safePropertyAccess(obj, key)).not.toThrow();
        });

        it("should handle special property names", () => {
            const obj = {
                "": "empty string key",
                " ": "space key",
                "special!@#$%^&*()": "special chars",
                "123": "numeric string key",
                toString: "overridden method",
                __proto__: "proto key"
            };

            expect(safePropertyAccess(obj, "")).toBe("empty string key");
            expect(safePropertyAccess(obj, " ")).toBe("space key");
            expect(safePropertyAccess(obj, "special!@#$%^&*()")).toBe("special chars");
            expect(safePropertyAccess(obj, "123")).toBe("numeric string key");
            expect(safePropertyAccess(obj, "toString")).toBe("overridden method");
        });

        test.prop([
            fc.record({ [fc.string()]: fc.anything() }),
            fc.string()
        ])("should work with dynamic property names", (obj, key) => {
            const hasProperty = Object.hasOwn(obj, key);
            const result = safePropertyAccess(obj, key);

            if (hasProperty) {
                expect(result).toBe(obj[key]);
            } else {
                expect(result).toBeUndefined();
            }
        });
    });

    describe("validateAndConvert", () => {
        test.prop([fc.anything()])(
            "should return value when validator returns true",
            (value) => {
                const validator = vi.fn().mockReturnValue(true);
                const result = validateAndConvert(value, validator);

                expect(validator).toHaveBeenCalledWith(value);
                expect(result).toBe(value);
            }
        );

        test.prop([fc.anything()])(
            "should throw when validator returns false",
            (value) => {
                const validator = vi.fn().mockReturnValue(false);

                expect(() => validateAndConvert(value, validator)).toThrow("Type validation failed");
                expect(validator).toHaveBeenCalledWith(value);
            }
        );

        test.prop([
            fc.anything(),
            fc.string()
        ])("should use custom error message when provided", (value, errorMessage) => {
            const validator = vi.fn().mockReturnValue(false);

            expect(() => validateAndConvert(value, validator, errorMessage)).toThrow(errorMessage);
        });

        test.prop([
            fc.anything(),
            fc.func(fc.boolean())
        ])("should handle any validator function", (value, validatorResult) => {
            const validator = vi.fn().mockReturnValue(validatorResult);

            if (validatorResult) {
                expect(validateAndConvert(value, validator)).toBe(value);
            } else {
                expect(() => validateAndConvert(value, validator)).toThrow();
            }
        });

        it("should work with type guard functions", () => {
            const isString = (val: unknown): val is string => typeof val === "string";
            const isNumber = (val: unknown): val is number => typeof val === "number";

            expect(validateAndConvert("test", isString)).toBe("test");
            expect(validateAndConvert(42, isNumber)).toBe(42);

            expect(() => validateAndConvert(42, isString)).toThrow();
            expect(() => validateAndConvert("test", isNumber)).toThrow();
        });

        test.prop([fc.string()])(
            "should preserve type information",
            (str) => {
                const isString = (val: unknown): val is string => typeof val === "string";
                const result = validateAndConvert(str, isString);

                // TypeScript should know result is a string
                expect(typeof result).toBe("string");
                expect(result.length).toBe(str.length);
            }
        );
    });

    describe("Edge cases and integration", () => {
        test.prop([fc.anything()])(
            "all functions should handle any input without crashing",
            (input) => {
                expect(() => isArray(input)).not.toThrow();
                expect(() => isRecord(input)).not.toThrow();
                expect(() => safePropertyAccess(input, "key")).not.toThrow();
            }
        );

        test.prop([fc.anything()])(
            "type guards should be consistent with each other",
            (value) => {
                const arrayResult = isArray(value);
                const recordResult = isRecord(value);

                // Arrays and records are mutually exclusive
                if (arrayResult) {
                    expect(recordResult).toBe(false);
                }
            }
        );

        test.prop([fc.record({ a: fc.anything() }, { requiredKeys: ["a"] })])(
            "safePropertyAccess should work with all record types",
            (record) => {
                fc.pre(isRecord(record));

                const keys = Object.keys(record);
                expect(keys.length).toBeGreaterThan(0); // Ensure we have keys to test

                for (const key of keys) {
                    const result = safePropertyAccess(record, key);
                    expect(result).toBe(record[key]);
                }
            }
        );

        it("should handle complex nested structures", () => {
            const complex = {
                level1: {
                    level2: {
                        level3: [1, 2, 3]
                    }
                },
                array: [{ nested: "object" }],
                nullValue: null,
                undefinedValue: undefined
            };

            expect(isRecord(complex)).toBe(true);
            expect(isRecord(complex.level1)).toBe(true);
            expect(isRecord(complex.level1.level2)).toBe(true);
            expect(isArray(complex.level1.level2.level3)).toBe(true);
            expect(isArray(complex.array)).toBe(true);
            expect(isRecord(complex.array[0])).toBe(true);

            expect(safePropertyAccess(complex, "level1")).toBe(complex.level1);
            expect(safePropertyAccess(complex, "nonexistent")).toBeUndefined();
        });
    });
});
