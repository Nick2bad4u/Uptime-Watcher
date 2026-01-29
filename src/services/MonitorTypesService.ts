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
import {
    validateMonitorTypeConfigArray,
    validateValidationResult,
} from "@shared/validation/dataSchemas";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";
import { validateServicePayload } from "./utils/validation";

type IpcServiceHelpers = ReturnType<typeof getIpcServiceHelpers>;

const { ensureInitialized, wrap } = ((): IpcServiceHelpers => {
    try {
        return getIpcServiceHelpers("MonitorTypesService", {
            bridgeContracts: [
                {
                    domain: "monitorTypes",
                    methods: [
                        "formatMonitorDetail",
                        "formatMonitorTitleSuffix",
                        "getMonitorTypes",
                        "validateMonitorData",
                    ],
                },
            ],
        });
    } catch (error) {
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
        async (api, type: string, details: string) => {
            const result = await api.monitorTypes.formatMonitorDetail(
                type,
                details
            );
            if (typeof result !== "string") {
                throw new TypeError(
                    "formatMonitorDetail must return a formatted string"
                );
            }
            return result;
        }
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
        async (api, type: string, monitor: Monitor) => {
            const result = await api.monitorTypes.formatMonitorTitleSuffix(
                type,
                monitor
            );
            if (typeof result !== "string") {
                throw new TypeError(
                    "formatMonitorTitleSuffix must return a formatted string"
                );
            }
            return result;
        }
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
        async (api): Promise<MonitorTypeConfig[]> => {
            try {
                return validateServicePayload(
                    validateMonitorTypeConfigArray,
                    await api.monitorTypes.getMonitorTypes(),
                    {
                        operation: "getMonitorTypes",
                        serviceName: "MonitorTypesService",
                    }
                );
            } catch (error: unknown) {
                throw ensureError(error);
            }
        }
    ),

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
        async (api, type: string, data: unknown): Promise<ValidationResult> => {
            try {
                const parsed = validateServicePayload(
                    validateValidationResult,
                    await api.monitorTypes.validateMonitorData(type, data),
                    {
                        operation: "validateMonitorData",
                        serviceName: "MonitorTypesService",
                    }
                );

                return {
                    ...parsed,
                    metadata: parsed.metadata ?? {},
                    warnings: parsed.warnings ?? [],
                } satisfies ValidationResult;
            } catch (error: unknown) {
                throw ensureError(error);
            }
        }
    ),
};
