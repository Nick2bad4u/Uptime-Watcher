# Function: formatStatusWithIcon()

> **formatStatusWithIcon**(`status`): `string`

Defined in: [src/utils/status.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/status.ts#L63)

Format status with emoji icon and properly capitalized text. Combines status
icon with formatted text for display.

## Parameters

### status

`string`

The status string to format (expected to be lowercase)

## Returns

`string`

Formatted string with emoji and capitalized text (e.g., "✅ Up")

## Remarks

Uses simple capitalization logic suitable for single-word status values. For
multi-word statuses, consider using a more sophisticated formatting
function.
