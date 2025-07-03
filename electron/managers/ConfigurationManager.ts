/**
 * Configuration manager for business rules and policies.
 * Centralizes business logic for configuration decisions.
 */

import { DEFAULT_CHECK_INTERVAL } from "../constants";
import { Site } from "../types";
import { isDev } from "../utils";

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
 */
export class ConfigurationManager {
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

        // Business rule: Site monitoring property takes precedence if explicitly set
        if (site.monitoring !== undefined) {
            return site.monitoring;
        }

        // Default business rule: Auto-start monitoring for all new sites
        return true;
    }

    /**
     * Business rule: Determine if a monitor should receive a default interval.
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return !monitor.checkInterval;
    }

    /**
     * Get history retention configuration according to business rules.
     */
    public getHistoryRetentionRules(): HistoryRetentionConfig {
        return {
            defaultLimit: 1000,
            maxLimit: 10000,
            minLimit: 100,
        };
    }

    /**
     * Validate site configuration according to business rules.
     */
    public validateSiteConfiguration(site: Site): ValidationResult {
        const errors: string[] = [];

        // Validate site identifier
        if (!site?.identifier && site?.identifier !== "") {
            errors.push("Site identifier is required");
        } else if (site.identifier.trim().length === 0) {
            errors.push("Site identifier cannot be empty");
        }

        // Validate monitors array
        if (!Array.isArray(site.monitors)) {
            errors.push("Site monitors must be an array");
        } else {
            // Validate each monitor
            for (const [index, monitor] of site.monitors.entries()) {
                const monitorValidation = this.validateMonitorConfiguration(monitor);
                if (!monitorValidation.isValid) {
                    errors.push(...monitorValidation.errors.map((error) => `Monitor ${index + 1}: ${error}`));
                }
            }
        }

        return {
            errors,
            isValid: errors.length === 0,
        };
    }

    /**
     * Validate monitor configuration according to business rules.
     */
    public validateMonitorConfiguration(monitor: Site["monitors"][0]): ValidationResult {
        const errors: string[] = [];

        // Validate monitor type
        if (!monitor.type) {
            errors.push("Monitor type is required");
        }

        // Type-specific validation
        if (monitor.type === "http" && !monitor.url) {
            errors.push("HTTP monitors must have a URL");
        }

        if (monitor.type === "port") {
            if (!monitor.host) {
                errors.push("Port monitors must have a host");
            }
            if (!monitor.port || monitor.port <= 0 || monitor.port > 65535) {
                errors.push("Port monitors must have a valid port number (1-65535)");
            }
        }

        // Validate timing constraints
        if (monitor.checkInterval !== undefined && monitor.checkInterval < 1000) {
            errors.push("Monitor check interval must be at least 1000ms");
        }

        if (monitor.timeout !== undefined && monitor.timeout < 1000) {
            errors.push("Monitor timeout must be at least 1000ms");
        }

        // Validate retry attempts
        if (monitor.retryAttempts !== undefined && monitor.retryAttempts < 0) {
            errors.push("Monitor retry attempts cannot be negative");
        }

        return {
            errors,
            isValid: errors.length === 0,
        };
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
     */
    public shouldIncludeInExport(site: Site): boolean {
        // Business rule: Include all sites with valid identifiers
        return Boolean(site.identifier && site.identifier.trim().length > 0);
    }
}

// Singleton instance for easy access
export const configurationManager = new ConfigurationManager();
