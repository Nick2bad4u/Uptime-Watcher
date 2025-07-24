# Function: formatResponseTime()

> **formatResponseTime**(`time?`): `string`

Defined in: [src/utils/time.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/time.ts#L115)

Format response time in a human-readable format.
Automatically chooses between milliseconds and seconds based on magnitude.

## Parameters

### time?

`number`

Response time in milliseconds

## Returns

`string`

Formatted time string (e.g., "234ms" or "1.23s")
