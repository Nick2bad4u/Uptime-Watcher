import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";

const SHARED_MINIMUM_INTERVAL_MS = MIN_MONITOR_CHECK_INTERVAL_MS;
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
 * Used when monitor configuration does not specify retry attempts. Controls how
 * many times a monitor will retry a failed check before reporting a failure.
 *
 * @defaultValue 3
 *
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
 * @defaultValue 5000
 *
 * @public
 */
export const MIN_CHECK_INTERVAL: number = SHARED_MINIMUM_INTERVAL_MS; // 5 seconds

/**
 * Default monitor timeout when none is specified, in seconds.
 *
 * @remarks
 * Used for monitors that don't specify a timeout value.
 *
 * @defaultValue 30
 *
 * @public
 */
export const DEFAULT_MONITOR_TIMEOUT_SECONDS = 30;

/**
 * Buffer time added to monitor timeouts for operation cleanup, in milliseconds.
 *
 * @remarks
 * Added to monitor timeout to ensure operations have time to clean up before
 * being forcibly terminated.
 *
 * @defaultValue 5000
 *
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
 *
 * @public
 */
export const SECONDS_TO_MS_MULTIPLIER = 1000;

// Note: migration-related constants were intentionally removed. Development
// builds do not support migration chains; state is reset instead.
