/**
 * Shared validation utilities for monitors and sites.
 * Provides consistent validation logic across frontend and backend.
 */

import { isMonitorStatus, type Monitor, type MonitorType, type Site } from "../types";

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

    // Type-specific validation
    if (monitor.type === "http") {
        if (!monitor.url || typeof monitor.url !== "string") {
            errors.push("URL is required for HTTP monitors");
        }
    } else if (monitor.type === "port") {
        if (!monitor.host || typeof monitor.host !== "string") {
            errors.push("Host is required for port monitors");
        }
        if (typeof monitor.port !== "number" || monitor.port < 1 || monitor.port > 65_535) {
            errors.push("Valid port number (1-65535) is required for port monitors");
        }
    }

    return errors;
}

/**
 * Enhanced monitor validation using shared type guards.
 * Provides consistent validation across frontend and backend.
 *
 * @param monitor - Partial monitor data to validate
 * @returns Type predicate indicating if the monitor is valid
 */
export function validateMonitor(monitor: Partial<Monitor>): monitor is Monitor {
    return (
        typeof monitor.id === "string" &&
        typeof monitor.type === "string" &&
        typeof monitor.status === "string" &&
        isMonitorStatus(monitor.status) &&
        typeof monitor.monitoring === "boolean" &&
        typeof monitor.responseTime === "number" &&
        typeof monitor.checkInterval === "number" &&
        typeof monitor.timeout === "number" &&
        typeof monitor.retryAttempts === "number" &&
        Array.isArray(monitor.history)
    );
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
