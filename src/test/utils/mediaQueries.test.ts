import { describe, expect, it, vi } from "vitest";

import {
    subscribeToMediaQueryListChanges,
    tryGetMediaQueryList,
} from "../../utils/mediaQueries";

describe("mediaQueries utilities", () => {
    describe(tryGetMediaQueryList, () => {
        it("returns null when matchMedia is unavailable", () => {
            const original = matchMedia;

            Object.defineProperty(globalThis, "matchMedia", {
                configurable: true,
                value: undefined,
            });

            try {
                expect(
                    tryGetMediaQueryList("(prefers-reduced-motion: reduce)")
                ).toBeNull();
            } finally {
                Object.defineProperty(globalThis, "matchMedia", {
                    configurable: true,
                    value: original,
                });
            }
        });

        it("supports accessor-backed window matchMedia globals", () => {
            const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
                globalThis,
                "window"
            );
            let accessCount = 0;

            try {
                Object.defineProperty(globalThis, "window", {
                    configurable: true,
                    enumerable: true,
                    value: Object.defineProperty({}, "matchMedia", {
                        configurable: true,
                        enumerable: true,
                        get() {
                            accessCount += 1;
                            return (query: string) =>
                                ({
                                    matches: query.includes(
                                        "prefers-reduced-motion"
                                    ),
                                    media: query,
                                }) as MediaQueryList;
                        },
                    }),
                });

                const result = tryGetMediaQueryList(
                    "(prefers-reduced-motion: reduce)"
                );

                expect(accessCount).toBeGreaterThan(0);
                expect(result?.matches).toBeTruthy();
                expect(result?.media).toBe("(prefers-reduced-motion: reduce)");
            } finally {
                if (originalWindowDescriptor) {
                    Object.defineProperty(
                        globalThis,
                        "window",
                        originalWindowDescriptor
                    );
                } else {
                    Reflect.deleteProperty(globalThis, "window");
                }
            }
        });

        it("returns null when the matchMedia accessor throws", () => {
            const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
                globalThis,
                "window"
            );

            try {
                Object.defineProperty(globalThis, "window", {
                    configurable: true,
                    enumerable: true,
                    value: Object.defineProperty({}, "matchMedia", {
                        configurable: true,
                        enumerable: true,
                        get() {
                            throw new Error("matchMedia unavailable");
                        },
                    }),
                });

                expect(
                    tryGetMediaQueryList("(prefers-reduced-motion: reduce)")
                ).toBeNull();
            } finally {
                if (originalWindowDescriptor) {
                    Object.defineProperty(
                        globalThis,
                        "window",
                        originalWindowDescriptor
                    );
                } else {
                    Reflect.deleteProperty(globalThis, "window");
                }
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

        it("supports legacy listener methods defined on the prototype", () => {
            const addListener = vi.fn();
            const removeListener = vi.fn();

            class LegacyMediaQueryList {
                public addListener(
                    listener: (event: MediaQueryListEvent) => void
                ): void {
                    addListener(listener);
                }

                public removeListener(
                    listener: (event: MediaQueryListEvent) => void
                ): void {
                    removeListener(listener);
                }
            }

            const mediaQueryList =
                new LegacyMediaQueryList() as unknown as MediaQueryList;
            const handler = vi.fn();
            const cleanup = subscribeToMediaQueryListChanges(
                mediaQueryList,
                handler
            );

            expect(addListener).toHaveBeenCalledWith(handler);

            cleanup();

            expect(removeListener).toHaveBeenCalledWith(handler);
        });

        it("does not invoke accessor-backed legacy listener methods", () => {
            let accessCount = 0;
            const mediaQueryList = {};
            Object.defineProperty(mediaQueryList, "addListener", {
                configurable: true,
                enumerable: true,
                get: () => {
                    accessCount += 1;
                    throw new Error("Unexpected addListener getter access");
                },
            });

            const cleanup = subscribeToMediaQueryListChanges(
                mediaQueryList as unknown as MediaQueryList,
                vi.fn()
            );

            cleanup();

            expect(accessCount).toBe(0);
        });
    });
});
