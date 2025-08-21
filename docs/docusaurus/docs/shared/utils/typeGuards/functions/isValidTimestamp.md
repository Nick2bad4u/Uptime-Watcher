# Function: isValidTimestamp()

> **isValidTimestamp**(`value`): `value is number`

Defined in: [shared/utils/typeGuards.ts:278](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeGuards.ts#L278)

Determines if a value is a valid Unix timestamp (seconds or milliseconds).
Allows timestamps up to 1 day in the future from the current time.

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is number`

True if `value` is a valid timestamp; otherwise, false.
