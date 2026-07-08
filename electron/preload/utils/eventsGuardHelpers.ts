import type { UnknownRecord } from "type-fest";

import { isPlainRecord } from "@shared/utils/typeHelpers";
import { epochMsSchema } from "@shared/validation/timestampSchemas";
import { setHas } from "ts-extras";

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
export const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    isPlainRecord(value);

/**
 * Checks that a value is a valid epoch millisecond timestamp.
 */
export const hasFiniteTimestamp = (value: unknown): value is number =>
    epochMsSchema.safeParse(value).success;
