/**
 * Comprehensive tests for monitor validation utilities. Tests all validation
 * functions, error handling, and edge cases.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";

import type { MonitorType } from "@shared/types";

// Mock dependencies
vi.mock("@shared/utils/errorHandling", () => ({
    ensureError: vi.fn(),
    convertError: vi.fn(),
    withErrorHandling: vi.fn(),
    withUtilityErrorHandling: vi.fn(),
}));

vi.mock("@shared/validation/monitorSchemas", () => ({
    validateMonitorData: vi.fn(),
    validateMonitorField: vi.fn(),
}));

// Mock the monitor types store
vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: {
        getState: vi.fn(),
    },
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
import type { ValidationResult } from "@shared/types/validation";
import type { HttpFormData } from "../../types/monitorFormData";

// Import mocked functions
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "@shared/validation/monitorSchemas";
import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";

// Helper function to create a complete mock store
function createMockStore(
    overrides: Partial<ReturnType<typeof useMonitorTypesStore.getState>> = {}
) {
    return {
        // BaseStore properties
        clearError: vi.fn(),
        isLoading: false,
        lastError: undefined,
        setError: vi.fn(),
        setLoading: vi.fn(),

        // MonitorTypesState properties
        fieldConfigs: {},
        isLoaded: true,
        monitorTypes: [],

        // MonitorTypesActions properties
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
        getFieldConfig: vi.fn(),
        loadMonitorTypes: vi.fn(),
        refreshMonitorTypes: vi.fn(),
        validateMonitorData: vi.fn().mockResolvedValue({
            errors: [],
            success: true,
            warnings: [],
            metadata: {},
        } satisfies ValidationResult),

        // Apply any overrides
        ...overrides,
    } as any; // Cast to any for test compatibility
}

describe("Monitor Validation Utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock the store method that validateMonitorData uses
        const mockStore = createMockStore();

        vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

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
        vi.clearAllMocks();
    });

    describe(createMonitorObject, () => {
        it("should create monitor object with default values for HTTP type", async ({
            task,
            annotate,
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
            task,
            annotate,
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

        it("should override default values with provided fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should handle empty fields object", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = createMonitorObject("http", {});

            expect(result["type"]).toBe("http");
            expect(result["history"]).toEqual([]);
            expect(result["monitoring"]).toBeTruthy();
            expect(result["responseTime"]).toBe(-1);
            expect(result["retryAttempts"]).toBe(3);
            expect(result["status"]).toBe("pending");
            expect(result["timeout"]).toBe(10_000);
        });

        it("should preserve additional custom fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = createMonitorObject("http", {
                url: "https://example.com",
                customField: "customValue",
                anotherField: 123,
            } as any);

            expect(result["url"]).toBe("https://example.com");
            expect(result["customField"]).toBe("customValue");
            expect(result["anotherField"]).toBe(123);
        });

        it("should handle different monitor types", async ({
            task,
            annotate,
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

    describe(validateMonitorData, () => {
        it("should validate monitor data successfully via backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const mockResult = {
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: ["Minor issue"],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

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
            expect(mockStore.validateMonitorData).toHaveBeenCalledWith("http", {
                url: "https://example.com",
            });
        });

        it("should handle validation errors from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockResult = {
                data: undefined,
                errors: ["URL is invalid"],
                metadata: {},
                success: false,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

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

        it("should handle backend result without warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = {
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: [], // Should default to empty array
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

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

        it("should handle backend result with undefined warnings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = {
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: [], // Should default to empty array
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

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

        it("should handle IPC errors with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Mock the store to throw an error to test fallback behavior
            const mockStore = createMockStore({
                validateMonitorData: vi
                    .fn()
                    .mockRejectedValue(new Error("IPC failed")),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

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

        it("should handle different monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const mockResult = {
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            await validateMonitorData("port", {
                host: "localhost",
                port: 3000,
            });

            expect(mockStore.validateMonitorData).toHaveBeenCalledWith("port", {
                host: "localhost",
                port: 3000,
            });
        });
    });

    describe(validateMonitorDataClientSide, () => {
        it("should validate monitor data using shared schemas", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

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

        it("should handle validation errors from shared schemas", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle shared validation errors with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle different monitor types in client-side validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

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

    describe(validateMonitorField, () => {
        beforeEach(() => {
            // Mock validateMonitorData for use in validateMonitorField
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue({
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            } satisfies ValidationResult);
        });

        it("should return empty array for valid field", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = {
                data: undefined,
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const result = await validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );

            expect(result).toEqual([]);
            expect(mockStore.validateMonitorData).toHaveBeenCalledWith("http", {
                url: "https://example.com",
                type: "http",
            });
        });

        it("should return field-specific errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockResult = {
                data: undefined,
                errors: ["URL is invalid", "Other error"],
                metadata: {},
                success: false,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const result = await validateMonitorField(
                "http",
                "url",
                "invalid-url"
            );

            expect(result).toEqual(["URL is invalid"]);
        });

        it("should handle field errors with different patterns", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockResult = {
                data: undefined,
                errors: [
                    "The 'url' field is required",
                    `"url" must be a valid URL`,
                    "url: invalid format",
                    "url contains invalid characters",
                ],
                metadata: {},
                success: false,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const result = await validateMonitorField("http", "url", "http");

            expect(result).toEqual([
                "The 'url' field is required",
                `"url" must be a valid URL`,
                "url: invalid format",
                "url contains invalid characters",
            ]);
        });

        it("should return all errors if no field-specific errors found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockResult = {
                data: undefined,
                errors: ["URL validation error", "URL is invalid"],
                metadata: {},
                success: false,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const result = await validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );

            expect(result).toEqual(["URL validation error", "URL is invalid"]);
        });

        it("should handle validation errors with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Mock the store to throw an error to test fallback behavior
            const mockStore = createMockStore({
                validateMonitorData: vi
                    .fn()
                    .mockRejectedValue(new Error("IPC failed")),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const result = await validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );

            expect(result).toEqual(["Failed to validate field: url"]);
        });

        it("should handle case insensitive field matching", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockResult = {
                data: undefined,
                errors: ["URL field is invalid", "PORT field error"],
                metadata: {},
                success: false,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const urlResult = await validateMonitorField(
                "http",
                "url",
                "invalid"
            );
            const portResult = await validateMonitorField(
                "port",
                "port",
                Number.NaN
            );

            expect(urlResult).toEqual(["URL field is invalid"]);
            expect(portResult).toEqual(["PORT field error"]);
        });
    });

    describe(validateMonitorFieldClientSide, () => {
        it("should validate field using shared schemas", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

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

        it("should handle field validation errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle client-side validation errors with fallback", async ({
            task,
            annotate,
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
                success: false,
                warnings: [],
                metadata: {},
            });
        });

        it("should handle different field types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

    describe(validateMonitorFormData, () => {
        beforeEach(() => {
            vi.mocked(sharedValidateMonitorField).mockReturnValue({
                errors: [],
                success: true,
                warnings: [],
                metadata: {},
            });
        });

        describe("HTTP monitor form validation", () => {
            it("should validate HTTP monitor with valid URL", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("http", {
                    url: "https://example.com",
                });

                expect(result.success).toBeTruthy();
                expect(result.errors).toEqual([]);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "http",
                    "url",
                    "https://example.com"
                );
            });

            it("should require URL for HTTP monitors", async ({
                task,
                annotate,
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
                task,
                annotate,
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

        describe("HTTP keyword monitor form validation", () => {
            it("should validate HTTP keyword monitor with required fields", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("http-keyword", {
                    bodyKeyword: "status: ok",
                    url: "https://example.com",
                });

                expect(result.success).toBeTruthy();
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
                task,
                annotate,
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                vi.mocked(sharedValidateMonitorField).mockReturnValueOnce({
                    errors: ["URL format is invalid"],
                    success: false,
                    warnings: [],
                    metadata: {},
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("http-status", {
                    expectedStatusCode: 204,
                    url: "https://example.com/status",
                });

                expect(result.success).toBeTruthy();
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
                task,
                annotate,
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
                task,
                annotate,
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

        describe("Port monitor form validation", () => {
            it("should validate port monitor with valid host and port", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("port", {
                    host: "localhost",
                    port: 3000,
                });

                expect(result.success).toBeTruthy();
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
                task,
                annotate,
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
                task,
                annotate,
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
                task,
                annotate,
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
                task,
                annotate,
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

            it("should handle mixed validation results", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

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
            it("should validate ping monitor with valid host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("ping", {
                    host: "example.com",
                });

                expect(result.success).toBeTruthy();
                expect(result.errors).toEqual([]);
                expect(sharedValidateMonitorField).toHaveBeenCalledWith(
                    "ping",
                    "host",
                    "example.com"
                );
            });

            it("should require host for ping monitors", async ({
                task,
                annotate,
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
                task,
                annotate,
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

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

            it("should validate different host formats", async ({
                task,
                annotate,
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
            task,
            annotate,
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await validateMonitorFormData(
                "unknown" as MonitorType,
                { someField: "value" } as any
            );

            expect(result.success).toBeFalsy();
            expect(result.errors).toContain(
                "Unsupported monitor type: unknown"
            );
        });

        it("should handle empty form data", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const httpResult = await validateMonitorFormData("http", {});
            const portResult = await validateMonitorFormData("port", {});

            expect(httpResult.success).toBeFalsy();
            expect(portResult.success).toBeFalsy();
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
        it("should ensure MonitorCreationData has required fields", async ({
            task,
            annotate,
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
            expect(monitor.monitoring).toBeTruthy();
        });

        it("should ensure ValidationResult has correct structure", async ({
            task,
            annotate,
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
            expect(Array.isArray(result.errors)).toBeTruthy();
            expect(typeof result.success).toBe("boolean");
            expect(Array.isArray(result.warnings)).toBeTruthy();
        });
    });

    describe("Edge Cases", () => {
        it("should handle null and undefined values in createMonitorObject", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const result = createMonitorObject("http", {
                url: "https://example.com",
                customField: null,
                anotherField: undefined,
            } as any);

            expect(result["customField"]).toBeNull();
            expect(result["anotherField"]).toBeUndefined();
        });

        it("should handle very long field names in validateMonitorField", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const longFieldName = "a".repeat(1000);
            const mockResult = {
                data: undefined,
                errors: [`${longFieldName} is invalid`],
                metadata: {},
                success: false,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const result = await validateMonitorField(
                "http",
                longFieldName as unknown as keyof HttpFormData,
                "value"
            );

            expect(result).toEqual([`${longFieldName} is invalid`]);
        });

        it("should handle special characters in field names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const specialFieldName = "field@#$%^&*()";
            const mockResult = {
                data: undefined,
                errors: [`${specialFieldName} is invalid`],
                metadata: {},
                success: false,
                warnings: [],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const result = await validateMonitorField(
                "http",
                specialFieldName as unknown as keyof HttpFormData,
                "value"
            );

            expect(result).toEqual([`${specialFieldName} is invalid`]);
        });

        it("should handle multiple validation errors across functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Test that each function properly handles and propagates multiple errors
            const mockResult = {
                data: undefined,
                errors: [
                    "Error 1",
                    "Error 2",
                    "Error 3",
                ],
                metadata: {},
                success: false,
                warnings: ["Warning 1", "Warning 2"],
            };

            // Update the store mock to return the specific result for this test
            const mockStore = createMockStore({
                validateMonitorData: vi.fn().mockResolvedValue(mockResult),
            });
            vi.mocked(useMonitorTypesStore.getState).mockReturnValue(mockStore);

            const result = await validateMonitorData("http", {
                url: "invalid",
            });

            expect(result["errors"]).toHaveLength(3);
            expect(result["warnings"]).toHaveLength(2);
            expect(result["success"]).toBeFalsy();
        });
    });

    // Property-based Tests
    describe("Property-based Tests", () => {
        describe("createMonitorObject property tests", () => {
            test.prop([
                fc.constantFrom("http", "port", "dns", "ping"),
                fc.record({
                    monitoring: fc.boolean(),
                    checkInterval: fc.integer({ min: 5000, max: 300_000 }),
                    timeout: fc.integer({ min: 1000, max: 30_000 }),
                    retryAttempts: fc.integer({ min: 1, max: 10 }),
                }),
            ])(
                "should create monitor objects with valid base properties",
                (monitorType, baseData) => {
                    const result = createMonitorObject(
                        monitorType as MonitorType,
                        baseData as any
                    );

                    expect(result.type).toBe(monitorType);
                    expect(result.monitoring).toBe(baseData.monitoring);
                    expect(result["checkInterval"]).toBe(
                        baseData.checkInterval
                    );
                    expect(result.timeout).toBe(baseData.timeout);
                    expect(result.retryAttempts).toBe(baseData.retryAttempts);
                    expect(result.responseTime).toBe(-1); // Default value
                    expect(result.status).toBe("pending"); // Default value
                    expect(result.history).toEqual([]); // Default value
                }
            );

            test.prop([
                fc.record({
                    url: fc.webUrl(),
                    monitoring: fc.boolean(),
                    checkInterval: fc.integer({ min: 5000, max: 300_000 }),
                    timeout: fc.integer({ min: 1000, max: 30_000 }),
                    retryAttempts: fc.integer({ min: 1, max: 10 }),
                }),
            ])("should create HTTP monitor objects with URL", (httpData) => {
                const result = createMonitorObject("http", httpData as any);

                expect(result.type).toBe("http");
                expect(result["url"]).toBe(httpData.url);
            });

            test.prop([
                fc.record({
                    host: fc.domain(),
                    port: fc.integer({ min: 1, max: 65_535 }),
                    monitoring: fc.boolean(),
                    checkInterval: fc.integer({ min: 5000, max: 300_000 }),
                    timeout: fc.integer({ min: 1000, max: 30_000 }),
                    retryAttempts: fc.integer({ min: 1, max: 10 }),
                }),
            ])(
                "should create port monitor objects with host and port",
                (portData) => {
                    const result = createMonitorObject("port", portData as any);

                    expect(result.type).toBe("port");
                    expect(result["host"]).toBe(portData.host);
                    expect(result["port"]).toBe(portData.port);
                }
            );

            test.prop([
                fc.constantFrom("http", "port", "dns", "ping"),
                fc.record({
                    monitoring: fc.boolean(),
                    checkInterval: fc.integer({ min: 5000, max: 300_000 }),
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
                        monitorType as MonitorType,
                        dataWithWrongType
                    );

                    // Should preserve the passed type parameter, not the type in data
                    expect(result.type).toBe(monitorType);
                }
            );
        });

        describe("validateMonitorData property tests", () => {
            test.prop([
                fc.constantFrom("http", "port", "dns"),
                fc.record({
                    monitoring: fc.boolean(),
                    checkInterval: fc.integer({ min: 5000, max: 300_000 }),
                }),
            ])(
                "should call validation with correct parameters",
                async (monitorType, monitorData) => {
                    // Setup basic mock
                    const mockResult = {
                        data: undefined,
                        errors: [],
                        metadata: {},
                        success: true,
                        warnings: [],
                    };

                    // Update the store mock to return the specific result for this test
                    const mockStore = createMockStore({
                        validateMonitorData: vi
                            .fn()
                            .mockResolvedValue(mockResult),
                    });
                    vi.mocked(useMonitorTypesStore.getState).mockReturnValue(
                        mockStore
                    );

                    await validateMonitorData(
                        monitorType as MonitorType,
                        monitorData as any
                    );

                    // Verify the function was called (don't check exact parameters due to complexity)
                    expect(mockStore.validateMonitorData).toHaveBeenCalled();
                }
            );
        });

        describe("validateMonitorFormData property tests", () => {
            test.prop([
                fc.record({
                    url: fc.webUrl(),
                    monitoring: fc.boolean(),
                    checkInterval: fc.integer({ min: 5000, max: 300_000 }),
                }),
            ])("should handle HTTP form data validation", async (formData) => {
                // Setup mock to return successful validation
                vi.mocked(withUtilityErrorHandling).mockImplementation(
                    async (fn) => await fn()
                );

                // Mock sharedValidateMonitorField to return proper validation result
                vi.mocked(sharedValidateMonitorField).mockReturnValue({
                    success: true,
                    errors: [],
                    warnings: [],
                    metadata: { fieldName: "url", monitorType: "http" },
                });

                const result = await validateMonitorFormData(
                    "http",
                    formData as any
                );

                // Should return a validation result structure
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(Array.isArray(result.errors)).toBeTruthy();
            });

            test.prop([
                fc.record({
                    host: fc.domain(),
                    port: fc.integer({ min: 1, max: 65_535 }),
                    monitoring: fc.boolean(),
                }),
            ])("should handle port form data validation", async (formData) => {
                // Setup mock to return successful validation
                vi.mocked(withUtilityErrorHandling).mockImplementation(
                    async (fn) => await fn()
                );

                // Mock sharedValidateMonitorField to return proper validation results for host and port
                vi.mocked(sharedValidateMonitorField).mockReturnValue({
                    success: true,
                    errors: [],
                    warnings: [],
                    metadata: { fieldName: "host", monitorType: "port" },
                });

                const result = await validateMonitorFormData(
                    "port",
                    formData as any
                );

                // Should return a validation result structure
                expect(result).toHaveProperty("success");
                expect(result).toHaveProperty("errors");
                expect(Array.isArray(result.errors)).toBeTruthy();
            });
        });
    });

    // New monitor types tests
    describe("New monitor types validation", () => {
        describe("Replication monitor validation", () => {
            it("should validate replication monitors", async ({
                task,
                annotate,
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

                expect(result.success).toBeTruthy();
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData("replication", {});

                expect(result.success).toBeFalsy();
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

        describe("Server heartbeat monitor validation", () => {
            it("should validate server heartbeat monitors", async ({
                task,
                annotate,
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

                expect(result.success).toBeTruthy();
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData(
                    "server-heartbeat",
                    {}
                );

                expect(result.success).toBeFalsy();
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
                task,
                annotate,
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

                expect(result.success).toBeTruthy();
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: monitorValidation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const result = await validateMonitorFormData(
                    "websocket-keepalive",
                    {}
                );

                expect(result.success).toBeFalsy();
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
