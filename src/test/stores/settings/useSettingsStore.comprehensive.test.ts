/**
 * Comprehensive tests for useSettingsStore providing maximum coverage.
 */

import { afterAll, describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { test, fc } from "@fast-check/vitest";
import type { ElectronAPI } from "../../../types";
import type { AppSettings } from "../../../stores/types";
import { installElectronApiMock } from "../../utils/electronApiMock";
import {
    defaultSettings,
    normalizeAppSettings,
} from "../../../stores/settings/state";

// Mock the bridge readiness helper to avoid polling delays in tests
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

// Mock store utils (partial) so new exports (e.g. createPersistConfig) remain available.
vi.mock("../../../stores/utils", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../stores/utils")>();
    return {
        ...actual,
        logStoreAction: vi.fn(),
    };
});

// Mock withErrorHandling from shared utils (partial) to retain ApplicationError, etc.
vi.mock("../../../../shared/utils/errorHandling", async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import("../../../../shared/utils/errorHandling")
        >();

    return {
        ...actual,
        ensureError: vi.fn((error) =>
            error instanceof Error ? error : new Error(String(error))
        ),
        withErrorHandling: vi.fn(),
    };
});

// Import mocked modules to get references
import { extractIpcData, safeExtractIpcData } from "../../../types/ipc";
import { logStoreAction } from "../../../stores/utils";
import { withErrorHandling } from "@shared/utils/errorHandling";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { resetHistoryLimitSubscriptionForTesting } from "../../../stores/settings/operations";

const mockExtractIpcData = vi.mocked(extractIpcData);
const mockSafeExtractIpcData = vi.mocked(safeExtractIpcData);
const mockLogStoreAction = vi.mocked(logStoreAction);
const mockWithErrorHandling = vi.mocked(withErrorHandling);

// Mock window.electronAPI
const mockElectronAPI = {
    data: {
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(100),
            fileName: "settings-backup.sqlite",
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "mock-checksum",
                createdAt: 0,
                originalPath: "/tmp/settings-backup.sqlite",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 100,
            },
        }),
        saveSqliteBackup: vi.fn().mockResolvedValue({
            canceled: true as const,
        }),
    },
    events: {
        onHistoryLimitUpdated: vi.fn<
            ElectronAPI["events"]["onHistoryLimitUpdated"]
        >(() => vi.fn()),
    },
    settings: {
        getHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
        updateHistoryLimit: vi.fn(),
    },
    monitoring: {},
    sites: {
        removeMonitor: vi.fn(),
    },
    stateSync: {
        onStateSyncEvent: vi.fn(),
    },
};

const { restore: restoreElectronApi } = installElectronApiMock(mockElectronAPI, {
    ensureWindow: true,
});

afterAll(() => {
    restoreElectronApi();
});

const createSettings = (overrides: Partial<AppSettings> = {}): AppSettings =>
    normalizeAppSettings({ ...defaultSettings, ...overrides });

describe(useSettingsStore, () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetHistoryLimitSubscriptionForTesting();

        mockWaitForElectronBridge.mockResolvedValue(undefined);

        // Setup default mock returns - direct data values (preload APIs extract data automatically)
        mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(500);
        mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(500);
        mockElectronAPI.settings.resetSettings.mockResolvedValue(undefined);
        mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(500); // This is what SettingsService actually calls
        mockElectronAPI.data.downloadSqliteBackup.mockResolvedValue({
            buffer: new ArrayBuffer(100),
            fileName: "settings-backup.sqlite",
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "mock-checksum",
                createdAt: 0,
                originalPath: "/tmp/settings-backup.sqlite",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 100,
            },
        });
        mockElectronAPI.sites.removeMonitor.mockResolvedValue({
            identifier: "settings-site",
            monitoring: true,
            monitors: [],
            name: "Settings Site",
        });
        mockElectronAPI.stateSync.onStateSyncEvent.mockReturnValue(() => {});

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
            } catch (error: unknown) {
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

    afterEach(async () => {
        // Reset store to defaults - must be awaited since resetSettings is async
        const { result } = renderHook(() => useSettingsStore());
        await act(async () => {
            await result.current.resetSettings();
        });

        // Also manually reset to default settings to ensure clean state
        act(() => {
            result.current.updateSettings(defaultSettings);
        });
    });

    describe("Initial State", () => {
        it("should initialize with default settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useSettingsStore());

            act(() => {
                // Just trigger a re-render to check the initial state
                result.current.updateSettings({});
            });

            expect(result.current.settings).toEqual(defaultSettings);
        });
    });

    describe("Settings Operations", () => {
        it("should update settings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useSettingsStore());

            act(() => {
                result.current.updateSettings({
                    theme: "dark",
                    systemNotificationsEnabled: true,
                });
            });

            expect(result.current.settings.theme).toBe("dark");
            expect(
                result.current.settings.systemNotificationsEnabled
            ).toBeTruthy();
            expect(result.current.settings.historyLimit).toBe(500); // Unchanged - using correct DEFAULT_HISTORY_LIMIT
        });

        it("should update individual settings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useSettingsStore());

            act(() => {
                result.current.updateSettings({ theme: "light" });
            });

            expect(result.current.settings.theme).toBe("light");
            expect(result.current.settings.systemNotificationsEnabled).toBe(
                defaultSettings.systemNotificationsEnabled
            );
        });

        it("should handle reset to defaults", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useSettingsStore());

            // First update some settings
            act(() => {
                result.current.updateSettings({
                    theme: "dark",
                    systemNotificationsEnabled: true,
                });
            });

            // Mock reset to return default value (SettingsService uses data API)
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(500);

            // Then reset
            await act(async () => {
                await result.current.resetSettings();
            });

            expect(result.current.settings).toEqual({
                ...defaultSettings,
            });
        });
    });

    describe("initializeSettings", () => {
        it("should initialize settings from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(500);

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await result.current.initializeSettings();
            });

            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();
            expect(result.current.settings.historyLimit).toBe(500);
        });

        it("should handle initialization errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            // Mock rejection instead of incorrect response format
            mockElectronAPI.settings.getHistoryLimit.mockRejectedValueOnce(
                new Error("Backend error")
            );

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

        it("should use error handling wrapper", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should react to history limit updates from backend events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Event Handling", "type");

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(500);

            let capturedHandler:
                | Parameters<ElectronAPI["events"]["onHistoryLimitUpdated"]>[0]
                | undefined;

            mockElectronAPI.events.onHistoryLimitUpdated.mockImplementation(
                (
                    handler: Parameters<
                        ElectronAPI["events"]["onHistoryLimitUpdated"]
                    >[0]
                ) => {
                    capturedHandler = handler;
                    return () => undefined;
                }
            );

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await result.current.initializeSettings();
            });

            expect(capturedHandler).toBeTypeOf("function");

            if (!capturedHandler) {
                throw new Error(
                    "Expected onHistoryLimitUpdated handler to be registered"
                );
            }

            const eventPayload = {
                limit: 650,
                operation: "history-limit-updated" as const,
                previousLimit: 500,
                timestamp: Date.now(),
            };

            await act(async () => {
                capturedHandler!(eventPayload);
            });

            expect(result.current.settings.historyLimit).toBe(650);
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SettingsStore",
                "historyLimitUpdatedEvent",
                {
                    limit: 650,
                    previousLimit: 500,
                    timestamp: eventPayload.timestamp,
                }
            );
        });
    });

    describe("persistHistoryLimit", () => {
        it("should update history limit successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useSettingsStore());

            // Mock backend responses - SettingsService uses data API
            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(2000);

            await act(async () => {
                await result.current.persistHistoryLimit(2000);
            });

            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledWith(2000);
            expect(result.current.settings.historyLimit).toBe(2000);
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SettingsStore",
                "persistHistoryLimit",
                {
                    limit: 2000,
                }
            );
        });

        it("should validate history limit bounds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Validation", "type");

            const { result } = renderHook(() => useSettingsStore());

            // Mock backend to return the same value (no clamping on frontend)
            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(50);

            // Test update with small value
            await act(async () => {
                await result.current.persistHistoryLimit(50);
            });

            expect(result.current.settings.historyLimit).toBe(50); // No clamping in frontend

            // Test large value
            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(
                100_000
            );

            await act(async () => {
                await result.current.persistHistoryLimit(100_000);
            });

            expect(result.current.settings.historyLimit).toBe(100_000); // No clamping in frontend
        });

        it("should handle backend update errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Update failed");

            const { result } = renderHook(() => useSettingsStore());

            // Reset to completely clean state first
            await act(async () => {
                await result.current.resetSettings();
            });

            // Clear any persisted state that might interfere
            act(() => {
                useSettingsStore.persist.clearStorage();
            });

            // Mock getHistoryLimit to return 200 consistently to avoid sync interference
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(200);

            // Set initial value first and wait for it to be set
            await act(async () => {
                result.current.updateSettings({ historyLimit: 200 });
                // Wait long enough for any sync operations to complete
                await new Promise((resolve) => setTimeout(resolve, 150));
            });

            // Verify the initial state is set correctly
            expect(result.current.settings.historyLimit).toBe(200);

            // Now mock the updateHistoryLimit to fail
            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(
                error
            );

            // Attempt update that will fail
            await act(async () => {
                await expect(
                    result.current.persistHistoryLimit(600)
                ).rejects.toThrowError("Update failed");
            });

            // Should be reverted to previous value (200), not the attempted value (600)
            // The error handling should revert to the original value before the failed update
            expect(result.current.settings.historyLimit).toBe(200);
            expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                "settings",
                "Update failed"
            );
        });

        it("should handle all error cases in persistHistoryLimit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

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
                    await result.current.persistHistoryLimit(600);
                } catch {
                    // Expected to throw
                }
            });

            // The error handler should revert to the value that was captured at the start (300)
            expect(result.current.settings.historyLimit).toBe(1000); // Reverted to previous value
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle missing electronAPI gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Temporarily remove electronAPI
            const originalAPI = (globalThis as any).electronAPI;
            (globalThis as any).electronAPI = undefined;

            const { result } = renderHook(() => useSettingsStore());

            try {
                await act(async () => {
                    const result_obj =
                        await result.current.initializeSettings();
                    // Should handle the error gracefully and return fallback result
                    expect(result_obj.success).toBeFalsy();
                    expect(result_obj.message).toBe(
                        "Settings initialized with default values"
                    );
                    expect(result_obj.settingsLoaded).toBeTruthy();
                });
            } finally {
                // Restore electronAPI
                (globalThis as any).electronAPI = originalAPI;
            }
        });

        it("should handle concurrent operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useSettingsStore());

            const promises = [
                result.current.persistHistoryLimit(500),
                result.current.persistHistoryLimit(600),
                result.current.persistHistoryLimit(700),
            ];

            await act(async () => {
                await Promise.allSettled(promises);
            });

            // Should handle concurrent operations without crashing
            expect(result.current.settings.historyLimit).toBeGreaterThan(0);
        });

        it("should handle API errors gracefully", async () => {
            // Reset the mock first to ensure clean state
            mockElectronAPI.settings.getHistoryLimit.mockReset();

            // Make the electronAPI call fail - use mockRejectedValueOnce to limit scope
            mockElectronAPI.settings.getHistoryLimit.mockRejectedValueOnce(
                "Backend error"
            );

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                const result_obj = await result.current.initializeSettings();

                // Should handle the error gracefully and return fallback result
                expect(result_obj.success).toBeFalsy();
                expect(result_obj.message).toBe(
                    "Settings initialized with default values"
                );
                expect(result_obj.settingsLoaded).toBeTruthy();
            });

            // Should use the fallback value (DEFAULT_HISTORY_LIMIT = 500)
            expect(result.current.settings.historyLimit).toBe(500);
        });
    });

    describe("Loading States", () => {
        it("should set loading state during operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Loading", "type");

            const loadingStatesDuringCall: boolean[] = [];

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
                await result.current.persistHistoryLimit(500);
            });

            expect(loadingStatesDuringCall).toEqual([true, false]);
        });
    });

    describe("Error Recovery", () => {
        it("should clear errors when successful operations occur", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await result.current.persistHistoryLimit(500);
            });

            expect(mockErrorStore.clearStoreError).toHaveBeenCalledWith(
                "settings"
            );
        });

        it("should maintain error state until cleared", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Persistent error");
            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(
                error
            );

            const { result } = renderHook(() => useSettingsStore());

            await act(async () => {
                await expect(
                    result.current.persistHistoryLimit(500)
                ).rejects.toThrowError();
            });

            expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                "settings",
                "Persistent error"
            );
        });
    });

    describe("Persistence", () => {
        it("should persist settings across store recreations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result: result1 } = renderHook(() => useSettingsStore());

            act(() => {
                result1.current.updateSettings({ theme: "dark" });
            });

            // Create new hook instance (simulates store recreation)
            const { result: result2 } = renderHook(() => useSettingsStore());

            expect(result2.current.settings.theme).toBe("dark");
        });

        it("should handle store rehydration", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useSettingsStore());

            // Initial state should be properly rehydrated
            expect(result.current.settings).toBeDefined();
            expect(typeof result.current.updateSettings).toBe("function");
            expect(typeof result.current.initializeSettings).toBe("function");
        });
    });

    describe("Action Logging", () => {
        it("should log all store actions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useSettingsStore());

            // Mock backend response for updateHistoryLimit
            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(500);

            await act(async () => {
                await result.current.persistHistoryLimit(500);
            });

            // Check that both persistHistoryLimit and updateSettings are logged
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SettingsStore",
                "persistHistoryLimit",
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

        it("should log initialization actions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() => useSettingsStore());

            // Mock backend response
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(1000);

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
        it("should enforce correct settings structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useSettingsStore());

            act(() => {
                result.current.updateSettings({
                    theme: "dark",
                    historyLimit: 500,
                    inAppAlertsEnabled: true,
                    systemNotificationsEnabled: true,
                    systemNotificationsSoundEnabled: true,
                });
            });

            expect(result.current.settings).toEqual(
                createSettings({
                    historyLimit: 500,
                    inAppAlertsEnabled: true,
                    systemNotificationsEnabled: true,
                    systemNotificationsSoundEnabled: true,
                    theme: "dark",
                })
            );
        });

        it("should handle partial settings updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() => useSettingsStore());

            // Reset to defaults first by manually setting default values
            act(() => {
                result.current.updateSettings(defaultSettings);
            });

            // Now test partial update
            act(() => {
                result.current.updateSettings({ theme: "light" });
            });

            expect(result.current.settings.theme).toBe("light");
            expect(result.current.settings.systemNotificationsEnabled).toBe(
                defaultSettings.systemNotificationsEnabled
            );
            expect(result.current.settings.historyLimit).toBe(500); // Default value
        });
    });

    describe("Property-Based Testing with Fast-Check", () => {
        test.prop([
            fc.record({
                theme: fc.constantFrom("light", "dark", "system"),
                autoStart: fc.boolean(),
                minimizeToTray: fc.boolean(),
                historyLimit: fc.integer({ min: 100, max: 10_000 }),
                inAppAlertsEnabled: fc.boolean(),
                inAppAlertsSoundEnabled: fc.boolean(),
                systemNotificationsEnabled: fc.boolean(),
                systemNotificationsSoundEnabled: fc.boolean(),
            }),
        ])(
            "should handle various settings configurations correctly",
            async (testSettings) => {
                const { result } = renderHook(() => useSettingsStore());

                act(() => {
                    result.current.updateSettings(testSettings);
                });

                expect(result.current.settings.theme).toBe(testSettings.theme);
                expect(result.current.settings.autoStart).toBe(
                    testSettings.autoStart
                );
                expect(result.current.settings.minimizeToTray).toBe(
                    testSettings.minimizeToTray
                );
                expect(result.current.settings.historyLimit).toBe(
                    testSettings.historyLimit
                );
                expect(result.current.settings.inAppAlertsEnabled).toBe(
                    testSettings.inAppAlertsEnabled
                );
                expect(result.current.settings.inAppAlertsSoundEnabled).toBe(
                    testSettings.inAppAlertsSoundEnabled
                );
                expect(result.current.settings.systemNotificationsEnabled).toBe(
                    testSettings.systemNotificationsEnabled
                );
                expect(
                    result.current.settings.systemNotificationsSoundEnabled
                ).toBe(testSettings.systemNotificationsSoundEnabled);

                // Verify setting value constraints
                expect([
                    "light",
                    "dark",
                    "system",
                ]).toContain(testSettings.theme);
                expect(typeof testSettings.autoStart).toBe("boolean");
                expect(typeof testSettings.minimizeToTray).toBe("boolean");
                expect(typeof testSettings.inAppAlertsEnabled).toBe("boolean");
                expect(typeof testSettings.inAppAlertsSoundEnabled).toBe(
                    "boolean"
                );
                expect(typeof testSettings.systemNotificationsEnabled).toBe(
                    "boolean"
                );
                expect(
                    typeof testSettings.systemNotificationsSoundEnabled
                ).toBe("boolean");
                expect(testSettings.historyLimit).toBeGreaterThanOrEqual(100);
                expect(testSettings.historyLimit).toBeLessThanOrEqual(10_000);
            }
        );

        test.prop([
            fc.array(
                fc.oneof(
                    fc.record({
                        setting: fc.constant("theme"),
                        value: fc.constantFrom("light", "dark", "system"),
                    }),
                    fc.record({
                        setting: fc.constant("autoStart"),
                        value: fc.boolean(),
                    }),
                    fc.record({
                        setting: fc.constant("minimizeToTray"),
                        value: fc.boolean(),
                    }),
                    fc.record({
                        setting: fc.constant("inAppAlertsEnabled"),
                        value: fc.boolean(),
                    }),
                    fc.record({
                        setting: fc.constant("inAppAlertsSoundEnabled"),
                        value: fc.boolean(),
                    }),
                    fc.record({
                        setting: fc.constant("systemNotificationsEnabled"),
                        value: fc.boolean(),
                    }),
                    fc.record({
                        setting: fc.constant("systemNotificationsSoundEnabled"),
                        value: fc.boolean(),
                    }),
                    fc.record({
                        setting: fc.constant("historyLimit"),
                        value: fc.integer({ min: 50, max: 20_000 }),
                    })
                ),
                { minLength: 1, maxLength: 6 }
            ),
        ])(
            "should handle sequential setting updates correctly",
            async (settingUpdates) => {
                const { result } = renderHook(() => useSettingsStore());
                const finalExpectedState: any = {};

                for (const update of settingUpdates) {
                    const partialSettings: any = {
                        [update.setting]: update.value,
                    };
                    finalExpectedState[update.setting] = update.value;

                    act(() => {
                        result.current.updateSettings(partialSettings);
                    });
                }

                // Check that the final state contains all the updates
                for (const [setting, expectedValue] of Object.entries(
                    finalExpectedState
                )) {
                    expect((result.current.settings as any)[setting]).toBe(
                        expectedValue
                    );
                }

                // Verify updates array properties
                expect(Array.isArray(settingUpdates)).toBeTruthy();
                expect(settingUpdates.length).toBeGreaterThanOrEqual(1);
                expect(settingUpdates.length).toBeLessThanOrEqual(6);
                for (const update of settingUpdates) {
                    expect([
                        "theme",
                        "autoStart",
                        "minimizeToTray",
                        "inAppAlertsEnabled",
                        "inAppAlertsSoundEnabled",
                        "systemNotificationsEnabled",
                        "systemNotificationsSoundEnabled",
                        "historyLimit",
                    ]).toContain(update.setting);
                }
            }
        );

        test.prop([fc.boolean()])(
            "should handle boolean settings appropriately",
            async (boolValue) => {
                const { result } = renderHook(() => useSettingsStore());

                // Test each boolean setting
                const booleanSettings = [
                    "autoStart",
                    "minimizeToTray",
                    "inAppAlertsEnabled",
                    "inAppAlertsSoundEnabled",
                    "systemNotificationsEnabled",
                    "systemNotificationsSoundEnabled",
                ];

                for (const settingName of booleanSettings) {
                    act(() => {
                        result.current.updateSettings({
                            [settingName]: boolValue,
                        });
                    });

                    expect((result.current.settings as any)[settingName]).toBe(
                        boolValue
                    );
                    expect(
                        typeof (result.current.settings as any)[settingName]
                    ).toBe("boolean");
                }

                // Verify boolean properties
                expect(typeof boolValue).toBe("boolean");
            }
        );

        test.prop([fc.integer({ min: 0, max: 50_000 })])(
            "should handle various history limit values correctly",
            async (historyLimit) => {
                const { result } = renderHook(() => useSettingsStore());

                act(() => {
                    result.current.updateSettings({ historyLimit });
                });

                expect(result.current.settings.historyLimit).toBe(historyLimit);
                expect(typeof result.current.settings.historyLimit).toBe(
                    "number"
                );

                // Verify history limit properties
                expect(historyLimit).toBeGreaterThanOrEqual(0);
                expect(historyLimit).toBeLessThanOrEqual(50_000);
                expect(Number.isInteger(historyLimit)).toBeTruthy();
            }
        );

        test.prop([
            fc.oneof(
                fc.record({
                    theme: fc.constantFrom("light", "dark", "system"),
                    autoStart: fc.boolean(),
                }),
                fc.record({
                    inAppAlertsEnabled: fc.boolean(),
                    inAppAlertsSoundEnabled: fc.boolean(),
                }),
                fc.record({
                    systemNotificationsEnabled: fc.boolean(),
                    systemNotificationsSoundEnabled: fc.boolean(),
                    historyLimit: fc.integer({ min: 1, max: 5000 }),
                }),
                fc.record({
                    minimizeToTray: fc.boolean(),
                })
            ),
        ])(
            "should handle partial settings updates correctly",
            async (partialSettings) => {
                const { result } = renderHook(() => useSettingsStore());

                // Get initial state
                const initialSettings = { ...result.current.settings };

                act(() => {
                    result.current.updateSettings(partialSettings);
                });

                // Check that updated fields have new values
                for (const [key, value] of Object.entries(partialSettings)) {
                    expect((result.current.settings as any)[key]).toBe(value);
                }

                // Check that non-updated fields remain unchanged
                for (const [key, initialValue] of Object.entries(
                    initialSettings
                )) {
                    if (!(key in partialSettings)) {
                        expect((result.current.settings as any)[key]).toBe(
                            initialValue
                        );
                    }
                }

                // Verify partial settings properties
                expect(typeof partialSettings).toBe("object");
                expect(partialSettings).not.toBeNull();
            }
        );

        test.prop([fc.integer({ min: 1, max: 10 })])(
            "should handle multiple rapid updates correctly",
            async (updateCount) => {
                const { result } = renderHook(() => useSettingsStore());
                const updates: boolean[] = [];

                for (let i = 0; i < updateCount; i++) {
                    const newValue = i % 2 === 0;
                    updates.push(newValue);

                    act(() => {
                        result.current.updateSettings({
                            systemNotificationsEnabled: newValue,
                        });
                    });
                }

                // Final state should match the last update
                const expectedFinalValue = updates.at(-1);
                expect(result.current.settings.systemNotificationsEnabled).toBe(
                    expectedFinalValue
                );

                // Verify update count properties
                expect(updateCount).toBeGreaterThanOrEqual(1);
                expect(updateCount).toBeLessThanOrEqual(10);
                expect(updates).toHaveLength(updateCount);
            }
        );

        test.prop([
            fc.record({
                validSettings: fc.record({
                    theme: fc.constantFrom("light", "dark", "system"),
                    historyLimit: fc.integer({ min: 100, max: 5000 }),
                    inAppAlertsEnabled: fc.boolean(),
                    inAppAlertsSoundEnabled: fc.boolean(),
                    systemNotificationsEnabled: fc.boolean(),
                    systemNotificationsSoundEnabled: fc.boolean(),
                }),
                invalidAttempts: fc.array(
                    fc.record({
                        invalidKey: fc.string({ maxLength: 20 }),
                        invalidValue: fc.oneof(
                            fc.string(),
                            fc.integer(),
                            fc.boolean(),
                            fc.constant(null)
                        ),
                    }),
                    { maxLength: 3 }
                ),
            }),
        ])(
            "should handle mixed valid and invalid settings gracefully",
            async ({ validSettings, invalidAttempts }) => {
                const { result } = renderHook(() => useSettingsStore());

                // Apply valid settings first
                act(() => {
                    result.current.updateSettings(validSettings);
                });

                expect(result.current.settings.theme).toBe(validSettings.theme);
                expect(result.current.settings.inAppAlertsEnabled).toBe(
                    validSettings.inAppAlertsEnabled
                );
                expect(result.current.settings.inAppAlertsSoundEnabled).toBe(
                    validSettings.inAppAlertsSoundEnabled
                );
                expect(result.current.settings.systemNotificationsEnabled).toBe(
                    validSettings.systemNotificationsEnabled
                );
                expect(
                    result.current.settings.systemNotificationsSoundEnabled
                ).toBe(validSettings.systemNotificationsSoundEnabled);
                expect(result.current.settings.historyLimit).toBe(
                    validSettings.historyLimit
                );

                // Attempt invalid updates (should not break the store)
                for (const invalidAttempt of invalidAttempts) {
                    expect(() => {
                        act(() => {
                            result.current.updateSettings({
                                [invalidAttempt.invalidKey]:
                                    invalidAttempt.invalidValue,
                            } as any);
                        });
                    }).not.toThrowError();
                }

                // Valid settings should still be intact
                expect(result.current.settings.theme).toBe(validSettings.theme);
                expect(result.current.settings.inAppAlertsEnabled).toBe(
                    validSettings.inAppAlertsEnabled
                );
                expect(result.current.settings.inAppAlertsSoundEnabled).toBe(
                    validSettings.inAppAlertsSoundEnabled
                );
                expect(result.current.settings.systemNotificationsEnabled).toBe(
                    validSettings.systemNotificationsEnabled
                );
                expect(
                    result.current.settings.systemNotificationsSoundEnabled
                ).toBe(validSettings.systemNotificationsSoundEnabled);
                expect(result.current.settings.historyLimit).toBe(
                    validSettings.historyLimit
                );

                // Verify mixed settings properties
                expect(typeof validSettings).toBe("object");
                expect(Array.isArray(invalidAttempts)).toBeTruthy();
                expect(invalidAttempts.length).toBeLessThanOrEqual(3);
            }
        );

        test.prop([fc.constantFrom("light", "dark", "system")])(
            "should handle theme switching correctly",
            async (themeValue) => {
                const { result } = renderHook(() => useSettingsStore());

                act(() => {
                    result.current.updateSettings({ theme: themeValue });
                });

                expect(result.current.settings.theme).toBe(themeValue);
                expect([
                    "light",
                    "dark",
                    "system",
                ]).toContain(result.current.settings.theme);

                // Verify theme value properties
                expect(typeof themeValue).toBe("string");
                expect([
                    "light",
                    "dark",
                    "system",
                ]).toContain(themeValue);
            }
        );

        test.prop([
            fc
                .tuple(
                    fc.record({
                        theme: fc.constantFrom("light"),
                        autoStart: fc.boolean(),
                        systemNotificationsEnabled: fc.boolean(),
                    }),
                    fc.record({
                        theme: fc.constantFrom("dark", "system"),
                        minimizeToTray: fc.boolean(),
                        historyLimit: fc.integer({ min: 200, max: 2000 }),
                    })
                )
                .chain(([settingsA, settingsB]) =>
                    fc.constant({ settingsA, settingsB })
                ),
        ])(
            "should handle overlapping settings updates correctly",
            async ({ settingsA, settingsB }) => {
                const { result } = renderHook(() => useSettingsStore());

                // Apply first set of settings
                act(() => {
                    result.current.updateSettings(settingsA);
                });

                expect(result.current.settings.theme).toBe(settingsA.theme);
                expect(result.current.settings.autoStart).toBe(
                    settingsA.autoStart
                );
                expect(result.current.settings.systemNotificationsEnabled).toBe(
                    settingsA.systemNotificationsEnabled
                );

                // Apply overlapping second set
                act(() => {
                    result.current.updateSettings(settingsB);
                });

                // Theme should be updated to settingsB value
                expect(result.current.settings.theme).toBe(settingsB.theme);
                // Non-overlapping fields from settingsA should remain
                expect(result.current.settings.autoStart).toBe(
                    settingsA.autoStart
                );
                expect(result.current.settings.systemNotificationsEnabled).toBe(
                    settingsA.systemNotificationsEnabled
                );
                // New fields from settingsB should be set
                expect(result.current.settings.minimizeToTray).toBe(
                    settingsB.minimizeToTray
                );
                expect(result.current.settings.historyLimit).toBe(
                    settingsB.historyLimit
                );

                // Verify overlapping settings properties
                expect(typeof settingsA).toBe("object");
                expect(typeof settingsB).toBe("object");
                expect(settingsA.theme).not.toBe(settingsB.theme); // Should be different to test overlap
            }
        );
    });
});
