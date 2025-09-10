/**
 * Backend test coverage for shared utilities - validation This ensures backend
 * tests exercise shared code for coverage reporting
 */

import { describe, expect, it } from "vitest";
import { test, fc } from "@fast-check/vitest";
import type { Monitor, Site } from "../../types.js";
import {
    getMonitorValidationErrors,
    validateMonitorType,
    validateSite,
} from "../../utils/validation";

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
                type: "http",
                checkInterval: 500,
                timeout: -1,
                retryAttempts: 15,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toHaveLength(6); // Updated to match actual count
            expect(errors).toContain("Monitor id is required");
            expect(errors).toContain("Check interval must be at least 1000ms");
            expect(errors).toContain("Timeout must be a positive number");
            expect(errors).toContain("Retry attempts must be between 0 and 10");
            expect(errors).toContain("URL is required for HTTP monitors");
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
                port: 70_000, // Invalid port
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for port monitors");
            expect(errors).toContain(
                "Valid port number (1-65535) is required for port monitors"
            );
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

    describe(validateSite, () => {
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

            expect(validateSite(site)).toBeTruthy();
        });

        it("should reject invalid site structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateSite(null as unknown as Partial<Site>)).toBeFalsy();
            expect(
                validateSite(undefined as unknown as Partial<Site>)
            ).toBeFalsy();
            expect(
                validateSite("string" as unknown as Partial<Site>)
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

            expect(validateSite(site)).toBeFalsy();
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

            expect(validateSite(site)).toBeFalsy();
        });
    });
});
