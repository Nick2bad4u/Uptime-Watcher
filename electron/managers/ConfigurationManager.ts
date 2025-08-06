/**
 * Configuration manager for business rules and policies with standardized caching.
 * Centralizes business logic for configuration decisions and caches validation results.
 */

import type { ConfigValue } from "../../shared/types/configTypes";
import type { ValidationResult } from "./validators/interfaces";

import { CacheKeys } from "../../shared/utils/cacheKeys";
import { CACHE_SIZE_LIMITS, CACHE_TTL, DEFAULT_CHECK_INTERVAL, DEFAULT_HISTORY_LIMIT } from "../constants";
import { isDev } from "../electronUtils";
import { Site } from "../types";
import { StandardizedCache } from "../utils/cache/StandardizedCache";
import { MonitorValidator } from "./validators/MonitorValidator";
import { SiteValidator } from "./validators/SiteValidator";

// Re-export ValidationResult for use in manager index
export type { ValidationResult } from "./validators/interfaces";

/**
 * Describes the configuration for history retention limits.
 *
 * @remarks
 * Used by {@link ConfigurationManager.getHistoryRetentionRules} to specify allowed history limits.
 *
 * @public
 */
export interface HistoryRetentionConfig {
    /**
     * The default history retention limit.
     *
     * @defaultValue DEFAULT_HISTORY_LIMIT
     */
    defaultLimit: number;
    /**
     * The maximum allowed history retention limit.
     *
     * @defaultValue Number.MAX_SAFE_INTEGER
     */
    maxLimit: number;
    /**
     * The minimum allowed history retention limit.
     *
     * @defaultValue 25
     */
    minLimit: number;
}

/**
 * Manages business configuration, validation, and policy rules for the application.
 *
 * @remarks
 * Centralizes business logic for configuration decisions, validation, and caching of results.
 * Uses composition with specialized validators and standardized caches for performance.
 * All configuration and validation flows should use this manager for consistency.
 *
 * @public
 */
export class ConfigurationManager {
    /**
     * Cache for configuration values.
     *
     * @remarks
     * Used to store and retrieve configuration values for improved performance.
     * Now uses ConfigValue type for better type safety.
     *
     * @readonly
     * @internal
     */
    private readonly configCache: StandardizedCache<ConfigValue>;

    /**
     * Monitor validator instance for monitor-specific validation.
     *
     * @remarks
     * Used internally to delegate monitor validation logic.
     *
     * @readonly
     * @internal
     */
    private readonly monitorValidator: MonitorValidator;

    /**
     * Site validator instance for site-level validation.
     *
     * @remarks
     * Used internally to delegate site validation logic.
     *
     * @readonly
     * @internal
     */
    private readonly siteValidator: SiteValidator;

    /**
     * Cache for validation results.
     *
     * @remarks
     * Used to cache validation results for both monitors and sites.
     *
     * @readonly
     * @internal
     */
    private readonly validationCache: StandardizedCache<ValidationResult>;

    /**
     * Creates a new {@link ConfigurationManager} instance.
     *
     * @remarks
     * Instantiates specialized validators and initializes standardized caches for configuration and validation results.
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

        this.configCache = new StandardizedCache<ConfigValue>({
            defaultTTL: CACHE_TTL.CONFIGURATION_VALUES,
            enableStats: true,
            maxSize: CACHE_SIZE_LIMITS.CONFIGURATION_VALUES,
            name: "configuration-values",
        });
    }

    /**
     * Clears the validation cache.
     *
     * @remarks
     * Use this method to invalidate cached validation results after configuration updates or changes.
     */
    public clearValidationCache(): void {
        this.validationCache.clear();
    }

    /**
     * Gets cache statistics for configuration and validation caches.
     *
     * @returns An object containing statistics for both configuration and validation caches.
     *
     * @example
     * ```typescript
     * const stats = configManager.getCacheStats();
     * console.log(stats);
     * ```
     */
    public getCacheStats(): {
        configuration: ReturnType<StandardizedCache<ConfigValue>["getStats"]>;
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
     * @remarks
     * This value is used when a monitor does not specify a custom interval.
     */
    public getDefaultMonitorInterval(): number {
        return DEFAULT_CHECK_INTERVAL;
    }

    /**
     * Gets history retention configuration according to business rules.
     *
     * @returns The {@link HistoryRetentionConfig} object specifying default, minimum, and maximum history limits.
     *
     * @remarks
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
     * Gets the maximum allowed port number according to business rules.
     *
     * @returns The maximum allowed port number (65535).
     */
    public getMaximumPortNumber(): number {
        return 65_535;
    }

    /**
     * Gets the minimum allowed check interval according to business rules.
     *
     * @returns The minimum allowed check interval in milliseconds (1000 ms).
     */
    public getMinimumCheckInterval(): number {
        return 1000; // 1 second minimum
    }

    /**
     * Gets the minimum allowed timeout according to business rules.
     *
     * @returns The minimum allowed timeout in milliseconds (1000 ms).
     */
    public getMinimumTimeout(): number {
        return 1000; // 1 second minimum
    }

    /**
     * Determines if a monitor should receive a default check interval.
     *
     * @param monitor - The monitor configuration to evaluate. Must be a member of {@link Site.monitors}.
     * @returns `true` if the monitor should receive a default check interval; otherwise, `false`.
     *
     * @remarks
     * Delegates to {@link MonitorValidator.shouldApplyDefaultInterval}.
     */
    public shouldApplyDefaultInterval(monitor: Site["monitors"][0]): boolean {
        return this.monitorValidator.shouldApplyDefaultInterval(monitor);
    }

    /**
     * Determines if monitoring should be auto-started for a site according to business rules.
     *
     * @param site - The {@link Site} configuration to evaluate.
     * @returns `true` if monitoring should be auto-started for the site; otherwise, `false`.
     *
     * @remarks
     * Monitoring is not auto-started in development mode or for sites without monitors.
     * The site's `monitoring` property takes precedence.
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
     *
     * @param site - The {@link Site} configuration to evaluate.
     * @returns `true` if the site should be included in exports; otherwise, `false`.
     *
     * @remarks
     * Delegates to {@link SiteValidator.shouldIncludeInExport} for consistency.
     */
    public shouldIncludeInExport(site: Site): boolean {
        return this.siteValidator.shouldIncludeInExport(site);
    }

    /**
     * Validates a monitor configuration according to business rules, with caching.
     *
     * @param monitor - The monitor configuration to validate. Must be a member of {@link Site.monitors}.
     * @returns A promise resolving to a {@link ValidationResult} with errors and validity status.
     *
     * @remarks
     * Delegates to {@link MonitorValidator.validateMonitorConfiguration} and caches results for performance.
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

        const cacheKey = CacheKeys.validation.byType("monitor", JSON.stringify(monitorForKey));

        // Check cache first
        const cached = this.validationCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Perform validation
        const result = await Promise.resolve(this.monitorValidator.validateMonitorConfiguration(monitor));

        // Cache the result
        this.validationCache.set(cacheKey, result);

        return result;
    }

    /**
     * Validates a site configuration according to business rules, with caching.
     *
     * @param site - The {@link Site} configuration to validate.
     * @returns A promise resolving to a {@link ValidationResult} with errors and validity status.
     *
     * @remarks
     * Delegates to {@link SiteValidator.validateSiteConfiguration} and caches results for performance.
     */
    public async validateSiteConfiguration(site: Site): Promise<ValidationResult> {
        // Create stable cache key using deterministic JSON serialization
        const siteForKey = {
            identifier: site.identifier,
            monitorCount: site.monitors.length,
            monitoring: site.monitoring,
            name: site.name,
        };

        const cacheKey = CacheKeys.validation.byType("site", JSON.stringify(siteForKey));

        // Check cache first
        const cached = this.validationCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Perform validation
        const result = await Promise.resolve(this.siteValidator.validateSiteConfiguration(site));

        // Cache the result
        this.validationCache.set(cacheKey, result);

        return result;
    }
}
