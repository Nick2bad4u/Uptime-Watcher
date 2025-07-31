/**
 * Core monitor type definitions and utilities.
 *
 * @remarks
 * This file provides utilities for working with BASE monitor types only.
 * The core MonitorType union is defined in ../../types.ts to avoid
 * circular dependencies.
 *
 * For extensible monitor type registration, see MonitorTypeRegistry.
 * These functions only handle the base built-in types.
 *
 * @see {@link MonitorTypeRegistry} for runtime type registration
 * @see {@link MonitorType} for type definition
 */

import type { MonitorType } from "../../types";

import { BASE_MONITOR_TYPES } from "../../types";

// Import and re-export the core types from the main types file
export type { MonitorType } from "../../types";

/**
 * Get all base monitor types as an array.
 *
 * @returns Array containing only the built-in base monitor types
 *
 * @remarks
 * This function returns only the core base types (http, port) that are
 * built into the system. It does NOT include dynamically registered
 * monitor types from the registry.
 *
 * @example
 * ```typescript
 * const baseTypes = getBaseMonitorTypes(); // ["http", "port"]
 * ```
 *
 * @see {@link MonitorTypeRegistry.getAllTypes} for complete type list including dynamic types
 */
export function getBaseMonitorTypes(): MonitorType[] {
    return Array.from(BASE_MONITOR_TYPES);
}

/**
 * Type guard to check if a string is a valid base monitor type.
 *
 * @param type - The string to check against base monitor types
 * @returns True if the type is a known base monitor type
 *
 * @remarks
 * This function only validates against BASE monitor types (http, port).
 * It does NOT check against dynamically registered types in the registry.
 * For full type checking including dynamic types, use the registry.
 *
 * @example
 * ```typescript
 * if (isBaseMonitorType("http")) {
 *   // TypeScript knows this is a valid MonitorType
 * }
 * ```
 *
 * @see {@link MonitorTypeRegistry.isValidType} for complete type checking
 */
export function isBaseMonitorType(type: string): type is MonitorType {
    return BASE_MONITOR_TYPES.includes(type as MonitorType);
}
