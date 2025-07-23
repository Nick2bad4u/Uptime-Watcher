/**
 * Monitor validation logic extracted for better separation of concerns.
 * Handles all monitor-specific validation rules using registry-driven approach.
 *
 * @remarks
 * This validator is used by SiteManager and ConfigurationManager to validate
 * monitor configurations before persistence or updates. It delegates to the
 * MonitorTypeRegistry for type-specific validation using shared Zod schemas,
 * ensuring consistency between frontend and backend validation rules.
 *
 * The validator performs comprehensive checks including:
 * - Monitor type validation against registered types
 * - Type-specific property validation (URL for HTTP, host/port for port monitors)
 * - Common property validation (intervals, timeouts, retry attempts)
 * - Business rule validation (default intervals, etc.)
 */

import {
    getRegisteredMonitorTypes,
    isValidMonitorType,
    validateMonitorData,
} from "../../services/monitoring/MonitorTypeRegistry";
import { Site } from "../../types";
import { ValidationResult } from "./interfaces";

/**
 * Validates monitor configuration according to business rules.
 * Uses registry-driven validation with Zod schemas.
 */
export class MonitorValidator {
    /**
     * Business rule: Determine if a monitor should receive a default interval.
     *
     * @param monitor - The monitor configuration to evaluate
     * @returns True if the monitor should receive a default check interval
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return monitor.checkInterval === 0;
    }

    /**
     * Validate monitor configuration according to business rules.
     * Uses shared Zod schemas for comprehensive validation.
     *
     * @param monitor - The monitor configuration to validate
     * @returns Validation result with errors and validity status
     */
    public validateMonitorConfiguration(monitor: Site["monitors"][0]): ValidationResult {
        // Use shared validation from registry (includes timing, retry attempts, and type-specific validation)
        const errors = this.validateMonitorTypeSpecific(monitor);

        return {
            errors,
            isValid: errors.length === 0,
        };
    }

    /**
     * Validate monitor type-specific requirements using registry and Zod schemas.
     *
     * @param monitor - The monitor configuration to validate
     * @returns Array of validation errors (empty if valid)
     */
    private validateMonitorTypeSpecific(monitor: Site["monitors"][0]): string[] {
        // Validate monitor type using registry
        if (!isValidMonitorType(monitor.type)) {
            const availableTypes = getRegisteredMonitorTypes().join(", ");
            return [`Invalid monitor type \`${monitor.type}\`. Available types: \`${availableTypes}\``];
        }

        // Use Zod schema validation from registry
        const validationResult = validateMonitorData(monitor.type, monitor);

        if (!validationResult.success) {
            return validationResult.errors;
        }

        return [];
    }
}
