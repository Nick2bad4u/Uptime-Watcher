# Function: calculateMaxDuration()

> **calculateMaxDuration**(`timeout`, `retryAttempts`): `string`

Defined in: [src/utils/duration.ts:9](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/duration.ts#L9)

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
