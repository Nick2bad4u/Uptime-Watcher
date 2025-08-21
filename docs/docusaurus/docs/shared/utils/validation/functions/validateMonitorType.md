# Function: validateMonitorType()

> **validateMonitorType**(`type`): type is "http" \| "port" \| "ping" \| "dns"

Defined in: [shared/utils/validation.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/validation.ts#L29)

Validates monitor type.

## Parameters

### type

`unknown`

Value to check as monitor type

## Returns

type is "http" \| "port" \| "ping" \| "dns"

Type predicate indicating if the value is a valid MonitorType

## Remarks

Supports all monitor types: HTTP, port, ping, and DNS monitors.
