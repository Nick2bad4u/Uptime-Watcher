/**
 * Comprehensive tests for useSettingsStore. Tests all store actions, state
 * management, and persistence.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import type { AppSettings } from "../stores/types";

import { useSettingsStore } from "../stores/settings/useSettingsStore";

// Mock electron API
const mockElectronAPI = {
    settings: {
        getHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
        setHistoryLimit: vi.fn(),
        updateHistoryLimit: vi.fn(), // Add missing method
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
        // Reset store state to defaults
        useSettingsStore.setState({
            settings: {
                autoStart: false,
                historyLimit: 100,
                minimizeToTray: true,
                notifications: true,
                soundAlerts: false,
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
                minimizeToTray: true,
                notifications: true,
                soundAlerts: false,
                theme: "system",
            });
        });

        it("should update settings", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const updates: Partial<AppSettings> = {
                notifications: false,
                soundAlerts: true,
                theme: "dark",
            };

            useSettingsStore.getState().updateSettings(updates);

            const state = useSettingsStore.getState();
            expect(state.settings.notifications).toBeFalsy();
            expect(state.settings.soundAlerts).toBeTruthy();
            expect(state.settings.theme).toBe("dark");
            expect(state.settings.autoStart).toBeFalsy(); // unchanged
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
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 100,
            });

            // First modify settings
            useSettingsStore.getState().updateSettings({
                notifications: false,
                soundAlerts: true,
                theme: "dark",
            });

            // Then reset (await the async operation)
            await useSettingsStore.getState().resetSettings();

            const state = useSettingsStore.getState();
            expect(state.settings).toEqual({
                autoStart: false,
                historyLimit: 100,
                minimizeToTray: true,
                notifications: true,
                soundAlerts: false,
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

            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 250,
            });

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

            await expect(
                useSettingsStore.getState().initializeSettings()
            ).rejects.toThrow("Backend error");
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

        it("should update notifications via updateSettings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            useSettingsStore
                .getState()
                .updateSettings({ notifications: false });

            const state = useSettingsStore.getState();
            expect(state.settings.notifications).toBeFalsy();
        });

        it("should update soundAlerts via updateSettings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            useSettingsStore.getState().updateSettings({ soundAlerts: true });

            const state = useSettingsStore.getState();
            expect(state.settings.soundAlerts).toBeTruthy();
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

    describe("updateHistoryLimitValue", () => {
        it("should update history limit with backend sync", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(
                undefined
            );
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue({
                success: true,
                data: 300,
            });

            await useSettingsStore.getState().updateHistoryLimitValue(300);

            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledWith(300);
            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();

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
                useSettingsStore.getState().updateHistoryLimitValue(300)
            ).rejects.toThrow("Backend error");
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
                notifications: false,
                theme: "dark",
            });

            // In a real scenario, the zustand persist middleware would save to localStorage
            // Here we just verify the state was updated
            const state = useSettingsStore.getState();
            expect(state.settings.theme).toBe("dark");
            expect(state.settings.notifications).toBeFalsy();
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

            useSettingsStore.getState().updateSettings({
                notifications: false,
            });

            const state = useSettingsStore.getState();
            expect(state.settings.notifications).toBeFalsy();
            // All other settings should remain unchanged
            expect(state.settings.autoStart).toBe(originalSettings.autoStart);
            expect(state.settings.historyLimit).toBe(
                originalSettings.historyLimit
            );
            expect(state.settings.minimizeToTray).toBe(
                originalSettings.minimizeToTray
            );
            expect(state.settings.soundAlerts).toBe(
                originalSettings.soundAlerts
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
                .updateSettings({ notifications: false });
            useSettingsStore.getState().updateSettings({ theme: "dark" });

            const state = useSettingsStore.getState();
            expect(state.settings.autoStart).toBeTruthy();
            expect(state.settings.notifications).toBeFalsy();
            expect(state.settings.theme).toBe("dark");
        });

        it("should allow chaining updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSettingsStore", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const store = useSettingsStore.getState();

            store.updateSettings({ autoStart: true });
            store.updateSettings({ notifications: false });
            store.updateSettings({ theme: "light" });
            store.updateSettings({ historyLimit: 200 });

            const state = useSettingsStore.getState();
            expect(state.settings.autoStart).toBeTruthy();
            expect(state.settings.notifications).toBeFalsy();
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
            expect(useSettingsStore.getState().settings.minimizeToTray).toBeTruthy(
                
            );
            store.updateSettings({ minimizeToTray: false });
            expect(useSettingsStore.getState().settings.minimizeToTray).toBeFalsy(
                
            );

            // Test notifications
            store.updateSettings({ notifications: true });
            expect(useSettingsStore.getState().settings.notifications).toBeTruthy(
                
            );
            store.updateSettings({ notifications: false });
            expect(useSettingsStore.getState().settings.notifications).toBeFalsy(
                
            );

            // Test soundAlerts
            store.updateSettings({ soundAlerts: true });
            expect(useSettingsStore.getState().settings.soundAlerts).toBeTruthy();
            store.updateSettings({ soundAlerts: false });
            expect(useSettingsStore.getState().settings.soundAlerts).toBeFalsy(
                
            );
        });
    });
});
