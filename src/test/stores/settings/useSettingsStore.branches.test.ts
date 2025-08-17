/**
 * @file Branch coverage tests for useSettingsStore Testing conditional branches
 *   and error handling paths to achieve 90%+ branch coverage
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";

// Mock extractIpcData
vi.mock("../../../types/ipc", () => ({
    extractIpcData: vi.fn(),
    safeExtractIpcData: vi.fn(),
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
}));

// Import mocked modules to get references
import { safeExtractIpcData } from "../../../types/ipc";
import { withErrorHandling } from "../../../../shared/utils/errorHandling";

const mockSafeExtractIpcData = vi.mocked(safeExtractIpcData);
const mockWithErrorHandling = vi.mocked(withErrorHandling);

// Mock the entire electronAPI
const mockElectronAPI = {
    settings: {
        getHistoryLimit: vi.fn(),
        updateHistoryLimit: vi.fn(),
        resetToDefaults: vi.fn(),
        syncSettings: vi.fn(),
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

        // Setup default mock returns
        mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
            success: true,
            data: 1000,
        });
        mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue({
            success: true,
            data: 1000,
        });

        mockSafeExtractIpcData.mockImplementation(
            (response: any, fallback: any) => {
                try {
                    return response?.data ?? fallback;
                } catch {
                    return fallback;
                }
            }
        );

        // Setup withErrorHandling to execute function properly
        mockWithErrorHandling.mockImplementation(
            async (fn: any, handlers: any) => {
                try {
                    handlers?.setLoading?.(true);
                    handlers?.clearError?.();
                    return await fn();
                } catch (error) {
                    handlers?.setLoading?.(false);
                    handlers?.setError?.(error);
                    throw error;
                } finally {
                    handlers?.setLoading?.(false);
                }
            }
        );
    });

    describe("syncSettingsAfterRehydration branches", () => {
        it("should handle null state parameter (first branch)", async () => {
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

        it("should handle successful API response in async rehydration", async () => {
            // Mock a successful response
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 2000,
            });

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

        it("should handle API failure in catch block", async () => {
            // Mock console.warn to avoid noise in test output
            const consoleSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});

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
            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to sync settings after rehydration:",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe("Ternary operator branches in updateHistoryLimitValue", () => {
        it("should use backend limit when it's a valid positive number", async () => {
            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue({
                success: true,
                data: 5000, // Valid positive number
            });

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 5000,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(3000);
            });

            // Should use the backend limit (5000) instead of the provided limit (3000)
            expect(result.current.settings.historyLimit).toBe(5000);
        });

        it("should use provided limit when backend returns invalid number", async () => {
            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue({
                success: true,
                data: -1, // Invalid negative number
            });

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: -1,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(3000);
            });

            // Should use the provided limit (3000) since backend returned invalid number
            expect(result.current.settings.historyLimit).toBe(3000);
        });

        it("should use provided limit when backend returns zero", async () => {
            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue({
                success: true,
                data: 0, // Zero is not considered valid (not > 0)
            });

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 0,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(2500);
            });

            // Should use the provided limit (2500) since backend returned 0
            expect(result.current.settings.historyLimit).toBe(2500);
        });

        it("should use provided limit when backend returns non-number", async () => {
            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue({
                success: true,
                data: "invalid" as any, // Non-number type
            });

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: "invalid" as any,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(1500);
            });

            // Should use the provided limit (1500) since backend returned non-number
            expect(result.current.settings.historyLimit).toBe(1500);
        });
    });

    describe("Logical operator branches", () => {
        it("should handle backendLimit type check - first condition false", async () => {
            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue({
                success: true,
                data: "not-a-number" as any, // typeof will be "string", not "number"
            });

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: "not-a-number" as any,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(4000);
            });

            // Should use provided limit since typeof check fails
            expect(result.current.settings.historyLimit).toBe(4000);
        });

        it("should handle backendLimit value check - second condition false", async () => {
            const { result } = renderHook(() => useSettingsStore());

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue({
                success: true,
                data: -500, // typeof is "number" but value is not > 0
            });

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: -500,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(3500);
            });

            // Should use provided limit since value check fails
            expect(result.current.settings.historyLimit).toBe(3500);
        });
    });
});
