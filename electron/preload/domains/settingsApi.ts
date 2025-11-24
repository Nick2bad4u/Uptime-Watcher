/**
 * Settings Domain API - Type-safe preload bridge for settings operations
 *
 * @remarks
 * This module provides type-safe IPC communication for settings-related
 * operations. It acts as a focused interface for configuration management
 * separate from data import/export operations.
 *
 * @packageDocumentation
 */

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import {
    SETTINGS_CHANNELS,
    type SettingsDomainBridge,
} from "@shared/types/preload";

import { createTypedInvoker, createVoidInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the settings domain API operations.
 *
 * @public
 */
export interface SettingsApiInterface extends SettingsDomainBridge {
    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: SettingsDomainBridge["getHistoryLimit"];

    /**
     * Resets all persisted application settings to their defaults
     *
     * @returns Promise that resolves when the reset completes
     */
    resetSettings: SettingsDomainBridge["resetSettings"];

    /**
     * Updates the history retention limit
     *
     * @returns Promise resolving to the updated history limit value
     */
    updateHistoryLimit: SettingsDomainBridge["updateHistoryLimit"];
}

/**
 * Settings domain API providing configuration management operations.
 *
 * @public
 */
export const settingsApi: SettingsApiInterface = {
    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: createTypedInvoker(SETTINGS_CHANNELS.getHistoryLimit),

    /**
     * Resets all persisted application settings to their defaults
     *
     * @returns Promise that resolves when the reset completes
     */
    resetSettings: createVoidInvoker(SETTINGS_CHANNELS.resetSettings),

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise resolving to the updated history limit value
     */
    updateHistoryLimit: createTypedInvoker(
        SETTINGS_CHANNELS.updateHistoryLimit
    ),
} as const;

/**
 * Type alias for the settings domain preload bridge.
 *
 * @public
 */
export type SettingsApi = SettingsDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
