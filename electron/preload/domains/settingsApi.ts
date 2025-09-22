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

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the settings domain API operations
 */
export interface SettingsApiInterface {
    /**
     * Gets the current history retention limit
     *
     * @returns Promise resolving to the current history limit in days
     */
    getHistoryLimit: (...args: unknown[]) => Promise<number>;

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise that resolves when the limit is updated
     */
    updateHistoryLimit: (...args: unknown[]) => Promise<void>;
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
    getHistoryLimit: createTypedInvoker<number>("get-history-limit") satisfies (
        ...args: unknown[]
    ) => Promise<number>,

    /**
     * Updates the history retention limit
     *
     * @param limitDays - New history limit in days
     *
     * @returns Promise that resolves when the limit is updated
     */
    updateHistoryLimit: createTypedInvoker<void>(
        "update-history-limit"
    ) satisfies (...args: unknown[]) => Promise<void>,
} as const;

export type SettingsApi = SettingsApiInterface;
