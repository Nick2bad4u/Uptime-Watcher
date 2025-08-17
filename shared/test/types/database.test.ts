/**
 * Backend test coverage for shared types - database This ensures backend tests
 * exercise shared code for coverage reporting
 */

import { describe, expect, it } from "vitest";
import {
    isValidHistoryRow,
    isValidMonitorRow,
    isValidSettingsRow,
    isValidSiteRow,
    safeGetRowProperty,
    type HistoryRow,
    type MonitorRow,
    type SettingsRow,
    type SiteRow,
} from "../../../../shared/types/database.js";

describe("Shared Database Types - Backend Coverage", () => {
    describe("isValidHistoryRow", () => {
        it("should validate correct history row", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const validRow: HistoryRow = {
                monitorId: "test-monitor",
                status: "up",
                timestamp: Date.now(),
                responseTime: 100,
                details: "Success",
            };

            expect(isValidHistoryRow(validRow)).toBe(true);
        });
        it("should validate minimal valid history row", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const validRow = {
                monitorId: "test-monitor",
                status: "down",
                timestamp: 1_640_995_200_000,
            };

            expect(isValidHistoryRow(validRow)).toBe(true);
        });
        it("should reject invalid history rows", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            expect(isValidHistoryRow(null)).toBe(false);
            expect(isValidHistoryRow(undefined)).toBe(false);
            expect(isValidHistoryRow("string")).toBe(false);
            expect(isValidHistoryRow({})).toBe(false);

            // Missing required fields
            expect(isValidHistoryRow({ monitorId: "test" })).toBe(false);
            expect(isValidHistoryRow({ status: "up" })).toBe(false);
            expect(isValidHistoryRow({ timestamp: Date.now() })).toBe(false);

            // Invalid field types
            expect(
                isValidHistoryRow({
                    monitorId: 123,
                    status: "up",
                    timestamp: Date.now(),
                })
            ).toBe(false);

            expect(
                isValidHistoryRow({
                    monitorId: "test",
                    status: "invalid",
                    timestamp: Date.now(),
                })
            ).toBe(false);

            expect(
                isValidHistoryRow({
                    monitorId: "test",
                    status: "up",
                    timestamp: "not-a-number",
                })
            ).toBe(false);
        });
        it("should handle NaN timestamp", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const invalidRow = {
                monitorId: "test",
                status: "up",
                timestamp: Number.NaN,
            };

            expect(isValidHistoryRow(invalidRow)).toBe(false);
        });
    });
    describe("isValidMonitorRow", () => {
        it("should validate correct monitor row", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const validRow: MonitorRow = {
                id: 1,
                site_identifier: "test-site",
                type: "http",
                url: "https://example.com",
                enabled: 1,
                monitoring: 1,
                status: "up",
                check_interval: 60,
                timeout: 5000,
                retry_attempts: 3,
                response_time: 100,
                created_at: Date.now(),
                updated_at: Date.now(),
            };

            expect(isValidMonitorRow(validRow)).toBe(true);
        });
        it("should validate minimal valid monitor row", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const validRow = {
                id: "monitor-1",
                site_identifier: "test-site",
                type: "port",
            };

            expect(isValidMonitorRow(validRow)).toBe(true);
        });
        it("should reject invalid monitor rows", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            expect(isValidMonitorRow(null)).toBe(false);
            expect(isValidMonitorRow(undefined)).toBe(false);
            expect(isValidMonitorRow("string")).toBe(false);
            expect(isValidMonitorRow({})).toBe(false);

            // Missing required fields
            expect(isValidMonitorRow({ id: 1 })).toBe(false);
            expect(isValidMonitorRow({ site_identifier: "test" })).toBe(false);
            expect(isValidMonitorRow({ type: "http" })).toBe(false);

            // Invalid field types
            expect(
                isValidMonitorRow({
                    id: true,
                    site_identifier: "test",
                    type: "http",
                })
            ).toBe(false);

            expect(
                isValidMonitorRow({
                    id: 1,
                    site_identifier: 123,
                    type: "http",
                })
            ).toBe(false);

            expect(
                isValidMonitorRow({
                    id: 1,
                    site_identifier: "test",
                    type: null,
                })
            ).toBe(false);
        });
    });
    describe("isValidSettingsRow", () => {
        it("should validate correct settings row", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const validRow: SettingsRow = {
                key: "theme",
                value: "dark",
                id: 1,
            };

            expect(isValidSettingsRow(validRow)).toBe(true);
        });
        it("should validate minimal valid settings row", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const validRow = {
                key: "setting-key",
            };

            expect(isValidSettingsRow(validRow)).toBe(true);
        });
        it("should reject invalid settings rows", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            expect(isValidSettingsRow(null)).toBe(false);
            expect(isValidSettingsRow(undefined)).toBe(false);
            expect(isValidSettingsRow("string")).toBe(false);
            expect(isValidSettingsRow({})).toBe(false);

            // Missing or invalid key
            expect(isValidSettingsRow({ value: "test" })).toBe(false);
            expect(isValidSettingsRow({ key: undefined })).toBe(false);
            expect(isValidSettingsRow({ key: null })).toBe(false);
            expect(isValidSettingsRow({ key: 123 })).toBe(false);
            expect(isValidSettingsRow({ key: "" })).toBe(false);
        });
    });
    describe("isValidSiteRow", () => {
        it("should validate correct site row", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const validRow: SiteRow = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: 1,
                id: 1,
            };

            expect(isValidSiteRow(validRow)).toBe(true);
        });
        it("should validate minimal valid site row", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const validRow = {
                identifier: "test-site",
            };

            expect(isValidSiteRow(validRow)).toBe(true);
        });
        it("should reject invalid site rows", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            expect(isValidSiteRow(null)).toBe(false);
            expect(isValidSiteRow(undefined)).toBe(false);
            expect(isValidSiteRow("string")).toBe(false);
            expect(isValidSiteRow({})).toBe(false);

            // Missing or invalid identifier
            expect(isValidSiteRow({ name: "Test" })).toBe(false);
            expect(isValidSiteRow({ identifier: undefined })).toBe(false);
            expect(isValidSiteRow({ identifier: null })).toBe(false);
            expect(isValidSiteRow({ identifier: 123 })).toBe(false);
            expect(isValidSiteRow({ identifier: "" })).toBe(false);
            expect(isValidSiteRow({ identifier: "   " })).toBe(false);
        });
    });
    describe("safeGetRowProperty", () => {
        it("should return property value when it exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const row = {
                name: "Test Site",
                enabled: 1,
                url: "https://example.com",
                count: 0,
                flag: false,
            };

            expect(safeGetRowProperty(row, "name", "default")).toBe(
                "Test Site"
            );
            expect(safeGetRowProperty(row, "enabled", 0)).toBe(1);
            expect(safeGetRowProperty(row, "url", "")).toBe(
                "https://example.com"
            );
            expect(safeGetRowProperty(row, "count", -1)).toBe(0);
            expect(safeGetRowProperty(row, "flag", true)).toBe(false);
        });
        it("should return default value when property does not exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const row = {
                name: "Test Site",
            };

            expect(safeGetRowProperty(row, "missing", "default")).toBe(
                "default"
            );
            expect(safeGetRowProperty(row, "nonexistent", 42)).toBe(42);
            expect(safeGetRowProperty(row, "absent", true)).toBe(true);
        });
        it("should return default value when property is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const row = {
                name: "Test Site",
                undefined_value: undefined,
            };

            expect(safeGetRowProperty(row, "undefined_value", "default")).toBe(
                "default"
            );
        });
        it("should handle different property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const row = {
                stringProp: "hello",
                numberProp: 123,
                booleanProp: true,
                objectProp: { nested: "value" },
                arrayProp: [1, 2, 3],
                nullProp: null,
            };

            expect(safeGetRowProperty(row, "stringProp", "default")).toBe(
                "hello"
            );
            expect(safeGetRowProperty(row, "numberProp", 0)).toBe(123);
            expect(safeGetRowProperty(row, "booleanProp", false)).toBe(true);
            expect(safeGetRowProperty(row, "objectProp", {})).toEqual({
                nested: "value",
            });
            expect(safeGetRowProperty(row, "arrayProp", [])).toEqual([1, 2, 3]);
            expect(safeGetRowProperty(row, "nullProp", "default")).toBe(null);
        });
        it("should handle empty row", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: Shared Database Types - Backend Coverage",
                "component"
            );

            const row = {};

            expect(safeGetRowProperty(row, "any", "default")).toBe("default");
            expect(safeGetRowProperty(row, "prop", 42)).toBe(42);
        });
    });
});
