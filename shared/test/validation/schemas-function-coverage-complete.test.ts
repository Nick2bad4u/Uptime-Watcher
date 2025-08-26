/**
 * Test file to specifically target missing function coverage in schemas.ts
 * Coverage issue: Functions at 66.66% (need 90%+)
 */

import { describe, expect, it } from "vitest";
import {
    validateMonitorData,
    validateMonitorField,
    validateSiteData,
} from "../../validation/schemas";

describe("schemas.ts - Function Coverage Completion", () => {
    describe("validateSiteData - Success Path Coverage", () => {
        it("should successfully validate a complete site with monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const validSite = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        checkInterval: 60000,
                        timeout: 5000,
                        retryAttempts: 3,
                        history: [],
                        monitoring: true,
                        status: "up",
                        responseTime: 100,
                    },
                ],
            };

            const result = validateSiteData(validSite);

            expect(result.success).toBe(true);
            expect(result.errors).toEqual([]);
            expect(result.metadata?.siteIdentifier).toBe("test-site");
            expect(result.metadata?.monitorCount).toBe(1);
        });

        it("should validate site with minimum required fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const validSiteMinimal = {
                identifier: "minimal-site",
                name: "Minimal Site",
                monitoring: false,
                monitors: [
                    {
                        id: "minimal-monitor",
                        type: "http",
                        url: "https://minimal.test",
                        checkInterval: 5000,
                        timeout: 1000,
                        retryAttempts: 0,
                        history: [],
                        monitoring: false,
                        status: "pending",
                        responseTime: -1,
                    },
                ],
            };

            const result = validateSiteData(validSiteMinimal);

            expect(result.success).toBe(true);
            expect(result.metadata?.monitorCount).toBe(1);
        });
    });

    describe("validateMonitorData - Success Path Coverage", () => {
        it("should successfully validate HTTP monitor data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const validHttpMonitor = {
                id: "http-monitor",
                type: "http",
                url: "https://test.com",
                checkInterval: 30000,
                timeout: 5000,
                retryAttempts: 2,
                history: [],
                monitoring: true,
                status: "up",
                responseTime: 100,
            };

            const result = validateMonitorData("http", validHttpMonitor);

            expect(result.success).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should successfully validate DNS monitor data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const validDnsMonitor = {
                id: "dns-monitor",
                type: "dns",
                host: "example.com",
                checkInterval: 60000,
                timeout: 3000,
                retryAttempts: 1,
                history: [],
                monitoring: true,
                status: "up",
                responseTime: 50,
                recordType: "A",
                expectedValue: "192.0.2.1",
            };

            const result = validateMonitorData("dns", validDnsMonitor);

            expect(result.success).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should successfully validate PORT monitor data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const validPortMonitor = {
                id: "port-monitor",
                type: "port",
                host: "test.example.com",
                port: 443,
                checkInterval: 45000,
                timeout: 2000,
                retryAttempts: 3,
                history: [],
                monitoring: true,
                status: "up",
                responseTime: 75,
            };

            const result = validateMonitorData("port", validPortMonitor);

            expect(result.success).toBe(true);
            expect(result.errors).toEqual([]);
        });
    });

    describe("validateMonitorField - Known Field Coverage", () => {
        it("should validate HTTP monitor specific fields successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // HTTP monitors only have 'url' as type-specific field
            const result = validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );
            expect(result.success).toBe(true);
            expect(result.metadata?.fieldName).toBe("url");
        });

        it("should validate DNS monitor specific fields successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const dnsFields = [
                { field: "host", value: "example.com" },
                { field: "recordType", value: "A" },
                { field: "expectedValue", value: "192.0.2.1" },
            ];

            dnsFields.forEach(({ field, value }) => {
                const result = validateMonitorField("dns", field, value);
                expect(result.success).toBe(true);
                expect(result.metadata?.fieldName).toBe(field);
            });
        });

        it("should validate PORT monitor specific fields successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const portFields = [
                { field: "host", value: "example.com" },
                { field: "port", value: 443 },
            ];

            portFields.forEach(({ field, value }) => {
                const result = validateMonitorField("port", field, value);
                expect(result.success).toBe(true);
                expect(result.metadata?.fieldName).toBe(field);
            });
        });

        it("should validate common monitor fields for all types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            const commonFieldsWithoutType = [
                { field: "checkInterval", value: 30000 },
                { field: "id", value: "test-id" },
                { field: "monitoring", value: true },
                { field: "responseTime", value: 200 },
                { field: "retryAttempts", value: 3 },
                { field: "status", value: "up" },
                { field: "timeout", value: 5000 },
            ];

            [
                "http",
                "dns",
                "port",
            ].forEach((monitorType) => {
                // Test common fields (excluding type)
                commonFieldsWithoutType.forEach(({ field, value }) => {
                    const result = validateMonitorField(
                        monitorType,
                        field,
                        value
                    );
                    expect(result.success).toBe(true);
                    expect(result.metadata?.fieldName).toBe(field);
                });

                // Test type field with correct value for each monitor type
                const typeResult = validateMonitorField(
                    monitorType,
                    "type",
                    monitorType
                );
                expect(typeResult.success).toBe(true);
                expect(typeResult.metadata?.fieldName).toBe("type");
            });
        });
    });

    describe("All Three Functions Comprehensive Coverage", () => {
        it("should exercise all validation functions for complete coverage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: schemas-function-coverage-complete",
                "component"
            );
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Test validateSiteData success path
            const site = {
                identifier: "coverage-site",
                name: "Coverage Test",
                monitoring: true,
                monitors: [
                    {
                        id: "coverage-monitor",
                        type: "http",
                        url: "https://coverage.test",
                        checkInterval: 60000,
                        timeout: 5000,
                        retryAttempts: 3,
                        history: [],
                        monitoring: true,
                        status: "up",
                        responseTime: 150,
                    },
                ],
            };
            const siteResult = validateSiteData(site);
            expect(siteResult.success).toBe(true);

            // Test validateMonitorData success path
            const monitor = {
                id: "coverage-monitor",
                type: "http",
                url: "https://coverage.test",
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
                monitoring: true,
                status: "up",
                responseTime: 150,
            };
            const monitorResult = validateMonitorData("http", monitor);
            expect(monitorResult.success).toBe(true);

            // Test validateMonitorField success path
            const fieldResult = validateMonitorField(
                "http",
                "url",
                "https://test.com"
            );
            expect(fieldResult.success).toBe(true);
        });
    });
});
