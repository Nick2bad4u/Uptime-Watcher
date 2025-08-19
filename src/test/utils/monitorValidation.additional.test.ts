/**
 * Additional comprehensive tests for monitorValidation functions to achieve
 * complete function coverage
 */
import { describe, expect, it } from "vitest";
import { validateMonitorFormData } from "../../utils/monitorValidation";
import type {
    DnsFormData,
    HttpFormData,
    PingFormData,
    PortFormData,
} from "../../types/monitorFormData";

describe("monitorValidation functions - Additional Coverage", () => {
    describe("validateMonitorFormData - DNS validation", () => {
        it("should validate valid DNS form data", async () => {
            const data: Partial<DnsFormData> = {
                type: "dns",
                host: "example.com",
                recordType: "A",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const result = await validateMonitorFormData("dns", data);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should validate DNS form data with expectedValue", async () => {
            const data: Partial<DnsFormData> = {
                type: "dns",
                host: "example.com",
                recordType: "A",
                expectedValue: "192.168.1.1",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const result = await validateMonitorFormData("dns", data);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject DNS form data with missing host", async () => {
            const data: Partial<DnsFormData> = {
                type: "dns",
                recordType: "A",
            };

            const result = await validateMonitorFormData("dns", data);
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject DNS form data with invalid host type", async () => {
            const data = {
                type: "dns",
                host: 123, // Invalid type
                recordType: "A",
            };

            const result = await validateMonitorFormData("dns", data as any);
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject DNS form data with missing recordType", async () => {
            const data: Partial<DnsFormData> = {
                type: "dns",
                host: "example.com",
            };

            const result = await validateMonitorFormData("dns", data);
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Record type is required")
                )
            ).toBe(true);
        });

        it("should reject DNS form data with invalid recordType type", async () => {
            const data = {
                type: "dns",
                host: "example.com",
                recordType: 123, // Invalid type
            };

            const result = await validateMonitorFormData("dns", data as any);
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Record type is required")
                )
            ).toBe(true);
        });

        it("should handle DNS form data with empty expectedValue", async () => {
            const data: Partial<DnsFormData> = {
                type: "dns",
                host: "example.com",
                recordType: "A",
                expectedValue: "", // Empty string should be ignored
            };

            const result = await validateMonitorFormData("dns", data);
            expect(result.success).toBe(true);
        });

        it("should handle DNS form data with whitespace-only expectedValue", async () => {
            const data: Partial<DnsFormData> = {
                type: "dns",
                host: "example.com",
                recordType: "A",
                expectedValue: "   ", // Whitespace only should be ignored
            };

            const result = await validateMonitorFormData("dns", data);
            expect(result.success).toBe(true);
        });
    });

    describe("validateMonitorFormData - Port validation", () => {
        it("should validate valid port form data", async () => {
            const data: Partial<PortFormData> = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const result = await validateMonitorFormData("port", data);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject port form data with missing host", async () => {
            const data: Partial<PortFormData> = {
                type: "port",
                port: 80,
            };

            const result = await validateMonitorFormData("port", data);
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject port form data with invalid host type", async () => {
            const data = {
                type: "port",
                host: 123, // Invalid type
                port: 80,
            };

            const result = await validateMonitorFormData("port", data as any);
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Host is required")
                )
            ).toBe(true);
        });

        it("should reject port form data with missing port", async () => {
            const data: Partial<PortFormData> = {
                type: "port",
                host: "example.com",
            };

            const result = await validateMonitorFormData("port", data);
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) =>
                    error.includes("Port is required")
                )
            ).toBe(true);
        });

        it("should reject port form data with invalid port type", async () => {
            const data = {
                type: "port",
                host: "example.com",
                port: "80", // Invalid type
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
        it("should validate valid ping form data", async () => {
            const data: Partial<PingFormData> = {
                type: "ping",
                host: "example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const result = await validateMonitorFormData("ping", data);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject ping form data with missing host", async () => {
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

        it("should reject ping form data with invalid host type", async () => {
            const data = {
                type: "ping",
                host: 123, // Invalid type
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
        it("should validate valid HTTP form data", async () => {
            const data: Partial<HttpFormData> = {
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            const result = await validateMonitorFormData("http", data);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject HTTP form data with missing url", async () => {
            const data: Partial<HttpFormData> = {
                type: "http",
            };

            const result = await validateMonitorFormData("http", data);
            expect(result.success).toBe(false);
            expect(
                result.errors.some((error) => error.includes("URL is required"))
            ).toBe(true);
        });

        it("should reject HTTP form data with invalid url type", async () => {
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
        it("should handle unknown monitor types", async () => {
            const data = {
                type: "unknown-type",
            };

            const result = await validateMonitorFormData("http", data as any);
            // Should handle gracefully, likely returning base validation errors
            expect(result).toHaveProperty("success");
            expect(result).toHaveProperty("errors");
        });

        it("should handle invalid data structure", async () => {
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

        it("should handle empty object", async () => {
            const result = await validateMonitorFormData("http", {} as any);
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
});
