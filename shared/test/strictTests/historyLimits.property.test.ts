/**
 * Property-based invariants for shared history limit helpers.
 *
 * @remarks
 * These properties complement the example-based coverage in
 * `historyLimits-complete-coverage.test.ts` by asserting cross-cutting
 * behaviours of {@link normalizeHistoryLimit} such as idempotence, range
 * constraints, and monotonicity. They are intentionally focused on the default
 * rules used across renderer and Electron layers.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";

describe("normalizeHistoryLimit (property-based invariants)", () => {
    const nonNegativeCandidateArb: fc.Arbitrary<number> = fc.integer({
        max: 100_000,
        min: 0,
    });

    const defaultFastCheckParameters = Object.freeze({ numRuns: 200 });

    /**
     * Property: normalising the same non-negative candidate multiple times is
     * idempotent under the default rules.
     */
    it("normalizing a non-negative candidate twice yields the same result (idempotence)", () => {
        fc.assert(
            fc.property(nonNegativeCandidateArb, (candidate) => {
                const once = normalizeHistoryLimit(candidate);
                const twice = normalizeHistoryLimit(once);

                expect(twice).toBe(once);
            }),
            defaultFastCheckParameters
        );
    });

    /**
     * Property: the effective history limit is either `0` (unlimited) or at
     * least the configured minimum; there are no values in the open interval
     * `(0, minLimit)` when using the shared defaults.
     */
    it("never returns values between 1 and minLimit - 1 using default rules", () => {
        fc.assert(
            fc.property(nonNegativeCandidateArb, (candidate) => {
                const result = normalizeHistoryLimit(candidate);

                expect(result).toBeGreaterThanOrEqual(0);

                if (result === 0) {
                    // With default rules and a non-negative candidate, only
                    // an explicit `0` should map to the unlimited sentinel.
                    expect(candidate).toBe(0);
                } else {
                    expect(result).toBeGreaterThanOrEqual(
                        DEFAULT_HISTORY_LIMIT_RULES.minLimit
                    );
                }
            }),
            defaultFastCheckParameters
        );
    });

    /**
     * Property: for any two non-negative candidates where `a <= b`, the
     * normalised limit under the default rules is monotonic (`normalize(a) <=
     * normalize(b)`).
     */
    it("is monotonic for increasing non-negative candidates", () => {
        fc.assert(
            fc.property(
                fc.tuple(nonNegativeCandidateArb, nonNegativeCandidateArb),
                ([a, b]) => {
                    const [lower, upper] = a <= b ? [a, b] : [b, a];

                    const lowerNormalised = normalizeHistoryLimit(lower);
                    const upperNormalised = normalizeHistoryLimit(upper);

                    expect(lowerNormalised).toBeLessThanOrEqual(
                        upperNormalised
                    );
                }
            ),
            defaultFastCheckParameters
        );
    });

    /**
     * Property: for candidates at or above the configured minimum limit, the
     * normalised value is the floored candidate.
     */
    it("floors positive candidates at or above the minimum limit", () => {
        const candidateArb = fc.double({
            max: DEFAULT_HISTORY_LIMIT_RULES.minLimit + 10_000,
            min: DEFAULT_HISTORY_LIMIT_RULES.minLimit,
            noNaN: true,
        });

        fc.assert(
            fc.property(candidateArb, (candidate) => {
                const result = normalizeHistoryLimit(candidate);

                expect(result).toBe(Math.floor(candidate));
                expect(result).toBeGreaterThanOrEqual(
                    DEFAULT_HISTORY_LIMIT_RULES.minLimit
                );
            }),
            defaultFastCheckParameters
        );
    });
});
