/**
 * Configuration manager for business rules and policies with standardized caching.
 * Centralizes business logic for configuration decisions and caches validation results.
 */

import type { ValidationResult } from "./validators/interfaces";

import { CACHE_SIZE_LIMITS, CACHE_TTL, DEFAULT_CHECK_INTERVAL, DEFAULT_HISTORY_LIMIT } from "../constants";
import { isDev } from "../electronUtils";
import { Site } from "../types";
import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { MonitorValidator } from "./validators/MonitorValidator";
import { SiteValidator } from "./validators/SiteValidator";

// Re-export ValidationResult for use in manager index
export type { ValidationResult } from "./validators/interfaces";

export interface HistoryRetentionConfig {
    defaultLimit: number;
    maxLimit: number;
    minLimit: number;
}

/**
 * Manages business configuration and policies with standardized caching.
 * Centralizes business rules that were previously scattered across utilities.
 * Uses composition pattern with specialized validators to reduce complexity.
 * Implements caching for validation results and configuration values for performance.
 *
 * @remarks
 * ConfigurationManager instances should be obtained via ServiceContainer.getInstance().getConfigurationManager()
 * This ensures proper dependency injection and lifecycle management
 */
export class ConfigurationManager {
    private readonly configCache: StandardizedCache<unknown>;
    private readonly monitorValidator: MonitorValidator;
    private readonly siteValidator: SiteValidator;
    private readonly validationCache: StandardizedCache<ValidationResult>;

    constructor() {
        this.siteValidator = new SiteValidator();
        this.monitorValidator = new MonitorValidator();

        // Initialize standardized caches
        this.validationCache = new StandardizedCache<ValidationResult>({
            defaultTTL: CACHE_TTL.VALIDATION_RESULTS,
            enableStats: true,
            maxSize: CACHE_SIZE_LIMITS.VALIDATION_RESULTS,
            name: "validation-results",
        });

        this.configCache = new StandardizedCache<unknown>({
            defaultTTL: CACHE_TTL.CONFIGURATION_VALUES,
            enableStats: true,
            maxSize: CACHE_SIZE_LIMITS.CONFIGURATION_VALUES,
            name: "configuration-values",
        });
    }

    /**
     * Clear validation cache when configuration changes.
     */
    public clearValidationCache(): void {
        this.validationCache.clear();
    }

    /**
     * Get cache statistics for monitoring.
     */
    public getCacheStats(): {
        configuration: ReturnType<StandardizedCache<unknown>["getStats"]>;
        validation: ReturnType<StandardizedCache<ValidationResult>["getStats"]>;
    } {
        return {
            configuration: this.configCache.getStats(),
            validation: this.validationCache.getStats(),
        };
    }

    /**
     * Get the default monitor check interval according to business rules.
     */
    public getDefaultMonitorInterval(): number {
        return DEFAULT_CHECK_INTERVAL;
    }

    /**
     * Get history retention configuration according to business rules.
     * These limits align with the history limit options available in the UI.
     */
    public getHistoryRetentionRules(): HistoryRetentionConfig {
        return {
            defaultLimit: DEFAULT_HISTORY_LIMIT,
            maxLimit: Number.MAX_SAFE_INTEGER, // Matches "Unlimited" option
            minLimit: 25, // Matches lowest option in UI
        };
    }

    /**
     * Business rule: Get the maximum allowed port number.
     */
    public getMaximumPortNumber(): number {
        return 65_535;
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
     * Business rule: Determine if a monitor should receive a default interval.
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return this.monitorValidator.shouldApplyDefaultInterval(monitor);
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
     * Business rule: Determine if a site should be included in exports.
     * Delegates to site validator for consistency.
     */
    public shouldIncludeInExport(site: Site): boolean {
        return this.siteValidator.shouldIncludeInExport(site);
    }

    /**
     * Validate monitor configuration according to business rules with caching.
     *
     * @remarks
     * Delegates to specialized monitor validator and caches results for performance.
     * Marked as async for forward compatibility with future validator implementations
     * that may require asynchronous operations or cache backends.
     *
     * @param monitor - The monitor configuration to validate
     * @returns Promise resolving to validation result with errors and validity status
     */
    public async validateMonitorConfiguration(monitor: Site["monitors"][0]): Promise<ValidationResult> {
        // Create stable cache key from monitor properties that affect validation
        // Use deterministic ordering to prevent cache misses from property order changes
        const cacheKey = `monitor:${monitor.id}:${[
            `checkInterval:${monitor.checkInterval}`,
            `host:${monitor.host ?? ""}`,
            `lastChecked:${monitor.lastChecked?.getTime() ?? ""}`,
            `monitoring:${monitor.monitoring}`,
            `port:${monitor.port ?? ""}`,
            `responseTime:${monitor.responseTime}`,
            `retryAttempts:${monitor.retryAttempts}`,
            `status:${monitor.status}`,
            `timeout:${monitor.timeout}`,
            `type:${monitor.type}`,
            `url:${monitor.url ?? ""}`,
        ].join("|")}`;

        // Check cache first
        const cached = this.validationCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Perform validation (await for forward compatibility)
        const result = await Promise.resolve(this.monitorValidator.validateMonitorConfiguration(monitor));

        // Cache the result
        this.validationCache.set(cacheKey, result);

        return result;
    }

    /**
     * Validate site configuration according to business rules with caching.
     *
     * @remarks
     * Delegates to specialized site validator and caches results for performance.
     * Marked as async for forward compatibility with future validator implementations
     * that may require asynchronous operations or cache backends.
     *
     * @param site - The site configuration to validate
     * @returns Promise resolving to validation result with errors and validity status
     */
    public async validateSiteConfiguration(site: Site): Promise<ValidationResult> {
        // Create stable cache key from site properties that affect validation
        const cacheKey = `site:${site.identifier}:${[
            `identifier:${site.identifier}`,
            `monitorCount:${site.monitors.length}`,
            `monitoring:${site.monitoring}`,
            `name:${site.name}`,
        ].join("|")}`;

        // Check cache first
        const cached = this.validationCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Perform validation (await for forward compatibility)
        const result = await Promise.resolve(this.siteValidator.validateSiteConfiguration(site));

        // Cache the result
        this.validationCache.set(cacheKey, result);

        return result;
    }
}
