/**
 * Comprehensive tests for useSettingsStore providing maximum coverage.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

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
import { extractIpcData, safeExtractIpcData } from "../../../types/ipc";
import { logStoreAction } from "../../../stores/utils";
import { withErrorHandling } from "../../../../shared/utils/errorHandling";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";

const mockExtractIpcData = vi.mocked(extractIpcData);
const mockSafeExtractIpcData = vi.mocked(safeExtractIpcData);
const mockLogStoreAction = vi.mocked(logStoreAction);
const mockWithErrorHandling = vi.mocked(withErrorHandling);

// Mock window.electronAPI
const mockElectronAPI = {
    settings: {
        getHistoryLimit: vi.fn(),
        updateHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
    },
};

// Set up window.electronAPI mock conditionally
if ((globalThis as any).electronAPI) {
    (globalThis as any).electronAPI = mockElectronAPI;
} else {
    Object.defineProperty(globalThis, "electronAPI", {
        value: mockElectronAPI,
        writable: true,
        configurable: true,
    });
}

describe("useSettingsStore", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock returns
        mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
            data: 1000,
        });
        mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue({
            data: true,
        });
        mockElectronAPI.settings.resetSettings.mockResolvedValue({
            data: true,
        });

        mockExtractIpcData.mockImplementation((response: any) => response.data);
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
        mockWithErrorHandling.mockImplementation(async (fn, handlers) => {
            try {
                (handlers as any).setLoading?.(true);
                (handlers as any).clearError?.();
                return await fn();
            } catch (error) {
                // Match the real withErrorHandling behavior: extract error message
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                (handlers as any).setError?.(errorMessage);
                throw error;
            } finally {
                (handlers as any).setLoading?.(false);
            }
        });
    });

    afterEach(() => {
        // Reset store to defaults
        const { result } = renderHook(() => useSettingsStore());
        act(() => {
            result.current.resetSettings();
        });
    });

    describe("Initial State", () => {
        it("should initialize with default settings", () => {
            const { result } = renderHook(() => useSettingsStore());

            act(() => {
                // Just trigger a re-render to check the initial state
                result.current.updateSettings({});
            });

            expect(result.current.settings).toEqual({
                autoStart: false,
                historyLimit: 500,
                minimizeToTray: true,
                notifications: true,
                soundAlerts: false,
                theme: "system",
            });
        });
    });

    describe("Settings Operations", () => {
        it("should update settings", () => {
            const { result } = renderHook(() => useSettingsStore());

            act(() => {
                result.current.updateSettings({
                    theme: "dark",
                    notifications: false,
                });
            });

            expect(result.current.settings.theme).toBe("dark");
            expect(result.current.settings.notifications).toBe(false);
            expect(result.current.settings.historyLimit).toBe(1000); // unchanged
        });

        it("should update individual settings", () => {
            const { result } = renderHook(() => useSettingsStore());

            act(() => {
                result.current.updateSettings({ theme: "light" });
            });

            expect(result.current.settings.theme).toBe("light");
            expect(result.current.settings.notifications).toBe(true); // unchanged
        });

        it("should handle reset to defaults", async () => {
            const { result } = renderHook(() => useSettingsStore());

            // First update some settings
            act(() => {
                result.current.updateSettings({
                    theme: "dark",
                    notifications: false,
                });
            });

            // Mock reset to return default value
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 1000,
            });

            // Then reset
            await act(async () => {
                await result.current.resetSettings();
            });

            expect(result.current.settings).toEqual({
                autoStart: false,
                historyLimit: 1000,
                minimizeToTray: true,
                notifications: true,
                soundAlerts: false,
                theme: "system",
            });
        });
    });

    describe("initializeSettings", () => {
        it("should initialize settings from backend", async () => {
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                data: 500,
            });

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await result.current.initializeSettings();
            });

            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();
            expect(mockSafeExtractIpcData).toHaveBeenCalled();
            expect(result.current.settings.historyLimit).toBe(500);
        });

        it("should handle initialization errors gracefully", async () => {
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce({
                success: false,
                error: "Backend error",
            });

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                // The error handling wrapper catches errors but doesn't re-throw them
                await result.current.initializeSettings();
            });

            // The error is handled internally by the error handling wrapper
            // The settings store should not crash and should remain functional
            expect(result.current.settings).toBeDefined();
            expect(result.current.updateSettings).toBeDefined();
        });

        it("should use error handling wrapper", async () => {
            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await result.current.initializeSettings();
            });

            expect(mockWithErrorHandling).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    clearError: expect.any(Function),
                    setError: expect.any(Function),
                    setLoading: expect.any(Function),
                })
            );
        });
    });

    describe("updateHistoryLimitValue", () => {
        it("should update history limit successfully", async () => {
            const { result } = renderHook(() => useSettingsStore());

            // Mock backend responses
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 2000,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(2000);
            });

            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledWith(2000);
            expect(mockSafeExtractIpcData).toHaveBeenCalled();
            expect(result.current.settings.historyLimit).toBe(2000);
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SettingsStore",
                "updateHistoryLimitValue",
                {
                    limit: 2000,
                }
            );
        });

        it("should validate history limit bounds", async () => {
            const { result } = renderHook(() => useSettingsStore());

            // Mock backend to return the same value (no clamping on frontend)
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 50,
            });

            // Test update with small value
            await act(async () => {
                await result.current.updateHistoryLimitValue(50);
            });

            expect(result.current.settings.historyLimit).toBe(50); // No clamping in frontend

            // Test large value
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 100_000,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(100_000);
            });

            expect(result.current.settings.historyLimit).toBe(100_000); // No clamping in frontend
        });

        it("should handle backend update errors", async () => {
            const error = new Error("Update failed");

            const { result } = renderHook(() => useSettingsStore());

            // Set initial value BEFORE setting up the error mock
            await act(async () => {
                result.current.updateSettings({ historyLimit: 200 });
            });

            // Now mock the error AFTER setting initial state
            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(
                error
            );

            // Attempt update that will fail
            await act(async () => {
                await expect(
                    result.current.updateHistoryLimitValue(600)
                ).rejects.toThrow("Update failed");
            });

            // Should be reverted to previous value (200), not the attempted value (600)
            expect(result.current.settings.historyLimit).toBe(200);
            expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                "settings",
                "Update failed"
            );
        });

        it("should handle all error cases in updateHistoryLimitValue", async () => {
            const { result } = renderHook(() => useSettingsStore());

            // Set an initial value first
            act(() => {
                result.current.updateSettings({ historyLimit: 1000 });
            });

            // Test that the function properly captures current state before starting
            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(
                new Error("Test error")
            );

            await act(async () => {
                try {
                    await result.current.updateHistoryLimitValue(600);
                } catch {
                    // Expected to throw
                }
            });

            // The error handler should revert to the value that was captured at the start (300)
            expect(result.current.settings.historyLimit).toBe(1000); // Reverted to previous value
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle missing electronAPI gracefully", async () => {
            // Temporarily remove electronAPI
            const originalAPI = (globalThis as any).electronAPI;
            (globalThis as any).electronAPI = undefined;

            const { result } = renderHook(() => useSettingsStore());

            try {
                await act(async () => {
                    await expect(
                        result.current.initializeSettings()
                    ).rejects.toThrow();
                });
            } finally {
                // Restore electronAPI
                (globalThis as any).electronAPI = originalAPI;
            }
        });

        it("should handle concurrent operations", async () => {
            const { result } = renderHook(() => useSettingsStore());

            const promises = [
                result.current.updateHistoryLimitValue(500),
                result.current.updateHistoryLimitValue(600),
                result.current.updateHistoryLimitValue(700),
            ];

            await act(async () => {
                await Promise.allSettled(promises);
            });

            // Should handle concurrent operations without crashing
            expect(result.current.settings.historyLimit).toBeGreaterThan(0);
        });

        it("should handle safeExtractIpcData errors gracefully", async () => {
            // Reset the mock first
            mockElectronAPI.settings.getHistoryLimit.mockReset();

            // Make the electronAPI call fail to return an error response
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: false,
                error: "Backend error",
                data: undefined,
            });

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await result.current.initializeSettings();
            });

            // Should use the fallback value (DEFAULT_HISTORY_LIMIT = 500)
            expect(result.current.settings.historyLimit).toBe(500);
        });
    });

    describe("Loading States", () => {
        it("should set loading state during operations", async () => {
            let loadingStatesDuringCall: boolean[] = [];

            mockWithErrorHandling.mockImplementation(async (fn, handlers) => {
                (handlers as any).setLoading?.(true);
                loadingStatesDuringCall.push(true);

                try {
                    return await fn();
                } finally {
                    (handlers as any).setLoading?.(false);
                    loadingStatesDuringCall.push(false);
                }
            });

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await result.current.updateHistoryLimitValue(500);
            });

            expect(loadingStatesDuringCall).toEqual([true, false]);
        });
    });

    describe("Error Recovery", () => {
        it("should clear errors when successful operations occur", async () => {
            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await result.current.updateHistoryLimitValue(500);
            });

            expect(mockErrorStore.clearStoreError).toHaveBeenCalledWith(
                "settings"
            );
        });

        it("should maintain error state until cleared", async () => {
            const error = new Error("Persistent error");
            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(
                error
            );

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await expect(
                    result.current.updateHistoryLimitValue(500)
                ).rejects.toThrow();
            });

            expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                "settings",
                "Persistent error"
            );
        });
    });

    describe("Persistence", () => {
        it("should persist settings across store recreations", () => {
            const { result: result1 } = renderHook(() => useSettingsStore());

            act(() => {
                result1.current.updateSettings({ theme: "dark" });
            });

            // Create new hook instance (simulates store recreation)
            const { result: result2 } = renderHook(() => useSettingsStore());

            expect(result2.current.settings.theme).toBe("dark");
        });

        it("should handle store rehydration", () => {
            const { result } = renderHook(() => useSettingsStore());

            // Initial state should be properly rehydrated
            expect(result.current.settings).toBeDefined();
            expect(typeof result.current.updateSettings).toBe("function");
            expect(typeof result.current.initializeSettings).toBe("function");
        });
    });

    describe("Action Logging", () => {
        it("should log all store actions", async () => {
            const { result } = renderHook(() => useSettingsStore());

            // Mock backend response for getHistoryLimit
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 500,
            });

            await act(async () => {
                await result.current.updateHistoryLimitValue(500);
            });

            // Check that both updateHistoryLimitValue and updateSettings are logged
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SettingsStore",
                "updateHistoryLimitValue",
                {
                    limit: 500,
                }
            );
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SettingsStore",
                "updateSettings",
                {
                    newSettings: { historyLimit: 500 },
                }
            );
        });

        it("should log initialization actions", async () => {
            const { result } = renderHook(() => useSettingsStore());

            // Mock backend response
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 1000,
            });

            await act(async () => {
                await result.current.initializeSettings();
            });

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SettingsStore",
                "initializeSettings",
                {
                    message: "Successfully loaded settings",
                    settingsLoaded: true,
                    success: true,
                }
            );
        });
    });

    describe("Type Safety", () => {
        it("should enforce correct settings structure", () => {
            const { result } = renderHook(() => useSettingsStore());

            act(() => {
                result.current.updateSettings({
                    theme: "dark",
                    notifications: false,
                    historyLimit: 500,
                });
            });

            expect(result.current.settings).toEqual({
                autoStart: false,
                historyLimit: 500,
                minimizeToTray: true,
                notifications: false,
                soundAlerts: false,
                theme: "dark",
            });
        });

        it("should handle partial settings updates", () => {
            const { result } = renderHook(() => useSettingsStore());

            // Reset to defaults first by manually setting default values
            act(() => {
                result.current.updateSettings({
                    autoStart: false,
                    historyLimit: 500, // Explicit default value
                    minimizeToTray: true,
                    notifications: true,
                    soundAlerts: false,
                    theme: "system",
                });
            });

            // Now test partial update
            act(() => {
                result.current.updateSettings({ theme: "light" });
            });

            expect(result.current.settings.theme).toBe("light");
            expect(result.current.settings.notifications).toBe(true); // unchanged
            expect(result.current.settings.historyLimit).toBe(500); // default value
        });
    });
});
