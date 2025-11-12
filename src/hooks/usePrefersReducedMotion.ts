/**
 * React hook that tracks the user's reduced-motion preference.
 *
 * @remarks
 * Uses the `prefers-reduced-motion` media query when running in a browser
 * environment. When the match media API is unavailable (e.g. during server-side
 * rendering), the hook falls back to reporting `false` to avoid disabling
 * animations inadvertently.
 *
 * @returns `true` when the user prefers reduced motion; otherwise `false`.
 *
 * @public
 */
import { useCallback, useRef, useState } from "react";

import { useMount } from "./useMount";

const MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

const readPreference = (): boolean => {
    if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ) {
        return false;
    }

    return window.matchMedia(MEDIA_QUERY).matches;
};

/**
 * Subscribes to reduced-motion preference changes.
 *
 * @param setPreference - Callback invoked when the media query result changes.
 */
const subscribeToPreferenceChanges = (
    setPreference: (value: boolean) => void
): (() => void) | undefined => {
    if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ) {
        return undefined;
    }

    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => {
        setPreference(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleChange);
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }

    return undefined;
};

/**
 * React hook that returns whether the user requests reduced motion.
 *
 * @returns `true` if the `prefers-reduced-motion` media query matches.
 */
export const usePrefersReducedMotion = (): boolean => {
    const [prefersReducedMotion, setPrefersReducedMotion] =
        useState(readPreference);
    const unsubscribeRef = useRef<(() => void) | undefined>(undefined);

    const mount = useCallback((): void => {
        unsubscribeRef.current = subscribeToPreferenceChanges(
            setPrefersReducedMotion
        );
    }, [setPrefersReducedMotion]);

    const unmount = useCallback((): void => {
        unsubscribeRef.current?.();
        unsubscribeRef.current = undefined;
    }, []);

    useMount(mount, unmount);

    return prefersReducedMotion;
};
