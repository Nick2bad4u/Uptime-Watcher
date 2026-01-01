/**
 * Renderer layout-related constants.
 *
 * @remarks
 * Keep layout constants centralized so UI logic (matchMedia checks, sidebar
 * behavior) and tests don't drift from the CSS breakpoint values.
 */

/**
 * Media query used to determine when the app sidebar should collapse into the
 * compact (mobile-like) mode.
 */
export const SIDEBAR_COLLAPSE_MEDIA_QUERY = "(max-width: 1280px)";
