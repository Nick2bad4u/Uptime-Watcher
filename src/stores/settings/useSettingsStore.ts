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
 * updateSettings({
 *     theme: "dark",
 *     systemNotificationsEnabled: true,
 * });
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

import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";

import type { AppSettings } from "../types";
import type { SettingsStore } from "./types";

import { syncSettingsAfterRehydration } from "./hydration";
import { createSettingsOperationsSlice } from "./operations";
import { createSettingsStateSlice, normalizeAppSettings } from "./state";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Zustand store for managing application settings with persistence.
 *
 * @remarks
 * This store composes modular slices for state and operations, mirroring the
 * architecture used by other stores such as `useSitesStore`.
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
            ...createSettingsStateSlice(set),
            ...createSettingsOperationsSlice(set, get),
        }),
        {
            merge: (persistedState, currentState) => {
                // Zustand's default merge is shallow, which can replace the
                // entire `settings` object with an older partial shape.
                // That breaks invariants (e.g. arrays becoming `undefined`).
                if (!isRecord(persistedState)) {
                    return currentState;
                }

                const base = persistedState as Partial<SettingsStore>;
                const settingsCandidate = persistedState["settings"];
                const persistedSettings = isRecord(settingsCandidate)
                    ? (settingsCandidate as Partial<AppSettings>)
                    : {};

                return {
                    ...currentState,
                    ...base,
                    settings: normalizeAppSettings({
                        ...currentState.settings,
                        ...persistedSettings,
                    }),
                };
            },
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
