import * as z from "zod";

/**
 * Maximum epoch millisecond value accepted by JavaScript Date.
 *
 * @remarks
 * Values above this can still be safe integers, but `new Date(value)` produces
 * an invalid Date object and renderer formatting degrades to "Invalid Date".
 */
export const MAX_VALID_DATE_EPOCH_MS = 8_640_000_000_000_000;

/**
 * Non-negative epoch millisecond timestamp that can be represented by Date.
 */
export const epochMsSchema: z.ZodNumber = z
    .int()
    .nonnegative()
    .max(MAX_VALID_DATE_EPOCH_MS);
