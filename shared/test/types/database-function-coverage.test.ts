/**
 * Comprehensive function coverage tests for shared/types/database.ts Target:
 * 56.25% function coverage -> 100% Missing lines:
 * 281,312-313,317,354-355,359-360
 */

import { describe, expect, it } from "vitest";
import {
    isValidHistoryRow,
    isValidMonitorRow,
    isValidSettingsRow,
    isValidSiteRow,
    safeGetRowProperty,
} from "../../types/database";

describe("Database Types - Complete Function Coverage", () => {
    describe("isValidSettingsRow (line 281 coverage)", () => {
        it("should return true for valid settings row", () => {
            const validRow = {
                key: "historyLimit",
                value: "100",
            };
            expect(isValidSettingsRow(validRow)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isValidSettingsRow(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isValidSettingsRow(undefined)).toBe(false);
        });

        it("should return false for non-object", () => {
            expect(isValidSettingsRow("string")).toBe(false);
            expect(isValidSettingsRow(123)).toBe(false);
        });

        it("should return false for object without key", () => {
            expect(isValidSettingsRow({ value: "test" })).toBe(false);
        });

        it("should return false for object with null key", () => {
            expect(isValidSettingsRow({ key: null })).toBe(false);
        });

        it("should return false for object with undefined key", () => {
            expect(isValidSettingsRow({ key: undefined })).toBe(false);
        });

        it("should return false for object with non-string key", () => {
            expect(isValidSettingsRow({ key: 123 })).toBe(false);
        });

        it("should return false for object with empty key", () => {
            expect(isValidSettingsRow({ key: "" })).toBe(false);
        });
    });

    describe("isValidSiteRow (lines 312-313, 317 coverage)", () => {
        it("should return true for valid site row", () => {
            const validRow = {
                identifier: "test-site",
                name: "Test Site",
                url: "https://test.com",
            };
            expect(isValidSiteRow(validRow)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isValidSiteRow(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isValidSiteRow(undefined)).toBe(false);
        });

        it("should return false for non-object", () => {
            expect(isValidSiteRow("string")).toBe(false);
            expect(isValidSiteRow(42)).toBe(false);
        });

        it("should return false for object without identifier", () => {
            expect(isValidSiteRow({ name: "Test" })).toBe(false);
        });

        it("should return false for object with null identifier", () => {
            expect(isValidSiteRow({ identifier: null })).toBe(false);
        });

        it("should return false for object with undefined identifier", () => {
            expect(isValidSiteRow({ identifier: undefined })).toBe(false);
        });

        it("should return false for object with non-string identifier", () => {
            expect(isValidSiteRow({ identifier: 123 })).toBe(false);
        });

        it("should return false for object with empty identifier", () => {
            expect(isValidSiteRow({ identifier: "" })).toBe(false);
        });

        it("should return false for object with whitespace-only identifier", () => {
            expect(isValidSiteRow({ identifier: "   " })).toBe(false);
        });
    });

    describe("safeGetRowProperty (lines 354-355, 359-360 coverage)", () => {
        it("should return default value for null row", () => {
            const result = safeGetRowProperty(
                null as any,
                "property",
                "default"
            );
            expect(result).toBe("default");
        });

        it("should return default value for undefined row", () => {
            const result = safeGetRowProperty(
                undefined as any,
                "property",
                "default"
            );
            expect(result).toBe("default");
        });

        it("should return default value for non-object row", () => {
            const result = safeGetRowProperty(
                "string" as any,
                "property",
                "default"
            );
            expect(result).toBe("default");
        });

        it("should return property value when it exists", () => {
            const row = { test: "value" };
            const result = safeGetRowProperty(row, "test", "default");
            expect(result).toBe("value");
        });

        it("should return default value when property doesn't exist", () => {
            const row = { other: "value" };
            const result = safeGetRowProperty(row, "test", "default");
            expect(result).toBe("default");
        });

        it("should return default value when property is undefined", () => {
            const row = { test: undefined };
            const result = safeGetRowProperty(row, "test", "default");
            expect(result).toBe("default");
        });

        it("should handle nested property access with dot notation", () => {
            const row = {
                nested: {
                    property: "nested-value",
                },
            };
            const result = safeGetRowProperty(
                row,
                "nested.property",
                "default"
            );
            expect(result).toBe("nested-value");
        });

        it("should return default for nested property when parent doesn't exist", () => {
            const row = { other: "value" };
            const result = safeGetRowProperty(
                row,
                "nested.property",
                "default"
            );
            expect(result).toBe("default");
        });

        it("should return default for nested property when parent is null", () => {
            const row = { nested: null };
            const result = safeGetRowProperty(
                row,
                "nested.property",
                "default"
            );
            expect(result).toBe("default");
        });

        it("should return default for nested property when parent is not object", () => {
            const row = { nested: "string" };
            const result = safeGetRowProperty(
                row,
                "nested.property",
                "default"
            );
            expect(result).toBe("default");
        });

        it("should return default for nested property when property is undefined", () => {
            const row = {
                nested: {
                    property: undefined,
                },
            };
            const result = safeGetRowProperty(
                row,
                "nested.property",
                "default"
            );
            expect(result).toBe("default");
        });

        it("should handle deeply nested properties", () => {
            const row = {
                level1: {
                    level2: {
                        level3: "deep-value",
                    },
                },
            };
            const result = safeGetRowProperty(
                row,
                "level1.level2.level3",
                "default"
            );
            expect(result).toBe("deep-value");
        });

        it("should handle property names that include dots as exact matches", () => {
            const row = { "property.with.dots": "exact-match" };
            const result = safeGetRowProperty(
                row,
                "property.with.dots",
                "default"
            );
            expect(result).toBe("exact-match");
        });
    });

    describe("All Database Type Guards Coverage", () => {
        it("should exercise all type guard functions", () => {
            // Test all validation functions to ensure complete coverage
            expect(
                isValidHistoryRow({
                    id: "1",
                    monitorId: "monitor-1",
                    timestamp: Date.now(),
                    status: "up",
                    responseTime: 100,
                })
            ).toBe(true);

            expect(
                isValidMonitorRow({
                    id: 1,
                    site_identifier: "site-1",
                    type: "http",
                })
            ).toBe(true);

            expect(
                isValidSettingsRow({
                    key: "test-setting",
                })
            ).toBe(true);

            expect(
                isValidSiteRow({
                    identifier: "test-site",
                })
            ).toBe(true);

            expect(
                safeGetRowProperty({ test: "value" }, "test", "default")
            ).toBe("value");
        });
    });
});
