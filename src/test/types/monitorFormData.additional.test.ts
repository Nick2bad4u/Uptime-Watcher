/**
 * Additional comprehensive tests for monitorFormData functions to achieve
 * complete function coverage
 */
import { describe, expect, it } from "vitest";
import {
    isDnsFormData,
    isPingFormData,
    isPortFormData,
    isHttpFormData,
    isValidMonitorFormData,
    safeGetFormProperty,
    safeSetFormProperty,
    createDefaultFormData,
} from "../../types/monitorFormData";
import type { PingFormData, PortFormData } from "../../types/monitorFormData";

describe("monitorFormData functions - Additional Coverage", () => {
    describe("isDnsFormData - Edge Cases", () => {
        it("should return true for valid DNS form data with all fields", () => {
            const data = {
                type: "dns" as const,
                host: "example.com",
                recordType: "A",
                expectedValue: "192.168.1.1",
            };
            expect(isDnsFormData(data)).toBe(true);
        });

        it("should return false for empty string host", () => {
            const data = {
                type: "dns" as const,
                host: "",
                recordType: "A",
            };
            expect(isDnsFormData(data)).toBe(false);
        });

        it("should return false for empty string recordType", () => {
            const data = {
                type: "dns" as const,
                host: "example.com",
                recordType: "",
            };
            expect(isDnsFormData(data)).toBe(false);
        });
    });

    describe("isPingFormData - Edge Cases", () => {
        it("should return true for valid ping form data with additional fields", () => {
            const data = {
                type: "ping" as const,
                host: "example.com",
                timeout: 5000,
            };
            expect(isPingFormData(data)).toBe(true);
        });

        it("should return false for empty string host", () => {
            const data = {
                type: "ping" as const,
                host: "",
            };
            expect(isPingFormData(data)).toBe(false);
        });
    });

    describe("isPortFormData - Edge Cases", () => {
        it("should return true for valid port form data with additional fields", () => {
            const data = {
                type: "port" as const,
                host: "example.com",
                port: 443,
                ssl: true,
            };
            expect(isPortFormData(data)).toBe(true);
        });

        it("should return false for zero port", () => {
            const data = {
                type: "port" as const,
                host: "example.com",
                port: 0,
            };
            expect(isPortFormData(data)).toBe(false);
        });

        it("should return false for negative port", () => {
            const data = {
                type: "port" as const,
                host: "example.com",
                port: -1,
            };
            expect(isPortFormData(data)).toBe(false);
        });

        it("should return false for port above 65535", () => {
            const data = {
                type: "port" as const,
                host: "example.com",
                port: 65_536,
            };
            expect(isPortFormData(data)).toBe(false);
        });
    });

    describe("isHttpFormData - Edge Cases", () => {
        it("should return true for valid HTTP form data with additional fields", () => {
            const data = {
                type: "http" as const,
                url: "https://example.com",
                method: "GET",
                headers: {},
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };
            expect(isHttpFormData(data)).toBe(true);
        });

        it("should return false for empty string url", () => {
            const data = {
                type: "http" as const,
                url: "",
            };
            expect(isHttpFormData(data)).toBe(false);
        });
    });

    describe("isValidMonitorFormData - Comprehensive Coverage", () => {
        it("should return true for valid ping monitor form data", () => {
            const data: PingFormData = {
                type: "ping",
                host: "example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };
            expect(isValidMonitorFormData(data)).toBe(true);
        });

        it("should return true for valid port monitor form data", () => {
            const data: PortFormData = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };
            expect(isValidMonitorFormData(data)).toBe(true);
        });

        it("should return false for partial data missing required fields", () => {
            const data = {
                type: "http",
                // Missing url
                name: "Incomplete Monitor",
            };
            expect(isValidMonitorFormData(data)).toBe(false);
        });

        it("should return false for data with missing type", () => {
            const data = {
                url: "https://example.com",
                name: "No Type Monitor",
            };
            expect(isValidMonitorFormData(data)).toBe(false);
        });
    });

    describe("safeGetFormProperty - Comprehensive Coverage", () => {
        it("should handle nested object access", () => {
            const data = {
                config: {
                    ssl: true,
                    timeout: 3000,
                },
                name: "Test",
            };
            expect(safeGetFormProperty(data, "config", null)).toEqual({
                ssl: true,
                timeout: 3000,
            });
        });

        it("should handle boolean values", () => {
            const data = {
                ssl: true,
                monitoring: false,
            };
            expect(safeGetFormProperty(data, "ssl", false)).toBe(true);
            expect(safeGetFormProperty(data, "monitoring", true)).toBe(false);
        });

        it("should handle array values", () => {
            const data = {
                headers: ["Content-Type: application/json"],
                tags: ["api", "health"],
            };
            expect(safeGetFormProperty(data, "headers", [])).toEqual([
                "Content-Type: application/json",
            ]);
            expect(safeGetFormProperty(data, "tags", [])).toEqual([
                "api",
                "health",
            ]);
        });

        it("should return default for false-y values when no default provided", () => {
            const data = {
                empty: "",
                zero: 0,
                falsy: false,
            };
            expect(safeGetFormProperty(data, "empty", "default")).toBe("");
            expect(safeGetFormProperty(data, "zero", 999)).toBe(0);
            expect(safeGetFormProperty(data, "falsy", true)).toBe(false);
        });
    });

    describe("safeSetFormProperty - Comprehensive Coverage", () => {
        it("should handle setting nested objects", () => {
            const data = {
                name: "Test",
            };
            safeSetFormProperty(data, "config", { ssl: true });
            expect((data as any)["config"]).toEqual({ ssl: true });
            expect(data.name).toBe("Test");
        });

        it("should handle setting arrays", () => {
            const data = {
                name: "Test",
            };
            safeSetFormProperty(data, "tags", ["api", "health"]);
            expect((data as any)["tags"]).toEqual(["api", "health"]);
            expect(data.name).toBe("Test");
        });

        it("should handle setting boolean values", () => {
            const data = {
                name: "Test",
            };
            safeSetFormProperty(data, "ssl", true);
            expect((data as any)["ssl"]).toBe(true);
            expect(data.name).toBe("Test");
        });

        it("should handle setting null and undefined values", () => {
            const data = {
                name: "Test",
                existing: "value",
            };
            safeSetFormProperty(data, "nullValue", null);
            expect((data as any)["nullValue"]).toBeNull();

            safeSetFormProperty(data, "undefinedValue", undefined);
            expect((data as any)["undefinedValue"]).toBeUndefined();
        });

        it("should preserve all existing properties", () => {
            const data = {
                name: "Test",
                timeout: 5000,
                ssl: true,
                tags: ["api"],
            };
            safeSetFormProperty(data, "newProp", "newValue");
            expect(data.name).toBe("Test");
            expect(data.timeout).toBe(5000);
            expect(data.ssl).toBe(true);
            expect(data.tags).toEqual(["api"]);
            expect((data as any)["newProp"]).toBe("newValue");
        });
    });

    describe("createDefaultFormData - Edge Cases", () => {
        it("should handle case variations", () => {
            const result1 = (createDefaultFormData as any)("DNS");
            expect(result1.type).toBe("DNS");

            const result2 = (createDefaultFormData as any)("Http");
            expect(result2.type).toBe("Http");
        });

        it("should handle empty string type", () => {
            const result = (createDefaultFormData as any)("");
            expect(result.type).toBe("");
        });

        it("should handle very long type names", () => {
            const longType =
                "very-long-custom-monitor-type-that-is-not-recognized";
            const result = (createDefaultFormData as any)(longType);
            expect(result.type).toBe(longType);
        });

        it("should create consistent base properties for all types", () => {
            const types = [
                "dns",
                "http",
                "ping",
                "port",
                "custom",
            ];

            for (const type of types) {
                const result = (createDefaultFormData as any)(type);
                expect(result).toHaveProperty("checkInterval");
                expect(result).toHaveProperty("timeout");
                expect(result).toHaveProperty("retryAttempts");
                expect(result.type).toBe(type);
            }
        });
    });
});
