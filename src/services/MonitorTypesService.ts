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

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("MonitorTypesService", {
            bridgeContracts: [
                {
                    domain: "monitorTypes",
                    methods: ["getMonitorTypes"],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

interface MonitorTypesServiceContract {
    formatMonitorDetail: (type: string, details: string) => Promise<string>;
    formatMonitorTitleSuffix: (
        type: string,
        monitor: Monitor
    ) => Promise<string>;
    getMonitorTypes: () => Promise<MonitorTypeConfig[]>;
    initialize: () => Promise<void>;
    validateMonitorData: (
        type: string,
        data: unknown
    ) => Promise<ValidationResult>;
}

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
export const MonitorTypesService: MonitorTypesServiceContract = {
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
    formatMonitorDetail: wrap(
        "formatMonitorDetail",
        async (api, type: string, details: string) =>
            api.monitoring.formatMonitorDetail(type, details)
    ),

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
    formatMonitorTitleSuffix: wrap(
        "formatMonitorTitleSuffix",
        async (api, type: string, monitor: Monitor) =>
            api.monitoring.formatMonitorTitleSuffix(type, monitor)
    ),

    /**
     * Gets all available monitor types from backend registry.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const types = await MonitorTypesService.getMonitorTypes();
     * logger.info("Loaded monitor types", { count: types.length });
     * ```
     *
     * @returns Array of monitor type configurations.
     *
     * @throws If the electron API is unavailable or the operation fails.
     */
    getMonitorTypes: wrap(
        "getMonitorTypes",
        async (api): Promise<MonitorTypeConfig[]> =>
            api.monitorTypes.getMonitorTypes()
    ),

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
    initialize: ensureInitialized,

    /**
     * Validates monitor data using backend registry.
     *
     * @example
     *
     * ```typescript
     * import { logger } from "@app/services/logger";
     *
     * const result = await MonitorTypesService.validateMonitorData(
     *     "http",
     *     {
     *         url: "https://example.com",
     *     }
     * );
     * if (result.success) {
     *     logger.info("Monitor validation passed");
     * } else {
     *     logger.error("Monitor validation failed", result.errors);
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
    validateMonitorData: wrap(
        "validateMonitorData",
        async (api, type: string, data: unknown): Promise<ValidationResult> =>
            api.monitoring.validateMonitorData(type, data)
    ),
};
