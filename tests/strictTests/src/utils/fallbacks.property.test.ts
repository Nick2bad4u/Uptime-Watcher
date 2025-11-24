/**
 * Property-based tests for core fallback utilities.
 *
 * @remarks
 * These tests focus on cross-cutting invariants for the generic helpers in
 * `src/utils/fallbacks.ts`. They are placed under `tests/strictTests` to
 * provide stronger guarantees than the example-based tests that live next to
 * the implementation.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
    isNullOrUndefined,
    truncateForLogging,
    withFallback,
} from "@app/utils/fallbacks";
import { assertProperty } from "../../test-utils/fastcheckConfig";

describe("fallback utilities (property-based)", () => {
    /**
     * Property: `withFallback` either returns the original value when it is not
     * null/undefined, or the fallback when it is null/undefined.
     */
    it("withFallback respects null/undefined semantics for arbitrary values", () => {
        const valueArb = fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
            fc.constant(undefined)
        );

        assertProperty(
            fc.property(valueArb, fc.string(), (value, fallback) => {
                const result = withFallback(value, fallback);

                if (isNullOrUndefined(value)) {
                    expect(result).toBe(fallback);
                } else {
                    expect(result).toBe(value);
                }
            })
        );
    });

    /**
     * Property: `truncateForLogging` never increases string length and returns
     * a prefix of the original string.
     */
    it("truncateForLogging never increases length and returns a prefix", () => {
        assertProperty(
            fc.property(fc.string(), fc.nat(200), (value, maxLength) => {
                const truncated = truncateForLogging(value, maxLength);

                expect(truncated.length).toBeLessThanOrEqual(maxLength);

                if (!value || value.length <= maxLength) {
                    // When the input fits within the limit, it should be
                    // returned unchanged.
                    expect(truncated).toBe(value);
                } else {
                    // When the input is longer than the limit, the result
                    // should be the prefix of the original up to maxLength.
                    expect(truncated).toBe(value.slice(0, maxLength));
                }
            })
        );
    });
});
