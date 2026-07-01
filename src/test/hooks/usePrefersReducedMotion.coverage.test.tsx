/**
 * Focused coverage tests for {@link usePrefersReducedMotion}.
 *
 * @remarks
 * Exercises both branches of the media-query guards and verifies that the hook
 * subscribes to `prefers-reduced-motion` changes when available while remaining
 * safe in environments without `matchMedia` support.
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { safeCastTo } from "ts-extras";

import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type ChangeListener = ((event: MediaQueryListEvent) => void) | undefined;

describe(usePrefersReducedMotion, () => {
    const originalMatchMedia = matchMedia;

    afterEach(() => {
        // Restore any overridden matchMedia implementation between tests.
        safeCastTo<{ matchMedia: typeof originalMatchMedia | undefined }>(
            globalThis
        ).matchMedia = originalMatchMedia;
        vi.restoreAllMocks();
    });

    it("returns false when matchMedia is unavailable", () => {
        (globalThis as { matchMedia?: unknown }).matchMedia = undefined;

        const { result } = renderHook(() => usePrefersReducedMotion());

        expect(result.current).toBeFalsy();
    });

    it("subscribes to media query changes and updates state", async () => {
        let changeListener: ChangeListener;

        vi.spyOn(
            globalThis as { matchMedia: typeof window.matchMedia },
            "matchMedia"
        ).mockImplementation((query: string): MediaQueryList => {
            const mediaQueryList: MediaQueryList = {
                matches: false,
                media: query,
                onchange: null,
                addEventListener: (
                    type: string,
                    listener: EventListenerOrEventListenerObject
                ) => {
                    if (type === "change" && typeof listener === "function") {
                        changeListener = listener;
                    }
                },
                removeEventListener: () => {
                    // No-op in tests
                },
                addListener: () => {
                    // Previous API, unused in hook
                },
                removeListener: () => {
                    // Previous API, unused in hook
                },
                dispatchEvent: () => false,
            };

            return mediaQueryList;
        });

        const { result } = renderHook(() => usePrefersReducedMotion());

        // Initial state should reflect the current media query match value.
        expect(result.current).toBeFalsy();

        await waitFor(() => {
            expect(changeListener).toBeTypeOf("function");
        });

        act(() => {
            changeListener?.({ matches: true } as MediaQueryListEvent);
        });

        await waitFor(() => {
            expect(result.current).toBeTruthy();
        });
    });

    it("falls back gracefully when addEventListener is not available", () => {
        vi.spyOn(
            globalThis as { matchMedia: typeof window.matchMedia },
            "matchMedia"
        ).mockImplementation(
            (query: string): MediaQueryList =>
                ({
                    matches: false,
                    media: query,
                    onchange: null,
                    // Intentionally omit addEventListener/removeEventListener to
                    // exercise the fallback branch in subscribeToPreferenceChanges.
                    addListener: () => {
                        // Previous no-op
                    },
                    removeListener: () => {
                        // Previous no-op
                    },
                    dispatchEvent: () => false,
                }) as unknown as MediaQueryList
        );

        const { result } = renderHook(() => usePrefersReducedMotion());

        // Hook should still return a boolean preference and not throw.
        expect(result.current).toBeFalsy();
    });
});
