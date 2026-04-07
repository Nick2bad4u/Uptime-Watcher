/**
 * Lightweight shared validation entrypoint.
 *
 * @remarks
 * This module intentionally exports only small, frequently-used helpers that
 * must be safe to import from the renderer bundle.
 *
 * Monitor and site payload validation should use the canonical Zod schemas
 * under `shared/validation/*`.
 *
 * @packageDocumentation
 */

import { BASE_MONITOR_TYPES, type MonitorType } from "@shared/types";
import { safeCastTo } from "ts-extras";

/**
 * Determines whether a value matches a supported monitor type.
 */
export function validateMonitorType(type: unknown): type is MonitorType {
    return (
        typeof type === "string" &&
        (safeCastTo<readonly string[]>(BASE_MONITOR_TYPES)).includes(type)
    );
}
