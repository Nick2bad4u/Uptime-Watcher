/**
 * Monitor validation logic extracted for better separation of concerns.
 * Handles all monitor-specific validation rules.
 */

import { Site } from "../../types";
import { ValidationResult } from "../ConfigurationManager";

/**
 * Validates monitor configuration according to business rules.
 * Focused on monitor-level validation concerns.
 */
export class MonitorValidator {
    /**
     * Validate monitor configuration according to business rules.
     */
    public validateMonitorConfiguration(monitor: Site["monitors"][0]): ValidationResult {
        const errors: string[] = [];

        // Validate monitor type
        errors.push(...this.validateMonitorType(monitor));

        // Type-specific validation
        errors.push(...this.validateMonitorTypeSpecific(monitor));

        // Validate timing constraints
        errors.push(...this.validateTimingConstraints(monitor));

        // Validate retry attempts
        errors.push(...this.validateRetryAttempts(monitor));

        return {
            errors,
            isValid: errors.length === 0,
        };
    }

    /**
     * Validate monitor type is present.
     */
    private validateMonitorType(monitor: Site["monitors"][0]): string[] {
        const errors: string[] = [];

        if (!monitor.type) {
            errors.push("Monitor type is required");
        }

        return errors;
    }

    /**
     * Validate monitor type-specific requirements.
     */
    private validateMonitorTypeSpecific(monitor: Site["monitors"][0]): string[] {
        const errors: string[] = [];

        if (monitor.type === "http") {
            errors.push(...this.validateHttpMonitor(monitor));
        } else if (monitor.type === "port") {
            errors.push(...this.validatePortMonitor(monitor));
        }

        return errors;
    }

    /**
     * Validate HTTP monitor specific requirements.
     */
    private validateHttpMonitor(monitor: Site["monitors"][0]): string[] {
        const errors: string[] = [];

        if (!monitor.url) {
            errors.push("HTTP monitors must have a URL");
        } else if (!this.isValidUrl(monitor.url)) {
            errors.push("HTTP monitors must have a valid URL");
        }

        return errors;
    }

    /**
     * Validate port monitor specific requirements.
     */
    private validatePortMonitor(monitor: Site["monitors"][0]): string[] {
        const errors: string[] = [];

        if (!monitor.host) {
            errors.push("Port monitors must have a host");
        }

        if (!monitor.port || monitor.port <= 0 || monitor.port > 65535) {
            errors.push("Port monitors must have a valid port number (1-65535)");
        }

        return errors;
    }

    /**
     * Validate timing constraints (intervals, timeouts).
     */
    private validateTimingConstraints(monitor: Site["monitors"][0]): string[] {
        const errors: string[] = [];

        if (monitor.checkInterval !== undefined && monitor.checkInterval < 1000) {
            errors.push("Monitor check interval must be at least 1000ms");
        }

        if (monitor.timeout !== undefined && monitor.timeout < 1000) {
            errors.push("Monitor timeout must be at least 1000ms");
        }

        return errors;
    }

    /**
     * Validate retry attempts configuration.
     */
    private validateRetryAttempts(monitor: Site["monitors"][0]): string[] {
        const errors: string[] = [];

        if (monitor.retryAttempts !== undefined && monitor.retryAttempts < 0) {
            errors.push("Monitor retry attempts cannot be negative");
        }

        return errors;
    }

    /**
     * Business rule: Determine if a monitor should receive a default interval.
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return monitor.checkInterval === undefined || monitor.checkInterval === 0;
    }

    /**
     * Validate if a URL is properly formatted.
     */
    private isValidUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        } catch {
            return false;
        }
    }
}
