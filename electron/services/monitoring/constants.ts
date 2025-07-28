/**
 * Configuration constants for monitoring services.
 *
 * @remarks
 * Centralizes configuration values that were previously hardcoded throughout
 * the monitoring system. This addresses the magic numbers identified in the reviews.
 */

/**
 * Default number of retry attempts for monitor checks.
 * Used when monitor configuration doesn't specify retry attempts.
 */
export const DEFAULT_RETRY_ATTEMPTS = 3;

/**
 * Minimum recommended interval between monitor checks (milliseconds).
 * Used to warn about potentially problematic short intervals.
 */
export const MIN_CHECK_INTERVAL = 1000; // 1 second

/**
 * Maximum number of migration steps allowed in a migration path.
 * Used to prevent excessive migration chains that may indicate design issues.
 */
export const MAX_MIGRATION_STEPS = 100;

/**
 * Maximum length of data content to include in migration error logs (characters).
 * Used to prevent log pollution while preserving debugging context.
 */
export const MAX_LOG_DATA_LENGTH = 500;
