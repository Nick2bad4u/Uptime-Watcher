/**
 * Centralized cache key generation utilities for consistent caching patterns.
 *
 * @remarks
 * Provides standardized key generation functions to ensure consistency across
 * all cache implementations throughout the application. All cache keys follow
 * a predictable pattern: `domain:operation:identifier` or `domain:identifier`.
 *
 * @example
 * ```typescript
 * // Site-related cache keys
 * const siteKey = CacheKeys.site.byIdentifier("site-123");
 * // Result: "site:site-123"
 *
 * // Monitor-related cache keys
 * const monitorKey = CacheKeys.monitor.byId("monitor-456");
 * // Result: "monitor:monitor-456"
 *
 * // Configuration cache keys
 * const configKey = CacheKeys.config.byName("history-limit");
 * // Result: "config:history-limit"
 * ```
 *
 * @packageDocumentation
 */

/**
 * Cache key prefixes for different domains.
 *
 * @remarks
 * Defines consistent prefixes for all cache domains to prevent key collisions
 * and provide clear categorization of cached data.
 *
 * @internal
 */
const CACHE_PREFIXES = {
    CONFIG: "config",
    MONITOR: "monitor",
    SITE: "site",
    VALIDATION: "validation",
} as const;

/**
 * Separator character for cache key components.
 *
 * @internal
 */
const KEY_SEPARATOR = ":";

/**
 * Utility function to create a standardized cache key.
 *
 * @param prefix - Domain prefix for the cache key
 * @param identifier - Unique identifier for the cached item
 * @param operation - Optional operation or sub-category
 * @returns Formatted cache key following the standard pattern
 *
 * @internal
 */
function createCacheKey(
    prefix: string,
    identifier: string,
    operation?: string
): string {
    if (operation) {
        return [prefix, operation, identifier].join(KEY_SEPARATOR);
    }
    return [prefix, identifier].join(KEY_SEPARATOR);
}

/**
 * Centralized cache key generation utilities.
 *
 * @remarks
 * Provides domain-specific key generation functions that ensure consistent
 * cache key patterns across the entire application. All functions return
 * properly formatted cache keys following the established conventions.
 *
 * @public
 */
export const CacheKeys = {
    /**
     * Configuration-related cache keys.
     */
    config: {
        /**
         * Generate cache key for configuration value by name.
         *
         * @param name - Configuration name or setting identifier
         * @returns Standardized cache key for configuration values
         *
         * @example
         * ```typescript
         * const key = CacheKeys.config.byName("history-limit");
         * // Returns: "config:history-limit"
         * ```
         */
        byName: (name: string): string =>
            createCacheKey(CACHE_PREFIXES.CONFIG, name),

        /**
         * Generate cache key for configuration validation result.
         *
         * @param name - Configuration name being validated
         * @returns Standardized cache key for configuration validation
         *
         * @example
         * ```typescript
         * const key = CacheKeys.config.validation("monitor-config");
         * // Returns: "config:validation:monitor-config"
         * ```
         */
        validation: (name: string): string =>
            createCacheKey(CACHE_PREFIXES.CONFIG, name, "validation"),
    },

    /**
     * Monitor-related cache keys.
     */
    monitor: {
        /**
         * Generate cache key for monitor by ID.
         *
         * @param id - Monitor identifier
         * @returns Standardized cache key for monitor data
         *
         * @example
         * ```typescript
         * const key = CacheKeys.monitor.byId("monitor-123");
         * // Returns: "monitor:monitor-123"
         * ```
         */
        byId: (id: string): string =>
            createCacheKey(CACHE_PREFIXES.MONITOR, id),

        /**
         * Generate cache key for monitors by site identifier.
         *
         * @param siteIdentifier - Site identifier containing the monitors
         * @returns Standardized cache key for site monitors
         *
         * @example
         * ```typescript
         * const key = CacheKeys.monitor.bySite("site-456");
         * // Returns: "monitor:site:site-456"
         * ```
         */
        bySite: (siteIdentifier: string): string =>
            createCacheKey(CACHE_PREFIXES.MONITOR, siteIdentifier, "site"),

        /**
         * Generate cache key for monitor operation status.
         *
         * @param id - Monitor identifier
         * @returns Standardized cache key for monitor operation tracking
         *
         * @example
         * ```typescript
         * const key = CacheKeys.monitor.operation("monitor-123");
         * // Returns: "monitor:operation:monitor-123"
         * ```
         */
        operation: (id: string): string =>
            createCacheKey(CACHE_PREFIXES.MONITOR, id, "operation"),
    },

    /**
     * Site-related cache keys.
     */
    site: {
        /**
         * Generate cache key for bulk site operations.
         *
         * @returns Standardized cache key for bulk site operations
         *
         * @example
         * ```typescript
         * const key = CacheKeys.site.bulkOperation();
         * // Returns: "site:bulk"
         * ```
         */
        bulkOperation: (): string =>
            createCacheKey(CACHE_PREFIXES.SITE, "bulk"),

        /**
         * Generate cache key for site by identifier.
         *
         * @param identifier - Site identifier
         * @returns Standardized cache key for site data
         *
         * @example
         * ```typescript
         * const key = CacheKeys.site.byIdentifier("site-123");
         * // Returns: "site:site-123"
         * ```
         */
        byIdentifier: (identifier: string): string =>
            createCacheKey(CACHE_PREFIXES.SITE, identifier),

        /**
         * Generate cache key for site loading operation.
         *
         * @param identifier - Site identifier being loaded
         * @returns Standardized cache key for site loading status
         *
         * @example
         * ```typescript
         * const key = CacheKeys.site.loading("site-123");
         * // Returns: "site:loading:site-123"
         * ```
         */
        loading: (identifier: string): string =>
            createCacheKey(CACHE_PREFIXES.SITE, identifier, "loading"),
    },

    /**
     * Validation-related cache keys.
     */
    validation: {
        /**
         * Generate cache key for validation result by type and identifier.
         *
         * @param type - Type of validation (e.g., "monitor", "site")
         * @param identifier - Item identifier being validated
         * @returns Standardized cache key for validation results
         *
         * @example
         * ```typescript
         * const key = CacheKeys.validation.byType("monitor", "config-123");
         * // Returns: "validation:monitor:config-123"
         * ```
         */
        byType: (type: string, identifier: string): string =>
            createCacheKey(CACHE_PREFIXES.VALIDATION, identifier, type),

        /**
         * Generate cache key for monitor type validation.
         *
         * @param monitorType - Monitor type being validated
         * @returns Standardized cache key for monitor type validation
         *
         * @example
         * ```typescript
         * const key = CacheKeys.validation.monitorType("http");
         * // Returns: "validation:monitor-type:http"
         * ```
         */
        monitorType: (monitorType: string): string =>
            createCacheKey(
                CACHE_PREFIXES.VALIDATION,
                monitorType,
                "monitor-type"
            ),
    },
} as const;

/**
 * Type representing all possible cache key patterns.
 *
 * @remarks
 * Provides type safety for cache key validation and ensures only
 * standardized keys are used throughout the application.
 *
 * @public
 */
export type StandardizedCacheKey = ReturnType<
    | typeof CacheKeys.config.byName
    | typeof CacheKeys.config.validation
    | typeof CacheKeys.monitor.byId
    | typeof CacheKeys.monitor.bySite
    | typeof CacheKeys.monitor.operation
    | typeof CacheKeys.site.bulkOperation
    | typeof CacheKeys.site.byIdentifier
    | typeof CacheKeys.site.loading
    | typeof CacheKeys.validation.byType
    | typeof CacheKeys.validation.monitorType
>;

/**
 * Utility to validate if a string follows the standardized cache key pattern.
 *
 * @param key - Cache key to validate
 * @returns True if the key follows the standardized pattern
 *
 * @example
 * ```typescript
 * const isValid = isStandardizedCacheKey("site:site-123");
 * // Returns: true
 *
 * const isInvalid = isStandardizedCacheKey("random-key");
 * // Returns: false
 * ```
 *
 * @public
 */
export function isStandardizedCacheKey(
    key: string
): key is StandardizedCacheKey {
    const parts = key.split(KEY_SEPARATOR);
    if (parts.length < 2 || parts.length > 3) {
        return false;
    }

    const prefix = parts[0];
    if (!prefix) {
        return false;
    }

    const validPrefixes = Object.values(CACHE_PREFIXES) as string[];
    return validPrefixes.includes(prefix);
}

/**
 * Parse a standardized cache key into its components.
 *
 * @param key - Standardized cache key to parse
 * @returns Object containing the key components
 *
 * @example
 * ```typescript
 * const components = parseCacheKey("site:loading:site-123");
 * // Returns: { identifier: "site-123", operation: "loading", prefix: "site" }
 * ```
 *
 * @public
 */
export function parseCacheKey(key: StandardizedCacheKey): {
    identifier: string;
    operation?: string;
    prefix: string;
} {
    const parts = key.split(KEY_SEPARATOR);

    if (parts.length === 2) {
        const prefix = parts[0];
        const identifier = parts[1];

        if (!prefix || !identifier) {
            throw new Error(`Invalid cache key format: ${key}`);
        }

        return {
            identifier,
            prefix,
        };
    }

    const prefix = parts[0];
    const operation = parts[1];
    const identifier = parts[2];

    if (!prefix || !operation || !identifier) {
        throw new Error(`Invalid cache key format: ${key}`);
    }

    return {
        identifier,
        operation,
        prefix,
    };
}
