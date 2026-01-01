/**
 * System theme preference helpers.
 *
 * @remarks
 * Centralizes `matchMedia('(prefers-color-scheme: dark)')` usage so theme
 * detection and subscription semantics stay consistent across the app.
 */

export const PREFERS_DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)" as const;

const noop = (): void => {};

/**
 * Returns whether the current environment prefers dark mode.
 *
 * @remarks
 * - SSR-safe (returns `false` when `window` is unavailable)
 * - Defensive against `matchMedia` throwing
 */
export function getPrefersDarkMode(): boolean {
    if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ) {
        return false;
    }

    try {
        return window.matchMedia(PREFERS_DARK_MEDIA_QUERY).matches;
    } catch {
        return false;
    }
}

/**
 * Subscribes to dark-mode preference changes.
 *
 * @remarks
 * - SSR-safe (returns a no-op cleanup function)
 * - Defensive against `matchMedia` throwing
 *
 * @param onChange - Called with the new dark-mode preference.
 *
 * @returns Cleanup function.
 */
export function subscribePrefersDarkModeChange(
    onChange: (isDarkMode: boolean) => void
): () => void {
    if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
    ) {
        return noop;
    }

    try {
        const mediaQuery = window.matchMedia(PREFERS_DARK_MEDIA_QUERY);
        const handler = (event: MediaQueryListEvent): void => {
            onChange(event.matches);
        };

        mediaQuery.addEventListener("change", handler);

        return () => {
            try {
                mediaQuery.removeEventListener("change", handler);
            } catch {
                // Ignore cleanup errors.
            }
        };
    } catch {
        return noop;
    }
}
