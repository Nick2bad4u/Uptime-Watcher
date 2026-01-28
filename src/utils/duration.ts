/**
 * Duration calculation utilities for monitoring operations.
 *
 * @remarks
 * Provides functions for calculating monitoring check durations including
 * timeout values, retry attempts, and exponential backoff scenarios.
 *
 * @public
 */

/**
 * Calculate the maximum duration for monitoring checks with retry attempts and
 * exponential backoff.
 *
 * @param timeout - Timeout value per attempt in seconds.
 * @param retryAttempts - Number of retry attempts.
 *
 * @returns Formatted duration string (for example `"30s"` or `"2m"`).
 *
 * @public
 */
export function calculateMaxDuration(
    timeout: number,
    retryAttempts: number
): string {
    const totalAttempts = retryAttempts + 1;
    const timeoutTime = timeout * totalAttempts;

    // Calculate exponential backoff time with cap at 5 seconds per retry
    // Formula: 0.5 * 2^index with max of 5 seconds per attempt
    let backoffTime = 0;
    for (let index = 0; index < retryAttempts; index++) {
        backoffTime += Math.min(0.5 * 2 ** index, 5); // Exponential backoff capped at 5s
    }

    const totalTime = Math.ceil(timeoutTime + backoffTime);

    // Format duration with appropriate unit (seconds, minutes, or hours)
    if (totalTime < 60) {
        return `${totalTime}s`;
    } else if (totalTime < 3600) {
        return `${Math.ceil(totalTime / 60)}m`;
    }
    return `${Math.ceil(totalTime / 3600)}h`;
}
