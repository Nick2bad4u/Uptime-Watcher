/**
 * Shared configuration and helpers for fast-check property-based tests used in
 * the strict test suites under `tests/strictTests`.
 *
 * @remarks
 * This module centralizes default parameters for `fc.assert` and provides a
 * thin, opt-in wrapper that individual tests can use when they want consistent
 * run counts. It is intentionally small so tests remain free to call
 * `fc.assert` directly when they need custom behavior.
 */
import fc from "fast-check";

/**
 * Default fast-check parameters for strict property tests.
 *
 * @remarks
 * These values are chosen to balance test runtime and coverage in CI. Tests may
 * override them on a per-property basis when necessary.
 */
export const defaultFastCheckParameters: Readonly<{ numRuns: number }> =
    Object.freeze({
        numRuns: 200,
    });

/**
 * Asserts a fast-check property using the shared defaults, with optional
 * per-test overrides.
 *
 * @param property - The fast-check property to assert.
 * @param overrides - Optional overrides for fast-check parameters such as
 *   `numRuns`.
 */
export function assertProperty(
    property: fc.IProperty<unknown>,
    overrides?: Partial<typeof defaultFastCheckParameters>
): void {
    const parameters = {
        ...defaultFastCheckParameters,
        ...overrides,
    };

    // The `parameters` object is structurally compatible with the
    // fast-check `Parameters` type; we use a cast here to avoid leaking
    // fast-check's generic type constraints into every test.

    fc.assert(property as fc.IProperty<unknown>, parameters as any);
}
