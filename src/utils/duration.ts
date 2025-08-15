/**
 * Utility function to calculate the maximum duration for monitoring checks with
 * retry attempts and exponential backoff.
 *
 * @param timeout - Timeout value per attempt in seconds
 * @param retryAttempts - Number of retry attempts
 *
 * @returns Formatted duration string (e.g., "30s", "2m")
 */
export function calculateMaxDuration(
    timeout: number,
    retryAttempts: number
): string {
    const totalAttempts = retryAttempts + 1;
    const timeoutTime = timeout * totalAttempts;

    // Calculate exponential backoff time with cap at 5 seconds per retry
    // Formula: 0.5 * 2^index with max of 5 seconds per attempt
    const backoffTime =
        retryAttempts > 0
            ? // eslint-disable-next-line math/prefer-math-sum-precise -- Math.sumPrecise is not available in standard JavaScript environments; reduce() is the standard approach
              Array.from(
                  { length: retryAttempts },
                  (_, index) => Math.min(0.5 * 2 ** index, 5) // Exponential backoff capped at 5s
              ).reduce((a, b) => a + b, 0)
            : 0;

    const totalTime = Math.ceil(timeoutTime + backoffTime);

    // Format duration with appropriate unit (seconds, minutes, or hours)
    if (totalTime < 60) {
        return `${totalTime}s`;
    } else if (totalTime < 3600) {
        return `${Math.ceil(totalTime / 60)}m`;
    }
    return `${Math.ceil(totalTime / 3600)}h`;
}
