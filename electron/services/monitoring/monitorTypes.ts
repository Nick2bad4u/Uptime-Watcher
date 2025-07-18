/**
 * Core monitor type definitions.
 *
 * @remarks
 * This file contains helper functions for working with monitor types.
 * The core MonitorType union is defined in ../../types.ts to avoid
 * circular dependencies.
 *
 * The registry is extensible and can register new monitor types at runtime,
 * but for TypeScript type safety, we maintain a base union type in the main types file.
 */

// Import and re-export the core MonitorType from the main types file
import type { MonitorType } from "../../types";
export type { MonitorType } from "../../types";

/**
 * Get all base monitor types as an array.
 *
 * @returns Array of base monitor types
 */
export function getBaseMonitorTypes(): MonitorType[] {
    return ["http", "port"];
}

/**
 * Type guard to check if a string is a valid monitor type.
 *
 * @param type - The type to check
 * @returns True if the type is a known monitor type
 */
export function isBaseMonitorType(type: string): type is MonitorType {
    return type === "http" || type === "port";
}
