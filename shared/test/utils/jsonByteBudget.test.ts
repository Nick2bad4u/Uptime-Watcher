import { describe, expect, it } from "vitest";

import {
    getJsonByteLengthUpTo,
    isJsonByteBudgetExceeded,
} from "../../utils/jsonByteBudget";

const getJsonUtfByteLength = (value: unknown): number =>
    Buffer.byteLength(JSON.stringify(value), "utf8");

describe("json byte budget helpers", () => {
    it("counts valid Date values as their ISO JSON string", () => {
        const date = new Date("2025-01-02T03:04:05.000Z");

        expect(getJsonByteLengthUpTo(date, 100)).toBe(
            JSON.stringify(date.toISOString()).length
        );
    });

    it("handles invalid Date values without throwing", () => {
        const invalidDate = new Date(Number.NaN);

        expect(() =>
            getJsonByteLengthUpTo({ checkedAt: invalidDate }, 100)
        ).not.toThrow();
        expect(isJsonByteBudgetExceeded({ checkedAt: invalidDate }, 100)).toBe(
            false
        );
    });

    it("counts JSON string escaping overhead", () => {
        const payload = {
            value: "\"\\".repeat(16),
        };
        const actualBytes = getJsonUtfByteLength(payload);

        expect(getJsonByteLengthUpTo(payload, actualBytes)).toBe(actualBytes);
        expect(isJsonByteBudgetExceeded(payload, actualBytes - 1)).toBe(
            true
        );
    });

    it("counts JSON object key escaping overhead", () => {
        const payload = {
            "quoted\"\\key": "value",
        };
        const actualBytes = getJsonUtfByteLength(payload);

        expect(getJsonByteLengthUpTo(payload, actualBytes)).toBe(actualBytes);
        expect(isJsonByteBudgetExceeded(payload, actualBytes - 1)).toBe(
            true
        );
    });

    it("counts non-finite numbers as JSON null", () => {
        expect(getJsonByteLengthUpTo(Number.NaN, 100)).toBe(
            getJsonUtfByteLength(Number.NaN)
        );
    });

    it("treats enumerable object accessors as over budget without invoking them", () => {
        let accessed = false;
        const payload: Record<string, unknown> = {};
        Object.defineProperty(payload, "secret", {
            enumerable: true,
            get: () => {
                accessed = true;
                throw new Error("getter should not run");
            },
        });

        expect(getJsonByteLengthUpTo(payload, 100)).toBeGreaterThan(100);
        expect(accessed).toBe(false);
    });

    it("treats enumerable array accessors as over budget without invoking them", () => {
        let accessed = false;
        const payload: unknown[] = [];
        payload.length = 1;
        Object.defineProperty(payload, "0", {
            enumerable: true,
            get: () => {
                accessed = true;
                throw new Error("getter should not run");
            },
        });

        expect(getJsonByteLengthUpTo(payload, 100)).toBeGreaterThan(100);
        expect(accessed).toBe(false);
    });
});
