import { describe, expect, it } from "vitest";

import {
    getJsonByteLengthUpTo,
    isJsonByteBudgetExceeded,
} from "../../utils/jsonByteBudget";

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
});
