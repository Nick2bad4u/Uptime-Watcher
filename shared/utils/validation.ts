/**
 * Shared validation utilities for monitors and sites.
 *
 * @remarks
 * Provides consistent validation logic across frontend and backend
 * implementations, ensuring data integrity and type safety.
 *
 * @packageDocumentation
 */

import {
    isMonitorStatus,
    type Monitor,
    type MonitorType,
    type Site,
    validateMonitor,
} from "@shared/types";

/**
 * Validates monitor type.
 *
 * @remarks
 * Supports all monitor types: HTTP, port, ping, and DNS monitors.
 *
 * @param type - Value to check as monitor type
 *
 * @returns Type predicate indicating if the value is a valid MonitorType
 */
export function validateMonitorType(type: unknown): type is MonitorType {
    return (
        typeof type === "string" &&
        (type === "http" ||
            type === "port" ||
            type === "ping" ||
            type === "dns" ||
            type === "ssl")
    );
}

/**
 * Type guard to check if a value is a partial monitor object.
 *
 * @param value - Value to check
 *
 * @returns Type predicate indicating if the value could be a partial monitor
 */
function isPartialMonitor(value: unknown): value is Partial<Monitor> {
    return typeof value === "object" && value !== null;
}

/**
 * Validates basic required monitor fields.
 *
 * @remarks
 * Checks for required fields such as id, type, and status, and validates their
 * types. Adds error messages to the provided errors array for any missing or
 * invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validateBasicMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.id) {
        errors.push("Monitor id is required");
    }

    if (!monitor.type) {
        errors.push("Monitor type is required");
    } else if (!validateMonitorType(monitor.type)) {
        errors.push("Invalid monitor type");
    }

    if (!monitor.status) {
        errors.push("Monitor status is required");
    } else if (!isMonitorStatus(monitor.status)) {
        errors.push("Invalid monitor status");
    }

    // Validate numeric fields
    if (
        monitor.checkInterval !== undefined &&
        (typeof monitor.checkInterval !== "number" ||
            !Number.isFinite(monitor.checkInterval) ||
            monitor.checkInterval < 1000)
    ) {
        errors.push("Check interval must be at least 1000ms");
    }

    if (
        monitor.timeout !== undefined &&
        (typeof monitor.timeout !== "number" ||
            !Number.isFinite(monitor.timeout) ||
            monitor.timeout <= 0)
    ) {
        errors.push("Timeout must be a positive number");
    }

    if (
        monitor.retryAttempts !== undefined &&
        (typeof monitor.retryAttempts !== "number" ||
            !Number.isFinite(monitor.retryAttempts) ||
            monitor.retryAttempts < 0 ||
            monitor.retryAttempts > 10)
    ) {
        errors.push("Retry attempts must be between 0 and 10");
    }
}

/**
 * Validates HTTP monitor-specific fields.
 *
 * @remarks
 * Checks that the url field is present and a string. Adds an error message if
 * missing or invalid.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validateHttpMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.url || typeof monitor.url !== "string") {
        errors.push("URL is required for HTTP monitors");
    }
}

/**
 * Validates HTTP keyword monitor-specific fields.
 *
 * @remarks
 * Checks that the url and bodyKeyword fields are present and valid. The
 * bodyKeyword field must be a non-empty string. Adds error messages for any
 * missing or invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validateHttpKeywordMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    validateHttpMonitorFields(monitor, errors);
    if (!monitor.bodyKeyword || typeof monitor.bodyKeyword !== "string") {
        errors.push("Keyword is required for HTTP keyword monitors");
    } else if (monitor.bodyKeyword.trim().length === 0) {
        errors.push("Keyword must not be empty");
    }
}

/**
 * Validates HTTP status monitor-specific fields.
 *
 * @remarks
 * Checks that the url field is present and a string, and that the
 * expectedStatusCode is a number between 100 and 599. Adds error messages for
 * any missing or invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validateHttpStatusMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    validateHttpMonitorFields(monitor, errors);
    if (typeof monitor.expectedStatusCode !== "number") {
        errors.push(
            "Expected status code is required for HTTP status monitors"
        );
    } else if (
        !Number.isInteger(monitor.expectedStatusCode) ||
        monitor.expectedStatusCode < 100 ||
        monitor.expectedStatusCode > 599
    ) {
        errors.push("Expected status code must be between 100 and 599");
    }
}

/**
 * Validates ping monitor-specific fields.
 *
 * @remarks
 * Checks that the host field is present and a string. Ping monitors only
 * require a host field, unlike port monitors which also require a port number.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validatePingMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for ping monitors");
    }
}

/**
 * Validates port monitor-specific fields.
 *
 * @remarks
 * Checks that the host field is present and a string, and that the port is a
 * valid number in the range 1-65535. Adds error messages for any missing or
 * invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validatePortMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for port monitors");
    }
    if (
        typeof monitor.port !== "number" ||
        !Number.isFinite(monitor.port) ||
        monitor.port < 1 ||
        monitor.port > 65_535
    ) {
        errors.push(
            "Valid port number (1-65535) is required for port monitors"
        );
    }
}

/**
 * Validates DNS monitor-specific fields.
 *
 * @remarks
 * Checks that the hostname field is present and a string, and that recordType
 * is a valid DNS record type. DNS monitors require hostname (not host) and
 * recordType fields for proper DNS resolution.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validateDnsMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for DNS monitors");
    }
    if (!monitor.recordType || typeof monitor.recordType !== "string") {
        errors.push("Record type is required for DNS monitors");
    } else {
        const validRecordTypes = [
            "A",
            "AAAA",
            "ANY",
            "CAA",
            "CNAME",
            "MX",
            "NAPTR",
            "NS",
            "PTR",
            "SOA",
            "SRV",
            "TLSA",
            "TXT",
        ];
        if (!validRecordTypes.includes(monitor.recordType.toUpperCase())) {
            errors.push(
                `Invalid record type: ${monitor.recordType}. Valid types are: ${validRecordTypes.join(
                    ", "
                )}`
            );
        }
    }
}

/**
 * Validates SSL monitor-specific fields.
 *
 * @remarks
 * Ensures host, port, and certificate warning threshold are valid.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validateSslMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for SSL monitors");
    }
    if (
        typeof monitor.port !== "number" ||
        !Number.isFinite(monitor.port) ||
        monitor.port < 1 ||
        monitor.port > 65_535
    ) {
        errors.push("Valid port number (1-65535) is required for SSL monitors");
    }
    if (
        typeof monitor.certificateWarningDays !== "number" ||
        !Number.isFinite(monitor.certificateWarningDays) ||
        monitor.certificateWarningDays < 1 ||
        monitor.certificateWarningDays > 365
    ) {
        errors.push(
            "Certificate warning threshold must be between 1 and 365 days for SSL monitors"
        );
    }
}

/**
 * Validates type-specific monitor fields by delegating to the appropriate field
 * validator.
 *
 * @remarks
 * Calls the correct field validation function based on the monitor type
 * ("http", "port", or "ping"). Adds error messages to the provided errors array
 * for any missing or invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 *
 * @internal
 */
function validateTypeSpecificFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.type) {
        return; // Type validation is handled separately in validateBasicMonitorFields
    }

    switch (monitor.type) {
        case "dns": {
            validateDnsMonitorFields(monitor, errors);
            break;
        }
        case "http": {
            validateHttpMonitorFields(monitor, errors);
            break;
        }
        case "http-keyword": {
            validateHttpKeywordMonitorFields(monitor, errors);
            break;
        }
        case "http-status": {
            validateHttpStatusMonitorFields(monitor, errors);
            break;
        }
        case "ping": {
            validatePingMonitorFields(monitor, errors);
            break;
        }
        case "port": {
            validatePortMonitorFields(monitor, errors);
            break;
        }
        case "ssl": {
            validateSslMonitorFields(monitor, errors);
            break;
        }
        default: {
            errors.push(`Unknown monitor type: ${String(monitor.type)}`);
            break;
        }
    }
}

/**
 * Gets validation errors for monitor fields based on monitor type.
 *
 * @remarks
 * Validates required fields and type-specific constraints for monitors. Returns
 * descriptive error messages for any validation failures.
 *
 * @param monitor - Partial monitor data to validate
 *
 * @returns Array of validation error messages (empty if valid)
 */
export function getMonitorValidationErrors(
    monitor: Partial<Monitor>
): string[] {
    const errors: string[] = [];

    // Validate basic required fields
    validateBasicMonitorFields(monitor, errors);

    // Validate type-specific requirements
    validateTypeSpecificFields(monitor, errors);

    return errors;
}

/**
 * Validates site data structure.
 *
 * @remarks
 * Performs comprehensive validation of site structure including all monitors.
 * Uses proper type guards to ensure runtime safety.
 *
 * @param site - Partial site data to validate
 *
 * @returns Type predicate indicating if the site is valid
 */
export function validateSite(site: Partial<Site>): site is Site {
    // Defensive null/undefined check is necessary for runtime safety with user input
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Defensive check needed for runtime type safety with potentially malformed user data
    if (typeof site !== "object" || !site) {
        return false;
    }

    return (
        typeof site.identifier === "string" &&
        site.identifier.length > 0 &&
        typeof site.name === "string" &&
        site.name.length > 0 &&
        typeof site.monitoring === "boolean" &&
        Array.isArray(site.monitors) &&
        site.monitors.every(
            (monitor: unknown) =>
                isPartialMonitor(monitor) && validateMonitor(monitor)
        )
    );
}
