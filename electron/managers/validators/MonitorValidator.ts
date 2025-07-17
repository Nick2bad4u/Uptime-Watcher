/**
 * Monitor validation logic extracted for better separation of concerns.
 * Handles all monitor-specific validation rules using registry-driven approach.
 */

import { Site } from "../../types";
import { ValidationResult } from "./interfaces";
import {
    validateMonitorData,
    isValidMonitorType,
    getRegisteredMonitorTypes,
} from "../../services/monitoring/MonitorTypeRegistry";

/**
 * Validates monitor configuration according to business rules.
 * Uses registry-driven validation with Zod schemas.
 */
export class MonitorValidator {
    /**
     * Validate monitor configuration according to business rules.
     */
    public validateMonitorConfiguration(monitor: Site["monitors"][0]): ValidationResult {
        const errors: string[] = [
            ...this.validateMonitorTypeSpecific(monitor),
            ...this.validateTimingConstraints(monitor),
            ...this.validateRetryAttempts(monitor),
        ];

        return {
            errors,
            isValid: errors.length === 0,
        };
    }

    /**
     * Validate monitor type-specific requirements using registry and Zod schemas.
     */
    private validateMonitorTypeSpecific(monitor: Site["monitors"][0]): string[] {
        // Validate monitor type using registry
        if (!isValidMonitorType(monitor.type)) {
            const availableTypes = getRegisteredMonitorTypes().join(", ");
            return [`Invalid monitor type '${monitor.type}'. Available types: ${availableTypes}`];
        }

        // Use Zod schema validation from registry
        const validationResult = validateMonitorData(monitor.type, monitor);

        if (!validationResult.success) {
            return validationResult.errors;
        }

        return [];
    }

    /**
     * Validate timing constraints (intervals, timeouts).
     */
    private validateTimingConstraints(monitor: Site["monitors"][0]): string[] {
        const errors: string[] = [];

        if (monitor.checkInterval < 1000) {
            errors.push("Monitor check interval must be at least 1000ms");
        }

        if (monitor.timeout < 1000) {
            errors.push("Monitor timeout must be at least 1000ms");
        }

        return errors;
    }

    /**
     * Validate retry attempts configuration.
     */
    private validateRetryAttempts(monitor: Site["monitors"][0]): string[] {
        const errors: string[] = [];

        if (monitor.retryAttempts < 0) {
            errors.push("Monitor retry attempts cannot be negative");
        }

        return errors;
    }

    /**
     * Business rule: Determine if a monitor should receive a default interval.
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return monitor.checkInterval === 0;
    }
}
