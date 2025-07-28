# Function: getDefaultMonitorFields()

> **getDefaultMonitorFields**(`type`): [`MonitorFormFields`](../type-aliases/MonitorFormFields.md)

Defined in: [src/types/monitor-forms.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L115)

Helper to get default fields for a monitor type.

## Parameters

### type

The monitor type to get defaults for

`"http"` | `"port"`

## Returns

[`MonitorFormFields`](../type-aliases/MonitorFormFields.md)

Default field values for the specified monitor type

## Remarks

For unknown monitor types, this function falls back to HTTP monitor fields
as they represent the most common monitoring use case. This ensures the
function always returns valid form fields even for unsupported types.
