/**
 * Property-based tests for string conversion utilities using fast-check.
 *
 * @remarks
 * These tests use property-based testing to verify string conversion behavior
 * across a wide range of inputs, ensuring robustness and edge case handling.
 */

import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { safeStringify } from "../../utils/stringConversion";

describe("StringConversion - Property-Based Tests", () => {
    describe("safeStringify function", () => {
        test.prop({
            value: fc.string(),
        })("should return the same string for string inputs", (props) => {
            const result = safeStringify(props.value);

            expect(result).toBe(props.value);
            expect(typeof result).toBe("string");
        });

        test.prop({
            value: fc.integer(),
        })("should convert numbers to string representations", (props) => {
            const result = safeStringify(props.value);

            expect(result).toBe(String(props.value));
            expect(typeof result).toBe("string");
            expect(Number(result)).toBe(props.value);
        });

        test.prop({
            value: fc.float(),
        })("should convert floats to string representations", (props) => {
            const result = safeStringify(props.value);

            expect(typeof result).toBe("string");
            // Handle special float cases
            if (Number.isNaN(props.value)) {
                expect(result).toBe("NaN");
            } else if (Number.isFinite(props.value) === false) {
                expect(result).toMatch(/^-?Infinity$/);
            } else {
                expect(Number(result)).toBeCloseTo(props.value);
            }
        });

        test.prop({
            value: fc.boolean(),
        })("should convert booleans to string representations", (props) => {
            const result = safeStringify(props.value);

            expect(result).toBe(String(props.value));
            expect(typeof result).toBe("string");
            expect(result).toMatch(/^(?:true|false)$/);
        });

        test.prop({
            value: fc.bigInt(),
        })("should convert bigints to string representations", (props) => {
            const result = safeStringify(props.value);

            expect(result).toBe(props.value.toString());
            expect(typeof result).toBe("string");
            // Verify it's a valid bigint string representation
            expect(() => BigInt(result)).not.toThrow();
        });

        test("should handle null and undefined consistently", () => {
            expect(safeStringify(null)).toBe("");
            expect(safeStringify(undefined)).toBe("");
            expect(typeof safeStringify(null)).toBe("string");
            expect(typeof safeStringify(undefined)).toBe("string");
        });

        test.prop({
            obj: fc.record({
                a: fc.integer(),
                b: fc.string(),
                c: fc.boolean(),
            }),
        })("should convert simple objects to JSON strings", (props) => {
            const result = safeStringify(props.obj);

            expect(typeof result).toBe("string");
            expect(result).not.toBe("[object Object]");

            // Should be valid JSON
            expect(() => JSON.parse(result)).not.toThrow();

            // Verify the content is preserved
            const parsed = JSON.parse(result);
            expect(parsed).toEqual(props.obj);
        });

        test.prop({
            arr: fc.array(fc.oneof(fc.integer(), fc.string(), fc.boolean()), {
                minLength: 0,
                maxLength: 10,
            }),
        })("should convert arrays to JSON strings", (props) => {
            const result = safeStringify(props.arr);

            expect(typeof result).toBe("string");
            expect(result).not.toBe("[object Object]");

            // Should be valid JSON
            expect(() => JSON.parse(result)).not.toThrow();

            // Verify the content is preserved
            const parsed = JSON.parse(result);
            expect(parsed).toEqual(props.arr);
        });

        test("should handle functions consistently", () => {
            const testFunctions = [
                () => {},
                function named() {
                    return 42;
                },
                async () => {},
                function* generator() {
                    yield 1;
                },
            ];

            for (const fn of testFunctions) {
                const result = safeStringify(fn);
                expect(result).toBe("[Function]");
                expect(typeof result).toBe("string");
            }
        });

        test("should handle symbols consistently", () => {
            const testSymbols = [
                Symbol("anonymous"),
                Symbol("test"),
                Symbol.for("global"),
                Symbol.iterator,
            ];

            for (const sym of testSymbols) {
                const result = safeStringify(sym);
                expect(typeof result).toBe("string");
                expect(result).toMatch(/^Symbol\(/);
                expect(result).toBe(sym.toString());
            }
        });

        test("should handle circular references gracefully", () => {
            const circular: any = { name: "test" };
            circular.self = circular;

            const result = safeStringify(circular);

            expect(typeof result).toBe("string");
            expect(result).toBe("[Complex Object]");
        });

        test.prop({
            depth: fc.integer({ min: 1, max: 5 }),
        })("should handle nested objects up to reasonable depth", (props) => {
            // Create nested object structure
            let nested: any = { value: "leaf" };
            for (let i = 0; i < props.depth; i++) {
                nested = { level: i, child: nested };
            }

            const result = safeStringify(nested);

            expect(typeof result).toBe("string");
            expect(result).not.toBe("[object Object]");

            // Should be valid JSON for reasonable depths
            if (props.depth <= 3) {
                expect(() => JSON.parse(result)).not.toThrow();
                const parsed = JSON.parse(result);
                expect(parsed).toEqual(nested);
            }
        });

        test("should always return a string type", () => {
            const testValues = [
                null,
                undefined,
                "",
                0,
                false,
                {},
                [],
                () => {},
                Symbol("test"),
                42n,
                new Date(),
                /regex/,
                new Map(),
                new Set(),
            ];

            for (const value of testValues) {
                const result = safeStringify(value);
                expect(typeof result).toBe("string");
            }
        });

        test("should never return undefined or null", () => {
            const testValues = [
                null,
                undefined,
                "",
                0,
                false,
                Number.NaN,
                Infinity,
                -Infinity,
            ];

            for (const value of testValues) {
                const result = safeStringify(value);
                expect(result).not.toBeUndefined();
                expect(result).not.toBeNull();
            }
        });

        test.prop({
            input: fc.anything(),
        })("should handle any arbitrary input without throwing", (props) => {
            expect(() => safeStringify(props.input)).not.toThrow();

            const result = safeStringify(props.input);
            expect(typeof result).toBe("string");
        });

        test("should handle edge cases predictably", () => {
            const edgeCases = [
                [Number.POSITIVE_INFINITY, "Infinity"],
                [Number.NEGATIVE_INFINITY, "-Infinity"],
                [Number.NaN, "NaN"],
                [Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER)],
                [Number.MIN_SAFE_INTEGER, String(Number.MIN_SAFE_INTEGER)],
                [0, "0"],
                [-0, "0"],
                ["", ""],
                [" ", " "],
                ["\n", "\n"],
                ["\t", "\t"],
            ];

            for (const [input, expected] of edgeCases) {
                const result = safeStringify(input);
                expect(result).toBe(expected);
            }
        });
    });
});
