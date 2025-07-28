# Function: formatResponseTime()

> **formatResponseTime**(`time?`): `string`

Defined in: [src/utils/time.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/time.ts#L115)

Format response time in a human-readable format.
Automatically chooses between milliseconds and seconds based on magnitude.

## Parameters

### time?

`number`

Response time in milliseconds

## Returns

`string`

Formatted time string (e.g., "234ms" or "1.23s")
