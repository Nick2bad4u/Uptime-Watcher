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
        it("should return true for valid DNS form data with all fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "dns" as const,
                host: "example.com",
                recordType: "A",
                expectedValue: "192.168.1.1",
            };
            expect(isDnsFormData(data)).toBeTruthy();
        });

        it("should return false for empty string host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "dns" as const,
                host: "",
                recordType: "A",
            };
            expect(isDnsFormData(data)).toBeFalsy();
        });

        it("should return false for empty string recordType", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "dns" as const,
                host: "example.com",
                recordType: "",
            };
            expect(isDnsFormData(data)).toBeFalsy();
        });
    });

    describe("isPingFormData - Edge Cases", () => {
        it("should return true for valid ping form data with additional fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "ping" as const,
                host: "example.com",
                timeout: 5000,
            };
            expect(isPingFormData(data)).toBeTruthy();
        });

        it("should return false for empty string host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "ping" as const,
                host: "",
            };
            expect(isPingFormData(data)).toBeFalsy();
        });
    });

    describe("isPortFormData - Edge Cases", () => {
        it("should return true for valid port form data with additional fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port" as const,
                host: "example.com",
                port: 443,
                ssl: true,
            };
            expect(isPortFormData(data)).toBeTruthy();
        });

        it("should return false for zero port", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port" as const,
                host: "example.com",
                port: 0,
            };
            expect(isPortFormData(data)).toBeFalsy();
        });

        it("should return false for negative port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port" as const,
                host: "example.com",
                port: -1,
            };
            expect(isPortFormData(data)).toBeFalsy();
        });

        it("should return false for port above 65535", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port" as const,
                host: "example.com",
                port: 65_536,
            };
            expect(isPortFormData(data)).toBeFalsy();
        });
    });

    describe("isHttpFormData - Edge Cases", () => {
        it("should return true for valid HTTP form data with additional fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "http" as const,
                url: "https://example.com",
                method: "GET",
                headers: {},
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };
            expect(isHttpFormData(data)).toBeTruthy();
        });

        it("should return false for empty string url", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "http" as const,
                url: "",
            };
            expect(isHttpFormData(data)).toBeFalsy();
        });
    });

    describe("isValidMonitorFormData - Comprehensive Coverage", () => {
        it("should return true for valid ping monitor form data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const data: PingFormData = {
                type: "ping",
                host: "example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };
            expect(isValidMonitorFormData(data)).toBeTruthy();
        });

        it("should return true for valid port monitor form data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const data: PortFormData = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };
            expect(isValidMonitorFormData(data)).toBeTruthy();
        });

        it("should return false for partial data missing required fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "http",
                // Missing url
                name: "Incomplete Monitor",
            };
            expect(isValidMonitorFormData(data)).toBeFalsy();
        });

        it("should return false for data with missing type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                url: "https://example.com",
                name: "No Type Monitor",
            };
            expect(isValidMonitorFormData(data)).toBeFalsy();
        });
    });

    describe("safeGetFormProperty - Comprehensive Coverage", () => {
        it("should handle nested object access", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle boolean values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                ssl: true,
                monitoring: false,
            };
            expect(safeGetFormProperty(data, "ssl", false)).toBeTruthy();
            expect(safeGetFormProperty(data, "monitoring", true)).toBeFalsy();
        });

        it("should handle array values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should return default for false-y values when no default provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                empty: "",
                zero: 0,
                falsy: false,
            };
            expect(safeGetFormProperty(data, "empty", "default")).toBe("");
            expect(safeGetFormProperty(data, "zero", 999)).toBe(0);
            expect(safeGetFormProperty(data, "falsy", true)).toBeFalsy();
        });
    });

    describe("safeSetFormProperty - Comprehensive Coverage", () => {
        it("should handle setting nested objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                name: "Test",
            };
            safeSetFormProperty(data, "config", { ssl: true });
            expect((data as any)["config"]).toEqual({ ssl: true });
            expect(data.name).toBe("Test");
        });

        it("should handle setting arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                name: "Test",
            };
            safeSetFormProperty(data, "tags", ["api", "health"]);
            expect((data as any)["tags"]).toEqual(["api", "health"]);
            expect(data.name).toBe("Test");
        });

        it("should handle setting boolean values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                name: "Test",
            };
            safeSetFormProperty(data, "ssl", true);
            expect((data as any)["ssl"]).toBeTruthy();
            expect(data.name).toBe("Test");
        });

        it("should handle setting null and undefined values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                name: "Test",
                existing: "value",
            };
            safeSetFormProperty(data, "nullValue", null);
            expect((data as any)["nullValue"]).toBeNull();

            safeSetFormProperty(data, "undefinedValue", undefined);
            expect((data as any)["undefinedValue"]).toBeUndefined();
        });

        it("should preserve all existing properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                name: "Test",
                timeout: 5000,
                ssl: true,
                tags: ["api"],
            };
            safeSetFormProperty(data, "newProp", "newValue");
            expect(data.name).toBe("Test");
            expect(data.timeout).toBe(5000);
            expect(data.ssl).toBeTruthy();
            expect(data.tags).toEqual(["api"]);
            expect((data as any)["newProp"]).toBe("newValue");
        });
    });

    describe("createDefaultFormData - Edge Cases", () => {
        it("should handle case variations", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => {
                (createDefaultFormData as unknown as (type: string) => unknown)(
                    "DNS"
                );
            }).toThrowError(/invalid monitor type/i);

            expect(() => {
                (createDefaultFormData as unknown as (type: string) => unknown)(
                    "HTTP"
                );
            }).toThrowError(/invalid monitor type/i);
        });

        it("should handle empty string type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(() => {
                (createDefaultFormData as unknown as (type: string) => unknown)(
                    ""
                );
            }).toThrowError(/invalid monitor type/i);
        });

        it("should handle very long type names", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const longType =
                "very-long-custom-monitor-type-that-is-not-recognized";

            expect(() => {
                (createDefaultFormData as unknown as (type: string) => unknown)(
                    longType
                );
            }).toThrowError(/invalid monitor type/i);
        });

        it("should create consistent base properties for all types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: monitorFormData.additional",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const types = ["dns", "http", "ping", "port"] as const;

            for (const type of types) {
                const result = createDefaultFormData(type);
                expect(result).toHaveProperty("checkInterval");
                expect(result).toHaveProperty("timeout");
                expect(result).toHaveProperty("retryAttempts");
                expect(result.type).toBe(type);
            }
        });
    });
});
