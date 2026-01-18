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

import {
    getMediaQueryMatches,
    subscribeToMediaQueryMatches,
} from "../utils/mediaQueries";
import { useMount } from "./useMount";

const MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

const readPreference = (): boolean => getMediaQueryMatches(MEDIA_QUERY);

/**
 * Subscribes to reduced-motion preference changes.
 *
 * @param setPreference - Callback invoked when the media query result changes.
 */
const subscribeToPreferenceChanges = (
    setPreference: (value: boolean) => void
): (() => void) => subscribeToMediaQueryMatches(MEDIA_QUERY, setPreference);

/**
 * React hook that returns whether the user requests reduced motion.
 *
 * @returns `true` if the `prefers-reduced-motion` media query matches.
 */
export const usePrefersReducedMotion = (): boolean => {
    const [prefersReducedMotion, setPrefersReducedMotion] =
        useState(readPreference);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    const mount = useCallback((): void => {
        unsubscribeRef.current = subscribeToPreferenceChanges(
            setPrefersReducedMotion
        );
    }, [setPrefersReducedMotion]);

    const unmount = useCallback((): void => {
        unsubscribeRef.current?.();
        unsubscribeRef.current = null;
    }, []);

    useMount(mount, unmount);

    return prefersReducedMotion;
};
