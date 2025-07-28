# Function: isValidTimestamp()

> **isValidTimestamp**(`value`): `value is number`

Defined in: [shared/utils/typeGuards.ts:229](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/typeGuards.ts#L229)

Determines if a value is a valid Unix timestamp (seconds or milliseconds).
Allows timestamps up to 1 day in the future from the current time.

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is number`

True if `value` is a valid timestamp; otherwise, false.
