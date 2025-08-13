/**
 * Provides validation logic for monitor configurations using a registry-driven approach.
 *
 * @remarks
 * This validator is used by {@link SiteManager} and {@link ConfigurationManager} to validate
 * monitor configurations before persistence or updates. It delegates to the
 * {@link MonitorTypeRegistry} for type-specific validation using shared Zod schemas,
 * ensuring consistency between frontend and backend validation rules.
 *
 * The validator performs comprehensive checks including:
 * - Monitor type validation against registered types
 * - Type-specific property validation (URL for HTTP, host/port for port monitors)
 * - Common property validation (intervals, timeouts, retry attempts)
 * - Business rule validation (default intervals, etc.)
 *
 * @public
 */

import type { Site } from "@shared/types";

import { validateMonitorData } from "@shared/validation/schemas";

import type { ValidationResult } from "./interfaces";

import {
    getRegisteredMonitorTypes,
    isValidMonitorType,
} from "../../services/monitoring/MonitorTypeRegistry";

/**
 * Validates monitor configuration according to business rules and shared Zod schemas.
 *
 * @remarks
 * This class provides monitor validation logic for {@link SiteManager} and {@link ConfigurationManager}.
 * It uses registry-driven validation and shared Zod schemas to ensure consistency between frontend and backend validation rules.
 *
 * @public
 */
export class MonitorValidator {
    /**
     * Determines if a monitor should receive a default check interval according to business rules.
     *
     * @remarks
     * A default interval is applied if the monitor's `checkInterval` is zero.
     *
     * @param monitor - The monitor configuration to evaluate. Must be a member of {@link Site.monitors}.
     * @returns `true` if the monitor should receive a default check interval; otherwise, `false`.
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
     * @remarks
     * Uses registry-driven validation for timing, retry attempts, and type-specific requirements.
     *
     * @param monitor - The monitor configuration to validate. Must be a member of {@link Site.monitors}.
     * @returns A {@link ValidationResult} object containing an array of error messages and validity status.
     *
     * @example
     * ```typescript
     * const result = validator.validateMonitorConfiguration(monitor);
     * if (!result.isValid) {
     *   console.error(result.errors);
     * }
     * ```
     */
    public validateMonitorConfiguration(
        monitor: Site["monitors"][0]
    ): ValidationResult {
        // Use shared validation from registry (includes timing, retry attempts, and type-specific validation)
        const errors = this.validateMonitorTypeSpecific(monitor);
        return {
            errors,
            success: errors.length === 0,
        };
    }

    /**
     * Validates monitor type-specific requirements using the monitor type registry and Zod schemas.
     *
     * @remarks
     * Checks monitor type against registered types and validates type-specific properties using Zod schemas.
     * Returns an array of error messages if validation fails, or an empty array if valid.
     *
     * @param monitor - The monitor configuration to validate. Must be a member of {@link Site.monitors}.
     * @returns An array of validation error messages. Empty if the monitor is valid.
     *
     * @example
     * ```typescript
     * const errors = validator["validateMonitorTypeSpecific"](monitor);
     * if (errors.length > 0) {
     *   console.error(errors);
     * }
     * ```
     * @privateRemarks
     * This method is intended for internal use within {@link MonitorValidator}.
     * @internal
     */
    private validateMonitorTypeSpecific(
        monitor: Site["monitors"][0]
    ): string[] {
        // Validate monitor type using registry
        if (!isValidMonitorType(monitor.type)) {
            const availableTypes = getRegisteredMonitorTypes().join(", ");
            return [
                `Invalid monitor type \`${monitor.type}\`. Available types: \`${availableTypes}\``,
            ];
        }

        // Use Zod schema validation from registry
        const validationResult = validateMonitorData(monitor.type, monitor);

        if (!validationResult.success) {
            return validationResult.errors;
        }

        return [];
    }
}
