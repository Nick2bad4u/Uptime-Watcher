import { describe, expect, it, vi } from "vitest";

import {
    subscribeToMediaQueryListChanges,
    tryGetMediaQueryList,
} from "../../utils/mediaQueries";

describe("mediaQueries utilities", () => {
    describe(tryGetMediaQueryList, () => {
        it("returns null when matchMedia is unavailable", () => {
            const original = window.matchMedia;

            Object.defineProperty(window, "matchMedia", {
                configurable: true,
                value: undefined,
            });

            try {
                expect(
                    tryGetMediaQueryList("(prefers-reduced-motion: reduce)")
                ).toBeNull();
            } finally {
                Object.defineProperty(window, "matchMedia", {
                    configurable: true,
                    value: original,
                });
            }
        });
    });

    describe(subscribeToMediaQueryListChanges, () => {
        it("uses addEventListener/removeEventListener when available", () => {
            const addEventListener = vi.fn();
            const removeEventListener = vi.fn();

            const mediaQueryList = {
                addEventListener,
                removeEventListener,
            } as unknown as MediaQueryList;

            const handler = vi.fn();
            const cleanup = subscribeToMediaQueryListChanges(
                mediaQueryList,
                handler
            );

            expect(addEventListener).toHaveBeenCalledWith("change", handler);

            cleanup();
            expect(removeEventListener).toHaveBeenCalledWith("change", handler);
        });

        it("falls back to addListener/removeListener when addEventListener is missing", () => {
            const addListener = vi.fn();
            const removeListener = vi.fn();

            const mediaQueryList = {
                addListener,
                removeListener,
            } as unknown as MediaQueryList;

            const handler = vi.fn();
            const cleanup = subscribeToMediaQueryListChanges(
                mediaQueryList,
                handler
            );

            expect(addListener).toHaveBeenCalledWith(handler);

            cleanup();
            expect(removeListener).toHaveBeenCalledWith(handler);
        });
    });
});
