/**
 * Comprehensive tests for useSettingsStore. Tests all store actions, state
 * management, and persistence.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import type { AppSettings } from "../stores/types";

import {
    defaultSettings,
    normalizeAppSettings,
} from "../stores/settings/state";
import fc from "fast-check";
import { useSettingsStore } from "../stores/settings/useSettingsStore";

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

vi.mock("../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

// Mock electron API - Updated to match new domain-based structure
const mockElectronAPI = {
    data: {},
    settings: {
        getHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
        updateHistoryLimit: vi.fn(),
    },
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock utils
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn((asyncFn, handlers) =>
        asyncFn().catch((error: Error) => {
            handlers.setError(error);
            throw error;
        })
    ),
}));

// Mock useErrorStore
vi.mock("../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => ({
            clearStoreError: vi.fn(),
            setOperationLoading: vi.fn(),
            setStoreError: vi.fn(),
        })),
    },
}));

// Mock constants
vi.mock("../constants", () => ({
    DEFAULT_HISTORY_LIMIT: 100,
}));

describe(useSettingsStore, () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWaitForElectronBridge.mockResolvedValue(undefined);
        // Reset store state to defaults
        useSettingsStore.setState({
            settings: {
                autoStart: false,
                historyLimit: 100,
                inAppAlertsEnabled: true,
                inAppAlertsSoundEnabled: false,
                inAppAlertVolume: 1,
                minimizeToTray: true,
                systemNotificationsEnabled: false,
                systemNotificationsSoundEnabled: false,
                theme: "system",
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("State Management", () => {
        it("should initialize with default settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            const state = useSettingsStore.getState();
            expect(state.settings).toEqual({
                autoStart: false,
                historyLimit: 100,
                inAppAlertsEnabled: true,
                inAppAlertsSoundEnabled: false,
                inAppAlertVolume: 1,
                minimizeToTray: true,
                systemNotificationsEnabled: false,
                systemNotificationsSoundEnabled: false,
                theme: "system",
            });
        });

        it("should update settings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const updates: Partial<AppSettings> = {
                inAppAlertsEnabled: false,
                inAppAlertsSoundEnabled: true,
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: true,
                theme: "dark",
            };

            useSettingsStore.getState().updateSettings(updates);

            const state = useSettingsStore.getState();
            expect(state.settings.inAppAlertsEnabled).toBeFalsy();
            expect(state.settings.inAppAlertsSoundEnabled).toBeTruthy();
            expect(state.settings.systemNotificationsEnabled).toBeTruthy();
            expect(state.settings.systemNotificationsSoundEnabled).toBeTruthy();
            expect(state.settings.theme).toBe("dark");
            expect(state.settings.autoStart).toBeFalsy(); // Unchanged
        });

        it("should reset settings to defaults", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Configure mocks for reset operation
            mockElectronAPI.settings.resetSettings.mockResolvedValue({
                success: true,
                message: "Settings reset successfully",
            });
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(100);

            // First modify settings
            useSettingsStore.getState().updateSettings({
                inAppAlertsEnabled: false,
                inAppAlertsSoundEnabled: true,
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: true,
                theme: "dark",
            });

            // Then reset (await the async operation)
            await useSettingsStore.getState().resetSettings();

            const state = useSettingsStore.getState();
            expect(state.settings).toEqual({
                autoStart: false,
                historyLimit: 100,
                inAppAlertVolume: 1,
                inAppAlertsEnabled: true,
                inAppAlertsSoundEnabled: false,
                minimizeToTray: true,
                systemNotificationsEnabled: false,
                systemNotificationsSoundEnabled: false,
                theme: "system",
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
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(250);

            await useSettingsStore.getState().initializeSettings();

            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(250);
        });

        it("should handle initialization errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            mockElectronAPI.settings.getHistoryLimit.mockRejectedValue(
                new Error("Backend error")
            );

            const result = await useSettingsStore
                .getState()
                .initializeSettings();

            // Should handle error gracefully and return fallback result
            expect(result.success).toBeFalsy();
            expect(result.message).toBe(
                "Settings initialized with default values"
            );
            expect(result.settingsLoaded).toBeTruthy();
        });
    });

    describe("Setting Individual Properties", () => {
        it("should update autoStart via updateSettings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            useSettingsStore.getState().updateSettings({ autoStart: true });

            const state = useSettingsStore.getState();
            expect(state.settings.autoStart).toBeTruthy();
        });

        it("should update historyLimit via updateSettings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            useSettingsStore.getState().updateSettings({ historyLimit: 500 });

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(500);
        });

        it("should update minimizeToTray via updateSettings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            useSettingsStore
                .getState()
                .updateSettings({ minimizeToTray: false });

            const state = useSettingsStore.getState();
            expect(state.settings.minimizeToTray).toBeFalsy();
        });

        it("should update systemNotificationsEnabled via updateSettings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            useSettingsStore
                .getState()
                .updateSettings({ systemNotificationsEnabled: false });

            const state = useSettingsStore.getState();
            expect(state.settings.systemNotificationsEnabled).toBeFalsy();
        });

        it("should update systemNotificationsSoundEnabled via updateSettings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            useSettingsStore.getState().updateSettings({
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: true,
            });

            const state = useSettingsStore.getState();
            expect(state.settings.systemNotificationsSoundEnabled).toBeTruthy();
        });

        it("should update theme via updateSettings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            useSettingsStore.getState().updateSettings({ theme: "dark" });

            const state = useSettingsStore.getState();
            expect(state.settings.theme).toBe("dark");
        });
    });

    describe("persistHistoryLimit", () => {
        it("should update history limit with backend sync", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(300);

            await useSettingsStore.getState().persistHistoryLimit(300);

            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledWith(300);
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).not.toHaveBeenCalled();

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(300);
        });

        it("should handle backend errors when updating history limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(
                new Error("Backend error")
            );

            await expect(
                useSettingsStore.getState().persistHistoryLimit(300)
            ).rejects.toThrowError("Backend error");
        });
    });

    describe("Persistence", () => {
        it("should persist settings changes", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const originalSettings = useSettingsStore.getState().settings;

            useSettingsStore.getState().updateSettings({
                systemNotificationsEnabled: false,
                theme: "dark",
            });

            // In a real scenario, the zustand persist middleware would save to localStorage
            // Here we just verify the state was updated
            const state = useSettingsStore.getState();
            expect(state.settings.theme).toBe("dark");
            expect(state.settings.systemNotificationsEnabled).toBeFalsy();
            expect(state.settings.autoStart).toBe(originalSettings.autoStart);
        });
    });

    describe("Edge Cases", () => {
        it("should handle partial updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const originalSettings = useSettingsStore.getState().settings;

            useSettingsStore
                .getState()
                .updateSettings({ systemNotificationsEnabled: false });

            const state = useSettingsStore.getState();
            expect(state.settings.systemNotificationsEnabled).toBeFalsy();
            // All other settings should remain unchanged
            expect(state.settings.autoStart).toBe(originalSettings.autoStart);
            expect(state.settings.historyLimit).toBe(
                originalSettings.historyLimit
            );
            expect(state.settings.minimizeToTray).toBe(
                originalSettings.minimizeToTray
            );
            expect(state.settings.systemNotificationsSoundEnabled).toBe(
                originalSettings.systemNotificationsSoundEnabled
            );
            expect(state.settings.theme).toBe(originalSettings.theme);
        });

        it("should handle empty updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const originalSettings = useSettingsStore.getState().settings;

            useSettingsStore.getState().updateSettings({});

            const state = useSettingsStore.getState();
            expect(state.settings).toEqual(originalSettings);
        });

        it("should handle invalid theme values gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // TypeScript would prevent this, but testing runtime behavior
            useSettingsStore.getState().updateSettings({
                theme: "invalid-theme" as never,
            });

            const state = useSettingsStore.getState();
            expect(state.settings.theme).toBe("invalid-theme");
        });

        it("should handle negative historyLimit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            useSettingsStore.getState().updateSettings({ historyLimit: -10 });

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(-10);
        });

        it("should handle zero historyLimit", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            useSettingsStore.getState().updateSettings({ historyLimit: 0 });

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(0);
        });

        it("normalizes arbitrary persisted volume values into the safe interval", () => {
            fc.assert(
                fc.property(fc.anything(), (rawValue) => {
                    const normalized = normalizeAppSettings({
                        inAppAlertVolume: rawValue as unknown as number,
                    });

                    expect(normalized.inAppAlertVolume).toBeGreaterThanOrEqual(
                        0
                    );
                    expect(normalized.inAppAlertVolume).toBeLessThanOrEqual(1);
                })
            );
        });

        it("should handle very large historyLimit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            useSettingsStore
                .getState()
                .updateSettings({ historyLimit: 999_999 });

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(999_999);
        });
    });

    describe("Store Behavior", () => {
        it("should maintain state across multiple calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            useSettingsStore.getState().updateSettings({ autoStart: true });
            useSettingsStore
                .getState()
                .updateSettings({ systemNotificationsEnabled: false });
            useSettingsStore.getState().updateSettings({ theme: "dark" });

            const state = useSettingsStore.getState();
            expect(state.settings.autoStart).toBeTruthy();
            expect(state.settings.systemNotificationsEnabled).toBeFalsy();
            expect(state.settings.theme).toBe("dark");
        });

        it("should allow chaining updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const store = useSettingsStore.getState();

            store.updateSettings({ autoStart: true });
            store.updateSettings({ systemNotificationsEnabled: false });
            store.updateSettings({ theme: "light" });
            store.updateSettings({ historyLimit: 200 });

            const state = useSettingsStore.getState();
            expect(state.settings.autoStart).toBeTruthy();
            expect(state.settings.systemNotificationsEnabled).toBeFalsy();
            expect(state.settings.theme).toBe("light");
            expect(state.settings.historyLimit).toBe(200);
        });
    });

    describe("Type Safety", () => {
        it("should accept valid theme values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const validThemes = [
                "system",
                "light",
                "dark",
            ] as const;

            for (const theme of validThemes) {
                useSettingsStore.getState().updateSettings({ theme });
                const state = useSettingsStore.getState();
                expect(state.settings.theme).toBe(theme);
            }
        });

        it("should handle boolean settings correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const store = useSettingsStore.getState();

            // Test autoStart
            store.updateSettings({ autoStart: true });
            expect(useSettingsStore.getState().settings.autoStart).toBeTruthy();
            store.updateSettings({ autoStart: false });
            expect(useSettingsStore.getState().settings.autoStart).toBeFalsy();

            // Test minimizeToTray
            store.updateSettings({ minimizeToTray: true });
            expect(
                useSettingsStore.getState().settings.minimizeToTray
            ).toBeTruthy();
            store.updateSettings({ minimizeToTray: false });
            expect(
                useSettingsStore.getState().settings.minimizeToTray
            ).toBeFalsy();

            // Test system notifications
            store.updateSettings({ systemNotificationsEnabled: true });
            expect(
                useSettingsStore.getState().settings.systemNotificationsEnabled
            ).toBeTruthy();
            store.updateSettings({ systemNotificationsEnabled: false });
            expect(
                useSettingsStore.getState().settings.systemNotificationsEnabled
            ).toBeFalsy();

            // Test in-app alerts toggle
            store.updateSettings({ inAppAlertsEnabled: false });
            expect(
                useSettingsStore.getState().settings.inAppAlertsEnabled
            ).toBeFalsy();
            store.updateSettings({ inAppAlertsEnabled: true });
            expect(
                useSettingsStore.getState().settings.inAppAlertsEnabled
            ).toBeTruthy();

            // Test system notification sounds
            store.updateSettings({
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: true,
            });
            expect(
                useSettingsStore.getState().settings
                    .systemNotificationsSoundEnabled
            ).toBeTruthy();
            store.updateSettings({ systemNotificationsSoundEnabled: false });
            expect(
                useSettingsStore.getState().settings
                    .systemNotificationsSoundEnabled
            ).toBeFalsy();

            // Test in-app alert sounds
            store.updateSettings({ inAppAlertsSoundEnabled: true });
            expect(
                useSettingsStore.getState().settings.inAppAlertsSoundEnabled
            ).toBeTruthy();
            store.updateSettings({ inAppAlertsSoundEnabled: false });
            expect(
                useSettingsStore.getState().settings.inAppAlertsSoundEnabled
            ).toBeFalsy();
        });
    });

    describe("normalizeAppSettings migration", () => {
        it("maps legacy notifications flag to system notification toggle", () => {
            const normalized = normalizeAppSettings({ notifications: true });

            expect(normalized.systemNotificationsEnabled).toBeTruthy();
            expect(normalized.inAppAlertsEnabled).toBe(
                defaultSettings.inAppAlertsEnabled
            );
        });

        it("propagates legacy soundAlerts flag to both sound toggles", () => {
            const normalized = normalizeAppSettings({ soundAlerts: true });

            expect(normalized.inAppAlertsSoundEnabled).toBeTruthy();
            expect(normalized.systemNotificationsSoundEnabled).toBeTruthy();
        });

        it("respects explicit overrides when migrating legacy fields", () => {
            const normalized = normalizeAppSettings({
                notifications: false,
                soundAlerts: true,
                systemNotificationsEnabled: true,
            });

            expect(normalized.systemNotificationsEnabled).toBeTruthy();
            expect(normalized.inAppAlertsSoundEnabled).toBeTruthy();
            expect(normalized.systemNotificationsSoundEnabled).toBeTruthy();
        });
        it("should clamp persisted in-app alert volume values", () => {
            const loud = normalizeAppSettings({ inAppAlertVolume: 2 });
            const muted = normalizeAppSettings({ inAppAlertVolume: -0.5 });
            const stringValue = normalizeAppSettings({
                inAppAlertVolume: "0.25" as unknown as number,
            });

            expect(loud.inAppAlertVolume).toBe(1);
            expect(muted.inAppAlertVolume).toBe(0);
            expect(stringValue.inAppAlertVolume).toBeCloseTo(0.25, 5);
        });
    });
});
