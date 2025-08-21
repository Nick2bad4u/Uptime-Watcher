# Function: isHttpMonitorFields()

> **isHttpMonitorFields**(`fields`): `fields is HttpMonitorFields`

Defined in: [src/types/monitor-forms.ts:219](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L219)

Type guard to check if fields are for HTTP monitor.

## Parameters

### fields

[`MonitorFormFields`](../type-aliases/MonitorFormFields.md)

Monitor form fields to check

## Returns

`fields is HttpMonitorFields`

True if fields contain HTTP monitor properties

## Remarks

Checks for presence of required HTTP properties and absence of
port/ping-specific ones to provide more robust type detection and prevent
false positives.
