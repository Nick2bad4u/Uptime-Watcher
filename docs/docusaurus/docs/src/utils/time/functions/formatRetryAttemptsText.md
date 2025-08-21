# Function: formatRetryAttemptsText()

> **formatRetryAttemptsText**(`attempts`): `string`

Defined in: [src/utils/time.ts:260](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/time.ts#L260)

Format retry attempts with descriptive text.

## Parameters

### attempts

`number`

Number of retry attempts (expected range: 0-10)

## Returns

`string`

Descriptive text explaining retry behavior

## Remarks

Handles edge cases: 0 attempts means no retries (immediate failure), negative
values are not expected but will be formatted as-is. The function provides
user-friendly text explaining the retry behavior.
