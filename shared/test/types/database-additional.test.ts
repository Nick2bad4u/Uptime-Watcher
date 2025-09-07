/**
 * @file Additional tests for shared/types/database.ts functions to achieve 100%
 *   coverage
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
} from "../../types/database";

describe("shared/types/database additional function coverage", () => {
    describe("isValidHistoryRow - additional coverage", () => {
        it("should handle string timestamps that become NaN", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidTimestampRow = {
                id: 1,
                monitor_id: "monitor1",
                site_id: "site1",
                status: "up",
                response_time: 100,
                timestamp: "invalid-timestamp", // This will cause NaN when parsed
                details: null,
                error_message: null,
            };

            expect(isValidHistoryRow(invalidTimestampRow)).toBeFalsy();
        });

        it("should handle non-numeric string timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const nonNumericRow = {
                id: 1,
                monitor_id: "monitor1",
                site_id: "site1",
                status: "up",
                response_time: 100,
                timestamp: "not-a-number",
                details: null,
                error_message: null,
            };

            expect(isValidHistoryRow(nonNumericRow)).toBeFalsy();
        });

        it("should handle empty string timestamp", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const emptyTimestampRow = {
                id: 1,
                monitor_id: "monitor1",
                site_id: "site1",
                status: "up",
                response_time: 100,
                timestamp: "",
                details: null,
                error_message: null,
            };

            expect(isValidHistoryRow(emptyTimestampRow)).toBeFalsy();
        });
    });

    describe("isValidMonitorRow - additional coverage", () => {
        it("should handle string timestamps that become NaN", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidTimestampRow = {
                id: "monitor1",
                site_id: "site1",
                type: "http",
                status: "up",
                url: "https://example.com",
                name: "Test Monitor",
                check_interval: 60,
                timeout: 30,
                retry_attempts: 3,
                last_check: "invalid-timestamp", // This will cause NaN when parsed
                next_check: Date.now() + 60_000,
                response_time: 100,
                created_at: Date.now(),
                updated_at: Date.now(),
                configuration: "{}",
                error_message: null,
            };

            expect(isValidMonitorRow(invalidTimestampRow)).toBeFalsy();
        });

        it("should handle various invalid timestamp formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const testCases = [
                "not-a-number",
                "",
                "abc123",
                "2023-13-45", // invalid date
                "invalid",
            ];

            for (const invalidTimestamp of testCases) {
                const invalidRow = {
                    id: "monitor1",
                    site_id: "site1",
                    type: "http",
                    status: "up",
                    url: "https://example.com",
                    name: "Test Monitor",
                    check_interval: 60,
                    timeout: 30,
                    retry_attempts: 3,
                    last_check: invalidTimestamp,
                    next_check: Date.now() + 60_000,
                    response_time: 100,
                    created_at: Date.now(),
                    updated_at: Date.now(),
                    configuration: "{}",
                    error_message: null,
                };

                expect(isValidMonitorRow(invalidRow)).toBeFalsy();
            }
        });
    });

    describe("isValidSiteRow - additional coverage", () => {
        it("should handle string timestamps that become NaN", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidTimestampRow = {
                id: "site1",
                name: "Test Site",
                url: "https://example.com",
                monitoring_enabled: 1,
                created_at: "invalid-timestamp", // This will cause NaN when parsed
                updated_at: Date.now(),
                notification_settings: "{}",
            };

            expect(isValidSiteRow(invalidTimestampRow)).toBeFalsy();
        });

        it("should handle edge case string timestamps", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const edgeCases = [
                "NaN",
                "Infinity",
                "-Infinity",
                "undefined",
                "null",
                " ",
                "\t\n",
            ];

            for (const edgeCase of edgeCases) {
                const invalidRow = {
                    id: "site1",
                    name: "Test Site",
                    url: "https://example.com",
                    monitoring_enabled: 1,
                    created_at: edgeCase,
                    updated_at: Date.now(),
                    notification_settings: "{}",
                };

                expect(isValidSiteRow(invalidRow)).toBeFalsy();
            }
        });
    });

    describe("safeGetRowProperty - comprehensive coverage", () => {
        it("should handle deeply nested property access", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const complexRow = {
                user: {
                    profile: {
                        name: "John Doe",
                        settings: {
                            theme: "dark",
                            notifications: true,
                        },
                    },
                },
                metadata: {
                    version: "1.0.0",
                },
            };

            expect(safeGetRowProperty(complexRow, "user", {})).toEqual(
                complexRow.user
            );
            expect(
                safeGetRowProperty(complexRow, "user.profile.name", "Unknown")
            ).toBe("John Doe");
            expect(
                safeGetRowProperty(complexRow, "metadata.version", "0.0.0")
            ).toBe("1.0.0");
        });

        it("should handle various property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const mixedRow = {
                stringProp: "text",
                numberProp: 42,
                booleanProp: true,
                arrayProp: [
                    1,
                    2,
                    3,
                ],
                objectProp: { nested: "value" },
                nullProp: null,
                undefinedProp: undefined,
                zeroProp: 0,
                emptyStringProp: "",
                falseProp: false,
            };

            // Test different property types
            expect(safeGetRowProperty(mixedRow, "stringProp", "default")).toBe(
                "text"
            );
            expect(safeGetRowProperty(mixedRow, "numberProp", -1)).toBe(42);
            expect(
                safeGetRowProperty(mixedRow, "booleanProp", false)
            ).toBeTruthy();
            expect(safeGetRowProperty(mixedRow, "arrayProp", [])).toEqual([
                1,
                2,
                3,
            ]);
            expect(safeGetRowProperty(mixedRow, "objectProp", {})).toEqual({
                nested: "value",
            });

            // Test falsy values
            expect(safeGetRowProperty(mixedRow, "nullProp", "default")).toBe(
                null
            );
            expect(
                safeGetRowProperty(mixedRow, "undefinedProp", "default")
            ).toBe("default");
            expect(safeGetRowProperty(mixedRow, "zeroProp", -1)).toBe(0);
            expect(
                safeGetRowProperty(mixedRow, "emptyStringProp", "default")
            ).toBe("");
            expect(safeGetRowProperty(mixedRow, "falseProp", true)).toBeFalsy();
        });

        it("should handle empty and invalid row objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const emptyRow = {};
            const nullRow = null as any;
            const undefinedRow = undefined as any;
            const primitiveRow = "not an object" as any;

            expect(safeGetRowProperty(emptyRow, "any", "default")).toBe(
                "default"
            );
            expect(safeGetRowProperty(nullRow, "any", "default")).toBe(
                "default"
            );
            expect(safeGetRowProperty(undefinedRow, "any", "default")).toBe(
                "default"
            );
            expect(safeGetRowProperty(primitiveRow, "any", "default")).toBe(
                "default"
            );
        });

        it("should handle special property names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const specialRow = {
                "prop with spaces": "value1",
                "prop-with-dashes": "value2",
                prop_with_underscores: "value3",
                "123numeric": "value4",
                "": "empty string key",
                "prop.with.dots": "value5",
            };

            expect(
                safeGetRowProperty(specialRow, "prop with spaces", "default")
            ).toBe("value1");
            expect(
                safeGetRowProperty(specialRow, "prop-with-dashes", "default")
            ).toBe("value2");
            expect(
                safeGetRowProperty(
                    specialRow,
                    "prop_with_underscores",
                    "default"
                )
            ).toBe("value3");
            expect(
                safeGetRowProperty(specialRow, "123numeric", "default")
            ).toBe("value4");
            expect(safeGetRowProperty(specialRow, "", "default")).toBe(
                "empty string key"
            );
            expect(
                safeGetRowProperty(specialRow, "prop.with.dots", "default")
            ).toBe("value5");
        });

        it("should handle circular references gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const circularRow: any = {
                name: "test",
                circular: null,
            };
            circularRow.circular = circularRow;

            // Should handle circular reference without infinite loop
            expect(safeGetRowProperty(circularRow, "name", "default")).toBe(
                "test"
            );
            expect(safeGetRowProperty(circularRow, "circular", {})).toBe(
                circularRow
            );
        });

        it("should handle array-like objects", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const arrayLikeRow = {
                0: "first",
                1: "second",
                2: "third",
                length: 3,
                slice: Array.prototype.slice,
            };

            expect(safeGetRowProperty(arrayLikeRow, "0", "default")).toBe(
                "first"
            );
            expect(safeGetRowProperty(arrayLikeRow, "length", 0)).toBe(3);
            expect(safeGetRowProperty(arrayLikeRow, "slice", null)).toBe(
                Array.prototype.slice
            );
        });

        it("should handle different default value types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const emptyRow = {};

            // Test different default value types
            expect(safeGetRowProperty(emptyRow, "missing", "string")).toBe(
                "string"
            );
            expect(safeGetRowProperty(emptyRow, "missing", 42)).toBe(42);
            expect(safeGetRowProperty(emptyRow, "missing", true)).toBeTruthy();
            expect(safeGetRowProperty(emptyRow, "missing", [])).toEqual([]);
            expect(safeGetRowProperty(emptyRow, "missing", {})).toEqual({});
            expect(safeGetRowProperty(emptyRow, "missing", null)).toBe(null);
            expect(safeGetRowProperty(emptyRow, "missing", undefined)).toBe(
                undefined
            );
        });
    });

    describe("integration tests for all database validators", () => {
        it("should validate complete database row structures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validHistoryRow: HistoryRow = {
                monitorId: "monitor1",
                status: "up",
                timestamp: Date.now(),
                responseTime: 150,
                details: "All good",
            };

            const validMonitorRow: MonitorRow = {
                id: 1,
                site_identifier: "site1",
                type: "http",
                status: "up",
                url: "https://example.com",
                check_interval: 60,
                timeout: 30,
                retry_attempts: 3,
                last_checked: Date.now() - 60_000,
                next_check: Date.now() + 60_000,
                response_time: 150,
                created_at: Date.now() - 86_400_000,
                updated_at: Date.now(),
            };

            const validSettingsRow: SettingsRow = {
                key: "history_limit",
                value: "1000",
            };

            const validSiteRow: SiteRow = {
                identifier: "site1",
                name: "Example Site",
                monitoring: 1,
            };

            expect(isValidHistoryRow(validHistoryRow)).toBeTruthy();
            expect(isValidMonitorRow(validMonitorRow)).toBeTruthy();
            expect(isValidSettingsRow(validSettingsRow)).toBeTruthy();
            expect(isValidSiteRow(validSiteRow)).toBeTruthy();
        });

        it("should handle mixed valid and invalid data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: database-additional", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const mixedData = [
                {
                    monitorId: "monitor1",
                    status: "up",
                    timestamp: Date.now(),
                    responseTime: 150,
                    details: "All good",
                }, // valid
                {
                    monitorId: "monitor1",
                    status: "invalid-status", // invalid status
                    timestamp: Date.now(),
                }, // invalid
                null, // invalid
                {
                    monitorId: "monitor1",
                    status: "up",
                    timestamp: "invalid-timestamp", // invalid timestamp
                }, // invalid
            ];

            const results = mixedData.map((item) => isValidHistoryRow(item));
            expect(results).toEqual([
                true,
                false,
                false,
                false,
            ]);
        });
    });
});
