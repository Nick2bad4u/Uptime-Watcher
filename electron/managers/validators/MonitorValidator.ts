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
 *
 * @remarks
 * This class provides monitor validation logic for SiteManager and ConfigurationManager.
 * It uses registry-driven validation and shared Zod schemas to ensure consistency between frontend and backend validation rules.
 *
 * @example
 * ```typescript
 * const validator = new MonitorValidator();
 * const result = validator.validateMonitorConfiguration(monitor);
 * if (!result.isValid) {
 *   console.error(result.errors);
 * }
 * ```
 *
 * @public
 */
export class MonitorValidator {
    /**
     * Determines if a monitor should receive a default check interval according to business rules.
     *
     * @param monitor - The monitor configuration to evaluate.
     * @returns True if the monitor should receive a default check interval.
     *
     * @remarks
     * A default interval is applied if the monitor's checkInterval is zero.
     *
     * @example
     * ```typescript
     * if (validator.shouldApplyDefaultInterval(monitor)) {
     *   monitor.checkInterval = DEFAULT_INTERVAL;
     * }
     * ```
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return monitor.checkInterval === 0;
    }

    /**
     * Validates a monitor configuration according to business rules and shared Zod schemas.
     *
     * @param monitor - The monitor configuration to validate.
     * @returns Validation result with errors and validity status.
     *
     * @remarks
     * Uses registry-driven validation for timing, retry attempts, and type-specific requirements.
     *
     * @example
     * ```typescript
     * const result = validator.validateMonitorConfiguration(monitor);
     * if (!result.isValid) {
     *   console.error(result.errors);
     * }
     * ```
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
     * Validates monitor type-specific requirements using registry and Zod schemas.
     *
     * @param monitor - The monitor configuration to validate.
     * @returns Array of validation errors (empty if valid).
     *
     * @remarks
     * Checks monitor type against registered types and validates type-specific properties using Zod schemas.
     * Returns an array of error messages if validation fails, or an empty array if valid.
     *
     * @example
     * ```typescript
     * const errors = validator["validateMonitorTypeSpecific"](monitor);
     * if (errors.length > 0) {
     *   console.error(errors);
     * }
     * ```
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
