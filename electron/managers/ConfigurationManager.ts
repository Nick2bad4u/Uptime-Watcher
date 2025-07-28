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
 * ConfigurationManager instances should be obtained via ServiceContainer.getInstance().getConfigurationManager().
 * This ensures proper dependency injection and lifecycle management.
 *
 * @example
 * ```typescript
 * const configManager = ServiceContainer.getInstance().getConfigurationManager();
 * const defaultInterval = configManager.getDefaultMonitorInterval();
 * const validation = await configManager.validateSiteConfiguration(site);
 * if (!validation.isValid) {
 *   console.error(validation.errors);
 * }
 * ```
 *
 * @public
 */
export class ConfigurationManager {
    /**
     * Cache for configuration values.
     * @readonly
     */
    private readonly configCache: StandardizedCache<unknown>;
    /**
     * Monitor validator instance for monitor-specific validation.
     * @readonly
     */
    private readonly monitorValidator: MonitorValidator;
    /**
     * Site validator instance for site-level validation.
     * @readonly
     */
    private readonly siteValidator: SiteValidator;
    /**
     * Cache for validation results.
     * @readonly
     */
    private readonly validationCache: StandardizedCache<ValidationResult>;

    /**
     * Create a new ConfigurationManager instance.
     *
     * @remarks
     * Instantiates specialized validators and initializes caches for configuration and validation results.
     */
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
     * Clears the validation cache when configuration changes.
     *
     * @remarks
     * Use this method to invalidate cached validation results after configuration updates.
     *
     * @example
     * ```typescript
     * configManager.clearValidationCache();
     * ```
     */
    public clearValidationCache(): void {
        this.validationCache.clear();
    }

    /**
     * Gets cache statistics for monitoring.
     *
     * @returns Object containing configuration and validation cache statistics.
     *
     * @example
     * ```typescript
     * const stats = configManager.getCacheStats();
     * console.log(stats);
     * ```
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
     * Gets the default monitor check interval according to business rules.
     *
     * @returns The default check interval in milliseconds.
     *
     * @example
     * ```typescript
     * const interval = configManager.getDefaultMonitorInterval();
     * ```
     */
    public getDefaultMonitorInterval(): number {
        return DEFAULT_CHECK_INTERVAL;
    }

    /**
     * Gets history retention configuration according to business rules.
     *
     * @returns History retention configuration object.
     *
     * @remarks
     * These limits align with the history limit options available in the UI.
     *
     * @example
     * ```typescript
     * const rules = configManager.getHistoryRetentionRules();
     * ```
     */
    public getHistoryRetentionRules(): HistoryRetentionConfig {
        return {
            defaultLimit: DEFAULT_HISTORY_LIMIT,
            maxLimit: Number.MAX_SAFE_INTEGER, // Matches "Unlimited" option
            minLimit: 25, // Matches lowest option in UI
        };
    }

    /**
     * Gets the maximum allowed port number according to business rules.
     *
     * @returns The maximum allowed port number.
     *
     * @example
     * ```typescript
     * const maxPort = configManager.getMaximumPortNumber();
     * ```
     */
    public getMaximumPortNumber(): number {
        return 65_535;
    }

    /**
     * Gets the minimum allowed check interval according to business rules.
     *
     * @returns The minimum allowed check interval in milliseconds.
     *
     * @example
     * ```typescript
     * const minInterval = configManager.getMinimumCheckInterval();
     * ```
     */
    public getMinimumCheckInterval(): number {
        return 1000; // 1 second minimum
    }

    /**
     * Gets the minimum allowed timeout according to business rules.
     *
     * @returns The minimum allowed timeout in milliseconds.
     *
     * @example
     * ```typescript
     * const minTimeout = configManager.getMinimumTimeout();
     * ```
     */
    public getMinimumTimeout(): number {
        return 1000; // 1 second minimum
    }

    /**
     * Determines if a monitor should receive a default interval according to business rules.
     *
     * @param monitor - The monitor configuration to evaluate.
     * @returns True if the monitor should receive a default check interval.
     *
     * @example
     * ```typescript
     * if (configManager.shouldApplyDefaultInterval(monitor)) {
     *   monitor.checkInterval = configManager.getDefaultMonitorInterval();
     * }
     * ```
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return this.monitorValidator.shouldApplyDefaultInterval(monitor);
    }

    /**
     * Determines if monitoring should be auto-started for a site according to business rules.
     *
     * @param site - The site configuration to evaluate.
     * @returns True if monitoring should be auto-started for the site.
     *
     * @remarks
     * Monitoring is not auto-started in development mode or for sites without monitors.
     * The site's monitoring property takes precedence.
     *
     * @example
     * ```typescript
     * if (configManager.shouldAutoStartMonitoring(site)) {
     *   startMonitoring(site);
     * }
     * ```
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
     * Determines if a site should be included in exports according to business rules.
     * Delegates to site validator for consistency.
     *
     * @param site - The site configuration to evaluate.
     * @returns True if the site should be included in exports.
     *
     * @example
     * ```typescript
     * if (configManager.shouldIncludeInExport(site)) {
     *   exportSite(site);
     * }
     * ```
     */
    public shouldIncludeInExport(site: Site): boolean {
        return this.siteValidator.shouldIncludeInExport(site);
    }

    /**
     * Validates monitor configuration according to business rules with caching.
     *
     * @param monitor - The monitor configuration to validate.
     * @returns Promise resolving to validation result with errors and validity status.
     *
     * @remarks
     * Delegates to specialized monitor validator and caches results for performance.
     * Marked as async for forward compatibility with future validator implementations that may require asynchronous operations or cache backends.
     *
     * @example
     * ```typescript
     * const result = await configManager.validateMonitorConfiguration(monitor);
     * if (!result.isValid) {
     *   console.error(result.errors);
     * }
     * ```
     */
    public async validateMonitorConfiguration(monitor: Site["monitors"][0]): Promise<ValidationResult> {
        // Create stable cache key using deterministic JSON serialization
        const monitorForKey = {
            checkInterval: monitor.checkInterval,
            host: monitor.host ?? "",
            id: monitor.id,
            lastChecked: monitor.lastChecked?.getTime() ?? null,
            monitoring: monitor.monitoring,
            port: monitor.port ?? null,
            responseTime: monitor.responseTime,
            retryAttempts: monitor.retryAttempts,
            status: monitor.status,
            timeout: monitor.timeout,
            type: monitor.type,
            url: monitor.url ?? "",
        };

        const cacheKey = `monitor:${JSON.stringify(monitorForKey)}`;

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
     * Validates site configuration according to business rules with caching.
     *
     * @param site - The site configuration to validate.
     * @returns Promise resolving to validation result with errors and validity status.
     *
     * @remarks
     * Delegates to specialized site validator and caches results for performance.
     * Marked as async for forward compatibility with future validator implementations that may require asynchronous operations or cache backends.
     *
     * @example
     * ```typescript
     * const result = await configManager.validateSiteConfiguration(site);
     * if (!result.isValid) {
     *   console.error(result.errors);
     * }
     * ```
     */
    public async validateSiteConfiguration(site: Site): Promise<ValidationResult> {
        // Create stable cache key using deterministic JSON serialization
        const siteForKey = {
            identifier: site.identifier,
            monitorCount: site.monitors.length,
            monitoring: site.monitoring,
            name: site.name,
        };

        const cacheKey = `site:${JSON.stringify(siteForKey)}`;

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
