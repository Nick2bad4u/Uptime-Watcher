/**
 * Configuration manager for business rules and policies.
 * Centralizes business logic for configuration decisions.
 */

import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { isDev } from "../electronUtils";
import { Site } from "../types";
import { SiteValidator, MonitorValidator } from "./validators/index";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface HistoryRetentionConfig {
    defaultLimit: number;
    maxLimit: number;
    minLimit: number;
}

/**
 * Manages business configuration and policies.
 * Centralizes business rules that were previously scattered across utilities.
 * Uses composition pattern with specialized validators to reduce complexity.
 */
export class ConfigurationManager {
    private readonly siteValidator: SiteValidator;
    private readonly monitorValidator: MonitorValidator;

    constructor() {
        this.siteValidator = new SiteValidator();
        this.monitorValidator = new MonitorValidator();
    }

    /**
     * Get the default monitor check interval according to business rules.
     */
    public getDefaultMonitorInterval(): number {
        return DEFAULT_CHECK_INTERVAL;
    }

    /**
     * Business rule: Determine if monitoring should be auto-started for a site.
     */
    public shouldAutoStartMonitoring(site: Site): boolean {
        // Business rule: Don't auto-start in development mode
        if (isDev()) {
            return false;
        }

        // Business rule: Only auto-start for sites that have monitors
        if (site.monitors.length === 0) {
            return false;
        }

        // Business rule: Site monitoring property takes precedence
        return site.monitoring;
    }

    /**
     * Business rule: Determine if a monitor should receive a default interval.
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return this.monitorValidator.shouldApplyDefaultInterval(monitor);
    }

    /**
     * Get history retention configuration according to business rules.
     * These limits align with the HISTORY_LIMIT_OPTIONS available in the UI.
     */
    public getHistoryRetentionRules(): HistoryRetentionConfig {
        return {
            defaultLimit: 500, // Matches DEFAULT_HISTORY_LIMIT constant
            maxLimit: Number.MAX_SAFE_INTEGER, // Matches "Unlimited" option in HISTORY_LIMIT_OPTIONS
            minLimit: 25, // Matches lowest option in HISTORY_LIMIT_OPTIONS
        };
    }

    /**
     * Validate site configuration according to business rules.
     * Delegates to specialized site validator.
     */
    public validateSiteConfiguration(site: Site): ValidationResult {
        return this.siteValidator.validateSiteConfiguration(site);
    }

    /**
     * Validate monitor configuration according to business rules.
     * Delegates to specialized monitor validator.
     */
    public validateMonitorConfiguration(monitor: Site["monitors"][0]): ValidationResult {
        return this.monitorValidator.validateMonitorConfiguration(monitor);
    }

    /**
     * Business rule: Get the minimum allowed check interval.
     */
    public getMinimumCheckInterval(): number {
        return 1000; // 1 second minimum
    }

    /**
     * Business rule: Get the minimum allowed timeout.
     */
    public getMinimumTimeout(): number {
        return 1000; // 1 second minimum
    }

    /**
     * Business rule: Get the maximum allowed port number.
     */
    public getMaximumPortNumber(): number {
        return 65535;
    }

    /**
     * Business rule: Determine if a site should be included in exports.
     * Delegates to site validator for consistency.
     */
    public shouldIncludeInExport(site: Site): boolean {
        return this.siteValidator.shouldIncludeInExport(site);
    }
}

// Singleton instance for easy access
export const configurationManager = new ConfigurationManager();
