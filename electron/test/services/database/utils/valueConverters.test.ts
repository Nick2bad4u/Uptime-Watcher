/**
 * Tests for database value conversion helpers used by repository mappers.
 */

import { describe, expect, it } from "vitest";

import {
    convertToDbValue,
    type DbValue,
    safeNumberConvert,
} from "../../../../services/database/utils/converters/valueConverters";

describe("Value Converters Utility", () => {
    describe("DbValue Type", () => {
        it("accepts SQLite-bindable primitive values", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const values: DbValue[] = [
                null,
                123,
                "string",
                0,
                -1,
                3.14,
                "",
            ];

            expect(values).toHaveLength(7);
            expect(values[0]).toBeNull();
            expect(typeof values[1]).toBe("number");
            expect(typeof values[2]).toBe("string");
        });
    });

    describe(convertToDbValue, () => {
        it("passes through strings, finite numbers, and null", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(convertToDbValue("value")).toBe("value");
            expect(convertToDbValue("")).toBe("");
            expect(convertToDbValue(42)).toBe(42);
            expect(convertToDbValue(0)).toBe(0);
            expect(convertToDbValue(-3.14)).toBe(-3.14);
            expect(convertToDbValue(null)).toBeNull();
        });

        it("converts booleans to SQLite integer values", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(convertToDbValue(true)).toBe(1);
            expect(convertToDbValue(false)).toBe(0);
        });

        it("rejects values that cannot be safely bound", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(convertToDbValue(Infinity)).toBeUndefined();
            expect(convertToDbValue(-Infinity)).toBeUndefined();
            expect(convertToDbValue(NaN)).toBeUndefined();
            expect(convertToDbValue(undefined)).toBeUndefined();
            expect(convertToDbValue({ value: "object" })).toBeUndefined();
            expect(convertToDbValue(["array"])).toBeUndefined();
        });
    });

    describe(safeNumberConvert, () => {
        it("preserves finite numbers", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert(42)).toBe(42);
            expect(safeNumberConvert(0)).toBe(0);
            expect(safeNumberConvert(-100)).toBe(-100);
            expect(safeNumberConvert(19.99)).toBe(19.99);
        });

        it("converts strict decimal strings after trimming", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert("42")).toBe(42);
            expect(safeNumberConvert("  42.5  ")).toBe(42.5);
            expect(safeNumberConvert("-100")).toBe(-100);
            expect(safeNumberConvert("+7")).toBe(7);
        });

        it("rejects non-finite and non-decimal values", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert(Infinity)).toBeUndefined();
            expect(safeNumberConvert(-Infinity)).toBeUndefined();
            expect(safeNumberConvert(NaN)).toBeUndefined();
            expect(safeNumberConvert("")).toBeUndefined();
            expect(safeNumberConvert(" ".repeat(3))).toBeUndefined();
            expect(safeNumberConvert("Infinity")).toBeUndefined();
            expect(safeNumberConvert("1e3")).toBeUndefined();
            expect(safeNumberConvert("0x10")).toBeUndefined();
            expect(safeNumberConvert("abc")).toBeUndefined();
            expect(safeNumberConvert(null)).toBeUndefined();
            expect(safeNumberConvert(undefined)).toBeUndefined();
            expect(safeNumberConvert({ value: 1 })).toBeUndefined();
        });
    });
});
