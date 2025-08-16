/**
 * Comprehensive tests for useMonitorTypesStore
 *
 * This test suite provides complete coverage for the MonitorTypesStore, testing
 * all state management, actions, error handling, and IPC interactions.
 */

import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
    type MockedFunction,
} from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { Monitor, MonitorType } from "../../../../shared/types";
import type { MonitorTypeConfig } from "../../../../shared/types/monitorTypes";
import type { ValidationResult } from "../../../../shared/types/validation";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";

// Mock dependencies
vi.mock("@shared/utils/errorHandling", () => ({
    withErrorHandling: vi.fn(async (fn, state) => {
        try {
            state.setLoading(true);
            state.clearError();
            const result = await fn();
            state.setLoading(false);
            return result;
        } catch (error) {
            state.setError(
                error instanceof Error ? error.message : String(error)
            );
            state.setLoading(false);
            throw error;
        }
    }),
}));

vi.mock("../../utils", () => ({
    logStoreAction: vi.fn(),
}));

vi.mock("../../types/ipc", () => ({
    safeExtractIpcData: vi.fn((response, fallback) => response || fallback),
}));

// Mock ElectronAPI
const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn(),
        validateMonitorData: vi.fn(),
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
    },
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("useMonitorTypesStore", () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Reset store state
        const { result } = renderHook(() => useMonitorTypesStore());
        act(() => {
            result.current.fieldConfigs = {};
            result.current.isLoaded = false;
            result.current.isLoading = false;
            result.current.lastError = undefined;
            result.current.monitorTypes = [];
        });
    });

    describe("Initial State", () => {
        it("should initialize with default state", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            expect(result.current.fieldConfigs).toEqual({});
            expect(result.current.isLoaded).toBe(false);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.lastError).toBeUndefined();
            expect(result.current.monitorTypes).toEqual([]);
        });
    });

    describe("loadMonitorTypes", () => {
        const mockMonitorTypes: MonitorTypeConfig[] = [
            {
                type: "http",
                displayName: "HTTP",
                description: "HTTP monitoring",
                version: "1.0.0",
                fields: [
                    {
                        name: "url",
                        type: "string",
                        required: true,
                        label: "URL",
                    },
                ],
            },
            {
                type: "ping",
                displayName: "Ping",
                description: "Ping monitoring",
                version: "1.0.0",
                fields: [
                    {
                        name: "host",
                        type: "string",
                        required: true,
                        label: "Host",
                    },
                ],
            },
        ];

        it("should load monitor types successfully", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toEqual(mockMonitorTypes);
            expect(result.current.isLoaded).toBe(true);
            expect(result.current.fieldConfigs).toEqual({
                http: mockMonitorTypes[0].fields,
                ping: mockMonitorTypes[1].fields,
            });
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
        });

        it("should skip loading if already loaded and no error", async () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            // Set as already loaded
            act(() => {
                result.current.isLoaded = true;
                result.current.lastError = undefined;
            });

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).not.toHaveBeenCalled();
        });

        it("should reload if not loaded", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Set as not loaded
            act(() => {
                result.current.isLoaded = false;
            });

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
            expect(result.current.isLoaded).toBe(true);
        });

        it("should reload if error exists", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Set as loaded but with error
            act(() => {
                result.current.isLoaded = true;
                result.current.lastError = "Previous error";
            });

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle loading errors", async () => {
            const errorMessage = "Failed to load monitor types";
            mockElectronAPI.monitorTypes.getMonitorTypes.mockRejectedValue(
                new Error(errorMessage)
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                try {
                    await result.current.loadMonitorTypes();
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.lastError).toBe(errorMessage);
            expect(result.current.isLoading).toBe(false);
        });

        it("should handle empty response with fallback", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                null
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toEqual([]);
            expect(result.current.fieldConfigs).toEqual({});
            expect(result.current.isLoaded).toBe(true);
        });
    });

    describe("refreshMonitorTypes", () => {
        it("should clear state and reload monitor types", async () => {
            const mockMonitorTypes: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "HTTP",
                    description: "HTTP monitoring",
                    version: "1.0.0",
                    fields: [],
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Set some initial state
            act(() => {
                result.current.isLoaded = true;
                result.current.fieldConfigs = { test: [] };
                result.current.monitorTypes = [];
            });

            await act(async () => {
                await result.current.refreshMonitorTypes();
            });

            expect(result.current.monitorTypes).toEqual(mockMonitorTypes);
            expect(result.current.isLoaded).toBe(true);
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe("validateMonitorData", () => {
        const mockValidationResult: ValidationResult = {
            success: true,
            data: { url: "https://example.com" },
            errors: [],
            warnings: [],
            metadata: { validatedAt: Date.now() },
        };

        it("should validate monitor data successfully", async () => {
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockValidationResult
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    { url: "https://example.com" }
                );
            });

            expect(validationResult!).toEqual(mockValidationResult);
            expect(
                mockElectronAPI.monitorTypes.validateMonitorData
            ).toHaveBeenCalledWith("http", { url: "https://example.com" });
        });

        it("should handle validation with errors", async () => {
            const errorResult: ValidationResult = {
                success: false,
                data: null,
                errors: ["URL is required"],
                warnings: [],
                metadata: {},
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                errorResult
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    {}
                );
            });

            expect(validationResult!.success).toBe(false);
            expect(validationResult!.errors).toEqual(["URL is required"]);
        });

        it("should handle partial validation result with missing properties", async () => {
            const partialResult = {
                success: true,
                data: { url: "https://example.com" },
                errors: [],
                // Missing warnings and metadata
            };

            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                partialResult
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    { url: "https://example.com" }
                );
            });

            expect(validationResult!.warnings).toEqual([]);
            expect(validationResult!.metadata).toEqual({});
        });

        it("should handle validation errors", async () => {
            const errorMessage = "Validation service unavailable";
            mockElectronAPI.monitorTypes.validateMonitorData.mockRejectedValue(
                new Error(errorMessage)
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                try {
                    await result.current.validateMonitorData("http", {});
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                }
            });

            expect(result.current.lastError).toBe(errorMessage);
        });
    });

    describe("formatMonitorDetail", () => {
        it("should format monitor detail successfully", async () => {
            const formattedDetail = "Response time: 150ms (Excellent)";
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
                formattedDetail
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let formatted: string;
            await act(async () => {
                formatted = await result.current.formatMonitorDetail(
                    "http",
                    "Response time: 150ms"
                );
            });

            expect(formatted!).toBe(formattedDetail);
            expect(
                mockElectronAPI.monitorTypes.formatMonitorDetail
            ).toHaveBeenCalledWith("http", "Response time: 150ms");
        });

        it("should handle formatting errors with fallback", async () => {
            const originalDetails = "Response time: 150ms";
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockRejectedValue(
                new Error("Formatting failed")
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                try {
                    await result.current.formatMonitorDetail(
                        "http",
                        originalDetails
                    );
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.lastError).toBe("Formatting failed");
        });

        it("should handle null response with fallback", async () => {
            const originalDetails = "Response time: 150ms";
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
                null
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let formatted: string;
            await act(async () => {
                formatted = await result.current.formatMonitorDetail(
                    "http",
                    originalDetails
                );
            });

            expect(formatted!).toBe(originalDetails); // Should fallback to original
        });
    });

    describe("formatMonitorTitleSuffix", () => {
        const mockMonitor: Monitor = {
            id: "test-monitor",
            type: "http",
            checkInterval: 300,
            timeout: 30,
            retryAttempts: 3,
            monitoring: true,
            status: "up",
            responseTime: 150,
            history: [],
            url: "https://example.com",
        };

        it("should format monitor title suffix successfully", async () => {
            const titleSuffix = "(https://example.com)";
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockResolvedValue(
                titleSuffix
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let formatted: string;
            await act(async () => {
                formatted = await result.current.formatMonitorTitleSuffix(
                    "http",
                    mockMonitor
                );
            });

            expect(formatted!).toBe(titleSuffix);
            expect(
                mockElectronAPI.monitorTypes.formatMonitorTitleSuffix
            ).toHaveBeenCalledWith("http", mockMonitor);
        });

        it("should handle title suffix formatting errors", async () => {
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockRejectedValue(
                new Error("Title formatting failed")
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                try {
                    await result.current.formatMonitorTitleSuffix(
                        "http",
                        mockMonitor
                    );
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.lastError).toBe("Title formatting failed");
        });

        it("should handle null response with empty string fallback", async () => {
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockResolvedValue(
                null
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            let formatted: string;
            await act(async () => {
                formatted = await result.current.formatMonitorTitleSuffix(
                    "http",
                    mockMonitor
                );
            });

            expect(formatted!).toBe(""); // Should fallback to empty string
        });
    });

    describe("getFieldConfig", () => {
        it("should return field config for existing type", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            const httpFields = [
                { name: "url", type: "string", required: true, label: "URL" },
            ];

            act(() => {
                result.current.fieldConfigs = {
                    http: httpFields,
                };
            });

            const config = result.current.getFieldConfig("http" as MonitorType);
            expect(config).toEqual(httpFields);
        });

        it("should return undefined for non-existing type", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            const config = result.current.getFieldConfig(
                "unknown" as MonitorType
            );
            expect(config).toBeUndefined();
        });

        it("should return undefined when fieldConfigs is empty", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            const config = result.current.getFieldConfig("http" as MonitorType);
            expect(config).toBeUndefined();
        });
    });

    describe("Base Store Actions", () => {
        it("should clear error", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            act(() => {
                result.current.lastError = "Test error";
            });

            expect(result.current.lastError).toBe("Test error");

            act(() => {
                result.current.clearError();
            });

            expect(result.current.lastError).toBeUndefined();
        });

        it("should set error", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            act(() => {
                result.current.setError("New error");
            });

            expect(result.current.lastError).toBe("New error");

            act(() => {
                result.current.setError(undefined);
            });

            expect(result.current.lastError).toBeUndefined();
        });

        it("should set loading state", () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            act(() => {
                result.current.setLoading(true);
            });

            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.setLoading(false);
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe("Integration Tests", () => {
        it("should handle complete monitor types workflow", async () => {
            const mockMonitorTypes: MonitorTypeConfig[] = [
                {
                    type: "http" as MonitorType,
                    displayName: "HTTP",
                    description: "HTTP monitoring",
                    version: "1.0",
                    fields: [
                        {
                            name: "url",
                            type: "string",
                            required: true,
                            label: "URL",
                        },
                    ],
                },
            ];

            const mockValidationResult: ValidationResult = {
                success: true,
                data: { url: "https://example.com" },
                errors: [],
                warnings: [],
                metadata: {},
            };

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );
            mockElectronAPI.monitorTypes.validateMonitorData.mockResolvedValue(
                mockValidationResult
            );
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
                "Formatted: 150ms"
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Load monitor types
            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.isLoaded).toBe(true);
            expect(result.current.monitorTypes).toEqual(mockMonitorTypes);

            // Get field config
            const fieldConfig = result.current.getFieldConfig(
                "http" as MonitorType
            );
            expect(fieldConfig).toEqual(mockMonitorTypes[0].fields);

            // Validate monitor data
            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    { url: "https://example.com" }
                );
            });

            expect(validationResult!.success).toBe(true);

            // Format details
            let formattedDetail: string;
            await act(async () => {
                formattedDetail = await result.current.formatMonitorDetail(
                    "http",
                    "Response: 150ms"
                );
            });

            expect(formattedDetail!).toBe("Formatted: 150ms");
        });

        it("should handle error recovery workflow", async () => {
            const { result } = renderHook(() => useMonitorTypesStore());

            // First, cause an error
            mockElectronAPI.monitorTypes.getMonitorTypes.mockRejectedValue(
                new Error("Network error")
            );

            await act(async () => {
                try {
                    await result.current.loadMonitorTypes();
                } catch {
                    // Expected to fail
                }
            });

            expect(result.current.lastError).toBe("Network error");
            expect(result.current.isLoaded).toBe(false);

            // Then recover with successful call
            const mockMonitorTypes: MonitorTypeConfig[] = [
                {
                    type: "http" as MonitorType,
                    displayName: "HTTP",
                    description: "HTTP monitoring",
                    version: "1.0",
                    fields: [],
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.lastError).toBeUndefined();
            expect(result.current.isLoaded).toBe(true);
            expect(result.current.monitorTypes).toEqual(mockMonitorTypes);
        });
    });

    describe("Edge Cases", () => {
        it("should handle concurrent loadMonitorTypes calls", async () => {
            const mockMonitorTypes: MonitorTypeConfig[] = [
                {
                    type: "http" as MonitorType,
                    displayName: "HTTP",
                    description: "HTTP monitoring",
                    version: "1.0",
                    fields: [],
                },
            ];

            // Delay the first call
            mockElectronAPI.monitorTypes.getMonitorTypes.mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(() => resolve(mockMonitorTypes), 100)
                    )
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Start multiple concurrent calls
            const promise1 = act(async () => {
                await result.current.loadMonitorTypes();
            });

            const promise2 = act(async () => {
                await result.current.loadMonitorTypes();
            });

            await Promise.all([promise1, promise2]);

            // Should only call the API once due to isLoaded check
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
            expect(result.current.isLoaded).toBe(true);
        });

        it("should handle malformed monitor type data", async () => {
            const malformedData = [
                { type: "http" }, // Missing required fields
                null,
                undefined,
                { type: "ping", fields: "invalid" },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                malformedData
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            // Should handle gracefully
            expect(result.current.isLoaded).toBe(true);
            expect(result.current.monitorTypes).toEqual(malformedData);
        });
    });
});
