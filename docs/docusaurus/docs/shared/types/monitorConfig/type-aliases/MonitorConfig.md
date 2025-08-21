# Type Alias: MonitorConfig

> **MonitorConfig** = [`HttpMonitorConfig`](../interfaces/HttpMonitorConfig.md) \| [`PingMonitorConfig`](../interfaces/PingMonitorConfig.md) \| [`PortMonitorConfig`](../interfaces/PortMonitorConfig.md)

Defined in: [shared/types/monitorConfig.ts:260](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorConfig.ts#L260)

Union type representing all possible monitor configurations.

## Remarks

Use this type when you need to handle configuration for any monitor type.
TypeScript will ensure type safety through discriminated unions based on the
`type` field.
