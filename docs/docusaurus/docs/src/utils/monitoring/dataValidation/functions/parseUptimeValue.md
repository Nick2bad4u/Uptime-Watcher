# Function: parseUptimeValue()

> **parseUptimeValue**(`uptimeString`): `number`

Defined in: [src/utils/monitoring/dataValidation.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitoring/dataValidation.ts#L46)

Parse and validate uptime string to number. Handles strings with percent
signs and validates the result.

## Parameters

### uptimeString

`string`

The uptime string to parse (may contain % signs)

## Returns

`number`

Validated uptime number between 0-100, or 0 if invalid
