/**
 * Complete function coverage tests for shared/utils/stringConversion.ts
 *
 * @description
 * Tests all exported functions to achieve 100% function coverage
 */

import { describe, it, expect } from "vitest";
import { safeStringify } from "../../utils/stringConversion";

describe("shared/utils/stringConversion.ts - Complete Function Coverage", () => {
  describe("safeStringify", () => {
    it("should return empty string for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify(null)).toBe("");
    });

    it("should return empty string for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify(undefined)).toBe("");
    });

    it("should return string as-is", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify("hello")).toBe("hello");
      expect(safeStringify("")).toBe("");
      expect(safeStringify("  ")).toBe("  ");
    });

    it("should convert numbers to strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify(42)).toBe("42");
      expect(safeStringify(0)).toBe("0");
      expect(safeStringify(-123)).toBe("-123");
      expect(safeStringify(3.14)).toBe("3.14");
      expect(safeStringify(NaN)).toBe("NaN");
      expect(safeStringify(Infinity)).toBe("Infinity");
      expect(safeStringify(-Infinity)).toBe("-Infinity");
    });

    it("should convert booleans to strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify(true)).toBe("true");
      expect(safeStringify(false)).toBe("false");
    });

    it("should convert bigints to strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify(123n)).toBe("123");
      expect(safeStringify(BigInt(456))).toBe("456");
      expect(safeStringify(0n)).toBe("0");
    });

    it("should return '[Function]' for functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify(() => {})).toBe("[Function]");
      expect(safeStringify(function() {})).toBe("[Function]");
      expect(safeStringify(console.log)).toBe("[Function]");
      expect(safeStringify(Date)).toBe("[Function]");
    });

    it("should convert symbols to strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      const symbol1 = Symbol("test");
      const symbol2 = Symbol.for("global");
      const symbol3 = Symbol();

      expect(safeStringify(symbol1)).toBe("Symbol(test)");
      expect(safeStringify(symbol2)).toBe("Symbol(global)");
      expect(safeStringify(symbol3)).toBe("Symbol()");
    });

    it("should convert simple objects to JSON strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify({})).toBe("{}");
      expect(safeStringify({ a: 1 })).toBe('{"a":1}');
      expect(safeStringify({ name: "test", value: 42 })).toBe('{"name":"test","value":42}');
      expect(safeStringify([])).toBe("[]");
      expect(safeStringify([1, 2, 3])).toBe("[1,2,3]");
    });

    it("should handle complex objects with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      // Create circular reference
      const circular: any = { name: "circular" };
      circular.self = circular;

      expect(safeStringify(circular)).toBe("[Complex Object]");
    });

    it("should handle special object types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify(new Date("2023-01-01"))).toContain("2023-01-01");
      expect(safeStringify(new RegExp("test"))).toBe('{}'); // RegExp serializes to empty object
      expect(safeStringify(new Error("test"))).toBe('{}'); // Error serializes to empty object
    });

    it("should handle nested objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      const nested = {
        level1: {
          level2: {
            value: "deep"
          }
        }
      };

      expect(safeStringify(nested)).toBe('{"level1":{"level2":{"value":"deep"}}}');
    });

    it("should handle arrays with mixed types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      const mixed = [1, "string", true, null, { key: "value" }];
      expect(safeStringify(mixed)).toBe('[1,"string",true,null,{"key":"value"}]');
    });

    it("should handle edge cases", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      // Test coverage for the undefined case in switch (though it's handled earlier)
      expect(safeStringify(undefined)).toBe("");

      // Test the default case by creating an unknown type scenario
      // This is difficult to test directly since all JS types are covered
      // But we can at least verify the function handles all expected types
      expect(typeof safeStringify("any")).toBe("string");
    });

    it("should handle objects with toJSON method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      const objWithToJSON = {
        name: "test",
        value: 123,
        toJSON() {
          return { custom: "serialization" };
        }
      };

      expect(safeStringify(objWithToJSON)).toBe('{"custom":"serialization"}');
    });

    it("should handle non-serializable objects gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      // Create an object that throws during serialization
      const problematicObj = {
        get problematic() {
          throw new Error("Cannot access this property");
        }
      };

      expect(safeStringify(problematicObj)).toBe("[Complex Object]");
    });

    it("should handle very large numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      expect(safeStringify(Number.MAX_SAFE_INTEGER)).toBe(String(Number.MAX_SAFE_INTEGER));
      expect(safeStringify(Number.MIN_SAFE_INTEGER)).toBe(String(Number.MIN_SAFE_INTEGER));
      expect(safeStringify(Number.MAX_VALUE)).toBe(String(Number.MAX_VALUE));
    });

    it("should preserve string content exactly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: stringConversion-complete-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

      const specialStrings = [
        "{}",
        "[]",
        "null",
        "undefined",
        "true",
        "false",
        "0",
        '{"json":"string"}',
        "[1,2,3]"
      ];

      specialStrings.forEach(str => {
        expect(safeStringify(str)).toBe(str);
      });
    });
  });
});
