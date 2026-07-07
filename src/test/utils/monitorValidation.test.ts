/**
 * Comprehensive tests for monitor validation utilities. Tests all validation
 * functions, error handling, and edge cases.
 */

import type { MonitorType } from "@shared/types";
import type { ValidationResult } from "@shared/types/validation";
import { test } from "@fast-check/vitest";
// Import mocked functions
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import { validateMonitorField as sharedValidateMonitorField } from "@shared/validation/monitorSchemas";
import * as fc from "fast-check";
import { safeCastTo } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    createMonitorObject,
    type MonitorCreationData,
    validateMonitorFieldClientSide,
    validateMonitorFormData,
} from "../../utils/monitorValidation";
import { installElectronApiMock } from "./electronApiMock";

// Mock dependencies
vi.mock("@shared/utils/errorHandling", () => ({
    convertError: vi.fn(),
    ensureError: vi.fn(),
    withErrorHandling: vi.fn(),
    withUtilityErrorHandling: vi.fn(),
}));

vi.mock(
    "@shared/validation/monitorSchemas",
    async (importOriginal): Promise<unknown> => {
        const actual = await importOriginal<Record<string, unknown>>();

        return {
            ...actual,
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
        };
    }
);

let restoreElectronApi: (() => void) | undefined;

describe("monitor Validation Utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        ({ restore: restoreElectronApi } = installElectronApiMock());

        // Setup default mocks with correct signature
        vi.mocked(withUtilityErrorHandling).mockImplementation(
            async (
                operation,
                operationName,
                fallbackValue,
                shouldThrow = false
            ) => {
                try {
                    return await operation();
                } catch (error) {
                    if (shouldThrow) {
                        throw error;
                    }
                    if (fallbackValue === undefined) {
                        throw new Error(
                            `${operationName} failed and no fallback value provided`,
                            { cause: error }
                        );
                    }
                    return fallbackValue;
                }
            }
        );
    });

    afterEach(() => {
        restoreElectronApi?.();
        restoreElectronApi = undefined;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe(createMonitorObject, () => {
        it("should create monitor object with default values for HTTP type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

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

        it("should create monitor object with default values for port type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const result = createMonitorObject("port", {
                host: "localhost",
                port: 3000,
            });

            expect(result).toEqual({
                history: [],
                host: "localhost",
                monitoring: true,
                port: 3000,
                responseTime: -1,
                retryAttempts: 3,
                status: "pending",
                timeout: 10_000,
                type: "port",
            });
        });

        it("should override default values with provided fields", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = createMonitorObject("http", {
                monitoring: false,
                retryAttempts: 5,
                status: "up",
                timeout: 5000,
                url: "https://example.com",
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

        it("should handle empty fields object", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = createMonitorObject("http", {});

            expect(result.type).toBe("http");
            expect(result.history).toEqual([]);
            expect(result.monitoring).toBe(true);
            expect(result.responseTime).toBe(-1);
            expect(result.retryAttempts).toBe(3);
            expect(result.status).toBe("pending");
            expect(result.timeout).toBe(10_000);
        });

        it("should preserve additional custom fields", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = createMonitorObject("http", {
                anotherField: 123,
                customField: "customValue",
                url: "https://example.com",
            } as any);

            expect(result.url).toBe("https://example.com");
            expect(result["customField"]).toBe("customValue");
            expect(result["anotherField"]).toBe(123);
        });

        it("should handle different monitor types", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

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

    describe(validateMonitorFieldClientSide, () => {
        it("should validate field using shared schemas", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const mockResult = {
                errors: [],
                metadata: {}, // Required by ValidationResult type
                success: true,
                warnings: [],
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

        it("should handle field validation errors", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockResult = {
                errors: ["URL is invalid"],
                metadata: {},
                success: false,
                warnings: ["URL format could be improved"],
            };
            vi.mocked(sharedValidateMonitorField).mockReturnValue(mockResult);

            const result = await validateMonitorFieldClientSide(
                "http",
                "url",
                "invalid-url"
            );

            expect(result).toEqual({
                errors: ["URL is invalid"],
                metadata: {},
                success: false,
                warnings: ["URL format could be improved"],
            });
        });

        it("should handle client-side validation errors with fallback", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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
                metadata: {},
                success: false,
                warnings: [],
            });
        });

        it("should handle different field types", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = {
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
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

    describe(validateMonitorFormData, () => {
        beforeEach(() => {
            vi.mocked(sharedValidateMonitorField).mockReturnValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });
        });

        describe("HTTP monitor form validation", () => {
            it("should validate HTTP monitor with valid URL", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

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

            it("should require URL for HTTP monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const result = await validateMonitorFormData("http", {});

                expect(result).toEqual({
                    errors: ["URL is required for HTTP monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate URL type for HTTP monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("http", {
                    url: 123 as any,
                });

                expect(result).toEqual({
                    errors: ["URL is required for HTTP monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should include URL validation errors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                vi.mocked(sharedValidateMonitorField).mockReturnValue({
                    errors: ["URL format is invalid"],
                    metadata: {},
                    success: false,
                    warnings: [],
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

        describe("HTTP keyword monitor form validation", () => {
            it("should validate HTTP keyword monitor with required fields", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("http-keyword", {
                    bodyKeyword: "status: ok",
                    url: "https://example.com",
                });

                expect(result.success).toBe(true);
                expect(result.errors).toEqual([]);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "http-keyword",
                    "url",
                    "https://example.com"
                );
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "http-keyword",
                    "bodyKeyword",
                    "status: ok"
                );
            });

            it("should require keyword for HTTP keyword monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const result = await validateMonitorFormData("http-keyword", {
                    url: "https://example.com",
                });

                expect(result).toEqual({
                    errors: ["Keyword is required for HTTP keyword monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should include keyword validation errors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                vi.mocked(sharedValidateMonitorField).mockReturnValueOnce({
                    errors: ["URL format is invalid"],
                    metadata: {},
                    success: false,
                    warnings: [],
                });

                const result = await validateMonitorFormData("http-keyword", {
                    bodyKeyword: "",
                    url: "invalid",
                });

                expect(result).toEqual({
                    errors: [
                        "URL format is invalid",
                        "Keyword is required for HTTP keyword monitors",
                    ],
                    success: false,
                    warnings: [],
                });
            });
        });

        describe("HTTP status monitor form validation", () => {
            it("should validate HTTP status monitor with required fields", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("http-status", {
                    expectedStatusCode: 204,
                    url: "https://example.com/status",
                });

                expect(result.success).toBe(true);
                expect(result.errors).toEqual([]);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "http-status",
                    "url",
                    "https://example.com/status"
                );
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "http-status",
                    "expectedStatusCode",
                    204
                );
            });

            it("should require expected status code for HTTP status monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const result = await validateMonitorFormData("http-status", {
                    url: "https://example.com/status",
                });

                expect(result).toEqual({
                    errors: [
                        "Expected status code is required for HTTP status monitors",
                    ],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate status code types", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("http-status", {
                    expectedStatusCode: "not-a-code" as unknown as number,
                    url: "https://example.com/status",
                });

                expect(result).toEqual({
                    errors: [
                        "Expected status code is required for HTTP status monitors",
                    ],
                    success: false,
                    warnings: [],
                });
            });
        });

        describe("port monitor form validation", () => {
            it("should validate port monitor with valid host and port", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

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

            it("should require host for port monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const result = await validateMonitorFormData("port", {
                    port: 3000,
                });

                expect(result).toEqual({
                    errors: ["Host is required for port monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate host type for port monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

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

            it("should require port for port monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const result = await validateMonitorFormData("port", {
                    host: "localhost",
                });

                expect(result).toEqual({
                    errors: ["Port is required for port monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate port type for port monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

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

            it("should include host and port validation errors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                vi.mocked(sharedValidateMonitorField)
                    .mockReturnValueOnce({
                        errors: ["Host is invalid"],
                        metadata: {},
                        success: false,
                        warnings: [],
                    })
                    .mockReturnValueOnce({
                        errors: ["Port out of range"],
                        metadata: {},
                        success: false,
                        warnings: [],
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

            it("should handle mixed validation results", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                vi.mocked(sharedValidateMonitorField)
                    .mockReturnValueOnce({
                        errors: [],
                        metadata: {},
                        success: true,
                        warnings: [],
                    })
                    .mockReturnValueOnce({
                        errors: ["Port out of range"],
                        metadata: {},
                        success: false,
                        warnings: [],
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

        describe("ping monitor form validation", () => {
            it("should validate ping monitor with valid host", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

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

            it("should require host for ping monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const result = await validateMonitorFormData("ping", {});

                expect(result).toEqual({
                    errors: ["Host is required for ping monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should validate host type for ping monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("ping", {
                    host: 123 as any,
                });

                expect(result).toEqual({
                    errors: ["Host is required for ping monitors"],
                    success: false,
                    warnings: [],
                });
            });

            it("should include host validation errors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                vi.mocked(sharedValidateMonitorField).mockReturnValue({
                    errors: [
                        "Host must be a valid hostname, IP address, or localhost",
                    ],
                    metadata: {},
                    success: false,
                    warnings: [],
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

            it("should validate different host formats", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

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

        it("should handle form validation errors with fallback", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle unknown monitor types", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await validateMonitorFormData(
                "unknown" as MonitorType,
                { someField: "value" } as any
            );

            expect(result.success).toBe(false);
            expect(result.errors).toContain(
                "Unsupported monitor type: unknown"
            );
        });

        it("should handle empty form data", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

    describe("type Safety", () => {
        it("should ensure MonitorCreationData has required fields", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should ensure ValidationResult has correct structure", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const result: ValidationResult = {
                errors: ["Error message"],
                success: false,
                warnings: ["Warning message"],
            };

            expect(result).toBeDefined();
            expect(Array.isArray(result.errors)).toBe(true);
            expect(result.success).toBeTypeOf("boolean");
            expect(Array.isArray(result.warnings)).toBe(true);
        });
    });

    describe("edge Cases", () => {
        it("should handle null and undefined values in createMonitorObject", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const result = createMonitorObject("http", {
                anotherField: undefined,
                customField: null,
                url: "https://example.com",
            } as any);

            expect(result["customField"]).toBeNull();
            expect(result["anotherField"]).toBeUndefined();
        });
    });

    // Property-based Tests
    describe("property-based Tests", () => {
        describe("createMonitorObject property tests", () => {
            test.prop([
                fc.constantFrom("http", "port", "dns", "ping"),
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 5000 }),
                    monitoring: fc.boolean(),
                    retryAttempts: fc.integer({ max: 10, min: 1 }),
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                }),
            ])(
                "should create monitor objects with valid base properties",
                (monitorType, baseData) => {
                    const result = createMonitorObject(
                        safeCastTo<MonitorType>(monitorType),
                        baseData as any
                    );

                    expect(result.type).toBe(monitorType);
                    expect(result.monitoring).toBe(baseData.monitoring);
                    expect(result.checkInterval).toBe(baseData.checkInterval);
                    expect(result.timeout).toBe(baseData.timeout);
                    expect(result.retryAttempts).toBe(baseData.retryAttempts);
                    expect(result.responseTime).toBe(-1); // Default value
                    expect(result.status).toBe("pending"); // Default value
                    expect(result.history).toEqual([]); // Default value
                }
            );

            test.prop([
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 5000 }),
                    monitoring: fc.boolean(),
                    retryAttempts: fc.integer({ max: 10, min: 1 }),
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                    url: fc.webUrl(),
                }),
            ])("should create HTTP monitor objects with URL", (httpData) => {
                const result = createMonitorObject("http", httpData as any);

                expect(result.type).toBe("http");
                expect(result.url).toBe(httpData.url);
            });

            test.prop([
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 5000 }),
                    host: fc.domain(),
                    monitoring: fc.boolean(),
                    port: fc.integer({ max: 65_535, min: 1 }),
                    retryAttempts: fc.integer({ max: 10, min: 1 }),
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                }),
            ])(
                "should create port monitor objects with host and port",
                (portData) => {
                    const result = createMonitorObject("port", portData as any);

                    expect(result.type).toBe("port");
                    expect(result.host).toBe(portData.host);
                    expect(result.port).toBe(portData.port);
                }
            );

            test.prop([
                fc.constantFrom("http", "port", "dns", "ping"),
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 5000 }),
                    monitoring: fc.boolean(),
                }),
            ])(
                "should preserve monitor type regardless of input data",
                (monitorType, inputData) => {
                    // Add a different type in the input to test type preservation
                    const dataWithWrongType = {
                        ...inputData,
                        type: "wrong-type",
                    } as any;

                    const result = createMonitorObject(
                        safeCastTo<MonitorType>(monitorType),
                        dataWithWrongType
                    );

                    // Should preserve the passed type parameter, not the type in data
                    expect(result.type).toBe(monitorType);
                }
            );
        });

        describe("validateMonitorFormData property tests", () => {
            test.prop([
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 5000 }),
                    monitoring: fc.boolean(),
                    url: fc.webUrl(),
                }),
            ])("should handle HTTP form data validation", async (formData) => {
                // Setup mock to return successful validation
                vi.mocked(withUtilityErrorHandling).mockImplementation(
                    async (fn) => await fn()
                );

                // Mock sharedValidateMonitorField to return proper validation result
                vi.mocked(sharedValidateMonitorField).mockReturnValue({
                    errors: [],
                    metadata: { fieldName: "url", monitorType: "http" },
                    success: true,
                    warnings: [],
                });

                const result = await validateMonitorFormData(
                    "http",
                    formData as any
                );

                // Should return a validation result structure
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(Array.isArray(result.errors)).toBe(true);
            });

            test.prop([
                fc.record({
                    host: fc.domain(),
                    monitoring: fc.boolean(),
                    port: fc.integer({ max: 65_535, min: 1 }),
                }),
            ])("should handle port form data validation", async (formData) => {
                // Setup mock to return successful validation
                vi.mocked(withUtilityErrorHandling).mockImplementation(
                    async (fn) => await fn()
                );

                // Mock sharedValidateMonitorField to return proper validation results for host and port
                vi.mocked(sharedValidateMonitorField).mockReturnValue({
                    errors: [],
                    metadata: { fieldName: "host", monitorType: "port" },
                    success: true,
                    warnings: [],
                });

                const result = await validateMonitorFormData(
                    "port",
                    formData as any
                );

                // Should return a validation result structure
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(Array.isArray(result.errors)).toBe(true);
            });
        });
    });

    // New monitor types tests
    describe("new monitor types validation", () => {
        describe("replication monitor validation", () => {
            it("should validate replication monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                vi.mocked(sharedValidateMonitorField).mockClear();

                const result = await validateMonitorFormData("replication", {
                    maxReplicationLagSeconds: 15,
                    primaryStatusUrl: "https://primary/status",
                    replicaStatusUrl: "https://replica/status",
                    replicationTimestampField: "lastAppliedTimestamp",
                });

                expect(result.success).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "replication",
                    "primaryStatusUrl",
                    "https://primary/status"
                );
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "replication",
                    "replicationTimestampField",
                    "lastAppliedTimestamp"
                );
            });

            it("should require replication monitor fields", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("replication", {});

                expect(result.success).toBe(false);
                expect(result.errors).toEqual(
                    expect.arrayContaining([
                        "Primary status URL is required for replication monitors",
                        "Replica status URL is required for replication monitors",
                        "Replication timestamp field is required for replication monitors",
                        "Maximum replication lag is required for replication monitors",
                    ])
                );
            });
        });

        describe("server heartbeat monitor validation", () => {
            it("should validate server heartbeat monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                vi.mocked(sharedValidateMonitorField).mockClear();

                const result = await validateMonitorFormData(
                    "server-heartbeat",
                    {
                        heartbeatExpectedStatus: "ok",
                        heartbeatMaxDriftSeconds: 45,
                        heartbeatStatusField: "status",
                        heartbeatTimestampField: "timestamp",
                        url: "https://status.example.com/heartbeat",
                    }
                );

                expect(result.success).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "server-heartbeat",
                    "heartbeatStatusField",
                    "status"
                );
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "server-heartbeat",
                    "url",
                    "https://status.example.com/heartbeat"
                );
            });

            it("should require server heartbeat fields", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData(
                    "server-heartbeat",
                    {}
                );

                expect(result.success).toBe(false);
                expect(result.errors).toEqual(
                    expect.arrayContaining([
                        "Heartbeat URL is required for server heartbeat monitors",
                        "Heartbeat status field is required for server heartbeat monitors",
                        "Heartbeat timestamp field is required for server heartbeat monitors",
                        "Expected heartbeat status is required for server heartbeat monitors",
                        "Heartbeat drift tolerance is required for server heartbeat monitors",
                    ])
                );
            });
        });

        describe("WebSocket keepalive monitor validation", () => {
            it("should validate WebSocket keepalive monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                vi.mocked(sharedValidateMonitorField).mockClear();

                const result = await validateMonitorFormData(
                    "websocket-keepalive",
                    {
                        maxPongDelayMs: 1200,
                        url: "wss://example.com/socket",
                    }
                );

                expect(result.success).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "websocket-keepalive",
                    "maxPongDelayMs",
                    1200
                );
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "websocket-keepalive",
                    "url",
                    "wss://example.com/socket"
                );
            });

            it("should require WebSocket keepalive fields", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData(
                    "websocket-keepalive",
                    {}
                );

                expect(result.success).toBe(false);
                expect(result.errors).toEqual(
                    expect.arrayContaining([
                        "WebSocket URL is required for keepalive monitors",
                        "Maximum pong delay is required for WebSocket keepalive monitors",
                    ])
                );
            });
        });
    });
});
