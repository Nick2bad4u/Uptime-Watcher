# Function: calculateMaxDuration()

> **calculateMaxDuration**(`timeout`, `retryAttempts`): `string`

Defined in: [src/utils/duration.ts:9](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/duration.ts#L9)

Utility function to calculate the maximum duration for monitoring checks
with retry attempts and exponential backoff.

## Parameters

### timeout

`number`

Timeout value per attempt in seconds

### retryAttempts

`number`

Number of retry attempts

## Returns

`string`

Formatted duration string (e.g., "30s", "2m")
