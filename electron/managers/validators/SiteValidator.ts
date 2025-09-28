/**
 * Site validation logic extracted for better separation of concerns.
 *
 * @remarks
 * Validates site configuration according to business rules and handles all
 * site-specific validation concerns. This class focuses on site-level
 * validation and delegates monitor validation to the specialized
 * MonitorValidator.
 *
 * The validator performs comprehensive checks including:
 *
 * - Site identifier validation (non-empty string requirement)
 * - Monitor array structure validation
 * - Individual monitor configuration validation
 *
 * @example
 *
 * ```typescript
 * const validator = new SiteValidator();
 * const result = validator.validateSiteConfiguration(site);
 * if (!result.isValid) {
 *     console.error("Validation errors:", result.errors);
 * }
 * ```
 */

import type { Site } from "@shared/types";

import { isNonEmptyString } from "@shared/validation/validatorUtils";

import type { ValidationResult } from "./interfaces";

import { MonitorValidator } from "./MonitorValidator";

/**
 * Validates site configuration according to business rules.
 *
 * @remarks
 * Focused on site-level validation concerns including identifier validation and
 * monitor array validation. Delegates monitor validation to
 * {@link MonitorValidator} for comprehensive monitor checks.
 *
 * @example
 *
 * ```typescript
 * const validator = new SiteValidator();
 * const result = validator.validateSiteConfiguration(site);
 * if (!result.isValid) {
 *     console.error("Validation errors:", result.errors);
 * }
 * ```
 *
 * @public
 */
export class SiteValidator {
    /**
     * Monitor validator instance for delegating monitor-specific validation.
     *
     * @remarks
     * Used internally to validate each monitor in the site configuration.
     *
     * @readonly
     */
    private readonly monitorValidator: MonitorValidator;

    /**
     * Create a new SiteValidator instance.
     *
     * @remarks
     * Instantiates a {@link MonitorValidator} for monitor validation delegation.
     */
    public constructor() {
        this.monitorValidator = new MonitorValidator();
    }

    /**
     * Determines if a site should be included in exports according to business
     * rules.
     *
     * @remarks
     * Sites are included in exports only if they have a valid, non-empty string
     * identifier. This ensures exported data integrity and prevents corruption
     * from sites with invalid identifiers.
     *
     * @example
     *
     * ```typescript
     * if (validator.shouldIncludeInExport(site)) {
     *     exportSite(site);
     * }
     * ```
     *
     * @param site - The site to evaluate for export inclusion.
     *
     * @returns Whether the site should be included in exports.
     */
    public shouldIncludeInExport(site: Site): boolean {
        // Business rule: Include all sites with valid identifiers
        return isNonEmptyString(site.identifier);
    }

    /**
     * Validates complete site configuration according to business rules.
     *
     * @remarks
     * Performs identifier and monitor array validation, delegating monitor
     * validation to {@link MonitorValidator}.
     *
     * @example
     *
     * ```typescript
     * const result = validator.validateSiteConfiguration(site);
     * if (!result.isValid) {
     *     console.error("Validation errors:", result.errors);
     * }
     * ```
     *
     * @param site - The site configuration to validate.
     *
     * @returns Validation result containing errors and validity status.
     */
    public validateSiteConfiguration(site: Site): ValidationResult {
        const errors: string[] = [];

        // Validate site identifier
        const identifierErrors = this.validateSiteIdentifier(site);
        errors.push(...identifierErrors);

        // Validate monitors array
        const monitorErrors = this.validateSiteMonitors(site);
        errors.push(...monitorErrors);

        return {
            errors,
            success: errors.length === 0,
        };
    }

    /**
     * Validates site identifier according to business rules.
     *
     * @remarks
     * Checks for non-empty string identifier and correct type. Returns error
     * messages if validation fails, or an empty array if valid.
     *
     * @example
     *
     * ```typescript
     * const errors = validator["validateSiteIdentifier"](site);
     * if (errors.length > 0) {
     *     console.error(errors);
     * }
     * ```
     *
     * @param site - The site containing the identifier to validate.
     *
     * @returns Array of validation errors (empty if valid).
     */
    private validateSiteIdentifier(site: Site): string[] {
        const errors: string[] = [];

        // Use centralized validation for consistent behavior
        if (!isNonEmptyString(site.identifier)) {
            errors.push("Site identifier must be a non-empty string");
        }

        return errors;
    }

    /**
     * Validates site monitors array and individual monitors.
     *
     * @remarks
     * Checks that monitors is an array and delegates individual monitor
     * validation to {@link MonitorValidator}. Returns error messages for invalid
     * monitors, or an empty array if all are valid.
     *
     * @example
     *
     * ```typescript
     * const errors = validator["validateSiteMonitors"](site);
     * if (errors.length > 0) {
     *     console.error(errors);
     * }
     * ```
     *
     * @param site - The site containing monitors to validate.
     *
     * @returns Array of validation errors (empty if valid).
     */
    private validateSiteMonitors(site: Site): string[] {
        const errors: string[] = [];

        if (!Array.isArray(site.monitors)) {
            errors.push("Site monitors must be an array");
            return errors;
        }

        // Validate each monitor
        for (const [index, monitor] of site.monitors.entries()) {
            const monitorValidation =
                this.monitorValidator.validateMonitorConfiguration(monitor);
            if (!monitorValidation.success) {
                // Include monitor identifier in error message if available for
                // easier debugging
                const monitorId = monitor.id ? ` (${monitor.id})` : "";
                errors.push(
                    ...monitorValidation.errors.map(
                        (error: string) =>
                            `Monitor ${index + 1}${monitorId}: ${error}`
                    )
                );
            }
        }

        return errors;
    }
}
