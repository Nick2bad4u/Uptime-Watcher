/**
 * Backend test coverage for shared utilities - validation This ensures backend
 * tests exercise shared code for coverage reporting
 */

import { describe, expect, it } from "vitest";
import { test, fc } from "@fast-check/vitest";
import type { Monitor, Site } from "../../types.js";
import { MIN_MONITOR_CHECK_INTERVAL_MS } from "../../constants/monitoring";
import { getMonitorValidationErrors } from "../../validation/monitorSchemas";
import { validateSiteData } from "../../validation/siteSchemas";
import { validateMonitorType } from "../../utils/validation";

describe("Shared Validation - Backend Coverage", () => {
    describe(getMonitorValidationErrors, () => {
        it("should return no errors for valid HTTP monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "http",
                url: "https://example.com",
                status: "pending",
                monitoring: true,
                responseTime: -1,
                history: [],
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return errors for invalid monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Partial<Monitor> = {
                id: "",
                type: "http",
                checkInterval: 500,
                timeout: -1,
                retryAttempts: 15,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("Monitor ID is required"),
                    expect.stringContaining(
                        `Check interval must be at least ${MIN_MONITOR_CHECK_INTERVAL_MS}ms`
                    ),
                    expect.stringContaining("Timeout"),
                    expect.stringContaining("Retry"),
                    expect.stringContaining("url"),
                ])
            );
        });

        it("should validate port monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "port",
                status: "pending",
                monitoring: true,
                responseTime: -1,
                history: [],
                host: "example.com",
                checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
                timeout: 1000,
                retryAttempts: 0,
                port: 70_000, // Invalid port
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors.some((e) => e.toLowerCase().startsWith("host:"))).toBeFalsy(

            );
            expect(
                errors.some(
                    (e) =>
                        e.toLowerCase().startsWith("port:") &&
                        e.includes("65535")
                )
            ).toBeTruthy();
        });
    });

    describe(validateMonitorType, () => {
        it("should validate correct monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            expect(validateMonitorType("http")).toBeTruthy();
            expect(validateMonitorType("port")).toBeTruthy();
        });

        it("should reject invalid types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitorType("invalid")).toBeFalsy();
            expect(validateMonitorType(123)).toBeFalsy();
            expect(validateMonitorType(null)).toBeFalsy();
            expect(validateMonitorType(undefined)).toBeFalsy();
        });

        // Property-based testing for monitor type validation
        test.prop({
            validTypes: fc.constantFrom("http", "port", "ping", "dns"),
        })("should accept all valid monitor types", (props) => {
            expect(validateMonitorType(props.validTypes)).toBeTruthy();
        });

        test.prop({
            invalidInput: fc.oneof(
                fc.integer(),
                fc.float(),
                fc.boolean(),
                fc.array(fc.string()),
                fc.object(),
                fc.string().filter(
                    (s) =>
                        ![
                            "http",
                            "port",
                            "ping",
                            "dns",
                        ].includes(s)
                )
            ),
        })("should reject all invalid monitor types", (props) => {
            expect(validateMonitorType(props.invalidInput)).toBeFalsy();
        });

        test.prop({
            stringInput: fc.string({ minLength: 1, maxLength: 20 }),
        })("should handle arbitrary strings correctly", (props) => {
            const result = validateMonitorType(props.stringInput);
            const validTypes = [
                "http",
                "port",
                "ping",
                "dns",
            ];

            if (validTypes.includes(props.stringInput)) {
                expect(result).toBeTruthy();
            } else {
                expect(result).toBeFalsy();
            }
        });
    });

    describe(validateSiteData, () => {
        it("should validate complete site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        checkInterval: 60_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        monitoring: true,
                        status: "pending",
                        responseTime: 0,
                        history: [],
                        activeOperations: [], // Required field for validation
                    },
                ],
            };

            expect(validateSiteData(site).success).toBeTruthy();
        });

        it("should reject invalid site structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(
                validateSiteData(null as unknown as Partial<Site>).success
            ).toBeFalsy();
            expect(
                validateSiteData(undefined as unknown as Partial<Site>).success
            ).toBeFalsy();
            expect(
                validateSiteData("string" as unknown as Partial<Site>).success
            ).toBeFalsy();
        });

        it("should reject site with missing required fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = {
                name: "Test Site",
                monitoring: true,
                monitors: [],
            } as Partial<Site>;

            expect(validateSiteData(site).success).toBeFalsy();
        });

        it("should reject site with invalid monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        // Missing required fields
                    },
                ],
            } as Partial<Site>;

            expect(validateSiteData(site).success).toBeFalsy();
        });
    });
});
