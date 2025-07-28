# Function: isHttpMonitorFields()

> **isHttpMonitorFields**(`fields`): `fields is HttpMonitorFields`

Defined in: [src/types/monitor-forms.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L161)

Type guard to check if fields are for HTTP monitor.

## Parameters

### fields

[`MonitorFormFields`](../type-aliases/MonitorFormFields.md)

Monitor form fields to check

## Returns

`fields is HttpMonitorFields`

True if fields contain HTTP monitor properties

## Remarks

Checks for presence of required HTTP properties and absence of port-specific ones
to provide more robust type detection and prevent false positives.
