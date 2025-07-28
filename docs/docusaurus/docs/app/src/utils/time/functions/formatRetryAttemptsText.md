# Function: formatRetryAttemptsText()

> **formatRetryAttemptsText**(`attempts`): `string`

Defined in: [src/utils/time.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/time.ts#L169)

Format retry attempts with descriptive text.

## Parameters

### attempts

`number`

Number of retry attempts (expected range: 0-10)

## Returns

`string`

Descriptive text explaining retry behavior

## Remarks

Handles edge cases: 0 attempts means no retries (immediate failure),
negative values are not expected but will be formatted as-is.
The function provides user-friendly text explaining the retry behavior.
