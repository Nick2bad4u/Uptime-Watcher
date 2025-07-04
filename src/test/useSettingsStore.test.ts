/**
 * Comprehensive tests for useSettingsStore.
 * Tests all store actions, state management, and persistence.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useSettingsStore } from "../stores/settings/useSettingsStore";
import type { AppSettings } from "../stores/types";

// Mock electron API
const mockElectronAPI = {
    settings: {
        getHistoryLimit: vi.fn(),
        setHistoryLimit: vi.fn(),
        updateHistoryLimit: vi.fn(), // Add missing method
        resetSettings: vi.fn(),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock utils
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn((asyncFn, handlers) => {
        return asyncFn().catch((error: Error) => {
            handlers.setError(error);
            throw error;
        });
    }),
}));

// Mock useErrorStore
vi.mock("../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => ({
            clearStoreError: vi.fn(),
            setStoreError: vi.fn(),
            setOperationLoading: vi.fn(),
        })),
    },
}));

// Mock constants
vi.mock("../constants", () => ({
    DEFAULT_HISTORY_LIMIT: 100,
}));

describe("useSettingsStore", () => {
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
        it("should initialize with default settings", () => {
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

        it("should update settings", () => {
            const updates: Partial<AppSettings> = {
                notifications: false,
                soundAlerts: true,
                theme: "dark",
            };

            useSettingsStore.getState().updateSettings(updates);

            const state = useSettingsStore.getState();
            expect(state.settings.notifications).toBe(false);
            expect(state.settings.soundAlerts).toBe(true);
            expect(state.settings.theme).toBe("dark");
            expect(state.settings.autoStart).toBe(false); // unchanged
        });

        it("should reset settings to defaults", () => {
            // First modify settings
            useSettingsStore.getState().updateSettings({
                notifications: false,
                soundAlerts: true,
                theme: "dark",
            });

            // Then reset
            useSettingsStore.getState().resetSettings();

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
        it("should initialize settings from backend", async () => {
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(250);

            await useSettingsStore.getState().initializeSettings();

            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(250);
        });

        it("should handle initialization errors", async () => {
            mockElectronAPI.settings.getHistoryLimit.mockRejectedValue(new Error("Backend error"));

            await expect(useSettingsStore.getState().initializeSettings()).rejects.toThrow("Backend error");
        });
    });

    describe("Setting Individual Properties", () => {
        it("should update autoStart via updateSettings", () => {
            useSettingsStore.getState().updateSettings({ autoStart: true });

            const state = useSettingsStore.getState();
            expect(state.settings.autoStart).toBe(true);
        });

        it("should update historyLimit via updateSettings", () => {
            useSettingsStore.getState().updateSettings({ historyLimit: 500 });

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(500);
        });

        it("should update minimizeToTray via updateSettings", () => {
            useSettingsStore.getState().updateSettings({ minimizeToTray: false });

            const state = useSettingsStore.getState();
            expect(state.settings.minimizeToTray).toBe(false);
        });

        it("should update notifications via updateSettings", () => {
            useSettingsStore.getState().updateSettings({ notifications: false });

            const state = useSettingsStore.getState();
            expect(state.settings.notifications).toBe(false);
        });

        it("should update soundAlerts via updateSettings", () => {
            useSettingsStore.getState().updateSettings({ soundAlerts: true });

            const state = useSettingsStore.getState();
            expect(state.settings.soundAlerts).toBe(true);
        });

        it("should update theme via updateSettings", () => {
            useSettingsStore.getState().updateSettings({ theme: "dark" });

            const state = useSettingsStore.getState();
            expect(state.settings.theme).toBe("dark");
        });
    });

    describe("updateHistoryLimitValue", () => {
        it("should update history limit with backend sync", async () => {
            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(undefined);
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(300);

            await useSettingsStore.getState().updateHistoryLimitValue(300);

            expect(mockElectronAPI.settings.updateHistoryLimit).toHaveBeenCalledWith(300);
            expect(mockElectronAPI.settings.getHistoryLimit).toHaveBeenCalled();

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(300);
        });

        it("should handle backend errors when updating history limit", async () => {
            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(new Error("Backend error"));

            await expect(useSettingsStore.getState().updateHistoryLimitValue(300)).rejects.toThrow("Backend error");
        });
    });

    describe("Persistence", () => {
        it("should persist settings changes", () => {
            const originalSettings = useSettingsStore.getState().settings;
            
            useSettingsStore.getState().updateSettings({
                theme: "dark",
                notifications: false,
            });

            // In a real scenario, the zustand persist middleware would save to localStorage
            // Here we just verify the state was updated
            const state = useSettingsStore.getState();
            expect(state.settings.theme).toBe("dark");
            expect(state.settings.notifications).toBe(false);
            expect(state.settings.autoStart).toBe(originalSettings.autoStart);
        });
    });

    describe("Edge Cases", () => {
        it("should handle partial updates", () => {
            const originalSettings = useSettingsStore.getState().settings;
            
            useSettingsStore.getState().updateSettings({
                notifications: false,
            });

            const state = useSettingsStore.getState();
            expect(state.settings.notifications).toBe(false);
            // All other settings should remain unchanged
            expect(state.settings.autoStart).toBe(originalSettings.autoStart);
            expect(state.settings.historyLimit).toBe(originalSettings.historyLimit);
            expect(state.settings.minimizeToTray).toBe(originalSettings.minimizeToTray);
            expect(state.settings.soundAlerts).toBe(originalSettings.soundAlerts);
            expect(state.settings.theme).toBe(originalSettings.theme);
        });

        it("should handle empty updates", () => {
            const originalSettings = useSettingsStore.getState().settings;
            
            useSettingsStore.getState().updateSettings({});

            const state = useSettingsStore.getState();
            expect(state.settings).toEqual(originalSettings);
        });

        it("should handle invalid theme values gracefully", () => {
            // TypeScript would prevent this, but testing runtime behavior
            useSettingsStore.getState().updateSettings({
                theme: "invalid-theme" as never,
            });

            const state = useSettingsStore.getState();
            expect(state.settings.theme).toBe("invalid-theme");
        });

        it("should handle negative historyLimit", () => {
            useSettingsStore.getState().updateSettings({ historyLimit: -10 });

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(-10);
        });

        it("should handle zero historyLimit", () => {
            useSettingsStore.getState().updateSettings({ historyLimit: 0 });

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(0);
        });

        it("should handle very large historyLimit", () => {
            useSettingsStore.getState().updateSettings({ historyLimit: 999999 });

            const state = useSettingsStore.getState();
            expect(state.settings.historyLimit).toBe(999999);
        });
    });

    describe("Store Behavior", () => {
        it("should maintain state across multiple calls", () => {
            useSettingsStore.getState().updateSettings({ autoStart: true });
            useSettingsStore.getState().updateSettings({ notifications: false });
            useSettingsStore.getState().updateSettings({ theme: "dark" });

            const state = useSettingsStore.getState();
            expect(state.settings.autoStart).toBe(true);
            expect(state.settings.notifications).toBe(false);
            expect(state.settings.theme).toBe("dark");
        });

        it("should allow chaining updates", () => {
            const store = useSettingsStore.getState();
            
            store.updateSettings({ autoStart: true });
            store.updateSettings({ notifications: false });
            store.updateSettings({ theme: "light" });
            store.updateSettings({ historyLimit: 200 });

            const state = useSettingsStore.getState();
            expect(state.settings.autoStart).toBe(true);
            expect(state.settings.notifications).toBe(false);
            expect(state.settings.theme).toBe("light");
            expect(state.settings.historyLimit).toBe(200);
        });
    });

    describe("Type Safety", () => {
        it("should accept valid theme values", () => {
            const validThemes = ["system", "light", "dark"] as const;
            
            validThemes.forEach((theme) => {
                useSettingsStore.getState().updateSettings({ theme });
                const state = useSettingsStore.getState();
                expect(state.settings.theme).toBe(theme);
            });
        });

        it("should handle boolean settings correctly", () => {
            const store = useSettingsStore.getState();

            // Test autoStart
            store.updateSettings({ autoStart: true });
            expect(useSettingsStore.getState().settings.autoStart).toBe(true);
            store.updateSettings({ autoStart: false });
            expect(useSettingsStore.getState().settings.autoStart).toBe(false);

            // Test minimizeToTray
            store.updateSettings({ minimizeToTray: true });
            expect(useSettingsStore.getState().settings.minimizeToTray).toBe(true);
            store.updateSettings({ minimizeToTray: false });
            expect(useSettingsStore.getState().settings.minimizeToTray).toBe(false);

            // Test notifications
            store.updateSettings({ notifications: true });
            expect(useSettingsStore.getState().settings.notifications).toBe(true);
            store.updateSettings({ notifications: false });
            expect(useSettingsStore.getState().settings.notifications).toBe(false);

            // Test soundAlerts
            store.updateSettings({ soundAlerts: true });
            expect(useSettingsStore.getState().settings.soundAlerts).toBe(true);
            store.updateSettings({ soundAlerts: false });
            expect(useSettingsStore.getState().settings.soundAlerts).toBe(false);
        });
    });
});
