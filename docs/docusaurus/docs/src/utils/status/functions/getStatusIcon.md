# Function: getStatusIcon()

> **getStatusIcon**(`status`): `string`

Defined in: [src/utils/status.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/status.ts#L24)

Get the emoji icon for a given status. Provides visual indicators for
different monitoring states.

## Parameters

### status

`string`

The status string to get an icon for

## Returns

`string`

Emoji string representing the status (defaults to "⚪" for unknown
  statuses)

## Remarks

Status comparison is case-insensitive. Supports standard monitoring states:
down, mixed, paused, pending, unknown, up. Unknown statuses return a neutral
icon.
