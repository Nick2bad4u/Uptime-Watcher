/**
 * Complete function coverage tests for shared/utils/typeGuards.ts and typeHelpers.ts
 *
 * @description
 * Tests all exported functions to achieve 100% function coverage
 */

import { describe, it, expect } from "vitest";

// TypeGuards imports
import {
  isObject,
  isNumber,
  hasProperties,
  hasProperty,
  isArray,
  isBoolean,
  isDate,
  isError,
  isFiniteNumber,
  isFunction,
  isNonNegativeNumber,
  isNonNullObject,
  isPositiveNumber,
  isString,
  isValidPort,
  isValidTimestamp,
} from "../../utils/typeGuards";

// TypeHelpers imports
import {
  castIpcResponse,
  isArray as isArrayHelper,
  isRecord,
  safePropertyAccess,
  validateAndConvert,
} from "../../utils/typeHelpers";

describe("shared/utils/typeGuards.ts - Complete Function Coverage", () => {
  describe("isObject", () => {
    it("should return true for plain objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: "value" })).toBe(true);
      expect(isObject(Object.create(null))).toBe(true);
    });

    it("should return false for non-objects", () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject(() => {})).toBe(false);
    });
  });

  describe("isNumber", () => {
    it("should return true for valid numbers", () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
    });

    it("should return false for NaN and non-numbers", () => {
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber("123")).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
    });
  });

  describe("hasProperties", () => {
    it("should return true when object has all specified properties", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(hasProperties(obj, ["a", "b"])).toBe(true);
      expect(hasProperties(obj, ["a"])).toBe(true);
      expect(hasProperties(obj, [])).toBe(true);
    });

    it("should return false when object is missing properties", () => {
      const obj = { a: 1, b: 2 };
      expect(hasProperties(obj, ["a", "c"])).toBe(false);
      expect(hasProperties(obj, ["d"])).toBe(false);
    });

    it("should return false for non-objects", () => {
      expect(hasProperties(null, ["a"])).toBe(false);
      expect(hasProperties("string", ["length"])).toBe(false);
      expect(hasProperties(123, ["toString"])).toBe(false);
    });
  });

  describe("hasProperty", () => {
    it("should return true when object has specified property", () => {
      const obj = { a: 1, b: undefined };
      expect(hasProperty(obj, "a")).toBe(true);
      expect(hasProperty(obj, "b")).toBe(true); // undefined values still count as having the property
    });

    it("should return false when object doesn't have property", () => {
      const obj = { a: 1 };
      expect(hasProperty(obj, "b")).toBe(false);
    });

    it("should return false for non-objects", () => {
      expect(hasProperty(null, "a")).toBe(false);
      expect(hasProperty(undefined, "a")).toBe(false);
      expect(hasProperty("string", "length")).toBe(false);
    });
  });

  describe("isArray", () => {
    it("should return true for arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(new Array(5))).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArray({})).toBe(false);
      expect(isArray("string")).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });

    it("should validate array item types when itemValidator provided", () => {
      const isString = (value: unknown): value is string => typeof value === "string";
      expect(isArray(["a", "b", "c"], isString)).toBe(true);
      expect(isArray(["a", 1, "c"], isString)).toBe(false);
      expect(isArray([], isString)).toBe(true); // empty array is valid
    });
  });

  describe("isBoolean", () => {
    it("should return true for booleans", () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it("should return false for non-booleans", () => {
      expect(isBoolean("true")).toBe(false);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
    });
  });

  describe("isDate", () => {
    it("should return true for valid dates", () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date("2023-01-01"))).toBe(true);
    });

    it("should return false for invalid dates and non-dates", () => {
      expect(isDate(new Date("invalid"))).toBe(false);
      expect(isDate("2023-01-01")).toBe(false);
      expect(isDate(null)).toBe(false);
      expect(isDate({})).toBe(false);
    });
  });

  describe("isError", () => {
    it("should return true for Error instances", () => {
      expect(isError(new Error("test"))).toBe(true);
      expect(isError(new TypeError("test"))).toBe(true);
      expect(isError(new RangeError("test"))).toBe(true);
    });

    it("should return false for non-errors", () => {
      expect(isError("error")).toBe(false);
      expect(isError({ message: "error" })).toBe(false);
      expect(isError(null)).toBe(false);
    });
  });

  describe("isFiniteNumber", () => {
    it("should return true for finite numbers", () => {
      expect(isFiniteNumber(42)).toBe(true);
      expect(isFiniteNumber(0)).toBe(true);
      expect(isFiniteNumber(-123)).toBe(true);
      expect(isFiniteNumber(3.14)).toBe(true);
    });

    it("should return false for infinite numbers and non-numbers", () => {
      expect(isFiniteNumber(Infinity)).toBe(false);
      expect(isFiniteNumber(-Infinity)).toBe(false);
      expect(isFiniteNumber(NaN)).toBe(false);
      expect(isFiniteNumber("123")).toBe(false);
      expect(isFiniteNumber(null)).toBe(false);
    });
  });

  describe("isFunction", () => {
    it("should return true for functions", () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction(Date)).toBe(true);
      expect(isFunction(console.log)).toBe(true);
    });

    it("should return false for non-functions", () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction("function")).toBe(false);
      expect(isFunction(null)).toBe(false);
      expect(isFunction(123)).toBe(false);
    });
  });

  describe("isNonNegativeNumber", () => {
    it("should return true for non-negative numbers", () => {
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(42)).toBe(true);
      expect(isNonNegativeNumber(3.14)).toBe(true);
    });

    it("should return false for negative numbers and non-numbers", () => {
      expect(isNonNegativeNumber(-1)).toBe(false);
      expect(isNonNegativeNumber(-123)).toBe(false);
      expect(isNonNegativeNumber("42")).toBe(false);
      expect(isNonNegativeNumber(NaN)).toBe(false);
    });
  });

  describe("isNonNullObject", () => {
    it("should return true for non-null objects", () => {
      expect(isNonNullObject({})).toBe(true);
      expect(isNonNullObject({ key: "value" })).toBe(true);
      expect(isNonNullObject(new Date())).toBe(true); // Date objects are non-null objects
    });

    it("should return false for null and non-objects", () => {
      expect(isNonNullObject(null)).toBe(false);
      expect(isNonNullObject(undefined)).toBe(false);
      expect(isNonNullObject("string")).toBe(false);
      expect(isNonNullObject(123)).toBe(false);
      expect(isNonNullObject([])).toBe(false); // Arrays are excluded by isObject
    });
  });

  describe("isPositiveNumber", () => {
    it("should return true for positive numbers", () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(42)).toBe(true);
      expect(isPositiveNumber(3.14)).toBe(true);
    });

    it("should return false for zero, negative numbers, and non-numbers", () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber("42")).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
    });
  });

  describe("isString", () => {
    it("should return true for strings", () => {
      expect(isString("hello")).toBe(true);
      expect(isString("")).toBe(true);
      expect(isString(" ")).toBe(true);
    });

    it("should return false for non-strings", () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
    });
  });

  describe("isValidPort", () => {
    it("should return true for valid port numbers", () => {
      expect(isValidPort(80)).toBe(true);
      expect(isValidPort(443)).toBe(true);
      expect(isValidPort(8080)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
    });

    it("should return false for invalid port numbers", () => {
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(-1)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort(3.14)).toBe(false);
      expect(isValidPort("80")).toBe(false);
      expect(isValidPort(NaN)).toBe(false);
    });
  });

  describe("isValidTimestamp", () => {
    it("should return true for valid timestamps", () => {
      expect(isValidTimestamp(Date.now())).toBe(true);
      expect(isValidTimestamp(1640995200000)).toBe(true); // 2022-01-01
      expect(isValidTimestamp(1)).toBe(true); // Minimum valid timestamp
    });

    it("should return false for invalid timestamps", () => {
      expect(isValidTimestamp(0)).toBe(false); // Must be > 0
      expect(isValidTimestamp(-1)).toBe(false);
      expect(isValidTimestamp(NaN)).toBe(false);
      expect(isValidTimestamp(Infinity)).toBe(false);
      expect(isValidTimestamp("1640995200000")).toBe(false);
      expect(isValidTimestamp(null)).toBe(false);
      expect(isValidTimestamp(Date.now() + 90_000_000)).toBe(false); // Too far in future
    });
  });
});

describe("shared/utils/typeHelpers.ts - Complete Function Coverage", () => {
  describe("castIpcResponse", () => {
    it("should cast response when validation passes", () => {
      const response = { success: true, data: "test" };
      const validator = (value: unknown): value is { success: boolean; data: string } => {
        return typeof value === "object" && value !== null &&
               "success" in value && "data" in value;
      };

      const result = castIpcResponse(response, validator);
      expect(result).toEqual(response);
    });

    it("should throw error when validation fails", () => {
      const response = { invalid: true };
      const validator = (value: unknown): value is { success: boolean } => {
        return typeof value === "object" && value !== null && "success" in value;
      };

      expect(() => castIpcResponse(response, validator)).toThrow();
    });

    it("should throw error for null response", () => {
      const validator = (value: unknown): value is string => typeof value === "string";
      expect(() => castIpcResponse(null, validator)).toThrow();
    });
  });

  describe("isArrayHelper", () => {
    it("should return true for arrays", () => {
      expect(isArrayHelper([])).toBe(true);
      expect(isArrayHelper([1, 2, 3])).toBe(true);
      expect(isArrayHelper(new Array(5))).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArrayHelper({})).toBe(false);
      expect(isArrayHelper("string")).toBe(false);
      expect(isArrayHelper(null)).toBe(false);
      expect(isArrayHelper(undefined)).toBe(false);
    });
  });

  describe("isRecord", () => {
    it("should return true for plain objects", () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ key: "value" })).toBe(true);
      expect(isRecord(Object.create(null))).toBe(true);
      expect(isRecord(new Date())).toBe(true); // Date objects are records per isRecord logic
    });

    it("should return false for non-objects and arrays", () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord(undefined)).toBe(false);
      expect(isRecord("string")).toBe(false);
      expect(isRecord(123)).toBe(false);
      expect(isRecord([])).toBe(false); // Arrays are excluded
    });
  });

  describe("safePropertyAccess", () => {
    it("should return property value when object has the property", () => {
      const obj = { name: "test", value: 42 };
      expect(safePropertyAccess(obj, "name")).toBe("test");
      expect(safePropertyAccess(obj, "value")).toBe(42);
    });

    it("should return undefined when property doesn't exist", () => {
      const obj = { name: "test" };
      expect(safePropertyAccess(obj, "missing")).toBeUndefined();
    });

    it("should return undefined for non-objects", () => {
      expect(safePropertyAccess(null, "property")).toBeUndefined();
      expect(safePropertyAccess(undefined, "property")).toBeUndefined();
      expect(safePropertyAccess("string", "length")).toBeUndefined();
      expect(safePropertyAccess(123, "toString")).toBeUndefined();
    });

    it("should handle nested property access", () => {
      const obj = { nested: { value: "deep" } };
      expect(safePropertyAccess(obj, "nested")).toEqual({ value: "deep" });
    });
  });

  describe("validateAndConvert", () => {
    it("should return validated value when validation passes", () => {
      const validator = (value: unknown): value is string => typeof value === "string";

      expect(validateAndConvert("test", validator)).toBe("test");
    });

    it("should throw error when validation fails", () => {
      const validator = (value: unknown): value is string => typeof value === "string";

      expect(() => validateAndConvert(123, validator)).toThrow("Type validation failed");
    });

    it("should throw error with custom message when validation fails", () => {
      const validator = (value: unknown): value is string => typeof value === "string";
      const customMessage = "Expected string but got number";

      expect(() => validateAndConvert(123, validator, customMessage)).toThrow(customMessage);
    });

    it("should handle complex type validation", () => {
      const validator = (value: unknown): value is { name: string; age: number } => {
        return typeof value === "object" && value !== null &&
               "name" in value && "age" in value &&
               typeof (value as any).name === "string" &&
               typeof (value as any).age === "number";
      };

      const validObject = { name: "Alice", age: 30 };
      expect(validateAndConvert(validObject, validator)).toEqual(validObject);

      const invalidObject = { name: "Bob" }; // missing age
      expect(() => validateAndConvert(invalidObject, validator)).toThrow();
    });

    it("should work with primitive type validators", () => {
      const numberValidator = (value: unknown): value is number =>
        typeof value === "number" && !isNaN(value);

      expect(validateAndConvert(42, numberValidator)).toBe(42);
      expect(() => validateAndConvert("42", numberValidator)).toThrow();
    });
  });

  describe("Integration tests", () => {
    it("should work together for complex validation scenarios", () => {
      const data = {
        users: [
          { name: "Alice", age: 30 },
          { name: "Bob", age: 25 }
        ]
      };

      // Use multiple type guards together
      expect(isRecord(data)).toBe(true);
      expect(hasProperty(data, "users")).toBe(true);

      const users = safePropertyAccess(data, "users");
      expect(isArrayHelper(users)).toBe(true);

      if (isArrayHelper(users)) {
        expect(users).toHaveLength(2);
        expect(isRecord(users[0])).toBe(true);
      }
    });
  });
});
