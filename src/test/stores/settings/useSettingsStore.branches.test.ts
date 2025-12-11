/**
 * @file Branch coverage tests for useSettingsStore Testing conditional branches
 *   and error handling paths to achieve 90%+ branch coverage
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { logger } from "../../../services/logger";

// Mock the bridge readiness helper to avoid real polling during tests
const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super("Electron bridge not ready");
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);

vi.mock("../../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

// Mock extractIpcData
vi.mock("../../../types/ipc", () => ({
    extractIpcData: vi.fn(),
    safeExtractIpcData: vi.fn(),
}));

// Mock logger
vi.mock("../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

// Mock error store
const mockErrorStore = {
    clearStoreError: vi.fn(),
    setStoreError: vi.fn(),
    setOperationLoading: vi.fn(),
};

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: () => mockErrorStore,
    },
}));

// Mock store utils
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

// Mock withErrorHandling from shared utils
vi.mock("../../../../shared/utils/errorHandling", () => ({
    withErrorHandling: vi.fn(),
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))),
}));

// Import mocked modules to get references
import { safeExtractIpcData } from "../../../types/ipc";
import { withErrorHandling } from "@shared/utils/errorHandling";

const mockSafeExtractIpcData = vi.mocked(safeExtractIpcData);
const mockWithErrorHandling = vi.mocked(withErrorHandling);

// Mock the entire electronAPI
const mockElectronAPI = {
    data: {
        resetToDefaults: vi.fn(),
        syncSettings: vi.fn(),
    },
    settings: {
        getHistoryLimit: vi.fn(),
        updateHistoryLimit: vi.fn(),
    },
};

// Global mock for window.electronAPI
if (globalThis.window === undefined) {
    Object.defineProperty(globalThis, "electronAPI", {
        value: mockElectronAPI,
        writable: true,
        configurable: true,
    });
} else {
    Object.defineProperty(globalThis, "electronAPI", {
        value: mockElectronAPI,
        writable: true,
    });
}

describe("useSettingsStore Branch Coverage Tests", () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        mockWaitForElectronBridge.mockResolvedValue(undefined);

        // Setup default mock returns
        mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(1000);
        mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(1000);

        mockSafeExtractIpcData.mockImplementation((
            response: any,
            fallback: any
        ) => {
            try {
                return response?.data ?? fallback;
            } catch {
                return fallback;
            }
        });

        // Setup withErrorHandling to execute function properly
        mockWithErrorHandling.mockImplementation(async (
            fn: any,
            handlers: any
        ) => {
            try {
                handlers?.setLoading?.(true);
                handlers?.clearError?.();
                return await fn();
            } catch (error: unknown) {
                handlers?.setLoading?.(false);
                handlers?.setError?.(error);
                throw error;
            } finally {
                handlers?.setLoading?.(false);
            }
        });
    });

    describe("syncSettingsAfterRehydration branches", () => {
        it("should handle null state parameter (first branch)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // This is testing the syncSettingsAfterRehydration function that is called during persist rehydration
            // We need to test it via the rehydration mechanism since it's not a public method

            // Clear any persisted state first
            useSettingsStore.persist.clearStorage();

            // The function is called as part of onRehydrateStorage callback
            // When state is null (first load), it should exit early
            renderHook(() => useSettingsStore());

            // Force rehydration with empty state (simulates null state scenario)
            await act(async () => {
                await useSettingsStore.persist.rehydrate();
            });

            // Should not make API calls when state is null/empty during first load
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).not.toHaveBeenCalled();
        });

        it("should handle successful API response in async rehydration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Mock a successful response
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(2000);

            const { result } = renderHook(() => useSettingsStore());

            // Set up some state first
            act(() => {
                result.current.updateSettings({ historyLimit: 1000 });
            });

            // Force rehydration to trigger syncSettingsAfterRehydration
            await act(async () => {
                await useSettingsStore.persist.rehydrate();
                // Wait for the setTimeout delay and async operation
                await new Promise((resolve) => setTimeout(resolve, 150));
            });

            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();
            expect(result.current.settings.historyLimit).toBe(2000);
        });

        it("should handle API failure in catch block", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            // Make the API call reject to trigger catch block
            mockElectronAPI.settings.getHistoryLimit.mockRejectedValue(
                new Error("Network failure")
            );

            const { result } = renderHook(() => useSettingsStore());

            // Set up some state first
            act(() => {
                result.current.updateSettings({ historyLimit: 1000 });
            });

            // Force rehydration to trigger syncSettingsAfterRehydration
            await act(async () => {
                await useSettingsStore.persist.rehydrate();
                // Wait for the setTimeout delay and async operation to fail
                await new Promise((resolve) => setTimeout(resolve, 150));
            });

            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalledWith(
                "Failed to sync settings after rehydration:",
                expect.any(Error)
            );
        });
    });

    describe("Ternary operator branches in persistHistoryLimit", () => {
        it("should use backend limit when it's a valid positive number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Configuration", "type");

            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(5000);

            await act(async () => {
                await result.current.persistHistoryLimit(3000);
            });

            // Should use the backend limit (5000) instead of the provided limit (3000)
            expect(result.current.settings.historyLimit).toBe(5000);
        });

        it("should clamp backend invalid number to unlimited", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Configuration", "type");

            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(-1);

            await act(async () => {
                await result.current.persistHistoryLimit(3000);
            });

            // Negative backend value is normalised to the unlimited sentinel (0)
            expect(result.current.settings.historyLimit).toBe(0);
        });

        it("should respect backend zero as unlimited", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Configuration", "type");

            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(0);

            await act(async () => {
                await result.current.persistHistoryLimit(2500);
            });

            // Backend zero indicates unlimited history retention and should be preserved
            expect(result.current.settings.historyLimit).toBe(0);
        });

        it("should use provided limit when backend returns non-number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Configuration", "type");

            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(
                "invalid" as unknown as number
            );

            await act(async () => {
                await result.current.persistHistoryLimit(1500);
            });

            // Should use the provided limit (1500) since backend returned non-number
            expect(result.current.settings.historyLimit).toBe(1500);
        });
    });

    describe("Logical operator branches", () => {
        it("should handle backendLimit type check - first condition false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Configuration", "type");

            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(
                "not-a-number" as unknown as number
            );

            await act(async () => {
                await result.current.persistHistoryLimit(4000);
            });

            // Should use provided limit since typeof check fails
            expect(result.current.settings.historyLimit).toBe(4000);
        });

        it("should clamp negative backendLimit values to unlimited", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore.branches", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Configuration", "type");

            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(-500);

            await act(async () => {
                await result.current.persistHistoryLimit(3500);
            });

            // Negative backend value results in unlimited history retention (0)
            expect(result.current.settings.historyLimit).toBe(0);
        });
    });
});
