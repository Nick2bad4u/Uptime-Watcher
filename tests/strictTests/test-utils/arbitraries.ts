/**
 * Shared fast-check arbitraries for strict tests.
 *
 * @remarks
 * These arbitraries model common domain patterns (identifiers, history limits,
 * etc.) without hard-coding every business rule. Individual tests should still
 * apply domain-specific constraints where needed.
 */

import fc from "fast-check";

/**
 * Arbitrary for non-empty, trimmed identifiers.
 *
 * @remarks
 * Useful for site identifiers, monitor identifiers, and other logical keys that
 * must be non-empty after trimming whitespace.
 */
export const identifierArb: fc.Arbitrary<string> = fc
    .string({ minLength: 1, maxLength: 64 })
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

/**
 * Arbitrary for valid history-limit values used by the database layer.
 *
 * @remarks
 * The upper bound is intentionally generous; stricter constraints should be
 * enforced by the production validation logic and can be mirrored in tests when
 * needed.
 */
export const historyLimitArb: fc.Arbitrary<number> = fc.integer({
    max: 100_000,
    min: 0,
});

/**
 * Arbitrary for non-empty, trimmed strings suitable for user-facing names.
 */
export const nonEmptyNameArb: fc.Arbitrary<string> = fc
    .string({ minLength: 1, maxLength: 128 })
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

/**
 * Helper to turn a curated list of examples into a `constantFrom` arbitrary.
 *
 * @remarks
 * Useful when migrating from example-based tests to property-based tests: you
 * can keep a small, representative set of fixtures while still exercising them
 * via `fc.property`. The input array must contain at least one element.
 *
 * @typeParam T - Type of the examples and resulting arbitrary.
 *
 * @param examples - Non-empty list of example values.
 *
 * @returns A fast-check arbitrary that only produces the provided examples.
 *
 * @throws RangeError - When `examples` is empty.
 */
export function examplesToConstantFrom<T>(
    examples: readonly T[]
): fc.Arbitrary<T> {
    if (examples.length === 0) {
        throw new RangeError(
            "examplesToConstantFrom requires at least one example value"
        );
    }

    // Spread is safe here because we validated that the array is non-empty.
    return fc.constantFrom(...examples);
}
