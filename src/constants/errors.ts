/**
 * Standardized error messages used across the application.
 *
 * @remarks
 * Centralized error messages to ensure consistency across all stores
 * and components. Using constants helps with maintainability and
 * prevents typos in error handling.
 *
 * @packageDocumentation
 */

/**
 * Standardized error messages used across the application.
 *
 * @remarks
 * These constants provide consistent error messaging throughout the application.
 * The `as const` assertion ensures type safety and prevents modification.
 */
export const ERROR_MESSAGES = {
    FAILED_TO_ADD_MONITOR: "Failed to add monitor",
    FAILED_TO_ADD_SITE: "Failed to add site",
    FAILED_TO_CHECK_SITE: "Failed to check site",
    FAILED_TO_DELETE_SITE: "Failed to delete site",
    FAILED_TO_UPDATE_INTERVAL: "Failed to update check interval",
    FAILED_TO_UPDATE_SITE: "Failed to update site",
    SITE_NOT_FOUND: "Site not found",
} as const;
