/**
 * Property-based tests for core fallback utilities.
 *
 * @remarks
 * These tests focus on cross-cutting invariants for the public helpers in
 * `src/utils/fallbacks.ts`.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { truncateForLogging } from "@app/utils/fallbacks";
import { assertProperty } from "../../test-utils/fastcheckConfig";

describe("fallback utilities (property-based)", () => {
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
