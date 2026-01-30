/**
 * Extensible monitor type system for new monitoring capabilities.
 *
 * @remarks
 * This new architecture replaces hard-coded monitor types with a plugin-based
 * system that allows easy addition of new monitor types without code changes in
 * multiple files.
 */

/* eslint max-lines: ["error", { "max": 2000 }] -- Registry aggregates monitor definitions in one module */

import type { MonitorType } from "@shared/types";
import type * as z from "zod";

import { MONITOR_STATUS } from "@shared/types";

import type {
    BaseMonitorConfig,
    HttpMonitorRegistration,
} from "./MonitorTypeRegistry.types";
import type {
    IMonitorService,
    MonitorConfiguration,
    MonitorConfigurationInput,
} from "./types";

import { logger } from "../../utils/logger";
import { registerHttpMonitorTypes } from "./monitorTypeRegistry/registerHttpMonitorTypes";
import { registerNonHttpMonitorTypes } from "./monitorTypeRegistry/registerNonHttpMonitorTypes";
import { createHttpMonitorUiConfig } from "./utils/httpMonitorUiConfig";


/**
 * Internal registry for all monitor types and their configurations.
 *
 * @remarks
 * Used by registry functions to store and retrieve monitor type definitions.
 * Not exported.
 *
 * @internal
 */
const monitorTypes = new Map<string, BaseMonitorConfig>();

function toZodType(schema: z.ZodType): z.ZodType {
    return schema;
}

/**
 * Gets the configuration object for a given monitor type.
 *
 * @remarks
 * Returns the {@link BaseMonitorConfig} for the specified type, or undefined if
 * not registered.
 *
 * @param type - The monitor type identifier.
 *
 * @returns Monitor configuration object or undefined if the type is not
 *   registered.
 *
 * @public
 */
export function getMonitorTypeConfig(
    type: string
): BaseMonitorConfig | undefined {
    return monitorTypes.get(type);
}

/**
 * Gets all registered monitor type identifiers.
 *
 * @remarks
 * Returns an array of all monitor type string identifiers currently registered
 * in the system.
 *
 * @returns Array of registered monitor type strings.
 *
 * @public
 */
export function getRegisteredMonitorTypes(): readonly string[] {
    return Array.from(monitorTypes.keys());
}

/**
 * Checks if a monitor type is registered in the system.
 *
 * @remarks
 * Returns true if the specified monitor type identifier is registered, false
 * otherwise.
 *
 * @param type - The monitor type identifier to check.
 *
 * @returns True if the type is registered, false otherwise.
 *
 * @public
 */
export function isValidMonitorType(type: string): type is MonitorType {
    return monitorTypes.has(type);
}

/**
 * Simple monitor type validation for internal use.
 *
 * @remarks
 * Breaks circular dependency with EnhancedTypeGuards by providing basic
 * validation. Used internally by registry functions that need type validation
 * without importing external validation utilities.
 *
 * Validation logic:
 *
 * - Checks if type is a string
 * - Verifies type is registered in the monitor registry
 * - Returns structured result compatible with type guard patterns
 *
 * @param type - The monitor type to validate.
 *
 * @returns Validation result compatible with EnhancedTypeGuard interface.
 *
 * @internal
 */
type MonitorTypeValidationResult =
    | { error: string; success: false }
    | { success: true; value: MonitorType };

function validateMonitorTypeInternal(
    type: unknown
): MonitorTypeValidationResult {
    if (typeof type !== "string") {
        return {
            error: "Monitor type must be a string",
            success: false,
        };
    }

    if (!isValidMonitorType(type)) {
        const validTypes = getRegisteredMonitorTypes();
        return {
            error: `Invalid monitor type: ${type}. Valid types: ${validTypes.join(", ")}`,
            success: false,
        };
    }

    return {
        success: true,
        value: type,
    };
}

/**
 * Gets all registered monitor types with their configurations.
 *
 * @remarks
 * Returns an array of all monitor type configuration objects currently
 * registered in the system.
 *
 * @returns Array of {@link BaseMonitorConfig} objects for all registered monitor
 *   types.
 *
 * @public
 */
export function getAllMonitorTypeConfigs(): BaseMonitorConfig[] {
    return Array.from(monitorTypes.values());
}

/**
 * Gets the service factory function for a given monitor type.
 *
 * @remarks
 * Returns the factory function for creating monitor service instances for the
 * specified type, or undefined if not registered.
 *
 * @param type - The monitor type identifier.
 *
 * @returns Service factory function or undefined if the type is not registered.
 *
 * @public
 */
export function getMonitorServiceFactory(
    type: string
): (() => IMonitorService) | undefined {
    const config = getMonitorTypeConfig(type);
    return config?.serviceFactory;
}

/**
 * Registers a new monitor type with its configuration.
 *
 * @remarks
 * Adds the provided {@link BaseMonitorConfig} to the internal registry, making
 * it available for use in the system.
 *
 * @param config - The monitor type configuration object to register.
 *
 * @public
 */
export function registerMonitorType(config: BaseMonitorConfig): void {
    monitorTypes.set(config.type, config);
}

function registerHttpMonitorDefinition(
    definition: HttpMonitorRegistration
): void {
    const { uiOverrides, ...rest } = definition;

    registerMonitorType({
        ...rest,
        uiConfig: createHttpMonitorUiConfig(definition.type, uiOverrides),
    });
}

// Register built-in monitor types at module load.
registerHttpMonitorTypes({
    registerHttpMonitorDefinition,
    toZodType,
});

registerNonHttpMonitorTypes({
    registerMonitorType,
});

/**
 * Create monitor object with runtime type validation.
 *
 * @remarks
 * Provides runtime type safety by validating monitor type and creating properly
 * structured monitor objects with sensible defaults.
 *
 * Process:
 *
 * 1. Validates monitor type using internal validation
 * 2. Creates monitor object with default values
 * 3. Merges provided data with defaults
 * 4. Returns structured result for error handling
 *
 * @example
 *
 * ```typescript
 * import { monitorLogger } from "../../utils/logger";
 *
 * const result = createMonitorWithTypeGuards("http", {
 *     url: "https://example.com",
 * });
 * if (result.success) {
 *     monitorLogger.info("Created monitor", result.monitor);
 * } else {
 *     monitorLogger.error("Monitor validation failed", result.errors);
 * }
 * ```
 *
 * @param type - Monitor type string to validate
 * @param data - Monitor data to merge with defaults
 *
 * @returns Validation result with created monitor or errors
 */
export interface MonitorCreationResult {
    errors: string[];
    monitor?: MonitorConfiguration;
    success: boolean;
}

/**
 * Validates monitor type input and returns a normalized configuration object.
 *
 * @param type - Monitor type identifier supplied by the caller.
 * @param data - Optional monitor configuration overrides.
 *
 * @returns Structured result containing either a monitor configuration or
 *   validation errors.
 */
export function createMonitorWithTypeGuards(
    type: string,
    data: MonitorConfigurationInput = {}
): MonitorCreationResult {
    // Use internal type validation to avoid circular dependency
    const validationResult = validateMonitorTypeInternal(type);
    if (!validationResult.success) {
        const errorMessage =
            "error" in validationResult
                ? validationResult.error
                : "Invalid monitor type";
        return {
            errors: [errorMessage],
            success: false,
        };
    }

    const validMonitorType = validationResult.value;

    const { type: userProvidedType, ...restData } = data;
    if (
        typeof userProvidedType === "string" &&
        userProvidedType !== validMonitorType
    ) {
        logger.warn(
            `[MonitorTypeRegistry] Ignoring mismatched monitor type override`,
            {
                providedType: userProvidedType,
                validatedType: validMonitorType,
            }
        );
    }

    const monitor: MonitorConfiguration = {
        history: [],
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: MONITOR_STATUS.PENDING,
        timeout: 10_000,
        type: validMonitorType,
        ...restData,
    };

    return {
        errors: [],
        monitor,
        success: true,
    };
}

/**
 * Runtime type guard that verifies a value is a string corresponding to a
 * registered monitor type.
 *
 * @param type - Unknown value to validate.
 *
 * @returns `true` when the value is a registered monitor type string.
 */
export function isValidMonitorTypeGuard(type: unknown): type is MonitorType {
    return typeof type === "string" && isValidMonitorType(type);
}

/**
 * Monitor configuration migrations are intentionally not supported in this
 * development build.
 */
