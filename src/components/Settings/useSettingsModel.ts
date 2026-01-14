import type { ThemeName } from "../../theme/types";

import { useConfirmDialog } from "../../hooks/ui/useConfirmDialog";
import { useDelayedButtonLoading } from "../../hooks/useDelayedButtonLoading";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSettingsStore } from "../../stores/settings/useSettingsStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { useTheme } from "../../theme/useTheme";

type ErrorStoreState = ReturnType<typeof useErrorStore.getState>;

type SettingsStoreState = ReturnType<typeof useSettingsStore.getState>;

type SitesStoreState = ReturnType<typeof useSitesStore.getState>;

const selectClearError = (state: ErrorStoreState): ErrorStoreState["clearError"] =>
    state.clearError;

const selectIsLoading = (state: ErrorStoreState): boolean => state.isLoading;

const selectLastError = (state: ErrorStoreState): ErrorStoreState["lastError"] =>
    state.lastError;

const selectSetError = (state: ErrorStoreState): ErrorStoreState["setError"] =>
    state.setError;

const selectPersistHistoryLimit = (
    state: SettingsStoreState
): SettingsStoreState["persistHistoryLimit"] => state.persistHistoryLimit;

const selectResetSettings = (
    state: SettingsStoreState
): SettingsStoreState["resetSettings"] => state.resetSettings;

const selectSettings = (state: SettingsStoreState): SettingsStoreState["settings"] =>
    state.settings;

const selectUpdateSettings = (
    state: SettingsStoreState
): SettingsStoreState["updateSettings"] => state.updateSettings;

const selectSaveSqliteBackup = (
    state: SitesStoreState
): SitesStoreState["saveSqliteBackup"] => state.saveSqliteBackup;

const selectRestoreSqliteBackup = (
    state: SitesStoreState
): SitesStoreState["restoreSqliteBackup"] => state.restoreSqliteBackup;

const selectLastBackupMetadata = (
    state: SitesStoreState
): SitesStoreState["lastBackupMetadata"] => state.lastBackupMetadata;

const selectFullResyncSites = (
    state: SitesStoreState
): SitesStoreState["fullResyncSites"] => state.fullResyncSites;

/**
 * Data model for the Settings page.
 */
export interface SettingsModel {
    readonly availableThemes: readonly ThemeName[];
    readonly clearError: ErrorStoreState["clearError"];
    readonly fullResyncSites: SitesStoreState["fullResyncSites"];
    readonly isDark: boolean;
    readonly isLoading: boolean;
    readonly lastBackupMetadata: SitesStoreState["lastBackupMetadata"];
    readonly lastError: ErrorStoreState["lastError"];
    readonly persistHistoryLimit: SettingsStoreState["persistHistoryLimit"];
    readonly requestConfirmation: ReturnType<typeof useConfirmDialog>;
    readonly resetSettings: SettingsStoreState["resetSettings"];
    readonly restoreSqliteBackup: SitesStoreState["restoreSqliteBackup"];
    readonly saveSqliteBackup: SitesStoreState["saveSqliteBackup"];
    readonly setError: ErrorStoreState["setError"];
    readonly setTheme: ReturnType<typeof useTheme>["setTheme"];
    readonly settings: SettingsStoreState["settings"];
    readonly showButtonLoading: boolean;
    readonly updateSettings: SettingsStoreState["updateSettings"];
}

/**
 * Centralizes all Settings page store selection and cross-cutting hooks.
 *
 * @remarks
 * This is intentionally a thin model hook: it isolates Zustand selectors and
 * other hooks so `Settings.tsx` can focus on UI and event handlers.
 */
export function useSettingsModel(): SettingsModel {
    const clearError = useErrorStore(selectClearError);
    const isLoading = useErrorStore(selectIsLoading);
    const lastError = useErrorStore(selectLastError);
    const setError = useErrorStore(selectSetError);

    const persistHistoryLimit = useSettingsStore(selectPersistHistoryLimit);
    const resetSettings = useSettingsStore(selectResetSettings);
    const settings = useSettingsStore(selectSettings);
    const updateSettings = useSettingsStore(selectUpdateSettings);

    const saveSqliteBackup = useSitesStore(selectSaveSqliteBackup);
    const restoreSqliteBackup = useSitesStore(selectRestoreSqliteBackup);
    const lastBackupMetadata = useSitesStore(selectLastBackupMetadata);
    const fullResyncSites = useSitesStore(selectFullResyncSites);

    const requestConfirmation = useConfirmDialog();

    const { availableThemes, isDark, setTheme } = useTheme();

    const showButtonLoading = useDelayedButtonLoading(isLoading);

    return {
        availableThemes,
        clearError,
        fullResyncSites,
        isDark,
        isLoading,
        lastBackupMetadata,
        lastError,
        persistHistoryLimit,
        requestConfirmation,
        resetSettings,
        restoreSqliteBackup,
        saveSqliteBackup,
        setError,
        setTheme,
        settings,
        showButtonLoading,
        updateSettings,
    };
}
