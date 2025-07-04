/**
 * Monitor operations utility for handling monitor-related operations.
 * Provides utilities for working with monitor data and configurations.
 */

import type { Monitor, MonitorType, Site } from "../../types";

import { ERROR_MESSAGES } from "../../types";

/**
 * Creates a default monitor for a site
 */
export function createDefaultMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        checkInterval: 300000, // 5 minutes default
        history: [],
        id: overrides.id ?? crypto.randomUUID(),
        monitoring: true,
        status: "pending",
        type: "http" as MonitorType,
        ...overrides,
    };
}

/**
 * Validates monitor data
 */
export function validateMonitor(monitor: Partial<Monitor>): monitor is Monitor {
    return (
        typeof monitor.id === "string" &&
        typeof monitor.type === "string" &&
        typeof monitor.status === "string" &&
        ["pending", "up", "down"].includes(monitor.status) &&
        typeof monitor.monitoring === "boolean" &&
        Array.isArray(monitor.history)
    );
}

/**
 * Normalizes monitor data ensuring all required fields are present
 */
export function normalizeMonitor(monitor: Partial<Monitor>): Monitor {
    return {
        history: monitor.history ?? [],
        id: monitor.id ?? crypto.randomUUID(),
        status: ["pending", "up", "down"].includes(monitor.status as string)
            ? (monitor.status as Monitor["status"])
            : "pending",
        type: monitor.type ?? "http",
        // Only add optional fields if they are explicitly provided
        ...(monitor.url !== undefined && { url: monitor.url }),
        ...(monitor.host !== undefined && { host: monitor.host }),
        ...(monitor.port !== undefined && { port: monitor.port }),
        ...(monitor.responseTime !== undefined && { responseTime: monitor.responseTime }),
        ...(monitor.lastChecked !== undefined && { lastChecked: monitor.lastChecked }),
        ...(monitor.monitoring !== undefined && { monitoring: monitor.monitoring }),
        ...(monitor.checkInterval !== undefined && { checkInterval: monitor.checkInterval }),
        ...(monitor.timeout !== undefined && { timeout: monitor.timeout }),
        ...(monitor.retryAttempts !== undefined && { retryAttempts: monitor.retryAttempts }),
    };
}

/**
 * Finds a monitor in a site by ID
 */
export function findMonitorInSite(site: Site, monitorId: string): Monitor | undefined {
    return site.monitors.find((monitor) => monitor.id === monitorId);
}

/**
 * Updates a monitor in a site
 */
export function updateMonitorInSite(site: Site, monitorId: string, updates: Partial<Monitor>): Site {
    const monitorExists = site.monitors.some((monitor) => monitor.id === monitorId);
    if (!monitorExists) {
        throw new Error("Monitor not found");
    }

    const updatedMonitors = site.monitors.map((monitor) =>
        monitor.id === monitorId ? { ...monitor, ...updates } : monitor
    );

    return { ...site, monitors: updatedMonitors };
}

/**
 * Adds a monitor to a site
 */
export function addMonitorToSite(site: Site, monitor: Monitor): Site {
    const updatedMonitors = [...site.monitors, monitor];
    return { ...site, monitors: updatedMonitors };
}

/**
 * Removes a monitor from a site
 */
export function removeMonitorFromSite(site: Site, monitorId: string): Site {
    const updatedMonitors = site.monitors.filter((monitor) => monitor.id !== monitorId);
    return { ...site, monitors: updatedMonitors };
}

/**
 * Validates that a monitor exists in a site
 */
export function validateMonitorExists(site: Site | undefined, monitorId: string): void {
    if (!site) {
        throw new Error(ERROR_MESSAGES.SITE_NOT_FOUND);
    }

    const monitor = findMonitorInSite(site, monitorId);
    if (!monitor) {
        throw new Error("Monitor not found");
    }
}

/**
 * Creates monitor update operations
 */
export const monitorOperations = {
    /**
     * Toggle monitor monitoring state
     */
    toggleMonitoring: (monitor: Monitor): Monitor => ({
        ...monitor,
        monitoring: !monitor.monitoring,
    }),
    /**
     * Update monitor check interval
     */
    updateCheckInterval: (monitor: Monitor, interval: number): Monitor => ({
        ...monitor,
        checkInterval: interval,
    }),
    /**
     * Update monitor retry attempts
     */
    updateRetryAttempts: (monitor: Monitor, retryAttempts: number | undefined): Monitor => ({
        ...monitor,
        retryAttempts,
    }),
    /**
     * Update monitor status
     */
    updateStatus: (monitor: Monitor, status: Monitor["status"]): Monitor => ({
        ...monitor,
        status,
    }),
    /**
     * Update monitor timeout
     */
    updateTimeout: (monitor: Monitor, timeout: number | undefined): Monitor => ({
        ...monitor,
        timeout,
    }),
};
