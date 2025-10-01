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

import type { SettingsDomainBridge } from "@shared/types/preload";

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the settings domain API operations
 */
export interface SettingsApiInterface extends SettingsDomainBridge {
    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: SettingsDomainBridge["getHistoryLimit"];

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise resolving to the updated history limit value
     */
    updateHistoryLimit: SettingsDomainBridge["updateHistoryLimit"];
}

/**
 * Settings domain API providing configuration management operations
 */
export const settingsApi: SettingsApiInterface = {
    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: createTypedInvoker("get-history-limit"),

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise resolving to the updated history limit value
     */
    updateHistoryLimit: createTypedInvoker("update-history-limit"),
} as const;

export type SettingsApi = SettingsDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
