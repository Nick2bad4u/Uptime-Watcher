/**
 * Additional comprehensive tests for monitorValidation functions to achieve
 * complete function coverage
 */
import { describe, expect, it } from "vitest";

import type {
    DnsFormData,
    HttpFormData,
    PingFormData,
    PortFormData,
} from "../../types/monitorFormData";

import { validateMonitorFormData } from "../../utils/monitorValidation";

describe("monitorValidation functions - Additional Coverage", () => {
    describe("validateMonitorFormData - DNS validation", () => {
        it("should validate valid DNS form data", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const data: Partial<DnsFormData> = {
                checkInterval: 60_000,
                host: "example.com",
                recordType: "A",
                retryAttempts: 3,
                timeout: 5000,
                type: "dns",
            };

            const result = await validateMonitorFormData("dns", data);

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should validate DNS form data with expectedValue", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const data: Partial<DnsFormData> = {
                checkInterval: 60_000,
                expectedValue: "192.168.1.1",
                host: "example.com",
                recordType: "A",
                retryAttempts: 3,
                timeout: 5000,
                type: "dns",
            };

            const result = await validateMonitorFormData("dns", data);

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject DNS form data with missing host", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data: Partial<DnsFormData> = {
                recordType: "A",
                type: "dns",
            };

            const result = await validateMonitorFormData("dns", data);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject DNS form data with invalid host type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                host: 123, // Invalid type
                recordType: "A",
                type: "dns",
            };

            const result = await validateMonitorFormData("dns", data as any);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject DNS form data with missing recordType", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data: Partial<DnsFormData> = {
                host: "example.com",
                type: "dns",
            };

            const result = await validateMonitorFormData("dns", data);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Record type is required")
                )
            ).toBe(true);
        });

        it("should reject DNS form data with invalid recordType type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                host: "example.com",
                recordType: 123, // Invalid type
                type: "dns",
            };

            const result = await validateMonitorFormData("dns", data as any);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Record type is required")
                )
            ).toBe(true);
        });

        it("should handle DNS form data with empty expectedValue", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data: Partial<DnsFormData> = {
                expectedValue: "", // Empty string should be ignored
                host: "example.com",
                recordType: "A",
                type: "dns",
            };

            const result = await validateMonitorFormData("dns", data);

            expect(result.success).toBe(true);
        });

        it("should handle DNS form data with whitespace-only expectedValue", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data: Partial<DnsFormData> = {
                expectedValue: " ".repeat(3), // Whitespace only should be ignored
                host: "example.com",
                recordType: "A",
                type: "dns",
            };

            const result = await validateMonitorFormData("dns", data);

            expect(result.success).toBe(true);
        });
    });

    describe("validateMonitorFormData - Port validation", () => {
        it("should validate valid port form data", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const data: Partial<PortFormData> = {
                checkInterval: 60_000,
                host: "example.com",
                port: 80,
                retryAttempts: 3,
                timeout: 5000,
                type: "port",
            };

            const result = await validateMonitorFormData("port", data);

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject port form data with missing host", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data: Partial<PortFormData> = {
                port: 80,
                type: "port",
            };

            const result = await validateMonitorFormData("port", data);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject port form data with invalid host type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                host: 123, // Invalid type
                port: 80,
                type: "port",
            };

            const result = await validateMonitorFormData("port", data as any);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject port form data with missing port", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data: Partial<PortFormData> = {
                host: "example.com",
                type: "port",
            };

            const result = await validateMonitorFormData("port", data);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Port is required")
                )
            ).toBe(true);
        });

        it("should reject port form data with invalid port type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                host: "example.com",
                port: "80", // Invalid type
                type: "port",
            };

            const result = await validateMonitorFormData("port", data as any);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Port is required")
                )
            ).toBe(true);
        });
    });

    describe("validateMonitorFormData - Ping validation", () => {
        it("should validate valid ping form data", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const data: Partial<PingFormData> = {
                checkInterval: 60_000,
                host: "example.com",
                retryAttempts: 3,
                timeout: 5000,
                type: "ping",
            };

            const result = await validateMonitorFormData("ping", data);

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject ping form data with missing host", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data: Partial<PingFormData> = {
                type: "ping",
            };

            const result = await validateMonitorFormData("ping", data);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject ping form data with invalid host type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                host: 123, // Invalid type
                type: "ping",
            };

            const result = await validateMonitorFormData("ping", data as any);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });
    });

    describe("validateMonitorFormData - HTTP validation", () => {
        it("should validate valid HTTP form data", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const data: Partial<HttpFormData> = {
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
                type: "http",
                url: "https://example.com",
            };

            const result = await validateMonitorFormData("http", data);

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject HTTP form data with missing url", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data: Partial<HttpFormData> = {
                type: "http",
            };

            const result = await validateMonitorFormData("http", data);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) => error.includes("URL is required"))
            ).toBe(true);
        });

        it("should reject HTTP form data with invalid url type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "http",
                url: 123, // Invalid type
            };

            const result = await validateMonitorFormData("http", data as any);

            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) => error.includes("URL is required"))
            ).toBe(true);
        });
    });

    describe("validateMonitorFormData - Edge cases", () => {
        it("should handle unknown monitor types", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const data = {
                type: "unknown-type",
            };

            const result = await validateMonitorFormData("http", data as any);

            // Should handle gracefully, likely returning base validation errors
            expect(result).toHaveProperty("success");
            expect(result).toHaveProperty("errors");
        });

        it("should handle invalid data structure", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result1 = await validateMonitorFormData("http", null as any);

            expect(result1.success).toBe(false);

            const result2 = await validateMonitorFormData(
                "http",
                undefined as any
            );

            expect(result2.success).toBe(false);

            const result3 = await validateMonitorFormData(
                "http",
                "not an object" as any
            );

            expect(result3.success).toBe(false);
        });

        it("should handle empty object", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorValidation.additional",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await validateMonitorFormData("http", {} as any);

            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
});
