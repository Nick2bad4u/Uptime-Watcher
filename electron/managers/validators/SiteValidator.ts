/**
 * Site validation logic extracted for better separation of concerns.
 * Handles all site-specific validation rules.
 */

import { Site } from "../../types";
import { ValidationResult } from "./interfaces";
import { MonitorValidator } from "./MonitorValidator";

/**
 * Validates site configuration according to business rules.
 * Focused on site-level validation concerns.
 */
export class SiteValidator {
    private readonly monitorValidator: MonitorValidator;

    constructor() {
        this.monitorValidator = new MonitorValidator();
    }

    /**
     * Business rule: Determine if a site should be included in exports.
     */
    public shouldIncludeInExport(site: Site): boolean {
        // Business rule: Include all sites with valid identifiers
        return Boolean(site.identifier && site.identifier.trim().length > 0);
    }

    /**
     * Validate complete site configuration.
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
     */
    private validateSiteIdentifier(site: Site): string[] {
        const errors: string[] = [];

        if (!site.identifier && site.identifier !== "") {
            errors.push("Site identifier is required");
        } else if (site.identifier.trim().length === 0) {
            errors.push("Site identifier cannot be empty");
        }

        return errors;
    }

    /**
     * Validate site monitors array and individual monitors.
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
                errors.push(...monitorValidation.errors.map((error: string) => `Monitor ${index + 1}: ${error}`));
            }
        }

        return errors;
    }
}
