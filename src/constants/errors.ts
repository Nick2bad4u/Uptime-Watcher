/**
 * Error message constants catalog.
 *
 * @remarks
 * Centralized error message definitions organized by domain.
 * All error messages are readonly to ensure consistency across the
 * application.
 *
 * @packageDocumentation
 */

/**
 * Structured error catalog containing all application error messages.
 * Messages are organized by domain for better maintainability.
 */
export const ERROR_CATALOG = {
    database: {
        CONNECTION_FAILED: "Database connection failed",
        QUERY_FAILED: "Database query failed",
        RECORD_NOT_FOUND: "Record not found",
    },
    monitors: {
        CANNOT_REMOVE_LAST:
            "Cannot remove the last monitor from a site. Use site removal instead.",
        FAILED_TO_ADD: "Failed to add monitor",
        FAILED_TO_UPDATE_INTERVAL: "Failed to update check interval",
        NOT_FOUND: "Monitor not found",
    },
    network: {
        CONNECTION_FAILED: "Network connection failed",
        CONNECTION_TIMEOUT: "Connection timed out",
        HOST_UNREACHABLE: "Host unreachable",
    },
    sites: {
        FAILED_TO_ADD: "Failed to add site",
        FAILED_TO_CHECK: "Failed to check site",
        FAILED_TO_DELETE: "Failed to delete site",
        FAILED_TO_UPDATE: "Failed to update site",
        NOT_FOUND: "Site not found",
    },
    system: {
        INTERNAL_ERROR: "An internal error occurred",
        OPERATION_TIMEOUT: "Operation timed out",
        SERVICE_UNAVAILABLE: "Service temporarily unavailable",
    },
    validation: {
        FIELD_REQUIRED: "This field is required",
        HOST_INVALID: "Host address is invalid",
        URL_INVALID: "URL format is invalid",
    },
} as const;
