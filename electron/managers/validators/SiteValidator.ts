/**
 * Site validation logic extracted for better separation of concerns.
 *
 * @remarks
 * Validates site configuration according to business rules and handles all site-specific
 * validation concerns. This class focuses on site-level validation and delegates monitor
 * validation to the specialized MonitorValidator.
 *
 * The validator performs comprehensive checks including:
 * - Site identifier validation (non-empty string requirement)
 * - Monitor array structure validation
 * - Individual monitor configuration validation
 *
 * @example
 * ```typescript
 * const validator = new SiteValidator();
 * const result = validator.validateSiteConfiguration(site);
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */

import { Site } from "../../types";
import { ValidationResult } from "./interfaces";
import { MonitorValidator } from "./MonitorValidator";

/**
 * Validates site configuration according to business rules.
 *
 * @remarks
 * Focused on site-level validation concerns including identifier validation
 * and monitor array validation.
 */
export class SiteValidator {
    /** Monitor validator instance for delegating monitor-specific validation */
    private readonly monitorValidator: MonitorValidator;

    constructor() {
        this.monitorValidator = new MonitorValidator();
    }

    /**
     * Business rule: Determine if a site should be included in exports.
     *
     * @param site - The site to evaluate for export inclusion
     * @returns Whether the site should be included in exports
     *
     * @remarks
     * Business rule implementation: Sites are included in exports only if they have
     * a valid, non-empty string identifier. This ensures exported data integrity
     * and prevents corruption from sites with invalid identifiers.
     */
    public shouldIncludeInExport(site: Site): boolean {
        // Business rule: Include all sites with valid identifiers
        return Boolean(site.identifier && site.identifier.trim().length > 0);
    }

    /**
     * Validate complete site configuration.
     *
     * @param site - The site configuration to validate
     * @returns Validation result containing errors and validity status
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
            isValid: errors.length === 0,
        };
    }

    /**
     * Validate site identifier according to business rules.
     *
     * @param site - The site containing the identifier to validate
     * @returns Array of validation errors (empty if valid)
     */
    private validateSiteIdentifier(site: Site): string[] {
        const errors: string[] = [];

        // First check for null/undefined values
        if (!site.identifier && site.identifier !== "") {
            errors.push("Site identifier must be a non-empty string");
        } else if (typeof site.identifier === "string" && site.identifier.trim().length === 0) {
            errors.push("Site identifier cannot be empty or whitespace only");
        } else if (typeof site.identifier !== "string") {
            errors.push("Site identifier must be a string value");
        }

        return errors;
    }

    /**
     * Validate site monitors array and individual monitors.
     *
     * @param site - The site containing monitors to validate
     * @returns Array of validation errors (empty if valid)
     */
    private validateSiteMonitors(site: Site): string[] {
        const errors: string[] = [];

        if (!Array.isArray(site.monitors)) {
            errors.push("Site monitors must be an array");
            return errors;
        }

        // Validate each monitor
        for (const [index, monitor] of site.monitors.entries()) {
            const monitorValidation = this.monitorValidator.validateMonitorConfiguration(monitor);
            if (!monitorValidation.isValid) {
                // Include monitor identifier in error message if available for easier debugging
                const monitorId = monitor.id ? ` (${monitor.id})` : "";
                errors.push(
                    ...monitorValidation.errors.map((error: string) => `Monitor ${index + 1}${monitorId}: ${error}`)
                );
            }
        }

        return errors;
    }
}
