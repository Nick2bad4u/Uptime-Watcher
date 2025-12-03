/**
 * Achieves exhaustive coverage of history retention constants and helpers.
 *
 * @file Validates that default rule metadata stays frozen and that
 *   {@link normalizeHistoryLimit} applies the documented clamping semantics for
 *   consumers across renderer and Electron layers.
 */

import { describe, expect, it } from "vitest";

import {
    DEFAULT_HISTORY_LIMIT,
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
    type HistoryLimitRules,
} from "@shared/constants/history";

describe("DEFAULT_HISTORY_LIMIT_RULES", () => {
    it("exposes the expected immutable defaults", () => {
        expect(DEFAULT_HISTORY_LIMIT_RULES).toStrictEqual({
            defaultLimit: 500,
            maxLimit: Number.MAX_SAFE_INTEGER,
            minLimit: 25,
        });
        expect(Object.isFrozen(DEFAULT_HISTORY_LIMIT_RULES)).toBeTruthy();
    });
});

describe("DEFAULT_HISTORY_LIMIT", () => {
    it("is aligned with the canonical default limit rule", () => {
        expect(DEFAULT_HISTORY_LIMIT).toBe(
            DEFAULT_HISTORY_LIMIT_RULES.defaultLimit
        );
    });
});

describe(normalizeHistoryLimit, () => {
    const customRules: HistoryLimitRules = Object.freeze({
        defaultLimit: 10,
        maxLimit: 1000,
        minLimit: 5,
    });

    it("throws a TypeError when provided non-finite input", () => {
        expect(() => normalizeHistoryLimit(Number.NaN)).toThrowError(TypeError);
        expect(() =>
            normalizeHistoryLimit("25" as unknown as number)
        ).toThrowError(TypeError);
    });

    it("throws a RangeError when the value is infinite or above the maximum", () => {
        expect(() =>
            normalizeHistoryLimit(Number.POSITIVE_INFINITY)
        ).toThrowError(RangeError);
        expect(() =>
            normalizeHistoryLimit(customRules.maxLimit + 1, customRules)
        ).toThrowError(RangeError);
    });

    it("interprets zero or negative values as unlimited", () => {
        expect(normalizeHistoryLimit(0, customRules)).toBe(0);
        expect(normalizeHistoryLimit(-10, customRules)).toBe(0);
    });

    it("clamps fractional and sub-minimum values to the configured minimum", () => {
        expect(normalizeHistoryLimit(6.9, customRules)).toBe(6);
        expect(normalizeHistoryLimit(4.5, customRules)).toBe(
            customRules.minLimit
        );
    });

    it("returns the floored candidate when within bounds", () => {
        expect(normalizeHistoryLimit(25.99)).toBe(25);
        expect(normalizeHistoryLimit(875, customRules)).toBe(875);
    });
});
