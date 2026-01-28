/**
 * Centralized error message catalog for consistent error handling across the
 * application.
 *
 * @remarks
 * This module provides a comprehensive collection of standardized error
 * messages organized by domain and operation type. Using these constants
 * ensures consistent error messaging across frontend, backend, and shared code
 * while improving maintainability and preventing typos.
 *
 * The error messages are categorized by functional domain:
 *
 * - **Site Operations**: Site CRUD and management operations
 * - **Monitor Operations**: Monitor configuration and management
 * - **Validation Errors**: Data validation and constraint violations
 * - **System Errors**: General system and infrastructure errors
 * - **Network Errors**: Connection and communication errors
 * - **Database Errors**: Data persistence and retrieval errors
 *
 * @example
 *
 * ```typescript
 * import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
 *
 * // Use categorized error messages
 * throw new Error(ERROR_CATALOG.sites.notFound);
 * throw new Error(ERROR_CATALOG.monitors.configurationInvalid);
 * ```
 *
 * @packageDocumentation
 */

import { castUnchecked } from "@shared/utils/typeHelpers";

/**
 * Site-related error messages.
 *
 * @remarks
 * Error messages for site CRUD operations, configuration management, and
 * site-level monitoring operations.
 *
 * @public
 */
export const SITE_ERRORS = {
    /** Error when site already exists with the same identifier */
    ALREADY_EXISTS: "Site with this identifier already exists",

    /** Error when attempting to add a site fails */
    FAILED_TO_ADD: "Failed to add site",

    /** Error when site configuration check fails */
    FAILED_TO_CHECK: "Failed to check site",

    /** Error when attempting to delete a site fails */
    FAILED_TO_DELETE: "Failed to delete site",

    /** Error when attempting to update a site fails */
    FAILED_TO_UPDATE: "Failed to update site",

    /** Error when site identifier is invalid or empty */
    INVALID_IDENTIFIER: "Site identifier is invalid or missing",

    /** Error when site name is invalid or empty */
    INVALID_NAME: "Site name is invalid or missing",

    /** Error when a requested site cannot be found */
    NOT_FOUND: "Site not found",
} as const;

/**
 * Monitor-related error messages.
 *
 * @remarks
 * Error messages for monitor operations, configuration validation, and monitor
 * lifecycle management.
 *
 * @public
 */
export const MONITOR_ERRORS = {
    /** Error when trying to remove the last monitor from a site */
    CANNOT_REMOVE_LAST:
        "Cannot remove the last monitor from a site. Use site removal instead.",

    /** Error when monitor configuration is invalid */
    CONFIGURATION_INVALID: "Monitor configuration is invalid",

    /** Error when attempting to add a monitor fails */
    FAILED_TO_ADD: "Failed to add monitor",

    /** Error when attempting to remove a monitor fails */
    FAILED_TO_REMOVE: "Failed to remove monitor",

    /** Error when attempting to update a monitor fails */
    FAILED_TO_UPDATE: "Failed to update monitor",

    /** Error when attempting to update check interval fails */
    FAILED_TO_UPDATE_INTERVAL: "Failed to update check interval",

    /** Error when monitor ID is invalid or missing */
    INVALID_ID: "Monitor ID is invalid or missing",

    /** Error when check interval is invalid */
    INVALID_INTERVAL: "Check interval must be a positive number",

    /** Error when retry attempts value is invalid */
    INVALID_RETRY_ATTEMPTS: "Retry attempts must be a non-negative number",

    /** Error when timeout value is invalid */
    INVALID_TIMEOUT: "Timeout must be a positive number",

    /** Error when a requested monitor cannot be found */
    NOT_FOUND: "Monitor not found",

    /** Error when monitor type is not supported */
    TYPE_NOT_SUPPORTED: "Monitor type is not supported",
} as const;

/**
 * Validation-related error messages.
 *
 * @remarks
 * Error messages for data validation, constraint violations, and input
 * validation errors.
 *
 * @public
 */
export const VALIDATION_ERRORS = {
    /** Error when email format is invalid */
    EMAIL_INVALID: "Email format is invalid",

    /** Error when field format is invalid */
    FIELD_INVALID_FORMAT: "Field format is invalid",

    /** Error when required field is missing */
    FIELD_REQUIRED: "This field is required",

    /** Error when host address is invalid */
    HOST_INVALID: "Host address is invalid",

    /** Error when port number is invalid */
    PORT_INVALID: "Port number must be between 1 and 65535",

    /** Error when string length exceeds maximum */
    STRING_TOO_LONG: "Value exceeds maximum length",

    /** Error when string length is below minimum */
    STRING_TOO_SHORT: "Value is below minimum length",

    /** Error when URL format is invalid */
    URL_INVALID: "URL format is invalid",

    /** Error when validation fails for an event */
    VALIDATION_FAILED: "Validation failed",

    /** Error when value is out of allowed range */
    VALUE_OUT_OF_RANGE: "Value is out of allowed range",
} as const;

/**
 * System-related error messages.
 *
 * @remarks
 * Error messages for general system operations, infrastructure issues, and
 * application-level errors.
 *
 * @public
 */
export const SYSTEM_ERRORS = {
    /** Error when resource access is denied */
    ACCESS_DENIED: "Access denied",

    /** Error when cleanup operation fails */
    CLEANUP_FAILED: "Cleanup operation failed",

    /** Error when configuration is missing or invalid */
    CONFIGURATION_ERROR: "Configuration error",

    /** Error when initialization fails */
    INITIALIZATION_FAILED: "Initialization failed",

    /** Generic internal server error */
    INTERNAL_ERROR: "An internal error occurred",

    /** Error when operation fails and no fallback value provided */
    OPERATION_FAILED_NO_FALLBACK:
        "Operation failed and no fallback value provided",

    /** Error when operation is not permitted */
    OPERATION_NOT_PERMITTED: "Operation not permitted",

    /** Error when operation times out */
    OPERATION_TIMEOUT: "Operation timed out",

    /** Error when service is unavailable */
    SERVICE_UNAVAILABLE: "Service temporarily unavailable",

    /** Default message when an unknown non-Error value was thrown. */
    UNKNOWN_ERROR: "Unknown error",
} as const;

/**
 * Network-related error messages.
 *
 * @remarks
 * Error messages for network operations, connectivity issues, and communication
 * errors.
 *
 * @public
 */
export const NETWORK_ERRORS = {
    /** Error when authentication fails */
    AUTHENTICATION_FAILED: "Authentication failed",

    /** Error when authorization fails */
    AUTHORIZATION_FAILED: "Authorization failed",

    /** Error when request is malformed */
    BAD_REQUEST: "Bad request",

    /** Error when network connection fails */
    CONNECTION_FAILED: "Network connection failed",

    /** Error when connection times out */
    CONNECTION_TIMEOUT: "Connection timed out",

    /** Error when DNS resolution fails */
    DNS_RESOLUTION_FAILED: "DNS resolution failed",

    /** Error when host cannot be reached */
    HOST_UNREACHABLE: "Host unreachable",

    /** Error when resource is not found */
    RESOURCE_NOT_FOUND: "Resource not found",

    /** Error when server returns error */
    SERVER_ERROR: "Server error",

    /** Error when SSL/TLS connection fails */
    SSL_CONNECTION_FAILED: "SSL/TLS connection failed",
} as const;

/**
 * Database-related error messages.
 *
 * @remarks
 * Error messages for database operations, data persistence issues, and data
 * integrity errors.
 *
 * @public
 */
export const DATABASE_ERRORS = {
    /** Error when backup operation fails */
    BACKUP_FAILED: "Backup operation failed",

    /** Error when database connection fails */
    CONNECTION_FAILED: "Database connection failed",

    /** Error when data constraint is violated */
    CONSTRAINT_VIOLATION: "Data constraint violation",

    /** Error when database is locked */
    DATABASE_LOCKED: "Database is locked",

    /** Error when duplicate entry is detected */
    DUPLICATE_ENTRY: "Duplicate entry detected",

    /** Error when import data format is invalid */
    IMPORT_DATA_INVALID: "Invalid import data format",

    /** Error when query execution fails */
    QUERY_FAILED: "Database query failed",

    /** Error when record is not found */
    RECORD_NOT_FOUND: "Record not found",

    /** Error when restore operation fails */
    RESTORE_FAILED: "Restore operation failed",

    /** Error when transaction fails */
    TRANSACTION_FAILED: "Database transaction failed",
} as const;

/**
 * IPC (Inter-Process Communication) error messages.
 *
 * @remarks
 * Error messages for IPC operations, validation, and communication between main
 * and renderer processes.
 *
 * @public
 */
export const IPC_ERRORS = {
    /** Error when IPC response format is invalid */
    INVALID_RESPONSE_FORMAT: "Invalid IPC response format",

    /** Error when IPC operation fails */
    IPC_OPERATION_FAILED: "Operation failed",

    /** Error when IPC validation fails */
    VALIDATION_FAILED: "IPC validation failed",
} as const;

/**
 * Interface for the error catalog structure.
 *
 * @public
 */
export interface ErrorCatalogInterface {
    readonly database: typeof DATABASE_ERRORS;
    readonly ipc: typeof IPC_ERRORS;
    readonly monitors: typeof MONITOR_ERRORS;
    readonly network: typeof NETWORK_ERRORS;
    readonly sites: typeof SITE_ERRORS;
    readonly system: typeof SYSTEM_ERRORS;
    readonly validation: typeof VALIDATION_ERRORS;
}

/**
 * Comprehensive error message catalog organized by domain.
 *
 * @remarks
 * This catalog provides all error messages organized by functional domain for
 * easy access and consistent usage across the application. Each domain contains
 * related error messages that can be used throughout the codebase.
 *
 * @public
 */
export const ERROR_CATALOG: ErrorCatalogInterface = {
    database: DATABASE_ERRORS,
    ipc: IPC_ERRORS,
    monitors: MONITOR_ERRORS,
    network: NETWORK_ERRORS,
    sites: SITE_ERRORS,
    system: SYSTEM_ERRORS,
    validation: VALIDATION_ERRORS,
} as const;

/**
 * Type representing all possible error message values.
 *
 * @remarks
 * Union type of all error message strings from the catalog, useful for
 * type-safe error handling and message validation.
 *
 * @public
 */
export type ErrorMessage =
    | (typeof DATABASE_ERRORS)[keyof typeof DATABASE_ERRORS]
    | (typeof IPC_ERRORS)[keyof typeof IPC_ERRORS]
    | (typeof MONITOR_ERRORS)[keyof typeof MONITOR_ERRORS]
    | (typeof NETWORK_ERRORS)[keyof typeof NETWORK_ERRORS]
    | (typeof SITE_ERRORS)[keyof typeof SITE_ERRORS]
    | (typeof SYSTEM_ERRORS)[keyof typeof SYSTEM_ERRORS]
    | (typeof VALIDATION_ERRORS)[keyof typeof VALIDATION_ERRORS];

/**
 * Helper function to create parameterized error messages.
 *
 * @example
 *
 * ```typescript
 * const message = formatErrorMessage("Invalid monitor status: {status}", {
 *     status: "invalid",
 * });
 * // Returns: "Invalid monitor status: invalid"
 *
 * const message = formatErrorMessage(
 *     "Validator error for event '{event}': {error}",
 *     {
 *         event: "user:login",
 *         error: "User ID required",
 *     }
 * );
 * // Returns: "Validator error for event 'user:login': User ID required"
 * ```
 *
 * @param template - Error message template with placeholders
 * @param params - Parameters to substitute in the template
 *
 * @returns Formatted error message string
 *
 * @public
 */
export function formatErrorMessage(
    template: string,
    params: Record<string, number | string>
): string {
    let result = template;
    for (const [key, value] of Object.entries(params)) {
        // Skip dangerous keys for security (prevent prototype pollution)
        const isDangerousKey =
            key === "__proto__" ||
            key === "constructor" ||
            key === "prototype";

        if (!isDangerousKey) {
            const placeholder = `{${key}}`;
            const stringValue = String(value);
            // Use replacement function to avoid special replacement pattern interpretation
            result = result.replaceAll(placeholder, () => stringValue);
        }
    }
    return result;
}

/**
 * Helper function to get error message by category and key.
 *
 * @example
 *
 * ```typescript
 * const message = getErrorMessage("sites", "NOT_FOUND");
 * // Returns: "Site not found"
 * ```
 *
 * @param category - Error category (e.g., "sites", "monitors")
 * @param key - Error key within the category
 *
 * @returns Error message string
 *
 * @public
 */

/**
 * Helper function to check if a string is a valid error message.
 *
 * @param message - String to check
 *
 * @returns True if the string matches a known error message
 *
 * @public
 */
export function isKnownErrorMessage(message: string): message is ErrorMessage {
    const allMessages = Object.values(ERROR_CATALOG).flatMap((category) =>
        Object.values(castUnchecked<Record<string, string>>(category))
    );

    return allMessages.includes(castUnchecked<ErrorMessage>(message));
}

/**
 * Derives a user-friendly message from an unknown error value.
 *
 * @remarks
 * This helper replaces the legacy `@shared/utils/errorUtils.getErrorMessage`
 * implementation so that fallback strings come from the centralized
 * {@link ERROR_CATALOG}.
 *
 * - When the supplied value is an {@link Error} instance, the underlying `message`
 *   property is returned.
 * - All other values yield the provided fallback string.
 */
export function getUnknownErrorMessage(
    error: unknown,
    fallback: string = ERROR_CATALOG.system.UNKNOWN_ERROR
): string {
    return error instanceof Error ? error.message : fallback;
}
