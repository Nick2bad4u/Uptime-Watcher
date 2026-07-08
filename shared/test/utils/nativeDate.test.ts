import { describe, expect, it, vi } from "vitest";

import {
    getNativeDateEpochMs,
    toNativeDateISOString,
} from "../../utils/nativeDate";

describe("nativeDate helpers", () => {
    it("reads valid Date values through captured native methods", () => {
        const date = new Date("2026-07-08T00:00:00.000Z");

        expect(getNativeDateEpochMs(date)).toBe(date.getTime());
        expect(toNativeDateISOString(date)).toBe("2026-07-08T00:00:00.000Z");
    });

    it("returns undefined for invalid Date values", () => {
        const date = new Date(Number.NaN);

        expect(getNativeDateEpochMs(date)).toBeUndefined();
        expect(toNativeDateISOString(date)).toBeUndefined();
    });

    it("returns undefined for Date prototype impostors", () => {
        const date = Object.create(Date.prototype) as Date;

        expect(date).toBeInstanceOf(Date);
        expect(getNativeDateEpochMs(date)).toBeUndefined();
        expect(toNativeDateISOString(date)).toBeUndefined();
    });

    it("does not invoke shadowed Date methods", () => {
        const date = new Date("2026-07-08T00:00:00.000Z");
        const getTime = vi.fn(() => {
            throw new Error("shadowed getTime should not run");
        });
        const toISOString = vi.fn(() => {
            throw new Error("shadowed toISOString should not run");
        });
        Object.defineProperty(date, "getTime", {
            configurable: true,
            value: getTime,
        });
        Object.defineProperty(date, "toISOString", {
            configurable: true,
            value: toISOString,
        });

        expect(getNativeDateEpochMs(date)).toBe(1_783_468_800_000);
        expect(toNativeDateISOString(date)).toBe("2026-07-08T00:00:00.000Z");
        expect(getTime).not.toHaveBeenCalled();
        expect(toISOString).not.toHaveBeenCalled();
    });

    it("does not invoke patched Date prototype methods", () => {
        const date = new Date("2026-07-08T00:00:00.000Z");
        const getTime = vi.spyOn(Date.prototype, "getTime");
        const toISOString = vi.spyOn(Date.prototype, "toISOString");
        getTime.mockImplementation(() => {
            throw new Error("Date prototype getTime should not run");
        });
        toISOString.mockImplementation(() => {
            throw new Error("Date prototype toISOString should not run");
        });

        try {
            expect(getNativeDateEpochMs(date)).toBe(1_783_468_800_000);
            expect(toNativeDateISOString(date)).toBe(
                "2026-07-08T00:00:00.000Z"
            );
            expect(getTime).not.toHaveBeenCalled();
            expect(toISOString).not.toHaveBeenCalled();
        } finally {
            getTime.mockRestore();
            toISOString.mockRestore();
        }
    });
});
