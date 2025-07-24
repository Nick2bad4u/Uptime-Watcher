# Function: calculateMaxDuration()

> **calculateMaxDuration**(`timeout`, `retryAttempts`): `string`

Defined in: [src/utils/duration.ts:9](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/utils/duration.ts#L9)

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
