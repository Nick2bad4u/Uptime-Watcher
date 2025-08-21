# Function: isPingMonitorFields()

> **isPingMonitorFields**(`fields`): `fields is PingMonitorFields`

Defined in: [src/types/monitor-forms.ts:236](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L236)

Type guard to check if fields are for Ping monitor.

## Parameters

### fields

[`MonitorFormFields`](../type-aliases/MonitorFormFields.md)

Monitor form fields to check

## Returns

`fields is PingMonitorFields`

True if fields contain valid ping monitor properties

## Remarks

Validates presence of host property and absence of port property to
distinguish from port monitors which also have a host field.
