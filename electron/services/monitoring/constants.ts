/**
 * Configuration constants for monitoring services.
 *
 * @remarks
 * Centralizes configuration values that were previously hardcoded throughout
 * the monitoring system. This addresses the magic numbers identified in the
 * reviews and ensures maintainability and consistency across the codebase.
 *
 * @public
 */

/**
 * Default number of retry attempts for monitor checks.
 *
 * @remarks
 * Used when monitor configuration does not specify retry attempts. Controls
 * how many times a monitor will retry a failed check before reporting a
 * failure.
 *
 * @defaultValue 3
 * @public
 */
export const DEFAULT_RETRY_ATTEMPTS = 3;

/**
 * Minimum recommended interval between monitor checks, in milliseconds.
 *
 * @remarks
 * Used to warn about potentially problematic short intervals. Intervals below
 * this value may cause excessive load or unreliable results.
 *
 * @defaultValue 1000
 * @public
 */
export const MIN_CHECK_INTERVAL = 1000; // 1 second

/**
 * Default monitor timeout when none is specified, in seconds.
 *
 * @remarks
 * Used for monitors that don't specify a timeout value.
 *
 * @defaultValue 30
 * @public
 */
export const DEFAULT_MONITOR_TIMEOUT_SECONDS = 30;

/**
 * Buffer time added to monitor timeouts for operation cleanup, in
 * milliseconds.
 *
 * @remarks
 * Added to monitor timeout to ensure operations have time to clean up
 * before being forcibly terminated.
 *
 * @defaultValue 5000
 * @public
 */
export const MONITOR_TIMEOUT_BUFFER_MS = 5000;

/**
 * Multiplier to convert seconds to milliseconds.
 *
 * @remarks
 * Used to convert monitor timeout values from seconds to milliseconds.
 *
 * @defaultValue 1000
 * @public
 */
export const SECONDS_TO_MS_MULTIPLIER = 1000;

/**
 * Maximum number of migration steps allowed in a migration path.
 *
 * @remarks
 * Used to prevent excessive migration chains that may indicate design issues
 * or migration loops. Helps ensure database migrations remain manageable and
 * safe.
 *
 * @defaultValue 100
 * @public
 */
export const MAX_MIGRATION_STEPS = 100;

/**
 * Maximum length of data content to include in migration error logs, in
 * characters.
 *
 * @remarks
 * Used to prevent log pollution while preserving debugging context. Limits the
 * amount of data included in error logs for failed migrations.
 *
 * @defaultValue 500
 * @public
 */
export const MAX_LOG_DATA_LENGTH = 500;
