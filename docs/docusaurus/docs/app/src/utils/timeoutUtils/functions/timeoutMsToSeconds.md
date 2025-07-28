# Function: timeoutMsToSeconds()

> **timeoutMsToSeconds**(`timeoutMs`): `number`

Defined in: [src/utils/timeoutUtils.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/timeoutUtils.ts#L62)

Convert timeout from milliseconds to seconds for UI display.

## Parameters

### timeoutMs

`number`

Timeout in milliseconds

## Returns

`number`

Timeout in seconds (may include decimal places for precise conversion)

## Remarks

Performs direct division without rounding. For UI display where whole seconds
are preferred, consider using Math.round() or Math.floor() on the result.
