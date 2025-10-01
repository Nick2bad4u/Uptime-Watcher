/**
 * Service layer for handling all settings-related operations. Provides a clean
 * abstraction over electron API calls for settings management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing with
 * automatic error handling and logging.
 *
 * @packageDocumentation
 */

import { ensureError } from "@shared/utils/errorHandling";
import { safeNumberConversion } from "@shared/utils/safeConversions";

import { waitForElectronAPI } from "../stores/utils";
import { logger } from "./logger";

/**
 * Service for managing application settings through Electron IPC.
 *
 * @remarks
 * Provides a comprehensive interface for settings operations including history
 * limit management, settings reset, and configuration persistence with
 * automatic service initialization and type-safe IPC communication.
 *
 * @public
 */
export const SettingsService = {
    /**
     * Gets the current history retention limit.
     *
     * @example
     *
     * ```typescript
     * const limit = await SettingsService.getHistoryLimit();
     * console.log(`Current limit: ${limit} records`);
     * ```
     *
     * @returns The current history retention limit as a number.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    async getHistoryLimit(): Promise<number> {
        await SettingsService.initialize();
        return window.electronAPI.settings.getHistoryLimit();
    },

    /**
     * Ensures the electron API is available before making backend calls.
     *
     * @remarks
     * This method should be called before any backend operation.
     *
     * @returns A promise that resolves when the electron API is ready.
     *
     * @throws If the electron API is not available.
     */
    async initialize(): Promise<void> {
        try {
            await waitForElectronAPI();
        } catch (error) {
            logger.error(
                "Failed to initialize SettingsService:",
                ensureError(error)
            );
            throw error;
        }
    },

    /**
     * Resets all application settings to their default values.
     *
     * @example
     *
     * ```typescript
     * await SettingsService.resetSettings();
     * console.log("Settings reset to defaults");
     * ```
     *
     * @returns A promise that resolves when all settings have been reset.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    async resetSettings(): Promise<void> {
        await SettingsService.initialize();
        await window.electronAPI.data.resetSettings();
    },

    /**
     * Updates the history retention limit and prunes existing history.
     *
     * @example
     *
     * ```typescript
     * await SettingsService.updateHistoryLimit(1000);
     * console.log("History limit updated to 1000 records");
     * ```
     *
     * @param limit - The new maximum number of history records to keep per
     *   monitor.
     *
     * @returns Sanitized history limit after update. If the backend returns a
     *   non-numeric value, the requested limit is used instead and a warning is
     *   logged.
     *
     * @throws If the electron API is unavailable or the backend operation
     *   fails.
     */
    async updateHistoryLimit(limit: number): Promise<number> {
        await SettingsService.initialize();
        const updatedLimit =
            await window.electronAPI.settings.updateHistoryLimit(limit);
        const sanitizedLimit = safeNumberConversion(updatedLimit, limit);

        if (sanitizedLimit !== updatedLimit) {
            logger.warn(
                "Received invalid history limit from backend; falling back to requested value",
                {
                    receivedValue: updatedLimit,
                    requestedLimit: limit,
                    sanitizedLimit,
                }
            );
        }

        return sanitizedLimit;
    },
};
