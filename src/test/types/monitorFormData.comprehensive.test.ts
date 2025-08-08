/**
 * Comprehensive tests for monitor form data types
 */
import { describe, expect, it } from "vitest";
import type {
    BaseFormData,
    DynamicFormData,
    HttpFormData,
    MonitorFormData,
    PingFormData,
    PortFormData,
} from "../../types/monitorFormData";
import {
    createDefaultFormData,
    isHttpFormData,
    isPingFormData,
    isPortFormData,
    isValidMonitorFormData,
    safeGetFormProperty,
    safeSetFormProperty,
} from "../../types/monitorFormData";

describe("Monitor Form Data Types", () => {
    describe("Interface Compliance", () => {
        it("should support BaseFormData interface", () => {
            const baseForm: BaseFormData = {
                checkInterval: 300_000,
                monitoring: true,
                retryAttempts: 3,
                timeout: 10_000,
                type: "http",
            };

            expect(baseForm.checkInterval).toBe(300_000);
            expect(baseForm.monitoring).toBe(true);
            expect(baseForm.retryAttempts).toBe(3);
            expect(baseForm.timeout).toBe(10_000);
            expect(baseForm.type).toBe("http");
        });

        it("should support DynamicFormData interface", () => {
            const dynamicForm: DynamicFormData = {
                checkInterval: 300_000,
                customProperty: "custom value",
                monitoring: true,
                retryAttempts: 3,
                timeout: 10_000,
                type: "custom",
            };

            expect(dynamicForm.checkInterval).toBe(300_000);
            expect(dynamicForm["customProperty"]).toBe("custom value");
            expect(dynamicForm.monitoring).toBe(true);
        });

        it("should support HttpFormData interface", () => {
            const httpForm: HttpFormData = {
                checkInterval: 300_000,
                monitoring: true,
                retryAttempts: 3,
                timeout: 10_000,
                type: "http",
                url: "https://example.com",
            };

            expect(httpForm.type).toBe("http");
            expect(httpForm.url).toBe("https://example.com");
            expect(httpForm.checkInterval).toBe(300_000);
        });

        it("should support PingFormData interface", () => {
            const pingForm: PingFormData = {
                checkInterval: 300_000,
                host: "example.com",
                monitoring: true,
                retryAttempts: 3,
                timeout: 10_000,
                type: "ping",
            };

            expect(pingForm.type).toBe("ping");
            expect(pingForm.host).toBe("example.com");
            expect(pingForm.checkInterval).toBe(300_000);
        });

        it("should support PortFormData interface", () => {
            const portForm: PortFormData = {
                checkInterval: 300_000,
                host: "example.com",
                monitoring: true,
                port: 80,
                retryAttempts: 3,
                timeout: 10_000,
                type: "port",
            };

            expect(portForm.type).toBe("port");
            expect(portForm.host).toBe("example.com");
            expect(portForm.port).toBe(80);
            expect(portForm.checkInterval).toBe(300_000);
        });

        it("should support MonitorFormData union type", () => {
            const httpData: MonitorFormData = {
                checkInterval: 300_000,
                monitoring: true,
                retryAttempts: 3,
                timeout: 10_000,
                type: "http",
                url: "https://example.com",
            };

            const pingData: MonitorFormData = {
                checkInterval: 300_000,
                host: "example.com",
                monitoring: true,
                retryAttempts: 3,
                timeout: 10_000,
                type: "ping",
            };

            const portData: MonitorFormData = {
                checkInterval: 300_000,
                host: "example.com",
                monitoring: true,
                port: 80,
                retryAttempts: 3,
                timeout: 10_000,
                type: "port",
            };

            expect(httpData.type).toBe("http");
            expect(pingData.type).toBe("ping");
            expect(portData.type).toBe("port");
        });
    });

    describe("createDefaultFormData function", () => {
        it("should create default HTTP form data", () => {
            const defaultHttp = createDefaultFormData("http");

            expect(defaultHttp.type).toBe("http");
            expect(defaultHttp.checkInterval).toBe(300_000);
            expect(defaultHttp.monitoring).toBe(true);
            expect(defaultHttp.retryAttempts).toBe(3);
            expect(defaultHttp.timeout).toBe(10_000);
        });

        it("should create default ping form data", () => {
            const defaultPing = createDefaultFormData("ping");

            expect(defaultPing.type).toBe("ping");
            expect(defaultPing.checkInterval).toBe(300_000);
            expect(defaultPing.monitoring).toBe(true);
            expect(defaultPing.retryAttempts).toBe(3);
            expect(defaultPing.timeout).toBe(10_000);
        });

        it("should create default port form data", () => {
            const defaultPort = createDefaultFormData("port");

            expect(defaultPort.type).toBe("port");
            expect(defaultPort.checkInterval).toBe(300_000);
            expect(defaultPort.monitoring).toBe(true);
            expect(defaultPort.retryAttempts).toBe(3);
            expect(defaultPort.timeout).toBe(10_000);
        });

        it("should create default form data for any type", () => {
            const defaultCustom = (
                createDefaultFormData as (type: string) => Partial<BaseFormData>
            )("custom");

            expect(defaultCustom.type).toBe("custom");
            expect(defaultCustom.checkInterval).toBe(300_000);
            expect(defaultCustom.monitoring).toBe(true);
            expect(defaultCustom.retryAttempts).toBe(3);
            expect(defaultCustom.timeout).toBe(10_000);
        });
    });

    describe("Type Guard Functions", () => {
        describe("isHttpFormData", () => {
            it("should return true for valid HTTP form data", () => {
                const httpData: Partial<HttpFormData> = {
                    type: "http",
                    url: "https://example.com",
                };

                expect(isHttpFormData(httpData)).toBe(true);
            });

            it("should return false for data with wrong type", () => {
                const wrongType = {
                    type: "ping" as const,
                    url: "https://example.com",
                };

                expect(
                    isHttpFormData(wrongType as Partial<MonitorFormData>)
                ).toBe(false);
            });

            it("should return false for data missing URL", () => {
                const missingUrl = {
                    type: "http" as const,
                };

                expect(
                    isHttpFormData(missingUrl as Partial<MonitorFormData>)
                ).toBe(false);
            });

            it("should return false for data with invalid URL type", () => {
                const invalidUrl = {
                    type: "http" as const,
                    url: 123,
                };

                expect(isHttpFormData(invalidUrl as any)).toBe(false);
            });
        });

        describe("isPingFormData", () => {
            it("should return true for valid ping form data", () => {
                const pingData: Partial<PingFormData> = {
                    host: "example.com",
                    type: "ping",
                };

                expect(isPingFormData(pingData)).toBe(true);
            });

            it("should return false for data with wrong type", () => {
                const wrongType = {
                    host: "example.com",
                    type: "http" as const,
                };

                expect(
                    isPingFormData(wrongType as Partial<MonitorFormData>)
                ).toBe(false);
            });

            it("should return false for data missing host", () => {
                const missingHost = {
                    type: "ping" as const,
                };

                expect(
                    isPingFormData(missingHost as Partial<MonitorFormData>)
                ).toBe(false);
            });

            it("should return false for data with invalid host type", () => {
                const invalidHost = {
                    host: 123,
                    type: "ping" as const,
                };

                expect(isPingFormData(invalidHost as any)).toBe(false);
            });
        });

        describe("isPortFormData", () => {
            it("should return true for valid port form data", () => {
                const portData: Partial<PortFormData> = {
                    host: "example.com",
                    port: 80,
                    type: "port",
                };

                expect(isPortFormData(portData)).toBe(true);
            });

            it("should return false for data with wrong type", () => {
                const wrongType = {
                    host: "example.com",
                    port: 80,
                    type: "http" as const,
                };

                expect(
                    isPortFormData(wrongType as Partial<MonitorFormData>)
                ).toBe(false);
            });

            it("should return false for data missing host", () => {
                const missingHost = {
                    port: 80,
                    type: "port" as const,
                };

                expect(
                    isPortFormData(missingHost as Partial<MonitorFormData>)
                ).toBe(false);
            });

            it("should return false for data missing port", () => {
                const missingPort = {
                    host: "example.com",
                    type: "port" as const,
                };

                expect(
                    isPortFormData(missingPort as Partial<MonitorFormData>)
                ).toBe(false);
            });

            it("should return false for data with invalid host type", () => {
                const invalidHost = {
                    host: 123,
                    port: 80,
                    type: "port" as const,
                };

                expect(isPortFormData(invalidHost as any)).toBe(false);
            });

            it("should return false for data with invalid port type", () => {
                const invalidPort = {
                    host: "example.com",
                    port: "80",
                    type: "port" as const,
                };

                expect(isPortFormData(invalidPort as any)).toBe(false);
            });
        });

        describe("isValidMonitorFormData", () => {
            it("should return true for valid HTTP form data", () => {
                const httpData = {
                    type: "http",
                    url: "https://example.com",
                };

                expect(isValidMonitorFormData(httpData)).toBe(true);
            });

            it("should return true for valid ping form data", () => {
                const pingData = {
                    host: "example.com",
                    type: "ping",
                };

                expect(isValidMonitorFormData(pingData)).toBe(true);
            });

            it("should return true for valid port form data", () => {
                const portData = {
                    host: "example.com",
                    port: 80,
                    type: "port",
                };

                expect(isValidMonitorFormData(portData)).toBe(true);
            });

            it("should return false for null data", () => {
                expect(isValidMonitorFormData(null)).toBe(false);
            });

            it("should return false for non-object data", () => {
                expect(isValidMonitorFormData("string")).toBe(false);
                expect(isValidMonitorFormData(123)).toBe(false);
                expect(isValidMonitorFormData(true)).toBe(false);
            });

            it("should return false for data without type", () => {
                const noType = {
                    url: "https://example.com",
                };

                expect(isValidMonitorFormData(noType)).toBe(false);
            });

            it("should return false for data with invalid type", () => {
                const invalidType = {
                    type: 123,
                    url: "https://example.com",
                };

                expect(isValidMonitorFormData(invalidType)).toBe(false);
            });

            it("should return false for unknown monitor type", () => {
                const unknownType = {
                    type: "unknown",
                    data: "some data",
                };

                expect(isValidMonitorFormData(unknownType)).toBe(false);
            });

            it("should return false for incomplete valid type data", () => {
                const incompleteHttp = {
                    type: "http",
                    // Missing required URL
                };

                expect(isValidMonitorFormData(incompleteHttp)).toBe(false);
            });
        });
    });

    describe("Safe Property Access Functions", () => {
        describe("safeGetFormProperty", () => {
            it("should return property value when it exists", () => {
                const data: DynamicFormData = {
                    checkInterval: 5000,
                    customProperty: "test value",
                };

                expect(safeGetFormProperty(data, "checkInterval", 1000)).toBe(
                    5000
                );
                expect(
                    safeGetFormProperty(data, "customProperty", "default")
                ).toBe("test value");
            });

            it("should return default value when property does not exist", () => {
                const data: DynamicFormData = {};

                expect(safeGetFormProperty(data, "checkInterval", 1000)).toBe(
                    1000
                );
                expect(
                    safeGetFormProperty(data, "nonExistent", "default")
                ).toBe("default");
            });

            it("should return default value when property is undefined", () => {
                const data: DynamicFormData = {};

                expect(safeGetFormProperty(data, "checkInterval", 1000)).toBe(
                    1000
                );
            });

            it("should return property value even if falsy (but not undefined)", () => {
                const data: DynamicFormData = {
                    checkInterval: 0,
                    enabled: false,
                    text: "",
                };

                expect(safeGetFormProperty(data, "checkInterval", 1000)).toBe(
                    0
                );
                expect(safeGetFormProperty(data, "enabled", true)).toBe(false);
                expect(safeGetFormProperty(data, "text", "default")).toBe("");
            });
        });

        describe("safeSetFormProperty", () => {
            it("should set property on form data", () => {
                const data: DynamicFormData = {};

                safeSetFormProperty(data, "checkInterval", 5000);
                safeSetFormProperty(data, "customProperty", "test value");

                expect(data.checkInterval).toBe(5000);
                expect(data["customProperty"]).toBe("test value");
            });

            it("should overwrite existing property", () => {
                const data: DynamicFormData = {
                    checkInterval: 1000,
                };

                safeSetFormProperty(data, "checkInterval", 5000);

                expect(data.checkInterval).toBe(5000);
            });

            it("should set various data types", () => {
                const data: DynamicFormData = {};

                safeSetFormProperty(data, "number", 123);
                safeSetFormProperty(data, "string", "test");
                safeSetFormProperty(data, "boolean", true);
                safeSetFormProperty(data, "object", { nested: "value" });
                safeSetFormProperty(data, "array", [1, 2, 3]);

                expect(data["number"]).toBe(123);
                expect(data["string"]).toBe("test");
                expect(data["boolean"]).toBe(true);
                expect(data["object"]).toEqual({ nested: "value" });
                expect(data["array"]).toEqual([1, 2, 3]);
            });
        });
    });

    describe("Real-world Usage Patterns", () => {
        it("should handle form data creation workflow", () => {
            // Start with default data
            const baseData = createDefaultFormData("http");

            // Convert to dynamic for manipulation
            const dynamicData: DynamicFormData = { ...baseData };

            // Add specific properties
            safeSetFormProperty(dynamicData, "url", "https://api.example.com");
            safeSetFormProperty(dynamicData, "method", "POST");

            // Validate the final form
            expect(isValidMonitorFormData(dynamicData)).toBe(true);
            expect(isHttpFormData(dynamicData as any)).toBe(true);
        });

        it("should handle form data editing workflow", () => {
            const existingData: HttpFormData = {
                checkInterval: 300_000,
                monitoring: true,
                retryAttempts: 3,
                timeout: 10_000,
                type: "http",
                url: "https://old-url.com",
            };

            // Edit URL
            const editedData: DynamicFormData = { ...existingData };
            safeSetFormProperty(editedData, "url", "https://new-url.com");

            // Update interval
            safeSetFormProperty(editedData, "checkInterval", 600_000);

            expect(safeGetFormProperty(editedData, "url", "")).toBe(
                "https://new-url.com"
            );
            expect(safeGetFormProperty(editedData, "checkInterval", 0)).toBe(
                600_000
            );
            expect(isValidMonitorFormData(editedData)).toBe(true);
        });

        it("should handle different monitor type conversions", () => {
            // Start with HTTP monitor
            const httpData = createDefaultFormData("http");
            const dynamicHttp: DynamicFormData = { ...httpData };
            safeSetFormProperty(dynamicHttp, "url", "https://example.com");

            // Convert to ping monitor
            const pingData = createDefaultFormData("ping");
            const dynamicPing: DynamicFormData = { ...pingData };
            safeSetFormProperty(dynamicPing, "host", "example.com");

            // Convert to port monitor
            const portData = createDefaultFormData("port");
            const dynamicPort: DynamicFormData = { ...portData };
            safeSetFormProperty(dynamicPort, "host", "example.com");
            safeSetFormProperty(dynamicPort, "port", 443);

            expect(isHttpFormData(dynamicHttp as any)).toBe(true);
            expect(isPingFormData(dynamicPing as any)).toBe(true);
            expect(isPortFormData(dynamicPort as any)).toBe(true);
        });

        it("should handle validation error scenarios", () => {
            const invalidScenarios = [
                { type: "http" }, // Missing URL
                { type: "ping" }, // Missing host
                { type: "port", host: "example.com" }, // Missing port
                { type: "port", port: 80 }, // Missing host
                { url: "https://example.com" }, // Missing type
                null,
                undefined,
                "string",
                123,
            ];

            invalidScenarios.forEach((scenario) => {
                expect(isValidMonitorFormData(scenario)).toBe(false);
            });
        });

        it("should handle partial form data gracefully", () => {
            const partialHttp: Partial<HttpFormData> = {
                type: "http",
                url: "https://example.com",
                // Missing other optional properties
            };

            const partialPing: Partial<PingFormData> = {
                host: "example.com",
                type: "ping",
                // Missing other optional properties
            };

            const partialPort: Partial<PortFormData> = {
                host: "example.com",
                port: 80,
                type: "port",
                // Missing other optional properties
            };

            expect(isHttpFormData(partialHttp)).toBe(true);
            expect(isPingFormData(partialPing)).toBe(true);
            expect(isPortFormData(partialPort)).toBe(true);
        });
    });
});
