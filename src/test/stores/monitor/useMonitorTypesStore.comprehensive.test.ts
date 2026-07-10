/**
 * Comprehensive tests for useMonitorTypesStore
 *
 * This test suite provides complete coverage for the MonitorTypesStore, testing
 * all state management, actions, error handling, and IPC interactions.
 */

import type {
    Monitor,
    MonitorFieldDefinition,
    MonitorType,
} from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";

import { act, renderHook } from "@testing-library/react";
import { arrayFirst, safeCastTo } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";
import { installElectronApiMock } from "../../utils/electronApiMock";

// Mock dependencies (partial mock to preserve exports like ApplicationError)
vi.mock("@shared/utils/errorHandling", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@shared/utils/errorHandling")>();

    return {
        ...actual,
        ensureError: vi.fn((error) =>
            Error.isError(error) ? error : new Error(String(error))
        ),
        withErrorHandling: vi.fn(async (operation, store) => {
            // Simulate the real withErrorHandling behavior
            try {
                store.clearError();
                store.setLoading(true);
                return await operation();
            } catch (error: unknown) {
                const errorMessage = Error.isError(error)
                    ? error.message
                    : String(error);
                store.setError(errorMessage);
                throw error;
            } finally {
                store.setLoading(false);
            }
        }),
    };
});

vi.mock("../../../stores/utils", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../stores/utils")>();
    return {
        ...actual,
        logStoreAction: vi.fn(),
    };
});

const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn(),
        validateMonitorData: vi.fn(),
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
    },
} as const;

let restoreElectronApi: (() => void) | undefined;

interface Deferred<T> {
    readonly promise: Promise<T>;
    readonly reject: (reason?: unknown) => void;
    readonly resolve: (value: T | PromiseLike<T>) => void;
}

function createDeferred<T>(): Deferred<T> {
    let reject: Deferred<T>["reject"] = () => undefined;
    let resolve: Deferred<T>["resolve"] = () => undefined;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        reject = rejectPromise;
        resolve = resolvePromise;
    });

    return { promise, reject, resolve };
}

const createMonitorTypeConfig = (
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => ({
    type: overrides.type ?? "http",
    displayName: overrides.displayName ?? "HTTP",
    description: overrides.description ?? "HTTP monitoring",
    version: overrides.version ?? "1.0",
    fields:
        overrides.fields ??
        ([
            {
                helpText: "Provide a valid endpoint",
                label: "URL",
                name: "url",
                placeholder: "https://example.com",
                required: true,
                type: "url",
            },
        ] satisfies MonitorTypeConfig["fields"]),
    ...(overrides.uiConfig !== undefined && { uiConfig: overrides.uiConfig }),
});

describe(useMonitorTypesStore, () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        useErrorStore.setState({
            isLoading: false,
            lastError: undefined,
            operationLoading: {},
            storeErrors: {},
        });

        // Reset Zustand store to initial state
        useMonitorTypesStore.setState({
            monitorTypes: [],
            fieldConfigs: {},
            isLoaded: false,
        });

        ({ restore: restoreElectronApi } = installElectronApiMock({
            monitorTypes: mockElectronAPI.monitorTypes,
        }));
    });

    afterEach(() => {
        restoreElectronApi?.();
        restoreElectronApi = undefined;
    });

    describe("Initial State", () => {
        it("should initialize with default state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            expect(result.current.fieldConfigs).toEqual({});
            expect(result.current.isLoaded).toBeFalsy();
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBeUndefined();
            expect(result.current.monitorTypes).toEqual([]);
        });
    });

    describe("loadMonitorTypes", () => {
        const mockMonitorTypes: MonitorTypeConfig[] = [
            {
                type: "http",
                displayName: "HTTP",
                description: "HTTP monitoring",
                version: "1.0",
                fields: [
                    {
                        name: "url",
                        type: "url",
                        required: true,
                        label: "URL",
                    },
                ],
            },
            {
                type: "ping",
                displayName: "Ping",
                description: "Ping monitoring",
                version: "1.0",
                fields: [
                    {
                        name: "host",
                        type: "text",
                        required: true,
                        label: "Host",
                    },
                ],
            },
        ];

        it("should load monitor types successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(result.current.monitorTypes).toEqual(mockMonitorTypes);
            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.fieldConfigs).toEqual({
                http: arrayFirst(mockMonitorTypes)!.fields,
                ping: mockMonitorTypes[1]!.fields,
            });
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
        });

        it("should skip loading if already loaded and no error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // First load the monitor types to set isLoaded = true
            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            // Clear the mock call count
            mockElectronAPI.monitorTypes.getMonitorTypes.mockClear();

            // Now try to load again - it should skip
            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).not.toHaveBeenCalled();
        });

        it("should reload if not loaded", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Store starts as not loaded by default, so just call loadMonitorTypes
            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
            expect(result.current.isLoaded).toBeTruthy();
        });

        it("should reload if error exists", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            mockElectronAPI.monitorTypes.getMonitorTypes
                .mockRejectedValueOnce(new Error("Previous error"))
                .mockResolvedValueOnce(mockMonitorTypes);

            const { result } = renderHook(() => useMonitorTypesStore());

            // First call will fail and set error
            await act(async () => {
                try {
                    await result.current.loadMonitorTypes();
                } catch {
                    // Expected to throw
                }
            });

            // Clear call count after first failed attempt
            mockElectronAPI.monitorTypes.getMonitorTypes.mockClear();

            // Second call should reload because error exists
            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle loading errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

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

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe(errorMessage);
            expect(
                useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBeFalsy();
        });

        it("should surface an error when backend returns empty response", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                null
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                await expect(result.current.loadMonitorTypes()).rejects.toThrow(
                    "invalid payload"
                );
            });

            expect(result.current.monitorTypes).toEqual([]);
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toContain("invalid payload");
        });
    });

    describe("refreshMonitorTypes", () => {
        it("should clear state and reload monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            const mockMonitorTypes: MonitorTypeConfig[] = [
                createMonitorTypeConfig(),
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Set some initial state
            act(() => {
                result.current.isLoaded = true;
                result.current.fieldConfigs = { http: [] };
                result.current.monitorTypes = [];
            });

            await act(async () => {
                await result.current.refreshMonitorTypes();
            });

            expect(result.current.monitorTypes).toEqual(mockMonitorTypes);
            expect(result.current.isLoaded).toBeTruthy();
            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(1);
        });

        it("waits for an active load before fetching fresh monitor types", async () => {
            const initialTypes = [createMonitorTypeConfig()];
            const refreshedTypes = [
                createMonitorTypeConfig({
                    displayName: "HTTP refreshed",
                }),
            ];
            const initialRequest = createDeferred<MonitorTypeConfig[]>();
            mockElectronAPI.monitorTypes.getMonitorTypes
                .mockReturnValueOnce(initialRequest.promise)
                .mockResolvedValueOnce(refreshedTypes);

            const { loadMonitorTypes, refreshMonitorTypes } =
                useMonitorTypesStore.getState();
            const loadPromise = loadMonitorTypes();
            const refreshPromise = refreshMonitorTypes();

            await vi.waitFor(() => {
                expect(
                    mockElectronAPI.monitorTypes.getMonitorTypes
                ).toHaveBeenCalledTimes(1);
            });

            initialRequest.resolve(initialTypes);
            await Promise.all([loadPromise, refreshPromise]);

            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(2);
            expect(useMonitorTypesStore.getState().monitorTypes).toEqual(
                refreshedTypes
            );
        });

        it("retries when the active load fails", async () => {
            const refreshedTypes = [createMonitorTypeConfig()];
            const initialRequest = createDeferred<MonitorTypeConfig[]>();
            mockElectronAPI.monitorTypes.getMonitorTypes
                .mockReturnValueOnce(initialRequest.promise)
                .mockResolvedValueOnce(refreshedTypes);

            const { loadMonitorTypes, refreshMonitorTypes } =
                useMonitorTypesStore.getState();
            const loadPromise = loadMonitorTypes();
            const refreshPromise = refreshMonitorTypes();
            const failedLoad = (async (): Promise<void> => {
                await expect(loadPromise).rejects.toThrow(
                    "Initial load failed"
                );
            })();

            await vi.waitFor(() => {
                expect(
                    mockElectronAPI.monitorTypes.getMonitorTypes
                ).toHaveBeenCalledTimes(1);
            });

            initialRequest.reject(new Error("Initial load failed"));
            await Promise.all([failedLoad, refreshPromise]);

            expect(
                mockElectronAPI.monitorTypes.getMonitorTypes
            ).toHaveBeenCalledTimes(2);
            expect(useMonitorTypesStore.getState().monitorTypes).toEqual(
                refreshedTypes
            );
            expect(useMonitorTypesStore.getState().isLoaded).toBeTruthy();
        });
    });

    describe("validateMonitorData", () => {
        const mockValidationResult: ValidationResult = {
            success: true,
            data: { url: "https://example.com" },
            errors: [],
            warnings: [],
            metadata: {},
        };

        it("should validate monitor data successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Validation", "type");

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

        it("should handle validation with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

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

            expect(validationResult!.success).toBeFalsy();
            expect(validationResult!.errors).toEqual(["URL is required"]);
        });

        it("should handle partial validation result with missing properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Validation", "type");

            const partialResult = {
                success: true,
                data: { url: "https://example.com" },
                errors: [],
                // Missing warnings and metadata
            } satisfies ValidationResult;

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

        it("should handle validation errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const errorMessage = "Validation service unavailable";
            mockElectronAPI.monitorTypes.validateMonitorData.mockRejectedValue(
                new Error(errorMessage)
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            await act(async () => {
                try {
                    await result.current.validateMonitorData("http", {});
                } catch (error: unknown) {
                    expect(error).toBeInstanceOf(Error);
                }
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe(errorMessage);
        });
    });

    describe("formatMonitorDetail", () => {
        it("should format monitor detail successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should handle formatting errors with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

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

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Formatting failed");
        });

        it("should handle null response as error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Mock null response which should be treated as an API error
            mockElectronAPI.monitorTypes.formatMonitorDetail.mockResolvedValue(
                null
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Since withErrorHandling re-throws errors, we expect the function to throw
            await act(async () => {
                await expect(
                    result.current.formatMonitorDetail(
                        "http",
                        "Response time: 150ms"
                    )
                ).rejects.toThrow(); // Should throw an error due to unexpected null response
            });
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

        it("should format monitor title suffix successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should handle title suffix formatting errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

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

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Title formatting failed");
        });

        it("should handle null response as error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Mock null response which should be treated as an API error
            mockElectronAPI.monitorTypes.formatMonitorTitleSuffix.mockResolvedValue(
                null
            );

            const { result } = renderHook(() => useMonitorTypesStore());

            // Since withErrorHandling re-throws errors, we expect the function to throw
            await act(async () => {
                await expect(
                    result.current.formatMonitorTitleSuffix("http", mockMonitor)
                ).rejects.toThrow(); // Should throw an error due to unexpected null response
            });
        });
    });

    describe("getFieldConfig", () => {
        it("should return field config for existing type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            const httpFields: MonitorFieldDefinition[] = [
                { name: "url", type: "url", required: true, label: "URL" },
            ];

            act(() => {
                result.current.fieldConfigs = {
                    http: httpFields,
                };
            });

            const config = result.current.getFieldConfig("http");
            expect(config).toEqual(httpFields);
        });

        it("should return undefined for non-existing type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            const config = result.current.getFieldConfig(
                "unknown" as MonitorType
            );
            expect(config).toBeUndefined();
        });

        it("should return undefined when fieldConfigs is empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useMonitorTypesStore());

            const config = result.current.getFieldConfig("http");
            expect(config).toBeUndefined();
        });
    });

    describe("ErrorStore Actions", () => {
        it("should support store error lifecycle", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            useErrorStore
                .getState()
                .setStoreError("monitor-types", "Test error");
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Test error");

            useErrorStore.getState().clearStoreError("monitor-types");
            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBeUndefined();
        });

        it("should support operation loading lifecycle", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useErrorStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            useErrorStore
                .getState()
                .setOperationLoading("monitorTypes.loadTypes", true);
            expect(
                useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBeTruthy();

            useErrorStore
                .getState()
                .setOperationLoading("monitorTypes.loadTypes", false);
            expect(
                useErrorStore
                    .getState()
                    .getOperationLoading("monitorTypes.loadTypes")
            ).toBeFalsy();
        });
    });

    describe("Integration Tests", () => {
        it("should handle complete monitor types workflow", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const mockMonitorTypes: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "HTTP",
                    description: "HTTP monitoring",
                    version: "1.0",
                    fields: [
                        {
                            name: "url",
                            type: "url",
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

            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.monitorTypes).toEqual(mockMonitorTypes);

            // Get field config
            const fieldConfig = result.current.getFieldConfig("http");
            expect(fieldConfig).toEqual(arrayFirst(mockMonitorTypes)!.fields);

            // Validate monitor data
            let validationResult: ValidationResult;
            await act(async () => {
                validationResult = await result.current.validateMonitorData(
                    "http",
                    { url: "https://example.com" }
                );
            });

            expect(validationResult!.success).toBeTruthy();

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

        it("should handle error recovery workflow", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

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

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBe("Network error");
            expect(result.current.isLoaded).toBeFalsy();

            // Then recover with successful call
            const mockMonitorTypes: MonitorTypeConfig[] = [
                createMonitorTypeConfig({
                    type: safeCastTo<MonitorType>("http"),
                }),
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                mockMonitorTypes
            );

            await act(async () => {
                await result.current.loadMonitorTypes();
            });

            expect(
                useErrorStore.getState().getStoreError("monitor-types")
            ).toBeUndefined();
            expect(result.current.isLoaded).toBeTruthy();
            expect(result.current.monitorTypes).toEqual(mockMonitorTypes);
        });
    });

    describe("Edge Cases", () => {
        it("should handle concurrent loadMonitorTypes calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useMonitorTypesStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            const mockMonitorTypes: MonitorTypeConfig[] = [
                createMonitorTypeConfig({
                    type: safeCastTo<MonitorType>("http"),
                }),
            ];

            const request = createDeferred<MonitorTypeConfig[]>();
            mockElectronAPI.monitorTypes.getMonitorTypes.mockReturnValue(
                request.promise
            );

            const { loadMonitorTypes } = useMonitorTypesStore.getState();
            const firstLoad = loadMonitorTypes();
            const secondLoad = loadMonitorTypes();

            await vi.waitFor(() => {
                expect(
                    mockElectronAPI.monitorTypes.getMonitorTypes
                ).toHaveBeenCalledTimes(1);
            });

            request.resolve(mockMonitorTypes);
            await Promise.all([firstLoad, secondLoad]);

            expect(useMonitorTypesStore.getState().isLoaded).toBeTruthy();
        });

        it("should handle malformed monitor type data", async () => {
            const malformedData = [
                { type: "http" }, // Missing required fields
                null,
                undefined,
                { type: "ping", fields: "invalid" },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(
                malformedData as any
            );

            await expect(
                useMonitorTypesStore.getState().loadMonitorTypes()
            ).rejects.toThrow("invalid payload");

            expect(useMonitorTypesStore.getState().isLoaded).toBeFalsy();
            expect(useMonitorTypesStore.getState().monitorTypes).toEqual([]);
        });
    });
});
