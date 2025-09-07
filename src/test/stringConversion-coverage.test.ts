/**
 * @module shared/utils/stringConversion.test
 *
 * @file Direct function call tests for stringConversion to ensure coverage
 */

import { describe, expect, it } from "vitest";
import { safeStringify } from "@shared/utils/stringConversion";

describe("stringConversion Direct Function Coverage", () => {
    it("should call safeStringify function with various types", () => {
        // Test all types to ensure coverage
        expect(safeStringify(null)).toBe("");
        expect(safeStringify(undefined)).toBe("");
        expect(safeStringify("hello")).toBe("hello");
        expect(safeStringify(42)).toBe("42");
        expect(safeStringify(true)).toBe("true");
        expect(safeStringify(BigInt(123))).toBe("123");
        expect(safeStringify({ a: 1 })).toContain("1");
        expect(safeStringify(() => {})).toBe("[Function]");
        expect(safeStringify(Symbol("test"))).toContain("test");
    });
});
