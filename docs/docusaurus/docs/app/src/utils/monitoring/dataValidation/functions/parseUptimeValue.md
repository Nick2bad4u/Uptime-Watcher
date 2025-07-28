# Function: parseUptimeValue()

> **parseUptimeValue**(`uptimeString`): `number`

Defined in: [src/utils/monitoring/dataValidation.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitoring/dataValidation.ts#L15)

Parse and validate uptime string to number.
Handles strings with percent signs and validates the result.

## Parameters

### uptimeString

`string`

The uptime string to parse (may contain % signs)

## Returns

`number`

Validated uptime number between 0-100, or 0 if invalid
