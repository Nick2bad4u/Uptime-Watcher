import { describe, expect, it, vi } from "vitest";

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

    it("does not invoke shadowed Date methods while counting dates", () => {
        const date = new Date("2025-01-02T03:04:05.000Z");
        const getTime = vi.fn(() => {
            throw new Error("date getTime should not run");
        });
        const toISOString = vi.fn(() => {
            throw new Error("date toISOString should not run");
        });
        Object.defineProperty(date, "getTime", {
            configurable: true,
            value: getTime,
        });
        Object.defineProperty(date, "toISOString", {
            configurable: true,
            value: toISOString,
        });

        expect(getJsonByteLengthUpTo(date, 100)).toBe(
            JSON.stringify("2025-01-02T03:04:05.000Z").length
        );
        expect(getTime).not.toHaveBeenCalled();
        expect(toISOString).not.toHaveBeenCalled();
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
            value: '"\\'.repeat(16),
        };
        const actualBytes = getJsonUtfByteLength(payload);

        expect(getJsonByteLengthUpTo(payload, actualBytes)).toBe(actualBytes);
        expect(isJsonByteBudgetExceeded(payload, actualBytes - 1)).toBe(true);
    });

    it("counts JSON object key escaping overhead", () => {
        const payload = {
            'quoted"\\key': "value",
        };
        const actualBytes = getJsonUtfByteLength(payload);

        expect(getJsonByteLengthUpTo(payload, actualBytes)).toBe(actualBytes);
        expect(isJsonByteBudgetExceeded(payload, actualBytes - 1)).toBe(true);
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

    it("does not invoke shadowed URL methods while counting URLs", () => {
        const url = new URL("https://example.com/path?token=secret");
        const toString = vi.fn(() => {
            throw new Error("url toString should not run");
        });
        Object.defineProperty(url, "toString", {
            configurable: true,
            value: toString,
        });

        expect(getJsonByteLengthUpTo(url, 100)).toBe(
            JSON.stringify("https://example.com/path?token=secret").length
        );
        expect(toString).not.toHaveBeenCalled();
    });

    it("does not invoke shadowed ArrayBuffer byteLength accessors", () => {
        const buffer = new ArrayBuffer(4);
        const byteLength = vi.fn(() => {
            throw new Error("array buffer byteLength should not run");
        });
        Object.defineProperty(buffer, "byteLength", {
            configurable: true,
            get: byteLength,
        });

        expect(getJsonByteLengthUpTo(buffer, 100)).toBe(4);
        expect(byteLength).not.toHaveBeenCalled();
    });

    it("does not invoke shadowed view byteLength accessors", () => {
        const view = new Uint8Array(6);
        const byteLength = vi.fn(() => {
            throw new Error("view byteLength should not run");
        });
        Object.defineProperty(view, "byteLength", {
            configurable: true,
            get: byteLength,
        });

        expect(getJsonByteLengthUpTo(view, 100)).toBe(6);
        expect(byteLength).not.toHaveBeenCalled();
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
