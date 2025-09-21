/**
 * Settings store for managing application preferences and configuration.
 * Handles user settings, theme preferences, and backend synchronization.
 *
 * @remarks
 * This store manages all application settings with automatic persistence and
 * backend synchronization. It provides:
 *
 * - Persistent storage using Zustand persist middleware
 * - Backend synchronization for critical settings
 * - Default value management and reset functionality
 * - Error handling integration with the error store
 *
 * The store uses a partialize function to persist only essential settings data,
 * avoiding persistence of transient state or computed values.
 *
 * @example
 *
 * ```typescript
 * // Basic settings usage
 * const { settings, updateSettings } = useSettingsStore();
 * updateSettings({ theme: "dark", notifications: true });
 *
 * // History limit with backend sync
 * const { persistHistoryLimit } = useSettingsStore();
 * await persistHistoryLimit(500);
 *
 * // Settings initialization
 * const { initializeSettings } = useSettingsStore();
 * const result = await initializeSettings();
 * ```
 *
 * @public
 */

import { withErrorHandling } from "@shared/utils/errorHandling";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";

import type { AppSettings } from "../types";
import type { SettingsStore } from "./types";

import { DEFAULT_HISTORY_LIMIT } from "../../constants";
import { logger } from "../../services/logger";
import { SettingsService } from "../../services/SettingsService";
import { useErrorStore } from "../error/useErrorStore";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";

const defaultSettings: AppSettings = {
    autoStart: false,
    historyLimit: DEFAULT_HISTORY_LIMIT,
    minimizeToTray: true,
    notifications: true,
    soundAlerts: false,
    theme: "system",
};

// Store timer reference for cleanup capability
// eslint-disable-next-line eslint-plugin-toplevel/no-toplevel-let -- Mutable state required for timer management
let settingsSyncTimer: null | ReturnType<typeof setTimeout> = null;

const syncSettingsAfterRehydration = (
    state: SettingsStore | undefined
): void => {
    if (state) {
        // Clear any existing timer
        if (settingsSyncTimer) {
            clearTimeout(settingsSyncTimer);
            settingsSyncTimer = null;
        }

        // Use setTimeout to avoid blocking the rehydration process
        settingsSyncTimer = setTimeout(() => {
            // Use an IIFE to handle the async operation properly
            void (async (): Promise<void> => {
                try {
                    const historyLimit =
                        await SettingsService.getHistoryLimit();
                    state.updateSettings({ historyLimit });
                } catch (error) {
                    logger.warn(
                        "Failed to sync settings after rehydration:",
                        error instanceof Error
                            ? error
                            : new Error(String(error))
                    );
                    // Use default value on error
                    state.updateSettings({
                        historyLimit: DEFAULT_HISTORY_LIMIT,
                    });
                }
                settingsSyncTimer = null;
            })();
        }, 100); // Small delay to ensure everything is initialized
    }
};

/**
 * Zustand store for managing application settings with persistence.
 *
 * @remarks
 * This store provides comprehensive settings management with automatic
 * persistence using Zustand middleware. It includes additional persist
 * utilities for hydration management and storage operations.
 *
 * @public
 */
export const useSettingsStore: UseBoundStore<
    Omit<StoreApi<SettingsStore>, "persist"> & {
        /**
         * Persistence utilities for settings storage management.
         *
         * @remarks
         * Provides advanced persistence functionality including hydration
         * control, storage management, and configuration options.
         */
        persist: {
            /** Clears all persisted settings from storage */
            clearStorage: () => void;
            /**
             * Gets current persistence configuration options.
             *
             * @returns Current persist options with settings configuration
             */
            getOptions: () => Partial<
                PersistOptions<
                    SettingsStore,
                    {
                        /** Persisted settings data structure */
                        settings: AppSettings;
                    }
                >
            >;
            /** Returns whether the store has completed hydration from storage */
            hasHydrated: () => boolean;
            /**
             * Registers a callback to execute when hydration completes.
             *
             * @param fn - Callback function to execute with hydrated state
             *
             * @returns Cleanup function to remove the callback
             */
            onFinishHydration: (
                fn: (state: SettingsStore) => void
            ) => () => void;
            /**
             * Registers a callback to execute during hydration process.
             *
             * @param fn - Callback function to execute during hydration
             *
             * @returns Cleanup function to remove the callback
             */
            onHydrate: (fn: (state: SettingsStore) => void) => () => void;
            /** Forces rehydration of the store from persistent storage */
            rehydrate: () => Promise<void> | void;
            /**
             * Updates persistence configuration options.
             *
             * @param options - New persistence options to apply
             */
            setOptions: (
                options: Partial<
                    PersistOptions<
                        SettingsStore,
                        {
                            settings: AppSettings;
                        }
                    >
                >
            ) => void;
        };
    }
> = create<SettingsStore>()(
    persist(
        (set, get) => ({
            // Actions
            initializeSettings: async (): Promise<{
                message: string;
                settingsLoaded: boolean;
                success: boolean;
            }> => {
                try {
                    const result = await withErrorHandling(
                        async () => {
                            // Fetch all available settings from backend
                            const historyLimit =
                                await SettingsService.getHistoryLimit();

                            // Get current settings to preserve user preferences
                            const currentSettings = get().settings;

                            // Update local state with backend values while preserving
                            // user preferences like theme choice
                            const updatedSettings = {
                                ...defaultSettings,
                                ...currentSettings, // Preserve persisted user preferences
                                historyLimit, // Use actual backend value
                            };

                            // Update state while preserving user preferences
                            set({ settings: updatedSettings });

                            return {
                                message: "Successfully loaded settings",
                                settingsLoaded: true,
                                success: true,
                            };
                        },
                        createStoreErrorHandler(
                            "settings",
                            "initializeSettings"
                        )
                    );

                    logStoreAction("SettingsStore", "initializeSettings", {
                        message: result.message,
                        settingsLoaded: result.settingsLoaded,
                        success: result.success,
                    });

                    return result;
                } catch (error) {
                    // If backend fails, use default settings gracefully
                    const currentSettings = get().settings;
                    const fallbackSettings = {
                        ...defaultSettings,
                        ...currentSettings, // Preserve any existing user preferences
                    };

                    set({ settings: fallbackSettings });

                    const fallbackResult = {
                        message: "Settings initialized with default values",
                        settingsLoaded: true,
                        success: false,
                    };

                    logStoreAction("SettingsStore", "initializeSettings", {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        message: fallbackResult.message,
                        settingsLoaded: fallbackResult.settingsLoaded,
                        success: fallbackResult.success,
                    });

                    return fallbackResult;
                }
            },
            persistHistoryLimit: async (limit: number): Promise<void> => {
                logStoreAction("SettingsStore", "persistHistoryLimit", {
                    limit,
                });

                const currentSettings = get().settings;

                await withErrorHandling(
                    async () => {
                        // Update local state immediately for responsive UI
                        get().updateSettings({ historyLimit: limit });

                        // Call backend to update and prune history
                        await SettingsService.updateHistoryLimit(limit);

                        // Verify the value from backend to ensure sync
                        const backendLimit =
                            await SettingsService.getHistoryLimit();

                        // Ensure we have a valid number from backend
                        const validBackendLimit =
                            typeof backendLimit === "number" && backendLimit > 0
                                ? backendLimit
                                : limit;

                        // Update with backend value to ensure consistency
                        get().updateSettings({
                            historyLimit: validBackendLimit,
                        });
                    },
                    {
                        clearError: (): void => {
                            useErrorStore
                                .getState()
                                .clearStoreError("settings");
                        },
                        setError: (error: string | undefined): void => {
                            // Revert to previous state on error instead of
                            // using default
                            useErrorStore
                                .getState()
                                .setStoreError("settings", error);
                            get().updateSettings({
                                historyLimit: currentSettings.historyLimit,
                            });
                        },
                        setLoading: (loading): void => {
                            useErrorStore
                                .getState()
                                .setOperationLoading(
                                    "updateHistoryLimit",
                                    loading
                                );
                        },
                    }
                );
            },
            resetSettings: async (): Promise<{
                message: string;
                success: boolean;
            }> => {
                const result = await withErrorHandling(
                    async () => {
                        // Call backend to reset all settings
                        await SettingsService.resetSettings();

                        // Fetch the actual reset values from backend to ensure
                        // synchronization
                        const historyLimit =
                            await SettingsService.getHistoryLimit();

                        // Update local state to match backend defaults
                        set({
                            settings: {
                                ...defaultSettings,
                                historyLimit, // Use the actual value from backend
                            },
                        });

                        return {
                            message: "Settings successfully reset to defaults",
                            success: true,
                        };
                    },
                    createStoreErrorHandler("settings", "resetSettings")
                );

                logStoreAction("SettingsStore", "resetSettings", {
                    message: result.message,
                    success: result.success,
                });

                return result;
            },
            // State
            settings: defaultSettings,
            // Force sync settings from backend (useful for debugging
            // persistence issues)
            syncFromBackend: async (): Promise<{
                message: string;
                success: boolean;
            }> =>
                withErrorHandling(
                    async () => {
                        const historyLimit =
                            await SettingsService.getHistoryLimit();

                        const currentSettings = get().settings;
                        const updatedSettings = {
                            ...currentSettings,
                            historyLimit,
                        };

                        set({ settings: updatedSettings });

                        return {
                            message: "Settings synchronized from backend",
                            success: true,
                        };
                    },
                    createStoreErrorHandler("settings", "syncFromBackend")
                ),
            updateSettings: (newSettings: Partial<AppSettings>): void => {
                logStoreAction("SettingsStore", "updateSettings", {
                    newSettings,
                });
                set((state) => {
                    const updatedSettings = {
                        ...state.settings,
                        ...newSettings,
                    };
                    return { settings: updatedSettings };
                });
            },
        }),
        {
            name: "uptime-watcher-settings",
            // After rehydration, sync critical settings from backend
            onRehydrateStorage: () => syncSettingsAfterRehydration,
            // Persistence configuration - only persist essential settings data
            // This prevents persisting transient state, computed values, or
            // functions If additional state properties are added in the future,
            // review this partialize function to ensure appropriate data is
            // persisted
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);
