/**
 * Comprehensive tests for monitor validation utilities. Tests all validation
 * functions, error handling, and edge cases.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import type { MonitorType } from "../../../shared/types";

// Mock dependencies
vi.mock("../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(),
}));

vi.mock("@shared/validation/schemas", () => ({
    validateMonitorData: vi.fn(),
    validateMonitorField: vi.fn(),
}));

// Mock electronAPI
const mockElectronAPI = {
    monitorTypes: {
        validateMonitorData: vi.fn(),
    },
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

import {
    createMonitorObject,
    validateMonitorData,
    validateMonitorDataClientSide,
    validateMonitorField,
    validateMonitorFieldClientSide,
    validateMonitorFormData,
    type MonitorCreationData,
} from "../../utils/monitorValidation";
import type { ValidationResult } from "../../../shared/types/validation";

// Import mocked functions
import { withUtilityErrorHandling } from "../../utils/errorHandling";
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "../../../shared/validation/schemas";

describe("Monitor Validation Utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mocks
        vi.mocked(withUtilityErrorHandling).mockImplementation(
            async (_fn, _operation, fallback) => {
                try {
                    return await _fn();
                } catch {
                    return fallback;
                }
            }
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("createMonitorObject", () => {
        it("should create monitor object with default values for HTTP type", () => {
            const result = createMonitorObject("http", {
                url: "https://example.com",
            });

            expect(result).toEqual({
                history: [],
                monitoring: true,
                responseTime: -1,
                retryAttempts: 3,
                status: "pending",
                timeout: 10_000,
                type: "http",
                url: "https://example.com",
            });
        });

        it("should create monitor object with default values for port type", () => {
            const result = createMonitorObject("port", {
                host: "localhost",
                port: 3000,
            });

            expect(result).toEqual({
                history: [],
                monitoring: true,
                responseTime: -1,
                retryAttempts: 3,
                status: "pending",
                timeout: 10_000,
                type: "port",
                host: "localhost",
                port: 3000,
            });
        });

        it("should override default values with provided fields", () => {
            const result = createMonitorObject("http", {
                url: "https://example.com",
                timeout: 5000,
                retryAttempts: 5,
                monitoring: false,
                status: "up",
            } as any);

            expect(result).toEqual({
                history: [],
                monitoring: false,
                responseTime: -1,
                retryAttempts: 5,
                status: "up",
                timeout: 5000,
                type: "http",
                url: "https://example.com",
            });
        });

        it("should handle empty fields object", () => {
            const result = createMonitorObject("http", {});

            expect(result["type"]).toBe("http");
            expect(result["history"]).toEqual([]);
            expect(result["monitoring"]).toBe(true);
            expect(result["responseTime"]).toBe(-1);
            expect(result["retryAttempts"]).toBe(3);
            expect(result["status"]).toBe("pending");
            expect(result["timeout"]).toBe(10_000);
        });

        it("should preserve additional custom fields", () => {
            const result = createMonitorObject("http", {
                url: "https://example.com",
                customField: "customValue",
                anotherField: 123,
            } as any);

            expect(result["url"]).toBe("https://example.com");
            expect(result["customField"]).toBe("customValue");
            expect(result["anotherField"]).toBe(123);
        });

        it("should handle different monitor types", () => {
            const httpResult = createMonitorObject("http", {
                url: "https://example.com",
            });
            const portResult = createMonitorObject("port", {
                host: "localhost",
                port: 3000,
            });

            expect(httpResult.type).toBe("http");
            expect(portResult.type).toBe("port");
        });
    });

    describe("validateMonitorData", () => {
        it("should validate monitor data successfully via backend", async () => {
            const mockResult = {
                errors: [],
                success: true,
                warnings: ["Minor issue"],
            };
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockResult
            );

            const result = await validateMonitorData("http", {
                url: "https://example.com",
            });

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: ["Minor issue"],
            });
            expect(
                mockElectronAPI.monitorTypes.validateMonitorData
            ).toHaveBeenCalledWith("http", {
                url: "https://example.com",
            });
        });

        it("should handle validation errors from backend", async () => {
            const mockResult = {
                errors: ["URL is invalid"],
                success: false,
                warnings: [],
            };
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockResult
            );

            const result = await validateMonitorData("http", {
                url: "invalid-url",
            });

            expect(result).toEqual({
                data: undefined,
                errors: ["URL is invalid"],
                metadata: {},
                success: false,
                warnings: [],
            });
        });

        it("should handle backend result without warnings", async () => {
            const mockResult = {
                errors: [],
                success: true,
                // No warnings property - this tests the ?? [] fallback
            };
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockResult
            );

            const result = await validateMonitorData("http", {
                url: "https://example.com",
            });

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: [], // Should default to empty array
            });
        });

        it("should handle backend result with undefined warnings", async () => {
            const mockResult = {
                errors: [],
                success: true,
                warnings: undefined, // Explicitly undefined warnings
            };
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockResult
            );

            const result = await validateMonitorData("http", {
                url: "https://example.com",
            });

            expect(result).toEqual({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: [], // Should default to empty array
            });
        });

        it("should handle IPC errors with fallback", async () => {
            mockElectronAPI.monitorTypes.validateMonitorData.mockRejectedValue(
                new Error("IPC failed")
            );

            const result = await validateMonitorData("http", {
                url: "https://example.com",
            });

            expect(result).toEqual({
                errors: ["Validation failed - unable to connect to backend"],
                metadata: {},
                success: false,
                warnings: [],
            });
        });

        it("should handle different monitor types", async () => {
            const mockResult = {
                errors: [],
                success: true,
                warnings: [],
                metadata: {},
            };
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockResult
            );

            await validateMonitorData("port", {
                host: "localhost",
                port: 3000,
            });

            expect(
                mockElectronAPI.monitorTypes.validateMonitorData
            ).toHaveBeenCalledWith("port", {
                host: "localhost",
                port: 3000,
            });
        });
    });

    describe("validateMonitorDataClientSide", () => {
        it("should validate monitor data using shared schemas", async () => {
            const mockResult = {
                errors: [],
                success: true,
                warnings: ["Minor issue"],
                metadata: {},
            };
            vi.mocked(sharedValidateMonitorData).mockReturnValue(mockResult);

            const result = await validateMonitorDataClientSide("http", {
                url: "https://example.com",
            });

            expect(result).toEqual({
                errors: [],
                success: true,
                warnings: ["Minor issue"],
            });
            expect(sharedValidateMonitorData).toHaveBeenCalledWith("http", {
                url: "https://example.com",
            });
        });

        it("should handle validation errors from shared schemas", async () => {
            const mockResult = {
                errors: ["URL is required"],
                success: false,
                warnings: [],
                metadata: {},
            };
            vi.mocked(sharedValidateMonitorData).mockReturnValue(mockResult);

            const result = await validateMonitorDataClientSide("http", {});

            expect(result).toEqual({
                errors: ["URL is required"],
                success: false,
                warnings: [],
            });
        });

        it("should handle shared validation errors with fallback", async () => {
            vi.mocked(sharedValidateMonitorData).mockImplementation(() => {
                throw new Error("Validation failed");
            });

            const result = await validateMonitorDataClientSide("http", {
                url: "https://example.com",
            });

            expect(result).toEqual({
                errors: ["Client-side validation failed"],
                success: false,
                warnings: [],
            });
        });

        it("should handle different monitor types in client-side validation", async () => {
            const mockResult = {
                errors: [],
                success: true,
                warnings: [],
                metadata: {},
            };
            vi.mocked(sharedValidateMonitorData).mockReturnValue(mockResult);

            await validateMonitorDataClientSide("port", {
                host: "localhost",
                port: 3000,
            });

            expect(sharedValidateMonitorData).toHaveBeenCalledWith("port", {
                host: "localhost",
                port: 3000,
            });
        });
    });

    describe("validateMonitorField", () => {
        beforeEach(() => {
            // Mock validateMonitorData for use in validateMonitorField
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                errors: [],
                success: true,
                warnings: [],
            });
        });

        it("should return empty array for valid field", async () => {
            const result = await validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );

            expect(result).toEqual([]);
            expect(
                mockElectronAPI.monitorTypes.validateMonitorData
            ).toHaveBeenCalledWith("http", {
                url: "https://example.com",
                type: "http",
            });
        });

        it("should return field-specific errors", async () => {
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                errors: ["URL is invalid", "Other error"],
                success: false,
                warnings: [],
            });

            const result = await validateMonitorField(
                "http",
                "url",
                "invalid-url"
            );

            expect(result).toEqual(["URL is invalid"]);
        });

        it("should handle field errors with different patterns", async () => {
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                errors: [
                    "The 'url' field is required",
                    `"url" must be a valid URL`,
                    "url: invalid format",
                    "url contains invalid characters",
                ],
                success: false,
                warnings: [],
            });

            const result = await validateMonitorField("http", "url", "http");

            expect(result).toEqual([
                "The 'url' field is required",
                `"url" must be a valid URL`,
                "url: invalid format",
                "url contains invalid characters",
            ]);
        });

        it("should return all errors if no field-specific errors found", async () => {
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                errors: ["General validation error", "Another error"],
                success: false,
                warnings: [],
            });

            const result = await validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );

            expect(result).toEqual([
                "General validation error",
                "Another error",
            ]);
        });

        it("should handle validation errors with fallback", async () => {
            mockElectronAPI.monitorTypes.validateMonitorData.mockRejectedValue(
                new Error("IPC failed")
            );

            const result = await validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );

            expect(result).toEqual([
                "Validation failed - unable to connect to backend",
            ]);
        });

        it("should handle case insensitive field matching", async () => {
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                errors: ["URL field is invalid", "PORT field error"],
                success: false,
                warnings: [],
            });

            const urlResult = await validateMonitorField(
                "http",
                "url",
                "invalid"
            );
            const portResult = await validateMonitorField(
                "port",
                "port",
                "invalid"
            );

            expect(urlResult).toEqual(["URL field is invalid"]);
            expect(portResult).toEqual(["PORT field error"]);
        });
    });

    describe("validateMonitorFieldClientSide", () => {
        it("should validate field using shared schemas", async () => {
            const mockResult = {
                errors: [],
                success: true,
                warnings: [],
                metadata: {}, // Required by ValidationResult type
            };
            vi.mocked(sharedValidateMonitorField).mockReturnValue(mockResult);

            const result = await validateMonitorFieldClientSide(
                "http",
                "url",
                "https://example.com"
            );

            expect(result).toEqual(mockResult);
            expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                "http",
                "url",
                "https://example.com"
            );
        });

        it("should handle field validation errors", async () => {
            const mockResult = {
                errors: ["URL is invalid"],
                success: false,
                warnings: ["URL format could be improved"],
                metadata: {},
            };
            vi.mocked(sharedValidateMonitorField).mockReturnValue(mockResult);

            const result = await validateMonitorFieldClientSide(
                "http",
                "url",
                "invalid-url"
            );

            expect(result).toEqual({
                errors: ["URL is invalid"],
                success: false,
                warnings: ["URL format could be improved"],
                metadata: {},
            });
        });

        it("should handle client-side validation errors with fallback", async () => {
            vi.mocked(sharedValidateMonitorField).mockImplementation(() => {
                throw new Error("Validation failed");
            });

            const result = await validateMonitorFieldClientSide(
                "http",
                "url",
                "https://example.com"
            );

            expect(result).toEqual({
                errors: ["Failed to validate url on client-side"],
                success: false,
                warnings: [],
                metadata: {},
            });
        });

        it("should handle different field types", async () => {
            const mockResult = {
                errors: [],
                success: true,
                warnings: [],
                metadata: {},
            };
            vi.mocked(sharedValidateMonitorField).mockReturnValue(mockResult);

            await validateMonitorFieldClientSide("port", "port", 3000);
            await validateMonitorFieldClientSide("http", "timeout", 5000);

            expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                "port",
                "port",
                3000
            );
            expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                "http",
                "timeout",
                5000
            );
        });
    });

    describe("validateMonitorFormData", () => {
        beforeEach(() => {
            vi.mocked(sharedValidateMonitorField).mockReturnValue({
                errors: [],
                success: true,
                warnings: [],
                metadata: {},
            });
        });

        describe("HTTP monitor form validation", () => {
            it("should validate HTTP monitor with valid URL", async () => {
                const result = await validateMonitorFormData("http", {
                    url: "https://example.com",
                });

                expect(result.success).toBe(true);
                expect(result.errors).toEqual([]);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "http",
                    "url",
                    "https://example.com"
                );
            });

            it("should require URL for HTTP monitors", async () => {
                const result = await validateMonitorFormData("http", {});

                expect(result).toEqual({
                    errors: ["URL is required for HTTP monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate URL type for HTTP monitors", async () => {
                const result = await validateMonitorFormData("http", {
                    url: 123 as any,
                });

                expect(result).toEqual({
                    errors: ["URL is required for HTTP monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should include URL validation errors", async () => {
                vi.mocked(sharedValidateMonitorField).mockReturnValue({
                    errors: ["URL format is invalid"],
                    success: false,
                    warnings: [],
                    metadata: {},
                });

                const result = await validateMonitorFormData("http", {
                    url: "invalid-url",
                });

                expect(result).toEqual({
                    errors: ["URL format is invalid"],
                    success: false,
                    warnings: [],
                });
            });
        });

        describe("Port monitor form validation", () => {
            it("should validate port monitor with valid host and port", async () => {
                const result = await validateMonitorFormData("port", {
                    host: "localhost",
                    port: 3000,
                });

                expect(result.success).toBe(true);
                expect(result.errors).toEqual([]);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "port",
                    "host",
                    "localhost"
                );
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "port",
                    "port",
                    3000
                );
            });

            it("should require host for port monitors", async () => {
                const result = await validateMonitorFormData("port", {
                    port: 3000,
                });

                expect(result).toEqual({
                    errors: ["Host is required for port monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate host type for port monitors", async () => {
                const result = await validateMonitorFormData("port", {
                    host: 123 as any,
                    port: 3000,
                });

                expect(result).toEqual({
                    errors: ["Host is required for port monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should require port for port monitors", async () => {
                const result = await validateMonitorFormData("port", {
                    host: "localhost",
                });

                expect(result).toEqual({
                    errors: ["Port is required for port monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate port type for port monitors", async () => {
                const result = await validateMonitorFormData("port", {
                    host: "localhost",
                    port: "3000" as any,
                });

                expect(result).toEqual({
                    errors: ["Port is required for port monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should include host and port validation errors", async () => {
                vi.mocked(sharedValidateMonitorField)
                    .mockReturnValueOnce({
                        errors: ["Host is invalid"],
                        success: false,
                        warnings: [],
                        metadata: {},
                    })
                    .mockReturnValueOnce({
                        errors: ["Port out of range"],
                        success: false,
                        warnings: [],
                        metadata: {},
                    });

                const result = await validateMonitorFormData("port", {
                    host: "invalid-host",
                    port: 99_999,
                });

                expect(result).toEqual({
                    errors: ["Host is invalid", "Port out of range"],
                    success: false,
                    warnings: [],
                });
            });

            it("should handle mixed validation results", async () => {
                vi.mocked(sharedValidateMonitorField)
                    .mockReturnValueOnce({
                        errors: [],
                        success: true,
                        warnings: [],
                        metadata: {},
                    })
                    .mockReturnValueOnce({
                        errors: ["Port out of range"],
                        success: false,
                        warnings: [],
                        metadata: {},
                    });

                const result = await validateMonitorFormData("port", {
                    host: "localhost",
                    port: 99_999,
                });

                expect(result).toEqual({
                    errors: ["Port out of range"],
                    success: false,
                    warnings: [],
                });
            });
        });

        describe("Ping monitor form validation", () => {
            it("should validate ping monitor with valid host", async () => {
                const result = await validateMonitorFormData("ping", {
                    host: "example.com",
                });

                expect(result.success).toBe(true);
                expect(result.errors).toEqual([]);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "ping",
                    "host",
                    "example.com"
                );
            });

            it("should require host for ping monitors", async () => {
                const result = await validateMonitorFormData("ping", {});

                expect(result).toEqual({
                    errors: ["Host is required for ping monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate host type for ping monitors", async () => {
                const result = await validateMonitorFormData("ping", {
                    host: 123 as any,
                });

                expect(result).toEqual({
                    errors: ["Host is required for ping monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should include host validation errors", async () => {
                vi.mocked(sharedValidateMonitorField).mockReturnValue({
                    errors: [
                        "Host must be a valid hostname, IP address, or localhost",
                    ],
                    success: false,
                    warnings: [],
                    metadata: {},
                });

                const result = await validateMonitorFormData("ping", {
                    host: "invalid-host",
                });

                expect(result).toEqual({
                    errors: [
                        "Host must be a valid hostname, IP address, or localhost",
                    ],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate different host formats", async () => {
                // Test with IP address
                await validateMonitorFormData("ping", { host: "192.168.1.1" });
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "ping",
                    "host",
                    "192.168.1.1"
                );

                // Test with localhost
                await validateMonitorFormData("ping", { host: "localhost" });
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "ping",
                    "host",
                    "localhost"
                );

                // Test with FQDN
                await validateMonitorFormData("ping", {
                    host: "subdomain.example.com",
                });
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "ping",
                    "host",
                    "subdomain.example.com"
                );
            });
        });

        it("should handle form validation errors with fallback", async () => {
            vi.mocked(sharedValidateMonitorField).mockImplementation(() => {
                throw new Error("Validation failed");
            });

            const result = await validateMonitorFormData("http", {
                url: "https://example.com",
            });

            expect(result).toEqual({
                errors: ["Form validation failed"],
                success: false,
                warnings: [],
            });
        });

        it("should handle unknown monitor types", async () => {
            const result = await validateMonitorFormData(
                "unknown" as MonitorType,
                { someField: "value" } as any
            );

            expect(result.success).toBe(false);
            expect(result.errors).toContain(
                "Unsupported monitor type: unknown"
            );
        });

        it("should handle empty form data", async () => {
            const httpResult = await validateMonitorFormData("http", {});
            const portResult = await validateMonitorFormData("port", {});

            expect(httpResult.success).toBe(false);
            expect(portResult.success).toBe(false);
            expect(httpResult.errors).toContain(
                "URL is required for HTTP monitors"
            );
            expect(portResult.errors).toContain(
                "Host is required for port monitors"
            );
            expect(portResult.errors).toContain(
                "Port is required for port monitors"
            );
        });
    });

    describe("Type Safety", () => {
        it("should ensure MonitorCreationData has required fields", () => {
            const monitor: MonitorCreationData = {
                history: [],
                monitoring: true,
                responseTime: 100,
                retryAttempts: 3,
                status: "up",
                timeout: 5000,
                type: "http",
                url: "https://example.com",
            };

            expect(monitor).toBeDefined();
            expect(monitor.type).toBe("http");
            expect(monitor.history).toEqual([]);
            expect(monitor.monitoring).toBe(true);
        });

        it("should ensure ValidationResult has correct structure", () => {
            const result: ValidationResult = {
                errors: ["Error message"],
                success: false,
                warnings: ["Warning message"],
            };

            expect(result).toBeDefined();
            expect(Array.isArray(result.errors)).toBe(true);
            expect(typeof result.success).toBe("boolean");
            expect(Array.isArray(result.warnings)).toBe(true);
        });
    });

    describe("Edge Cases", () => {
        it("should handle null and undefined values in createMonitorObject", () => {
            const result = createMonitorObject("http", {
                url: "https://example.com",
                customField: null,
                anotherField: undefined,
            } as any);

            expect(result["customField"]).toBeNull();
            expect(result["anotherField"]).toBeUndefined();
        });

        it("should handle very long field names in validateMonitorField", async () => {
            const longFieldName = "a".repeat(1000);
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                errors: [`${longFieldName} is invalid`],
                success: false,
                warnings: [],
            });

            const result = await validateMonitorField(
                "http",
                longFieldName,
                "value"
            );

            expect(result).toEqual([`${longFieldName} is invalid`]);
        });

        it("should handle special characters in field names", async () => {
            const specialFieldName = "field@#$%^&*()";
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                errors: [`${specialFieldName} is invalid`],
                success: false,
                warnings: [],
            });

            const result = await validateMonitorField(
                "http",
                specialFieldName,
                "value"
            );

            expect(result).toEqual([`${specialFieldName} is invalid`]);
        });

        it("should handle multiple validation errors across functions", async () => {
            // Test that each function properly handles and propagates multiple errors
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                errors: [
                    "Error 1",
                    "Error 2",
                    "Error 3",
                ],
                success: false,
                warnings: ["Warning 1", "Warning 2"],
            });

            const result = await validateMonitorData("http", {
                url: "invalid",
            });

            expect(result["errors"]).toHaveLength(3);
            expect(result["warnings"]).toHaveLength(2);
            expect(result["success"]).toBe(false);
        });
    });
});
