import type { UnknownRecord } from "type-fest";

import { isRecord as isSharedRecord } from "@shared/utils/typeHelpers";

/**
 * Creates a guard that validates a string union using a lookup set.
 */
export function createStringUnionGuard<T extends string>(
    values: readonly T[]
): (value: unknown) => value is T {
    const set = new Set<string>(values);
    return (value: unknown): value is T =>
        typeof value === "string" && set.has(value);
}

/**
 * Narrow an unknown value to {@link UnknownRecord}.
 */
export const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    isSharedRecord(value);

/**
 * Checks that a value is a finite number suitable for timestamps.
 */
export const hasFiniteTimestamp = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value);
