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

import type {
    BaseMonitorConfig,
    HttpMonitorRegistration,
} from "./MonitorTypeRegistry.types";
import type { IMonitorService } from "./types";

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
    return [...monitorTypes.keys()];
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
    return [...monitorTypes.values()];
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
 * @internal
 */
function registerMonitorType(config: BaseMonitorConfig): void {
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
 * Monitor configuration migrations are intentionally not supported in this
 * development build.
 */
