/**
 * Shared validation utilities for monitors and sites.
 * Provides consistent validation logic across frontend and backend.
 */

import { isMonitorStatus, type Monitor, type MonitorType, type Site, validateMonitor } from "../types";

/**
 * Gets validation errors for monitor fields based on monitor type.
 *
 * @param monitor - Partial monitor data to validate
 * @returns Array of validation error messages (empty if valid)
 *
 * @remarks
 * Validates required fields and type-specific constraints for monitors.
 * Returns descriptive error messages for any validation failures.
 */
export function getMonitorValidationErrors(monitor: Partial<Monitor>): string[] {
    const errors: string[] = [];

    // Validate basic required fields
    validateBasicMonitorFields(monitor, errors);

    // Validate type-specific requirements
    validateTypeSpecificFields(monitor, errors);

    return errors;
}

/**
 * Validates monitor type.
 *
 * @param type - Value to check as monitor type
 * @returns Type predicate indicating if the value is a valid MonitorType
 */
export function validateMonitorType(type: unknown): type is MonitorType {
    return typeof type === "string" && (type === "http" || type === "port");
}

/**
 * Validates site data structure.
 *
 * @param site - Partial site data to validate
 * @returns Type predicate indicating if the site is valid
 *
 * @remarks
 * Performs comprehensive validation of site structure including all monitors.
 * Uses proper type guards to ensure runtime safety.
 */
export function validateSite(site: Partial<Site>): site is Site {
    return (
        typeof site.identifier === "string" &&
        site.identifier.length > 0 &&
        typeof site.name === "string" &&
        site.name.length > 0 &&
        typeof site.monitoring === "boolean" &&
        Array.isArray(site.monitors) &&
        site.monitors.every((monitor: unknown) => isPartialMonitor(monitor) && validateMonitor(monitor))
    );
}

/**
 * Type guard to check if a value is a partial monitor object.
 *
 * @param value - Value to check
 * @returns Type predicate indicating if the value could be a partial monitor
 */
function isPartialMonitor(value: unknown): value is Partial<Monitor> {
    return typeof value === "object" && value !== null;
}

/**
 * Validates basic required monitor fields.
 *
 * @remarks
 * Checks for required fields such as id, type, and status, and validates their types. Adds error messages to the provided errors array for any missing or invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 * @internal
 */
function validateBasicMonitorFields(monitor: Partial<Monitor>, errors: string[]): void {
    if (!monitor.id) {
        errors.push("Monitor ID is required");
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
}

/**
 * Validates HTTP monitor-specific fields.
 *
 * @remarks
 * Checks that the url field is present and a string. Adds an error message if missing or invalid.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 * @internal
 */
function validateHttpMonitorFields(monitor: Partial<Monitor>, errors: string[]): void {
    if (!monitor.url || typeof monitor.url !== "string") {
        errors.push("URL is required for HTTP monitors");
    }
}

/**
 * Validates port monitor-specific fields.
 *
 * @remarks
 * Checks that the host field is present and a string, and that the port is a valid number in the range 1-65535. Adds error messages for any missing or invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 * @internal
 */
function validatePortMonitorFields(monitor: Partial<Monitor>, errors: string[]): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for port monitors");
    }
    if (typeof monitor.port !== "number" || monitor.port < 1 || monitor.port > 65_535) {
        errors.push("Valid port number (1-65535) is required for port monitors");
    }
}

/**
 * Validates type-specific monitor fields by delegating to the appropriate field validator.
 *
 * @remarks
 * Calls the correct field validation function based on the monitor type ("http" or "port"). Adds error messages to the provided errors array for any missing or invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
 * @internal
 */
function validateTypeSpecificFields(monitor: Partial<Monitor>, errors: string[]): void {
    if (monitor.type === "http") {
        validateHttpMonitorFields(monitor, errors);
    } else if (monitor.type === "port") {
        validatePortMonitorFields(monitor, errors);
    }
}
