/**
 * Service layer for handling all monitor types operations. Provides a clean
 * abstraction over electron API calls for monitor type management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing with
 * automatic error handling and logging. The preload bridge automatically
 * unwraps IPC responses, so no manual extraction is needed.
 *
 * @packageDocumentation
 */

import type { Monitor } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";

import { ensureError } from "@shared/utils/errorHandling";

import { waitForElectronAPI } from "../stores/utils";
import { logger } from "./logger";

/**
 * Service for managing monitor types operations through Electron IPC.
 *
 * @remarks
 * Provides a comprehensive interface for monitor type operations including type
 * configuration loading, validation, formatting, and field management with
 * automatic service initialization and type-safe IPC communication. Handles
 * complex IpcResponse extraction for monitor types operations.
 *
 * @public
 */
export const MonitorTypesService = {
    /**
     * Formats monitor detail text using backend registry.
     *
     * @example
     *
     * ```typescript
     * const formatted = await MonitorTypesService.formatMonitorDetail(
     *     "http",
     *     "Response time: 150ms"
     * );
     * ```
     *
     * @param type - The monitor type identifier.
     * @param details - Raw detail text to format.
     *
     * @returns Formatted detail text.
     *
     * @throws If the electron API is unavailable or the formatting operation
     *   fails.
     */
    async formatMonitorDetail(type: string, details: string): Promise<string> {
        await this.initialize();
        try {
            return await window.electronAPI.monitoring.formatMonitorDetail(
                type,
                details
            );
        } catch (error) {
            const typedError = ensureError(error);
            logger.error("Failed to format monitor detail", typedError, {
                tag: "MonitorTypesService",
            });
            return details;
        }
    },

    /**
     * Generates formatted title suffix for a monitor.
     *
     * @example
     *
     * ```typescript
     * const suffix = await MonitorTypesService.formatMonitorTitleSuffix(
     *     "http",
     *     monitor
     * );
     * ```
     *
     * @param type - The monitor type identifier.
     * @param monitor - The monitor configuration object.
     *
     * @returns Formatted title suffix.
     *
     * @throws If the electron API is unavailable or the formatting operation
     *   fails.
     */
    async formatMonitorTitleSuffix(
        type: string,
        monitor: Monitor
    ): Promise<string> {
        await this.initialize();
        try {
            return await window.electronAPI.monitoring.formatMonitorTitleSuffix(
                type,
                monitor
            );
        } catch (error) {
            const typedError = ensureError(error);
            logger.error("Failed to format monitor title suffix", typedError, {
                tag: "MonitorTypesService",
            });
            return "";
        }
    },

    /**
     * Gets all available monitor types from backend registry.
     *
     * @example
     *
     * ```typescript
     * const types = await MonitorTypesService.getMonitorTypes();
     * console.log("Available monitor types:", types.length);
     * ```
     *
     * @returns Array of monitor type configurations.
     *
     * @throws If the electron API is unavailable or the operation fails.
     */
    async getMonitorTypes(): Promise<MonitorTypeConfig[]> {
        await this.initialize();
        try {
            return await window.electronAPI.monitorTypes.getMonitorTypes();
        } catch (error) {
            const typedError = ensureError(error);
            logger.error("Failed to get monitor types", typedError, {
                tag: "MonitorTypesService",
            });
            return [];
        }
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
                "Failed to initialize MonitorTypesService:",
                ensureError(error)
            );
            throw error;
        }
    },

    /**
     * Validates monitor data using backend registry.
     *
     * @example
     *
     * ```typescript
     * const result = await MonitorTypesService.validateMonitorData(
     *     "http",
     *     {
     *         url: "https://example.com",
     *     }
     * );
     * if (result.success) {
     *     console.log("Validation passed");
     * } else {
     *     console.error("Validation errors:", result.errors);
     * }
     * ```
     *
     * @param type - Monitor type to validate.
     * @param data - Monitor data to validate.
     *
     * @returns Validation result with success status and any errors.
     *
     * @throws If the electron API is unavailable or the validation operation
     *   fails.
     */
    async validateMonitorData(
        type: string,
        data: unknown
    ): Promise<ValidationResult> {
        await this.initialize();
        try {
            return await window.electronAPI.monitoring.validateMonitorData(
                type,
                data
            );
        } catch (error) {
            const typedError = ensureError(error);
            logger.error("Failed to validate monitor data", typedError, {
                tag: "MonitorTypesService",
            });
            return {
                data: undefined,
                errors: [`Validation failed: ${typedError.message}`],
                metadata: {},
                success: false,
                warnings: [],
            };
        }
    },
};
