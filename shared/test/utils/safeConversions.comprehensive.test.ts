/**
 * Comprehensive function coverage tests for shared/utils/safeConversions.ts
 *
 * Tests every exported function to ensure 100% function coverage
 */

import { describe, it, expect } from "vitest";
import {
    safeNumberConversion,
    safeParseCheckInterval,
    safeParseFloat,
    safeParseInt,
    safeParsePercentage,
    safeParsePort,
    safeParsePositiveInt,
    safeParseRetryAttempts,
    safeParseTimeout,
    safeParseTimestamp,
} from "@shared/utils/safeConversions";

describe("safeConversions - Complete Function Coverage", () => {
    describe("safeNumberConversion", () => {
        it("should test safeNumberConversion function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeNumberConversion(42)).toBe(42);
            expect(safeNumberConversion("42")).toBe(42);
            expect(safeNumberConversion("invalid", 10)).toBe(10);
            expect(safeNumberConversion(null, 5)).toBe(5);
            expect(safeNumberConversion(undefined)).toBe(0);
        });
    });

    describe("safeParseCheckInterval", () => {
        it("should test safeParseCheckInterval function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeParseCheckInterval(60000)).toBe(60000);
            expect(safeParseCheckInterval("60000")).toBe(60000);
            expect(safeParseCheckInterval(60)).toBe(300000); // below minimum
            expect(safeParseCheckInterval("invalid")).toBe(300000);
            expect(safeParseCheckInterval(null)).toBe(300000);
        });
    });

    describe("safeParseFloat", () => {
        it("should test safeParseFloat function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeParseFloat(3.14)).toBe(3.14);
            expect(safeParseFloat("3.14")).toBe(3.14);
            expect(safeParseFloat("invalid", 1.5)).toBe(1.5);
            expect(safeParseFloat(null, 2.5)).toBe(2.5);
            expect(safeParseFloat(undefined)).toBe(0);
        });
    });

    describe("safeParseInt", () => {
        it("should test safeParseInt function", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeParseInt(42)).toBe(42);
            expect(safeParseInt("42")).toBe(42);
            expect(safeParseInt(3.14)).toBe(3);
            expect(safeParseInt("invalid", 10)).toBe(10);
            expect(safeParseInt(null, 5)).toBe(5);
            expect(safeParseInt(undefined)).toBe(0);
        });
    });

    describe("safeParsePercentage", () => {
        it("should test safeParsePercentage function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeParsePercentage(50)).toBe(50);
            expect(safeParsePercentage("75")).toBe(75);
            expect(safeParsePercentage(150)).toBe(100); // clamped to max
            expect(safeParsePercentage(-10)).toBe(0); // clamped to min
            expect(safeParsePercentage("invalid", 25)).toBe(25);
            expect(safeParsePercentage(null)).toBe(0);
        });
    });

    describe("safeParsePort", () => {
        it("should test safeParsePort function", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeParsePort(443)).toBe(443);
            expect(safeParsePort("8080")).toBe(8080);
            expect(safeParsePort(0)).toBe(80); // invalid port
            expect(safeParsePort(65536)).toBe(80); // invalid port
            expect(safeParsePort("invalid", 3000)).toBe(3000);
            expect(safeParsePort(null)).toBe(80);
        });
    });

    describe("safeParsePositiveInt", () => {
        it("should test safeParsePositiveInt function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeParsePositiveInt(5)).toBe(5);
            expect(safeParsePositiveInt("10")).toBe(10);
            expect(safeParsePositiveInt(0)).toBe(1); // forced to positive
            expect(safeParsePositiveInt(-5)).toBe(1); // forced to positive
            expect(safeParsePositiveInt("invalid", 3)).toBe(3);
            expect(safeParsePositiveInt(null)).toBe(1);
        });
    });

    describe("safeParseRetryAttempts", () => {
        it("should test safeParseRetryAttempts function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeParseRetryAttempts(3)).toBe(3);
            expect(safeParseRetryAttempts("5")).toBe(5);
            expect(safeParseRetryAttempts(0)).toBe(0); // valid minimum
            expect(safeParseRetryAttempts(20)).toBe(3); // above maximum
            expect(safeParseRetryAttempts("invalid")).toBe(3);
            expect(safeParseRetryAttempts(null)).toBe(3);
        });
    });

    describe("safeParseTimeout", () => {
        it("should test safeParseTimeout function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeParseTimeout(5000)).toBe(5000);
            expect(safeParseTimeout("10000")).toBe(10000);
            expect(safeParseTimeout(500)).toBe(500); // positive values pass through
            expect(safeParseTimeout(0)).toBe(10000); // zero is invalid
            expect(safeParseTimeout(-1000)).toBe(10000); // negative is invalid
            expect(safeParseTimeout("invalid")).toBe(10000);
            expect(safeParseTimeout(null)).toBe(10000);
        });
    });

    describe("safeParseTimestamp", () => {
        it("should test safeParseTimestamp function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: safeConversions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const now = Date.now();
            const dateObject = new Date(now);
            expect(safeParseTimestamp(now)).toBe(now);
            expect(safeParseTimestamp(now.toString())).toBe(now);
            // Use the same timestamp value for comparison to avoid timing issues
            expect(safeParseTimestamp(dateObject)).toBe(now);
            expect(safeParseTimestamp(-1) > 0).toBe(true); // negative returns current time
            expect(safeParseTimestamp("invalid", now)).toBe(now);
            expect(safeParseTimestamp(null) > 0).toBe(true); // null returns current time
        });
    });
});
