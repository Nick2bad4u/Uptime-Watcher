/**
 * Utility function to calculate the maximum duration for monitoring checks
 * with retry attempts and exponential backoff
 */
export function calculateMaxDuration(timeout: number, retryAttempts: number): string {
    const totalAttempts = retryAttempts + 1;
    const timeoutTime = timeout * totalAttempts;
    const backoffTime =
        retryAttempts > 0
            ? Array.from({ length: retryAttempts }, (_, index) => Math.min(0.5 * Math.pow(2, index), 5)).reduce(
                  (a, b) => a + b,
                  0
              )
            : 0;
    const totalTime = Math.ceil(timeoutTime + backoffTime);
    return totalTime < 60 ? `${totalTime}s` : `${Math.ceil(totalTime / 60)}m`;
}
