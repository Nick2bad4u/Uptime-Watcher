/**
 * @module shared/utils/typeHelpers.test
 *
 * @file Direct function call tests for typeHelpers to ensure coverage
 */

import { describe, expect, it } from "vitest";
import {
    castIpcResponse,
    isArray,
    isRecord,
    safePropertyAccess,
    validateAndConvert,
} from "@shared/utils/typeHelpers";

describe("typeHelpers Direct Function Coverage", () => {
    it("should call castIpcResponse function", () => {
        const result = castIpcResponse<string>("test");
        expect(typeof result).toBe("string");
        expect(result).toBe("test");
    });

    it("should call isArray function", () => {
        expect(isArray([])).toBeTruthy();
        expect(
            isArray([
                1,
                2,
                3,
            ])
        ).toBeTruthy();
        expect(isArray("not array")).toBeFalsy();
        expect(isArray({})).toBeFalsy();
    });

    it("should call isRecord function", () => {
        expect(isRecord({})).toBeTruthy();
        expect(isRecord({ a: 1 })).toBeTruthy();
        expect(isRecord(null)).toBeFalsy();
        expect(isRecord([])).toBeFalsy();
    });

    it("should call safePropertyAccess function", () => {
        const obj = { name: "test" };
        expect(safePropertyAccess(obj, "name")).toBe("test");
        expect(safePropertyAccess(obj, "missing")).toBeUndefined();
        expect(safePropertyAccess(null, "name")).toBeUndefined();
    });

    it("should call validateAndConvert function", () => {
        const validator = (val: unknown): val is string =>
            typeof val === "string";
        expect(validateAndConvert("test", validator)).toBe("test");
        // The function throws on invalid input, so we need to test that
        expect(() => validateAndConvert(123, validator)).toThrowError(
            "Type validation failed"
        );
    });
});
