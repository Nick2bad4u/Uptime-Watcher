/**
 * System theme preference helpers.
 *
 * @remarks
 * Centralizes `matchMedia('(prefers-color-scheme: dark)')` usage so theme
 * detection and subscription semantics stay consistent across the app.
 */

import {
    getMediaQueryMatches,
    subscribeToMediaQueryMatches,
} from "../../utils/mediaQueries";

export const PREFERS_DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)" as const;

const noop = (): void => {};

/**
 * Returns whether the current environment prefers dark mode.
 *
 * @remarks
 * -
 *
 * SSR-safe (returns `false` when `window` is unavailable)
 *
 * - Defensive against `matchMedia` throwing
 */
export function getPrefersDarkMode(): boolean {
    return getMediaQueryMatches(PREFERS_DARK_MEDIA_QUERY);
}

/**
 * Subscribes to dark-mode preference changes.
 *
 * @remarks
 * -
 *
 * SSR-safe (returns a no-op cleanup function)
 *
 * - Defensive against `matchMedia` throwing
 *
 * @param onChange - Called with the new dark-mode preference.
 *
 * @returns Cleanup function.
 */
export function subscribePrefersDarkModeChange(
    onChange: (isDarkMode: boolean) => void
): () => void {
    try {
        return subscribeToMediaQueryMatches(PREFERS_DARK_MEDIA_QUERY, onChange);
    } catch {
        return noop;
    }
}
