import type { UnknownRecord } from "type-fest";

import { isFinite as isFiniteNumber, setHas } from "ts-extras";

/**
 * Creates a guard that validates a string union using a lookup set.
 */
export function createStringUnionGuard<T extends string>(
    values: readonly T[]
): (value: unknown) => value is T {
    const set = new Set<string>(values);
    return (value: unknown): value is T =>
        typeof value === "string" && setHas(set, value);
}

/**
 * Narrow an unknown value to `UnknownRecord`.
 */
export function isUnknownRecord(value: unknown): value is UnknownRecord {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }

    try {
        const prototype: unknown = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
    } catch {
        return false;
    }
}

/**
 * Checks that a value is a finite number suitable for timestamps.
 */
export const hasFiniteTimestamp = (value: unknown): value is number =>
    typeof value === "number" && isFiniteNumber(value);
