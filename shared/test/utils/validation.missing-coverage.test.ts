/**
 * Additional validation tests to achieve 100% function coverage Focuses on
 * previously untested functions and code paths
 */

import { describe, expect, it } from "vitest";
import type { Monitor } from "../../types.js";
import { getMonitorValidationErrors } from "../../utils/validation";

describe("Validation - Missing Coverage Tests", () => {
    describe("DNS Monitor Validation", () => {
        it("should validate DNS monitor with valid fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const monitor: Partial<Monitor> = {
                id: "dns-test",
                type: "dns",
                host: "example.com",
                recordType: "A",
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return errors for DNS monitor missing host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Partial<Monitor> = {
                id: "dns-test",
                type: "dns",
                recordType: "A",
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for DNS monitors");
        });

        it("should return errors for DNS monitor with invalid host type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Partial<Monitor> = {
                id: "dns-test",
                type: "dns",
                host: 123 as any, // Invalid type
                recordType: "A",
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for DNS monitors");
        });

        it("should return errors for DNS monitor missing record type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Partial<Monitor> = {
                id: "dns-test",
                type: "dns",
                host: "example.com",
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Record type is required for DNS monitors"
            );
        });

        it("should return errors for DNS monitor with invalid record type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Partial<Monitor> = {
                id: "dns-test",
                type: "dns",
                host: "example.com",
                recordType: "INVALID",
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Invalid record type: INVALID. Valid types are: A, AAAA, ANY, CAA, CNAME, MX, NAPTR, NS, PTR, SOA, SRV, TLSA, TXT"
            );
        });

        it("should accept all valid DNS record types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validRecordTypes = [
                "A",
                "AAAA",
                "ANY",
                "CAA",
                "CNAME",
                "MX",
                "NAPTR",
                "NS",
                "PTR",
                "SOA",
                "SRV",
                "TLSA",
                "TXT",
            ];

            for (const recordType of validRecordTypes) {
                const monitor: Partial<Monitor> = {
                    id: "dns-test",
                    type: "dns",
                    host: "example.com",
                    recordType,
                    status: "pending",
                    checkInterval: 60_000,
                    timeout: 5000,
                    retryAttempts: 3,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(
                    errors.filter((err) => err.includes("Invalid record type"))
                ).toHaveLength(0);
            }
        });

        it("should handle DNS record type case insensitivity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const monitor: Partial<Monitor> = {
                id: "dns-test",
                type: "dns",
                host: "example.com",
                recordType: "a", // lowercase
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(
                errors.filter((err) => err.includes("Invalid record type"))
            ).toHaveLength(0);
        });

        it("should return errors for DNS monitor with non-string record type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Partial<Monitor> = {
                id: "dns-test",
                type: "dns",
                host: "example.com",
                recordType: 123 as any, // Invalid type
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Record type is required for DNS monitors"
            );
        });
    });

    describe("Unknown Monitor Type Validation", () => {
        it("should return error for unknown monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Partial<Monitor> = {
                id: "unknown-test",
                type: "unknown" as any,
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Unknown monitor type: unknown");
        });

        it("should handle custom monitor types gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor: Partial<Monitor> = {
                id: "custom-test",
                type: "custom-type" as any,
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Unknown monitor type: custom-type");
        });
    });

    describe("Edge Cases in Type-Specific Validation", () => {
        it("should handle monitor without type gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor: Partial<Monitor> = {
                id: "no-type-test",
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            // Should not crash and should include basic validation errors
            expect(errors).toContain("Monitor type is required");
        });

        it("should handle null type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const monitor: Partial<Monitor> = {
                id: "null-type-test",
                type: null as any,
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Monitor type is required");
        });

        it("should handle undefined type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: validation.missing-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const monitor: Partial<Monitor> = {
                id: "undefined-type-test",
                type: undefined as any,
                status: "pending",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Monitor type is required");
        });
    });
});
