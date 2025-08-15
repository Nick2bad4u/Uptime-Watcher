/**
 * Tests for valueConverters utility - Database value conversion functionality
 * Tests all database value converters for proper type conversion and edge
 * cases.
 */

import { describe, it, expect } from "vitest";
import {
    type DbValue,
    addBooleanField,
    addNumberField,
    addStringField,
    convertDateForDb,
    safeNumberConvert,
} from "../../../../services/database/utils/valueConverters";

describe("Value Converters Utility", () => {
    describe("DbValue Type", () => {
        it("should accept valid DbValue types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const values: DbValue[] = [null, 123, "string", 0, -1, 3.14, ""];

            expect(values).toHaveLength(7);
            expect(values[0]).toBeNull();
            expect(typeof values[1]).toBe("number");
            expect(typeof values[2]).toBe("string");
        });
    });
    describe("addBooleanField", () => {
        it("should add true boolean field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addBooleanField("isEnabled", true, updateFields, updateValues);

            expect(updateFields).toEqual(["isEnabled = ?"]);
            expect(updateValues).toEqual([1]);
        });
        it("should add false boolean field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addBooleanField("isDisabled", false, updateFields, updateValues);

            expect(updateFields).toEqual(["isDisabled = ?"]);
            expect(updateValues).toEqual([0]);
        });
        it("should skip undefined boolean field", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addBooleanField(
                "isOptional",
                undefined,
                updateFields,
                updateValues
            );

            expect(updateFields).toEqual([]);
            expect(updateValues).toEqual([]);
        });
        it("should handle multiple boolean fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addBooleanField("isEnabled", true, updateFields, updateValues);
            addBooleanField("isDisabled", false, updateFields, updateValues);
            addBooleanField(
                "isOptional",
                undefined,
                updateFields,
                updateValues
            );
            addBooleanField("isActive", true, updateFields, updateValues);

            expect(updateFields).toEqual([
                "isEnabled = ?",
                "isDisabled = ?",
                "isActive = ?",
            ]);
            expect(updateValues).toEqual([1, 0, 1]);
        });
        it("should handle field names with special characters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addBooleanField("field_name", true, updateFields, updateValues);
            addBooleanField("field-name", false, updateFields, updateValues);
            addBooleanField("fieldName123", true, updateFields, updateValues);

            expect(updateFields).toEqual([
                "field_name = ?",
                "field-name = ?",
                "fieldName123 = ?",
            ]);
            expect(updateValues).toEqual([1, 0, 1]);
        });
    });
    describe("addNumberField", () => {
        it("should add positive number field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addNumberField("count", 42, updateFields, updateValues);

            expect(updateFields).toEqual(["count = ?"]);
            expect(updateValues).toEqual([42]);
        });
        it("should add zero number field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addNumberField("count", 0, updateFields, updateValues);

            expect(updateFields).toEqual(["count = ?"]);
            expect(updateValues).toEqual([0]);
        });
        it("should add negative number field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addNumberField("balance", -100, updateFields, updateValues);

            expect(updateFields).toEqual(["balance = ?"]);
            expect(updateValues).toEqual([-100]);
        });
        it("should add decimal number field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addNumberField("price", 19.99, updateFields, updateValues);

            expect(updateFields).toEqual(["price = ?"]);
            expect(updateValues).toEqual([19.99]);
        });
        it("should skip undefined number field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addNumberField("optional", undefined, updateFields, updateValues);

            expect(updateFields).toEqual([]);
            expect(updateValues).toEqual([]);
        });
        it("should handle string numbers by converting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            // TypeScript would normally prevent this, but testing runtime behavior
            addNumberField(
                "converted",
                "123" as any,
                updateFields,
                updateValues
            );

            expect(updateFields).toEqual(["converted = ?"]);
            expect(updateValues).toEqual([123]);
        });
        it("should handle special number values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addNumberField("infinity", Infinity, updateFields, updateValues);
            addNumberField(
                "negInfinity",
                -Infinity,
                updateFields,
                updateValues
            );
            addNumberField("nanValue", Number.NaN, updateFields, updateValues);

            expect(updateFields).toEqual([
                "infinity = ?",
                "negInfinity = ?",
                "nanValue = ?",
            ]);
            expect(updateValues).toEqual([Infinity, -Infinity, Number.NaN]);
        });
    });
    describe("addStringField", () => {
        it("should add string field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addStringField("name", "John Doe", updateFields, updateValues);

            expect(updateFields).toEqual(["name = ?"]);
            expect(updateValues).toEqual(["John Doe"]);
        });
        it("should add empty string field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addStringField("description", "", updateFields, updateValues);

            expect(updateFields).toEqual(["description = ?"]);
            expect(updateValues).toEqual([""]);
        });
        it("should skip undefined string field", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addStringField("optional", undefined, updateFields, updateValues);

            expect(updateFields).toEqual([]);
            expect(updateValues).toEqual([]);
        });
        it("should handle special characters in strings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            addStringField(
                "special",
                "Special chars: @#$%^&*()",
                updateFields,
                updateValues
            );
            addStringField(
                "unicode",
                "Unicode: 🚀 ñ ç",
                updateFields,
                updateValues
            );
            addStringField(
                "quotes",
                `Quotes: "Hello" 'World'`,
                updateFields,
                updateValues
            );

            expect(updateFields).toEqual([
                "special = ?",
                "unicode = ?",
                "quotes = ?",
            ]);
            expect(updateValues).toEqual([
                "Special chars: @#$%^&*()",
                "Unicode: 🚀 ñ ç",
                `Quotes: "Hello" 'World'`,
            ]);
        });
        it("should handle non-string values by converting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            // TypeScript would normally prevent this, but testing runtime behavior
            addStringField("converted", 123 as any, updateFields, updateValues);
            addStringField("boolean", true as any, updateFields, updateValues);

            expect(updateFields).toEqual(["converted = ?", "boolean = ?"]);
            expect(updateValues).toEqual(["123", "true"]);
        });
        it("should handle very long strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            const longString = "a".repeat(1000);
            addStringField("longText", longString, updateFields, updateValues);

            expect(updateFields).toEqual(["longText = ?"]);
            expect(updateValues).toEqual([longString]);
        });
    });
    describe("convertDateForDb", () => {
        it("should convert Date object to ISO string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const date = new Date("2023-12-25T10:30:00.000Z");
            const result = convertDateForDb(date);

            expect(result).toBe("2023-12-25T10:30:00.000Z");
        });
        it("should preserve string dates as-is", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const dateString = "2023-12-25T10:30:00.000Z";
            const result = convertDateForDb(dateString);

            expect(result).toBe(dateString);
        });
        it("should return null for null input", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const result = convertDateForDb(null);
            expect(result).toBeNull();
        });
        it("should return null for undefined input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const result = convertDateForDb(undefined);
            expect(result).toBeNull();
        });
        it("should return null for empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const result = convertDateForDb("");
            expect(result).toBeNull();
        });
        it("should return null for falsy values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(convertDateForDb(false as any)).toBeNull();
            expect(convertDateForDb(0 as any)).toBeNull();
        });
        it("should handle invalid Date objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const invalidDate = new Date("invalid");
            const result = convertDateForDb(invalidDate);

            expect(result).toBe("Invalid Date");
        });
        it("should handle current date", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const now = new Date();
            const result = convertDateForDb(now);

            expect(result).toBe(now.toISOString());
        });
        it("should handle edge case dates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const epoch = new Date(0);
            const result = convertDateForDb(epoch);

            expect(result).toBe("1970-01-01T00:00:00.000Z");
        });
    });
    describe("safeNumberConvert", () => {
        it("should return numbers as-is", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert(42)).toBe(42);
            expect(safeNumberConvert(0)).toBe(0);
            expect(safeNumberConvert(-10)).toBe(-10);
            expect(safeNumberConvert(3.14)).toBe(3.14);
        });
        it("should preserve special number values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert(Infinity)).toBe(Infinity);
            expect(safeNumberConvert(-Infinity)).toBe(-Infinity);
            expect(safeNumberConvert(Number.NaN)).toBeNaN();
        });
        it("should convert valid string numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert("42")).toBe(42);
            expect(safeNumberConvert("0")).toBe(0);
            expect(safeNumberConvert("-10")).toBe(-10);
            expect(safeNumberConvert("3.14")).toBe(3.14);
            expect(safeNumberConvert("1e3")).toBe(1000);
        });
        it("should return undefined for invalid string numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert("not a number")).toBeUndefined();
            expect(safeNumberConvert("abc123")).toBeUndefined();
            expect(safeNumberConvert("123abc")).toBeUndefined();
        });
        it("should return undefined for null and undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert(null)).toBeUndefined();
            expect(safeNumberConvert(undefined)).toBeUndefined();
        });
        it("should return undefined for empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert("")).toBeUndefined();
        });
        it("should convert boolean values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert(true)).toBe(1);
            expect(safeNumberConvert(false)).toBe(0);
        });
        it("should handle array and object conversions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert([42])).toBe(42);
            expect(safeNumberConvert([1, 2, 3])).toBeUndefined(); // NaN case
            expect(safeNumberConvert({})).toBeUndefined(); // NaN case
            expect(safeNumberConvert({ valueOf: () => 42 })).toBe(42);
        });
        it("should handle Date objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const date = new Date("2023-12-25T10:30:00.000Z");
            const timestamp = date.getTime();
            expect(safeNumberConvert(date)).toBe(timestamp);
        });
        it("should handle whitespace strings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert("  42  ")).toBe(42);
            expect(safeNumberConvert("   ")).toBe(0);
            expect(safeNumberConvert("\t\n\r")).toBe(0);
        });
        it("should handle scientific notation", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert("1e-3")).toBe(0.001);
            expect(safeNumberConvert("2.5e2")).toBe(250);
            expect(safeNumberConvert("-1.5e-2")).toBe(-0.015);
        });
        it("should handle hexadecimal and other number formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            expect(safeNumberConvert("0x10")).toBe(16);
            expect(safeNumberConvert("0b1010")).toBe(10);
            expect(safeNumberConvert("0o17")).toBe(15);
        });
    });
    describe("Integration Tests", () => {
        it("should work together in typical database update scenario", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            // Simulate updating a site record
            addStringField("name", "My Website", updateFields, updateValues);
            addStringField(
                "url",
                "https://example.com",
                updateFields,
                updateValues
            );
            addBooleanField("isActive", true, updateFields, updateValues);
            addNumberField("checkInterval", 60_000, updateFields, updateValues);
            addStringField(
                "description",
                undefined,
                updateFields,
                updateValues
            ); // skipped
            addBooleanField(
                "notificationsEnabled",
                false,
                updateFields,
                updateValues
            );

            expect(updateFields).toEqual([
                "name = ?",
                "url = ?",
                "isActive = ?",
                "checkInterval = ?",
                "notificationsEnabled = ?",
            ]);
            expect(updateValues).toEqual([
                "My Website",
                "https://example.com",
                1,
                60_000,
                0,
            ]);
        });
        it("should handle complex value conversion scenario", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: Value Converters Utility", "component");

            const rawData = {
                timestamp: new Date("2023-12-25T10:30:00.000Z"),
                timeout: "5000", // string number
                retries: 3,
                description: undefined,
                isEnabled: true,
            };

            const updateFields: string[] = [];
            const updateValues: DbValue[] = [];

            // Convert and add fields
            const dbTimestamp = convertDateForDb(rawData.timestamp);
            if (dbTimestamp) {
                updateFields.push("timestamp = ?");
                updateValues.push(dbTimestamp);
            }

            const timeout = safeNumberConvert(rawData.timeout);
            if (timeout !== undefined) {
                addNumberField("timeout", timeout, updateFields, updateValues);
            }

            addNumberField(
                "retries",
                rawData.retries,
                updateFields,
                updateValues
            );
            addStringField(
                "description",
                rawData.description,
                updateFields,
                updateValues
            );
            addBooleanField(
                "isEnabled",
                rawData.isEnabled,
                updateFields,
                updateValues
            );

            expect(updateFields).toEqual([
                "timestamp = ?",
                "timeout = ?",
                "retries = ?",
                "isEnabled = ?",
            ]);
            expect(updateValues).toEqual([
                "2023-12-25T10:30:00.000Z",
                5000,
                3,
                1,
            ]);
        });
    });
});
