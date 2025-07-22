/**
 * Shared validation utilities for monitors and sites.
 * Provides consistent validation logic across frontend and backend.
 */

import { isMonitorStatus, type Monitor, type MonitorType, type Site } from "../types";

/**
 * Enhanced monitor validation using shared type guards.
 * Provides consistent validation across frontend and backend.
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
 * Validates required monitor fields for a given monitor type.
 */
export function validateMonitorFields(monitor: Partial<Monitor>): string[] {
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
        if (!monitor.port || typeof monitor.port !== "number" || monitor.port < 1 || monitor.port > 65_535) {
            errors.push("Valid port number (1-65535) is required for port monitors");
        }
    }

    return errors;
}

/**
 * Validates monitor type.
 */
export function validateMonitorType(type: unknown): type is MonitorType {
    return typeof type === "string" && (type === "http" || type === "port");
}

/**
 * Validates site data structure.
 */
export function validateSite(site: Partial<Site>): site is Site {
    return (
        typeof site.identifier === "string" &&
        site.identifier.length > 0 &&
        typeof site.name === "string" &&
        site.name.length > 0 &&
        typeof site.monitoring === "boolean" &&
        Array.isArray(site.monitors) &&
        site.monitors.every((monitor: unknown) => validateMonitor(monitor as Partial<Monitor>))
    );
}
