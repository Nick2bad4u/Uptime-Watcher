/**
 * Response-time theming utilities.
 */

import { useCallback, useMemo } from "react";

/**
 * Color palette used by {@link getResponseTimeColorFromPalette}.
 */
export interface ResponseTimeColorPalette {
    readonly error: string;
    readonly success: string;
    readonly warning: string;
}

/**
 * Converts a response time value (ms) into a color.
 *
 * @remarks
 * Centralizes the shared UI rule used across overview tabs:
 *
 * - 200ms or less: success
 * - 1000ms or less: warning
 * - Greater than 1000ms: error
 */
export function getResponseTimeColorFromPalette(
    palette: ResponseTimeColorPalette,
    responseTimeMs: number
): string {
    if (responseTimeMs <= 200) {
        return palette.success;
    }

    if (responseTimeMs <= 1000) {
        return palette.warning;
    }

    return palette.error;
}

/**
 * Hook that returns a stable function for mapping response times to theme
 * colors.
 */
export function useResponseTimeColorFromThemeColors(colors: {
    readonly error: string;
    readonly success: string;
    readonly warning: string;
}): (responseTimeMs: number) => string {
    const palette: ResponseTimeColorPalette = useMemo(
        () => ({
            error: colors.error,
            success: colors.success,
            warning: colors.warning,
        }),
        [
            colors.error,
            colors.success,
            colors.warning,
        ]
    );

    return useCallback(
        (responseTimeMs: number) =>
            getResponseTimeColorFromPalette(palette, responseTimeMs),
        [palette]
    );
}
