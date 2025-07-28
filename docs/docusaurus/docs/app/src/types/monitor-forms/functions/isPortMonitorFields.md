# Function: isPortMonitorFields()

> **isPortMonitorFields**(`fields`): `fields is PortMonitorFields`

Defined in: [src/types/monitor-forms.ts:175](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitor-forms.ts#L175)

Type guard to check if fields are for Port monitor.

## Parameters

### fields

[`MonitorFormFields`](../type-aliases/MonitorFormFields.md)

Monitor form fields to check

## Returns

`fields is PortMonitorFields`

True if fields contain valid port monitor properties

## Remarks

Validates both presence and types of required properties to ensure
runtime type safety and prevent incorrect type assumptions.
