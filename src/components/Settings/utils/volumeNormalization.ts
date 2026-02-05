/**
 * Normalized volume helpers.
 *
 * @remarks
 * Settings UI stores volume as a normalized float in `[0, 1]` but sliders work
 * with integer percentages. These helpers centralize clamping/conversion so the
 * controller, preview hook, and any future components remain consistent.
 */

/**
 * Clamps a numeric volume value into the inclusive interval `[0, 1]`.
 */
export function clampNormalizedVolume(value: number): number {
    return Math.min(Math.max(value, 0), 1);
}

/**
 * Converts a slider percentage value (0-100) into a normalized volume.
 */
export function convertSliderPercentToNormalizedVolume(
    sliderPercent: number
): number {
    return clampNormalizedVolume(sliderPercent / 100);
}

/**
 * Converts a normalized volume into a slider percentage (rounded integer).
 */
export function convertNormalizedVolumeToSliderPercent(
    normalizedVolume: number
): number {
    return Math.round(clampNormalizedVolume(normalizedVolume) * 100);
}
