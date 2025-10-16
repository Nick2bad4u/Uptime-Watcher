/**
 * Shared site-related constants.
 *
 * @remarks
 * Provides canonical constants used across Electron and renderer layers to
 * avoid drift in default site configuration behaviour.
 *
 * @packageDocumentation
 */

/**
 * Default site name when none is supplied by the user.
 *
 * @remarks
 * Keeping this value in the shared layer ensures both Electron and renderer
 * code paths stay aligned without duplicating fallback strings.
 */
export const DEFAULT_SITE_NAME = "Unnamed Site" as const;
