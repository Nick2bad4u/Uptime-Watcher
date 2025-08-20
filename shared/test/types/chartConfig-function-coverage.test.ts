/**
 * @file Function coverage tests for shared/types/chartConfig.ts
 * 
 * Tests all exported functions to achieve 100% function coverage.
 * Currently shows 50% function coverage - targeting hasPlugins and hasScales functions.
 */

import { describe, expect, it } from "vitest";
import { hasPlugins, hasScales } from "../../types/chartConfig";

describe("Chart Config Function Coverage", () => {
    describe("hasPlugins", () => {
        it("should return true for valid object with plugins", () => {
            const validConfig = {
                plugins: {
                    legend: { display: true }
                }
            };
            expect(hasPlugins(validConfig)).toBe(true);
        });

        it("should return false for null", () => {
            expect(hasPlugins(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(hasPlugins(undefined)).toBe(false);
        });

        it("should return false for object without plugins", () => {
            const invalidConfig = { scales: {} };
            expect(hasPlugins(invalidConfig)).toBe(false);
        });

        it("should return false for object with null plugins", () => {
            const invalidConfig = { plugins: null };
            expect(hasPlugins(invalidConfig)).toBe(false);
        });

        it("should return false for primitive values", () => {
            expect(hasPlugins("string")).toBe(false);
            expect(hasPlugins(123)).toBe(false);
            expect(hasPlugins(true)).toBe(false);
        });
    });

    describe("hasScales", () => {
        it("should return true for valid object with scales", () => {
            const validConfig = {
                scales: {
                    x: { type: "linear" },
                    y: { type: "linear" }
                }
            };
            expect(hasScales(validConfig)).toBe(true);
        });

        it("should return false for null", () => {
            expect(hasScales(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(hasScales(undefined)).toBe(false);
        });

        it("should return false for object without scales", () => {
            const invalidConfig = { plugins: {} };
            expect(hasScales(invalidConfig)).toBe(false);
        });

        it("should return false for object with null scales", () => {
            const invalidConfig = { scales: null };
            expect(hasScales(invalidConfig)).toBe(false);
        });

        it("should return false for primitive values", () => {
            expect(hasScales("string")).toBe(false);
            expect(hasScales(123)).toBe(false);
            expect(hasScales(true)).toBe(false);
        });
    });

    describe("Integration tests", () => {
        it("should work with complex config objects", () => {
            const fullConfig = {
                plugins: { legend: { display: true } },
                scales: { x: { type: "linear" } }
            };

            expect(hasPlugins(fullConfig)).toBe(true);
            expect(hasScales(fullConfig)).toBe(true);
        });
    });
});
